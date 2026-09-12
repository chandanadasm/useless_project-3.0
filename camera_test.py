import cv2

camera = cv2.VideoCapture(0, cv2.CAP_DSHOW)

if not camera.isOpened():
    print("ERROR: Camera could not be opened.")
    exit()

camera.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
camera.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)

print("ROBOCAPTCHA CAMERA STARTED")
print("Press Q to quit.")

while True:
    success, frame = camera.read()

    if not success or frame is None:
        print("ERROR: Frame not received")
        continue

    # Check whether frame is actually black/blank
    mean_value = frame.mean()
    print("Frame OK | brightness:", round(mean_value, 2))

    frame = cv2.flip(frame, 1)

    cv2.putText(
        frame,
        "CAMERA WORKING",
        (20, 40),
        cv2.FONT_HERSHEY_SIMPLEX,
        1,
        (0, 255, 0),
        2
    )

    cv2.imshow("ROBOCAPTCHA CAMERA TEST", frame)

    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

camera.release()
cv2.destroyAllWindows()

print("Camera stopped.")