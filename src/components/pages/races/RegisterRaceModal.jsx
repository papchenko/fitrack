import { useState } from "react";
import { createPortal } from "react-dom";

import { useAuth } from "../../account/AuthContext";

import { toast } from "react-toastify";

import { registerForRace } from "./raceService";

import {
  FaRunning,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaUsers,
  FaCheckCircle,
  FaShieldAlt,
  FaTimes,
} from "react-icons/fa";

import "./registerracemodal.scss";

const RegisterRaceModal = ({ race, close }) => {
  const { user } = useAuth();

  const [category, setCategory] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  const register = async () => {
    if (!user) {
      toast.error("Please login first");
      return;
    }

    const premium = user?.premiumPackage;

    const hasPremium =
      premium?.active &&
      ["Basic", "Advanced", "Pro"].includes(premium.title) &&
      new Date(premium.expiresAt) > new Date();

    if (!hasPremium) {
      toast.error(
        "A Basic membership or higher is required to participate in races.",
      );
      return;
    }

    if (!category) {
      toast.error("Choose category");
      return;
    }

    if (!agreed) {
      toast.error("Accept race rules");
      return;
    }

    try {
      setLoading(true);

      await registerForRace({
        race,
        user,
        category,
      });

      toast.success("Registration completed!");

      close();
    } catch (err) {
      console.error(err);

      toast.error(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="register-race-overlay">
      <div className="register-race-modal">

        {/* HEADER */}

        <div className="register-race-header">

          <div className="register-race-header-icon">
            <FaRunning />
          </div>

          <div className="register-race-header-text">
            <span>JOIN RACE</span>

            <h3>{race.title}</h3>
          </div>

          <button
            type="button"
            className="register-race-close"
            onClick={close}
            disabled={loading}
            aria-label="Close"
          >
            <FaTimes />
          </button>

        </div>

        {/* RACE SUMMARY */}

        <div className="register-race-summary">

          <div className="register-race-summary-item">
            <FaCalendarAlt />

            <div>
              <span>Date</span>

              <strong>
                {race.date
                  ? new Date(race.date).toLocaleString("en-GB", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "Not planned"}
              </strong>
            </div>
          </div>

          <div className="register-race-summary-item">
            <FaMapMarkerAlt />

            <div>
              <span>Location</span>

              <strong>
                {race.location || "Not specified"}
              </strong>
            </div>
          </div>

          <div className="register-race-summary-item">
            <FaRunning />

            <div>
              <span>Distance</span>

              <strong>
                {race.distance || "—"} km
              </strong>
            </div>
          </div>

          <div className="register-race-summary-item">
            <FaUsers />

            <div>
              <span>Participants</span>

              <strong>
                {race.participantsCount || 0}
                {race.maxParticipants
                  ? ` / ${race.maxParticipants}`
                  : ""}
              </strong>
            </div>
          </div>

        </div>

        {/* RULES */}

        <div className="register-race-section">

          <div className="register-race-section-title">
            <FaShieldAlt />

            <h4>Race Rules</h4>
          </div>

          <div className="register-race-rules">
            {race.rules || "No special rules"}
          </div>

        </div>

        {/* CATEGORY */}

        <div className="register-race-section">

          <label className="register-race-label">
            Choose your category
          </label>

          <select
            className="register-race-select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={loading}
          >
            <option value="">
              Select category...
            </option>

            <option value="Men">
              Men
            </option>

            <option value="Women">
              Women
            </option>

            <option value="Junior">
              Junior
            </option>
          </select>

        </div>

        {/* AGREEMENT */}

        <label className="register-race-agreement">

          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            disabled={loading}
          />

          <span className="register-race-checkbox">
            <FaCheckCircle />
          </span>

          <span className="register-race-agreement-text">
            I agree with the race rules and participation
            requirements.
          </span>

        </label>

        {/* ACTIONS */}

        <div className="register-race-actions">

          <button
            type="button"
            className="register-race-cancel"
            onClick={close}
            disabled={loading}
          >
            Cancel
          </button>

          <button
            type="button"
            className="register-race-confirm"
            disabled={loading}
            onClick={register}
          >
            {loading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm"
                  role="status"
                  aria-hidden="true"
                />

                Joining...
              </>
            ) : (
              <>
                <FaRunning />

                Join Race
              </>
            )}
          </button>

        </div>

        <div className="register-race-footer">
          You will receive your race ticket after registration.
        </div>

      </div>
    </div>,
    document.body
  );
};

export default RegisterRaceModal;