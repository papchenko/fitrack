import { useEffect, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import maplibreWorkerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";

import "maplibre-gl/dist/maplibre-gl.css";
import "./recrunMap.scss";

maplibregl.setWorkerUrl(maplibreWorkerUrl);


const STYLES = {
    light: "streets-v2",
    dark: "dataviz-dark",
    outdoor: "outdoor-v2",
    // satellite: "satellite",
    minimal: "basic-v2",
    monochrome: "toner-v2",
};

const validPoint = (point) => {
  if (Array.isArray(point)) {
    const [lat, lng] = point;

    return Number.isFinite(lat) && Number.isFinite(lng)
      ? [lng, lat]
      : null;
  }

  if (
    point &&
    Number.isFinite(point.lat) &&
    Number.isFinite(point.lng)
  ) {
    return [point.lng, point.lat];
  }

  return null;
};

const makeRouteData = (route = []) => ({
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {},
      geometry: {
        type: "LineString",
        coordinates: route.map(validPoint).filter(Boolean),
      },
    },
  ],
});

const addRouteLayers = (map, route) => {
  if (!map.getSource("recrun-route")) {
    map.addSource("recrun-route", {
      type: "geojson",
      data: makeRouteData(route),
    });
  }

  if (!map.getLayer("recrun-route-outline")) {
    map.addLayer({
      id: "recrun-route-outline",
      type: "line",
      source: "recrun-route",
      layout: {
        "line-cap": "round",
        "line-join": "round",
      },
      paint: {
        "line-color": "#ffffff",
        "line-width": 8,
        "line-opacity": 0.9,
      },
    });
  }

  if (!map.getLayer("recrun-route-line")) {
    map.addLayer({
      id: "recrun-route-line",
      type: "line",
      source: "recrun-route",
      layout: {
        "line-cap": "round",
        "line-join": "round",
      },
      paint: {
        "line-color": "#db3206",
        "line-width": 5,
      },
    });
  }
};


const makeEndpointData = (route = []) => {
    const coordinates = route
        .map(validPoint)
        .filter(Boolean);

    if (coordinates.length < 2) {
        return {
            type: "FeatureCollection",
            features: [],
        };
    }

    return {
        type: "FeatureCollection",
        features: [
            {
                type: "Feature",
                properties: {
                    endpoint: "start",
                },
                geometry: {
                    type: "Point",
                    coordinates: coordinates[0],
                },
            },
            {
                type: "Feature",
                properties: {
                    endpoint: "finish",
                },
                geometry: {
                    type: "Point",
                    coordinates: coordinates[coordinates.length - 1],
                },
            },
        ],
    };
};

const addEndpointLayers = (map, route) => {
    if (!map.getSource("recrun-endpoints")) {
        map.addSource("recrun-endpoints", {
            type: "geojson",
            data: makeEndpointData(route),
        });
    }

    // START: white circle with orange border.
    if (!map.getLayer("recrun-start")) {
        map.addLayer({
            id: "recrun-start",
            type: "circle",
            source: "recrun-endpoints",
            filter: [
                "==",
                ["get", "endpoint"],
                "start",
            ],
            paint: {
                "circle-radius": 5,
                "circle-color": "#ffffff",
                "circle-stroke-color": "#db3206",
                "circle-stroke-width": 2,
            },
        });
    }

    // FINISH: orange circle with white border.
    if (!map.getLayer("recrun-finish")) {
        map.addLayer({
            id: "recrun-finish",
            type: "circle",
            source: "recrun-endpoints",
            filter: [
                "==",
                ["get", "endpoint"],
                "finish",
            ],
            paint: {
                "circle-radius": 5,
                "circle-color": "#db3206",
                "circle-stroke-color": "#ffffff",
                "circle-stroke-width": 2,
            },
        });
    }
};


export const waitForMapRender = (map, timeout = 5000) => {
  return new Promise((resolve, reject) => {
    if (!map) {
      reject(new Error("Map is not available."));
      return;
    }

    let finished = false;

    const cleanup = () => {
      map.off("idle", handleIdle);
      clearTimeout(timer);
    };

    const finish = (error = null) => {
      if (finished) return;
      finished = true;
      cleanup();

      if (error) {
        reject(error);
      } else {
        resolve();
      }
    };

    const handleIdle = () => {
      finish();
    };

    const timer = setTimeout(() => {
      finish(new Error("Map rendering timed out."));
    }, timeout);

    map.once("idle", handleIdle);
    map.triggerRepaint();
  });
};


export default function RecrunMap({
  route = [],
  position = null,
  theme = "light",
  tracking = false,
  resetRotation = 0,
  follow = true,
  zoom = 16,
  onMapReady,
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  const routeRef = useRef(route);
  const onMapReadyRef = useRef(onMapReady);
  const lastStyleRef = useRef(null);

  const [error, setError] = useState("");

  const apiKey = import.meta.env.VITE_MAPTILER_KEY;

  const styleId = STYLES[theme] || STYLES.light;

  const styleUrl = apiKey
    ? `https://api.maptiler.com/maps/${styleId}/style.json?key=${apiKey}`
    : null;

  const currentPosition =
    validPoint(route[route.length - 1]) ||
    validPoint(position);

    const hasInitialPosition = Boolean(currentPosition);

  // Keep current values available to map event handlers.
  useEffect(() => {
    routeRef.current = route;
  }, [route]);

  useEffect(() => {
    onMapReadyRef.current = onMapReady;
  }, [onMapReady]);

  // Initialize map once.
  useEffect(() => {
    if (
    !containerRef.current ||
    !styleUrl ||
    !hasInitialPosition
) {
    return;
}

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: styleUrl,
      center: currentPosition,
      zoom,
      bearing: 0,
      pitch: 0,
      attributionControl: false,
      preserveDrawingBuffer: true,
    });

    mapRef.current = map;
    map.addControl(
  new maplibregl.AttributionControl({
    compact: true,
  }),
  "bottom-right"
);
    lastStyleRef.current = styleUrl;

    map.addControl(
      new maplibregl.NavigationControl({
        showCompass: false,
        showZoom: true,
      }),
      "bottom-left"
    );


const handleStyleLoad = () => {
    addRouteLayers(map, routeRef.current);
    addEndpointLayers(map, routeRef.current);

    const routeSource = map.getSource("recrun-route");

    if (routeSource) {
        routeSource.setData(
            makeRouteData(routeRef.current)
        );
    }

    const endpointSource = map.getSource("recrun-endpoints");

    if (endpointSource) {
        endpointSource.setData(
            makeEndpointData(routeRef.current)
        );
    }
};


    const handleLoad = () => {
      setError("");
      onMapReadyRef.current?.(map);
    };

    const handleError = (event) => {
      const message =
        event.error?.message || "Unable to load map.";

      console.error("Recrun Maps:", event.error);
      setError(message);
    };

    map.on("style.load", handleStyleLoad);
    map.on("load", handleLoad);
    map.on("error", handleError);

    return () => {
      markerRef.current?.remove();
      markerRef.current = null;

      map.off("style.load", handleStyleLoad);
      map.off("load", handleLoad);
      map.off("error", handleError);

      map.remove();
      mapRef.current = null;
      lastStyleRef.current = null;
    };

    // Initialize only when API key changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey, hasInitialPosition]);

  // Switch map styles without recreating the map.
  useEffect(() => {
    const map = mapRef.current;

    if (!map || !styleUrl) return;

    if (lastStyleRef.current === styleUrl) return;

    lastStyleRef.current = styleUrl;
    setError("");

    map.setStyle(styleUrl);
  }, [styleUrl]);

// Update GPS route.

// Update GPS route and endpoint markers.
useEffect(() => {
    routeRef.current = route;

    const map = mapRef.current;
    if (!map) return;

    const updateRoute = () => {
        if (!map.isStyleLoaded()) return;

        if (!map.getSource("recrun-route")) {
            addRouteLayers(map, routeRef.current);
        }

        if (!map.getSource("recrun-endpoints")) {
            addEndpointLayers(map, routeRef.current);
        }

        const routeSource = map.getSource("recrun-route");

        if (routeSource) {
            routeSource.setData(
                makeRouteData(routeRef.current)
            );
        }

        const endpointSource = map.getSource("recrun-endpoints");

        if (endpointSource) {
            endpointSource.setData(
                makeEndpointData(routeRef.current)
            );
        }
    };

    updateRoute();
}, [route]);


  // Automatically fit the completed GPS route into the map.
  useEffect(() => {
    const map = mapRef.current;

    if (!map || tracking || route.length < 2) {
      return;
    }

    const coordinates = route
      .map(validPoint)
      .filter(Boolean);

    if (coordinates.length < 2) return;

    const fitCompletedRoute = () => {
      if (!map.isStyleLoaded()) return;

      const container = map.getContainer();

      if (
        container.clientWidth === 0 ||
        container.clientHeight === 0
      ) {
        return;
      }

      const bounds = new maplibregl.LngLatBounds();

      coordinates.forEach((point) => {
        bounds.extend(point);
      });

      map.resize();

      map.fitBounds(bounds, {
        padding: {
          top: 35,
          bottom: 35,
          left: 35,
          right: 35,
        },
        maxZoom: 16,
        bearing: 0,
        pitch: 0,
        duration: 0,
      });
    };

    fitCompletedRoute();

    // Refit after a map style finishes loading.
    map.on("style.load", fitCompletedRoute);

    return () => {
      map.off("style.load", fitCompletedRoute);
    };
  }, [route, tracking, styleUrl]);


// Current GPS marker before route endpoints are available.
useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const showCurrentMarker =
        Boolean(currentPosition) &&
        route.length < 2;

    if (!showCurrentMarker) {
        markerRef.current?.remove();
        markerRef.current = null;
        return;
    }

    if (!markerRef.current) {
        const element = document.createElement("div");
        element.className = "recrun-map-marker";

        markerRef.current = new maplibregl.Marker({
            element,
            anchor: "center",
        })
            .setLngLat(currentPosition)
            .addTo(map);
    } else {
        markerRef.current.setLngLat(currentPosition);
    }
}, [
    currentPosition?.[0],
    currentPosition?.[1],
    route.length,
]);


  // Follow GPS location when enabled.
  useEffect(() => {
    const map = mapRef.current;

    if (!map || !currentPosition || !follow) return;

    map.easeTo({
      center: currentPosition,
      duration: tracking ? 450 : 650,
    });
  }, [
    currentPosition?.[0],
    currentPosition?.[1],
    follow,
    tracking,
  ]);

  // Reset map rotation.
  useEffect(() => {
    if (!resetRotation) return;

    mapRef.current?.easeTo({
      bearing: 0,
      duration: 450,
    });
  }, [resetRotation]);

  if (!apiKey) {
    return (
      <div className="recrun-map-message">
        Add VITE_MAPTILER_KEY to your .env file.
      </div>
    );
  }

  return (
    <div className="recrun-map-root">
        {!hasInitialPosition && (
            <div className="recrun-map-loading">
                <span className="recrun-map-loading__spinner" />
                <span>Locating your position...</span>
            </div>
        )}
      <div
        ref={containerRef}
        className="recrun-map-canvas"
      />

      {error && (
        <div className="recrun-map-error">
          {error}
        </div>
      )}
    </div>
  );
}
