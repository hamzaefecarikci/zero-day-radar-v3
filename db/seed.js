// Dummy veri yukleme. Calistirma: npm run seed
// Bu script tum tablolari TEMIZLER ve baştan doldurur. Idempotenttir.

require("dotenv").config();

const fs = require("fs");
const path = require("path");
const zlib = require("zlib");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const mysql = require("mysql2/promise");

const UPLOAD_DIR = path.join(__dirname, "..", "public", "uploads");

async function main() {
    const conn = await mysql.createConnection({
        host: process.env.DB_HOST || "localhost",
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD || "",
        database: process.env.DB_NAME || "zero_day_radar_v3"
    });

    try {
        console.log(`[seed] DB: ${process.env.DB_NAME}`);
        console.log("[seed] tablolar temizleniyor...");
        await conn.query("SET FOREIGN_KEY_CHECKS = 0");
        await conn.query("TRUNCATE TABLE gallery");
        await conn.query("TRUNCATE TABLE announcements");
        await conn.query("TRUNCATE TABLE vulnerabilities");
        await conn.query("TRUNCATE TABLE ip_visits");
        await conn.query("TRUNCATE TABLE users");
        await conn.query("SET FOREIGN_KEY_CHECKS = 1");

        // -------- KULLANICILAR --------
        console.log("[seed] kullanicilar...");
        const adminHash = await bcrypt.hash("Admin1234!", 10);
        const userHash = await bcrypt.hash("User1234!", 10);

        const [adminRes] = await conn.execute(
            "INSERT INTO users (email, password, name, surname, role) VALUES (?, ?, ?, ?, ?)",
            ["admin@zerodayradar.local", adminHash, "Hamza", "Admin", "admin"]
        );
        const adminId = adminRes.insertId;

        await conn.execute(
            "INSERT INTO users (email, password, name, surname, role) VALUES (?, ?, ?, ?, ?)",
            ["user@example.com", userHash, "Demo", "User", "user"]
        );

        // -------- ZAFIYETLER (gercek CVE'ler) --------
        console.log("[seed] zafiyetler...");
        const vulns = [
            {
                slug: "openssh-regresshion",
                title: "OpenSSH regreSSHion",
                cve_id: "CVE-2024-6387",
                severity: "High",
                patch_status: "In Progress",
                affected_systems: "OpenSSH 8.5p1 - 9.7p1 (glibc tabanli Linux)",
                summary: "OpenSSH sunucusunda imzasiz yaris kosulu sonucu uzaktan kod yurutmeye olanak veren bir kusur.",
                description: "sshd sinyal islemcisinde async-signal-unsafe fonksiyon cagrisi yaris kosulu yaratir. Saldirgan yeterli sayida deneme ile root yetkisi ile RCE elde edebilir. Distribusyona ozgu yamalar yayinlanmaktadir.",
                published_at: "2024-07-01 00:00:00"
            },
            {
                slug: "http2-rapid-reset",
                title: "HTTP/2 Rapid Reset",
                cve_id: "CVE-2023-44487",
                severity: "High",
                patch_status: "Patched",
                affected_systems: "Cogu HTTP/2 sunucusu (nginx, Apache, Envoy, Cloudflare, AWS)",
                summary: "Hizla stream acip iptal etme ile rekor seviyede DDoS uretmeye olanak veren protokol seviyesi acik.",
                description: "Saldirgan HTTP/2 stream'leri RST_STREAM ile aninda iptal ederek sunucuda devasa is yuku olusturur. CVE-2023-44487 olarak takip edilir; Eylul-Ekim 2023'te 398 milyon istek/saniye seviyesinde botnet saldirilari raporlandi.",
                published_at: "2023-10-10 00:00:00"
            },
            {
                slug: "libwebp-buffer-overflow",
                title: "libwebp Heap Buffer Overflow",
                cve_id: "CVE-2023-4863",
                severity: "High",
                patch_status: "Patched",
                affected_systems: "libwebp < 1.3.2; Chrome, Firefox, Safari, Edge, 1Password",
                summary: "WebP gorsel kodu cozumunde heap tabanli bellek tasmasi - tarayicilar uzerinden zero-click RCE.",
                description: "Huffman kod cozumleyici, kotu hazirlanmis WebP dosyasinda heap'i tasirir. Chrome ve Safari'de aktif istismar gozlemlendi. libwebp'i kullanan tum uygulamalar etkilenir.",
                published_at: "2023-09-11 00:00:00"
            },
            {
                slug: "follina-msdt-rce",
                title: "Microsoft Office Follina",
                cve_id: "CVE-2022-30190",
                severity: "High",
                patch_status: "Patched",
                affected_systems: "Microsoft Office (MSDT URL handler)",
                summary: "Office dokumanindan MSDT URL semasi cagrilarak makrosuz uzaktan kod yurutme.",
                description: "Bir .docx dosyasi acildiginda MSDT (Microsoft Support Diagnostic Tool) protokol islemcisi tetiklenir. Makro etkin olmasa bile saldirgan kod calistirabilir. Mayis 2022'de vahşi dogada gozlemlendi.",
                published_at: "2022-05-30 00:00:00"
            },
            {
                slug: "spring4shell",
                title: "Spring4Shell",
                cve_id: "CVE-2022-22965",
                severity: "Critical",
                patch_status: "Patched",
                affected_systems: "Spring Framework < 5.3.18 ve < 5.2.20 (JDK 9+)",
                summary: "Spring MVC veri baglamasi yoluyla ClassLoader manipulasyonu ile uzaktan kod yurutme.",
                description: "POJO binding sirasinda class.module.classLoader yolu uzerinden Tomcat AccessLogValve ayarlari degistirilebilir; saldirgan webshell yazabilir. JDK 9+ ve WAR deploy gereksinimi vardir.",
                published_at: "2022-03-31 00:00:00"
            },
            {
                slug: "windows-printnightmare",
                title: "Windows Print Spooler PrintNightmare",
                cve_id: "CVE-2021-34527",
                severity: "High",
                patch_status: "Patched",
                affected_systems: "Windows tum surumler (Print Spooler servisi)",
                summary: "Print Spooler servisinde uzaktan kod yurutme; SYSTEM yetkisine yukseltme.",
                description: "RpcAddPrinterDriverEx cagrisi imzasiz suruculerin yuklenmesine izin verir. Bir alan kullanicisi DC uzerinde SYSTEM olarak kod yurutebilir. Microsoft acil yama dagitimi yapti.",
                published_at: "2021-07-06 00:00:00"
            },
            {
                slug: "apache-log4j-rce",
                title: "Apache Log4j RCE (Log4Shell)",
                cve_id: "CVE-2021-44228",
                severity: "Critical",
                patch_status: "Patched",
                affected_systems: "Apache Log4j 2.0 - 2.14.1",
                summary: "JNDI lookup ozelligi araciligiyla loglanan string'in icinden RCE.",
                description: "${jndi:ldap://...} sablonu Log4j tarafindan cozumlenince saldirgan LDAP sunucusundaki kotu sinifi yukleyebilir. 2021 sonu boyunca internet capinda kitlesel istismar yasandi.",
                published_at: "2021-12-10 00:00:00"
            },
            {
                slug: "microsoft-exchange-proxyshell",
                title: "Microsoft Exchange ProxyShell",
                cve_id: "CVE-2021-34473",
                severity: "High",
                patch_status: "Patched",
                affected_systems: "Exchange Server 2013, 2016, 2019",
                summary: "Auth bypass + relative path confusion + arbitrary file write zinciri ile RCE.",
                description: "ProxyShell zinciri (CVE-2021-34473, CVE-2021-34523, CVE-2021-31207) saldirganin Exchange sunucusunda webshell birakmasini saglar. Aktif istismar gozlemlendi; fidye yazilim gruplari kullandi.",
                published_at: "2021-08-21 00:00:00"
            },
            {
                slug: "solarwinds-orion-supernova",
                title: "SolarWinds Orion SUPERNOVA",
                cve_id: "CVE-2020-10148",
                severity: "Critical",
                patch_status: "Patched",
                affected_systems: "SolarWinds Orion Platform 2019.4 - 2020.2.1 HF1",
                summary: "API kimlik dogrulama bypass'i ve tedarik zinciri saldirisi - SUNBURST kampanyasi.",
                description: "Devlet destekli aktor SolarWinds Orion guncelleme mekanizmasini ele gecirip ABD federal agencies dahil binlerce kurulusa sicrama yapti. Sektorde tedarik zinciri farkindaligi dönum noktasi oldu.",
                published_at: "2020-12-13 00:00:00"
            },
            {
                slug: "openssl-heartbleed",
                title: "OpenSSL Heartbleed",
                cve_id: "CVE-2014-0160",
                severity: "High",
                patch_status: "Patched",
                affected_systems: "OpenSSL 1.0.1 - 1.0.1f",
                summary: "TLS heartbeat uzantisinda bounds check eksikligi - sunucu belleginden 64KB sizinti.",
                description: "Heartbeat istek paketinde belirtilen uzunluk dogrulanmadigi icin sunucu kendi belleginden veri sizdirir. Ozel anahtarlar, sifreler, cookie'ler tehlikeye girer. 2014'te internet capinda yama kampanyasi baslatildi.",
                published_at: "2014-04-07 00:00:00"
            }
        ];

        for (const v of vulns) {
            await conn.execute(
                `INSERT INTO vulnerabilities
                 (slug, title, cve_id, severity, affected_systems, patch_status, summary, description, created_by, published_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [v.slug, v.title, v.cve_id, v.severity, v.affected_systems, v.patch_status, v.summary, v.description, adminId, v.published_at]
            );
        }

        // -------- DUYURULAR --------
        console.log("[seed] duyurular...");
        const ancs = [
            {
                slug: "zero-day-radar-yayinda",
                title: "Zero-Day Radar Yayinda",
                body: "Platform aktif olarak yayindadir. Yeni kesfedilen kritik CVE kayitlari burada listelenir ve takip edilir. Severity filtresi ve patch durumu her kayitta gozukur.",
                is_active: 1
            },
            {
                slug: "subat-2026-kritik-tehdit-ozeti",
                title: "Subat 2026 Kritik Tehdit Ozeti",
                body: "Subat ayinda en cok istismar edilen 5 acigi inceleyen ozet yazi yayinlanmistir. Detaylar zafiyet sayfasinda. Sistem yoneticileri once Critical severity kayitlari incelemelidir.",
                is_active: 1
            },
            {
                slug: "bakim-penceresi-2026-04-15",
                title: "Planli Bakim - 15 Nisan 2026",
                body: "15 Nisan 2026 saat 02:00 - 04:00 (UTC) arasinda planli bakim yapilacaktir. Bu sirada panel kisa sureli erisilemez olabilir; CVE veri girdileri otomatik olarak yeniden yayinlanacaktir.",
                is_active: 1
            },
            {
                slug: "eski-surum-arsiv-notu",
                title: "v1 Arsiv Notu",
                body: "Eski surumde yayinlanan duyurular artik /archive altinda erisilebilir. Bu icerik pasif olarak isaretlenmistir.",
                is_active: 0
            }
        ];

        for (const a of ancs) {
            await conn.execute(
                "INSERT INTO announcements (slug, title, body, is_active, created_by) VALUES (?, ?, ?, ?, ?)",
                [a.slug, a.title, a.body, a.is_active, adminId]
            );
        }

        // -------- GALERI --------
        console.log("[seed] galeri gorselleri uretiliyor...");
        if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

        const samples = [
            { color: [0x10, 0xb9, 0x81], caption: "Patched durum gostergesi (yesil)" },
            { color: [0xf5, 0x9e, 0x0b], caption: "In Progress yamada gostergesi (turuncu)" },
            { color: [0xef, 0x44, 0x44], caption: "Unpatched / Critical gostergesi (kirmizi)" }
        ];

        for (let i = 0; i < samples.length; i++) {
            const s = samples[i];
            const filename = `seed-${Date.now()}-${crypto.randomBytes(6).toString("hex")}.png`;
            const buf = makePng(240, 140, s.color[0], s.color[1], s.color[2]);
            fs.writeFileSync(path.join(UPLOAD_DIR, filename), buf);
            await conn.execute(
                "INSERT INTO gallery (filename, original_name, mime, size_bytes, caption, uploaded_by) VALUES (?, ?, ?, ?, ?, ?)",
                [filename, `seed-${i + 1}.png`, "image/png", buf.length, s.caption, adminId]
            );
        }

        console.log("\n=============================================");
        console.log("[seed] TAMAMLANDI");
        console.log("=============================================");
        console.log("Admin hesabi:");
        console.log("  Email   : admin@zerodayradar.local");
        console.log("  Sifre   : Admin1234!");
        console.log("");
        console.log("Test user:");
        console.log("  Email   : user@example.com");
        console.log("  Sifre   : User1234!");
        console.log("");
        console.log(`Zafiyetler : ${vulns.length}`);
        console.log(`Duyurular  : ${ancs.length} (${ancs.filter(a => a.is_active).length} aktif)`);
        console.log(`Galeri     : ${samples.length} gorsel`);
        console.log("=============================================");
    } finally {
        await conn.end();
    }
}

// Minimum PNG yazici - bagimliliksiz
function makePng(width, height, r, g, b) {
    const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

    const ihdr = Buffer.alloc(13);
    ihdr.writeUInt32BE(width, 0);
    ihdr.writeUInt32BE(height, 4);
    ihdr[8] = 8;   // bit depth
    ihdr[9] = 2;   // color type: RGB
    ihdr[10] = 0;  // compression
    ihdr[11] = 0;  // filter
    ihdr[12] = 0;  // interlace

    // Her satir basinda filter byte (0 = none) + RGB pikseller
    const raw = Buffer.alloc((width * 3 + 1) * height);
    let pos = 0;
    for (let y = 0; y < height; y++) {
        raw[pos++] = 0;
        for (let x = 0; x < width; x++) {
            raw[pos++] = r;
            raw[pos++] = g;
            raw[pos++] = b;
        }
    }
    const compressed = zlib.deflateSync(raw);

    return Buffer.concat([
        sig,
        makeChunk("IHDR", ihdr),
        makeChunk("IDAT", compressed),
        makeChunk("IEND", Buffer.alloc(0))
    ]);
}

function makeChunk(type, data) {
    const length = Buffer.alloc(4);
    length.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, "ascii");
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
    return Buffer.concat([length, typeBuf, data, crc]);
}

function crc32(buf) {
    let crc = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
        crc = crc ^ buf[i];
        for (let j = 0; j < 8; j++) {
            crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
        }
    }
    return (crc ^ 0xffffffff) >>> 0;
}

main().catch((err) => {
    console.error("[seed] HATA:", err);
    process.exit(1);
});
