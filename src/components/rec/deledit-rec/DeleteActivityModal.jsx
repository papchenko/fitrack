
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { doc, runTransaction } from "firebase/firestore";
import { db } from "../../../firebase";
import { toast } from "react-toastify";
import { FaTimes, FaTrashAlt, FaExclamationTriangle } from "react-icons/fa";

export default function DeleteActivityModal({
  activity,
  currentUser,
  onClose,
}) {
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape" && !deleting) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [deleting, onClose]);

  if (!activity) return null;

  const handleDelete = async () => {
    if (deleting) return;

    if (!currentUser?.uid || currentUser.uid !== activity.uid) {
      toast.error("You can only delete your own activities.");
      return;
    }

    setDeleting(true);

    try {
      const activityRef = doc(db, "routes", activity.id);

      await runTransaction(db, async (transaction) => {
        const snapshot = await transaction.get(activityRef);

        if (!snapshot.exists()) {
          throw new Error("Activity not found.");
        }

        if (snapshot.data().uid !== currentUser.uid) {
          throw new Error("You can only delete your own activities.");
        }

        transaction.delete(activityRef);
      });

      toast.success("Activity deleted successfully.");
      onClose();
    } catch (error) {
      console.error("Delete activity error:", error);
      toast.error(error.message || "Could not delete activity.");
    } finally {
      setDeleting(false);
    }
  };

  return createPortal(
    <div
      className="stepslist-delete-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !deleting) {
          onClose();
        }
      }}
    >
      <div
        className="stepslist-delete-modal"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-activity-title"
        aria-describedby="delete-activity-description"
      >
        <button
          type="button"
          className="stepslist-delete-close"
          onClick={onClose}
          disabled={deleting}
          aria-label="Close"
        >
          <FaTimes />
        </button>

        <div className="stepslist-delete-icon">
          <FaExclamationTriangle />
        </div>

        <h3 id="delete-activity-title">Delete activity?</h3>

        <p id="delete-activity-description">
          Are you sure you want to permanently delete
          <strong> {activity.title || "this activity"}</strong>?
        </p>

        <p className="stepslist-delete-warning">
          This action cannot be undone.
        </p>

        <div className="stepslist-delete-actions">
          <button
            type="button"
            className="cancel"
            onClick={onClose}
            disabled={deleting}
          >
            Cancel
          </button>

          <button
            type="button"
            className="delete"
            onClick={handleDelete}
            disabled={deleting}
          >
            <FaTrashAlt />
            {deleting ? "Deleting..." : "Delete activity"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
