import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ancApi } from "../api/announcements.js";

const EMPTY = { title: "", slug: "", body: "", is_active: true };

export default function AdminAnnouncementForm() {
    const { slug } = useParams();
    const isEdit = Boolean(slug);
    const [form, setForm] = useState(EMPTY);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        if (!isEdit) return;
        ancApi.get(slug)
            .then((r) => setForm({
                title: r.data.title || "",
                slug: r.data.slug || "",
                body: r.data.body || "",
                is_active: Boolean(r.data.is_active)
            }))
            .catch((e) => setError(e.message));
    }, [slug, isEdit]);

    function update(key) {
        return (e) => {
            const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
            setForm((f) => ({ ...f, [key]: value }));
        };
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setBusy(true);
        try {
            const payload = { ...form, is_active: form.is_active ? 1 : 0 };
            const result = isEdit
                ? await ancApi.update(slug, payload)
                : await ancApi.create(payload);
            navigate(`/announcement/${result.data.slug}`);
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy(false);
        }
    }

    return (
        <section className="card">
            <h2>{isEdit ? "Duyuruyu Duzenle" : "Yeni Duyuru"}</h2>
            <form onSubmit={handleSubmit}>
                <label>
                    Baslik
                    <input value={form.title} onChange={update("title")} required maxLength={200} />
                </label>
                <label>
                    Slug (bos birakirsan basliktan uretilir)
                    <input value={form.slug} onChange={update("slug")} maxLength={180} />
                </label>
                <label>
                    Icerik
                    <textarea value={form.body} onChange={update("body")} rows={10} />
                </label>
                <label className="check">
                    <input type="checkbox" checked={form.is_active} onChange={update("is_active")} />
                    <span>Aktif (yayinda)</span>
                </label>

                {error && <p className="error">{error}</p>}
                <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button type="submit" disabled={busy}>
                        {busy ? "Kaydediliyor..." : (isEdit ? "Guncelle" : "Olustur")}
                    </button>
                    <button type="button" onClick={() => navigate("/admin/announcements")}>Iptal</button>
                </div>
            </form>
        </section>
    );
}
