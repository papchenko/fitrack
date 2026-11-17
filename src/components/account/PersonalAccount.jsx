import { useEffect, useId, useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import axios from "axios";
import { FiUser, FiAward, FiCalendar, FiMail, FiLogOut, FiCamera, FiCheck, FiX, FiEdit2 } from "react-icons/fi";
import { RiVerifiedBadgeFill } from "react-icons/ri";

import { useAuth } from "./AuthContext";
import { db } from "../../firebase";
import MyRaceTickets from "../pages/races/MyRaceTickets";
import "./personalaccount.scss";

const TABS = [
    { id: "profile", label: "Profile", Icon: FiUser },
    { id: "premium", label: "Premium", Icon: FiAward },
    { id: "tickets", label: "My Tickets", Icon: FiCalendar },
];

const toDate = (value) => {
    if (!value) return null;
    if (typeof value.toDate === "function") return value.toDate();
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
};

export default function PersonalAccount() {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const tabsId = useId();

    const [activeTab, setActiveTab] = useState("profile");
    const [username, setUsername] = useState(user?.username || "");
    const [newUsername, setNewUsername] = useState(user?.username || "");
    const [editingName, setEditingName] = useState(false);
    const [nameAvailableAt, setNameAvailableAt] = useState(null);
    const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || "");
    const [avatarAvailableAt, setAvatarAvailableAt] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [savingName, setSavingName] = useState(false);

    useEffect(() => {
        if (!user) {
            navigate("/", { replace: true });
            return;
        }

        let cancelled = false;
        const load = async () => {
            try {
                const snapshot = await getDoc(doc(db, "users", user.uid));
                if (!snapshot.exists() || cancelled) return;
                const data = snapshot.data();
                const currentName = data.username || user.username || user.email?.split("@")[0] || "User";
                setUsername(currentName);
                setNewUsername(currentName);
                setAvatarUrl(data.avatarUrl || user.avatarUrl || "");
                const nameChanged = toDate(data.lastNameUpdate);
                const avatarChanged = toDate(data.lastAvatarUpdate);
                setNameAvailableAt(nameChanged ? nameChanged.getTime() + 7 * 86400000 : null);
                setAvatarAvailableAt(avatarChanged ? avatarChanged.getTime() + 24 * 3600000 : null);
            } catch (error) {
                if (!cancelled) {
                    console.error(error);
                    toast.error("Failed to load account");
                }
            }
        };
        load();
        return () => { cancelled = true; };
    }, [user?.uid, navigate]);

    if (!user) return null;

    const displayName = username || user.username || user.email?.split("@")[0] || "User";
    const avatarLetter = Array.from(displayName)[0] || "?";
    const canChangeName = !nameAvailableAt || Date.now() >= nameAvailableAt;
    const canChangeAvatar = !avatarAvailableAt || Date.now() >= avatarAvailableAt;
    const daysLeftName = canChangeName ? 0 : Math.ceil((nameAvailableAt - Date.now()) / 86400000);
    const hoursLeftAvatar = canChangeAvatar ? 0 : Math.ceil((avatarAvailableAt - Date.now()) / 3600000);
    const packageInfo = user.premiumPackage;
    const isPremium = Boolean(packageInfo?.active && packageInfo?.title === "Pro");
    const isActiveMember = Boolean(packageInfo?.active);
    const premiumTitle = isActiveMember ? packageInfo?.title || "Premium" : "Free";
    const premiumFeatures = Array.isArray(packageInfo?.features) ? packageInfo.features : [];
    const premiumExpiry = toDate(packageInfo?.expiresAt);

    const saveUsername = async () => {
        if (savingName) return;
        if (!canChangeName) return toast.info(`Change available in ${daysLeftName} day(s)`);
        const value = newUsername.trim();
        if (!value) return toast.error("Enter username");
        if (value === displayName) {
            setEditingName(false);
            return;
        }
        setSavingName(true);
        try {
            const now = new Date();
            await updateDoc(doc(db, "users", user.uid), {
                username: value,
                lastNameUpdate: now,
            });
            setUsername(value);
            setNewUsername(value);
            setNameAvailableAt(now.getTime() + 7 * 86400000);
            setEditingName(false);
            toast.success("Username updated");
        } catch (error) {
            console.error(error);
            toast.error("Failed to update username");
        } finally {
            setSavingName(false);
        }
    };

    const uploadAvatar = async (event) => {
        const file = event.target.files?.[0];
        event.target.value = "";
        if (!file || uploading) return;
        if (!canChangeAvatar) return toast.info(`Change available in ${hoursLeftAvatar} hour(s)`);
        if (!file.type.startsWith("image/")) return toast.error("Choose an image file");

        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "y8wvdb5c");
        setUploading(true);
        setUploadProgress(0);
        try {
            const response = await axios.post(
                "https://api.cloudinary.com/v1_1/dggvnbw4a/image/upload",
                formData,
                {
                    onUploadProgress: ({ loaded, total }) => {
                        if (total) setUploadProgress(Math.round((loaded / total) * 100));
                    },
                }
            );
            const url = response.data.secure_url;
            const now = new Date();
            await updateDoc(doc(db, "users", user.uid), {
                avatarUrl: url,
                lastAvatarUpdate: now,
            });
            setAvatarUrl(url);
            setAvatarAvailableAt(now.getTime() + 24 * 3600000);
            toast.success("Avatar updated");
        } catch (error) {
            console.error(error);
            toast.error("Failed to upload avatar");
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
    };

    const handleSignOut = async () => {
        try {
            await signOut();
            navigate("/");
        } catch (error) {
            console.error(error);
            toast.error("Failed to sign out");
        }
    };

    return (
        <main className="account-page">
            <div className="account-container">
                <header className="account-heading">
                    <h1>My Account</h1>
                    <button type="button" className="account-signout" onClick={handleSignOut}>
                        <FiLogOut aria-hidden="true" />
                        <span>Sign out</span>
                    </button>
                </header>

                <div className="account-shell">
                    <nav className="account-tabs" aria-label="Account sections" role="tablist">
                        {TABS.map(({ id, label, Icon }) => (
                            <button
                                key={id}
                                id={`${tabsId}-${id}-tab`}
                                type="button"
                                role="tab"
                                aria-selected={activeTab === id}
                                aria-controls={`${tabsId}-${id}-panel`}
                                className={`account-tab${activeTab === id ? " is-active" : ""}`}
                                onClick={() => setActiveTab(id)}
                            >
                                <Icon aria-hidden="true" />
                                <span>{label}</span>
                            </button>
                        ))}
                    </nav>

                    <div className="account-content">
                        {activeTab === "profile" && (
                            <section className="account-panel" id={`${tabsId}-profile-panel`} role="tabpanel" aria-labelledby={`${tabsId}-profile-tab`}>
                                <div className="account-panel-heading">
                                    <h2>Profile</h2>
                                </div>
                                <div className="account-profile-row">
                                    <div className="account-avatar">
                                        {avatarUrl ? <img src={avatarUrl} alt={displayName} /> : <span>{avatarLetter}</span>}
                                        {isPremium && <RiVerifiedBadgeFill className="account-avatar-badge" aria-label="Verified" />}
                                        {canChangeAvatar && (
                                            <label className="account-avatar-edit" title="Change avatar">
                                                <FiCamera aria-hidden="true" />
                                                <input type="file" accept="image/*" onChange={uploadAvatar} disabled={uploading} aria-label="Upload avatar" />
                                            </label>
                                        )}
                                    </div>
                                    <div className="account-profile-identity">
                                        <strong>{displayName}</strong>
                                        <span>{user.email}</span>
                                        {!canChangeAvatar && <small>Avatar change available in {hoursLeftAvatar} hour(s)</small>}
                                    </div>
                                </div>
                                {uploading && (
                                    <div className="account-upload" aria-label="Avatar upload progress">
                                        <div><span>Uploading avatar</span><span>{uploadProgress}%</span></div>
                                        <progress max="100" value={uploadProgress} />
                                    </div>
                                )}
                                <div className="account-field">
                                    <div className="account-field-label"><FiUser aria-hidden="true" /><span>Username</span></div>
                                    {editingName ? (
                                        <div className="account-edit-row">
                                            <input value={newUsername} onChange={(e) => setNewUsername(e.target.value)} maxLength={30} disabled={!canChangeName || savingName} aria-label="New username" autoFocus onKeyDown={(e) => { if (e.key === "Enter") saveUsername(); if (e.key === "Escape") setEditingName(false); }} />
                                            <button type="button" onClick={saveUsername} disabled={savingName || !canChangeName} aria-label="Save username"><FiCheck /></button>
                                            <button type="button" onClick={() => { setNewUsername(displayName); setEditingName(false); }} aria-label="Cancel"><FiX /></button>
                                        </div>
                                    ) : (
                                        <div className="account-field-value">
                                            <span>{displayName}</span>
                                            {canChangeName && <button type="button" onClick={() => { setNewUsername(displayName); setEditingName(true); }} aria-label="Edit username"><FiEdit2 /></button>}
                                        </div>
                                    )}
                                    {!canChangeName && <small>Username change available in {daysLeftName} day(s)</small>}
                                </div>
                                <div className="account-field">
                                    <div className="account-field-label"><FiMail aria-hidden="true" /><span>Email</span></div>
                                    <div className="account-field-value"><span>{user.email}</span></div>
                                </div>
                            </section>
                        )}

                        {activeTab === "premium" && (
                            <section className="account-panel" id={`${tabsId}-premium-panel`} role="tabpanel" aria-labelledby={`${tabsId}-premium-tab`}>
                                <div className="account-panel-heading"><h2>Premium</h2></div>
                                <div className="account-membership">
                                    <div className="account-membership-main">
                                        <div className="account-membership-icon"><FiAward aria-hidden="true" /></div>
                                        <div><span>Current plan</span><strong>{premiumTitle}</strong></div>
                                    </div>
                                    <span className={`account-plan-status${isActiveMember ? " is-active" : ""}`}>
                                        {isActiveMember ? "Active" : "Free"}
                                    </span>
                                </div>
                                {isActiveMember && premiumFeatures.length > 0 && (
                                    <ul className="account-benefits">
                                        {premiumFeatures.map((feature, index) => (
                                            <li key={index}><FiCheck aria-hidden="true" /><span>{typeof feature === "string" ? feature : feature.text}</span></li>
                                        ))}
                                    </ul>
                                )}
                                {isActiveMember && premiumExpiry && (
                                    <div className="account-expiry"><FiCalendar aria-hidden="true" /><span>Valid until</span><strong>{premiumExpiry.toLocaleDateString()}</strong></div>
                                )}
                                {!isActiveMember && <p className="account-muted">No active premium membership.</p>}
                            </section>
                        )}

                        {activeTab === "tickets" && (
                            <section className="account-panel account-panel-tickets" id={`${tabsId}-tickets-panel`} role="tabpanel" aria-labelledby={`${tabsId}-tickets-tab`}>
                                <div className="account-panel-heading"><h2>My Race Tickets</h2></div>
                                <MyRaceTickets />
                            </section>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
