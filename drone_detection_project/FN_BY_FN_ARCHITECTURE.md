# Function-by-Function Architecture Diagram

## Scope Confirmed From Project Files
- Frontend: React (`frontend/src/App.jsx`) calls REST API with `axios`.
- Backend: Django + DRF (`Backend/detections/views.py`) serves detection, reporting, analytics, and fake training logs.
- Model runtime: Ultralytics YOLO (`Backend/detections/yolo_service.py`) with weights `best.pt`.
- OpenCV path: local standalone webcam detector (`local_detector.py`) using `cv2.VideoCapture(0)` + YOLO.
- Email alerts: custom SMTP backend + alert service (`drone_backend/email_backend.py`, `detections/email_service.py`).
- Live/recurring alerts: polling loop in frontend (`setInterval` every 2s) repeatedly posts frames to `/api/detect/`.
- WebSocket status: no runtime WebSocket implementation in source; live updates are polling-based.

## End-to-End Function Graph
```mermaid
flowchart TD
  %% Frontend
  subgraph FE[Frontend React - frontend/src/App.jsx]
    FE_A[App]
    FE_B[handleFileChange]
    FE_C[handleSubmit]
    FE_D[startLiveMode]
    FE_E[captureAndSendFrame]
    FE_F[stopLiveMode]
    FE_G[useEffect isLiveMode geolocation 10s]
    FE_H[SafetyView useEffect geolocation on mount]
  end

  %% Django API
  subgraph API[Django API - Backend/detections/views.py]
    API_A[DetectView.post]
    API_B[DetectionListView]
    API_C[DetectionDetailView]
    API_D[DetectionReportJSONView.get]
    API_E[detection_report_pdf]
    API_F[AnalyticsSummaryView.get]
    API_G[start_fake_training]
    API_H[TrainingLogsView.get]
  end

  %% YOLO + GPS
  subgraph ML[Inference and GPS - Backend/detections/yolo_service.py]
    ML_A[get_model]
    ML_B[run_inference]
    ML_C[extract_gps_and_telemetry]
    ML_D[_dms_to_decimal]
    ML_E[_to_float_ratio]
  end

  %% Persistence + Reports
  subgraph DATA[Persistence and Reporting]
    DB_A[Detection model]
    RP_A[build_detection_report_json]
    RP_B[build_detection_report_pdf_bytes]
    SER_A[DetectionSerializer]
  end

  %% Email
  subgraph EMAIL[Email Alert Pipeline]
    EM_A[send_drone_alert_email]
    EM_B[CustomEmailBackend.open]
    EM_C[SMTP provider]
    EM_D[email_alert_template.html present but unused]
  end

  %% Training stub
  subgraph TR[Training Stub]
    TR_A[run_fake_training]
    TR_B[training_logs.jsonl]
  end

  %% Local OpenCV detector
  subgraph LOCAL[Standalone local detector - local_detector.py]
    LO_A[main]
    LO_B[cv2.VideoCapture read loop]
    LO_C[YOLO frame stream inference]
    LO_D[cv2.imshow]
  end

  %% Frontend flow
  FE_A --> FE_B
  FE_A --> FE_C
  FE_A --> FE_D
  FE_A --> FE_F
  FE_A --> FE_G
  FE_A --> FE_H
  FE_D -->|camera stream| FE_E
  FE_E -->|every 2s setInterval| API_A
  FE_C -->|manual upload POST /api/detect| API_A
  FE_G -->|latitude longitude attached| FE_C
  FE_G -->|latitude longitude attached| FE_E

  %% Core detection flow
  API_A --> ML_C
  API_A --> ML_B
  ML_B --> ML_A
  ML_C --> ML_D
  ML_D --> ML_E
  API_A --> DB_A

  %% Alert branch
  API_A -->|if alert.is_red_alert True| EM_A
  EM_A -->|Django EMAIL_BACKEND| EM_B
  EM_B --> EM_C

  %% Response back to frontend
  API_A -->|annotatedImage detections location alert| FE_A

  %% Reporting + list/detail + analytics
  DB_A --> API_B
  DB_A --> API_C
  DB_A --> API_D
  DB_A --> API_E
  DB_A --> API_F
  API_D --> RP_A
  API_E --> RP_B
  API_B --> SER_A
  API_C --> SER_A

  %% Training
  API_G --> TR_A
  TR_A --> TR_B
  API_H --> TR_B

  %% Local detector path
  LO_A --> LO_B --> LO_C --> LO_D
```

## Recurring Safety Alert Loop
1. `startLiveMode` opens camera and starts a 2-second timer.
2. `captureAndSendFrame` sends each frame to `POST /api/detect/`.
3. `DetectView.post` calls `run_inference`, computes alert, stores `Detection`.
4. If `is_red_alert == True` (`drone_max_confidence >= 0.85`), `send_drone_alert_email` sends an SMTP alert.
5. Loop repeats, so alerts can recur for consecutive high-confidence frames.

## WebSocket Reality
- Implemented: REST polling (`setInterval` + `axios.post`) for near-real-time updates.
- Not implemented in runtime: `WebSocket`, `Django Channels`, SSE endpoint, socket server.

## Function Inventory By File
- `local_detector.py`: `main`.
- `Backend/manage.py`: `main`.
- `Backend/detections/yolo_service.py`: `get_model`, `_to_float_ratio`, `_dms_to_decimal`, `extract_gps_and_telemetry`, `run_inference`.
- `Backend/detections/views.py`: `DetectView.post`, `DetectionListView`, `DetectionDetailView`, `DetectionReportJSONView.get`, `detection_report_pdf`, `AnalyticsSummaryView.get`, `start_fake_training`, `TrainingLogsView.get`.
- `Backend/detections/email_service.py`: `send_drone_alert_email`.
- `Backend/detections/reporting.py`: `build_detection_report_json`, `build_detection_report_pdf_bytes`.
- `Backend/detections/training_stub.py`: `run_fake_training`.
- `Backend/detections/models.py`: `Detection.__str__`.
- `Backend/detections/serializers.py`: `DetectionSerializer.get_image_url`.
- `Backend/drone_backend/email_backend.py`: `CustomEmailBackend.open`.
- `Backend/test_email.py`: `test_email_direct`.
- `Backend/debug_detection.py`: `test_detection_email`.
- `frontend/src/App.jsx` components/functions: `UploadCloudIcon`, `LocationIcon`, `TagIcon`, `XIcon`, `ShieldIcon`, `InfoIcon`, `ChevronLeftIcon`, `ChevronRightIcon`, `GlassPanel`, `Navbar`, `NavItem`, `LoginModal`, `ImageCarousel`, `LiveDetectionOverlay`, `HomeView`, `DescriptionView`, `SafetyView`, `Footer`, `App`, plus inner functions in `App`:
  `handleFileChange`, `handleSubmit`, `triggerFileSelect`, `handleBeginDetect`, `captureAndSendFrame`, `startLiveMode`, `stopLiveMode`, and two `useEffect` geolocation loops.
