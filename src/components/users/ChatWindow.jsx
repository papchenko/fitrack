import { useEffect, useState } from "react";
import { db } from "../../firebase";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";

import { RiVerifiedBadgeFill } from "react-icons/ri";

import "./chatwindow.scss";

export default function ChatWindow({
  currentUserId,
  friendId,
  onClose,
}) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  const [friendData, setFriendData] = useState({
    username: "Unknown",
    avatarUrl: "",
    premiumPackage: null,
  });

  useEffect(() => {
    if (!friendId) return;

    const fetchFriend = async () => {
      try {
        const docSnap = await getDoc(
          doc(db, "users", friendId)
        );

        if (docSnap.exists()) {
          const data = docSnap.data();

          setFriendData({
            username: data.username || "Unknown",
            avatarUrl: data.avatarUrl || "",
            premiumPackage: data.premiumPackage || null,
          });
        }
      } catch (err) {
        console.error("Error loading friend:", err);
      }
    };

    fetchFriend();
  }, [friendId]);

  useEffect(() => {
    if (!currentUserId || !friendId) return;

    const chatId =
      currentUserId < friendId
        ? `${currentUserId}_${friendId}`
        : `${friendId}_${currentUserId}`;

    const messagesRef = collection(
      db,
      "messages",
      chatId,
      "messages"
    );

    const q = query(
      messagesRef,
      orderBy("timestamp")
    );

    const unsub = onSnapshot(q, async (snap) => {
      const newMessages = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      setMessages(newMessages);

      const unread = snap.docs.filter(
        (d) =>
          d.data().receiverId === currentUserId &&
          d.data().seen === false
      );

      for (const m of unread) {
        const msgRef = doc(
          db,
          "messages",
          chatId,
          "messages",
          m.id
        );

        await updateDoc(msgRef, {
          seen: true,
        });
      }
    });

    return () => unsub();
  }, [currentUserId, friendId]);

  const sendMessage = async () => {
    if (!text.trim()) return;

    const chatId =
      currentUserId < friendId
        ? `${currentUserId}_${friendId}`
        : `${friendId}_${currentUserId}`;

    const messagesRef = collection(
      db,
      "messages",
      chatId,
      "messages"
    );

    await addDoc(messagesRef, {
      text,
      senderId: currentUserId,
      receiverId: friendId,
      timestamp: new Date(),
      seen: false,
    });

    setText("");
  };

  if (!friendId) return null;

  const username = friendData.username || "Unknown";

  const avatarFallback =
    Array.from(username || "?")[0] || "?";

  const isPro =
    friendData?.premiumPackage?.active === true &&
    friendData?.premiumPackage?.title === "Pro";

  return (
    <div className="chat-window general-wrapper">

      {/* HEADER */}
      <div className="chat-header">

        <div className="chat-avatar-wrapper">
          {friendData.avatarUrl ? (
            <img
              className="friend-avatar"
              src={friendData.avatarUrl}
              alt={username}
            />
          ) : (
            <div className="friend-avatar friend-avatar-placeholder">
              {avatarFallback}
            </div>
          )}

          {isPro && (
            <RiVerifiedBadgeFill className="chat-premium-icon" />
          )}
        </div>

        <h4>{username}</h4>

        <button
          className="close-btn"
          onClick={onClose}
        >
          ×
        </button>
      </div>

      {/* MESSAGES */}
      <div className="chat-body">
        {messages.map((m) => {
          const isSent =
            m.senderId === currentUserId;

          return (
            <div
              key={m.id}
              className={`chat-message ${
                isSent ? "sent" : "received"
              }`}
            >
              {!isSent && (
                <div className="message-avatar-wrapper">
                  {friendData.avatarUrl ? (
                    <img
                      className="message-avatar"
                      src={friendData.avatarUrl}
                      alt={username}
                    />
                  ) : (
                    <div className="message-avatar message-avatar-placeholder">
                      {avatarFallback}
                    </div>
                  )}

                  {isPro && (
                    <RiVerifiedBadgeFill className="message-premium-icon" />
                  )}
                </div>
              )}

              <p>{m.text}</p>
            </div>
          );
        })}
      </div>

      {/* FOOTER */}
      <div className="chat-footer">
        <input
          type="text"
          placeholder="Type a message..."
          value={text}
          onChange={(e) =>
            setText(e.target.value)
          }
        />

        <button onClick={sendMessage}>
          Send
        </button>
      </div>
    </div>
  );
}