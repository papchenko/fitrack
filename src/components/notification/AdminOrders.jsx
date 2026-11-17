import { useEffect, useMemo, useState } from "react";
import {
    collectionGroup,
    doc,
    onSnapshot,
    query,
    runTransaction,
    serverTimestamp,
    Timestamp,
} from "firebase/firestore";
import { toast } from "react-toastify";
import { db } from "../../firebase";
import "./admin-orders.scss";

const PLANS = new Set(["premium-basic", "premium-advanced", "premium-pro"]);
const DATE_OPTIONS = { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" };
const dateLabel = (value) => {
    if (!value) return "—";
    const date = typeof value?.toDate === "function" ? value.toDate() : new Date(value);
    return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString("uk-UA", DATE_OPTIONS);
};
const isPremiumOrder = (order) => (order.items || []).some((item) => item.type === "premium" || PLANS.has(item.id));

export default function AdminOrders({ adminUid, mode = "orders" }) {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all");
    const [busyId, setBusyId] = useState(null);
    const [expandedId, setExpandedId] = useState(null);

    useEffect(() => {
        if (!adminUid) return;
        setLoading(true);
        const unsubscribe = onSnapshot(
            query(collectionGroup(db, "orders")),
            (snapshot) => {
                const result = snapshot.docs
                    .filter((snap) => snap.ref.parent.id === "orders" && snap.ref.parent.parent?.parent?.id === "users") // users/{uid}/orders only
                    .map((snap) => ({
                        id: snap.id,
                        uid: snap.ref.parent.parent.id,
                        path: snap.ref.path,
                        ...snap.data(),
                    }))
                    .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
                setOrders(result);
                setError("");
                setLoading(false);
            },
            (err) => {
                console.error("Admin orders:", err);
                setError(`Cannot load orders: ${err.code || err.message}. Check Firestore collection-group read rules.`);
                setLoading(false);
            }
        );
        return unsubscribe;
    }, [adminUid]);

    const visible = useMemo(() => orders.filter((order) => {
        const premium = isPremiumOrder(order);
        if (mode === "premium" && !premium) return false;
        if (filter === "premium" && !premium) return false;
        if (filter === "shop" && premium) return false;
        if (filter === "pending" && order.status === "completed") return false;
        const person = order.formData || {};
        const text = [order.orderNumber, order.uid, order.id, person.firstName, person.lastName, person.email, person.phone, ...(order.items || []).map((item) => item.title)].join(" ").toLowerCase();
        return text.includes(search.trim().toLowerCase());
    }), [orders, search, filter, mode]);

    const activatePremium = async (order) => {
        const premiumItem = (order.items || []).find((item) => item.type === "premium" || PLANS.has(item.id));
        if (!premiumItem || !PLANS.has(premiumItem.id)) return toast.error("Unknown Premium plan.");
        if (!window.confirm(`Payment verified? Activate ${premiumItem.title} for ${order.formData?.email || order.uid} for 30 days?`)) return;
        setBusyId(order.path);
        try {
            const orderRef = doc(db, "users", order.uid, "orders", order.id);
            const userRef = doc(db, "users", order.uid);
            await runTransaction(db, async (tx) => {
                const [orderSnap, userSnap] = await Promise.all([tx.get(orderRef), tx.get(userRef)]);
                if (!orderSnap.exists() || !userSnap.exists()) throw new Error("Order or user not found.");
                const currentOrder = orderSnap.data();
                if (currentOrder.premiumActivatedAt) throw new Error("Premium already activated for this order.");
                const currentItem = (currentOrder.items || []).find((item) => item.type === "premium" || PLANS.has(item.id));
                if (!currentItem || !PLANS.has(currentItem.id)) throw new Error("Invalid Premium plan.");
                const now = Timestamp.now();
                const existingExpiry = userSnap.data().premiumPackage?.expiresAt;
                const existingDate = existingExpiry?.toDate?.() || (existingExpiry ? new Date(existingExpiry) : null);
                const baseMs = existingDate && !Number.isNaN(existingDate.getTime()) ? Math.max(now.toMillis(), existingDate.getTime()) : now.toMillis();
                const expiry = Timestamp.fromMillis(baseMs + 30 * 24 * 60 * 60 * 1000);
                tx.update(userRef, {
                    premiumPackage: {
                        title: currentItem.title,
                        price: currentItem.price,
                        startedAt: now.toDate().toISOString(),
                        expiresAt: expiry.toDate().toISOString(),
                        active: true,
                        features: currentItem.features || [],
                    },
                    premiumUpdatedAt: serverTimestamp(),
                });
                tx.update(orderRef, {
                    status: "completed",
                    premiumActivatedAt: serverTimestamp(),
                    premiumActivatedBy: adminUid,
                });
            });
            toast.success("Premium activated for 30 days.");
        } catch (err) {
            console.error(err);
            toast.error(err.message || "Activation failed.");
        } finally {
            setBusyId(null);
        }
    };

    const markProcessed = async (order) => {
        if (!window.confirm(`Mark order ${order.orderNumber || order.id} as processed?`)) return;
        setBusyId(order.path);
        try {
            const orderRef = doc(db, "users", order.uid, "orders", order.id);
            await runTransaction(db, async (tx) => {
                const snap = await tx.get(orderRef);
                if (!snap.exists()) throw new Error("Order not found.");
                if (snap.data().status === "completed") return;
                tx.update(orderRef, { status: "completed", processedAt: serverTimestamp(), processedBy: adminUid });
            });
            toast.success("Order marked as processed.");
        } catch (err) {
            console.error(err);
            toast.error("Could not update order.");
        } finally {
            setBusyId(null);
        }
    };

    return (
        <section className="ft-orders-admin">
            <header className="ft-orders-admin__header">
                <div>
                    <span className="ft-orders-admin__eyebrow">FITRACK COMMERCE</span>
                    <h2>{mode === "premium" ? "Premium management" : "Customer orders"}</h2>
                    <p>{mode === "premium" ? "Review Premium purchases and activate subscriptions after payment verification." : "Review merchandise purchases, customer details and fulfillment status."}</p>
                </div>
                <strong className="ft-orders-admin__count">{visible.length} orders</strong>
            </header>
            <div className="ft-orders-admin__tools">
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search order, customer, email..." aria-label="Search orders" />
                <select value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filter orders">
                    <option value="all">All orders</option>
                    <option value="pending">Not completed</option>
                    {mode !== "premium" && <option value="shop">Shop only</option>}
                    {mode !== "premium" && <option value="premium">Premium only</option>}
                </select>
            </div>
            {loading && <p className="ft-orders-admin__empty">Loading orders...</p>}
            {error && <p className="ft-orders-admin__error">{error}</p>}
            {!loading && !error && visible.length === 0 && <p className="ft-orders-admin__empty">No orders found.</p>}
            <div className="ft-orders-admin__list">
                {visible.map((order) => {
                    const premium = isPremiumOrder(order);
                    const activated = Boolean(order.premiumActivatedAt);
                    const completed = order.status === "completed";
                    const expanded = expandedId === order.path;
                    const name = [order.formData?.firstName, order.formData?.lastName].filter(Boolean).join(" ") || "Customer";
                    return (
                        <article className="ft-orders-admin__card" key={order.path}>
                            <button type="button" className="ft-orders-admin__summary" onClick={() => setExpandedId(expanded ? null : order.path)} aria-expanded={expanded}>
                                <div><strong>{order.orderNumber || order.id}</strong><span>{name} · {dateLabel(order.createdAt)}</span></div>
                                <div className="ft-orders-admin__summary-right"><b>{order.total ?? "—"} ₴</b><span className={`ft-orders-admin__status ${completed ? "is-completed" : ""}`}>{premium ? (activated ? "Premium active" : "Premium pending") : (completed ? "Processed" : "New order")}</span><span>{expanded ? "−" : "+"}</span></div>
                            </button>
                            {expanded && (
                                <div className="ft-orders-admin__details">
                                    <div className="ft-orders-admin__meta">
                                        <p><b>User ID:</b> {order.uid}</p>
                                        <p><b>Email:</b> {order.formData?.email || "—"}</p>
                                        <p><b>Phone:</b> {order.formData?.phone || "—"}</p>
                                        <p><b>Delivery:</b> {[order.formData?.city, order.formData?.post, order.formData?.department].filter(Boolean).join(", ") || "Not required"}</p>
                                    </div>
                                    <h3>Ordered items</h3>
                                    <div className="ft-orders-admin__items">{(order.items || []).map((item, index) => <div key={`${item.id}-${index}`}><span>{item.title || item.id} {item.size ? `· ${item.size}` : ""} · ×{item.quantity || 1}</span><strong>{item.price ?? "—"} ₴</strong></div>)}</div>
                                    <div className="ft-orders-admin__actions">
                                        {premium && !activated && <button type="button" disabled={busyId === order.path} onClick={() => activatePremium(order)}>{busyId === order.path ? "Processing..." : "Verify payment & activate Premium"}</button>}
                                        {!premium && !completed && <button type="button" disabled={busyId === order.path} onClick={() => markProcessed(order)}>{busyId === order.path ? "Processing..." : "Mark as processed"}</button>}
                                        {premium && activated && <span className="ft-orders-admin__done">Activated: {dateLabel(order.premiumActivatedAt)}</span>}
                                    </div>
                                </div>
                            )}
                        </article>
                    );
                })}
            </div>
        </section>
    );
}
