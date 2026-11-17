import { useState } from "react";
import { arrayRemove, arrayUnion, doc, updateDoc } from "firebase/firestore";

import { db } from "../../../firebase";
import { useAuth } from "../../account/AuthContext";
import { FaHeart, FaRegHeart } from "react-icons/fa6";

export default function EventInterestButton({ event, onCountChange }) {
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);

  const interestedUsers = event?.interestedUsers || [];

  const isInterested = user?.uid && interestedUsers.includes(user.uid);

  const interestedCount = interestedUsers.length;

  const handleInterest = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user?.uid || loading) {
      return;
    }

    try {
      setLoading(true);

      const eventRef = doc(db, "clubEvents", event.id);

      if (isInterested) {
        const updatedUsers = interestedUsers.filter((uid) => uid !== user.uid);

        onCountChange?.({
          interestedUsers: updatedUsers,
        });

        await updateDoc(eventRef, {
          interestedUsers: arrayRemove(user.uid),
        });
      } else {
        const updatedUsers = [...interestedUsers, user.uid];

        onCountChange?.({
          interestedUsers: updatedUsers,
        });

        await updateDoc(eventRef, {
          interestedUsers: arrayUnion(user.uid),
        });
      }
    } catch (error) {
      console.error("Failed to update event interest:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      className={`event-interest ${
        isInterested ? "event-interest--active" : ""
      }`}
      onClick={handleInterest}
      disabled={loading}>
      {/* <span className="event-interest__icon">
        {isInterested ? <FaHeart /> : <FaRegHeart />}
      </span> */}

      <span>I’ll be joining</span>

      <span className="event-interest__count">{interestedCount}</span>
    </button>
  );
}
