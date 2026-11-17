
import {
  ShareBrand,
  ShareAuthor,
  ShareMainMetric,
  ShareMetrics,
  ShareMeta,
} from "./ShareElements";

export default function PerformanceLayout({ data }) {
  return (
    <div className="rss-layout rss-performance">
      <header className="rss-top">
        <ShareAuthor {...data} />
        <ShareBrand />
      </header>

      <div className="rss-performance-center">
        {/* <div className="rss-performance-eyebrow">
          ACTIVITY PERFORMANCE
        </div> */}

        <div className="rss-performance-type">
          {data.activityLabel}
        </div>

        <ShareMainMetric
          value={data.mainValue}
          label={data.mainLabel}
        />

        <div className="rss-performance-divider" />

        <ShareMetrics stats={data.stats} />
      </div>

      <footer className="rss-performance-footer">
        <ShareMeta
          locationName={data.locationName}
          date={data.date}
        />

        {/* <span>YOUR ACTIVITY. YOUR STORY.</span> */}
      </footer>
    </div>
  );
}
