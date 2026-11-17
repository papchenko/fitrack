
import * as maplibregl from "maplibre-gl";

export async function fitRouteForCapture(
    map,
    route,
    waitForMapRender
) {
    if (!map || !Array.isArray(route) || route.length < 2) {
        return false;
    }

    const coordinates = route
        .map((point) => {
            if (Array.isArray(point)) {
                const [lat, lng] = point;

                return Number.isFinite(lat) && Number.isFinite(lng)
                    ? [lng, lat]
                    : null;
            }

            return Number.isFinite(point?.lat) &&
                Number.isFinite(point?.lng)
                ? [point.lng, point.lat]
                : null;
        })
        .filter(Boolean);

    if (coordinates.length < 2) return false;

    map.resize();

    const container = map.getContainer();
    const width = container.clientWidth;
    const height = container.clientHeight;

    if (!width || !height) {
        throw new Error("Map container has no dimensions.");
    }

    const bounds = new maplibregl.LngLatBounds();

    coordinates.forEach((coordinate) => {
        bounds.extend(coordinate);
    });

    const sourceAspect = width / height;

    // Supported Lens slider aspect-ratio range.
    const minSliderAspect = 0.9;
    const maxSliderAspect = 1.9;

    // Calculate the central area that remains visible
    // when object-fit: cover crops the screenshot.
    const visibleWidthFraction = Math.min(
        1,
        minSliderAspect / sourceAspect
    );

    const visibleHeightFraction = Math.min(
        1,
        sourceAspect / maxSliderAspect
    );

    const margin = 24;

    const horizontalPadding =
        (width * (1 - visibleWidthFraction)) / 2 + margin;

    const verticalPadding =
        (height * (1 - visibleHeightFraction)) / 2 + margin;

    const padding = {
        top: verticalPadding,
        bottom: verticalPadding,
        left: horizontalPadding,
        right: horizontalPadding,
    };

    map.fitBounds(bounds, {
        padding,
        maxZoom: 16,
        bearing: 0,
        pitch: 0,
        duration: 0,
    });

    await waitForMapRender(map);

    return true;
}
