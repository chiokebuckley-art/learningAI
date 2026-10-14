/**
 * learningAI — Main Application Controller
 * - Manages learningAI Kids (Ages 6–11) Free Play & Quest Path modes
 * - Persists 5 activity stars in localStorage under 'learningai.kids.v1'
 * - Coordinates ActivityFrame (Chip bubble, 3-step strip, Next button)
 * - Manages grown-up gated access to the 12+ Big Kids Portal (Innovation Studio, 200-word Socratic, Literacy Core, Video Theater)
 */

const KIDS_STORAGE_KEY = "learningai.kids.v1";

const KIDS_ACTS = [
  {
    id: "vision",
    emoji: "👀",
    title: "Teach a robot to see",
    sub: "Show it pencils. Watch it guess. Fix its mistake!",
    color: "#FFC53D",
    ink: "#4A3200",
    steps: ["Show it things", "Spot the mistake", "Teach it more"]
  },
  {
    id: "rover",
    emoji: "🧩",
    title: "Build a robot brain",
    sub: "Snap blocks together so the robot finds the star.",
    color: "#4FB3FF",
    ink: "#06243D",
    steps: ["Add blocks", "Press GO", "Reach the star"]
  },
  {
    id: "bot",
    emoji: "🤖",
    title: "Dodge the rocks",
    sub: "Drop rocks. Watch the robot see, think, and move.",
    color: "#A78BFA",
    ink: "#2A1A5E",
    steps: ["Watch it drive", "Drop 3 rocks", "See it dodge"]
  },
  {
    id: "sort",
    emoji: "🗂️",
    title: "Is it AI?",
    sub: "Sort 6 gadgets: rule-follower, learner, or maker?",
    color: "#4ADE80",
    ink: "#0B3D1E",
    steps: ["Tap a card", "Tap a box", "Check"]
  },
  {
    id: "write",
    emoji: "✍️",
    title: "My brain goes first",
    sub: "Write your own ideas, then Chip asks questions.",
    color: "#FFB3C6",
    ink: "#5A1024",
    steps: ["Pick a topic", "Write 30 words", "Chip unlocks"]
  }
];

const KIDS_BIG = {
  id: "big",
  emoji: "🚪",
  title: "Big Kids door",
  sub: "Peek at what 12+ kids build. Try the smart house.",
  color: "#2B2A4C",
  ink: "#FFFFFF",
  steps: ["Peek inside", "Try the house", "Ask a grown-up"]
};

class LearningAIApp {
  constructor() {
    this.mode = "play";     // 'play' | 'quest'
    this.screen = "home";   // 'home' | 'vision' | 'rover' | 'bot' | 'sort' | 'write' | 'big'
    this.done = this.loadKidsProgress();

    // 12+ Big Kids Portal state
    this.inBigKidsPortal = false;
    this.currentPortal = "studio";

    this.initDOM();
    this.bindEvents();
    this.renderKidsShell();
  }

  loadKidsProgress() {
    try {
      return JSON.parse(localStorage.getItem(KIDS_STORAGE_KEY) || "{}");
    } catch {
      return {};
    }
  }

  saveKidsProgress() {
    try {
      localStorage.setItem(KIDS_STORAGE_KEY, JSON.stringify(this.done));
    } catch {}
  }

  markKidsDone(id) {
    if (this.done[id]) return;
    this.done = { ...this.done, [id]: true };
    this.saveKidsProgress();
    this.renderHeader();
    this.renderActivityHeaderAndNext();
  }

  isUnlocked(idx) {
    if (idx === 0) return true;
    return Boolean(this.done[KIDS_ACTS[idx - 1].id]);
  }

  initDOM() {
    this.kidsAppContainer = document.getElementById("kidsAppContainer");
    this.bigKidsPortalContainer = document.getElementById("bigKidsPortalContainer");

    // Kids Header elements
    this.btnKidsHomeLogo = document.getElementById("btnKidsHomeLogo");
    this.btnModePlay = document.getElementById("btnModePlay");
    this.btnModeQuest = document.getElementById("btnModeQuest");
    this.kidsStarCounter = document.getElementById("kidsStarCounter");

    // Kids Screens
    this.kidsHomeScreen = document.getElementById("kidsHomeScreen");
    this.kidsActivityFrame = document.getElementById("kidsActivityFrame");
    this.kidsActivityHeaderMount = document.getElementById("kidsActivityHeaderMount");
    this.kidsActivityNextMount = document.getElementById("kidsActivityNextMount");

    this.activityPanes = {
      vision: document.getElementById("kidsActVision"),
      rover: document.getElementById("kidsActRover"),
      bot: document.getElementById("kidsActBot"),
      sort: document.getElementById("kidsActSort"),
      write: document.getElementById("kidsActWrite"),
      big: document.getElementById("kidsActBig")
    };

    // 12+ Big Kids Portal navigation
    this.navTabs = document.querySelectorAll(".nav-tab[data-portal]");
    this.portalSections = {
      literacy: document.getElementById("portalLiteracy"),
      studio: document.getElementById("portalStudio"),
      socratic: document.getElementById("portalSocratic")
    };
    this.btnBackToKidsMode = document.getElementById("btnBackToKidsMode");
    this.btnOpenTheater = document.getElementById("btnOpenVideoTheater");
    this.btnZeroCostInfo = document.getElementById("btnZeroCostInfo");
  }

  bindEvents() {
    this.btnKidsHomeLogo?.addEventListener("click", () => this.openScreen("home"));

    this.btnModePlay?.addEventListener("click", () => {
      this.mode = "play";
      this.openScreen("home");
    });

    this.btnModeQuest?.addEventListener("click", () => {
      this.mode = "quest";
      this.openScreen("home");
    });

    // 12+ Big Kids Portal events
    this.btnBackToKidsMode?.addEventListener("click", () => this.closeBigKidsPortal());

    this.navTabs.forEach(tab => {
      tab.addEventListener("click", () => {
        const portal = tab.dataset.portal;
        this.switchPortal(portal);
      });
    });

    this.btnOpenTheater?.addEventListener("click", () => {
      if (window.theater) {
        window.theater.open(0);
      }
    });

    this.btnZeroCostInfo?.addEventListener("click", () => {
      alert(
        "Zero Financial Cost Guarantee:\n• In-browser Python WebAssembly (Pyodide): $0 server compute bills.\n• On-device TensorFlow.js & Computer Vision: 100% privacy, zero cloud API fees.\n• Free local LLM integrations (Ollama / WebLLM): runs completely offline.\n• Free neural voiceovers (Edge-TTS / native OS): zero voice API subscriptions."
      );
    });
  }

  openScreen(id) {
    // Stop timers/loops from previous screen
    window.blocklyMaze?.stopTimer();
    window.agentSandbox?.stopLoop();

    this.screen = id;
    this.renderKidsShell();

    if (id === "rover") {
      window.blocklyMaze?.drawRoverCanvas();
    } else if (id === "bot") {
      window.agentSandbox?.startBotLoop();
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  getActiveChipLine(id) {
    if (id === "vision" && window.visionLab) return window.visionLab.getChipLine();
    if (id === "rover" && window.blocklyMaze) return window.blocklyMaze.getChipLine();
    if (id === "bot" && window.agentSandbox) return window.agentSandbox.getChipLine();
    if (id === "sort" && window.kidsSortActivity) return window.kidsSortActivity.getChipLine();
    if (id === "write" && window.kidsWriteActivity) return window.kidsWriteActivity.getChipLine();
    if (id === "big" && window.kidsBigDoor) return window.kidsBigDoor.getChipLine();
    return "Tap a button to start playing!";
  }

  updateChipLine(text) {
    const el = document.getElementById("kidsChipLineText");
    if (el) el.textContent = text;
  }

  renderHeader() {
    const starCount = KIDS_ACTS.filter(a => this.done[a.id]).length;
    if (this.kidsStarCounter) {
      this.kidsStarCounter.innerHTML = `<span style="font-size:22px;">⭐</span><span>${starCount} of ${KIDS_ACTS.length} stars</span>`;
    }
    if (this.btnModePlay) {
      this.btnModePlay.classList.toggle("active", this.mode === "play");
    }
    if (this.btnModeQuest) {
      this.btnModeQuest.classList.toggle("active", this.mode === "quest");
    }
  }

  renderKidsShell() {
    this.renderHeader();

    if (this.screen === "home") {
      if (this.kidsHomeScreen) this.kidsHomeScreen.style.display = "block";
      if (this.kidsActivityFrame) this.kidsActivityFrame.style.display = "none";
      this.renderHome();
    } else {
      if (this.kidsHomeScreen) this.kidsHomeScreen.style.display = "none";
      if (this.kidsActivityFrame) this.kidsActivityFrame.style.display = "block";
      this.renderActivityHeaderAndNext();

      Object.entries(this.activityPanes).forEach(([key, pane]) => {
        if (pane) pane.style.display = key === this.screen ? "block" : "none";
      });
    }
  }

  renderHome() {
    if (!this.kidsHomeScreen) return;
    const starCount = KIDS_ACTS.filter(a => this.done[a.id]).length;
    const nextIdx = KIDS_ACTS.findIndex((a, i) => this.isUnlocked(i) && !this.done[a.id]);

    const chipTitle = this.mode === "play"
      ? "Hi! I'm Chip. Pick any game!"
      : nextIdx >= 0
        ? `Hi! I'm Chip. Let's do Level ${nextIdx + 1} next!`
        : "Hi! I'm Chip. You finished everything!";

    const chipSub = this.mode === "play"
      ? "Every game earns a star. Play them in any order you like."
      : "Finish one level to unlock the next. Earn a star for each one.";

    let bodyHTML = "";
    if (this.mode === "play") {
      const tiles = [...KIDS_ACTS, KIDS_BIG];
      bodyHTML = `
        <div class="kids-freeplay-grid">
          ${tiles.map(a => `
            <button type="button" data-open-act="${a.id}" style="text-align:left;background:${a.color};color:${a.ink};border:4px solid #2B2A4C;border-radius:26px;padding:24px;cursor:pointer;box-shadow:0 8px 0 #2B2A4C;display:flex;flex-direction:column;justify-content:space-between;min-height:220px;position:relative;transition:transform .12s;">
              <div style="display:flex;justify-content:space-between;align-items:flex-start;">
                <span style="font-size:56px;line-height:1;filter:drop-shadow(0 3px 0 rgba(0,0,0,0.12));">${a.emoji}</span>
                ${a.id !== "big" ? `
                  <span style="background:${this.done[a.id] ? "#4ADE80" : "rgba(255,255,255,0.55)"};color:#2B2A4C;border:3px solid #2B2A4C;border-radius:999px;width:38px;height:38px;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:800;">
                    ${this.done[a.id] ? "⭐" : "☆"}
                  </span>
                ` : ""}
              </div>
              <div style="margin-top:16px;">
                <div style="font-family:var(--font-display);font-size:26px;font-weight:800;line-height:1.15;margin-bottom:6px;">${a.title}</div>
                <div style="font-size:16px;font-weight:700;opacity:0.9;">${a.sub}</div>
              </div>
              <div style="margin-top:14px;display:inline-flex;align-items:center;gap:6px;background:${a.id === "big" ? "#FFC53D" : "#FFFFFF"};color:#2B2A4C;border:3px solid #2B2A4C;border-radius:999px;padding:6px 14px;font-weight:800;font-size:15px;align-self:flex-start;">
                ▶ Play
              </div>
            </button>
          `).join("")}
        </div>
      `;
    } else {
      bodyHTML = `
        <div style="max-width:680px;margin:0 auto;">
          ${KIDS_ACTS.map((a, i) => {
            const unlocked = this.isUnlocked(i);
            const finished = Boolean(this.done[a.id]);
            const isNext = i === nextIdx;
            const statusText = finished
              ? "Finished! Tap to play again."
              : !unlocked
                ? `Finish level ${i} to unlock`
                : isNext
                  ? "Your next adventure — tap to start!"
                  : "Ready to play";
            return `
              <div>
                <button type="button" data-quest-act="${a.id}" data-quest-unlocked="${unlocked ? "1" : "0"}" style="width:100%;text-align:left;background:${unlocked ? a.color : "#ECE5D5"};color:${unlocked ? a.ink : "#8C88A8"};border:4px solid #2B2A4C;border-radius:26px;padding:22px 24px;cursor:${unlocked ? "pointer" : "not-allowed"};box-shadow:0 7px 0 #2B2A4C;display:flex;align-items:center;gap:20px;opacity:${unlocked ? 1 : 0.72};${isNext ? "outline:5px solid #FF6B6B;outline-offset:3px;" : ""}">
                  <div style="width:68px;height:68px;border-radius:999px;background:#FFFFFF;border:4px solid #2B2A4C;display:flex;align-items:center;justify-content:center;font-size:34px;flex-shrink:0;">
                    ${finished ? "⭐" : unlocked ? a.emoji : "🔒"}
                  </div>
                  <div style="flex:1;">
                    <div style="font-size:13px;font-weight:800;letter-spacing:0.6px;text-transform:uppercase;opacity:0.8;">Level ${i + 1}</div>
                    <div style="font-family:var(--font-display);font-size:26px;font-weight:800;line-height:1.15;">${a.title}</div>
                    <div style="font-size:16px;font-weight:700;margin-top:2px;">${statusText}</div>
                  </div>
                  <div style="font-size:28px;font-weight:800;">
                    ${finished ? "✅" : unlocked ? "▶" : "🔒"}
                  </div>
                </button>
                ${i < KIDS_ACTS.length - 1 ? `<div style="width:10px;height:34px;background:#FFE3A3;margin:0 0 0 46px;border-radius:5px;"></div>` : ""}
              </div>
            `;
          }).join("")}

          ${starCount === KIDS_ACTS.length ? `
            <div style="margin-top:24px;background:#FFC53D;border:4px solid #2B2A4C;border-radius:26px;padding:24px;text-align:center;box-shadow:0 8px 0 #2B2A4C;">
              <div style="font-size:64px;">🏆</div>
              <div style="font-family:var(--font-display);font-size:32px;font-weight:800;">You finished the whole quest!</div>
              <div style="font-size:18px;font-weight:700;margin-top:4px;">You know how robots see, think, and learn. Show a grown-up what you made!</div>
            </div>
          ` : ""}
        </div>
      `;
    }

    this.kidsHomeScreen.innerHTML = `
      <!-- Chip greeting -->
      <div style="background:#FFFFFF;border:3px solid #2B2A4C;border-radius:26px;padding:22px 26px;display:flex;align-items:center;gap:20px;box-shadow:0 6px 0 #FFE3A3;margin-bottom:28px;flex-wrap:wrap;">
        <img src="assets/images/learning_ai_mascot.jpg" alt="Chip" class="kids-mascot-bob" style="width:84px;height:84px;border-radius:24px;border:3px solid #FFC53D;object-fit:cover;flex-shrink:0;">
        <div style="flex:1;min-width:220px;">
          <div style="font-family:var(--font-display);font-size:28px;font-weight:800;line-height:1.15;margin-bottom:4px;">
            ${chipTitle}
          </div>
          <div style="font-size:18px;color:#6B6890;font-weight:700;">
            ${chipSub}
          </div>
        </div>
      </div>
      ${bodyHTML}
    `;

    this.kidsHomeScreen.querySelectorAll("[data-open-act]").forEach(btn => {
      btn.addEventListener("click", () => this.openScreen(btn.dataset.openAct));
    });

    this.kidsHomeScreen.querySelectorAll("[data-quest-act]").forEach(btn => {
      btn.addEventListener("click", () => {
        if (btn.dataset.questUnlocked === "1") {
          this.openScreen(btn.dataset.questAct);
        }
      });
    });
  }

  renderActivityHeaderAndNext() {
    if (!this.kidsActivityHeaderMount || !this.kidsActivityNextMount) return;
    const act = [...KIDS_ACTS, KIDS_BIG].find(a => a.id === this.screen);
    if (!act) return;

    const idx = KIDS_ACTS.findIndex(a => a.id === act.id);
    const nextAct = idx >= 0 && idx < KIDS_ACTS.length - 1 ? KIDS_ACTS[idx + 1] : null;
    const chipLine = this.getActiveChipLine(act.id);

    this.kidsActivityHeaderMount.innerHTML = `
      <!-- Top bar -->
      <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:18px;flex-wrap:wrap;">
        <button type="button" id="btnKidsBackHome" style="padding:10px 20px;border-radius:999px;border:3px solid #2B2A4C;background:#FFFFFF;font-family:var(--font-body);font-size:18px;font-weight:800;color:#2B2A4C;cursor:pointer;box-shadow:0 4px 0 #2B2A4C;">
          ← Back
        </button>
        <div style="display:flex;align-items:center;gap:10px;">
          <span style="font-size:34px;">${act.emoji}</span>
          <span style="font-family:var(--font-display);font-size:30px;font-weight:800;">${act.title}</span>
        </div>
        ${this.done[act.id] ? `
          <div style="background:#4ADE80;border:3px solid #2B2A4C;border-radius:999px;padding:8px 18px;font-weight:800;font-size:17px;">
            ⭐ Done!
          </div>
        ` : `<div style="width:90px;"></div>`}
      </div>

      <!-- Chip helper bubble -->
      <div style="background:#FFFFFF;border:3px solid #2B2A4C;border-radius:22px;padding:16px 20px;display:flex;align-items:center;gap:16px;box-shadow:0 5px 0 #FFE3A3;margin-bottom:20px;">
        <img src="assets/images/learning_ai_mascot.jpg" alt="Chip" style="width:60px;height:60px;border-radius:18px;border:3px solid #FFC53D;object-fit:cover;flex-shrink:0;">
        <div style="flex:1;">
          <div style="font-size:13px;font-weight:800;color:#6B6890;text-transform:uppercase;letter-spacing:0.5px;">Chip says</div>
          <div id="kidsChipLineText" style="font-size:19px;font-weight:800;line-height:1.3;">${chipLine}</div>
        </div>
      </div>

      <!-- 3-step strip -->
      <div style="display:flex;gap:10px;margin-bottom:22px;flex-wrap:wrap;">
        ${act.steps.map((s, i) => `
          <div style="flex:1;min-width:160px;background:${i === 0 ? "#2B2A4C" : "#FFFFFF"};color:${i === 0 ? "#FFFFFF" : "#2B2A4C"};border:3px solid #2B2A4C;border-radius:16px;padding:10px 14px;font-weight:800;font-size:16px;display:flex;align-items:center;gap:8px;">
            <span style="background:#FFC53D;color:#2B2A4C;border-radius:999px;width:26px;height:26px;display:inline-flex;align-items:center;justify-content:center;font-size:14px;">${i + 1}</span>
            <span>${s}</span>
          </div>
        `).join("")}
      </div>
    `;

    this.kidsActivityHeaderMount.querySelector("#btnKidsBackHome")?.addEventListener("click", () => {
      this.openScreen("home");
    });

    if (this.done[act.id] && nextAct) {
      this.kidsActivityNextMount.innerHTML = `
        <div style="margin-top:26px;text-align:center;">
          <button type="button" id="btnKidsNextActivity" style="padding:16px 32px;border-radius:999px;border:4px solid #2B2A4C;background:#FF6B6B;color:#FFFFFF;font-family:var(--font-display);font-size:24px;font-weight:800;cursor:pointer;box-shadow:0 6px 0 #2B2A4C;">
            Next: ${nextAct.title} →
          </button>
        </div>
      `;
      this.kidsActivityNextMount.querySelector("#btnKidsNextActivity")?.addEventListener("click", () => {
        this.openScreen(nextAct.id);
      });
    } else {
      this.kidsActivityNextMount.innerHTML = "";
    }
  }

  // ---------- 12+ Big Kids Portal switching ----------
  openBigKidsPortal(portalKey = "studio") {
    window.blocklyMaze?.stopTimer();
    window.agentSandbox?.stopLoop();
    this.inBigKidsPortal = true;
    if (this.kidsAppContainer) this.kidsAppContainer.style.display = "none";
    if (this.bigKidsPortalContainer) this.bigKidsPortalContainer.style.display = "block";
    this.switchPortal(portalKey);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  closeBigKidsPortal() {
    this.inBigKidsPortal = false;
    if (this.bigKidsPortalContainer) this.bigKidsPortalContainer.style.display = "none";
    if (this.kidsAppContainer) this.kidsAppContainer.style.display = "block";
    this.renderKidsShell();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  switchPortal(portalKey) {
    this.currentPortal = portalKey;
    this.navTabs.forEach(tab => {
      tab.classList.toggle("active", tab.dataset.portal === portalKey);
    });

    Object.keys(this.portalSections).forEach(key => {
      const section = this.portalSections[key];
      if (section) {
        section.classList.toggle("active", key === portalKey);
      }
    });
  }
}

window.addEventListener("DOMContentLoaded", () => {
  window.app = new LearningAIApp();
});
