import {
  collection,
  getCountFromServer,
  getDocs,
  query,
  where,
  Timestamp,
} from "firebase/firestore";

import { db } from "../../../firebase";

function getStartOfToday() {
  const start = new Date();

  start.setHours(0, 0, 0, 0);

  return start;
}

function getStartOfTomorrow() {
  const tomorrow = new Date();

  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  return tomorrow;
}

async function getUsersCount() {
  const usersRef = collection(db, "users");

  const snapshot = await getCountFromServer(usersRef);

  return snapshot.data().count;
}

async function getTodayRunsStats() {
  const routesRef = collection(db, "routes");

  const startOfToday = getStartOfToday();
  const startOfTomorrow = getStartOfTomorrow();

  const startTimestamp =
    Timestamp.fromDate(startOfToday);

  const endTimestamp =
    Timestamp.fromDate(startOfTomorrow);

  const todayRunsQuery = query(
    routesRef,
    where("createdAt", ">=", startTimestamp),
    where("createdAt", "<", endTimestamp)
  );

  const snapshot = await getDocs(todayRunsQuery);

  let totalDistance = 0;

  snapshot.forEach((doc) => {
    const route = doc.data();

    const distance = Number(route.distance);

    if (Number.isFinite(distance)) {
      totalDistance += distance;
    }
  });

  return {
    runsToday: snapshot.size,
    distanceToday: totalDistance,
  };
}

async function getTeamRacesCount() {
  const racesRef = collection(db, "races");

  const teamRacesQuery = query(
    racesRef,
    where("type", "==", "Team Race")
  );

  const snapshot =
    await getCountFromServer(teamRacesQuery);

  return snapshot.data().count;
}

async function getActivePlansCount() {
  const plansRef = collection(db, "runningPlans");

  const activePlansQuery = query(
    plansRef,
    where("status", "==", "active")
  );

  const snapshot =
    await getCountFromServer(activePlansQuery);

  return snapshot.data().count;
}

async function getActiveUsersCount() {
  const usersRef = collection(db, "users");

  const startOfToday = getStartOfToday();

  const activeUsersQuery = query(
    usersRef,
    where(
      "lastActiveAt",
      ">=",
      Timestamp.fromDate(startOfToday)
    )
  );

  const snapshot =
    await getCountFromServer(activeUsersQuery);

  return snapshot.data().count;
}

export async function getCommunityStats() {
  const [
    users,
    todayRuns,
    teamRaces,
    activePlans,
    activeUsers,
  ] = await Promise.all([
    getUsersCount(),
    getTodayRunsStats(),
    getTeamRacesCount(),
    getActivePlansCount(),
    getActiveUsersCount(),
  ]);

  return {
    users,
    runsToday: todayRuns.runsToday,
    distanceToday: todayRuns.distanceToday,
    teamRaces,
    challenges: activePlans,
    activeUsers,
  };
}