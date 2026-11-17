import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaArrowLeft, FaCheck } from "react-icons/fa";

import { useAuth } from "../account/AuthContext";
import { getUserPlans } from "./runningPlanService";
import { canAccessRunningPlans } from "../account/premiumAccess";

const formatCompletedDate = (date) => {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatDuration = (minutes) => {
  if (minutes == null || isNaN(Number(minutes))) {
    return "—";
  }

  const totalSeconds = Math.round(Number(minutes) * 60);

  const hours = Math.floor(totalSeconds / 3600);

  const mins = Math.floor((totalSeconds % 3600) / 60);

  const secs = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(mins).padStart(
      2,
      "0",
    )}:${String(secs).padStart(2, "0")}`;
  }

  return `${mins}:${String(secs).padStart(2, "0")}`;
};

const formatPace = (pace) => {
  if (pace == null || isNaN(Number(pace))) {
    return "—";
  }

  const totalSeconds = Math.round(Number(pace) * 60);

  const minutes = Math.floor(totalSeconds / 60);

  const seconds = totalSeconds % 60;

  return `${minutes}:${String(seconds).padStart(2, "0")} min/km`;
};

const RunningPlanHistory = () => {
  const { planId } = useParams();
  const navigate = useNavigate();

const { user, loading: authLoading } = useAuth();

const [premiumNow, setPremiumNow] = useState(() => Date.now());

useEffect(() => {
    const timer = setInterval(() => {
        setPremiumNow(Date.now());
    }, 15000);

    return () => clearInterval(timer);
}, []);

const hasRunningPlansAccess = canAccessRunningPlans(
    user?.premiumPackage,
    premiumNow
);

  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);


    useEffect(() => {
        let cancelled = false;

        const loadPlan = async () => {
            if (!user?.uid || !hasRunningPlansAccess) {
                setPlan(null);
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setPlan(null);

                const plans = await getUserPlans(user.uid);

                if (cancelled) return;

                const foundPlan = plans.find(
                    (item) => item.id === planId
                );

                setPlan(foundPlan || null);
            } catch (error) {
                if (cancelled) return;

                console.error(
                    "Failed to load running plan history:",
                    error
                );

                setPlan(null);
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        loadPlan();

        return () => {
            cancelled = true;
        };
    }, [user?.uid, planId, hasRunningPlansAccess]);

if (authLoading) {
    return (
        <div className="container py-5 text-white text-center">
            <div className="spinner-border" role="status" />
        </div>
    );
}

if (user && !hasRunningPlansAccess) {
    return (
        <div className="container container-runplan py-5 text-white text-center">
            <h2>Running Plans</h2>
            <p className="text-secondary">
                An active Basic, Advanced or Pro membership is required
                to view your running plan history.
            </p>
            <button
                className="btn btn-custome mt-3"
                onClick={() => navigate("/premium")}
            >
                Explore Premium Plans
            </button>
        </div>
    );
}
  if (!user) {
    return (
      <div className="container py-5 text-white">
        <h3>Login required</h3>

        <p className="text-secondary">
          Please sign in to view running plan history.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container py-5 text-white text-center">
        <div className="spinner-border text-light" role="status" />
      </div>
    );
  }


    if (!plan) {
        return (
            <div className="container container-runplan py-5 text-white">
                <button
                    className="btn btn-outline-light mb-4"
                    onClick={() => navigate("/running-plans")}
                >
                    <FaArrowLeft className="me-2" />
                    Back to Running Plans
                </button>

                <div className="bg-dark rounded p-5 text-center">
                    <h3>Plan not found</h3>

                    <p className="text-secondary mb-0">
                        This running plan could not be found.
                    </p>
                </div>
            </div>
        );
    }

    if (plan.status !== "completed") {
        return (
            <div className="container container-runplan py-5 text-white">
                <button
                    className="btn btn-outline-light mb-4"
                    onClick={() => navigate("/running-plans")}
                >
                    <FaArrowLeft className="me-2" />
                    Back to Running Plans
                </button>

                <div className="bg-dark rounded p-5 text-center">
                    <h3>Plan is not completed yet</h3>

                    <p className="text-secondary mb-0">
                        History becomes available after the running plan
                        is completed.
                    </p>
                </div>
            </div>
        );
    }


  let totalDistance = 0;
  let totalTime = 0;
  let totalWorkouts = 0;

  const historyByWeek =
    plan.weeks?.map((week, weekIndex) => {
      const workouts =
        week.workouts
          ?.map((workout) => {
            if (workout.type === "Intervals" || workout.type === "VO2 Max") {
              return null;
            }

            if (!workout.history || workout.history.length === 0) {
              return null;
            }

            return {
              ...workout,
              history: [...workout.history].sort(
                (a, b) => new Date(b.date) - new Date(a.date),
              ),
            };
          })
          .filter(Boolean) || [];

      workouts.forEach((workout) => {
        totalWorkouts++;

        workout.history.forEach((entry) => {
          if (entry.distance != null) {
            totalDistance += Number(entry.distance);
          }

          if (entry.time != null) {
            totalTime += Number(entry.time);
          }
        });
      });

      return {
        weekNumber: weekIndex + 1,
        workouts,
      };
    }) || [];

  const averagePace = totalDistance > 0 ? totalTime / totalDistance : null;

  return (
    <div className="container container-runplan py-5 text-white">
      <button
        className="btn btn-outline-light mb-4"
        onClick={() => navigate("/running-plans")}>
        <FaArrowLeft className="me-2" />
        Back to Running Plans
      </button>

      <div className="bg-dark rounded p-4 mb-4">
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <h2 className="mb-1">{plan.goal}</h2>

            <p className="text-secondary mb-0">
              {plan.level} • {plan.daysPerWeek} days/week
            </p>
          </div>

          <span className="badge bg-success fs-6">Completed</span>
        </div>

        <div className="text-secondary mt-3">
          Completed {formatCompletedDate(plan.completedAt)}
        </div>
      </div>

      <div className="bg-dark rounded p-4 mb-4">
        <h4 className="mb-3">Plan Summary</h4>

        <div className="row g-3">
          <div className="col-6 col-md-3">
            <div className="bg-black rounded p-3">
              <small className="text-secondary">Distance</small>

              <h4 className="mb-0 mt-1">{totalDistance.toFixed(2)} km</h4>
            </div>
          </div>

          <div className="col-6 col-md-3">
            <div className="bg-black rounded p-3">
              <small className="text-secondary">Workouts</small>

              <h4 className="mb-0 mt-1">{totalWorkouts}</h4>
            </div>
          </div>

          <div className="col-6 col-md-3">
            <div className="bg-black rounded p-3">
              <small className="text-secondary">Total time</small>

              <h4 className="mb-0 mt-1">{formatDuration(totalTime)}</h4>
            </div>
          </div>

          <div className="col-6 col-md-3">
            <div className="bg-black rounded p-3">
              <small className="text-secondary">Average pace</small>

              <h4 className="mb-0 mt-1">{formatPace(averagePace)}</h4>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="mb-4">Workout History</h3>

        {historyByWeek.map((week) => {
          if (week.workouts.length === 0) {
            return null;
          }

          return (
            <div key={week.weekNumber} className="mb-5">
              <h4 className="mb-3">Week {week.weekNumber}</h4>

              <div className="d-flex flex-column gap-3">
                {week.workouts.map((workout) => (
                  <div key={workout.id} className="bg-dark rounded p-4">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div>
                        <h5 className="mb-1">{workout.type}</h5>

                        <div className="text-secondary">{workout.day}</div>
                      </div>

                      <span className="text-success fw-bold">
                        <FaCheck className="me-1" />
                        Completed
                      </span>
                    </div>

                    {workout.history.map((entry, index) => (
                      <div
                        key={`${entry.date}-${index}`}
                        className="bg-black rounded p-3 mb-2">
                        <div className="text-secondary small mb-3">
                          {formatCompletedDate(entry.date)}
                        </div>

                        <div className="row g-3">
                          <div className="col-4">
                            <small className="text-secondary">Distance</small>

                            <div className="fw-bold mt-1">
                              {entry.distance != null
                                ? `${Number(entry.distance).toFixed(2)} km`
                                : "—"}
                            </div>
                          </div>

                          <div className="col-4">
                            <small className="text-secondary">Pace</small>

                            <div className="fw-bold mt-1">
                              {formatPace(entry.pace)}
                            </div>
                          </div>

                          <div className="col-4">
                            <small className="text-secondary">Time</small>

                            <div className="fw-bold mt-1">
                              {formatDuration(entry.time)}
                            </div>
                          </div>
                        </div>

                        <div className="text-secondary small mt-3">
                          {entry.source === "run"
                            ? "Recorded from running activity"
                            : "Completed manually"}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RunningPlanHistory;
