// Central data layer — localStorage only, no backend needed

const ACCOUNTS_KEY = "dotme_accounts_v2";
const LINKS_KEY = "dotme_links_v2";

function genId() {
    const chars = "abcdefghjkmnpqrstuvwxyz23456789";
    let id = "";
    for (let i = 0; i < 9; i++)
        id += chars[Math.floor(Math.random() * chars.length)];
    return id;
}

const DEFAULT_ACCOUNTS = [
    {
        username: "admin",
        password: "Admin",
        role: "superadmin",
        displayName: "Administrator",
        created: "2026-06-07",
        expiresAt: null,
    },
];

export function getAccounts() {
    try {
        const stored = localStorage.getItem(ACCOUNTS_KEY);
        if (!stored) {
            localStorage.setItem(
                ACCOUNTS_KEY,
                JSON.stringify(DEFAULT_ACCOUNTS),
            );
            return DEFAULT_ACCOUNTS;
        }
        return JSON.parse(stored);
    } catch {
        return DEFAULT_ACCOUNTS;
    }
}

export function saveAccounts(list) {
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(list));
}

export function addAccount({
    username,
    password,
    displayName,
    role,
    expiresAt,
}) {
    const accounts = getAccounts();
    if (accounts.find((a) => a.username === username))
        return { error: "Username đã tồn tại" };
    const newAcc = {
        username,
        password,
        displayName: displayName || username,
        role: role || "user",
        created: new Date().toISOString().slice(0, 10),
        expiresAt: expiresAt || null,
    };
    saveAccounts([...accounts, newAcc]);
    return { ok: true, account: newAcc };
}

export function updateAccount(username, updates) {
    const accounts = getAccounts();
    const idx = accounts.findIndex((a) => a.username === username);
    if (idx === -1) return { error: "Không tìm thấy tài khoản" };
    accounts[idx] = { ...accounts[idx], ...updates };
    saveAccounts(accounts);
    return { ok: true };
}

export function deleteAccount(username) {
    if (username === "admin")
        return { error: "Không thể xóa tài khoản admin gốc" };
    saveAccounts(getAccounts().filter((a) => a.username !== username));
    saveLinks(getLinks().filter((l) => l.ownerUsername !== username));
    return { ok: true };
}

export function isAccountExpired(account) {
    if (!account.expiresAt) return false;
    return new Date(account.expiresAt) < new Date();
}

// ── Links / Permissions ──────────────────────────────────────────────────────

export function getLinks() {
    try {
        return JSON.parse(localStorage.getItem(LINKS_KEY) || "[]");
    } catch {
        return [];
    }
}

export function saveLinks(list) {
    localStorage.setItem(LINKS_KEY, JSON.stringify(list));
}

export function addLink({ ownerUsername, type, name, expiresAt, images = [] }) {
    const id = genId();
    const link = {
        id,
        ownerUsername,
        type,
        name,
        path: `/${type}/${id}`,
        created: new Date().toISOString().slice(0, 10),
        expiresAt: expiresAt || null,
        images,
    };
    saveLinks([...getLinks(), link]);
    return link;
}

export function setLinkImages(id, images) {
    const links = getLinks();
    const idx = links.findIndex((l) => l.id === id);
    if (idx === -1) return;
    links[idx].images = images;
    saveLinks(links);
}

export function deleteLink(id) {
    saveLinks(getLinks().filter((l) => l.id !== id));
}

export function getLinkById(id) {
    return getLinks().find((l) => l.id === id) || null;
}

export function getLinksByUser(username) {
    return getLinks().filter((l) => l.ownerUsername === username);
}

export function isLinkExpired(link) {
    if (!link.expiresAt) return false;
    return new Date(link.expiresAt) < new Date();
}

export const PAGE_TYPES = {
    birthday: {
        label: "Chúc mừng sinh nhật",
        emoji: "🎂",
        color: "#ff6b9d",
        path: "birthday",
    },
    motivation: {
        label: "Tạo động lực (hài)",
        emoji: "💪",
        color: "#f59e0b",
        path: "motivation",
    },
    love: {
        label: "Thổ lộ tình cảm",
        emoji: "💌",
        color: "#ec4899",
        path: "love",
    },
};
