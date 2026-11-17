import { FaCheck, FaArrowLeft } from "react-icons/fa";

const formatCompletedDate = (date) => {
  if (!date) return "";

  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const WorkoutDetails = ({ workout, week, onBack, onComplete }) => {
  if (!workout) return null;

  return (
    <div className="container container-runplan py-5 text-white">
      <button className="btn btn-outline-light mb-4" onClick={onBack}>
        <FaArrowLeft className="me-2" />
        Back to plan
      </button>

      <div className="bg-dark rounded p-4">
        <div className="d-flex justify-content-between align-items-start mb-4">
          <div>
            <p className="text-secondary mb-1">Week {week}</p>

            <h2 className="mb-1">{workout.type}</h2>

            <p className="text-secondary mb-0">{workout.day}</p>
          </div>

          {workout.completed && (
            <span className="badge bg-success fs-6">
              <FaCheck className="me-1" />
              Completed
            </span>
          )}
        </div>

        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <div className="bg-black rounded p-3">
              <small className="text-secondary">Distance</small>

              <h4 className="mb-0 mt-1">{workout.distance}</h4>
            </div>
          </div>

          <div className="col-md-4">
            <div className="bg-black rounded p-3">
              <small className="text-secondary">Expected pace</small>

              <h4 className="mb-0 mt-1">
                {workout.expectedPace || "Not specified"}
              </h4>
            </div>
          </div>

          <div className="col-md-4">
            <div className="bg-black rounded p-3">
              <small className="text-secondary">Training goal</small>

              <h4 className="mb-0 mt-1">
                {workout.trainingGoal || "General training"}
              </h4>
            </div>
          </div>
          <div className="col-md-4">
            <div className="bg-black rounded p-3">
              <small className="text-secondary">Intensity</small>

              <h4 className="mb-0 mt-1">
                {workout.intensity || "Not specified"}
              </h4>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <h4>About this workout</h4>

          <p className="text-secondary">
            {workout.description ||
              "Complete this workout according to your training plan."}
          </p>
        </div>

        <div className="mb-4">
          <h4>Recommendation</h4>

          <p className="text-secondary">
            {workout.recommendation ||
              "Keep the effort controlled and listen to your body."}
          </p>
        </div>

        {workout.completed && workout.completedAt && (
          <div className="alert alert-success">
            <strong>Workout completed</strong>

            <div className="small mt-1">
              {formatCompletedDate(workout.completedAt)}
            </div>
          </div>
        )}

        {!workout.completed &&
          workout.type !== "Intervals" &&
          workout.type !== "VO2 Max" && (
            <button
              className="btn btn-custome"
              onClick={() => onComplete(workout.id)}>
              Mark as completed
            </button>
          )}

        {!workout.completed &&
          (workout.type === "Intervals" || workout.type === "VO2 Max") && (
            <div className="text-secondary">
              Complete manually after workout.
            </div>
          )}
      </div>
    </div>
  );
};

export default WorkoutDetails;
