import { api } from "./client.js";

export const vulnApi = {
    list: (severity) => api.get(severity ? `/api/vulnerabilities?severity=${encodeURIComponent(severity)}` : "/api/vulnerabilities"),
    get: (slug) => api.get(`/api/vulnerabilities/${encodeURIComponent(slug)}`),
    meta: () => api.get("/api/vulnerabilities/meta"),
    create: (body) => api.post("/api/vulnerabilities", body),
    update: (slug, body) => api.put(`/api/vulnerabilities/${encodeURIComponent(slug)}`, body),
    remove: (slug) => api.del(`/api/vulnerabilities/${encodeURIComponent(slug)}`)
};
