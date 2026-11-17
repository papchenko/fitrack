
import { forwardRef } from "react";

import {
  formatShareDistance,
  formatSharePace,
  formatShareSteps,
  formatShareDuration,
  formatShareSpeed,
  formatShareCalories,
  formatShareCount,
  normalizeShareActivityType,
} from "./runShareUtils";

import {
  ShareBrand,
  ShareAuthor,
  ShareImage,
} from "./layouts/ShareElements";

import ClassicLayout from "./layouts/ClassicLayout";
import RouteArtLayout from "./layouts/RouteArtLayout";
import PerformanceLayout from "./layouts/PerformanceLayout";
import EditorialLayout from "./layouts/EditorialLayout";
import MapFocusLayout from "./layouts/MapFocusLayout";

const LAYOUTS = {
  classic: ClassicLayout,
  route: RouteArtLayout,
  performance: PerformanceLayout,
  editorial: EditorialLayout,
  map: MapFocusLayout,
};

const RunSharePreview = forwardRef(
  function RunSharePreview(
    {
      shareType = "photo-stats",
      format = "post",
      style = "classic",
      layout = "classic",
      theme = "dark",
      title,
      username,
      avatarUrl,
      avatarFallback,
      imageDataUrl,
      premiumPackage,
      distance,
      pace,
      steps,
      duration,
      timestamp,
      locationName,
      activityType = "running",
      isRouteMap = false,
      imageAlreadyDesigned = false,
      workoutCoverScale = 0.5,
      route = [],
      calories,
      averageSpeed,
      exercises,
      sets,
      maxSpeed,
      winterDiscipline,
    },
    ref,
  ) {
    const activity =
      normalizeShareActivityType(activityType);

const isWorkout = activity === "workout";
const isCycling = activity === "cycling";
const isKayaking = activity === "kayaking";
const isHiking = activity === "hiking";
const isTennis = activity === "tennis";

const isWalking = activity === "walking";
const isSwimming = activity === "swimming";

const isWinterSports = [
    "winter_sports",
    "winter-sports",
    "skiing",
    "snowboarding",
].includes(activity);

const isSnowboarding =
    activity === "snowboarding" ||
    (isWinterSports && winterDiscipline === "snowboarding");

const winterActivityName = isSnowboarding
    ? "Snowboarding"
    : "Skiing";

const isSessionActivity = isWorkout || isTennis;

const safeTitle =
    title ||
    (isTennis
        ? "My Tennis Session"
        : isWorkout
          ? "My Workout"
          : isSwimming
            ? "My Swim"
            : isWalking
              ? "My Walk"
              : isWinterSports
                ? `My ${winterActivityName} Session`
                : isKayaking
                  ? "My Kayaking Session"
                  : isCycling
                    ? "My Ride"
                    : isHiking
                      ? "My Hike"
                      : "My Run");

    const speed =
      Number.isFinite(averageSpeed)
        ? averageSpeed
        : Number.isFinite(distance) &&
            Number.isFinite(duration) &&
            duration > 0
          ? distance / (duration / 60)
          : null;

          const maximumSpeed =
  Number.isFinite(maxSpeed) ? maxSpeed : null;

  const swimmingPace = (() => {
    const value = Number(pace);

    if (!Number.isFinite(value) || value <= 0) {
        return "—";
    }

    const totalSeconds = Math.round(value * 60);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${minutes}:${String(seconds).padStart(2, "0")} /100m`;
})();

const stats = isTennis
    ? [
        {
            label: "DURATION",
            value: formatShareDuration(duration),
        },
        {
            label: "CALORIES",
            value: formatShareCalories(calories),
        },
        {
            label: "SETS",
            value: formatShareCount(sets),
        },
    ]
    : isWorkout
      ? [
          {
              label: "CALORIES",
              value: formatShareCalories(calories),
          },
          {
              label: "EXERCISES",
              value: formatShareCount(exercises),
          },
          {
              label: "SETS",
              value: formatShareCount(sets),
          },
      ]
      : isSwimming
        ? [
            {
                label: "PACE /100M",
                value: swimmingPace,
            },
            {
                label: "TIME",
                value: formatShareDuration(duration),
            },
            {
                label: "AVG SPEED",
                value: formatShareSpeed(speed),
            },
        ]
        : isWinterSports
          ? [
              {
                  label: "AVG SPEED",
                  value: formatShareSpeed(speed),
              },
              {
                  label: "MAX SPEED",
                  value: formatShareSpeed(maximumSpeed),
              },
              {
                  label: "TIME",
                  value: formatShareDuration(duration),
              },
          ]
          : isKayaking
            ? [
                {
                    label: "AVG SPEED",
                    value: formatShareSpeed(speed),
                },
                {
                    label: "MAX SPEED",
                    value: formatShareSpeed(maximumSpeed),
                },
                {
                    label: "DURATION",
                    value: formatShareDuration(duration),
                },
            ]
            : isCycling
              ? [
                  {
                      label: "AVG SPEED",
                      value: formatShareSpeed(speed),
                  },
                  {
                      label: "TIME",
                      value: formatShareDuration(duration),
                  },
                  {
                      label: "CALORIES",
                      value: formatShareCalories(calories),
                  },
              ]
              : [
                  {
                      label: "PACE",
                      value: formatSharePace(pace),
                  },
                  {
                      label: "TIME",
                      value: formatShareDuration(duration),
                  },
                  {
                      label: "STEPS",
                      value: formatShareSteps(steps),
                  },
              ];

const mainValue = isSessionActivity
  ? formatShareDuration(duration)
  : formatShareDistance(distance);

const mainLabel = isTennis
  ? "SESSION DURATION"
  : isWorkout
    ? "WORKOUT DURATION"
    : "TOTAL DISTANCE";

const activityLabel = isTennis
    ? "TENNIS"
    : isWorkout
      ? "WORKOUT"
      : isSwimming
        ? "SWIMMING"
        : isWalking
          ? "WALKING"
          : isWinterSports
            ? winterActivityName.toUpperCase()
            : isKayaking
              ? "KAYAKING"
              : isCycling
                ? "CYCLING"
                : isHiking
                  ? "HIKING"
                  : "RUNNING";

    const dateObject =
      timestamp?.toDate?.() ||
      (timestamp?.seconds != null
        ? new Date(timestamp.seconds * 1000)
        : timestamp
          ? new Date(timestamp)
          : null);

    const date =
      dateObject instanceof Date &&
      !Number.isNaN(dateObject.getTime())
        ? dateObject.toLocaleDateString("en-GB")
        : "";

    const hasPhoto =
      shareType !== "stats" &&
      Boolean(imageDataUrl);

    const designed =
      hasPhoto && imageAlreadyDesigned;

    const isWorkoutCover =
      isWorkout && designed;

    const formatClass =
      format === "story"
        ? "rss-format-story"
        : format === "square"
          ? "rss-format-square"
          : "rss-format-post";

    const effectiveLayout =
  shareType === "stats"
    ? "performance"
    : isSessionActivity &&
        ["route", "map"].includes(layout)
      ? "performance"
      : layout;

    const LayoutComponent =
      LAYOUTS[effectiveLayout] ||
      ClassicLayout;

    const data = {
      activity,
      activityLabel,
      title: safeTitle,
      username,
      avatarUrl,
      avatarFallback,
      premiumPackage,
      imageDataUrl,
      isRouteMap,
      mainValue,
      mainLabel,
      stats,
      locationName,
      date,
      route,
      coordinateOrder: isKayaking ? "latlng" : "lnglat",
    };

    return (
      <div
        ref={ref}
        className={[
          "run-share-preview",
          "rss-preview",
          formatClass,
          `rss-theme-${theme}`,
          `rss-layout-${effectiveLayout}`,
          `rss-activity-${activity}`,
          `rss-style-${style}`,
          isRouteMap ? "rss-has-route-map" : "",
          isWorkoutCover ? "rss-workout-cover-mode" : "",
        ].filter(Boolean).join(" ")}
      >
        {designed ? (
          <div className={`rss-workout-cover-layout ${
  isWorkout ? "rss-is-workout" : "rss-is-designed"
}`}>
            <div
              className="rss-workout-cover-image"
              style={{
                "--rss-cover-scale": isWorkout
  ? Math.max(0.2, Math.min(1, workoutCoverScale))
  : 1,
              }}
            >
              <ShareImage
                imageDataUrl={imageDataUrl}
                showBackdrop={false}
              />
            </div>

            <div className="rss-workout-cover-header">
              <ShareAuthor {...data} />
              <ShareBrand />
            </div>
          </div>
        ) : (
          <LayoutComponent data={data} />
        )}
      </div>
    );
  },
);

export default RunSharePreview;
