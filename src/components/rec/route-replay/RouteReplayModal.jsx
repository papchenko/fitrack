import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FaPlay, FaPause, FaArrowLeft, FaRedo } from "react-icons/fa";

import RouteReplayMap from "./RouteReplayMap";

import {
    createReplayTrack,
    getReplayFrame,
} from "./routeReplayEngine";

import "./routeReplay.scss";

export default function RouteReplayModal({
    route = [],
    title = "Activity Replay",
    duration = 0,
    onClose,
}) {
    const track = useMemo(() => createReplayTrack(route), [route]);

    const [progress, setProgress] = useState(0);
    const [playing, setPlaying] = useState(false);
    const [speed, setSpeed] = useState(1);
    const [cameraMode, setCameraMode] = useState("follow");

    const lastFrameRef = useRef(null);
    const progressRef = useRef(0);

    const replaySeconds = 60;

    const frame = useMemo(
        () => getReplayFrame(track, progress),
        [track, progress]
    );

    useEffect(() => {
        progressRef.current = progress;
    }, [progress]);

    useEffect(() => {
        if (!playing) return;

        let animationId;

        const animate = (timestamp) => {
            if (lastFrameRef.current !== null) {
                const delta = Math.min(
                    (timestamp - lastFrameRef.current) / 1000,
                    0.1
                );

                const next = Math.min(
                    1,
                    progressRef.current +
                        (delta * speed) / replaySeconds
                );

                progressRef.current = next;
                setProgress(next);

                if (next >= 1) {
                    setPlaying(false);
                    return;
                }
            }

            lastFrameRef.current = timestamp;
            animationId = requestAnimationFrame(animate);
        };

        animationId = requestAnimationFrame(animate);

        return () => {
            cancelAnimationFrame(animationId);
            lastFrameRef.current = null;
        };
    }, [playing, speed]);

    useEffect(() => {
        const onKeyDown = (event) => {
            if (event.key === "Escape") {
                onClose?.();
            }
        };

        document.addEventListener("keydown", onKeyDown);

        return () => {
            document.removeEventListener("keydown", onKeyDown);
        };
    }, [onClose]);

    // Lock background scrolling while modal is open.
    useEffect(() => {
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, []);

    const handleRestart = () => {
        progressRef.current = 0;
        setProgress(0);
        setPlaying(false);
    };

    const handlePlayPause = () => {
        if (progressRef.current >= 1) {
            progressRef.current = 0;
            setProgress(0);
        }

        setPlaying((value) => !value);
    };

    const handleSeek = (event) => {
        const value = Number(event.target.value) / 1000;

        progressRef.current = value;
        setProgress(value);
    };

    const modal = (
        <div className="fitrack-replay-overlay">
            <div
                className="fitrack-replay-dialog"
                role="dialog"
                aria-modal="true"
                aria-label="3D Route Replay"
            >
                <header className="fitrack-replay-header">
                    <div className="fitrack-replay-heading">

                        <h2>{title}</h2>
                    </div>

                    {/* <span className="fitrack-replay-live-badge">
                        3D
                    </span> */}
                </header>

                {track.coordinates.length >= 2 &&
                track.totalMeters > 0 ? (
                    <>
                        <div className="fitrack-replay-map-wrapper">
                            <RouteReplayMap
                                track={track}
                                frame={frame}
                                cameraMode={cameraMode}
                            />
                        </div>

                        <div className="fitrack-replay-controls">
                            <div className="fitrack-replay-stats">
                                <div className="fitrack-replay-stat">
                                    <span>Distance</span>
                                    <strong>
                                        {frame?.distanceKm.toFixed(2) || "0.00"}
                                        <small> km</small>
                                    </strong>
                                </div>

                                <div className="fitrack-replay-stat">
                                    <span>Total Route</span>
                                    <strong>
                                        {(track.totalMeters / 1000).toFixed(2)}
                                        <small> km</small>
                                    </strong>
                                </div>

                                <div className="fitrack-replay-stat">
                                    <span>Progress</span>
                                    <strong>
                                        {Math.round(progress * 100)}
                                        <small> %</small>
                                    </strong>
                                </div>
                            </div>

                            <div className="fitrack-replay-timeline">
                                <input
                                    type="range"
                                    min="0"
                                    max="1000"
                                    value={Math.round(progress * 1000)}
                                    onChange={handleSeek}
                                    aria-label="Replay progress"
                                    style={{
                                        "--replay-progress": `${progress * 100}%`,
                                    }}
                                />
                            </div>

                            <div className="fitrack-replay-actions">
                                <button
                                    type="button"
                                    className="fitrack-replay-icon-btn"
                                    onClick={handleRestart}
                                    aria-label="Restart replay"
                                    title="Restart"
                                >
                                    <FaRedo />
                                </button>

                                <button
                                    type="button"
                                    className="fitrack-replay-play-btn"
                                    onClick={handlePlayPause}
                                >
                                    {playing ? <FaPause /> : <FaPlay />}
                                    <span>{playing ? "Pause" : "Play"}</span>
                                </button>

                                <select
                                    value={speed}
                                    onChange={(event) => {
                                        setSpeed(Number(event.target.value));
                                    }}
                                    aria-label="Replay speed"
                                >
                                    {[1, 2, 5, 10].map((value) => (
                                        <option key={value} value={value}>
                                            {value}×
                                        </option>
                                    ))}
                                </select>

                                <button
                                    type="button"
                                    className="fitrack-replay-camera-btn"
                                    onClick={() => {
                                        setCameraMode((value) =>
                                            value === "follow"
                                                ? "overview"
                                                : "follow"
                                        );
                                    }}
                                >
                                    {cameraMode === "follow"
                                        ? "Overview"
                                        : "Follow"}
                                </button>
                            </div>

                            <button
                                type="button"
                                className="fitrack-replay-back-btn"
                                onClick={onClose}
                            >
                                <FaArrowLeft />
                                <span>Back to Activity</span>
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="fitrack-replay-empty">
                        <p>GPS route is unavailable for this activity.</p>

                        <button
                            type="button"
                            className="fitrack-replay-back-btn"
                            onClick={onClose}
                        >
                            <FaArrowLeft />
                            Back to Activity
                        </button>
                    </div>
                )}
            </div>
        </div>
    );

    return createPortal(modal, document.body);
}
