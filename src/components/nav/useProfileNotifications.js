import { useEffect, useState } from "react";
import {
    collection,
    doc,
    onSnapshot,
    query,
    where,
} from "firebase/firestore";
import { db } from "../../firebase";

export default function useProfileNotifications(userId) {
    const [friends, setFriends] = useState([]);
    const [requestCount, setRequestCount] = useState(0);
    const [unreadByFriend, setUnreadByFriend] = useState({});

    useEffect(() => {
        if (!userId) {
            setFriends([]);
            setRequestCount(0);
            setUnreadByFriend({});
            return;
        }

        return onSnapshot(
            doc(db, "friends", userId),
            (snapshot) => {
                const data = snapshot.data() || {};

                const friendIds = Array.isArray(data.friends)
                    ? [...new Set(data.friends.filter(
                        (id) => id && id !== userId
                    ))]
                    : [];

                const requests = Array.isArray(data.requests)
                    ? data.requests.filter(
                        (id) => id && id !== userId
                    )
                    : [];

                setFriends(friendIds);
                setRequestCount(requests.length);
            },
            (error) => {
                console.error("Profile friends notifications:", error);
            }
        );
    }, [userId]);

    useEffect(() => {
        setUnreadByFriend({});

        if (!userId || !friends.length) return;

        const unsubscribers = friends.map((friendId) => {
            const chatId = [userId, friendId].sort().join("_");

            const messagesRef = collection(
                db,
                "messages",
                chatId,
                "messages"
            );

            const unreadQuery = query(
                messagesRef,
                where("receiverId", "==", userId),
                where("seen", "==", false)
            );

            return onSnapshot(
                unreadQuery,
                (snapshot) => {
                    setUnreadByFriend((previous) => ({
                        ...previous,
                        [friendId]: snapshot.size,
                    }));
                },
                (error) => {
                    console.error("Unread messages:", error);
                }
            );
        });

        return () => {
            unsubscribers.forEach((unsubscribe) => unsubscribe());
        };
    }, [userId, friends]);

    const unreadCount = Object.values(unreadByFriend).reduce(
        (total, count) => total + count,
        0
    );

    return {
        unreadCount,
        requestCount,
    };
}