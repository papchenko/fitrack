import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";

import { db } from "../../firebase";
import { userHasRunningPlansAccess } from "./runningPlanService";

export const checkRunningPlanProgress = async (userId, distance) => {
  const hasAccess = await userHasRunningPlansAccess(userId);

if (!hasAccess) return;
  const q = query(
    collection(db, "runningPlans"),
    where("userId", "==", userId),
    where("status", "==", "active"),
  );

  const snap = await getDocs(q);

  if (snap.empty) return;

  const planDoc = snap.docs[0];

  const plan = {
    id: planDoc.id,
    ...planDoc.data(),
  };

  const weekIndex = plan.currentWeek - 1;

  const workouts = [...plan.weeks[weekIndex].workouts];

  const workoutIndex = workouts.findIndex(
    (w) => !w.completed && parseFloat(w.distance) <= distance,
  );

  if (workoutIndex === -1) return;

  workouts[workoutIndex].completed = true;

  plan.weeks[weekIndex].workouts = workouts;

  await updateDoc(doc(db, "runningPlans", plan.id), {
    weeks: plan.weeks,
  });
};
