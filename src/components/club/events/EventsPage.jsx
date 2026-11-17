import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";

import { db } from "../../../firebase";
import { useAuth } from "../../account/AuthContext";

import EventCard from "./EventCard";
import AdminEventForm from "./AdminEventForm";

import "./events.scss";

export default function EventsPage() {
  const { user } = useAuth();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.isAdmin === true;

  useEffect(() => {
    const eventsRef = collection(db, "clubEvents");

    const eventsQuery = query(
      eventsRef,
      where("published", "==", true),
      orderBy("createdAt", "desc"),
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

  return (
    <main className="events-page">
      <div className="events-page__container">
        {isAdmin && <AdminEventForm />}

        <section className="events-list-section">
          {loading ? (
            <div className="events-state">Loading events...</div>
          ) : events.length === 0 ? (
            <div className="events-state">No events found.</div>
          ) : (
            <div className="events-grid">
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
