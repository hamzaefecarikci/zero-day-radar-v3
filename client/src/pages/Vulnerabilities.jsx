import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { vulnApi } from "../api/vulnerabilities.js";

const SEVERITIES = ["Low", "Medium", "High", "Critical"];

function formatDate(value) {
    if (!value) return "";
    try {
        return new Date(value).toLocaleDateString("tr-TR", {
            day: "2-digit", month: "short", year: "numeric"
        });
    } catch {
        return value;
    }
}

export default function Vulnerabilities() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [params, setParams] = useSearchParams();
    const severity = params.get("severity") || "";

    useEffect(() => {
        setLoading(true);
        vulnApi.list(severity || undefined)
            .then((r) => setItems(r.data))
            .catch((e) => setError(e.message))
            .finally(() => setLoading(false));
    }, [severity]);

    function setSeverity(s) {
        if (!s) setParams({});
        else setParams({ severity: s });
    }

    return (
        <section className="card wide">
            <h1>Zafiyet Kayitlari</h1>
            <div className="filters">
                <button
                    className={!severity ? "filter active" : "filter"}
                    onClick={() => setSeverity("")}
                >Tumu</button>
                {SEVERITIES.map((s) => (
                    <button
                        key={s}
                        className={severity === s ? "filter active" : "filter"}
                        onClick={() => setSeverity(s)}
                    >{s}</button>
                ))}
            </div>

            {loading && <p>Yukleniyor...</p>}
            {error && <p className="error">{error}</p>}
            {!loading && items.length === 0 && <p>Henuz zafiyet kaydi eklenmedi.</p>}

            <ul className="vuln-list">
                {items.map((v) => (
                    <li key={v.vulnerabilityid} className="vuln-item">
                        <div className="vuln-item-head">
                            <span className={`badge severity-${v.severity.toLowerCase()}`}>{v.severity}</span>
                            {v.cve_id && <span className="cve-id">{v.cve_id}</span>}
                            <span className="vuln-date">{formatDate(v.published_at)}</span>
                        </div>
                        <h3>
                            <Link to={`/vulnerability/${v.slug}`}>{v.title}</Link>
                        </h3>
                        {v.summary && <p className="muted">{v.summary}</p>}
                        <small className="muted">Patch: {v.patch_status}</small>
                    </li>
                ))}
            </ul>
        </section>
    );
}
