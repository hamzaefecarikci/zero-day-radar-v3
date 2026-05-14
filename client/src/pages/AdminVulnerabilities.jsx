import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { vulnApi } from "../api/vulnerabilities.js";

export default function AdminVulnerabilities() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    function load() {
        setLoading(true);
        vulnApi.list()
            .then((r) => setItems(r.data))
            .catch((e) => setError(e.message))
            .finally(() => setLoading(false));
    }

    useEffect(() => { load(); }, []);

    async function handleDelete(slug) {
        if (!confirm(`"${slug}" silinsin mi?`)) return;
        try {
            await vulnApi.remove(slug);
            load();
        } catch (err) {
            alert(err.message);
        }
    }

    return (
        <section className="card wide">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h2>Zafiyet Yonetimi</h2>
                <Link to="/admin/vulnerabilities/new" className="button-link">+ Yeni zafiyet</Link>
            </div>

            {loading && <p>Yukleniyor...</p>}
            {error && <p className="error">{error}</p>}
            {!loading && items.length === 0 && <p>Henuz kayit yok.</p>}

            <table className="data-table">
                <thead>
                    <tr>
                        <th>Baslik</th>
                        <th>Severity</th>
                        <th>CVE</th>
                        <th>Patch</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((v) => (
                        <tr key={v.vulnerabilityid}>
                            <td>
                                <Link to={`/vulnerability/${v.slug}`}>{v.title}</Link>
                                <div className="muted" style={{ fontSize: "0.8rem" }}>/{v.slug}</div>
                            </td>
                            <td><span className={`badge severity-${v.severity.toLowerCase()}`}>{v.severity}</span></td>
                            <td className="muted">{v.cve_id || "-"}</td>
                            <td className="muted">{v.patch_status}</td>
                            <td style={{ whiteSpace: "nowrap" }}>
                                <Link to={`/admin/vulnerabilities/${v.slug}/edit`}>Duzenle</Link>
                                {" · "}
                                <button className="link-danger" onClick={() => handleDelete(v.slug)}>Sil</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </section>
    );
}
