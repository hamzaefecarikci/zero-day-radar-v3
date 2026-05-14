import { Link } from "react-router-dom";

export default function Admin({ user }) {
    return (
        <section className="card">
            <h2>Admin Paneli</h2>
            <p>Merhaba <strong>{user.fullname}</strong>.</p>
            <ul className="admin-links">
                <li><Link to="/admin/vulnerabilities">Zafiyet Yonetimi</Link></li>
                <li><Link to="/admin/announcements">Duyuru Yonetimi</Link></li>
                <li><Link to="/admin/gallery">Galeri Yonetimi</Link></li>
                <li><Link to="/admin/users">Kullanici Yonetimi</Link></li>
            </ul>
        </section>
    );
}
