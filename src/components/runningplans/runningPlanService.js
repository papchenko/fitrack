import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
  doc,
  updateDoc,
} from "firebase/firestore";
import { getDoc } from "firebase/firestore";
import { canAccessRunningPlans } from "../account/premiumAccess";

import { db } from "../../firebase";
import { getCurrentTrainingDay } from "../../utils/getCurrentTrainingDay";

export const userHasRunningPlansAccess = async (userId) => {
    if (!userId) return false;

    const userSnap = await getDoc(doc(db, "users", userId));

    if (!userSnap.exists()) return false;

    return canAccessRunningPlans(
        userSnap.data().premiumPackage
    );
};

export const createRunningPlan = async (planData) => {
  const existingActivePlan = await getActivePlan(planData.userId);

  if (existingActivePlan) {
    throw new Error("You already have an active running plan.");
  }

  const docRef = await addDoc(collection(db, "runningPlans"), {
    ...planData,
    status: "active",
    createdAt: serverTimestamp(),
  });

  return docRef.id;
};

export const getUserPlans = async (userId) => {
  const q = query(
    collection(db, "runningPlans"),
    where("userId", "==", userId),
  );

  const snap = await getDocs(q);

  return snap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

export const getActivePlan = async (userId) => {
  const q = query(
    collection(db, "runningPlans"),
    where("userId", "==", userId),
    where("status", "==", "active"),
  );

  const snap = await getDocs(q);

  if (snap.empty) return null;

  return {
    id: snap.docs[0].id,
    ...snap.docs[0].data(),
  };
};

export const completeWorkoutFromRun = async (userId, distance, duration) => {
    try {
        const hasAccess = await userHasRunningPlansAccess(userId);

        if (!hasAccess) return;
    const plan = await getActivePlan(userId);

    if (!plan) {
      console.log("No active running plan found");
      return;
    }

    const weekIndex = plan.currentWeek - 1;
    const week = plan.weeks?.[weekIndex];

    if (!week) {
      console.log("Current training week not found");
      return;
    }

    const runDistance = Number(distance);

    if (!Number.isFinite(runDistance) || runDistance <= 0) {
      console.log("Invalid run distance:", distance);
      return;
    }

    // Find all workouts that can be completed
    const eligibleWorkouts = week.workouts
      .map((workout, index) => {
        if (workout.completed) {
          return null;
        }

        if (workout.type === "Intervals" || workout.type === "VO2 Max") {
          return null;
        }

        const targetDistance = Number(workout.targetDistanceKm);

        if (!Number.isFinite(targetDistance) || targetDistance <= 0) {
          return null;
        }

        if (runDistance < targetDistance) {
          return null;
        }

        return {
          index,
          targetDistance,
        };
      })
      .filter(Boolean);

    if (eligibleWorkouts.length === 0) {
      console.log(
        "No workout can be completed with this run:",
        runDistance,
        "km",
      );

      return;
    }

    eligibleWorkouts.sort((a, b) => b.targetDistance - a.targetDistance);

    const workoutIndex = eligibleWorkouts[0].index;

    const workout = week.workouts[workoutIndex];

    const completedAt = new Date().toISOString();

    week.workouts[workoutIndex] = {
      ...workout,

      completed: true,

      completedAt,

      actualDistance: runDistance,

      history: [
        ...(workout.history || []),

        {
          date: completedAt,
          distance: runDistance,

          pace:
            runDistance > 0 && Number(duration) > 0
              ? Number(duration) / runDistance
              : null,

          time: Number(duration),

          source: "run",
        },
      ],
    };

    const weekCompleted = week.workouts.every((workout) => {
      if (workout.type === "Intervals" || workout.type === "VO2 Max") {
        return true;
      }

      return workout.completed;
    });

    let nextWeek = plan.currentWeek;
    let status = plan.status;
    let completedAtPlan = null;

    if (weekCompleted) {
      if (plan.currentWeek < plan.weeks.length) {
        nextWeek = plan.currentWeek + 1;
      } else {
        status = "completed";
        completedAtPlan = completedAt;
      }
    }

    const updateData = {
      weeks: plan.weeks,
      currentWeek: nextWeek,
      status,
    };

    if (completedAtPlan) {
      updateData.completedAt = completedAtPlan;
    }

    await updateDoc(doc(db, "runningPlans", plan.id), updateData);

    console.log(
      `Workout "${workout.type}" completed automatically.`,
      `Target: ${workout.targetDistanceKm} km`,
      `Actual: ${runDistance} km`,
    );
  } catch (error) {
    console.error("Failed to complete workout from run:", error);
  }
};
