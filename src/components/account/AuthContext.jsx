import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
import { doc, onSnapshot, serverTimestamp, updateDoc } from "firebase/firestore";
import { auth, db } from "../../firebase";
import { ensureUserProfile } from "./profileSetup";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [pendingUser, setPendingUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const unsubscribeProfile = useRef(null);
    const generation = useRef(0);

    const clearProfile = useCallback(() => {
        unsubscribeProfile.current?.();
        unsubscribeProfile.current = null;
    }, []);

    const loadSession = useCallback((firebaseUser) => {
        const token = ++generation.current;
        clearProfile();
        setUser(null);

        if (!firebaseUser) {
            setPendingUser(null);
            setLoading(false);
            return;
        }

        if (!firebaseUser.emailVerified) {
            setPendingUser({ uid: firebaseUser.uid, email: firebaseUser.email });
            setLoading(false);
            return;
        }

        setPendingUser(null);
        setLoading(true);
        const profileRef = doc(db, "users", firebaseUser.uid);
        unsubscribeProfile.current = onSnapshot(profileRef, (snapshot) => {
            if (token !== generation.current) return;
            const data = snapshot.exists() ? snapshot.data() : {};
            const premium = data.premiumPackage || null;
            const rawExpiry = premium?.expiresAt;
            const expiry = rawExpiry?.toDate?.() || (rawExpiry ? new Date(rawExpiry) : null);
            const expired = Boolean(premium?.active && expiry && !Number.isNaN(expiry.getTime()) && Date.now() >= expiry.getTime());
            if (expired) {
                updateDoc(profileRef, { "premiumPackage.active": false }).catch(console.error);
            }
            setUser({
                ...firebaseUser,
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                emailVerified: true,
                username: data.username || firebaseUser.displayName || firebaseUser.email,
                avatarUrl: data.avatarUrl || firebaseUser.photoURL || "",
                lastAvatarUpdate: data.lastAvatarUpdate || null,
                lastNameUpdate: data.lastNameUpdate || null,
                teamRuns: data.teamRuns || [],
                premiumPackage: premium ? { ...premium, active: expired ? false : premium.active } : null,
                isAdmin: data.isAdmin === true,
            });
            setLoading(false);
        }, (error) => {
            if (token !== generation.current) return;
            console.error("Profile subscription:", error);
            setUser(null);
            setLoading(false);
        });
    }, [clearProfile]);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, loadSession, (error) => {
            console.error("Firebase auth state:", error);
            setLoading(false);
        });
        return () => {
            ++generation.current;
            clearProfile();
            unsubscribe();
        };
    }, [loadSession, clearProfile]);

    const refreshAuthUser = useCallback(async () => {
        const current = auth.currentUser;
        if (!current) {
            loadSession(null);
            return false;
        }
        await current.reload();
        await current.getIdToken(true);
        const refreshed = auth.currentUser;
        if (refreshed?.emailVerified) {
            try {
                await ensureUserProfile(refreshed);
            } catch (error) {
                console.error("Profile setup after verification:", error);
            }
        }
        loadSession(refreshed);
        return Boolean(refreshed?.emailVerified);
    }, [loadSession]);

    useEffect(() => {
        if (!user?.uid) return;
        const ref = doc(db, "users", user.uid);
        const touch = () => updateDoc(ref, { lastActiveAt: serverTimestamp() }).catch(console.error);
        touch();
        const timer = setInterval(() => {
            if (document.visibilityState === "visible") touch();
        }, 60000);
        const onVisibility = () => {
            if (document.visibilityState === "visible") touch();
        };
        document.addEventListener("visibilitychange", onVisibility);
        return () => {
            clearInterval(timer);
            document.removeEventListener("visibilitychange", onVisibility);
        };
    }, [user?.uid]);

    return (
        <AuthContext.Provider value={{
            user, pendingUser, loading, refreshAuthUser,
            signOut: () => firebaseSignOut(auth),
        }}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
