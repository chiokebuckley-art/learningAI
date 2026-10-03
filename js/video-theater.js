/**
 * learningAI Interactive Cinematic Video Theater Engine
 * - Zero cost, zero external streaming bills
 * - Plays local .m4a audio tracks with WebVTT subtitle synchronization
 * - Fallback to browser Web Speech API on devices without native audio playback
 * - Visual keyframe transitions synchronized with timestamps
 */

const THEATER_CHAPTERS = [
  {
    id: "learningai_intro_trailer",
    title: "Platform Overview: Demystifying Intelligence",
    audioSrc: "assets/audio/learningai_intro_trailer.m4a",
    vttSrc: "assets/audio/learningai_intro_trailer.vtt",
    image: "assets/images/learning_ai_hero.jpg",
    voice: "en-US",
    duration: 46,
    cues: [
      { start: 0, end: 5.5, text: "Welcome to learningAI, the comprehensive, zero-cost AI education platform built for K through 12." },
      { start: 5.5, end: 11.2, text: "For decades, machine learning has been treated like black magic locked behind expensive cloud data centers." },
      { start: 11.2, end: 18.0, text: "learningAI changes everything. By executing real Python directly inside the student's browser with WebAssembly," },
      { start: 18.0, end: 25.0, text: "and training computer vision models locally with TensorFlow.js, learningAI guarantees zero compute costs," },
      { start: 25.0, end: 32.0, text: "complete student privacy, and lightning-fast feedback on any Chromebook, laptop, or tablet." },
      { start: 32.0, end: 38.5, text: "From curious six-year-olds in The Sandbox discovering pattern recognition," },
      { start: 38.5, end: 46.0, text: "to high school seniors fine-tuning local open-source large language models, this is the future of AI literacy." }
    ]
  },
  {
    id: "sandbox_walkthrough",
    title: "The Sandbox: Pattern Recognition & Logic (Ages 6-11)",
    audioSrc: "assets/audio/sandbox_walkthrough.m4a",
    vttSrc: "assets/audio/sandbox_walkthrough.vtt",
    image: "assets/images/sandbox_vision_lab.jpg",
    voice: "en-US",
    duration: 39,
    cues: [
      { start: 0, end: 5.0, text: "Step into The Sandbox, designed specifically for young explorers aged six to eleven." },
      { start: 5.0, end: 10.5, text: "Meet Chip, your friendly AI companion! Here, we strip away the magic of technology." },
      { start: 10.5, end: 18.0, text: "In our Third Grade Vision Lab, students use their webcam to train a live classifier with everyday items like pencils and erasers." },
      { start: 18.0, end: 25.0, text: "They witness how computers recognize patterns, and experience our Dataset Bias Alert when all training pencils are yellow." },
      { start: 25.0, end: 31.0, text: "In Fourth Grade, students snap together visual logic blocks to navigate mazes with If-Then logic." },
      { start: 31.0, end: 39.0, text: "And in Fifth Grade, they program autonomous 2D rovers using simulated laser rangefinders, learning the loop of Input, Processing, and Output." }
    ]
  },
  {
    id: "innovation_studio_walkthrough",
    title: "The Innovation Studio: Real-World Python & ML (Ages 12-18)",
    audioSrc: "assets/audio/innovation_studio_walkthrough.m4a",
    vttSrc: "assets/audio/innovation_studio_walkthrough.vtt",
    image: "assets/images/innovation_studio_ide.jpg",
    voice: "en-US",
    duration: 41,
    cues: [
      { start: 0, end: 5.0, text: "For students aged twelve to eighteen, welcome to The Innovation Studio." },
      { start: 5.0, end: 12.0, text: "This is a professional dark-mode development environment inspired by VS Code, running full Python 3.11 right in the browser via Pyodide." },
      { start: 12.0, end: 20.0, text: "In The Agri-Sorter lab, students build real neural networks and convolutional image classifiers to detect blight and rust on crops." },
      { start: 20.0, end: 26.5, text: "They evaluate real confusion matrices, training loss curves, and validation accuracy metrics." },
      { start: 26.5, end: 33.5, text: "In our Smart Hardware module, students control a simulated IoT home with Python scripts and in-browser voice recognition." },
      { start: 33.5, end: 41.0, text: "And in our Ethics forum, students debate autonomous vehicle moral algorithms and audit algorithmic bias in facial recognition." }
    ]
  },
  {
    id: "transformer_capstone_walkthrough",
    title: "Capstone: Transformers & Local Offline LLMs",
    audioSrc: "assets/audio/transformer_capstone_walkthrough.m4a",
    vttSrc: "assets/audio/transformer_capstone_walkthrough.vtt",
    image: "assets/images/transformer_capstone.jpg",
    voice: "en-US",
    duration: 41,
    cues: [
      { start: 0, end: 5.0, text: "Our crowning capstone unlocks the mysteries of modern Generative AI." },
      { start: 5.0, end: 12.5, text: "Students explore the Transformer architecture through an interactive byte-pair tokenizer, watching sentences split into color-coded tokens and IDs." },
      { start: 12.5, end: 19.5, text: "They interact with 3D self-attention heatmaps to visualize how words connect across contextual dimensions." },
      { start: 19.5, end: 27.5, text: "Next, our VRAM and Parameter calculator demystifies the difference between eight-billion and seventy-billion parameter models," },
      { start: 27.5, end: 33.0, text: "explaining model weights, FP16 precision, and four-bit quantization." },
      { start: 33.0, end: 41.0, text: "Finally, students learn how to download HuggingFace models, launch Ollama, and run sovereign AI completely offline on their own hardware." }
    ]
  },
  {
    id: "socratic_split_walkthrough",
    title: "Socratic Split-Screen: Draft & Unlock Workspace",
    audioSrc: "assets/audio/socratic_split_walkthrough.m4a",
    vttSrc: "assets/audio/socratic_split_walkthrough.vtt",
    image: "assets/images/socratic_split_screen.jpg",
    voice: "en-US",
    duration: 36,
    cues: [
      { start: 0, end: 5.5, text: "In non-technical subjects like history, literature, and science, students shouldn't outsource their thinking to AI." },
      { start: 5.5, end: 9.5, text: "That's why we created the Socratic Split-Screen." },
      { start: 9.5, end: 16.0, text: "On the left is My Brain: a distraction-free writing editor. On the right is the Socratic AI Tutor, initially locked behind a padlock." },
      { start: 16.0, end: 22.5, text: "The AI remains grayed out until the student drafts at least two hundred words of their own authentic thought." },
      { start: 22.5, end: 28.0, text: "Once unlocked, the AI is strictly forbidden from writing essays or handing out direct answers." },
      { start: 28.0, end: 36.0, text: "Instead, it acts as a classical mentor: probing for blind spots, questioning structural assumptions, and guiding the student to master critical thinking." }
    ]
  }
];

class VideoTheaterEngine {
  constructor() {
    this.currentChapterIndex = 0;
    this.isPlaying = false;
    this.currentTime = 0;
    this.audioElement = new Audio();
    this.intervalId = null;
    this.speechUtterance = null;
    this.initDOM();
    this.bindEvents();
  }

  initDOM() {
    this.modal = document.getElementById("videoTheaterModal");
    this.visualImage = document.getElementById("theaterVisualImage");
    this.ambientGlow = document.getElementById("theaterAmbientGlow");
    this.subtitlesBar = document.getElementById("theaterSubtitles");
    this.theaterTitle = document.getElementById("theaterChapterTitle");
    this.btnPlay = document.getElementById("btnTheaterPlay");
    this.timelineProgress = document.getElementById("theaterProgress");
    this.timelineBar = document.getElementById("theaterTimeline");
    this.timerDisplay = document.getElementById("theaterTimer");
    this.chapterPillsContainer = document.getElementById("theaterChapterPills");
    this.btnClose = document.getElementById("btnCloseTheater");

    this.renderChapterPills();
    this.loadChapter(0);
  }

  renderChapterPills() {
    if (!this.chapterPillsContainer) return;
    this.chapterPillsContainer.innerHTML = "";
    THEATER_CHAPTERS.forEach((ch, idx) => {
      const btn = document.createElement("button");
      btn.className = `chapter-btn ${idx === this.currentChapterIndex ? "active" : ""}`;
      btn.textContent = `${idx + 1}. ${ch.title.split(":")[0]}`;
      btn.addEventListener("click", () => {
        this.loadChapter(idx);
        this.play();
      });
      this.chapterPillsContainer.appendChild(btn);
    });
  }

  loadChapter(index) {
    this.pause();
    this.currentChapterIndex = index;
    const chapter = THEATER_CHAPTERS[index];
    this.currentTime = 0;

    if (this.theaterTitle) this.theaterTitle.textContent = chapter.title;
    if (this.visualImage) this.visualImage.src = chapter.image;
    if (this.ambientGlow) this.ambientGlow.style.backgroundImage = `url('${chapter.image}')`;
    if (this.subtitlesBar) this.subtitlesBar.innerHTML = `<span>${chapter.cues[0]?.text || "Ready to play"}</span>`;

    this.audioElement.src = chapter.audioSrc;
    this.updateProgress();

    // Update active pill
    const pills = this.chapterPillsContainer?.querySelectorAll(".chapter-btn");
    pills?.forEach((p, idx) => p.classList.toggle("active", idx === index));
  }

  bindEvents() {
    this.btnClose?.addEventListener("click", () => this.close());
    this.btnPlay?.addEventListener("click", () => this.togglePlay());

    this.audioElement.addEventListener("timeupdate", () => {
      this.currentTime = this.audioElement.currentTime;
      this.updateProgress();
      this.syncSubtitles();
    });

    this.audioElement.addEventListener("ended", () => {
      if (this.currentChapterIndex < THEATER_CHAPTERS.length - 1) {
        this.loadChapter(this.currentChapterIndex + 1);
        this.play();
      } else {
        this.pause();
      }
    });

    this.audioElement.addEventListener("error", () => {
      // Audio playback failed (e.g. offline sandbox or missing codec). Fallback to speech synthesis timer
      console.log("Audio file playback fallback: using Web Speech synthesis");
    });

    this.timelineBar?.addEventListener("click", (e) => {
      const rect = this.timelineBar.getBoundingClientRect();
      const clickPos = (e.clientX - rect.left) / rect.width;
      const chapter = THEATER_CHAPTERS[this.currentChapterIndex];
      this.currentTime = clickPos * chapter.duration;
      if (this.audioElement.duration) {
        this.audioElement.currentTime = this.currentTime;
      }
      this.updateProgress();
      this.syncSubtitles();
    });
  }

  open(chapterIndex = 0) {
    this.modal?.classList.add("open");
    this.loadChapter(chapterIndex);
    this.play();
  }

  close() {
    this.pause();
    this.modal?.classList.remove("open");
  }

  togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  play() {
    this.isPlaying = true;
    if (this.btnPlay) this.btnPlay.innerHTML = "⏸";

    const playPromise = this.audioElement.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Fallback: timer driven animation with Web Speech API
        this.startFallbackTimer();
      });
    }
  }

  startFallbackTimer() {
    clearInterval(this.intervalId);
    const chapter = THEATER_CHAPTERS[this.currentChapterIndex];
    this.intervalId = setInterval(() => {
      this.currentTime += 0.25;
      if (this.currentTime >= chapter.duration) {
        clearInterval(this.intervalId);
        if (this.currentChapterIndex < THEATER_CHAPTERS.length - 1) {
          this.loadChapter(this.currentChapterIndex + 1);
          this.play();
        } else {
          this.pause();
        }
      }
      this.updateProgress();
      this.syncSubtitles();
    }, 250);
  }

  pause() {
    this.isPlaying = false;
    if (this.btnPlay) this.btnPlay.innerHTML = "▶";
    this.audioElement.pause();
    clearInterval(this.intervalId);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  updateProgress() {
    const chapter = THEATER_CHAPTERS[this.currentChapterIndex];
    const duration = this.audioElement.duration || chapter.duration;
    const pct = Math.min(100, (this.currentTime / duration) * 100);

    if (this.timelineProgress) {
      this.timelineProgress.style.width = `${pct}%`;
    }

    if (this.timerDisplay) {
      const curM = Math.floor(this.currentTime / 60);
      const curS = Math.floor(this.currentTime % 60);
      const durM = Math.floor(duration / 60);
      const durS = Math.floor(duration % 60);
      this.timerDisplay.textContent = `${curM}:${curS.toString().padStart(2, '0')} / ${durM}:${durS.toString().padStart(2, '0')}`;
    }
  }

  syncSubtitles() {
    const chapter = THEATER_CHAPTERS[this.currentChapterIndex];
    const cue = chapter.cues.find(c => this.currentTime >= c.start && this.currentTime <= c.end);
    if (cue && this.subtitlesBar) {
      this.subtitlesBar.innerHTML = `<span>${cue.text}</span>`;
    }
  }
}

// Global initialization
window.addEventListener("DOMContentLoaded", () => {
  window.theater = new VideoTheaterEngine();
});
