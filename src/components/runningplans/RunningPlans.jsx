import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../account/AuthContext";
import { canAccessRunningPlans } from "../account/premiumAccess";
import { getUserPlans } from "./runningPlanService";
import CreatePlanModal from "./CreatePlanModal";
import WorkoutDetails from "./WorkoutDetails";

import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { FaCheck, FaRunning } from "react-icons/fa";

import "./RunningPlans.scss";

const formatCompletedDate = (date) => {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const RunningPlans = () => {
    const { user, loading: authLoading } = useAuth();

    const navigate = useNavigate();

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

  const [plans, setPlans] = useState([]);

  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [selectedWorkoutWeek, setSelectedWorkoutWeek] = useState(null);
  const [selectedPlanId, setSelectedPlanId] = useState(null);

  const openWorkoutDetails = (planId, weekNumber, workout) => {
    setSelectedPlanId(planId);
    setSelectedWorkoutWeek(weekNumber);
    setSelectedWorkout(workout);
  };

  const completeWorkout = async (planId, workoutId) => {
    if (!user?.uid || !hasRunningPlansAccess) return;

    try {
      const plan = plans.find((p) => p.id === planId);

      if (!plan) return;

      const updatedWeeks = plan.weeks.map((week) => ({
        ...week,
        workouts: week.workouts.map((workout) => {
          if (workout.id !== workoutId) {
            return workout;
          }

          const completedAt = new Date().toISOString();

          return {
            ...workout,
            completed: true,
            completedAt,
            history: [
              ...(workout.history || []),
              {
                date: completedAt,
                distance:
                  workout.actualDistance != null
                    ? Number(workout.actualDistance)
                    : Number(workout.targetDistanceKm),
                pace: null,
                time: null,
                source: "manual",
              },
            ],
          };
        }),
      }));

      const currentWeekIndex = plan.currentWeek - 1;

      const currentWeek = updatedWeeks[currentWeekIndex];

      const allCompleted = currentWeek.workouts.every((workout) => {
        if (workout.type === "Intervals" || workout.type === "VO2 Max") {
          return true;
        }

        return workout.completed;
      });

      let nextWeek = plan.currentWeek;
      let status = plan.status;
      let completedAt = null;

      if (allCompleted) {
        if (plan.currentWeek < updatedWeeks.length) {
          nextWeek = plan.currentWeek + 1;
        } else {
          status = "completed";
          completedAt = new Date().toISOString();
        }
      }

      const updateData = {
        weeks: updatedWeeks,
        currentWeek: nextWeek,
        status,
      };

      if (completedAt) {
        updateData.completedAt = completedAt;
      }

      await updateDoc(doc(db, "runningPlans", plan.id), updateData);

      await loadPlans();

      closeWorkoutDetails();
    } catch (err) {
      console.error("Failed to complete workout:", err);
    }
  };

  const closeWorkoutDetails = () => {
    setSelectedWorkout(null);
    setSelectedWorkoutWeek(null);
    setSelectedPlanId(null);
  };

  const loadPlans = async () => {
    if (!user?.uid || !hasRunningPlansAccess) {
        setPlans([]);
        setLoading(false);
        return;
    }

    try {
      setLoading(true);
      const data = await getUserPlans(user.uid);
      setPlans(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

useEffect(() => {
    if (!hasRunningPlansAccess) {
        setOpen(false);
        closeWorkoutDetails();
    }

    loadPlans();
}, [user?.uid, hasRunningPlansAccess]);

const activePlans = plans.filter(
  (plan) => plan.status === "active",
);

const completedPlans = plans.filter(
  (plan) => plan.status === "completed",
);

const hasActivePlan = activePlans.length > 0;
if (authLoading) {
    return (
        <div className="container container-runplan py-5 text-white text-center">
            <div className="spinner-border" role="status" />
        </div>
    );
}

if (user && !hasRunningPlansAccess) {
    return (
        <div className="container container-runplan py-5 text-white text-center">
            <h2>Running Plans</h2>

            <p className="text-secondary mt-3">
                Running Plans is available with an active
                Basic, Advanced or Pro membership.
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
  if (selectedWorkout) {
    return (
      <WorkoutDetails
        workout={selectedWorkout}
        week={selectedWorkoutWeek}
        onBack={closeWorkoutDetails}
        onComplete={(workoutId) => completeWorkout(selectedPlanId, workoutId)}
      />
    );
  }

  if (!user) {
    return (
      <div className="container container-runplan py-5 text-center text-white">
        <h3>Login required</h3>
        <p>Please sign in to use Running Plans.</p>
      </div>
    );
  }
  return (
    <div className="running-plans-page">
      <div className="running-plans-container">
        {/* HEADER */}
        <div className="running-plans-header">
          <div className="running-plans-header-content">
            <div>
              <span className="running-plans-eyebrow">TRAINING</span>

              <h1>Running Plans</h1>

              <p>Create, follow and track your personal training plan.</p>
            </div>

            <button
              className="running-plans-create-btn"
              onClick={() => setOpen(true)}
              disabled={hasActivePlan}
              title={
                hasActivePlan
                  ? "Finish your current running plan before creating a new one."
                  : "Create a new running plan"
              }>
              <span>+</span>
              {hasActivePlan ? "Plan Active" : "Create Plan"}
            </button>
          </div>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="running-plans-loading">
            <div className="spinner-border" role="status" />
            <span>Loading your training plans...</span>
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && plans.length === 0 && (
          <div className="running-plans-empty">
            <div className="running-plans-empty-icon"><FaRunning /></div>

            <h3>No running plans yet</h3>

            <p>
              Create your first training plan and start working toward your next
              running goal.
            </p>

            <button
              className="running-plans-create-btn"
              onClick={() => setOpen(true)}
              disabled={hasActivePlan}>
              <span>+</span>
              Create Your First Plan
            </button>
          </div>
        )}

        {/* ACTIVE PLANS */}
        {!loading && activePlans.length > 0 && (
          <section className="running-plans-section">
            <div className="running-plans-section-header">
              <div>
                <span className="running-plans-eyebrow">CURRENT TRAINING</span>

                <h2>Active Plans</h2>
              </div>

              <span className="running-plans-count">
                {activePlans.length}
                {activePlans.length === 1 ? " plan" : " plans"}
              </span>
            </div>

            <div className="running-plans-grid">
              {activePlans.map((plan) => {
                const currentWeek = plan.weeks?.[plan.currentWeek - 1];

                const relevantWorkouts =
                  currentWeek?.workouts.filter(
                    (w) => w.type !== "Intervals" && w.type !== "VO2 Max",
                  ) || [];

                const completed = relevantWorkouts.filter(
                  (w) => w.completed,
                ).length;

                const total = relevantWorkouts.length;

                const progress = total
                  ? Math.round((completed / total) * 100)
                  : 0;

                return (
                  <article key={plan.id} className="running-plan-card">
                    {/* PLAN TOP */}
                    <div className="running-plan-card-top">
                      <div className="running-plan-title">
                        <span className="running-plan-label">{plan.goal}</span>

                        <h3>{plan.goal}</h3>

                        <p>
                          {plan.level}
                          <span>•</span>
                          {plan.daysPerWeek} days/week
                        </p>
                      </div>

                      <div className="running-plan-week">
                        <span>WEEK</span>
                        <strong>{plan.currentWeek}</strong>
                      </div>
                    </div>

                    {/* PROGRESS */}
                    <div className="running-plan-progress">
                      <div className="running-plan-progress-header">
                        <div>
                          <span>Weekly Progress</span>

                          <strong>
                            {completed} / {total}
                          </strong>
                        </div>

                        <strong className="running-plan-progress-value">
                          {progress}%
                        </strong>
                      </div>

                      <div className="running-plan-progress-track">
                        <div
                          className="running-plan-progress-bar"
                          style={{
                            width: `${progress}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* WORKOUTS */}
                    <div className="running-plan-workouts">
                      <div className="running-plan-workouts-header">
                        <span>This week's workouts</span>

                        <span>{currentWeek?.workouts?.length || 0}</span>
                      </div>

                      {currentWeek?.workouts?.map((workout, index) => {
                        const isSpecialWorkout =
                          workout.type === "Intervals" ||
                          workout.type === "VO2 Max";

                        return (
                          <div
                            key={workout.id || index}
                            className={`running-workout ${
                              workout.completed ? "is-completed" : ""
                            }`}
                            onClick={() =>
                              openWorkoutDetails(
                                plan.id,
                                plan.currentWeek,
                                workout,
                              )
                            }>
                            {/* LEFT */}
                            <div className="running-workout-left">
                              <div className="running-workout-day">
                                <span>{workout.day.slice(0, 3)}</span>
                              </div>

                              <div className="running-workout-info">
                                <strong>{workout.type}</strong>

                                <span>{workout.distance}</span>
                              </div>
                            </div>

                            {/* RIGHT */}
                            <div className="running-workout-right">
                              {workout.completed ? (
                                <div className="running-workout-status completed">
                                  <FaCheck />

                                  <span>Completed</span>

                                  {workout.completedAt && (
                                    <small>
                                      {formatCompletedDate(workout.completedAt)}
                                    </small>
                                  )}
                                </div>
                              ) : isSpecialWorkout ? (
                                <div className="running-workout-manual">
                                  <span>Manual</span>
                                </div>
                              ) : (
                                <button
                                  className="running-workout-complete"
                                  onClick={(e) => {
                                    e.stopPropagation();

                                    completeWorkout(plan.id, workout.id);
                                  }}>
                                  Complete
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {/* COMPLETED PLANS */}
        {!loading && completedPlans.length > 0 && (
          <section className="running-plans-section completed-section">
            <div className="running-plans-section-header">
              <div>
                <span className="running-plans-eyebrow">TRAINING HISTORY</span>

                <h2>Completed Plans</h2>
              </div>

              <span className="running-plans-count success">
                {completedPlans.length}
                {completedPlans.length === 1 ? " plan" : " plans"}
              </span>
            </div>

            <div className="completed-plans-grid">
              {completedPlans.map((plan) => (
                <article key={plan.id} className="completed-plan-card">
                  <div className="completed-plan-icon">
                    <FaCheck />
                  </div>

                  <div className="completed-plan-content">
                    <div className="completed-plan-heading">
                      <div>
                        <span>{plan.level}</span>

                        <h3>{plan.goal}</h3>
                      </div>

                      <div className="completed-badge">Completed</div>
                    </div>

                    <p>
                      {plan.daysPerWeek} days/week
                      <span>•</span>
                      Completed {formatCompletedDate(plan.completedAt)}
                    </p>

                    <button
                      className="completed-history-btn"
                      onClick={() =>
                        navigate(`/running-plans/history/${plan.id}`)
                      }>
                      View Training History
                      <span>→</span>
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* CREATE PLAN MODAL */}
        {open && (
          <CreatePlanModal close={() => setOpen(false)} onCreated={loadPlans} />
        )}
      </div>
    </div>
  );
};

export default RunningPlans;
