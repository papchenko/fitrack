import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

// import EventInterestButton from "./EventInterestButton";
import EventShareButton from "./EventShareButton";

export default function EventCard({ event }) {
  const [currentEvent, setCurrentEvent] = useState(event);

  useEffect(() => {
    setCurrentEvent(event);
  }, [event]);

  //   const handleCountChange = (updatedData) => {
  //     setCurrentEvent((prev) => ({
  //       ...prev,
  //       ...updatedData,
  //     }));
  //   };

  return (
    <article className="event-card">
      <Link to={`/club/events/${currentEvent.id}`} className="event-card__link">
        <div className="event-card__body">
          <span className="event-card__label">FiTrack EVENT</span>

          <h3 className="event-card__title">{currentEvent.title}</h3>

          {currentEvent.subtitle && (
            <p className="event-card__subtitle">{currentEvent.subtitle}</p>
          )}

          {currentEvent.description && (
            <p className="event-card__description">
              {currentEvent.description}
            </p>
          )}

          <div className="event-card__footer">
            <span>{currentEvent.authorName || "FiTrack Team"}</span>

            <span>
              {currentEvent.createdAt?.toDate
                ? currentEvent.createdAt.toDate().toLocaleDateString()
                : ""}
            </span>
          </div>
        </div>
      </Link>

      <div className="event-card__actions">
        {/* <EventInterestButton
          event={currentEvent}
          onCountChange={handleCountChange}
        /> */}

        <EventShareButton event={currentEvent} />
      </div>
    </article>
  );
}
