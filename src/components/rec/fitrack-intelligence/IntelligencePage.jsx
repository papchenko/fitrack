import { useEffect, useMemo, useState } from "react";
import {
  collection,
  doc,
  onSnapshot,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";
import { Link } from "react-router-dom";
import {
  FiActivity,
  FiArrowDownRight,
  FiArrowRight,
  FiArrowUpRight,
  FiAward,
  FiBarChart2,
  FiCalendar,
  FiCheck,
  FiClock,
  FiDownload,
  FiEdit3,
  FiFlag,
  FiInfo,
  FiMap,
  FiTarget,
  FiTrendingUp,
  FiZap,
} from "react-icons/fi";
import { db } from "../../../firebase";
import { useAuth } from "../../account/AuthContext";
import { canAccessIntelligence } from "../../account/premiumAccess";
import { TYPES, LABELS } from "./intelligenceEngine";
import {
  buildProReport,
  DEFAULT_GOALS,
  TYPE_COLORS,
  exportCsv,
  formatPace,
  keyOf,
} from "./proEngine";
import {
  buildMonthlyProgress,
  buildDistanceRecords,
  evaluateTrainingPlan,
  createTrainingPlan,
  sanitizeGoals,
} from "./intelligence2Engine";
import "./intelligence.scss";

const number = (v, d = 1) =>
  Number(v || 0).toLocaleString("en-GB", { maximumFractionDigits: d });
const shortDate = (d) =>
  d?.toLocaleDateString("en-GB", { day: "numeric", month: "short" }) || "—";
const TIME_OPTIONS = [7, 30, 90, 365];
const TABS = [
  ["overview", "Overview", FiBarChart2],
  ["goals", "My goals", FiTarget],
  ["records", "Personal bests", FiAward],
  ["calendar", "Activity calendar", FiCalendar],
  ["coach", "Training guide", FiZap],
  ["progress", "Monthly progress", FiTrendingUp],
  ["plan", "Training plan", FiFlag],
  ["ai", "AI Analyst", FiZap],
];
const GOAL_LABELS = {
  sessions: ["Sessions", "sessions"],
  distance: ["Distance", "km"],
  minutes: ["Active time", "min"],
  activeDays: ["Active days", "days"],
};
const downloadCsv = (content) => {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `fitrack-intelligence-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
function Stat({ Icon, label, value, detail, delta }) {
  return (
    <article className="fi-pro-stat">
      <div className="fi-pro-stat__top">
        <span>{label}</span>
        <Icon />
      </div>
      <strong>{value}</strong>
      <small>{detail}</small>
      {delta !== undefined && delta !== null && (
        <span className={`fi-pro-change ${delta >= 0 ? "up" : "down"}`}>
          {delta >= 0 ? <FiArrowUpRight /> : <FiArrowDownRight />}
          {Math.abs(delta)}% vs previous period
        </span>
      )}
    </article>
  );
}
function Bars({ items, metric }) {
  const max = Math.max(1, ...items.map((a) => a[metric]));
  return (
    <div
      className="fi-pro-bars"
      role="img"
      aria-label={`${metric} across weeks`}>
      {items.map((a, i) => (
        <div className="fi-pro-bars__col" key={i}>
          <div className="fi-pro-bars__track">
            <div
              className="fi-pro-bars__fill"
              style={{
                height: `${Math.max(a[metric] > 0 ? 3 : 0, (100 * a[metric]) / max)}%`,
              }}
              title={`${a.label}: ${number(a[metric])}`}
            />
          </div>
          <small>{a.label}</small>
        </div>
      ))}
    </div>
  );
}
function Panel({ eyebrow, title, children, action, className = "" }) {
  return (
    <section className={`fi-pro-panel ${className}`}>
      <div className="fi-pro-panel__head">
        <div>
          <span className="fi-pro-kicker">{eyebrow}</span>
          <h2>{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
function GoalBar({ label, value, target, unit }) {
  const p = Math.round((value / target) * 100);
  return (
    <div className="fi-pro-goal">
      <div className="fi-pro-goal__row">
        <strong>{label}</strong>
        <span>
          {number(value)} / {number(target)} {unit}
        </span>
      </div>
      <div className="fi-pro-goal__track">
        <div style={{ width: `${Math.min(100, p)}%` }} />
      </div>
      <small>{p >= 100 ? "Goal reached" : `${p}% complete`}</small>
    </div>
  );
}
function Empty({ children }) {
  return <p className="fi-pro-empty">{children}</p>;
}
export default function IntelligencePage() {
  const { user, loading: authLoading } = useAuth();

    const premiumPackage = user?.premiumPackage;

    const [premiumNow, setPremiumNow] = useState(
        () => Date.now()
    );

    useEffect(() => {
        const timer = setInterval(() => {
            setPremiumNow(Date.now());
        }, 15000);

        return () => clearInterval(timer);
    }, []);

    const hasIntelligenceAccess = canAccessIntelligence(
        premiumPackage,
        premiumNow
    );

  const [routes, setRoutes] = useState([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  const [type, setType] = useState("all"),
    [days, setDays] = useState(30),
    [tab, setTab] = useState("overview"),
    [chartMetric, setChartMetric] = useState("minutes");
  const [goals, setGoals] = useState(DEFAULT_GOALS),
    [editing, setEditing] = useState(false),
    [draft, setDraft] = useState(DEFAULT_GOALS);
  const [now, setNow] = useState(() => new Date());
  const [goalsReady, setGoalsReady] = useState(false),
    [savingGoals, setSavingGoals] = useState(false);
  const [trainingPlan, setTrainingPlan] = useState(null),
    [planReady, setPlanReady] = useState(false),
    [savingPlan, setSavingPlan] = useState(false);
  const [aiAnswer, setAiAnswer] = useState(""),
    [aiQuestion, setAiQuestion] = useState(
      "Analyze my recent training patterns and give me 3 practical suggestions.",
    ),
    [aiBusy, setAiBusy] = useState(false),
    [aiError, setAiError] = useState("");
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(id);
  }, []);

    useEffect(() => {
        if (!user?.uid || !hasIntelligenceAccess) {
            setRoutes([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError("");

        const q = query(
            collection(db, "routes"),
            where("uid", "==", user.uid)
        );

        return onSnapshot(
            q,
            (snap) => {
                setRoutes(
                    snap.docs.map((d) => ({
                        id: d.id,
                        ...d.data()
                    }))
                );

                setLoading(false);
            },
            (e) => {
                console.error("FiTrack Intelligence:", e);

                setError(
                    "Unable to load activities. Please check your Firestore permissions."
                );

                setLoading(false);
            }
        );
    }, [user?.uid, hasIntelligenceAccess]);

  useEffect(() => {
    setGoalsReady(false);
    setPlanReady(false);
    setGoals(DEFAULT_GOALS);
    setTrainingPlan(null);
    if (!user?.uid || !hasIntelligenceAccess) {
      setGoalsReady(true);
      setPlanReady(true);
      return;
    }
    const goalsRef = doc(db, "users", user.uid, "intelligence", "settings");
    const planRef = doc(db, "users", user.uid, "intelligence", "trainingPlan");
    const offGoals = onSnapshot(
      goalsRef,
      (snap) => {
        setGoals(sanitizeGoals(snap.data()?.goals));
        setGoalsReady(true);
      },
      (err) => {
        console.error(err);
        setError("Could not synchronize goals with Firestore.");
        setGoalsReady(true);
      },
    );
    const offPlan = onSnapshot(
      planRef,
      (snap) => {
        setTrainingPlan(snap.exists() ? snap.data() : null);
        setPlanReady(true);
      },
      (err) => {
        console.error(err);
        setError("Could not synchronize your training plan.");
        setPlanReady(true);
      },
    );
    return () => {
      offGoals();
      offPlan();
    };
  }, [user?.uid, hasIntelligenceAccess]);
  const report = useMemo(
    () => buildProReport(routes, { type, days, now, goals }),
    [routes, type, days, now, goals],
  );
  const monthly = useMemo(
    () => buildMonthlyProgress(report.selected, 12, now),
    [report, now],
  );
  const distanceRecords = useMemo(
    () => buildDistanceRecords(report.selected),
    [report],
  );
  const planStatus = useMemo(
    () => evaluateTrainingPlan(trainingPlan, report.selected, now),
    [trainingPlan, report, now],
  );
  const saveGoals = async () => {
if (!user?.uid || !hasIntelligenceAccess || savingGoals) return;
    const next = sanitizeGoals(draft);
    setSavingGoals(true);
    setError("");
    try {
      await setDoc(
        doc(db, "users", user.uid, "intelligence", "settings"),
        { goals: next, updatedAt: new Date() },
        { merge: true },
      );
      setEditing(false);
    } catch (e) {
      console.error(e);
      setError(
        "Could not save goals to Firestore. Check your rules and connection.",
      );
    } finally {
      setSavingGoals(false);
    }
  };
  const generatePlan = async () => {
    if (!user?.uid || !hasIntelligenceAccess || savingPlan) return;
    const next = createTrainingPlan({
      goals,
      activities: report.selected,
      now,
    });
    setSavingPlan(true);
    setError("");
    try {
      await setDoc(
        doc(db, "users", user.uid, "intelligence", "trainingPlan"),
        next,
      );
      setTab("plan");
    } catch (e) {
      console.error(e);
      setError("Could not save your training plan.");
    } finally {
      setSavingPlan(false);
    }
  };
  const askAi = async () => {
    if (
    !user?.uid ||
    !hasIntelligenceAccess ||
    aiBusy ||
    !aiQuestion.trim()
) return;
    setAiBusy(true);
    setAiError("");
    setAiAnswer("");
    try {
      const callable = httpsCallable(
        getFunctions(undefined, "us-central1"),
        "fitrackIntelligenceAnalysis",
      );
      const response = await callable({
        question: aiQuestion.trim().slice(0, 500),
        type,
        days,
      });
      setAiAnswer(String(response.data?.answer || "No analysis returned."));
    } catch (e) {
      console.error(e);
      setAiError(
        "AI analysis unavailable. Deploy the optional Firebase Function and configure its API key.",
      );
    } finally {
      setAiBusy(false);
    }
  };
  const openGoals = () => {
    setDraft({ ...goals });
    setEditing(true);
    setTab("goals");
  };

    if (authLoading) {
        return (
            <main className="fi-pro-page">
                <div className="fi-pro-shell fi-pro-loading">
                    <span className="fi-pro-loader" />
                    Loading your account…
                </div>
            </main>
        );
    }

    if (!user) {
        return (
            <main className="fi-pro-page">
                <div className="fi-pro-shell fi-pro-auth">
                    <FiZap size={32} />

                    <h1>FiTrack Intelligence</h1>

                    <p>
                        Sign in to explore your personal
                        training analytics.
                    </p>

                    <Link to="/">
                        Back to home <FiArrowRight />
                    </Link>
                </div>
            </main>
        );
    }

    if (!hasIntelligenceAccess) {
        return (
            <main className="fi-pro-page">
                <div className="fi-pro-shell fi-pro-auth">
                    <FiZap size={40} />

                    <h1>Unlock FiTrack Intelligence</h1>

                    <p>
                        Unlock advanced training analytics,
                        personalized goals, progress tracking,
                        and AI-powered insights with an active
                        Advanced or Pro membership.
                    </p>

                    <Link to="/premium">
                        Explore Premium Plans <FiArrowRight />
                    </Link>
                </div>
            </main>
        );
    }

    if (loading) {
        return (
            <main className="fi-pro-page">
                <div className="fi-pro-shell fi-pro-loading">
                    <span className="fi-pro-loader" />
                    Loading your Intelligence…
                </div>
            </main>
        );
    }

  return (
    <main className="fi-pro-page">
      <div className="fi-pro-shell">
        <header className="fi-pro-hero">
          <div className="fi-pro-hero__copy">
            <span className="fi-pro-kicker">
              <FiZap /> FITRACK INTELLIGENCE PRO
            </span>
            <h1>
              Every activity.
              <br />
              <em>More insight.</em>
            </h1>
            <p>
              Your performance workspace — trends, milestones, goals and
              practical planning, built from your recorded sessions.
            </p>
            <div className="fi-pro-hero__actions">
              <button
                className="fi-pro-primary"
                type="button"
                onClick={openGoals}>
                <FiTarget /> Set weekly goals
              </button>
              <button
                className="fi-pro-secondary"
                type="button"
                onClick={() => downloadCsv(exportCsv(report.selected))}>
                <FiDownload /> Export CSV
              </button>
            </div>
          </div>
          <div className="fi-pro-hero__mark" aria-hidden="true">
            <div className="fi-pro-hero__ring">
              <FiActivity />
            </div>
            <span>YOUR DATA / YOUR PROGRESS</span>
          </div>
        </header>
        <div className="fi-pro-toolbar">
          <div className="fi-pro-toolbar__filters">
            <label>
              DISCIPLINE
              <select value={type} onChange={(e) => setType(e.target.value)}>
                {TYPES.map((t) => (
                  <option key={t} value={t}>
                    {LABELS[t]}
                  </option>
                ))}
              </select>
            </label>
            <label>
              TIME RANGE
              <select
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}>
                {TIME_OPTIONS.map((d) => (
                  <option key={d} value={d}>
                    Last {d} days
                  </option>
                ))}
              </select>
            </label>
          </div>
          <span className="fi-pro-toolbar__meta">
            <FiClock /> Updated from your saved activities
          </span>
        </div>
        {error && (
          <div className="fi-pro-alert" role="alert">
            {error}
          </div>
        )}
        <nav className="fi-pro-tabs" aria-label="Intelligence sections">
          {TABS.map(([id, label, Icon]) => (
            <button
              key={id}
              type="button"
              className={tab === id ? "active" : ""}
              onClick={() => setTab(id)}
              aria-current={tab === id ? "page" : undefined}>
              <Icon />
              <span>{label}</span>
            </button>
          ))}
        </nav>
        {tab === "overview" && (
          <>
            <section className="fi-pro-stats" aria-label="Performance metrics">
              <Stat
                Icon={FiActivity}
                label="SESSIONS"
                value={report.totals.sessions}
                detail={`Last ${days} days`}
                delta={report.delta.sessions}
              />
              <Stat
                Icon={FiMap}
                label="DISTANCE"
                value={`${number(report.totals.distance)} km`}
                detail="Total recorded distance"
                delta={report.delta.distance}
              />
              <Stat
                Icon={FiClock}
                label="ACTIVE TIME"
                value={`${number(report.totals.minutes / 60)} h`}
                detail={`${number(report.totals.minutes, 0)} total minutes`}
                delta={report.delta.minutes}
              />
              <Stat
                Icon={FiCalendar}
                label="ACTIVE DAYS"
                value={report.totals.days}
                detail={`${Math.round((report.totals.days / days) * 100)}% of days in period`}
              />
            </section>
            <div className="fi-pro-grid fi-pro-grid--wide">
              <Panel
                eyebrow="PERFORMANCE"
                title="Training trends"
                action={
                  <select
                    aria-label="Chart metric"
                    value={chartMetric}
                    onChange={(e) => setChartMetric(e.target.value)}>
                    <option value="minutes">Active minutes</option>
                    <option value="distance">Distance</option>
                    <option value="sessions">Sessions</option>
                  </select>
                }>
                <Bars items={report.weeks} metric={chartMetric} />
                <div className="fi-pro-legend">
                  <span>
                    <i /> Recorded {chartMetric}
                  </span>
                  <span>{report.weeks.length} weekly groups</span>
                </div>
              </Panel>
              <Panel eyebrow="CONSISTENCY" title="Your momentum">
                <div className="fi-pro-momentum">
                  <div>
                    <strong>{report.streak}</strong>
                    <span>Current streak</span>
                    <small>days</small>
                  </div>
                  <div>
                    <strong>{report.longest}</strong>
                    <span>Longest streak</span>
                    <small>days</small>
                  </div>
                  <div>
                    <strong>{report.since ?? "—"}</strong>
                    <span>Since last activity</span>
                    <small>days</small>
                  </div>
                </div>
                <p className="fi-pro-note">
                  A streak means consecutive calendar days with a recorded
                  activity. Yesterday still counts toward your current streak.
                </p>
              </Panel>
            </div>
            <div className="fi-pro-grid">
              <Panel eyebrow="SMART INSIGHTS" title="What your data says">
                <div className="fi-pro-insights">
                  {report.insights.map((i, idx) => (
                    <article
                      className={`fi-pro-insight fi-pro-insight--${i.kind}`}
                      key={idx}>
                      <span className="fi-pro-insight__icon">
                        {i.kind === "good" ? (
                          <FiTrendingUp />
                        ) : i.kind === "caution" ? (
                          <FiInfo />
                        ) : (
                          <FiZap />
                        )}
                      </span>
                      <div>
                        <strong>{i.title}</strong>
                        <p>{i.body}</p>
                      </div>
                    </article>
                  ))}
                </div>
              </Panel>
              <Panel eyebrow="DISCIPLINES" title="Your activity mix">
                {report.byType.length ? (
                  <div className="fi-pro-types">
                    {report.byType.map((t) => (
                      <div className="fi-pro-type" key={t.type}>
                        <div>
                          <span
                            className="fi-pro-type__dot"
                            style={{
                              background: TYPE_COLORS[t.type] || "#ff6b42",
                            }}
                          />
                          <strong>{t.label}</strong>
                          <small>{t.sessions} sessions</small>
                        </div>
                        <div className="fi-pro-type__track">
                          <div
                            style={{
                              width: `${(100 * t.sessions) / report.totals.sessions}%`,
                              background: TYPE_COLORS[t.type] || "#ff6b42",
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Empty>No sessions for this selection.</Empty>
                )}
              </Panel>
            </div>
            <div className="fi-pro-grid">
              <Panel eyebrow="TRAINING VOLUME" title="Recent workload">
                <div className="fi-pro-volume">
                  <strong>
                    {number(report.acuteMinutes, 0)}{" "}
                    <small>min / last 7 days</small>
                  </strong>
                  <div>
                    <span>4-week weekly average</span>
                    <b>{number(report.baselineWeeklyMinutes, 0)} min</b>
                  </div>
                  <div>
                    <span>Relative volume</span>
                    <b>
                      {report.volumeRatio === null
                        ? "—"
                        : `${report.volumeRatio}×`}
                    </b>
                  </div>
                </div>
                <p className="fi-pro-note">
                  {report.volumeTrend}. This compares minutes only; it does not
                  measure physiological stress, fatigue or injury risk.
                </p>
              </Panel>
              <Panel
                eyebrow="ACTIVITY HISTORY"
                title="Recent sessions"
                action={
                  <Link className="fi-pro-inline-link" to="/lens">
                    Open Lens <FiArrowUpRight />
                  </Link>
                }>
                <div className="fi-pro-history">
                  {report.current.slice(0, 6).map((a) => (
                    <Link key={a.id} to={`/lens/${a.id}`}>
                      <div>
                        <strong>{a.title}</strong>
                        <small>
                          {LABELS[a.type] || a.type} · {shortDate(a.date)}
                        </small>
                      </div>
                      <span>
                        {a.distance > 0
                          ? `${number(a.distance)} km`
                          : `${number(a.duration, 0)} min`}{" "}
                        <FiArrowUpRight />
                      </span>
                    </Link>
                  ))}
                  {!report.current.length && (
                    <Empty>No sessions in this period.</Empty>
                  )}
                </div>
              </Panel>
            </div>
          </>
        )}
        {tab === "goals" && (
          <>
            <div className="fi-pro-grid fi-pro-grid--wide">
              <Panel
                eyebrow="THIS WEEK"
                title="Weekly targets"
                action={
                  <button className="fi-pro-text-button" onClick={openGoals}>
                    <FiEdit3 /> Edit goals
                  </button>
                }>
                <div className="fi-pro-goals">
                  {Object.entries(report.goalsProgress).map(([k, g]) => (
                    <GoalBar
                      key={k}
                      label={GOAL_LABELS[k][0]}
                      value={g.actual}
                      target={g.target}
                      unit={GOAL_LABELS[k][1]}
                    />
                  ))}
                </div>
                <p className="fi-pro-note">
                  The week starts on Monday. Goals are synchronized to your
                  account in Firestore.
                </p>
              </Panel>
              <Panel eyebrow="WEEKLY SNAPSHOT" title="Week over week">
                <div className="fi-pro-comparison">
                  {[
                    ["Sessions", "sessions"],
                    ["Distance (km)", "distance"],
                    ["Active minutes", "minutes"],
                  ].map(([label, k]) => (
                    <div key={k}>
                      <span>{label}</span>
                      <strong>{number(report.weekTotals[k])}</strong>
                      <small>
                        Previous week: {number(report.lastWeekTotals[k])}
                      </small>
                    </div>
                  ))}
                </div>
              </Panel>
            </div>
            <Panel eyebrow="GOAL PLANNING" title="Keep your targets realistic">
              <p className="fi-pro-note">
                Choose weekly targets that match your routine. Goals track your
                logged activity and are not a prescription for exercise
                intensity. You can change them at any time.
              </p>
            </Panel>
          </>
        )}
        {tab === "records" && (
          <>
            <div className="fi-pro-grid">
              <Panel eyebrow="RUNNING" title="Pace benchmarks">
                <div className="fi-pro-momentum">
                  <div>
                    <strong>{formatPace(report.bestPace)}</strong>
                    <span>Best pace</span>
                    <small>min/km</small>
                  </div>
                  <div>
                    <strong>{formatPace(report.avgPace)}</strong>
                    <span>Weighted avg.</span>
                    <small>min/km</small>
                  </div>
                </div>
                <p className="fi-pro-note">
                  Current period only; runs must be at least 1 km. Best pace is
                  the fastest saved session-average pace, not a split.
                </p>
              </Panel>
              <Panel eyebrow="FORECAST" title="Next 4 weeks at current rate">
                <div className="fi-pro-comparison">
                  <div>
                    <span>Sessions</span>
                    <strong>{report.forecast.sessions}</strong>
                  </div>
                  <div>
                    <span>Distance</span>
                    <strong>{number(report.forecast.distance)} km</strong>
                  </div>
                  <div>
                    <span>Active minutes</span>
                    <strong>{report.forecast.minutes}</strong>
                  </div>
                </div>
                <p className="fi-pro-note">
                  Straight-line projection from the selected period's weekly
                  average, not a performance prediction.
                </p>
              </Panel>
            </div>
            <Panel
              eyebrow="PERSONAL BESTS"
              title="All-time records by discipline">
              {report.personalRecords.length ? (
                <div className="fi-pro-records">
                  {report.personalRecords.map((r) => (
                    <article key={r.type}>
                      <h3>
                        <span
                          className="fi-pro-type__dot"
                          style={{
                            background: TYPE_COLORS[r.type] || "#ff6b42",
                          }}
                        />
                        {r.label}
                      </h3>
                      <div className="fi-pro-records__values">
                        {[
                          ["Longest distance", r.maxDistance, "km"],
                          ["Longest session", r.maxDuration, "min"],
                          ["Fastest avg. pace", r.bestPace, "min/km"],
                          ["Highest avg. speed", r.maxSpeed, "km/h"],
                        ]
                          .filter(([, v]) => v)
                          .map(([label, v, unit]) => (
                            <div key={label}>
                              <small>{label}</small>
                              <strong>
                                {unit === "min/km"
                                  ? formatPace(v.value)
                                  : number(v.value)}{" "}
                                <em>{unit}</em>
                              </strong>
                              <span>{shortDate(v.date)}</span>
                            </div>
                          ))}
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <Empty>No saved records yet.</Empty>
              )}
              <p className="fi-pro-note">
                Records use your saved sessions in the selected discipline,
                across all available dates. Speed is session-average speed, not
                peak speed.
              </p>
            </Panel>
          </>
        )}
        {tab === "calendar" && (
          <>
            <Panel eyebrow="ACTIVITY CALENDAR" title={`Your last ${days} days`}>
              <div className="fi-pro-calendar">
                <div className="fi-pro-calendar__days">
                  {report.daily.map((d) => (
                    <div
                      key={d.key}
                      className={`fi-pro-calendar__day ${d.sessions ? "is-active" : ""}`}
                      style={{
                        "--strength": Math.min(1, 0.2 + d.minutes / 90),
                      }}
                      title={`${d.key}: ${d.sessions} sessions · ${number(d.minutes, 0)} min`}>
                      <span>{d.date.getDate()}</span>
                      <small>{d.sessions || ""}</small>
                    </div>
                  ))}
                </div>
              </div>
              <div className="fi-pro-legend">
                <span>Empty day</span>
                <span>
                  <i /> Recorded activity
                </span>
              </div>
            </Panel>
            <div className="fi-pro-grid">
              <Panel eyebrow="WEEKDAY PATTERN" title="When you train">
                <div className="fi-pro-weekdays">
                  {report.dayOfWeek.map((d) => (
                    <div key={d.label}>
                      <span>{d.label}</span>
                      <div>
                        <i
                          style={{
                            width: `${Math.max(0, (100 * d.sessions) / Math.max(1, ...report.dayOfWeek.map((x) => x.sessions)))}%`,
                          }}
                        />
                      </div>
                      <strong>{d.sessions}</strong>
                    </div>
                  ))}
                </div>
              </Panel>
              <Panel eyebrow="REGULARITY" title="Active-day summary">
                <div className="fi-pro-comparison">
                  <div>
                    <span>Active days</span>
                    <strong>{report.totals.days}</strong>
                  </div>
                  <div>
                    <span>Days in range</span>
                    <strong>{days}</strong>
                  </div>
                  <div>
                    <span>Activity coverage</span>
                    <strong>
                      {Math.round((report.totals.days / days) * 100)}%
                    </strong>
                  </div>
                </div>
              </Panel>
            </div>
          </>
        )}
        {tab === "coach" && (
          <>
            <div className="fi-pro-grid fi-pro-grid--wide">
              <Panel
                eyebrow="SUGGESTED STRUCTURE"
                title="Example weekly rhythm">
                <div className="fi-pro-plan">
                  {report.plan.map((d) => (
                    <div
                      key={keyOf(d.date)}
                      className={d.planned ? "is-planned" : ""}>
                      <div>
                        <strong>{d.day}</strong>
                        <small>{shortDate(d.date)}</small>
                      </div>
                      <span>{d.title}</span>
                      {d.planned ? <FiFlag /> : <FiCheck />}
                    </div>
                  ))}
                </div>
                <p className="fi-pro-note">
                  Illustrative scheduling based on your weekly session goal and
                  most common recorded activity. It does not account for
                  injuries, fatigue, medical conditions or exercise intensity.
                  Adjust to your needs.
                </p>
              </Panel>
              <Panel eyebrow="YOUR BASELINE" title="Planning context">
                <div className="fi-pro-comparison">
                  <div>
                    <span>Typical sessions / week</span>
                    <strong>
                      {number(report.totals.sessions / (days / 7))}
                    </strong>
                  </div>
                  <div>
                    <span>Typical minutes / week</span>
                    <strong>
                      {number(report.totals.minutes / (days / 7), 0)}
                    </strong>
                  </div>
                  <div>
                    <span>Target sessions / week</span>
                    <strong>{report.goalsProgress.sessions.target}</strong>
                  </div>
                  <div>
                    <span>Current volume trend</span>
                    <strong className="fi-pro-comparison__text">
                      {report.volumeTrend}
                    </strong>
                  </div>
                </div>
              </Panel>
            </div>
            <Panel
              eyebrow="DATA-BASED GUIDANCE"
              title="Suggestions for your next steps">
              <div className="fi-pro-insights">
                {report.insights.map((i, index) => (
                  <article className="fi-pro-insight" key={index}>
                    <FiZap />
                    <div>
                      <strong>{i.title}</strong>
                      <p>{i.body}</p>
                    </div>
                  </article>
                ))}
              </div>
              <p className="fi-pro-note">
                This is a transparent rule-based guide, not a generative AI
                coach or individualized clinical training plan.
              </p>
            </Panel>
          </>
        )}
        {tab === "progress" && (
          <>
            <Panel
              eyebrow="LONG-TERM ANALYSIS"
              title="Monthly progress · last 12 months">
              <div className="fi-v2-monthly">
                {monthly.map((m) => (
                  <article key={m.key}>
                    <div>
                      <strong>{m.label}</strong>
                      <small>{m.sessions} sessions</small>
                    </div>
                    <div className="fi-v2-monthly__track">
                      <i
                        style={{
                          width: `${(100 * m.minutes) / Math.max(1, ...monthly.map((x) => x.minutes))}%`,
                        }}
                      />
                    </div>
                    <b>{number(m.minutes, 0)} min</b>
                    <small>{number(m.distance)} km</small>
                  </article>
                ))}
              </div>
              <p className="fi-pro-note">
                Calendar-month totals based on saved sessions, including months
                without activity. The discipline filter applies; the
                7/30/90/365-day selector does not limit this 12-month view.
              </p>
            </Panel>
            <Panel
              eyebrow="RUNNING BENCHMARKS"
              title="1 km · 5 km · 10 km records">
              <div className="fi-v2-records">
                {distanceRecords.map((r) => (
                  <article key={r.target}>
                    <span>{r.target} KM</span>
                    <strong>{r.best ? formatPace(r.best.minutes) : "—"}</strong>
                    <small>
                      {r.best
                        ? `${shortDate(r.best.date)} · ${number(r.best.distance)} km session`
                        : "No qualifying run"}
                    </small>
                  </article>
                ))}
              </div>
              <p className="fi-pro-note">
                These are estimated equivalent-distance times derived from the
                average pace of complete runs at least as long as each
                benchmark. They are NOT measured splits or verified race
                personal bests.
              </p>
            </Panel>
          </>
        )}
        {tab === "plan" && (
          <>
            <Panel
              eyebrow="PERSONAL TRAINING PLAN"
              title="Your weekly plan"
              action={
                <button
                  className="fi-pro-text-button"
                  disabled={savingPlan || !goalsReady}
                  onClick={generatePlan}>
                  <FiFlag />{" "}
                  {savingPlan
                    ? "Saving…"
                    : trainingPlan
                      ? "Regenerate plan"
                      : "Create plan"}
                </button>
              }>
              {!planReady ? (
                <Empty>Loading plan…</Empty>
              ) : !trainingPlan ? (
                <Empty>
                  Create a plan based on your weekly goals and recorded
                  discipline. Your plan will sync across devices.
                </Empty>
              ) : (
                <>
                  <div className="fi-v2-plan-summary">
                    <strong>
                      {planStatus.completed} / {planStatus.scheduled}
                    </strong>
                    <span>Scheduled sessions completed this week</span>
                  </div>
                  <div className="fi-v2-plan-days">
                    {planStatus.days.map((d) => (
                      <article
                        key={d.key}
                        className={d.completed ? "completed" : ""}>
                        <div>
                          <strong>{d.day}</strong>
                          <small>{d.key}</small>
                        </div>
                        <span>{d.title}</span>
                        <b>
                          {d.planned
                            ? d.completed
                              ? "Completed"
                              : "Planned"
                            : "Recovery / rest"}
                        </b>
                      </article>
                    ))}
                  </div>
                  <p className="fi-pro-note">
                    A scheduled day is marked complete when at least one saved
                    activity matches that calendar day. This is adherence
                    tracking, not confirmation that the prescribed intensity or
                    exercises were followed. Regenerating replaces the current
                    plan.
                  </p>
                </>
              )}
            </Panel>
          </>
        )}
        {tab === "ai" && (
          <>
            <Panel
              eyebrow="GENERATIVE AI · OPTIONAL BACKEND"
              title="Ask your FiTrack analyst">
              <p className="fi-pro-note">
                AI receives a limited statistical summary of your recorded
                activities, not GPS traces, photographs, account email or raw
                Firestore documents. Do not use it for medical decisions.
              </p>
              <label className="fi-v2-ai-label" htmlFor="fi-v2-question">
                Your question
              </label>
              <textarea
                id="fi-v2-question"
                className="fi-v2-ai-input"
                maxLength={500}
                rows={4}
                value={aiQuestion}
                onChange={(e) => setAiQuestion(e.target.value)}
              />
              <button
                type="button"
                className="fi-pro-primary"
                disabled={aiBusy || !aiQuestion.trim()}
                onClick={askAi}>
                <FiZap /> {aiBusy ? "Analyzing…" : "Analyze my training"}
              </button>
              {aiError && (
                <p role="alert" className="fi-pro-alert">
                  {aiError}
                </p>
              )}
              {aiAnswer && (
                <div className="fi-v2-ai-result" aria-live="polite">
                  {aiAnswer}
                </div>
              )}
            </Panel>
          </>
        )}
        <footer className="fi-pro-footer">
          <FiInfo /> FiTrack Intelligence uses your recorded activity data.
          Calorie values are estimates; volume comparisons and projections are
          descriptive, not medical or physiological assessments.
        </footer>
        {editing && (
          <div
            className="fi-pro-modal-backdrop"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) setEditing(false);
            }}>
            <form
              className="fi-pro-modal"
              onSubmit={(e) => {
                e.preventDefault();
                saveGoals();
              }}
              aria-label="Edit weekly goals">
              <div className="fi-pro-modal__head">
                <div>
                  <span className="fi-pro-kicker">PERSONALIZE</span>
                  <h2>Weekly goals</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  aria-label="Close">
                  ×
                </button>
              </div>
              <p>Set the activity totals you'd like to reach each week.</p>
              {Object.keys(DEFAULT_GOALS).map((k) => (
                <label key={k}>
                  {GOAL_LABELS[k][0]} <small>({GOAL_LABELS[k][1]})</small>
                  <input
                    type="number"
                    min="1"
                    max="100000"
                    step={k === "distance" ? "0.5" : "1"}
                    required
                    value={draft[k]}
                    onChange={(e) =>
                      setDraft((p) => ({ ...p, [k]: e.target.value }))
                    }
                  />
                </label>
              ))}
              <div className="fi-pro-modal__actions">
                <button
                  type="button"
                  className="fi-pro-secondary"
                  onClick={() => setEditing(false)}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="fi-pro-primary"
                  disabled={savingGoals || !goalsReady}>
                  <FiCheck /> {savingGoals ? "Saving…" : "Save goals"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}
