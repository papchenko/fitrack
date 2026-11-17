
import { useNavigate } from "react-router-dom";
import {
    FaDumbbell,
    FaHiking,
    FaWalking,
    FaSwimmer,
    FaSkiing,
} from "react-icons/fa";
import { IoMdBicycle } from "react-icons/io";
import { RiRunLine } from "react-icons/ri";
import { TbBallTennis, TbKayak } from "react-icons/tb";
import { FiArrowLeft } from "react-icons/fi";

import "./recordActivity.scss";

const GROUPS = [
    {
        name: "Outdoor & GPS",
        subtitle: "Track your distance and route",
        activities: [
            {
                id: "running",
                label: "Running",
                detail: "Pace · Steps · GPS",
                path: "/running",
                Icon: RiRunLine,
            },
            {
                id: "walking",
                label: "Walking",
                detail: "Steps · Distance · GPS",
                path: "/walking",
                Icon: FaWalking,
            },
            {
                id: "cycling",
                label: "Cycling",
                detail: "Speed · Distance · GPS",
                path: "/cycling",
                Icon: IoMdBicycle,
            },
            {
                id: "hiking",
                label: "Hiking",
                detail: "Trail · Distance · GPS",
                path: "/hiking",
                Icon: FaHiking,
            },
        ],
    },
    {
        name: "Water Sports",
        subtitle: "Record your time on the water",
        activities: [
            {
                id: "kayaking",
                label: "Kayaking",
                detail: "Speed · Distance · GPS",
                path: "/kayaking",
                Icon: TbKayak,
            },
            {
                id: "swimming",
                label: "Swimming",
                detail: "Distance · Pace · GPS",
                path: "/swimming",
                Icon: FaSwimmer,
            },
        ],
    },
    {
        name: "Winter Sports",
        subtitle: "Track your adventures on snow",
        activities: [
            {
                id: "winter-sports",
                label: "Skiing & Snowboarding",
                detail: "Speed · Distance · GPS",
                path: "/winter-sports",
                Icon: FaSkiing,
            },
        ],
    },
    {
        name: "Training & Sports",
        subtitle: "Stay active, indoors and outdoors",
        activities: [
            {
                id: "workout",
                label: "Workout",
                detail: "Time · Calories · Sets",
                path: "/workout",
                Icon: FaDumbbell,
            },
            {
                id: "tennis",
                label: "Tennis",
                detail: "Time · Calories · Match",
                path: "/tennis",
                Icon: TbBallTennis,
            },
        ],
    },
];

export default function RecordActivity() {
    const navigate = useNavigate();

    const choose = (activity) => {
        navigate(activity.path, {
            state: {
                autoStart: false,
            },
        });
    };

    return (
        <main className="recrun-record">
            <div className="recrun-record__shell">
                <header className="recrun-record__header">
                    <button
                        type="button"
                        aria-label="Back"
                        onClick={() => navigate(-1)}
                    >
                        <FiArrowLeft />
                    </button>
                </header>

                {GROUPS.map((group) => (
                    <section
                        className="recrun-record__section"
                        key={group.name}
                    >
                        <div className="recrun-record__section-head">
                            <h2>{group.name}</h2>
                            <p>{group.subtitle}</p>
                        </div>

                        <div className="recrun-record__grid">
                            {group.activities.map((activity) => (
                                <button
                                    type="button"
                                    key={activity.id}
                                    className="recrun-record__card"
                                    onClick={() => choose(activity)}
                                >
                                    <span className="recrun-record__icon">
                                        <activity.Icon />
                                    </span>

                                    <span className="recrun-record__card-text">
                                        <strong>
                                            {activity.label}
                                        </strong>
                                        <small>
                                            {activity.detail}
                                        </small>
                                    </span>
                                </button>
                            ))}
                        </div>
                    </section>
                ))}
            </div>
        </main>
    );
}
