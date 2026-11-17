import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { Link } from "react-router-dom";
import {
  FiCompass,
  FiMap,
  FiFlag,
  FiLayers,
  FiTrendingUp,
  FiAward,
  FiArrowUpRight,
  FiCrosshair,
  FiEye,
  FiMapPin,
  FiTarget,
} from "react-icons/fi";
import { db } from "../../../firebase";
import { useAuth } from "../../account/AuthContext";
import { canAccessConquer } from "../../account/premiumAccess";
import { calculateConquest } from "./conquerEngine";
import ConquerMap from "./ConquerMap";
import "./conquer.scss";

const TYPES = [
  ["all", "All sports"],
  ["running", "Running"],
  ["cycling", "Cycling"],
  ["walking", "Walking"],
  ["hiking", "Hiking"],
  ["kayaking", "Kayaking"],
  ["swimming", "Swimming"],
  ["winter_sports", "Winter sports"],
];
const number = (n, digits = 0) =>
  Number(n || 0).toLocaleString("en-GB", { maximumFractionDigits: digits });
function Stat({ Icon, label, value, unit }) {
  return (
    <article className="fi-conquer-stat">
      <div className="fi-conquer-stat__icon">
        <Icon />
      </div>
      <span>{label}</span>
      <strong>
        {value}
        {unit && <small> {unit}</small>}
      </strong>
    </article>
  );
}
export default function ConquerPage() {
  const { user, loading: authLoading } = useAuth();
      const [premiumNow, setPremiumNow] = useState(() => Date.now());

    useEffect(() => {
        const timer = setInterval(() => {
            setPremiumNow(Date.now());
        }, 15000);

        return () => clearInterval(timer);
    }, []);

    const hasConquerAccess = canAccessConquer(
        user?.premiumPackage,
        premiumNow
    );
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [type, setType] = useState("all");
  const [period, setPeriod] = useState("all");
  const [theme, setTheme] = useState("streets");
  const [showRoutes, setShowRoutes] = useState(true);
  const [showCells, setShowCells] = useState(true);
  const [newOnly, setNewOnly] = useState(false);
  const [selected, setSelected] = useState(null);
  const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        if (!user?.uid || !hasConquerAccess) {
            setDocuments([]);
            setSelected(null);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError("");

        const routesQuery = query(
            collection(db, "routes"),
            where("uid", "==", user.uid)
        );

        return onSnapshot(
            routesQuery,
            (snapshot) => {
                setDocuments(
                    snapshot.docs.map((routeDoc) => ({
                        ...routeDoc.data(),
                        id: routeDoc.id
                    }))
                );

                setLoading(false);
            },
            (err) => {
                console.error("Conquer Firestore:", err);

                setError(
                    "Unable to load your GPS activities. Check Firestore permissions."
                );

                setLoading(false);
            }
        );
    }, [user?.uid, hasConquerAccess]);

  const report = useMemo(
    () => calculateConquest(documents, { activityType: type, period }),
    [documents, type, period],
  );
  const next = report.nextLevel;
  const progress = next ? Math.min(100, (report.total / next) * 100) : 100;

    if (authLoading) {
        return (
            <main className="fi-conquer">
                <div className="fi-conquer-shell fi-conquer-state">
                    Loading Conquer…
                </div>
            </main>
        );
    }

    if (!user) {
        return (
            <main className="fi-conquer">
                <div className="fi-conquer-shell fi-conquer-state">
                    <div>
                        <h1>FiTrack Conquer</h1>
                        <p>Sign in to explore your GPS routes.</p>
                    </div>
                </div>
            </main>
        );
    }

    if (!hasConquerAccess) {
        return (
            <main className="fi-conquer">
                <div className="fi-conquer-shell fi-conquer-state">
                    <div>
                        <span className="fi-conquer-kicker">
                            PREMIUM FEATURE
                        </span>

                        <h1>Unlock FiTrack Conquer</h1>

                        <p>
                            Explore new territories, track your
                            discoveries, and unlock exploration
                            milestones with an active Premium
                            membership.
                        </p>

                        <Link
                            to="/premium"
                            className="btn btn-custome mt-4"
                        >
                            Explore Premium Plans
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    if (loading) {
        return (
            <main className="fi-conquer">
                <div className="fi-conquer-shell fi-conquer-state">
                    Loading Conquer…
                </div>
            </main>
        );
    }

  return (
    <main className="fi-conquer">
      <div className="fi-conquer-shell">
        {error && (
          <p className="fi-conquer-error" role="alert">
            {error}
          </p>
        )}
        <section
          className="fi-conquer-stats"
          aria-label="Exploration statistics">
          <Stat
            Icon={FiLayers}
            label="Territories discovered"
            value={number(report.total)}
          />
          <Stat
            Icon={FiMap}
            label="Estimated ground area"
            value={number(report.areaKm2, 2)}
            unit="km²"
          />
          <Stat
            Icon={FiTrendingUp}
            label="New this month"
            value={number(report.thisMonth)}
          />
          <Stat
            Icon={FiFlag}
            label="GPS activities"
            value={number(report.routes.length)}
          />
        </section>
        <section className="fi-conquer-panel fi-conquer-map-panel">
          <div className="fi-conquer-panel-head">
            <div>
              <span className="fi-conquer-kicker">TERRITORY EXPLORER</span>
              <h2>Your discovery map</h2>
            </div>
            <div className="fi-conquer-controls">
              <label>
                Sport
                <select
                  value={type}
                  onChange={(e) => {
                    setType(e.target.value);
                    setSelected(null);
                  }}>
                  {TYPES.map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Period
                <select
                  value={period}
                  onChange={(e) => {
                    setPeriod(e.target.value);
                    setSelected(null);
                  }}>
                  <option value="all">All time</option>
                  <option value="30">30 days</option>
                  <option value="90">90 days</option>
                  <option value="365">365 days</option>
                </select>
              </label>
              <label>
                Map style
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}>
                  <option value="dark">Dark</option>
                  <option value="streets">Streets</option>
                  <option value="outdoor">Outdoor</option>
                  <option value="minimal">Minimal</option>
                  <option value="monochrome">Monochrome</option>
                </select>
              </label>
            </div>
          </div>
          <div className="fi-conquer-map-toolbar">
            <label>
              <input
                type="checkbox"
                checked={showCells}
                onChange={(e) => setShowCells(e.target.checked)}
              />{" "}
              <FiLayers /> Territories
            </label>
            <label>
              <input
                type="checkbox"
                checked={showRoutes}
                onChange={(e) => setShowRoutes(e.target.checked)}
              />{" "}
              <FiMapPin /> Routes
            </label>
            <label>
              <input
                type="checkbox"
                checked={newOnly}
                onChange={(e) => setNewOnly(e.target.checked)}
              />{" "}
              <FiEye /> New this month
            </label>
            <button type="button" onClick={() => setSelected(null)}>
              <FiCrosshair /> Show all
            </button>
            <button type="button" onClick={() => setExpanded((v) => !v)}>
              {expanded ? "Reduce map" : "Expand map"}
            </button>
          </div>
          <div
            className={`fi-conquer-map ${expanded ? "fi-conquer-map--expanded" : ""}`}>
            <ConquerMap
    report={report}
    selected={selected}
    showRoutes={showRoutes}
    showCells={showCells}
    newOnly={newOnly}
    theme={theme}
    expanded={expanded}
    onSelectRoute={setSelected}
/>
            {!report.routes.length && (
              <div className="fi-conquer-empty">
                No GPS routes for these filters. Record a GPS activity to start
                exploring.
              </div>
            )}
          </div>
          <p className="fi-conquer-note">
            Territories use a 250 m Web Mercator grid. Area is an approximate
            latitude-adjusted ground estimate, not legally owned land. GPS
            errors and missing track points can affect discoveries.{" "}
            {report.renderedCellLimitReached &&
              "The map displays only the first 8,000 cells."}
          </p>
        </section>
        <div className="fi-conquer-bottom">
          <section className="fi-conquer-panel">
            <div className="fi-conquer-panel-head">
              <div>
                <span className="fi-conquer-kicker">YOUR PROGRESSION</span>
                <h2>Explorer milestones</h2>
              </div>
              <FiAward />
            </div>
            <div className="fi-conquer-next">
              <FiTarget />
              <div>
                <small>NEXT MILESTONE</small>
                <strong>
                  {next ? `${number(next)} territories` : "All levels unlocked"}
                </strong>
                <div className="fi-conquer-progress">
                  <span style={{ width: `${progress}%` }} />
                </div>
                <small>
                  {next
                    ? `${number(Math.max(0, next - report.total))} more to unlock`
                    : "Legendary explorer"}
                </small>
              </div>
            </div>
            <div className="fi-conquer-levels">
              {report.levels.map((level) => (
                <div
                  key={level.target}
                  className={`fi-conquer-level ${level.unlocked ? "unlocked" : ""}`}>
                  <span>
                    <FiFlag /> {number(level.target)} zones
                  </span>
                  <strong>{level.unlocked ? "Unlocked" : "Locked"}</strong>
                  <div className="fi-conquer-progress">
                    <span
                      style={{
                        width: `${Math.min(100, (report.total / level.target) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
          <section className="fi-conquer-panel">
            <div className="fi-conquer-panel-head">
              <div>
                <span className="fi-conquer-kicker">DISCOVERIES</span>
                <h2>Recent routes</h2>
              </div>
              <Link to="/lens">
                View feed <FiArrowUpRight />
              </Link>
            </div>
            <div className="fi-conquer-recent">
              {report.latest.map((route) => (
                <button
                  key={route.id}
                  type="button"
                  className={selected === route.id ? "selected" : ""}
                  onClick={() =>
                    setSelected((v) => (v === route.id ? null : route.id))
                  }>
                  <span>
                    <strong>{route.title}</strong>
                    <small>
                      {route.date
                        ? route.date.toLocaleDateString("en-GB")
                        : "Date unavailable"}{" "}
                      · {route.type}
                    </small>
                  </span>
                  <span>
                    <b>+{route.newCells}</b>
                    <small>new zones</small>
                  </span>
                </button>
              ))}
              {!report.latest.length && <p>No saved GPS routes yet.</p>}
            </div>
          </section>
        </div>
        <div className="fi-conquer-bottom fi-conquer-extras">
          <section className="fi-conquer-panel">
            <div className="fi-conquer-panel-head">
              <div>
                <span className="fi-conquer-kicker">EXPLORATION TRENDS</span>
                <h2>Last six months</h2>
              </div>
              <FiTrendingUp />
            </div>
            <div className="fi-conquer-bars">
              {report.monthly.map((m) => (
                <div key={m.key} className="fi-conquer-bar-item">
                  <strong>{m.count}</strong>
                  <div className="fi-conquer-bar-track">
                    <div
                      style={{
                        height: `${Math.max(3, (m.count / Math.max(1, ...report.monthly.map((x) => x.count))) * 100)}%`,
                      }}
                    />
                  </div>
                  <small>{m.label}</small>
                </div>
              ))}
            </div>
          </section>
          <section className="fi-conquer-panel">
            <div className="fi-conquer-panel-head">
              <div>
                <span className="fi-conquer-kicker">YOUR BEST DISCOVERY</span>
                <h2>Exploration highlight</h2>
              </div>
              <FiCompass />
            </div>
            {report.mostNew ? (
              <div className="fi-conquer-highlight">
                <span>Most new territories in one session</span>
                <strong>+{report.mostNew.newCells} zones</strong>
                <p>{report.mostNew.title}</p>
                <button
                  type="button"
                  onClick={() => setSelected(report.mostNew.id)}>
                  Show on map <FiArrowUpRight />
                </button>
              </div>
            ) : (
              <p className="fi-conquer-note">
                Your best exploration will appear after your first GPS route.
              </p>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
