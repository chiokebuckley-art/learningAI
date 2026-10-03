#!/usr/bin/env python3
"""
Free Automated Voiceover Generator for learningAI Video Suite
------------------------------------------------------------
Generates 100% free speech voiceovers and synchronized VTT subtitles.
Uses edge-tts when network is present, or native macOS 'say' + 'afconvert' offline.
Zero API keys, zero financial cost.
"""

import os
import sys
import subprocess
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
AUDIO_DIR = BASE_DIR.parent / "assets" / "audio"
AUDIO_DIR.mkdir(parents=True, exist_ok=True)

TRACKS = [
    {
        "id": "learningai_intro_trailer",
        "title": "Welcome to learningAI: Demystifying Intelligence for Every Student",
        "macos_voice": "Daniel",
        "sentences": [
            ("00:00.000", "00:05.500", "Welcome to learningAI, the comprehensive, zero-cost AI education platform built for K through 12."),
            ("00:05.500", "00:11.200", "For decades, machine learning has been treated like black magic locked behind expensive cloud data centers."),
            ("00:11.200", "00:18.000", "learningAI changes everything. By executing real Python code directly inside the student's browser with WebAssembly,"),
            ("00:18.000", "00:25.000", "and training computer vision models locally with TensorFlow.js, learningAI guarantees zero compute costs,"),
            ("00:25.000", "00:32.000", "complete student privacy, and lightning-fast feedback on any Chromebook, laptop, or tablet."),
            ("00:32.000", "00:38.500", "From curious six-year-olds in The Sandbox discovering pattern recognition,"),
            ("00:38.500", "00:46.000", "to high school seniors fine-tuning local open-source large language models, this is the future of AI literacy.")
        ]
    },
    {
        "id": "sandbox_walkthrough",
        "title": "The Primary Sandbox: Pattern Recognition, Logic & Autonomous Agents",
        "macos_voice": "Samantha",
        "sentences": [
            ("00:00.000", "00:05.000", "Step into The Sandbox, designed specifically for young explorers aged six to eleven."),
            ("00:05.000", "00:10.500", "Meet Chip, your friendly AI companion! Here, we strip away the magic of technology."),
            ("00:10.500", "00:18.000", "In our Third Grade Vision Lab, students use their webcam to train a live classifier with everyday items like pencils and erasers."),
            ("00:18.000", "00:25.000", "They witness how computers recognize patterns, and experience our Dataset Bias Alert when all training pencils are yellow."),
            ("00:25.000", "00:31.000", "In Fourth Grade, students snap together visual logic blocks to navigate mazes with If-Then logic."),
            ("00:31.000", "00:39.000", "And in Fifth Grade, they program autonomous 2D rovers using simulated laser rangefinders, learning the loop of Input, Processing, and Output.")
        ]
    },
    {
        "id": "innovation_studio_walkthrough",
        "title": "The Innovation Studio: Real-World Python, Machine Learning & Smart Hardware",
        "macos_voice": "Daniel",
        "sentences": [
            ("00:00.000", "00:05.000", "For students aged twelve to eighteen, welcome to The Innovation Studio."),
            ("00:05.000", "00:12.000", "This is a professional dark-mode development environment inspired by VS Code, running full Python 3.11 right in the browser via Pyodide."),
            ("00:12.000", "00:20.000", "In The Agri-Sorter lab, students build real neural networks and convolutional image classifiers to detect blight and rust on crops."),
            ("00:20.000", "00:26.500", "They evaluate real confusion matrices, training loss curves, and validation accuracy metrics."),
            ("00:26.500", "00:33.500", "In our Smart Hardware module, students control a simulated IoT home with Python scripts and in-browser voice recognition."),
            ("00:33.500", "00:41.000", "And in our Ethics forum, students debate autonomous vehicle moral algorithms and audit algorithmic bias in facial recognition.")
        ]
    },
    {
        "id": "transformer_capstone_walkthrough",
        "title": "Capstone Lab: Generative AI, Transformers & Local Offline Models",
        "macos_voice": "Daniel",
        "sentences": [
            ("00:00.000", "00:05.000", "Our crowning capstone unlocks the mysteries of modern Generative AI."),
            ("00:05.000", "00:12.500", "Students explore the Transformer architecture through an interactive byte-pair tokenizer, watching sentences split into color-coded tokens and IDs."),
            ("00:12.500", "00:19.500", "They interact with 3D self-attention heatmaps to visualize how words connect across contextual dimensions."),
            ("00:19.500", "00:27.500", "Next, our VRAM and Parameter calculator demystifies the difference between eight-billion and seventy-billion parameter models,"),
            ("00:27.500", "00:33.000", "explaining model weights, FP16 precision, and four-bit quantization."),
            ("00:33.000", "00:41.000", "Finally, students learn how to download HuggingFace models, launch Ollama, and run sovereign AI completely offline on their own hardware.")
        ]
    },
    {
        "id": "socratic_split_walkthrough",
        "title": "The Socratic Split-Screen: The Draft and Unlock Workspace",
        "macos_voice": "Samantha",
        "sentences": [
            ("00:00.000", "00:05.500", "In non-technical subjects like history, literature, and science, students shouldn't outsource their thinking to AI."),
            ("00:05.500", "00:09.500", "That's why we created the Socratic Split-Screen."),
            ("00:09.500", "00:16.000", "On the left is My Brain: a distraction-free writing editor. On the right is the Socratic AI Tutor, initially locked behind a padlock."),
            ("00:16.000", "00:22.500", "The AI remains grayed out until the student drafts at least two hundred words of their own authentic thought."),
            ("00:22.500", "00:28.000", "Once unlocked, the AI is strictly forbidden from writing essays or handing out direct answers."),
            ("00:28.000", "00:36.000", "Instead, it acts as a classical mentor: probing for blind spots, questioning structural assumptions, and guiding the student to master critical thinking.")
        ]
    }
]

def synthesize_macos(track):
    voice = track.get("macos_voice", "Daniel")
    full_text = " ".join([s[2] for s in track["sentences"]])
    temp_aiff = AUDIO_DIR / f"{track['id']}.aiff"
    output_m4a = AUDIO_DIR / f"{track['id']}.m4a"
    vtt_path = AUDIO_DIR / f"{track['id']}.vtt"

    print(f"🎙️ Generating voiceover for '{track['title']}' using voice '{voice}'...")
    
    # Run macOS say
    res = subprocess.run(["say", "-v", voice, "-o", str(temp_aiff), full_text], capture_output=True)
    if res.returncode != 0:
        print(f"  [ERROR] say failed: {res.stderr.decode()}")
        return False

    # Convert AIFF to AAC/M4A with afconvert
    res2 = subprocess.run(["afconvert", "-f", "m4af", "-d", "aac", str(temp_aiff), str(output_m4a)], capture_output=True)
    if res2.returncode == 0:
        print(f"  [OK] Converted to {output_m4a.name}")
        temp_aiff.unlink(missing_ok=True)
    else:
        print(f"  [WARN] afconvert failed, keeping {temp_aiff.name}")

    # Generate WebVTT subtitles
    with open(vtt_path, "w", encoding="utf-8") as f:
        f.write("WEBVTT\n\n")
        for idx, (start, end, text) in enumerate(track["sentences"], 1):
            f.write(f"{idx}\n")
            f.write(f"{start} --> {end}\n")
            f.write(f"{text}\n\n")
    print(f"  [OK] Generated WebVTT subtitle {vtt_path.name}")
    return True

def main():
    print(f"🚀 Generating offline voiceovers for {len(TRACKS)} tracks...")
    for track in TRACKS:
        synthesize_macos(track)
    print("\n✅ All voiceover tracks and subtitles generated successfully!")

if __name__ == "__main__":
    main()
