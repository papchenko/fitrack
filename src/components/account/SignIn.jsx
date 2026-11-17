import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase";
import { authErrorMessage } from "./authErrors";

export default function SignIn({ onSuccess, onForgotPassword, onVerificationRequired }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const submit = async (event) => {
        event.preventDefault();
        if (loading) return;
        setLoading(true);
        setError("");
        try {
            const credential = await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
            await credential.user.reload();
            await credential.user.getIdToken(true);
            if (!credential.user.emailVerified) {
                onVerificationRequired?.();
                return;
            }
            onSuccess?.();
        } catch (err) {
            setError(authErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    return (
        <form className="ft-auth-form" onSubmit={submit}>
            <label htmlFor="ft-signin-email">Email</label>
            <input id="ft-signin-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" placeholder="you@example.com" required />
            <label htmlFor="ft-signin-password">Password</label>
            <input id="ft-signin-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" placeholder="Password" required />
            <div className="ft-auth-form__links">
                <button type="button" onClick={() => onForgotPassword?.(email)}>Forgot password?</button>
            </div>
            {error && <p className="ft-auth-error" role="alert">{error}</p>}
            <button type="submit" disabled={loading}>{loading ? "Signing in..." : "Sign In"}</button>
        </form>
    );
}
