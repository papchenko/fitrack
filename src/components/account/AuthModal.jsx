
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import SignUp from "./SignUp";
import SignIn from "./SignIn";
import VerifyEmail from "./VerifyEmail";
import ForgotPassword from "./ForgotPassword";
import GoogleLoginButton from "./GoogleLoginButton";

import { useAuth } from "./AuthContext";

import "./AuthModal.scss";

export default function AuthModal({ isOpen, onClose }) {
    const { pendingUser, user } = useAuth();

    const [mode, setMode] = useState("signin");
    const [resetEmail, setResetEmail] = useState("");
    const [verificationMessage, setVerificationMessage] = useState("");

    useEffect(() => {
        if (!isOpen) return;

        setMode(pendingUser ? "verify" : "signin");
    }, [isOpen, pendingUser?.uid]);

    useEffect(() => {
        if (!isOpen) return;

        const previousOverflow = document.body.style.overflow;

        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [isOpen]);

    useEffect(() => {
        if (isOpen && user && !pendingUser) {
            onClose?.();
        }
    }, [isOpen, user, pendingUser, onClose]);

    if (!isOpen) return null;

    const openVerification = (message = "") => {
        setVerificationMessage(message);
        setMode("verify");
    };

    const openForgotPassword = (email = "") => {
        setResetEmail(email);
        setMode("forgot");
    };

    const closeModal = () => {
        setMode("signin");
        setVerificationMessage("");
        setResetEmail("");
        onClose?.();
    };

    return createPortal(
        <div
            className="modal-backdrop"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                    closeModal();
                }
            }}
        >
            <div
                className="modal-container"
                role="dialog"
                aria-modal="true"
                aria-label="FiTrack authentication"
            >
                <button
                    type="button"
                    className="close-btn"
                    onClick={closeModal}
                    aria-label="Close"
                >
                    &times;
                </button>

                <div className="modal-header">
                    <div className="modal-brand">
                    </div>

                    {(mode === "signin" || mode === "signup") && (
                        <div className="modal-tabs">
                            <button
                                type="button"
                                className={mode === "signin" ? "active" : ""}
                                onClick={() => setMode("signin")}
                            >
                                Sign In
                            </button>

                            <button
                                type="button"
                                className={mode === "signup" ? "active" : ""}
                                onClick={() => setMode("signup")}
                            >
                                Sign Up
                            </button>
                        </div>
                    )}
                </div>

                <div className="modal-content pt-3">
                    {mode === "signin" && (
                        <SignIn
                            onSuccess={closeModal}
                            onForgotPassword={openForgotPassword}
                            onVerificationRequired={openVerification}
                        />
                    )}

                    {mode === "signup" && (
                        <SignUp
                            onVerificationRequired={openVerification}
                        />
                    )}

                    {mode === "verify" && (
                        <VerifyEmail
                            initialMessage={verificationMessage}
                            onVerified={closeModal}
                            onBack={() => {
                                setVerificationMessage("");
                                setMode("signin");
                            }}
                        />
                    )}

                    {mode === "forgot" && (
                        <ForgotPassword
                            initialEmail={resetEmail}
                            onBack={() => setMode("signin")}
                        />
                    )}

                    {(mode === "signin" || mode === "signup") && (
                        <div className="google-login-wrapper">
                            <GoogleLoginButton
                                onSuccess={closeModal}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
}
