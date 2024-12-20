# from pynput.mouse import Listener
# import logging

# # Set up logging configuration
# logging.basicConfig(filename="mouse_log.txt", level=logging.INFO, format="%(asctime)s - %(message)s")

# # This function is called whenever the mouse moves
# def on_move(x, y):
#     try:
#         # Log the mouse coordinates
#         logging.info(f"Mouse moved to ({x}, {y})")
#     except Exception as e:
#         logging.error(f"Error while logging mouse movement: {e}")

# def on_click(x, y, button, pressed):
#     if not pressed:  # Log when mouse button is released
#         logging.info(f"Mouse button released at ({x}, {y})")

# # This function starts the listener and listens for mouse events
# def start_listener():
#     with Listener(on_move=on_move, on_click=on_click) as listener:
#         listener.join()

# if __name__ == "__main__":
#     print("Tracking mouse movements... Press Ctrl+C to stop.")
#     start_listener()
import pyautogui
import time
import logging

# Set up logging configuration
logging.basicConfig(filename="mouse_log.txt", level=logging.INFO, format="%(asctime)s - %(message)s")

# Function to log the mouse position
def log_mouse_position():
    previous_position = None
    try:
        while True:
            # Get the current position of the mouse
            current_position = pyautogui.position()

            # Check if the mouse has moved
            if current_position != previous_position:
                # Log the new position
                logging.info(f"Mouse moved to {current_position}")
                previous_position = current_position

            # Sleep for a short time to reduce CPU usage
            time.sleep(0.1)

    except KeyboardInterrupt:
        print("Stopped tracking mouse movements.")
        logging.info("Mouse tracking stopped.")

if __name__ == "__main__":
    print("Tracking mouse movements... Press Ctrl+C to stop.")
    log_mouse_position()
