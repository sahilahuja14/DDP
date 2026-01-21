import cv2
from ultralytics import YOLO
import math

def main():
    # Load your custom-trained YOLOv8 model
    # Make sure 'best.pt' is in the same directory as this script
    try:
        model = YOLO('best.pt')
    except Exception as e:
        print(f"Error loading model 'best.pt'. Make sure the file is in the correct directory.")
        print(f"Error: {e}")
        return

    # To use your 'data.yaml' file to get class names (optional, but good practice)
    # You can also just rely on the model's built-in names
    # e.g., class_names = model.names
    # For this example, we'll just let the model handle class names.

    
    cap = cv2.VideoCapture(0)
    
    if not cap.isOpened():
        print("Error: Could not open webcam.")
        return

    print("Starting webcam feed. Press 'q' to quit.")

    while True:
        
        ret, frame = cap.read()
        
        if not ret:
            print("Error: Failed to capture frame.")
            break

        # Run YOLOv8 inference on the frame
        # stream=True is more efficient for video feeds
        results = model(frame, stream=True)

        # Process results and draw on the frame
        for r in results:
            # The .plot() method is a fast way to draw all boxes, labels, and confidences
            frame = r.plot()

            # --- Optional: Manual drawing (if you want more control) ---
            # boxes = r.boxes
            # for box in boxes:
            #     # Bounding box coordinates
            #     x1, y1, x2, y2 = box.xyxy[0]
            #     x1, y1, x2, y2 = int(x1), int(y1), int(x2), int(y2) # convert to int values
                
            #     # Confidence score
            #     confidence = math.ceil((box.conf[0] * 100)) / 100
            #     print(f"Confidence ---> {confidence}")
                
            #     # Class ID and Name
            #     cls_id = int(box.cls[0])
            #     cls_name = model.names[cls_id]
            #     print(f"Class Name ---> {cls_name}")

            #     # Draw the bounding box
            #     cv2.rectangle(frame, (x1, y1), (x2, y2), (255, 0, 255), 3)
                
            #     # Put text (class name and confidence)
            #     label = f'{cls_name} {confidence}'
            #     cv2.putText(frame, label, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (255, 0, 255), 2)
            # --- End of Manual Drawing ---

        # Display the annotated frame
        cv2.imshow('YOLOv8 Live Drone Detection', frame)

        # Break the loop if 'q' is pressed
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    # Release the webcam and destroy all windows
    cap.release()
    cv2.destroyAllWindows()
    print("Webcam feed stopped.")

if __name__ == "__main__":
    main()
