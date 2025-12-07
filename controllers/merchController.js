// controllers/merchController.js

const db = require('../config/database'); 

// =========================================================
// 1. GET Products (Toko Jemaat)
// =========================================================
exports.getProducts = async (req, res) => {
    try {
        // Ambil semua produk yang stoknya > 0 (atau semuanya jika diperlukan)
        const [products] = await db.query('SELECT * FROM merchandise_products ORDER BY name');
        res.json(products);
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ message: 'Gagal memuat daftar produk.' });
    }
};

// =========================================================
// 2. Checkout & Pengurangan Stok (Kritis)
// =========================================================
exports.checkout = async (req, res) => {
    // items: array of { product_id, quantity, price_at_sale }
    const { items } = req.body; 
    const userId = req.session.user ? req.session.user.id : null;
    
    if (!userId) {
        return res.status(401).json({ message: 'Anda harus login untuk checkout.' });
    }
    if (!items || items.length === 0) {
        return res.status(400).json({ message: 'Keranjang belanja kosong.' });
    }

    try {
        await db.query('START TRANSACTION'); // KRITIS: Memastikan stok dan penjualan sinkron

        let totalAmount = 0;

        // 1. Validasi Stok dan Hitung Total
        for (const item of items) {
            const [product] = await db.query('SELECT stock, price FROM merchandise_products WHERE id = ?', [item.product_id]);
            
            if (product.length === 0) throw new Error(`Produk ID ${item.product_id} tidak ditemukan.`);
            if (product[0].stock < item.quantity) throw new Error(`Stok ${product[0].name} tidak mencukupi.`);
            
            totalAmount += product[0].price * item.quantity;
        }

        // 2. Insert Header Transaksi Penjualan
        const headerQuery = 'INSERT INTO sales_transactions (user_id, total_paid, transaction_date, status) VALUES (?, ?, NOW(), ?)';
        const [headerResult] = await db.query(headerQuery, [userId, totalAmount, 'PAID']);
        const salesId = headerResult.insertId;

        // 3. Insert Detail Item dan Kurangi Stok
        const itemQuery = 'INSERT INTO sales_items (sales_id, product_id, quantity, price_at_sale) VALUES (?, ?, ?, ?)';
        const updateStockQuery = 'UPDATE merchandise_products SET stock = stock - ? WHERE id = ?';

        for (const item of items) {
            // Insert Detail Item
            await db.query(itemQuery, [salesId, item.product_id, item.quantity, item.price_at_sale]);
            
            // Kurangi Stok (KRITIS)
            await db.query(updateStockQuery, [item.quantity, item.product_id]);
        }
        
        await db.query('COMMIT'); // Commit setelah semua sukses

        return res.status(201).json({ success: true, message: 'Checkout berhasil! Stok produk telah diperbarui.' });

    } catch (error) {
        await db.query('ROLLBACK'); // Rollback jika ada error stok/DB
        console.error("Error during checkout/stock update:", error);
        return res.status(500).json({ message: error.message || 'Gagal memproses checkout due to server error.' });
    }
};

// =========================================================
// 3. Laporan Penjualan (Admin Only)
// =========================================================
exports.getSalesReport = async (req, res) => {
    // Logika untuk Laporan Penjualan (Hanya untuk Admin)
    // Ini harus JOIN tabel sales_transactions, sales_items, dan merchandise_products
    
    const sql = `
        SELECT
            st.id AS sales_id,
            st.transaction_date,
            st.total_paid,
            u.username,
            GROUP_CONCAT(CONCAT(si.quantity, 'x ', mp.name, ' (@', si.price_at_sale, ')') SEPARATOR '; ') AS items_sold
        FROM sales_transactions st
        JOIN users u ON st.user_id = u.id
        JOIN sales_items si ON st.id = si.sales_id
        JOIN merchandise_products mp ON si.product_id = mp.id
        GROUP BY st.id
        ORDER BY st.transaction_date DESC
    `;

    try {
        const [report] = await db.query(sql);
        res.json({ success: true, data: report });
    } catch (error) {
        console.error("Error fetching sales report:", error);
        res.status(500).json({ message: 'Gagal memuat laporan penjualan.' });
    }
};