import { Routes, Route, Link, Navigate, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { authApi } from "./api/auth.js";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Admin from "./pages/Admin.jsx";
import Vulnerabilities from "./pages/Vulnerabilities.jsx";
import VulnerabilityDetail from "./pages/VulnerabilityDetail.jsx";
import AdminVulnerabilities from "./pages/AdminVulnerabilities.jsx";
import AdminVulnerabilityForm from "./pages/AdminVulnerabilityForm.jsx";
import Announcements from "./pages/Announcements.jsx";
import AnnouncementDetail from "./pages/AnnouncementDetail.jsx";
import AdminAnnouncements from "./pages/AdminAnnouncements.jsx";
import AdminAnnouncementForm from "./pages/AdminAnnouncementForm.jsx";
import Gallery from "./pages/Gallery.jsx";
import AdminGallery from "./pages/AdminGallery.jsx";
import About from "./pages/About.jsx";
import Contact from "./pages/Contact.jsx";
import AdminUsers from "./pages/AdminUsers.jsx";

export default function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        authApi.me()
            .then((data) => setUser(data.user))
            .catch(() => setUser(null))
            .finally(() => setLoading(false));
    }, []);

    async function handleSignout() {
        try {
            await authApi.signout();
            setUser(null);
            navigate("/");
        } catch (err) {
            alert(err.message);
        }
    }

    function requireAdmin(node) {
        if (!user) return <Navigate to="/auth/login" replace />;
        if (user.role !== "admin") return <Navigate to="/" replace />;
        return node;
    }

    return (
        <div className="app">
            <header className="topbar">
                <Link to="/" className="brand">Zero-Day Radar</Link>
                <nav>
                    <Link to="/">Ana Sayfa</Link>
                    <Link to="/vulnerabilities">Zafiyetler</Link>
                    <Link to="/vulnerabilities?severity=Critical">Kritik Uyarilar</Link>
                    <Link to="/announcements">Duyurular</Link>
                    <Link to="/gallery">Galeri</Link>
                    <Link to="/about">Hakkinda</Link>
                    <Link to="/contact">Iletisim</Link>
                    {user
                        ? (
                            <>
                                {user.role === "admin" && <Link to="/admin">Admin</Link>}
                                <span className="user">{user.fullname}</span>
                                <button onClick={handleSignout}>Cikis</button>
                            </>
                        )
                        : (
                            <>
                                <Link to="/auth/login">Giris</Link>
                                <Link to="/auth/register">Kayit</Link>
                            </>
                        )
                    }
                </nav>
            </header>

            <main className="content">
                {loading
                    ? <p>Yukleniyor...</p>
                    : (
                        <Routes>
                            <Route path="/" element={<Home user={user} />} />
                            <Route path="/vulnerabilities" element={<Vulnerabilities />} />
                            <Route path="/vulnerability/:slug" element={<VulnerabilityDetail />} />
                            <Route path="/announcements" element={<Announcements />} />
                            <Route path="/announcement/:slug" element={<AnnouncementDetail />} />
                            <Route path="/gallery" element={<Gallery />} />
                            <Route path="/about" element={<About />} />
                            <Route path="/contact" element={<Contact />} />

                            <Route
                                path="/auth/login"
                                element={user ? <Navigate to="/" replace /> : <Login onLogin={setUser} />}
                            />
                            <Route
                                path="/auth/register"
                                element={user ? <Navigate to="/" replace /> : <Register onRegister={setUser} />}
                            />

                            <Route path="/admin" element={requireAdmin(<Admin user={user} />)} />
                            <Route path="/admin/vulnerabilities" element={requireAdmin(<AdminVulnerabilities />)} />
                            <Route path="/admin/vulnerabilities/new" element={requireAdmin(<AdminVulnerabilityForm />)} />
                            <Route path="/admin/vulnerabilities/:slug/edit" element={requireAdmin(<AdminVulnerabilityForm />)} />
                            <Route path="/admin/announcements" element={requireAdmin(<AdminAnnouncements />)} />
                            <Route path="/admin/announcements/new" element={requireAdmin(<AdminAnnouncementForm />)} />
                            <Route path="/admin/announcements/:slug/edit" element={requireAdmin(<AdminAnnouncementForm />)} />
                            <Route path="/admin/gallery" element={requireAdmin(<AdminGallery />)} />
                            <Route path="/admin/users" element={requireAdmin(<AdminUsers currentUser={user} />)} />

                            <Route path="*" element={<p>Sayfa bulunamadi.</p>} />
                        </Routes>
                    )
                }
            </main>

            <footer className="footer">
                <small>Zero-Day Radar</small>
            </footer>
        </div>
    );
}
