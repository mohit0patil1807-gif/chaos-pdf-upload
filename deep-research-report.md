# Designing a Themed High-Friction Drag-and-Drop PDF Upload (PS1)

**Executive Summary:** We recommend a **retro “Department of Document Affairs (1997)”** theme (bureaucratic filing office) to give the upload a cohesive, humorous identity. Key UX obstruction mechanics include *dwell-to-arm zones*, *one-time label swaps*, *misleading drop targets*, and a *checkpoint sequence with hints*. Technically, the solution will use standard HTML5 drag/drop and File APIs, carefully handling limitations (drag events hide file data until drop). After drop, we’ll verify the PDF signature (`%PDF-`) by reading the file’s first bytes (via `FileReader.readAsArrayBuffer`), then compute its SHA-256 hash using `crypto.subtle.digest` (note: this requires the full file in memory). Accessibility and safety require no “traps” – e.g. provide a keyboard-accessible fallback (WCAG 2.5.7 mandates non-drag alternatives) – and clear focus states. The timed hints (at ~10s, 20s, 35s) and capped delays (<20s total forced wait) ensure the judge can eventually finish in about 45–60 s. Below is a thorough analysis and plan.

## Theme Selection

We compare the three theme ideas:

| Theme                       | Description                                  | Pros                                    | Cons                                       | Suggested Assets                                  |
|-----------------------------|----------------------------------------------|-----------------------------------------|--------------------------------------------|---------------------------------------------------|
| **Dept. of Document Affairs** (retro government office) | Old-fashioned filing counters (“Window 1, 2…”), bureaucratic forms, rubber-stamp dialogs, Win95-style UI. | Strong, unified theme; easy to create “official” microcopy (forms, stamps, warnings); retro GUI assets (gray panels, title bars) fit well. | Common choice (others might use it); must polish to not feel generic. | Windows 95 GUI elements (gray/blue panels), “stamp” and paper icons, form fields, badge logos. |
| **Airport Security for PDFs** | Zones as airport checkpoints (Check-in, Customs, Gate), with baggage scanner/stamp analogies for PDF. | Novel and visual; can use familiar airport UI (boarding pass, scanner overlay); good for “security check” dialogs. | Harder to make clearly relate to PDF upload; may require custom graphics (scanner icons, stamps). | Airline kiosk style UI, scanner/carousel graphics, boarding-pass style file preview. |
| **Haunted Filing Cabinet** | Spooky theme: drawers open/close, ghostly hints, creaky animations. | Very memorable; playful (ghost “misguidance”); stands out. | Harder to implement reliably; risk of being seen as gimmicky or off-theme (unless done well). | Cartoon ghost SVG, wooden drawer UI, eerie CSS effects, “boo!” alerts. |

Given judging guidelines, **Dept. of Document Affairs** is recommended for its clear metaphor and ease of integrating required mechanics. (It lends itself to Win95-esque design, multiple “windows”, and bureaucratic microcopy.) We’ll use palettes of charcoal-gray, off-white, warning-red and electric-yellow accents, and retro pixel fonts/icons to reinforce the theme.

## UX Obstruction Mechanics

We plan these deterministic frustration techniques (each *must* be completable):

- **Dwell-to-Arm Drop Zones:** Each drop zone (e.g. *Window 1–4*) requires the file cursor to hover for ~1.2 s before it “arms” (fills a progress ring). If the user drops too early, show a “premature file” rejection dialog. Implementation: on each `dragover`, track elapsed hover time; when ≥1.2s on the same zone, mark it active. This uses repeated `dragover` events.

- **One-Time Label Swaps:** On the *first* `dragenter` of each zone, swap its visible label with another zone’s (e.g. “Final Upload” label appears on the “Archive” zone). Only do this swap once, so after that each zone’s label stays in place. This surprises the user on their first attempt but then becomes stable (predictable) thereafter.

- **Misleading/Decoy Zones:** Provide multiple counters with confusing names. Only one sequence (e.g. alphabetical order of their *true* names: Attachments, Archive, Documents, FinalUpload) will work logically. Others look plausible but trigger errors. Display a hint like “Filing is alphabetical, obviously.”

- **Checkpoint Sequence Rule:** After the file drop, require the user to “process” it through counters in a fixed order (e.g. attach additional docs, then archive, etc.). Enforce one-way progress through these steps. Provide contextual hints (first subtle line of text, then clearer after 10s, 20s, 35s). Ultimately allow proceeding after all steps.

- **Evasive vs. Predictable Movements:** We will avoid *random* teleporting buttons. Instead, use predictable obscurity. For example, the “Complete Upload” button might move a small distance or toggle text (“Confirm” ↔ “Yes” ↔ “Proceed”) a few times if hovered. But it won’t vanish permanently or jump off-screen. The idea is to slow them, not trap them.

- **Arming Ring Timing (≈1.0–1.5 s):** Based on typical reaction time, we’ll aim ~1.2 s. Too short and judges click through easily; too long and it feels like artificial delay. (A ring gauge showing fill can visually enforce this duration.)

- **Notification/Warning Overload:** Intermittently display humorous pop-up messages (e.g. “Your productivity has been detected,” “The button moved for security,” etc.). Cap at ~5 messages to avoid clutter. These use `setTimeout` after drops or failed attempts. Keep them out of the way of main UI controls.

- **Progress Stalling:** The overall upload progress bar will fill toward 99%, then *stall*. It will wait for an extra user action to reach 100%. For instance, only once the user “signs” the document (see below) does it complete.

- **Hold-to-Sign Control:** At 99% we present a “Sign Here” button that must be pressed and *held* for ~2 seconds (with an animation or progress fill on the button itself). Releasing early cancels the hold. Decoy buttons (“Cancel”, “Submit Anyway”) do nothing but waste time.

- **Settings “Nightmare”:** Include a Settings panel with confusing toggles (e.g. “Enable Real Upload?” – toggling it might change a static message, not actual behavior). One setting (maybe “Language: Bureaucratese” vs “Modern English”) can slightly alter phrasing. A “Reset Chaos” button there restores initial state.

Throughout, **every button must work** (even decoys, at least to show a fake action). No infinite loops: after a few steps provide a “Back” or “Cancel” if needed. We ensure the user *always can finish*, consistent with judges’ expectations.

## Technical Reliability

- **HTML Drag & Drop Events:** We use standard drag events (`dragenter`, `dragover`, `dragleave`, `drop`), remembering that when dragging from the OS, **no** `dragstart` fires on a page element. The key is that the *drop* event is the only time we can read the file data. We *must* call `ev.preventDefault()` in `dragover` on each zone to allow a drop.

- **DataTransferItem Inspection:** On `dragenter/dragover`, we can inspect `event.dataTransfer.items`. Each item has `kind` and `type` properties. For files, `kind === 'file'`. The `type` will be the MIME type (e.g. `application/pdf`) if known from extension, or empty string if unknown. We cannot rely on filename or path (not exposed). So during drag, we can *only* check `if (item.kind==='file' && (item.type==='application/pdf' || item.type===''))` as a hint; but the final check happens on drop.

- **Reading File Content:** In the `drop` handler, use the **File API**. Access the dropped `File` via `event.dataTransfer.files[0]`. To verify it's really a PDF, we read the first few bytes. For example:  
  ```js
  const reader = new FileReader();
  reader.onload = () => {
      const headerBytes = new Uint8Array(reader.result).subarray(0,5);
      const headerText = new TextDecoder().decode(headerBytes);
      if (!headerText.startsWith("%PDF-")) reject();
      else proceed();
  };
  reader.readAsArrayBuffer(file.slice(0, 10)); // read first 10 bytes
  ```
  A valid PDF begins with the ASCII text `%PDF-` (Adobe’s spec). This check ensures even if the MIME was empty or spoofed, we validate content. (We cite MDN: `readAsArrayBuffer()` yields an ArrayBuffer of the file’s data.)

- **SHA-256 Fingerprint:** After confirmation, compute the SHA-256 of the *whole* file for display (the “Document Fingerprint”). Use `window.crypto.subtle.digest("SHA-256", dataBuffer)`. **Note:** `SubtleCrypto.digest()` requires the entire data as an ArrayBuffer (no streaming). For large PDFs this is memory-heavy, so we can chunk: e.g. read file in slices (say 1 MB each) and feed each to `crypto.subtle.digest` sequentially, combining results via an incremental hash library or by manual chunk-hashing technique. However, for typical PDFs (a few MB) reading whole is acceptable. On success, display the hex hash.

- **Empty MIME Handling:** If `item.type` was empty, we still allow drop but treat it as potentially valid. The signature check above is the real gate.

- **File API Caveats:** Note some mobile browsers or older browsers disable drag/drop of files. We provide a visible `<input type="file">` fallback (e.g. a “Click here to upload” link) for accessibility. This also addresses **WCAG**: rules state any drag action must have a non-drag alternative.

- **Touch Support:** On touch devices, drag-drop may not fire. The file input fallback covers touch users. We’ll avoid requiring complex gestures.

- **Keyboard Support:** Make zone elements focusable (e.g. with `tabindex`) and allow pressing Enter/Space to “drop” the currently selected file (from the file input), mirroring the drag logic. Provide clear focus outlines and ARIA labels on key controls (e.g. dialogs, progress bar).

- **No External Calls:** All work is done in-browser. No server, no API keys, no libraries outside React/JS/CSS. All data (hash, logs) is local only.

## Accessibility & Safety

- **No Permanent Traps:** We ensure at every step the user has an escape or alternative. For example, after a couple of confirmation dialogs, provide a “Cancel” or “Back” that resets to the last stage.

- **Keyboard/Fallback:** As above, provide a visible “Upload PDF” button. Tabs and keyboard events must reach all interactive elements. Use ARIA roles for custom dialogs and buttons. E.g. each “window” zone could have `role="button"` and `aria-label="Drop file here"`.

- **Focus States:** All clickable elements will have high-contrast focus outlines (WCAG 2.4.13).

- **No Hard Flashing:** Animations (e.g. hover rings, progress fills) will be smooth CSS transitions (<0.5s) and not flicker or invert rapidly. We avoid strobing or high-frequency flashing colors.

- **Time Caps:** Based on UX guidelines, cap forced delays around 15–20 s total. (Judges tire of waiting more than that.) The novelty comes from confusion, not long waits. Timers: ~1.2s hovers, 2s hold-to-sign, a few brief dialogs (1–2s each). Hints after 10s, 20s, 35s ensure eventual success.

- **Error Handling:** For any unexpected condition (e.g. non-file dropped), show a friendly error dialog (e.g. “That’s not a file – please try again.”) and reset drop state.

## Timing & Hint Strategy

- **Target Demo Time:** Aim for the *developer/creator* to finish in **≤60 s** along a scripted path. A new judge might take up to 90 s; that’s acceptable. Verify by practice run-throughs.

- **Forced vs. Cognitive Delays:** We keep forced animation delays short (<~5–6 s aggregate). Most time comes from the user puzzling. For example, if the ring is 1.2 s and hold button 2 s, that’s ~3.2 s total forced. The rest (45–50 s) is user deciphering cues.

- **Hint Schedule:** Provide textual hints at 10s, 20s, 35s if the user hasn’t progressed. E.g.: 
  1. Subtle UI hint (10s) – “(Hint: Filing is alphabetical.)” 
  2. Clearer pop-up (20s) – “Remember to drag through *each* counter in the right order.” 
  3. Final hint (35s) – “Try _Attachments_ next.”  
  (These ensure the user can always finish, turning frustration into an “aha” moment.)

## Implementation Plan

- **Framework & Structure:** Use the existing project stack (likely React + Vite per guidelines). Work in the provided codebase; if none exists, scaffold a fresh React+TypeScript/Vite app. Keep dependencies minimal. All state can live in React (using hooks/context).

- **Key Components/Modules:**
  - **DropZoneManager:** Coordinates multiple drop zones. Manages drag events over zones, dwell timers, label swaps, and the active zone logic.
  - **ArmingZone:** Represent each “Window” (counter). Manages its own hover timer (1.2s) and arming state, visual ring, and one-time label swap.
  - **CheckpointSequence:** After initial drop, guides the user through the checkpoint steps. Could be a series of React state screens or modal-like forms (classification dialog, warning dialog, size confirmation).
  - **ConfirmationDialogs:** A reusable dialog component for the sequence of approvals (e.g. “Document Classification?”, warning prompt, size prompt). Should accept custom text/buttons.
  - **ProgressController:** Handles the faux upload progress bar. Animate from 0→99%, then pause. Wait for a signal (from Sign control) to animate 99→100%.
  - **SignControl:** A button that requires a 2s hold. Listens for `onMouseDown`/`onTouchStart` and `onMouseUp`/`onTouchEnd`, measures duration. Fulfilling triggers progress completion.
  - **Notifications:** A component or context that shows ephemeral toasts or pop-ups. We’ll enqueue up to ~5 humorous messages at defined times/events.
  - **BureaucracyMeter:** Displays live stats (elapsed time, attempts, forms completed). Update this continuously so judges see “0:35 elapsed” etc.
  - **SettingsPanel:** Contains distractor toggles and the “Reset Demo” button. For example, a switch “Enable real upload” (which might do nothing obvious), and “Language: Bureaucratese” toggling archaic wording.
  - **Reset Logic:** A function that returns all state to initial (clears forms, progress, logs). Could simply reload the page or reset React state/context.

- **Integration:**
  - Ensure each drop zone calls `preventDefault()` in `onDragOver`, and that the `drop` handler receives the File object.
  - After drop, disable other zones to prevent re-drop.
  - Confirmation dialogs should store answers (e.g. the correct classification/size) in state; use actual `file.size` to determine the right choice (for size dialog).

- **Styling:** Retro theme with CSS. Use a grid/flexbox layout for sidebar, top bar, main area. Pixel fonts for headers, classic button styles. Animations via CSS transitions.

## Testing & Verification

**Manual Testing:** We will perform the following at minimum, logging results:

1. **Valid PDF Upload (ideal path):** Drag a real PDF file through the intended steps. Confirm all dialogs appear and accept correct answers. Verify final success screen shows correct filename, size (rounded sensibly), and SHA-256 hash. Check timer and chaos score update.

2. **Invalid File:** Drag a non-PDF (e.g. a .txt) or an empty file. Ensure we detect missing `%PDF-` and show a clear error without crashing. Then allow retry.

3. **Premature Drop:** Hover less than 1.2s on a zone and drop. Confirm “too soon” message and that it resets hover state but doesn’t break.

4. **Wrong Zone Sequence:** Drop on a non-final zone or in wrong order. Check that the app enforces the checkpoint flow (e.g. doesn’t let progress until all zones checked).

5. **Dialog Buttons:** Click every button (confirm, cancel, decoys) to ensure they do something (even if “something” is just closing a dialog). No buttons should be dead or lead to infinite loop.

6. **Progress/Sign:** Verify progress bar animates to 99%, stops. Try clicking (should do nothing). Hold the sign-button for less than 2s (should cancel hold), then 2s (should finish). Check that releasing early resets the hold.

7. **Keyboard/Fallback:** Use Tab/Enter to trigger file input and dialogs. Check that dragging with keyboard-equivalent action works or fallback button does.

8. **Notifications:** Confirm up to ~5 notifications appear at right times and auto-dismiss. They shouldn’t block key UI. 

9. **Reset Demo:** Press Reset at various times (mid-flow, success screen). Ensure state fully clears (no remnants of past run). Check chaos meter resets.

10. **Edge Cases:** 
    - Rapidly dragging a file around zones to ensure timers reset appropriately.
    - Multiple drop attempts. 
    - Mobile/touch check (at least that the input fallback appears).
    - Long file name or huge file for UI overflow.

**Automated Tests:** (If time allows) script with e.g. Playwright: simulate drag/drop, click sequence. But manual inspection is sufficient for this contest demo.

We will note any **known limitations**, e.g. “very large PDF (100+MB) may freeze hash calculation”, or “drag-drop might not work on IE11 (out of scope for event)”.

## Creator Demo Timeline (≈55–60 s)

For clarity in the README, the exact “wizard path” is:

1. **(0–3s)** **Drag PDF to Wrong Counter:** Drop the PDF onto “Window 3” (labeled “Final Upload” initially, which is the wrong zone) to trigger checkpoint mode.
2. **(3–12s)** **Hover Through Checkpoints:** Move the file cursor over each required “counter” in alphabetical order (e.g. *Attachments*, *Archive*, *Documents*). Hold ~1.2s on each to arm it.
3. **(12s)** **Final Drop:** Drop onto the true “Final Upload” zone.
4. **(12–20s)** **Classification Dialog:** Dialog asks “What is this document’s classification?” – choose “Miscellaneous” and click Next.
5. **(20–25s)** **Warning Dialog:** A warning pops up (“Are you sure about this classification?”) – click “Yes, Confirm” (or the safe option).
6. **(25–32s)** **Size Confirmation:** Dialog asks to pick the file size from options (e.g. “12.3 KB” vs decoys). Select the correct size (rounded from `file.size`) and confirm.
7. **(32–50s)** **Processing Bar:** Progress bar runs to 99%. Then **(50–52s)** Hold the **“Sign Here”** button for 2 seconds until it confirms.
8. **(52–55s)** **Success Screen:** The completion screen appears, showing filename, size, SHA-256 hash. Options: “Reset Demo” (press this).
9. **(55–60s)** **Done:** Ensure reset works and app returns to start.

Times are approximate (some steps depend on user speed). Practice to hit ~55 s consistently.

## Prioritized Feature Table

| Feature                         | Impact (Chaos) | Implementation Effort |
|---------------------------------|----------------|-----------------------|
| **Dwell-to-arm drop zones**     | High (blocks immediate drop) | Medium (timer logic on dragover) |
| **One-time label swap**         | Medium (first-time confusion) | Low (flag + swap DOM/text) |
| **Checkpoint sequence**         | High (required correct order) | High (state management, hints) |
| **PDF signature & SHA-256**     | High (adds realism, uses real file) | Medium (FileReader + crypto logic) |
| **Evasive Complete button**     | Medium (fun, slows click) | Low (CSS/JS reposition or text change) |
| **Notifications**               | Medium (adds humor) | Low (timers + UI) |
| **Hold-to-sign button**         | High (final gating, delays completion) | Medium (timer on mousedown) |
| **Confirmation dialogs chain**  | High (classic frustration) | Medium (UI dialogs + logic) |
| **Bureaucracy Meter (timer/score)** | Medium (shows frustration quantitatively) | Low (increment counters) |
| **Reset Demo & Keyboard shortcuts** | Medium (usability) | Low (single function) |

This ranking guides us to ensure core blockers (zones, sequence, dialogs, final hold) are solid, and lighter features (flair notifications, settings toggles) are bonus if time allows.

## Example UI Copy (Microcopy) 

Below are sample texts for UI elements:

- **Zone Labels (initial):**  
  - Window 1: “Archive”  
  - Window 2: “Attachments”  
  - Window 3: “Final Upload”  
  - Window 4: “Documents”  
  (These will swap on first entry to confuse the judge.)

- **Hint Text:** “Filing is alphabetical, obviously.” (small caption beneath zones). After 10s if still stuck: “(Hint: The order is *Attachments → Archive → Documents → Final Upload*.)” After 20s: “*Tip: Drag the file to each counter in order – 'A', then 'A', then 'D', then 'F'.*”

- **Notification Examples:**  
  - “*Alert:* Your productivity has been detected.”  
  - “*Notice:* The button moved for security reasons.”  
  - “*Heads up:* A committee is reviewing your decision.”  
  - “*Warning:* Your file is experiencing commitment issues.”  

- **Dialogs:**  
  1. “**Document Classification:** Please select the document’s category.” (Dropdown: *Confidential, Internal, Public, Miscellaneous* – choose Miscellaneous.)  
  2. “**Are you sure?** This action may be irreversible.” (Buttons: *Yes, finalize* / *Hold on, go back*)  
  3. “**Confirm File Size:** The file size should be *X KB*. Please select.” (Options with one correct answer.)  

- **Progress/Final Messages:**  
  - “**Processing Upload…** Please wait.” (Progress bar tooltip shows percent.)  
  - “**Hold to Sign:** Press and hold to finalize.” (On the button.)  
  - **Completion Screen:** “Success! ‘report.pdf’ uploaded successfully. Total time: 00:52. SHA-256: *[hex hash]*.”  

- **Settings Panel:**  
  - Toggle: “Enable Real Upload (does nothing)”  
  - Language dropdown: “Bureaucratese / Modern” (joking)  
  - Button: “Reset Demo – Return everything to start.”  

These snippets can be adjusted during dev for voice consistency. All text remains light and humorous.

## Pseudocode for Critical Parts

```js
// DRAG HANDLERS (DropZoneManager component):
zones.forEach(zone => {
  zone.element.addEventListener('dragover', (ev) => {
    ev.preventDefault(); // allow drop
    zone.onDragOver();  // track dwell timer, show ring
  });
  zone.element.addEventListener('dragenter', (ev) => {
    if (!zone.labelSwapped) {
      swapLabels(zone, randomOtherZone);
      zone.labelSwapped = true;
    }
    // highlight zone
  });
  zone.element.addEventListener('drop', async (ev) => {
    ev.preventDefault();
    const file = ev.dataTransfer.files[0];
    if (!file) return showError("No file detected");
    // Verify PDF signature
    const header = await readFileSlice(file, 0, 5);
    if (new TextDecoder().decode(header) !== "%PDF-") {
        return showError("Not a valid PDF");
    }
    // Valid PDF - proceed to checkpoint sequence
    startCheckpointSequence(file);
  });
});

// ARMED ZONE TIMER:
function onDragOverZone(zone) {
  if (!zone.armed) {
    zone.hoverTime += deltaTime; // accumulate time between dragover events
    if (zone.hoverTime >= 1200 /* ms */) {
      zone.armed = true;
      zone.showArmedState(); // fill ring, allow drop here
    }
  }
}

// PDF SIGNATURE CHECK (read first 10 bytes):
function readFileSlice(file, start, length) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(new Uint8Array(reader.result));
    reader.onerror = () => reject("File read error");
    reader.readAsArrayBuffer(file.slice(start, start + length));
  });
}

// SHA-256 HASHING (non-streaming):
async function computeHash(file) {
  const buffer = await file.arrayBuffer(); // OR read via FileReader
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2,'0')).join('');
}
// Note: SubtleCrypto requires full data in memory.

// CONFIRMATION DIALOG LOGIC:
function runDialogSequence(file) {
  askClassification(file)
    .then(() => askWarning())
    .then(() => askSize(file))
    .then(() => startFakeUpload());
}

// FAKE PROGRESS AND HOLD-TO-SIGN:
async function startFakeUpload() {
  await animateProgress(0, 99, 1000); // e.g. 1s ramp
  // Now wait for user to hold the "Sign" button:
  await waitForHold('#signButton', 2000);
  await animateProgress(99, 100, 200); // finish
  showSuccessScreen();
}

// WAIT-FOR-HOLD (simplified):
function waitForHold(selector, durationMs) {
  return new Promise(resolve => {
    const btn = document.querySelector(selector);
    let holdTimer = null;
    btn.addEventListener('mousedown', () => {
      holdTimer = setTimeout(() => resolve(), durationMs);
    });
    btn.addEventListener('mouseup', () => {
      clearTimeout(holdTimer);
    });
    // also handle touchstart/touchend similarly
  });
}

// RESET LOGIC:
function resetDemo() {
  // Clear all React state: drop zones, dialogs, progress, meter
  // Or simply reload page: location.reload();
}
```

## Upload State Machine (Mermaid Flowchart)

```mermaid
flowchart TD
    A[Idle] --> B{File Dragged?};
    B -->|Yes| C[Hover Zones (1.2s to arm)];
    C --> D{Zone Armed?};
    D -->|No| C
    D -->|Yes| E[Drop Event];
    E --> F{Is File};
    F -->|No| A[Idle];
    F -->|Yes| G[Check PDF Signature];
    G --> H{Valid PDF?};
    H -->|No| I[Error Dialog] --> A;
    H -->|Yes| J[Checkpoint Sequence];
    J --> K[Dialog: Classification];
    K --> L[Dialog: Warning];
    L --> M[Dialog: Size Confirmation];
    M --> N[Start Fake Upload (0→99%)];
    N --> O[Wait: Hold to Sign];
    O --> P[Resume to 100%];
    P --> Q[Success Screen];
    Q --> R[Reset Demo];
    R --> A;
```

In words: **Idle** awaits a file drag. Once dragged, we *hover* over zones (requiring ~1.2s) to arm them. Upon **drop**, if not a file we abort; if a file, we read and verify the PDF signature. If invalid, show an error and go back to idle. If valid, proceed through the **checkpoint dialogs** (classification, warning, size). Then run the fake upload bar to 99% and pause until the user holds **Sign**. After holding, resume to 100%, show **Success**. The user can then **Reset** to go back to Idle.

## Testing Checklist

- **Drag/Drop Mechanics:** Test dragging and dropping PDF from OS onto each zone. Ensure `dragover` must be prevented (test with dev tools: drop only succeeds after preventDefault).
- **Hover Timing:** Confirm dwell-to-arm works ~1.2s (not too short or long). If user lifts too early, verify correct “too early” dialog shows.
- **Label Swap:** Confirm each zone swaps label only on first dragenter, then stays fixed.
- **Sequence Logic:** Verify only the correct sequence (alphabetical) progresses. Try dropping in wrong order to ensure error.
- **File Validation:** Test with a true PDF (gets accepted) and various non-PDFs (JPG, TXT) and corrupted PDFs (no `%PDF-`). They should all be rejected cleanly.
- **Dialogs:** Click all dialog buttons. The correct choices advance; incorrect ones should either loop or show help. No unreachable buttons.
- **Progress Bar:** Let it run. Ensure it stops at 99%. Try clicking random UI (shouldn’t skip). Only holding the sign button finishes it.
- **Notifications:** Verify sample toasts appear/disappear and count doesn’t exceed ~5. They should not block main dialogs.
- **Bureaucracy Meter:** Check time increments per second, score increases (e.g. +1 per obstacle). Verify Reset clears it.
- **Accessibility:** Tab through all interactive elements (zones, buttons, dialogs). Ensure focus is visible. Try activating via keyboard.
- **Reset:** At various points (mid-drag, mid-dialog, after success) click “Reset Demo”. App should fully revert (no stale data).

All tests should pass with the final app.

## Known Limitations

- Very large PDFs may make SHA-256 slow or memory-intensive (but judges will use small files).
- Drag-and-drop on mobile/tablet is inherently limited; we rely on the file input fallback for such cases.
- Browser quirks: Internet Explorer (if that’s even in play) does not support modern drag APIs; we assume a modern Chromium/Firefox.

We document exactly how we tested each step above in the README.

### Sources:

- MDN Web Docs on Drag and Drop events and DataTransferItem (we use dragover/dragenter and MIME type info).  
- MDN Web Docs on FileReader (using `readAsArrayBuffer`).  
- MDN Web Crypto API on `crypto.subtle.digest` (note: no streaming input).  
- WCAG 2.5.7 Accessibility guideline (drag must have a non-drag alternative).  

 These primary sources guide the implementation of drag/drop mechanics, file handling, hashing, and accessibility. Each cited line supports a key technical point above.