import { useState } from "react";
import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  doc,
  setDoc,
} from "firebase/firestore";
import { db } from "../../firebase";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import "./admin-announcement.scss";

export default function AdminAnnouncementPanel() {
  // Field name: isAdmin
  // Type: boolean
  // Value: true
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const sendAnnouncement = async () => {
    if (!title.trim() || !message.trim())
      return toast.dark("Fill in all fields");

    setLoading(true);
    try {
      const notifRef = await addDoc(collection(db, "announcements"), {
          title: title.trim(),
          message: message.trim(),
          timestamp: serverTimestamp(),
      });


      const usersSnap = await getDocs(collection(db, "users"));

      const promises = usersSnap.docs.map((userDoc) =>
        setDoc(doc(db, "userAnnouncements", `${userDoc.id}_${notifRef.id}`), {
          userId: userDoc.id,
          announcementId: notifRef.id,
          read: false,
        })
      );

      await Promise.all(promises);

      toast.success("News sent to all existing users!");
      setTitle("");
      setMessage("");
    } catch (err) {
      console.error("Error sending announcement:", err);
      toast.error("Failed to send announcement");
    } finally {
      setLoading(false);
    }
  };


return (
    <section className="admin-announcement-panel">
        <div className="admin-announcement-panel__header">
            <span className="admin-announcement-panel__eyebrow">
                PLATFORM COMMUNICATIONS
            </span>

            <h2>Create announcement</h2>

            <p>
                Send an important update to all existing FiTrack users.
            </p>
        </div>

        <div className="admin-announcement-panel__form">
            <label htmlFor="announcement-title">
                Notification title
            </label>

            <input
                id="announcement-title"
                type="text"
                placeholder="What's new in FiTrack?"
                value={title}
                maxLength={100}
                onChange={(event) => setTitle(event.target.value)}
            />

            <label htmlFor="announcement-message">
                Message
            </label>

            <textarea
                id="announcement-message"
                placeholder="Write your announcement..."
                value={message}
                maxLength={2000}
                onChange={(event) => setMessage(event.target.value)}
            />

            <div className="admin-announcement-panel__counter">
                {message.length} / 2000
            </div>

            <button
                type="button"
                onClick={sendAnnouncement}
                disabled={loading || !title.trim() || !message.trim()}
            >
                {loading ? "Sending announcement..." : "Send announcement"}
            </button>
        </div>
    </section>
);

}