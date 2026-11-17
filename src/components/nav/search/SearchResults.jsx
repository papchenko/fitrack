// import { Link } from "react-router-dom";
// import { useEffect, useState } from "react";
// import { useLocation } from "react-router-dom";
// import { db } from "../../../firebase";
// import { collection, getDocs } from "firebase/firestore";

// import "./search.scss";
// import { color } from "framer-motion";

// function useQuery() {
//   return new URLSearchParams(useLocation().search);
// }

// export default function SearchResults() {
//   const query = useQuery().get("query")?.toLowerCase() || "";
//   const [results, setResults] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchResults = async () => {
//       setLoading(true);
//       const routesSnap = await getDocs(collection(db, "routes"));
//       const usersSnap = await getDocs(collection(db, "users"));
      
//       const routeResults = routesSnap.docs
//         .map((d) => ({ id: d.id, ...d.data(), type: "route" }))
//         .filter((r) =>
//           [r.title, r.locationName]
//             .filter(Boolean)
//             .some((field) => field.toLowerCase().includes(query))
//         );

//       const userResults = usersSnap.docs
//         .map((d) => ({ id: d.id, ...d.data(), type: "user" }))
//         .filter((u) =>
//           [u.username, u.email]
//             .filter(Boolean)
//             .some((field) => field.toLowerCase().includes(query))
//         );

//       setResults([...routeResults, ...userResults]);
//       setLoading(false);
//     };

//     if (query) fetchResults();
//   }, [query]);

//   if (loading) return <div className="text-white search-loading">Searching...</div>;

//   return (
//     <div className="search-results text-white container">
//       <h3>Search results for: “{query}”</h3>
//       {results.length === 0 ? (
//         <p>No results found.</p>
//       ) : (
//         <div className="row mt-4">
//           {results.map((item) => (
//             <div key={item.id} className="col-lg-4 mb-4">
//               <div className="search-card p-3 rounded border">
//                 {item.type === "route" ? (
//                   <>
//                     <h><span style={{ color: "#db3206", fontSize: "18px" }}>Run:</span> {item.title}</h>
//                     <p><strong>Location:</strong> {item.locationName || "—"}</p>
//                     <Link to={`/lens/${item.id}`} className="btn btn-custome">View Run</Link>
//                   </>
//                 ) : (
//                   <>
//                     <h5><span style={{ color: "#db3206", fontSize: "18px" }}>User:</span> {item.username || item.email}</h5>
//                     <p><strong>Race registration category:</strong> {item.runCategory || "not registered"}</p>
//                     <Link to={`/profile/${item.id}`} className="btn btn-custome">View Profile</Link>
//                   </>
//                 )}
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }


import { Link, useLocation } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { db } from "../../../firebase";
import { collection, getDocs } from "firebase/firestore";

import {
  FaRunning,
  FaBicycle,
  FaDumbbell,
  FaUser,
} from "react-icons/fa";

import "./search.scss";

// ==========================================
// HELPERS
// ==========================================

const normalize = (value) =>
  String(value ?? "").trim().toLowerCase();

const getActivityType = (item) => {
  const type = normalize(item.activityType);

  if (type === "cycling" || type === "bike") {
    return "cycling";
  }

  if (type === "workout") {
    return "workout";
  }

  return "running";
};

const ACTIVITY_CONFIG = {
  running: {
    label: "Run",
    button: "View Run",
    defaultTitle: "Untitled Run",
    Icon: FaRunning,
  },
  cycling: {
    label: "Cycling",
    button: "View Ride",
    defaultTitle: "Cycling Ride",
    Icon: FaBicycle,
  },
  workout: {
    label: "Workout",
    button: "View Workout",
    defaultTitle: "Workout Session",
    Icon: FaDumbbell,
  },
};

const formatDuration = (minutes) => {
  if (minutes === null || minutes === undefined || minutes === "") {
    return "—";
  }

  const value = Number(minutes);

  if (!Number.isFinite(value) || value < 0) {
    return "—";
  }

  const totalSeconds = Math.floor(value * 60);
  const hours = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  return [hours, mins, secs]
    .map((number) => String(number).padStart(2, "0"))
    .join(":");
};

const formatDistance = (value) => {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  const number = Number(value);

  return Number.isFinite(number)
    ? `${number.toFixed(2)} km`
    : "—";
};

// ==========================================
// SEARCH RESULTS
// ==========================================

export default function SearchResults() {
  const location = useLocation();

  const query = useMemo(() => {
    return new URLSearchParams(location.search)
      .get("query")
      ?.trim() || "";
  }, [location.search]);

  const normalizedQuery = normalize(query);

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ==========================================
  // FETCH SEARCH RESULTS
  // ==========================================

  useEffect(() => {
    let active = true;

    if (!normalizedQuery) {
      setResults([]);
      setLoading(false);
      setError("");
      return;
    }

    const fetchResults = async () => {
      setLoading(true);
      setResults([]);
      setError("");

      try {
        const [routesSnap, usersSnap] = await Promise.all([
          getDocs(collection(db, "routes")),
          getDocs(collection(db, "users")),
        ]);

        if (!active) return;

        // ==================================
        // RUNNING / CYCLING / WORKOUT
        // ==================================

        const routeResults = routesSnap.docs
          .map((snapshot) => ({
            ...snapshot.data(),
            id: snapshot.id,
            type: "route",
          }))
          .filter((item) => {
            const activityType = getActivityType(item);

            const config = ACTIVITY_CONFIG[activityType];

            const searchableFields = [
              item.title,
              item.locationName,
              item.notes,
              item.workoutType,
              item.workoutTypeLabel,
              item.trainingType,
              item.intensity,
              item.username,
              config.label,
              activityType,
            ];

            return searchableFields.some((field) =>
              normalize(field).includes(normalizedQuery)
            );
          });

        // ==================================
        // USERS
        // ==================================

        const userResults = usersSnap.docs
          .map((snapshot) => ({
            ...snapshot.data(),
            id: snapshot.id,
            type: "user",
          }))
          .filter((item) => {
            return [
              item.username,
              item.email,
            ].some((field) =>
              normalize(field).includes(normalizedQuery)
            );
          });

        setResults([...routeResults, ...userResults]);
      } catch (err) {
        console.error("Search error:", err);

        if (active) {
          setError("Unable to load search results.");
          setResults([]);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchResults();

    return () => {
      active = false;
    };
  }, [normalizedQuery]);

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="text-white search-loading">
        Searching...
      </div>
    );
  }

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="search-results text-white container">

      <h3>
        {query
          ? <>Search results for: “{query}”</>
          : "Search FiTrack"}
      </h3>

      {!query ? (
        <p>
          Enter a name, activity title, location, or workout type.
        </p>
      ) : error ? (
        <p>{error}</p>
      ) : results.length === 0 ? (
        <p>No results found.</p>
      ) : (
       <div className="search-results-grid">

          {results.map((item) => {
            // ==================================
            // ACTIVITY CARD
            // ==================================

            if (item.type === "route") {
              const activityType = getActivityType(item);

              const config =
                ACTIVITY_CONFIG[activityType];

              const ActivityIcon = config.Icon;

              return (
                <div
                  key={`route-${item.id}`}
                  className="search-results-grid-item"
                >
                  <div className="search-card p-3 rounded border">

                    <h5 className="search-card-title">
                      <span className="search-type-label">
                        <ActivityIcon />
                        {config.label}
                      </span>

                      {item.title || config.defaultTitle}
                    </h5>

                    <div className="search-card-meta">

                      {/* RUNNING */}

                      {activityType === "running" && (
                        <>
                          <p>
                            <strong>Distance:</strong>{" "}
                            {formatDistance(item.distance)}
                          </p>

                          <p>
                            <strong>Location:</strong>{" "}
                            {item.locationName || "—"}
                          </p>
                        </>
                      )}

                      {/* CYCLING */}

                      {activityType === "cycling" && (
                        <>
                          <p>
                            <strong>Distance:</strong>{" "}
                            {formatDistance(item.distance)}
                          </p>

                          <p>
                            <strong>Duration:</strong>{" "}
                            {formatDuration(item.duration)}
                          </p>

                          <p>
                            <strong>Location:</strong>{" "}
                            {item.locationName || "—"}
                          </p>
                        </>
                      )}

                      {/* WORKOUT */}

                      {activityType === "workout" && (
                        <>
                          <p>
                            <strong>Workout:</strong>{" "}
                            {item.workoutTypeLabel ||
                              item.workoutType ||
                              item.trainingType ||
                              "Workout"}
                          </p>

                          <p>
                            <strong>Duration:</strong>{" "}
                            {formatDuration(item.duration)}
                          </p>

                          {(item.intensityLabel || item.intensity) && (
                            <p>
                              <strong>Intensity:</strong>{" "}
                              {item.intensityLabel || item.intensity}
                            </p>
                          )}
                        </>
                      )}

                    </div>

                    <Link
                      to={`/lens/${item.id}`}
                      className="btn btn-custome"
                    >
                      {config.button}
                    </Link>

                  </div>
                </div>
              );
            }

            // ==================================
            // USER CARD
            // ==================================

            return (
              <div
                key={`user-${item.id}`}
                className="search-results-grid-item"
              >
                <div className="search-card p-3 rounded border">

                  <h5 className="search-card-title">
                    <span className="search-type-label">
                      <FaUser />
                      User
                    </span>

                    {item.username || item.email || "Unknown"}
                  </h5>

                  <div className="search-card-meta">
                    <p>
                      <strong>Race registration category:</strong>{" "}
                      {item.runCategory || "not registered"}
                    </p>
                  </div>

                  <Link
                    to={`/profile/${item.id}`}
                    className="btn btn-custome"
                  >
                    View Profile
                  </Link>

                </div>
              </div>
            );
          })}

        </div>
      )}

    </div>
  );
}
