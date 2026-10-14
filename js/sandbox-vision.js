/**
 * 3rd Grade Pattern Recognition & Teachable Machine Lab (Kids Activity 1: "Teach a robot to see")
 * - Zero cost, 100% on-device image processing & interactive simulation
 * - Live confidence meters & Dataset Bias Simulator (Yellow Pencil vs Blue Pencil experiment)
 */

class VisionLab {
  constructor() {
    // Kids Activity 1 state (matches design_handoff_learningai_kids)
    this.visionItem = "yellow"; // 'yellow' | 'blue' | 'eraser'
    this.biasFixed = false;
    this.biasAlert = false;
    this.confidence = { pencil: 98, eraser: 2 };

    // Optional live webcam support
    this.video = document.getElementById("cameraVideo");
    this.canvas = document.getElementById("cameraOverlay");
    this.ctx = this.canvas ? this.canvas.getContext("2d") : null;
    this.stream = null;
    this.isCameraActive = false;

    this.initKidsDOM();
    this.renderKids();
  }

  initKidsDOM() {
    this.root = document.getElementById("kidsActVision");
  }

  getChipLine() {
    if (this.biasFixed) {
      return "See? When the robot learns from MORE kinds of pencils, it stops making that mistake.";
    }
    if (this.biasAlert) {
      return "Oops! It never learned about blue pencils. Can you teach it?";
    }
    return "Tap a button to show the robot something. It will guess what it sees!";
  }

  testVision(item) {
    this.visionItem = item;
    if (item === "yellow") {
      this.confidence = { pencil: 98, eraser: 2 };
      this.biasAlert = false;
    } else if (item === "blue") {
      if (!this.biasFixed) {
        this.confidence = { pencil: 12, eraser: 88 };
        this.biasAlert = true;
      } else {
        this.confidence = { pencil: 96, eraser: 4 };
        this.biasAlert = false;
      }
    } else if (item === "eraser") {
      this.confidence = { pencil: 3, eraser: 97 };
      this.biasAlert = false;
    }
    this.renderKids();
    window.app?.updateChipLine(this.getChipLine());
  }

  fixBias() {
    this.biasFixed = true;
    this.biasAlert = false;
    this.visionItem = "blue";
    this.confidence = { pencil: 96, eraser: 4 };
    window.app?.markKidsDone("vision");
    this.renderKids();
    window.app?.updateChipLine(this.getChipLine());
  }

  renderKids() {
    if (!this.root) return;
    const itemEmoji = { yellow: "✏️", blue: "🖍️", eraser: "🧼" }[this.visionItem];
    const itemBg = { yellow: "#FFF1CC", blue: "#DCEFFF", eraser: "#FFE1EA" }[this.visionItem];

    this.root.innerHTML = `
      <div class="kids-two-col">
        <!-- Left card: What the robot sees -->
        <div class="kids-card">
          <div style="font-family:var(--font-display);font-size:22px;font-weight:800;margin-bottom:12px;">📷 What the robot sees</div>
          <div style="height:260px;border-radius:20px;background:${itemBg};border:4px solid #2B2A4C;display:flex;align-items:center;justify-content:center;font-size:120px;position:relative;transition:background .2s;">
            <span style="filter:drop-shadow(0 6px 0 rgba(0,0,0,0.08));">${itemEmoji}</span>
            <div style="position:absolute;inset:18px;border:3px dashed rgba(43,42,76,0.35);border-radius:14px;pointer-events:none;"></div>
          </div>
          <div style="font-weight:800;margin:16px 0 10px;font-size:16px;color:#6B6890;">Tap to show the robot:</div>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;">
            <button type="button" data-vision-item="yellow" style="padding:14px 10px;border-radius:16px;border:3px solid #2B2A4C;background:${this.visionItem === "yellow" ? "#FFC53D" : "#FFF8EC"};font-family:var(--font-body);font-size:16px;font-weight:800;color:#2B2A4C;cursor:pointer;box-shadow:0 3px 0 #2B2A4C;">
              ✏️ Yellow pencil
            </button>
            <button type="button" data-vision-item="blue" style="padding:14px 10px;border-radius:16px;border:3px solid #2B2A4C;background:${this.visionItem === "blue" ? "#4FB3FF" : "#FFF8EC"};font-family:var(--font-body);font-size:16px;font-weight:800;color:#2B2A4C;cursor:pointer;box-shadow:0 3px 0 #2B2A4C;">
              🖍️ Blue pencil
            </button>
            <button type="button" data-vision-item="eraser" style="padding:14px 10px;border-radius:16px;border:3px solid #2B2A4C;background:${this.visionItem === "eraser" ? "#FFB3C6" : "#FFF8EC"};font-family:var(--font-body);font-size:16px;font-weight:800;color:#2B2A4C;cursor:pointer;box-shadow:0 3px 0 #2B2A4C;">
              🧼 Pink eraser
            </button>
          </div>
        </div>

        <!-- Right card: The robot's guess -->
        <div class="kids-card">
          <div style="font-family:var(--font-display);font-size:22px;font-weight:800;margin-bottom:14px;">🤔 The robot's guess</div>

          <div style="margin-bottom:16px;">
            <div style="display:flex;justify-content:space-between;font-weight:800;font-size:18px;margin-bottom:6px;">
              <span>✏️ "It's a PENCIL!"</span>
              <span>${this.confidence.pencil}%</span>
            </div>
            <div style="height:26px;background:#FFF1CC;border-radius:999px;border:3px solid #2B2A4C;overflow:hidden;">
              <div style="width:${this.confidence.pencil}%;height:100%;background:#FFC53D;transition:width .35s;"></div>
            </div>
          </div>

          <div style="margin-bottom:20px;">
            <div style="display:flex;justify-content:space-between;font-weight:800;font-size:18px;margin-bottom:6px;">
              <span>🧼 "It's an ERASER!"</span>
              <span>${this.confidence.eraser}%</span>
            </div>
            <div style="height:26px;background:#FFE1EA;border-radius:999px;border:3px solid #2B2A4C;overflow:hidden;">
              <div style="width:${this.confidence.eraser}%;height:100%;background:#FF6B6B;transition:width .35s;"></div>
            </div>
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;">
            <div style="background:#FFF8EC;border:2px solid #2B2A4C;border-radius:16px;padding:12px;text-align:center;">
              <div style="font-size:28px;">✏️</div>
              <div style="font-family:var(--font-display);font-size:26px;font-weight:800;">${this.biasFixed ? 40 : 20}</div>
              <div style="font-size:14px;font-weight:700;color:#6B6890;">pencil pictures (${this.biasFixed ? "yellow + blue" : "all yellow"})</div>
            </div>
            <div style="background:#FFF8EC;border:2px solid #2B2A4C;border-radius:16px;padding:12px;text-align:center;">
              <div style="font-size:28px;">🧼</div>
              <div style="font-family:var(--font-display);font-size:26px;font-weight:800;">20</div>
              <div style="font-size:14px;font-weight:700;color:#6B6890;">eraser pictures (all pink)</div>
            </div>
          </div>

          ${this.biasAlert ? `
            <div style="background:#FFE8E8;border:3px solid #FF6B6B;border-radius:18px;padding:16px;animation:popIn .3s ease-out;">
              <div style="font-family:var(--font-display);font-size:20px;font-weight:800;margin-bottom:6px;">😮 Uh-oh! The robot is confused.</div>
              <div style="font-size:16px;font-weight:700;margin-bottom:12px;">
                It only ever saw <b>yellow</b> pencils, so it thinks a blue pencil isn't a pencil. Robots only know what we show them!
              </div>
              <button type="button" id="btnKidsFixBias" style="width:100%;padding:14px;border-radius:16px;border:3px solid #2B2A4C;background:#4ADE80;color:#2B2A4C;font-family:var(--font-display);font-size:20px;font-weight:800;cursor:pointer;box-shadow:0 4px 0 #2B2A4C;">
                💡 Teach it 20 blue pencils
              </button>
            </div>
          ` : ""}

          ${this.biasFixed ? `
            <div style="background:#E3F9EA;border:3px solid #2B2A4C;border-radius:18px;padding:16px;">
              <div style="font-family:var(--font-display);font-size:20px;font-weight:800;">🎉 Now the robot knows pencils come in lots of colors. More kinds of examples = a fairer, smarter robot!</div>
            </div>
          ` : ""}
        </div>
      </div>
    `;

    this.root.querySelectorAll("[data-vision-item]").forEach(btn => {
      btn.addEventListener("click", () => this.testVision(btn.dataset.visionItem));
    });
    this.root.querySelector("#btnKidsFixBias")?.addEventListener("click", () => this.fixBias());
  }
}

window.addEventListener("DOMContentLoaded", () => {
  window.visionLab = new VisionLab();
});
