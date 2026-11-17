const errors = {
    "auth/email-already-in-use": "This email is already registered. Sign in or reset your password.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/weak-password": "Choose a stronger password.",
    "auth/password-does-not-meet-requirements": "Password does not meet the Firebase password policy.",
    "auth/invalid-credential": "Incorrect email or password.",
    "auth/wrong-password": "Incorrect email or password.",
    "auth/user-not-found": "Incorrect email or password.",
    "auth/too-many-requests": "Too many requests. Please try again later.",
    "auth/network-request-failed": "Network error. Check your connection.",
    "auth/operation-not-allowed": "This sign-in method is disabled in Firebase.",
    "auth/unauthorized-continue-uri": "This domain is not authorized in Firebase Authentication.",
    "auth/invalid-continue-uri": "Invalid email action redirect URL.",
    "auth/expired-action-code": "This email link has expired. Request a new one.",
    "auth/invalid-action-code": "This email link is invalid or has already been used.",
    "auth/requires-recent-login": "Please sign in again and retry.",
    "permission-denied": "Firestore access denied. Check security rules.",
};

export const authErrorMessage = (error) => errors[error?.code] || "Something went wrong. Please try again.";

// Firebase-hosted email action pages work without a custom React route.
// Do not add a redirect URL until its destination is deployed and authorized.
