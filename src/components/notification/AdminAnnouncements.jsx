
import { useEffect, useState } from "react";
import { useAuth } from "../account/AuthContext";
import {
    collection,
    doc,
    getDoc,
    onSnapshot,
    orderBy,
    query,
} from "firebase/firestore";
import { db } from "../../firebase";
import { Link, useNavigate } from "react-router-dom";
import {
    FiHeadphones,
    FiMessageSquare,
    FiSend,
    FiShield,
    FiSearch,
    FiArrowLeft,
} from "react-icons/fi";
import { FiShoppingBag, FiAward } from "react-icons/fi";
import AdminOrders from "./AdminOrders";

import AdminAnnouncementPanel from "../notification/AdminAnnouncementPanel";
import SupportChat from "../support/SupportChat";
import "../support/support.scss";

export default function AdminAnnouncements() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [isAdmin, setIsAdmin] = useState(null);
    const [tab, setTab] = useState("support");
    const [chats, setChats] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [search, setSearch] = useState("");

    useEffect(() => {
        if (!user?.uid) {
            setIsAdmin(null);
            return;
        }

        let active = true;

        getDoc(doc(db, "users", user.uid))
            .then((snapshot) => {
                if (!active) return;

                const allowed =
                    snapshot.exists() &&
                    snapshot.data().isAdmin === true;

                setIsAdmin(allowed);

                if (!allowed) navigate("/", { replace: true });
            })
            .catch((error) => {
                console.error(error);
                if (active) {
                    setIsAdmin(false);
                    navigate("/", { replace: true });
                }
            });

        return () => {
            active = false;
        };
    }, [user?.uid, navigate]);

    useEffect(() => {
        if (!isAdmin) return;

        const chatsQuery = query(
            collection(db, "supportChats"),
            orderBy("lastMessageAt", "desc")
        );

        return onSnapshot(
            chatsQuery,
            (snapshot) => {
                setChats(
                    snapshot.docs.map((item) => ({
                        id: item.id,
                        ...item.data(),
                    }))
                );
            },
            (error) => console.error("Support inbox:", error)
        );
    }, [isAdmin]);

    const filteredChats = chats.filter((chat) => {
        const term = search.toLowerCase();

        return (
            (chat.userName || "").toLowerCase().includes(term) ||
            (chat.lastMessage || "").toLowerCase().includes(term)
        );
    });

    if (!user) {
        return (
            <div className="ft-admin-loading">
                Please sign in to access the admin panel.
                <Link to="/login">Sign in</Link>
            </div>
        );
    }

    if (isAdmin === null) {
        return <div className="ft-admin-loading">Loading admin panel...</div>;
    }

    if (!isAdmin) return null;

    const selectedChat = chats.find((chat) => chat.id === selectedId);

    return (
        <main className="ft-admin">
            <div className="ft-admin__container">

                <div className="ft-admin__stats">
                    <div className="ft-admin__stat">
                        <FiMessageSquare />
                        <strong>{chats.length}</strong>
                        <span>Total conversations</span>
                    </div>

                    <div className="ft-admin__stat">
                        <FiHeadphones />
                        <strong>
                            {chats.filter(
                                (chat) => chat.lastSenderId === chat.userId
                            ).length}
                        </strong>
                        <span>Awaiting response</span>
                    </div>
                </div>

                <nav className="ft-admin__tabs">
                    <button
                        type="button"
                        className={tab === "support" ? "active" : ""}
                        onClick={() => setTab("support")}
                    >
                        <FiHeadphones /> Support Inbox
                    </button>

                    <button
                        type="button"
                        className={tab === "announcements" ? "active" : ""}
                        onClick={() => setTab("announcements")}
                    >
                        <FiSend /> Announcements
                    </button>
                    <button
    type="button"
    className={tab === "orders" ? "active" : ""}
    onClick={() => setTab("orders")}
>
    <FiShoppingBag /> Orders
</button>

<button
    type="button"
    className={tab === "premium" ? "active" : ""}
    onClick={() => setTab("premium")}
>
    <FiAward /> Premium Management
</button>
                </nav>

                {tab === "support" ? (
                    <div className="ft-admin__workspace">
                        <aside
                            className={`ft-admin__sidebar ${
                                selectedId ? "has-selection" : ""
                            }`}
                        >
                            <div className="ft-admin__sidebar-header">
                                <h2>Conversations</h2>

                                <label className="ft-admin__search">
                                    <FiSearch />
                                    <input
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Search conversations..."
                                    />
                                </label>
                            </div>

                            <div className="ft-admin__conversation-list">
                                {filteredChats.length === 0 && (
                                    <p className="ft-admin__no-chats">
                                        No conversations found.
                                    </p>
                                )}

                                {filteredChats.map((chat) => (
                                    <button
                                        type="button"
                                        key={chat.id}
                                        className={`ft-admin__conversation ${
                                            selectedId === chat.id
                                                ? "active"
                                                : ""
                                        }`}
                                        onClick={() => setSelectedId(chat.id)}
                                    >
                                        <div className="ft-admin__user-avatar">
                                            {chat.userAvatar ? (
                                                <img
                                                    src={chat.userAvatar}
                                                    alt=""
                                                />
                                            ) : (
                                                (chat.userName || "U")[0]
                                            )}
                                        </div>

                                        <div className="ft-admin__conversation-info">
                                            <strong>
                                                {chat.userName || "FiTrack User"}
                                            </strong>
                                            <span>{chat.lastMessage}</span>
                                        </div>

                                        {chat.lastSenderId === chat.userId && (
                                            <span
                                                className="ft-admin__unanswered"
                                                title="Awaiting response"
                                            />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </aside>

                        <section
                            className={`ft-admin__chat-area ${
                                selectedId ? "has-selection" : ""
                            }`}
                        >
                            {selectedId ? (
                                <>
                                    <div className="ft-admin__chat-top">
                                        <button
                                            type="button"
                                            className="ft-admin__back"
                                            onClick={() => setSelectedId(null)}
                                            aria-label="Back to conversations"
                                        >
                                            <FiArrowLeft />
                                        </button>

                                        <div>
                                            <strong>
                                                {selectedChat?.userName ||
                                                    "FiTrack User"}
                                            </strong>
                                            <span>Private support chat</span>
                                        </div>
                                    </div>

                                    <SupportChat
                                        key={selectedId}
                                        user={user}
                                        chatUserId={selectedId}
                                        isAdmin
                                    />
                                </>
                            ) : (
                                <div className="ft-admin__empty">
                                    <FiMessageSquare size={38} />
                                    <h3>Select a conversation</h3>
                                    <p>
                                        Choose a customer from the inbox
                                        to view messages and reply.
                                    </p>
                                </div>
                            )}
                        </section>
                    </div>
            ) : tab === "announcements" ? (
    <div className="ft-admin__announcements">
        <AdminAnnouncementPanel />
    </div>
) : tab === "orders" ? (
    <AdminOrders
        adminUid={user.uid}
        mode="orders"
    />
) : tab === "premium" ? (
    <AdminOrders
        adminUid={user.uid}
        mode="premium"
    />
) : null}
            </div>
        </main>
    );
}
