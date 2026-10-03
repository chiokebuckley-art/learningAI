/**
 * 5th Grade Intelligent Agents: 2D Autonomous Robot Sandbox
 * - Input -> Processing -> Output loop
 * - Raycasting distance sensors (LIDAR)
 * - Autonomous obstacle avoidance
 * - Dynamic obstacle placement
 */

class AutonomousAgentSandbox {
  constructor() {
    this.canvas = document.getElementById("robotCanvas");
    this.ctx = this.canvas ? this.canvas.getContext("2d") : null;

    this.bot = {
      x: 100,
      y: 100,
      angle: 0.5,
      speed: 2.2,
      radius: 18,
      turnRate: 0.05
    };

    this.sensors = [
      { angleOffset: -0.6, distance: 100, maxRange: 120, label: "Left" },
      { angleOffset: 0.0, distance: 100, maxRange: 140, label: "Center" },
      { angleOffset: 0.6, distance: 100, maxRange: 120, label: "Right" }
    ];

    this.obstacles = [
      { x: 180, y: 80, width: 40, height: 120 },
      { x: 300, y: 160, width: 140, height: 35 },
      { x: 160, y: 280, width: 80, height: 80 },
      { x: 420, y: 60, width: 40, height: 140 }
    ];

    this.isAutonomous = true;
    this.animationId = null;

    this.initDOM();
    this.bindEvents();
    this.startSimulation();
  }

  initDOM() {
    this.btnToggleAuto = document.getElementById("btnToggleAgentAuto");
    this.btnClearObs = document.getElementById("btnClearAgentObs");
    this.btnResetBot = document.getElementById("btnResetAgentBot");
    this.stepInput = document.getElementById("loopStepInput");
    this.stepProcess = document.getElementById("loopStepProcess");
    this.stepOutput = document.getElementById("loopStepOutput");
    this.sensorReadout = document.getElementById("sensorTelemetryReadout");
  }

  bindEvents() {
    this.btnToggleAuto?.addEventListener("click", () => {
      this.isAutonomous = !this.isAutonomous;
      if (this.btnToggleAuto) {
        this.btnToggleAuto.textContent = this.isAutonomous ? "⏸ Pause Autonomy" : "▶ Start Autonomy";
        this.btnToggleAuto.classList.toggle("btn-pill-amber", !this.isAutonomous);
      }
    });

    this.btnClearObs?.addEventListener("click", () => {
      this.obstacles = [];
    });

    this.btnResetBot?.addEventListener("click", () => {
      this.bot.x = 60;
      this.bot.y = 60;
      this.bot.angle = 0.5;
    });

    this.canvas?.addEventListener("click", (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      // Add custom obstacle
      this.obstacles.push({ x: clickX - 25, y: clickY - 25, width: 50, height: 50 });
    });
  }

  startSimulation() {
    const loop = () => {
      this.updateSensors();
      if (this.isAutonomous) {
        this.processAutonomousLogic();
      }
      this.render();
      this.animationId = requestAnimationFrame(loop);
    };
    this.animationId = requestAnimationFrame(loop);
  }

  updateSensors() {
    const w = this.canvas.width;
    const h = this.canvas.height;

    // Raycast for each sensor
    this.sensors.forEach(sensor => {
      const rayAngle = this.bot.angle + sensor.angleOffset;
      let minHitDist = sensor.maxRange;

      // Check canvas bounds
      for (let dist = 1; dist < sensor.maxRange; dist += 3) {
        const testX = this.bot.x + Math.cos(rayAngle) * dist;
        const testY = this.bot.y + Math.sin(rayAngle) * dist;

        if (testX <= 0 || testX >= w || testY <= 0 || testY >= h) {
          minHitDist = dist;
          break;
        }

        // Check obstacles
        const inObstacle = this.obstacles.some(obs =>
          testX >= obs.x && testX <= obs.x + obs.width &&
          testY >= obs.y && testY <= obs.y + obs.height
        );

        if (inObstacle) {
          minHitDist = dist;
          break;
        }
      }
      sensor.distance = minHitDist;
    });

    // Update telemetry HUD
    if (this.sensorReadout) {
      this.sensorReadout.innerHTML = `
        <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
          <span>L: ${Math.round(this.sensors[0].distance)}px</span>
          <span style="color:#00d2ff; font-weight:700;">C: ${Math.round(this.sensors[1].distance)}px</span>
          <span>R: ${Math.round(this.sensors[2].distance)}px</span>
        </div>
      `;
    }
  }

  processAutonomousLogic() {
    const leftDist = this.sensors[0].distance;
    const centerDist = this.sensors[1].distance;
    const rightDist = this.sensors[2].distance;

    // Cycle loop indicators visually
    this.stepInput?.classList.add("active");
    this.stepProcess?.classList.add("active");
    this.stepOutput?.classList.add("active");

    // Autonomous Decision Matrix:
    // If center path blocked, turn away from whichever side is closer to an obstacle
    if (centerDist < 45 || leftDist < 30 || rightDist < 30) {
      if (leftDist < rightDist) {
        this.bot.angle += this.bot.turnRate * 1.8; // Turn right
      } else {
        this.bot.angle -= this.bot.turnRate * 1.8; // Turn left
      }
    } else {
      // Clear path: move forward with gentle natural wander
      this.bot.angle += (Math.random() - 0.5) * 0.04;
    }

    // Move forward
    const nextX = this.bot.x + Math.cos(this.bot.angle) * this.bot.speed;
    const nextY = this.bot.y + Math.sin(this.bot.angle) * this.bot.speed;

    // Boundary check
    if (nextX > this.bot.radius && nextX < this.canvas.width - this.bot.radius) {
      this.bot.x = nextX;
    } else {
      this.bot.angle += Math.PI * 0.5;
    }

    if (nextY > this.bot.radius && nextY < this.canvas.height - this.bot.radius) {
      this.bot.y = nextY;
    } else {
      this.bot.angle += Math.PI * 0.5;
    }
  }

  render() {
    if (!this.ctx || !this.canvas) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw Obstacles
    this.ctx.fillStyle = "rgba(239, 68, 68, 0.25)";
    this.ctx.strokeStyle = "#ef4444";
    this.ctx.lineWidth = 1.5;
    this.obstacles.forEach(obs => {
      this.ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
      this.ctx.strokeRect(obs.x, obs.y, obs.width, obs.height);
    });

    // Draw Sensor Rays
    this.sensors.forEach(sensor => {
      const rayAngle = this.bot.angle + sensor.angleOffset;
      const hitX = this.bot.x + Math.cos(rayAngle) * sensor.distance;
      const hitY = this.bot.y + Math.sin(rayAngle) * sensor.distance;

      this.ctx.beginPath();
      this.ctx.moveTo(this.bot.x, this.bot.y);
      this.ctx.lineTo(hitX, hitY);

      if (sensor.distance < 45) {
        this.ctx.strokeStyle = "#ef4444"; // Danger red
        this.ctx.lineWidth = 2;
      } else {
        this.ctx.strokeStyle = "rgba(0, 210, 255, 0.4)";
        this.ctx.lineWidth = 1;
      }
      this.ctx.stroke();

      // Hit point spark
      this.ctx.fillStyle = sensor.distance < 45 ? "#ef4444" : "#00d2ff";
      this.ctx.beginPath();
      this.ctx.arc(hitX, hitY, 3.5, 0, Math.PI * 2);
      this.ctx.fill();
    });

    // Draw Robot Body
    this.ctx.save();
    this.ctx.translate(this.bot.x, this.bot.y);
    this.ctx.rotate(this.bot.angle);

    // Main body circle
    this.ctx.fillStyle = "#ff7043";
    this.ctx.beginPath();
    this.ctx.arc(0, 0, this.bot.radius, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.strokeStyle = "#ffffff";
    this.ctx.lineWidth = 2;
    this.ctx.stroke();

    // Wheels
    this.ctx.fillStyle = "#00d2ff";
    this.ctx.fillRect(-this.bot.radius + 2, -this.bot.radius - 3, this.bot.radius * 2 - 4, 4);
    this.ctx.fillRect(-this.bot.radius + 2, this.bot.radius - 1, this.bot.radius * 2 - 4, 4);

    // Heading nose
    this.ctx.fillStyle = "#ffb300";
    this.ctx.beginPath();
    this.ctx.arc(this.bot.radius - 2, 0, 5, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.restore();
  }
}

window.addEventListener("DOMContentLoaded", () => {
  window.agentSandbox = new AutonomousAgentSandbox();
});
