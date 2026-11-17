
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";

import { db, auth } from "../../../../firebase";
import { toast } from "react-toastify";

import {
  FaPlay,
  FaPause,
  FaStop,
  FaArrowLeftLong,
} from "react-icons/fa6";

import {
  FiMinimize2,
  FiMaximize2,
} from "react-icons/fi";

import {
  FaFireAlt,
  FaClock,
  FaCamera,
  FaTrash,
  FaArrowCircleLeft,
} from "react-icons/fa";

import { TbBallTennis } from "react-icons/tb";

import * as htmlToImage from "html-to-image";

import { uploadToCloudinary } from "../../../../utils/cloudinary";
import RunFeedbackModal from "../../runfeedback/RunFeedbackModal";
import { processActivityAchievements } from "../../functional/achievements/processActivityAchievements";

import "./tennisTracker.scss";

// 2024 Adult Compendium of Physical Activities:
// https://pacompendium.com/sports/
//
// These MET values are reference estimates,
// not individually measured calorie expenditure.

const TENNIS_TYPES = [
  {
    id: "general",
    label: "General Tennis",
    met: 6.8,
    code: "15675",
    description: "General play, moderate effort",
  },
  {
    id: "singles",
    label: "Singles",
    met: 8.0,
    code: "15690",
    description: "Singles tennis",
  },
  {
    id: "doubles",
    label: "Doubles",
    met: 4.5,
    code: "15685",
    description: "Doubles tennis",
  },
  {
    id: "competitive",
    label: "Competitive Tennis",
    met: 8.0,
    code: "15676",
    description: "General competitive tennis",
  },
  {
    id: "practice",
    label: "Hitting Practice",
    met: 5.0,
    code: "15695",
    description: "Hitting balls, moderate effort",
  },
];

const STORAGE_KEY = "recrunTennisTrackerState";
const WEIGHT_KEY = "recrunTennisWeight";

const STOP_HOLD_MS = 1200;
const MAX_PHOTOS = 5;
const MAX_PHOTO_SIZE = 10 * 1024 * 1024;

const isValidWeight = (value) => {
  if (
    value === "" ||
    value === null ||
    value === undefined
  ) {
    return false;
  }

  const n = Number(value);

  return Number.isFinite(n) && n >= 25 && n <= 350;
};

const readWeight = () => {
  try {
    const value = localStorage.getItem(WEIGHT_KEY);

    return isValidWeight(value)
      ? Number(value)
      : "";
  } catch {
    return "";
  }
};

const readSession = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const initialSession = () => ({
  status: "idle",
  type: "general",
  weight: readWeight(),
  accumulatedMs: 0,
  segmentStartedAt: null,
});

const formatTime = (milliseconds) => {
  const seconds = Math.max(
    0,
    Math.floor(milliseconds / 1000)
  );

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remaining = seconds % 60;

  return [hours, minutes, remaining]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
};

const estimateCalories = (ms, weight, met) => {
  if (!isValidWeight(weight) || ms <= 0) {
    return 0;
  }

  const minutes = ms / 60000;

  return Math.round(
    (met * 3.5 * Number(weight) / 200) * minutes
  );
};

const getDefaultTitle = () => {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) {
    return "Morning Tennis";
  }

  if (hour >= 12 && hour < 18) {
    return "Afternoon Tennis";
  }

  return "Evening Tennis";
};

export default function TennisTracker() {
  const navigate = useNavigate();
  const location = useLocation();

  const autoStartHandled = useRef(false);

  const [session, setSession] = useState(() => {
    const saved = readSession();

    return saved &&
      ["running", "paused", "finished"].includes(saved.status)
      ? saved
      : initialSession();
  });

  const sessionRef = useRef(session);

  const [now, setNow] = useState(Date.now());
  const [weightLoaded, setWeightLoaded] = useState(false);
  const [profileWeight, setProfileWeight] = useState(null);

  const [isMinimized, setIsMinimized] = useState(false);

  const [showConfirm, setShowConfirm] = useState(
    () => readSession()?.status === "finished"
  );

  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");

  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);

  const [showFeedback, setShowFeedback] = useState(false);
  const [savedActivityId, setSavedActivityId] = useState(null);

  const [stopProgress, setStopProgress] = useState(0);

  const stopTimeout = useRef(null);
  const stopInterval = useRef(null);

  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const photosRef = useRef([]);

  const photoInputRef = useRef(null);
  const tennisCardRef = useRef(null);

  const updateSession = (next) => {
    sessionRef.current = next;
    setSession(next);

    if (next.status === "idle") {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(next)
      );
    }
  };

  const getElapsed = (
    current = sessionRef.current,
    at = Date.now()
  ) => {
    const accumulated = current.accumulatedMs || 0;

    if (
      current.status !== "running" ||
      !current.segmentStartedAt
    ) {
      return accumulated;
    }

    return accumulated + Math.max(
      0,
      at - current.segmentStartedAt
    );
  };

  const clearStopHold = () => {
    clearTimeout(stopTimeout.current);
    clearInterval(stopInterval.current);

    stopTimeout.current = null;
    stopInterval.current = null;

    setStopProgress(0);
  };

  const updatePhotos = (next) => {
    photosRef.current = next;
    setSelectedPhotos(next);
  };

  const clearPhotos = () => {
    photosRef.current.forEach((photo) => {
      URL.revokeObjectURL(photo.preview);
    });

    updatePhotos([]);
  };

  const addPhotos = (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = "";

    const remaining = Math.max(
      0,
      MAX_PHOTOS - photosRef.current.length
    );

    const valid = files
      .filter(
        (file) =>
          file.type.startsWith("image/") &&
          file.size <= MAX_PHOTO_SIZE
      )
      .slice(0, remaining);

    if (files.length > valid.length) {
      toast.info(
        `Maximum ${MAX_PHOTOS} photos, up to 10 MB each.`
      );
    }

    const newPhotos = valid.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    updatePhotos([
      ...photosRef.current,
      ...newPhotos,
    ]);
  };

  const removePhoto = (preview) => {
    const photo = photosRef.current.find(
      (item) => item.preview === preview
    );

    if (photo) {
      URL.revokeObjectURL(photo.preview);
    }

    updatePhotos(
      photosRef.current.filter(
        (item) => item.preview !== preview
      )
    );
  };

  useEffect(() => {
    return () => {
      clearTimeout(stopTimeout.current);
      clearInterval(stopInterval.current);

      photosRef.current.forEach((photo) => {
        URL.revokeObjectURL(photo.preview);
      });
    };
  }, []);

  // Real-time timer, using timestamps instead
  // of incrementing a counter every second.
  useEffect(() => {
    if (session.status !== "running") {
      return;
    }

    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, [session.status]);

  useEffect(() => {
    const syncClock = () => setNow(Date.now());

    document.addEventListener(
      "visibilitychange",
      syncClock
    );

    window.addEventListener(
      "pageshow",
      syncClock
    );

    return () => {
      document.removeEventListener(
        "visibilitychange",
        syncClock
      );

      window.removeEventListener(
        "pageshow",
        syncClock
      );
    };
  }, []);

  // Read weight from Firestore user profile.
  useEffect(() => {
    let cancelled = false;

    const loadWeight = async () => {
      const uid = auth.currentUser?.uid;

      if (!uid) {
        setWeightLoaded(true);
        return;
      }

      try {
        const snapshot = await getDoc(
          doc(db, "users", uid)
        );

        const userData = snapshot.exists()
          ? snapshot.data()
          : {};

        const value =
          userData.weightKg ??
          userData.weight ??
          userData.bodyWeight;

        if (
          !cancelled &&
          isValidWeight(value)
        ) {
          const weight = Number(value);

          setProfileWeight(weight);

          const hasSavedWeight =
            isValidWeight(readWeight());

          if (
            sessionRef.current.status === "idle" &&
            !hasSavedWeight
          ) {
            updateSession({
              ...sessionRef.current,
              weight,
            });
          }
        }
      } catch (error) {
        console.warn(
          "Tennis profile weight:",
          error
        );
      } finally {
        if (!cancelled) {
          setWeightLoaded(true);
        }
      }
    };

    loadWeight();

    return () => {
      cancelled = true;
    };
  }, []);

  const start = () => {
    const current = sessionRef.current;

    if (current.status !== "idle") {
      return;
    }

    if (!auth.currentUser?.uid) {
      toast.error("Please sign in first.");
      return;
    }

    if (!isValidWeight(current.weight)) {
      toast.error(
        "Enter your body weight (25–350 kg)."
      );
      return;
    }

    localStorage.setItem(
      WEIGHT_KEY,
      String(current.weight)
    );

    updateSession({
      ...current,
      status: "running",
      accumulatedMs: 0,
      segmentStartedAt: Date.now(),
    });

    setNow(Date.now());
    setIsMinimized(false);
    setShowConfirm(false);
    setTitle("");
    setNotes("");
  };

  // Supports navigation with:
  // navigate("/tennis", { state: { autoStart: true } })
  useEffect(() => {
    if (
      !location.state?.autoStart ||
      autoStartHandled.current ||
      !weightLoaded
    ) {
      return;
    }

    autoStartHandled.current = true;

    if (
      sessionRef.current.status === "idle"
    ) {
      start();
    }

    navigate(location.pathname, {
      replace: true,
      state: null,
    });
  }, [
    location.state?.autoStart,
    location.pathname,
    navigate,
    weightLoaded,
  ]);

  const pauseOrResume = () => {
    const current = sessionRef.current;

    if (current.status === "running") {
      updateSession({
        ...current,
        status: "paused",
        accumulatedMs: getElapsed(current),
        segmentStartedAt: null,
      });
    } else if (current.status === "paused") {
      updateSession({
        ...current,
        status: "running",
        segmentStartedAt: Date.now(),
      });
    }

    setNow(Date.now());
  };

  const stop = () => {
    const current = sessionRef.current;

    if (
      !["running", "paused"].includes(current.status)
    ) {
      return;
    }

    updateSession({
      ...current,
      status: "finished",
      accumulatedMs: getElapsed(current),
      segmentStartedAt: null,
    });

    setTitle(getDefaultTitle());
    setNotes("");
    setShowConfirm(true);
    setIsMinimized(true);
    setStopProgress(0);
  };

  const beginStopHold = (event) => {
    if (
      event.pointerType === "mouse" &&
      event.button !== 0
    ) {
      return;
    }

    if (
      stopTimeout.current ||
      !["running", "paused"].includes(
        sessionRef.current.status
      )
    ) {
      return;
    }

    const started = Date.now();

    stopInterval.current = setInterval(() => {
      const percent =
        ((Date.now() - started) / STOP_HOLD_MS) * 100;

      setStopProgress(
        Math.min(100, percent)
      );
    }, 16);

    stopTimeout.current = setTimeout(() => {
      clearStopHold();
      stop();
    }, STOP_HOLD_MS);
  };

  const reset = () => {
    clearStopHold();

    updateSession({
      ...initialSession(),
      weight: isValidWeight(
        sessionRef.current.weight
      )
        ? sessionRef.current.weight
        : readWeight(),
    });

    setShowConfirm(false);
    setIsMinimized(false);
    setTitle("");
    setNotes("");
    clearPhotos();
  };

  const elapsed = getElapsed(session, now);

  const tennisType =
    TENNIS_TYPES.find(
      (item) => item.id === session.type
    ) || TENNIS_TYPES[0];

  const calories = estimateCalories(
    elapsed,
    session.weight,
    tennisType.met
  );

  const isActive = ["running", "paused"].includes(
    session.status
  );

  const isIdle = session.status === "idle";

  const save = async () => {
    if (savingRef.current) return;

    const current = sessionRef.current;

    if (
      current.status !== "finished" ||
      !auth.currentUser?.uid
    ) {
      return;
    }

    if (!title.trim()) {
      toast.error("Enter an activity title.");
      return;
    }

    if (current.accumulatedMs < 1000) {
      toast.error(
        "The tennis session is too short."
      );
      return;
    }

    savingRef.current = true;
    setSaving(true);

    try {
      const selectedType =
        TENNIS_TYPES.find(
          (item) => item.id === current.type
        ) || TENNIS_TYPES[0];

      const finalCalories = estimateCalories(
        current.accumulatedMs,
        current.weight,
        selectedType.met
      );

      // First image: generated activity summary.
      if (!tennisCardRef.current) {
        throw new Error(
          "Tennis summary card not found."
        );
      }

      if (document.fonts?.ready) {
        await document.fonts.ready;
      }

      const summaryBlob = await htmlToImage.toBlob(
        tennisCardRef.current,
        {
          pixelRatio: 2,
          backgroundColor: "#111111",
          cacheBust: true,
        }
      );

      if (!summaryBlob) {
        throw new Error(
          "Could not generate summary image."
        );
      }

      const summaryFile = new File(
        [summaryBlob],
        `recrun-tennis-${Date.now()}.png`,
        { type: "image/png" }
      );

      const summaryUrl = await uploadToCloudinary(
        summaryFile
      );

      if (!summaryUrl) {
        throw new Error(
          "Summary image upload failed."
        );
      }

      const uploadedPhotos = [];

      for (const photo of photosRef.current) {
        const url = await uploadToCloudinary(
          photo.file
        );

        if (!url) {
          throw new Error(
            "Photo upload failed."
          );
        }

        uploadedPhotos.push(url);
      }

      const result = await addDoc(
        collection(db, "routes"),
        {
          uid: auth.currentUser.uid,

          activityType: "tennis",
          visibility: "public",

          title: title.trim(),
          notes: notes.trim(),

          tennisType: selectedType.id,
          tennisTypeLabel: selectedType.label,

          weightKg: Number(current.weight),

          met: selectedType.met,
          metCode: selectedType.code,

          calories: finalCalories,
          estimatedCalories: finalCalories,
          caloriesMethod: "MET",
          caloriesSource:
            "2024 Adult Compendium of Physical Activities",

          // Same unit as WorkoutTracker:
          // minutes.
          duration:
            current.accumulatedMs / 60000,

          durationMs: current.accumulatedMs,

          distance: 0,
          steps: 0,
          pace: null,
          route: [],

          photos: [
            summaryUrl,
            ...uploadedPhotos,
          ],

          tennisImage: summaryUrl,

          locationName: "",

          timestamp: serverTimestamp(),
          createdAt: new Date(),
        }
      );

      // Award achievements without affecting the saved tennis session.
      try {
        await processActivityAchievements({
          uid: auth.currentUser.uid,
          routeId: result.id,
          activityType: "tennis",
        });
      } catch (achievementError) {
        console.error("Tennis achievements error:", achievementError);
      }

      reset();

      setSavedActivityId(result.id);
      setShowFeedback(true);

      toast.success(
        "Tennis session saved!"
      );
    } catch (error) {
      console.error(
        "Tennis save failed:",
        error
      );

      toast.error(
        error.message ||
        "Could not save tennis session."
      );
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  return (
    <div className="tennis-tracker">

      {/* FULLSCREEN LIVE SESSION */}
      {isActive && !isMinimized && (
        <div className="tennis-fullscreen">
          <div className="tennis-fullscreen-content">
            <TbBallTennis className="tennis-main-icon" />

            <p className="tennis-eyebrow">
              {tennisType.label}
            </p>

            <h1>{formatTime(elapsed)}</h1>

            <div className="tennis-live-kcal">
              <FaFireAlt />
              <strong>{calories}</strong>
              <small>estimated kcal</small>
            </div>

            <p className="tennis-status">
              {session.status === "paused"
                ? "Session paused"
                : "Tennis session in progress"}
            </p>

            <button
              type="button"
              className="tennis-minimize"
              onClick={() => setIsMinimized(true)}
              aria-label="Minimize tennis tracker"
            >
              <FiMinimize2 />
            </button>
          </div>
        </div>
      )}

      {/* MAIN TRACKER */}
      {(!isActive || isMinimized) && (
        <main className="tennis-page">
          <div className="tennis-container">

            <div className="tennis-heading">
              <TbBallTennis />
              <span>TENNIS TRACKER</span>
            </div>

            <p className="tennis-subtitle">
              Every rally counts. Track your game.
            </p>

            {(isIdle || isActive) && (
              <div className="tennis-settings">
                <label>
                  Tennis activity

                  <select
                    value={session.type}
                    disabled={!isIdle}
                    onChange={(event) =>
                      updateSession({
                        ...session,
                        type: event.target.value,
                      })
                    }
                  >
                    {TENNIS_TYPES.map((item) => (
                      <option
                        key={item.id}
                        value={item.id}
                      >
                        {item.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Body weight (kg)

                  <input
                    type="number"
                    min="25"
                    max="350"
                    step="0.1"
                    disabled={!isIdle}
                    value={session.weight}
                    onChange={(event) =>
                      updateSession({
                        ...session,
                        weight: event.target.value,
                      })
                    }
                    placeholder="Enter weight"
                  />
                </label>

                <div className="tennis-met-info">
                  <span>Reference intensity</span>
                  <strong>
                    {tennisType.met.toFixed(1)} MET
                  </strong>
                </div>

                <small>
                  {profileWeight
                    ? "Body weight available from your profile. Confirm it before starting."
                    : "Enter your current body weight before starting."}
                  {" "}The MET value is selected from the
                  2024 Adult Compendium.
                </small>
              </div>
            )}

            <div className="tennis-controls">
              <button
                type="button"
                className="tennis-btn record"
                disabled={!isIdle}
                onClick={start}
                aria-label="Start tennis session"
              >
                <span className="dot" />
              </button>

              <button
                type="button"
                className={`tennis-btn pause ${
                  session.status === "paused"
                    ? "resume"
                    : ""
                }`}
                disabled={!isActive}
                onClick={pauseOrResume}
                aria-label={
                  session.status === "paused"
                    ? "Resume"
                    : "Pause"
                }
              >
                {session.status === "paused"
                  ? <FaPlay />
                  : <FaPause />}
              </button>

              <button
                type="button"
                className="tennis-btn stop"
                disabled={!isActive}
                onPointerDown={(event) => {
                  if (
                    event.pointerType !== "mouse" ||
                    event.button === 0
                  ) {
                    event.currentTarget.setPointerCapture(
                      event.pointerId
                    );

                    beginStopHold(event);
                  }
                }}
                onPointerUp={clearStopHold}
                onPointerCancel={clearStopHold}
                onLostPointerCapture={clearStopHold}
                onContextMenu={(event) =>
                  event.preventDefault()
                }
                style={{
                  "--stop-progress":
                    `${stopProgress}%`,
                }}
                aria-label="Hold to stop tennis session"
              >
                <span className="stop-progress" />
                <span className="stop-icon">
                  <FaStop />
                </span>
              </button>
            </div>

            <small className="tennis-stop-hint">
              Hold Stop for 1.2 seconds to finish
            </small>

            <div className="tennis-timer">
              <FaClock />
              {formatTime(elapsed)}
            </div>

            <div className="tennis-stats">
              <div className="tennis-stat">
                <FaFireAlt />
                <small>Estimated Calories</small>
                <strong>
                  {calories}
                  <span> kcal</span>
                </strong>
              </div>

              <div className="tennis-stat">
                <TbBallTennis />
                <small>Tennis Activity</small>
                <strong className="tennis-stat-label">
                  {tennisType.label}
                </strong>
              </div>

              <div className="tennis-stat">
                <FaClock />
                <small>Reference Intensity</small>
                <strong>
                  {tennisType.met.toFixed(1)}
                  <span> MET</span>
                </strong>
              </div>

              <div className="tennis-stat">
                <small>Body Weight</small>
                <strong>
                  {isValidWeight(session.weight)
                    ? session.weight
                    : "—"}
                  <span> kg</span>
                </strong>
              </div>
            </div>

            <p className="tennis-disclaimer">
              Calories are estimates based on
              activity-specific MET values, body
              weight and recorded duration.
              Paused time is excluded. This is
              not a direct measurement of energy
              expenditure. Pause tracking during
              extended breaks or time off court.
            </p>

            {isActive && (
              <button
                type="button"
                className="tennis-expand"
                onClick={() => setIsMinimized(false)}
              >
                <FiMaximize2 />
                Fullscreen
              </button>
            )}

            {!isActive && (
              <button
              className="steps-back-button"
              onClick={() => navigate("/")}>
              <FaArrowCircleLeft />
            </button>
            )}
          </div>
        </main>
      )}

      {/* SAVE SESSION MODAL */}
      {showConfirm && (
        <div className="tennis-modal-overlay">
          <div
            className="tennis-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Save tennis session"
          >
            <h2>Save Tennis Session</h2>

            <div className="tennis-save-summary">
              <p>
                <strong>Activity:</strong>
                {" "}{tennisType.label}
              </p>

              <p>
                <strong>Duration:</strong>
                {" "}{formatTime(elapsed)}
              </p>

              <p>
                <strong>Estimated Calories:</strong>
                {" "}{calories} kcal
              </p>

              <p>
                <strong>MET:</strong>
                {" "}{tennisType.met.toFixed(1)}
              </p>
            </div>

            {/* This card is exported as first photo */}
            <div
              ref={tennisCardRef}
              className="tennis-share-card"
            >
              <div className="tennis-share-brand pb-4">
 
              </div>

              <div className="tennis-share-type">
                {tennisType.label}
              </div>

              <div className="tennis-share-duration">
                {formatTime(elapsed)}
              </div>

              <div className="tennis-share-grid">
                <div>
                  <small>ESTIMATED CALORIES</small>
                  <strong>
                    {calories}
                    <em> kcal</em>
                  </strong>
                </div>

                <div>
                  <small>REFERENCE MET</small>
                  <strong>
                    {tennisType.met.toFixed(1)}
                  </strong>
                </div>

                <div>
                  <small>BODY WEIGHT</small>
                  <strong>
                    {session.weight}
                    <em> kg</em>
                  </strong>
                </div>

                <div>
                  <small>ACTIVITY</small>
                  <strong>{tennisType.label}</strong>
                </div>
              </div>
            </div>

            <p className="tennis-photo-note">
              The statistics image is saved
              automatically as the first photo.
            </p>

            <div className="tennis-photo-picker">
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                multiple
                disabled={saving}
                onChange={addPhotos}
                style={{ display: "none" }}
              />

              <button
                type="button"
                className="tennis-photo-add"
                disabled={
                  saving ||
                  selectedPhotos.length >= MAX_PHOTOS
                }
                onClick={() =>
                  photoInputRef.current?.click()
                }
              >
                <FaCamera />
                Add photos ({selectedPhotos.length}/{MAX_PHOTOS})
              </button>

              {selectedPhotos.length > 0 && (
                <div className="tennis-photo-grid">
                  {selectedPhotos.map(
                    ({ preview, file }) => (
                      <div
                        className="tennis-photo-thumb"
                        key={preview}
                      >
                        <img
                          src={preview}
                          alt={file.name}
                        />

                        <button
                          type="button"
                          disabled={saving}
                          onClick={() =>
                            removePhoto(preview)
                          }
                          aria-label={`Remove ${file.name}`}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>

            <input
              value={title}
              onChange={(event) =>
                setTitle(event.target.value)
              }
              maxLength={100}
              placeholder="Tennis session title"
            />

           <textarea
              placeholder="How'd it go? Share more about your activity and tag someone with @"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={2000}
              rows={3}
              style={{
                width: "100%",
                padding: 8,
                fontSize: 16,
                minHeight: 80,
              }}
            />

            <div className="tennis-modal-actions">
              <button
                type="button"
                disabled={saving}
                onClick={reset}
              >
                Discard
              </button>

              <button
                type="button"
                disabled={saving}
                onClick={save}
              >
                {saving
                  ? "Saving..."
                  : "Save Tennis"}
              </button>
            </div>
          </div>
        </div>
      )}

      <RunFeedbackModal
        isOpen={showFeedback}
        runId={savedActivityId}
        onClose={() => {
          setShowFeedback(false);
          setSavedActivityId(null);
        }}
      />
    </div>
  );
}
