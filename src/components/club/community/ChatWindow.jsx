import { useEffect, useRef, useState } from "react";

import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../../../firebase";

import { useAuth } from "../../account/AuthContext";

import MessageItem from "./MessageItem";

export default function ChatWindow({ channelId, channel }) {
  const { user } = useAuth();

  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!channelId) return;

    const messagesRef = collection(db, "clubChannels", channelId, "messages");

    const messagesQuery = query(messagesRef, orderBy("createdAt", "asc"));

    const unsubscribe = onSnapshot(
      messagesQuery,
      (snapshot) => {
        const messagesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setMessages(messagesData);
      },
      (error) => {
        console.error("Error loading messages:", error);
      },
    );

    return () => unsubscribe();
  }, [channelId]);

  async function handleSendMessage(e) {
    e.preventDefault();

    const text = message.trim();

    if (!text || !user || sending) {
      return;
    }

    try {
      setSending(true);

      const messagesRef = collection(db, "clubChannels", channelId, "messages");

      await addDoc(messagesRef, {
        uid: user.uid,

        username: user.username || user.email || "User",

        avatar: user.avatarUrl || "",

        isPremium:
          user?.premiumPackage?.active === true &&
          user?.premiumPackage?.title === "Pro",

        text,

        createdAt: serverTimestamp(),
      });

      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="chat-window">
      <header className="chat-window__header">
        <div>
          <span className="chat-window__hash">#</span>

          <div>
            <h2>{channel?.name}</h2>

            <p>{channel?.description}</p>
          </div>
        </div>
      </header>

      <div className="chat-window__messages">
        {messages.length === 0 ? (
          <div className="chat-window__empty">
            <div className="chat-window__empty-icon">#</div>

            <h3>Welcome to #{channel?.name}</h3>

            <p>Be the first to start the conversation.</p>
          </div>
        ) : (
          messages.map((item) => <MessageItem key={item.id} message={item} />)
        )}

        <div ref={messagesEndRef} />
      </div>

      <form className="chat-window__form" onSubmit={handleSendMessage}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={
            user
              ? `Message #${channel?.name}`
              : "Sign in to join the conversation"
          }
          disabled={!user || sending}
          maxLength={1000}
        />

        <button
          type="submit"
          disabled={!user || sending || !message.trim()}
          aria-label="Send message">
          →
        </button>
      </form>
    </section>
  );
}
