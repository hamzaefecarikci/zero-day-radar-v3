export default function Contact() {
    return (
        <section className="card wide">
            <h1>Iletisim</h1>
            <p className="lead">
                Geri bildirim, soru veya bildirilmesi gereken bir zafiyet icin bize ulasabilirsiniz.
            </p>

            <h3>Iletisim Kanallari</h3>
            <ul className="contact-list">
                <li>
                    <span className="contact-label">E-posta</span>
                    <a href="mailto:fa2004ak@gmail.com">hamzaefecarikci@gmail.com</a>
                </li>
                <li>
                    <span className="contact-label">Sorumlu Sahis</span>
                    Hamza &middot; Web Programlama
                </li>
            </ul>

            <h3>Sorumlu Aciklik Bildirimi</h3>
            <p>
                Bir guvenlik acigi tespit ettiyseniz, kamuya duyurmadan once detaylari
                e-posta yoluyla iletmeniz rica olunur. Bildirim yaparken etkilenen sistem,
                yeniden uretim adimlari ve potansiyel etki hakkinda bilgi paylasilmasi
                degerlendirme surecini hizlandirir.
            </p>
        </section>
    );
}
