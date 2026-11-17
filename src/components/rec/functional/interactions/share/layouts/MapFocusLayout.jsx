
import {
  ShareBrand,
  ShareAuthor,
  ShareImage,
  ShareRoute,
  ShareMainMetric,
  ShareMetrics,
  ShareMeta,
} from "./ShareElements";

export default function MapFocusLayout({ data }) {
  const hasMapImage =
    data.isRouteMap && Boolean(data.imageDataUrl);

  return (
    <div className="rss-layout rss-map-focus">
      <header className="rss-top">
        <ShareAuthor {...data} />
        <ShareBrand />
      </header>

      <div className="rss-map-focus-content">
        <div className="rss-map-focus-heading">
          <span>ACTIVITY MAP</span>
          <strong>{data.activityLabel}</strong>
        </div>

        <div className="rss-map-focus-map">
          {hasMapImage ? (
            <ShareImage
              imageDataUrl={data.imageDataUrl}
              isRouteMap
              showBackdrop={false}
            />
          ) : (
            <ShareRoute route={data.route} />
          )}
        </div>

        <div className="rss-map-focus-stats">
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
