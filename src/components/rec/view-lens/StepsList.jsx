import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { createPortal } from "react-dom";
import { FiSliders, FiX, FiCheck, FiRotateCcw } from "react-icons/fi";

import {
  collection,
  query,
  onSnapshot,
  where,
  doc,
  getDoc,
  deleteDoc,
} from "firebase/firestore";

import { db } from "../../../firebase";
import { toast } from "react-toastify";
import { FaEllipsisH } from "react-icons/fa";
import { FiLock } from "react-icons/fi";
import ActivityVisibilityMenuItem from "../deledit-rec/ActivityVisibilityMenuItem";
import EditActivityModal from "../deledit-rec/EditActivityModal";
import DeleteActivityModal from "../deledit-rec/DeleteActivityModal";

import { useAuth } from "../../account/AuthContext";
import UserPresence from "../../nav/search/UserPresence";

import { MdOutlineTimer, MdCalendarToday } from "react-icons/md";

import { IoMdBicycle } from "react-icons/io";

import { PiSneakerMove } from "react-icons/pi";

import { RiPinDistanceFill } from "react-icons/ri";

import { TbAlarmAverage } from "react-icons/tb";
import { GoPlay } from "react-icons/go";

import { FaHiking } from "react-icons/fa";

import { GrLocation } from "react-icons/gr";

import { RiVerifiedBadgeFill } from "react-icons/ri";

import { FiPlay } from "react-icons/fi";

import { TbBallTennis, TbKayak, TbSwimming, TbSkiJumping } from "react-icons/tb";
import { FaWalking } from "react-icons/fa";

import {
  FaRunning,
  FaBicycle,
  FaDumbbell,
  FaFireAlt,
  FaWeight,
} from "react-icons/fa";

import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";

import "swiper/css/pagination";

import { Pagination } from "swiper/modules";

import Interactions from "../functional/interactions/Interactions";
import RouteReplayModal from "../route-replay/RouteReplayModal";

import AchievementRunBadges from "../functional/achievements/AchievementRunBadges";
import AchievementActivityBadges from "../functional/achievements/AchievementActivityBadges";

import "./steplist.scss";
import { FaLocationDot, FaMapLocation } from "react-icons/fa6";

function formatDuration(minutes) {
  if (!Number.isFinite(minutes)) {
    return "—";
  }

  const totalSeconds = Math.floor(minutes * 60);

  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");

  const mins = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");

  const secs = String(totalSeconds % 60).padStart(2, "0");

  return `${hours}:${mins}:${secs}`;
}

function formatDate(timestamp) {
  if (!timestamp) {
    return "—";
  }

  try {
    const date =
      timestamp?.toDate?.() ||
      (timestamp?.seconds
        ? new Date(timestamp.seconds * 1000)
        : new Date(timestamp));

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return date.toLocaleString("en-GB", {
      day: "2-digit",

      month: "short",

      year: "numeric",

      hour: "2-digit",

      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

export default function StepsList() {
  const { user, loading: userLoading } = useAuth();
  const [replayActivity, setReplayActivity] = useState(null);

  const [items, setItems] = useState([]);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [editingActivity, setEditingActivity] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [deletingActivity, setDeletingActivity] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const closeMenu = (event) => {
      if (!menuRef.current?.contains(event.target)) setOpenMenuId(null);
    };
    document.addEventListener("pointerdown", closeMenu);
    return () => document.removeEventListener("pointerdown", closeMenu);
  }, []);

  const handleDelete = async (activity) => {
    if (!user || activity.uid !== user.uid || deletingId) return;
    if (
      !window.confirm(
        "Delete this activity permanently? This cannot be undone.",
      )
    )
      return;
    setOpenMenuId(null);
    setDeletingId(activity.id);
    try {
      const ref = doc(db, "routes", activity.id);
      const snap = await getDoc(ref);
      if (!snap.exists() || snap.data().uid !== user.uid) {
        throw new Error("You can only delete your own activities.");
      }
      await deleteDoc(ref);
      toast.success("Activity deleted.");
    } catch (error) {
      toast.error(error.message || "Could not delete activity.");
    } finally {
      setDeletingId(null);
    }
  };

  // const [filter, setFilter] = useState("my"); // global

  // auto save to localstorage you last choise Global Runs or My Runs

  const [filter, setFilter] = useState(() => {
    return localStorage.getItem("stepsListFilter") || "my";
  });

  // auto save to localstorage you last choise Global Runs or My Runs

  const [loading, setLoading] = useState(true);

  const [usersData, setUsersData] = useState({});

  const [visibleCount, setVisibleCount] = useState(6);
  const [activityFilter, setActivityFilter] = useState("all");
  const [periodFilter, setPeriodFilter] = useState("all");
  const [sortFilter, setSortFilter] = useState("newest");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const settingsCloseRef = useRef(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
      const data = {};

      snapshot.forEach((doc) => {
        data[doc.id] = doc.data();
      });

      setUsersData(data);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    setVisibleCount(8);
  }, [filter, activityFilter, periodFilter, sortFilter]);

  // auto save to localstorage you last choise Global Runs or My Runs

  useEffect(() => {
    localStorage.setItem("stepsListFilter", filter);
  }, [filter]);

  // auto save to localstorage you last choise Global Runs or My Runs

  useEffect(() => {
    if (userLoading) {
      return;
    }

    setLoading(true);

    setItems([]);

    let unsubscribe = null;

    if (filter === "my") {
      if (!user) {
        setItems([]);

        setLoading(false);

        return;
      }

      const q = query(collection(db, "routes"), where("uid", "==", user.uid));

      unsubscribe = onSnapshot(
        q,

        (snapshot) => {
          let data = snapshot.docs.map((doc) => ({
            id: doc.id,

            ...doc.data(),
          }));

          data.sort((a, b) => {
            const ta = a.timestamp?.seconds || a.createdAt?.seconds || 0;

            const tb = b.timestamp?.seconds || b.createdAt?.seconds || 0;

            return tb - ta;
          });

          setItems(data);

          setLoading(false);
        },

        (error) => {
          console.error("My Runs snapshot error:", error);

          setItems([]);

          setLoading(false);
        },
      );
    }

    if (filter === "global") {
      const q = query(collection(db, "routes"), where("visibility", "==", "public"));

      unsubscribe = onSnapshot(
        q,

        (snapshot) => {
          let data = snapshot.docs.map((doc) => ({
            id: doc.id,

            ...doc.data(),
          }));

          // Legacy activities without visibility are public.
          data = data.filter((item) => item.visibility !== "private");
          if (user) {
            data = data.filter((item) => item.uid !== user.uid);
          }

          data.sort((a, b) => {
            const ta = a.timestamp?.seconds || a.createdAt?.seconds || 0;

            const tb = b.timestamp?.seconds || b.createdAt?.seconds || 0;

            return tb - ta;
          });

          setItems(data);

          setLoading(false);
        },

        (error) => {
          console.error("Global Runs snapshot error:", error);

          setItems([]);

          setLoading(false);
        },
      );
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [filter, user, userLoading]);
  const getActivityDate = (activity) => {
    const value = activity.timestamp || activity.createdAt;

    if (!value) return null;

    const date =
      typeof value.toDate === "function"
        ? value.toDate()
        : typeof value.seconds === "number"
          ? new Date(value.seconds * 1000)
          : new Date(value);

    return Number.isNaN(date.getTime()) ? null : date;
  };

  const filteredItems = items
    .filter((item) => {
      if (activityFilter === "all") return true;

      const type = item.activityType || "running";

      if (activityFilter === "running") {
        return type === "running" || type === "run";
      }

      return type === activityFilter;
    })
    .filter((item) => {
      if (periodFilter === "all") return true;

      const date = getActivityDate(item);
      if (!date) return false;

      const days = Number(periodFilter);
      const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;

      return date.getTime() >= cutoff && date.getTime() <= Date.now();
    })
    .sort((a, b) => {
      const aTime = getActivityDate(a)?.getTime() ?? 0;
      const bTime = getActivityDate(b)?.getTime() ?? 0;

      return sortFilter === "oldest" ? aTime - bTime : bTime - aTime;
    });

  useEffect(() => {
    if (!settingsOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event) => {
      if (event.key === "Escape") setSettingsOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    settingsCloseRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [settingsOpen]);

  const resetActivityFilters = () => {
    setActivityFilter("all");
    setPeriodFilter("all");
    setSortFilter("newest");
  };

  if (userLoading || loading) {
    return null;
  }

  return (
    <section className="stepslist-wrapper">
      <div className="lens-toolbar">
        <div className="lens-toolbar-identity">
          <h2>{filter === "my" ? "My Lens" : "Global Lens"}</h2>
        </div>
        <div className="lens-toolbar-actions">
          <span className="lens-toolbar-count">{filteredItems.length} activities</span>
          <button
            type="button"
            className={`lens-settings-trigger ${settingsOpen ? "is-open" : ""}`}
            onClick={() => setSettingsOpen(true)}
            aria-haspopup="dialog"
            aria-label="Open feed settings"
          >
            <FiSliders aria-hidden="true" />
            <span>Settings</span>
            {(activityFilter !== "all" || periodFilter !== "all" || sortFilter !== "newest") && (
              <span className="lens-settings-indicator" aria-label="Filters active" />
            )}
          </button>
        </div>
      </div>

      {filter === "my" && items.length === 0 && (
        <div className="stepslist-empty">
          <div className="stepslist-empty-icon">
            <FaRunning />
          </div>

          <h3>No record yet</h3>

          <p>Complete your first record and it will appear here.</p>
        </div>
      )}

      {filter === "global" && items.length === 0 && (
        <div className="stepslist-empty">
          <div className="stepslist-empty-icon">
            <FaRunning />
          </div>

          <h3>No record available</h3>

          <p>Be the first to share a record with the community.</p>
        </div>
      )}

      {settingsOpen && createPortal(
        <div className="lens-settings-overlay" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setSettingsOpen(false);
        }}>
          <div className="lens-settings-panel" role="dialog" aria-modal="true" aria-labelledby="lens-settings-title">
            <div className="lens-settings-head">
              <div>
                <h3 id="lens-settings-title">Feed settings</h3>
              </div>
              <button
                ref={settingsCloseRef}
                type="button"
                className="lens-settings-close"
                onClick={() => setSettingsOpen(false)}
                aria-label="Close settings"
              >
                <FiX />
              </button>
            </div>

            <div className="lens-settings-body">
              <div className="lens-settings-section">
                <div className="lens-settings-section-heading">
                  <span>01</span>
                  <h4>Choose your feed</h4>
                </div>
                <div className="lens-settings-segment">
                  <button type="button" className={filter === "global" ? "active" : ""}
                    onClick={() => setFilter("global")} aria-pressed={filter === "global"}>
                    Global Lens
                  </button>
                  <button type="button" className={filter === "my" ? "active" : ""}
                    onClick={() => setFilter("my")} disabled={!user} aria-pressed={filter === "my"}>
                    My Lens
                  </button>
                </div>
              </div>

              <div className="lens-settings-section">
                <div className="lens-settings-section-heading">
                  <span>02</span>
                  <h4>Activity type</h4>
                </div>
                <div className="lens-settings-types">
                  {[
                    { value: "all", label: "All" },
                    { value: "running", label: "Running" },
                    { value: "cycling", label: "Cycling" },
                    { value: "workout", label: "Workout" },
                    { value: "tennis", label: "Tennis" },
                    { value: "kayaking", label: "Kayaking" },
                    { value: "hiking", label: "Hiking" },
                    { value: "walking", label: "Walking" },
                    { value: "swimming", label: "Swimming" },
                    { value: "winter_sports", label: "Skiing / Snowboarding" },
                  ].map((option) => (
                    <button key={option.value} type="button"
                      className={activityFilter === option.value ? "active" : ""}
                      aria-pressed={activityFilter === option.value}
                      onClick={() => setActivityFilter(option.value)}>
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="lens-settings-section">
                <div className="lens-settings-section-heading">
                  <span>03</span>
                  <h4>Time & order</h4>
                </div>
                <div className="lens-settings-selects">
                  <label>
                    <span>Period</span>
                    <select value={periodFilter} onChange={(e) => setPeriodFilter(e.target.value)}>
                      <option value="all">All time</option>
                      <option value="1">Last 24 hours</option>
                      <option value="7">Last 7 days</option>
                      <option value="30">Last 30 days</option>
                      <option value="90">Last 90 days</option>
                    </select>
                  </label>
                  <label>
                    <span>Sort by</span>
                    <select value={sortFilter} onChange={(e) => setSortFilter(e.target.value)}>
                      <option value="newest">Newest first</option>
                      <option value="oldest">Oldest first</option>
                    </select>
                  </label>
                </div>
              </div>
            </div>

            <div className="lens-settings-footer">
              <button type="button" className="lens-settings-reset" onClick={resetActivityFilters}>
                <FiRotateCcw /> Reset
              </button>
              <button type="button" className="lens-settings-done" onClick={() => setSettingsOpen(false)}>
                <FiCheck /> Done
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
      {items.length > 0 && filteredItems.length === 0 && (
        <div className="stepslist-empty">
          <div className="stepslist-empty-icon">
            <FaRunning />
          </div>

          <h3>No activities found</h3>
          <p>Try changing your activity type or date range.</p>

          <button
            type="button"
            className="stepslist-filter-reset"
            onClick={resetActivityFilters}>
            Clear filters
          </button>
        </div>
      )}
      {filteredItems.length > 0 && (
        <div className="stepslist-feed">
          {filteredItems.slice(0, visibleCount).map((run) => {
            const {
              id,

              title,

              notes,

              steps,

              photos = [],

              route = [],

              distance,

              pace,

              locationName,

              uid,

              duration,

              timestamp,

              createdAt,
            } = run;

            const isCycling = run.activityType === "cycling";
            const isWorkout = run.activityType === "workout";
            const isTennis = run.activityType === "tennis";
            const isKayaking = run.activityType === "kayaking";
            const isHiking = run.activityType === "hiking";
            const isWalking = run.activityType === "walking";
            const isSwimming = run.activityType === "swimming";
            const isWinterSports = run.activityType === "winter_sports";

            const isSessionActivity = isWorkout || isTennis;

            const userInfo = usersData[uid] || {};

            const username = userInfo.username || "Unknown";

            const avatarUrl = userInfo.avatarUrl || "";

            const avatarFallback = Array.from(userInfo.username || "?")[0];

            const runDate = timestamp || createdAt;

            const isPro =
              userInfo?.premiumPackage?.active &&
              userInfo.premiumPackage?.title === "Pro";

            const isOwner = Boolean(user?.uid && uid === user.uid);

            return (
              <article key={id} className="stepslist-card">
                <div className="stepslist-card-header">
                  <div className="stepslist-user">
                    <Link to={`/profile/${uid}`} className="stepslist-author-link" aria-label={`View ${username} profile`}>
                    <div className="stepslist-avatar-wrapper">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt={username}
                          className="stepslist-avatar"
                        />
                      ) : (
                        <div className="stepslist-avatar-placeholder">
                          {avatarFallback}
                        </div>
                      )}

                      {isPro && (
                        <RiVerifiedBadgeFill className="stepslist-premium-icon" />
                      )}
                      <UserPresence
                          lastActiveAt={userInfo.lastActiveAt}
                          showText={false}
                      />
                    </div>

                    <div className="stepslist-user-details">
                      <div className="stepslist-author">{username}</div>

                      <div className="stepslist-run-date">
                        {formatDate(runDate)}
                      </div>
                    </div>
                  </Link>
                  </div>

                  <div className="stepslist-header-actions">
                    <div className="stepslist-run-label">
                      {isSwimming ? (
                        <TbSwimming />
                      ) : isWinterSports ? (
                        <TbSkiJumping />
                      ) : isWalking ? (
                        <FaWalking />
                      ) : isTennis ? (
                        <TbBallTennis />
                      ) : isWorkout ? (
                        <FaDumbbell />
                      ) : isKayaking ? (
                        <TbKayak />
                      ) 
                      : isHiking ? (
  <FaHiking />
): isCycling ? (
                        <IoMdBicycle />
                      ) : (
                        <FaRunning />
                      )}

                      {isSwimming
                        ? "Swimming"
                        : isWinterSports
                          ? run.winterDiscipline === "snowboarding" ? "Snowboarding" : "Skiing"
                        : isWalking
                          ? "Walking"
                        : isTennis
                        ? "Tennis"
                        : isWorkout
                          ? "Workout"
                          : isKayaking
                            ? "Kayaking"
                            : isHiking
  ? "Hiking"
                            : isCycling
                              ? "Ride"
                              : "Run"}
                    </div>
                    {isOwner && (
                      <div
                        className="stepslist-menu-wrap"
                        ref={openMenuId === id ? menuRef : null}>
                        <button
                          type="button"
                          className="stepslist-menu-trigger"
                          aria-label="Activity options"
                          aria-expanded={openMenuId === id}
                          onClick={() =>
                            setOpenMenuId((prev) => (prev === id ? null : id))
                          }>
                          <FaEllipsisH />
                        </button>
                        {openMenuId === id && (
                          <div className="stepslist-menu" role="menu">
                            <button
                              type="button"
                              role="menuitem"
                              onClick={() => {
                                setOpenMenuId(null);
                                setEditingActivity(run);
                              }}>
                              Edit
                            </button>
                            <ActivityVisibilityMenuItem
                              activity={run}
                              currentUser={user}
                              onClose={() => setOpenMenuId(null)}
                            />
                            <button
                              type="button"
                              role="menuitem"
                              className="danger"
                              disabled={deletingId === id}
                              onClick={() => {
                                setOpenMenuId(null);
                                setDeletingActivity(run);
                              }}>
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {isOwner && run.visibility === "private" && (
                  <span className="stepslist-private-indicator"><FiLock /> Private</span>
                )}

                <div className="stepslist-content">
                  <h3 className="stepslist-title">
                    {title ||
                      (isSwimming
                        ? "Swimming Session"
                        : isWinterSports
                          ? run.winterDiscipline === "snowboarding" ? "Snowboarding Session" : "Skiing Session"
                        : isWalking
                          ? "Walking Session"
                        : isTennis
                        ? "Tennis Session"
                        : isWorkout
                          ? "Workout Session"
                          : isKayaking
                            ? "Kayaking Session"
                            : isHiking
  ? "Hiking Session"
                            : isCycling
                              ? "Cycling Ride"
                              : "Untitled Run")}
                  </h3>

                  {notes && <p className="stepslist-notes">{notes}</p>}
                  {run.editedAt && (
                    <span
                      className="stepslist-edited"
                      title={`Last edited: ${formatDate(run.editedAt)}`}>
                      Edited · {formatDate(run.editedAt)}
                    </span>
                  )}
                </div>

                {photos.length > 0 && (
                  <div className="stepslist-media">
                    <Swiper
                      modules={photos.length > 1 ? [Pagination] : []}
                      pagination={
                        photos.length > 1
                          ? {
                              clickable: true,
                            }
                          : false
                      }
                      slidesPerView={1}
                      className={`stepslist-swiper ${
                        isSessionActivity ? "stepslist-workout-swiper" : ""
                      } ${photos.length <= 1 ? "single-image" : ""}`}
                      spaceBetween={0}
                      grabCursor={true}
                      simulateTouch={true}
                      loop={true}
                      allowTouchMove={true}>
                      {photos.map((photoUrl, index) => (
                        <SwiperSlide key={index}>
                          <img
                            src={photoUrl}
                            alt={`${title || "Run"} ${index + 1}`}
                            className={`stepslist-img ${
  index === 0 &&
  typeof photoUrl === "string" &&
  photoUrl.startsWith("data:image/")
    ? "stepslist-route-map"
    : ""
} ${
  isSessionActivity &&
                              (photoUrl ===
                                (isTennis
                                  ? run.tennisImage
                                  : run.workoutImage) ||
                                (index === 0 &&
                                  !(isTennis
                                    ? run.tennisImage
                                    : run.workoutImage)))
                                ? "stepslist-workout-cover"
                                : ""
                            }`}
                          />
                        </SwiperSlide>
                      ))}
                    </Swiper>
                    {!isSessionActivity &&
    run.routeMapSaved !== false &&
    Array.isArray(route) &&
    route.length >= 2 && (
        <button
            type="button"
            className="stepslist-replay-btn"
            onClick={() => setReplayActivity(run)}
            aria-label="Replay GPS route"
            title="Replay GPS route"
        >
            <GoPlay aria-hidden="true" />
            <span>Replay</span>
        </button>
    )}
                  </div>
                )}
<div className="stepslist-achievements">
    {(!run.activityType ||
        ["running", "run"].includes(run.activityType)) ? (
        <AchievementRunBadges
            uid={uid}
            routeId={id}
        />
    ) : (
        <AchievementActivityBadges
            uid={uid}
            routeId={id}
            activityType={run.activityType}
        />
    )}
</div>

                <div className="stepslist-info">
                  {isSessionActivity ? (
                    <>
                      <div className="stepslist-stat">
                        <MdOutlineTimer />
                        <div>
                          <span>Duration</span>
                          <strong>
                            {formatDuration(Number(run.duration))}
                          </strong>
                        </div>
                      </div>
                      <div className="stepslist-stat">
                        <FaFireAlt />
                        <div>
                          <span>Estimated Calories</span>
                          <strong>
                            {Number.isFinite(
                              Number(run.estimatedCalories ?? run.calories),
                            )
                              ? `${Math.round(Number(run.estimatedCalories ?? run.calories))} kcal`
                              : "—"}
                          </strong>
                        </div>
                      </div>
                      <div className="stepslist-stat">
                        {isTennis ? <TbBallTennis /> : <FaDumbbell />}
                        <div>
                          <span>{isTennis ? "Tennis" : "Workout"}</span>

                          <strong>
                            {isTennis
                              ? run.tennisTypeLabel ||
                                run.tennisType ||
                                "Tennis"
                              : run.workoutTypeLabel ||
                                run.workoutType ||
                                "Workout"}
                          </strong>
                        </div>
                      </div>
                      <div className="stepslist-stat">
                        <TbAlarmAverage />
                        <div>
                          <span>
                            {isTennis ? "Reference MET" : "Intensity"}
                          </span>

                          <strong>
                            {isTennis
                              ? Number.isFinite(Number(run.met))
                                ? `${Number(run.met).toFixed(1)} MET`
                                : "—"
                              : run.intensityLabel || run.intensity || "—"}
                          </strong>
                        </div>
                      </div>
                      <div className="stepslist-stat">
                        <FaWeight />
                        <div>
                          <span>Body Weight</span>
                          <strong>
                            {Number.isFinite(Number(run.weightKg))
                              ? `${run.weightKg} kg`
                              : "—"}
                          </strong>
                        </div>
                      </div>
                      <div className="stepslist-stat">
                        <MdCalendarToday />
                        <div>
                          <span>Date</span>
                          <strong>{formatDate(runDate)}</strong>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="stepslist-stat">
                        <TbAlarmAverage />
                        <div>
                          <span>
                            {isCycling || isKayaking || isWinterSports ? "Avg. Speed" : isSwimming ? "Pace / 100m" : "Pace"}
                          </span>

                          <strong>
                            {isCycling || isKayaking || isWinterSports
                              ? Number.isFinite(run.averageSpeed)
                                ? `${run.averageSpeed.toFixed(1)} km/h`
                                : "—"
                              : Number.isFinite(pace) && distance > 0
                                ? isSwimming ? `${pace.toFixed(2)} min/100m` : `${pace.toFixed(1)} min/km`
                                : "—"}
                          </strong>
                        </div>
                      </div>
                      {(isCycling || isKayaking) && (
                        <div className="stepslist-stat">
                          {isKayaking ? <TbKayak /> : <IoMdBicycle />}
                          <div>
                            <span>Max. Speed</span>
                            <strong>
                              {Number.isFinite(run.maxSpeed)
                                ? `${run.maxSpeed.toFixed(1)} km/h`
                                : "—"}
                            </strong>
                          </div>
                        </div>
                      )}
                      <div className="stepslist-stat">
                        <FaLocationDot />
                        <div>
                          <span>Distance</span>
                          <strong>
                            {Number.isFinite(distance)
                              ? `${distance.toFixed(2)} km`
                              : "—"}
                          </strong>
                        </div>
                      </div>
                      <div className="stepslist-stat">
                        <MdOutlineTimer />
                        <div>
                          <span>Duration</span>
                          <strong>
                            {formatDuration(Number(run.duration))}
                          </strong>
                        </div>
                      </div>

                      <div className="stepslist-stat">
                        <MdCalendarToday />
                        <div>
                          <span>Date</span>
                          <strong>{formatDate(runDate)}</strong>
                        </div>
                      </div>
                      <div className="stepslist-stat stepslist-stat-location">
                        <GrLocation />
                        <div>
                          <span>Location</span>
                          <strong className="stepslist-location-text">
                            {locationName || "Unknown"}
                          </strong>
                        </div>
                      </div>
                    </>
                  )}
                 </div>

                {/* REPLAY — якщо немає фотографій */}
                {photos.length === 0 &&
                    !isSessionActivity &&
                    run.routeMapSaved !== false &&
                    Array.isArray(route) &&
                    route.length >= 2 && (
                        <div className="stepslist-replay-fallback">
                            <button
                                type="button"
                                className="stepslist-replay-btn"
                                onClick={() => setReplayActivity(run)}
                            >
                                <GoPlay />
                                <span>Replay</span>
                            </button>
                        </div>
                    )}

                <div className="stepslist-interactions">
                    <Interactions
                    routeId={id}
                    routeUid={
                      uid
                    } /*    Only run owners can share their runs, delete routeUid={uid} and uncommenter other Interactions for all can share all routes    */
                    title={title}
                    usersData={usersData}
                    currentUser={user}
                    photos={photos}
                    route={route}
                    distance={distance}
                    pace={pace}
                    steps={steps}
                    duration={duration}
                    timestamp={timestamp || createdAt}
                    locationName={locationName}
                    username={username}
                    avatarUrl={avatarUrl}
                    premiumPackage={userInfo.premiumPackage}
                    activityType={run.activityType || "running"}
                    winterDiscipline={run.winterDiscipline}
                    calories={
                      isTennis
                        ? (run.estimatedCalories ?? run.calories)
                        : run.calories
                    }
                    averageSpeed={run.averageSpeed}
                    maxSpeed={run.maxSpeed}
                    tennisTypeLabel={run.tennisTypeLabel || run.tennisType}
                    met={run.met}
                    exercises={
                      typeof run.exercises === "number"
                        ? run.exercises
                        : Array.isArray(run.exercises)
                          ? run.exercises.length
                          : undefined
                    }
                    sets={
                      typeof run.sets === "number"
                        ? run.sets
                        : Array.isArray(run.sets)
                          ? run.sets.length
                          : undefined
                    }
                  />
                </div>
              </article>
            );
          })}
        </div>
      )}

      {visibleCount < filteredItems.length && (
        <div className="load-more-wrapper">
          <button
            type="button"
            className="load-more-btn"
            onClick={() => setVisibleCount((prev) => prev + 4)}>
            Load more
          </button>
        </div>
      )}
{replayActivity && (
    <RouteReplayModal
        route={replayActivity.route || []}
        title={replayActivity.title || "Activity Replay"}
        duration={replayActivity.duration || 0}
        onClose={() => setReplayActivity(null)}
    />
)}
      {editingActivity && (
        <EditActivityModal
          activity={editingActivity}
          currentUser={user}
          onClose={() => setEditingActivity(null)}
        />
      )}
      {deletingActivity && (
        <DeleteActivityModal
          activity={deletingActivity}
          currentUser={user}
          onClose={() => setDeletingActivity(null)}
        />
      )}
    </section>
  );
}
