/**
 * Ages 16-18 Capstone: Generative AI, Transformers & Local Offline Models
 * - Live BPE Tokenizer with color-coded token IDs
 * - Multi-Head Self-Attention matrix & weight arcs
 * - Parameters, Quantization & VRAM Calculator
 * - Offline Ollama / LM Studio local runner guide & live tester
 */

class TransformerCapstoneLab {
  constructor() {
    this.inputText = "Local Generative AI is here.";
    this.tokens = [];
    this.initDOM();
    this.bindEvents();
    this.tokenize(this.inputText);
    this.updateVramCalculator();
  }

  initDOM() {
    this.tokenizerInput = document.getElementById("tokenizerTextInput");
    this.chipsContainer = document.getElementById("tokenChipsContainer");
    this.tokenCountDisplay = document.getElementById("tokenCountVal");
    this.attentionCanvas = document.getElementById("attentionMatrixCanvas");
    this.ctx = this.attentionCanvas ? this.attentionCanvas.getContext("2d") : null;

    // VRAM controls
    this.paramSelect = document.getElementById("vramParamSelect");
    this.quantSelect = document.getElementById("vramQuantSelect");
    this.vramResultDisplay = document.getElementById("vramCalcResult");

    // Local Ollama test
    this.btnTestOllama = document.getElementById("btnTestLocalOllama");
    this.ollamaStatusDisplay = document.getElementById("localOllamaStatus");
  }

  bindEvents() {
    this.tokenizerInput?.addEventListener("input", (e) => {
      this.tokenize(e.target.value);
    });

    this.paramSelect?.addEventListener("change", () => this.updateVramCalculator());
    this.quantSelect?.addEventListener("change", () => this.updateVramCalculator());

    this.btnTestOllama?.addEventListener("click", () => this.testLocalOllamaEndpoint());
  }

  tokenize(text) {
    this.inputText = text || "Local Generative AI is here.";
    // Simple BPE emulation splitting words/subwords with consistent hashing
    const words = this.inputText.match(/[\w']+|[.,!?;:]|\s+/g) || [];
    this.tokens = [];

    const colors = ["#38bdf8", "#fbbf24", "#f472b6", "#4ade80", "#a78bfa", "#fb923c"];

    words.forEach((w, idx) => {
      if (w.trim().length === 0) return; // skip pure whitespace
      // Hash string to deterministic integer ID
      let hash = 0;
      for (let i = 0; i < w.length; i++) {
        hash = (hash << 5) - hash + w.charCodeAt(i);
        hash |= 0;
      }
      const tokenId = Math.abs(hash % 98765) + 100;
      const color = colors[idx % colors.length];
      this.tokens.push({ text: w, id: tokenId, color: color });
    });

    this.renderTokenChips();
    this.renderAttentionGraph();
  }

  renderTokenChips() {
    if (!this.chipsContainer) return;
    this.chipsContainer.innerHTML = "";
    this.tokens.forEach((t, idx) => {
      const chip = document.createElement("span");
      chip.className = "token-chip";
      chip.style.background = `${t.color}22`;
      chip.style.border = `1px solid ${t.color}88`;
      chip.style.color = t.color;
      chip.innerHTML = `<span>${t.text}</span><span class="token-id">[${t.id}]</span>`;
      chip.title = `Token #${idx + 1}: ID ${t.id}`;
      this.chipsContainer.appendChild(chip);
    });

    if (this.tokenCountDisplay) {
      this.tokenCountDisplay.textContent = `${this.tokens.length} tokens`;
    }
  }

  renderAttentionGraph() {
    if (!this.ctx || !this.attentionCanvas) return;
    const w = this.attentionCanvas.width = this.attentionCanvas.clientWidth;
    const h = this.attentionCanvas.height = 180;
    this.ctx.clearRect(0, 0, w, h);

    if (this.tokens.length === 0) return;

    const spacing = w / (this.tokens.length + 1);
    const nodeY = 130;

    // Draw tokens at bottom
    this.tokens.forEach((t, i) => {
      const x = (i + 1) * spacing;
      this.ctx.fillStyle = t.color;
      this.ctx.beginPath();
      this.ctx.arc(x, nodeY, 8, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.fillStyle = "#cbd5e1";
      this.ctx.font = "11px -apple-system, sans-serif";
      this.ctx.textAlign = "center";
      this.ctx.fillText(t.text, x, nodeY + 22);
    });

    // Draw attention arc connections between nodes
    for (let i = 0; i < this.tokens.length; i++) {
      for (let j = i + 1; j < this.tokens.length; j++) {
        const x1 = (i + 1) * spacing;
        const x2 = (j + 1) * spacing;
        const midX = (x1 + x2) / 2;
        const arcHeight = Math.min(100, Math.abs(x2 - x1) * 0.45);

        this.ctx.beginPath();
        this.ctx.moveTo(x1, nodeY - 8);
        this.ctx.quadraticCurveTo(midX, nodeY - 8 - arcHeight, x2, nodeY - 8);
        this.ctx.strokeStyle = `rgba(0, 210, 255, ${0.15 + (0.5 / (j - i))})`;
        this.ctx.lineWidth = 1.5;
        this.ctx.stroke();
      }
    }
  }

  updateVramCalculator() {
    const params = parseFloat(this.paramSelect?.value || "8"); // in Billions
    const bits = parseFloat(this.quantSelect?.value || "4");   // e.g. 16, 8, 4

    // Formula: (Params * 10^9 * bits / 8) / 1024^3
    const weightsGB = (params * 1e9 * (bits / 8)) / (1024 ** 3);
    const kvCacheGB = weightsGB * 0.20;
    const totalGB = (weightsGB + kvCacheGB).toFixed(2);

    let fitMessage = "";
    let fitColor = "#00e676";

    if (totalGB <= 8) {
      fitMessage = "✅ Runs smoothly on standard consumer laptops (M-series Mac, 8GB/16GB RAM) with Ollama!";
      fitColor = "#00e676";
    } else if (totalGB <= 24) {
      fitMessage = "⚡ Runs on high-end consumer PCs or Macs with 24GB-32GB unified memory.";
      fitColor = "#ffb300";
    } else {
      fitMessage = "⚠️ Requires dedicated multi-GPU setup (e.g. 2x RTX 3090/4090 or 64GB+ Mac Studio).";
      fitColor = "#ff7043";
    }

    if (this.vramResultDisplay) {
      this.vramResultDisplay.innerHTML = `
        <div style="font-size:1.1rem; font-weight:800; color:#fff; margin-bottom:4px;">Estimated VRAM: <span style="color:#00d2ff;">${totalGB} GB</span></div>
        <div style="font-size:0.82rem; color:var(--text-muted); margin-bottom:6px;">Weights: ${weightsGB.toFixed(2)} GB | KV Cache & Context: ${kvCacheGB.toFixed(2)} GB</div>
        <div style="font-size:0.84rem; font-weight:600; color:${fitColor};">${fitMessage}</div>
      `;
    }
  }

  async testLocalOllamaEndpoint() {
    if (!this.ollamaStatusDisplay) return;
    this.ollamaStatusDisplay.innerHTML = `<span style="color:#00d2ff;">Testing connection to http://localhost:11434...</span>`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const res = await fetch("http://localhost:11434/api/tags", { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        const modelNames = data.models ? data.models.map(m => m.name).join(", ") : "llama3";
        this.ollamaStatusDisplay.innerHTML = `<span style="color:#00e676; font-weight:700;">🟢 Local Ollama ACTIVE! Installed models: ${modelNames} (Zero cloud cost, 100% offline!)</span>`;
      } else {
        this.ollamaStatusDisplay.innerHTML = `<span style="color:#ffb300;">Ollama port open, but returned status ${res.status}.</span>`;
      }
    } catch (e) {
      this.ollamaStatusDisplay.innerHTML = `
        <span style="color:#94a3b8;">
          ⚪ Local Ollama daemon is currently not running on this machine (Port 11434).<br/>
          To launch your free local model: Open Terminal and run <code style="color:#00d2ff; background:rgba(0,0,0,0.4); padding:2px 6px; border-radius:4px;">ollama run llama3</code>!
        </span>
      `;
    }
  }
}

window.addEventListener("DOMContentLoaded", () => {
  window.transformerLab = new TransformerCapstoneLab();
});
