import { useState } from "react";
import { createUserWithEmailAndPassword, sendEmailVerification, updateProfile } from "firebase/auth";
import { auth } from "../../firebase";
import { authErrorMessage } from "./authErrors";
import { ensureUserProfile } from "./profileSetup";

export default function SignUp({ onVerificationRequired }) {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const submit = async (event) => {
        event.preventDefault();
        if (loading) return;
        setError("");
        const name = username.trim();
        const address = email.trim().toLowerCase();
        if (name.length < 3) return setError("Username must contain at least 3 characters.");
        if (password.length < 8) return setError("Use at least 8 characters for your password.");
        if (password !== confirmPassword) return setError("Passwords do not match.");
        setLoading(true);
        let createdUser = null;
        try {
            const credential = await createUserWithEmailAndPassword(auth, address, password);
            createdUser = credential.user;
            let emailSent = false;
            try {
                await updateProfile(createdUser, { displayName: name });
            } catch (profileError) {
                console.error("Auth display name:", profileError);
            }
            try {
                await sendEmailVerification(createdUser);
                emailSent = true;
            } catch (mailError) {
                console.error("Verification email:", mailError);
            }
            try {
                await ensureUserProfile(createdUser, { username: name, welcome: true });
            } catch (profileError) {
                // If rules require email verification, refreshAuthUser retries after verification.
                console.error("Profile setup (will retry after verification):", profileError);
            }
            onVerificationRequired?.(emailSent ? "" : "Account created. Verification email could not be sent; use Resend email below.");
        } catch (err) {
            console.error("FiTrack registration error:", err);
            if (createdUser) onVerificationRequired?.("Account created. Please use Resend email.");
            else setError(authErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    return (
        <form className="ft-auth-form" onSubmit={submit}>
            <label htmlFor="ft-signup-name">Username</label>
            <input id="ft-signup-name" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" minLength={3} maxLength={40} placeholder="Username" required />
            <label htmlFor="ft-signup-email">Email</label>
            <input id="ft-signup-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" placeholder="you@example.com" required />
            <label htmlFor="ft-signup-password">Password</label>
            <input id="ft-signup-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" minLength={8} placeholder="At least 8 characters" required />
            <label htmlFor="ft-signup-confirm">Confirm password</label>
            <input id="ft-signup-confirm" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password" minLength={8} placeholder="Repeat password" required />
            {error && <p className="ft-auth-error" role="alert">{error}</p>}
            <button type="submit" disabled={loading}>{loading ? "Creating account..." : "Create account"}</button>
        </form>
    );
}
