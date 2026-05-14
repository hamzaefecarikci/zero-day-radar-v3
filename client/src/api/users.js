import { api } from "./client.js";

export const userApi = {
    list: () => api.get("/api/users"),
    updateRole: (id, role) => api.put(`/api/users/${id}/role`, { role }),
    remove: (id) => api.del(`/api/users/${id}`)
};
