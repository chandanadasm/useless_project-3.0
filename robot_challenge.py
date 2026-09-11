import cv2
import numpy as np

# ==========================================
# CAMERA
# ==========================================

camera = cv2.VideoCapture(0, cv2.CAP_DSHOW)

if not camera.isOpened():
    print("Camera could not be opened.")
    exit()


# ==========================================
# FACE DETECTOR
# ==========================================

face_detector = cv2.CascadeClassifier(
    cv2.data.haarcascades +
    "haarcascade_frontalface_default.xml"
)


# ==========================================
# ROBOT REFERENCE IMAGES
# ==========================================

robot_files = [
    "robot1.jpg",
    "robot2.jpg",
    "robot3.jpg"
]


# ==========================================
# ORB FEATURE DETECTOR
# ==========================================

orb = cv2.ORB_create(
    nfeatures=3000
)


# ==========================================
# LOAD ALL 3 ROBOT IMAGES
# ==========================================

robot_data = []

for filename in robot_files:

    image = cv2.imread(filename)

    if image is None:
        print("ERROR: Could not load", filename)
        continue

    gray_image = cv2.cvtColor(
        image,
        cv2.COLOR_BGR2GRAY
    )

    keypoints, descriptors = orb.detectAndCompute(
        gray_image,
        None
    )

    if descriptors is not None and len(keypoints) >= 10:

        robot_data.append({
            "name": filename,
            "keypoints": keypoints,
            "descriptors": descriptors
        })

        print(
            "Loaded:",
            filename,
            "| Features:",
            len(keypoints)
        )

    else:

        print(
            "WARNING:",
            filename,
            "has too few features."
        )


if len(robot_data) == 0:

    print("ERROR: No robot reference images loaded.")

    camera.release()
    exit()


# ==========================================
# MATCHER
# ==========================================

matcher = cv2.BFMatcher(
    cv2.NORM_HAMMING
)


print()
print("===================================")
print("        ROBOCAPTCHA READY")
print("===================================")
print("Robot images loaded:", len(robot_data))
print("Press Q to quit.")
print()


# ==========================================
# MAIN LOOP
# ==========================================

while True:

    success, frame = camera.read()

    if not success:
        print("Camera frame error.")
        break


    # Mirror camera
    frame = cv2.flip(frame, 1)


    gray = cv2.cvtColor(
        frame,
        cv2.COLOR_BGR2GRAY
    )


    # ======================================
    # STEP 1
    # CHECK HUMAN FACE
    # ======================================

    faces = face_detector.detectMultiScale(
        gray,
        scaleFactor=1.1,
        minNeighbors=5,
        minSize=(60, 60)
    )


    # ======================================
    # STEP 2
    # FIND CAMERA FEATURES
    # ======================================

    camera_keypoints, camera_descriptors = \
        orb.detectAndCompute(
            gray,
            None
        )


    # ======================================
    # ROBOT VERIFICATION
    # ======================================

    best_inliers = 0
    best_good_matches = 0
    best_robot = ""

    if camera_descriptors is not None:

        for robot in robot_data:

            matches = matcher.knnMatch(
                robot["descriptors"],
                camera_descriptors,
                k=2
            )


            # ----------------------------------
            # RATIO TEST
            # ----------------------------------

            good_matches = []

            for pair in matches:

                if len(pair) != 2:
                    continue

                m, n = pair

                if m.distance < 0.70 * n.distance:

                    good_matches.append(m)


            # ----------------------------------
            # HOMOGRAPHY VERIFICATION
            # ----------------------------------

            inliers = 0

            if len(good_matches) >= 8:

                source_points = np.float32([
                    robot["keypoints"][m.queryIdx].pt
                    for m in good_matches
                ]).reshape(-1, 1, 2)


                destination_points = np.float32([
                    camera_keypoints[m.trainIdx].pt
                    for m in good_matches
                ]).reshape(-1, 1, 2)


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


            # ----------------------------------
            # KEEP BEST ROBOT
            # ----------------------------------

            if inliers > best_inliers:

                best_inliers = inliers

                best_good_matches = len(
                    good_matches
                )

                best_robot = robot["name"]


    # ======================================
    # FINAL ROBOT CONDITION
    # ======================================

    # VERY IMPORTANT:
    #
    # Robot is accepted ONLY when:
    # 1. Enough good matches exist
    # 2. Those matches are spatially consistent
    #    through homography/RANSAC
    #
    robot_verified = (
        best_good_matches >= 12
        and
        best_inliers >= 8
    )


    # ======================================
    # FINAL DECISION
    # ======================================

    # --------------------------------------
    # HUMAN HAS PRIORITY
    # --------------------------------------

    if len(faces) > 0:

        for (x, y, w, h) in faces:

            cv2.rectangle(
                frame,
                (x, y),
                (x + w, y + h),
                (0, 0, 255),
                3
            )


        cv2.putText(
            frame,
            "HUMAN DETECTED",
            (40, 90),
            cv2.FONT_HERSHEY_SIMPLEX,
            1.0,
            (0, 0, 255),
            3
        )


        cv2.putText(
            frame,
            "ACCESS DENIED",
            (50, 145),
            cv2.FONT_HERSHEY_SIMPLEX,
            1.0,
            (0, 0, 255),
            3
        )


        cv2.putText(
            frame,
            "ROBOTS ONLY",
            (80, 200),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.8,
            (255, 255, 255),
            2
        )


    # --------------------------------------
    # NO HUMAN + REAL ROBOT MATCH
    # --------------------------------------

    elif robot_verified:

        cv2.putText(
            frame,
            "ROBOT VERIFIED!",
            (45, 90),
            cv2.FONT_HERSHEY_SIMPLEX,
            1.0,
            (0, 255, 0),
            3
        )


        cv2.putText(
            frame,
            "ACCESS GRANTED",
            (50, 145),
            cv2.FONT_HERSHEY_SIMPLEX,
            1.0,
            (0, 255, 0),
            3
        )


        cv2.putText(
            frame,
            "ROBOT ONLY ACCESS",
            (55, 200),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.75,
            (255, 255, 255),
            2
        )


        cv2.putText(
            frame,
            f"MATCH: {best_good_matches}",
            (25, 430),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.6,
            (255, 255, 255),
            2
        )


        cv2.putText(
            frame,
            f"INLIERS: {best_inliers}",
            (25, 460),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.6,
            (255, 255, 255),
            2
        )


    # --------------------------------------
    # NOTHING / NOT A VERIFIED ROBOT
    # --------------------------------------

    else:

        cv2.putText(
            frame,
            "ACCESS DENIED",
            (50, 130),
            cv2.FONT_HERSHEY_SIMPLEX,
            1.0,
            (0, 0, 255),
            3
        )


        cv2.putText(
            frame,
            "ROBOT NOT VERIFIED",
            (45, 185),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.8,
            (255, 255, 255),
            2
        )


    # ======================================
    # SHOW WINDOW
    # ======================================

    cv2.imshow(
        "ROBOCAPTCHA",
        frame
    )


    # ======================================
    # QUIT
    # ======================================

    if cv2.waitKey(1) & 0xFF == ord("q"):
        break


# ==========================================
# CLEANUP
# ==========================================

camera.release()
cv2.destroyAllWindows()