const db = require('../config/database');

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
