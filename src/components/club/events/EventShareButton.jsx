import { useState } from "react";
import { FaShare } from "react-icons/fa";
import { toast } from "react-toastify";

export default function EventShareButton({ event }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!event?.id) {
      return;
    }

    const shareUrl =
      `${window.location.origin}/club/events/${event.id}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title:
            event.title || "FiTrack Event",
          text:
            event.subtitle ||
            "Check out this FiTrack community event.",
          url: shareUrl,
        });

        return;
      }

      await navigator.clipboard.writeText(
        shareUrl
      );

      setCopied(true);

      toast.success(
        "Event link copied!"
      );

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      if (error?.name === "AbortError") {
        return;
      }

      console.error(
        "Failed to share event:",
        error
      );
    }
  };

  return (
    <button
      type="button"
      className="event-share"
      onClick={handleShare}
      aria-label="Share event"
      title="Share event"
    >
      <FaShare />

      <span>
        {copied ? "Copied" : "Share"}
      </span>
    </button>
  );
}