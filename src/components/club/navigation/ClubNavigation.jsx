import { Link } from "react-router-dom";

import "./ClubNavigation.scss";

const navigationItems = [
  {
    title: "News",
    description: "Running news and updates",
    path: "/club/news",
  },
  {
    title: "Events",
    description: "Meetings and others",
    path: "/club/events",
  },
  {
    title: "Community",
    description: "Talk with other runners",
    path: "/club/community",
  },
  {
    title: "Articles",
    description: "Training, nutrition and more",
    path: "/club/articles",
  },
];

export default function ClubNavigation() {
  return (
    <section className="club-navigation">
      <div className="club-navigation__grid">
        {navigationItems.map((item) => (
          <Link
            to={item.path}
            className="club-navigation__item"
            key={item.title}>
            <div>
              <h2>{item.title}</h2>

              <p>{item.description}</p>
            </div>

            <span className="club-navigation__arrow">→</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
