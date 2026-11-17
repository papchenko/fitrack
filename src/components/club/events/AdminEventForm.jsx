import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

import { db } from "../../../firebase";
import { useAuth } from "../../account/AuthContext";

export default function AdminEventForm() {
  const { user } = useAuth();

  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    description: "",
  });

  const [saving, setSaving] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!user?.isAdmin) {
      return;
    }

    if (!form.title.trim()) {
      return;
    }

    try {
      setSaving(true);

      await addDoc(collection(db, "clubEvents"), {
        title: form.title.trim(),

        subtitle: form.subtitle.trim(),

        description: form.description.trim(),

        authorId: user.uid,

        authorName: user.username || "FiTrack Admin",

        published: true,

        interestedUsers: [],

        interestedCount: 0,

        createdAt: serverTimestamp(),

        updatedAt: serverTimestamp(),
      });

      setForm({
        title: "",
        subtitle: "",
        description: "",
      });
    } catch (error) {
      console.error("Failed to create event:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="admin-event-form">
      <div className="admin-event-form__header">
        <h2>Create event</h2>

        <p>Only FiTrack administrators can create community events.</p>
      </div>

      <form className="admin-event-form__form" onSubmit={handleSubmit}>
        <div className="admin-event-form__field">
          <label htmlFor="event-title">Title</label>

          <input
            id="event-title"
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Enter event title"
            required
          />
        </div>

        <div className="admin-event-form__field">
          <label htmlFor="event-subtitle">Subtitle</label>

          <input
            id="event-subtitle"
            type="text"
            name="subtitle"
            value={form.subtitle}
            onChange={handleChange}
            placeholder="Short event subtitle"
          />
        </div>

        <div className="admin-event-form__field">
          <label htmlFor="event-description">Description</label>

          <textarea
            id="event-description"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Describe the event..."
          />
        </div>

        <div className="admin-event-form__actions">
          <button type="submit" disabled={saving || !form.title.trim()}>
            {saving ? "Creating..." : "Create event"}
          </button>
        </div>
      </form>
    </section>
  );
}
