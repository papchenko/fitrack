import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { Link } from "react-router-dom";

import { db } from "../../../firebase";

import ArticleCard from "./ArticleCard";

export default function ArticlesSection() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadArticles() {
      try {
        const articlesRef = collection(db, "articles");

        const articlesQuery = query(
          articlesRef,
          where("published", "==", true),
          orderBy("createdAt", "desc"),
          limit(3),
        );

        const snapshot = await getDocs(articlesQuery);

        const articlesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setArticles(articlesData);
      } catch (error) {
        console.error("Failed to load articles:", error);
      } finally {
        setLoading(false);
      }
    }

    loadArticles();
  }, []);

  return (
    <section className="articles-section">
      <div className="articles-section__container">
        <div className="articles-section__heading">
          <div>
            <span className="articles-section__eyebrow">FiTrack KNOWLEDGE</span>

            <h2>Articles</h2>

            <p>
              Practical knowledge to help you run better, recover smarter and
              stay consistent.
            </p>
          </div>

          <Link to="/club/articles" className="articles-section__view-all">
            View all
          </Link>
        </div>

        {loading ? (
          <div className="articles-section__loading">Loading articles...</div>
        ) : articles.length === 0 ? (
          <div className="articles-section__empty">No articles yet.</div>
        ) : (
          <div className="articles-section__grid">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
