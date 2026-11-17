import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { hideMapLabelsForCapture } from "../../shared/RecrunMap/mapCaptureLabels";
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
} from "firebase/firestore";
import { db, auth } from "../../../../firebase";
import { processActivityAchievements } from "../../functional/achievements/processActivityAchievements";
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
import { FaPlay, FaPause, FaStop, FaArrowLeftLong } from "react-icons/fa6";
import { FaArrowCircleLeft } from "react-icons/fa";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFlagCheckered,
  faBan,
  faRotate,
} from "@fortawesome/free-solid-svg-icons";

import MapAppearance, {
  useMapAppearance,
} from "../../shared/MapAppearance";


import "../run-main/stepcounter.scss"; // Copy the original StepCounter stylesheet into the kayaking folder
import "./kayakingTracker.scss"; // Copy the original StepCounter stylesheet into the kayaking folder



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

export default function KayakingTracker() {
  const [route, setRoute] = useState([]);
  const [tracking, setTracking] = useState(false);
  const navigate = useNavigate();
  const {
    theme,
    changeTheme,
    autoEnabled,
    changeAutoEnabled,
} = useMapAppearance();

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

  const [kayakingType, setKayakingType] = useState("recreational");
  const KAYAKING_MODES = [
    { value: "recreational", label: "Recreational Kayaking" },
    { value: "touring", label: "Touring Kayaking" },
    { value: "sea", label: "Sea Kayaking" },
    { value: "whitewater", label: "Whitewater Kayaking" },
    { value: "canoeing", label: "Canoeing" },
  ];
  const kayakingTypeLabel = KAYAKING_MODES.find((m) => m.value === kayakingType)?.label || "Kayaking";


  useEffect(() => {
    distanceRef.current = distance;
  }, [distance]);

  useEffect(() => {
    routeRef.current = route;
  }, [route]);
  const lastBackgroundTimeRef = useRef(null);
  const lastGpsTimeRef = useRef(null);
  const lastGpsPositionRef = useRef(null);
  const [maxSpeed, setMaxSpeed] = useState(0);
  const maxSpeedRef = useRef(0);

  const saveTrackingState = () => {
    if (!tracking) return;

    localStorage.setItem(
      "kayakingTrackerState",
      JSON.stringify({
        tracking: true,
        route: routeRef.current,
        kayakingType,
        distance: distanceRef.current,
        startTime,
        elapsedBeforePause,
        paused,
        lastUpdatedAt: Date.now(),
      }),
    );
  };

  const MIN_DISTANCE_METERS = 5;

  const MAX_RUN_PHOTOS = 6;

  const [isMinimized, setIsMinimized] = useState(false);
  const [gpsSignal, setGpsSignal] = useState(0);

  const [stopProgress, setStopProgress] = useState(0); //!
  const [mapRotationReset, setMapRotationReset] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem("kayakingTrackerState");

    if (!saved) return;

    try {
      const data = JSON.parse(saved);

      if (!data.tracking) return;

      const restoredRoute = data.route || [];
      const restoredDistance = data.distance || 0;

      setTracking(true);
      setRoute(restoredRoute);
      setKayakingType(data.kayakingType || "recreational");
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

      console.log("StepCounter state restored:", {
        routePoints: restoredRoute.length,
        distance: restoredDistance,
        duration: restoredDuration,
        paused: data.paused || false,
      });
    } catch (error) {
      console.error("Failed to restore StepCounter state:", error);

      localStorage.removeItem("kayakingTrackerState");
    }
  }, []);

  useEffect(() => {
    const saveCurrentState = () => {
      if (!tracking) return;

      const currentRoute = routeRef.current;
      const currentDistance = distanceRef.current;

      localStorage.setItem(
        "kayakingTrackerState",
        JSON.stringify({
          tracking: true,
          route: currentRoute,
          kayakingType,
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
          "StepCounter: app went to background",
          new Date(lastBackgroundTimeRef.current).toLocaleTimeString(),
        );
      }

      if (document.visibilityState === "visible") {
        const now = Date.now();

        console.log(
          "StepCounter: app returned to foreground",
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
        "StepCounter: pagehide",
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
        "StepCounter: pageshow",
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

          const { latitude, longitude } = pos.coords;

          addGpsPoint(latitude, longitude, pos.timestamp);
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
    localStorage.removeItem("kayakingTrackerState");

    routeRef.current = [];
    distanceRef.current = 0;
    maxSpeedRef.current = 0;
    setMaxSpeed(0);

    locationNameRef.current = "";
    lastGeocodedPositionRef.current = null;
    lastGpsPositionRef.current = null;

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
    lastGpsPositionRef.current = null;

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
      "kayakingTrackerState",
      JSON.stringify({
        tracking: false,
        route: currentRoute,
          kayakingType,
        distance: currentDistance,
        startTime,
        elapsedBeforePause: safeElapsed,
        paused: false,
        lastUpdatedAt: now,
      }),
    );
  };

  const GEOCODING_DISTANCE_METERS = 50;
  const addGpsPoint = (latitude, longitude, timestamp = Date.now()) => {
    if (paused) return;

    const newPoint = {
      lat: latitude,
      lng: longitude,
    };

    setRoute((prevRoute) => {
      if (prevRoute.length === 0) {
        routeRef.current = [newPoint];

        fetchLocationName(latitude, longitude);

        return [newPoint];
      }

      const lastPoint = prevRoute[prevRoute.length - 1];

      const segmentDistance = getDistanceFromLatLonInKm(
        lastPoint.lat,
        lastPoint.lng,
        newPoint.lat,
        newPoint.lng,
      );

      const distanceMeters = segmentDistance * 1000;
      const previousGps = lastGpsPositionRef.current;
      const deltaHours = previousGps ? (timestamp - previousGps.time) / 3600000 : 0;
      const segmentSpeed = deltaHours > 0 ? segmentDistance / deltaHours : 0;
      if (deltaHours > 0 && segmentSpeed > 25) return prevRoute;

      if (segmentDistance > 1) {
        console.warn("Ignoring unrealistic GPS jump:", segmentDistance, "km");

        return prevRoute;
      }

      if (distanceMeters < MIN_DISTANCE_METERS) {
        return prevRoute;
      }

      const lastGeocodedPosition = lastGeocodedPositionRef.current;

      if (lastGeocodedPosition) {
        const distanceFromLastGeocode =
          getDistanceFromLatLonInKm(
            lastGeocodedPosition.lat,
            lastGeocodedPosition.lng,
            latitude,
            longitude,
          ) * 1000;

        if (distanceFromLastGeocode >= GEOCODING_DISTANCE_METERS) {
          lastGeocodedPositionRef.current = newPoint;

          fetchLocationName(latitude, longitude);
        }
      } else {
        lastGeocodedPositionRef.current = newPoint;

        fetchLocationName(latitude, longitude);
      }

      if (segmentSpeed > 0 && Number.isFinite(segmentSpeed)) {
        maxSpeedRef.current = Math.max(maxSpeedRef.current, segmentSpeed);
        setMaxSpeed(maxSpeedRef.current);
      }
      lastGpsPositionRef.current = { lat: latitude, lng: longitude, time: timestamp };
      const newDistance = distanceRef.current + segmentDistance;

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

    const remainingSlots = MAX_RUN_PHOTOS - selectedFiles.length;

    if (remainingSlots <= 0) {
      toast.warning(
        `You can add a maximum of ${MAX_RUN_PHOTOS} photos per kayaking session.`,
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
    lastGpsPositionRef.current = null;

    setRoute([]);
    setDistance(0);
    distanceRef.current = 0;
    maxSpeedRef.current = 0;
    setMaxSpeed(0);

    setStartTime(null);

    setTracking(false);
    setPaused(false);
    setElapsedBeforePause(0);

    setIsMinimized(false);

    localStorage.removeItem("kayakingTrackerState");
  };

  const resetState = () => {
    setRoute([]);
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
    lastGpsPositionRef.current = null;

    routeRef.current = [];
    distanceRef.current = 0;
    maxSpeedRef.current = 0;
    setMaxSpeed(0);

    localStorage.removeItem("kayakingTrackerState");

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

  const rect = map.getContainer().getBoundingClientRect();

  if (rect.width === 0 || rect.height === 0) {
    throw new Error("Map container is hidden or has no dimensions.");
  }

  map.resize();

await fitRouteForCapture(
    map,
    currentRoute,
    waitForMapRender
);

  return previousState;
};



  const handleSave = async (currentDuration) => {
    if (!auth.currentUser?.uid) {
      toast.error("Please sign in to save your activity.");
      return;
    }
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

      const finalDistanceForSpeed = distanceRef.current;
      const averageSpeed = durationMinutes > 0 ? finalDistanceForSpeed / (durationMinutes / 60) : 0;
      let mapDataUrl = null;



if (saveMapImage) {
    const map = mapRef.current;

    if (map && routeRef.current.length > 1) {
       let previousMapState = null;
let restoreMapLabels = () => {};

try {
    previousMapState = await prepareMapForCapture();
            if (previousMapState) {
                // Temporarily hide street names and POIs.
                restoreMapLabels =
                    hideMapLabelsForCapture(map);

                const canvas = map.getCanvas();

                if (
                    canvas.width === 0 ||
                    canvas.height === 0 ||
                    map.getContainer().getBoundingClientRect().width === 0 ||
                    map.getContainer().getBoundingClientRect().height === 0
                ) {
                    throw new Error(
                        "Map container is hidden or has no dimensions."
                    );
                }

                // Wait until the clean map is rendered.
                await waitForMapRender(map);

                // Save screenshot without labels.
                mapDataUrl = canvas.toDataURL("image/png");
            }
        } catch (error) {
    console.error("Map screenshot failed:", error);
    toast.warning("Could not capture route map.");
} finally {
            // Restore street names and POIs.
            restoreMapLabels();
            // Restore the original map camera.
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


      if (selectedFiles.length > MAX_RUN_PHOTOS) {
        toast.error(`A kayaking session can contain a maximum of ${MAX_RUN_PHOTOS} photos.`);
        setUploading(false);
        return;
      }

      let uploadedUrls = [];

      if (selectedFiles.length) {
        const promises = selectedFiles.map((file) =>
          uploadToCloudinary(file, {
            folder: "recrun_photos",
            public_id_prefix: "run",
            tags: ["recrun", "lens"],
            returnType: "secure_url",
          }),
        );

        uploadedUrls = await Promise.all(promises);
      }

      const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
      const username = userDoc.exists()
        ? userDoc.data().username
        : auth.currentUser.email;

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

// Upload kayaking route map to Cloudinary.
let mapImageUrl = null;

if (saveMapImage && mapDataUrl) {
    const response = await fetch(mapDataUrl);
    const blob = await response.blob();

    const mapFile = new File(
        [blob],
        `recrun-kayaking-map-${Date.now()}.png`,
        { type: "image/png" }
    );

    mapImageUrl = await uploadToCloudinary(mapFile, {
        folder: "recrun_maps",
        public_id_prefix: "kayaking_map",
        tags: ["recrun", "kayaking", "map"],
        returnType: "secure_url",
    });
}

const savedRoute = await addDoc(collection(db, "routes"), {
        uid: auth.currentUser.uid,
        visibility: "public",
        routeMapSaved: Boolean(saveMapImage),
        activityType: "kayaking",
        kayakingType,
        kayakingTypeLabel,
        title: runTitle.trim() || getDefaultKayakingTitle(),
        notes: runNotes.trim() || "",
        distance: finalDistance,
        timestamp: serverTimestamp(),
        createdAt: new Date(),
        averageSpeed: Number(averageSpeed.toFixed(2)),
        maxSpeed: Number(maxSpeedRef.current.toFixed(2)),
        duration: durationMinutes,
        durationMs: safeDuration,
photos: [
    ...(mapImageUrl ? [mapImageUrl] : []),
    ...uploadedUrls,
],
        route: saveMapImage ? routeRef.current : [],
        locationName: finalLocationName,
      });
      // Award achievements after the route has been saved.
      try {
        const unlockedAchievements = await processActivityAchievements({
          uid: auth.currentUser.uid,
          routeId: savedRoute.id,
          activityType: "kayaking",
        });
        setNewAchievements(unlockedAchievements);
      } catch (achievementError) {
        console.error("kayaking achievements error:", achievementError);
      }



      setSavedRunId(savedRoute.id);
      setShowRunFeedback(true);
      toast.success("Kayaking session saved!");
      resetState();
    } catch (err) {
      console.error("Save failed:", err);
      toast.error("Saving failed.");
    } finally {
      setUploading(false);
    }
  };

  const getDefaultKayakingTitle = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Morning Kayaking";
    if (hour >= 12 && hour < 18) return "Afternoon Kayaking";
    return "Evening Kayaking";
  };

  useEffect(() => {
    if (!runTitle) setRunTitle(getDefaultKayakingTitle());
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
              {distance > 0
                ? (liveDuration / 60000 / distance).toFixed(1) + " min/km"
                : "0.0 min/km"}
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
              {!tracking && (
                <div className="kayaking-mode-select" style={{ marginBottom: 18 }}>
                  <label htmlFor="kayaking-mode" style={{ display: "block", marginBottom: 8, color: "#fff" }}>Paddling mode</label>
                  <select id="kayaking-mode" value={kayakingType} onChange={(e) => setKayakingType(e.target.value)}
                    style={{ width: "100%", padding: 12, borderRadius: 8, background: "#17191d", color: "#fff", border: "1px solid #555" }}>
                    {KAYAKING_MODES.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                  </select>
                </div>
              )}
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
                      lastGpsPositionRef.current = null;
                      setPaused(false);

                      setLiveDuration(elapsedBeforePause);

                      localStorage.setItem(
                        "kayakingTrackerState",
                        JSON.stringify({
                          tracking: true,
                          route: routeRef.current,
        kayakingType,
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
                      lastGpsPositionRef.current = null;
                      setLiveDuration(safeElapsed);
                      setPaused(true);
                      localStorage.setItem(
                        "kayakingTrackerState",
                        JSON.stringify({
                          tracking: true,
                          route: routeRef.current,
        kayakingType,
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

              <div className="kayaking-live-stats" style={{ display: "flex", gap: 2, flexWrap: "wrap", marginBottom: 2, marginTop: 2, color: "#fff" }}>
                <div style={{ display: "flex", gap: 18 }}>
                  <span className="mar-2"><strong>Distance:</strong> {distance.toFixed(2)} km</span>
                <span><strong>Avg. Speed:</strong> {liveDuration > 0 ? (distance / (liveDuration / 3600000)).toFixed(1) : "0.0"} km/h</span>
                </div>
                <div style={{ display: "flex", gap: 18 }}>
                <span><strong>Max. Speed:</strong> {maxSpeed.toFixed(1)} km/h</span>
                <span><strong>Time:</strong> {formatTime(liveDuration)}</span>
                </div>
              </div>
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
            {/* <p className="text-white fs-3">Save the run</p> */}

            <div style={{ color: "white", marginBottom: 15 }}>
              <p>
                <strong>Distance:</strong> {distance.toFixed(2)} km
              </p>
              <p>
                <strong>Avg. Speed:</strong>{" "}
                {duration > 0 ? (distance / (duration / 3600000)).toFixed(1) + " km/h" : "—"}
              </p>
              <p><strong>Max. Speed:</strong> {maxSpeed.toFixed(1)} km/h</p>
              <p><strong>Mode:</strong> {kayakingTypeLabel}</p>
              <p>
                <strong>Time:</strong> {formatTime(duration)}
              </p>
            </div>

            <div style={{ marginBottom: 15 }}>
              <input
                type="text"
                placeholder="Enter the kayaking title"
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
                (Optional) e.g., Morning Kayaking, Afternoon Kayaking, Evening Kayaking
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
                (Optional) Add notes about your kayaking session
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
                  Kayaking photos
                </span>

                <span
                  style={{
                    color:
                      selectedFiles.length >= MAX_RUN_PHOTOS
                        ? "#ff451c"
                        : "#aaa",
                    fontSize: 14,
                    fontWeight: 600,
                  }}>
                  {selectedFiles.length}/{MAX_RUN_PHOTOS}
                </span>
              </div>

              {selectedFiles.length < MAX_RUN_PHOTOS && (
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

              {selectedFiles.length >= MAX_RUN_PHOTOS && (
                <div
                  style={{
                    color: "#aaa",
                    fontSize: 13,
                    marginTop: 5,
                  }}>
                  Maximum of {MAX_RUN_PHOTOS} photos reached.
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
            <p>Avg. Speed (km/h)</p>
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