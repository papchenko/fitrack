
import { useState } from "react";
import { signInWithPopup } from "firebase/auth";

import { auth, googleProvider } from "../../firebase";
import { ensureUserProfile } from "./profileSetup";
import { authErrorMessage } from "./authErrors";

export default function GoogleLoginButton({ onSuccess }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleGoogleSignIn = async () => {
        if (loading) return;

        setLoading(true);
        setError("");

        try {
            const result = await signInWithPopup(
                auth,
                googleProvider
            );

            const firebaseUser = result.user;

            const email = firebaseUser.email || "";

            const username =
                firebaseUser.displayName?.trim() ||
                email.split("@")[0] ||
                "FiTrack User";

            await ensureUserProfile(firebaseUser, username);

            onSuccess?.();
        } catch (err) {
            console.error("Google authentication:", err);

            setError(authErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="ft-google-auth">
            {error && (
                <p className="ft-auth-error" role="alert">
                    {error}
                </p>
            )}

            <button
                type="button"
                className="google-btn"
                onClick={handleGoogleSignIn}
                disabled={loading}
            >
                {loading
                    ? "Connecting..."
                    : "Sign in with Google"}
            </button>
        </div>
    );
}
