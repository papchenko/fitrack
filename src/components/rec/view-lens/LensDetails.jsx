
import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../firebase";

import { MdOutlineTimer } from "react-icons/md";
import { PiSneakerMove } from "react-icons/pi";
import { TbAlarmAverage } from "react-icons/tb";
import { GrLocation } from "react-icons/gr";
import {
  FaRunning,
  FaBicycle,
  FaDumbbell,
  FaFire,
  FaWeight,
  FaCalendarAlt,
} from "react-icons/fa";

import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";

import Interactions from "../functional/interactions/Interactions";
import AchievementRunBadges from "../functional/achievements/AchievementRunBadges";

import "./lensdetails.scss";

// ==========================================
// HELPERS
// ==========================================

const toNumber = (value) => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

function formatDuration(minutes) {
  const value = toNumber(minutes);

  if (value === null || value < 0) return "—";

  const totalSeconds = Math.floor(value * 60);

  const hours = String(
    Math.floor(totalSeconds / 3600)
  ).padStart(2, "0");

  const mins = String(
    Math.floor((totalSeconds % 3600) / 60)
  ).padStart(2, "0");

  const secs = String(
    totalSeconds % 60
  ).padStart(2, "0");

  return `${hours}:${mins}:${secs}`;
}

function formatDate(timestamp) {
  if (!timestamp) return "—";

  try {
    let date;

    if (typeof timestamp.toDate === "function") {
      date = timestamp.toDate();
    } else if (typeof timestamp.seconds === "number") {
      date = new Date(timestamp.seconds * 1000);
    } else {
      date = new Date(timestamp);
    }

    if (Number.isNaN(date.getTime())) return "—";

    return date.toLocaleString("en-GB", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

function formatNumber(value, digits = 1, unit = "") {
  const number = toNumber(value);

  if (number === null) return "—";

  return `${number.toFixed(digits)}${unit ? ` ${unit}` : ""}`;
}

function formatCount(value) {
  if (Array.isArray(value)) {
    return String(value.length);
  }

  const number = toNumber(value);

  return number === null ? "—" : String(Math.round(number));
}

// ==========================================
// STAT
// ==========================================

function ActivityStat({ icon: Icon, label, value }) {
  return (
    <p className="lensdetails-stat">
      <Icon className="lens-icon" />
      <strong>{label}:</strong>
      <span className="lensdetails-stat-value">
        {value ?? "—"}
      </span>
    </p>
  );
}

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function LensDetails({
  currentUser,
  usersData,
}) {
  const { id } = useParams();
  const location = useLocation();

  const stateData = location.state;

  const [run, setRun] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [authorData, setAuthorData] = useState(null);

  // ==========================================
  // FETCH ACTIVITY
  // ==========================================

  useEffect(() => {
    let active = true;

    if (!id) {
      setRun(null);
      setLoading(false);
      setError("Activity ID is missing.");
      return;
    }

    const cached =
      stateData?.id === id
        ? stateData
        : stateData?.run?.id === id
          ? stateData.run
          : null;

    setRun(cached);
    setLoading(!cached);
    setError("");

    const fetchActivity = async () => {
      try {
        const docRef = doc(db, "routes", id);
        const snap = await getDoc(docRef);

        if (!active) return;

        if (snap.exists()) {
          setRun({
            ...snap.data(),
            id: snap.id,
          });
        } else if (!cached) {
          setRun(null);
          setError("Activity not found.");
        }
      } catch (err) {
        console.error("Error loading activity:", err);

        if (active && !cached) {
          setError("Unable to load activity.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchActivity();

    return () => {
      active = false;
    };
  }, [id, stateData]);
useEffect(() => {
  const authorUid = run?.uid;

  if (!authorUid) {
    setAuthorData(null);
    return;
  }

  let active = true;

  setAuthorData(null);

  const fetchAuthor = async () => {
    try {
      const userRef = doc(db, "users", authorUid);
      const userSnap = await getDoc(userRef);

      if (active && userSnap.exists()) {
        setAuthorData(userSnap.data());
      }
    } catch (error) {
      console.error("Error loading activity author:", error);
    }
  };

  fetchAuthor();

  return () => {
    active = false;
  };
}, [run?.uid]);
  // ==========================================
  // LOADING
  // ==========================================

  if (loading && !run) {
    return <p className="loading">Loading activity...</p>;
  }

  if (!run) {
    return (
      <p className="not-found">
        {error || "Activity not found."}
      </p>
    );
  }

  // ==========================================
  // DATA
  // ==========================================

  const {
    title,
    notes,
    photos = [],
    route = [],
    distance,
    pace,
    steps,
    duration,
    timestamp,
    createdAt,
    locationName,
    username,
    avatarUrl,
    uid,
  } = run;

  const activityType = String(
    run.activityType || "running"
  ).toLowerCase();

  const isCycling =
    activityType === "cycling" ||
    activityType === "bike";

  const isWorkout =
    activityType === "workout";

  const isRunning =
    !isCycling && !isWorkout;

const userInfo = authorData || usersData?.[uid] || {};

const isOwner = currentUser?.uid === uid;

const displayName =
  userInfo.username ||
  userInfo.name ||
  (isOwner ? currentUser?.displayName : null) ||
  username ||
  "Unknown";

const avatar =
  userInfo.avatarUrl ||
  userInfo.photoURL ||
  (isOwner ? currentUser?.photoURL : null) ||
  avatarUrl ||
  "";

  const runDate = timestamp || createdAt;

  const activityLabel = isWorkout
    ? "Workout"
    : isCycling
      ? "Cycling"
      : "Running";

  const defaultTitle = isWorkout
    ? "Workout Session"
    : isCycling
      ? "Cycling Ride"
      : "Untitled Run";

  const ActivityIcon = isWorkout
    ? FaDumbbell
    : isCycling
      ? FaBicycle
      : FaRunning;

  const safePhotos = Array.isArray(photos)
    ? photos.filter(Boolean)
    : [];

  const safeRoute = Array.isArray(route)
    ? route
    : [];

  const averageSpeed =
    run.averageSpeed ?? run.avgSpeed;

  const maxSpeed =
    run.maxSpeed ?? run.maximumSpeed;

  const calories =
    run.estimatedCalories ?? run.calories;

  const workoutType =
    run.workoutTypeLabel ||
    run.workoutType ||
    run.trainingType;

  const intensity =
    run.intensityLabel ||
    run.intensity;

  const weight =
    run.weightKg ?? run.bodyWeight;

  const exercises =
    run.exercisesCount ?? run.exercises;

  const sets =
    run.setsCount ?? run.sets;

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="lensdetails-wrapper">
      <div className="lensdetails-card">

        {/* ====================================
            AUTHOR
        ==================================== */}

        <div className="lensdetails-header">
          <div className="lensdetails-user">

            <div className="lensdetails-avatar-wrapper">
              {avatar ? (
                <img
                  src={avatar}
                  alt={displayName}
                  className="lensdetails-avatar"
                />
              ) : (
                <div className="lensdetails-avatar-placeholder">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <div className="lensdetails-user-info">
              <strong>{displayName}</strong>
              <span>{formatDate(runDate)}</span>
            </div>

          </div>

          <div className="lensdetails-type">
            <ActivityIcon />
            <span>{activityLabel}</span>
          </div>
        </div>

        {/* ====================================
            TITLE
        ==================================== */}

        <div className="lensdetails-content">
          <h2 className="lensdetails-title">
            {title || defaultTitle}
          </h2>

          {notes && (
            <p className="lensdetails-notes">
              {notes}
            </p>
          )}
        </div>

        {/* ====================================
            PHOTOS
        ==================================== */}

        {safePhotos.length > 0 && (
          <Swiper
            key={`${id}-${safePhotos.length}`}
            className={
              safePhotos.length > 1
                ? "lensdetails-swiper has-multiple-images"
                : "lensdetails-swiper single-image"
            }
            pagination={
              safePhotos.length > 1
                ? { clickable: true }
                : false
            }
            modules={[Pagination]}
            loop={safePhotos.length > 1}
          >
            {safePhotos.map((url, i) => (
              <SwiperSlide key={`${i}-${url}`}>
                <img
                  src={url}
                  alt={`${activityLabel} ${i + 1}`}
                  className="lensdetails-img"
                  loading={i === 0 ? "eager" : "lazy"}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        )}

        {/* ====================================
            ACTIVITY STATS
        ==================================== */}

        <div className="lensdetails-info">

          {/* DURATION — ALL ACTIVITIES */}

          <ActivityStat
            icon={MdOutlineTimer}
            label="Duration"
            value={formatDuration(duration)}
          />

          {/* DATE — ALL ACTIVITIES */}

          <ActivityStat
            icon={FaCalendarAlt}
            label="Date"
            value={formatDate(runDate)}
          />

          {/* =================================
              RUNNING
          ================================= */}

          {isRunning && (
            <>
              <ActivityStat
                icon={PiSneakerMove}
                label="Distance"
                value={formatNumber(distance, 2, "km")}
              />

              <ActivityStat
                icon={TbAlarmAverage}
                label="Pace"
                value={
                  toNumber(distance) >= 0.1 &&
                  toNumber(pace) !== null
                    ? formatNumber(pace, 1, "min/km")
                    : "—"
                }
              />

              <ActivityStat
                icon={GrLocation}
                label="Location"
                value={locationName || "Unknown"}
              />

              <ActivityStat
                icon={PiSneakerMove}
                label="Steps"
                value={formatCount(steps)}
              />
            </>
          )}

          {/* =================================
              CYCLING
          ================================= */}

          {isCycling && (
            <>
              <ActivityStat
                icon={FaBicycle}
                label="Distance"
                value={formatNumber(distance, 2, "km")}
              />

              <ActivityStat
                icon={TbAlarmAverage}
                label="Avg. Speed"
                value={formatNumber(
                  averageSpeed,
                  1,
                  "km/h"
                )}
              />

              <ActivityStat
                icon={FaBicycle}
                label="Max. Speed"
                value={formatNumber(
                  maxSpeed,
                  1,
                  "km/h"
                )}
              />

              <ActivityStat
                icon={GrLocation}
                label="Location"
                value={locationName || "Unknown"}
              />
            </>
          )}

          {/* =================================
              WORKOUT
          ================================= */}

          {isWorkout && (
            <>
              <ActivityStat
                icon={FaDumbbell}
                label="Workout"
                value={workoutType || "Workout"}
              />

              <ActivityStat
                icon={TbAlarmAverage}
                label="Intensity"
                value={intensity || "—"}
              />

              <ActivityStat
                icon={FaFire}
                label="Calories"
                value={
                  toNumber(calories) !== null
                    ? `${Math.round(Number(calories))} kcal`
                    : "—"
                }
              />

              <ActivityStat
                icon={FaWeight}
                label="Weight"
                value={
                  toNumber(weight) !== null
                    ? `${weight} kg`
                    : "—"
                }
              />

              {(exercises !== undefined &&
                exercises !== null) && (
                <ActivityStat
                  icon={FaDumbbell}
                  label="Exercises"
                  value={formatCount(exercises)}
                />
              )}

              {(sets !== undefined &&
                sets !== null) && (
                <ActivityStat
                  icon={FaDumbbell}
                  label="Sets"
                  value={formatCount(sets)}
                />
              )}
            </>
          )}

        </div>

        {/* ====================================
            RUN ACHIEVEMENTS
        ==================================== */}

        {isRunning && uid && (
          <div className="lensdetails-achievements">
            <AchievementRunBadges
              uid={uid}
              routeId={id}
            />
          </div>
        )}

        {/* ====================================
            INTERACTIONS / SHARE
        ==================================== */}

        <div className="lensdetails-interactions">
          <Interactions
            routeId={id}
            usersData={usersData}
            currentUser={currentUser}
            photos={safePhotos}
            route={safeRoute}
            title={title}
            distance={distance}
            pace={pace}
            steps={steps}
            duration={duration}
            timestamp={runDate}
            locationName={locationName}
            username={displayName}
            avatarUrl={avatar}
            activityType={activityType}
            calories={calories}
            averageSpeed={averageSpeed}
            exercises={exercises}
            sets={sets}
          />
        </div>

      </div>
    </div>
  );
}
