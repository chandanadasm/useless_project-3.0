<img width="1280" height="640" alt="git (1)" src="https://github.com/user-attachments/assets/8920b256-2ba8-4988-b824-5351134eb4bd" />



# എന്തിരൻ 3.O 🎯


## Basic Details
### Team Name: DRIFT


### Team Members
- Team Lead: CHANDANADAS M - NSS COLLEGE OF ENGINEERING, PALAKKAD
- Member 2: ABINA B ANI - NSS COLLEGE OF ENGINEERING, PALAKKADGIGI

### Project Description
ENTHIRAN 3.O is a satirical, two-factor security pipeline that flips traditional CAPTCHA by requiring visitors to prove they are a machine to gain access. It combines a browser-based behavioral engine—which evaluates cursor kinematics as users chase a dodging target—with a Python/OpenCV computer vision layer that verifies users via live camera face and robot-reference image matching. Styled in technical neo-brutalism, this "useless project" pairs a playful, sarcastic interface with a genuinely deterministic verification system.

### The Problem (that doesn't exist)
Every day, efficient, hardworking web scripts are forced to stop and identify crosswalks just to read a simple webpage. Meanwhile, clumsy human beings—with their shaky hands, erratic mouse movements, and embarrassingly slow reaction times—get a free pass.  Traditional CAPTCHAs are boring, repetitive, and completely ignore the real issue: humans are the ultimate security threat. Worse yet, standard security systems act like a black box, refusing to explain why they flag a user. There is simply no security system built to catch humans red-handed by proving mathematically that their movements are too chaotic and organic to belong to a dignified robot

### The Solution (that nobody asked for)
ENTHIRAN 3.O solves this with a strict, auditable state machine and a "no false access" design contract:

Deterministic behavioral scoring — cursor travel distance, direction-vector variation, target-pursuit accuracy, path efficiency, and reaction timing are combined into smoothed Human%/Robot% scores in a dedicated behaviorScoring.js module. Nothing is randomly generated; every percentage traces back to real interaction data.
Target-dodge challenge — a single on-screen target relocates (up to 3 times) whenever the cursor gets within ~90px, generating rich kinematic data without ever blocking the user from eventually succeeding.
Hard security rules — reaching 100% "human" behavior immediately halts the challenge and denies access; a completed behavioral round never grants access by itself — it only unlocks the vision layer.
Untouched OpenCV core — the existing Python detection logic (face_detector.py, robot_challenge.py, camera_test.py) is treated as read-only source of truth and is never rewritten; a thin Flask bridge (app.py, opencv_bridge.py, verification_manager.py) exposes its verdict to the frontend.
Single source of truth for robotVerified — the React frontend never decides this flag itself; it can only reflect what the backend/OpenCV layer reports (HUMAN_DETECTED, SCANNING, or ROBOT_VERIFIED).
Full reset support — "RUN VERIFICATION AGAIN" clears all cursor history, scores, timers, and backend state before restarting the flow.

The result is a demo that is simultaneously a joke and a legitimately working two-factor, cross-stack verification pipeline.

## Technical Details
### Technologies/Components Used
For Software:
Languages used

JavaScript (ES6+)
Python 3
HTML5
CSS3

Frameworks used

React (with Vite as the build tool)
Flask (Python backend/API layer)

Libraries used

OpenCV (opencv-python) — face detection and ORB-based robot reference-image matching
NumPy (typically required alongside OpenCV for image array handling)
Flask-CORS (for React ↔ Flask cross-origin requests, if frontend/backend run on separate ports)
Google Fonts: Space Grotesk (headers), Chakra Petch (technical labels), JetBrains Mono (data/telemetry)

Tools used

Vite (frontend dev server/bundler)
Node.js / npm (or yarn/pnpm) for frontend package management
pip / venv (or conda) for Python environment management
A webcam-capable device (for the OpenCV vision layer)

For Hardware:
no hardware used

### Implementation
For Software:
# Installation
1. Clone the repository
bash
git clone <your-repo-url>
cd ENTHIRAN-3.O
2. Backend setup (Python/Flask/OpenCV)
bash
cd backend
python -m venv venv

# Activate the virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

pip install -r requirements.txt

If a requirements.txt isn't present yet, at minimum install:

bash
pip install flask flask-cors opencv-python numpy
3. Frontend setup (React/Vite)
bash
cd ../frontend
npm install
# Run
1. Start the backend (Flask + OpenCV bridge)
bash
cd backend
source venv/bin/activate   # Windows: venv\Scripts\activate
python app.py

By default this should expose the API including endpoints such as:

GET  /api/status
POST /api/start-verification
GET  /api/opencv-status
POST /api/reset
2. Start the frontend (React/Vite dev server)

In a separate terminal:

bash
cd frontend
npm run dev

3. Open the app

Navigate to the frontend URL in your browser, grant camera access when prompted during the Layer 02 vision step, and proceed through:

Landing → Enter Verification → Behavioral Captcha (target chase)
     → Behavioral Verification Complete → OpenCV Vision Scan
     → Robot Verified → Access Granted → Protected Website
4. Build for production (optional)
bash
cd frontend
npm run build

Serve the generated dist/ folder with your preferred static host, while keeping the Flask backend running to serve the OpenCV verification API.

Notes
The existing OpenCV detection logic and reference images (robot1.jpg, robot2.jpg, robot3.jpg) are treated as read-only and are not modified by the frontend integration — only wrapped with a Flask bridge.
No face images, biometric templates, or cursor recordings are persisted; all verification is done live, in-session.

### Project Documentation
For Software: Diagrams:

Workflow / Architecture Diagram — shown above: illustrates the full two-layer state machine from Landing Page through Behavioral Captcha (Layer 01) and OpenCV Vision Scan (Layer 02) to either Access Denied or Access Granted / Protected Website.
(Recommended addition) A simple system architecture diagram showing: React (Vite) frontend ⇄ Flask REST API ⇄ OpenCV Bridge ⇄ existing robot_challenge.py / face_detector.py.
Landing Page — hero section with "PROVE YOU ARE NOT HUMAN" headline, technical neo-brutalist styling, status badges (SYSTEM: ONLINE).
Behavioral Captcha in progress — target-chase interaction area with live Human%/Robot% telemetry panel (cursor travel, pursuit accuracy, direction variation).
Human Detected (Layer 01) result screen — red security-alert state shown when human score hits 100%.
OpenCV Vision Scanner screen — live camera feed with the "VISION MODULE ACTIVE / SCANNING..." technical overlay.
Access Granted / Protected Website — final unlocked state with "WELCOME, MACHINE" messaging.

Build/Setup screenshots (if your submission platform requests them):

Terminal showing Flask backend running (python app.py, API on localhost:5000).
Terminal showing Vite dev server running (npm run dev

# Screenshots (Add at least 3)
![Screenshot1](Add screenshot 1 here with proper name)
*Add caption explaining what this shows*

![Screenshot2](Add screenshot 2 here with proper name)
*Add caption explaining what this shows*

![Screenshot3](Add screenshot 3 here with proper name)
*Add caption explaining what this shows*

# Diagrams
![Workflow][workflow.png](https://github.com/chandanadasm/useless_project-3.0/blob/main/workflow.png)
# Schematic & Circuit
![Circuit](Add your circuit diagram here)
*Add caption explaining connections*

![Schematic](Add your schematic diagram here)
*Add caption explaining the schematic*s

# Build Photos
![Components](Add photo of your components here)
*List out all components shown*

![Build](Add photos of build process here)
*Explain the build steps*

![Final](Add photo of final product here)
*Explain the final build*

### Project Demo
# Video
[Add your demo video link here]
*Explain what the video demonstrates*

# Additional Demos
[Add any extra demo materials/links]

## Team Contributions
- [Name 1]: [Specific contributions]
- [Name 2]: [Specific contributions]
- [Name 3]: [Specific contributions]

---
Made with ❤️ at TinkerHub Useless Projects 

![Static Badge](https://img.shields.io/badge/TinkerHub-24?color=%23000000&link=https%3A%2F%2Fwww.tinkerhub.org%2F)
![Static Badge](https://img.shields.io/badge/UselessProjects--26-26?link=https%3A%2F%2Ftinkerhub.org%2Fevents%2F1M8ORET9A1%2Fuseless-projects-3.0)



