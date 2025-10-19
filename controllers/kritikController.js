// File: controllers/kritikController.js (Versi PostgreSQL)
const db = require('../config/database');

exports.createKritik = async (req, res) => {
    const { isi_saran } = req.body;
    if (!isi_saran) {
        return res.status(400).json({ message: 'Kritik dan saran tidak boleh kosong.' });
    }
    // UBAH: Menggunakan placeholder $1
    const query = 'INSERT INTO kritik_saran (isi_saran) VALUES ($1)';
    try {
        await db.query(query, [isi_saran]);
        res.status(201).json({ message: 'Terima kasih, masukan Anda telah kami terima.' });
    } catch (err) {
        console.error("Database Error:", err);
        res.status(500).json({ message: 'Server Error saat menyimpan masukan.' });
    }
};

exports.getAllKritik = async (req, res) => {
    const query = 'SELECT id_saran, isi_saran, tanggal_kirim FROM kritik_saran ORDER BY tanggal_kirim DESC';
    try {
        // UBAH: Cara mengambil hasil
        const result = await db.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error("Database Error:", err);
        res.status(500).json({ message: 'Server Error saat mengambil data.' });
    }
};