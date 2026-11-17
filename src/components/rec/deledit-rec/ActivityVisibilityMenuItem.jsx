import { useState } from "react";
import { doc, runTransaction } from "firebase/firestore";
import { toast } from "react-toastify";
import { FiGlobe, FiLock } from "react-icons/fi";
import { db } from "../../../firebase";

/** Used inside the author's activity actions menu. */
export default function ActivityVisibilityMenuItem({ activity, currentUser, onClose }) {
    const [updating, setUpdating] = useState(false);
    const isPrivate = activity?.visibility === "private";

    const toggleVisibility = async () => {
        if (updating) return;
        if (!activity?.id || !currentUser?.uid || activity.uid !== currentUser.uid) {
            toast.error("You can only change your own activities.");
            return;
        }

        setUpdating(true);
        try {
            const ref = doc(db, "routes", activity.id);
            let nextVisibility;
            await runTransaction(db, async (transaction) => {
                const snapshot = await transaction.get(ref);
                if (!snapshot.exists() || snapshot.data().uid !== currentUser.uid) {
                    throw new Error("You can only change your own activities.");
                }
                // Use the current server value, not potentially stale feed state.
                nextVisibility = snapshot.data().visibility === "private" ? "public" : "private";
                transaction.update(ref, { visibility: nextVisibility });
            });
            toast.success(nextVisibility === "private" ? "Activity is now private." : "Activity is now public.");
            onClose?.();
        } catch (error) {
            console.error("Visibility update failed:", error);
            toast.error(error.message || "Could not update visibility.");
        } finally {
            setUpdating(false);
        }
    };

    return (
        <button
            type="button"
            role="menuitem"
            className="stepslist-menu-visibility"
            disabled={updating}
            onClick={toggleVisibility}
            aria-label={isPrivate ? "Make activity public" : "Make activity private"}
        >
            {isPrivate ? <FiGlobe aria-hidden="true" /> : <FiLock aria-hidden="true" />}
            <span>{updating ? "Updating..." : isPrivate ? "Make public" : "Make private"}</span>
        </button>
    );
}
