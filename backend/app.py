from flask import Flask, jsonify, Response
from flask_cors import CORS
from opencv_bridge import bridge

app = Flask(__name__)
CORS(app)

@app.route('/api/status', methods=['GET'])
def get_status():
    return jsonify({
        "status": "online",
        "service": "ENTHIRAN 3.O Backend",
        "opencv": bridge.get_status()
    })

@app.route('/api/start-verification', methods=['POST'])
def start_verification():
    success = bridge.start_verification()
    if success:
        return jsonify({"success": True, "message": "OpenCV verification started", "status": bridge.get_status()})
    else:
        return jsonify({"success": False, "message": "Failed to open camera"}), 500

@app.route('/api/stop-verification', methods=['POST'])
def stop_verification():
    bridge.stop_verification()
    return jsonify({"success": True, "message": "OpenCV verification stopped", "status": bridge.get_status()})

@app.route('/api/opencv-status', methods=['GET'])
def opencv_status():
    return jsonify(bridge.get_status())

@app.route('/api/video_feed', methods=['GET'])
def video_feed():
    if not bridge.get_status()["is_active"]:
        bridge.start_verification()
    return Response(bridge.generate_mjpeg(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/api/reset', methods=['POST'])
def reset():
    bridge.reset()
    return jsonify({"success": True, "message": "Backend state reset complete", "status": bridge.get_status()})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True, threaded=True)
