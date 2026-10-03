/**
 * 4th Grade Coding: Visual Logic & Structures (Blockly Maze Rover)
 * - Drag/click puzzle blocks to construct computational programs
 * - If/Then conditional branch execution
 * - Loop constructs
 * - Step-by-step visual maze animation
 */

class BlocklyMazeRover {
  constructor() {
    this.canvas = document.getElementById("mazeCanvas");
    this.ctx = this.canvas ? this.canvas.getContext("2d") : null;
    this.gridSize = 6;
    this.cellSize = 48;

    // Grid states: 0 = path, 1 = obstacle, 2 = star goal
    this.grid = [
      [0, 0, 1, 0, 0, 2],
      [1, 0, 1, 0, 1, 0],
      [0, 0, 0, 0, 1, 0],
      [0, 1, 1, 0, 0, 0],
      [0, 0, 0, 1, 1, 0],
      [0, 1, 0, 0, 0, 0]
    ];

    this.rover = { x: 0, y: 5, dir: 0 }; // dir: 0 = North, 1 = East, 2 = South, 3 = West
    this.program = [];
    this.isRunning = false;
    this.stepIndex = 0;

    this.initDOM();
    this.bindEvents();
    this.renderMaze();
  }

  initDOM() {
    this.workspace = document.getElementById("blockWorkspace");
    this.btnRun = document.getElementById("btnRunMazeProgram");
    this.btnReset = document.getElementById("btnResetMaze");
    this.btnClear = document.getElementById("btnClearBlocks");
    this.statusText = document.getElementById("mazeStatusText");
  }

  bindEvents() {
    // Palette block click handlers
    document.querySelectorAll(".code-puzzle-block[data-action]").forEach(block => {
      block.addEventListener("click", () => {
        const action = block.dataset.action;
        this.addBlockToWorkspace(action, block.textContent.trim(), block.className);
      });
    });

    this.btnRun?.addEventListener("click", () => this.runProgram());
    this.btnReset?.addEventListener("click", () => this.resetRover());
    this.btnClear?.addEventListener("click", () => this.clearWorkspace());
  }

  addBlockToWorkspace(action, label, classes) {
    if (!this.workspace) return;
    const blockEl = document.createElement("div");
    blockEl.className = classes;
    blockEl.style.cursor = "pointer";
    blockEl.innerHTML = `<span>${label}</span> <span style="margin-left:auto; opacity:0.6; font-size:11px;">✕</span>`;
    blockEl.addEventListener("click", () => {
      blockEl.remove();
      this.rebuildProgramFromDOM();
    });
    this.workspace.appendChild(blockEl);
    this.rebuildProgramFromDOM();
  }

  rebuildProgramFromDOM() {
    this.program = [];
    if (!this.workspace) return;
    const blocks = this.workspace.querySelectorAll(".code-puzzle-block");
    blocks.forEach(b => {
      if (b.dataset.action) this.program.push(b.dataset.action);
    });
  }

  clearWorkspace() {
    if (this.workspace) this.workspace.innerHTML = "";
    this.program = [];
    this.resetRover();
  }

  resetRover() {
    this.rover = { x: 0, y: 5, dir: 0 };
    this.isRunning = false;
    this.stepIndex = 0;
    if (this.statusText) this.statusText.textContent = "Ready to execute program.";
    this.renderMaze();
  }

  async runProgram() {
    if (this.isRunning) return;
    this.rebuildProgramFromDOM();
    if (this.program.length === 0) {
      if (this.statusText) this.statusText.textContent = "Add some blocks to the workspace first!";
      return;
    }

    this.isRunning = true;
    this.stepIndex = 0;
    if (this.statusText) this.statusText.textContent = "Executing visual program...";

    for (let i = 0; i < this.program.length; i++) {
      if (!this.isRunning) break;
      const cmd = this.program[i];
      await this.executeCommand(cmd);
      this.renderMaze();
      await new Promise(r => setTimeout(r, 450));

      // Check win condition
      if (this.grid[this.rover.y][this.rover.x] === 2) {
        if (this.statusText) this.statusText.textContent = "🎉 Goal reached! Star collected with intelligent computational logic!";
        this.isRunning = false;
        return;
      }
    }

    if (this.isRunning) {
      if (this.grid[this.rover.y][this.rover.x] === 2) {
        if (this.statusText) this.statusText.textContent = "🎉 Goal reached!";
      } else {
        if (this.statusText) this.statusText.textContent = "Program finished. Goal not reached yet. Try adjusting your If/Then logic!";
      }
    }
    this.isRunning = false;
  }

  async executeCommand(cmd) {
    const forwardDeltas = [
      { dx: 0, dy: -1 }, // North
      { dx: 1, dy: 0 },  // East
      { dx: 0, dy: 1 },  // South
      { dx: -1, dy: 0 }  // West
    ];

    if (cmd === "forward") {
      const delta = forwardDeltas[this.rover.dir];
      const nx = this.rover.x + delta.dx;
      const ny = this.rover.y + delta.dy;
      if (nx >= 0 && nx < this.gridSize && ny >= 0 && ny < this.gridSize && this.grid[ny][nx] !== 1) {
        this.rover.x = nx;
        this.rover.y = ny;
      } else {
        if (this.statusText) this.statusText.textContent = "⚠️ Bumped into a wall! Sensor triggered.";
      }
    } else if (cmd === "turn_left") {
      this.rover.dir = (this.rover.dir + 3) % 4;
    } else if (cmd === "turn_right") {
      this.rover.dir = (this.rover.dir + 1) % 4;
    } else if (cmd === "if_obstacle_turn") {
      // Check forward obstacle
      const delta = forwardDeltas[this.rover.dir];
      const nx = this.rover.x + delta.dx;
      const ny = this.rover.y + delta.dy;
      const isBlocked = nx < 0 || nx >= this.gridSize || ny < 0 || ny >= this.gridSize || this.grid[ny][nx] === 1;
      if (isBlocked) {
        this.rover.dir = (this.rover.dir + 1) % 4; // Turn right
        if (this.statusText) this.statusText.textContent = "🤖 Condition TRUE: Obstacle detected -> turning right!";
      }
    }
  }

  renderMaze() {
    if (!this.ctx || !this.canvas) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let r = 0; r < this.gridSize; r++) {
      for (let c = 0; c < this.gridSize; c++) {
        const x = c * this.cellSize;
        const y = r * this.cellSize;
        const cellType = this.grid[r][c];

        // Draw tile
        this.ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
        this.ctx.strokeRect(x, y, this.cellSize, this.cellSize);

        if (cellType === 1) {
          // Obstacle rock
          this.ctx.fillStyle = "#1e293b";
          this.ctx.fillRect(x + 4, y + 4, this.cellSize - 8, this.cellSize - 8);
          this.ctx.fillStyle = "#ef4444";
          this.ctx.font = "16px sans-serif";
          this.ctx.fillText("🧱", x + 14, y + 30);
        } else if (cellType === 2) {
          // Star Goal
          this.ctx.fillStyle = "rgba(255, 179, 0, 0.25)";
          this.ctx.fillRect(x + 2, y + 2, this.cellSize - 4, this.cellSize - 4);
          this.ctx.fillStyle = "#ffb300";
          this.ctx.font = "20px sans-serif";
          this.ctx.fillText("⭐", x + 13, y + 33);
        }
      }
    }

    // Draw Rover Sprite
    const rx = this.rover.x * this.cellSize + this.cellSize / 2;
    const ry = this.rover.y * this.cellSize + this.cellSize / 2;

    this.ctx.save();
    this.ctx.translate(rx, ry);
    this.ctx.rotate((this.rover.dir * 90 * Math.PI) / 180);

    // Rover chassis
    this.ctx.fillStyle = "#00d2ff";
    this.ctx.beginPath();
    this.ctx.arc(0, 0, 16, 0, Math.PI * 2);
    this.ctx.fill();

    // Direction indicator arrow
    this.ctx.fillStyle = "#ffffff";
    this.ctx.beginPath();
    this.ctx.moveTo(0, -12);
    this.ctx.lineTo(-8, 6);
    this.ctx.lineTo(8, 6);
    this.ctx.closePath();
    this.ctx.fill();

    this.ctx.restore();
  }
}

window.addEventListener("DOMContentLoaded", () => {
  window.blocklyMaze = new BlocklyMazeRover();
});
