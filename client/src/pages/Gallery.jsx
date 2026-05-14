import { useEffect, useState } from "react";
import { galleryApi } from "../api/gallery.js";

export default function Gallery() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        galleryApi.list()
            .then((r) => setItems(r.data))
            .catch((e) => setError(e.message))
            .finally(() => setLoading(false));
    }, []);

    return (
        <section className="card wide">
            <h1>Galeri</h1>
            <p className="muted">Exploit diyagramlari ve mimari gorseller.</p>
            {loading && <p>Yukleniyor...</p>}
            {error && <p className="error">{error}</p>}
            {!loading && items.length === 0 && <p>Henuz gorsel yuklenmedi.</p>}
            <div className="gallery-grid">
                {items.map((g) => (
                    <figure key={g.galleryid} className="gallery-card">
                        <img src={g.image_url} alt={g.caption || ""} loading="lazy" />
                        {g.caption && <figcaption>{g.caption}</figcaption>}
                    </figure>
                ))}
            </div>
        </section>
    );
}
