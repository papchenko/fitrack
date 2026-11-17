import { useEffect, useState } from "react";
import { FiLayers, FiCheck, FiX } from "react-icons/fi";
import "./mapAppearance.scss";

const KEY = "recrunMapAppearance";
const AUTO_KEY = "recrunMapAutoAppearance";

const OPTIONS = [
    {
        id: "light",
        label: "Standard",
        detail: "Clean & detailed",
        background: "#e6e9e4",
        road: "#ffffff",
        minor: "#c4c9c5",
        park: "#b9d2b6",
    },
    {
        id: "dark",
        label: "Midnight",
        detail: "Deep graphite",
        background: "#272e36",
        road: "#515c67",
        minor: "#39434d",
        park: "#303e3c",
    },
    {
        id: "outdoor",
        label: "Outdoor",
        detail: "Trails & terrain",
        background: "#d8dfca",
        road: "#ffffff",
        minor: "#aab6a0",
        park: "#95b991",
    },
    // {
    //     id: "satellite",
    //     label: "Satellite",
    //     detail: "Aerial imagery",
    //     background: "#536756",
    //     road: "#b7b9aa",
    //     minor: "#657567",
    //     park: "#304f3c",
    // },
    {
        id: "minimal",
        label: "Minimal",
        detail: "Simple & focused",
        background: "#f0efeb",
        road: "#ffffff",
        minor: "#d4d5d2",
        park: "#d9e3d6",
    },
    {
        id: "monochrome",
        label: "Monochrome",
        detail: "Black & white",
        background: "#d4d4d4",
        road: "#ffffff",
        minor: "#929292",
        park: "#b3b3b3",
    },
];



const getAutomaticTheme = () => {
    const hour = new Date().getHours();

    return hour >= 7 && hour < 19
        ? "light"
        : "dark";
};

const isValid = (value) =>
    OPTIONS.some((option) => option.id === value);

const readTheme = () => {
    try {
        const value = localStorage.getItem(KEY);
        return isValid(value) ? value : "light";
    } catch {
        return "light";
    }
};

const readAutoEnabled = () => {
    try {
        return localStorage.getItem(AUTO_KEY) !== "false";
    } catch {
        return true;
    }
};

export function useMapAppearance() {
    const [manualTheme, setManualTheme] = useState(readTheme);
    const [autoEnabled, setAutoEnabled] = useState(readAutoEnabled);
    const [automaticTheme, setAutomaticTheme] = useState(
        getAutomaticTheme
    );

    useEffect(() => {
        const sync = () => {
            setManualTheme(readTheme());
            setAutoEnabled(readAutoEnabled());
            setAutomaticTheme(getAutomaticTheme());
        };

        const updateClock = () => {
            setAutomaticTheme(getAutomaticTheme());
        };

        const handleVisibility = () => {
            if (!document.hidden) updateClock();
        };

        const interval = window.setInterval(updateClock, 60000);

        window.addEventListener("storage", sync);
        window.addEventListener(
            "recrun-map-appearance",
            sync
        );
        document.addEventListener(
            "visibilitychange",
            handleVisibility
        );

        return () => {
            window.clearInterval(interval);
            window.removeEventListener("storage", sync);
            window.removeEventListener(
                "recrun-map-appearance",
                sync
            );
            document.removeEventListener(
                "visibilitychange",
                handleVisibility
            );
        };
    }, []);

    const changeTheme = (value) => {
        if (!isValid(value)) return;

        try {
            localStorage.setItem(KEY, value);
            localStorage.setItem(AUTO_KEY, "false");
        } catch {
            // Storage unavailable
        }

        setManualTheme(value);
        setAutoEnabled(false);

        window.dispatchEvent(
            new Event("recrun-map-appearance")
        );
    };

    const changeAutoEnabled = (enabled) => {
        try {
            localStorage.setItem(AUTO_KEY, String(enabled));
        } catch {
            // Storage unavailable
        }

        setAutoEnabled(enabled);
        setAutomaticTheme(getAutomaticTheme());

        window.dispatchEvent(
            new Event("recrun-map-appearance")
        );
    };

    const theme = autoEnabled
        ? automaticTheme
        : manualTheme;

    return {
        theme,
        changeTheme,
        autoEnabled,
        changeAutoEnabled,
    };
}


function MapPreview({ option }) {
  return (
    <svg
      className="recrun-map-preview"
      viewBox="0 0 160 104"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <rect
        width="160"
        height="104"
        fill={option.background}
      />

      <path
        d="M-10 0 L48 0 L65 28 L45 52 L0 47 Z
           M110 5 L160 0 L160 43 L138 55 L99 34 Z
           M96 66 L148 73 L160 104 L72 104 Z"
        fill={option.park}
      />

      <g
        stroke={option.minor}
        strokeWidth="2"
        fill="none"
      >
        <path d="M0 15 L160 60" />
        <path d="M0 83 L160 20" />
        <path d="M37 0 L65 104" />
        <path d="M125 0 L110 104" />
      </g>

      <g
        stroke={option.road}
        strokeWidth="8"
        fill="none"
      >
        <path d="M-10 35 L170 83" />
        <path d="M-10 96 L170 13" />
        <path d="M81 -10 L38 120" />
      </g>

    <path
    d="M25 77 Q43 61 59 66 T94 43 T135 30"
    stroke="#ffffff"
    strokeWidth="8"
    strokeLinecap="round"
    strokeLinejoin="round"
    fill="none"
/>

<path
    d="M25 77 Q43 61 59 66 T94 43 T135 30"
    stroke="#db3206"
    strokeWidth="5"
    strokeLinecap="round"
    strokeLinejoin="round"
    fill="none"
/>

<circle
    cx="25"
    cy="77"
    r="5"
    fill="#ffffff"
    stroke="#db3206"
    strokeWidth="2"
/>

<circle
    cx="135"
    cy="30"
    r="5"
    fill="#db3206"
    stroke="#ffffff"
    strokeWidth="2"
/>
    </svg>
  );
}

export default function MapAppearance({
    theme,
    onChange,
    autoEnabled = true,
    onAutoChange,
}) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="recrun-map-appearance"
      data-map-capture-exclude="true"
    >
      <button
        type="button"
        className={`recrun-map-appearance__trigger ${
          open ? "is-open" : ""
        }`}
        aria-label="Map appearance"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
      >
        <FiLayers />
        <span>Map style</span>
      </button>

      {open && (
        <div className="recrun-map-appearance__panel">
          <div className="recrun-map-appearance__heading">
            <div className="recrun-map-appearance__title">
              <span className="recrun-map-appearance__title-icon">
                <FiLayers />
              </span>

              <div>
                <strong>Map appearance</strong>
                <small>Customize your map</small>
              </div>
            </div>

            <button
              type="button"
              className="recrun-map-appearance__close"
              onClick={() => setOpen(false)}
              aria-label="Close"
            >
              <FiX />
            </button>
          </div>

<label className="recrun-map-appearance__auto">
    <span className="recrun-map-appearance__auto-info">
        <strong>Automatic appearance</strong>
        <small>
            Standard by day · Midnight by night
        </small>
    </span>

    <input
    type="checkbox"
    checked={autoEnabled}
    onChange={(event) =>
        onAutoChange?.(event.target.checked)
    }
    aria-label="Automatic map appearance"
/>
</label>

          <div className="recrun-map-appearance__grid">
            {OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                className={`recrun-map-appearance__option ${
                  theme === option.id ? "is-selected" : ""
                }`}
                aria-pressed={theme === option.id}
                onClick={() => {
                  onChange?.(option.id);
                  setOpen(false);
              }}
              >
                <span className="recrun-map-appearance__sample">
                  <MapPreview option={option} />
                </span>

                <span className="recrun-map-appearance__info">
                  <span className="recrun-map-appearance__name">
                    <strong>{option.label}</strong>

                    {theme === option.id && (
                      <FiCheck />
                    )}
                  </span>

                  <small>{option.detail}</small>
                </span>
              </button>
            ))}
          </div>

          <div className="recrun-map-appearance__footer">
            <FiCheck />
            <span>
    {autoEnabled
        ? "Automatic appearance enabled"
        : "Manual appearance saved"}
</span>
          </div>
        </div>
      )}
    </div>
  );
}