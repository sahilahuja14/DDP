# GPS Data Integration Guide

This guide explains how to add GPS data to your drone detection system using geopy and training models.

## Current GPS Implementation

The system currently extracts GPS data from two sources:

### 1. EXIF Metadata (Image GPS)
- **Location**: `Backend/detections/yolo_service.py` → `extract_gps_and_telemetry()`
- **How it works**: Extracts GPS coordinates from image EXIF data (if taken with GPS-enabled camera/phone)
- **Reverse Geocoding**: Uses `geopy.geocoders.Nominatim` to convert coordinates to addresses

### 2. Browser Geolocation API
- **Location**: `frontend/src/App.jsx` → `useEffect` hook
- **How it works**: Gets computer/browser location using `navigator.geolocation`
- **Updates**: Refreshes every 10 seconds during live monitoring

## Adding GPS Data to Training Model

### Option 1: Include GPS in Training Dataset

If you want to train your YOLO model with GPS-aware features:

```python
# In your training script (e.g., train_model_stub.py)
from ultralytics import YOLO
import json
from PIL import Image
from PIL.ExifTags import TAGS, GPSTAGS

def extract_gps_from_image(image_path):
    """Extract GPS coordinates from image EXIF"""
    img = Image.open(image_path)
    exif = img.getexif()
    
    if not exif:
        return None
    
    exif_dict = {}
    for k, v in exif.items():
        tag = TAGS.get(k, k)
        exif_dict[tag] = v
    
    gps_info = exif_dict.get("GPSInfo")
    if gps_info:
        gps_tags = {}
        for gk, gv in gps_info.items():
            gps_tags[GPSTAGS.get(gk, gk)] = gv
        
        # Convert DMS to decimal
        lat = None
        lon = None
        if "GPSLatitude" in gps_tags and "GPSLatitudeRef" in gps_tags:
            lat = _dms_to_decimal(gps_tags["GPSLatitude"], gps_tags["GPSLatitudeRef"])
        if "GPSLongitude" in gps_tags and "GPSLongitudeRef" in gps_tags:
            lon = _dms_to_decimal(gps_tags["GPSLongitude"], gps_tags["GPSLongitudeRef"])
        
        return {"latitude": lat, "longitude": lon}
    return None

# Add GPS to your training data
def prepare_training_data_with_gps(image_dir, labels_dir):
    training_data = []
    for img_file in os.listdir(image_dir):
        img_path = os.path.join(image_dir, img_file)
        gps_data = extract_gps_from_image(img_path)
        
        training_data.append({
            "image": img_path,
            "gps": gps_data,
            "label": os.path.join(labels_dir, img_file.replace('.jpg', '.txt'))
        })
    return training_data
```

### Option 2: Add GPS as Additional Input Channel

You can create a GPS heatmap overlay and add it as an additional channel:

```python
import numpy as np
from geopy.distance import geodesic

def create_gps_heatmap(image_shape, gps_coords, reference_point):
    """Create a heatmap showing distance from reference point"""
    h, w = image_shape[:2]
    heatmap = np.zeros((h, w), dtype=np.float32)
    
    if gps_coords:
        distance = geodesic(
            (gps_coords['lat'], gps_coords['lon']),
            (reference_point['lat'], reference_point['lon'])
        ).meters
        
        # Create gradient based on distance
        for y in range(h):
            for x in range(w):
                # Normalize distance (adjust scale as needed)
                normalized_dist = min(distance / 1000.0, 1.0)
                heatmap[y, x] = normalized_dist
    
    return heatmap

# Stack GPS channel with RGB image
def add_gps_channel(image, gps_coords, reference_point):
    gps_map = create_gps_heatmap(image.shape, gps_coords, reference_point)
    # Stack as 4th channel (RGBA) or concatenate
    return np.dstack([image, gps_map])
```

## Enhancing GPS Data Collection

### 1. Add More GPS Sources

Modify `yolo_service.py` to include additional GPS sources:

```python
def extract_gps_and_telemetry(image_bytes: bytes, client_lat=None, client_lon=None) -> Tuple[Dict[str, Any], Dict[str, Any]]:
    gps = {"has_gps": False, "latitude": None, "longitude": None, "address": None}
    
    # Priority 1: Client-provided coordinates (most accurate for live mode)
    if client_lat and client_lon:
        gps["has_gps"] = True
        gps["latitude"] = client_lat
        gps["longitude"] = client_lon
    
    # Priority 2: EXIF GPS data
    try:
        img = Image.open(io.BytesIO(image_bytes))
        exif = img.getexif()
        # ... existing EXIF extraction code ...
    except:
        pass
    
    # Priority 3: IP-based geolocation (fallback)
    if not gps["has_gps"]:
        try:
            # Use a service like ipapi.co or ip-api.com
            import requests
            response = requests.get('http://ip-api.com/json/')
            data = response.json()
            if data['status'] == 'success':
                gps["latitude"] = data['lat']
                gps["longitude"] = data['lon']
                gps["has_gps"] = True
        except:
            pass
    
    # Reverse geocoding
    if gps["has_gps"] and gps["latitude"] and gps["longitude"]:
        try:
            geolocator = Nominatim(user_agent="drone-detect-app")
            location = geolocator.reverse(
                (gps["latitude"], gps["longitude"]), 
                zoom=18, 
                language="en"
            )
            gps["address"] = location.address if location else None
        except Exception as e:
            print(f"Geocoding error: {e}")
    
    return gps, telemetry
```

### 2. Add GPS to Detection Model

Store GPS data with each detection:

```python
# In views.py, the Detection model already stores GPS:
det_obj = Detection.objects.create(
    image=image_file,
    detections=detections,
    latitude=gps.get("latitude"),
    longitude=gps.get("longitude"),
    address=gps.get("address"),
    # ... other fields
)
```

### 3. Create GPS Analytics

Add endpoints to analyze GPS patterns:

```python
# In views.py
class GPSAnalyticsView(APIView):
    def get(self, request):
        detections = Detection.objects.filter(
            latitude__isnull=False,
            longitude__isnull=False
        )
        
        # Calculate detection density by region
        regions = {}
        for det in detections:
            # Round to ~1km precision
            lat_rounded = round(det.latitude, 2)
            lon_rounded = round(det.longitude, 2)
            key = f"{lat_rounded},{lon_rounded}"
            regions[key] = regions.get(key, 0) + 1
        
        return Response({
            "total_with_gps": detections.count(),
            "detection_density": regions,
            "bounding_box": {
                "north": detections.aggregate(Max('latitude'))['latitude__max'],
                "south": detections.aggregate(Min('latitude'))['latitude__min'],
                "east": detections.aggregate(Max('longitude'))['longitude__max'],
                "west": detections.aggregate(Min('longitude'))['longitude__min'],
            }
        })
```

## Using Geopy for Advanced Features

### 1. Calculate Distances Between Detections

```python
from geopy.distance import geodesic

def calculate_distance_between_detections(det1, det2):
    """Calculate distance in meters between two detections"""
    if not (det1.latitude and det1.longitude and det2.latitude and det2.longitude):
        return None
    
    point1 = (det1.latitude, det1.longitude)
    point2 = (det2.latitude, det2.longitude)
    return geodesic(point1, point2).meters
```

### 2. Check if Detection is in Restricted Zone

```python
from geopy.distance import geodesic

def is_in_restricted_zone(detection, restricted_zones):
    """Check if detection is within any restricted zone"""
    if not (detection.latitude and detection.longitude):
        return False
    
    detection_point = (detection.latitude, detection.longitude)
    
    for zone in restricted_zones:
        zone_center = (zone['lat'], zone['lon'])
        distance = geodesic(detection_point, zone_center).meters
        
        if distance <= zone['radius_meters']:
            return True
    
    return False
```

### 3. Reverse Geocoding with Caching

```python
from geopy.geocoders import Nominatim
from functools import lru_cache

@lru_cache(maxsize=1000)
def get_address_cached(lat, lon):
    """Cached reverse geocoding to avoid API rate limits"""
    geolocator = Nominatim(user_agent="drone-detect-app")
    try:
        location = geolocator.reverse((lat, lon), zoom=18, language="en")
        return location.address if location else None
    except:
        return None
```

## Frontend GPS Integration

The frontend already requests location. To enhance it:

```javascript
// In App.jsx, you can add:
const [locationHistory, setLocationHistory] = useState([]);

// Track location history
useEffect(() => {
  if (geoCoords) {
    setLocationHistory(prev => [
      ...prev.slice(-9), // Keep last 10 locations
      { ...geoCoords, timestamp: Date.now() }
    ]);
  }
}, [geoCoords]);
```

## Testing GPS Features

1. **Test with GPS-enabled images**: Take photos with your phone's camera (GPS enabled)
2. **Test browser geolocation**: Allow location access when prompted
3. **Test reverse geocoding**: Verify addresses are correctly resolved
4. **Test without GPS**: Ensure graceful fallback when GPS unavailable

## Rate Limiting for Geopy

Nominatim (free geopy service) has rate limits. Consider:
- Caching results
- Using a paid service for production
- Implementing request throttling

```python
import time
from functools import wraps

def rate_limit(calls_per_second=1):
    min_interval = 1.0 / calls_per_second
    last_called = [0.0]
    
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            elapsed = time.time() - last_called[0]
            left_to_wait = min_interval - elapsed
            if left_to_wait > 0:
                time.sleep(left_to_wait)
            ret = func(*args, **kwargs)
            last_called[0] = time.time()
            return ret
        return wrapper
    return decorator

@rate_limit(calls_per_second=1)
def safe_reverse_geocode(lat, lon):
    geolocator = Nominatim(user_agent="drone-detect-app")
    return geolocator.reverse((lat, lon), zoom=18, language="en")
```

## Summary

- **Current**: GPS extracted from EXIF and browser geolocation
- **Training**: Can add GPS as metadata or additional input channel
- **Enhancement**: Use geopy for distance calculations, zone checking, and advanced analytics
- **Best Practice**: Cache geocoding results and implement rate limiting
