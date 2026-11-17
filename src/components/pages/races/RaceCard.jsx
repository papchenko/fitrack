import { useState } from "react";

import { useAuth } from "../../account/AuthContext";

import RegisterRaceModal from "./RegisterRaceModal";
import RaceParticipants from "./RaceParticipants";
import RaceOwnerActions from "./RaceOwnerActions";

import {
  FaCalendarAlt,
  FaRunning,
  FaFireAlt,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";

import {
  FaLocationDot,
  FaEarthEurope,
  FaPersonBreastfeeding,
} from "react-icons/fa6";

import "./racecard.scss";

const RaceCard = ({ race }) => {
  const { user } = useAuth();

  const [openRegister, setOpenRegister] = useState(false);

  const [participantsCount, setParticipantsCount] = useState(
    race.participantsCount || 0,
  );

  const [activeImage, setActiveImage] = useState(0);

  const images = Array.isArray(race.imageUrls)
    ? race.imageUrls.filter(Boolean)
    : [];

  const hasMultipleImages = images.length > 1;

  const isFull =
    race.maxParticipants &&
    participantsCount >= race.maxParticipants;

  const nextImage = () => {
    setActiveImage((current) =>
      current + 1 >= images.length
        ? 0
        : current + 1,
    );
  };

  const previousImage = () => {
    setActiveImage((current) =>
      current - 1 < 0
        ? images.length - 1
        : current - 1,
    );
  };

  return (
    <article className="race-card">

      {/* =========================
          GALLERY
      ========================= */}

      {images.length > 0 && (
        <div className="race-card-gallery">

          <img
            src={images[activeImage]}
            alt={`${race.title} ${activeImage + 1}`}
          />

          {hasMultipleImages && (
            <>
              {/* PREVIOUS */}

              <button
                type="button"
                className="race-card-image-nav race-card-image-prev"
                onClick={previousImage}
                aria-label="Previous image"
              >
                <FaChevronLeft />
              </button>

              {/* NEXT */}

              <button
                type="button"
                className="race-card-image-nav race-card-image-next"
                onClick={nextImage}
                aria-label="Next image"
              >
                <FaChevronRight />
              </button>

              {/* COUNTER */}

              <div className="race-card-image-counter">
                {activeImage + 1} / {images.length}
              </div>

              {/* DOTS */}

              <div className="race-card-image-dots">
                {images.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    className={
                      index === activeImage
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      setActiveImage(index)
                    }
                    aria-label={`Go to image ${
                      index + 1
                    }`}
                  />
                ))}
              </div>
            </>
          )}

        </div>
      )}

      <div className="race-card-content">

        {/* BADGE */}

        <div className="race-card-badge">
          Team Race
        </div>

        {/* TITLE */}

        <h3 className="race-card-title">
          {race.title}
        </h3>

        {/* DESCRIPTION */}

        <p className="race-card-description">
          {race.description}
        </p>

        {/* INFO */}

        <div className="race-info">

          <div className="race-info-item">
            <FaCalendarAlt />

            <div>
              <span>Date</span>

              <strong>
                {race.date
                  ? new Date(
                      race.date,
                    ).toLocaleString("en-GB", {
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

          <div className="race-info-item">
            <FaLocationDot />

            <div>
              <span>Location</span>

              <strong>
                {race.location || "Not specified"}
              </strong>
            </div>
          </div>

          <div className="race-info-item">
            <FaRunning />

            <div>
              <span>Distance</span>

              <strong>
                {race.distance || "—"}
              </strong>
            </div>
          </div>

          <div className="race-info-item">
            <FaFireAlt />

            <div>
              <span>Difficulty</span>

              <strong>
                {race.difficulty || "Not specified"}
              </strong>
            </div>
          </div>

          <div className="race-info-item">
            <FaEarthEurope />

            <div>
              <span>Surface</span>

              <strong>
                {race.surface || "Not specified"}
              </strong>
            </div>
          </div>

          <div className="race-info-item">
            <FaPersonBreastfeeding />

            <div>
              <span>Age</span>

              <strong>
                {race.minAge !== undefined &&
                race.maxAge !== undefined
                  ? `${race.minAge} - ${race.maxAge} years`
                  : "Open"}
              </strong>
            </div>
          </div>

        </div>

        {/* DIVIDER */}

        <div className="race-card-divider" />

        {/* META */}

        <div className="race-card-meta">

          <div className="race-card-meta-item">
            <span>
              Participants
            </span>

            <strong>
              {participantsCount}
              {race.maxParticipants
                ? `/${race.maxParticipants}`
                : ""}
            </strong>
          </div>

          <div className="race-card-meta-item race-card-organizer">
            <span>
              Organizer
            </span>

            <strong>
              {race.organizerName ||
                "Unknown"}
            </strong>
          </div>

        </div>

        {/* ACTIONS */}

        <div className="race-card-actions">

          {user && !isFull && (
            <button
              type="button"
              className="btn btn-custome race-card-join-btn"
              onClick={() =>
                setOpenRegister(true)
              }
            >
              Join Race
            </button>
          )}

          {!user && (
            <p className="race-card-login">
              Login to participate
            </p>
          )}

          {isFull && (
            <button
              type="button"
              className="btn btn-secondary race-card-full-btn"
              disabled
            >
              Full
            </button>
          )}

        </div>

      </div>

      {/* REGISTER */}

      {openRegister && (
        <RegisterRaceModal
          race={race}
          close={() =>
            setOpenRegister(false)
          }
        />
      )}

      {/* PARTICIPANTS */}

      <RaceParticipants
        race={race}
        onCountChange={setParticipantsCount}
      />

      {/* OWNER ACTIONS */}

      <RaceOwnerActions
        race={race}
      />

    </article>
  );
};

export default RaceCard;