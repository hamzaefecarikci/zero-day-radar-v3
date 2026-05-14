import { useEffect, useState } from "react";
import { userApi } from "../api/users.js";

export default function AdminUsers({ currentUser }) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    function load() {
        setLoading(true);
        userApi.list()
            .then((r) => setItems(r.data))
            .catch((e) => setError(e.message))
            .finally(() => setLoading(false));
    }
    useEffect(() => { load(); }, []);

    async function handleRoleChange(id, role) {
        try {
            await userApi.updateRole(id, role);
            load();
        } catch (err) {
            alert(err.message);
        }
    }

    async function handleDelete(id, email) {
        if (!confirm(`"${email}" silinsin mi?`)) return;
        try {
            await userApi.remove(id);
            load();
        } catch (err) {
            alert(err.message);
        }
    }

    return (
        <section className="card wide">
            <h2>Kullanici Yonetimi</h2>
            <p className="muted">
                Public register acik; herkes 'user' rolunde kayit olur. Buradan rolleri
                yonetebilir veya kullanicilari silebilirsin. Kendi hesabini degistiremez ya da silemezsin.
            </p>

            {loading && <p>Yukleniyor...</p>}
            {error && <p className="error">{error}</p>}
            {!loading && items.length === 0 && <p>Henuz kullanici yok.</p>}

            <table className="data-table">
                <thead>
                    <tr>
                        <th>Ad</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Kayit</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((u) => {
                        const isSelf = currentUser && u.userid === currentUser.userid;
                        return (
                            <tr key={u.userid}>
                                <td>{u.name} {u.surname}{isSelf && <span className="muted"> (sen)</span>}</td>
                                <td className="muted">{u.email}</td>
                                <td>
                                    <select
                                        value={u.role}
                                        disabled={isSelf}
                                        onChange={(e) => handleRoleChange(u.userid, e.target.value)}
                                    >
                                        <option value="user">user</option>
                                        <option value="admin">admin</option>
                                    </select>
                                </td>
                                <td className="muted">{new Date(u.created_at).toLocaleDateString("tr-TR")}</td>
                                <td>
                                    <button
                                        className="link-danger"
                                        disabled={isSelf}
                                        onClick={() => handleDelete(u.userid, u.email)}
                                    >Sil</button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </section>
    );
}
