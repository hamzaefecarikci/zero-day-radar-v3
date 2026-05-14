import { api } from "./client.js";

export const ancApi = {
    list: (all) => api.get(all ? "/api/announcements?all=1" : "/api/announcements"),
    get: (slug) => api.get(`/api/announcements/${encodeURIComponent(slug)}`),
    create: (body) => api.post("/api/announcements", body),
    update: (slug, body) => api.put(`/api/announcements/${encodeURIComponent(slug)}`, body),
    remove: (slug) => api.del(`/api/announcements/${encodeURIComponent(slug)}`)
};
