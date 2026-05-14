import { api, invalidateCsrfToken } from "./client.js";

export const authApi = {
    me: () => api.get("/api/auth/me"),
    login: (email, password) => api.post("/api/auth/login", { email, password }),
    register: (data) => api.post("/api/auth/register", data),
    signout: async () => {
        const res = await api.post("/api/auth/signout");
        // Oturum yok edildi; cached CSRF token artik yeni session'a ait degil
        invalidateCsrfToken();
        return res;
    }
};
