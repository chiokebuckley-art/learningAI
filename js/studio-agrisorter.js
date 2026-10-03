/**
 * Ages 12-14: The Agri-Sorter (Crop Disease Machine Learning Lab)
 * - Agricultural dataset visualizer
 * - Confusion Matrix
 * - Live sample diagnosis
 */

class AgriSorterLab {
  constructor() {
    this.selectedSample = "sample1";
    this.samples = {
      sample1: { name: "Corn Leaf #101", trueClass: "Healthy", predClass: "Healthy", confidence: 98.2, status: "healthy", remedy: "Optimal leaf chlorophyll and cell density. No intervention needed." },
      sample2: { name: "Corn Leaf #204", trueClass: "Blight", predClass: "Blight", confidence: 94.6, status: "blight", remedy: "Northern corn leaf blight lesions detected. Rotate crops and apply strobilurin fungicide." },
      sample3: { name: "Corn Leaf #309", trueClass: "Rust", predClass: "Rust", confidence: 96.1, status: "rust", remedy: "Pustules of common rust detected across vascular tissue. Monitor field humidity." }
    };

    this.initDOM();
    this.bindEvents();
  }

  initDOM() {
    this.sampleCards = document.querySelectorAll(".agri-sample-card");
    this.diagnosisDisplay = document.getElementById("agriDiagnosisOutput");
  }

  bindEvents() {
    this.sampleCards.forEach(card => {
      card.addEventListener("click", () => {
        const id = card.dataset.sampleId;
        this.selectSample(id);
      });
    });
  }

  selectSample(sampleId) {
    this.selectedSample = sampleId;
    this.sampleCards.forEach(c => c.classList.toggle("active", c.dataset.sampleId === sampleId));
    const data = this.samples[sampleId];
    if (this.diagnosisDisplay && data) {
      this.diagnosisDisplay.innerHTML = `
        <div style="background: rgba(0,0,0,0.3); padding:12px; border-radius:8px; border-left:4px solid ${data.status === 'healthy' ? '#00e676' : data.status === 'blight' ? '#ff7043' : '#ffb300'};">
          <div style="font-weight:700; color:#fff; margin-bottom:4px;">${data.name} — <span style="text-transform:uppercase;">${data.predClass} (${data.confidence}%)</span></div>
          <p style="font-size:0.84rem; color:var(--text-muted);">${data.remedy}</p>
        </div>
      `;
    }
  }

  onCodeRun() {
    this.selectSample(this.selectedSample);
  }
}

window.addEventListener("DOMContentLoaded", () => {
  window.agriSorter = new AgriSorterLab();
});
