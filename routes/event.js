const express = require("express");
const router = express.Router();
const db = require("../config/database"); 
const multer = require("multer");
const path = require("path");

// Setup tempat simpan poster (TETAP SAMA)
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/uploads/");
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// ----------------------------------------------------------------
// 1. POST /event/tambah (Perbaikan Notifikasi Admin)
// ----------------------------------------------------------------
// Mengubah handler menjadi async
router.post("/tambah", upload.single("poster"), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: "Gagal mengunggah poster." });
    }
    
    const { nama_event, link_gform } = req.body;
    const poster = req.file.filename;

    const sql = "INSERT INTO events (nama_event, poster, link_gform) VALUES (?, ?, ?)";
    
    try {
        // PERUBAHAN: Menggunakan await dan array destructuring untuk hasil
        const [result] = await db.query(sql, [nama_event, poster, link_gform]);
        
        console.log("✅ Event baru berhasil disimpan!");
        return res.status(201).json({ 
            success: true, 
            message: "Event berhasil disimpan!",
            nama_event: nama_event,
            id: result.insertId
        });

    } catch (err) {
        // Menangkap error database
        console.error("❌ Gagal simpan event:", err);
        return res.status(500).json({ 
            success: false, 
            message: "Gagal menyimpan event ke database. Cek koneksi DB." 
        });
    }
});

// ----------------------------------------------------------------
// 2. GET /event/daftar (Perbaikan Muat Event Jemaat)
// ----------------------------------------------------------------
// Mengubah handler menjadi async
router.get("/daftar", async (req, res) => {
    try {
        // PERUBAHAN: Menggunakan await dan array destructuring
        const [results] = await db.query("SELECT * FROM events ORDER BY id_event DESC"); 
        
        // KIRIM RESPON SUKSES DALAM BENTUK JSON
        return res.json({
            success: true,
            data: results
        });
        
    } catch (err) {
        // Menangkap error database
        console.error("❌ Gagal ambil data event:", err);
        return res.status(500).json({
            success: false,
            message: "Gagal memuat daftar event dari database."
        });
    }
});

module.exports = router;
