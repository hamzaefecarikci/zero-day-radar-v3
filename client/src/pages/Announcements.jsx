import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ancApi } from "../api/announcements.js";

export default function Announcements() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        ancApi.list()
            .then((r) => setItems(r.data))
            .catch((e) => setError(e.message))
            .finally(() => setLoading(false));
    }, []);

    return (
        <section className="card wide">
            <h1>Duyurular</h1>
            {loading && <p>Yukleniyor...</p>}
            {error && <p className="error">{error}</p>}
            {!loading && items.length === 0 && <p>Henuz duyuru yok.</p>}
            <ul className="vuln-list">
                {items.map((a) => (
                    <li key={a.announcementid} className="vuln-item">
                        <h3><Link to={`/announcement/${a.slug}`}>{a.title}</Link></h3>
                        {a.body && <p className="muted">{String(a.body).slice(0, 200)}{a.body.length > 200 ? "..." : ""}</p>}
                        <small className="muted">{new Date(a.created_at).toLocaleString("tr-TR")}</small>
                    </li>
                ))}
            </ul>
        </section>
    );
}
