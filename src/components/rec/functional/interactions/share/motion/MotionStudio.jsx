import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { getShareActivityName, normalizeShareActivityType } from "../runShareUtils";
import { MdCameraRoll, MdOutlineRestartAlt, MdOutlineStopCircle } from "react-icons/md";
import { MdOutlinePlayCircle } from "react-icons/md";
import { MdOutlinePauseCircleOutline } from "react-icons/md";
import "./motionStudio.scss";

const SIZES = {
    story: [540, 960],
    square: [720, 720],
    post: [576, 720],
};
const DURATION_OPTIONS = [5, 10, 15, 20, 30];
const FPS_OPTIONS = [24, 30, 60];
const THEMES = ["dark", "light", "orange", "midnight", "neon", "sunset"];
const STYLES = [
    { id: "route", label: "Route Trace", desc: "GPS line reveal" },
    { id: "stats", label: "Performance", desc: "Animated numbers" },
    { id: "cinematic", label: "Cinematic", desc: "Photo motion" },
    { id: "pulse", label: "Energy Pulse", desc: "Dynamic rings" },
    { id: "split", label: "Split Focus", desc: "Photo and metrics" },
    { id: "finish", label: "Finish Line", desc: "Celebration reveal" },
];
const PRESETS = {
    classic: { style: "stats", theme: "dark", seconds: 10, transition: "smooth", animation: "count" },
    athlete: { style: "route", theme: "neon", seconds: 15, transition: "spring", animation: "trace" },
    cinema: { style: "cinematic", theme: "midnight", seconds: 15, transition: "smooth", animation: "count" },
    victory: { style: "finish", theme: "orange", seconds: 10, transition: "bounce", animation: "count" },
};
const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
const ease = (value) => 1 - Math.pow(1 - clamp(value), 3);
const number = (value) => {
    const n = Number(value);
    return Number.isFinite(n) && n >= 0 ? n : null;
};

function parsePoints(route, order = "lnglat") {
    if (!Array.isArray(route)) return [];
    return route.map((point) => {
        let lat, lng;
        if (Array.isArray(point)) {
            [lat, lng] = order === "latlng" ? point : [point[1], point[0]];
        } else {
            lat = point?.lat ?? point?.latitude;
            lng = point?.lng ?? point?.lon ?? point?.longitude;
        }
        lat = Number(lat);
        lng = Number(lng);
        return Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180
            ? { lat, lng } : null;
    }).filter(Boolean);
}

function preparePath(points, width, height) {
    if (points.length < 2) return [];
    const averageLatitude = points.reduce((sum, point) => sum + point.lat, 0) / points.length;
    const longitudeScale = Math.max(0.01, Math.cos(averageLatitude * Math.PI / 180));
    const projected = points.map((point) => ({ x: point.lng * longitudeScale, y: -point.lat }));
    const xs = projected.map((point) => point.x);
    const ys = projected.map((point) => point.y);
    const minX = Math.min(...xs);
    const minY = Math.min(...ys);
    const rangeX = Math.max(Math.max(...xs) - minX, 1e-8);
    const rangeY = Math.max(Math.max(...ys) - minY, 1e-8);
    const areaWidth = width * 0.78;
    const areaHeight = height * 0.37;
    const scale = Math.min(areaWidth / rangeX, areaHeight / rangeY);
    const offsetX = (width - rangeX * scale) / 2;
    const offsetY = height * 0.24 + (areaHeight - rangeY * scale) / 2;
    return projected.map((point) => ({
        x: offsetX + (point.x - minX) * scale,
        y: offsetY + (point.y - minY) * scale,
    }));
}

function roundRect(ctx, x, y, w, h, r, fill) {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    ctx.fillStyle = fill;
    ctx.fill();
}

function drawCoverImage(ctx, image, x, y, size) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
    ctx.clip();
    const scale = Math.max(size / image.width, size / image.height);
    const iw = image.width * scale;
    const ih = image.height * scale;
    ctx.drawImage(image, x + (size - iw) / 2, y + (size - ih) / 2, iw, ih);
    ctx.restore();
}

function drawFrame(ctx, settings, progress, image, path, avatar, logo) {
    const { width: w, height: h, style, theme, title, activityName, distance, duration, calories, username, avatarFallback, premiumPackage,
        accentColor, showAvatar, showLogo, showTitle, showProgress, showLocation, locationName, dateText, tagline,
        metricMode, showCalories, showDistance, showDuration, transition, animation, photoOpacity, routeThickness, routeGlow,
        showParticles, introOutro, showWatermark, customText } = settings;
    const easedProgress = transition === "linear" ? progress : transition === "bounce"
        ? 1 - Math.pow(1 - clamp(progress), 2) * Math.abs(Math.cos(progress * Math.PI * 3)) : ease(progress);
    const reveal = introOutro ? Math.min(1, progress * 8, (1 - progress) * 8) : 1;
    const orange = accentColor || (theme === "orange" ? "#ffffff" : "#ff531c");
    const foreground = theme === "light" ? "#15171b" : "#ffffff";
    const muted = theme === "light" ? "#666b73" : "#aab0b8";
    const background = ({ light: "#f3f2ee", orange: "#d94412", midnight: "#090d1e", neon: "#080e10", sunset: "#321525" })[theme] || "#11151c";
    const unit = w / 540;
    const u = (n) => n * unit;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, w, h);

    if (["cinematic", "split"].includes(style) && image) {
        const scale = Math.max(w / image.width, h / image.height) * (1.06 + progress * 0.08);
        const iw = image.width * scale;
        const ih = image.height * scale;
        ctx.globalAlpha = photoOpacity;
        ctx.drawImage(image, (w - iw) / 2, (h - ih) / 2, iw, ih);
        ctx.globalAlpha = 1;
        const shade = ctx.createLinearGradient(0, 0, 0, h);
        shade.addColorStop(0, "rgba(0,0,0,.58)");
        shade.addColorStop(.45, "rgba(0,0,0,.14)");
        shade.addColorStop(1, "rgba(0,0,0,.92)");
        ctx.fillStyle = shade;
        ctx.fillRect(0, 0, w, h);
    }
    const photoMode = ["cinematic", "split"].includes(style) && image;
    const ink = photoMode ? "#ffffff" : foreground;
    const secondary = photoMode ? "#d9dce0" : muted;
    const accent = orange;
    // Same identity information as the static Share Studio: author, avatar,
    // optional Pro verification and FiTrack logo. Drawn into the video canvas.
    const avatarSize = u(58);
    const avatarX = u(34);
    const avatarY = u(35);
    if (showAvatar && avatar) {
        drawCoverImage(ctx, avatar, avatarX, avatarY, avatarSize);
    } else if (showAvatar) {
        ctx.beginPath();
        ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
        ctx.fillStyle = "#ff531c";
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = `800 ${u(27)}px Arial`;
        ctx.fillText(String(avatarFallback || username || "A").slice(0, 1).toUpperCase(), avatarX + avatarSize / 2, avatarY + avatarSize / 2);
    }
    if (showAvatar) {
    ctx.beginPath();
    ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = u(2.5);
    ctx.stroke();

    if (showAvatar && premiumPackage?.active && premiumPackage?.title === "Pro") {
        const bx = avatarX + avatarSize - u(4);
        const by = avatarY + avatarSize - u(5);
        ctx.beginPath();
        ctx.arc(bx, by, u(11), 0, Math.PI * 2);
        ctx.fillStyle = "#ff531c";
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = u(2);
        ctx.stroke();
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = `bold ${u(12)}px Arial`;
        ctx.fillStyle = "#ffffff";
        ctx.fillText("✓", bx, by + u(0.5));
    }

    }
    if (showLogo && logo) {
        const maxWidth = u(90);
        const maxHeight = u(43);
        const scale = Math.min(maxWidth / logo.width, maxHeight / logo.height);
        const lw = logo.width * scale;
        const lh = logo.height * scale;
        ctx.drawImage(logo, w - u(34) - lw, u(39), lw, lh);
    } else if (showLogo) {
        ctx.textAlign = "right";
        ctx.textBaseline = "top";
        ctx.fillStyle = accent;
        ctx.font = `900 ${u(22)}px Arial`;
        ctx.fillText("FiTrack", w - u(35), u(47));
    }

    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    const textX = showAvatar ? u(107) : u(35);
    const textWidth = w - textX - u(135);
    ctx.fillStyle = ink;
    ctx.font = `700 ${u(20)}px Arial`;
    if (showTitle) ctx.fillText(String(customText || title || activityName), textX, u(39), Math.max(u(100), textWidth));
    ctx.fillStyle = secondary;
    ctx.font = `600 ${u(16)}px Arial`;
    ctx.fillText(String(username || "Athlete"), textX, u(68), Math.max(u(100), textWidth));

    if (showParticles) {
        ctx.save();
        for (let i = 0; i < 28; i++) {
            const x = ((i * 97 + progress * (20 + i * 5)) % 540) * unit;
            const y = ((i * 137 + progress * (50 + i * 4)) % (h / unit)) * unit;
            ctx.globalAlpha = 0.08 + (i % 4) * 0.035;
            ctx.fillStyle = accent;
            ctx.beginPath(); ctx.arc(x, y, u(1.5 + i % 3), 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore();
    }
    if (style === "pulse" || style === "finish") {
        ctx.save();
        const centerY = h * .42;
        for (let i = 0; i < 4; i++) {
            const radius = u(45 + i * 55 + progress * 45);
            ctx.beginPath(); ctx.arc(w / 2, centerY, radius, 0, Math.PI * 2);
            ctx.strokeStyle = accent; ctx.globalAlpha = 0.24 - i * .04;
            ctx.lineWidth = u(3); ctx.stroke();
        }
        ctx.globalAlpha = 1;
        ctx.textAlign = "center";
        ctx.fillStyle = accent;
        ctx.font = `900 ${u(style === "finish" ? 47 : 34)}px Arial`;
        ctx.fillText(style === "finish" ? "FINISH STRONG" : activityName.toUpperCase(), w / 2, centerY);
        ctx.restore();
    }
    if (style === "route" && path.length > 1) {
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.strokeStyle = theme === "light" ? "#cbd0d6" : "#49515b";
        ctx.lineWidth = u(routeThickness * .65);
        ctx.beginPath();
        path.forEach((point, index) => index ? ctx.lineTo(point.x, point.y) : ctx.moveTo(point.x, point.y));
        ctx.stroke();

        const segments = [];
        let total = 0;
        for (let i = 1; i < path.length; i++) {
            const length = Math.hypot(path[i].x - path[i - 1].x, path[i].y - path[i - 1].y);
            segments.push(length);
            total += length;
        }
        let remaining = total * (animation === "instant" ? 1 : easedProgress);
        let current = path[0];
        ctx.strokeStyle = accent;
        ctx.lineWidth = u(routeThickness);
        if (routeGlow) { ctx.shadowBlur = u(18); ctx.shadowColor = accent; }
        ctx.beginPath();
        ctx.moveTo(current.x, current.y);
        for (let i = 1; i < path.length && remaining > 0; i++) {
            const ratio = segments[i - 1] ? clamp(remaining / segments[i - 1]) : 1;
            current = {
                x: path[i - 1].x + (path[i].x - path[i - 1].x) * ratio,
                y: path[i - 1].y + (path[i].y - path[i - 1].y) * ratio,
            };
            ctx.lineTo(current.x, current.y);
            remaining -= segments[i - 1];
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.arc(current.x, current.y, u(11), 0, Math.PI * 2);
        ctx.fillStyle = accent;
        ctx.fill();
        ctx.lineWidth = u(4);
        ctx.strokeStyle = "#fff";
        ctx.stroke();
    } else if (!["cinematic", "split", "pulse", "finish"].includes(style)) {
        ctx.fillStyle = accent;
        ctx.globalAlpha = 0.09;
        ctx.beginPath();
        ctx.arc(w / 2, h * .43, w * .37 * (1 + progress * .1), 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.textAlign = "center";
        ctx.font = `900 ${u(38)}px Arial`;
        ctx.fillStyle = accent;
        ctx.fillText(activityName.toUpperCase(), w / 2, h * .42);
        ctx.textAlign = "left";
    }

    const panelY = h - u(245);
    roundRect(ctx, u(25), panelY, w - u(50), u(190), u(18),
        photoMode ? "rgba(12,15,20,.75)" : theme === "light" ? "#ffffff" : "#20252e");
    const metricInk = photoMode ? "#ffffff" : foreground;
    const metricMuted = photoMode ? "#cbd0d6" : muted;
    const distanceValue = number(distance);
    const elapsed = number(duration);
    const energy = number(calories);
    const factor = metricMode === "final" ? 1 : easedProgress;
    const metrics = [
        ...(showDistance ? [{ label: "DISTANCE", value: distanceValue == null ? "—" : `${(distanceValue * factor).toFixed(2)} km` }] : []),
        ...(showDuration ? [{ label: "DURATION", value: elapsed == null ? "—" : `${Math.round(elapsed * factor)} min` }] : []),
        ...(showCalories ? [{ label: "CALORIES", value: energy == null ? "—" : `${Math.round(energy * factor)} kcal` }] : []),
    ];
    if (!metrics.length) metrics.push({ label: "ACTIVITY", value: activityName });
    metrics.forEach((metric, index) => {
        const x = u(45) + index * ((w - u(90)) / metrics.length);
        ctx.fillStyle = metricMuted;
        ctx.font = `700 ${u(14)}px Arial`;
        ctx.fillText(metric.label, x, panelY + u(39));
        ctx.fillStyle = metricInk;
        ctx.font = `800 ${u(metrics.length === 1 ? 32 : 24)}px Arial`;
        ctx.fillText(metric.value, x, panelY + u(77));
    });
    ctx.fillStyle = accent;
    if (showProgress) ctx.fillRect(u(45), panelY + u(145), (w - u(90)) * progress, u(5));
    ctx.fillStyle = metricMuted;
    ctx.font = `600 ${u(13)}px Arial`;
    if (showWatermark) ctx.fillText(tagline || "RECORDED WITH FITRACK", u(45), panelY + u(162), w - u(90));
    if (showLocation && (locationName || dateText)) {
        ctx.textAlign = "right";
        ctx.font = `600 ${u(12)}px Arial`;
        ctx.fillText([locationName, dateText].filter(Boolean).join(" · "), w - u(35), h - u(22), w - u(70));
    }
    if (introOutro) {
        ctx.fillStyle = background;
        ctx.globalAlpha = 1 - Math.max(0, reveal);
        ctx.fillRect(0, 0, w, h);
        ctx.globalAlpha = 1;
    }
}

function loadImage(src) {
    if (!src) return Promise.resolve(null);
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.crossOrigin = "anonymous";
        img.src = src;
    });
}

const OptionButtons = ({ options, value, onChange, disabled, disabledOption }) => (
    <div className="motion-options">
        {options.map((item) => {
            const option = typeof item === "object" ? item : { id: item, label: String(item) };
            return (
                <button key={option.id} type="button" className={value === option.id ? "active" : ""}
                    disabled={disabled || disabledOption?.(option.id)} onClick={() => onChange(option.id)}
                    title={option.desc || option.label}>{option.label}</button>
            );
        })}
    </div>
);

const Toggle = ({ label, checked, onChange, disabled }) => (
    <label className="motion-toggle"><span>{label}</span><input type="checkbox" checked={checked} disabled={disabled}
        onChange={(event) => onChange(event.target.checked)} /></label>
);

function getMimeType() {
    if (!window.MediaRecorder) return "";
    return ["video/mp4;codecs=avc1.42E01E", "video/mp4", "video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"]
        .find((type) => MediaRecorder.isTypeSupported(type)) || "";
}

function saveBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
}

export default function MotionStudio({ onClose, route = [], activityType = "running", winterDiscipline,
    title, username, avatarUrl, avatarFallback, premiumPackage, distance, duration, calories, imageDataUrl,
    coordinateOrder, initialFormat = "story", locationName, timestamp }) {
    const canvasRef = useRef(null);
    const animationRef = useRef(0);
    const positionRef = useRef(0);
    const startRef = useRef(0);
    const imageRef = useRef(null);
    const avatarRef = useRef(null);
    const logoRef = useRef(null);
    const recorderRef = useRef(null);
    const exportStopRef = useRef(null);
    const mountedRef = useRef(true);
    const [assetsReady, setAssetsReady] = useState(false);
    const [style, setStyle] = useState("route");
    const [format, setFormat] = useState(initialFormat);
    const [theme, setTheme] = useState("dark");
    const [accentColor, setAccentColor] = useState("#ff531c");
    const [seconds, setSeconds] = useState(10);
    const [fps, setFps] = useState(30);
    const [quality, setQuality] = useState("standard");
    const [playing, setPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [exporting, setExporting] = useState(false);
    const [exportProgress, setExportProgress] = useState(0);
    const [message, setMessage] = useState("");
    const [showAvatar, setShowAvatar] = useState(true);
    const [showLogo, setShowLogo] = useState(true);
    const [showTitle, setShowTitle] = useState(true);
    const [showProgress, setShowProgress] = useState(true);
    const [showLocation, setShowLocation] = useState(true);
    const [showWatermark, setShowWatermark] = useState(true);
    const [showParticles, setShowParticles] = useState(false);
    const [showCalories, setShowCalories] = useState(true);
    const [showDistance, setShowDistance] = useState(true);
    const [showDuration, setShowDuration] = useState(true);
    const [introOutro, setIntroOutro] = useState(false);
    const [routeGlow, setRouteGlow] = useState(true);
    const [routeThickness, setRouteThickness] = useState(9);
    const [photoOpacity, setPhotoOpacity] = useState(0.82);
    const [transition, setTransition] = useState("linear");
    const [animation, setAnimation] = useState("trace");
    const [metricMode, setMetricMode] = useState("count");
    const [customText, setCustomText] = useState("");
    const [tagline, setTagline] = useState("RECORDED WITH FITRACK");
    const [tab, setTab] = useState("templates");
    const [lastVideo, setLastVideo] = useState(null);
    const activity = normalizeShareActivityType(activityType);
    const activityName = getShareActivityName(activity, winterDiscipline);
    const session = ["workout", "tennis"].includes(activity);
    const points = useMemo(() => parsePoints(route, coordinateOrder || (activity === "kayaking" ? "latlng" : "lnglat")), [route, coordinateOrder, activity]);
    const hasRoute = !session && points.length >= 2;
    const actualStyle = style === "route" && !hasRoute ? "stats" : style;
    const dimensions = SIZES[format] || SIZES.story;
    const path = useMemo(() => preparePath(points, ...dimensions), [points, format]);
    const dateText = useMemo(() => {
        const d = timestamp?.toDate?.() || (timestamp?.seconds ? new Date(timestamp.seconds * 1000) : timestamp ? new Date(timestamp) : null);
        return d instanceof Date && !Number.isNaN(d.getTime()) ? d.toLocaleDateString("en-GB") : "";
    }, [timestamp]);
    const settings = { width: dimensions[0], height: dimensions[1], style: actualStyle, theme, title, activityName,
        distance, duration, calories, username, avatarFallback, premiumPackage, accentColor, showAvatar, showLogo,
        showTitle, showProgress, showLocation, locationName, dateText, tagline, metricMode, showCalories, showDistance,
        showDuration, transition, animation, photoOpacity, routeThickness, routeGlow, showParticles, introOutro,
        showWatermark, customText };
    const draw = useCallback((value) => {
        const canvas = canvasRef.current;
        const context = canvas?.getContext("2d", { alpha: false });
        if (context) drawFrame(context, settings, value, imageRef.current, path, avatarRef.current, logoRef.current);
    }, [actualStyle, theme, title, activityName, distance, duration, calories, username, avatarFallback, premiumPackage,
        format, path, accentColor, showAvatar, showLogo, showTitle, showProgress, showLocation, locationName, dateText,
        tagline, metricMode, showCalories, showDistance, showDuration, transition, animation, photoOpacity,
        routeThickness, routeGlow, showParticles, introOutro, showWatermark, customText]);

    useEffect(() => {
        let active = true;
        setAssetsReady(false);
        Promise.all([loadImage(imageDataUrl), loadImage(avatarUrl), loadImage("/logo.png")]).then(([image, avatar, logo]) => {
            if (!active) return;
            imageRef.current = image;
            avatarRef.current = avatar;
            logoRef.current = logo;
            setAssetsReady(true);
            draw(positionRef.current);
        });
        return () => { active = false; };
    }, [imageDataUrl, avatarUrl]);
    useEffect(() => { draw(positionRef.current); }, [draw]);
    useEffect(() => {
        mountedRef.current = true;
        const original = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            mountedRef.current = false;
            cancelAnimationFrame(animationRef.current);
            document.body.style.overflow = original;
        };
    }, []);
    useEffect(() => {
        const onKey = (event) => { if (event.key === "Escape" && !exporting) onClose(); };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [onClose, exporting]);
    useEffect(() => {
        if (!playing || exporting) return;
        startRef.current = performance.now() - positionRef.current * seconds * 1000;
        const tick = (now) => {
            const next = clamp((now - startRef.current) / (seconds * 1000));
            positionRef.current = next;
            setProgress(next);
            draw(next);
            if (next < 1) animationRef.current = requestAnimationFrame(tick);
            else setPlaying(false);
        };
        animationRef.current = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(animationRef.current);
    }, [playing, exporting, seconds, draw]);
    const seek = (value) => {
        positionRef.current = value;
        setProgress(value);
        draw(value);
        if (playing) startRef.current = performance.now() - value * seconds * 1000;
    };
    const reset = () => { setPlaying(false); seek(0); };
    const applyPreset = (key) => {
        const preset = PRESETS[key];
        if (!preset) return;
        reset();
        setStyle(preset.style === "route" && !hasRoute ? "stats" : preset.style);
        setTheme(preset.theme);
        setSeconds(preset.seconds);
        setTransition(preset.transition);
        setAnimation(preset.animation);
        setAccentColor(preset.theme === "neon" ? "#39e5b6" : "#ff531c");
    };
    const exportVideo = async () => {
        if (exporting || !assetsReady) return;
        const canvas = canvasRef.current;
        const mimeType = getMimeType();
        if (!canvas?.captureStream || !mimeType) {
            setMessage("This browser cannot record video. Try the latest Chrome or Safari.");
            return;
        }
        setPlaying(false);
        setExporting(true);
        setExportProgress(0);
        setLastVideo(null);
        setMessage("Recording in real time. Keep this tab visible until completion.");
        let stream;
        let recorder;
        let cancelled = false;
        try {
            seek(0);
            stream = canvas.captureStream(fps);
            recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: quality === "high" ? 8_000_000 : 3_500_000 });
            recorderRef.current = recorder;
            const chunks = [];
            const recorded = new Promise((resolve, reject) => {
                recorder.ondataavailable = (event) => { if (event.data.size) chunks.push(event.data); };
                recorder.onerror = () => reject(new Error("Video recorder failed."));
                recorder.onstop = () => resolve(new Blob(chunks, { type: mimeType }));
            });
            recorder.start(250);
            const begin = performance.now();
            await new Promise((resolve) => {
                let finished = false;
                const finish = (wasCancelled) => {
                    if (finished) return;
                    finished = true;
                    cancelled = wasCancelled;
                    resolve();
                };
                exportStopRef.current = () => finish(true);
                const tick = (now) => {
                    if (finished) return;
                    const next = clamp((now - begin) / (seconds * 1000));
                    positionRef.current = next;
                    if (mountedRef.current) { setProgress(next); setExportProgress(next); }
                    draw(next);
                    if (next < 1) animationRef.current = requestAnimationFrame(tick);
                    else finish(false);
                };
                animationRef.current = requestAnimationFrame(tick);
            });
            cancelAnimationFrame(animationRef.current);
            if (!cancelled) {
                draw(1);
                await new Promise((resolve) => setTimeout(resolve, 180));
            }
            if (recorder.state !== "inactive") recorder.stop();
            const blob = await recorded;
            if (!cancelled) {
                if (!blob.size) throw new Error("Video is empty.");
                const extension = mimeType.includes("mp4") ? "mp4" : "webm";
                const filename = `FiTrack-Motion-${actualStyle}-${format}-${Date.now()}.${extension}`;
                setLastVideo({ blob, filename });
                saveBlob(blob, filename);
                setMessage(`Video exported successfully (${extension.toUpperCase()}).`);
            } else {
                setMessage("Recording cancelled.");
            }
        } catch (error) {
            console.error("Motion export error:", error);
            setMessage(error.message || "Video export failed.");
        } finally {
            exportStopRef.current = null;
            recorderRef.current = null;
            cancelAnimationFrame(animationRef.current);
            stream?.getTracks().forEach((track) => track.stop());
            if (mountedRef.current) setExporting(false);
        }
    };
    const exportPoster = () => {
        if (!assetsReady || exporting) return;
        const canvas = canvasRef.current;
        draw(positionRef.current);
        canvas?.toBlob((blob) => {
            if (blob) saveBlob(blob, `FiTrack-Poster-${format}-${Date.now()}.png`);
            else setMessage("Could not save poster.");
        }, "image/png");
    };
    const shareLastVideo = async () => {
        if (!lastVideo) return;
        const file = new File([lastVideo.blob], lastVideo.filename, { type: lastVideo.blob.type });
        if (!navigator.share || !navigator.canShare?.({ files: [file] })) {
            setMessage("Video file sharing is not supported on this device. The downloaded file can be shared manually.");
            return;
        }
        try { await navigator.share({ title: title || "FiTrack Activity", files: [file] }); }
        catch (error) { if (error?.name !== "AbortError") setMessage("Could not share video."); }
    };
    const setSafeStyle = (next) => { reset(); setStyle(next); };
    const selectFormat = (next) => { reset(); setFormat(next); };
    return createPortal(
        <div className="motion-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget && !exporting) onClose(); }}>
            <section className="motion-dialog" role="dialog" aria-modal="true" aria-label="FiTrack Motion Studio">
                <header className="motion-header">
                    {/* <div><small>FITRACK / CREATOR TOOLS</small><h2>Motion Studio <span className="motion-version">PRO EDITOR</span></h2></div> */}
                    <div><h2>Motion Studio</h2></div>
                    <button type="button" disabled={exporting} onClick={onClose} aria-label="Close">×</button>
                </header>
                <div className="motion-content">
                    <div className="motion-preview-area">
                        <div className="motion-preview-top"><strong>LIVE PREVIEW</strong><span>{format === "story" ? "9:16" : format === "post" ? "4:5" : "1:1"} · {seconds}s · {fps} FPS</span></div>
                        <div className="motion-canvas-wrap"><canvas ref={canvasRef} width={dimensions[0]} height={dimensions[1]} aria-label="Animated activity preview" /></div>
                        <div className="motion-timeline">
                            <input type="range" min="0" max="1000" value={Math.round(progress * 1000)} disabled={exporting}
                                onChange={(event) => seek(Number(event.target.value) / 1000)} aria-label="Animation progress" />
                            <span>{(progress * seconds).toFixed(1)} / {seconds}s</span>
                        </div>
                        <div className="motion-playback">
                            <button type="button" className="motion-play" disabled={exporting} onClick={reset}><MdOutlineRestartAlt /> Restart</button>

<button
    type="button"
    disabled={exporting}
    className="motion-play"
    onClick={() => {
        if (progress >= 1) seek(0);
        setPlaying(!playing);
    }}
>
    {playing ? (
        <>
            <MdOutlinePauseCircleOutline />
            <span>Pause</span>
        </>
    ) : (
        <>
            <MdOutlinePlayCircle />
            <span>Play</span>
        </>
    )}
</button>
                            <button type="button" className="motion-play" disabled={exporting} onClick={() => { setPlaying(false); seek(1); }}><MdOutlineStopCircle /> End</button>
                        </div>
                        {exporting && <div className="motion-export-progress"><div style={{ width: `${exportProgress * 100}%` }} /><span>Recording {Math.round(exportProgress * 100)}%</span></div>}
                        <div className="motion-preview-meta">{activityName} · {hasRoute ? `${points.length} GPS points` : "No GPS route"} · Canvas video export</div>
                    </div>
                    <aside className="motion-settings">
                        <div className="motion-tabs">
                            {[{ id: "templates", label: "Styles" }, { id: "design", label: "Design" }, { id: "content", label: "Content" }, { id: "effects", label: "Effects" }, { id: "export", label: "Export" }].map((item) => (
                                <button key={item.id} type="button" className={tab === item.id ? "active" : ""} onClick={() => setTab(item.id)}>{item.label}</button>
                            ))}
                        </div>
                        <div className="motion-settings-body">
                            {tab === "templates" && <>
                                <h3>Quick presets</h3>
                                <div className="motion-preset-grid">{Object.keys(PRESETS).map((key) => <button type="button" key={key} disabled={exporting} onClick={() => applyPreset(key)}>{key}</button>)}</div>
                                <h3>Motion scenes</h3>
                                <div className="motion-style-grid">{STYLES.map((item) => <button type="button" key={item.id} disabled={exporting || (item.id === "route" && !hasRoute)} className={actualStyle === item.id ? "active" : ""} onClick={() => setSafeStyle(item.id)}><strong>{item.label}</strong><small>{item.desc}</small></button>)}</div>
                                {!hasRoute && <p className="motion-note">Route Trace requires GPS data. All other scenes work without a route.</p>}
                                <h3>Aspect ratio</h3>
                                <OptionButtons disabled={exporting} options={[{ id: "story", label: "9:16 Story" }, { id: "post", label: "4:5 Post" }, { id: "square", label: "1:1 Square" }]} value={format} onChange={selectFormat} />
                                <h3>Video length</h3>
                                <OptionButtons disabled={exporting} options={DURATION_OPTIONS.map((v) => ({ id: v, label: `${v}s` }))} value={seconds} onChange={(value) => { reset(); setSeconds(value); }} />
                            </>}
                            {tab === "design" && <>
                                <h3>Color theme</h3><OptionButtons disabled={exporting} options={THEMES} value={theme} onChange={setTheme} />
                                <h3>Accent color</h3><div className="motion-colors">{["#ff531c", "#39e5b6", "#38bdf8", "#fbbf24", "#a78bfa", "#f472b6", "#ffffff"].map((color) => <button type="button" key={color} aria-label={`Accent ${color}`} title={color} disabled={exporting} className={accentColor === color ? "active" : ""} style={{ background: color }} onClick={() => setAccentColor(color)} />)}<input aria-label="Custom accent color" type="color" value={accentColor} disabled={exporting} onChange={(event) => setAccentColor(event.target.value)} /></div>
                                <h3>Photo intensity: {Math.round(photoOpacity * 100)}%</h3><input className="motion-range" type="range" min="30" max="100" value={Math.round(photoOpacity * 100)} disabled={exporting} onChange={(event) => setPhotoOpacity(Number(event.target.value) / 100)} />
                                <Toggle label="Athlete avatar" checked={showAvatar} onChange={setShowAvatar} disabled={exporting} />
                                <Toggle label="FiTrack logo" checked={showLogo} onChange={setShowLogo} disabled={exporting} />
                                <Toggle label="Activity title" checked={showTitle} onChange={setShowTitle} disabled={exporting} />
                                <Toggle label="Location and date" checked={showLocation} onChange={setShowLocation} disabled={exporting} />
                                <Toggle label="FiTrack credit" checked={showWatermark} onChange={setShowWatermark} disabled={exporting} />
                            </>}
                            {tab === "content" && <>
                                <h3>Custom headline</h3><input className="motion-text-input" maxLength={65} value={customText} disabled={exporting} onChange={(event) => setCustomText(event.target.value)} placeholder={title || "Activity title"} />
                                <h3>Footer tagline</h3><input className="motion-text-input" maxLength={50} value={tagline} disabled={exporting} onChange={(event) => setTagline(event.target.value)} placeholder="RECORDED WITH FITRACK" />
                                <h3>Statistics</h3>
                                <Toggle label="Distance" checked={showDistance} onChange={setShowDistance} disabled={exporting} />
                                <Toggle label="Duration" checked={showDuration} onChange={setShowDuration} disabled={exporting} />
                                <Toggle label="Calories" checked={showCalories} onChange={setShowCalories} disabled={exporting} />
                                <Toggle label="Progress bar" checked={showProgress} onChange={setShowProgress} disabled={exporting} />
                                <h3>Metric animation</h3><OptionButtons disabled={exporting} options={[{ id: "count", label: "Count up" }, { id: "final", label: "Final values" }]} value={metricMode} onChange={setMetricMode} />
                            </>}
                            {tab === "effects" && <>
                                <h3>Animation easing</h3><OptionButtons disabled={exporting} options={[{ id: "linear", label: "Linear" }, { id: "smooth", label: "Smooth" }, { id: "bounce", label: "Bounce" }]} value={transition} onChange={setTransition} />
                                <h3>Route animation</h3><OptionButtons disabled={exporting || !hasRoute} options={[{ id: "trace", label: "Trace" }, { id: "instant", label: "Full route" }]} value={animation} onChange={setAnimation} />
                                <h3>Route thickness: {routeThickness}</h3><input className="motion-range" type="range" min="3" max="18" value={routeThickness} disabled={exporting} onChange={(event) => setRouteThickness(Number(event.target.value))} />
                                <Toggle label="Glowing GPS route" checked={routeGlow} onChange={setRouteGlow} disabled={exporting} />
                                <Toggle label="Ambient particles" checked={showParticles} onChange={setShowParticles} disabled={exporting} />
                                <Toggle label="Intro and outro fade" checked={introOutro} onChange={setIntroOutro} disabled={exporting} />
                            </>}
                            {tab === "export" && <>
                                <h3>Video frame rate</h3><OptionButtons disabled={exporting} options={FPS_OPTIONS.map((v) => ({ id: v, label: `${v} FPS` }))} value={fps} onChange={setFps} />
                                <h3>Encoding quality</h3><OptionButtons disabled={exporting} options={[{ id: "standard", label: "Standard" }, { id: "high", label: "High" }]} value={quality} onChange={setQuality} />
                                <p className="motion-note">Video is recorded in real time with the best browser-supported MP4 or WebM codec. Frame rate and bitrate are requested values; the browser may deliver less. No audio track is added.</p>
                                <p className="motion-note">Output resolution: {dimensions[0]} × {dimensions[1]} px. For long exports, keep the browser tab visible.</p>
                            </>}
                        </div>
                        <div className="motion-bottom-actions">
                            <button type="button" className="motion-export" disabled={exporting || !assetsReady} onClick={exportVideo}>{exporting ? `Recording ${Math.round(exportProgress * 100)}%` : !assetsReady ? "Preparing assets..." : "Export Video"}</button>
                            <div className="motion-secondary-actions">
                                <button type="button" disabled={exporting || !assetsReady} onClick={exportPoster}>Save PNG frame</button>
                                <button type="button" disabled={exporting || !lastVideo} onClick={shareLastVideo}>Share video</button>
                            </div>
                            {exporting && <button type="button" className="motion-cancel" onClick={() => exportStopRef.current?.()}>Cancel recording</button>}
                            {message && <p className="motion-note" role="status">{message}</p>}
                            <button type="button" className="motion-back" disabled={exporting} onClick={onClose}>← Back to Share Studio</button>
                        </div>
                    </aside>
                </div>
            </section>
        </div>, document.body
    );
}
