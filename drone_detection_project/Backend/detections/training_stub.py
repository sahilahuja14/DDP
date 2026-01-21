import json
import os
import random
import time
from pathlib import Path
from typing import Dict, Any


def run_fake_training(log_path: Path, epochs: int = 12, sleep_s: float = 0.6):
    log_path.parent.mkdir(parents=True, exist_ok=True)

    for epoch in range(1, epochs + 1):
        payload: Dict[str, Any] = {
            "type": "epoch",
            "epoch": epoch,
            "epochs": epochs,
            "loss": round(random.uniform(0.1, 1.2) / epoch, 4),
            "precision": round(min(0.99, 0.5 + epoch * 0.04 + random.uniform(-0.02, 0.02)), 4),
            "recall": round(min(0.99, 0.45 + epoch * 0.045 + random.uniform(-0.02, 0.02)), 4),
            "timestamp": time.time(),
        }
        with log_path.open("a", encoding="utf-8") as f:
            f.write(json.dumps(payload) + "\n")
        time.sleep(sleep_s)

    with log_path.open("a", encoding="utf-8") as f:
        f.write(json.dumps({"type": "done", "timestamp": time.time()}) + "\n")


if __name__ == "__main__":
    base_dir = Path(__file__).resolve().parent.parent
    log_file = Path(os.getenv("TRAINING_LOG_PATH", str(base_dir / "training_logs.jsonl")))
    run_fake_training(log_file)

