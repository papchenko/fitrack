import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { collection, doc, getDoc, onSnapshot, query, where } from "firebase/firestore";
import { FiArrowLeft, FiActivity, FiCalendar, FiClock, FiMapPin, FiUser } from "react-icons/fi";
import { RiVerifiedBadgeFill } from "react-icons/ri";
import { db } from "../../../firebase";
import AddFriendButton from "../../users/AddFriendButton";
import UserPresence from "../../nav/search/UserPresence";
import "./ProfilePage.scss";

const toDate = (value) => {
    if (!value) return null;
    const date = value.toDate?.() ?? new Date(value.seconds ? value.seconds * 1000 : value);
    return Number.isNaN(date.getTime()) ? null : date;
};

const getMinutes = (activity) => {
    const value = Number(activity.durationMinutes ?? activity.duration ?? 0);
    return Number.isFinite(value) && value > 0 ? value : 0;
};

export default function ProfilePage({ usersData }) {
    const { uid } = useParams();
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [activities, setActivities] = useState([]);

useEffect(() => {
    setLoading(true);
    setError("");
    setUserData(null);

    if (!uid) {
        setLoading(false);
        return;
    }

    return onSnapshot(
        doc(db, "users", uid),
        (snapshot) => {
            setUserData(snapshot.exists() ? snapshot.data() : null);
            setLoading(false);
        },
        (error) => {
            console.error("Profile load failed:", error);
            setError("Unable to load this profile.");
            setLoading(false);
        }
    );
}, [uid]);

    useEffect(() => {
        if (!uid) return;
        const q = query(collection(db, "routes"), where("uid", "==", uid));
        return onSnapshot(q, (snapshot) => {
            setActivities(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))
                .filter((item) => item.visibility === "public"));
        }, (err) => {
            console.error("Profile activities load failed:", err);
            setActivities([]);
        });
    }, [uid]);

    const stats = useMemo(() => {
        const distance = activities.reduce((sum, activity) => sum + (Number(activity.distance) || 0), 0);
        const minutes = activities.reduce((sum, activity) => sum + getMinutes(activity), 0);
        return { count: activities.length, distance, hours: minutes / 60 };
    }, [activities]);

    if (loading) return <div className="fit-profile-page"><div className="fit-profile-state">Loading profile...</div></div>;
    if (error || !userData) return (
        <div className="fit-profile-page"><div className="fit-profile-state">
            <FiUser /><h2>{error || "User not found"}</h2>
            <button type="button" onClick={() => navigate(-1)}>Go back</button>
        </div></div>
    );

    const username = userData.username || userData.email?.split("@")[0] || "Athlete";
    const avatarUrl = userData.avatarUrl || "";
    const isPro = userData.premiumPackage?.active === true && userData.premiumPackage?.title === "Pro";
    const joined = toDate(userData.createdAt);

    return (
        <main className="main-wrapper general-wrapper fit-profile-page">
            <div className="fit-profile-layout">
                <button className="fit-profile-back" type="button" onClick={() => navigate(-1)}>
                    <FiArrowLeft /> Back
                </button>
                <section className="fit-profile-hero">
                    {/* <div className="fit-profile-cover"><span>FITRACK / COMMUNITY</span></div> */}
                    <div className="fit-profile-cover"></div>
                    <div className="fit-profile-content">
                        <div className="fit-profile-avatar-area">
                            <div className="fit-profile-avatar-ring">
                                {avatarUrl ? <img src={avatarUrl} alt={username} /> : <span>{Array.from(username)[0]?.toUpperCase() || "?"}</span>}
                                {isPro && <RiVerifiedBadgeFill className="fit-profile-pro-icon" title="Pro member" />}
                            </div>
                            <div className="fit-profile-actions"><AddFriendButton targetUid={uid} /></div>
                        </div>
                        <div className="fit-profile-heading">
                            <div className="fit-profile-name-row"><h1>{username}</h1>{isPro && <span className="fit-profile-pro-label">PRO</span>}</div>
                            <div className="fit-profile-presence">
                                <UserPresence lastActiveAt={userData.lastActiveAt} />
                            </div>
                            <p>FiTrack community member</p>
                            {joined && <span className="fit-profile-joined"><FiCalendar /> Joined {joined.toLocaleDateString("en-GB", { month: "long", year: "numeric" })}</span>}
                        </div>
                    </div>
                </section>
                <section className="fit-profile-section" aria-label="Public activity statistics">
                    <div className="fit-profile-section-title"><div><span>ACTIVITY OVERVIEW</span><h2>Performance</h2></div><p>Public records only</p></div>
                    <div className="fit-profile-stats">
                        <div className="fit-profile-stat"><FiActivity /><strong>{stats.count}</strong><span>Activities</span></div>
                        <div className="fit-profile-stat"><FiMapPin /><strong>{stats.distance.toFixed(1)} <small>km</small></strong><span>Total distance</span></div>
                        <div className="fit-profile-stat"><FiClock /><strong>{stats.hours.toFixed(1)} <small>h</small></strong><span>Activity time</span></div>
                    </div>
                </section>
                {userData.teamRuns?.length > 0 && (
                    <section className="fit-profile-section">
                        <div className="fit-profile-section-title"><div><span>COMMUNITY</span><h2>Registered team runs</h2></div></div>
                        <div className="fit-profile-events">{userData.teamRuns.map((date, index) => <div key={`${date}-${index}`}><FiCalendar /><span>{date}</span></div>)}</div>
                    </section>
                )}
            </div>
        </main>
    );
}
