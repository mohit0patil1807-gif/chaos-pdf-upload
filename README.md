# 🐜 ANTivirus — Chaos by Design

<p align="center">
  <img src="https://img.shields.io/badge/React-19.0.0-blue.svg" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5.7.3-3178C6.svg" alt="TypeScript 5.7" />
  <img src="https://img.shields.io/badge/Vite-6.2.0-646CFF.svg" alt="Vite 6" />
  <img src="https://img.shields.io/badge/Web_Crypto-SHA--256-green.svg" alt="Web Crypto" />
  <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License MIT" />
</p>

> **Problem Statement**: Drag-and-Drop PDF Upload with Chaos by Design.  
> **Core Mission**: Transform standard, mundane document uploads into an adrenaline-fueled, retro bio-hazard defense terminal where you must swat invading ants to protect your authentic PDF document.

---

## Overview

**ANTivirus** turns file uploading into an interactive, gamified survival terminal. Instead of a boring file-picker:
1. **The upload target dodges your mouse** across decoys before stabilizing.
2. The browser validates **genuine magic bytes (`%PDF-`)** and hashes the real file via **SHA-256**.
3. You must sign **Form 88-ANT Bio-Security Clearance**.
4. You enter the **20.0-second Ant Defense Arena**, squishing waves of anatomically crafted SVG ants crawling toward your document vault.
5. Win or lose, the outcome is sealed behind an **interactive HTML5 scratch card** that you must physically rub off to reveal your document's fate.

---

## Finite State Machine (FSM) Architecture

The entire user journey is strictly managed by an explicit 8-state deterministic machine:

```
[IDLE]
  │
  ├── (PDF dropped on stabilized target)
  ▼
[FILE_SELECTED]
  │
  ├── (Bio-security Form 88-ANT clearance signed)
  ▼
[CONFIRMATION]
  │
  ├── (Start 20.0-second defense countdown)
  ▼
[ANT_DEFENSE (20.0s)]
  │
  ├── (Ant touches vault boundary) ──> [BREACH_FAILURE] ────────┐
  │                                                            │
  └── (Survives 20.0s with 0 breaches) ─> [PROCESSING_SUCCESS] ┤
                                                                ▼
                                                       [SCRATCH_RESULT]
                                                    (Canvas Scratch Card)
                                                                │
                                                    (Scratch ~60% coating)
                                                                ▼
                                                           [COMPLETED]
                                               ┌────────────────┴────────────────┐
                                               ▼                                 ▼
                                     "DOCUMENT SURVIVED!"              "THE ANTS HAVE WON"
                                   - View Security Certificate       - Retry with Same PDF
                                   - Upload Another PDF              - View Breach Audit
```

---

## Key Features

### 1. Chaotic Drag & Drop with Real File Verification
- **Four Plausible Drop Targets**: `DOCUMENT VAULT`, `ARCHIVE`, `ATTACHMENTS`, and `FINAL DESTINATION`.
- **Evasive Target**: `FINAL DESTINATION` dodges your cursor across slots twice before locking into place (`DODGE 1/2 -> DODGE 2/2 -> PORTAL STABILIZED`). Drops onto decoy targets trigger hilarious system warnings without losing your file.
- **Genuine Magic Byte Validation**: Inspects the first 5 binary bytes for the signature `%PDF-`. Handles drag-and-drop from any OS file manager (Windows Explorer, macOS Finder, Linux Nautilus) even when MIME types are omitted.
- **Cryptographic Fingerprint**: Real-time asynchronous SHA-256 computation via `crypto.subtle.digest`.

### 2. 20-Second Ant Defense Arena
- **Real-Time Countdown HUD**: 20.0-second high-precision timer with an intentionally erratic, hesitating progress bar.
- **Anatomical Vector Ants**: Handcrafted SVG ants featuring articulated heads, thoraxes, abdomens, glowing red eyes, antennae, and animated legs crawling from the screen perimeter toward the center vault.
- **Three Escalating Waves**:
  - **Wave 1 (0–7s)**: Slow perimeter scouts.
  - **Wave 2 (7–14s)**: Swarming worker ants with erratic zig-zag trajectories.
  - **Wave 3 (14–20s)**: High-speed soldier assault sprint.
- **Strict Breach Detection**: 30px comfortable click/touch hitboxes. If **any** ant contacts the central vault perimeter, containment breach is triggered immediately: alarms sound and the attempt locks into `FAILED`.

### 3. Interactive Metallic Scratch Card
- **HTML5 Canvas Lottery Mechanic**: Built using `<canvas>` with `globalCompositeOperation = 'destination-out'` and `touch-action: none`.
- **Brushed Metallic Finish**: Realistic metallic silver gradient with bio-hazard caution stripes.
- **Auto-Reveal Threshold**: Real-time pixel sampling across 600 grid points. Once ~60% of the surface is scratched away, the remaining film dissolves with sound effects.
- **Immutable Outcome**: Scratching reveals what already occurred—genuine survival or total ant colony takeover.
- **"Reset Scratch" Feature**: Re-coats the card dynamically so you can re-demonstrate the scratch mechanic.

### 4. Security Audit & Official Certificate
- **Inspection Modal**: View complete security metrics including upload timestamps, SHA-256 fingerprint, defense duration, ants squished, missed clicks, and DEFCON chaos score.
- **Confetti & Fanfare**: Survived documents trigger procedural synthesizer fanfare and celebratory confetti.
- **Retry Logic**: If breached, instantly retry the defense round with the **exact same selected file** without re-selecting.

### 5. Retro OS Aesthetics & Procedural Synthesizer
- **CRT Monitor Mode**: Toggle authentic CRT scanlines, flicker, and curvature.
- **Chaos DEFCON Meter**: Dynamically escalates from DEFCON 5 (Peacetime) to DEFCON 1 (Catastrophic Ant Breach).
- **Zero Audio Assets**: 100% procedural sound synthesis using the Web Audio API (ant squishes, warning klaxons, scratch noises, fanfares).

---

## Creator Speedrun Route (< 60 Seconds)

The test case requirement is to drag a PDF from your operating system file manager into the app and finish the upload workflow in under 60 seconds.

| Step | Action | Timing |
|:---:|---|:---:|
| **1** | Hover active target twice to stabilize; drop PDF into *FINAL DESTINATION* | ~3.5s |
| **2** | Complete Form 88-ANT: check bio-security clearances, click *Certify Document* | ~2.5s |
| **3** | Click *START 20-SECOND DEFENSE* | ~1.0s |
| **4** | Swat incoming ants for the 20.0s countdown (0 breaches allowed) | 20.0s |
| **5** | Rub the metallic scratch card past the 60% threshold | ~4.0s |
| **6** | Outcome unveiled: *"DOCUMENT SURVIVED CHAOS!"* + Certificate + Confetti | ~1.0s |
| **Total** | **Measured Creator Route Duration** | **~32.0s** |

> **Requirement Verified**: The entire workflow finishes cleanly in **~32.0 seconds**, well within the 60.0-second limit.

---

## Tech Stack

- **Framework**: [React 19](https://react.dev/)
- **Bundler & Tooling**: [Vite 6](https://vitejs.dev/) + [TypeScript 5.7](https://www.typescriptlang.org/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Audio Engine**: Native [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) (synthesized procedural oscillators)
- **Cryptography**: Native [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API) (`crypto.subtle.digest`)
- **Effects**: [canvas-confetti](https://www.npmjs.com/package/canvas-confetti)
- **Styling**: Modern modular CSS with CSS variables, retro scanline filters, and responsive layout

---

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or higher recommended)
- `npm` or `yarn`

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/mohit0patil1807-gif/chaos-pdf-upload.git
   cd chaos-pdf-upload
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) (or `http://localhost:3001` if port 3000 is occupied).

4. **Build for production**:
   ```bash
   npm run build
   ```

5. **Run automated verification tests**:
   ```bash
   node test-antivirus.cjs
   ```

---

## Verification & Automated Test Suite

Run the full end-to-end headless suite:
```bash
node test-antivirus.cjs
```
This script exercises:
- Magic-byte `%PDF-` signature parsing and rejection of spoofed files
- Empty MIME type resolution from OS drops
- Web Crypto SHA-256 fingerprint verification
- Moving drop target stabilization on dodge 2
- Ant hit testing and elimination count increments
- Instant boundary breach halting and failure lock
- 20.0s zero-breach success transition
- Canvas scratch card coverage calculation (~60% threshold auto-reveal)
- Retry state retention of original `File` object

---

## License

This project is licensed under the [MIT License](LICENSE).
