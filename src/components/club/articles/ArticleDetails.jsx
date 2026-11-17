import { useEffect, useRef, useState } from "react";

import { doc, getDoc, updateDoc, increment } from "firebase/firestore";

import { Link, useParams } from "react-router-dom";

import { db } from "../../../firebase";

export default function ArticleDetails() {
  const { articleId } = useParams();

  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const viewUpdatedRef = useRef(false);

  useEffect(() => {
    async function loadArticle() {
      if (!articleId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setNotFound(false);

        const articleRef = doc(db, "articles", articleId);

        const snapshot = await getDoc(articleRef);

        if (!snapshot.exists()) {
          setNotFound(true);
          return;
        }

        const articleData = {
          id: snapshot.id,
          ...snapshot.data(),
        };

        setArticle(articleData);

        if (!viewUpdatedRef.current) {
          viewUpdatedRef.current = true;

          try {
            await updateDoc(articleRef, {
              views: increment(1),
            });
          } catch (viewError) {
            console.error("Failed to update article views:", viewError);
          }
        }
      } catch (error) {
        console.error("Failed to load article:", error);

        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }

    viewUpdatedRef.current = false;

    loadArticle();
  }, [articleId]);

  if (loading) {
    return (
      <main className="article-details">
        <div className="article-details__loading">Loading article...</div>
      </main>
    );
  }

  if (notFound || !article) {
    return (
      <main className="article-details">
        <div className="article-details__not-found">
          <h1>Article not found</h1>

          <p>This article may have been removed or is no longer available.</p>

          <Link to="/club/articles">Back to Articles</Link>
        </div>
      </main>
    );
  }

  const formattedDate = article.createdAt?.toDate
    ? article.createdAt.toDate().toLocaleDateString()
    : "";

  return (
    <main className="article-details">
      <article className="article-details__container">
        <Link to="/club/articles" className="article-details__back">
          ← Back to Articles
        </Link>

        <header className="article-details__header">
          <span className="article-details__category">{article.category}</span>

          <h1>{article.title}</h1>

          {article.excerpt && (
            <p className="article-details__excerpt">{article.excerpt}</p>
          )}

          <div className="article-details__meta">
            <span>{article.authorName || "FiTrack Team"}</span>

            <span>{formattedDate}</span>

            <span>{Number(article.views || 0)} views</span>
          </div>
        </header>

        {article.coverImage && (
          <div className="article-details__cover">
            <img src={article.coverImage} alt={article.title} />
          </div>
        )}

        <div className="article-details__content">
          {article.content?.split("\n").map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </article>
    </main>
  );
}
