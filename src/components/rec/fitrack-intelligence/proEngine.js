import { normalizeActivity, LABELS } from './intelligenceEngine';

const DAY = 86400000;
export const keyOf = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const dayStart = (d) => new Date(d.getFullYear(),d.getMonth(),d.getDate());
const dayDiff = (a,b) => Math.round((Date.UTC(a.getFullYear(),a.getMonth(),a.getDate())-Date.UTC(b.getFullYear(),b.getMonth(),b.getDate()))/DAY);
const sum = (items,k) => items.reduce((v,a)=>v+(Number(a[k])||0),0);
const round = (n,d=1) => Number(n.toFixed(d));
const weekStart = d => {const n=dayStart(d);n.setDate(n.getDate()-(n.getDay()+6)%7);return n;};
export const DEFAULT_GOALS = {sessions:4,distance:20,minutes:180,activeDays:4};
export const TYPE_COLORS = {running:'#ff6b42',cycling:'#f5b35c',workout:'#ad8df4',walking:'#4dc7a2',hiking:'#79a8ef',swimming:'#4fbce2',kayaking:'#eb82ad',tennis:'#c5d65b',winter_sports:'#a3c5e5'};

export function buildProReport(raw, {now=new Date(),type='all',days=30,goals=DEFAULT_GOALS}={}) {
    const all=raw.map(normalizeActivity).filter(a=>a.date && a.date<=now).sort((a,b)=>b.date-a.date);
    const selected=all.filter(a=>type==='all'||a.type===type);
    const today=dayStart(now);
    const start=dayStart(now);start.setDate(start.getDate()-days+1);
    const previousStart=dayStart(start);previousStart.setDate(previousStart.getDate()-days);
    const current=selected.filter(a=>a.date>=start);
    const previous=selected.filter(a=>a.date>=previousStart&&a.date<start);
    const total=(items)=>({sessions:items.length,distance:sum(items,'distance'),minutes:sum(items,'duration'),calories:sum(items,'calories'),days:new Set(items.map(a=>keyOf(a.date))).size});
    const totals=total(current),prior=total(previous);
    const delta=(field)=>prior[field]===0?null:round((totals[field]-prior[field])/prior[field]*100,0);
    const week=weekStart(today),lastWeek=dayStart(week);lastWeek.setDate(lastWeek.getDate()-7);
    const thisWeek=selected.filter(a=>a.date>=week), priorWeek=selected.filter(a=>a.date>=lastWeek&&a.date<week);
    const weekTotals=total(thisWeek),lastWeekTotals=total(priorWeek);
    const goalsProgress=Object.fromEntries(Object.keys(DEFAULT_GOALS).map(k=>[k,{target:Math.max(1,Number(goals[k])||DEFAULT_GOALS[k]),actual:weekTotals[k],percent:Math.round(100*weekTotals[k]/Math.max(1,Number(goals[k])||DEFAULT_GOALS[k]))}]));
    const daily=Array.from({length:days},(_,i)=>{const d=dayStart(start);d.setDate(d.getDate()+i);return {date:d,key:keyOf(d),sessions:0,distance:0,minutes:0,calories:0};});
    const dailyMap=new Map(daily.map(d=>[d.key,d]));
    current.forEach(a=>{const d=dailyMap.get(keyOf(a.date));if(d){d.sessions++;d.distance+=a.distance;d.minutes+=a.duration;d.calories+=a.calories||0;}});
    const weeks=[];
    for(let i=0;i<days;i+=7){const part=daily.slice(i,i+7);weeks.push({label:`W${weeks.length+1}`,sessions:sum(part,'sessions'),distance:sum(part,'distance'),minutes:sum(part,'minutes'),calories:sum(part,'calories')});}
    const byType=Object.entries(current.reduce((acc,a)=>{const t=a.type;acc[t]??={type:t,label:LABELS[t]||t,sessions:0,distance:0,minutes:0};acc[t].sessions++;acc[t].distance+=a.distance;acc[t].minutes+=a.duration;return acc;},{})).map(([,v])=>v).sort((a,b)=>b.sessions-a.sessions);
    const distinct=[...new Set(selected.map(a=>keyOf(a.date)))].sort();
    let longest=0,run=0,last=null;
    for(const k of distinct){const d=new Date(`${k}T12:00:00`);run=last&&dayDiff(d,last)===1?run+1:1;longest=Math.max(longest,run);last=d;}
    const since=last?dayDiff(today,last):null;
    const streak=since!==null&&since<=1?run:0;
    const paceRuns=current.filter(a=>a.type==='running'&&a.distance>=1&&a.duration>0);
    const bestPace=paceRuns.length?Math.min(...paceRuns.map(a=>a.pace).filter(p=>p>0)):null;
    const avgPace=paceRuns.length?sum(paceRuns,'duration')/sum(paceRuns,'distance'):null;
    const records={};
    for(const a of selected){const r=records[a.type]??={type:a.type,label:LABELS[a.type]||a.type,maxDistance:null,maxDuration:null,bestPace:null,maxSpeed:null};
        if(a.distance>0&&(!r.maxDistance||a.distance>r.maxDistance.value))r.maxDistance={value:a.distance,date:a.date,id:a.id};
        if(a.duration>0&&(!r.maxDuration||a.duration>r.maxDuration.value))r.maxDuration={value:a.duration,date:a.date,id:a.id};
        if(a.type==='running'&&a.distance>=1&&a.pace>0&&(!r.bestPace||a.pace<r.bestPace.value))r.bestPace={value:a.pace,date:a.date,id:a.id};
        if(a.averageSpeed>0&&a.distance>=1&&(!r.maxSpeed||a.averageSpeed>r.maxSpeed.value))r.maxSpeed={value:a.averageSpeed,date:a.date,id:a.id};
    }
    const personalRecords=Object.values(records).sort((a,b)=>a.label.localeCompare(b.label));
    // Workload is a volume-only proxy: recorded active minutes, not physiological stress.
    const recent7=selected.filter(a=>a.date>=new Date(today.getFullYear(),today.getMonth(),today.getDate()-6));
    const previous7=selected.filter(a=>a.date>=new Date(today.getFullYear(),today.getMonth(),today.getDate()-13)&&a.date<new Date(today.getFullYear(),today.getMonth(),today.getDate()-6));
    const recent28=selected.filter(a=>a.date>=new Date(today.getFullYear(),today.getMonth(),today.getDate()-27));
    const acuteMinutes=sum(recent7,'duration'), baselineWeeklyMinutes=sum(recent28,'duration')/4;
    const volumeRatio=baselineWeeklyMinutes>=30?round(acuteMinutes/baselineWeeklyMinutes,2):null;
    const volumeTrend=volumeRatio===null?'Insufficient baseline':volumeRatio>1.5?'Higher than recent average':volumeRatio<0.6?'Lower than recent average':'Near recent average';
    const totalWeeks=Math.max(1,Math.ceil(days/7));
    const weeklyAverage={sessions:totals.sessions/totalWeeks,distance:totals.distance/totalWeeks,minutes:totals.minutes/totalWeeks};
    const forecast={sessions:round(weeklyAverage.sessions*4,0),distance:round(weeklyAverage.distance*4),minutes:round(weeklyAverage.minutes*4,0)};
    const dayOfWeek=Array.from({length:7},(_,i)=>({label:['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i],sessions:0,minutes:0}));
    current.forEach(a=>{const idx=(a.date.getDay()+6)%7;dayOfWeek[idx].sessions++;dayOfWeek[idx].minutes+=a.duration;});
    const insights=[];
    const add=(kind,title,body)=>insights.push({kind,title,body});
    if(!current.length)add('neutral','Build your baseline','Record your first activity in this period to unlock personal trends and comparisons.');
    else {
        if(delta('sessions')!==null)add(delta('sessions')>=0?'good':'neutral','Session frequency',`${totals.sessions} sessions, ${Math.abs(delta('sessions'))}% ${delta('sessions')>=0?'more':'fewer'} than the preceding ${days} days.`);
        if(totals.days>=Math.ceil(days*.4))add('good','Consistent movement',`You recorded activities on ${totals.days} of the last ${days} days.`);
        if(since>=7)add('neutral','Return gradually',`Your last recorded session was ${since} days ago. Consider starting with an easier session.`);
        if(volumeRatio!==null&&volumeRatio>1.5)add('caution','Training volume increased',`Your last 7 days total ${Math.round(acuteMinutes)} minutes, ${Math.round(volumeRatio*100)}% of your 4-week weekly average. This measures volume, not injury risk.`);
        if(volumeRatio!==null&&volumeRatio<.6)add('neutral','Lower recent volume',`Your last 7 days are below your 4-week weekly average. This may reflect planned recovery, schedule changes, or missed logs.`);
        if(goalsProgress.sessions.percent>=100)add('good','Weekly sessions goal achieved',`You reached ${weekTotals.sessions} sessions against a target of ${goalsProgress.sessions.target}.`);
        if(byType.length>=3)add('good','Varied activity mix',`You logged ${byType.length} different activity types in this period.`);
        if(paceRuns.length>=3)add('neutral','Running pace baseline',`Your distance-weighted average running pace is ${formatPace(avgPace)} min/km across ${paceRuns.length} runs.`);
        if(!insights.length)add('neutral','Keep building your history',`You logged ${totals.sessions} activities across ${totals.days} active days. Longer histories help reveal trends.`);
    }
    const plan=[];
    const sessionsTarget=Math.min(7,Math.max(1,goalsProgress.sessions.target));
    const preferred=byType[0]?.type||'running';
    const options={running:'Easy run',cycling:'Comfortable ride',workout:'Strength or mobility',walking:'Brisk walk',hiking:'Trail walk',swimming:'Technique swim',kayaking:'Easy paddle',tennis:'Tennis practice',winter_sports:'Easy winter session'};
    const schedule=[0,2,4,6,1,3,5].slice(0,sessionsTarget).sort((a,b)=>a-b);
    for(let i=0;i<7;i++){const d=new Date(week);d.setDate(d.getDate()+i);const scheduled=schedule.includes(i);plan.push({date:d,day:['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i],title:scheduled?(options[preferred]||'Comfortable activity'):'Optional recovery / rest',planned:scheduled});}
    return {all,selected,current,previous,totals,prior,delta:{sessions:delta('sessions'),distance:delta('distance'),minutes:delta('minutes')},weekTotals,lastWeekTotals,goalsProgress,daily,weeks,byType,streak,longest,since,bestPace,avgPace,personalRecords,acuteMinutes,previous7Minutes:sum(previous7,'duration'),baselineWeeklyMinutes,volumeRatio,volumeTrend,forecast,dayOfWeek,insights,plan};
}
export function formatPace(minutes){if(!Number.isFinite(minutes)||minutes<=0)return '—';const seconds=Math.round(minutes*60);return `${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}`;}
export function exportCsv(rows){const columns=['date','type','title','distance_km','duration_min','pace_min_km','calories_estimate'];const esc=v=>`"${String(v??'').replace(/"/g,'""')}"`;const lines=[columns.join(','),...rows.map(a=>[a.date?.toISOString()||'',a.type,a.title,a.distance,a.duration,a.pace,a.calories].map(esc).join(','))];return '\uFEFF'+lines.join('\r\n');}
