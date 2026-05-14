const db = require("../model/db");
const onlineTracker = require("../middleware/onlineTracker.js");

// GET /api/stats - ziyaretci ve online sayilari
exports.summary = async (req, res, next) => {
    try {
        const today = new Date().toISOString().slice(0, 10);
        const totalRes = await db.execute("SELECT COUNT(*) AS c FROM ip_visits");
        const todayRes = await db.execute(
            "SELECT COUNT(*) AS c FROM ip_visits WHERE visit_date = ?",
            [today]
        );

        res.json({
            total_visits: totalRes[0][0].c,
            today_visits: todayRes[0][0].c,
            online: onlineTracker.count()
        });
    } catch (err) {
        return next(err);
    }
};
