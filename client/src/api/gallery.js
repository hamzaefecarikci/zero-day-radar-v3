import { api } from "./client.js";

export const galleryApi = {
    list: () => api.get("/api/gallery"),
    upload: (file, caption) => {
        const fd = new FormData();
        fd.append("image", file);
        if (caption) fd.append("caption", caption);
        return api.postForm("/api/gallery", fd);
    },
    remove: (id) => api.del(`/api/gallery/${id}`)
};
