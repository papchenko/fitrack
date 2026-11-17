
import { useEffect } from "react";
import { createPortal } from "react-dom";
import {
    FaTimes,
    FaDumbbell,
    FaHiking,
    FaWalking,
    FaSwimmer,
    FaSkiing,
} from "react-icons/fa";
import { IoMdBicycle } from "react-icons/io";
import { RiRunLine } from "react-icons/ri";
import { TbBallTennis, TbKayak } from "react-icons/tb";

import "./activitySelectModal.scss";

const ACTIVITY_GROUPS = [
    {
        id: "outdoor",
        title: "Outdoor & GPS",
        subtitle: "Explore, move and track your routes",
        activities: [
            {
                id: "running",
                title: "Running",
                subtitle: "Pace · Steps · GPS",
                Icon: RiRunLine,
            },
            {
                id: "walking",
                title: "Walking",
                subtitle: "Steps · Distance · GPS",
                Icon: FaWalking,
            },
            {
                id: "cycling",
                title: "Cycling",
                subtitle: "Speed · Distance · GPS",
                Icon: IoMdBicycle,
            },
            {
                id: "hiking",
                title: "Hiking",
                subtitle: "Trail · Distance · GPS",
                Icon: FaHiking,
            },
        ],
    },
    {
        id: "water",
        title: "Water Sports",
        subtitle: "Activities on the water",
        activities: [
            {
                id: "kayaking",
                title: "Kayaking",
                subtitle: "Distance · Speed · GPS",
                Icon: TbKayak,
            },
            {
                id: "swimming",
                title: "Swimming",
                subtitle: "Distance · Pace · GPS",
                Icon: FaSwimmer,
            },
        ],
    },
    {
        id: "winter",
        title: "Winter Sports",
        subtitle: "Track your adventures on snow",
        activities: [
            {
                id: "winter-sports",
                title: "Skiing & Snowboarding",
                subtitle: "Speed · Distance · GPS",
                Icon: FaSkiing,
            },
        ],
    },
    {
        id: "fitness",
        title: "Fitness & Training",
        subtitle: "Strength and conditioning",
        activities: [
            {
                id: "workout",
                title: "Workout",
                subtitle: "Time · Calories · Training",
                Icon: FaDumbbell,
            },
        ],
    },
    {
        id: "racket",
        title: "Racket Sports",
        subtitle: "Court sessions and matches",
        activities: [
            {
                id: "tennis",
                title: "Tennis",
                subtitle: "Time · Calories · Match",
                Icon: TbBallTennis,
            },
        ],
    },
];

export default function ActivitySelectModal({
    isOpen,
    onClose,
    onSelect,
}) {
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return createPortal(
        <div
            className="activity-select-overlay"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                    onClose();
                }
            }}
        >
            <div
                className="activity-select-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="activity-select-title"
            >
                <div className="activity-select-header">
                    <div>
                        <h2 id="activity-select-title">
                            Choose activity
                        </h2>
                        <p>
                            Select a discipline to begin your session
                        </p>
                    </div>

                    <button
                        type="button"
                        className="activity-select-close"
                        onClick={onClose}
                        aria-label="Close"
                    >
                        <FaTimes />
                    </button>
                </div>

                <div className="activity-select-groups">
                    {ACTIVITY_GROUPS.map((group) => (
                        <section
                            className="activity-select-group"
                            key={group.id}
                        >
                            <div className="activity-select-group-heading">
                                <h3>{group.title}</h3>
                                <p>{group.subtitle}</p>
                            </div>

                            <div className="activity-select-options">
                                {group.activities.map(
                                    ({
                                        id,
                                        title,
                                        subtitle,
                                        Icon,
                                    }) => (
                                        <button
                                            key={id}
                                            type="button"
                                            className="activity-select-option"
                                            onClick={() => onSelect(id)}
                                        >
                                            <span className="activity-select-icon">
                                                <Icon />
                                            </span>

                                            <strong>{title}</strong>
                                            <small>{subtitle}</small>
                                        </button>
                                    )
                                )}
                            </div>
                        </section>
                    ))}
                </div>

                <p className="activity-select-footer">
                    Your activity will start after selection.
                </p>
            </div>
        </div>,
        document.body
    );
}
