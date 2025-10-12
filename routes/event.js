const express = require("express");
const router = express.Router();
const db = require("../config/db");
const multer = require("multer");
const path = require("path");

// Setup tempat simpan poster
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// POST /event/tambah
router.post("/tambah", upload.single("poster"), (req, res) => {
  const { nama_event, link_gform } = req.body;
  const poster = req.file ? req.file.filename : null;

  const sql = "INSERT INTO events (nama_event, poster, link_gform) VALUES (?, ?, ?)";
  db.query(sql, [nama_event, poster, link_gform], (err) => {
    if (err) {
      console.error("❌ Gagal simpan event:", err);
      res.status(500).send("Gagal menyimpan event.");
    } else {
      console.log("✅ Event baru berhasil disimpan!");
      res.send("Event berhasil disimpan ke database.");
    }
  });
});

// Tambah di routes/event.js
router.get("/daftar", (req, res) => {
  db.query("SELECT * FROM events", (err, results) => {
    if (err) {
      console.error("❌ Gagal ambil data event:", err);
      res.status(500).send("Gagal ambil data event.");
    } else {
      res.json(results);
    }
  });
});


module.exports = router;
