import { Routes, Route, Link, Navigate, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { authApi } from "./api/auth.js";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Admin from "./pages/Admin.jsx";

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

    return (
        <div className="app">
            <header className="topbar">
                <Link to="/" className="brand">Zero-Day Radar</Link>
                <nav>
                    <Link to="/">Ana Sayfa</Link>
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
                            <Route
                                path="/auth/login"
                                element={user ? <Navigate to="/" replace /> : <Login onLogin={setUser} />}
                            />
                            <Route
                                path="/auth/register"
                                element={user ? <Navigate to="/" replace /> : <Register onRegister={setUser} />}
                            />
                            <Route
                                path="/admin"
                                element={
                                    !user ? <Navigate to="/auth/login" replace />
                                        : user.role !== "admin" ? <Navigate to="/" replace />
                                        : <Admin user={user} />
                                }
                            />
                            <Route path="*" element={<p>Sayfa bulunamadi.</p>} />
                        </Routes>
                    )
                }
            </main>

            <footer className="footer">
                <small>Zero-Day Radar &middot; iskelet</small>
            </footer>
        </div>
    );
}
