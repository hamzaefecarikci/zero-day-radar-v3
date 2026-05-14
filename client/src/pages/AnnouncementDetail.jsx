import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ancApi } from "../api/announcements.js";

export default function AnnouncementDetail() {
    const { slug } = useParams();
    const [item, setItem] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        ancApi.get(slug).then((r) => setItem(r.data)).catch((e) => setError(e.message));
    }, [slug]);

    if (error) return <p className="error">{error}</p>;
    if (!item) return <p>Yukleniyor...</p>;

    const author = [item.author_name, item.author_surname].filter(Boolean).join(" ");

    return (
        <article className="card wide">
            <p><Link to="/announcements">&larr; Tum duyurular</Link></p>
            <h1>{item.title}</h1>
            <p style={{ whiteSpace: "pre-wrap" }}>{item.body}</p>
            <footer className="muted" style={{ marginTop: "1.5rem", fontSize: "0.85rem" }}>
                {new Date(item.created_at).toLocaleString("tr-TR")}
                {author && <> &middot; {author}</>}
            </footer>
        </article>
    );
}
