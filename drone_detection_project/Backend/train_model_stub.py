"""
Standalone script (requested) that simulates YOLO training for UI visualization.

It appends JSON lines to `Backend/training_logs.jsonl`.
"""

import os
from pathlib import Path

from detections.training_stub import run_fake_training


if __name__ == "__main__":
    base_dir = Path(__file__).resolve().parent
    log_file = Path(os.getenv("TRAINING_LOG_PATH", str(base_dir / "training_logs.jsonl")))
    run_fake_training(log_file)

