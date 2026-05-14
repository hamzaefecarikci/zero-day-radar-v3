// Tek noktadan fetch sarmalayicisi.
// - credentials: include -> session cookie'si gonderilir
// - POST/PUT/DELETE icin once /api/csrf-token cagrilir, sonra X-CSRF-Token header'i eklenir.

let cachedToken = null;

async function getCsrfToken() {
    if (cachedToken) return cachedToken;
    const res = await fetch("/api/csrf-token", { credentials: "include" });
    if (!res.ok) throw new Error("CSRF token alinamadi.");
    const data = await res.json();
    cachedToken = data.csrfToken;
    return cachedToken;
}

function invalidateCsrfToken() {
    cachedToken = null;
}

async function request(method, url, body) {
    const headers = { "Content-Type": "application/json" };
    if (method !== "GET" && method !== "HEAD") {
        headers["X-CSRF-Token"] = await getCsrfToken();
    }

    const res = await fetch(url, {
        method,
        credentials: "include",
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined
    });

    const isJson = (res.headers.get("content-type") || "").includes("application/json");
    const data = isJson ? await res.json() : null;

    if (!res.ok) {
        // CSRF token suresi gectiyse bir sonraki istekte yeniden al
        if (res.status === 403) invalidateCsrfToken();
        const message = (data && data.error) || `Istek basarisiz (${res.status})`;
        const err = new Error(message);
        err.status = res.status;
        throw err;
    }

    return data;
}

export const api = {
    get: (url) => request("GET", url),
    post: (url, body) => request("POST", url, body),
    put: (url, body) => request("PUT", url, body),
    del: (url) => request("DELETE", url)
};
