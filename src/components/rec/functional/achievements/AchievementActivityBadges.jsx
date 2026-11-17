import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { FaMedal, FaBicycle, FaDumbbell } from "react-icons/fa";
import { db } from "../../../../firebase";
import { CYCLING_ACHIEVEMENTS, WORKOUT_ACHIEVEMENTS, WALKING_ACHIEVEMENTS, HIKING_ACHIEVEMENTS, KAYAKING_ACHIEVEMENTS, SWIMMING_ACHIEVEMENTS, TENNIS_ACHIEVEMENTS, WINTER_SPORTS_ACHIEVEMENTS } from "./activityAchievementDefinitions";
import { normalizeActivityType } from "./activityAchievementUtils";
import "./achievementrunbadges.scss";
const DEFINITIONS = {
  cycling: CYCLING_ACHIEVEMENTS, workout: WORKOUT_ACHIEVEMENTS,
  walking: WALKING_ACHIEVEMENTS, hiking: HIKING_ACHIEVEMENTS,
  kayaking: KAYAKING_ACHIEVEMENTS, swimming: SWIMMING_ACHIEVEMENTS,
  tennis: TENNIS_ACHIEVEMENTS, winter_sports: WINTER_SPORTS_ACHIEVEMENTS,
};

export default function AchievementActivityBadges({ uid, routeId, activityType }) {
  const [badges, setBadges] = useState([]);
  const normalizedType = normalizeActivityType(activityType);
  useEffect(() => {
    if (!uid || !routeId || !DEFINITIONS[normalizedType]) {
      setBadges([]); return;
    }
    return onSnapshot(collection(db, "users", uid, "achievements"), (snap) => {
      const definitions = DEFINITIONS[normalizedType] || [];
      const keys = new Set(definitions.map((a) => a.key));
      setBadges(snap.docs.map((d) => ({ id: d.id, ...d.data() })).filter((a) =>
        keys.has(a.key) && (a.triggerRunId === routeId || a.triggerRun?.routeId === routeId)
      ));
    }, (err) => { console.error("Activity badge listener:", err); setBadges([]); });
  }, [uid, routeId, normalizedType]);
  if (!badges.length) return null;
  const Fallback = activityType === "cycling" ? FaBicycle : FaDumbbell;
  const definitions = DEFINITIONS[normalizedType] || [];
  return <div className="run-achievements">
    <div className="run-achievements-label"><FaMedal color="#db3206" /><span>Achievements</span></div>
    <div className="run-achievements-list">{badges.map((a) => {
      const definition = definitions.find((d) => d.key === a.key);
      const Icon = definition?.icon || Fallback;
      return <div key={a.key} className="run-achievement-badge" title={definition?.description || a.description}>
        <span className="run-achievement-icon"><Icon /></span><span className="run-achievement-name">{a.title}</span>
      </div>;
    })}</div>
  </div>;
}
