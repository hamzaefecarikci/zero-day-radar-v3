export default function Home({ user }) {
    return (
        <section className="card">
            <h1>Kritik Guvenlik Aciklari Radari</h1>
            <p>
                Bu platform, yeni kesfedilen kritik CVE kayitlarini yayinlar ve takip eder.
                Site iskeleti hazirdir; zafiyet listesi, galeri ve duyuru modulleri sonraki adimda eklenecek.
            </p>
            {user
                ? <p>Hos geldin <strong>{user.fullname}</strong>.</p>
                : <p>Yonetici girisi icin <em>Giris</em> bagiantisini kullanin.</p>
            }
        </section>
    );
}
