import { useEffect, useState } from "react";
import { sendEmailVerification } from "firebase/auth";
import { auth } from "../../firebase";
import { useAuth } from "./AuthContext";
import { authErrorMessage } from "./authErrors";

export default function VerifyEmail({ onVerified, onBack, initialMessage = "" }) {
    const { pendingUser, refreshAuthUser, signOut } = useAuth();
    const [checking, setChecking] = useState(false);
    const [sending, setSending] = useState(false);
    const [message, setMessage] = useState(initialMessage);
    const [error, setError] = useState("");

    useEffect(() => { if (initialMessage) setMessage(initialMessage); }, [initialMessage]);

    const check = async () => {
        if (checking) return;
        setChecking(true);
        setError("");
        setMessage("");
        try {
            const verified = await refreshAuthUser();
            if (verified) onVerified?.();
            else setMessage("Not verified yet. Open the link in your email, then click Check again.");
        } catch (err) {
            setError(authErrorMessage(err));
        } finally {
            setChecking(false);
        }
    };

    const resend = async () => {
        if (sending) return;
        setSending(true);
        setError("");
        setMessage("");
        try {
            if (!auth.currentUser) throw new Error("No account is currently signed in.");
            await sendEmailVerification(auth.currentUser);
            setMessage("Verification email sent. Check your inbox and spam folder.");
        } catch (err) {
            setError(authErrorMessage(err));
        } finally {
            setSending(false);
        }
    };

    const switchAccount = async () => {
        try {
            await signOut();
            onBack?.();
        } catch (err) {
            setError(authErrorMessage(err));
        }
    };

    return (
        <div className="ft-auth-flow">
            <h3>Verify your email</h3>
            <p>We sent a verification link to <strong>{pendingUser?.email || auth.currentUser?.email || "your email"}</strong>. Follow it, then return here to continue.</p>
            {message && <p className="ft-auth-success" role="status">{message}</p>}
            {error && <p className="ft-auth-error" role="alert">{error}</p>}
            <button type="button" className="ft-auth-primary" onClick={check} disabled={checking}>{checking ? "Checking..." : "I've verified my email"}</button>
            <button type="button" className="ft-auth-text-button" onClick={resend} disabled={sending}>{sending ? "Sending..." : "Resend verification email"}</button>
            <button type="button" className="ft-auth-text-button" onClick={switchAccount}>Use another account</button>
        </div>
    );
}
