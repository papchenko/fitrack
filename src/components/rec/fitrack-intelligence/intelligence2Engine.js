import { DEFAULT_GOALS, keyOf } from './proEngine';

export function sanitizeGoals(raw) {
    return Object.fromEntries(Object.keys(DEFAULT_GOALS).map(k=>{
        const v=Number(raw?.[k]);
        return [k,Number.isFinite(v)&&v>0?Math.min(100000,Math.max(1,v)):DEFAULT_GOALS[k]];
    }));
}
export function buildMonthlyProgress(activities,count=12,now=new Date()){
    const months=Array.from({length:count},(_,i)=>{
        const date=new Date(now.getFullYear(),now.getMonth()-count+1+i,1);
        return {key:`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}`,label:date.toLocaleDateString('en-GB',{month:'short',year:'2-digit'}),sessions:0,distance:0,minutes:0};
    });
    const map=new Map(months.map(m=>[m.key,m]));
    activities.forEach(a=>{if(!a.date)return;const key=`${a.date.getFullYear()}-${String(a.date.getMonth()+1).padStart(2,'0')}`;const m=map.get(key);if(m){m.sessions++;m.distance+=a.distance||0;m.minutes+=a.duration||0;}});
    return months;
}
export function buildDistanceRecords(activities){
    const runs=activities.filter(a=>a.type==='running'&&a.distance>0&&a.duration>0);
    return [1,5,10].map(target=>{
        const eligible=runs.filter(a=>a.distance>=target);
        const sorted=eligible.map(a=>({...a,minutes:a.duration/a.distance*target})).sort((a,b)=>a.minutes-b.minutes);
        return {target,best:sorted[0]||null};
    });
}
const monday=d=>{const n=new Date(d.getFullYear(),d.getMonth(),d.getDate());n.setDate(n.getDate()-(n.getDay()+6)%7);return n;};
export function createTrainingPlan({goals,activities,now=new Date()}){
    const sessions=Math.min(7,Math.max(1,Math.round(Number(goals.sessions)||4)));
    const counts={};activities.slice(0,100).forEach(a=>{counts[a.type]=(counts[a.type]||0)+1;});
    const type=Object.keys(counts).sort((a,b)=>counts[b]-counts[a])[0]||'running';
    const labels={running:'Easy run',cycling:'Comfortable ride',workout:'Strength / mobility',walking:'Walk',hiking:'Hike',swimming:'Technique swim',kayaking:'Easy paddle',tennis:'Tennis practice',winter_sports:'Winter session'};
    const slots=[0,2,4,6,1,3,5].slice(0,sessions);
    return {version:1,createdAt:new Date(),sessionsTarget:sessions,discipline:type,days:Array.from({length:7},(_,i)=>({weekday:i,planned:slots.includes(i),title:slots.includes(i)?labels[type]||'Activity':'Optional recovery / rest'}))};
}
export function evaluateTrainingPlan(plan,activities,now=new Date()){
    if(!plan?.days)return {scheduled:0,completed:0,days:[]};
    const start=monday(now),recorded=new Set(activities.filter(a=>a.date).map(a=>keyOf(a.date)));
    const days=plan.days.map((d,i)=>{const date=new Date(start);date.setDate(date.getDate()+i);const key=keyOf(date);return {...d,key,day:['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i],completed:d.planned&&recorded.has(key)};});
    return {scheduled:days.filter(d=>d.planned).length,completed:days.filter(d=>d.completed).length,days};
}
