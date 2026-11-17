import { useEffect, useRef, useState } from "react";

import { useParams, Link } from "react-router-dom";

import { doc, getDoc, updateDoc, increment } from "firebase/firestore";

import { db } from "../../../firebase";

import "./news.scss";

export default function NewsDetails() {
  const { newsId } = useParams();

  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);

  const viewsUpdatedRef = useRef(false);

  useEffect(() => {
    async function loadNews() {
      if (!newsId) {
        setLoading(false);
        return;
      }

      try {
        const newsRef = doc(db, "clubNews", newsId);

        const snapshot = await getDoc(newsRef);

        if (!snapshot.exists()) {
          setNews(null);
          return;
        }

        const data = {
          id: snapshot.id,
          ...snapshot.data(),
        };

        setNews(data);
        if (!viewsUpdatedRef.current) {
          viewsUpdatedRef.current = true;

          try {
            await updateDoc(newsRef, {
              views: increment(1),
            });
          } catch (viewError) {
            console.error("Failed to update news views:", viewError);
          }
        }
      } catch (error) {
        console.error("Error loading news:", error);

        setNews(null);
      } finally {
        setLoading(false);
      }
    }

    loadNews();
  }, [newsId]);

  if (loading) {
    return (
      <main className="news-details">
        <div className="news-details__status">Loading news...</div>
      </main>
    );
  }

  if (!news) {
    return (
      <main className="news-details">
        <div className="news-details__status">
          <h1>News not found</h1>

          <Link to="/club/news">← Back to news</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="news-details">
      <Link to="/club/news" className="news-details__back">
        ← Back to news
      </Link>

      <article className="news-details__article">
        {news.coverImage && (
          <div className="news-details__image">
            <img src={news.coverImage} alt={news.title} />
          </div>
        )}

        <div className="news-details__content">
          <div className="news-details__top">
            <span className="news-card__category">{news.category}</span>

            {news.featured && (
              <span className="news-card__featured">FEATURED</span>
            )}
          </div>

          <h1>{news.title}</h1>

          <div className="news-details__meta">
            <span>{news.authorName || "FiTrack Team"}</span>

            <span>{news.views || 0} views</span>

            {news.createdAt?.toDate && (
              <span>{news.createdAt.toDate().toLocaleDateString()}</span>
            )}
          </div>

          {news.excerpt && (
            <p className="news-details__excerpt">{news.excerpt}</p>
          )}

          <div className="news-details__text">{news.content}</div>
        </div>
      </article>
    </main>
  );
}
