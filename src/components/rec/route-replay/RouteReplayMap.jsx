
import { useEffect, useRef } from "react";
import * as maplibregl from "maplibre-gl";
import maplibreWorkerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";

import "maplibre-gl/dist/maplibre-gl.css";

maplibregl.setWorkerUrl(maplibreWorkerUrl);

const lineData = (coordinates) => ({
    type: "Feature",
    properties: {},
    geometry: {
        type: "LineString",
        coordinates,
    },
});

export default function RouteReplayMap({
    track,
    frame,
    cameraMode = "follow",
}) {
    const containerRef = useRef(null);
    const mapRef = useRef(null);
    const markerRef = useRef(null);
    const cameraModeRef = useRef(cameraMode);

    useEffect(() => {
        cameraModeRef.current = cameraMode;
    }, [cameraMode]);

    useEffect(() => {
        if (!containerRef.current || track.coordinates.length < 2) return;

        const key = import.meta.env.VITE_MAPTILER_KEY;

        if (!key) return;

        const map = new maplibregl.Map({
            container: containerRef.current,
            style: `https://api.maptiler.com/maps/outdoor-v2/style.json?key=${key}`,
            center: track.coordinates[0],
            zoom: 15,
            pitch: 60,
            bearing: 0,
            attributionControl: false,
        });

        mapRef.current = map;

        const markerElement = document.createElement("div");
        markerElement.className = "fitrack-replay-marker";

        const marker = new maplibregl.Marker({
            element: markerElement,
        })
            .setLngLat(track.coordinates[0])
            .addTo(map);

        markerRef.current = marker;

        map.on("load", () => {
            map.addSource("replay-route", {
                type: "geojson",
                data: lineData(track.coordinates),
            });

            map.addSource("replay-progress", {
                type: "geojson",
                data: lineData([
                    track.coordinates[0],
                    track.coordinates[0],
                ]),
            });

            map.addLayer({
                id: "replay-route-line",
                type: "line",
                source: "replay-route",
                paint: {
                    "line-color": "#ffffff",
                    "line-opacity": 0.35,
                    "line-width": 5,
                },
            });

            map.addLayer({
                id: "replay-progress-line",
                type: "line",
                source: "replay-progress",
                paint: {
                    "line-color": "#ff531c",
                    "line-width": 7,
                },
            });

            const bounds = new maplibregl.LngLatBounds();

            track.coordinates.forEach((point) => {
                bounds.extend(point);
            });

            map.fitBounds(bounds, {
                padding: 65,
                pitch: 55,
                maxZoom: 16,
                duration: 0,
            });
        });

        return () => {
            marker.remove();
            map.remove();
            mapRef.current = null;
            markerRef.current = null;
        };
    }, [track]);

    useEffect(() => {
        const map = mapRef.current;

        if (!map || !frame) return;

        markerRef.current?.setLngLat(frame.position);

        const update = () => {
            const source = map.getSource("replay-progress");

            source?.setData(lineData(frame.traveled));
        };

        if (map.isStyleLoaded()) {
            update();
        } else {
            map.once("load", update);
        }

        if (cameraModeRef.current === "follow") {
            map.jumpTo({
                center: frame.position,
                zoom: Math.max(map.getZoom(), 15),
                pitch: 60,
            });
        }
    }, [frame]);

    return (
        <div
            ref={containerRef}
            className="fitrack-replay-map"
        />
    );
}
