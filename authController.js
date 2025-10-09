const db = require('../config/database');
const bcrypt = require('bcryptjs');

exports.register = async (req, res) => {
    const { nama_lengkap, username, password, role = 'jemaat' } = req.body;
    if (!nama_lengkap || !username || !password) {
        return res.status(400).json({ message: 'Semua field wajib diisi.' });
    }
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const query = 'INSERT INTO users (nama_lengkap, username, password, role) VALUES (?, ?, ?, ?)';
        const [result] = await db.query(query, [nama_lengkap, username, hashedPassword, role]);
        const newUserId = result.insertId;

        await db.query('INSERT INTO master_jemaat (nama_lengkap, user_id) VALUES (?, ?)', [nama_lengkap, newUserId]);

        res.status(201).json({ message: 'Registrasi berhasil! Silakan login.' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Username sudah digunakan.' });
        }
        res.status(500).json({ message: 'Server error saat registrasi.' });
    }
};

exports.login = async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Username dan password wajib diisi' });
    }
    try {
        const [users] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
        if (users.length === 0) {
            return res.status(401).json({ success: false, message: 'Username atau password salah' });
        }
        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Username atau password salah' });
        }
        req.session.user = { id: user.id, username: user.username, role: user.role, nama_lengkap: user.nama_lengkap };
        res.json({ success: true, user: req.session.user });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.status = (req, res) => {
    if (req.session.user) {
        res.json({ success: true, user: req.session.user });
    } else {
        res.json({ success: false });
    }
};

exports.logout = (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Gagal logout' });
        }
        res.clearCookie('connect.sid');
        res.json({ success: true, message: 'Anda berhasil logout' });
    });
};
