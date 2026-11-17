import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";

import { onAuthStateChanged } from "firebase/auth";

import { FaLock } from "react-icons/fa";

import { db, auth } from "../../../../firebase";

import NewsCard from "../../../club/news/NewsCard";

import "./NewsPreview.scss";

export default function NewsPreview() {
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] =
    useState(null);

  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth =
      onAuthStateChanged(auth, (user) => {
        setCurrentUser(user);
      });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!currentUser) {
      setNews([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const newsQuery = query(
      collection(db, "clubNews"),
      where("published", "==", true)
    );

    const unsubscribe = onSnapshot(
      newsQuery,
      (snapshot) => {
        const newsData = snapshot.docs.map(
          (document) => ({
            id: document.id,
            ...document.data(),
          })
        );

        newsData.sort((a, b) => {
          const dateA = a.createdAt?.toDate
            ? a.createdAt.toDate().getTime()
            : 0;

          const dateB = b.createdAt?.toDate
            ? b.createdAt.toDate().getTime()
            : 0;

          return dateB - dateA;
        });

        setNews(newsData.slice(0, 3));
        setLoading(false);
      },
      (error) => {
        console.error(
          "Failed to load news preview:",
          error
        );

        setNews([]);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  return (
    <section className="news-preview">
      <div className="container">

        <div className="news-preview__header">
          <div>
            <span className="news-preview__label">
              FiTrack CLUB
            </span>

            <h2>News</h2>

            <p>
              Running news, FiTrack updates and
              useful content for runners.
            </p>
          </div>

          {currentUser && (
            <button
              type="button"
              className="news-preview__link"
              onClick={() =>
                navigate("/club/news")
              }
            >
              View all
              <span>→</span>
            </button>
          )}
        </div>

        {!currentUser ? (
          <div className="news-preview__login">
            <div className="news-preview__login-icon">
              <FaLock />
            </div>

            <div className="news-preview__login-content">
              <h3>
                Sign in to access FiTrack News
              </h3>

              <p>
                Sign in to your account or create
                one to read the latest running news,
                FiTrack updates, training and more.
              </p>
            </div>
          </div>
        ) : loading ? (
          <div className="news-preview__status">
            Loading news...
          </div>
        ) : news.length === 0 ? (
          <div className="news-preview__status">
            No news yet.
          </div>
        ) : (
          <div className="news-preview__grid">
            {news.map((item) => (
              <NewsCard
                key={item.id}
                news={item}
              />
            ))}
          </div>
        )}

      </div>
    </section>
  );
}