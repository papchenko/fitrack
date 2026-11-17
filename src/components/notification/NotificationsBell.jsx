import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { db } from "../../firebase";
import {
  collection,
  onSnapshot,
  doc,
  getDoc,
  updateDoc,
  query,
  where,
} from "firebase/firestore";
import { FaRegBell } from "react-icons/fa6";
import { useAuth } from "../account/AuthContext";
import { FiMessageCircle } from "react-icons/fi";
import { FaArrowCircleLeft, FaWindowClose } from "react-icons/fa";

import "./notifications.scss";

export default function NotificationsBell() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [personalNotifs, setPersonalNotifs] = useState([]);
  const [unread, setUnread] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const popupRef = useRef(null);

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.data();
      const userCreatedAt = userData?.createdAt?.toDate?.() || new Date(0);
      const readIds = userData?.readAnnouncements || [];

      const q = collection(db, "announcements");
      const unsub = onSnapshot(q, (snap) => {
        const all = snap.docs
          .map((d) => ({ id: d.id, ...d.data(), type: "announcement" }))
          .filter((a) => a.timestamp?.toDate() > userCreatedAt);

        const unreadOnes = all.filter((a) => !readIds.includes(a.id));
        setAnnouncements(unreadOnes);
      });

      return unsub;
    };

    load();
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, "notifications"), where("userId", "==", user.uid));

    const unsub = onSnapshot(q, (snap) => {
      if (snap.empty) {
        setPersonalNotifs([]);
        return;
      }

      const all = snap.docs
        .map((d) => ({
          id: d.id,
          ...d.data(),
          type: "personal",
        }))
        .sort((a, b) => {
          const t1 = a.createdAt?.toDate?.() || new Date(a.createdAt) || new Date(0);
          const t2 = b.createdAt?.toDate?.() || new Date(b.createdAt) || new Date(0);
          return t2 - t1;
        });

      const unread = all.filter((n) => n.read === false || n.read === undefined);

      setPersonalNotifs(unread);
    });

    return unsub;
  }, [user]);

  useEffect(() => {
    setUnread([...announcements, ...personalNotifs]);
  }, [announcements, personalNotifs]);

  const markAsRead = async (notif) => {
    if (notif.type === "announcement") {
      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);
      const read = snap.data()?.readAnnouncements || [];
      if (!read.includes(notif.id)) {
        await updateDoc(userRef, { readAnnouncements: [...read, notif.id] });
        setAnnouncements((prev) => prev.filter((a) => a.id !== notif.id));
      }
    } else if (notif.type === "personal") {
      await updateDoc(doc(db, "notifications", notif.id), { read: true });
      setPersonalNotifs((prev) => prev.filter((n) => n.id !== notif.id));
    }
  };

  return (
    <div className="notifications-bell" ref={popupRef}>
      <div className="bell-icon" onClick={() => setShowPopup((prev) => !prev)}>
        {/* <MdOutlineNotifications className="text-white fs-1" /> */}
       < FaRegBell />
       {/* <FaRegMessage /> */}
       {/* <FaMessage /> */}
        {unread.length > 0 && <span className="unread-badge"></span>}
      </div>
      {showPopup &&
  createPortal(
    <>
      <div
        className="notifications-backdrop"
        onClick={() => setShowPopup(false)}
      />
      <aside className="notifications-drawer">
  <header className="notifications-header">
    {/* <h5 className="notifications-title">Notifications</h5> */}

    <button
      type="button"
      className="notifications-close"
      onClick={() => setShowPopup(false)}
      aria-label="Close notifications"
    >
      <FaArrowCircleLeft />
    </button>
  </header>

  <div className="notifications-body">
    {unread.length === 0 ? (
      <div className="notifications-empty">
        <div className="notifications-empty-icon">
          <FaRegBell />
        </div>

        <h4>You're all caught up</h4>

        <p>You don't have any new notifications.</p>
      </div>
    ) : (
      <div className="notifications-list">
        {unread.map((notification) => (
          <button
            key={notification.id}
            type="button"
            className="notification-item"
            onClick={() => markAsRead(notification)}
          >
            <span className="notification-icon">
              {notification.type === "announcement" ? (
                <FaRegBell />
              ) : (
                <FiMessageCircle />
              )}
            </span>

            <span className="notification-content">
              <span className="notification-top">
                <strong>
                  {notification.title || "Notification"}
                </strong>

                {!notification.read && (
                  <span className="notification-new">
                    NEW
                  </span>
                )}
              </span>

              <span className="notification-message">
                {notification.message}
              </span>
            </span>
          </button>
        ))}
      </div>
    )}
  </div>
</aside>
    </>,
    document.body
  )}
    </div>
  );
}