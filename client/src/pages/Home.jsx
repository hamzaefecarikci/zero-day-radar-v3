import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Shield, Activity, Eye, Users, AlertTriangle } from "lucide-react";
import { vulnApi } from "../api/vulnerabilities.js";
import { statsApi } from "../api/stats.js";

function formatTime(date) {
    return date.toLocaleString("tr-TR", { hour12: false });
}

export default function Home({ user }) {
    const [latest, setLatest] = useState([]);
    const [criticals, setCriticals] = useState([]);
    const [stats, setStats] = useState(null);
    const [clock, setClock] = useState(new Date());

    useEffect(() => {
        vulnApi.list().then((r) => setLatest(r.data.slice(0, 5))).catch(() => {});
        vulnApi.list("Critical").then((r) => setCriticals(r.data.slice(0, 5))).catch(() => {});

        function loadStats() {
            statsApi.summary().then(setStats).catch(() => {});
        }
        loadStats();
        const tStats = setInterval(loadStats, 15000);
        const tClock = setInterval(() => setClock(new Date()), 1000);
        return () => {
            clearInterval(tStats);
            clearInterval(tClock);
        };
    }, []);

    return (
        <div className="home">
            {/* HERO */}
            <section className="card hero">
                <h1 className="glitch" data-text="ZERO-DAY RADAR">ZERO-DAY RADAR</h1>
                <div className="hero-sub">
                    <Shield size={16} style={{ verticalAlign: "middle", marginRight: "0.4rem" }} />
                    Critical CVE Tracking Platform
                </div>
                <div className="status-bar">
                    <span className="status-dot"></span>
                    <span>SYSTEM ONLINE</span>
                    <span style={{ color: "var(--text-cyan)" }}>|</span>
                    <span>{formatTime(clock)}</span>
                </div>
                {user
                    ? <p style={{ marginTop: "1.5rem" }}>Oturum sahibi: <strong style={{ color: "var(--text-cyan)" }}>{user.fullname}</strong></p>
                    : <p style={{ marginTop: "1.5rem" }}>
                        <Link to="/auth/login">[ giris yap ]</Link>
                        {" "}veya{" "}
                        <Link to="/auth/register">[ kayit ol ]</Link>
                    </p>
                }

                {stats && (
                    <div className="stats-row">
                        <div className="stat">
                            <span className="stat-label">
                                <Users size={12} style={{ verticalAlign: "middle", marginRight: "0.3rem" }} />
                                Online
                            </span>
                            <span className="stat-value">{stats.online}</span>
                        </div>
                        <div className="stat">
                            <span className="stat-label">
                                <Eye size={12} style={{ verticalAlign: "middle", marginRight: "0.3rem" }} />
                                Bugun
                            </span>
                            <span className="stat-value cyan">{stats.today_visits}</span>
                        </div>
                        <div className="stat">
                            <span className="stat-label">
                                <Activity size={12} style={{ verticalAlign: "middle", marginRight: "0.3rem" }} />
                                Toplam Ziyaret
                            </span>
                            <span className="stat-value magenta">{stats.total_visits}</span>
                        </div>
                    </div>
                )}
            </section>

            {/* CRITICAL ALERTS */}
            <section className="card alerts-frame">
                <div className="section-head">
                    <AlertTriangle size={20} style={{ color: "var(--sev-critical)" }} />
                    <h2>CRITICAL ALERTS</h2>
                    <span className="pulse"></span>
                </div>
                {criticals.length === 0
                    ? <p className="muted">// no critical entries</p>
                    : (
                        <ul className="vuln-list">
                            {criticals.map((v) => (
                                <li key={v.vulnerabilityid} className="vuln-item">
                                    <div className="vuln-item-head">
                                        <span className={`badge severity-${v.severity.toLowerCase()}`}>{v.severity}</span>
                                        {v.cve_id && <span className="cve-id">{v.cve_id}</span>}
                                    </div>
                                    <h3><Link to={`/vulnerability/${v.slug}`}>{v.title}</Link></h3>
                                </li>
                            ))}
                        </ul>
                    )
                }
            </section>

            {/* LATEST */}
            <section className="card">
                <div className="section-head" style={{ borderBottomColor: "var(--border-cyan)" }}>
                    <h2 style={{ color: "var(--text-cyan)", textShadow: "0 0 8px var(--text-cyan)" }}>LATEST FEED</h2>
                </div>
                {latest.length === 0
                    ? <p className="muted">// no entries yet</p>
                    : (
                        <ul className="vuln-list">
                            {latest.map((v) => (
                                <li key={v.vulnerabilityid} className="vuln-item">
                                    <div className="vuln-item-head">
                                        <span className={`badge severity-${v.severity.toLowerCase()}`}>{v.severity}</span>
                                        {v.cve_id && <span className="cve-id">{v.cve_id}</span>}
                                    </div>
                                    <h3><Link to={`/vulnerability/${v.slug}`}>{v.title}</Link></h3>
                                </li>
                            ))}
                        </ul>
                    )
                }
                <p style={{ marginTop: "1rem" }}>
                    <Link to="/vulnerabilities">[ tum kayitlari listele &rarr; ]</Link>
                </p>
            </section>
        </div>
    );
}
