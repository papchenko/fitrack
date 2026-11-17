import { useState, useEffect, useRef } from "react";

import { useNavigate, useLocation } from "react-router-dom";

import { hideMapLabelsForCapture } from "../../shared/RecrunMap/mapCaptureLabels";



import { collection, addDoc, serverTimestamp } from "firebase/firestore";

import { db, auth } from "../../../../firebase";

import { toast } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";

import { fitRouteForCapture } from "../../shared/RecrunMap/fitRouteForCapture";


import { uploadToCloudinary } from "../../../../utils/cloudinary";
import RunFeedbackModal from "../../runfeedback/RunFeedbackModal";

import * as maplibregl from "maplibre-gl";
import RecrunMap, {
  waitForMapRender,
} from "../../shared/RecrunMap/RecrunMap";

import { FiMinimize2 } from "react-icons/fi";

import { FaPlay, FaPause, FaStop } from "react-icons/fa6";

import { FaArrowCircleLeft } from "react-icons/fa";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
  faFlagCheckered,
  faBan,
  faRotate,
} from "@fortawesome/free-solid-svg-icons";

import { processActivityAchievements } from "../../functional/achievements/processActivityAchievements";

import MapAppearance, {
  useMapAppearance,
} from "../../shared/MapAppearance";

import "./cyclingTracker.scss";



function formatTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);

  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");

  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(
    2,

    "0",
  );

  const seconds = String(totalSeconds % 60).padStart(2, "0");

  return `${hours}:${minutes}:${seconds}`;
}

function getElapsedTime(startTime, elapsedBeforePause, paused) {
  if (!startTime) return elapsedBeforePause || 0;

  if (paused) {
    return elapsedBeforePause || 0;
  }

  return (elapsedBeforePause || 0) + Math.max(0, Date.now() - startTime);
}

export default function CyclingTracker() {
  const [route, setRoute] = useState([]);

  const [tracking, setTracking] = useState(false);

  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [maxSpeed, setMaxSpeed] = useState(0);
  const maxSpeedRef = useRef(0);
  const lastSpeedPointRef = useRef(null);

  const navigate = useNavigate();
  const {
    theme,
    changeTheme,
    autoEnabled,
    changeAutoEnabled,
} = useMapAppearance();
  const location = useLocation();
  const autoStartHandledRef = useRef(false);

  const [preloadPosition, setPreloadPosition] = useState(null);

  const [distance, setDistance] = useState(0);

  const [startTime, setStartTime] = useState(null);

  const [duration, setDuration] = useState(null);

  const [liveDuration, setLiveDuration] = useState(0);

  const [locationName, setLocationName] = useState("");

  const [showConfirm, setShowConfirm] = useState(false);

  const [showRunFeedback, setShowRunFeedback] = useState(false);
  const [savedRunId, setSavedRunId] = useState(null);

  const [runTitle, setRunTitle] = useState("");

  const [runNotes, setRunNotes] = useState("");

  const [selectedFiles, setSelectedFiles] = useState([]);

  const [previews, setPreviews] = useState([]);

  const [uploading, setUploading] = useState(false);

  const [saveMapImage, setSaveMapImage] = useState(true);

  const [paused, setPaused] = useState(false);

  const [elapsedBeforePause, setElapsedBeforePause] = useState(0);

  const mapRef = useRef();

  const timerRef = useRef(null);

  const distanceRef = useRef(0);

  const routeRef = useRef([]);

  const locationNameRef = useRef("");

  const lastGeocodedPositionRef = useRef(null);

  useEffect(() => {
    distanceRef.current = distance;
  }, [distance]);

  useEffect(() => {
    routeRef.current = route;
  }, [route]);

  const lastBackgroundTimeRef = useRef(null);

  const saveTrackingState = () => {
    if (!tracking) return;

    localStorage.setItem(
      "cyclingCounterState",

      JSON.stringify({
        tracking: true,

        route: routeRef.current,

        currentSpeed,
        maxSpeed: maxSpeedRef.current,

        distance: distanceRef.current,

        startTime,

        elapsedBeforePause,

        paused,

        lastUpdatedAt: Date.now(),
      }),
    );
  };

  const MIN_DISTANCE_METERS = 8;

  const MAX_CYCLING_SPEED_KMH = 80;

  const MAX_RIDE_PHOTOS = 6;

  const [isMinimized, setIsMinimized] = useState(false);

  const [gpsSignal, setGpsSignal] = useState(0);

  const [stopProgress, setStopProgress] = useState(0); //!

  const [mapRotationReset, setMapRotationReset] = useState(0);

  const [newAchievements, setNewAchievements] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem("cyclingCounterState");

    if (!saved) return;

    try {
      const data = JSON.parse(saved);

      if (!data.tracking) return;

      const restoredRoute = data.route || [];

      const restoredDistance = data.distance || 0;

      setTracking(true);

      setRoute(restoredRoute);

      setCurrentSpeed(0);
      setMaxSpeed(data.maxSpeed || 0);
      maxSpeedRef.current = data.maxSpeed || 0;

      setDistance(restoredDistance);

      setStartTime(data.startTime || Date.now());

      setElapsedBeforePause(data.elapsedBeforePause || 0);

      setPaused(data.paused || false);

      routeRef.current = restoredRoute;

      distanceRef.current = restoredDistance;

      const restoredDuration = getElapsedTime(
        data.startTime,

        data.elapsedBeforePause || 0,

        data.paused || false,
      );

      setLiveDuration(restoredDuration);

      console.log("CyclingTracker state restored:", {
        routePoints: restoredRoute.length,

        distance: restoredDistance,

        duration: restoredDuration,

        paused: data.paused || false,
      });
    } catch (error) {
      console.error("Failed to restore CyclingTracker state:", error);

      localStorage.removeItem("cyclingCounterState");
    }
  }, []);

  useEffect(() => {
    const saveCurrentState = () => {
      if (!tracking) return;

      const currentRoute = routeRef.current;

      const currentDistance = distanceRef.current;

      localStorage.setItem(
        "cyclingCounterState",

        JSON.stringify({
          tracking: true,

          route: currentRoute,

          currentSpeed: 0,
          maxSpeed: maxSpeedRef.current,

          distance: currentDistance,

          startTime,

          paused,

          elapsedBeforePause,

          savedAt: Date.now(),
        }),
      );
    };

    saveCurrentState();

    window.addEventListener("pagehide", saveCurrentState);

    window.addEventListener("beforeunload", saveCurrentState);

    return () => {
      window.removeEventListener("pagehide", saveCurrentState);

      window.removeEventListener("beforeunload", saveCurrentState);
    };
  }, [tracking, startTime, paused, elapsedBeforePause]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!tracking) return;

      if (document.visibilityState === "hidden") {
        lastBackgroundTimeRef.current = Date.now();

        saveTrackingState();

        console.log(
          "CyclingTracker: app went to background",

          new Date(lastBackgroundTimeRef.current).toLocaleTimeString(),
        );
      }

      if (document.visibilityState === "visible") {
        const now = Date.now();

        console.log(
          "CyclingTracker: app returned to foreground",

          new Date(now).toLocaleTimeString(),
        );

        const elapsed = getElapsedTime(startTime, elapsedBeforePause, paused);

        setLiveDuration(elapsed);

        lastBackgroundTimeRef.current = null;
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [tracking, startTime, elapsedBeforePause, paused, route, distance]);

  useEffect(() => {
    const handlePageHide = () => {
      if (!tracking) return;

      lastBackgroundTimeRef.current = Date.now();

      saveTrackingState();

      console.log(
        "CyclingTracker: pagehide",

        new Date(lastBackgroundTimeRef.current).toLocaleTimeString(),
      );
    };

    window.addEventListener("pagehide", handlePageHide);

    return () => {
      window.removeEventListener("pagehide", handlePageHide);
    };
  }, [tracking, route, distance, startTime, elapsedBeforePause, paused]);

  useEffect(() => {
    const handlePageShow = () => {
      if (!tracking) return;

      const now = Date.now();

      const elapsed = getElapsedTime(startTime, elapsedBeforePause, paused);

      setLiveDuration(elapsed);

      console.log(
        "CyclingTracker: pageshow",

        new Date(now).toLocaleTimeString(),

        "duration:",

        formatTime(elapsed),
      );
    };

    window.addEventListener("pageshow", handlePageShow);

    return () => {
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, [tracking, startTime, elapsedBeforePause, paused]);

  useEffect(() => {
    clearInterval(timerRef.current);

    if (!tracking || !startTime || paused) {
      return;
    }

    const updateTimer = () => {
      const elapsed = getElapsedTime(startTime, elapsedBeforePause, paused);

      setLiveDuration(elapsed);
    };

    updateTimer();

    timerRef.current = setInterval(updateTimer, 1000);

    return () => {
      clearInterval(timerRef.current);
    };
  }, [tracking, startTime, paused, elapsedBeforePause]);

  useEffect(() => {
    if (!navigator.geolocation) return;

    const id = navigator.geolocation.watchPosition(
      (pos) => {
        setGpsSignal(pos.coords.accuracy);

        setPreloadPosition({
          lat: pos.coords.latitude,

          lng: pos.coords.longitude,
        });
      },

      (err) => console.warn("Preload geo error:", err),

      {
        enableHighAccuracy: true,

        maximumAge: 1000,

        timeout: 10000,
      },
    );

    return () => navigator.geolocation.clearWatch(id);
  }, []);

  useEffect(() => {
    if (!tracking) return;

    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");

      return;
    }

    let watchId = null;

    const startGpsTracking = () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);

        watchId = null;
      }

      console.log("Starting GPS watcher");

      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          setGpsSignal(pos.coords.accuracy);

          const { latitude, longitude, accuracy, speed } = pos.coords;

          addGpsPoint(latitude, longitude, pos.timestamp, accuracy, speed);
        },

        (err) => {
          console.warn("GPS watcher error:", err);
        },

        {
          enableHighAccuracy: true,

          maximumAge: 1000,

          timeout: 10000,
        },
      );
    };

    startGpsTracking();

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        console.log("App returned to foreground — restarting GPS");

        setTimeout(() => {
          startGpsTracking();
        }, 500);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);

        watchId = null;
      }

      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [tracking, paused]);

  const fetchLocationName = async (lat, lon) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
      );

      if (!res.ok) {
        throw new Error(`Nominatim error: ${res.status}`);
      }

      const data = await res.json();

      if (data.address) {
        const street = data.address.road || "";

        const houseNumber = data.address.house_number || "";

        const city =
          data.address.city ||
          data.address.town ||
          data.address.village ||
          data.address.hamlet ||
          "";

        const location = [
          street && houseNumber ? `${street} ${houseNumber}` : street,

          city,
        ]

          .filter(Boolean)

          .join(", ");

        const finalLocation =
          location || `Lat: ${lat.toFixed(4)}, Lng: ${lon.toFixed(4)}`;

        locationNameRef.current = finalLocation;

        setLocationName(finalLocation);

        return finalLocation;
      }

      const fallback = `Lat: ${lat.toFixed(4)}, Lng: ${lon.toFixed(4)}`;

      locationNameRef.current = fallback;

      setLocationName(fallback);

      return fallback;
    } catch (error) {
      console.warn("Could not get address:", error);

      return locationNameRef.current;
    }
  };

  const handleStart = () => {
    localStorage.removeItem("cyclingCounterState");

    routeRef.current = [];

    distanceRef.current = 0;

    locationNameRef.current = "";

    lastGeocodedPositionRef.current = null;

    setLocationName("");

    if (preloadPosition) {
      const startPoint = {
        lat: preloadPosition.lat,

        lng: preloadPosition.lng,
      };

      routeRef.current = [startPoint];

      setRoute([startPoint]);

      lastGeocodedPositionRef.current = startPoint;

      fetchLocationName(startPoint.lat, startPoint.lng);
    } else {
      setRoute([]);
    }

    setCurrentSpeed(0);
    setMaxSpeed(0);
    maxSpeedRef.current = 0;
    lastSpeedPointRef.current = null;

    setDistance(0);

    setStartTime(Date.now());

    setDuration(null);

    setLiveDuration(0);

    setRunTitle("");

    setRunNotes("");

    setSelectedFiles([]);

    setPreviews([]);

    setTracking(true);

    setPaused(false);

    setElapsedBeforePause(0);

    setIsMinimized(false);
  };
  useEffect(() => {
    if (location.state?.autoStart !== true) return;
    if (autoStartHandledRef.current) return;

    autoStartHandledRef.current = true;

    // Не запускаємо нову поїздку, якщо попередня ще активна
    // або очікує збереження.
    if (!tracking && !showConfirm && duration === null) {
      handleStart();
    }

    // Прибираємо autoStart, щоб не було повторного запуску
    navigate(location.pathname, {
      replace: true,
      state: null,
    });
  }, [location.state?.autoStart]);

  const STOP_HOLD_DURATION = 1200;

  const stopHoldTimerRef = useRef(null);

  const stopProgressTimerRef = useRef(null);

  const startStopHold = () => {
    if (!tracking) return;

    const startTime = Date.now();

    setStopProgress(0);

    stopProgressTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;

      const progress = Math.min((elapsed / STOP_HOLD_DURATION) * 100, 100);

      setStopProgress(progress);
    }, 16);

    stopHoldTimerRef.current = setTimeout(() => {
      clearInterval(stopProgressTimerRef.current);

      stopProgressTimerRef.current = null;

      setStopProgress(100);

      handleStop();
    }, STOP_HOLD_DURATION);
  };

  const cancelStopHold = () => {
    clearTimeout(stopHoldTimerRef.current);

    clearInterval(stopProgressTimerRef.current);

    stopHoldTimerRef.current = null;

    stopProgressTimerRef.current = null;

    setStopProgress(0);
  };

  const handleStop = () => {
    const now = Date.now();

    const currentRoute = routeRef.current;

    const currentDistance = distanceRef.current;

    setTracking(false);
    setCurrentSpeed(0);
    lastSpeedPointRef.current = null;

    const elapsed = paused
      ? elapsedBeforePause
      : elapsedBeforePause + Math.max(0, now - startTime);

    const safeElapsed = Number.isFinite(elapsed) ? elapsed : 0;

    setDuration(safeElapsed);

    setLiveDuration(safeElapsed);

    setShowConfirm(true);

    setPaused(false);

    setElapsedBeforePause(0);

    localStorage.setItem(
      "cyclingCounterState",

      JSON.stringify({
        tracking: false,

        route: currentRoute,

        currentSpeed: 0,
        maxSpeed: maxSpeedRef.current,

        distance: currentDistance,

        startTime,

        elapsedBeforePause: safeElapsed,

        paused: false,

        lastUpdatedAt: now,
      }),
    );
  };

  const GEOCODING_DISTANCE_METERS = 50;


const addGpsPoint = (latitude, longitude, timestamp, accuracy, gpsSpeed) => {
  if (paused) return;

  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude)
  ) {
    return;
  }

  if (Number.isFinite(accuracy) && accuracy > 50) {
    return;
  }

  const newPoint = {
    lat: latitude,
    lng: longitude,
  };

  setRoute((prevRoute) => {
    if (prevRoute.length === 0) {
      routeRef.current = [newPoint];
      lastSpeedPointRef.current = {
        ...newPoint,
        timestamp,
      };

      fetchLocationName(latitude, longitude);

      return [newPoint];
    }

    const lastPoint = prevRoute[prevRoute.length - 1];

    const segmentDistance = getDistanceFromLatLonInKm(
      lastPoint.lat,
      lastPoint.lng,
      newPoint.lat,
      newPoint.lng
    );

    const distanceMeters = segmentDistance * 1000;

    // Ignore unrealistic GPS jumps.
    if (segmentDistance > 0.3) {
      console.warn(
        "Ignoring unrealistic GPS jump:",
        segmentDistance,
        "km"
      );
      return prevRoute;
    }

    // Ignore movements smaller than 8 meters.
    if (distanceMeters < MIN_DISTANCE_METERS) {
      return prevRoute;
    }

    const previousSpeedPoint = lastSpeedPointRef.current;

    if (previousSpeedPoint) {
      const elapsedSeconds =
        (timestamp - previousSpeedPoint.timestamp) / 1000;

      if (elapsedSeconds > 0) {
        const calculatedSpeed =
          segmentDistance / (elapsedSeconds / 3600);

        if (calculatedSpeed > MAX_CYCLING_SPEED_KMH) {
          console.warn(
            "Ignoring unrealistic cycling speed:",
            calculatedSpeed
          );

          return prevRoute;
        }

        const nextSpeed =
          Number.isFinite(gpsSpeed) && gpsSpeed >= 0
            ? gpsSpeed * 3.6
            : calculatedSpeed;

        const safeSpeed = Math.min(
          nextSpeed,
          MAX_CYCLING_SPEED_KMH
        );

        setCurrentSpeed(safeSpeed);

        maxSpeedRef.current = Math.max(
          maxSpeedRef.current,
          safeSpeed
        );

        setMaxSpeed(maxSpeedRef.current);
      }
    }

    lastSpeedPointRef.current = {
      ...newPoint,
      timestamp,
    };

    const lastGeocodedPosition =
      lastGeocodedPositionRef.current;

    if (lastGeocodedPosition) {
      const distanceFromLastGeocode =
        getDistanceFromLatLonInKm(
          lastGeocodedPosition.lat,
          lastGeocodedPosition.lng,
          latitude,
          longitude
        ) * 1000;

      if (
        distanceFromLastGeocode >=
        GEOCODING_DISTANCE_METERS
      ) {
        lastGeocodedPositionRef.current = newPoint;

        fetchLocationName(latitude, longitude);
      }
    } else {
      lastGeocodedPositionRef.current = newPoint;

      fetchLocationName(latitude, longitude);
    }

    const newDistance =
      distanceRef.current + segmentDistance;

    distanceRef.current = newDistance;

    setDistance(newDistance);

    const newRoute = [...prevRoute, newPoint];

    routeRef.current = newRoute;

    return newRoute;
  });
};


  const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
    const R = 6371;

    const dLat = deg2rad(lat2 - lat1);

    const dLon = deg2rad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  const deg2rad = (deg) => (deg * Math.PI) / 180;

  const getGpsQuality = () => {
    if (gpsSignal === 0) return "Detecting...";

    if (gpsSignal <= 10) return "Excellent";

    if (gpsSignal <= 25) return "Good";

    if (gpsSignal <= 50) return "Fair";

    return "Weak";
  };

  const handleFilesSelected = (e) => {
    const newFiles = Array.from(e.target.files || []);

    if (!newFiles.length) return;

    const remainingSlots = MAX_RIDE_PHOTOS - selectedFiles.length;

    if (remainingSlots <= 0) {
      toast.warning(
        `You can add a maximum of ${MAX_RIDE_PHOTOS} photos per ride.`,
      );

      e.target.value = "";

      return;
    }

    const filesToAdd = newFiles.slice(0, remainingSlots);

    if (newFiles.length > remainingSlots) {
      toast.warning(
        `You can add only ${remainingSlots} more photo${
          remainingSlots === 1 ? "" : "s"
        }.`,
      );
    }

    setSelectedFiles((prev) => [...prev, ...filesToAdd]);

    setPreviews((prev) => [
      ...prev,

      ...filesToAdd.map((file) => URL.createObjectURL(file)),
    ]);

    e.target.value = "";
  };

  const handleCancelSave = () => {
    setShowConfirm(false);

    setSelectedFiles([]);

    setPreviews([]);

    setRunTitle("");

    setRunNotes("");

    setDuration(null);

    setLiveDuration(0);

    setLocationName("");

    locationNameRef.current = "";

    lastGeocodedPositionRef.current = null;

    setRoute([]);

    setCurrentSpeed(0);
    setMaxSpeed(0);
    maxSpeedRef.current = 0;
    lastSpeedPointRef.current = null;

    setDistance(0);

    distanceRef.current = 0;

    setStartTime(null);

    setTracking(false);

    setPaused(false);

    setElapsedBeforePause(0);

    setIsMinimized(false);

    localStorage.removeItem("cyclingCounterState");
  };

  const resetState = () => {
    setRoute([]);

    setCurrentSpeed(0);
    setMaxSpeed(0);
    maxSpeedRef.current = 0;
    lastSpeedPointRef.current = null;

    setDistance(0);

    setStartTime(null);

    setDuration(null);

    setRunTitle("");

    setRunNotes("");

    setSelectedFiles([]);

    setPreviews([]);

    setShowConfirm(false);

    setLiveDuration(0);

    setLocationName("");

    locationNameRef.current = "";

    lastGeocodedPositionRef.current = null;

    routeRef.current = [];

    distanceRef.current = 0;

    localStorage.removeItem("cyclingCounterState");

    setTracking(false);

    setPaused(false);

    setElapsedBeforePause(0);

    setIsMinimized(false);
  };



const prepareMapForCapture = async () => {
  const map = mapRef.current;
  const currentRoute = routeRef.current;

  if (!map || currentRoute.length < 2) {
    return null;
  }

  const previousState = {
    center: map.getCenter(),
    zoom: map.getZoom(),
    bearing: map.getBearing(),
    pitch: map.getPitch(),
  };

  const coordinates = currentRoute
    .filter(
      (point) =>
        Number.isFinite(point.lat) &&
        Number.isFinite(point.lng)
    )
    .map((point) => [point.lng, point.lat]);

  if (coordinates.length < 2) {
    return null;
  }

  const bounds = new maplibregl.LngLatBounds();

  coordinates.forEach((coordinate) => {
    bounds.extend(coordinate);
  });

  map.resize();

  const container = map.getContainer();
  const rect = container.getBoundingClientRect();

  if (rect.width === 0 || rect.height === 0) {
    throw new Error(
      "Map container is hidden or has no dimensions."
    );
  }

await fitRouteForCapture(
    map,
    currentRoute,
    waitForMapRender
);

  return previousState;
};



  const handleSave = async (currentDuration) => {
    if (!runTitle.trim()) {
      toast.error("Please enter a title.");

      return;
    }

    setUploading(true);

    try {
      const safeDuration = Number.isFinite(currentDuration)
        ? currentDuration
        : 0;

      const durationMinutes = safeDuration / 60000;

      const averageSpeed =
        durationMinutes > 0 ? distanceRef.current / (durationMinutes / 60) : 0;

      let mapDataUrl = null;




if (saveMapImage) {
    const map = mapRef.current;

    if (map && routeRef.current.length > 1) {
        let previousMapState = null;
        let restoreMapLabels = () => {};

        try {
            previousMapState = await prepareMapForCapture();

            if (previousMapState) {
                // Hide map labels before screenshot.
                restoreMapLabels = hideMapLabelsForCapture(map);

                const canvas = map.getCanvas();

                if (
                    canvas.width === 0 ||
                    canvas.height === 0
                ) {
                    throw new Error(
                        "Map canvas has no dimensions."
                    );
                }

                // Wait for the map to render without labels.
                await waitForMapRender(map);

                mapDataUrl = canvas.toDataURL("image/png");

                if (mapDataUrl === "data:,") {
                    throw new Error(
                        "Map screenshot is empty."
                    );
                }
            }
        } catch (error) {
            console.error("Map screenshot failed:", error);
            toast.warning("Could not capture route map.");
        } finally {
            // Always restore labels, even if screenshot fails.
            restoreMapLabels();

            // Restore the map's previous position and zoom.
            if (previousMapState) {
                map.jumpTo({
                    center: previousMapState.center,
                    zoom: previousMapState.zoom,
                    bearing: previousMapState.bearing,
                    pitch: previousMapState.pitch,
                });
            }
        }
    }
}



      if (selectedFiles.length > MAX_RIDE_PHOTOS) {
        toast.error(
          `A ride can contain a maximum of ${MAX_RIDE_PHOTOS} photos.`,
        );

        setUploading(false);

        return;
      }

      let uploadedUrls = [];

      if (selectedFiles.length) {
        const promises = selectedFiles.map((file) =>
          uploadToCloudinary(file, {
            folder: "recrun_photos",

            public_id_prefix: "ride",

            tags: ["recrun", "cycling"],

            returnType: "secure_url",
          }),
        );

        uploadedUrls = await Promise.all(promises);
      }

      let finalLocationName = locationNameRef.current || locationName;

      if (routeRef.current.length > 0) {
        const lastPoint = routeRef.current[routeRef.current.length - 1];

        const latestLocation = await fetchLocationName(
          lastPoint.lat,

          lastPoint.lng,
        );

        if (latestLocation) {
          finalLocationName = latestLocation;
        }
      }

const finalDistance = Number(distanceRef.current);

// Upload cycling route map to Cloudinary.
let mapImageUrl = null;

if (saveMapImage && mapDataUrl) {
    const response = await fetch(mapDataUrl);
    const blob = await response.blob();

    const mapFile = new File(
        [blob],
        `recrun-cycling-map-${Date.now()}.png`,
        { type: "image/png" }
    );

    mapImageUrl = await uploadToCloudinary(mapFile, {
        folder: "recrun_maps",
        public_id_prefix: "cycling_map",
        tags: ["recrun", "cycling", "map"],
        returnType: "secure_url",
    });
}

const savedRide = await addDoc(collection(db, "routes"), {
        uid: auth.currentUser.uid,
        visibility: "public",
        routeMapSaved: Boolean(saveMapImage),

        activityType: "cycling",

        title: runTitle.trim() || getDefaultRideTitle(),

        notes: runNotes.trim() || "",

        steps: 0,

        distance: finalDistance,

        timestamp: serverTimestamp(),

        createdAt: new Date(),

        pace: null,
        averageSpeed,
        maxSpeed: maxSpeedRef.current,

        duration: durationMinutes,

photos: [
    ...(mapImageUrl ? [mapImageUrl] : []),
    ...uploadedUrls,
],

        route: saveMapImage ? route : [],

        locationName: finalLocationName,
           });

      // CYCLING ACHIEVEMENTS
      try {
        const unlockedAchievements = await processActivityAchievements({
          uid: auth.currentUser.uid,
          routeId: savedRide.id,
          activityType: "cycling",
        });

        setNewAchievements(unlockedAchievements);
      } catch (achievementError) {
        console.error(
          "Cycling achievements error:",
          achievementError
        );
      }

      toast.success("Route saved!");

      resetState();

      setSavedRunId(savedRide.id);
      setShowRunFeedback(true);
    } catch (err) {
      console.error("Save failed:", err);

      toast.error("Saving failed.");
    } finally {
      setUploading(false);
    }
  };

  const getDefaultRideTitle = () => {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) return "Morning Ride";

    if (hour >= 12 && hour < 18) return "Afternoon Ride";

    return "Evening Ride";
  };

  useEffect(() => {
    if (!runTitle) setRunTitle(getDefaultRideTitle());
  }, [showConfirm]);

  return (
    <>
      {tracking && !isMinimized && (
        <div
          className="run-fullscreen"
          onTouchStart={(e) => (window.startY = e.touches[0].clientY)}
          onTouchEnd={(e) => {
            const endY = e.changedTouches[0].clientY;

            if (endY - window.startY > 100) {
              setIsMinimized(true);
            }
          }}>
          <div className="run-fullscreen-content">
            <h1 className="animated-number">{distance.toFixed(2)} km</h1>

            <p className="animated-number">
              {currentSpeed.toFixed(1) + " km/h"}
            </p>

            <p className="animated-number">{formatTime(liveDuration)}</p>

            <div onClick={() => setIsMinimized(true)}>
              <FiMinimize2 className="fs-1 mt-5" />
            </div>
          </div>
        </div>
      )}

      {(!tracking || isMinimized) && (
        <div className="main-wrapper-lens">
          <div className="step__container containe">
            <div style={{ maxWidth: 800, margin: "auto", padding: 20 }}>
              <div className="run-controls">
                <button
  className="run-btn record"
  onClick={handleStart}
  disabled={tracking}
>
  <span className="dot"></span>
</button>

                <button
                  className={`run-btn pause ${paused ? "resume" : ""}`}
                  onClick={() => {
                    if (paused) {
                      const now = Date.now();

                      setStartTime(now);

                      setPaused(false);
                      lastSpeedPointRef.current = null;

                      setLiveDuration(elapsedBeforePause);

                      localStorage.setItem(
                        "cyclingCounterState",

                        JSON.stringify({
                          tracking: true,

                          route: routeRef.current,

                          currentSpeed: 0,
                          maxSpeed: maxSpeedRef.current,

                          distance: distanceRef.current,

                          startTime: now,

                          elapsedBeforePause,

                          paused: false,

                          lastUpdatedAt: now,
                        }),
                      );
                    } else {
                      const now = Date.now();

                      const elapsed = getElapsedTime(
                        startTime,

                        elapsedBeforePause,

                        false,
                      );

                      const safeElapsed = Number.isFinite(elapsed)
                        ? elapsed
                        : elapsedBeforePause;

                      setElapsedBeforePause(safeElapsed);

                      setLiveDuration(safeElapsed);

                      setPaused(true);
                      setCurrentSpeed(0);
                      lastSpeedPointRef.current = null;

                      localStorage.setItem(
                        "cyclingCounterState",

                        JSON.stringify({
                          tracking: true,

                          route: routeRef.current,

                          currentSpeed: 0,
                          maxSpeed: maxSpeedRef.current,

                          distance: distanceRef.current,

                          startTime,

                          elapsedBeforePause: safeElapsed,

                          paused: true,

                          lastUpdatedAt: now,
                        }),
                      );
                    }
                  }}
                  disabled={!tracking}>
                  {paused ? <FaPlay /> : <FaPause />}
                </button>

                <button
                  className={`run-btn stop ${
                    stopProgress > 0 ? "stop-holding" : ""
                  }`}
                  onMouseDown={startStopHold}
                  onMouseUp={cancelStopHold}
                  onMouseLeave={cancelStopHold}
                  onTouchStart={startStopHold}
                  onTouchEnd={cancelStopHold}
                  onTouchCancel={cancelStopHold}
                  disabled={!tracking}
                  style={{
                    "--stop-progress": `${stopProgress}%`,
                  }}>
                  <span className="stop-progress"></span>

                  <span className="stop-icon">
                    <FaStop />
                  </span>
                </button>
              </div>

              {duration !== null && !tracking && (
                <p>
                  <strong>Duration:</strong> {formatTime(duration)}
                </p>
              )}

              {locationName && (
                <p className="run-location">
                  <strong>Location:</strong>{" "}
                  <span className="run-location-text">{locationName}</span>
                </p>
              )}

              <div className="gps-status">
                <span className="gps-status-label">GPS:</span>

                <span
                  className={`gps-status-value ${
                    gpsSignal === 0
                      ? "detecting"
                      : gpsSignal <= 10
                        ? "excellent"
                        : gpsSignal <= 25
                          ? "good"
                          : gpsSignal <= 50
                            ? "fair"
                            : "weak"
                  }`}>
                  {getGpsQuality()}
                </span>

                {gpsSignal > 0 && (
                  <span className="gps-accuracy">
                    ±{Math.round(gpsSignal)} m
                  </span>
                )}
              </div>

              <div className="map-wrapper" id="mapWrapper">
{!tracking && (
<MapAppearance
    theme={theme}
    onChange={changeTheme}
    autoEnabled={autoEnabled}
    onAutoChange={changeAutoEnabled}
/>
)}
                {tracking && (
                  <button
                    type="button"
                    className="map-rotation-reset"
                    onClick={() => setMapRotationReset((prev) => prev + 1)}
                    aria-label="Reset map rotation"
                    title="Reset map rotation">
                    <FontAwesomeIcon icon={faRotate} />
                  </button>
                )}

<RecrunMap
  route={route}
  position={preloadPosition}
  theme={theme}
  tracking={tracking}
  resetRotation={mapRotationReset}
  follow={tracking}
  zoom={17}
  onMapReady={(map) => {
    mapRef.current = map;
  }}
/>

              </div>

              {!tracking && (
                <button
                  className="steps-back-button"
                  onClick={() => navigate("/")}>
                  <FaArrowCircleLeft />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {showConfirm && (
        <div className="modal-overlay">
          <div className="modal-window bg-dark">
            {/* <p className="text-white fs-3">Save the ride</p> */}

            <div style={{ color: "white", marginBottom: 15 }}>
              <p>
                <strong>Distance:</strong> {distance.toFixed(2)} km
              </p>

              <p>
                <strong>Average speed:</strong>{" "}
                {duration > 0
                  ? (distance / (duration / 3600000)).toFixed(1) + " km/h"
                  : "—"}
              </p>

              <p>
                <strong>Max speed:</strong> {maxSpeed.toFixed(1)} km/h
              </p>
              <p>
                <strong>Time:</strong> {formatTime(duration)}
              </p>
            </div>

            <div style={{ marginBottom: 15 }}>
              <input
                type="text"
                placeholder="Enter the ride title"
                value={runTitle}
                onChange={(e) => setRunTitle(e.target.value)}
                style={{
                  width: "100%",

                  marginBottom: 10,

                  padding: 8,

                  fontSize: 16,
                }}
                autoFocus
              />

              <small
                style={{ color: "#ccc", display: "block", marginBottom: 10 }}>
                (Optional) e.g., Morning Ride, Afternoon Ride, Evening Ride
              </small>

              <textarea
                placeholder="How'd it go? Share more about your activity and tag someone with @"
                value={runNotes}
                onChange={(e) => setRunNotes(e.target.value)}
                style={{
                  width: "100%",

                  padding: 8,

                  fontSize: 16,

                  minHeight: 80,
                }}
              />

              <small style={{ color: "#ccc", display: "block", marginTop: 4 }}>
                (Optional) Add notes about your ride, feelings, or achievements
              </small>
            </div>

            <div className="save-map-toggle">
              <label className="switch">
                <input
                  type="checkbox"
                  checked={saveMapImage}
                  onChange={(e) => setSaveMapImage(e.target.checked)}
                />

                <span className="slider"></span>
              </label>

              <span className="label-text">Save route map</span>
                {!saveMapImage && (
                <span
                  role="status"
                  style={{
                    color: "#ef4444",
                    fontSize: "0.72rem",
                    fontWeight: 500,
                    lineHeight: 1.35,
                    marginLeft: "6px",
                  }}
                >
                  Route replay will be unavailable.
                </span>
              )}
            </div>

            <div className="photo-wrapper-route" style={{ marginTop: 10 }}>
              <div
                style={{
                  display: "flex",

                  alignItems: "center",

                  justifyContent: "space-between",

                  marginBottom: 8,
                }}>
                <span
                  style={{
                    color: "#fff",

                    fontSize: 15,

                    fontWeight: 600,

                    paddingRight: "5px",
                  }}>
                  Ride photos
                </span>

                <span
                  style={{
                    color:
                      selectedFiles.length >= MAX_RIDE_PHOTOS
                        ? "#ff451c"
                        : "#aaa",

                    fontSize: 14,

                    fontWeight: 600,
                  }}>
                  {selectedFiles.length}/{MAX_RIDE_PHOTOS}
                </span>
              </div>

              {selectedFiles.length < MAX_RIDE_PHOTOS && (
                <label className="custom-file-upload">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFilesSelected}
                  />
                  Add photos
                </label>
              )}

              {selectedFiles.length >= MAX_RIDE_PHOTOS && (
                <div
                  style={{
                    color: "#aaa",

                    fontSize: 13,

                    marginTop: 5,
                  }}>
                  Maximum of {MAX_RIDE_PHOTOS} photos reached.
                </div>
              )}

              <div
                style={{
                  display: "flex",

                  gap: 8,

                  marginTop: 10,

                  flexWrap: "wrap",
                }}>
                {previews.map((preview, index) => (
                  <div
                    key={`${preview}-${index}`}
                    style={{
                      position: "relative",
                    }}>
                    <img
                      src={preview}
                      alt={`preview-${index + 1}`}
                      style={{
                        width: 100,

                        height: 70,

                        objectFit: "cover",

                        borderRadius: 6,

                        display: "block",
                      }}
                    />

                    <button
                      type="button"
                      onClick={() => {
                        URL.revokeObjectURL(preview);

                        setSelectedFiles((prev) =>
                          prev.filter((_, fileIndex) => fileIndex !== index),
                        );

                        setPreviews((prev) =>
                          prev.filter(
                            (_, previewIndex) => previewIndex !== index,
                          ),
                        );
                      }}
                      style={{
                        position: "absolute",

                        top: 4,

                        right: 4,

                        width: 24,

                        height: 24,

                        borderRadius: "50%",

                        border: "none",

                        background: "rgba(0, 0, 0, 0.75)",

                        color: "#fff",

                        fontSize: 16,

                        lineHeight: "24px",

                        padding: 0,

                        cursor: "pointer",

                        display: "flex",

                        alignItems: "center",

                        justifyContent: "center",
                      }}
                      aria-label={`Remove photo ${index + 1}`}>
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="modal-actions" style={{ marginTop: 15 }}>
              <button
                className="btn btn-save d-flex align-items-center fs-4"
                disabled={uploading}
                onClick={() => handleSave(duration)}
                style={{
                  marginRight: 10,

                  background: "#db3206",

                  border: "none",

                  borderRadius: 8,

                  padding: "10px 20px",

                  color: "white",

                  gap: 8,

                  cursor: uploading ? "not-allowed" : "pointer",

                  transition: "transform 0.1s, background 0.2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#ff451c")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "#db3206")
                }>
                {uploading ? (
                  "Saving..."
                ) : (
                  <>
                    <FontAwesomeIcon icon={faFlagCheckered} /> Finish
                  </>
                )}
              </button>

              <button
                className="btn btn-cancel d-flex align-items-center fs-4"
                onClick={handleCancelSave}
                disabled={uploading}
                style={{
                  background: "#555",

                  border: "none",

                  borderRadius: 8,

                  padding: "10px 20px",

                  color: "white",

                  gap: 8,

                  cursor: uploading ? "not-allowed" : "pointer",

                  transition: "transform 0.1s, background 0.2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#777")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "#555")
                }>
                <FontAwesomeIcon icon={faBan} /> Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {tracking && isMinimized && (
        <div className="run-mini-card" onClick={() => setIsMinimized(false)}>
          <div>
            <strong>{distance.toFixed(2)} km</strong>

            <p>Distance</p>
          </div>

          <div>
            <strong>
              {liveDuration > 0
                ? (distance / (liveDuration / 3600000)).toFixed(1)
                : "0.0"}
            </strong>

            <p>Avg. speed km/h</p>
          </div>

          <div>
            <strong>{formatTime(liveDuration)}</strong>

            <p>Time</p>
          </div>
        </div>
      )}
      <RunFeedbackModal
        isOpen={showRunFeedback}
        runId={savedRunId}
        onClose={() => {
          setShowRunFeedback(false);
          setSavedRunId(null);
        }}
      />
    </>
  );
}
