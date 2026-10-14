/**
 * Ages 14-16: Smart Hardware & IoT Home Simulator
 * - Simulated GPIO triggers & virtual floorplan
 * - Web Speech API: in-browser voice recognition (zero cost, native)
 * - Intent parsing and state management
 */

class SmartHomeSimulator {
  constructor() {
    this.states = {
      livingRoomLight: false,
      kitchenLight: false,
      thermostatTemp: 70,
      blindsOpen: false,
      alarmArmed: true
    };

    this.recognition = null;
    this.isListening = false;

    this.initDOM();
    this.initSpeechAPI();
    this.bindEvents();
    this.renderState();
  }

  initDOM() {
    this.btnMic = document.getElementById("btnSmartHomeMic");
    this.transcriptDisplay = document.getElementById("voiceTranscriptText");
    this.tempDisplay = document.getElementById("thermostatDisplayVal");
    this.blindsDisplay = document.getElementById("blindsStatusVal");
    this.roomLiving = document.getElementById("roomLivingRoom");
    this.roomKitchen = document.getElementById("roomKitchen");
    this.toggleLiving = document.getElementById("toggleLivingLight");
    this.toggleKitchen = document.getElementById("toggleKitchenLight");
  }

  initSpeechAPI() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = "en-US";

      this.recognition.onstart = () => {
        this.isListening = true;
        this.btnMic?.classList.add("listening");
        if (this.transcriptDisplay) this.transcriptDisplay.textContent = "Listening for voice command... (e.g. 'Turn on living room lights')";
      };

      this.recognition.onresult = (e) => {
        const transcript = e.results[0][0].transcript;
        if (this.transcriptDisplay) this.transcriptDisplay.textContent = `"${transcript}"`;
        this.parseCommand(transcript);
      };

      this.recognition.onerror = (e) => {
        console.warn("Speech recognition error:", e.error);
        if (this.transcriptDisplay) this.transcriptDisplay.textContent = `Mic error: ${e.error}. (You can also use manual toggles!)`;
        this.stopListening();
      };

      this.recognition.onend = () => {
        this.stopListening();
      };
    }
  }

  bindEvents() {
    this.btnMic?.addEventListener("click", () => {
      if (this.isListening) {
        this.stopListening();
      } else {
        this.startListening();
      }
    });

    this.toggleLiving?.addEventListener("change", (e) => {
      this.states.livingRoomLight = e.target.checked;
      this.renderState();
    });

    this.toggleKitchen?.addEventListener("change", (e) => {
      this.states.kitchenLight = e.target.checked;
      this.renderState();
    });
  }

  startListening() {
    if (!this.recognition) {
      alert("Web Speech API is not supported in this browser. Please use Chrome/Edge or manual toggles!");
      return;
    }
    try {
      this.recognition.start();
    } catch (e) {
      console.warn("Recognition already started", e);
    }
  }

  stopListening() {
    this.isListening = false;
    this.btnMic?.classList.remove("listening");
    if (this.recognition) {
      try { this.recognition.stop(); } catch(e) {}
    }
  }

  parseCommand(text) {
    const lower = text.toLowerCase();
    let actionFeedback = "";

    if (lower.includes("light") || lower.includes("lights")) {
      const turnOn = lower.includes("on") || lower.includes("enable");
      if (lower.includes("living") || lower.includes("all")) {
        this.states.livingRoomLight = turnOn;
        if (this.toggleLiving) this.toggleLiving.checked = turnOn;
      }
      if (lower.includes("kitchen") || lower.includes("all")) {
        this.states.kitchenLight = turnOn;
        if (this.toggleKitchen) this.toggleKitchen.checked = turnOn;
      }
      actionFeedback = `Parsed: Lights set to ${turnOn ? 'ON' : 'OFF'}`;
    } else if (lower.includes("temperature") || lower.includes("degrees") || lower.includes("heat") || lower.includes("cool")) {
      const numMatch = lower.match(/\d+/);
      const targetTemp = numMatch ? parseInt(numMatch[0]) : 72;
      this.states.thermostatTemp = targetTemp;
      actionFeedback = `Parsed: Thermostat set to ${targetTemp}°F`;
    } else if (lower.includes("blind") || lower.includes("window")) {
      this.states.blindsOpen = lower.includes("open");
      actionFeedback = `Parsed: Blinds ${this.states.blindsOpen ? 'Opened' : 'Closed'}`;
    } else {
      actionFeedback = "Parsed: Command recognized but no GPIO mapping triggered.";
    }

    if (this.transcriptDisplay) {
      this.transcriptDisplay.textContent = `"${text}" -> ${actionFeedback}`;
    }
    this.renderState();
  }

  renderState() {
    this.roomLiving?.classList.toggle("active-light", this.states.livingRoomLight);
    this.roomKitchen?.classList.toggle("active-light", this.states.kitchenLight);

    if (this.tempDisplay) this.tempDisplay.textContent = `${this.states.thermostatTemp}°F`;
    if (this.blindsDisplay) this.blindsDisplay.textContent = this.states.blindsOpen ? "Open" : "Closed";
  }

  onCodeRun() {
    this.states.livingRoomLight = true;
    this.states.kitchenLight = true;
    this.states.thermostatTemp = 72;
    if (this.toggleLiving) this.toggleLiving.checked = true;
    if (this.toggleKitchen) this.toggleKitchen.checked = true;
    this.renderState();
  }
}

/**
 * Kids Activity 6 ("Big Kids door") — Smart House preview & Grown-up gate for 12+ Studio
 */
class KidsBigDoorActivity {
  constructor() {
    this.home = { living: false, kitchen: false, temp: 70, blinds: false };
    this.showGrownUpGate = false;
    this.gateError = "";
    this.root = document.getElementById("kidsActBig");
    this.renderKids();
  }

  getChipLine() {
    return "Here is a tiny taste of what bigger kids build. Tap a voice command to run the smart house!";
  }

  runCmd(cmd) {
    const h = { ...this.home };
    if (cmd === "living_on") h.living = true;
    if (cmd === "all_off") {
      h.living = false;
      h.kitchen = false;
    }
    if (cmd === "kitchen_on") h.kitchen = true;
    if (cmd === "warmer") h.temp = Math.min(82, h.temp + 2);
    if (cmd === "cooler") h.temp = Math.max(62, h.temp - 2);
    if (cmd === "blinds") h.blinds = !h.blinds;
    this.home = h;

    // Also sync to 12+ SmartHomeSimulator if initialized
    if (window.smartHome) {
      window.smartHome.states.livingRoomLight = h.living;
      window.smartHome.states.kitchenLight = h.kitchen;
      window.smartHome.states.thermostatTemp = h.temp;
      window.smartHome.states.blindsOpen = h.blinds;
      window.smartHome.renderState();
    }

    this.renderKids();
  }

  renderKids() {
    if (!this.root) return;
    const h = this.home;
    const cmds = [
      ["living_on", "💡 Living room lights on"],
      ["all_off", "🌙 All lights off"],
      ["kitchen_on", "🍳 Kitchen lights on"],
      ["warmer", "🔥 Warmer"],
      ["cooler", "❄️ Cooler"],
      ["blinds", "🪟 Open blinds"]
    ];

    this.root.innerHTML = `
      <div class="kids-two-col">
        <!-- Left card: Try the Smart House -->
        <div class="kids-card">
          <div style="font-family:var(--font-display);font-size:22px;font-weight:800;margin-bottom:10px;">🏠 Try the Smart House</div>
          <div style="font-size:16px;font-weight:700;color:#6B6890;margin-bottom:12px;">Tap a command — just like talking to a smart speaker:</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:18px;">
            ${cmds.map(([k, label]) => `
              <button type="button" data-home-cmd="${k}" style="padding:12px 14px;border-radius:16px;border:3px solid #2B2A4C;background:#4FB3FF;font-family:var(--font-body);font-size:16px;font-weight:800;color:#2B2A4C;cursor:pointer;box-shadow:0 3px 0 #2B2A4C;text-align:left;">
                ${label}
              </button>
            `).join("")}
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
            <div style="padding:16px;border-radius:18px;border:3px solid #2B2A4C;background:${h.living ? "#FFF1CC" : "#F3ECDC"};">
              <div style="font-size:28px;">🛋️</div>
              <div style="font-weight:800;">Living room</div>
              <div style="font-size:15px;font-weight:800;color:#6B6890;">${h.living ? "💡 Lights ON" : "🌙 Lights off"}</div>
            </div>
            <div style="padding:16px;border-radius:18px;border:3px solid #2B2A4C;background:${h.kitchen ? "#FFF1CC" : "#F3ECDC"};">
              <div style="font-size:28px;">🍳</div>
              <div style="font-weight:800;">Kitchen</div>
              <div style="font-size:15px;font-weight:800;color:#6B6890;">${h.kitchen ? "💡 Lights ON" : "🌙 Lights off"}</div>
            </div>
            <div style="padding:16px;border-radius:18px;border:3px solid #2B2A4C;background:#E8F4FF;">
              <div style="font-size:28px;">🌡️</div>
              <div style="font-weight:800;">Heater</div>
              <div style="font-family:var(--font-display);font-size:22px;font-weight:800;">${h.temp}°F</div>
            </div>
            <div style="padding:16px;border-radius:18px;border:3px solid #2B2A4C;background:#E8F4FF;">
              <div style="font-size:28px;">🪟</div>
              <div style="font-weight:800;">Blinds</div>
              <div style="font-size:15px;font-weight:800;color:#6B6890;">${h.blinds ? "☀️ Open" : "🌙 Closed"}</div>
            </div>
          </div>
        </div>

        <!-- Right card: Behind the Big Kids door (ages 12+) -->
        <div class="kids-card" style="background:#2B2A4C;color:#FFFFFF;">
          <div style="font-family:var(--font-display);font-size:24px;font-weight:800;margin-bottom:8px;">🚪 Behind the Big Kids door (ages 12+)</div>
          <div style="font-size:16px;font-weight:700;opacity:0.9;margin-bottom:16px;">
            When you're ready for typing real code, a grown-up can open the Innovation Studio:
          </div>
          <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:18px;">
            <div style="background:rgba(255,255,255,0.1);border:2px solid rgba(255,255,255,0.25);border-radius:16px;padding:14px;font-weight:800;">
              🌽 <b>Corn Leaf Doctor</b> — write Python to spot sick plants
            </div>
            <div style="background:rgba(255,255,255,0.1);border:2px solid rgba(255,255,255,0.25);border-radius:16px;padding:14px;font-weight:800;">
              🧠 <b>Word-by-Word Brain</b> — see how chatbots pick the next word
            </div>
            <div style="background:rgba(255,255,255,0.1);border:2px solid rgba(255,255,255,0.25);border-radius:16px;padding:14px;font-weight:800;">
              ⚖️ <b>Fairness Checker</b> — test if a robot treats everyone fairly
            </div>
            <div style="background:rgba(255,255,255,0.1);border:2px solid rgba(255,255,255,0.25);border-radius:16px;padding:14px;font-weight:800;">
              🔒 <b>200-Word Writing Studio</b> — longer essays with Socratic AI
            </div>
          </div>
          <div style="background:#FFC53D;color:#2B2A4C;border-radius:16px;padding:14px;font-weight:800;text-align:center;border:3px solid #FFFFFF;">
            <div>Ask a grown-up or teacher to open it with you.</div>
            ${!this.showGrownUpGate ? `
              <button type="button" id="btnShowGrownUpGate" style="margin-top:10px;padding:10px 18px;border-radius:999px;border:3px solid #2B2A4C;background:#FFFFFF;color:#2B2A4C;font-family:var(--font-body);font-size:15px;font-weight:800;cursor:pointer;box-shadow:0 3px 0 #2B2A4C;">
                🔑 Grown-up / Teacher: Open 12+ Studio
              </button>
            ` : `
              <div style="margin-top:12px;padding-top:12px;border-top:2px dashed #2B2A4C;">
                <div style="font-size:15px;margin-bottom:8px;">Grown-up check: What is 7 × 8?</div>
                <div style="display:flex;gap:8px;justify-content:center;align-items:center;flex-wrap:wrap;">
                  <input id="grownUpGateInput" type="number" placeholder="Answer" style="width:110px;padding:8px 12px;border-radius:12px;border:3px solid #2B2A4C;font-family:var(--font-body);font-size:16px;font-weight:800;text-align:center;color:#2B2A4C;background:#FFFFFF;">
                  <button type="button" id="btnVerifyGrownUpGate" style="padding:8px 16px;border-radius:12px;border:3px solid #2B2A4C;background:#4ADE80;color:#2B2A4C;font-family:var(--font-body);font-size:15px;font-weight:800;cursor:pointer;box-shadow:0 3px 0 #2B2A4C;">
                    Unlock 12+ Portal →
                  </button>
                </div>
                ${this.gateError ? `<div style="color:#B42318;font-size:14px;margin-top:6px;">${this.gateError}</div>` : ""}
              </div>
            `}
          </div>
        </div>
      </div>
    `;

    this.root.querySelectorAll("[data-home-cmd]").forEach(btn => {
      btn.addEventListener("click", () => this.runCmd(btn.dataset.homeCmd));
    });

    this.root.querySelector("#btnShowGrownUpGate")?.addEventListener("click", () => {
      this.showGrownUpGate = true;
      this.gateError = "";
      this.renderKids();
      this.root.querySelector("#grownUpGateInput")?.focus();
    });

    const verify = () => {
      const val = this.root.querySelector("#grownUpGateInput")?.value?.trim();
      if (val === "56") {
        this.showGrownUpGate = false;
        this.gateError = "";
        this.renderKids();
        window.app?.openBigKidsPortal("studio");
      } else {
        this.gateError = "Not quite — ask a grown-up or teacher (7 × 8 = 56).";
        this.renderKids();
      }
    };

    this.root.querySelector("#btnVerifyGrownUpGate")?.addEventListener("click", verify);
    this.root.querySelector("#grownUpGateInput")?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") verify();
    });
  }
}

window.addEventListener("DOMContentLoaded", () => {
  window.smartHome = new SmartHomeSimulator();
  window.kidsBigDoor = new KidsBigDoorActivity();
});

