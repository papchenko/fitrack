export const CELL_METERS = 250;
const R = 6371000;
const MAX_POINTS = 30000;
const MAX_GAP_METERS = 500;
const LEVELS = [10, 25, 50, 100, 250, 500, 1000, 2500];
const RAD = Math.PI / 180;

export function parseDate(value) {
    if (!value) return null;
    const d = typeof value.toDate === 'function' ? value.toDate() : typeof value.seconds === 'number' ? new Date(value.seconds * 1000) : new Date(value);
    return d instanceof Date && Number.isFinite(d.getTime()) ? d : null;
}
function pointOf(p) {
    if (Array.isArray(p)) {
        const lat = Number(p[0]), lng = Number(p[1]);
        return Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 85 && Math.abs(lng) <= 180 ? { lat, lng } : null;
    }
    if (!p || typeof p !== 'object') return null;
    const a = p.lat ?? p.latitude, b = p.lng ?? p.lon ?? p.longitude;
    if (a == null || b == null) return null;
    const lat = Number(a), lng = Number(b);
    return Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 85 && Math.abs(lng) <= 180 ? { lat, lng } : null;
}
function distance(a, b) {
    const lat1 = a.lat * RAD, lat2 = b.lat * RAD;
    const dLat = lat2 - lat1, dLng = (b.lng - a.lng) * RAD;
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}
function project(p) {
    const lat = Math.max(-85, Math.min(85, p.lat)) * RAD;
    return { x: R * p.lng * RAD, y: R * Math.log(Math.tan(Math.PI / 4 + lat / 2)) };
}
function unproject(x, y) {
    return [x / R / RAD, (2 * Math.atan(Math.exp(y / R)) - Math.PI / 2) / RAD]; // GeoJSON [lng,lat]
}
function cellAt(p) {
    const { x, y } = project(p);
    const col = Math.floor(x / CELL_METERS), row = Math.floor(y / CELL_METERS);
    return { id: `${row}:${col}`, row, col };
}
function geometry(c) {
    const x = c.col * CELL_METERS, y = c.row * CELL_METERS;
    const corners = [unproject(x, y), unproject(x + CELL_METERS, y), unproject(x + CELL_METERS, y + CELL_METERS), unproject(x, y + CELL_METERS)];
    return { type: 'Polygon', coordinates: [[...corners, corners[0]]] };
}
function physicalArea(c) {
    const lat = unproject(c.col * CELL_METERS, (c.row + 0.5) * CELL_METERS)[1];
    return (CELL_METERS / 1000) ** 2 * Math.cos(lat * RAD) ** 2;
}
export function normalizeRoute(doc) {
    const raw = Array.isArray(doc.route) ? doc.route : Array.isArray(doc.coordinates) ? doc.coordinates : Array.isArray(doc.path) ? doc.path : [];
    const aliases = { run: 'running', bike: 'cycling', cycle: 'cycling', biking: 'cycling', winter: 'winter_sports' };
    const type = String(doc.activityType || 'running').toLowerCase();
    return { id: String(doc.id || ''), type: aliases[type] || type, date: parseDate(doc.timestamp) || parseDate(doc.createdAt), title: String(doc.title || 'Untitled activity'), points: raw.slice(0, MAX_POINTS).map(pointOf).filter(Boolean), distance: Number(doc.distance) || 0 };
}
export function calculateConquest(documents = [], { activityType = 'all', period = 'all', now = new Date() } = {}) {
    const cutoff = period === 'all' ? null : new Date(now.getTime() - Number(period) * 86400000);
    const routes = documents.map(normalizeRoute).filter(r => r.points.length >= 2 && (activityType === 'all' || r.type === activityType) && (!cutoff || (r.date && r.date >= cutoff)) && (!r.date || r.date <= now));
    const sorted = [...routes].sort((a, b) => (a.date?.getTime() || 0) - (b.date?.getTime() || 0) || a.id.localeCompare(b.id));
    const visited = new Map(), byRoute = [], timeline = [];
    for (const route of sorted) {
        const routeCells = new Map();
        let prev = null;
        for (const p of route.points) {
            if (prev) {
                const meters = distance(prev, p);
                if (meters <= MAX_GAP_METERS) {
                    const steps = Math.max(1, Math.ceil(meters / 40));
                    for (let i = 1; i < steps; i++) {
                        const t = i / steps;
                        const cell = cellAt({ lat: prev.lat + (p.lat - prev.lat) * t, lng: prev.lng + (p.lng - prev.lng) * t });
                        routeCells.set(cell.id, cell);
                    }
                }
            }
            const cell = cellAt(p);
            routeCells.set(cell.id, cell);
            prev = p;
        }
        let fresh = 0;
        for (const cell of routeCells.values()) {
            if (!visited.has(cell.id)) { visited.set(cell.id, { ...cell, firstDate: route.date, routeId: route.id }); fresh++; }
        }
        byRoute.push({ ...route, cells: routeCells.size, newCells: fresh });
        timeline.push({ date: route.date, routeId: route.id, added: fresh, total: visited.size });
    }
    const nowMonth = now.getFullYear() * 12 + now.getMonth();
    const thisMonth = timeline.filter(x => x.date && x.date.getFullYear() * 12 + x.date.getMonth() === nowMonth).reduce((s, x) => s + x.added, 0);
    const latest = [...byRoute].reverse().slice(0, 12);
    const last = latest[0]?.points.at(-1);
    const total = visited.size;
    const levels = LEVELS.map(target => ({ target, unlocked: total >= target }));
    const nextLevel = levels.find(l => !l.unlocked)?.target || null;
    const monthly = Array.from({ length: 6 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
        const count = timeline.filter(x => x.date && x.date.getFullYear() === d.getFullYear() && x.date.getMonth() === d.getMonth()).reduce((s, x) => s + x.added, 0);
        return { key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleDateString('en-GB', { month: 'short' }), count };
    });
    const cellValues = [...visited.values()];
    const areaKm2 = cellValues.reduce((s, c) => s + physicalArea(c), 0);
    const features = cellValues.slice(0, 8000).map(c => ({ type: 'Feature', id: c.id, properties: { id: c.id, firstDate: c.firstDate?.toISOString() || '', routeId: c.routeId, isNew: Boolean(c.firstDate && c.firstDate.getFullYear() * 12 + c.firstDate.getMonth() === nowMonth) }, geometry: geometry(c) }));
    const routeFeatures = byRoute.flatMap(r => {
        const segments = []; let current = [];
        for (const p of r.points) {
            if (current.length && distance({ lng: current.at(-1)[0], lat: current.at(-1)[1] }, p) > MAX_GAP_METERS) {
                if (current.length >= 2) segments.push(current);
                current = [];
            }
            current.push([p.lng, p.lat]);
        }
        if (current.length >= 2) segments.push(current);
        return segments.map((coordinates, index) => ({ type: 'Feature', properties: { routeId: r.id, title: r.title, selected: false }, geometry: { type: 'LineString', coordinates }, id: `${r.id}-${index}` }));
    });
    return { total, areaKm2, thisMonth, routes: byRoute, latest, timeline, monthly, levels, nextLevel, center: last ? [last.lng, last.lat] : [30.5234, 50.4501], cellsGeoJSON: { type: 'FeatureCollection', features }, routesGeoJSON: { type: 'FeatureCollection', features: routeFeatures }, renderedCellLimitReached: total > 8000, mostNew: [...byRoute].sort((a, b) => b.newCells - a.newCells)[0] || null };
}
