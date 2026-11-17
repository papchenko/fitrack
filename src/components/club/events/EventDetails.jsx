import { useEffect, useRef, useState } from "react";

import { Link, useParams } from "react-router-dom";

import { doc, increment, onSnapshot, updateDoc } from "firebase/firestore";

import EventInterestButton from "./EventInterestButton";

import { db } from "../../../firebase";


import EventParticipantsModal from "./EventParticipantsModal";
import { FaUsers } from "react-icons/fa6";


export default function EventDetails() {
  const { eventId } = useParams();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
const [showParticipants, setShowParticipants] = useState(false);


  const viewUpdatedRef = useRef(false);

  useEffect(() => {
    if (!eventId) {
      return;
    }

    viewUpdatedRef.current = false;

    const eventRef = doc(db, "clubEvents", eventId);

    const unsubscribe = onSnapshot(
      eventRef,
      async (snapshot) => {
        if (snapshot.exists()) {
          const eventData = {
            id: snapshot.id,
            ...snapshot.data(),
          };

          setEvent(eventData);

          if (!viewUpdatedRef.current) {
            viewUpdatedRef.current = true;

            try {
              await updateDoc(eventRef, {
                views: increment(1),
              });
            } catch (viewError) {
              console.error("Failed to update event views:", viewError);
            }
          }
        } else {
          setEvent(null);
        }

        setLoading(false);
      },
      (error) => {
        console.error("Failed to load event:", error);

        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [eventId]);

  if (loading) {
    return (
      <main className="event-details">
        <div className="event-details__container">
          <div className="events-state">Loading event...</div>
        </div>
      </main>
    );
  }

  if (!event) {
    return (
      <main className="event-details">
        <div className="event-details__container">
          <div className="events-state">Event not found.</div>
        </div>
      </main>
    );
  }

  return (
    <main className="event-details">
      <div className="event-details__container">
        <Link to="/club/events" className="event-details__back">
          ← Back to events
        </Link>

        <article className="event-details__article">
          <span className="event-card__label">FiTrack EVENT</span>

          <h1>{event.title}</h1>

          {event.subtitle && (
            <p className="event-details__subtitle">{event.subtitle}</p>
          )}

          <div className="event-details__meta">
            <span>{event.authorName || "FiTrack Team"}</span>

            <span>
              {event.createdAt?.toDate
                ? event.createdAt.toDate().toLocaleDateString()
                : ""}
            </span>

            <span>{event.views || 0} views</span>
          </div>


<div className="event-details__interest">
  <EventInterestButton
    event={event}
    onCountChange={(updatedData) => {
      setEvent((prev) => ({
        ...prev,
        ...updatedData,
      }));
    }}
  />

  {(event.interestedUsers?.length || 0) > 0 && (
    <button
      type="button"
      className="event-participants-button"
      onClick={() => setShowParticipants(true)}
    >
      <FaUsers />

      <span>Participants</span>

      <span className="event-participants-button__count">
        {event.interestedUsers.length}
      </span>
    </button>
  )}
</div>


          {event.description && (
            <div className="event-details__content">
              <p>{event.description}</p>
            </div>
          )}
        </article>

{showParticipants && (
  <EventParticipantsModal
    event={event}
    onClose={() => setShowParticipants(false)}
  />
)}

      </div>
    </main>
  );
}
