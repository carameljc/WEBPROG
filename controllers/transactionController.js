const db = require('../config/database'); // Sesuaikan jika Anda menggunakan '../config/db'
const { isLoggedIn } = require('../middleware/authMiddleware'); // Pastikan path benar

// =========================================================
// Logika Transaksi: Simpan Multi-Row (Kriteria 5a)
// =========================================================
exports.saveTransaction = async (req, res) => {
    const { items } = req.body; 
    const userId = req.session.user ? req.session.user.id : null; // Ambil user ID dari session
    
    if (!userId) {
        return res.status(401).json({ success: false, message: 'Anda harus login untuk mencatat transaksi.' });
    }
    if (!items || items.length === 0) {
        return res.status(400).json({ success: false, message: 'Minimal harus ada satu item transaksi.' });
    }

    try {
        await db.query('START TRANSACTION'); 

        // 1. Hitung Total dan Insert Header Transaksi
        const totalAmount = items.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
        const headerQuery = 'INSERT INTO transactions (user_id, total_amount, transaction_date) VALUES (?, ?, NOW())';
        const [headerResult] = await db.query(headerQuery, [userId, totalAmount]);
        const transactionId = headerResult.insertId;

        // 2. Insert Multiple Rows (Detail Items) - Kriteria 5a
        const itemQuery = 'INSERT INTO transaction_items (transaction_id, item_description, amount) VALUES (?, ?, ?)';
        
        for (const item of items) {
            await db.query(itemQuery, [transactionId, item.description, item.amount]);
        }
        
        await db.query('COMMIT'); 

        return res.status(201).json({ 
            success: true, 
            message: `Transaksi berhasil disimpan. Total: Rp${totalAmount.toLocaleString('id-ID')}.`,
            id: transactionId
        });

    } catch (error) {
        await db.query('ROLLBACK');
        console.error("Error saat menyimpan transaksi multi-row:", error);
        return res.status(500).json({ success: false, message: 'Gagal menyimpan transaksi.' });
    }
};

// =========================================================
// Logika Laporan: Report & Search/Filter (Kriteria 5b, 5c)
// =========================================================
exports.getReport = async (req, res) => {
    // Kriteria 5c: Search/Filter
    const searchQuery = req.query.q || '';

    let sql = `
        SELECT t.id, t.transaction_date, t.total_amount, u.username
        FROM transactions t
        JOIN users u ON t.user_id = u.id
    `;
    const params = [];

    if (searchQuery) {
        // Mencari berdasarkan total amount atau username
        sql += ` WHERE t.total_amount LIKE ? OR u.username LIKE ?`; 
        params.push(`%${searchQuery}%`, `%${searchQuery}%`);
    }

    sql += ` ORDER BY t.transaction_date DESC`;

    try {
        const [transactions] = await db.query(sql, params);
        
        // Kriteria 5b: Menampilkan Laporan
        return res.json({ success: true, transactions: transactions });

    } catch (error) {
        console.error("Error fetching transaction report:", error);
        return res.status(500).json({ success: false, message: 'Gagal memuat laporan transaksi.' });
    }
};