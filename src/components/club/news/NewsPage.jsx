import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";

import { db } from "../../../firebase";
import { useAuth } from "../../account/AuthContext";

import NewsCard from "./NewsCard";
import AdminNewsForm from "./AdminNewsForm";

import "./news.scss";

export default function NewsPage() {
  const { user } = useAuth();

  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeCategory, setActiveCategory] =
    useState("All");

  const categories = [
    "All",
    "FiTrack News",
    "Running",
    "Training",
    "Nutrition",
    "Gear",
  ];

  const isAdmin = user?.isAdmin === true;

  useEffect(() => {
    setLoading(true);
    setError("");

    const newsQuery = query(
      collection(db, "clubNews"),
      where("published", "==", true)
    );

    const unsubscribe = onSnapshot(
      newsQuery,
      (snapshot) => {
        const newsData = snapshot.docs.map((document) => ({
          id: document.id,
          ...document.data(),
        }));

        // Сортуємо на стороні клієнта.
        newsData.sort((a, b) => {
          const dateA = a.createdAt?.toDate
            ? a.createdAt.toDate().getTime()
            : 0;

          const dateB = b.createdAt?.toDate
            ? b.createdAt.toDate().getTime()
            : 0;

          return dateB - dateA;
        });

        console.log("FiTrack NEWS:", newsData);

        setNews(newsData);
        setLoading(false);
      },
      (firebaseError) => {
        console.error(
          "Failed to load FiTrack news:",
          firebaseError
        );

        console.error(
          "Firebase error code:",
          firebaseError?.code
        );

        console.error(
          "Firebase error message:",
          firebaseError?.message
        );

        setError(
          firebaseError?.message ||
            "Failed to load news."
        );

        setNews([]);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const filteredNews =
    activeCategory === "All"
      ? news
      : news.filter(
          (item) =>
            item.category === activeCategory
        );

  return (
    <main className="club-news-page">

      {isAdmin && <AdminNewsForm />}

      <div className="club-news-page__categories">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            className={
              activeCategory === category
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveCategory(category)
            }
          >
            {category}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="club-news-page__status">
          Loading news...
        </div>
      ) : error ? (
        <div className="club-news-page__status">
          <h3>Failed to load news</h3>

          <p>{error}</p>

          <button
            type="button"
            className="admin-news-form__submit"
            onClick={() =>
              window.location.reload()
            }
          >
            Reload
          </button>
        </div>
      ) : filteredNews.length === 0 ? (
        <div className="club-news-page__status">
          <p>
            No news in this category yet.
          </p>
        </div>
      ) : (
        <div className="club-news-page__grid">
          {filteredNews.map((item) => (
            <NewsCard
              key={item.id}
              news={item}
            />
          ))}
        </div>
      )}

    </main>
  );
}