import { useNavigate } from "react-router-dom";
import { FaLock } from "react-icons/fa";

import { useAuth } from "../account/AuthContext";

import ClubHero from "./hero/ClubHero";
import CommunityStats from "./stats/CommunityStats";
import ClubNavigation from "./navigation/ClubNavigation";
import NewsSection from "./news/NewsSection";
import EventsSection from "./events/EventsSection";

import "./ClubPage.scss";
import "./articles/articles.scss";

export default function ClubPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <main className="club-page">
        <div className="club-login">
          <div className="club-login__icon">
            <FaLock />
          </div>

          <div className="club-login__content">
            <h2>Loading FiTrack Club...</h2>
          </div>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="club-page">
        <div className="club-login">
          <div className="club-login__icon">
            <FaLock />
          </div>

          <div className="club-login__content">
            <span className="club-login__label">
              FiTrack CLUB
            </span>

            <h2>
              Sign in to join FiTrack Club
            </h2>

            <p>
              Create an account or sign in to
              join the FiTrack community, discover
              events, read news and connect with
              other runners.
            </p>

            {/* <div className="club-login__actions">
              <button
                type="button"
                className="club-login__button"
                onClick={() => navigate("/login")}
              >
                Sign In
              </button>

              <button
                type="button"
                className="club-login__register"
                onClick={() => navigate("/register")}
              >
                Create Account
              </button>
            </div> */}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="club-page">
      {/* <ClubHero /> */}

      <ClubNavigation />
      <CommunityStats />

      {/* <NewsSection /> */}

      {/* <EventsSection /> */}

      {/* <ArticlesSection /> */}

    </main>
  );
}