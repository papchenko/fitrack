import { useEffect, useState } from "react";

const ONLINE_TIMEOUT = 2 * 60 * 1000;

const toDate = (value) => {
    if (!value) return null;

    const date = value.toDate?.() ??
        new Date(value.seconds ? value.seconds * 1000 : value);

    return Number.isNaN(date.getTime()) ? null : date;
};

export const getPresence = (lastActiveAt, now = Date.now()) => {
    const date = toDate(lastActiveAt);

    if (!date) {
        return { online: false, label: "Last seen unavailable" };
    }

    const diff = Math.max(0, now - date.getTime());
    const minutes = Math.floor(diff / 60000);

    if (diff < ONLINE_TIMEOUT) {
        return { online: true, label: "Online" };
    }

    if (minutes < 60) {
        return {
            online: false,
            label: `Last seen ${minutes} min ago`,
        };
    }

    if (minutes < 1440) {
        return {
            online: false,
            label: `Last seen ${Math.floor(minutes / 60)} h ago`,
        };
    }

    return {
        online: false,
        label: `Last seen ${date.toLocaleDateString("en-GB")}`,
    };
};

export default function UserPresence({ lastActiveAt, showText = true }) {
    const [now, setNow] = useState(Date.now());

    useEffect(() => {
        const interval = setInterval(() => setNow(Date.now()), 30000);
        return () => clearInterval(interval);
    }, []);

    const { online, label } = getPresence(lastActiveAt, now);

    return (
        <span
            className={`ft-user-presence ${online ? "is-online" : "is-offline"}`}
            title={label}
        >
            <span className="ft-user-presence__dot" aria-hidden="true" />
            {showText && <span className="ft-user-presence__label">{label}</span>}
        </span>
    );
}