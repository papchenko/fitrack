import { collection, doc, getDocs, query, runTransaction, where } from "firebase/firestore";
import { db } from "../../../../firebase";
import { CYCLING_ACHIEVEMENTS, WORKOUT_ACHIEVEMENTS, WALKING_ACHIEVEMENTS, HIKING_ACHIEVEMENTS, KAYAKING_ACHIEVEMENTS, SWIMMING_ACHIEVEMENTS, TENNIS_ACHIEVEMENTS, WINTER_SPORTS_ACHIEVEMENTS } from "./activityAchievementDefinitions";
import { calculateActivityStats, isActivityRoute, isUnlockedByActivity, normalizeActivityType } from "./activityAchievementUtils";

const DEFINITIONS = {
  cycling: CYCLING_ACHIEVEMENTS, workout: WORKOUT_ACHIEVEMENTS,
  walking: WALKING_ACHIEVEMENTS, hiking: HIKING_ACHIEVEMENTS,
  kayaking: KAYAKING_ACHIEVEMENTS, swimming: SWIMMING_ACHIEVEMENTS,
  tennis: TENNIS_ACHIEVEMENTS, winter_sports: WINTER_SPORTS_ACHIEVEMENTS,
};

export async function processActivityAchievements({ uid, routeId, activityType }) {
  const normalizedType = normalizeActivityType(activityType);
  if (!uid || !routeId || !DEFINITIONS[normalizedType]) return [];
  const snap = await getDocs(query(collection(db, "routes"), where("uid", "==", uid)));
  const routes = snap.docs.map((d) => ({ id: d.id, ...d.data() })).filter((r) => isActivityRoute(r, normalizedType));
  const current = routes.find((r) => r.id === routeId);
  if (!current) return []; // Call after addDoc resolves; do not award for unsaved activities.
  const stats = calculateActivityStats(routes);
  const definitions = DEFINITIONS[normalizedType];
  const newlyUnlocked = [];
  for (const achievement of definitions) {
    if (!isUnlockedByActivity(achievement, stats, current)) continue;
    const ref = doc(db, "users", uid, "achievements", achievement.key);
    const created = await runTransaction(db, async (tx) => {
      const existing = await tx.get(ref);
      if (existing.exists()) return false;
      tx.set(ref, {
        key: achievement.key, title: achievement.title, description: achievement.description,
        category: achievement.category, type: achievement.type, requirement: achievement.requirement,
        unit: achievement.unit, activityType: normalizedType, unlocked: true, unlockedAt: new Date(),
        triggerRunId: routeId, triggerRun: { routeId },
      });
      return true;
    });
    if (created) newlyUnlocked.push(achievement);
  }
  return newlyUnlocked;
}
