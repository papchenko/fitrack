
import { useEffect, useRef, useState } from "react";
import {
    collection,
    doc,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    writeBatch,
} from "firebase/firestore";
import { db } from "../../firebase";
import { toast } from "react-toastify";
import {
    FiArrowUp,
    FiMessageCircle,
    FiLock,
} from "react-icons/fi";

import "./support.scss";

export default function SupportChat({
    user,
    chatUserId,
    isAdmin = false,
}) {
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");
    const [sending, setSending] = useState(false);
    const [loading, setLoading] = useState(true);

    const bottomRef = useRef(null);
    const sendingRef = useRef(false);

    const targetId = isAdmin ? chatUserId : user?.uid;

    useEffect(() => {
        if (!targetId) {
            setMessages([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        setMessages([]);

        const messagesQuery = query(
            collection(db, "supportChats", targetId, "messages"),
            orderBy("createdAt", "asc")
        );

        const unsubscribe = onSnapshot(
            messagesQuery,
            (snapshot) => {
                setMessages(
                    snapshot.docs.map((item) => ({
                        id: item.id,
                        ...item.data(),
                    }))
                );
                setLoading(false);
            },
            (error) => {
                console.error(error);
                toast.error("Unable to load support messages.");
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [targetId]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "end",
        });
    }, [messages]);

    const sendMessage = async (event) => {
        event?.preventDefault();

        const content = text.trim();

        if (
            !content ||
            !user?.uid ||
            !targetId ||
            sendingRef.current ||
            content.length > 2000
        ) {
            return;
        }

        sendingRef.current = true;
        setSending(true);

        try {
            const chatRef = doc(db, "supportChats", targetId);
            const messageRef = doc(
                collection(db, "supportChats", targetId, "messages")
            );

            const batch = writeBatch(db);

            const messageData = {
                senderId: user.uid,
                senderRole: isAdmin ? "admin" : "user",
                text: content,
                createdAt: serverTimestamp(),
            };

            batch.set(messageRef, messageData);

            const chatData = {
                userId: targetId,
                lastMessage: content.slice(0, 160),
                lastMessageAt: serverTimestamp(),
                lastSenderId: user.uid,
                updatedAt: serverTimestamp(),
            };

            if (!isAdmin) {
                chatData.userName =
                    user.displayName ||
                    user.email?.split("@")[0] ||
                    "FiTrack User";

                chatData.userAvatar = user.photoURL || "";
            }

            batch.set(chatRef, chatData, { merge: true });

            await batch.commit();

            setText("");
        } catch (error) {
            console.error("Support message error:", error);
            toast.error("Message could not be sent.");
        } finally {
            sendingRef.current = false;
            setSending(false);
        }
    };

    return (
        <div className="ft-support-chat">
            <div className="ft-support-chat__header">
                <div className="ft-support-chat__identity">
                    <div className="ft-support-chat__avatar">
                        <FiMessageCircle />
                    </div>

                    <div>
                        <h3>
                            {isAdmin
                                ? "Support conversation"
                                : "FiTrack Support"}
                        </h3>

                        <span>
                            {isAdmin
                                ? "Private customer conversation"
                                : "Send a message to our support team"}
                        </span>
                    </div>
                </div>
            </div>

            <div
                className="ft-support-chat__messages"
                aria-label="Support messages"
                aria-live="polite"
            >
                {loading ? (
                    <div className="ft-support-chat__empty">
                        Loading conversation...
                    </div>
                ) : messages.length === 0 ? (
                    <div className="ft-support-chat__empty">
                        <FiMessageCircle size={30} />

                        <h4>
                            {isAdmin
                                ? "No messages yet"
                                : "How can we help?"}
                        </h4>

                        <p>
                            {isAdmin
                                ? "Messages will appear here."
                                : "Describe your question or issue. Our team will reply here when available."}
                        </p>
                    </div>
                ) : (
                    messages.map((message) => {
                        const own = message.senderId === user?.uid;

                        return (
                            <div
                                key={message.id}
                                className={`ft-support-message ${
                                    own ? "is-own" : "is-other"
                                }`}
                            >
                                <div className="ft-support-message__bubble">
                                    <p>{message.text}</p>

                                    <time>
                                        {message.createdAt?.toDate
                                            ? message.createdAt
                                                  .toDate()
                                                  .toLocaleTimeString([], {
                                                      hour: "2-digit",
                                                      minute: "2-digit",
                                                  })
                                            : ""}
                                    </time>
                                </div>
                            </div>
                        );
                    })
                )}

                <div ref={bottomRef} />
            </div>

            <form
                className="ft-support-chat__composer"
                onSubmit={sendMessage}
            >
                <textarea
                    value={text}
                    onChange={(event) => setText(event.target.value)}
                    placeholder="Write your message..."
                    maxLength={2000}
                    rows={2}
                    disabled={!user || !targetId || sending}
                    onKeyDown={(event) => {
                        if (event.key === "Enter" && !event.shiftKey) {
                            event.preventDefault();
                            sendMessage();
                        }
                    }}
                />

                <button
                    type="submit"
                    disabled={
                        !text.trim() ||
                        !user ||
                        !targetId ||
                        sending
                    }
                    aria-label="Send support message"
                >
                    <FiArrowUp />
                </button>
            </form>

            <div className="ft-support-chat__footer">
                <FiLock />
                <span>Private conversation with FiTrack Support</span>
            </div>
        </div>
    );
}
