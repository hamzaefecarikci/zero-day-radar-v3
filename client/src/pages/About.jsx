export default function About() {
    return (
        <section className="card wide">
            <h1>Hakkinda</h1>
            <p className="lead">
                Zero-Day Radar, yeni kesfedilen kritik guvenlik aciklarini (CVE) yayinlayan
                ve takip eden bir erken uyari panelidir. Klasik haber sitesinden farkli olarak
                her yayin bir zafiyet kaydi olarak modellenir.
            </p>

            <h3>Her Kayitta Bulunan Bilgiler</h3>
            <ul>
                <li><strong>Severity</strong> — Low / Medium / High / Critical</li>
                <li><strong>CVE ID</strong> — Resmi tanimlayici (varsa)</li>
                <li><strong>Etkilenen sistemler</strong> — Hangi yazilim ve surumler etkilenir</li>
                <li><strong>Patch durumu</strong> — Unpatched / In Progress / Patched / Unknown</li>
                <li><strong>Detay</strong> — Aciklik tarifi ve referanslar</li>
            </ul>

            <h3>Severity Sinifi</h3>
            <ul>
                <li><span className="badge severity-low">Low</span> &nbsp; Sinirli etki, dusuk istismar olasiligi</li>
                <li><span className="badge severity-medium">Medium</span> &nbsp; Orta seviye etki veya kosullu istismar</li>
                <li><span className="badge severity-high">High</span> &nbsp; Yuksek etki, kolay istismar</li>
                <li><span className="badge severity-critical">Critical</span> &nbsp; Sistemin tamamen ele gecirilmesi mumkun, acil yama</li>
            </ul>

            <h3>Kullanilan Teknolojiler</h3>
            <ul>
                <li>Backend: Node.js + Express, MySQL (mysql2), express-session, csurf, bcrypt, multer</li>
                <li>Frontend: React 18 + Vite + React Router</li>
            </ul>
        </section>
    );
}
