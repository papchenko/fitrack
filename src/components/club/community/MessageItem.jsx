import { useEffect, useState } from "react";

import { doc, getDoc } from "firebase/firestore";

import { db } from "../../../firebase";

import { RiVerifiedBadgeFill } from "react-icons/ri";

export default function MessageItem({ message }) {
  const [profile, setProfile] = useState(null);

  const username = message?.username || "User";

  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (!message?.uid) return;

    const loadUser = async () => {
      try {
        const userRef = doc(db, "users", message.uid);

        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          setProfile(userSnap.data());
        }
      } catch (error) {
        console.error("Error loading message user:", error);
      }
    };

    loadUser();
  }, [message?.uid]);

  const avatar = profile?.avatarUrl || message?.avatar || "";

  const isPremium =
    profile?.premiumPackage?.active === true &&
    profile?.premiumPackage?.title === "Pro"
      ? true
      : message?.isPremium === true;

  const avatarLetter = Array.from(username)[0] || "?";

  const showImage = avatar && !imageError;

  return (
    <div className="message-item">
      {/* AVATAR */}
      <div className="message-item__avatar-wrapper">
        <div className="message-item__avatar">
          {showImage ? (
            <img
              src={avatar}
              alt={username}
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="message-item__avatar-placeholder">
              {avatarLetter}
            </div>
          )}
        </div>

        {/* PREMIUM */}
        {isPremium && <RiVerifiedBadgeFill className="message-item__premium" />}
      </div>

      {/* MESSAGE */}
      <div className="message-item__body">
        <div className="message-item__header">
          <span className="message-item__username">{username}</span>

          {message.createdAt && (
            <span className="message-item__time">
              {message.createdAt.toDate().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          )}
        </div>

        <p className="message-item__text">{message.text}</p>
      </div>
    </div>
  );
}
