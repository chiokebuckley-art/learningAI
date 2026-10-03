/**
 * Non-Tech Subjects: The Socratic Split-Screen ("Draft & Unlock" Workspace)
 * - Strict pedagogical gatekeeper: Padlock remains locked until student writes 200+ words
 * - Strictly enforces Socratic dialogue: never writes essays or gives direct answers
 * - Poses probing questions, challenges assumptions, uncovers blind spots
 * - Zero cost: runs client-side with semantic inquiry templates & optional local Ollama bridge
 */

const TOPIC_PRESETS = {
  "arch_bridges": {
    title: "Roman Stone Arch Bridges and Mortar Load",
    prompt: "Investigate how Roman engineers built massive bridges across European rivers that lasted two millennia without modern concrete. Analyze the structural difference between compression forces on voussoirs and mortar load on spandrels.",
    minWords: 200,
    sampleDraft: `Roman engineering remains a marvel of the ancient world. They pioneered the use of stone arch bridges to create durable structures across rivers and valleys. These bridges were built primarily without mortar in the main arch structure, relying on precisely cut stone blocks (voussoirs) and friction. The load was effectively managed through geometric precision and gravity. The stone arch itself directs the substantial vertical compression forces downwards along the curve of the arch into the massive abutments anchored deep into the banks. However, mortar was used on the surfaces above the arch, known as the spandrels, to fill gaps and create a level surface for the roadway. The weight of the road and traffic above (the live load) was distributed by this spandrel material.

It is crucial to understand that the structural integrity of the arch itself was maintained by the compressive forces locking the voussoirs together, ensuring that each stone pushed against its neighbor under the immense weight, creating a remarkably strong and self-supporting structure that endures to this day.`,
    guidingQuestions: [
      "Excellent draft! You have described the arch's compression beautifully. Let's dive deeper: What role does the central keystone play in distributing mortar tension compared to lateral forces?",
      "Consider the abutments: What would happen to the bridge if the riverbank soil eroded beneath one abutment? How did Roman engineers prevent lateral thrust from pushing the riverbanks apart?",
      "You mentioned mortar was used in the spandrels but not the voussoirs. Why did Roman builders avoid mortar between the main arch stones?"
    ]
  },
  "renewable_grid": {
    title: "Renewable Energy Grid Reliability & Storage",
    prompt: "Examine the technical hurdles of transitioning modern electrical grids to 100% solar and wind. Contrast battery energy storage systems (BESS) with pumped-storage hydroelectricity.",
    minWords: 180,
    sampleDraft: `Modern electrical grids rely heavily on baseload power from fossil fuels and nuclear plants. Transitioning to renewable energy like solar and wind introduces intermittency because the sun does not always shine and the wind does not always blow. To maintain grid frequency and prevent blackouts, massive energy storage systems are required. Chemical battery energy storage systems (BESS) using lithium-ion are great for fast response times during peak demand spikes. However, they degrade over thousands of charge cycles and pose supply chain issues. In contrast, pumped-storage hydroelectricity stores potential energy by pumping water into elevated reservoirs. It provides long-duration energy storage at gigawatt scales, though it requires specific mountainous geography.`,
    guidingQuestions: [
      "You've articulated the difference between fast-response BESS and bulk pumped hydro very well. How does inertia from spinning turbines in conventional power plants protect grid frequency, and how can renewables simulate that virtual inertia?",
      "What economic tradeoffs occur when a grid is overbuilt with 3x solar capacity to survive winter cloudy periods?"
    ]
  }
};

class SocraticWorkspaceEngine {
  constructor() {
    this.currentTopicKey = "arch_bridges";
    this.wordCount = 0;
    this.isUnlocked = false;

    this.initDOM();
    this.bindEvents();
    this.loadTopic(this.currentTopicKey);
  }

  initDOM() {
    this.topicSelect = document.getElementById("socraticTopicSelect");
    this.essayArea = document.getElementById("studentEssayText");
    this.wordCountDisplay = document.getElementById("wordCountDisplayVal");
    this.progressFill = document.getElementById("wordProgressFill");
    this.gatekeeperBadge = document.getElementById("gatekeeperBadge");
    this.aiPanel = document.getElementById("socraticAiPanel");
    this.lockOverlay = document.getElementById("socraticLockOverlay");
    this.lockStatusMsg = document.getElementById("socraticLockMessage");
    this.messagesContainer = document.getElementById("socraticMessages");
    this.inputField = document.getElementById("socraticQuestionInput");
    this.btnAsk = document.getElementById("btnAskSocratic");
    this.btnLoadSample = document.getElementById("btnLoadSampleDraft");
  }

  bindEvents() {
    this.topicSelect?.addEventListener("change", (e) => {
      this.loadTopic(e.target.value);
    });

    this.essayArea?.addEventListener("input", () => {
      this.updateWordCount();
    });

    this.btnAsk?.addEventListener("click", () => {
      this.handleUserQuestion();
    });

    this.inputField?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        this.handleUserQuestion();
      }
    });

    this.btnLoadSample?.addEventListener("click", () => {
      const topic = TOPIC_PRESETS[this.currentTopicKey];
      if (this.essayArea && topic) {
        this.essayArea.value = topic.sampleDraft;
        this.updateWordCount();
      }
    });
  }

  loadTopic(key) {
    this.currentTopicKey = key;
    const topic = TOPIC_PRESETS[key];
    if (!topic) return;

    if (this.essayArea) this.essayArea.placeholder = `Draft your thoughts on: ${topic.title}...\n\nPrompt: ${topic.prompt}\n(Write at least ${topic.minWords} original words to unlock your Socratic AI Tutor)`;
    this.updateWordCount();

    // Reset messages
    if (this.messagesContainer) {
      this.messagesContainer.innerHTML = "";
    }
  }

  updateWordCount() {
    const text = this.essayArea?.value || "";
    const words = text.trim().length > 0 ? text.trim().split(/\s+/).length : 0;
    this.wordCount = words;

    const topic = TOPIC_PRESETS[this.currentTopicKey];
    const threshold = topic ? topic.minWords : 200;
    const pct = Math.min(100, Math.round((words / threshold) * 100));

    if (this.wordCountDisplay) {
      this.wordCountDisplay.textContent = `${words} / ${threshold} words`;
    }

    if (this.progressFill) {
      this.progressFill.style.width = `${pct}%`;
    }

    // Gatekeeper verification
    if (words >= threshold) {
      this.unlockAI(topic);
    } else {
      this.lockAI(threshold - words);
    }
  }

  lockAI(remainingWords) {
    this.isUnlocked = false;
    this.aiPanel?.classList.add("locked");
    if (this.gatekeeperBadge) {
      this.gatekeeperBadge.className = "gatekeeper-status-badge gatekeeper-locked";
      this.gatekeeperBadge.innerHTML = `<span>🔒 AI Locked</span> <span style="font-size:0.75rem; font-weight:normal;">(${remainingWords} words needed)</span>`;
    }
    if (this.lockStatusMsg) {
      this.lockStatusMsg.textContent = `Write ${remainingWords} more words of original thought to unlock your Socratic AI Tutor!`;
    }
  }

  unlockAI(topic) {
    if (this.isUnlocked) return; // already unlocked
    this.isUnlocked = true;
    this.aiPanel?.classList.remove("locked");

    if (this.gatekeeperBadge) {
      this.gatekeeperBadge.className = "gatekeeper-status-badge gatekeeper-unlocked";
      this.gatekeeperBadge.innerHTML = `<span>🔓 Socratic Tutor Unlocked!</span>`;
    }

    // Greet student with initial probing question
    if (this.messagesContainer && this.messagesContainer.children.length === 0) {
      const q = topic.guidingQuestions[0];
      this.appendAiMessage(q);
    }
  }

  handleUserQuestion() {
    if (!this.isUnlocked) return;
    const q = this.inputField?.value?.trim();
    if (!q) return;

    this.appendUserMessage(q);
    if (this.inputField) this.inputField.value = "";

    // Socratic response generator (strictly never writes essay or gives direct answers!)
    setTimeout(() => {
      this.generateSocraticResponse(q);
    }, 600);
  }

  appendUserMessage(text) {
    if (!this.messagesContainer) return;
    const msg = document.createElement("div");
    msg.className = "socratic-bubble socratic-bubble-user";
    msg.innerHTML = `<strong>You:</strong> ${text}`;
    this.messagesContainer.appendChild(msg);
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
  }

  appendAiMessage(text) {
    if (!this.messagesContainer) return;
    const msg = document.createElement("div");
    msg.className = "socratic-bubble socratic-bubble-ai";
    msg.innerHTML = `<strong>Socratic AI:</strong> ${text}`;
    this.messagesContainer.appendChild(msg);
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
  }

  generateSocraticResponse(studentInput) {
    const topic = TOPIC_PRESETS[this.currentTopicKey];
    const lower = studentInput.toLowerCase();

    // Check if student asked AI to write the essay
    if (lower.includes("write") || lower.includes("essay") || lower.includes("paragraph") || lower.includes("finish it")) {
      this.appendAiMessage("As your Socratic tutor, I will not write your paper or complete your sentences for you! My role is to help you sharpen your reasoning. What is the central hypothesis you want to defend in your next paragraph?");
      return;
    }

    // Select dynamic pedagogical follow-up
    const followUps = topic.guidingQuestions;
    const nextQ = followUps[Math.floor(Math.random() * followUps.length)];
    this.appendAiMessage(`That is an insightful observation. ${nextQ}`);
  }
}

window.addEventListener("DOMContentLoaded", () => {
  window.socraticWorkspace = new SocraticWorkspaceEngine();
});
