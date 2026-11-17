
import {
  FaImage,
  FaMapMarkedAlt,
  FaChartBar,
  FaLayerGroup,
  FaRoute,
} from "react-icons/fa";

const LAYOUT_OPTIONS = [
  {
    id: "classic",
    title: "Classic Overlay",
    description: "Photo with activity stats",
    Icon: FaImage,
  },
  {
    id: "route",
    title: "Route Art",
    description: "Minimal GPS route",
    Icon: FaRoute,
  },
  {
    id: "performance",
    title: "Performance",
    description: "Clean statistics card",
    Icon: FaChartBar,
  },
  {
    id: "editorial",
    title: "Photo Editorial",
    description: "Photo-first composition",
    Icon: FaLayerGroup,
  },
  {
    id: "map",
    title: "Map Focus",
    description: "Route map and metrics",
    Icon: FaMapMarkedAlt,
  },
];

export default function RunShareControls({
  shareType,
  setShareType,
  format,
  setFormat,
  style,
  setStyle,
  layout,
  setLayout,
  theme,
  setTheme,
  activityType = "running",
  isWorkoutCover = false,
  workoutCoverScale = 0.5,
  setWorkoutCoverScale,
}) {
const isSessionActivity =
  ["workout", "tennis"].includes(activityType);

  const renderOptions = (items, value, onChange) => (
    <div className="rss-control-options">
      {items.map((item) => (
        <button
          key={item.value}
          type="button"
          className={
            value === item.value ? "active" : ""
          }
          onClick={() => onChange(item.value)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );

  return (
    <div className="rss-controls">
      <div className="rss-control-section">
        <h4>What to share</h4>

        {renderOptions(
          [
            {
              value: "photo-stats",
              label: "Photo + Stats",
            },
            {
              value: "stats",
              label: "Stats Only",
            },
          ],
          shareType,
          setShareType,
        )}
      </div>

      <div className="rss-control-section">
        <h4>Layout</h4>

        <div className="rss-layout-options">
          {LAYOUT_OPTIONS.map(
            ({ id, title, description, Icon }) => {
              const disabled =
  isSessionActivity &&
  ["route", "map"].includes(id);

              return (
                <button
                  key={id}
                  type="button"
                  disabled={
                    disabled ||
                    shareType === "stats" ||
                    isWorkoutCover
                  }
                  className={`rss-layout-option ${
                    layout === id ? "active" : ""
                  }`}
                  onClick={() => setLayout(id)}
                >
                  <Icon />

                  <span>
                    <strong>{title}</strong>
                    <small>
                      {disabled
                        ? "GPS activities only"
                        : description}
                    </small>
                  </span>
                </button>
              );
            },
          )}
        </div>

        {isWorkoutCover && (
          <p className="rss-control-hint">
            The original workout cover already
            contains statistics. Only the author
            and FiTrack branding are overlaid.
          </p>
        )}
      </div>

      <div className="rss-control-section">
        <h4>Format</h4>

        {renderOptions(
          [
            {
              value: "post",
              label: "Standard",
            },
            {
              value: "story",
              label: "Story",
            },
            {
              value: "square",
              label: "Square",
            },
          ],
          format,
          setFormat,
        )}
      </div>

      <div className="rss-control-section">
        <h4>Theme</h4>

        {renderOptions(
          [
            {
              value: "dark",
              label: "Dark",
            },
            {
              value: "light",
              label: "Light",
            },
            {
              value: "orange",
              label: "Orange",
            },
          ],
          theme,
          setTheme,
        )}
      </div>

      {isWorkoutCover && (
        <div className="rss-control-section">
          <h4>
            Workout image size
            <span>
              {Math.round(workoutCoverScale * 100)}%
            </span>
          </h4>

          <input
            className="rss-range"
            type="range"
            min="20"
            max="100"
            step="5"
            value={Math.round(
              workoutCoverScale * 100
            )}
            onChange={(event) =>
              setWorkoutCoverScale(
                Number(event.target.value) / 100
              )
            }
          />
        </div>
      )}

      <div className="rss-control-section">
        <h4>Typography</h4>

        {renderOptions(
          [
            {
              value: "classic",
              label: "Bold",
            },
            {
              value: "minimal",
              label: "Minimal",
            },
          ],
          style,
          setStyle,
        )}
      </div>
    </div>
  );
}
