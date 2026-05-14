// Tek noktadan fetch sarmalayicisi.
// - credentials: include -> session cookie'si gonderilir
// - POST/PUT/DELETE icin once /api/csrf-token cagrilir, sonra X-CSRF-Token header'i eklenir
// - 403 CSRF_INVALID gelirse cache'i sifirlayip istek bir kez otomatik tekrarlanir

let cachedToken = null;

async function fetchCsrfToken() {
    const res = await fetch("/api/csrf-token", { credentials: "include" });
    if (!res.ok) throw new Error("CSRF token alinamadi.");
    const data = await res.json();
    return data.csrfToken;
}

async function getCsrfToken() {
    if (cachedToken) return cachedToken;
    cachedToken = await fetchCsrfToken();
    return cachedToken;
}

export function invalidateCsrfToken() {
    cachedToken = null;
}

async function request(method, url, body, isRetry = false) {
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
        // CSRF token expired/rotated -> taze token al ve bir kez yeniden dene
        if (res.status === 403 && data && data.code === "CSRF_INVALID" && !isRetry) {
            invalidateCsrfToken();
            return request(method, url, body, true);
        }
        const message = (data && data.error) || `Istek basarisiz (${res.status})`;
        const err = new Error(message);
        err.status = res.status;
        throw err;
    }

    return data;
}

async function postForm(url, formData, isRetry = false) {
    const headers = { "X-CSRF-Token": await getCsrfToken() };
    const res = await fetch(url, {
        method: "POST",
        credentials: "include",
        headers,
        body: formData
    });
    const isJson = (res.headers.get("content-type") || "").includes("application/json");
    const data = isJson ? await res.json() : null;
    if (!res.ok) {
        if (res.status === 403 && data && data.code === "CSRF_INVALID" && !isRetry) {
            invalidateCsrfToken();
            return postForm(url, formData, true);
        }
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
    del: (url) => request("DELETE", url),
    postForm
};
