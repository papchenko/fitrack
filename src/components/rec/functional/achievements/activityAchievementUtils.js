// Distances in km, duration in minutes, calories in kcal.
export const number = (v) => Number.isFinite(Number(v)) ? Math.max(0, Number(v)) : 0;
export const normalizeActivityType = (value) => {
  const type = String(value || "running").toLowerCase().trim();
  if (["running", "run"].includes(type)) return "running";
  if (["cycling", "cycle", "bike", "biking"].includes(type)) return "cycling";
  if (["walking", "walk"].includes(type)) return "walking";
  if (["hiking", "hike"].includes(type)) return "hiking";
  if (["kayaking", "kayak", "canoeing", "canoe"].includes(type)) return "kayaking";
  if (["swimming", "swim"].includes(type)) return "swimming";
  if (["tennis"].includes(type)) return "tennis";
  if (["winter_sports", "winter-sports", "wintersports", "skiing", "snowboarding"].includes(type)) return "winter_sports";
  return type;
};
export const isActivityRoute = (route, activity) => normalizeActivityType(route?.activityType) === activity;
export const getDurationMinutes = (route) => number(route?.durationMinutes ?? route?.duration);
export const getAverageSpeed = (route) => number(route?.averageSpeed ?? route?.avgSpeed ?? route?.speed);
export const getDiscipline = (route) => String(route?.winterDiscipline ?? route?.discipline ?? route?.activityType ?? "").toLowerCase();

const getDate = (r) => {
  const value = r.timestamp || r.createdAt;
  if (!value) return null;
  const d = value.toDate?.() ?? new Date(value.seconds ? value.seconds * 1000 : value);
  return Number.isNaN(d.getTime()) ? null : d;
};
const streak = (routes) => {
  const days = [...new Set(routes.map((r) => getDate(r)?.toISOString().slice(0,10)).filter(Boolean))].sort();
  let best = 0, current = 0, previous = null;
  for (const day of days) {
    const time = Date.parse(day);
    current = previous !== null && time - previous === 86400000 ? current + 1 : 1;
    best = Math.max(best, current); previous = time;
  }
  return best;
};
export const calculateActivityStats = (routes) => {
  const result = { count: routes.length, totalDistance: 0, totalDuration: 0, totalCalories: 0, longestDistance: 0, longestDuration: 0, maxCalories: 0, maxSteps: 0, maxAverageSpeed: 0, disciplineCounts: {}, bestPace: null, streak: streak(routes) };
  for (const r of routes) {
    const distance = number(r.distance), duration = getDurationMinutes(r), calories = number(r.calories ?? r.estimatedCalories), pace = number(r.pace);
    result.totalDistance += distance; result.totalDuration += duration; result.totalCalories += calories;
    result.longestDistance = Math.max(result.longestDistance, distance);
    result.longestDuration = Math.max(result.longestDuration, duration);
    result.maxCalories = Math.max(result.maxCalories, calories);
    result.maxSteps = Math.max(result.maxSteps, number(r.steps));
    result.maxAverageSpeed = Math.max(result.maxAverageSpeed, getAverageSpeed(r));
    const discipline = getDiscipline(r);
    result.disciplineCounts[discipline] = (result.disciplineCounts[discipline] || 0) + 1;
    if (pace > 0) result.bestPace = result.bestPace === null ? pace : Math.min(result.bestPace, pace);
  }
  return result;
};
export const achievementProgress = (a, s) => {
  switch (a.type) {
    case "single_distance": case "single_run_distance": case "longest_run": return s.longestDistance;
    case "total_distance": return s.totalDistance;
    case "activity_count": case "run_count": return s.count;
    case "single_duration": return s.longestDuration;
    case "total_time": return s.totalDuration;
    case "single_calories": return s.maxCalories;
    case "total_calories": return s.totalCalories;
    case "steps": return s.maxSteps;
    case "pace": return s.bestPace || 0;
    case "streak": return s.streak;
    case "average_speed": return s.maxAverageSpeed;
    default:
      if (a.type?.startsWith("discipline_count:")) return s.disciplineCounts[a.type.split(":")[1]] || 0;
      return 0;
  }
};
export const isUnlockedByActivity = (a, s, route) => {
  const r = number(a.requirement);
  switch (a.type) {
    case "single_distance": return number(route.distance) >= r;
    case "single_duration": return getDurationMinutes(route) >= r;
    case "single_calories": return number(route.calories ?? route.estimatedCalories) >= r;
    case "pace": return number(route.pace) > 0 && number(route.pace) <= r;
    case "steps": return number(route.steps) >= r;
    case "average_speed": return getAverageSpeed(route) >= r;
    default: return achievementProgress(a, s) >= r;
  }
};
