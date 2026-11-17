
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { doc, onSnapshot } from "firebase/firestore";
import { Link } from "react-router-dom";
import { FaTimes, FaUsers } from "react-icons/fa";

import { db } from "../../../firebase";

export default function EventParticipantsModal({
  event,
  onClose,
}) {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);

  const interestedUsers = event?.interestedUsers || [];


useEffect(() => {
  const unsubscribers = [];

  const uids = [...new Set(interestedUsers)];

  setLoading(true);
  setParticipants([]);

  if (uids.length === 0) {
    setLoading(false);
    return;
  }

  const participantsMap = new Map();
  const loadedUsers = new Set();

  let active = true;

  uids.forEach((uid) => {
    const userRef = doc(db, "users", uid);

    const unsubscribe = onSnapshot(
      userRef,
      (snapshot) => {
        if (!active) return;

        const data = snapshot.exists()
          ? snapshot.data()
          : {};

        participantsMap.set(uid, {
          uid,
          username:
            data.username ||
            data.name ||
            "FiTrack User",
          avatarUrl: data.avatarUrl || null,
        });

        loadedUsers.add(uid);

        setParticipants(
          uids
            .map((id) => participantsMap.get(id))
            .filter(Boolean)
        );

        if (loadedUsers.size === uids.length) {
          setLoading(false);
        }
      },
      (error) => {
        console.error(
          "Failed to load participant:",
          error
        );

        if (!active) return;

        participantsMap.set(uid, {
          uid,
          username: "Unknown user",
          avatarUrl: null,
        });

        loadedUsers.add(uid);

        setParticipants(
          uids
            .map((id) => participantsMap.get(id))
            .filter(Boolean)
        );

        if (loadedUsers.size === uids.length) {
          setLoading(false);
        }
      }
    );

    unsubscribers.push(unsubscribe);
  });

  return () => {
    active = false;
    unsubscribers.forEach((unsubscribe) =>
      unsubscribe()
    );
  };
}, [event?.id, interestedUsers.join(",")]);


  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [onClose]);

  return createPortal(
    <div
      className="event-participants-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="event-participants-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Event participants"
      >
        <div className="event-participants-modal__header">
          <div className="d-flex gap-2 align-items-center">
            {/* <span className="club-section-label">
              FiTrack COMMUNITY
            </span> */}

            <h2>
              <FaUsers />
              {/* Participants */}
            </h2>

            <p>
              {interestedUsers.length} people joining
            </p>
          </div>

          <button
            type="button"
            className="event-participants-modal__close"
            onClick={onClose}
            aria-label="Close"
          >
            <FaTimes />
          </button>
        </div>

        <div className="event-participants-modal__list">
          {loading ? (
            <p className="event-participants-modal__state">
              Loading participants...
            </p>
          ) : participants.length === 0 ? (
            <p className="event-participants-modal__state">
              No participants yet.
            </p>
          ) : (
            participants.map((participant) => (
              <Link
                key={participant.uid}
                to={`/profile/${participant.uid}`}
                className="event-participant"
                onClick={onClose}
              >
                <div className="event-participant__avatar">
                  {participant.avatarUrl ? (
                    <img
                        src={participant.avatarUrl}
                        alt={participant.username}
                    />
                  ) : (
                    <span>
                      {participant.username
                        .charAt(0)
                        .toUpperCase()}
                    </span>
                  )}
                </div>

                <div className="event-participant__info">
                  <strong>
                    {participant.username}
                  </strong>

                  <span>FiTrack member</span>
                </div>

                <span className="event-participant__arrow">
                  →
                </span>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
