import cv2

# Open camera
camera = cv2.VideoCapture(0)

if not camera.isOpened():
    print("Camera could not be opened.")
    exit()

# Load face detector
face_detector = cv2.CascadeClassifier(
    cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
)

print("ROBOCAPTCHA Started")
print("Human detection active")
print("Press Q to quit")

while True:
    success, frame = camera.read()

    if not success:
        print("Could not read camera frame.")
        break

    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

    faces = face_detector.detectMultiScale(
        gray,
        scaleFactor=1.1,
        minNeighbors=5,
        minSize=(60, 60)
    )

    # If a human face is detected
    if len(faces) > 0:

        # Dark overlay
        overlay = frame.copy()
        cv2.rectangle(
            overlay,
            (0, 0),
            (frame.shape[1], frame.shape[0]),
            (0, 0, 0),
            -1
        )

        frame = cv2.addWeighted(frame, 0.4, overlay, 0.6, 0)

        # Main message
        cv2.putText(
            frame,
            "HUMAN DETECTED",
            (70, 100),
            cv2.FONT_HERSHEY_SIMPLEX,
            1.2,
            (0, 0, 255),
            3
        )

        cv2.putText(
            frame,
            "ACCESS DENIED",
            (95, 160),
            cv2.FONT_HERSHEY_SIMPLEX,
            1.1,
            (0, 0, 255),
            3
        )

        cv2.putText(
            frame,
            "ROBOTS ONLY",
            (125, 220),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.9,
            (255, 255, 255),
            2
        )

        # Face boxes
        for (x, y, w, h) in faces:
            cv2.rectangle(
                frame,
                (x, y),
                (x + w, y + h),
                (0, 0, 255),
                2
            )

    else:
        cv2.putText(
            frame,
            "SCANNING...",
            (40, 50),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.8,
            (255, 255, 255),
            2
        )

    cv2.imshow("ROBOCAPTCHA - HUMAN SECURITY SYSTEM", frame)

    # Press Q to quit
    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

camera.release()
cv2.destroyAllWindows()