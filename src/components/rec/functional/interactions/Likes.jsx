import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { db, auth } from "../../../../firebase";
import { doc, updateDoc, arrayUnion, arrayRemove, onSnapshot } from "firebase/firestore";
import { FaBolt } from "react-icons/fa6";
import { FiX } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import "./likes.scss";

export default function Likes({ routeId, usersData, currentUser }) {
    const [likes, setLikes] = useState([]);
    const [hasLiked, setHasLiked] = useState(false);
    const [showPopup, setShowPopup] = useState(false);

    const navigate = useNavigate();

const openUserProfile = (uid) => {
    if (!uid) return;

    setShowPopup(false);
    navigate(`/profile/${encodeURIComponent(uid)}`);
};

    useEffect(() => {
        if (!routeId) return;

        const unsub = onSnapshot(doc(db, "routes", routeId), (snap) => {
            if (snap.exists()) {
                const data = snap.data();
                const nextLikes = data.likes || [];
                setLikes(nextLikes);
                setHasLiked(nextLikes.some((l) => l.uid === (currentUser?.uid || auth.currentUser?.uid)));
            } else {
                setLikes([]);
                setHasLiked(false);
            }
        });

        return () => unsub();
    }, [routeId, currentUser?.uid]);

    useEffect(() => {
        if (!showPopup) return;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        const handleKeyDown = (event) => {
            if (event.key === "Escape") setShowPopup(false);
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [showPopup]);

    const toggleLike = async () => {
        const user = currentUser || auth.currentUser;
        if (!user?.uid) {
            console.warn("User not logged in");
            return;
        }

        const userData = usersData?.[user.uid] || {};
        const userLike = {
            uid: user.uid,
            username: userData.username || user.displayName || user.email?.split("@")[0] || "Anonymous",
            avatarUrl: userData.avatarUrl || user.photoURL || "https://cdn-icons-png.flaticon.com/512/149/149071.png",
        };

        const docRef = doc(db, "routes", routeId);
        const oldLike = likes.find((l) => l.uid === user.uid);

        if (oldLike) await updateDoc(docRef, { likes: arrayRemove(oldLike) });
        if (!hasLiked) await updateDoc(docRef, { likes: arrayUnion(userLike) });
    };

    const popup = showPopup ? createPortal(
        <div
            className="likes-popup"
            role="presentation"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) setShowPopup(false);
            }}
        >
            <section
                className="likes-popup__panel"
                role="dialog"
                aria-modal="true"
                aria-labelledby="likes-popup-title"
            >
                <div className="likes-popup__header">
                    <div className="likes-popup__heading">
                        <span className="likes-popup__heading-icon" aria-hidden="true">
                            <FaBolt />
                        </span>
                        <div>
                            <h4 id="likes-popup-title">FiTrack-Powers</h4>
                            <p>{likes.length} {likes.length === 1 ? "person" : "people"} powered this activity</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        className="likes-popup__close"
                        onClick={() => setShowPopup(false)}
                        aria-label="Close likes list"
                    >
                        <FiX size={20} />
                    </button>
                </div>

                <div className="likes-popup__list">
                    {likes.map((like, index) => {
                        const latestUser = usersData?.[like.uid] || {};
                        const username = latestUser.username || like.username || "Anonymous";
                        const avatar = latestUser.avatarUrl || like.avatarUrl || "https://cdn-icons-png.flaticon.com/512/149/149071.png";

                        return (
                        
<button
    key={`${like.uid}-${index}`}
    type="button"
    className="likes-popup__user"
    onClick={() => openUserProfile(like.uid)}
    disabled={!like.uid}
    aria-label={`View ${username}'s profile`}
>
    <img
        src={avatar}
        alt=""
        loading="lazy"
        referrerPolicy="no-referrer"
    />

    <span className="likes-popup__username">
        {username}
    </span>

    <FaBolt
        className="likes-popup__user-icon"
        aria-hidden="true"
    />
</button>

                        );
                    })}
                </div>
            </section>
        </div>,
        document.body
    ) : null;

    return (
        <div className="likes-wrapper">
            <button
                type="button"
                onClick={toggleLike}
                className={`like-btn${hasLiked ? " is-liked" : ""}`}
                aria-label={hasLiked ? "Remove REC-Power" : "Give REC-Power"}
                aria-pressed={hasLiked}
            >
                <FaBolt size={22} />
            </button>

            <button
                type="button"
                className="likes-count"
                onClick={() => likes.length > 0 && setShowPopup(true)}
                disabled={likes.length === 0}
                aria-label={`View ${likes.length} ${likes.length === 1 ? "like" : "likes"}`}
            >
                {likes.length}
            </button>

            {popup}
        </div>
    );
}
