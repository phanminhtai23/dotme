const BASE = import.meta.env.VITE_API_BASE_URL || "/api";

async function req(method, path, body) {
    const opts = { method, headers: {} };
    if (body) {
        opts.headers["Content-Type"] = "application/json";
        opts.body = JSON.stringify(body);
    }
    const res = await fetch(BASE + path, opts);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
    return data;
}

export const api = {
    // Auth
    login: (username, password) =>
        req("POST", "/auth/login", { username, password }),

    // Accounts
    getAccounts: () => req("GET", "/accounts"),
    addAccount: (data) => req("POST", "/accounts", data),
    updateAccount: (username, data) =>
        req("PUT", `/accounts/${username}`, data),
    deleteAccount: (username) => req("DELETE", `/accounts/${username}`),

    // Links
    getLinks: () => req("GET", "/links"),
    getLink: (id) => req("GET", `/links/${id}`),
    addLink: (data) => req("POST", "/links", data),
    updateLink: (id, data) => req("PUT", `/links/${id}`, data),
    deleteLink: (id) => req("DELETE", `/links/${id}`),

    // Game plays
    getPlays: (id) => req("GET", `/links/${id}/plays`),
    recordPlay: (id, won) => req("POST", `/links/${id}/play`, { won }),

    // Analytics
    recordVisit: (payload) => req("POST", "/visit", payload),
    getAnalytics: () => req("GET", "/analytics"),

    // Messages
    getMessages: () => req("GET", "/messages"),
    deleteMessage: (idx) => req("DELETE", `/messages/${idx}`),
    deleteAllMessages: () => req("DELETE", "/messages"),
    sendMessage: (name, message) => req("POST", "/messages", { name, message }),
};
