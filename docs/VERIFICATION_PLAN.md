# ENTHIRAN 3.O — Comprehensive Verification & Test Plan

This document outlines the test suite and manual verification steps for ENTHIRAN 3.O.

---

## Verification Test Cases

### 1. Exactly 10-Second Cinematic Boot
- **Test**: Launch application and measure `LoadingScreen` duration.
- **Expected Result**: Progress bar animates smoothly via `requestAnimationFrame` from 0% to 100% over exactly 10,000ms (`BOOT_DURATION_MS = 10000;`). `photo1.png` displays floating/rotation/glitch animations. Rotates through all 7 status messages evenly. Pauses on "100% SYSTEM READY" for ~600ms before advancing to `CHECKBOX_CARD`.

### 2. Asset Swap Compatibility
- **Test**: Replace placeholder image files at `frontend/public/assets/photo1.png` and `frontend/public/assets/photo2.png` with production PNG graphics.
- **Expected Result**: Assets update seamlessly in the UI without requiring any code or path modifications.

### 3. Target Relocation Cap (Task 01)
- **Test**: Move mouse cursor within proximity radius (120px) of target.
- **Expected Result**: Target relocates smoothly via CSS transitions (never instant teleportation). Relocations cap strictly at 2 or 3 attempts (chosen at task start). After reaching cap, target stabilizes and becomes clickable.

### 4. Natural Interaction Duration
- **Test**: Perform real mouse chase in Task 01.
- **Expected Result**: Task interaction naturally spans ~10–15 seconds before score reaches 100% or target is clicked.

### 5. Deterministic Behavior Telemetry
- **Test**: Track live telemetry displays during Task 01.
- **Expected Result**: `HUMAN BEHAVIOR XX%` and `ROBOT BEHAVIOR XX%` always sum to exactly 100 (`robotPercent = 100 - humanPercent`). Formula is purely monotonic and deterministic (identical cursor trajectory yields identical score progression).

### 6. Immediate Halt at 100% Human Score
- **Test**: Allow Human score to reach 100% during Task 01.
- **Expected Result**: In the exact same frame tick, RAF loop stops, event listeners are detached, timer freezes, target locks visually, and system transitions immediately to `HUMAN_DETECTED`.

### 7. Precise Terminology Enforcement
- **Test**: Inspect text copy on `HUMAN_DETECTED` and `ACCESS_DENIED` screens.
- **Expected Result**: Terminology strictly uses "HUMAN DETECTED", "HUMAN BEHAVIOR CONFIRMED", and "ROBOT BEHAVIOR". Never uses ambiguous phrasing like "robot is human".

### 8. Strict State Transition Routing
- **Test**: Click `[ NEXT CAPTCHA VERIFICATION ]` on `HUMAN_DETECTED` screen.
- **Expected Result**: Flow strictly transitions to `REVERSED_CAPTCHA`. `HUMAN_DETECTED` never bypasses directly to `OPENCV_*` states.

### 9. Correct CAPTCHA Celebration & Reveal
- **Test**: Enter correct code `A7K9M4` in `REVERSED_CAPTCHA`.
- **Expected Result**: Triggers particle confetti celebration, displays "🎉 CONGRATULATIONS!", followed by "ACCESS DENIED - REASON: HUMAN BEING DETECTED" copy and `[ CONTINUE TO NEXT VERIFICATION ]` CTA.

### 10. Incorrect CAPTCHA Auto-Progression
- **Test**: Enter wrong string in `REVERSED_CAPTCHA`.
- **Expected Result**: Displays "Unexpectedly machine-like behavior detected." and auto-progresses after ~1.5–2s delay to `OPENCV_INITIALIZING`.

### 11. OpenCV Scanner Presentation Delay
- **Test**: Trigger OpenCV vision scan stage.
- **Expected Result**: Transition copy "VISION VERIFICATION INITIALIZING..." displays first. Scanning presentation (live camera feed `/api/video_feed`, HUD, scanlines) runs for 5–10 seconds before presenting verdict, maintaining true underlying OpenCV detection outcome.

### 12. Full State Reset
- **Test**: Trigger `resetAll()` from final `PROTECTED_SITE` or `ACCESS_DENIED` screen.
- **Expected Result**: Clears boot timers, checkbox state, Task 01 RAF loop/metrics, CAPTCHA inputs, and calls `/api/reset` backend endpoint without full page reload.

---

## Automated Build & Verification Commands

```bash
# Frontend build verification
cd frontend
npm install
npm run build

# Backend startup verification
cd ../backend
python app.py
```
