import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { addDoc, collection, doc, getDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../../../../firebase";
import { toast } from "react-toastify";
import { FaPlay, FaPause, FaStop, FaArrowLeftLong } from "react-icons/fa6";
import { FiMinimize2, FiMaximize2 } from "react-icons/fi";
import { FaDumbbell, FaFireAlt, FaClock, FaCamera, FaTrash, FaArrowCircleLeft } from "react-icons/fa";
import * as htmlToImage from "html-to-image";
import { uploadToCloudinary } from "../../../../utils/cloudinary";
import RunFeedbackModal from "../../runfeedback/RunFeedbackModal";
import { processActivityAchievements } from "../../functional/achievements/processActivityAchievements";
import "./workoutTracker.scss";

const STORAGE_KEY = "recrunWorkoutTrackerState";
const WEIGHT_STORAGE_KEY = "recrunWorkoutWeight";
const WORKOUT_TYPES = [
  { id: "strength", label: "Strength Training", met: 3.5 },
  { id: "crossfit", label: "CrossFit", met: 8.0 },
  { id: "functional", label: "Functional Training", met: 5.0 },
  { id: "calisthenics", label: "Calisthenics", met: 4.5 },
  { id: "general", label: "General Workout", met: 3.5 },
];
const INTENSITIES = [
  { id: "light", label: "Light", factor: 0.8 },
  { id: "moderate", label: "Moderate", factor: 1 },
  { id: "vigorous", label: "Vigorous", factor: 1.2 },
];
const STOP_HOLD_MS = 1200;
const MAX_WORKOUT_PHOTOS = 5;

// Same time-of-day naming as StepCounter.
const getDefaultWorkoutTitle = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Morning Workout";
  if (hour >= 12 && hour < 18) return "Afternoon Workout";
  return "Evening Workout";
};
const validWeight = (n) => Number.isFinite(Number(n)) && Number(n) >= 25 && Number(n) <= 350;
const getSavedWeight = () => {
  try {
    const saved = localStorage.getItem(WEIGHT_STORAGE_KEY);
    return saved !== null && validWeight(saved)
      ? Number(saved)
      : 70;
  } catch {
    return 70;
  }
};
const fmtTime = (ms) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  return [Math.floor(s / 3600), Math.floor((s % 3600) / 60), s % 60]
    .map((x) => String(x).padStart(2, "0")).join(":");
};
const kcalFor = (ms, kg, met) => (met * 3.5 * kg / 200) * (ms / 60000);
const readSaved = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};
const initialSession = () => ({
  status: "idle",
  type: "strength",
  intensity: "moderate",
  weight: getSavedWeight(),
  accumulatedMs: 0,
  segmentStartedAt: null,
});

export default function WorkoutTracker() {
  const navigate = useNavigate();
  const location = useLocation();
  const autoStartHandled = useRef(false);
  const [weightLoaded, setWeightLoaded] = useState(false);
  const [session, setSession] = useState(() => {
    const saved = readSaved();
    return saved && ["running", "paused", "finished"].includes(saved.status) ? saved : initialSession();
  });
  const sessionRef = useRef(session);
  const [now, setNow] = useState(Date.now());
  const [profileWeight, setProfileWeight] = useState(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showConfirm, setShowConfirm] = useState(() => readSaved()?.status === "finished");
  const [title, setTitle] = useState("");
  const [saveStatsImage, setSaveStatsImage] = useState(true);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [savedWorkoutId, setSavedWorkoutId] = useState(null);
  const [stopProgress, setStopProgress] = useState(0);
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const photoInputRef = useRef(null);
  const workoutCardRef = useRef(null);
  const photosRef = useRef([]);

  const updatePhotos = (next) => {
    photosRef.current = next;
    setSelectedPhotos(next);
  };
  useEffect(() => () => {
    photosRef.current.forEach(({ preview }) => URL.revokeObjectURL(preview));
  }, []);

  const addWorkoutPhotos = (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    const freeSlots = MAX_WORKOUT_PHOTOS - photosRef.current.length;
    if (files.length > freeSlots) toast.info(`Maximum ${MAX_WORKOUT_PHOTOS} additional photos per workout.`);
    const accepted = files.filter((file) => file.type.startsWith("image/") && file.size <= 10 * 1024 * 1024).slice(0, Math.max(0, freeSlots));
    if (accepted.length < Math.min(files.length, Math.max(0, freeSlots))) {
      toast.error("Only images up to 10 MB are allowed.");
    }
    updatePhotos([...photosRef.current, ...accepted.map((file) => ({ file, preview: URL.createObjectURL(file) }))]);
  };
  const removeWorkoutPhoto = (preview) => {
    const removed = photosRef.current.find((item) => item.preview === preview);
    if (removed) URL.revokeObjectURL(removed.preview);
    updatePhotos(photosRef.current.filter((item) => item.preview !== preview));
  };
  const clearWorkoutPhotos = () => {
    photosRef.current.forEach(({ preview }) => URL.revokeObjectURL(preview));
    updatePhotos([]);
  };
  const stopTimeout = useRef(null);
  const stopInterval = useRef(null);

  const updateSession = (next) => {
    sessionRef.current = next;
    setSession(next);
    if (next.status === "idle") localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };
  const getElapsed = (s = sessionRef.current, at = Date.now()) =>
    s.accumulatedMs + (s.status === "running" && s.segmentStartedAt
      ? Math.max(0, at - s.segmentStartedAt) : 0);

  useEffect(() => {
    if (session.status !== "running") return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [session.status]);

  useEffect(() => {
    let cancelled = false;
    const loadWeight = async () => {
      if (!auth.currentUser?.uid) { setWeightLoaded(true); return; }
      try {
        const snap = await getDoc(doc(db, "users", auth.currentUser.uid));
        const data = snap.exists() ? snap.data() : {};
        // Підтримуємо поширені назви поля у профілі.
        const raw = data.weightKg ?? data.weight ?? data.bodyWeight;
if (!cancelled && validWeight(raw)) {
  setProfileWeight(Number(raw));

  const savedLocalWeight = localStorage.getItem(WEIGHT_STORAGE_KEY);

  const hasLocalWeight =
    savedLocalWeight !== null && validWeight(savedLocalWeight);

  if (sessionRef.current.status === "idle" && !hasLocalWeight) {
    updateSession({
      ...sessionRef.current,
      weight: Number(raw),
    });
  }
}
      } catch (error) { console.warn("Workout weight fetch:", error); }
      finally { if (!cancelled) setWeightLoaded(true); }
    };
    loadWeight();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const sync = () => setNow(Date.now());
    document.addEventListener("visibilitychange", sync);
    window.addEventListener("pageshow", sync);
    return () => {
      document.removeEventListener("visibilitychange", sync);
      window.removeEventListener("pageshow", sync);
    };
  }, []);

  const start = () => {
    if (sessionRef.current.status !== "idle") return;
    if (!validWeight(sessionRef.current.weight)) {
      toast.error("Enter a valid body weight (25–350 kg).");
      return;
    }
    const next = {
      ...sessionRef.current,
      status: "running", accumulatedMs: 0, segmentStartedAt: Date.now(),
    };
    updateSession(next);
    setNow(Date.now());
    setIsMinimized(false);
    setShowConfirm(false);
    setSaveStatsImage(true);
    setTitle("");
    setNotes("");
  };

  // Команда з ActivitySelectModal: запуск тільки для нового тренування.
  useEffect(() => {
    if (!location.state?.autoStart || autoStartHandled.current || !weightLoaded) return;
    autoStartHandled.current = true;
    if (sessionRef.current.status === "idle") start();
    navigate(location.pathname, { replace: true, state: null });
  }, [location.state?.autoStart, location.pathname, navigate, weightLoaded]);

  const pauseOrResume = () => {
    const s = sessionRef.current;
    if (s.status === "running") {
      updateSession({ ...s, status: "paused", accumulatedMs: getElapsed(s), segmentStartedAt: null });
    } else if (s.status === "paused") {
      updateSession({ ...s, status: "running", segmentStartedAt: Date.now() });
    }
    setNow(Date.now());
  };

  const stop = () => {
    const s = sessionRef.current;
    if (!["running", "paused"].includes(s.status)) return;
    updateSession({ ...s, status: "finished", accumulatedMs: getElapsed(s), segmentStartedAt: null });
    setTitle(getDefaultWorkoutTitle());
    setNotes("");
    setSaveStatsImage(true);
    setShowConfirm(true);
    setIsMinimized(true);
    setStopProgress(0);
  };

  const cancelStopHold = () => {
    clearTimeout(stopTimeout.current);
    clearInterval(stopInterval.current);
    stopTimeout.current = null;
    stopInterval.current = null;
    setStopProgress(0);
  };
  const beginStopHold = (event) => {
    if (event.type === "mousedown" && event.button !== 0) return;
    if (stopTimeout.current || !["running", "paused"].includes(sessionRef.current.status)) return;
    const started = Date.now();
    setStopProgress(0);
    stopInterval.current = setInterval(() =>
      setStopProgress(Math.min(100, (Date.now() - started) / STOP_HOLD_MS * 100)), 16);
    stopTimeout.current = setTimeout(() => { cancelStopHold(); stop(); }, STOP_HOLD_MS);
  };
  useEffect(() => () => {
    clearTimeout(stopTimeout.current);
    clearInterval(stopInterval.current);
  }, []);

  const reset = () => {
    updateSession({
      ...initialSession(),
      weight: getSavedWeight(),
    });
    setShowConfirm(false);
    setSaveStatsImage(true);
    setTitle("");
    setNotes("");
    setIsMinimized(false);
    clearWorkoutPhotos();
  };

  const save = async () => {
    if (saving) return;
    const s = sessionRef.current;
    if (s.status !== "finished") return;
    if (!auth.currentUser?.uid) { toast.error("Please sign in to save your workout."); return; }
    
    setSaving(true);
    try {
      const workoutType = WORKOUT_TYPES.find((x) => x.id === s.type) || WORKOUT_TYPES[0];
      const intensity = INTENSITIES.find((x) => x.id === s.intensity) || INTENSITIES[1];
      const met = workoutType.met * intensity.factor;
      const calories = Math.round(kcalFor(s.accumulatedMs, s.weight, met));
      // The summary is optional, just like the route map in StepCounter.
      let summaryUrl = null;
      if (saveStatsImage) {
        if (!workoutCardRef.current) throw new Error("Workout summary card is not ready.");
        const imageBlob = await htmlToImage.toBlob(workoutCardRef.current, {
          backgroundColor: "#101010",
          pixelRatio: 2,
          cacheBust: true,
        });
        if (!imageBlob) throw new Error("Could not generate workout statistics image.");
        const summaryFile = new File([imageBlob], `recrun-workout-${Date.now()}.png`, { type: "image/png" });
        const uploadedSummary = await uploadToCloudinary(summaryFile, {
          folder: "recrun_photos", public_id_prefix: "workout_summary",
          tags: ["recrun", "workout", "summary"], returnType: "secure_url",
        });
        summaryUrl = typeof uploadedSummary === "string"
          ? uploadedSummary
          : uploadedSummary?.secure_url || uploadedSummary?.url;
        if (!summaryUrl) throw new Error("Workout summary upload failed.");
      }
      const uploadedPhotos = await Promise.all(photosRef.current.map(({ file }) =>
        uploadToCloudinary(file, {
          folder: "recrun_photos", public_id_prefix: "workout",
          tags: ["recrun", "workout"], returnType: "secure_url",
        })
      ));
      if (uploadedPhotos.some((url) => typeof url !== "string" || !url)) {
        throw new Error("Workout photo upload failed.");
      }

      const result = await addDoc(collection(db, "routes"), {
        uid: auth.currentUser.uid,
        activityType: "workout",
        visibility: "public",
        title: title.trim() || getDefaultWorkoutTitle(),
        notes: notes.trim(),
        workoutType: workoutType.id,
        workoutTypeLabel: workoutType.label,
        intensity: intensity.id,
        intensityLabel: intensity.label,
        weightKg: s.weight,
        met,
        calories,
        estimatedCalories: calories,
        caloriesMethod: "MET",
        duration: s.accumulatedMs / 60000, // хвилини, як у Running/Cycling
        durationMs: s.accumulatedMs,
        distance: 0,
        steps: 0,
        pace: null,
        route: [],
        photos: [...(summaryUrl ? [summaryUrl] : []), ...uploadedPhotos],
        workoutImage: summaryUrl,
        locationName: "",
        timestamp: serverTimestamp(),
        createdAt: new Date(),
          });

    // WORKOUT ACHIEVEMENTS
    try {
      const unlockedAchievements = await processActivityAchievements({
        uid: auth.currentUser.uid,
        routeId: result.id,
        activityType: "workout",
      });

      console.log(
        "New workout achievements:",
        unlockedAchievements
      );
    } catch (achievementError) {
      console.error(
        "Workout achievements error:",
        achievementError
      );
    }

    reset();

    setSavedWorkoutId(result.id);

    setShowFeedback(true);

    toast.success("Workout saved!");
    } catch (error) {
      console.error("Workout save failed:", error);
      toast.error("Saving failed. Please try again.");
    } finally { setSaving(false); }
  };

  const elapsed = getElapsed(session, now);
  const type = WORKOUT_TYPES.find((x) => x.id === session.type) || WORKOUT_TYPES[0];
  const intensity = INTENSITIES.find((x) => x.id === session.intensity) || INTENSITIES[1];
  const met = type.met * intensity.factor;
  const calories = Math.round(kcalFor(elapsed, session.weight, met));
  const isActive = ["running", "paused"].includes(session.status);
  const isIdle = session.status === "idle";

  return (
    <div className="workout-tracker">
      {isActive && !isMinimized && (
        <div className="workout-fullscreen">
          <div className="workout-fullscreen-content">
            <FaDumbbell className="workout-main-icon" />
            <p className="workout-eyebrow">{type.label}</p>
            <h1>{fmtTime(elapsed)}</h1>
            <div className="workout-live-kcal"><FaFireAlt /> {calories} <small>estimated kcal</small></div>
            <p className="workout-status">{session.status === "paused" ? "Paused" : "Workout in progress"}</p>
            <button type="button" className="workout-minimize" onClick={() => setIsMinimized(true)} aria-label="Minimize workout"><FiMinimize2 /></button>
          </div>
        </div>
      )}

      {(!isActive || isMinimized) && (
        <main className="workout-page">
          <div className="workout-container">
            {/* <div className="workout-heading">
              <FaDumbbell /> <span>WORKOUT TRACKER</span>
            </div>
            <p className="workout-subtitle">Train stronger. Track your progress.</p> */}

            {(isIdle || isActive) && (
              <div className="workout-settings">
                <label>Workout type
                  <select value={session.type} onChange={(e) => updateSession({ ...session, type: e.target.value })}>
                    {WORKOUT_TYPES.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
                  </select>
                </label>
                <label>Intensity
                  <select value={session.intensity} onChange={(e) => updateSession({ ...session, intensity: e.target.value })}>
                    {INTENSITIES.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
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
    onChange={(e) => {
      const value = e.target.value;

      updateSession({
        ...session,
        weight: value,
      });

      if (value !== "" && validWeight(value)) {
        localStorage.setItem(
          WEIGHT_STORAGE_KEY,
          String(Number(value))
        );
      }
    }}
  />
</label>
                <small>{profileWeight ? "Weight loaded from your profile. Adjust before starting." : "No weight found in your profile. Enter your weight before starting."}</small>
              </div>
            )}

            <div className="workout-controls">
              <button type="button" className="workout-btn record" onClick={start} disabled={!isIdle} aria-label="Start workout"><span className="dot" /></button>
              <button type="button" className={`workout-btn pause ${session.status === "paused" ? "resume" : ""}`}
                onClick={pauseOrResume} disabled={!isActive} aria-label={session.status === "paused" ? "Resume workout" : "Pause workout"}>
                {session.status === "paused" ? <FaPlay /> : <FaPause />}
              </button>
              <button type="button" className="workout-btn stop" disabled={!isActive}
                onPointerDown={(e) => { if (e.pointerType !== "mouse" || e.button === 0) { e.currentTarget.setPointerCapture(e.pointerId); beginStopHold(e); } }}
                onPointerUp={cancelStopHold} onPointerCancel={cancelStopHold} onLostPointerCapture={cancelStopHold}
                style={{ "--stop-progress": `${stopProgress}%` }} aria-label="Hold to stop workout">
                <span className="stop-progress" /><span className="stop-icon"><FaStop /></span>
              </button>
            </div>
            {/* <small className="workout-stop-hint">Hold Stop for 1.2 seconds to finish</small> */}

            <div className="workout-timer"><FaClock /> {fmtTime(elapsed)}</div>
            <div className="workout-stats">
              <div className="workout-stat"><FaFireAlt /><small>Estimated Calories</small><strong>{calories} <span>kcal</span></strong></div>
              <div className="workout-stat"><FaDumbbell /><small>Workout</small><strong className="workout-stat-label">{type.label}</strong></div>
              <div className="workout-stat"><small>Intensity</small><strong className="workout-stat-label">{intensity.label}</strong></div>
              <div className="workout-stat"><small>Body Weight</small><strong>{session.weight} <span>kg</span></strong></div>
            </div>
            <p className="workout-disclaimer">Calories are estimates calculated using MET, not direct measurements. Paused time is excluded.</p>
            {isActive && <button type="button" className="workout-expand" onClick={() => setIsMinimized(false)}><FiMaximize2 /> Fullscreen</button>}
            {!isActive && <button
                              className="steps-back-button"
                              onClick={() => navigate("/")}>
                              <FaArrowCircleLeft />
                            </button>}
          </div>
        </main>
      )}

      {showConfirm && (
        <div className="workout-modal-overlay" role="presentation">
          <div className="workout-modal" role="dialog" aria-modal="true" aria-label="Save workout">
            {/* <h2>Save Workout</h2> */}
            <div className="workout-save-summary">
              <p><strong>Workout:</strong> {type.label}</p>
              <p><strong>Duration:</strong> {fmtTime(elapsed)}</p>
              <p><strong>Estimated Calories:</strong> {calories} kcal</p>
              <p><strong>Intensity:</strong> {intensity.label}</p>
            </div>
            <div ref={workoutCardRef} className="workout-share-card">
              {/* <div className="workout-share-brand"><FaDumbbell /><span>WORKOUT</span></div> */}
              <div className="workout-share-type">{type.label}</div>
              <div className="workout-share-duration">{fmtTime(elapsed)}</div>
              <div className="workout-share-grid">
                <div><small>ESTIMATED CALORIES</small><strong>{calories} <em>kcal</em></strong></div>
                <div><small>INTENSITY</small><strong>{intensity.label}</strong></div>
                <div><small>BODY WEIGHT</small><strong>{session.weight} <em>kg</em></strong></div>
                <div><small>MET</small><strong>{met.toFixed(1)}</strong></div>
              </div>
            </div>
            <div className="workout-save-image-toggle">
            <label className="workout-switch">
              <input
                type="checkbox"
                checked={saveStatsImage}
                disabled={saving}
                onChange={(e) => setSaveStatsImage(e.target.checked)}
              />
              <span className="workout-switch-slider" />
            </label>
            <span className="workout-switch-label">Save workout statistics image</span>
          </div>
          <p className="workout-photo-note">
            {saveStatsImage
              ? "The statistics image will be saved as the first photo."
              : "The statistics image will not be saved. You can still add your own photos."}
          </p>
            <div className="workout-photo-picker">
              <input ref={photoInputRef} type="file" accept="image/*" multiple
                onChange={addWorkoutPhotos} disabled={saving} style={{ display: "none" }} />
              <button type="button" className="workout-photo-add" disabled={saving || selectedPhotos.length >= MAX_WORKOUT_PHOTOS}
                onClick={() => photoInputRef.current?.click()}><FaCamera /> Add photos ({selectedPhotos.length}/{MAX_WORKOUT_PHOTOS})</button>
              {selectedPhotos.length > 0 && <div className="workout-photo-grid">
                {selectedPhotos.map(({ preview, file }) => <div className="workout-photo-thumb" key={preview}>
                  <img src={preview} alt={file.name} />
                  <button type="button" disabled={saving} onClick={() => removeWorkoutPhoto(preview)} aria-label={`Remove ${file.name}`}><FaTrash /></button>
                </div>)}
              </div>}
            </div>
            <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={100} placeholder="Workout title" />
            <textarea
              placeholder="How'd it go? Share more about your workout and tag someone with @"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={2000}
              style={{
                width: "100%",
                padding: 8,
                fontSize: 16,
                minHeight: 80,
              }}
            />

            <small
              style={{
                color: "#ccc",
                display: "block",
                marginTop: 4,
              }}
            >
              (Optional) Add notes about your workout, exercises, progress, or achievements
            </small>
            <div className="workout-modal-actions">
              <button type="button" disabled={saving} onClick={reset}>Discard</button>
              <button type="button" disabled={saving} onClick={save}>{saving ? "Saving..." : "Save Workout"}</button>
            </div>
          </div>
        </div>
      )}

      <RunFeedbackModal
        isOpen={showFeedback}
        runId={savedWorkoutId}
        onClose={() => { setShowFeedback(false); setSavedWorkoutId(null); }}
      />
    </div>
  );
}
