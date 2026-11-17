import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";

import { db } from "../../../../firebase";

import { FaMedal, FaRunning, FaBolt, FaRoad } from "react-icons/fa";

import { GiPathDistance, GiRunningShoe } from "react-icons/gi";

import { MdTimer } from "react-icons/md";

import { ACHIEVEMENTS } from "./achievementDefinitions";

import "./achievementrunbadges.scss";

function getIcon(achievement) {
  switch (achievement.category) {
    case "distance":
      return <GiPathDistance />;

    case "pace":
      return <FaBolt />;

    case "steps":
      return <GiRunningShoe />;

    case "runs":
      return <FaRunning />;

    case "total_distance":
      return <FaRoad />;

    case "time":
      return <MdTimer />;

    default:
      return <FaMedal />;
  }
}

export default function AchievementRunBadges({ uid, routeId }) {
  const [achievements, setAchievements] = useState([]);

  useEffect(() => {
    if (!uid || !routeId) {
      setAchievements([]);
      return;
    }

    const q = query(collection(db, "users", uid, "achievements"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const unlocked = snapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter((achievement) => {
            return (
              ACHIEVEMENTS.some((d) => d.key === achievement.key) && (achievement.triggerRunId === routeId ||
              achievement.triggerRun?.routeId === routeId)
            );
          });

        setAchievements(unlocked);
      },
      (error) => {
        console.error("Run achievements listener error:", error);

        setAchievements([]);
      },
    );

    return () => unsubscribe();
  }, [uid, routeId]);

  if (!achievements.length) {
    return null;
  }

  return (
    <div className="run-achievements">
      <div className="run-achievements-label">
        <FaMedal color="#db3206" />
        <span>Achievements</span>
      </div>

      <div className="run-achievements-list">
        {achievements.map((achievement) => {
          const definition = ACHIEVEMENTS.find(
            (item) => item.key === achievement.key,
          );

          return (
            <div
              key={achievement.key}
              className="run-achievement-badge"
              title={definition?.description || achievement.description}>
              <span className="run-achievement-icon">
                {getIcon(definition || achievement)}
              </span>

              <span className="run-achievement-name">{achievement.title}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
