import { Link, useNavigate } from "react-router-dom";

export default function ArticleCard({ article }) {
  const navigate = useNavigate();

  return (
    <article
      className="article-card"
      onClick={() => navigate(`/club/articles/${article.id}`)}>
      <div className="article-card__body">
        <span className="article-card__category">{article.category}</span>

        <h3 className="article-card__title">
          <Link
            to={`/club/articles/${article.id}`}
            onClick={(e) => e.stopPropagation()}>
            {article.title}
          </Link>
        </h3>

        {article.excerpt && (
          <p className="article-card__excerpt">{article.excerpt}</p>
        )}

        <div className="article-card__footer">
          <span>{article.authorName || "FiTrack Team"}</span>

          <span>
            {article.createdAt?.toDate
              ? article.createdAt.toDate().toLocaleDateString()
              : ""}
          </span>

          <span>{Number(article.views || 0)} views</span>
        </div>
      </div>
    </article>
  );
}
