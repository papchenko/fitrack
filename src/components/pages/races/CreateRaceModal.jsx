import { useState } from "react";
import { db } from "../../../firebase";
import { useAuth } from "../../account/AuthContext";

import { collection, addDoc, doc, getDoc, updateDoc } from "firebase/firestore";

import { toast } from "react-toastify";

import './createracemodal.scss'

const CreateRaceModal = ({ close }) => {
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
  title: "",
  description: "",
  date: "",
  location: "",
  distance: "",
  difficulty: "Easy",
  surface: "Road",
  maxParticipants: 100,
  gender: "All",

  minAge: "",
  maxAge: "",

  category: "",
  rules: "",
});
  const changeHandler = (e) => {
    setForm({
      ...form,

      [e.target.name]: e.target.value,
    });
  };

  const createRace = async () => {
    if (!user) {
      toast.error("Login required");
      return;
    }
    if (
      !form.title.trim() ||
      !form.description.trim() ||
      !form.date ||
      !form.location.trim() ||
      !form.distance ||
      !form.maxParticipants ||
      !form.gender ||
      !form.minAge || !form.maxAge ||
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

    try {
      setLoading(true);

      const userRef = doc(db, "users", user.uid);

      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        toast.error("User profile not found");
        return;
      }

      const userData = userSnap.data();

      if (
        userData?.premiumPackage?.active !== true ||
        !["Advanced", "Pro"].includes(userData?.premiumPackage?.title) ||
        new Date(userData.premiumPackage.expiresAt).getTime() < Date.now()
      ) {
        toast.error("Only active Advanced or Pro users can create races");
        return;
      }

      const currentMonth = new Date().toISOString().slice(0, 7);

      let created = userData.raceCreatedThisMonth || 0;

      if (userData.raceCreatedMonth !== currentMonth) {
        created = 0;
      }

      if (created >= 3) {
        toast.error("Maximum 3 races per month");

        return;
      }
      await addDoc(collection(db, "races"), {
        ...form,
        type: "Team Race",
        maxParticipants: Number(form.maxParticipants),
        organizerId: user.uid,
        organizerName: userData.username || user.email,
        organizerAvatar: userData.avatarUrl || "",
        participants: [],
        participantsCount: 0,
        imageUrls: [],
        createdAt: Date.now(),
      });
      await updateDoc(userRef, {
        raceCreatedThisMonth: created + 1,

        raceCreatedMonth: currentMonth,
      });

      toast.success("Race created successfully!");

      close();
    } catch (err) {
      console.error(err);

      toast.error("Error creating race");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="popup-overlay-race">
      <div className="popup-content-race bg-dark text-white p-4 rounded">
        <h4>Create New Race</h4>

        <div className="mb-3">
          <label>Race name</label>

          <input
            className="form-control"
            name="title"
            value={form.title}
            onChange={changeHandler}
            required
          />
        </div>

        <div className="mb-3">
          <label>Description</label>

          <textarea
            className="form-control"
            name="description"
            value={form.description}
            onChange={changeHandler}
            required
          />
        </div>

        <div className="row g-3">
          <div className="col">
            <label>Date</label>

            <input
            type="datetime-local"
            className="form-control"
            name="date"
            value={form.date}
            onChange={changeHandler}
            required
          />
          </div>

          <div className="col">
            <label>Location</label>

            <input
              className="form-control"
              name="location"
              value={form.location}
              onChange={changeHandler}
              required
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
              placeholder="10"
              className="form-control"
              name="distance"
              value={form.distance}
              onChange={changeHandler}
              required
            />
          </div>

          <div className="col">
            <label>Max runners</label>

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
            onClick={createRace}>
            {loading ? "Creating..." : "Create"}
          </button>

          <button className="btn btn-secondary" onClick={close}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateRaceModal;
