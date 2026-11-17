import { Link } from "react-router-dom";

export default function NewsCard({ news }) {
  return (
    <article className="news-card">
      {news.coverImage && (
        <div className="news-card__image">
          <img
            src={news.coverImage}
            alt={news.title}
          />
        </div>
      )}

      <div className="news-card__content">
        <div className="news-card__top">
          <span className="news-card__category">
            {news.category}
          </span>

          {news.featured && (
            <span className="news-card__featured">
              FEATURED
            </span>
          )}
        </div>

        <h3 className="news-card__title">
          {news.title}
        </h3>

        {news.excerpt && (
          <p className="news-card__excerpt">
            {news.excerpt}
          </p>
        )}

        <div className="news-card__footer">
          <span>
            {news.authorName || "FiTrack Team"}
          </span>

          <span>
            {news.views || 0} views
          </span>
        </div>

        <Link
          to={`/club/news/${news.id}`}
          className="news-card__link"
        >
          Read article
          <span>→</span>
        </Link>
      </div>
    </article>
  );
}