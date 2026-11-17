import { useEffect, useState } from "react";
import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";

import { db } from "../../../firebase";

import EventCard from "./EventCard";

export default function EventsSection() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const eventsRef = collection(db, "clubEvents");

    const eventsQuery = query(
      eventsRef,
      where("published", "==", true),
      orderBy("createdAt", "desc"),
      limit(3),
    );

    const unsubscribe = onSnapshot(
      eventsQuery,
      (snapshot) => {
        const eventsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setEvents(eventsData);
        setLoading(false);
      },
      (error) => {
        console.error("Failed to load events:", error);

        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <section className="club-events-section">
        <div className="events-state">Loading events...</div>
      </section>
    );
  }

  if (events.length === 0) {
    return (
      <section className="club-events-section">
        <div className="events-state">No events yet.</div>
      </section>
    );
  }

  return (
    <section className="club-events-section">
      <div className="club-events-section__header">
        <div>
          <span className="club-section-label">Community</span>

          <h2>Recrun Events</h2>

          <p>
            Join community meetups, training sessions and other running events.
          </p>
        </div>

        <a href="/club/events" className="club-section-link">
          View all events →
        </a>
      </div>

      <div className="events-grid">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </section>
  );
}
