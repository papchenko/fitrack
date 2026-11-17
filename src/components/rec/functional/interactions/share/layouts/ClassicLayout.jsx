
import {
  ShareBrand,
  ShareAuthor,
  ShareImage,
  ShareMainMetric,
  ShareMetrics,
  ShareMeta,
} from "./ShareElements";

export default function ClassicLayout({ data }) {
  const {
    imageDataUrl,
    isRouteMap,
    mainValue,
    mainLabel,
    stats,
    locationName,
    date,
  } = data;

  return (
    <div className="rss-layout rss-classic">
      <div className="rss-classic-media">
        <ShareImage
          imageDataUrl={imageDataUrl}
          isRouteMap={isRouteMap}
        />
      </div>

      <div className="rss-classic-shade" />

      <header className="rss-top">
        <ShareAuthor {...data} />
        <ShareBrand />
      </header>

      <footer className="rss-bottom">
        <ShareMainMetric
          value={mainValue}
          label={mainLabel}
        />

        <ShareMetrics stats={stats} />

        <ShareMeta
          locationName={locationName}
          date={date}
        />
      </footer>
    </div>
  );
}
