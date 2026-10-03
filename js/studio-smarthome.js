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

window.addEventListener("DOMContentLoaded", () => {
  window.smartHome = new SmartHomeSimulator();
});
