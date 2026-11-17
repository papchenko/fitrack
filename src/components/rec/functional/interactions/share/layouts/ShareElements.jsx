
import { RiVerifiedBadgeFill } from "react-icons/ri";

export function ShareBrand() {
  return (
    <img
      className="rss-brand"
      src="/logo.png"
      alt="FiTrack"
      crossOrigin="anonymous"
    />
  );
}

export function ShareAuthor({
  title,
  username,
  avatarUrl,
  avatarFallback,
  premiumPackage,
}) {
  return (
    <div className="rss-author">
      <div className="rss-author-avatar">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={username || "Athlete"}
            crossOrigin="anonymous"
          />
        ) : (
          <span>{avatarFallback || "R"}</span>
        )}

        {premiumPackage?.active &&
          premiumPackage?.title === "Pro" && (
            <RiVerifiedBadgeFill className="rss-pro" />
          )}
      </div>

      <div className="rss-author-info">
        <strong className="rss-author-title">
          {title}
        </strong>
        <span className="rss-author-name">
          {username || "Athlete"}
        </span>
      </div>
    </div>
  );
}

export function ShareMetrics({ stats = [] }) {
  return (
    <div className="rss-metrics">
      {stats.map(({ label, value }) => (
        <div className="rss-metric" key={label}>
          <span>{label}</span>
          <strong>{value}</strong>
        </div>
      ))}
    </div>
  );
}

export function ShareMainMetric({ value, label }) {
  return (
    <div className="rss-main-metric">
      <strong>{value}</strong>
      {label && <span>{label}</span>}
    </div>
  );
}

export function ShareMeta({ locationName, date }) {
  if (!locationName && !date) return null;

  return (
    <div className="rss-meta">
      {locationName && (
        <span className="rss-meta-location">
          {locationName}
        </span>
      )}
      {date && <span>{date}</span>}
    </div>
  );
}

export function ShareImage({
  imageDataUrl,
  isRouteMap = false,
  compact = false,
  showBackdrop = true,
}) {
  if (!imageDataUrl) {
    return (
      <div className="rss-image-placeholder">
        <span>FiTrack</span>
        {/* <small>YOUR ACTIVITY</small> */}
      </div>
    );
  }

  return (
    <div
      className={[
        "rss-image",
        isRouteMap ? "rss-image-map" : "",
        compact ? "rss-image-compact" : "",
      ].filter(Boolean).join(" ")}
    >
      {showBackdrop && !isRouteMap && (
        <div
          className="rss-image-backdrop"
          style={{
            backgroundImage: `url("${imageDataUrl}")`,
          }}
        />
      )}

      <img
        src={imageDataUrl}
        alt="Activity"
        crossOrigin="anonymous"
      />
    </div>
  );
}

function normalizePoint(point, coordinateOrder = "lnglat") {
  if (!point) return null;

  let lat;
  let lng;

  if (Array.isArray(point)) {
    if (coordinateOrder === "latlng") {
      lat = Number(point[0]);
      lng = Number(point[1]);
    } else {
      lng = Number(point[0]);
      lat = Number(point[1]);
    }
  } else {
    lat = Number(point.lat ?? point.latitude);
    lng = Number(
      point.lng ??
      point.lon ??
      point.long ??
      point.longitude
    );
  }

  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lng) ||
    Math.abs(lat) > 90 ||
    Math.abs(lng) > 180
  ) {
    return null;
  }

  return { lat, lng };
}

export function ShareRoute({
  route = [],
  color = "#ff531c",
  coordinateOrder = "lnglat",
}) {
  const points = Array.isArray(route)
    ? route
        .map((point) => normalizePoint(point, coordinateOrder))
        .filter(Boolean)
    : [];

  if (points.length < 2) {
    return (
      <div className="rss-route-empty">
        <span>GPS ROUTE</span>
        <small>Route data unavailable</small>
      </div>
    );
  }

  // Project GPS coordinates into a local flat plane.
  const avgLat =
    points.reduce((sum, p) => sum + p.lat, 0) /
    points.length;

  const longitudeScale =
    Math.max(
      0.01,
      Math.cos(avgLat * Math.PI / 180)
    );

  const projected = points.map((p) => ({
    x: p.lng * longitudeScale,
    y: -p.lat,
  }));

  const xs = projected.map((p) => p.x);
  const ys = projected.map((p) => p.y);

  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  const rangeX = Math.max(maxX - minX, 0.000001);
  const rangeY = Math.max(maxY - minY, 0.000001);

  const scale = Math.min(
    440 / rangeX,
    440 / rangeY
  );

  const offsetX = (500 - rangeX * scale) / 2;
  const offsetY = (500 - rangeY * scale) / 2;

  const coords = projected.map((p) => ({
    x: (p.x - minX) * scale + offsetX,
    y: (p.y - minY) * scale + offsetY,
  }));

  const path = coords
    .map(
      (p, i) =>
        `${i === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`
    )
    .join(" ");

  const first = coords[0];
  const last = coords[coords.length - 1];

  return (
    <svg
      className="rss-route-svg"
      viewBox="0 0 500 500"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="GPS route"
    >
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <circle
        cx={first.x}
        cy={first.y}
        r="11"
        fill="#ffffff"
        stroke={color}
        strokeWidth="5"
      />

      <circle
        cx={last.x}
        cy={last.y}
        r="12"
        fill={color}
        stroke="#ffffff"
        strokeWidth="4"
      />
    </svg>
  );
}
