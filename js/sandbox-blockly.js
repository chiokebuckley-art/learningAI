/**
 * 4th Grade Coding: Visual Logic & Structures (Kids Activity 2: "Build a robot brain")
 * - Snap blocks together to program the rover brain
 * - 6x6 grid (288x288 canvas), rocks at (3,0), (3,1), (1,3), star at (2,4)
 */

const BLOCK_INFO = {
  fwd: { label: "🚀 Move forward", color: "#4FB3FF" },
  left: { label: "↺ Turn left", color: "#FFC53D" },
  right: { label: "↻ Turn right", color: "#FFC53D" },
  if: { label: "❓ IF rock ahead → turn right", color: "#A78BFA" }
};

class BlocklyMazeRover {
  constructor() {
    this.program = ["fwd", "if", "fwd"];
    this.rover = { x: 0, y: 0, d: 0 }; // d: 0=right, 1=down, 2=left, 3=up
    this.roverMsg = "";
    this.roverWon = false;
    this.roverTimer = null;

    this.ROCKS = [[3, 0], [3, 1], [1, 3]];
    this.STAR = [2, 4];
    this.DIRS = [[1, 0], [0, 1], [-1, 0], [0, -1]];

    this.root = document.getElementById("kidsActRover");
    this.renderKids();
  }

  getChipLine() {
    if (this.roverWon) {
      return "Amazing! You programmed a robot brain. Try making a trickier one!";
    }
    return "A robot only does exactly what its blocks say. Build the brain, then press GO.";
  }

  stopTimer() {
    if (this.roverTimer) {
      clearInterval(this.roverTimer);
      this.roverTimer = null;
    }
  }

  addBlock(b) {
    if (this.program.length < 10) {
      this.program = [...this.program, b];
      this.renderKids();
    }
  }

  removeBlock(idx) {
    this.program = this.program.filter((_, i) => i !== idx);
    this.renderKids();
  }

  resetRover(clear = false) {
    this.stopTimer();
    this.rover = { x: 0, y: 0, d: 0 };
    this.roverMsg = "";
    this.roverWon = false;
    if (clear) {
      this.program = [];
    }
    this.renderKids();
    window.app?.updateChipLine(this.getChipLine());
  }

  runRover() {
    this.stopTimer();
    this.rover = { x: 0, y: 0, d: 0 };
    this.roverMsg = "";
    this.roverWon = false;

    if (this.program.length === 0) {
      this.roverMsg = "Add some blocks first!";
      this.renderKids();
      return;
    }

    this.renderKids();
    const isRock = (x, y) => this.ROCKS.some(([rx, ry]) => rx === x && ry === y);
    let i = 0;

    this.roverTimer = setInterval(() => {
      const r = { ...this.rover };
      const b = this.program[i % this.program.length];
      i++;

      if (b === "fwd") {
        const [dx, dy] = this.DIRS[r.d];
        const nx = r.x + dx;
        const ny = r.y + dy;
        if (nx >= 0 && nx < 6 && ny >= 0 && ny < 6 && !isRock(nx, ny)) {
          r.x = nx;
          r.y = ny;
        }
      } else if (b === "left") {
        r.d = (r.d + 3) % 4;
      } else if (b === "right") {
        r.d = (r.d + 1) % 4;
      } else if (b === "if") {
        const [dx, dy] = this.DIRS[r.d];
        const nx = r.x + dx;
        const ny = r.y + dy;
        if (nx < 0 || nx >= 6 || ny < 0 || ny >= 6 || isRock(nx, ny)) {
          r.d = (r.d + 1) % 4;
        }
      }

      this.rover = r;

      if (r.x === this.STAR[0] && r.y === this.STAR[1]) {
        this.stopTimer();
        this.roverWon = true;
        this.roverMsg = "⭐ You did it! The robot reached the star!";
        window.app?.markKidsDone("rover");
        this.renderKids();
        window.app?.updateChipLine(this.getChipLine());
      } else if (i > 30) {
        this.stopTimer();
        this.roverMsg = "Hmm, the robot got lost. Try different blocks!";
        this.renderKids();
      } else {
        this.drawRoverCanvas();
      }
    }, 450);
  }

  drawRoverCanvas() {
    const c = document.getElementById("roverCanvas");
    if (!c) return;
    const ctx = c.getContext("2d");
    const S = 48;
    ctx.clearRect(0, 0, 288, 288);

    for (let y = 0; y < 6; y++) {
      for (let x = 0; x < 6; x++) {
        ctx.fillStyle = (x + y) % 2 === 0 ? "#E8F4FF" : "#DDEEFF";
        ctx.fillRect(x * S, y * S, S, S);
      }
    }

    ctx.font = "28px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (const [rx, ry] of this.ROCKS) {
      ctx.fillText("🪨", rx * S + S / 2, ry * S + S / 2);
    }
    ctx.fillText("⭐", this.STAR[0] * S + S / 2, this.STAR[1] * S + S / 2);

    const { x, y, d } = this.rover;
    ctx.save();
    ctx.translate(x * S + S / 2, y * S + S / 2);
    ctx.rotate((d * Math.PI) / 2);
    ctx.fillStyle = "#4FB3FF";
    ctx.strokeStyle = "#2B2A4C";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.moveTo(12, 0);
    ctx.lineTo(-6, -8);
    ctx.lineTo(-6, 8);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  renderKids() {
    if (!this.root) return;

    this.root.innerHTML = `
      <div class="kids-two-col">
        <!-- Left card: Pick blocks & Robot's brain -->
        <div class="kids-card">
          <div style="font-family:var(--font-display);font-size:22px;font-weight:800;margin-bottom:6px;">🧩 1. Tap a block to add it</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:20px;">
            ${Object.entries(BLOCK_INFO).map(([k, info]) => `
              <button type="button" data-add-block="${k}" style="padding:14px 12px;border-radius:16px;border:3px solid #2B2A4C;background:${info.color};color:#2B2A4C;font-family:var(--font-body);font-size:16px;font-weight:800;cursor:pointer;box-shadow:0 4px 0 #2B2A4C;text-align:left;">
                + ${info.label}
              </button>
            `).join("")}
          </div>

          <div style="font-family:var(--font-display);font-size:22px;font-weight:800;margin-bottom:8px;">🧠 2. The robot's brain (repeats forever)</div>
          <div style="background:#FFF8EC;border:3px dashed #2B2A4C;border-radius:18px;padding:12px;min-height:170px;margin-bottom:14px;display:flex;flex-direction:column;gap:8px;">
            <div style="padding:10px 14px;border-radius:12px;background:#4ADE80;border:2px solid #2B2A4C;font-weight:800;">▶ When I press GO</div>
            ${this.program.length === 0 ? `<div style="padding:18px;text-align:center;color:#6B6890;font-weight:700;">Your brain is empty! Add some blocks above.</div>` : ""}
            ${this.program.map((b, i) => `
              <button type="button" data-remove-block="${i}" style="padding:10px 14px;border-radius:12px;background:${BLOCK_INFO[b].color};border:2px solid #2B2A4C;font-family:var(--font-body);font-size:16px;font-weight:800;color:#2B2A4C;cursor:pointer;display:flex;justify-content:space-between;align-items:center;">
                <span>${BLOCK_INFO[b].label}</span>
                <span style="opacity:0.65;">✕</span>
              </button>
            `).join("")}
          </div>

          <div style="display:flex;gap:10px;flex-wrap:wrap;">
            <button type="button" id="btnKidsRoverGo" style="flex:1;padding:14px 20px;border-radius:16px;border:3px solid #2B2A4C;background:#4ADE80;color:#2B2A4C;font-family:var(--font-display);font-size:22px;font-weight:800;cursor:pointer;box-shadow:0 4px 0 #2B2A4C;">▶ GO!</button>
            <button type="button" id="btnKidsRoverReset" style="padding:14px 18px;border-radius:16px;border:3px solid #2B2A4C;background:#FFC53D;color:#2B2A4C;font-family:var(--font-body);font-size:16px;font-weight:800;cursor:pointer;box-shadow:0 4px 0 #2B2A4C;">🔄 Start over</button>
            <button type="button" id="btnKidsRoverClear" style="padding:14px 18px;border-radius:16px;border:3px solid #2B2A4C;background:#FFF8EC;color:#2B2A4C;font-family:var(--font-body);font-size:16px;font-weight:800;cursor:pointer;">Clear blocks</button>
          </div>
        </div>

        <!-- Right card: Watch the robot go -->
        <div class="kids-card" style="display:flex;flex-direction:column;align-items:center;">
          <div style="font-family:var(--font-display);font-size:22px;font-weight:800;margin-bottom:12px;align-self:flex-start;">🗺️ 3. Watch the robot go</div>
          <canvas id="roverCanvas" width="288" height="288" style="border-radius:20px;border:4px solid #2B2A4C;background:#E8F4FF;"></canvas>
          <div style="margin-top:12px;font-size:16px;font-weight:800;color:#6B6890;">🔵 Robot · 🪨 Rock · ⭐ Goal</div>
          ${this.roverMsg ? `
            <div style="margin-top:12px;padding:12px 18px;border-radius:16px;background:${this.roverWon ? "#E3F9EA" : "#FFE8E8"};border:3px solid #2B2A4C;font-family:var(--font-display);font-size:20px;font-weight:800;text-align:center;">
              ${this.roverMsg}
            </div>
          ` : ""}
        </div>
      </div>
    `;

    this.root.querySelectorAll("[data-add-block]").forEach(btn => {
      btn.addEventListener("click", () => this.addBlock(btn.dataset.addBlock));
    });
    this.root.querySelectorAll("[data-remove-block]").forEach(btn => {
      btn.addEventListener("click", () => this.removeBlock(Number(btn.dataset.removeBlock)));
    });
    this.root.querySelector("#btnKidsRoverGo")?.addEventListener("click", () => this.runRover());
    this.root.querySelector("#btnKidsRoverReset")?.addEventListener("click", () => this.resetRover(false));
    this.root.querySelector("#btnKidsRoverClear")?.addEventListener("click", () => this.resetRover(true));

    this.drawRoverCanvas();
  }
}

window.addEventListener("DOMContentLoaded", () => {
  window.blocklyMaze = new BlocklyMazeRover();
});
