import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase";

const welcomeMessage = (username) => `Hi ${username}!

Welcome to our platform! Here you can:
- Record and share your achievements.
- Challenge yourself and others.
- Participate in competitions and team tournaments.
- Track your workouts.
- Find like-minded friends and get inspired by new records.
- Set goals, collect points, and climb the rankings.`;

export async function ensureUserProfile(firebaseUser, options = {}) {
    const { username: requestedName, welcome = false } = options;
    const uid = firebaseUser.uid;
    const profileRef = doc(db, "users", uid);
    const existing = await getDoc(profileRef);
    const data = existing.exists() ? existing.data() : {};
    const username = (data.username || requestedName || firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "User").trim();

    if (!existing.exists()) {
        await setDoc(profileRef, {
            username,
            email: firebaseUser.email || "",
            createdAt: serverTimestamp(),
            readAnnouncements: [],
        });
    } else if (!data.username) {
        await setDoc(profileRef, { username }, { merge: true });
    }

    // Preserve the legacy usernames collection. This is NOT an atomic uniqueness reservation.
    if (username && (welcome || !existing.exists())) {
        try {
            await setDoc(doc(db, "usernames", username), { email: firebaseUser.email || "" }, { merge: true });
        } catch (error) {
            console.error("Username record:", error);
        }
    }

    // Deterministic ID prevents duplicate welcome notifications on retries.
    if (welcome || !existing.exists()) {
        try {
            const notificationRef = doc(db, "notifications", `welcome_${uid}`);
            const notification = await getDoc(notificationRef);
            if (!notification.exists()) {
                await setDoc(notificationRef, {
                    userId: uid,
                    title: "Welcome to FiTrack!",
                    message: welcomeMessage(username),
                    createdAt: serverTimestamp(),
                    read: false,
                });
            }
        } catch (error) {
            console.error("Welcome notification:", error);
        }
    }
}
