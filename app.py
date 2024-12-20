import os
import time
import asyncio
from flask_cors import CORS
import aiohttp
from flask import Flask, send_from_directory, request, jsonify
from pynput.mouse import Listener as MouseListener
import threading
import webview

app = Flask(__name__, static_folder='build', static_url_path='')
CORS(app)

# Global variables for idle detection
last_activity_time = time.time()
tracking_id = None  # Will be set by React frontend
IDLE_THRESHOLD = 300  # 5 minutes

# Serve React frontend
@app.route('/', defaults={'path': ''})
@app.route('/login', defaults={'path': ''})
@app.route('/homescreen', defaults={'path': ''})
@app.route('/<path:path>')
def serve_react_app(path):
    return send_from_directory(app.static_folder, 'index.html')

# API endpoint to receive tracking ID from React app
@app.route('/api/set-tracking-id', methods=['POST'])
async def set_tracking_id():
    global tracking_id
    data = await request.get_json()
    tracking_id = data.get('trackingId')
    return jsonify({'message': 'Tracking ID saved successfully'}), 200

# Asynchronous function to detect idle time and send it to Node.js server
async def send_idle_data():
    if tracking_id is None:
        return  # If tracking ID is not set, don't send data

    idle_time = int(time.time() - last_activity_time)

    node_url = 'http://localhost:5000/api/employee/idle-time'  # Node.js server endpoint
    data = {
        'tracking_id': tracking_id,
        'idle_time': idle_time,
    }

    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(node_url, json=data) as response:
                if response.status == 200:
                    print("Idle data sent to Node.js server")
                else:
                    print("Error sending data to Node.js server")
    except Exception as e:
        print(f"Error sending idle data: {e}")

# Monitor mouse activity (mouse move, click, or scroll)
def on_activity(x=None, y=None, button=None, pressed=False):
    global last_activity_time
    last_activity_time = time.time()

# Start idle detection in separate threads (not processes)
def start_idle_detection():
    # Function to start mouse listener in a non-blocking way
    def start_mouse_listener():
        mouse_listener = MouseListener(on_move=on_activity, on_click=on_activity, on_scroll=on_activity)
        mouse_listener.start()
        mouse_listener.join()  # Wait for listener to finish (will block, but no crash)

    # Start mouse listener in a separate thread
    mouse_thread = threading.Thread(target=start_mouse_listener, daemon=True)
    mouse_thread.start()

    # Periodically check for idle time and send data asynchronously
    async def check_idle_time():
        while True:
            await asyncio.sleep(10)  # Non-blocking sleep for 10 seconds
            if time.time() - last_activity_time >= IDLE_THRESHOLD:
                await send_idle_data()  # Use the current event loop to send data

    # Start the idle time checking task
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    loop.create_task(check_idle_time())
    loop.run_forever()  # Run the event loop in this process

# Flask route to start idle detection in the background
@app.before_request
def before_request():
    # Start idle detection in a separate thread to avoid blocking Flask server
    threading.Thread(target=start_idle_detection, daemon=True).start()

# Function to start Flask in a separate thread
def run_flask():
    app.run(debug=False, host='0.0.0.0', port=5001)

# Function to run pywebview
def run_webview():
    webview.create_window('MedRevN LLC', 'http://127.0.0.1:5001')
    webview.start()

if __name__ == '__main__':
    # Start Flask in a separate thread
    flask_thread = threading.Thread(target=run_flask)
    flask_thread.daemon = True
    flask_thread.start()

    # Run pywebview to show the React app
    run_webview()
