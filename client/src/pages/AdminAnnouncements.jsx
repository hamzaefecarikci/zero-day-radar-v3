import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ancApi } from "../api/announcements.js";

export default function AdminAnnouncements() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    function load() {
        setLoading(true);
        ancApi.list(true)
            .then((r) => setItems(r.data))
            .catch((e) => setError(e.message))
            .finally(() => setLoading(false));
    }
    useEffect(() => { load(); }, []);

    async function handleDelete(slug) {
        if (!confirm(`"${slug}" silinsin mi?`)) return;
        try { await ancApi.remove(slug); load(); }
        catch (err) { alert(err.message); }
    }

    return (
        <section className="card wide">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h2>Duyuru Yonetimi</h2>
                <Link to="/admin/announcements/new" className="button-link">+ Yeni duyuru</Link>
            </div>
            {loading && <p>Yukleniyor...</p>}
            {error && <p className="error">{error}</p>}
            {!loading && items.length === 0 && <p>Henuz duyuru yok.</p>}
            <table className="data-table">
                <thead>
                    <tr><th>Baslik</th><th>Durum</th><th>Tarih</th><th></th></tr>
                </thead>
                <tbody>
                    {items.map((a) => (
                        <tr key={a.announcementid}>
                            <td>
                                <Link to={`/announcement/${a.slug}`}>{a.title}</Link>
                                <div className="muted" style={{ fontSize: "0.8rem" }}>/{a.slug}</div>
                            </td>
                            <td className="muted">{a.is_active ? "Aktif" : "Pasif"}</td>
                            <td className="muted">{new Date(a.created_at).toLocaleDateString("tr-TR")}</td>
                            <td style={{ whiteSpace: "nowrap" }}>
                                <Link to={`/admin/announcements/${a.slug}/edit`}>Duzenle</Link>
                                {" · "}
                                <button className="link-danger" onClick={() => handleDelete(a.slug)}>Sil</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </section>
    );
}
