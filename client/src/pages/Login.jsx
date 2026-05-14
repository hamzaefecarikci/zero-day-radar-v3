import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../api/auth.js";

export default function Login({ onLogin }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setBusy(true);
        try {
            const data = await authApi.login(email, password);
            onLogin(data.user);
            navigate("/");
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy(false);
        }
    }

    return (
        <section className="card narrow">
            <h2>Giris</h2>
            <form onSubmit={handleSubmit}>
                <label>
                    Email
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                        required
                    />
                </label>
                <label>
                    Sifre
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="current-password"
                        required
                    />
                </label>
                {error && <p className="error">{error}</p>}
                <button type="submit" disabled={busy}>
                    {busy ? "Giris yapiliyor..." : "Giris yap"}
                </button>
            </form>
        </section>
    );
}
