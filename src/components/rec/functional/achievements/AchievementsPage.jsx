import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { FaRunning, FaBicycle, FaDumbbell, FaLock, FaUnlock, FaMedal, FaRoad, FaStopwatch, FaBolt, FaWalking, FaSwimmer, FaMountain, FaSnowflake, FaTableTennis } from "react-icons/fa";
import { db, auth } from "../../../../firebase";
import { ACHIEVEMENTS } from "./achievementDefinitions";
import { CYCLING_ACHIEVEMENTS, WORKOUT_ACHIEVEMENTS, WALKING_ACHIEVEMENTS, HIKING_ACHIEVEMENTS, KAYAKING_ACHIEVEMENTS, SWIMMING_ACHIEVEMENTS, TENNIS_ACHIEVEMENTS, WINTER_SPORTS_ACHIEVEMENTS } from "./activityAchievementDefinitions";
import { isActivityRoute, calculateActivityStats, achievementProgress } from "./activityAchievementUtils";
import "./achievementspage.scss";
import "./activityTabs.scss";

const TABS = [
  { id: "running", label: "Running", Icon: FaRunning, definitions: ACHIEVEMENTS },
  { id: "cycling", label: "Cycling", Icon: FaBicycle, definitions: CYCLING_ACHIEVEMENTS },
  { id: "workout", label: "Workout", Icon: FaDumbbell, definitions: WORKOUT_ACHIEVEMENTS },
  { id: "walking", label: "Walking", Icon: FaWalking, definitions: WALKING_ACHIEVEMENTS },
  { id: "hiking", label: "Hiking", Icon: FaMountain, definitions: HIKING_ACHIEVEMENTS },
  { id: "kayaking", label: "Kayaking", Icon: FaRoad, definitions: KAYAKING_ACHIEVEMENTS },
  { id: "swimming", label: "Swimming", Icon: FaSwimmer, definitions: SWIMMING_ACHIEVEMENTS },
  { id: "tennis", label: "Tennis", Icon: FaTableTennis, definitions: TENNIS_ACHIEVEMENTS },
  { id: "winter_sports", label: "Winter Sports", Icon: FaSnowflake, definitions: WINTER_SPORTS_ACHIEVEMENTS },
];
const formatDate = (v) => {
  if (!v) return "";
  const d = v.toDate?.() ?? new Date(v.seconds ? v.seconds * 1000 : v);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
};
const fmt = (n, unit) => unit === "km" ? Number(n || 0).toFixed(1) : Math.floor(Number(n || 0)).toLocaleString();
export default function AchievementsPage() {
  const [tab, setTab] = useState("running");
  const [filter, setFilter] = useState("all");
  const [unlocked, setUnlocked] = useState({});
  const [routes, setRoutes] = useState([]);
  useEffect(() => {
    let unsubscribeAchievements = () => {};
    let unsubscribeRoutes = () => {};
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      unsubscribeAchievements(); unsubscribeRoutes();
      setUnlocked({}); setRoutes([]);
      if (!user) return;
      unsubscribeAchievements = onSnapshot(collection(db, "users", user.uid, "achievements"), (snap) => {
        const next = {};
        snap.forEach((d) => { next[d.id] = { ...d.data(), id: d.id }; });
        setUnlocked(next);
      }, console.error);
      unsubscribeRoutes = onSnapshot(query(collection(db, "routes"), where("uid", "==", user.uid)), (snap) => {
        setRoutes(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      }, console.error);
    });
    return () => { unsubscribeAuth(); unsubscribeAchievements(); unsubscribeRoutes(); };
  }, []);
  const current = TABS.find((x) => x.id === tab);
  const definitions = current.definitions;
  const stats = useMemo(() => calculateActivityStats(routes.filter((r) => isActivityRoute(r, tab))), [routes, tab]);
  const isUnlocked = (a) => Boolean(unlocked[a.key]);
  const count = definitions.filter(isUnlocked).length;
  const filtered = definitions.filter((a) => filter === "all" || (filter === "unlocked" ? isUnlocked(a) : filter === "locked" ? !isUnlocked(a) : a.category === filter));
  const filters = [{ id: "all", label: "All" }, { id: "unlocked", label: "Unlocked" }, { id: "locked", label: "Locked" }, ...Array.from(new Set(definitions.map((a) => a.category))).map((id) => ({ id, label: id.replaceAll("_", " ") }))];
  const summary = tab === "workout" ? [
    [FaDumbbell, stats.count, "Workouts"], [FaStopwatch, (stats.totalDuration / 60).toFixed(1), "Hours"],
    [FaBolt, Math.round(stats.totalCalories), "Total kcal"], [FaMedal, Math.round(stats.longestDuration), "Longest min"],
  ] : [
    [current.Icon, stats.count, tab === "running" ? "Runs" : tab === "cycling" ? "Rides" : "Sessions"],
    [FaRoad, stats.totalDistance.toFixed(1), "Total km"],
    [FaStopwatch, (stats.totalDuration / 60).toFixed(1), "Hours"],
    [FaBolt, tab === "running" ? (stats.bestPace?.toFixed(1) ?? "—") : stats.longestDistance.toFixed(1), tab === "running" ? "Best pace" : "Longest km"],
  ];
  return <div className="achievements-page">
    <div className="achievement-activity-tabs" role="tablist" aria-label="Activity type">
      {TABS.map(({ id, label, Icon }) => <button key={id} role="tab" aria-selected={tab === id} className={tab === id ? "active" : ""} onClick={() => { setTab(id); setFilter("all"); }}><Icon /> {label}</button>)}
    </div>
    <div className="achievements-header"><div /><div className="achievements-progress"><strong>{count}/{definitions.length}</strong><span>{definitions.length ? Math.round(count / definitions.length * 100) : 0}% unlocked</span></div></div>
    <div className="achievement-stats">{summary.map(([Icon, value, label]) => <div className="achievement-stat" key={label}><Icon /><div><strong>{value}</strong><span>{label}</span></div></div>)}</div>
    <div className="achievement-filters">{filters.map((f) => <button key={f.id} className={filter === f.id ? "active" : ""} onClick={() => setFilter(f.id)}>{f.label}</button>)}</div>
    <div className="achievements-grid">{filtered.map((a) => {
      const done = isUnlocked(a);
      const progress = done ? Number(a.requirement) : achievementProgress(a, stats);
      const ratio = a.type === "pace" ? (progress > 0 ? Math.min(100, a.requirement / progress * 100) : 0) : Math.min(100, (progress / a.requirement) * 100);
      const Icon = a.icon || FaMedal;
      return <div key={a.key} className={`achievement-page-card ${done ? "unlocked" : "locked"}`}>
        <div className="achievement-card-icon">{done ? <Icon /> : <FaLock />}</div>
        <div className="achievement-card-content"><div className="achievement-card-top"><h3>{a.title}</h3>{done && <FaUnlock className="unlocked-icon" />}</div>
          <p>{a.description}</p>
          {done ? <div className="achievement-unlocked-date"><FaMedal /> Unlocked {formatDate(unlocked[a.key]?.unlockedAt)}</div> : <><div className="achievement-progress-text"><span>{fmt(progress, a.unit)}</span><span>{fmt(a.requirement, a.unit)} {a.unit}</span></div><div className="achievement-progress-bar"><div style={{ width: `${Math.max(0, ratio)}%` }} /></div></>}
        </div>
      </div>;
    })}</div>
    {!filtered.length && <div className="achievements-empty">No achievements found.</div>}
  </div>;
}
