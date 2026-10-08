/**
 * learningAI - Main Application Controller
 * - Portal navigation & switching
 * - Grade level selector for The Sandbox
 * - Zero cost badge details modal
 */

class LearningAIApp {
  constructor() {
    this.currentPortal = "literacy"; // 'literacy', 'sandbox', 'studio', 'socratic'
    this.currentGrade = "grade3";   // 'grade3', 'grade4', 'grade5'

    this.initDOM();
    this.bindEvents();
    this.switchPortal(this.currentPortal);
    this.switchGrade(this.currentGrade);
  }

  initDOM() {
    this.navTabs = document.querySelectorAll(".nav-tab[data-portal]");
    this.portalSections = {
      literacy: document.getElementById("portalLiteracy"),
      sandbox: document.getElementById("portalSandbox"),
      studio: document.getElementById("portalStudio"),
      socratic: document.getElementById("portalSocratic")
    };

    this.gradeButtons = document.querySelectorAll(".grade-btn[data-grade]");
    this.sandboxModules = {
      grade3: document.getElementById("sandboxGrade3"),
      grade4: document.getElementById("sandboxGrade4"),
      grade5: document.getElementById("sandboxGrade5")
    };

    this.btnOpenTheater = document.getElementById("btnOpenVideoTheater");
    this.btnZeroCostInfo = document.getElementById("btnZeroCostInfo");
  }

  bindEvents() {
    this.navTabs.forEach(tab => {
      tab.addEventListener("click", () => {
        const portal = tab.dataset.portal;
        this.switchPortal(portal);
      });
    });

    this.gradeButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        const grade = btn.dataset.grade;
        this.switchGrade(grade);
      });
    });

    this.btnOpenTheater?.addEventListener("click", () => {
      if (window.theater) {
        window.theater.open(0);
      }
    });

    this.btnZeroCostInfo?.addEventListener("click", () => {
      alert("Zero Financial Cost Guarantee:\n• In-browser Python WebAssembly (Pyodide): $0 server compute bills.\n• On-device TensorFlow.js & Computer Vision: 100% privacy, zero cloud API fees.\n• Free local LLM integrations (Ollama / WebLLM): runs completely offline.\n• Free neural voiceovers (Edge-TTS / native OS): zero voice API subscriptions.");
    });
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

  switchGrade(gradeKey) {
    this.currentGrade = gradeKey;
    this.gradeButtons.forEach(btn => {
      btn.classList.toggle("active", btn.dataset.grade === gradeKey);
    });

    Object.keys(this.sandboxModules).forEach(key => {
      const mod = this.sandboxModules[key];
      if (mod) {
        mod.classList.toggle("active", key === gradeKey);
      }
    });
  }
}

window.addEventListener("DOMContentLoaded", () => {
  window.app = new LearningAIApp();
});
