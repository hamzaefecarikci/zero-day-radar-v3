import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../api/auth.js";

export default function Register({ onRegister }) {
    const [form, setForm] = useState({ name: "", surname: "", email: "", password: "" });
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);
    const navigate = useNavigate();

    function update(key) {
        return (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setBusy(true);
        try {
            const data = await authApi.register(form);
            // Kayit ardindan otomatik giris yapmak icin login cagrilir
            await authApi.login(form.email, form.password);
            onRegister(data.user);
            navigate("/");
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy(false);
        }
    }

    return (
        <section className="card narrow">
            <h2>Kayit</h2>
            <form onSubmit={handleSubmit}>
                <label>
                    Ad
                    <input value={form.name} onChange={update("name")} required />
                </label>
                <label>
                    Soyad
                    <input value={form.surname} onChange={update("surname")} />
                </label>
                <label>
                    Email
                    <input type="email" value={form.email} onChange={update("email")} required />
                </label>
                <label>
                    Sifre (en az 6 karakter)
                    <input
                        type="password"
                        value={form.password}
                        onChange={update("password")}
                        minLength={6}
                        required
                    />
                </label>
                {error && <p className="error">{error}</p>}
                <button type="submit" disabled={busy}>
                    {busy ? "Kaydediliyor..." : "Kayit ol"}
                </button>
            </form>
        </section>
    );
}
