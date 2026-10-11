/**
 * AI Words (Vocabulary) - the words of AI, from first principles
 * - 197 terms from the curriculum seed glossary, grouped by category
 * - Search, filter by category or by lesson, and open the lesson that explains a word
 * - Practice mode: read a definition, pick the matching word
 * - "I know this" marks are saved only in this browser
 */

const VOCAB_STORAGE_KEY = "learningai.vocabulary.v1";

const VOCAB_CATEGORY_ICONS = {
  "Foundations": "🧱",
  "Training and model internals": "⚙️",
  "Language and context": "💬",
  "Retrieval and memory": "📚",
  "Agents and integrations": "🤖",
  "Quality, security and operations": "🛡️",
  "Media and emerging language": "🎞️"
};

function vocabEscape(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

class VocabularyEngine {
  constructor() {
    this.root = document.getElementById("vocabularyRoot");
    if (!this.root || typeof VOCABULARY_DATA === "undefined") return;
    this.data = VOCABULARY_DATA;
    this.moduleById = Object.fromEntries(this.data.modules.map(m => [m.id, m]));
    this.known = this.loadKnown();
    this.mode = "browse";
    this.category = "all";
    this.moduleFilter = "all";
    this.query = "";
    this.onlyNew = false;
    this.practice = { asked: 0, correct: 0, current: null, answered: false };
    this.renderShell();
    this.renderBrowse();
  }

  // ---------- persistence (this browser only) ----------
  loadKnown() {
    try {
      const raw = window.localStorage.getItem(VOCAB_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return new Set(Array.isArray(parsed) ? parsed : []);
    } catch (e) {
      return new Set();
    }
  }

  saveKnown() {
    try {
      window.localStorage.setItem(VOCAB_STORAGE_KEY, JSON.stringify([...this.known]));
    } catch (e) {
      // Private mode or blocked storage: marks just won't persist.
    }
  }

  toggleKnown(id) {
    if (this.known.has(id)) this.known.delete(id);
    else this.known.add(id);
    this.saveKnown();
    this.renderProgress();
  }

  // ---------- layout ----------
  renderShell() {
    const { terms, categories, modules } = this.data;
    this.root.innerHTML = `
      <div class="voc-hero">
        <div>
          <h2>AI Words <span class="badge-tag">${terms.length} terms</span></h2>
          <p>The vocabulary of AI, from first principles: what each word means, which words people mix up, and the lesson that shows how it works. Search for a word you heard, browse by topic, then practice until the words feel familiar.</p>
        </div>
        <div class="voc-progress" id="vocProgress"></div>
      </div>

      <div class="voc-modes" role="tablist" aria-label="AI Words mode">
        <button class="voc-mode-btn active" data-mode="browse" role="tab" aria-selected="true">📖 Browse words</button>
        <button class="voc-mode-btn" data-mode="practice" role="tab" aria-selected="false">🎯 Practice</button>
      </div>

      <div class="voc-controls">
        <input type="search" class="voc-search" id="vocSearch" placeholder="Search a word or meaning, e.g. token, RAG, agent" aria-label="Search AI words">
        <select class="voc-select" id="vocModule" aria-label="Filter by lesson">
          <option value="all">All lessons</option>
          ${modules.map(m => `<option value="${m.id}">${m.id.replace("L", "Lesson ")}: ${vocabEscape(m.title)}</option>`).join("")}
        </select>
        <label class="voc-check"><input type="checkbox" id="vocOnlyNew"> Only words I'm still learning</label>
      </div>

      <div class="voc-chips" id="vocChips" aria-label="Categories">
        <button class="voc-chip active" data-category="all">All <small>${terms.length}</small></button>
        ${categories.map(c => `
          <button class="voc-chip" data-category="${vocabEscape(c)}">${VOCAB_CATEGORY_ICONS[c] || "•"} ${vocabEscape(c)} <small>${terms.filter(t => t.category === c).length}</small></button>`).join("")}
      </div>

      <div id="vocBody" aria-live="polite"></div>

      <p class="voc-fineprint">Source: AI from First Principles curriculum seed v${vocabEscape(this.data.version)}, reviewed ${vocabEscape(this.data.reviewDate)}. ${vocabEscape(this.data.scope)}. Each word links to the public references it draws on.</p>

      <div class="voc-modal" id="vocModal" hidden>
        <div class="voc-modal-backdrop" data-close="1"></div>
        <div class="voc-modal-card" role="dialog" aria-modal="true" aria-labelledby="vocModalTitle" tabindex="-1">
          <button class="voc-modal-close" data-close="1" aria-label="Close lesson">✕</button>
          <div id="vocModalBody"></div>
        </div>
      </div>
    `;

    this.body = this.root.querySelector("#vocBody");
    this.progressEl = this.root.querySelector("#vocProgress");
    this.modal = this.root.querySelector("#vocModal");
    // The portal section keeps a transform from its fade-in, which would trap a fixed overlay
    // under the sticky header, so the lesson panel lives directly under <body>.
    document.body.appendChild(this.modal);
    this.modalBody = this.modal.querySelector("#vocModalBody");

    this.root.querySelectorAll(".voc-mode-btn").forEach(btn => {
      btn.addEventListener("click", () => this.setMode(btn.dataset.mode));
    });
    this.root.querySelectorAll(".voc-chip").forEach(chip => {
      chip.addEventListener("click", () => {
        this.category = chip.dataset.category;
        this.root.querySelectorAll(".voc-chip").forEach(c => c.classList.toggle("active", c === chip));
        this.refresh();
      });
    });
    this.root.querySelector("#vocSearch").addEventListener("input", e => {
      this.query = e.target.value.trim().toLowerCase();
      this.refresh();
    });
    this.root.querySelector("#vocModule").addEventListener("change", e => {
      this.moduleFilter = e.target.value;
      this.refresh();
    });
    this.root.querySelector("#vocOnlyNew").addEventListener("change", e => {
      this.onlyNew = e.target.checked;
      this.refresh();
    });
    this.modal.addEventListener("click", e => {
      if (e.target.dataset.close) this.closeModule();
    });
    document.addEventListener("keydown", e => {
      if (e.key === "Escape" && !this.modal.hidden) this.closeModule();
    });

    this.renderProgress();
  }

  renderProgress() {
    const total = this.data.terms.length;
    const known = this.known.size;
    this.progressEl.innerHTML = `
      <div class="voc-progress-count"><strong>${known}</strong> of ${total} words I know</div>
      <div class="lit-skill-bar"><div style="width:${Math.round((known / total) * 100)}%"></div></div>
      <small>Saved only in this browser.</small>
    `;
  }

  setMode(mode) {
    this.mode = mode;
    this.root.querySelectorAll(".voc-mode-btn").forEach(btn => {
      const on = btn.dataset.mode === mode;
      btn.classList.toggle("active", on);
      btn.setAttribute("aria-selected", on ? "true" : "false");
    });
    this.root.querySelector("#vocSearch").hidden = mode === "practice";
    this.refresh();
  }

  refresh() {
    if (this.mode === "practice") {
      this.practice = { asked: 0, correct: 0, current: null, answered: false };
      this.renderPractice();
    } else {
      this.renderBrowse();
    }
  }

  filteredTerms({ useQuery = true } = {}) {
    return this.data.terms.filter(t => {
      if (this.category !== "all" && t.category !== this.category) return false;
      if (this.moduleFilter !== "all" && t.module !== this.moduleFilter) return false;
      if (this.onlyNew && this.known.has(t.id)) return false;
      if (useQuery && this.query) {
        return t.term.toLowerCase().includes(this.query) || t.definition.toLowerCase().includes(this.query);
      }
      return true;
    });
  }

  // ---------- browse ----------
  renderBrowse() {
    const list = this.filteredTerms();
    if (!list.length) {
      this.body.innerHTML = `<div class="voc-empty">No words match. Try a shorter search, or pick "All" above.</div>`;
      return;
    }

    const groups = this.data.categories
      .map(c => ({ category: c, terms: list.filter(t => t.category === c) }))
      .filter(g => g.terms.length);

    this.body.innerHTML = groups.map(g => `
      <h3 class="voc-group-title">${VOCAB_CATEGORY_ICONS[g.category] || "•"} ${vocabEscape(g.category)} <small>${g.terms.length}</small></h3>
      <div class="voc-grid">
        ${g.terms.map(t => this.termCard(t)).join("")}
      </div>`).join("");

    this.body.querySelectorAll("[data-known]").forEach(btn => {
      btn.addEventListener("click", () => {
        this.toggleKnown(btn.dataset.known);
        const on = this.known.has(btn.dataset.known);
        btn.classList.toggle("on", on);
        btn.setAttribute("aria-pressed", on ? "true" : "false");
        btn.textContent = on ? "✅ I know this" : "☐ I know this";
        btn.closest(".voc-card").classList.toggle("known", on);
      });
    });
    this.bindModuleLinks(this.body);
  }

  termCard(t) {
    const mod = this.moduleById[t.module];
    const known = this.known.has(t.id);
    return `
      <article class="voc-card ${known ? "known" : ""}" id="voc-${t.id}">
        <h4>${vocabEscape(t.term)}</h4>
        <p>${vocabEscape(t.definition)}</p>
        <div class="voc-card-foot">
          ${mod ? `<button class="voc-module-link" data-module="${mod.id}">📘 ${mod.id.replace("L", "Lesson ")}: ${vocabEscape(mod.title)}</button>` : ""}
          <button class="voc-known-btn ${known ? "on" : ""}" data-known="${t.id}" aria-pressed="${known}">${known ? "✅" : "☐"} I know this</button>
        </div>
        <div class="voc-sources">Learn more: ${this.sourceLinks(t.sources)}</div>
      </article>`;
  }

  sourceLinks(ids) {
    return ids
      .map(id => this.data.sources[id])
      .filter(Boolean)
      .map(s => `<a href="${vocabEscape(s.url)}" target="_blank" rel="noopener noreferrer">${vocabEscape(s.title)}</a>`)
      .join(" · ");
  }

  bindModuleLinks(scope) {
    scope.querySelectorAll("[data-module]").forEach(btn => {
      btn.addEventListener("click", () => this.openModule(btn.dataset.module));
    });
  }

  // ---------- lesson panel ----------
  openModule(id) {
    const m = this.moduleById[id];
    if (!m) return;
    this.lastFocus = document.activeElement;
    const words = this.data.terms.filter(t => t.module === id);
    this.modalBody.innerHTML = `
      <span class="lit-kicker">${m.id.replace("L", "Lesson ")} of ${this.data.modules.length}</span>
      <h3 id="vocModalTitle">${vocabEscape(m.title)}</h3>
      <p class="voc-question">❓ ${vocabEscape(m.question)}</p>
      <p>${vocabEscape(m.explanation)}</p>
      <div class="voc-panel"><strong>⚙️ How it works</strong><p>${vocabEscape(m.mechanics)}</p></div>
      <div class="voc-panel voc-panel-warn"><strong>⚠️ Common mix-up</strong><p>${vocabEscape(m.misconception)}</p></div>
      <div class="voc-panel voc-panel-quiz">
        <strong>🧠 Check yourself</strong>
        <p>${vocabEscape(m.quiz)}</p>
        <button class="voc-reveal" id="vocReveal">Show answer</button>
        <p class="voc-answer" id="vocAnswer" hidden>${vocabEscape(m.answer)}</p>
      </div>
      <h4 class="voc-words-title">Words in this lesson</h4>
      <div class="voc-word-chips">
        ${words.map(t => `<button class="voc-word-chip ${this.known.has(t.id) ? "known" : ""}" data-jump="${t.id}">${vocabEscape(t.term)}</button>`).join("")}
      </div>
      <div class="voc-sources">Learn more: ${this.sourceLinks(m.sources)}</div>
    `;
    this.modalBody.querySelector("#vocReveal").addEventListener("click", e => {
      this.modalBody.querySelector("#vocAnswer").hidden = false;
      e.target.hidden = true;
    });
    this.modalBody.querySelectorAll("[data-jump]").forEach(btn => {
      btn.addEventListener("click", () => this.jumpToTerm(btn.dataset.jump));
    });
    this.modal.hidden = false;
    document.body.classList.add("voc-modal-open");
    this.modal.querySelector(".voc-modal-card").focus();
  }

  closeModule() {
    this.modal.hidden = true;
    document.body.classList.remove("voc-modal-open");
    if (this.lastFocus && document.contains(this.lastFocus)) this.lastFocus.focus();
  }

  jumpToTerm(id) {
    this.closeModule();
    if (this.mode !== "browse") this.setMode("browse");
    let card = this.root.querySelector(`#voc-${id}`);
    if (!card) {
      // The word is hidden by the current filters: clear them so it shows.
      this.category = "all";
      this.moduleFilter = "all";
      this.query = "";
      this.onlyNew = false;
      this.root.querySelector("#vocSearch").value = "";
      this.root.querySelector("#vocModule").value = "all";
      this.root.querySelector("#vocOnlyNew").checked = false;
      this.root.querySelectorAll(".voc-chip").forEach(c => c.classList.toggle("active", c.dataset.category === "all"));
      this.renderBrowse();
      card = this.root.querySelector(`#voc-${id}`);
    }
    if (!card) return;
    card.scrollIntoView({ behavior: "smooth", block: "center" });
    card.classList.add("flash");
    setTimeout(() => card.classList.remove("flash"), 1600);
  }

  // ---------- practice ----------
  renderPractice() {
    const pool = this.filteredTerms({ useQuery: false });
    if (pool.length < 2) {
      this.body.innerHTML = `<div class="voc-empty">${pool.length ? "Only one word" : "No words"} left with these filters. Pick "All" above, or untick "Only words I'm still learning".</div>`;
      return;
    }

    const prev = this.practice.current?.target.id;
    const choicesFrom = pool.length >= 4 ? pool : this.data.terms;
    let target = pool[Math.floor(Math.random() * pool.length)];
    if (target.id === prev && pool.length > 1) {
      target = pool[(pool.indexOf(target) + 1) % pool.length];
    }
    // Prefer look-alike distractors from the same category: that is where words get mixed up.
    const sameCat = choicesFrom.filter(t => t.id !== target.id && t.category === target.category);
    const others = choicesFrom.filter(t => t.id !== target.id && t.category !== target.category);
    const distractors = this.shuffle(sameCat).concat(this.shuffle(others)).slice(0, 3);
    const options = this.shuffle([target, ...distractors]);
    this.practice.current = { target, options };
    this.practice.answered = false;

    const { asked, correct } = this.practice;
    this.body.innerHTML = `
      <div class="voc-practice">
        <div class="voc-practice-head">
          <span class="lit-kicker">${VOCAB_CATEGORY_ICONS[target.category] || ""} ${vocabEscape(target.category)}</span>
          <span class="voc-score">${correct} of ${asked} right · ${pool.length} words in this set</span>
        </div>
        <p class="voc-practice-q">Which word means:</p>
        <blockquote class="voc-practice-def">${vocabEscape(target.definition)}</blockquote>
        <div class="voc-options">
          ${options.map(o => `<button class="voc-option" data-pick="${o.id}">${vocabEscape(o.term)}</button>`).join("")}
        </div>
        <div class="lit-feedback" id="vocPracticeFeedback"></div>
        <div class="voc-practice-actions" id="vocPracticeActions" hidden>
          <button class="voc-known-btn" id="vocMarkKnown"></button>
          <button class="voc-module-link" data-module="${target.module}">📘 Open ${target.module.replace("L", "Lesson ")}</button>
          <button class="voc-next" id="vocNext">Next word ➔</button>
        </div>
      </div>
    `;

    this.body.querySelectorAll("[data-pick]").forEach(btn => {
      btn.addEventListener("click", () => this.answerPractice(btn));
    });
    this.body.querySelector("#vocNext").addEventListener("click", () => this.renderPractice());
    this.bindModuleLinks(this.body.querySelector("#vocPracticeActions"));
  }

  answerPractice(btn) {
    if (this.practice.answered) return;
    this.practice.answered = true;
    const { target } = this.practice.current;
    const right = btn.dataset.pick === target.id;
    this.practice.asked += 1;
    if (right) this.practice.correct += 1;
    this.body.querySelector(".voc-score").textContent =
      `${this.practice.correct} of ${this.practice.asked} right · ${this.filteredTerms({ useQuery: false }).length} words in this set`;

    this.body.querySelectorAll("[data-pick]").forEach(b => {
      b.disabled = true;
      if (b.dataset.pick === target.id) b.classList.add("right");
      else if (b === btn) b.classList.add("wrong");
    });
    const picked = this.data.terms.find(t => t.id === btn.dataset.pick);
    const feedback = this.body.querySelector("#vocPracticeFeedback");
    feedback.className = `lit-feedback ${right ? "ok" : "retry"}`;
    feedback.innerHTML = right
      ? `✅ Yes: <strong>${vocabEscape(target.term)}</strong>.`
      : `Not quite. The answer is <strong>${vocabEscape(target.term)}</strong>. <em>${vocabEscape(picked.term)}</em> means: ${vocabEscape(picked.definition)}`;

    const markBtn = this.body.querySelector("#vocMarkKnown");
    const paintMark = () => {
      const on = this.known.has(target.id);
      markBtn.classList.toggle("on", on);
      markBtn.textContent = on ? "✅ I know this" : "☐ I know this";
    };
    if (right && !this.known.has(target.id)) this.toggleKnown(target.id);
    paintMark();
    markBtn.addEventListener("click", () => {
      this.toggleKnown(target.id);
      paintMark();
    });
    this.body.querySelector("#vocPracticeActions").hidden = false;
    this.body.querySelector("#vocNext").focus();
  }

  shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
}

window.addEventListener("DOMContentLoaded", () => {
  window.vocabulary = new VocabularyEngine();
});
