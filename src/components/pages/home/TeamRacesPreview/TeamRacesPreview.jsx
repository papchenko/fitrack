import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";

import { toast } from "react-toastify";

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
  FaPeopleGroup,
} from "react-icons/fa6";

import { db } from "../../../../firebase";
import { useAuth } from "../../../account/AuthContext";

import RegisterRaceModal from "../../races/RegisterRaceModal";

import "./teamracespreview.scss";

const TeamRacesPreview = () => {
  const { user } = useAuth();

  const [races, setRaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRace, setSelectedRace] = useState(null);
  const navigate = useNavigate();

  // Active image for each race
  const [activeImages, setActiveImages] = useState({});

  useEffect(() => {
    const racesRef = collection(db, "races");

    const q = query(
      racesRef,
      where("type", "==", "Team Race"),
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .sort(
            (a, b) =>
              Number(b.createdAt || 0) -
              Number(a.createdAt || 0),
          )
          .slice(0, 3);

        setRaces(data);
        setLoading(false);

        console.log("Team Races loaded:", data);
      },
      (error) => {
        console.error(
          "Loading latest Team Races error:",
          error,
        );

        setRaces([]);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  const handleJoin = (race) => {
    if (!user) {
      toast.error("Please login to join a race.");
      return;
    }

    setSelectedRace(race);
  };

  const getActiveImageIndex = (raceId) => {
    return activeImages[raceId] || 0;
  };

  const nextImage = (raceId, imagesLength) => {
    setActiveImages((prev) => {
      const current = prev[raceId] || 0;

      return {
        ...prev,
        [raceId]:
          current + 1 >= imagesLength
            ? 0
            : current + 1,
      };
    });
  };

  const previousImage = (raceId, imagesLength) => {
    setActiveImages((prev) => {
      const current = prev[raceId] || 0;

      return {
        ...prev,
        [raceId]:
          current - 1 < 0
            ? imagesLength - 1
            : current - 1,
      };
    });
  };

  const formatDate = (date) => {
    if (!date) {
      return "Not planned";
    }

    try {
      const parsedDate =
        date?.toDate?.() ||
        new Date(date);

      if (Number.isNaN(parsedDate.getTime())) {
        return "Not planned";
      }

      return parsedDate.toLocaleString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Not planned";
    }
  };

  const formatDistance = (distance) => {
    if (
      distance === undefined ||
      distance === null ||
      distance === ""
    ) {
      return "—";
    }

    return String(distance).toLowerCase().includes("km")
      ? distance
      : `${distance} km`;
  };

  const getParticipantsCount = (race) => {
    if (typeof race.participantsCount === "number") {
      return race.participantsCount;
    }

    return Array.isArray(race.participants)
      ? race.participants.length
      : 0;
  };

  return (
    <section className="team-races-preview sections-team-home">
      <div className="container">

        <div className="section-title team-races-preview-header text-center">
          {/* <p>Team Races</p> */}

          <h2>
            Run together. Compete together.
          </h2>

          <span>
            Discover the latest team races and
            find your next challenge.
          </span>
        </div>

        {!user ? (
          <div className="team-races-login">
            <div className="team-races-login-icon">
              <FaPeopleGroup />
            </div>

            <div className="team-races-login-content">
              <h3>Join the Team Race community</h3>

              <p>
                Sign in to your account or create one to
                discover team races, join challenges and
                compete with runners.
              </p>

              {/* <div className="team-races-login-actions">
                <button
                  type="button"
                  className="btn btn-custome text-white rounded-5 px-4 py-2"
                  onClick={() => {
                    window.location.href = "/login";
                  }}
                >
                  Log In
                </button>

                <button
                  type="button"
                  className="team-races-register-btn"
                  onClick={() => {
                    window.location.href = "/register";
                  }}
                >
                  Create Account
                </button>
              </div> */}
            </div>
          </div>
        ) : loading ? (
          <div className="team-races-preview-loading">
            <div
              className="spinner-border"
              role="status"
            />

            <span>
              Loading races...
            </span>
          </div>
        ) : races.length === 0 ? (
          <div className="team-races-empty">
            <div className="team-races-empty-icon">
              <FaRunning />
            </div>

            <h3>
              No Team Races yet
            </h3>

            <p>
              There are no team races available
              yet. Be the first to create one!
            </p>
            <button
            className="btn btn-custome text-white rounded-5 px-5 py-2 mt-4 fs-6 fw-semibold"
            onClick={() =>
              navigate("/races")
            }
          >
            Team Runs
          </button>
          </div>
        ) : (
          <div className="team-races-grid">
            {races.map((race) => {
              const images = Array.isArray(race.imageUrls)
                ? race.imageUrls.filter(Boolean)
                : [];

              const activeIndex =
                getActiveImageIndex(race.id);

              const hasMultipleImages =
                images.length > 1;

              return (
                <article
                  className="team-race-preview-card"
                  key={race.id}
                >

                  {/* RACE IMAGE */}
                  {images.length > 0 && (
                    <div className="team-race-preview-image">

                      <img
                        src={images[activeIndex]}
                        alt={`${race.title} ${activeIndex + 1}`}
                      />

                      {hasMultipleImages && (
                        <>
                          <button
                            type="button"
                            className="team-race-image-nav team-race-image-prev"
                            onClick={() =>
                              previousImage(
                                race.id,
                                images.length,
                              )
                            }
                            aria-label="Previous image"
                          >
                            <FaChevronLeft />
                          </button>

                          <button
                            type="button"
                            className="team-race-image-nav team-race-image-next"
                            onClick={() =>
                              nextImage(
                                race.id,
                                images.length,
                              )
                            }
                            aria-label="Next image"
                          >
                            <FaChevronRight />
                          </button>

                          <div className="team-race-image-counter">
                            {activeIndex + 1} / {images.length}
                          </div>

                          <div className="team-race-image-dots">
                            {images.map((_, index) => (
                              <button
                                key={index}
                                type="button"
                                className={
                                  index === activeIndex
                                    ? "active"
                                    : ""
                                }
                                onClick={() =>
                                  setActiveImages((prev) => ({
                                    ...prev,
                                    [race.id]: index,
                                  }))
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

                  <div className="team-race-preview-content">

                    <div className="team-race-preview-badge">
                      Team Race
                    </div>

                    <h3>
                      {race.title}
                    </h3>

                    {race.description && (
                      <p className="team-race-description">
                        {race.description}
                      </p>
                    )}

                    <div className="team-race-info">

                      <div className="team-race-info-item">
                        <FaCalendarAlt />

                        <div>
                          <span>Date</span>

                          <strong>
                            {formatDate(race.date)}
                          </strong>
                        </div>
                      </div>

                      <div className="team-race-info-item">
                        <FaLocationDot />

                        <div>
                          <span>Location</span>

                          <strong>
                            {race.location ||
                              "Not specified"}
                          </strong>
                        </div>
                      </div>

                      <div className="team-race-info-item">
                        <FaRunning />

                        <div>
                          <span>Distance</span>

                          <strong>
                            {formatDistance(
                              race.distance,
                            )}
                          </strong>
                        </div>
                      </div>

                      <div className="team-race-info-item">
                        <FaFireAlt />

                        <div>
                          <span>Difficulty</span>

                          <strong>
                            {race.difficulty ||
                              "Not specified"}
                          </strong>
                        </div>
                      </div>

                      <div className="team-race-info-item">
                        <FaEarthEurope />

                        <div>
                          <span>Surface</span>

                          <strong>
                            {race.surface ||
                              "Not specified"}
                          </strong>
                        </div>
                      </div>

                      <div className="team-race-info-item">
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

                    <div className="team-race-preview-footer">

                      <div className="team-race-participants">
                        <span>
                          Participants
                        </span>

                        <strong>
                          {getParticipantsCount(race)}

                          {race.maxParticipants
                            ? ` / ${race.maxParticipants}`
                            : ""}
                        </strong>
                      </div>

                      <div className="team-race-organizer">
                        <span>
                          Organizer
                        </span>

                        <strong>
                          {race.organizerName ||
                            "Unknown"}
                        </strong>
                      </div>

                    </div>

                    <button
                      type="button"
                      className="btn btn-custome team-race-join-btn"
                      onClick={() =>
                        handleJoin(race)
                      }
                      disabled={
                        race.maxParticipants &&
                        getParticipantsCount(race) >=
                          race.maxParticipants
                      }
                    >
                      {race.maxParticipants &&
                      getParticipantsCount(race) >=
                        race.maxParticipants
                        ? "Race Full"
                        : "Join Race"}
                    </button>

                  </div>
                </article>
              );
            })}
          </div>
        )}

        {races.length > 0 && (
          <div className="team-races-preview-footer">
            <button
              type="button"
              className="btn btn-custome text-white rounded-5 px-5 py-2 fs-6 fw-semibold"
              onClick={() => {
                window.location.href = "/races";
              }}
            >
              View All Races
            </button>
          </div>
        )}

      </div>

      {selectedRace && (
        <RegisterRaceModal
          race={selectedRace}
          close={() => setSelectedRace(null)}
        />
      )}
    </section>
  );
};

export default TeamRacesPreview;