import { api } from "./client.js";

export const statsApi = {
    summary: () => api.get("/api/stats")
};
