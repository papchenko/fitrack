import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../firebase";
import { authErrorMessage } from "./authErrors";

export default function ForgotPassword({ initialEmail = "", onBack }) {
    const [email, setEmail] = useState(initialEmail);
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState("");

    const submit = async (event) => {
        event.preventDefault();
        if (loading) return;
        setLoading(true);
        setError("");
        try {
            await sendPasswordResetEmail(auth, email.trim().toLowerCase());
            // Generic response prevents email account enumeration.
            setSent(true);
        } catch (err) {
            if (err.code === "auth/user-not-found") setSent(true);
            else setError(authErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="ft-auth-flow">
            <h3>Reset password</h3>
            <p>Enter your email and we’ll send you a link to set a new password.</p>
            {sent ? (
                <p className="ft-auth-success" role="status">If an account exists for this email, a password reset link has been sent. Check your inbox and spam folder.</p>
            ) : (
                <form className="ft-auth-form" onSubmit={submit}>
                    <label htmlFor="ft-reset-email">Email</label>
                    <input id="ft-reset-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required placeholder="you@example.com" />
                    {error && <p className="ft-auth-error" role="alert">{error}</p>}
                    <button type="submit" disabled={loading}>{loading ? "Sending..." : "Send reset link"}</button>
                </form>
            )}
            <button type="button" className="ft-auth-text-button" onClick={onBack}>Back to Sign In</button>
        </div>
    );
}
