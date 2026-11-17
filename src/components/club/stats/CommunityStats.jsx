import { useEffect, useState } from "react";

import {
  FaUsers,
  FaRunning,
  FaRoute,
  FaTrophy,
  FaFlagCheckered,
  FaBolt,
} from "react-icons/fa";

import { getCommunityStats } from "./communityStatsService";

import "./CommunityStats.scss";

export default function CommunityStats() {
  const [stats, setStats] = useState({
    users: null,
    runsToday: null,
    distanceToday: null,
    teamRaces: null,
    challenges: null,
    activeUsers: null,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadStats() {
      try {
        setLoading(true);

        const data = await getCommunityStats();

        if (!isMounted) return;

        setStats(data);
      } catch (error) {
        console.error("Failed to load Community Stats:", error);

        if (!isMounted) return;

        setStats({
          users: null,
          runsToday: null,
          distanceToday: null,
          teamRaces: null,
          challenges: null,
          activeUsers: null,
        });
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadStats();

    return () => {
      isMounted = false;
    };
  }, []);

  const statsItems = [
    // {
    //   id: "users",
    //   icon: <FaUsers />,
    //   label: "Users",
    //   value: stats.users,
    // },
    {
      id: "runs",
      icon: <FaRunning />,
      label: "Runs Today",
      value: stats.runsToday,
    },
    {
      id: "distance",
      icon: <FaRoute />,
      label: "Distance Today",
      value:
        stats.distanceToday !== null
          ? `${stats.distanceToday.toFixed(1)} km`
          : null,
    },
    {
      id: "races",
      icon: <FaFlagCheckered />,
      label: "Team Races",
      value: stats.teamRaces,
    },
    {
      id: "challenges",
      icon: <FaTrophy />,
      label: "Running Plans (Challenges)",
      value: stats.challenges,
    },
    {
      id: "active",
      // icon: <FaBolt />,
      icon: <FaUsers />,
      label: "Active Users",
      value: stats.activeUsers,
    },
  ];

  return (
    <section className="community-stats">
      <div className="community-stats__container">
        <div className="community-stats__heading">
          {/* <span className="community-stats__eyebrow">
            FiTrack COMMUNITY
          </span> */}

          <h2>Community Stats</h2>

          <p>
            See what is happening across the FiTrack community.
          </p>
        </div>

        <div className="community-stats__grid">
          {statsItems.map((item) => (
            <div
              className="community-stat"
              key={item.id}
            >
              <div className="community-stat__icon">
                {item.icon}
              </div>

              <div className="community-stat__content">
                <span className="community-stat__label">
                  {item.label}
                </span>

                <strong className="community-stat__value">
                  {loading ? (
                    <span className="community-stat__loading">
                      —
                    </span>
                  ) : item.value !== null &&
                    item.value !== undefined ? (
                    item.value
                  ) : (
                    "—"
                  )}
                </strong>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}