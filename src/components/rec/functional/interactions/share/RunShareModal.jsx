
import { createPortal } from "react-dom";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import html2canvas from "html2canvas";

import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";

import RunSharePreview from "./RunSharePreview";
import RunShareControls from "./RunShareControls";
import MotionStudio from "./motion/MotionStudio";

import {
  getShareDimensions,
  getShareFileName,
  imageUrlToDataUrl,
  getRunShareUrl,
  normalizeShareActivityType,
  getShareActivityName,
  getActivityShareText,
} from "./runShareUtils";

import "./runShare.scss";
import { MdCameraRoll } from "react-icons/md";

const EXPORT_SIZES = {
  post: { width: 360, height: 450 },
  story: { width: 360, height: 640 },
  square: { width: 360, height: 360 },
};

function normalizePhoto(photo) {
  if (typeof photo === "string") {
    return {
      url: photo,
      type: "photo",
      alreadyDesigned: false,
    };
  }

  if (!photo || typeof photo !== "object") {
    return null;
  }

  return {
    url: photo.url || photo.src || "",
    type: photo.type || "photo",
    alreadyDesigned:
      photo.alreadyDesigned === true,
  };
}

export default function RunShareModal({
  onClose,
  routeId,
  title,
  username,
  avatarUrl,
  premiumPackage,
  photos = [],
  route = [],
  distance,
  pace,
  steps,
  duration,
  timestamp,
  locationName,
  activityType = "running",
  winterDiscipline,
  calories,
  averageSpeed,
  maxSpeed,
  exercises,
  sets,
  imageAlreadyDesigned: initialDesigned = false,
}) {
  const exportRef = useRef(null);
  const [showMotion, setShowMotion] = useState(false);

  const activity =
    normalizeShareActivityType(activityType);

  const activityName =
    getShareActivityName(activity);

  const [shareType, setShareType] =
    useState("photo-stats");

  const [format, setFormat] =
    useState("post");

  const [layout, setLayout] =
    useState("classic");

  const [theme, setTheme] =
    useState("dark");

  const [style, setStyle] =
    useState("classic");

  const [selectedPhotoIndex, setSelectedPhotoIndex] =
    useState(0);

  const [imageDataUrl, setImageDataUrl] =
    useState(null);

  const [imageAlreadyDesigned, setImageAlreadyDesigned] =
    useState(initialDesigned);

  const [workoutCoverScale, setWorkoutCoverScale] =
    useState(0.5);

  const [isPreparingImage, setIsPreparingImage] =
    useState(false);

  const [isExporting, setIsExporting] =
    useState(false);

  const [imageError, setImageError] =
    useState("");

  const photoItems = useMemo(
    () =>
      (Array.isArray(photos) ? photos : [])
        .map(normalizePhoto)
        .filter((item) => item?.url),
    [photos],
  );

  const selectedPhoto =
    photoItems[selectedPhotoIndex] || null;

  const isRouteMap =
    selectedPhoto?.type === "map";

  const isWorkoutCover =
    activity === "workout" &&
    shareType !== "stats" &&
    selectedPhotoIndex === 0 &&
    Boolean(selectedPhoto);

  const effectiveDesigned =
    shareType !== "stats" &&
    (
      isWorkoutCover ||
      selectedPhoto?.alreadyDesigned === true ||
      (
        activity !== "workout" &&
        imageAlreadyDesigned
      )
    );

  const safeUsername =
    username || "Athlete";

  const avatarFallback =
    Array.from(safeUsername)[0] || "R";

  const shareTitle =
    title || `My ${activityName} on FiTrack`;

  const shareText =
    getActivityShareText(activity, distance);

  const exportSize =
    EXPORT_SIZES[format] || EXPORT_SIZES.post;

  useEffect(() => {
    let cancelled = false;

    if (
      shareType === "stats" ||
      !selectedPhoto?.url
    ) {
      setImageDataUrl(null);
      setIsPreparingImage(false);
      setImageError("");
      return;
    }

    setIsPreparingImage(true);
    setImageDataUrl(null);
    setImageError("");

    imageUrlToDataUrl(selectedPhoto.url)
      .then((dataUrl) => {
        if (!cancelled) {
          setImageDataUrl(dataUrl);
        }
      })
      .catch((error) => {
        console.error(
          "Share image loading failed:",
          error
        );

        if (!cancelled) {
          setImageError(
            "Could not load the selected image."
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsPreparingImage(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [shareType, selectedPhoto?.url]);

  // Reset an invalid GPS layout when switching
  // from Running/Cycling to Workout.
  useEffect(() => {
    if (
  ["workout", "tennis"].includes(activity) &&
  ["route", "map"].includes(layout)
) {
  setLayout("performance");
    }
  }, [activity, layout]);

  const previewProps = {
    shareType,
    format,
    style,
    layout,
    theme,
    title: shareTitle,
    username: safeUsername,
    avatarUrl,
    avatarFallback,
    premiumPackage,
    imageDataUrl,
    distance,
    pace,
    steps,
    duration,
    timestamp,
    locationName,
    activityType: activity,
    winterDiscipline,
    isRouteMap,
    imageAlreadyDesigned: effectiveDesigned,
    workoutCoverScale,
    route,
    calories,
    averageSpeed,
    maxSpeed,
    exercises,
    sets,
  };

  const waitForImages = async (element) => {
    const images = Array.from(
      element.querySelectorAll("img")
    );

    await Promise.all(
      images.map(async (img) => {
        if (img.complete) return;

        await new Promise((resolve) => {
          img.addEventListener(
            "load",
            resolve,
            { once: true }
          );

          img.addEventListener(
            "error",
            resolve,
            { once: true }
          );
        });
      })
    );
  };

  const createShareImage = async () => {
    const element = exportRef.current;

    if (!element) {
      throw new Error(
        "Export preview not found."
      );
    }

    await waitForImages(element);

    if (document.fonts?.ready) {
      await document.fonts.ready;
    }

    const targetDimensions =
      getShareDimensions(format);

const canvas = await html2canvas(element, {
  width: exportSize.width,
  height: exportSize.height,
  scale: 3,
  useCORS: true,
  allowTaint: false,
  backgroundColor: "#111111",
  logging: false,
  imageTimeout: 15000,
  scrollX: 0,
  scrollY: 0,

  onclone: (clonedDocument) => {
    const clonedPreview =
      clonedDocument.querySelector(".rss-export-stage .rss-preview");

    if (!clonedPreview) return;

    const avatar = clonedPreview.querySelector(
      ".rss-author-avatar img"
    );

    if (avatar) {
      avatar.style.width = "100%";
      avatar.style.height = "100%";
      avatar.style.aspectRatio = "1 / 1";
      avatar.style.objectFit = "cover";
      avatar.style.objectPosition = "center";
      avatar.style.borderRadius = "50%";
    }
  },
});

    if (
      canvas.width !== targetDimensions.width ||
      canvas.height !== targetDimensions.height
    ) {
      console.warn(
        "Unexpected image dimensions:",
        canvas.width,
        canvas.height
      );
    }

    return canvas;
  };

  const canvasToBlob = (canvas) =>
    new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(
            new Error("Could not create PNG.")
          );
          return;
        }

        resolve(blob);
      }, "image/png");
    });

  const downloadBlob = (blob) => {
    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;
    link.download =
      getShareFileName(format);

    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);
  };

  const downloadImage = async () => {
    if (isExporting || isPreparingImage) {
      return;
    }

    try {
      setIsExporting(true);

      const canvas =
        await createShareImage();

      const blob =
        await canvasToBlob(canvas);

      downloadBlob(blob);
    } catch (error) {
      console.error(
        "Download failed:",
        error
      );

      alert("Could not create image.");
    } finally {
      setIsExporting(false);
    }
  };

  const shareImage = async () => {
    if (isExporting || isPreparingImage) {
      return;
    }

    try {
      setIsExporting(true);

      const canvas =
        await createShareImage();

      const blob =
        await canvasToBlob(canvas);

      const file = new File(
        [blob],
        getShareFileName(format),
        { type: "image/png" }
      );

      if (
        navigator.share &&
        navigator.canShare?.({
          files: [file],
        })
      ) {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          files: [file],
        });

        return;
      }

      downloadBlob(blob);

      alert(
        "Image sharing is unavailable. PNG downloaded instead."
      );
    } catch (error) {
      if (error?.name === "AbortError") {
        return;
      }

      console.error(
        "Image share failed:",
        error
      );

      alert("Could not share image.");
    } finally {
      setIsExporting(false);
    }
  };

  const shareActivity = async () => {
    const url =
      getRunShareUrl(routeId);

    try {
      if (navigator.share) {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url,
        });

        return;
      }

      await navigator.clipboard.writeText(
        `${shareText}\n${url}`
      );

      alert("Activity link copied.");
    } catch (error) {
      if (error?.name === "AbortError") {
        return;
      }

      console.error(
        "Share activity failed:",
        error
      );
    }
  };

  const canExport =
    !isExporting &&
    !isPreparingImage &&
    !imageError;

  return createPortal(
    <div
      className="run-share-overlay"
      onClick={onClose}
    >
      <div
        className="run-share-modal"
        onClick={(event) =>
          event.stopPropagation()
        }
        role="dialog"
        aria-modal="true"
        aria-label="FiTrack Share Studio"
      >
        <header className="run-share-header">
          <div>
            <span>FiTrack</span>
            <h3>Share Studio</h3>
          </div>

          <button
            type="button"
            className="run-share-close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </header>

        <div className="run-share-content">
          <section className="run-share-preview-container">
            <div className="rss-preview-heading">
              <span>LIVE PREVIEW</span>
              <span>
                {format === "story"
                  ? "9:16"
                  : format === "square"
                    ? "1:1"
                    : "4:5"}
              </span>
            </div>

            <RunSharePreview
              {...previewProps}
            />

            {isPreparingImage && (
              <div className="rss-info-message">
                Preparing image...
              </div>
            )}

            {imageError && (
              <div className="rss-error-message">
                {imageError}
              </div>
            )}

            {photoItems.length > 0 &&
              shareType !== "stats" && (
                <div className="run-share-photo-selector">
                  <div className="run-share-photo-selector-title">
                    Choose image
                  </div>

                  <Swiper
                    slidesPerView="auto"
                    spaceBetween={10}
                    modules={[Pagination]}
                    pagination={{
                      clickable: true,
                    }}
                    className="run-share-photo-swiper"
                  >
                    {photoItems.map(
                      (photo, index) => (
                        <SwiperSlide
                          key={`${photo.url}-${index}`}
                        >
                          <button
                            type="button"
                            className={`run-share-photo-option ${
                              selectedPhotoIndex === index
                                ? "active"
                                : ""
                            }`}
                            onClick={() => {
                              setSelectedPhotoIndex(index);
                              setImageAlreadyDesigned(
                                photo.alreadyDesigned
                              );
                            }}
                          >
                            <img
                              src={photo.url}
                              alt={`Activity image ${index + 1}`}
                              crossOrigin="anonymous"
                            />
                          </button>
                        </SwiperSlide>
                      )
                    )}
                  </Swiper>
                </div>
              )}

            {activity !== "workout" &&
              shareType !== "stats" &&
              selectedPhoto &&
              !selectedPhoto.alreadyDesigned && (
                <label className="run-share-source-toggle">
                  <input
                    type="checkbox"
                    checked={imageAlreadyDesigned}
                    onChange={(event) =>
                      setImageAlreadyDesigned(
                        event.target.checked
                      )
                    }
                  />

                  <span>
                    Image already contains statistics
                  </span>
                </label>
              )}
          </section>

          <aside className="run-share-sidebar">
            <RunShareControls
              shareType={shareType}
              setShareType={setShareType}
              format={format}
              setFormat={setFormat}
              style={style}
              setStyle={setStyle}
              layout={layout}
              setLayout={setLayout}
              theme={theme}
              setTheme={setTheme}
              activityType={activity}
              isWorkoutCover={isWorkoutCover}
              workoutCoverScale={workoutCoverScale}
              setWorkoutCoverScale={setWorkoutCoverScale}
            />

            <button
              type="button"
              className="run-share-action-primary"
              onClick={() => setShowMotion(true)}
            >
              <MdCameraRoll /> Open Motion Studio
            </button>

            <div className="run-share-actions">
              <button
                type="button"
                className="run-share-action-primary"
                onClick={downloadImage}
                disabled={!canExport}
              >
                {isExporting
                  ? "Creating..."
                  : "Download Image"}
              </button>

              <button
                type="button"
                className="run-share-action-share"
                onClick={shareImage}
                disabled={!canExport}
              >
                Share Image
              </button>

              <button
                type="button"
                className="run-share-action-share"
                onClick={shareActivity}
              >
                Share Activity Link
              </button>
            </div>
          </aside>
        </div>

        {showMotion && (
          <MotionStudio
            onClose={() => setShowMotion(false)}
            route={route}
            activityType={activity}
            winterDiscipline={winterDiscipline}
            title={shareTitle}
            username={safeUsername}
            avatarUrl={avatarUrl}
            avatarFallback={avatarFallback}
            premiumPackage={premiumPackage}
            distance={distance}
            duration={duration}
            calories={calories}
            imageDataUrl={imageDataUrl}
            locationName={locationName}
            timestamp={timestamp}
          />
        )}

        {/* Separate fixed-size export renderer */}
        <div
          className="rss-export-stage"
          aria-hidden="true"
        >
          <div
            style={{
              width: exportSize.width,
              height: exportSize.height,
            }}
          >
            <RunSharePreview
              {...previewProps}
              ref={exportRef}
            />
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
