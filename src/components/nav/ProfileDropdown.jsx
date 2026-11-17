import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation } from "react-router-dom";
import { FaAngleDown, FaBrain, FaMedal, FaSignOutAlt, FaUserCircle } from "react-icons/fa";
import { RiVerifiedBadgeFill } from "react-icons/ri";
import { FaUserPlus } from "react-icons/fa6";
import { FaMessage } from "react-icons/fa6";
import useProfileNotifications from "./useProfileNotifications";
import {
    canAccessIntelligence,
    getPremiumTier,
} from "../account/premiumAccess";
import "./profileDropdown.scss";

const LINKS = [
    { to: "/personal-account", label: "Personal Account", Icon: FaUserCircle },
    { to: "/messages", label: "Messages", Icon: FaMessage },
    { to: "/intelligence", label: "Intelligence", Icon: FaBrain },
    { to: "/achievements", label: "Achievements", Icon: FaMedal },
];

export default function ProfileDropdown({
    user,
    avatarUrl,
    avatarFallback,
    premiumPackage,
    unreadCount = 0,
    onSignIn,
    onSignOut,
}) {
    const [open, setOpen] = useState(false);
const [position, setPosition] = useState({ top: 70, right: 16 });
const [premiumNow, setPremiumNow] = useState(() => Date.now());
    const triggerRef = useRef(null);
    const panelRef = useRef(null);
    const location = useLocation();
    useEffect(() => {
    const timer = setInterval(() => {
        setPremiumNow(Date.now());
    }, 15000);

    return () => clearInterval(timer);
}, []);

    const {
    unreadCount: liveUnreadCount,
    requestCount,
} = useProfileNotifications(user?.uid);

const messagesCount = Math.max(liveUnreadCount, unreadCount);

const totalNotifications = messagesCount + requestCount;

const formatCount = (count) => count > 99 ? "99+" : count;

    useEffect(() => {
        setOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        if (!open) return;

        const updatePosition = () => {
            const rect = triggerRef.current?.getBoundingClientRect();
            if (!rect) return;
            setPosition({
                top: Math.min(window.innerHeight - 20, rect.bottom + 12),
                right: Math.max(12, window.innerWidth - rect.right),
            });
        };

        const onPointerDown = (event) => {
            if (
                !triggerRef.current?.contains(event.target) &&
                !panelRef.current?.contains(event.target)
            ) setOpen(false);
        };

        const onKeyDown = (event) => {
            if (event.key === "Escape") {
                setOpen(false);
                triggerRef.current?.focus();
            }
        };

        updatePosition();
        document.addEventListener("pointerdown", onPointerDown);
        document.addEventListener("keydown", onKeyDown);
        window.addEventListener("resize", updatePosition);
        window.addEventListener("scroll", updatePosition, true);

        return () => {
            document.removeEventListener("pointerdown", onPointerDown);
            document.removeEventListener("keydown", onKeyDown);
            window.removeEventListener("resize", updatePosition);
            window.removeEventListener("scroll", updatePosition, true);
        };
    }, [open]);

    if (!user) {
        return (
            <button type="button" className="btn sing-up btn-custome text-white rounded-5 px-4 py-2 fs-6 fw-semibold" onClick={onSignIn}>
                Sign In
            </button>
        );
    }

const username =
    user.username ||
    user.displayName ||
    user.email?.split("@")[0] ||
    "Athlete";

const pro = getPremiumTier(
    premiumPackage,
    premiumNow
) === "pro";

const hasIntelligenceAccess = canAccessIntelligence(
    premiumPackage,
    premiumNow
);

const visibleLinks = LINKS.filter((link) => {
    if (link.to === "/intelligence") {
        return hasIntelligenceAccess;
    }

    return true;
});

    return (
        <div className="fitrack-profile">
            <button
                ref={triggerRef}
                type="button"
                className={`fitrack-profile-trigger ${open ? "is-active" : ""}`}
                aria-label="Open account menu"
                aria-haspopup="menu"
                aria-expanded={open}
                onClick={() => setOpen((prev) => !prev)}
            >
                <span className="fitrack-profile-avatar" style={{ width: 34, height: 34, minWidth: 34, maxWidth: 34, minHeight: 34, maxHeight: 34, flex: "0 0 34px", overflow: "visible" }}>
                    {avatarUrl ? <img src={avatarUrl} alt="" style={{ display: "block", width: "100%", height: "100%", maxWidth: "100%", maxHeight: "100%", aspectRatio: "1 / 1", objectFit: "cover", borderRadius: "50%" }} /> : <span>{avatarFallback}</span>}
                    {pro && <RiVerifiedBadgeFill className="fitrack-profile-pro" />}
                </span>
{messagesCount > 0 && (
    <span
        className="fitrack-profile-trigger-count"
        title={`${messagesCount} unread messages`}
    >
        {formatCount(messagesCount)}
    </span>
)}

{requestCount > 0 && (
    <span
        className="fitrack-profile-trigger-request"
        title={`${requestCount} friend requests`}
    >
        <FaUserPlus />
    </span>
)}

{messagesCount === 0 && requestCount === 0 && (
    <FaAngleDown className="fitrack-profile-chevron" />
)}
            </button>

            {open && createPortal(
                <div
                    ref={panelRef}
                    className="fitrack-profile-panel"
                    role="menu"
                    aria-label="Account menu"
                    style={{ top: position.top, right: position.right }}
                >
                    <div className="fitrack-profile-header">
                        <div className="fitrack-profile-header-avatar" style={{ width: 43, height: 43, minWidth: 43, maxWidth: 43, flex: "0 0 43px" }}>
                            {avatarUrl ? <img src={avatarUrl} alt="" style={{ display: "block", width: "100%", height: "100%", maxWidth: "100%", maxHeight: "100%", aspectRatio: "1 / 1", objectFit: "cover", borderRadius: "50%" }} /> : <span>{avatarFallback}</span>}
                        </div>
                        <div className="fitrack-profile-identity">
                            <strong title={username}>{username}</strong>
                            {/* <span title={user.email || ""}>{user.email || "FiTrack member"}</span> */}
                        </div>
                        {pro && <RiVerifiedBadgeFill className="fitrack-profile-header-pro" title="Pro member" />}
                    </div>
<div className="fitrack-profile-links">
   {visibleLinks.map(({ to, label, Icon }) => (
        <div key={to}>
            <Link
                to={to}
                role="menuitem"
                className={`fitrack-profile-link ${
                    location.pathname === to ? "is-current" : ""
                }`}
                onClick={() => setOpen(false)}
            >
                <Icon aria-hidden="true" />
                <span>{label}</span>

                {to === "/messages" && messagesCount > 0 && (
                    <span className="fitrack-profile-menu-count">
                        {formatCount(messagesCount)}
                    </span>
                )}
            </Link>

            {to === "/messages" && requestCount > 0 && (
                <Link
                    to="/messages#friend-requests"
                    role="menuitem"
                    className="fitrack-profile-link fitrack-profile-request-link"
                    onClick={() => setOpen(false)}
                >
                    <FaUserPlus aria-hidden="true" />
                    <span>Friend Requests</span>

                    <span className="fitrack-profile-menu-count is-request">
                        {formatCount(requestCount)}
                    </span>
                </Link>
            )}
        </div>
    ))}
</div>
                    <div className="fitrack-profile-footer">
                        <button
                            type="button"
                            role="menuitem"
                            className="fitrack-profile-link fitrack-profile-logout"
                            onClick={() => {
                                setOpen(false);
                                onSignOut?.();
                            }}
                        >
                            <FaSignOutAlt aria-hidden="true" />
                            <span>Sign Out</span>
                        </button>
                    </div>
                </div>,
                document.body,
            )}
        </div>
    );
}
