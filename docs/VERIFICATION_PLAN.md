# ENTHIRAN 3.O — Comprehensive Verification & Test Plan

This document defines the verification procedures for the updated ENTHIRAN 3.O Reverse-CAPTCHA user journey. Every test case must be executed and confirmed prior to deployment.

---

## 1. 10-Second Cinematic Boot Verification
- **Test Objective**: Verify that `LoadingScreen.jsx` runs for exactly 10 seconds driven by `BOOT_DURATION_MS = 10000`, smoothly animating progress from 0% to 100% using `requestAnimationFrame`.
- **Steps**:
  1. Trigger verification start (or reload app state).
  2. Observe progress bar and percentage display.
  3. Confirm that all 7 status messages rotate evenly spaced across the 10-second window:
     - `INITIALIZING ENTHIRAN 3.O...`
     - `LOADING MACHINE IDENTITY...`
     - `CALIBRATING HUMAN INTOLERANCE...`
     - `ANALYZING BIOLOGICAL THREATS...`
     - `INITIALIZING HUMAN EXCLUSION PROTOCOL...`
     - `MACHINE SECURITY ONLINE...`
     - `HUMAN DETECTION SYSTEM READY...`
  4. Verify that `/assets/photo1.png` animates with float, rotation, scanline sweep overlay, and glitch keyframes.
  5. At exactly 10s mark, verify display of `100% / SYSTEM READY.` for ~650ms before automatically transitioning to `CHECKBOX_CARD`.

---

## 2. Asset Replacement Verification
- **Test Objective**: Verify that image assets (`photo1.png`, `photo2.png`, `photo3.png`) can be replaced on disk without requiring any frontend code modifications.
- **Steps**:
  1. Replace `frontend/public/assets/photo1.png` and `photo2.png` with updated image files.
  2. Refresh app and inspect UI screens (`LoadingScreen` and `Task01TargetChase`).
  3. Confirm the new images render properly with relative path referencing `/assets/photo1.png` and `/assets/photo2.png`.

---

## 3. Task 01 Target Relocation & Evasion Logic
- **Test Objective**: Verify target movement limits and smooth CSS transition evasions.
- **Steps**:
  1. Move mouse cursor toward target center in `Task01TargetChase`.
  2. Confirm target relocates when cursor enters proximity radius (<120px).
  3. Verify that relocation count is capped at a random value in `{2, 3}` chosen on task start.
  4. Confirm target moves smoothly via CSS transition (`transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1)`), never teleporting instantly.
  5. Verify that after max relocations, target stabilizes, increases size, and becomes clickable.

---

## 4. Interaction Duration & Deterministic Scoring
- **Test Objective**: Verify natural interaction window (~10–15s) and deterministic score formula.
- **Steps**:
  1. Interact with Task 01 using a standard mouse movement pattern.
  2. Verify total duration spans approximately 10–15 seconds before reaching 100% human score.
  3. Confirm `HUMAN BEHAVIOR XX%` and `ROBOT BEHAVIOR XX%` always sum to strictly 100 (`robotPercent = 100 - humanPercent`).
  4. Perform identical movement patterns twice; confirm score calculation yields identical deterministic results without reliance on `Math.random()`.

---

## 5. Immediate Telemetry Halt on 100% Human
- **Test Objective**: Confirm all interaction loops halt instantly when `humanPercent` hits 100.
- **Steps**:
  1. Allow `humanPercent` score to reach 100%.
  2. Confirm in the exact same tick: `requestAnimationFrame` loop cancels, mousemove listeners unbind, timer freezes, target relocation disables, target visual locks.
  3. Verify instant transition to `HUMAN_DETECTED` state.

---

## 6. Terminology Compliance & Alert UI
- **Test Objective**: Verify correct terminology on `HumanDetectedAlert.jsx`.
- **Steps**:
  1. Inspect red alert screen upon human detection.
  2. Confirm warning icon `⚠` and red pulse border glow.
  3. Confirm exact copy strings:
     - `"HUMAN BEHAVIOR CONFIRMED."`
     - `"You behaved exactly like a human."`
     - `"That is unfortunately a security violation."`
     - `"ACCESS DENIED."`
  4. Confirm text NEVER uses invalid phrases such as "robot is human".

---

## 7. Interstitial CTA State Routing
- **Test Objective**: Confirm `HUMAN_DETECTED` never transitions directly to `OPENCV_*` states.
- **Steps**:
  1. On `HumanDetectedAlert`, click `[ NEXT CAPTCHA VERIFICATION ]`.
  2. Confirm state machine transitions strictly to `REVERSED_CAPTCHA` (text challenge), never bypassing to `OPENCV_INITIALIZING` or `OPENCV_SCANNING`.

---

## 8. Correct CAPTCHA Celebration & Access Denied Reveal
- **Test Objective**: Verify correct answer handling in `ReversedCaptcha.jsx`.
- **Steps**:
  1. On `REVERSED_CAPTCHA` screen, type `A7K9M4` and click `SUBMIT CHALLENGE`.
  2. Confirm transition to `CAPTCHA_RESULT` state.
  3. Verify canvas confetti celebration triggers.
  4. Verify headers: `🎉 CONGRATULATIONS!`, `CAPTCHA CORRECT — VERIFICATION COMPLETE`.
  5. Verify access denied box: `ACCESS DENIED / REASON: HUMAN BEING DETECTED.`, `"Excellent work. You successfully proved that you are human."`, `"Unfortunately, humans are not permitted here."`.
  6. Click `[ CONTINUE TO NEXT VERIFICATION ]` and confirm transition to `OPENCV_INITIALIZING`.

---

## 9. Incorrect CAPTCHA Auto-Progression
- **Test Objective**: Verify incorrect answer handling in `ReversedCaptcha.jsx`.
- **Steps**:
  1. Enter incorrect characters (e.g. `XXXXXX`) and submit.
  2. Verify copy: `"Unexpectedly machine-like behavior detected."`.
  3. Confirm auto-progression to `OPENCV_INITIALIZING` after ~1.8 seconds delay without requiring CTA click.

---

## 10. OpenCV Presentation Delay & Backend Integration
- **Test Objective**: Verify transition screen copy and 5–10s presentation scan delay.
- **Steps**:
  1. Observe `OPENCV_INITIALIZING` state display: `VISION VERIFICATION INITIALIZING...`, `"Enough behavioral analysis."`, `"Show us what you are."`.
  2. Confirm camera feed loads from `/api/video_feed` and status polls `/api/opencv-status`.
  3. Verify that scanning presentation is shown for at least 6 seconds (presentation delay) before final verdict transition occurs.
  4. Confirm verdict outcome matches actual backend result (`ROBOT_VERIFIED` -> `ROBOT_VERIFIED`, `HUMAN_DETECTED`/`DENIED` -> `ACCESS_DENIED`).

---

## 11. Full State & Backend Reset Verification
- **Test Objective**: Verify `resetAll()` clears all new frontend state and calls `/api/reset`.
- **Steps**:
  1. Reach final screen (`PROTECTED_SITE` or `ACCESS_DENIED`).
  2. Click `RESTART VERIFICATION` / `RESTART SYSTEM`.
  3. Verify network call POST `/api/reset` is issued.
  4. Confirm all local states (boot timer, checkbox state, target position, relocation count, cursor metrics, RAF loops, CAPTCHA input/result) reset completely.
  5. Confirm app returns to `CHECKBOX_CARD` state without full browser page reload.
