import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";

import { db } from "../../../firebase";

import NewsCard from "./NewsCard";

export default function NewsSection() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
          "Failed to load club news:",
          error
        );

        console.error(
          "Firebase error code:",
          error?.code
        );

        console.error(
          "Firebase error message:",
          error?.message
        );

        setNews([]);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return (
    <section className="club-news">

      <div className="club-news__header">
        <div>
          <span className="club-section-label">
            LATEST UPDATES
          </span>

          <h2>News</h2>

          <p>
            Running news, FiTrack updates and
            useful content for runners.
          </p>
        </div>

        <a
          href="/club/news"
          className="club-section-link"
        >
          View all
          <span>→</span>
        </a>
      </div>

      {loading ? (
        <div className="club-news__status">
          Loading news...
        </div>
      ) : news.length === 0 ? (
        <div className="club-news__status">
          No news yet.
        </div>
      ) : (
        <div className="club-news__grid">
          {news.map((item) => (
            <NewsCard
              key={item.id}
              news={item}
            />
          ))}
        </div>
      )}

    </section>
  );
}