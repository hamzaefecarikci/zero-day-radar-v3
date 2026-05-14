import { useEffect, useRef, useState } from "react";
import { galleryApi } from "../api/gallery.js";

export default function AdminGallery() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [caption, setCaption] = useState("");
    const [busy, setBusy] = useState(false);
    const fileRef = useRef(null);

    function load() {
        setLoading(true);
        galleryApi.list()
            .then((r) => setItems(r.data))
            .catch((e) => setError(e.message))
            .finally(() => setLoading(false));
    }
    useEffect(() => { load(); }, []);

    async function handleUpload(e) {
        e.preventDefault();
        setError("");
        const file = fileRef.current.files[0];
        if (!file) {
            setError("Lutfen bir dosya secin.");
            return;
        }
        setBusy(true);
        try {
            await galleryApi.upload(file, caption);
            setCaption("");
            fileRef.current.value = "";
            load();
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy(false);
        }
    }

    async function handleDelete(id) {
        if (!confirm("Bu gorsel silinsin mi?")) return;
        try { await galleryApi.remove(id); load(); }
        catch (err) { alert(err.message); }
    }

    return (
        <section className="card wide">
            <h2>Galeri Yonetimi</h2>

            <form onSubmit={handleUpload} className="upload-form">
                <label>
                    Dosya (png/jpeg/webp/gif, max 5 MB)
                    <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" />
                </label>
                <label>
                    Aciklama (opsiyonel)
                    <input value={caption} onChange={(e) => setCaption(e.target.value)} maxLength={255} />
                </label>
                {error && <p className="error">{error}</p>}
                <button type="submit" disabled={busy}>
                    {busy ? "Yukleniyor..." : "Yukle"}
                </button>
            </form>

            <h3 style={{ marginTop: "1.5rem" }}>Yuklenen Gorseller</h3>
            {loading && <p>Yukleniyor...</p>}
            {!loading && items.length === 0 && <p>Henuz gorsel yok.</p>}
            <div className="gallery-grid">
                {items.map((g) => (
                    <figure key={g.galleryid} className="gallery-card admin">
                        <img src={g.image_url} alt={g.caption || ""} loading="lazy" />
                        {g.caption && <figcaption>{g.caption}</figcaption>}
                        <button className="link-danger" onClick={() => handleDelete(g.galleryid)}>Sil</button>
                    </figure>
                ))}
            </div>
        </section>
    );
}
