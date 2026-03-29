import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

// --- SVG Icons ---
// Using Lucide icons for a modern feel
const UploadCloudIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
    <path d="M12 12v9" /><path d="m16 16-4-4-4 4" />
  </svg>
);

const LocationIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" />
  </svg>
);

const TagIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" />
    <path d="M7 7h.01" />
  </svg>
);

const XIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18" /><path d="m6 6 12 12" />
  </svg>
);

const ShieldIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const InfoIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" />
  </svg>
);

const ChevronLeftIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m15 18-6-6 6-6" />
  </svg>
);

const ChevronRightIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m9 18 6-6-6-6" />
  </svg>
);

// --- Shared Glass Panel ---
const GlassPanel = ({ children, className = "" }) => (
  <div
    className={`backdrop-blur-xl bg-slate-900/40 border border-white/10 shadow-2xl rounded-3xl ${className}`}
  >
    {children}
  </div>
);

// --- Navbar Component ---
const Navbar = ({ setView, setShowLoginModal }) => {
  return (
    <nav className="sticky top-0 z-50 w-full bg-black/80 backdrop-blur-2xl border-b border-slate-800/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              DroneDetect
            </span>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <NavItem onClick={() => setView('home')}>Home</NavItem>
            <NavItem onClick={() => setView('description')}>Description</NavItem>
            <NavItem onClick={() => setView('safety')}>Safety</NavItem>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowLoginModal(true)}
              className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Log in
            </button>
            <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
              Sign up
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

const NavItem = ({ onClick, children }) => (
  <button
    onClick={onClick}
    className="px-3 py-2 text-slate-300 hover:text-white font-medium rounded-lg transition-colors"
  >
    {children}
  </button>
);

// --- Login Modal Component ---
const LoginModal = ({ setShowLoginModal }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowLoginModal(false)}>
      <div
        className="bg-slate-800 p-8 rounded-lg shadow-2xl max-w-sm w-full relative border border-slate-700"
        onClick={(e) => e.stopPropagation()} // Prevent modal from closing when clicking inside
      >
        <button
          onClick={() => setShowLoginModal(false)}
          className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 transition-colors"
        >
          <XIcon className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Login</h2>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1" htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1" htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-all"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

// --- Image Carousel Component ---
const ImageCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const images = [
    { src: 'https://placehold.co/1200x600/313866/E0D5D5?text=Drone+In+Flight', alt: 'Drone in Flight' },
    { src: 'https://placehold.co/1200x600/504099/E0D5D5?text=Aerial+View', alt: 'Aerial View' },
    { src: 'https://placehold.co/1200x600/6420AA/E0D5D5?text=Drone+Controller', alt: 'Drone Controller' },
  ];

  const prevSlide = () => {
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? images.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  const nextSlide = () => {
    const isLastSlide = currentIndex === images.length - 1;
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto rounded-lg overflow-hidden group shadow-xl">
      <div 
        className="flex transition-transform ease-in-out duration-500"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {images.map((image, index) => (
          <img
            key={index}
            src={image.src}
            alt={image.alt}
            className="w-full flex-shrink-0"
            onError={(e) => e.target.src = 'https://placehold.co/1200x600/FF0000/FFFFFF?text=Image+Failed+To+Load'}
          />
        ))}
      </div>
      {/* Left Arrow */}
      <button onClick={prevSlide} className="absolute top-1/2 left-4 -translate-y-1/2 bg-black/30 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
        <ChevronLeftIcon className="w-6 h-6" />
      </button>
      {/* Right Arrow */}
      <button onClick={nextSlide} className="absolute top-1/2 right-4 -translate-y-1/2 bg-black/30 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
        <ChevronRightIcon className="w-6 h-6" />
      </button>
    </div>
  );
};

// --- Live Detection Overlay ---
const LiveDetectionOverlay = ({ isActive, detectionResult, onClose, currentView }) => {
  // Only show overlay on home view, or if explicitly active
  if (currentView !== 'home' && !isActive) return null;
  if (!isActive && !detectionResult) return null;

  const isAlert = detectionResult?.alert?.is_red_alert;

  return (
    <div className="fixed bottom-4 right-4 z-40 pointer-events-none max-w-md w-full">
      <div className="pointer-events-auto">
        <GlassPanel className={`p-4 relative ${isAlert ? "border-red-500/60 shadow-red-900/60" : ""}`}>
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-slate-400 hover:text-white transition-colors p-1 rounded hover:bg-slate-700/50"
            aria-label="Close overlay"
          >
            <XIcon className="w-5 h-5" />
          </button>

          <div className="flex items-start justify-between mb-3 pr-6">
            <div className="flex-1">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Live Detection</p>
              <p className="text-lg font-semibold text-white mt-1">
                {isActive ? "Analyzing..." : isAlert ? "Red Alert" : "Detection"}
              </p>
            </div>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                isAlert
                  ? "bg-red-500/20 text-red-300 border border-red-500/50"
                  : "bg-emerald-500/15 text-emerald-300 border border-emerald-400/40"
              }`}
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60 bg-current" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-current" />
              </span>
              {isAlert ? "Threat" : "Active"}
            </span>
          </div>

          {detectionResult && (
            <div className="space-y-3">
              <div className="rounded-lg overflow-hidden border border-slate-800 bg-black/40">
                <img
                  src={`data:image/jpeg;base64,${detectionResult.annotatedImage}`}
                  alt="Live detection"
                  className="w-full h-40 object-cover"
                />
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-slate-400 mb-0.5">Target</p>
                  <p className="text-slate-200 font-semibold capitalize">
                    {detectionResult.detections?.[0]?.name ?? "None"}
                  </p>
                  {detectionResult.detections?.[0] && (
                    <p className="text-slate-500 text-[10px] mt-0.5">
                      {(detectionResult.detections[0].confidence * 100).toFixed(1)}% conf
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-slate-400 mb-0.5">Location</p>
                  <p className="text-slate-300 text-[10px] line-clamp-2">
                    {detectionResult.location?.address ?? "No GPS"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </GlassPanel>
      </div>
    </div>
  );
};

// --- Home View (Main Upload Page) ---
const HomeView = ({
  selectedFile,
  previewUrl,
  detectionResult,
  isLoading,
  error,
  handleFileChange,
  handleSubmit,
  triggerFileSelect,
  fileInputRef,
  onBeginDetect,
  isLiveMode,
  startLiveMode,
  stopLiveMode,
  videoRef,
}) => {
  return (
    <div className="py-16 px-4">
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-5xl md:text-6xl font-semibold tracking-tight">
          <span className="bg-gradient-to-r from-slate-100 via-slate-300 to-slate-100 bg-clip-text text-transparent">
            Real‑time Drone Shield
          </span>
        </h1>
        <p className="mt-4 text-sm md:text-base text-slate-400">
          One‑click live monitoring with glass‑smooth telemetry, geolocation, and threat routing.
        </p>
      </div>

      {/* Live Camera Section */}
      <div className="max-w-4xl mx-auto mb-10">
        <GlassPanel className="p-6 md:p-8 flex flex-col md:flex-row gap-6 items-stretch">
          <div className="flex-1 space-y-4">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
              Live Camera
            </p>
            <p className="text-sm text-slate-300">
              Connect your device camera and stream frames directly into the detection pipeline.
              Ideal for incident response when capturing still images is too slow.
            </p>
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={startLiveMode}
                disabled={isLiveMode}
                className="px-5 py-2.5 rounded-2xl text-sm font-semibold bg-emerald-500/90 text-slate-950 shadow-lg shadow-emerald-900/40 hover:bg-emerald-400 disabled:bg-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed"
              >
                {isLiveMode ? "Live Monitoring Active" : "Start Live Monitoring"}
              </button>
              {isLiveMode && (
                <button
                  onClick={stopLiveMode}
                  className="px-4 py-2.5 rounded-2xl text-xs font-semibold border border-slate-600 text-slate-200 hover:border-slate-400"
                >
                  Stop Stream
                </button>
              )}
            </div>
            <p className="text-[11px] text-slate-500">
              Camera and location permissions stay on your device; only encoded frames and
              coordinates are sent to the backend.
            </p>
          </div>
          <div className="flex-1 rounded-2xl overflow-hidden border border-slate-800 bg-black/60 min-h-[10rem] flex items-center justify-center">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                isLiveMode ? "opacity-100" : "opacity-30"
              }`}
            />
            {!isLiveMode && (
              <span className="absolute text-xs text-slate-500">
                Live feed will appear here once started
              </span>
            )}
          </div>
        </GlassPanel>
      </div>

      {/* Manual Upload Section (fallback) */}
      <div className="max-w-2xl mx-auto">
        <GlassPanel className="p-8">
          <input
            type="file"
            accept="image/jpeg, image/png"
            onChange={handleFileChange}
            className="hidden"
            ref={fileInputRef}
          />

          <div
            className="border-4 border-dashed border-slate-600 rounded-lg p-10 text-center cursor-pointer hover:border-blue-500 hover:bg-slate-800 transition-colors"
            onClick={triggerFileSelect}
          >
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" className="max-h-64 mx-auto rounded-md" />
            ) : (
              <div className="flex flex-col items-center text-slate-500">
                <UploadCloudIcon className="w-16 h-16 text-slate-600" />
                <span className="mt-4 text-xl font-semibold text-slate-300">Click to select an image</span>
                <span className="text-slate-400">PNG or JPG</span>
              </div>
            )}
          </div>

          {selectedFile && (
            <div className="text-center mt-4 text-slate-400">
              <strong>Selected file:</strong> {selectedFile.name}
            </div>
          )}

          <div className="text-center mt-6">
            <button
              onClick={handleSubmit}
              onMouseDown={onBeginDetect}
              disabled={isLoading || !selectedFile}
              className="w-full px-8 py-4 bg-blue-600/90 text-white font-semibold text-lg rounded-2xl shadow-lg shadow-blue-900/40 hover:bg-blue-500 transition-all disabled:bg-slate-700 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Detecting...
                </div>
              ) : (
                "Upload & Detect"
              )}
            </button>
          </div>

          {error && (
            <div className="mt-6 p-4 bg-red-900/50 text-red-300 border border-red-700 rounded-lg">
              <strong>Error:</strong> {error}
            </div>
          )}
        </GlassPanel>
      </div>

      {/* Results Section */}
      {detectionResult && (
        <div className="max-w-5xl mx-auto mt-16 space-y-6">
          <h2 className="text-3xl font-semibold text-white mb-2 text-center">
            Detection Snapshot
          </h2>
          <p className="text-sm text-slate-400 text-center">
            Latest processed frame and geolocation intelligence.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <GlassPanel className="p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Annotated Image</h3>
              <img
                src={`data:image/jpeg;base64,${detectionResult.annotatedImage}`}
                alt="Detection result"
                className="rounded-2xl shadow-lg w-full border border-slate-800/80 bg-black/60"
              />
            </GlassPanel>

            <div className="space-y-6">
              <GlassPanel className="p-6">
                <h4 className="text-xl font-semibold text-white mb-3 flex items-center">
                  <LocationIcon className="w-6 h-6 mr-3 text-blue-400" /> Geolocation Info
                </h4>
                <p className="text-slate-300 text-lg">{detectionResult.location.address}</p>
                {detectionResult.location.coordinates && (
                  <p className="text-sm text-slate-400 mt-2">
                    (Lat: {detectionResult.location.coordinates.lat.toFixed(5)},
                    Lon: {detectionResult.location.coordinates.lon.toFixed(5)})
                  </p>
                )}
              </GlassPanel>

              <GlassPanel className="p-6">
                <h4 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <TagIcon className="w-6 h-6 mr-3 text-blue-400" /> Objects Detected
                </h4>
                {detectionResult.detections.length > 0 ? (
                  <ul className="space-y-2">
                    {detectionResult.detections.map((det, index) => (
                      <li key={index} className="flex justify-between items-center text-slate-300">
                        <span className="font-semibold capitalize text-lg">{det.name}</span>
                        <span className="text-slate-400 text-sm bg-slate-700 px-2 py-1 rounded">
                          {(det.confidence * 100).toFixed(1)}% confidence
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-400">No objects recognized by the model.</p>
                )}
              </GlassPanel>
            </div>
          </div>
        </div>
      )}
      
      {/* Image Carousel Section */}
      {!detectionResult && (
        <div className="mt-24">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">Drone Gallery</h2>
          <ImageCarousel />
        </div>
      )}
    </div>
  );
};

// --- Description View ---
const DescriptionView = () => (
  <div className="max-w-3xl mx-auto py-16 px-4">
    <h1 className="text-4xl font-bold text-white mb-6 flex items-center">
      <InfoIcon className="w-10 h-10 mr-4 text-blue-400" />
      About DroneDetect
    </h1>
    <div className="prose prose-invert prose-lg text-slate-300 space-y-4">
      <p>
        DroneDetect is a powerful, full-stack application built to demonstrate the capabilities of
        modern machine learning and web technologies. It combines a state-of-the-art
        YOLOv8 object detection model with a robust backend and a sleek, responsive frontend.
      </p>
      <h2 className="text-2xl font-semibold text-white">How It Works</h2>
      <ol className="list-decimal pl-5 space-y-2">
        <li><strong>Image Upload:</strong> You select a PNG or JPG image and upload it through our web interface.</li>
        <li><strong>Backend Processing:</strong> The image is sent to our Flask (Python) backend API.</li>
        <li><strong>EXIF Geolocation:</strong> The server first inspects the image's EXIF metadata. If GPS data from a drone or phone is present, it's extracted.</li>
        <li><strong>Address Lookup:</strong> Using the extracted coordinates, our server uses `geopy` to perform a reverse-geocoding lookup and find a real-world street address.</li>
        <li><strong>YOLOv8 Detection:</strong> The image is passed to our custom-trained YOLOv8 model (`best.pt`). The model identifies all objects it's been trained on (like 'drone') and draws bounding boxes.</li>
        <li><strong>Database Logging:</strong> The detection results (what was found, confidence, location) are saved to a Firestore database for record-keeping.</li>
        <li><strong>Response:</strong> The server sends back a JSON response containing the new, annotated image (as a Base64 string), the list of detected objects, and the location information.</li>
        <li><strong>Display:</strong> The React frontend receives this data and beautifully displays the results for you.</li>
      </ol>
    </div>
  </div>
);

// --- Safety Dashboard View (Bento Grid) ---
const SafetyView = ({ detectionResult, setView }) => {
  const [safetyMeasures, setSafetyMeasures] = useState({
    interceptorStatus: "Ready",
    jammingEnabled: false,
    emergencyCorridors: 3,
    autoResponse: false,
    alertThreshold: 85,
    perimeterRadius: 500,
    responseDelay: 0,
    backupSystems: true,
    recordingEnabled: true,
    notificationLevel: "High"
  });
  
  const [computerLocation, setComputerLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  
  const hasAlert = detectionResult?.alert?.is_red_alert;
  const primaryLabel = detectionResult?.detections?.[0]?.name ?? "Unknown";
  const confidence = detectionResult?.detections?.[0]?.confidence ?? null;

  const level =
    !detectionResult || !detectionResult.detections?.length
      ? "Low"
      : hasAlert
      ? "Critical"
      : confidence && confidence > 0.7
      ? "Elevated"
      : "Moderate";

  // Get computer location on mount
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setComputerLocation({
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          });
        },
        (err) => {
          setLocationError(err.message);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      setLocationError("Geolocation not supported");
    }
  }, []);

  const updateSafetyMeasure = (key, value) => {
    setSafetyMeasures(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="max-w-7xl mx-auto py-16 px-4 space-y-8">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl md:text-4xl font-semibold text-white flex items-center gap-3">
            <ShieldIcon className="w-9 h-9 text-emerald-400" />
            Integrated Drone Safety Console
          </h1>
          <p className="mt-2 text-slate-400 max-w-2xl text-sm md:text-base">
            A command view that fuses detections, location intelligence, threat assessment, and
            response options into one glass dashboard.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setView('home')}
            className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white border border-slate-600 rounded-lg hover:border-slate-400 transition-colors"
          >
            ← Back to Home
          </button>
          <div className="flex flex-col items-end gap-2">
            <span className="text-xs uppercase tracking-[0.25em] text-slate-500">Threat Level</span>
            <span
              className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold
                ${
                  level === "Critical"
                    ? "bg-red-500/20 text-red-100 border border-red-500/60"
                    : level === "Elevated"
                    ? "bg-amber-500/15 text-amber-100 border border-amber-400/50"
                    : level === "Moderate"
                    ? "bg-sky-500/15 text-sky-100 border border-sky-400/50"
                    : "bg-emerald-500/15 text-emerald-100 border border-emerald-400/50"
                }`}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-current" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-current" />
              </span>
              {level}
            </span>
          </div>
        </div>
      </div>

      {/* Bento Grid - Fixed Layout */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5" style={{ gridAutoRows: 'minmax(12rem, auto)' }}>
        {/* Location Intel - Enhanced with Computer Location */}
        <GlassPanel className="p-5 md:col-span-2 row-span-2">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500 mb-3">Location Intelligence</p>
          
          {/* Detection Location */}
          <div className="mb-4">
            <p className="text-xs font-semibold text-slate-400 mb-1">Detection Location</p>
            <p className="text-sm text-slate-300 line-clamp-2">
              {detectionResult?.location?.address ?? "Awaiting GPS-tagged detections."}
            </p>
            {detectionResult?.location?.coordinates && (
              <p className="text-xs text-slate-400 mt-1">
                Lat: {detectionResult.location.coordinates.lat.toFixed(5)} · Lon:{" "}
                {detectionResult.location.coordinates.lon.toFixed(5)}
              </p>
            )}
          </div>
          
          {/* Computer Location */}
          <div className="border-t border-slate-800 pt-3">
            <p className="text-xs font-semibold text-slate-400 mb-1">Computer Location</p>
            {computerLocation ? (
              <>
                <p className="text-sm text-slate-300">
                  Lat: {computerLocation.lat.toFixed(5)} · Lon: {computerLocation.lon.toFixed(5)}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Accuracy: ±{Math.round(computerLocation.accuracy)}m
                </p>
              </>
            ) : locationError ? (
              <p className="text-xs text-red-400">{locationError}</p>
            ) : (
              <p className="text-xs text-slate-500">Acquiring location...</p>
            )}
          </div>
        </GlassPanel>

        {/* Threat Classification */}
        <GlassPanel className="p-5 md:col-span-2">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Threat Classification</p>
          <p className="mt-3 text-lg text-slate-50 capitalize">{primaryLabel}</p>
          {confidence && (
            <p className="text-xs text-slate-400 mt-1">
              Model confidence {(confidence * 100).toFixed(1)}% based on latest frame.
            </p>
          )}
          <p className="mt-4 text-xs text-slate-400">
            YOLOv8-based classifier tuned for small aerial threats. Red Alert triggers at
            confidence ≥ 85%.
          </p>
        </GlassPanel>

        {/* Countermeasures / Reserves - Enhanced with Controls */}
        <GlassPanel className="p-5 md:col-span-2 row-span-2">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500 mb-3">Safety Measures</p>
          <div className="space-y-4">
            {/* Feature 1: Interceptor Status Control */}
            <div className="flex items-center justify-between p-2 bg-slate-800/30 rounded-lg">
              <div className="flex-1">
                <p className="text-xs font-semibold text-slate-300">Interceptor Status</p>
                <p className="text-[11px] text-slate-500 mt-0.5">4 launchers available</p>
              </div>
              <select
                value={safetyMeasures.interceptorStatus}
                onChange={(e) => updateSafetyMeasure('interceptorStatus', e.target.value)}
                className="text-xs bg-slate-700 border border-slate-600 rounded px-2 py-1 text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="Ready">Ready</option>
                <option value="Standby">Standby</option>
                <option value="Deployed">Deployed</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>

            {/* Feature 2: Jamming Toggle */}
            <div className="flex items-center justify-between p-2 bg-slate-800/30 rounded-lg">
              <div className="flex-1">
                <p className="text-xs font-semibold text-slate-300">RF / GNSS Jamming</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Control link disruption</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={safetyMeasures.jammingEnabled}
                  onChange={(e) => updateSafetyMeasure('jammingEnabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Feature 3: Alert Threshold Slider */}
            <div className="p-2 bg-slate-800/30 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-slate-300">Alert Threshold</p>
                <span className="text-xs text-blue-400 font-semibold">{safetyMeasures.alertThreshold}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="100"
                value={safetyMeasures.alertThreshold}
                onChange={(e) => updateSafetyMeasure('alertThreshold', parseInt(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <p className="text-[11px] text-slate-500 mt-1">Red alert triggers at this confidence level</p>
            </div>

            {/* Feature 4: Auto-Response Toggle */}
            <div className="flex items-center justify-between p-2 bg-slate-800/30 rounded-lg">
              <div className="flex-1">
                <p className="text-xs font-semibold text-slate-300">Auto-Response Mode</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Automatic countermeasure activation</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={safetyMeasures.autoResponse}
                  onChange={(e) => updateSafetyMeasure('autoResponse', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
              </label>
            </div>

            {/* Feature 5: Perimeter Radius Control */}
            <div className="p-2 bg-slate-800/30 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-slate-300">Protection Perimeter</p>
                <span className="text-xs text-blue-400 font-semibold">{safetyMeasures.perimeterRadius}m</span>
              </div>
              <input
                type="range"
                min="100"
                max="2000"
                step="50"
                value={safetyMeasures.perimeterRadius}
                onChange={(e) => updateSafetyMeasure('perimeterRadius', parseInt(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <p className="text-[11px] text-slate-500 mt-1">Detection zone radius in meters</p>
            </div>
          </div>
        </GlassPanel>

        {/* Situational Awareness - Enhanced */}
        <GlassPanel className="p-5 md:col-span-2 row-span-2">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500 mb-3">Situational Awareness</p>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-2 bg-slate-800/30 rounded-lg">
              <div className="flex-1">
                <p className="text-xs font-semibold text-slate-300">No‑fly & Restricted Zones</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Geofences synced</p>
              </div>
              <span className="text-xs px-2 py-1 bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/50">Active</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-slate-800/30 rounded-lg">
              <div className="flex-1">
                <p className="text-xs font-semibold text-slate-300">Weather & Visibility</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Conditions nominal</p>
              </div>
              <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-300 rounded border border-blue-500/50">Good</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-slate-800/30 rounded-lg">
              <div className="flex-1">
                <p className="text-xs font-semibold text-slate-300">Comms Health</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Network latency: 12ms</p>
              </div>
              <span className="text-xs px-2 py-1 bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/50">Stable</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-slate-800/30 rounded-lg">
              <div className="flex-1">
                <p className="text-xs font-semibold text-slate-300">Evidence Capture</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Recording enabled</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={safetyMeasures.recordingEnabled}
                  onChange={(e) => updateSafetyMeasure('recordingEnabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between p-2 bg-slate-800/30 rounded-lg">
              <div className="flex-1">
                <p className="text-xs font-semibold text-slate-300">Backup Systems</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Redundant systems active</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={safetyMeasures.backupSystems}
                  onChange={(e) => updateSafetyMeasure('backupSystems', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>
          </div>
        </GlassPanel>

        {/* Response Playbook - Enhanced */}
        <GlassPanel className="p-5 md:col-span-2">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500 mb-3">Response Playbook</p>
          <ol className="space-y-2 text-xs text-slate-300 list-decimal list-inside">
            <li>Confirm target via optical feed and secondary sensor if available.</li>
            <li>Check no‑fly overlays and civilian density before any intercept.</li>
            <li>Escalate to operations lead when threat level is Elevated or above.</li>
            <li>Trigger jamming / intercept only under authorized rules of engagement.</li>
            <li>Lock detection, export incident report, and archive footage.</li>
          </ol>
          <div className="mt-4 pt-3 border-t border-slate-800">
            <p className="text-xs font-semibold text-slate-400 mb-2">Notification Level</p>
            <select
              value={safetyMeasures.notificationLevel}
              onChange={(e) => updateSafetyMeasure('notificationLevel', e.target.value)}
              className="w-full text-xs bg-slate-700 border border-slate-600 rounded px-2 py-1.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="Low">Low - Log only</option>
              <option value="Medium">Medium - Email alerts</option>
              <option value="High">High - SMS + Email</option>
              <option value="Critical">Critical - All channels + Siren</option>
            </select>
          </div>
        </GlassPanel>
        
        {/* Detection Image Display - Enhanced with Fixed Layout */}
        {detectionResult?.annotatedImage && (
          <GlassPanel className="p-5 md:col-span-2 row-span-3">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500 mb-3">Latest Detection</p>
            <div className="rounded-xl overflow-hidden border-2 border-slate-700/50 bg-black/60 shadow-lg mb-4">
              <img
                src={`data:image/jpeg;base64,${detectionResult.annotatedImage}`}
                alt="Detection result"
                className="w-full h-auto max-h-80 object-contain"
              />
            </div>
            {detectionResult.detections && detectionResult.detections.length > 0 && (
              <div className="mb-3 p-3 bg-slate-800/30 rounded-lg">
                <p className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-[0.2em]">Detected Objects</p>
                <div className="space-y-2">
                  {detectionResult.detections.map((det, idx) => (
                    <div key={idx} className="flex justify-between items-center p-2 bg-slate-700/30 rounded">
                      <span className="text-sm text-slate-200 font-medium capitalize">{det.name}</span>
                      <span className="text-xs text-blue-400 font-semibold bg-blue-500/10 px-2 py-1 rounded">
                        {(det.confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {detectionResult.location?.coordinates && (
              <div className="p-3 bg-slate-800/30 rounded-lg">
                <p className="text-xs font-semibold text-slate-400 mb-1 uppercase tracking-[0.2em]">GPS Coordinates</p>
                <p className="text-xs text-slate-300 font-mono break-words">
                  Lat: {detectionResult.location.coordinates.lat.toFixed(6)}, 
                  Lon: {detectionResult.location.coordinates.lon.toFixed(6)}
                </p>
              </div>
            )}
          </GlassPanel>
        )}
      </div>
    </div>
  );
};

// --- Footer Component ---
const Footer = () => (
  <footer className="bg-slate-900 border-t border-slate-700/50 mt-16">
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 text-center text-slate-500">
      <p>&copy; 2025 DroneDetect. All rights reserved.</p>
    </div>
  </footer>
);

// --- Main App Component ---
function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [detectionResult, setDetectionResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // New state for UI
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [view, setView] = useState('home'); // 'home', 'description', 'safety'
  const [liveOverlayActive, setLiveOverlayActive] = useState(false);
  const [showLiveOverlay, setShowLiveOverlay] = useState(true); // Control overlay visibility
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [geoCoords, setGeoCoords] = useState(null);
  const [liveTimerId, setLiveTimerId] = useState(null);

  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Request location when live monitoring starts and update periodically
  useEffect(() => {
    if (!isLiveMode) {
      setGeoCoords(null);
      return;
    }
    if (!("geolocation" in navigator)) {
      console.warn("Geolocation not available");
      return;
    }
    
    // Get initial position
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoCoords({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          timestamp: pos.timestamp,
        });
      },
      (err) => {
        console.warn("Geolocation error:", err.message);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
    
    // Update location every 10 seconds while in live mode
    const locationInterval = setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGeoCoords({
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            timestamp: pos.timestamp,
          });
        },
        (err) => {
          console.warn("Geolocation update error:", err.message);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 10000 }
      );
    }, 10000);
    
    return () => clearInterval(locationInterval);
  }, [isLiveMode]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
      setDetectionResult(null);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      setError("Please select an image file first.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setDetectionResult(null);
    const formData = new FormData();
    formData.append('image', selectedFile);
    if (geoCoords) {
      formData.append('latitude', geoCoords.lat);
      formData.append('longitude', geoCoords.lon);
    }

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/detect/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setDetectionResult(response.data);
      setShowLiveOverlay(false); // Hide overlay when manually uploading
      setView('safety');
    } catch (err) {
      console.error("Error uploading file:", err);
      setError(err.response?.data?.error || "Error during detection. Is the backend server running?");
    } finally {
      setIsLoading(false);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current.click();
  };

  const handleBeginDetect = () => {
    setLiveOverlayActive(true);
  };

  // Capture one frame from the live video and send it to the backend
  const captureAndSendFrame = async () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth || !video.videoHeight) {
      console.log("Video not ready yet");
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) {
      console.error("Canvas ref not available");
      return;
    }

    const width = video.videoWidth;
    const height = video.videoHeight;
    if (!width || !height) {
      console.log("Video dimensions not available");
      return;
    }

    try {
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        console.error("Could not get canvas context");
        return;
      }
      ctx.drawImage(video, 0, 0, width, height);

      canvas.toBlob(async (blob) => {
        if (!blob) {
          console.error("Failed to create blob from canvas");
          return;
        }
        const formData = new FormData();
        formData.append("image", blob, "frame.jpg");
        if (geoCoords) {
          formData.append("latitude", geoCoords.lat);
          formData.append("longitude", geoCoords.lon);
        }
        try {
          const response = await axios.post("http://127.0.0.1:8000/api/detect/", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          setDetectionResult(response.data);
          setLiveOverlayActive(true);
          setShowLiveOverlay(true); // Ensure overlay is visible
          // Auto-switch to safety console when detection is received
          if (response.data && response.data.detections && response.data.detections.length > 0) {
            setTimeout(() => {
              setView("safety");
              // Hide overlay when switching to safety view
              setShowLiveOverlay(false);
            }, 500);
          }
        } catch (err) {
          console.error("Live frame error:", err);
          const errorMsg = err.response?.data?.error || err.message || "Error during live detection.";
          setError(errorMsg);
          // Only show error briefly, then clear it
          setTimeout(() => setError(null), 3000);
        }
      }, "image/jpeg", 0.9);
    } catch (err) {
      console.error("Error capturing frame:", err);
      setError("Error capturing frame from video.");
    }
  };

  const startLiveMode = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // Wait for video to be ready before starting capture
        videoRef.current.onloadedmetadata = () => {
          console.log("Video metadata loaded, starting frame capture");
        };
      }
      setIsLiveMode(true);
      setError(null);
      setShowLiveOverlay(true); // Show overlay when starting live mode
      // Start polling frames every 2 seconds (slightly longer to allow video to initialize)
      const id = window.setInterval(() => {
        // Add a small delay to ensure video is playing
        setTimeout(captureAndSendFrame, 500);
      }, 2000);
      setLiveTimerId(id);
      setLiveOverlayActive(true);
    } catch (err) {
      console.error("Unable to start camera:", err);
      setError("Unable to access camera. Check permissions.");
    }
  };

  const stopLiveMode = () => {
    // Clear any pending timeouts
    if (liveTimerId) {
      window.clearInterval(liveTimerId);
      setLiveTimerId(null);
    }
    
    // Stop video stream
    const video = videoRef.current;
    if (video) {
      const stream = video.srcObject;
      if (stream && typeof stream.getTracks === "function") {
        stream.getTracks().forEach((track) => {
          track.stop();
        });
      }
      video.srcObject = null;
    }
    
    // Reset state
    setIsLiveMode(false);
    setLiveOverlayActive(false);
    setError(null);
    
    // Optionally return to home view if on safety view
    if (view === 'safety' && !detectionResult) {
      setView('home');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-950 to-slate-900 text-slate-100 font-sans">
      <Navbar setView={setView} setShowLoginModal={setShowLoginModal} />

      {showLoginModal && <LoginModal setShowLoginModal={setShowLoginModal} />}
      
      <main className="relative">
        {/* Hidden canvas used for extracting frames from the live video */}
        <canvas ref={canvasRef} style={{ display: 'none' }} width="640" height="480" />
        {showLiveOverlay && (
          <LiveDetectionOverlay 
            isActive={isLoading || liveOverlayActive} 
            detectionResult={detectionResult}
            onClose={() => setShowLiveOverlay(false)}
            currentView={view}
          />
        )}
        {view === 'home' && (
          <HomeView
            selectedFile={selectedFile}
            previewUrl={previewUrl}
            detectionResult={detectionResult}
            isLoading={isLoading}
            error={error}
            handleFileChange={handleFileChange}
            handleSubmit={handleSubmit}
            triggerFileSelect={triggerFileSelect}
            fileInputRef={fileInputRef}
            onBeginDetect={handleBeginDetect}
            isLiveMode={isLiveMode}
            startLiveMode={startLiveMode}
            stopLiveMode={stopLiveMode}
            videoRef={videoRef}
          />
        )}
        {view === 'description' && <DescriptionView />}
        {view === 'safety' && <SafetyView detectionResult={detectionResult} setView={setView} />}
      </main>

      <Footer />
    </div>
  );
}

export default App;

