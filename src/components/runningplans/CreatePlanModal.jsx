import { useState } from "react";
import { useAuth } from "../account/AuthContext";
import { toast } from "react-toastify";
import { createRunningPlan, getActivePlan } from "./runningPlanService";
import { generatePlan } from "./planGenerator";
import { canAccessRunningPlans } from "../account/premiumAccess";

import "./CreatePlanModal.scss";

const CreatePlanModal = ({ close, onCreated }) => {
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    goal: "10K",
    level: "Beginner",
    daysPerWeek: "3",
    raceDate: "",
  });

  const changeHandler = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const workoutId = () =>
    Date.now().toString() + Math.random().toString(36).slice(2, 9);

  const createPlan = async () => {
    if (!user) {
      toast.error("Login required");
      return;
    }
    if (!canAccessRunningPlans(user.premiumPackage)) {
    toast.error("An active Premium membership is required.");
    close();
    return;
}

    if (!form.raceDate) {
      toast.error("Please select a race date");
      return;
    }

    try {
      setLoading(true);

      const activePlan = await getActivePlan(user.uid);

      if (activePlan) {
        toast.error("Finish your current running plan first.");
        return;
      }

      await createRunningPlan({
        userId: user.uid,
        goal: form.goal,
        level: form.level,
        daysPerWeek: Number(form.daysPerWeek),
        raceDate: form.raceDate,

        currentWeek: 1,
        status: "active",

        weeks: generatePlan(
          form.goal,
          form.level,
          Number(form.daysPerWeek),
          form.raceDate,
        ),
      });

      toast.success("Running plan created!");

      onCreated?.();
      close();
    } catch (err) {
      console.error(err);
      toast.error("Failed to create plan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="plan-modal-overlay" onClick={close}>
      <div className="plan-modal" onClick={(e) => e.stopPropagation()}>
        <button className="plan-modal-close" onClick={close}>
          ×
        </button>

        <h2>Create Running Plan</h2>

        <p className="plan-modal-subtitle">
          Build your personal running plan and achieve your next goal.
        </p>

        <div className="mb-3">
          <label className="form-label">Goal</label>

          <select
            className="form-select"
            name="goal"
            value={form.goal}
            onChange={changeHandler}>
            <option value="5K">5K</option>
            <option value="10K">10K</option>
            <option value="Half Marathon">Half Marathon</option>
            <option value="Marathon">Marathon</option>
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label">Level</label>

          <select
            className="form-select"
            name="level"
            value={form.level}
            onChange={changeHandler}>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label">Training days per week</label>

          <select
            className="form-select"
            name="daysPerWeek"
            value={form.daysPerWeek}
            onChange={changeHandler}>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
            <option value="6">6</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="form-label">Race date</label>

          <input
            type="date"
            className="form-control"
            name="raceDate"
            value={form.raceDate}
            onChange={changeHandler}
          />
        </div>

        <div className="plan-modal-actions">
          <button
            className="btn btn-custome"
            disabled={loading}
            onClick={createPlan}>
            {loading ? "Generating..." : "Generate Plan"}
          </button>

          <button
            className="btn btn-outline-light"
            disabled={loading}
            onClick={close}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePlanModal;
