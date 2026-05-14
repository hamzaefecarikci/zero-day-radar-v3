import { api } from "./client.js";

export const authApi = {
    me: () => api.get("/api/auth/me"),
    login: (email, password) => api.post("/api/auth/login", { email, password }),
    register: (data) => api.post("/api/auth/register", data),
    signout: () => api.post("/api/auth/signout")
};
