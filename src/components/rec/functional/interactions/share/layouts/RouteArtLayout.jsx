
import {
  ShareBrand,
  ShareAuthor,
  ShareRoute,
  ShareMainMetric,
  ShareMetrics,
  ShareMeta,
} from "./ShareElements";

export default function RouteArtLayout({ data }) {
  return (
    <div className="rss-layout rss-route-art">
      <header className="rss-top">
        <ShareAuthor {...data} />
        <ShareBrand />
      </header>

      <div className="rss-route-art-center">
        <div className="rss-route-art-label">
          YOUR ROUTE
        </div>

        <ShareRoute
  route={data.route}
  coordinateOrder={data.coordinateOrder}
/>

        <div className="rss-route-art-caption">
          RECORDED WITH FiTrack
        </div>
      </div>

      <footer className="rss-bottom">
        <ShareMainMetric
          value={data.mainValue}
          label={data.mainLabel}
        />

        <ShareMetrics stats={data.stats} />

        <ShareMeta
          locationName={data.locationName}
          date={data.date}
        />
      </footer>
    </div>
  );
}
