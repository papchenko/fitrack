export const TYPES = ["all", "running", "cycling", "workout", "walking", "hiking", "swimming", "kayaking", "tennis", "winter_sports"];
export const LABELS = { all: "All activities", running: "Running", cycling: "Cycling", workout: "Workout", walking: "Walking", hiking: "Hiking", swimming: "Swimming", kayaking: "Kayaking", tennis: "Tennis", winter_sports: "Winter sports" };
const aliases = { run: "running", cycle: "cycling", bike: "cycling", biking: "cycling", winter: "winter_sports", "winter-sports": "winter_sports" };
const numeric = (value) => { if (value === null || value === undefined || value === "") return null; const n = Number(value); return Number.isFinite(n) && n >= 0 ? n : null; };
export const toDate = (value) => { if (!value) return null; const d = typeof value.toDate === "function" ? value.toDate() : value.seconds != null ? new Date(value.seconds * 1000) : new Date(value); return Number.isNaN(d.getTime()) ? null : d; };
export const normalizeActivity = (raw) => {
    const type = aliases[String(raw.activityType || "running").toLowerCase()] || String(raw.activityType || "running").toLowerCase();
    const duration = numeric(raw.duration) ?? (numeric(raw.durationMs) != null ? numeric(raw.durationMs) / 60000 : 0);
    const distance = numeric(raw.distance) ?? 0;
    const date = toDate(raw.timestamp) || toDate(raw.createdAt);
    const pace = numeric(raw.pace);
    const averageSpeed = numeric(raw.averageSpeed) ?? (duration > 0 ? distance / (duration / 60) : null);
    return { id: raw.id, type, date, duration, distance, pace: pace > 0 ? pace : (distance > 0 && duration > 0 ? duration / distance : null), averageSpeed, calories: numeric(raw.calories ?? raw.estimatedCalories), steps: numeric(raw.steps), intensity: raw.intensity || null, title: raw.title || LABELS[type] || "Activity" };
};
const sum = (arr, field) => arr.reduce((total, item) => total + (item[field] || 0), 0);
const dayKey = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const aggregate = (arr) => ({ count: arr.length, distance: sum(arr,"distance"), duration: sum(arr,"duration"), calories: sum(arr,"calories"), activeDays: new Set(arr.filter(a=>a.date).map(a=>dayKey(a.date))).size });
export function analyzeActivities(rawRoutes, { type = "all", days = 30, now = new Date() } = {}) {
    const today = startOfDay(now);
    const start = new Date(today); start.setDate(start.getDate() - days + 1);
    const prevStart = new Date(start); prevStart.setDate(prevStart.getDate() - days);
    const activities = rawRoutes.map(normalizeActivity).filter(a => a.date && a.date <= now && (type === "all" || a.type === type)).sort((a,b)=>b.date-a.date);
    const current = activities.filter(a=>a.date>=start);
    const previous = activities.filter(a=>a.date>=prevStart && a.date<start);
    const totals = aggregate(current), prior = aggregate(previous);
    const change = (field) => prior[field] > 0 ? (totals[field]-prior[field])/prior[field]*100 : null;
    const weekly = Array.from({length: Math.ceil(days/7)},(_,i)=>({ index:i, label:`W${i+1}`, distance:0, duration:0, count:0 }));
    const daily = Array.from({length:days},(_,i)=>{const d=new Date(start);d.setDate(d.getDate()+i);return {key:dayKey(d),label:d.toLocaleDateString("en-GB",{day:"numeric",month:"short"}),count:0,distance:0,duration:0};});
    const dailyMap = new Map(daily.map(d=>[d.key,d]));
    for(const a of current){const entry=dailyMap.get(dayKey(a.date));if(!entry)continue;entry.count++;entry.distance+=a.distance;entry.duration+=a.duration;const index=Math.floor((startOfDay(a.date)-start)/86400000/7);if(weekly[index]){weekly[index].count++;weekly[index].distance+=a.distance;weekly[index].duration+=a.duration;}}
    const dates = [...new Set(activities.map(a=>dayKey(a.date)))].sort();
    let longestStreak=0, streak=0, previousDate=null;
    for(const key of dates){const date = new Date(`${key}T12:00:00`);streak=previousDate && Math.round((date-previousDate)/86400000)===1?streak+1:1;longestStreak=Math.max(longestStreak,streak);previousDate=date;}
    const lastDay=dates.length?new Date(`${dates.at(-1)}T12:00:00`):null;
    const daysSinceLast=lastDay?Math.round((today-startOfDay(lastDay))/86400000):null;
    const currentStreak=daysSinceLast!=null && daysSinceLast<=1?streak:0;
    const endurance=current.filter(a=>["running","walking","hiking","cycling","swimming","kayaking"].includes(a.type)&&a.distance>0&&a.duration>0);
    const paceRuns=current.filter(a=>a.type==="running"&&a.distance>=1&&a.pace>0);
    const avgPace=paceRuns.length?sum(paceRuns,"duration")/sum(paceRuns,"distance"):null;
    const insights=[];
    if(!current.length) insights.push({tone:"neutral",title:"Build your baseline",body:"Record an activity to start receiving data-driven insights."});
    else {
        if(change("count")!=null && change("count")>=15) insights.push({tone:"positive",title:"More consistent training",body:`You recorded ${totals.count} activities, ${Math.round(change("count"))}% more than in the preceding ${days} days.`});
        if(change("count")!=null && change("count")<=-25) insights.push({tone:"neutral",title:"Activity frequency decreased",body:`You logged ${totals.count} sessions versus ${prior.count} in the preceding period. Consider a sustainable routine.`});
        if(totals.activeDays>=Math.min(days,12)) insights.push({tone:"positive",title:"Strong consistency",body:`You were active on ${totals.activeDays} of the last ${days} days.`});
        if(daysSinceLast!=null && daysSinceLast>=7) insights.push({tone:"neutral",title:"Time since your last session",body:`Your last recorded activity was ${daysSinceLast} days ago. Resume at a comfortable intensity when ready.`});
        if(current.some(a=>a.type==="workout"&&a.calories==null)) insights.push({tone:"neutral",title:"Incomplete energy data",body:"Some workouts have no calorie estimate. Energy totals only include recorded estimates."});
        if(!insights.length) insights.push({tone:"neutral",title:"Training overview",body:`You completed ${totals.count} activities across ${totals.activeDays} active days. Keep recording to identify longer-term trends.`});
    }
    return { activities, current, previous, totals, prior, change:{count:change("count"),distance:change("distance"),duration:change("duration")}, daily, weekly, longestStreak, currentStreak, daysSinceLast, avgPace, bestPace:paceRuns.length?Math.min(...paceRuns.map(a=>a.pace)):null, longestDistance:endurance.length?Math.max(...endurance.map(a=>a.distance)):0, insights };
}
