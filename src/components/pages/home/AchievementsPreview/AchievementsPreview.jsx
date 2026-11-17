import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";

import { onAuthStateChanged } from "firebase/auth";

import {
  FaLock,
  FaUnlock,
} from "react-icons/fa";

import { db, auth } from "../../../../firebase";

// import { ACHIEVEMENTS } from "../Achievements/achievementDefinitions";
import { ACHIEVEMENTS } from "../../../rec/functional/achievements/achievementDefinitions";

import "./achievementspreview.scss";

function getRouteDate(route) {
  if (route?.timestamp?.seconds) {
    return new Date(
      route.timestamp.seconds * 1000
    );
  }

  if (route?.createdAt?.seconds) {
    return new Date(
      route.createdAt.seconds * 1000
    );
  }

  if (route?.createdAt) {
    const date = new Date(route.createdAt);

    if (!Number.isNaN(date.getTime())) {
      return date;
    }
  }

  if (route?.timestamp) {
    const date = new Date(route.timestamp);

    if (!Number.isNaN(date.getTime())) {
      return date;
    }
  }

  return null;
}

function calculateLongestStreak(routes) {
  if (!routes.length) {
    return 0;
  }

  const uniqueDays = new Set();

  routes.forEach((route) => {
    const date = getRouteDate(route);

    if (!date) {
      return;
    }

    uniqueDays.add(
      date.toISOString().split("T")[0]
    );
  });

  const sortedDays =
    Array.from(uniqueDays).sort();

  if (!sortedDays.length) {
    return 0;
  }

  let longestStreak = 1;
  let currentStreak = 1;

  for (
    let i = 1;
    i < sortedDays.length;
    i++
  ) {
    const previous = new Date(
      sortedDays[i - 1]
    );

    const current = new Date(
      sortedDays[i]
    );

    const difference =
      (current - previous) /
      (1000 * 60 * 60 * 24);

    if (difference === 1) {
      currentStreak += 1;

      longestStreak = Math.max(
        longestStreak,
        currentStreak
      );
    } else {
      currentStreak = 1;
    }
  }

  return longestStreak;
}

const AchievementsPreview = () => {
  const navigate = useNavigate();

  const [userAchievements, setUserAchievements] =
    useState({});

    const [currentUser, setCurrentUser] = useState(null);
    

  const [stats, setStats] = useState({
    runs: 0,
    totalDistance: 0,
    totalTime: 0,
    longestRun: 0,
    bestPace: null,
    maxSteps: 0,
    streak: 0,
  });

  useEffect(() => {
    let unsubscribeAchievements = null;

    const unsubscribeAuth =
      onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);

      if (!user) {
        setUserAchievements({});

        if (unsubscribeAchievements) {
          unsubscribeAchievements();
          unsubscribeAchievements = null;
        }

        return;
      }

        const achievementsRef = collection(
          db,
          "users",
          user.uid,
          "achievements"
        );

        unsubscribeAchievements =
          onSnapshot(
            achievementsRef,
            (snapshot) => {
              const data = {};

              snapshot.forEach((doc) => {
                const achievement =
                  doc.data();

                data[
                  achievement.key || doc.id
                ] = {
                  ...achievement,
                  id: doc.id,
                };
              });

              setUserAchievements(data);
            },
            (error) => {
              console.error(
                "Achievements preview listener error:",
                error
              );

              setUserAchievements({});
            }
          );
      });

    return () => {
      unsubscribeAuth();

      if (unsubscribeAchievements) {
        unsubscribeAchievements();
      }
    };
  }, []);

  useEffect(() => {
    let unsubscribeRoutes = null;

    const unsubscribeAuth =
      onAuthStateChanged(auth, (user) => {
        if (!user) {
          setStats({
            runs: 0,
            totalDistance: 0,
            totalTime: 0,
            longestRun: 0,
            bestPace: null,
            maxSteps: 0,
            streak: 0,
          });

          if (unsubscribeRoutes) {
            unsubscribeRoutes();
            unsubscribeRoutes = null;
          }

          return;
        }

        const q = query(
          collection(db, "routes"),
          where("uid", "==", user.uid)
        );

        unsubscribeRoutes = onSnapshot(
          q,
          (snapshot) => {
            const routes = snapshot.docs.map(
              (doc) => ({
                id: doc.id,
                ...doc.data(),
              })
            );

            let totalDistance = 0;
            let totalTime = 0;
            let longestRun = 0;
            let bestPace = null;
            let maxSteps = 0;

            routes.forEach((route) => {
              const distance =
                Number(route.distance) || 0;

              const duration =
                Number(route.duration) || 0;

              const pace =
                Number(route.pace);

              const steps =
                Number(route.steps) || 0;

              totalDistance += distance;
              totalTime += duration;

              longestRun = Math.max(
                longestRun,
                distance
              );

              maxSteps = Math.max(
                maxSteps,
                steps
              );

              if (
                Number.isFinite(pace) &&
                pace > 0
              ) {
                if (
                  bestPace === null ||
                  pace < bestPace
                ) {
                  bestPace = pace;
                }
              }
            });

            setStats({
              runs: routes.length,
              totalDistance,
              totalTime,
              longestRun,
              bestPace,
              maxSteps,
              streak: calculateLongestStreak(
                routes
              ),
            });
          },
          (error) => {
            console.error(
              "Achievements preview routes listener error:",
              error
            );
          }
        );
      });

    return () => {
      unsubscribeAuth();

      if (unsubscribeRoutes) {
        unsubscribeRoutes();
      }
    };
  }, []);

  const getProgress = (achievement) => {
    const unlocked =
      userAchievements[achievement.key];

    if (unlocked) {
      return achievement.requirement;
    }

    switch (achievement.type) {
      case "single_run_distance":
        return stats.longestRun;

      case "total_distance":
        return stats.totalDistance;

      case "run_count":
        return stats.runs;

      case "steps":
        return stats.maxSteps;

      case "pace":
        return stats.bestPace || 0;

      case "total_time":
        return stats.totalTime / 60;

      case "longest_run":
        return stats.longestRun;

      case "streak":
        return stats.streak;

      default:
        return 0;
    }
  };

  const getProgressPercent = (
    achievement
  ) => {
    const progress =
      Number(getProgress(achievement)) || 0;

    const requirement =
      Number(achievement.requirement) || 0;

    if (!requirement) {
      return 0;
    }

    if (achievement.type === "pace") {
      if (progress <= 0) {
        return 0;
      }

      if (progress <= requirement) {
        return 100;
      }

      return Math.min(
        99,
        Math.round(
          (requirement / progress) * 100
        )
      );
    }

    return Math.min(
      100,
      Math.round(
        (progress / requirement) * 100
      )
    );
  };

  const previewAchievements = useMemo(() => {
    const preferredKeys = [
      "runs_1",
      "distance_5k",
      "distance_10k",
      "total_distance_100",
      "streak_7",
      "pace_under_5",
    ];

    const selected = preferredKeys
      .map((key) =>
        ACHIEVEMENTS.find(
          (achievement) =>
            achievement.key === key
        )
      )
      .filter(Boolean);

    return selected;
  }, []);

  return (
    <section className="achievements-preview section">
      <div className="container">

        <div className="section-title achievements-preview-header text-center">
          {/* <p>Achievements</p> */}

          <h2>
            Every milestone deserves recognition.
          </h2>

          <span>
            Challenge yourself, reach new
            milestones and unlock achievements
            as your running journey continues.
          </span>
        </div>

{currentUser ? (
  <div className="achievements-grid">
    {previewAchievements.map((achievement) => {
      const unlocked = Boolean(
        userAchievements[achievement.key]
      );

      const Icon = achievement.icon;

      const progress = getProgress(achievement);

      const progressPercent =
        getProgressPercent(achievement);

      return (
        <div
          className={`achievement-card ${
            unlocked
              ? "is-unlocked"
              : "is-locked"
          }`}
          key={achievement.key}
        >
          <div className="achievement-icon">
            {unlocked ? (
              <Icon />
            ) : (
              <FaLock />
            )}
          </div>

          <div className="achievement-content">
            <div className="achievement-top">
              <h3>
                {achievement.title}
              </h3>

              {unlocked && (
                <span className="achievement-status d-flex align-items-center gap-1">
                  <FaUnlock />
                  Unlocked
                </span>
              )}
            </div>

            <p>
              {achievement.description}
            </p>

            <div className="achievement-progress">
              <div className="achievement-progress-header">
                <span>Progress</span>

                <span>
                  {progressPercent}%
                </span>
              </div>

              <div className="achievement-progress-bar">
                <div
                  className="achievement-progress-fill"
                  style={{
                    width: `${progressPercent}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      );
    })}
  </div>
) : (
  <div className="achievements-login">
    <div className="achievements-login-icon">
      <FaLock />
    </div>

    <div className="achievements-login-content">
      <h3>Unlock your achievements</h3>

      <p>
        Sign in to your account or create one to
        start tracking your running progress and
        unlock achievements.
      </p>

      {/* <div className="achievements-login-actions">
        <button
          className="btn btn-custome text-white rounded-5 px-4 py-2"
          onClick={() => navigate("/login")}
        >
          Log In
        </button>

        <button
          className="achievements-register-btn"
          onClick={() => navigate("/register")}
        >
          Create Account
        </button>
      </div> */}
    </div>
  </div>
)}

        <div className="achievements-preview-footer">
          <button
            className="btn btn-custome text-white rounded-5 px-5 py-2 fs-6 fw-semibold"
            onClick={() =>
              navigate("/achievements")
            }
          >
            View All Achievements
          </button>
        </div>

      </div>
    </section>
  );
};

export default AchievementsPreview;