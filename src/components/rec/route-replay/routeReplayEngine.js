
const EARTH_RADIUS = 6371000;

export function normalizeReplayRoute(route = []) {
    if (!Array.isArray(route)) return [];

    return route.map((point) => {
        const lat = Number(Array.isArray(point) ? point[0] : point?.lat);
        const lng = Number(Array.isArray(point) ? point[1] : point?.lng);

        if (
            !Number.isFinite(lat) ||
            !Number.isFinite(lng) ||
            Math.abs(lat) > 90 ||
            Math.abs(lng) > 180
        ) {
            return null;
        }

        return [lng, lat];
    }).filter(Boolean);
}

export function segmentDistance(a, b) {
    const toRad = (degrees) => degrees * Math.PI / 180;

    const lat1 = toRad(a[1]);
    const lat2 = toRad(b[1]);
    const dLat = lat2 - lat1;
    const dLng = toRad(b[0] - a[0]);

    const h =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1) * Math.cos(lat2) *
        Math.sin(dLng / 2) ** 2;

    return 2 * EARTH_RADIUS *
        Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

export function createReplayTrack(route) {
    const coordinates = normalizeReplayRoute(route);
    const distances = [0];

    for (let i = 1; i < coordinates.length; i++) {
        distances.push(
            distances[i - 1] +
            segmentDistance(coordinates[i - 1], coordinates[i])
        );
    }

    return {
        coordinates,
        distances,
        totalMeters: distances[distances.length - 1] || 0,
    };
}

export function getReplayFrame(track, progress) {
    const { coordinates, distances, totalMeters } = track;

    if (!coordinates.length) return null;

    const safeProgress = Math.max(0, Math.min(1, progress));
    const target = totalMeters * safeProgress;

    if (coordinates.length === 1 || totalMeters === 0) {
        return {
            position: coordinates[0],
            traveled: [coordinates[0]],
            distanceKm: 0,
        };
    }

    let index = 1;

    while (
        index < distances.length - 1 &&
        distances[index] < target
    ) {
        index++;
    }

    const startDistance = distances[index - 1];
    const endDistance = distances[index];
    const fraction = endDistance > startDistance
        ? (target - startDistance) / (endDistance - startDistance)
        : 0;

    const a = coordinates[index - 1];
    const b = coordinates[index];

    const position = [
        a[0] + (b[0] - a[0]) * fraction,
        a[1] + (b[1] - a[1]) * fraction,
    ];

    return {
        position,
        traveled: [...coordinates.slice(0, index), position],
        distanceKm: target / 1000,
    };
}
