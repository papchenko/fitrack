import { useEffect, useMemo, useRef, useState } from "react";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  addDoc,
  updateDoc,
  writeBatch,
  arrayUnion,
  arrayRemove,
  setDoc,
  getDocs,
} from "firebase/firestore";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiCheck,
  FiCheckCircle,
  FiMessageCircle,
  FiSearch,
  FiSend,
  FiUsers,
  FiX,
  FiInbox,
  FiMoreHorizontal,
  FiUserX,
  FiTrash2,
  FiMoreVertical,
} from "react-icons/fi";
import { RiVerifiedBadgeFill } from "react-icons/ri";
import { db } from "../../firebase";
import { useAuth } from "../account/AuthContext";
import { createPortal } from "react-dom";
import UserPresence from "../nav/search/UserPresence";
import "./messages.scss";

const chatIdFor = (a, b) => [a, b].sort().join("_");
const toDate = (value) =>
  value?.toDate?.() ||
  (value instanceof Date ? value : value ? new Date(value) : null);
const clock = (value) => {
  const date = toDate(value);
  return date && !Number.isNaN(date.getTime())
    ? date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
    : "";
};
const shortDate = (value) => {
  const date = toDate(value);
  if (!date || Number.isNaN(date.getTime())) return "";
  if (date.toDateString() === new Date().toDateString()) return clock(value);
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
};
const nameOf = (person) =>
  person?.username || person?.email?.split("@")[0] || "FiTrack member";
const proOf = (person) =>
  person?.premiumPackage?.active === true &&
  person?.premiumPackage?.title === "Pro";
const isDeletedForMe = (message, uid) =>
  Array.isArray(message.hiddenFor) && message.hiddenFor.includes(uid);

const isDeletedForEveryone = (message) => message.deletedForEveryone === true;

const isVisibleMessage = (message, uid, clearedAt) => {
  if (isDeletedForEveryone(message)) return false;
  if (isDeletedForMe(message, uid)) return false;

  const messageTime = toDate(message.timestamp)?.getTime() || 0;
  const clearedTime = toDate(clearedAt)?.getTime() || 0;

  return messageTime > clearedTime;
};

const deleteMessage = async (messageId, forEveryone = false) => {
  if (!userId || !selectedId || deletingMessageId) return;

  const message = messages.find((item) => item.id === messageId);

  if (!message) return;

  // Delete for Everyone дозволяємо лише автору.
  if (forEveryone && message.senderId !== userId) return;

  setDeletingMessageId(messageId);
  setError("");

  try {
    const messageRef = doc(
      db,
      "messages",
      chatIdFor(userId, selectedId),
      "messages",
      messageId,
    );

    if (forEveryone) {
      await updateDoc(messageRef, {
        deletedForEveryone: true,
        deletedAt: serverTimestamp(),
        text: "",
      });
    } else {
      await updateDoc(messageRef, {
        hiddenFor: arrayUnion(userId),
      });
    }

    setMessageMenuId(null);
  } catch (err) {
    console.error("Delete message:", err);
    setError("Unable to delete the message.");
  } finally {
    setDeletingMessageId(null);
  }
};

function Avatar({ person, size = "normal" }) {
  const name = nameOf(person);
  return (
    <span className={`ft-msg-avatar ft-msg-avatar--${size}`}>
      {person?.avatarUrl ? (
        <img src={person.avatarUrl} alt="" />
      ) : (
        <span>{Array.from(name)[0]?.toUpperCase() || "?"}</span>
      )}
      {proOf(person) && (
        <RiVerifiedBadgeFill
          className="ft-msg-avatar__pro"
          aria-label="Pro member"
        />
      )}
      <UserPresence
    lastActiveAt={person?.lastActiveAt}
    showText={false}
/>
    </span>
  );
}

export default function MessagesPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedId = searchParams.get("user");
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [people, setPeople] = useState({});
  const [previews, setPreviews] = useState({});
  const [messages, setMessages] = useState([]);
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [processingRequests, setProcessingRequests] = useState([]);
  const [friendMenuOpen, setFriendMenuOpen] = useState(false);
  const [friendToRemove, setFriendToRemove] = useState(null);
  const [removingFriend, setRemovingFriend] = useState(false);
  const [chatSettings, setChatSettings] = useState({});
  const [clearChatOpen, setClearChatOpen] = useState(false);
  const [clearingChat, setClearingChat] = useState(false);
  const [messageMenuPosition, setMessageMenuPosition] = useState(null);

  const [messageMenuId, setMessageMenuId] = useState(null);
  const [deletingMessageId, setDeletingMessageId] = useState(null);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("all");
  const endRef = useRef(null);
  const textareaRef = useRef(null);
  const userId = user?.uid;
  const openMessageMenu = (event, messageId) => {
    if (messageMenuId === messageId) {
      setMessageMenuId(null);
      setMessageMenuPosition(null);
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();

    const menuWidth = 205;
    const menuHeight = 112;
    const gap = 6;

    const left = Math.max(
      8,
      Math.min(rect.right - menuWidth, window.innerWidth - menuWidth - 8),
    );

    const spaceBelow = window.innerHeight - rect.bottom;

    const top =
      spaceBelow >= menuHeight + gap
        ? rect.bottom + gap
        : Math.max(8, rect.top - menuHeight - gap);

    setMessageMenuPosition({ top, left });
    setMessageMenuId(messageId);
  };

  useEffect(() => {
    if (!messageMenuId) return;

    const closeMenu = (event) => {
      if (
        event.target.closest?.(".ft-messages__message-more") ||
        event.target.closest?.(".ft-messages__message-dropdown")
      ) {
        return;
      }

      setMessageMenuId(null);
      setMessageMenuPosition(null);
    };

    const closeOnEscape = (event) => {
      if (event.key === "Escape") {
        setMessageMenuId(null);
        setMessageMenuPosition(null);
      }
    };

    const closeOnScroll = () => {
      setMessageMenuId(null);
      setMessageMenuPosition(null);
    };

    document.addEventListener("pointerdown", closeMenu);
    document.addEventListener("keydown", closeOnEscape);
    window.addEventListener("resize", closeOnScroll);
    window.addEventListener("scroll", closeOnScroll, true);

    return () => {
      document.removeEventListener("pointerdown", closeMenu);
      document.removeEventListener("keydown", closeOnEscape);
      window.removeEventListener("resize", closeOnScroll);
      window.removeEventListener("scroll", closeOnScroll, true);
    };
  }, [messageMenuId]);
  useEffect(() => {
    if (!userId || !friends.length) {
      setChatSettings({});
      return;
    }

    const unsubscribers = friends.map((friendId) => {
      const chatId = chatIdFor(userId, friendId);

      return onSnapshot(
        doc(db, "messages", chatId, "userSettings", userId),
        (snapshot) => {
          setChatSettings((prev) => ({
            ...prev,
            [friendId]: snapshot.data() || {},
          }));
        },
        (err) => {
          console.error("Chat settings:", err);
        },
      );
    });

    return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
  }, [userId, friends]);

  const select = (id) => {
    setDraft("");
    setError("");
    setSearchParams(id ? { user: id } : {}, { replace: false });
  };

  useEffect(() => {
    if (!userId) {
      setFriends([]);
      setRequests([]);
      return;
    }
    return onSnapshot(
      doc(db, "friends", userId),
      (snap) => {
        const data = snap.data() || {};
        setFriends(
          Array.isArray(data.friends)
            ? data.friends.filter((id) => id && id !== userId)
            : [],
        );
        setRequests(
          Array.isArray(data.requests)
            ? data.requests.filter((id) => id && id !== userId)
            : [],
        );
      },
      (err) => {
        console.error(err);
        setError("Could not load connections.");
      },
    );
  }, [userId]);

  const ids = useMemo(
    () => [
      ...new Set([
        ...friends,
        ...requests,
        ...(selectedId ? [selectedId] : []),
      ]),
    ],
    [friends, requests, selectedId],
  );
useEffect(() => {
    if (!ids.length) {
        setPeople({});
        return;
    }

    setPeople((prev) =>
        Object.fromEntries(
            ids.filter((id) => prev[id]).map((id) => [id, prev[id]])
        )
    );

    const unsubscribers = ids.map((id) =>
        onSnapshot(
            doc(db, "users", id),
            (snapshot) => {
                setPeople((prev) => ({
                    ...prev,
                    [id]: snapshot.exists()
                        ? snapshot.data()
                        : { username: "FiTrack member" },
                }));
            },
            (error) => {
                console.error("User presence:", error);
            }
        )
    );

    return () => {
        unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
}, [ids]);

  useEffect(() => {
    if (!userId || !friends.length) {
      setPreviews({});
      return;
    }
    const unsubs = friends.map((id) =>
      onSnapshot(
        query(
          collection(db, "messages", chatIdFor(userId, id), "messages"),
          orderBy("timestamp", "asc"),
        ),
        (snap) => {
          const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
          setPreviews((prev) => ({
            ...prev,
            [id]: {
              last: rows[rows.length - 1] || null,
              unread: rows.filter(
                (m) => m.receiverId === userId && m.seen === false,
              ).length,
            },
          }));
        },
        (err) => {
          console.error("Conversation preview:", err);
          setError("Some conversations could not be loaded.");
        },
      ),
    );
    return () => unsubs.forEach((unsub) => unsub());
  }, [userId, friends]);

  useEffect(() => {
    if (!userId || !selectedId || selectedId === userId) {
      setMessages([]);
      return;
    }
    setMessages([]);
    const chatId = chatIdFor(userId, selectedId);
    return onSnapshot(
      query(
        collection(db, "messages", chatId, "messages"),
        orderBy("timestamp", "asc"),
      ),
      async (snap) => {
        const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setMessages(rows);
        const unread = snap.docs.filter(
          (d) => d.data().receiverId === userId && d.data().seen === false,
        );
        if (unread.length) {
          try {
            // Firestore batches support up to 500 writes. Keep safely below the limit.
            for (let i = 0; i < unread.length; i += 400) {
              const batch = writeBatch(db);
              unread
                .slice(i, i + 400)
                .forEach((item) => batch.update(item.ref, { seen: true }));
              await batch.commit();
            }
          } catch (err) {
            console.error("Mark read:", err);
          }
        }
      },
      (err) => {
        console.error("Chat subscription:", err);
        setError("Unable to load this conversation.");
      },
    );
  }, [userId, selectedId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end", behavior: "auto" });
  }, [messages.length, selectedId]);

  const conversations = useMemo(
    () =>
      friends
        .map((id) => ({ id, person: people[id], ...(previews[id] || {}) }))
        .filter((item) =>
          nameOf(item.person)
            .toLowerCase()
            .includes(search.toLowerCase().trim()),
        )
        .filter((item) => tab !== "unread" || item.unread > 0)
        .sort(
          (a, b) =>
            (toDate(b.last?.timestamp)?.getTime() || 0) -
            (toDate(a.last?.timestamp)?.getTime() || 0),
        ),
    [friends, people, previews, search, tab],
  );
  const totalUnread = Object.values(previews).reduce(
    (sum, p) => sum + (p.unread || 0),
    0,
  );
  const activePerson = people[selectedId] || null;
  const visibleMessages = useMemo(() => {
    if (!userId || !selectedId) return [];

    const clearedAt = chatSettings[selectedId]?.clearedAt;

    return messages.filter((message) =>
      isVisibleMessage(message, userId, clearedAt),
    );
  }, [messages, userId, selectedId, chatSettings]);
  const send = async (e) => {
    e?.preventDefault();
    const content = draft.trim();
    if (
      !content ||
      !userId ||
      !selectedId ||
      sending ||
      selectedId === userId ||
      !friends.includes(selectedId)
    )
      return;
    setSending(true);
    setError("");
    try {
      await addDoc(
        collection(db, "messages", chatIdFor(userId, selectedId), "messages"),
        {
          text: content,
          senderId: userId,
          receiverId: selectedId,
          timestamp: serverTimestamp(),
          seen: false,
        },
      );
      setDraft("");
      textareaRef.current?.focus();
    } catch (err) {
      console.error("Send message:", err);
      setError("Message could not be sent. Please retry.");
    } finally {
      setSending(false);
    }
  };

  const accept = async (id) => {
    if (!userId) return;
    try {
      await updateDoc(doc(db, "friends", userId), {
        friends: arrayUnion(id),
        requests: arrayRemove(id),
      });
      await updateDoc(doc(db, "friends", id), { friends: arrayUnion(userId) });
      select(id);
    } catch (err) {
      console.error("Accept friend:", err);
      setError("Unable to accept the request.");
    }
  };

  const reject = async (id) => {
    if (!userId || processingRequests.includes(id)) return;

    setProcessingRequests((prev) => [...prev, id]);
    setError("");

    try {
      await updateDoc(doc(db, "friends", userId), {
        requests: arrayRemove(id),
      });
    } catch (err) {
      console.error("Reject friend request:", err);
      setError("Unable to reject the friend request.");
    } finally {
      setProcessingRequests((prev) => prev.filter((uid) => uid !== id));
    }
  };
  const removeFriend = async () => {
    if (!userId || !friendToRemove || removingFriend) return;

    const friendId = friendToRemove;

    setRemovingFriend(true);
    setError("");

    try {
      const batch = writeBatch(db);

      batch.update(doc(db, "friends", userId), {
        friends: arrayRemove(friendId),
      });

      batch.update(doc(db, "friends", friendId), {
        friends: arrayRemove(userId),
      });

      await batch.commit();

      setFriendToRemove(null);
      setFriendMenuOpen(false);

      if (selectedId === friendId) {
        select(null);
      }
    } catch (err) {
      console.error("Remove friend:", err);
      setError("Unable to remove friend. Please try again.");
    } finally {
      setRemovingFriend(false);
    }
  };

  const clearChatHistory = async () => {
    if (!userId || !selectedId || clearingChat) return;
    if (!friends.includes(selectedId)) return;

    setClearingChat(true);
    setError("");

    try {
      const chatId = chatIdFor(userId, selectedId);

      await setDoc(
        doc(db, "messages", chatId, "userSettings", userId),
        {
          clearedAt: serverTimestamp(),
        },
        { merge: true },
      );

      setClearChatOpen(false);
      setFriendMenuOpen(false);
      setMessageMenuId(null);
    } catch (err) {
      console.error("Clear chat history:", err);
      setError("Unable to clear chat history.");
    } finally {
      setClearingChat(false);
    }
  };

  const deleteMessage = async (messageId, forEveryone = false) => {
    if (!userId || !selectedId || deletingMessageId) return;

    const message = messages.find((item) => item.id === messageId);

    if (!message) return;

    if (forEveryone && message.senderId !== userId) {
      setError("You can only delete your own messages for everyone.");
      return;
    }

    setDeletingMessageId(messageId);
    setError("");

    try {
      const messageRef = doc(
        db,
        "messages",
        chatIdFor(userId, selectedId),
        "messages",
        messageId,
      );

      if (forEveryone) {
        await updateDoc(messageRef, {
          deletedForEveryone: true,
          deletedAt: serverTimestamp(),
          text: "",
        });
      } else {
        await updateDoc(messageRef, {
          hiddenFor: arrayUnion(userId),
        });
      }

      setMessageMenuId(null);
      setMessageMenuPosition(null);
    } catch (err) {
      console.error("Delete message:", err.code, err.message);

      setError(
        err.code === "permission-denied"
          ? "Permission denied. Check Firestore security rules."
          : "Unable to delete the message.",
      );
    } finally {
      setDeletingMessageId(null);
    }
  };

  if (authLoading)
    return (
      <main className="ft-messages ft-messages--state">Loading messages…</main>
    );
  if (!userId)
    return (
      <main className="ft-messages ft-messages--state">
        <FiMessageCircle />
        <h1>Messages</h1>
        <p>Sign in to access your conversations.</p>
        <button onClick={() => navigate("/")}>Back to FiTrack</button>
      </main>
    );

  return (
    <main className="ft-messages">
      <div className="ft-messages__shell">
        <div className="ft-messages__heading">
          <div></div>
          <span className="ft-messages__heading-count">
            <FiMessageCircle />{" "}
            {totalUnread ? `${totalUnread} unread` : "All caught up"}
          </span>
        </div>
        <div
          className={`ft-messages__layout ${selectedId ? "ft-messages__layout--chat-open" : ""}`}>
          <aside className="ft-messages__sidebar" aria-label="Conversations">
            <div className="ft-messages__sidebar-head">
              <div>
                <h2>Inbox</h2>
                <span>{friends.length} connections</span>
              </div>
              <FiUsers />
            </div>
            <label className="ft-messages__search">
              <FiSearch />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search conversations"
                aria-label="Search conversations"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Clear search">
                  <FiX />
                </button>
              )}
            </label>
            <div className="ft-messages__tabs">
              <button
                type="button"
                className={tab === "all" ? "active" : ""}
                onClick={() => setTab("all")}>
                All chats
              </button>
              <button
                type="button"
                className={tab === "unread" ? "active" : ""}
                onClick={() => setTab("unread")}>
                Unread {totalUnread > 0 && <span>{totalUnread}</span>}
              </button>
            </div>
            <div className="ft-messages__conversation-list">
              {conversations.map(({ id, person, last, unread = 0 }) => (
                <button
                  type="button"
                  key={id}
                  className={`ft-messages__conversation ${selectedId === id ? "is-active" : ""}`}
                  onClick={() => select(id)}>
                  <Avatar person={person} />
                  <span className="ft-messages__conversation-main">
                    <span className="ft-messages__conversation-top">
                      <strong>{nameOf(person)}</strong>
                      <time>{shortDate(last?.timestamp)}</time>
                    </span>
                    <span className="ft-messages__conversation-bottom">
                      <span>
                        {last
                          ? `${last.senderId === userId ? "You: " : ""}${last.text || "Message"}`
                          : "Start a conversation"}
                      </span>
                      {unread > 0 && <b>{unread > 99 ? "99+" : unread}</b>}
                    </span>
                  </span>
                </button>
              ))}
              {!conversations.length && (
                <div className="ft-messages__list-empty">
                  <FiInbox />
                  <strong>
                    {search
                      ? "No matching conversations"
                      : tab === "unread"
                        ? "No unread messages"
                        : "No conversations yet"}
                  </strong>
                  <p>
                    {search
                      ? "Try a different name."
                      : "Your friends will appear here."}
                  </p>
                </div>
              )}
            </div>
            {requests.length > 0 && (
              <div className="ft-messages__requests" id="friend-requests">
                <h3>
                  Friend requests
                  <span>{requests.length}</span>
                </h3>

                {requests.map((id) => {
                  const isProcessing = processingRequests.includes(id);

                  return (
                    <div className="ft-messages__request" key={id}>
                      <Avatar person={people[id]} size="small" />

                      <strong>{nameOf(people[id])}</strong>

                      <div className="ft-messages__request-actions">
                        <button
                          type="button"
                          className="ft-messages__request-accept"
                          onClick={() => accept(id)}
                          disabled={isProcessing}>
                          <FiCheck />
                          <span>Accept</span>
                        </button>

                        <button
                          type="button"
                          className="ft-messages__request-reject"
                          onClick={() => reject(id)}
                          disabled={isProcessing}
                          aria-label={`Reject request from ${nameOf(people[id])}`}>
                          <FiX />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </aside>
          <section className="ft-messages__chat" aria-label="Chat">
            {selectedId &&
            selectedId !== userId &&
            friends.includes(selectedId) ? (
              <>
                <header className="ft-messages__chat-header">
                  <button
                    className="ft-messages__back"
                    type="button"
                    onClick={() => select(null)}
                    aria-label="Back to conversations">
                    <FiArrowLeft />
                  </button>
                  <Avatar person={activePerson} />
<div>
    <strong>{nameOf(activePerson)}</strong>

    <UserPresence lastActiveAt={activePerson?.lastActiveAt} />
</div>
                  <div className="ft-messages__friend-menu">
                    <button
                      type="button"
                      className="ft-messages__friend-menu-trigger"
                      aria-label="Conversation options"
                      aria-expanded={friendMenuOpen}
                      onClick={() => setFriendMenuOpen((prev) => !prev)}>
                      <FiMoreHorizontal />
                    </button>

                    {friendMenuOpen && (
                      <div className="ft-messages__friend-menu-dropdown">
                        <button
                          type="button"
                          className="ft-messages__friend-menu-clear"
                          onClick={() => {
                            setClearChatOpen(true);
                            setFriendMenuOpen(false);
                          }}>
                          <FiTrash2 />
                          <span>Clear Chat History</span>
                        </button>
                        <button
                          type="button"
                          className="ft-messages__friend-menu-remove"
                          onClick={() => {
                            setFriendToRemove(selectedId);
                            setFriendMenuOpen(false);
                          }}>
                          <FiUserX />
                          <span>Remove Friend</span>
                        </button>
                      </div>
                    )}
                  </div>
                </header>
                <div
                  className="ft-messages__thread"
                  role="log"
                  aria-live="polite"
                  aria-relevant="additions text">
                  {!visibleMessages.length && (
                    <div className="ft-messages__thread-empty">
                      <FiMessageCircle />
                      <h3>Start the conversation</h3>
                      <p>Say hello to {nameOf(activePerson)}.</p>
                    </div>
                  )}
{visibleMessages.map((m, i) => {
    const mine = m.senderId === userId;

    const day = toDate(m.timestamp)?.toDateString();
    const previousDay = toDate(
        visibleMessages[i - 1]?.timestamp
    )?.toDateString();

    return (
        <div
            key={m.id}
            className="ft-messages__message-row"
        >
            {day && day !== previousDay && (
                <div className="ft-messages__date-separator">
                    {toDate(m.timestamp)?.toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                    })}
                </div>
            )}

            <div
                className={`ft-messages__bubble ${
                    mine ? "ft-messages__bubble--mine" : ""
                }`}
            >
                <div className="ft-messages__message-content">
                    <p>{m.text}</p>

                    <button
                        type="button"
                        className="ft-messages__message-more"
                        aria-label="Message options"
                        aria-expanded={messageMenuId === m.id}
                        onClick={(event) => openMessageMenu(event, m.id)}
                    >
                        <FiMoreVertical />
                    </button>
                </div>

                <span className="ft-messages__message-meta">
                    <time>{clock(m.timestamp)}</time>

                    {mine && (
                        m.seen ? (
                            <FiCheckCircle title="Read" />
                        ) : (
                            <FiCheck title="Sent" />
                        )
                    )}
                </span>
            </div>
        </div>
    );
})}
                  <div ref={endRef} />
                </div>
                <form className="ft-messages__composer" onSubmit={send}>
                  <textarea
                    ref={textareaRef}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value.slice(0, 4000))}
                    onKeyDown={(e) => {
                      if (
                        e.key === "Enter" &&
                        !e.shiftKey &&
                        !e.nativeEvent.isComposing
                      ) {
                        e.preventDefault();
                        send();
                      }
                    }}
                    placeholder="Write a message…"
                    aria-label="Message"
                    rows={1}
                    maxLength={4000}
                  />
                  <button
                    type="submit"
                    disabled={!draft.trim() || sending}
                    aria-label="Send message">
                    <FiSend />
                  </button>
                </form>
              </>
            ) : (
              <div className="ft-messages__welcome">
                <span>
                  <FiMessageCircle />
                </span>
                <h2>Your space to connect.</h2>
                <p>
                  Select a conversation from your inbox to start messaging your
                  FiTrack friends.
                </p>
              </div>
            )}
          </section>
        </div>
        {error && (
          <div className="ft-messages__error" role="alert">
            {error}
            <button
              type="button"
              onClick={() => setError("")}
              aria-label="Dismiss error">
              <FiX />
            </button>
          </div>
        )}
      </div>
      {messageMenuId && messageMenuPosition && createPortal(
    <div
        className="ft-messages__message-dropdown"
        style={{
            position: "fixed",
            top: messageMenuPosition.top,
            left: messageMenuPosition.left,
            zIndex: 10000,
        }}
    >
        <button
            type="button"
            disabled={deletingMessageId !== null}
            onClick={() => deleteMessage(messageMenuId, false)}
        >
            <FiTrash2 />
            <span>Delete for Me</span>
        </button>

        {messages.find((m) => m.id === messageMenuId)?.senderId === userId && (
            <button
                type="button"
                className="is-danger"
                disabled={deletingMessageId !== null}
                onClick={() => deleteMessage(messageMenuId, true)}
            >
                <FiTrash2 />
                <span>Delete for Everyone</span>
            </button>
        )}
    </div>,
    document.body
)}
      {clearChatOpen && (
        <div className="ft-messages__remove-overlay">
          <div
            className="ft-messages__remove-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="clear-chat-title">
            <div className="ft-messages__remove-icon">
              <FiTrash2 />
            </div>

            <h3 id="clear-chat-title">Clear Chat History?</h3>

            <p>
              All previous messages with <strong>{nameOf(activePerson)}</strong>{" "}
              will disappear from your chat.
            </p>

            <span className="ft-messages__remove-note">
              Messages will remain visible to the other person.
            </span>

            <div className="ft-messages__remove-actions">
              <button
                type="button"
                className="ft-messages__remove-cancel"
                disabled={clearingChat}
                onClick={() => setClearChatOpen(false)}>
                Cancel
              </button>

              <button
                type="button"
                className="ft-messages__remove-confirm"
                disabled={clearingChat}
                onClick={clearChatHistory}>
                <FiTrash2 />
                {clearingChat ? "Clearing..." : "Clear History"}
              </button>
            </div>
          </div>
        </div>
      )}
      {friendToRemove && (
        <div
          className="ft-messages__remove-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !removingFriend) {
              setFriendToRemove(null);
            }
          }}>
          <div
            className="ft-messages__remove-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="remove-friend-title">
            <div className="ft-messages__remove-icon">
              <FiUserX />
            </div>

            <h3 id="remove-friend-title">Remove Friend?</h3>

            <p>
              Are you sure you want to remove{" "}
              <strong>{nameOf(people[friendToRemove])}</strong> from your
              friends?
            </p>

            <span className="ft-messages__remove-note">
              Your conversation history will not be deleted.
            </span>

            <div className="ft-messages__remove-actions">
              <button
                type="button"
                className="ft-messages__remove-cancel"
                disabled={removingFriend}
                onClick={() => setFriendToRemove(null)}>
                Cancel
              </button>

              <button
                type="button"
                className="ft-messages__remove-confirm"
                disabled={removingFriend}
                onClick={removeFriend}>
                <FiUserX />
                {removingFriend ? "Removing..." : "Remove Friend"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
