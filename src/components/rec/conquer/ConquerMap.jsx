import { useEffect, useMemo, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import maplibreWorkerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
import "maplibre-gl/dist/maplibre-gl.css";

maplibregl.setWorkerUrl(maplibreWorkerUrl);
const STYLE_IDS = {
  dark: "dataviz-dark",
  streets: "streets-v2",
  outdoor: "outdoor-v2",
  minimal: "basic-v2",
  monochrome: "toner-v2",
};
const empty = { type: "FeatureCollection", features: [] };
function fit(map, report, selected) {
  const route = report.routes.find((r) => r.id === selected);
  const coords = route
    ? route.points.map((p) => [p.lng, p.lat])
    : report.routes.flatMap((r) => r.points.map((p) => [p.lng, p.lat]));
  if (!coords.length) {
    map.easeTo({ center: report.center, zoom: 11, duration: 400 });
    return;
  }
  const bounds = new maplibregl.LngLatBounds();
  coords.forEach((p) => bounds.extend(p));
  map.resize();
  map.fitBounds(bounds, { padding: 52, maxZoom: 15.5, duration: 500 });
}
function syncLayers(map, report, selected, showRoutes, showCells, newOnly) {
  if (!map.isStyleLoaded()) return;
  const cells = newOnly
    ? {
        ...report.cellsGeoJSON,
        features: report.cellsGeoJSON.features.filter(
          (f) => f.properties.isNew,
        ),
      }
    : report.cellsGeoJSON;
  if (!map.getSource("conquer-cells"))
    map.addSource("conquer-cells", { type: "geojson", data: cells });
  else map.getSource("conquer-cells").setData(cells);
  if (!map.getLayer("conquer-cell-fill"))
    map.addLayer({
      id: "conquer-cell-fill",
      type: "fill",
      source: "conquer-cells",
      paint: {
        "fill-color": ["case", ["get", "isNew"], "#ffb36e", "#f36b3d"],
        "fill-opacity": 0.32,
      },
    });
  if (!map.getLayer("conquer-cell-border"))
    map.addLayer({
      id: "conquer-cell-border",
      type: "line",
      source: "conquer-cells",
      paint: {
        "line-color": "#ff885b",
        "line-width": 0.75,
        "line-opacity": 0.65,
      },
    });
  map.setLayoutProperty(
    "conquer-cell-fill",
    "visibility",
    showCells ? "visible" : "none",
  );
  map.setLayoutProperty(
    "conquer-cell-border",
    "visibility",
    showCells ? "visible" : "none",
  );
  const routes = {
    ...report.routesGeoJSON,
    features: report.routesGeoJSON.features.map((f) => ({
      ...f,
      properties: {
        ...f.properties,
        selected: f.properties.routeId === selected,
      },
    })),
  };
  if (!map.getSource("conquer-routes"))
    map.addSource("conquer-routes", { type: "geojson", data: routes });
  else map.getSource("conquer-routes").setData(routes);
  if (!map.getLayer("conquer-route-outline"))
    map.addLayer({
      id: "conquer-route-outline",
      type: "line",
      source: "conquer-routes",
      layout: { "line-cap": "round", "line-join": "round" },
      paint: {
        "line-color": "#10141b",
        "line-width": ["case", ["get", "selected"], 8, 5],
        "line-opacity": 0.8,
      },
    });
  if (!map.getLayer("conquer-route-line"))
    map.addLayer({
      id: "conquer-route-line",
      type: "line",
      source: "conquer-routes",
      layout: { "line-cap": "round", "line-join": "round" },
      paint: {
        "line-color": ["case", ["get", "selected"], "#ffffff", "#ff7145"],
        "line-width": ["case", ["get", "selected"], 5, 2.8],
        "line-opacity": ["case", ["get", "selected"], 1, 0.8],
      },
    });
  map.setLayoutProperty(
    "conquer-route-outline",
    "visibility",
    showRoutes ? "visible" : "none",
  );
  map.setLayoutProperty(
    "conquer-route-line",
    "visibility",
    showRoutes ? "visible" : "none",
  );
}
export default function ConquerMap({
  report,
  selected,
  showRoutes,
  showCells,
  newOnly,
  theme,
  onSelectRoute,
}) {
  const key = import.meta.env.VITE_MAPTILER_KEY;
  const containerRef = useRef(null),
    mapRef = useRef(null),
    dataRef = useRef(null),
    styleRef = useRef(null),
    clickRef = useRef(null);
  const [error, setError] = useState("");
  const styleUrl = useMemo(
    () =>
      key
        ? `https://api.maptiler.com/maps/${STYLE_IDS[theme] || STYLE_IDS.streets}/style.json?key=${key}`
        : null,
    [key, theme],
  );
  dataRef.current = { report, selected, showRoutes, showCells, newOnly };
  clickRef.current = onSelectRoute;
  useEffect(() => {
    if (!containerRef.current || !styleUrl) return undefined;
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: styleUrl,
      center: report.center,
      zoom: 11,
      attributionControl: false,
    });
    mapRef.current = map;
    styleRef.current = styleUrl;
    map.addControl(
      new maplibregl.NavigationControl({ showCompass: false }),
      "bottom-right",
    );
    const update = () => {
      const d = dataRef.current;
      syncLayers(
        map,
        d.report,
        d.selected,
        d.showRoutes,
        d.showCells,
        d.newOnly,
      );
    };
const onLoad = () => {
    const applyData = () => {
        if (!map.isStyleLoaded()) return;

        update();

        fit(
            map,
            dataRef.current.report,
            dataRef.current.selected
        );

        setError("");
    };

    if (map.isStyleLoaded()) {
        applyData();
    } else {
        map.once("idle", applyData);
    }
};
    const onError = (e) => {
      console.error("Conquer map:", e.error);
      setError(e.error?.message || "Map style failed to load");
    };
    const onRouteClick = (e) => {
      const id = e.features?.[0]?.properties?.routeId;
      if (id) clickRef.current?.(id);
    };
    const onCellClick = (e) => {
      if (!dataRef.current.showCells) return;
      const p = e.features?.[0]?.properties;
      if (!p) return;
      const content = document.createElement("div");
      content.className = "fi-conquer-popup";
      const title = document.createElement("strong");
      title.textContent = p.isNew ? "New territory" : "Explored territory";
      const date = document.createElement("span");
      date.textContent = p.firstDate
        ? `First discovered: ${new Date(p.firstDate).toLocaleDateString("en-GB")}`
        : "Date unavailable";
      content.append(title, date);
      new maplibregl.Popup({ closeButton: true, maxWidth: "240px" })
        .setLngLat(e.lngLat)
        .setDOMContent(content)
        .addTo(map);
    };
    const enter = () => {
      map.getCanvas().style.cursor = "pointer";
    };
    const leave = () => {
      map.getCanvas().style.cursor = "";
    };
    map.on("style.load", onLoad);
    map.on("error", onError);
    map.on("click", "conquer-route-line", onRouteClick);
    map.on("click", "conquer-cell-fill", onCellClick);
    map.on("mouseenter", "conquer-route-line", enter);
    map.on("mouseleave", "conquer-route-line", leave);
    map.on("mouseenter", "conquer-cell-fill", enter);
    map.on("mouseleave", "conquer-cell-fill", leave);
    const observer =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => map.resize())
        : null;
    observer?.observe(containerRef.current);
    return () => {
      observer?.disconnect();
      map.remove();
      mapRef.current = null;
    };
    // Create map once. Changing style uses setStyle below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  useEffect(() => {
    const map = mapRef.current;
    if (map && styleUrl && styleRef.current !== styleUrl) {
      styleRef.current = styleUrl;
      map.setStyle(styleUrl);
    }
  }, [styleUrl]);
useEffect(() => {
    const map = mapRef.current;

    if (!map) return;

    const updateLayers = () => {
        if (!map.isStyleLoaded()) return;

        syncLayers(
            map,
            report,
            selected,
            showRoutes,
            showCells,
            newOnly
        );
    };

    updateLayers();

    map.on("style.load", updateLayers);

    return () => {
        map.off("style.load", updateLayers);
    };
}, [
    report,
    selected,
    showRoutes,
    showCells,
    newOnly
]);
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    fit(map, report, selected);
  }, [report, selected]);
  if (!key)
    return (
      <div className="fi-conquer-map-message">
        Add <code>VITE_MAPTILER_KEY</code> to your existing Vite .env file.
      </div>
    );
  return (
    <div className="fi-conquer-map-root">
      <div ref={containerRef} className="fi-conquer-map-canvas" />
      {error && (
        <div className="fi-conquer-map-error" role="alert">
          {error}
        </div>
      )}
    </div>
  );
}
