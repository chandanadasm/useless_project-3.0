import cv2
import numpy as np
import os
import time
from pathlib import Path


# ============================================================
# ROBOCAPTCHA 3.0
# OpenCV Camera + Face Detection + ORB Robot Verification
# ============================================================


print("\n========================================")
print("        ROBOCAPTCHA 3.0")
print("     OPENCV ENTITY SCANNER")
print("========================================\n")


# ============================================================
# PROJECT DIRECTORY
# ============================================================

BASE_DIR = Path(__file__).resolve().parent

print("Project folder:")
print(BASE_DIR)
print()


# ============================================================
# CAMERA
# ============================================================

print("Opening camera...")

camera = cv2.VideoCapture(0, cv2.CAP_DSHOW)

if not camera.isOpened():

    # fallback
    camera = cv2.VideoCapture(0)

if not camera.isOpened():

    print("ERROR: Camera could not be opened.")
    print("Check whether another application is using the camera.")
    exit()

# Camera settings
camera.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
camera.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
camera.set(cv2.CAP_PROP_FPS, 30)

print("Camera: READY")
print()


# ============================================================
# FACE DETECTOR
# ============================================================

cascade_path = (
    cv2.data.haarcascades +
    "haarcascade_frontalface_default.xml"
)

face_detector = cv2.CascadeClassifier(cascade_path)

if face_detector.empty():

    print("ERROR: Haar cascade could not be loaded.")
    camera.release()
    exit()

print("Face detector: READY")


# ============================================================
# ROBOT REFERENCE IMAGES
# ============================================================

robot_files = [
    BASE_DIR / "robot1.jpg",
    BASE_DIR / "robot2.jpg",
    BASE_DIR / "robot3.jpg"
]


# ============================================================
# ORB
# ============================================================

orb = cv2.ORB_create(
    nfeatures=2500,
    scaleFactor=1.2,
    nlevels=8,
    edgeThreshold=31,
    fastThreshold=20
)


# ============================================================
# LOAD ROBOT REFERENCES
# ============================================================

robot_data = []


print("\nLoading robot reference images...")
print("----------------------------------------")


for image_path in robot_files:

    print("Checking:", image_path.name)

    if not image_path.exists():

        print("  ERROR: File not found!")
        print("  Expected:", image_path)
        continue


    image = cv2.imread(
        str(image_path),
        cv2.IMREAD_GRAYSCALE
    )


    if image is None:

        print("  ERROR: Could not read image.")
        continue


    # Resize very large reference images
    max_width = 1000

    if image.shape[1] > max_width:

        ratio = max_width / image.shape[1]

        image = cv2.resize(
            image,
            None,
            fx=ratio,
            fy=ratio
        )


    keypoints, descriptors = orb.detectAndCompute(
        image,
        None
    )


    if descriptors is None or len(keypoints) < 10:

        print(
            "  WARNING: Too few features:",
            len(keypoints) if keypoints else 0
        )

        continue


    robot_data.append({

        "name": image_path.name,

        "keypoints": keypoints,

        "descriptors": descriptors

    })


    print(
        "  LOADED:",
        image_path.name,
        "| Features:",
        len(keypoints)
    )


print("----------------------------------------")



# ============================================================
# CHECK REFERENCES
# ============================================================

if len(robot_data) == 0:

    print("\nERROR: No robot reference images loaded.")
    print()
    print("Make sure these files are inside:")
    print(BASE_DIR)
    print()
    print("robot1.jpg")
    print("robot2.jpg")
    print("robot3.jpg")
    print()

    camera.release()
    exit()


print(
    "\nRobot references loaded:",
    len(robot_data)
)


# ============================================================
# MATCHER
# ============================================================

matcher = cv2.BFMatcher(
    cv2.NORM_HAMMING,
    crossCheck=False
)


# ============================================================
# STABILITY SETTINGS
# ============================================================

# Prevent the status from rapidly jumping between states.

ROBOT_REQUIRED_FRAMES = 3
HUMAN_REQUIRED_FRAMES = 2

robot_counter = 0
human_counter = 0


# ============================================================
# FPS
# ============================================================

previous_time = time.time()

fps = 0


# ============================================================
# MAIN LOOP
# ============================================================

print("\n========================================")
print("       ROBOCAPTCHA READY")
print("========================================")
print()
print("Show a robot reference image to camera.")
print("Human face -> ACCESS DENIED")
print("Verified robot -> ACCESS GRANTED")
print("Press Q to quit.")
print()


while True:


    # ========================================================
    # CAMERA FRAME
    # ========================================================

    success, frame = camera.read()


    if not success:

        print("WARNING: Camera frame error.")
        continue


    # Mirror camera
    frame = cv2.flip(
        frame,
        1
    )


    # ========================================================
    # RESIZE FOR PROCESSING
    # ========================================================

    # Keep processing fast

    gray = cv2.cvtColor(
        frame,
        cv2.COLOR_BGR2GRAY
    )


    # ========================================================
    # FACE DETECTION
    # ========================================================

    faces = face_detector.detectMultiScale(

        gray,

        scaleFactor=1.1,

        minNeighbors=5,

        minSize=(60, 60)
    )


    # ========================================================
    # ORB CAMERA FEATURES
    # ========================================================

    camera_keypoints, camera_descriptors = \
        orb.detectAndCompute(
            gray,
            None
        )


    # ========================================================
    # DEFAULT VALUES
    # ========================================================

    best_inliers = 0

    best_good_matches = 0

    best_robot = "NONE"


    # ========================================================
    # ROBOT MATCHING
    # ========================================================

    if camera_descriptors is not None and \
       camera_keypoints is not None and \
       len(camera_keypoints) >= 10:


        for robot in robot_data:


            try:

                matches = matcher.knnMatch(

                    robot["descriptors"],

                    camera_descriptors,

                    k=2
                )

            except cv2.error:

                continue


            # =================================================
            # RATIO TEST
            # =================================================

            good_matches = []


            for pair in matches:

                if len(pair) != 2:
                    continue


                m, n = pair


                if m.distance < 0.72 * n.distance:

                    good_matches.append(m)


            # =================================================
            # HOMOGRAPHY
            # =================================================

            inliers = 0


            if len(good_matches) >= 8:


                source_points = np.float32([

                    robot["keypoints"][
                        m.queryIdx
                    ].pt

                    for m in good_matches

                ]).reshape(
                    -1,
                    1,
                    2
                )


                destination_points = np.float32([

                    camera_keypoints[
                        m.trainIdx
                    ].pt

                    for m in good_matches

                ]).reshape(
                    -1,
                    1,
                    2
                )


                try:

                    matrix, mask = cv2.findHomography(

                        source_points,

                        destination_points,

                        cv2.RANSAC,

                        5.0
                    )


                    if mask is not None:

                        inliers = int(
                            np.sum(mask)
                        )

                except cv2.error:

                    inliers = 0


            # =================================================
            # BEST ROBOT
            # =================================================

            if inliers > best_inliers:

                best_inliers = inliers

                best_good_matches = len(
                    good_matches
                )

                best_robot = robot["name"]


    # ========================================================
    # ROBOT VERIFICATION
    # ========================================================

    robot_verified = (

        best_good_matches >= 10

        and

        best_inliers >= 6
    )


    # ========================================================
    # TEMPORAL STABILITY
    # ========================================================

    if len(faces) > 0:

        human_counter += 1

        robot_counter = 0

    elif robot_verified:

        robot_counter += 1

        human_counter = 0

    else:

        robot_counter = max(
            0,
            robot_counter - 1
        )

        human_counter = max(
            0,
            human_counter - 1
        )


    # ========================================================
    # FINAL STATE
    # ========================================================

    if human_counter >= HUMAN_REQUIRED_FRAMES:

        state = "HUMAN"


    elif robot_counter >= ROBOT_REQUIRED_FRAMES:

        state = "ROBOT"


    else:

        state = "SCANNING"


    # ========================================================
    # DRAW FACE BOX
    # ========================================================

    for (x, y, w, h) in faces:

        cv2.rectangle(

            frame,

            (x, y),

            (x + w, y + h),

            (0, 0, 255),

            3
        )


    # ========================================================
    # HEADER
    # ========================================================

    cv2.putText(

        frame,

        "ROBOCAPTCHA 3.0",

        (25, 35),

        cv2.FONT_HERSHEY_SIMPLEX,

        0.8,

        (255, 255, 255),

        2
    )


    cv2.putText(

        frame,

        "OPENCV ENTITY SCANNER",

        (25, 65),

        cv2.FONT_HERSHEY_SIMPLEX,

        0.55,

        (255, 255, 255),

        2
    )


    # ========================================================
    # HUMAN
    # ========================================================

    if state == "HUMAN":


        cv2.putText(

            frame,

            "HUMAN DETECTED",

            (35, 120),

            cv2.FONT_HERSHEY_SIMPLEX,

            0.9,

            (0, 0, 255),

            3
        )


        cv2.putText(

            frame,

            "ACCESS DENIED",

            (35, 165),

            cv2.FONT_HERSHEY_SIMPLEX,

            0.9,

            (0, 0, 255),

            3
        )


        cv2.putText(

            frame,

            "ROBOTS ONLY",

            (35, 210),

            cv2.FONT_HERSHEY_SIMPLEX,

            0.7,

            (255, 255, 255),

            2
        )


    # ========================================================
    # ROBOT
    # ========================================================

    elif state == "ROBOT":


        cv2.putText(

            frame,

            "ROBOT VERIFIED",

            (35, 120),

            cv2.FONT_HERSHEY_SIMPLEX,

            0.9,

            (0, 255, 0),

            3
        )


        cv2.putText(

            frame,

            "ACCESS GRANTED",

            (35, 165),

            cv2.FONT_HERSHEY_SIMPLEX,

            0.9,

            (0, 255, 0),

            3
        )


        cv2.putText(

            frame,

            f"REFERENCE: {best_robot}",

            (35, 210),

            cv2.FONT_HERSHEY_SIMPLEX,

            0.6,

            (255, 255, 255),

            2
        )


    # ========================================================
    # SCANNING
    # ========================================================

    else:


        cv2.putText(

            frame,

            "ANALYZING ENTITY...",

            (35, 120),

            cv2.FONT_HERSHEY_SIMPLEX,

            0.8,

            (255, 255, 255),

            2
        )


        cv2.putText(

            frame,

            "ACCESS DENIED",

            (35, 165),

            cv2.FONT_HERSHEY_SIMPLEX,

            0.9,

            (0, 0, 255),

            3
        )


    # ========================================================
    # MATCH INFORMATION
    # ========================================================

    cv2.putText(

        frame,

        f"ORB MATCHES: {best_good_matches}",

        (25, 420),

        cv2.FONT_HERSHEY_SIMPLEX,

        0.6,

        (255, 255, 255),

        2
    )


    cv2.putText(

        frame,

        f"INLIERS: {best_inliers}",

        (25, 450),

        cv2.FONT_HERSHEY_SIMPLEX,

        0.6,

        (255, 255, 255),

        2
    )


    # ========================================================
    # FPS
    # ========================================================

    current_time = time.time()

    elapsed = current_time - previous_time


    if elapsed > 0:

        fps = 1 / elapsed


    previous_time = current_time


    cv2.putText(

        frame,

        f"FPS: {fps:.1f}",

        (520, 30),

        cv2.FONT_HERSHEY_SIMPLEX,

        0.5,

        (255, 255, 255),

        1
    )


    # ========================================================
    # STATUS BAR
    # ========================================================

    cv2.putText(

        frame,

        f"STATUS: {state}",

        (400, 450),

        cv2.FONT_HERSHEY_SIMPLEX,

        0.55,

        (255, 255, 255),

        2
    )


    # ========================================================
    # SHOW
    # ========================================================

    cv2.imshow(

        "ROBOCAPTCHA 3.0",

        frame
    )


    # ========================================================
    # QUIT
    # ========================================================

    key = cv2.waitKey(1) & 0xFF


    if key == ord("q"):

        break


# ============================================================
# CLEANUP
# ============================================================

camera.release()

cv2.destroyAllWindows()


print("\nROBOCAPTCHA stopped.")