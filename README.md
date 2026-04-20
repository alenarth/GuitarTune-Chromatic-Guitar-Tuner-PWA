# GuitarTune — Chromatic Guitar Tuner PWA

A professional, production-ready chromatic guitar tuner built as a Progressive Web App. Real-time pitch detection via the Web Audio API with a clean dark pedalboard-inspired UI.

![GuitarTune](public/icons/icon.svg)

---

## Features

- **Real-time pitch detection** — YIN algorithm running in a `requestAnimationFrame` loop, ±1 cent accuracy
- **Animated needle gauge** — SVG gauge with smooth interpolated animation showing cents sharp/flat
- **Auto string detection** — automatically highlights the closest guitar string to the detected pitch
- **Reference tones** — play any string's target note via an `OscillatorNode`
- **Pitch history** — Canvas sparkline showing tuning stability over the last 2 seconds
- **Haptic feedback** — vibration pulse when the note hits perfect tuning (Vibration API)
- **Chromatic mode** — detects any note, not just guitar strings
- **6 tunings** — Standard, Drop D, Drop C, Half Step Down, DADGAD, Open G
- **PWA / offline-ready** — installs on phone/desktop, works without internet after first load
- **Ad-ready layout** — placeholder slots for Google AdSense (320×50 mobile, 728×90 desktop)

---

## Tech Stack

| Layer       | Technology                              |
| ----------- | --------------------------------------- |
| Framework   | React 18 + TypeScript                   |
| Build tool  | Vite 4                                  |
| Styling     | Tailwind CSS 3                          |
| Audio       | Web Audio API (no dependencies)         |
| PWA         | Manual Service Worker + `manifest.json` |
| Fonts       | Inter + JetBrains Mono (Google Fonts)   |

---

## Running Locally

### Option 1 — Quick (use Node.js already on your machine via a one-time PATH fix)

If Node.js is installed in a non-standard location, prepend it to your PATH for the current terminal session before running the commands:

**PowerShell:**

```powershell
$env:PATH += ";C:\Users\Windows 11\AppData\Roaming\GameMakerStudio2\unknownUser_unknownUserID\node\node"
cd "C:\Users\Windows 11\OneDrive\Área de Trabalho\Computação\app afinador"
npm install
npm run dev
```

The PATH change only lasts while that terminal window is open. Repeat the first line whenever you open a new session.

---

### Option 2 — Recommended (install Node.js properly)

1. Download the **Windows LTS installer (.msi)** from [nodejs.org](https://nodejs.org/en/download)
2. Run the installer — leave **"Add to PATH"** checked (it is by default)
3. Close and reopen your terminal
4. Now npm works from anywhere:

```powershell
cd "C:\Users\Windows 11\OneDrive\Área de Trabalho\Computação\app afinador"
npm install
npm run dev
```

Open <http://localhost:5173> in your browser.

---

## Available Scripts

| Command             | Description                                    |
| ------------------- | ---------------------------------------------- |
| `npm run dev`       | Start the dev server with hot reload           |
| `npm run build`     | TypeScript check + production build to `/dist` |
| `npm run preview`   | Serve the production build locally             |
| `npm run lint`      | Run ESLint                                     |

---

## Project Structure

```text
src/
  components/
    Tuner/            Main orchestrator — mode, tuning picker, layout
    NeedleGauge/      SVG gauge with rAF-based smooth animation
    NoteDisplay/      Large note name + frequency + tuning state badge
    StringSelector/   6 string buttons with individual reference tone playback
    PitchHistory/     Canvas sparkline — 2 seconds of pitch stability
    AdBanner/         Ad placeholder (320×50 mobile / 728×90 desktop)
  hooks/
    useAudioPitch.ts  AudioContext lifecycle, microphone capture, pitch loop
  utils/
    pitchDetection.ts YIN pitch detection algorithm
    noteFrequencies.ts MIDI ↔ Hz ↔ cents conversions, note lookup table
    tunings.ts        All supported tunings with MIDI values
  App.tsx
  main.tsx            Entry point + Service Worker registration
public/
  sw.js               Manual Service Worker (Cache-First offline strategy)
  manifest.json       PWA manifest
  icons/              SVG + PNG icons (192px, 512px)
```

---

## Enabling Google AdSense

Open [src/components/AdBanner/AdBanner.tsx](src/components/AdBanner/AdBanner.tsx). Each ad slot has a comment block showing the exact `<ins>` tag to paste in, plus where to add the AdSense `<script>` in `index.html`.

---

## PWA Installation

When running on HTTPS (or `localhost`), the browser will offer an **"Add to Home Screen"** / **"Install"** prompt. The app then runs in standalone mode with no browser chrome, just like a native app.

---

## Browser Requirements

| Feature        | Requirement                                      |
| -------------- | ------------------------------------------------ |
| Microphone     | HTTPS or localhost                               |
| Web Audio API  | All modern browsers                              |
| Vibration API  | Android Chrome (silently ignored on iOS/desktop) |
| Service Worker | All modern browsers                              |
