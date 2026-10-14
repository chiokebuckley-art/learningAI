/**
 * 5th Grade Intelligent Agents: 2D Autonomous Robot Sandbox (Kids Activity 3: "Dodge the rocks")
 * - 3 laser eyes (Left -0.6 rad, Middle 0 rad, Right +0.6 rad, length 70px)
 * - Autonomous obstacle avoidance (SEE -> THINK -> MOVE)
 * - Drop 3 rocks to earn the star
 */

class AutonomousAgentSandbox {
  constructor() {
    this.botState = {
      x: 140,
      y: 170,
      h: 0.3,
      rocks: [[340, 120], [360, 230], [220, 260]],
      rays: [1, 1, 1]
    };
    this.botRunning = true;
    this.rockCount = 0;
    this.rayD = [1, 1, 1];
    this.botRaf = null;
    this.frameCounter = 0;

    this.root = document.getElementById("kidsActBot");
    this.renderKids();
  }

  getChipLine() {
    if (this.rockCount >= 3) {
      return "You made its world harder and it still found a way. That is a robot thinking for itself!";
    }
    return "This robot has 3 laser eyes. Drop rocks in front of it and watch what it decides.";
  }

  stopLoop() {
    if (this.botRaf) {
      cancelAnimationFrame(this.botRaf);
      this.botRaf = null;
    }
  }

  startBotLoop() {
    this.stopLoop();
    const tick = () => {
      const c = document.getElementById("botCanvas");
      if (c && window.app?.screen === "bot") {
        const ctx = c.getContext("2d");
        const W = c.width;
        const H = c.height;
        const b = this.botState;
        const angles = [-0.6, 0, 0.6];
        const L = 70;

        const hit = (px, py) => {
          if (px < 16 || px > W - 16 || py < 16 || py > H - 16) return true;
          return b.rocks.some(([rx, ry]) => Math.hypot(px - rx, py - ry) < 20);
        };

        const rays = angles.map(a => {
          for (let d = 6; d <= L; d += 4) {
            if (hit(b.x + Math.cos(b.h + a) * d, b.y + Math.sin(b.h + a) * d)) {
              return d / L;
            }
          }
          return 1;
        });
        b.rays = rays;

        if (this.botRunning) {
          if (rays[1] < 0.65 || rays[0] < 0.5) b.h += 0.09;
          else if (rays[2] < 0.5) b.h -= 0.09;

          const nx = b.x + Math.cos(b.h) * 1.7;
          const ny = b.y + Math.sin(b.h) * 1.7;
          if (!hit(nx, ny)) {
            b.x = nx;
            b.y = ny;
          } else {
            b.h += 0.35;
          }
        }

        // Draw background & grid
        ctx.fillStyle = "#E8F4FF";
        ctx.fillRect(0, 0, W, H);
        ctx.strokeStyle = "#D2E6F7";
        ctx.lineWidth = 1;
        for (let x = 0; x < W; x += 35) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, H);
          ctx.stroke();
        }
        for (let y = 0; y < H; y += 35) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(W, y);
          ctx.stroke();
        }

        // Draw rocks
        ctx.font = "28px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        for (const [rx, ry] of b.rocks) {
          ctx.fillText("🪨", rx, ry);
        }

        // Draw laser rays
        angles.forEach((a, idx) => {
          const d = rays[idx] * L;
          ctx.strokeStyle = rays[idx] < 0.6 ? "#FF6B6B" : "#4ADE80";
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(b.x, b.y);
          ctx.lineTo(b.x + Math.cos(b.h + a) * d, b.y + Math.sin(b.h + a) * d);
          ctx.stroke();
        });

        // Draw purple robot with 2 eyes
        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.rotate(b.h);
        ctx.fillStyle = "#A78BFA";
        ctx.strokeStyle = "#2B2A4C";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#FFFFFF";
        ctx.beginPath();
        ctx.arc(6, -5, 4, 0, Math.PI * 2);
        ctx.arc(6, 5, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        this.frameCounter++;
        if (this.frameCounter % 5 === 0) {
          this.rayD = [...rays];
          this.updateTelemetryDOM();
        }
      }
      if (window.app?.screen === "bot") {
        this.botRaf = requestAnimationFrame(tick);
      }
    };
    this.botRaf = requestAnimationFrame(tick);
  }

  updateTelemetryDOM() {
    if (!this.root) return;
    const near = Math.min(...this.rayD) < 0.6;
    const stepThink = this.root.querySelector("#kidsBotStepThink");
    const stepMove = this.root.querySelector("#kidsBotStepMove");
    if (stepThink) {
      stepThink.style.background = near ? "#2B2A4C" : "#FFF8EC";
      stepThink.style.color = near ? "#FFFFFF" : "#2B2A4C";
    }
    if (stepMove) {
      stepMove.style.background = near ? "#2B2A4C" : "#FFF8EC";
      stepMove.style.color = near ? "#FFFFFF" : "#2B2A4C";
    }

    ["Left", "Middle", "Right"].forEach((name, i) => {
      const d = this.rayD[i] ?? 1;
      const statusEl = this.root.querySelector(`#kidsRayStatus${i}`);
      const fillEl = this.root.querySelector(`#kidsRayFill${i}`);
      if (statusEl) {
        statusEl.textContent = d < 0.5 ? "Close!" : d < 0.85 ? "Something" : "Clear";
      }
      if (fillEl) {
        fillEl.style.width = `${Math.round(d * 100)}%`;
        fillEl.style.background = d < 0.5 ? "#FF6B6B" : "#4ADE80";
      }
    });
  }

  renderKids() {
    if (!this.root) return;
    const near = Math.min(...this.rayD) < 0.6;

    this.root.innerHTML = `
      <div class="kids-two-col">
        <!-- Left card: Tap the blue floor to drop rocks -->
        <div class="kids-card">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;flex-wrap:wrap;gap:8px;">
            <div style="font-family:var(--font-display);font-size:22px;font-weight:800;">🪨 Tap the blue floor to drop rocks!</div>
            <div id="kidsRockCountLabel" style="font-weight:800;font-size:16px;color:#6B6890;">Rocks dropped: ${this.rockCount} / 3</div>
          </div>
          <canvas id="botCanvas" width="560" height="350" style="width:100%;max-width:560px;height:auto;border-radius:20px;border:4px solid #2B2A4C;background:#E8F4FF;cursor:crosshair;display:block;"></canvas>
          <div style="display:flex;gap:10px;margin-top:12px;flex-wrap:wrap;">
            <button type="button" id="btnKidsToggleBot" style="padding:12px 18px;border-radius:16px;border:3px solid #2B2A4C;background:#FFC53D;font-family:var(--font-body);font-size:16px;font-weight:800;color:#2B2A4C;cursor:pointer;box-shadow:0 3px 0 #2B2A4C;">
              ${this.botRunning ? "⏸ Pause robot" : "▶ Wake robot"}
            </button>
            <button type="button" id="btnKidsClearRocks" style="padding:12px 18px;border-radius:16px;border:3px solid #2B2A4C;background:#FFF8EC;font-family:var(--font-body);font-size:16px;font-weight:800;color:#2B2A4C;cursor:pointer;">
              Clear rocks
            </button>
          </div>
        </div>

        <!-- Right card: Inside the robot's head -->
        <div class="kids-card">
          <div style="font-family:var(--font-display);font-size:22px;font-weight:800;margin-bottom:14px;">🧠 Inside the robot's head</div>
          <div style="display:flex;flex-direction:column;gap:12px;margin-bottom:18px;">
            <div style="padding:14px 16px;border-radius:16px;border:3px solid #2B2A4C;background:#2B2A4C;color:#FFFFFF;font-weight:800;font-size:17px;">
              👀 1. SEE — its 3 laser eyes look ahead
            </div>
            <div id="kidsBotStepThink" style="padding:14px 16px;border-radius:16px;border:3px solid #2B2A4C;background:${near ? "#2B2A4C" : "#FFF8EC"};color:${near ? "#FFFFFF" : "#2B2A4C"};font-weight:800;font-size:17px;">
              🧠 2. THINK — "is something close?"
            </div>
            <div id="kidsBotStepMove" style="padding:14px 16px;border-radius:16px;border:3px solid #2B2A4C;background:${near ? "#2B2A4C" : "#FFF8EC"};color:${near ? "#FFFFFF" : "#2B2A4C"};font-weight:800;font-size:17px;">
              🦶 3. MOVE — turn away or keep going
            </div>
          </div>

          <div style="font-weight:800;margin-bottom:8px;">Laser eyes right now:</div>
          ${["Left", "Middle", "Right"].map((name, i) => {
            const d = this.rayD[i] ?? 1;
            return `
              <div style="margin-bottom:10px;">
                <div style="display:flex;justify-content:space-between;font-weight:800;font-size:15px;margin-bottom:4px;">
                  <span>${name} eye</span>
                  <span id="kidsRayStatus${i}">${d < 0.5 ? "Close!" : d < 0.85 ? "Something" : "Clear"}</span>
                </div>
                <div style="height:18px;background:#FFF1CC;border-radius:999px;border:2px solid #2B2A4C;overflow:hidden;">
                  <div id="kidsRayFill${i}" style="width:${Math.round(d * 100)}%;height:100%;background:${d < 0.5 ? "#FF6B6B" : "#4ADE80"};"></div>
                </div>
              </div>
            `;
          }).join("")}
        </div>
      </div>
    `;

    const canvas = this.root.querySelector("#botCanvas");
    canvas?.addEventListener("click", (e) => {
      const r = canvas.getBoundingClientRect();
      const x = (e.clientX - r.left) * (canvas.width / r.width);
      const y = (e.clientY - r.top) * (canvas.height / r.height);
      this.botState.rocks.push([x, y]);
      this.rockCount++;
      const countEl = this.root.querySelector("#kidsRockCountLabel");
      if (countEl) countEl.textContent = `Rocks dropped: ${this.rockCount} / 3`;
      if (this.rockCount >= 3) {
        window.app?.markKidsDone("bot");
        window.app?.updateChipLine(this.getChipLine());
      }
    });

    this.root.querySelector("#btnKidsToggleBot")?.addEventListener("click", () => {
      this.botRunning = !this.botRunning;
      const btn = this.root.querySelector("#btnKidsToggleBot");
      if (btn) btn.textContent = this.botRunning ? "⏸ Pause robot" : "▶ Wake robot";
    });

    this.root.querySelector("#btnKidsClearRocks")?.addEventListener("click", () => {
      this.botState.rocks = [];
      this.rockCount = 0;
      const countEl = this.root.querySelector("#kidsRockCountLabel");
      if (countEl) countEl.textContent = `Rocks dropped: 0 / 3`;
    });
  }
}

window.addEventListener("DOMContentLoaded", () => {
  window.agentSandbox = new AutonomousAgentSandbox();
});
