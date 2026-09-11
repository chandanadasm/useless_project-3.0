import cv2
import numpy as np
import threading
import time
import os

class OpenCVBridge:
    def __init__(self):
        self.lock = threading.Lock()
        self.camera = None
        self.is_running = False
        self.current_frame = None
        self.status = {
            "is_active": False,
            "face_detected": False,
            "robot_verified": False,
            "good_matches": 0,
            "inliers": 0,
            "verdict": "IDLE"  # IDLE, SCANNING, HUMAN_DETECTED, ROBOT_VERIFIED, DENIED
        }
        
        # Load Face Cascade
        self.face_detector = cv2.CascadeClassifier(
            cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
        )
        
        # Load ORB & Reference Images
        self.orb = cv2.ORB_create(nfeatures=3000)
        self.matcher = cv2.BFMatcher(cv2.NORM_HAMMING)
        
        self.robot_data = []
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        robot_files = ["robot1.jpg", "robot2.jpg", "robot3.jpg"]
        
        for filename in robot_files:
            file_path = os.path.join(base_dir, filename)
            if not os.path.exists(file_path):
                file_path = filename
            image = cv2.imread(file_path)
            if image is not None:
                gray_image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
                keypoints, descriptors = self.orb.detectAndCompute(gray_image, None)
                if descriptors is not None and len(keypoints) >= 10:
                    self.robot_data.append({
                        "name": filename,
                        "keypoints": keypoints,
                        "descriptors": descriptors
                    })

    def start_verification(self):
        with self.lock:
            if self.is_running:
                return True
            self.camera = cv2.VideoCapture(0, cv2.CAP_DSHOW)
            if not self.camera.isOpened():
                self.camera = cv2.VideoCapture(0)
            if not self.camera.isOpened():
                return False
            
            self.is_running = True
            self.status = {
                "is_active": True,
                "face_detected": False,
                "robot_verified": False,
                "good_matches": 0,
                "inliers": 0,
                "verdict": "SCANNING"
            }
            
            thread = threading.Thread(target=self._process_loop, daemon=True)
            thread.start()
            return True

    def stop_verification(self):
        with self.lock:
            self.is_running = False
            if self.camera:
                self.camera.release()
                self.camera = None
            self.status["is_active"] = False
            self.status["verdict"] = "IDLE"

    def reset(self):
        self.stop_verification()
        with self.lock:
            self.status = {
                "is_active": False,
                "face_detected": False,
                "robot_verified": False,
                "good_matches": 0,
                "inliers": 0,
                "verdict": "IDLE"
            }

    def get_status(self):
        with self.lock:
            return dict(self.status)

    def _process_loop(self):
        while True:
            with self.lock:
                if not self.is_running or not self.camera:
                    break
                success, frame = self.camera.read()
            
            if not success:
                time.sleep(0.03)
                continue
            
            # Mirror frame
            frame = cv2.flip(frame, 1)
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            
            # 1. Detect faces
            faces = self.face_detector.detectMultiScale(
                gray, scaleFactor=1.1, minNeighbors=5, minSize=(60, 60)
            )
            
            # 2. Detect camera features
            camera_keypoints, camera_descriptors = self.orb.detectAndCompute(gray, None)
            
            best_inliers = 0
            best_good_matches = 0
            best_robot = ""
            
            if camera_descriptors is not None:
                for robot in self.robot_data:
                    matches = self.matcher.knnMatch(robot["descriptors"], camera_descriptors, k=2)
                    good_matches = []
                    for pair in matches:
                        if len(pair) == 2:
                            m, n = pair
                            if m.distance < 0.70 * n.distance:
                                good_matches.append(m)
                    
                    inliers = 0
                    if len(good_matches) >= 8:
                        src_pts = np.float32([robot["keypoints"][m.queryIdx].pt for m in good_matches]).reshape(-1, 1, 2)
                        dst_pts = np.float32([camera_keypoints[m.trainIdx].pt for m in good_matches]).reshape(-1, 1, 2)
                        matrix, mask = cv2.findHomography(src_pts, dst_pts, cv2.RANSAC, 5.0)
                        if mask is not None:
                            inliers = int(np.sum(mask))
                    
                    if inliers > best_inliers:
                        best_inliers = inliers
                        best_good_matches = len(good_matches)
                        best_robot = robot["name"]
            
            robot_verified = (best_good_matches >= 12 and best_inliers >= 8)
            face_detected = len(faces) > 0
            
            # Annotate Frame
            if face_detected:
                for (x, y, w, h) in faces:
                    cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 0, 255), 3)
                cv2.putText(frame, "HUMAN DETECTED", (40, 90), cv2.FONT_HERSHEY_SIMPLEX, 1.0, (0, 0, 255), 3)
                cv2.putText(frame, "ACCESS DENIED", (50, 145), cv2.FONT_HERSHEY_SIMPLEX, 1.0, (0, 0, 255), 3)
                cv2.putText(frame, "ROBOTS ONLY", (80, 200), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 2)
                verdict = "HUMAN_DETECTED"
            elif robot_verified:
                cv2.putText(frame, "ROBOT VERIFIED!", (45, 90), cv2.FONT_HERSHEY_SIMPLEX, 1.0, (0, 255, 0), 3)
                cv2.putText(frame, "ACCESS GRANTED", (50, 145), cv2.FONT_HERSHEY_SIMPLEX, 1.0, (0, 255, 0), 3)
                cv2.putText(frame, f"MATCH: {best_good_matches} INLIERS: {best_inliers}", (25, 430), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
                verdict = "ROBOT_VERIFIED"
            else:
                cv2.putText(frame, "ACCESS DENIED", (50, 130), cv2.FONT_HERSHEY_SIMPLEX, 1.0, (0, 0, 255), 3)
                cv2.putText(frame, "ROBOT NOT VERIFIED", (45, 185), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 2)
                verdict = "DENIED"
            
            with self.lock:
                self.current_frame = frame.copy()
                self.status["face_detected"] = face_detected
                self.status["robot_verified"] = robot_verified
                self.status["good_matches"] = best_good_matches
                self.status["inliers"] = best_inliers
                self.status["verdict"] = verdict
            
            time.sleep(0.03)

    def generate_mjpeg(self):
        while True:
            with self.lock:
                if not self.is_running or self.current_frame is None:
                    break
                ret, buffer = cv2.imencode('.jpg', self.current_frame)
                if not ret:
                    continue
                frame_bytes = buffer.tobytes()
            
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
            time.sleep(0.04)

bridge = OpenCVBridge()
