import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { vulnApi } from "../api/vulnerabilities.js";
import { statsApi } from "../api/stats.js";

export default function Home({ user }) {
    const [latest, setLatest] = useState([]);
    const [criticals, setCriticals] = useState([]);
    const [stats, setStats] = useState(null);

    useEffect(() => {
        vulnApi.list().then((r) => setLatest(r.data.slice(0, 5))).catch(() => {});
        vulnApi.list("Critical").then((r) => setCriticals(r.data.slice(0, 5))).catch(() => {});

        function loadStats() {
            statsApi.summary().then(setStats).catch(() => {});
        }
        loadStats();
        const t = setInterval(loadStats, 15000);
        return () => clearInterval(t);
    }, []);

    return (
        <div className="home">
            <section className="card hero">
                <h1>Kritik Guvenlik Aciklari Radari</h1>
                <p>
                    Yeni kesfedilen kritik CVE kayitlarini takip eden bir erken uyari panelidir.
                    Severity, etkilenen sistemler ve patch durumu her kayitta gozukur.
                </p>
                {user
                    ? <p>Hos geldin <strong>{user.fullname}</strong>.</p>
                    : <p><Link to="/auth/login">Giris yap</Link> veya <Link to="/auth/register">kayit ol</Link>.</p>
                }

                {stats && (
                    <div className="stats-row">
                        <div className="stat">
                            <span className="stat-label">Aktif kullanici</span>
                            <span className="stat-value">{stats.online}</span>
                        </div>
                        <div className="stat">
                            <span className="stat-label">Bugun</span>
                            <span className="stat-value">{stats.today_visits}</span>
                        </div>
                        <div className="stat">
                            <span className="stat-label">Toplam ziyaret</span>
                            <span className="stat-value">{stats.total_visits}</span>
                        </div>
                    </div>
                )}
            </section>

            <section className="card">
                <h2>Kritik Uyarilar</h2>
                {criticals.length === 0
                    ? <p className="muted">Suanda kritik seviyede yayinlanmis kayit yok.</p>
                    : (
                        <ul className="vuln-list">
                            {criticals.map((v) => (
                                <li key={v.vulnerabilityid} className="vuln-item">
                                    <span className={`badge severity-${v.severity.toLowerCase()}`}>{v.severity}</span>
                                    {" "}
                                    <Link to={`/vulnerability/${v.slug}`}>{v.title}</Link>
                                </li>
                            ))}
                        </ul>
                    )
                }
            </section>

            <section className="card">
                <h2>Son Kayitlar</h2>
                {latest.length === 0
                    ? <p className="muted">Henuz kayit eklenmedi.</p>
                    : (
                        <ul className="vuln-list">
                            {latest.map((v) => (
                                <li key={v.vulnerabilityid} className="vuln-item">
                                    <span className={`badge severity-${v.severity.toLowerCase()}`}>{v.severity}</span>
                                    {" "}
                                    <Link to={`/vulnerability/${v.slug}`}>{v.title}</Link>
                                </li>
                            ))}
                        </ul>
                    )
                }
                <p><Link to="/vulnerabilities">Tum kayitlari gor &rarr;</Link></p>
            </section>
        </div>
    );
}
