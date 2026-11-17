import { useState } from "react";

import { doc, updateDoc } from "firebase/firestore";

import { db } from "../../../firebase";

import { toast } from "react-toastify";

const EditRaceModal = ({ race, close }) => {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: race.title || "",

    description: race.description || "",

    date: race.date || "",

    location: race.location || "",

    distance: race.distance || "",

    difficulty: race.difficulty || "Easy",

    surface: race.surface || "Road",

    maxParticipants: race.maxParticipants || 100,

    gender: race.gender || "All",

    minAge: race.minAge || "",
    maxAge: race.maxAge || "",

    category: race.category || "",

    rules: race.rules || "",
  });

  const changeHandler = (e) => {
    setForm({
      ...form,

      [e.target.name]: e.target.value,
    });
  };

  const updateRace = async () => {
    try {
      if (
        !form.title.trim() ||
        !form.description.trim() ||
        !form.date ||
        !form.location.trim() ||
        !form.distance ||
        !form.maxParticipants ||
        !form.gender ||
        !form.minAge ||
        !form.maxAge ||
        !form.category.trim() ||
        !form.rules.trim()
      ) {
        toast.error("Please fill in all required fields.");
        return;
      }

      if (Number(form.maxParticipants) <= 0) {
        toast.error("Maximum participants must be greater than 0.");
        return;
      }

      if (!/^\d+(\.\d+)?$/.test(form.distance)) {
        toast.error("Distance must contain numbers only.");
        return;
      }

      if (
        Number(form.minAge) < 1 ||
        Number(form.maxAge) > 120
      ) {
        toast.error("Age must be between 1 and 120.");
        return;
      }

      if (Number(form.minAge) > Number(form.maxAge)) {
        toast.error("Minimum age cannot be greater than maximum age.");
        return;
      }
      setLoading(true);

      const raceRef = doc(db, "races", race.id);

      await updateDoc(raceRef, {
        ...form,

        maxParticipants: Number(form.maxParticipants),
      });

      toast.success("Race updated");

      close();
    } catch (err) {
      console.error(err);

      toast.error("Update error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="popup-overlay-race">
      <div className="popup-content-race bg-dark text-white p-4 rounded">
        <h3>Edit Race</h3>

        <div className="mb-3">
          <label>Race name</label>

          <input
            className="form-control"
            name="title"
            value={form.title}
            onChange={changeHandler}
          />
        </div>

        <div className="mb-3">
          <label>Description</label>

          <textarea
            className="form-control"
            name="description"
            value={form.description}
            onChange={changeHandler}
          />
        </div>

        <div className="row">
          <div className="col">
            <label>Date</label>

            <input
              type="date"
              className="form-control"
              name="date"
              value={form.date}
              onChange={changeHandler}
            />
          </div>

          <div className="col">
            <label>Location</label>

            <input
              className="form-control"
              name="location"
              value={form.location}
              onChange={changeHandler}
            />
          </div>
        </div>

        <div className="row mt-3">
          <div className="col">
            <label>Distance</label>

            <input
              type="number"
              min="0"
              step="0.1"
              className="form-control"
              name="distance"
              value={form.distance}
              onChange={changeHandler}
              required
            />
          </div>

          <div className="col">
            <label>Max participants</label>

            <input
              type="number"
              min="1"
              className="form-control"
              name="maxParticipants"
              value={form.maxParticipants}
              onChange={changeHandler}
              required
            />
          </div>
        </div>

        <div className="row mt-3">
          <div className="col">
            <label>Difficulty</label>

            <select
              className="form-select"
              name="difficulty"
              value={form.difficulty}
              onChange={changeHandler}>
              <option>Easy</option>

              <option>Medium</option>

              <option>Hard</option>
            </select>
          </div>

          <div className="col">
            <label>Surface</label>

            <select
              className="form-select"
              name="surface"
              value={form.surface}
              onChange={changeHandler}>
              <option>Road</option>

              <option>Trail</option>

              <option>Track</option>
            </select>
          </div>
        </div>

        <div className="row mt-3">
          <div className="col">
            <label>Gender</label>

            <select
              className="form-select"
              name="gender"
              value={form.gender}
              onChange={changeHandler}>
              <option>All</option>

              <option>Men</option>

              <option>Women</option>
            </select>
          </div>

          <div className="col">
          <label>Age</label>

          <div className="d-flex gap-2">

            <input
              type="number"
              min="1"
              max="120"
              className="form-control"
              name="minAge"
              placeholder="From"
              value={form.minAge}
              onChange={changeHandler}
              required
            />

            <input
              type="number"
              min="1"
              max="120"
              className="form-control"
              name="maxAge"
              placeholder="To"
              value={form.maxAge}
              onChange={changeHandler}
              required
            />

          </div>
        </div>
        </div>

        <div className="mb-3 mt-3">
          <label>Category</label>

          <input
            className="form-control"
            name="category"
            value={form.category}
            onChange={changeHandler}
          />
        </div>

        <div className="mb-3">
          <label>Rules</label>

          <textarea
            className="form-control"
            name="rules"
            value={form.rules}
            onChange={changeHandler}
          />
        </div>

        <div className="d-flex gap-2">
          <button
            className="btn btn-custome"
            disabled={loading}
            onClick={updateRace}>
            {loading ? "Saving..." : "Save"}
          </button>

          <button className="btn btn-secondary" onClick={close}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditRaceModal;
