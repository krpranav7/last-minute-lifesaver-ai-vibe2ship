# ⚡ LifeSaver AI | Proactive Productivity Companion

[![Google AI Studio](https://img.shields.io/badge/Powered%20By-Google%20AI%20Studio-blue?logo=google&logoColor=white)](https://ai.studio)
[![Gemini](https://img.shields.io/badge/AI-Gemini%203.5%20Flash-indigo)](https://ai.google.dev/)
[![React](https://img.shields.io/badge/Frontend-React%20%26%20TypeScript-blue)](https://react.dev/)

**LifeSaver AI** is an intelligent, proactive productivity companion designed to help students, professionals, and entrepreneurs conquer procrastination, avoid last-minute panic, and complete complex tasks before deadlines are missed. 

Unlike traditional, passive calendar planners that wait for you to look at them or trigger generic alarms, **LifeSaver AI** acts as an autonomous agent—actively scheduling, optimizing, and prompting timely deep-work sprints around your daily fixed commitments.

---

## 🚀 Deployed Application Link
👉 **Live Demo:** [https://lifesaver-ai-361672249111.asia-southeast1.run.app](https://lifesaver-ai-361672249111.asia-southeast1.run.app)

---

## 🎯 Submission Overview

### 1. Problem Statement Selected
* **Problem Statement 1: The Last-Minute Life Saver** (Vibe2Ship Hackathon 2026)
* **The Core Challenge:** Most productivity apps suffer from the "Passive Reminder Trap"—sending alarms when users are too busy, resulting in snooze-clicks and forgotten deadlines. LifeSaver AI addresses this by identifying empty schedule slots dynamically and nudging users to action when they are most mentally prepared.

### 2. Solution Overview
LifeSaver AI integrates an interactive frontend workspace with a Node.js/Express server powered by **Gemini 3.5 Flash** using the modern `@google/genai` SDK. By submitting your core goal alongside daily calendar commitments, the engine:
1. **Traces Schedule Gaps:** Safely schedules focus sprints without overlapping your fixed classes or meetings.
2. **Generates Tactical Roadmaps:** Breaks large, abstract targets into highly prioritized, bite-sized tasks.
3. **Projects Energy Curves:** Displays an hourly cognitive capacity model to map high-productivity hours.
4. **Delivers Proactive Prompts:** Triggers live desktop/browser-style "Nudges" to kickstart deep focus sessions before deadlines approach.

---

## ✨ Key Features

* **🧠 Intelligent Task Chunking & Prioritization:** Transforms abstract inputs (e.g., *"Write 10-page thesis report by Friday"*) into structured, sequenced milestones.
* **📅 Adaptive Calendar & Constraint Guard:** Seamlessly input your daily fixed commitments (e.g., product syncs, lectures). The scheduler automatically treats them as immutable blocks, planning focus sprints around them.
* **🩺 Interactive Focus Timer & Breathing Sync:** A beautiful countdown visual circle supporting customizable session intervals and an elegant **Sinusoidal Breathing Sync** breathing guide to keep you calm and focused.
* **📈 Cognitive Energy/Focus Curve:** Built with **Recharts**, this area chart displays hour-by-hour cognitive focus curves to help you exploit peak energy windows.
* **🤖 Live Agent Reasoning Terminal:** Shows real-time simulated steps and agent traces (e.g., parsing calendar, model alignment) to make AI operations transparent.
* **🛎️ Proactive Context Nudges:** Non-intrusive interactive popups that prompt you to take action or take a well-deserved recovery rest.

---

## 🛠️ Technologies Used

* **Frontend Framework:** React 19, TypeScript
* **Styling & UI:** Tailwind CSS, Lucide Icons, Framer Motion (via `motion/react`)
* **Data Visualization:** Recharts (for dynamic cognitive curve charting)
* **Backend Server:** Express (Node.js full-stack framework proxying Gemini API requests)
* **Package Management & Tooling:** Vite, ESBuild, TSX (TypeScript Execute)

---

## 🧠 Google Technologies Utilized

* **Google AI Studio Developer Environment:** The primary workbench used to build, test, compile, and deploy this full-stack server container.
* **Gemini 3.5 Flash Model:** Serves as the core reasoning engine. It leverages custom system instructions, structured JSON schema response objects, and strict timing variables to output deterministic calendar structures.
* **Google GenAI SDK (`@google/genai` ^2.4.0):** Leveraged for secure server-side communications, keeping credentials hidden from the browser.

---

## 📦 How to Run Locally

### Prerequisites
* **Node.js** installed on your local computer.

### Steps
1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Configure Environment Variables:**
   Set your `GEMINI_API_KEY` in `.env` (or `.env.local`) to your Google AI Studio API key:
   ```env
   GEMINI_API_KEY="YOUR_GOOGLE_AI_STUDIO_API_KEY"
   ```

3. **Run the App in Development Mode:**
   ```bash
   npm run dev
   ```
   The application will boot up the Node.js + Vite full-stack server and start on port `3000`.

4. **Build and Start for Production:**
   ```bash
   npm run build
   npm run start
   ```
