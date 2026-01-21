import base64
import io
from typing import Any, Dict, List, Optional, Tuple

from django.conf import settings
from PIL import Image, ExifTags
from ultralytics import YOLO
from geopy.geocoders import Nominatim


_MODEL: Optional[YOLO] = None


def get_model() -> YOLO:
    global _MODEL
    if _MODEL is None:
        _MODEL = YOLO(settings.YOLO_WEIGHTS_PATH)
    return _MODEL


def _to_float_ratio(value) -> Optional[float]:
    """
    Pillow may return rationals as (num, den) tuples or objects with numerator/denominator.
    """
    if value is None:
        return None
    try:
        if isinstance(value, tuple) and len(value) == 2:
            num, den = value
            return float(num) / float(den) if float(den) != 0 else None
        return float(value)
    except Exception:
        try:
            return float(value.numerator) / float(value.denominator)
        except Exception:
            return None


def _dms_to_decimal(dms, ref: str) -> Optional[float]:
    try:
        degrees = _to_float_ratio(dms[0])
        minutes = _to_float_ratio(dms[1])
        seconds = _to_float_ratio(dms[2])
        if degrees is None or minutes is None or seconds is None:
            return None
        dec = degrees + (minutes / 60.0) + (seconds / 3600.0)
        if ref in ("S", "W"):
            dec *= -1
        return dec
    except Exception:
        return None


def extract_gps_and_telemetry(image_bytes: bytes) -> Tuple[Dict[str, Any], Dict[str, Any]]:
    gps = {"has_gps": False, "latitude": None, "longitude": None, "address": None}
    telemetry: Dict[str, Any] = {"has_telemetry": False}

    try:
        img = Image.open(io.BytesIO(image_bytes))
        exif = img.getexif()
        if not exif:
            return gps, telemetry

        exif_dict = {}
        for k, v in exif.items():
            tag = ExifTags.TAGS.get(k, k)
            exif_dict[tag] = v

        gps_info = exif_dict.get("GPSInfo")
        if gps_info:
            gps_tags = {}
            for gk, gv in gps_info.items():
                gps_tags[ExifTags.GPSTAGS.get(gk, gk)] = gv

            lat = None
            lon = None
            if "GPSLatitude" in gps_tags and "GPSLatitudeRef" in gps_tags:
                lat = _dms_to_decimal(gps_tags["GPSLatitude"], gps_tags["GPSLatitudeRef"])
            if "GPSLongitude" in gps_tags and "GPSLongitudeRef" in gps_tags:
                lon = _dms_to_decimal(gps_tags["GPSLongitude"], gps_tags["GPSLongitudeRef"])

            if lat is not None and lon is not None:
                gps["has_gps"] = True
                gps["latitude"] = lat
                gps["longitude"] = lon

                try:
                    geolocator = Nominatim(user_agent="drone-detect-app")
                    location = geolocator.reverse((lat, lon), zoom=18, language="en")
                    gps["address"] = location.address if location else None
                except Exception:
                    gps["address"] = None

        # Telemetry overlay is simulated unless you later parse real tags.
        telemetry = {
            "has_telemetry": False,
            "altitude_m": None,
            "battery_pct": None,
            "speed_mps": None,
            "source": "simulated",
        }
        return gps, telemetry
    except Exception:
        return gps, telemetry


def run_inference(image_bytes: bytes) -> Tuple[str, List[Dict[str, Any]], Dict[str, Any]]:
    """
    Returns (annotated_image_base64_jpeg, detections, alert)
    """
    model = get_model()
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")

    results = model(img, verbose=False)
    r0 = results[0]

    dets: List[Dict[str, Any]] = []
    max_conf = None
    drone_max_conf = 0.0

    if getattr(r0, "boxes", None) is not None and r0.boxes is not None:
        for b in r0.boxes:
            cls_id = int(b.cls[0]) if hasattr(b, "cls") else None
            label = model.names.get(cls_id, str(cls_id)) if cls_id is not None else "unknown"
            conf = float(b.conf[0]) if hasattr(b, "conf") else None
            xyxy = b.xyxy[0].tolist() if hasattr(b, "xyxy") else None

            if conf is not None:
                max_conf = conf if max_conf is None else max(max_conf, conf)
                if str(label).lower() == "drone":
                    drone_max_conf = max(drone_max_conf, conf)

            dets.append(
                {
                    "label": label,
                    "confidence": conf,
                    "bbox_xyxy": xyxy,
                }
            )

    alert = {
        "is_red_alert": drone_max_conf >= 0.85,
        "threshold": 0.85,
        "drone_max_confidence": drone_max_conf,
        "max_confidence": max_conf,
    }

    # Annotated image (Ultralytics returns a numpy array in BGR/RGB depending; Pillow handles RGB)
    annotated = r0.plot()  # numpy array
    annotated_img = Image.fromarray(annotated)
    buf = io.BytesIO()
    annotated_img.save(buf, format="JPEG", quality=90)
    annotated_b64 = base64.b64encode(buf.getvalue()).decode("utf-8")

    return annotated_b64, dets, alert

