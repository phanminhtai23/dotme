// Visitor analytics — lưu ở backend hoặc Supabase (nếu đã cấu hình)
import { isAdmin } from "./auth";
import { api } from "./api";

const TRACKABLE_HOSTS = ["kevinphan.me", "www.kevinphan.me"];

function shouldTrackVisit() {
    if (typeof window === "undefined") return false;
    if (window.location.pathname === "/admin") return false;
    if (window.location.pathname !== "/") return false;
    return TRACKABLE_HOSTS.some(
        (host) =>
            window.location.hostname === host ||
            window.location.hostname.endsWith(`.${host}`),
    );
}

function buildDays(history) {
    if (!history.length) return [];

    const counts = new Map();
    let first = null;
    let last = null;

    for (const item of history) {
        const day = new Date(item.createdAt).toISOString().slice(0, 10);
        counts.set(day, (counts.get(day) || 0) + 1);
        if (!first || day < first) first = day;
        if (!last || day > last) last = day;
    }

    const days = [];
    const cursor = new Date(`${first}T00:00:00`);
    const end = new Date(`${last}T00:00:00`);

    while (cursor <= end) {
        const key = cursor.toISOString().slice(0, 10);
        days.push({
            date: key,
            label: cursor.toLocaleDateString("vi-VN", {
                month: "numeric",
                day: "numeric",
            }),
            visits: counts.get(key) || 0,
        });
        cursor.setDate(cursor.getDate() + 1);
    }

    return days;
}

export async function trackVisit() {
    // Đừng đếm lượt truy cập của admin/superadmin
    if (isAdmin()) return;
    if (!shouldTrackVisit()) return;
    try {
        await api.recordVisit({
            page: "/",
            referrer: document.referrer || "",
        });
    } catch {}
}

export async function getAnalytics() {
    let store = {
        visits: {},
        pages: {},
        history: [],
        total: 0,
        lastVisit: null,
    };
    try {
        store = await api.getAnalytics();
    } catch {}

    const allHistory = Array.isArray(store.history) ? [...store.history] : [];
    const history = allHistory
        .filter((item) => (item?.page || "/") === "/")
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    const today = new Date().toISOString().slice(0, 10);
    const days = buildDays(history);
    const historyRows = [...history].reverse();
    const todayCount = history.reduce((sum, item) => {
        const day = new Date(item.createdAt).toISOString().slice(0, 10);
        return sum + (day === today ? 1 : 0);
    }, 0);

    return {
        total: history.length,
        today: todayCount,
        pages: history.length ? { "/": history.length } : {},
        days,
        history: historyRows,
        firstVisit: history[0]?.createdAt || null,
        lastVisit: history.at(-1)?.createdAt || null,
    };
}
