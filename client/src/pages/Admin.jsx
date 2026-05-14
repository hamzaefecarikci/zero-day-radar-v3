export default function Admin({ user }) {
    return (
        <section className="card">
            <h2>Admin Paneli</h2>
            <p>Merhaba <strong>{user.fullname}</strong> — bu sayfa iskelet asamasinda yer tutucudur.</p>
            <p>Sonraki adimlarda eklenecek modulleri:</p>
            <ul>
                <li>CVE / zafiyet kayitlarini ekleme, guncelleme, silme</li>
                <li>Duyuru / haber modulu</li>
                <li>Galeri yukleme (public/uploads/)</li>
                <li>Online kullanici ve IP tabanli ziyaretci sayaci</li>
            </ul>
        </section>
    );
}
