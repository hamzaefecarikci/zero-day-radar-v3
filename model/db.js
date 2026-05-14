// MySQL baglantisi - PROJE-YAPISI.md sozlesmesi: db.execute(sql, params) -> [rows, fields]
const mysql = require("mysql2");

const connection = mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "zero_day_radar"
});

connection.connect((err) => {
    if (err) {
        console.error("[db] baglanti hatasi:", err.message);
        return;
    }
    console.log("[db] MySQL baglantisi kuruldu:", connection.config.database);
});

module.exports = connection.promise();
