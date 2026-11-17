import { useEffect, useState } from "react";
import { db } from "../../firebase";
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  onSnapshot,
  collection,
  query,
  where,
} from "firebase/firestore";
import { useAuth } from "../account/AuthContext";
import { RiVerifiedBadgeFill } from "react-icons/ri";

import "./friendslist.scss";

export default function FriendsList({ onSelectUser }) {
  const { user } = useAuth();

  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [usersData, setUsersData] = useState({});
  const [unreadCounts, setUnreadCounts] = useState({});

  useEffect(() => {
    if (!user) return;

    const userDoc = doc(db, "friends", user.uid);

    const unsub = onSnapshot(userDoc, async (snap) => {
      const data = snap.data() || {
        friends: [],
        requests: [],
      };

      setFriends(data.friends || []);
      setRequests(data.requests || []);

      const allUids = [...(data.friends || []), ...(data.requests || [])];

      const userDataTemp = {};

      await Promise.all(
        allUids.map(async (uid) => {
          try {
            const uSnap = await getDoc(doc(db, "users", uid));

            if (uSnap.exists()) {
              userDataTemp[uid] = uSnap.data();
            }
          } catch (err) {
            console.error("Error loading user:", err);
          }
        }),
      );

      setUsersData(userDataTemp);
    });

    return () => unsub();
  }, [user]);

  useEffect(() => {
    if (!user || friends.length === 0) {
      setUnreadCounts({});
      return;
    }

    const unsubs = [];

    friends.forEach((fid) => {
      const chatId =
        user.uid < fid ? `${user.uid}_${fid}` : `${fid}_${user.uid}`;

      const messagesRef = collection(db, "messages", chatId, "messages");

      const q = query(
        messagesRef,
        where("receiverId", "==", user.uid),
        where("seen", "==", false),
      );

      const unsub = onSnapshot(q, (snap) => {
        setUnreadCounts((prev) => ({
          ...prev,
          [fid]: snap.size,
        }));
      });

      unsubs.push(unsub);
    });

    return () => {
      unsubs.forEach((unsub) => unsub());
    };
  }, [user, friends]);

  const acceptRequest = async (fromUid) => {
    try {
      const userDoc = doc(db, "friends", user.uid);
      const otherDoc = doc(db, "friends", fromUid);

      await updateDoc(userDoc, {
        friends: arrayUnion(fromUid),
        requests: arrayRemove(fromUid),
      });

      await updateDoc(otherDoc, {
        friends: arrayUnion(user.uid),
      });
    } catch (err) {
      console.error("Error accepting request:", err);
    }
  };

  const getAvatarFallback = (username) => {
    return Array.from(username || "?")[0] || "?";
  };

  return (
    <div className="friends-list general-wrapper">
      <h4>Friends</h4>

      {friends.length === 0 && <p>No friends yet</p>}

      <div className="friends-grid">
        {friends.map((fid) => {
          const userData = usersData[fid] || {};
          const username = userData.username || "Unknown";
          const avatarUrl = userData.avatarUrl || "";
          const unread = unreadCounts[fid] || 0;

          const isPro =
            userData?.premiumPackage?.active === true &&
            userData?.premiumPackage?.title === "Pro";

          return (
            <button
              key={fid}
              className="friend-btn"
              onClick={() => onSelectUser(fid)}>
              <div className="friend-avatar-wrapper">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={username}
                    className="friend-avatar"
                  />
                ) : (
                  <div className="friend-avatar friend-avatar-placeholder">
                    {getAvatarFallback(username)}
                  </div>
                )}

                {isPro && (
                  <RiVerifiedBadgeFill className="friend-premium-icon" />
                )}
              </div>

              <span className="friend-name">{username}</span>

              {unread > 0 && (
                <span className="unread-badge unread-badge-message">
                  {unread}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <h5>Friend Requests</h5>

      {requests.length === 0 && <p>No friend requests</p>}

      {requests.map((rid) => {
        const requestUser = usersData[rid] || {};
        const username = requestUser.username || rid;
        const avatarUrl = requestUser.avatarUrl || "";
        const isPro =
          requestUser?.premiumPackage?.active === true &&
          requestUser?.premiumPackage?.title === "Pro";

        return (
          <div key={rid} className="friend-request">
            <div className="friend-avatar-wrapper">
              {avatarUrl ? (
                <img src={avatarUrl} alt={username} className="friend-avatar" />
              ) : (
                <div className="friend-avatar friend-avatar-placeholder">
                  {getAvatarFallback(username)}
                </div>
              )}

              {isPro && <RiVerifiedBadgeFill className="friend-premium-icon" />}
            </div>

            <span>{username}</span>

            <button onClick={() => acceptRequest(rid)}>Accept</button>
          </div>
        );
      })}
    </div>
  );
}
