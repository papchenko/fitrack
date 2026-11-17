import {
  collection,
  doc,
  getDocs,
  setDoc,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../../../../firebase";
import { ACHIEVEMENTS } from "./achievementDefinitions";

function normalizeNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function getRouteDate(route) {
  if (route?.timestamp?.seconds) {
    return new Date(route.timestamp.seconds * 1000);
  }

  if (route?.createdAt?.seconds) {
    return new Date(route.createdAt.seconds * 1000);
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
  if (!routes.length) return 0;

  const uniqueDays = new Set();

  routes.forEach((route) => {
    const date = getRouteDate(route);

    if (!date) return;

    const dayKey = date.toISOString().split("T")[0];

    uniqueDays.add(dayKey);
  });

  const sortedDays = Array.from(uniqueDays).sort();

  if (!sortedDays.length) return 0;

  let longestStreak = 1;
  let currentStreak = 1;

  for (let i = 1; i < sortedDays.length; i++) {
    const previous = new Date(sortedDays[i - 1]);
    const current = new Date(sortedDays[i]);

    const difference = (current - previous) / (1000 * 60 * 60 * 24);

    if (difference === 1) {
      currentStreak += 1;

      if (currentStreak > longestStreak) {
        longestStreak = currentStreak;
      }
    } else {
      currentStreak = 1;
    }
  }

  return longestStreak;
}

function calculateStatistics(routes) {
  let totalDistance = 0;
  let totalDuration = 0;
  let longestRun = 0;

  routes.forEach((route) => {
    const distance = normalizeNumber(route.distance);
    const duration = normalizeNumber(route.duration);

    totalDistance += distance;
    totalDuration += duration;

    if (distance > longestRun) {
      longestRun = distance;
    }
  });

  const runCount = routes.length;

  const streak = calculateLongestStreak(routes);

  return {
    totalDistance,
    totalDuration,
    longestRun,
    runCount,
    streak,
  };
}

function isAchievementUnlocked(achievement, stats, currentRun) {
  const requirement = normalizeNumber(achievement.requirement);

  switch (achievement.type) {
    case "single_run_distance":
      return normalizeNumber(currentRun.distance) >= requirement;

    case "total_distance":
      return stats.totalDistance >= requirement;

    case "run_count":
      return stats.runCount >= requirement;

    case "pace":
      return (
        normalizeNumber(currentRun.pace) > 0 &&
        normalizeNumber(currentRun.pace) <= requirement
      );

    case "steps":
      return normalizeNumber(currentRun.steps) >= requirement;

    case "total_time":
      return stats.totalDuration >= requirement * 60;

    case "longest_run":
      return stats.longestRun >= requirement;

    case "streak":
      return stats.streak >= requirement;

    default:
      return false;
  }
}

export async function getUserAchievements(uid) {
  if (!uid) {
    return [];
  }

  try {
    const achievementsRef = collection(db, "users", uid, "achievements");

    const snapshot = await getDocs(achievementsRef);

    return snapshot.docs.map((achievementDoc) => ({
      id: achievementDoc.id,
      ...achievementDoc.data(),
    }));
  } catch (error) {
    console.error("Failed to load user achievements:", error);

    return [];
  }
}

async function getUserRoutes(uid) {
  if (!uid) {
    return [];
  }

  try {
    const routesRef = collection(db, "routes");

    const q = query(routesRef, where("uid", "==", uid));

    const snapshot = await getDocs(q);

    return snapshot.docs
  .map((routeDoc) => ({
    id: routeDoc.id,
    ...routeDoc.data(),
  }))
  .filter(
    (route) =>
      !route.activityType ||
      route.activityType === "running" ||
      route.activityType === "run"
  );
  } catch (error) {
    console.error("Failed to load user routes:", error);

    return [];
  }
}

async function saveAchievement(uid, achievement, currentRun, stats) {
  const achievementRef = doc(db, "users", uid, "achievements", achievement.key);

  const data = {
    key: achievement.key,

    title: achievement.title,

    description: achievement.description,

    category: achievement.category,

    type: achievement.type,

    requirement: achievement.requirement,

    unit: achievement.unit,

    unlocked: true,

    unlockedAt: new Date(),

    stats: {
      totalDistance: stats.totalDistance,
      totalDuration: stats.totalDuration,
      runCount: stats.runCount,
      longestRun: stats.longestRun,
      streak: stats.streak,
    },

    triggerRunId: currentRun.routeId || null,

    triggerRun: {
      routeId: currentRun.routeId || null,

      distance: normalizeNumber(currentRun.distance),
      pace: normalizeNumber(currentRun.pace),
      steps: normalizeNumber(currentRun.steps),
      duration: normalizeNumber(currentRun.duration),
    },
  };

  await setDoc(achievementRef, data);

  return data;
}

export async function processRunAchievements({
  uid,
  routeId,
  distance,
  pace,
  steps,
  duration,
}) {
  if (!uid) {
    console.warn("processRunAchievements: missing uid");

    return [];
  }

  try {
    const currentRun = {
      routeId: routeId || null,

      distance: normalizeNumber(distance),
      pace: normalizeNumber(pace),
      steps: normalizeNumber(steps),
      duration: normalizeNumber(duration),

      createdAt: new Date(),
    };

    const routes = await getUserRoutes(uid);
    const currentRunExists = routes.some((route) => route.id === routeId);

    if (!currentRunExists && routeId) {
      routes.push({
  id: routeId,
  uid,
  activityType: "running",
        distance: currentRun.distance,
        duration: currentRun.duration,
        pace: currentRun.pace,
        steps: currentRun.steps,
        createdAt: currentRun.createdAt,
      });
    }

    const stats = calculateStatistics(routes);

    const existingAchievements = await getUserAchievements(uid);

    const unlockedKeys = new Set(
      existingAchievements.map((achievement) => achievement.key),
    );

    const newlyUnlocked = [];

    for (const achievement of ACHIEVEMENTS) {
      if (unlockedKeys.has(achievement.key)) {
        continue;
      }

      const unlocked = isAchievementUnlocked(achievement, stats, currentRun);

      if (!unlocked) {
        continue;
      }

      const savedAchievement = await saveAchievement(
        uid,
        achievement,
        currentRun,
        stats,
      );

      newlyUnlocked.push(savedAchievement);
    }

    console.log("Achievement processing completed:", {
      uid,
      totalRuns: stats.runCount,
      totalDistance: stats.totalDistance,
      longestRun: stats.longestRun,
      streak: stats.streak,
      newlyUnlocked,
    });

    return newlyUnlocked;
  } catch (error) {
    console.error("Achievement processing failed:", error);

    return [];
  }
}
