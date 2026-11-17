
export function formatShareDuration(minutes) {
  if (!Number.isFinite(minutes) || minutes < 0) {
    return "—";
  }

  const totalSeconds = Math.floor(minutes * 60);
  const hours = Math.floor(totalSeconds / 3600);
  const mins = Math.floor(
    (totalSeconds % 3600) / 60,
  );
  const secs = totalSeconds % 60;

  const pad = (value) =>
    String(value).padStart(2, "0");

  if (hours > 0) {
    return `${pad(hours)}:${pad(mins)}:${pad(secs)}`;
  }

  return `${pad(mins)}:${pad(secs)}`;
}

export function formatShareDistance(distance) {
  return Number.isFinite(distance)
    ? `${distance.toFixed(2)} km`
    : "—";
}

export function formatSharePace(pace) {
  return Number.isFinite(pace)
    ? `${pace.toFixed(1)} min/km`
    : "—";
}

export function formatShareSteps(steps) {
  return Number.isFinite(steps)
    ? Math.round(steps).toLocaleString()
    : "—";
}

export function formatShareSpeed(speed) {
  return Number.isFinite(speed)
    ? `${speed.toFixed(1)} km/h`
    : "—";
}

export function formatShareCalories(calories) {
  return Number.isFinite(calories)
    ? `${Math.round(calories)} kcal`
    : "—";
}

export function formatShareCount(value) {
  return Number.isFinite(value)
    ? String(Math.round(value))
    : "—";
}

export function normalizeShareActivityType(type) {
    const value = String(type || "running")
        .trim()
        .toLowerCase();

    if (["cycling", "cycle", "bike", "biking"].includes(value)) {
        return "cycling";
    }

    if (["workout", "training"].includes(value)) {
        return "workout";
    }

    if (value === "tennis") {
        return "tennis";
    }

    if (["hiking", "hike", "trekking"].includes(value)) {
        return "hiking";
    }

    if (["kayaking", "kayak", "canoeing", "canoe"].includes(value)) {
        return "kayaking";
    }

    if (["walking", "walk"].includes(value)) {
        return "walking";
    }

    if (["swimming", "swim"].includes(value)) {
        return "swimming";
    }

    if (["winter_sports", "winter-sports", "winter sports"].includes(value)) {
        return "winter_sports";
    }

    if (["skiing", "ski"].includes(value)) {
        return "skiing";
    }

    if (["snowboarding", "snowboard"].includes(value)) {
        return "snowboarding";
    }

    return "running";
}

export function getShareActivityName(type, winterDiscipline) {
    const activity = normalizeShareActivityType(type);

    if (activity === "winter_sports") {
        return winterDiscipline === "snowboarding"
            ? "Snowboarding"
            : winterDiscipline === "skiing"
              ? "Skiing"
              : "Winter Sports";
    }

    const names = {
        running: "Run",
        cycling: "Ride",
        workout: "Workout",
        tennis: "Tennis Session",
        kayaking: "Kayaking Session",
        hiking: "Hike",
        walking: "Walk",
        swimming: "Swim",
        skiing: "Skiing",
        snowboarding: "Snowboarding",
    };

    return names[activity] || "Activity";
}

export function getActivityShareText(
    activityType,
    distance,
    winterDiscipline,
) {
    const activity = normalizeShareActivityType(activityType);

    const distanceText = Number.isFinite(distance)
        ? ` — ${distance.toFixed(2)} km`
        : "";

    if (activity === "tennis") {
        return "My tennis session on FiTrack";
    }

    if (activity === "workout") {
        return "My workout on FiTrack";
    }

    const names = {
        running: "run",
        cycling: "ride",
        kayaking: "kayaking session",
        hiking: "hike",
        walking: "walk",
        swimming: "swim",
        skiing: "skiing session",
        snowboarding: "snowboarding session",
    };

    const name = activity === "winter_sports"
        ? winterDiscipline === "snowboarding"
            ? "snowboarding session"
            : winterDiscipline === "skiing"
              ? "skiing session"
              : "winter sports session"
        : names[activity] || "activity";

    return `My ${name} on FiTrack${distanceText}`;
}

// Kept for compatibility with older components.
export function getRunShareText(distance) {
  return getActivityShareText(
    "running",
    distance,
  );
}

export function getShareDimensions(format) {
  switch (format) {
    case "square":
      return { width: 1080, height: 1080 };

    case "story":
      return { width: 1080, height: 1920 };

    case "post":
    default:
      return { width: 1080, height: 1350 };
  }
}

export function getShareFileName(
  format = "story",
) {
  return `FiTrack-${format}-${Date.now()}.png`;
}

export function getRunShareUrl(routeId) {
  if (!routeId) {
    return window.location.origin;
  }

  return `${window.location.origin}/lens/${routeId}`;
}

export async function imageUrlToDataUrl(url) {
  if (!url) return null;

  if (url.startsWith("data:")) {
    return url;
  }

  const response = await fetch(url, {
    mode: "cors",
    credentials: "omit",
  });

  if (!response.ok) {
    throw new Error(
      `Could not load image: ${response.status}`,
    );
  }

  const blob = await response.blob();

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = () =>
      resolve(reader.result);

    reader.onerror = () =>
      reject(reader.error);

    reader.readAsDataURL(blob);
  });
}
