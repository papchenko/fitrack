
import {
  ShareBrand,
  ShareAuthor,
  ShareImage,
  ShareMainMetric,
  ShareMetrics,
  ShareMeta,
} from "./ShareElements";

export default function EditorialLayout({ data }) {
  return (
    <div className="rss-layout rss-editorial">
      <header className="rss-top">
        <ShareAuthor {...data} />
        <ShareBrand />
      </header>

      <div className="rss-editorial-content">
        <div className="rss-editorial-heading">
          <span>{data.activityLabel}</span>
          <strong>EVERY EFFORT COUNTS.</strong>
        </div>

        <div className="rss-editorial-media">
          <ShareImage
            imageDataUrl={data.imageDataUrl}
            isRouteMap={data.isRouteMap}
            showBackdrop={false}
          />
        </div>

        <div className="rss-editorial-stats">
          <ShareMainMetric
            value={data.mainValue}
            label={data.mainLabel}
          />

          <ShareMetrics stats={data.stats} />
        </div>
      </div>

      <ShareMeta
        locationName={data.locationName}
        date={data.date}
      />
    </div>
  );
}
