const db = require('../config/database');

// ==========================================================
// FUNGSI ADMIN (CRUD)
// ==========================================================

exports.getAllJemaat = async (req, res) => {
    try {
        const [jemaat] = await db.query('SELECT * FROM master_jemaat ORDER BY nama_lengkap ASC');
        res.json(jemaat);
    } catch (error) { res.status(500).json({ message: 'Server Error' }); }
};

exports.createJemaat = async (req, res) => {
    const { nama_lengkap, alamat, nomor_telepon, tanggal_lahir, jenis_kelamin } = req.body;
    if (!nama_lengkap) { return res.status(400).json({ message: 'Nama lengkap wajib diisi' }); }
    try {
        const query = 'INSERT INTO master_jemaat (nama_lengkap, alamat, nomor_telepon, tanggal_lahir, jenis_kelamin) VALUES (?, ?, ?, ?, ?)';
        await db.query(query, [nama_lengkap, alamat, nomor_telepon, tanggal_lahir, jenis_kelamin]);
        res.status(201).json({ message: 'Data jemaat berhasil ditambahkan' });
    } catch (error) { res.status(500).json({ message: 'Server Error' }); }
};

exports.updateJemaat = async (req, res) => {
    const { id } = req.params;
    const { nama_lengkap, alamat, nomor_telepon, tanggal_lahir, jenis_kelamin } = req.body;
    if (!nama_lengkap) { return res.status(400).json({ message: 'Nama lengkap wajib diisi' }); }
    try {
        const query = 'UPDATE master_jemaat SET nama_lengkap = ?, alamat = ?, nomor_telepon = ?, tanggal_lahir = ?, jenis_kelamin = ? WHERE id = ?';
        await db.query(query, [nama_lengkap, alamat, nomor_telepon, tanggal_lahir, jenis_kelamin, id]);
        res.json({ message: 'Data jemaat berhasil diperbarui' });
    } catch (error) { res.status(500).json({ message: 'Server Error' }); }
};

exports.deleteJemaat = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM master_jemaat WHERE id = ?', [id]);
        res.json({ message: 'Data jemaat berhasil dihapus' });
    } catch (error) { res.status(500).json({ message: 'Server Error' }); }
};


// ==========================================================
// FUNGSI PROFIL JEMAAT (Modul 'Profil Saya' - Read & Update)
// ==========================================================

// 1. Mendapatkan data profil jemaat yang sedang login (READ)
exports.getJemaatProfile = async (req, res) => {
    const userId = req.session.user.id;
    try {
        // Mencari data di master_jemaat berdasarkan user_id dari sesi
        const [jemaat] = await db.query('SELECT * FROM master_jemaat WHERE user_id = ?', [userId]);
        if (jemaat.length === 0) {
            return res.status(404).json({ message: 'Data profil tidak ditemukan.' });
        }
        res.json(jemaat[0]);
    } catch (error) {
        res.status(500).json({ message: 'Server Error saat memuat profil.' });
    }
};

// 2. Memperbarui data profil jemaat yang sedang login (UPDATE)
exports.updateJemaatProfile = async (req, res) => {
    const userId = req.session.user.id;
    const { 
        nama_lengkap, alamat, nomor_telepon, tempat_lahir, 
        tanggal_lahir, jenis_kelamin, email, foto_profile_url 
    } = req.body;
    
    if (!nama_lengkap) { 
        return res.status(400).json({ message: 'Nama lengkap wajib diisi.' }); 
    }
    
    try {
        const query = `
            UPDATE master_jemaat SET 
            nama_lengkap = ?, alamat = ?, nomor_telepon = ?, tempat_lahir = ?,
            tanggal_lahir = ?, jenis_kelamin = ?, email = ?, foto_profile_url = ?
            WHERE user_id = ?
        `;
        
        await db.query(query, [
            nama_lengkap, alamat, nomor_telepon, tempat_lahir, 
            tanggal_lahir, jenis_kelamin, email, foto_profile_url, 
            userId
        ]);
        
        // Memperbarui sesi agar nama di navigasi ikut terupdate (Opsional, tapi direkomendasikan)
        if (req.session.user) {
             req.session.user.nama_lengkap = nama_lengkap;
        }

        res.json({ message: 'Profil berhasil diperbarui!' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error saat memperbarui profil.' });
    }
};