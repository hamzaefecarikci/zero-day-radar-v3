# Proje Yapısı Şablonu

Bu döküman, bu projedeki klasör/dosya organizasyonunu ve bağlantı şemasını anlatır. Benzer bir Express + EJS + MySQL projesi kurarken aynı kalıbı izlemek için kullanılabilir. Burada yazılı olmayan bir teknoloji veya desen eklenmez.

## Kullanılan Paketler

`package.json` içinde aşağıdaki bağımlılıklar bulunur:

- `express` — HTTP sunucu ve router
- `ejs` — view şablon motoru
- `body-parser` — form POST verilerini almak için
- `express-session` — oturum yönetimi
- `cookie-parser` — cookie okuma/yazma (beni hatırla için)
- `csurf` — CSRF token doğrulama
- `bcrypt` — şifre hash'leme/karşılaştırma
- `mysql2` — MySQL bağlantısı (Promise API ile)
- `node-notifier` ve `dialog-node` — sunucu tarafında masaüstü bildirim/dialog
- `nodemon` — geliştirme sırasında otomatik yeniden başlatma

Çalıştırma komutu: `npm start` (içeride `npx nodemon` çağırır).

## Klasör Yapısı

```
proje-kök/
├── index.js               # Uygulamanın giriş noktası
├── package.json
├── controller/            # İstekleri işleyen fonksiyonlar
│   ├── admin.js
│   ├── auth.js
│   └── user.js
├── router/                # URL → controller eşleştirmesi
│   ├── admin.js
│   ├── auth.js
│   └── user.js
├── middleware/            # Tekrar kullanılan ara katmanlar
│   ├── config_Session.js
│   ├── csrf.js
│   ├── isAuth.js
│   └── locals.js
├── model/                 # Veri erişim katmanı
│   ├── db.js              # MySQL bağlantısı
│   ├── data.js            # Eski in-memory veri (ders notu için)
│   └── authdata.js        # Eski in-memory kullanıcı (ders notu için)
├── messagebox/            # Masaüstü bildirim sarmalayıcıları
│   ├── notifier.js
│   └── dialognode.js
├── views/                 # EJS şablonları
│   ├── admin/
│   ├── auth/
│   ├── user/
│   └── partials/          # header, side, topmenu, scripts
└── public/                # Statik dosyalar (css, js, assets)
```

## index.js — Uygulama Kurulumu

`index.js` aşağıdaki sırayı tek bir yerde uygular:

1. View engine: `app.set("view engine", "ejs")`
2. Statik klasör: `app.use("/static", express.static(path.join(__dirname, "public")))`
3. `bodyParser.urlencoded({ extended: true })`
4. `configSession` (oturum kurulumu)
5. `cookieParser()`
6. `locals` (her view'a `fullname` aktarır)
7. `csurf()` — tüm POST isteklerinde CSRF zorunlu
8. Router'lar: `/admin`, `/user`, `/auth`
9. 404 yakalayıcı: `next("Kaynak yok")`
10. Hata yakalayıcı: `res.render("admin/error.ejs", { err })`
11. `app.listen(3000, ...)`

**Sıralama önemlidir.** `csurf` router'lardan ÖNCE, `cookieParser` ve `configSession`'dan SONRA gelmelidir.

## İstek Akışı

```
istemci → index.js (genel middleware'ler) → router/xxx.js
                                            → [isAuth] → [csrf] → controller/xxx.js
                                                                  → model/db.js (MySQL)
                                                                  → res.render(view, data)
```

## Router Kalıbı

Her router şu yapıyı izler:

```js
const express = require("express");
const router = express.Router();
const xxxController = require("../controller/xxx.js");
const isAuth = require("../middleware/isAuth.js");
const csrf = require("../middleware/csrf.js");

router.get("/yol", isAuth, csrf, xxxController.fonksiyon);   // form sayfası
router.post("/yol", isAuth, xxxController.postFonksiyon);    // form gönderimi

module.exports = router;
```

**Kural:** `csrf` middleware'i SADECE form render eden GET route'larına eklenir. POST route'larına eklenmez (CSRF doğrulaması zaten `csurf()` tarafından genel olarak yapılır).

## CSRF Kullanımı — İki Katmanlı

1. `index.js`'deki `app.use(csurf())` her POST isteğinde `_csrf` alanını/header'ını doğrular.
2. `middleware/csrf.js` SADECE `res.locals.csrfToken = req.csrfToken()` atar — böylece view'a parametre olarak göndermek gerekmez.

EJS form'larında her zaman:

```html
<form method="POST" action="...">
    <input type="hidden" name="_csrf" value="<%= csrfToken %>">
    ...
</form>
```

## Controller Kalıbı

Controller dosyaları, her route için bir fonksiyon export eder. Şablon:

```js
const db = require("../model/db");

exports.fonksiyonAdi = async (req, res, next) => {
    try {
        const result = await db.execute("SELECT ... WHERE x=?", [req.params.id]);
        res.render("klasor/sablon", {
            title: "...",
            contentTitle: "...",
            data: result[0]            // satır listesi
        });
    } catch (err) {
        return next(err);              // hata global handler'a düşer
    }
};
```

**Render parametre sözleşmesi:** her view'a en az `title`, `contentTitle` aktarılır. Liste için `data`, tek kayıt için `viewData` kullanılır.

## Model Katmanı — model/db.js

Tek bir MySQL bağlantısı oluşturulur ve `.promise()` ile dışa aktarılır:

```js
const mysql = require("mysql2");
let connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'veritabani_adi'
});
connection.connect(err => { if (err) return console.log(err); });
module.exports = connection.promise();
```

**`mysql2` sonuç şekli:** `db.execute(sql, params)` `[rows, fields]` döner.

- Satır listesi: `result[0]`
- İlk satır: `result[0][0]`
- Bu sözleşmeye tüm controller'lar bağlıdır; değiştirilmemelidir.

## Middleware Katmanı

### middleware/config_Session.js

`express-session` ayarları:

- `secret`: rastgele GUID
- `resave: false`, `saveUninitialized: false`
- `cookie.maxAge`: ms cinsinden ömür

Modül, hazır middleware'i export eder ve `index.js` doğrudan `app.use` ile takar.

### middleware/isAuth.js

`req.session.isAuth` yoksa `/auth/login?url=<orijinal-url>` adresine yönlendirir. Login başarılı olduğunda controller `req.query.url`'i okuyup oraya geri döner.

### middleware/csrf.js

Sadece `res.locals.csrfToken` atar. (Yukarıda anlatıldı.)

### middleware/locals.js

`res.locals.fullname = req.session.fullname` atar — header partial'ı bu değişkene bakar.

## View Katmanı (EJS)

- Sayfalar üç klasöre ayrılır: `views/admin/`, `views/auth/`, `views/user/`.
- Ortak parçalar `views/partials/` altındadır: `header.ejs`, `topmenu.ejs`, `side.ejs`, `scripts.ejs`. Sayfalar bunları `<%- include('../partials/...') %>` ile dahil eder.
- Hata sayfası: `views/admin/error.ejs` — `err` değişkenini gösterir.

## Auth Akışı

1. `GET /auth/login` → `controller/auth.js` `getLogin`: cookie'den email/password okur (beni hatırla), `req.session.message` varsa gösterir, login view'ı render eder.
2. `POST /auth/login` → `postLogin`: `users` tablosundan email ile sorgular, `bcrypt.compare` ile şifre eşleşmesini kontrol eder. Başarılıysa session'a `isAuth`, `fullname`, `userid` yazar; `req.query.url` varsa oraya yoksa varsayılan iç sayfaya yönlendirir.
3. "Beni hatırla" işaretliyse email/password cookie olarak yazılır; işaret kaldırılmışsa eski cookie'ler temizlenir.
4. `GET /auth/signout` → `req.session.destroy()` ve `/auth/login`'e dön.

## Veritabanı Şeması (Bu Projedeki Sorgulardan Çıkarsanan)

İki tablo bekleniyor:

- `users(userid, email, password, name, surname)` — `password` bcrypt hash olarak saklanır.
- `anc(noticeid, title, exp, isactive, userid)` — `userid` FK olarak `users.userid`.

Benzer bir proje yaparken kendi tablolarınızı tasarlayın; ancak controller'larda `db.execute(sql, [...])` çağrı şeklini aynen koruyun.

## messagebox/ Kullanımı

Sunucu tarafında masaüstü bildirim açar. Sadece masaüstü işletim sisteminde çalışır, headless ortamda atlanmalıdır.

- `notifier.js` — `node-notifier` ile toast bildirim.
- `dialognode.js` — `dialog-node` ile bloklayan dialog.

Controller'da kullanım:

```js
const notifierShow = require("../messagebox/notifier.js");
notifierShow("Uyarı", "İşlem başarılı.", () => { res.redirect("..."); });
```

## Yeni Bir Modül Eklerken Adımlar

Aynı şablona sadık kalmak için sırasıyla:

1. `model/` — gerekiyorsa yeni sorgular için yardımcı yok; controller doğrudan `db.execute` çağırır.
2. `controller/<isim>.js` — her route için bir `exports.fn` yaz; async + try/catch + `next(err)` deseni.
3. `router/<isim>.js` — GET form sayfasına `csrf` middleware'ini ekle; korunması gereken her route'a `isAuth` ekle.
4. `views/<isim>/` — yeni EJS şablonları; partial'ları include et; form'larda `_csrf` hidden input'unu unutma.
5. `index.js` — yeni router'ı `app.use("/<önek>", yeniRouter)` ile bağla.

## Dil ve Stil

- Kullanıcıya görünen tüm metinler Türkçedir.
- Kod yorumları Türkçedir; değişken adları İngilizce + Türkçe karışıktır (`anc`, `noticeid`, `cbhatirla`...). Mevcut tarzı koruyun.
