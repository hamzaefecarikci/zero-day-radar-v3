// Sunucu giris noktasi - app'i ayri tutup test'lerden import edilebilir kildik.
const app = require("./app.js");

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => {
    console.log(`[server] http://localhost:${PORT}`);
});
