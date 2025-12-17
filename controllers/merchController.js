// controllers/merchController.js

const db = require('../config/database'); 
const path = require('path'); 

// =========================================================
// 1. GET Products (Toko Jemaat & Admin List) 
// =========================================================
exports.getProducts = async (req, res) => {
    try {
        const [products] = await db.query('SELECT id, name, description, price, stock, image_url AS imageUrl FROM merchandise_products ORDER BY name');
        res.json({ success: true, data: products });
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ success: false, message: 'Gagal memuat daftar produk dari database.' });
    }
};

// BARU: GET Product By ID (Untuk Fitur Edit)
exports.getProductById = async (req, res) => {
    const { id } = req.params;
    try {
        const [product] = await db.query('SELECT id, name, description, price, stock, image_url AS imageUrl FROM merchandise_products WHERE id = ?', [id]);
        if (product.length === 0) {
            return res.status(404).json({ success: false, message: 'Produk tidak ditemukan.' });
        }
        res.json({ success: true, data: product[0] }); 
    } catch (error) {
        console.error("Error fetching product by ID:", error);
        res.status(500).json({ success: false, message: 'Gagal mengambil data produk.' });
    }
};

// =========================================================
// 2. Checkout & Pengurangan Stok (Kritis) - Tidak Diubah
// =========================================================
exports.checkout = async (req, res) => {
    // items: array of { product_id, quantity, price_at_sale }
    const { items } = req.body; 
    const userId = req.session.user ? req.session.user.id : null;
    
    if (!userId) {
        return res.status(401).json({ success: false, message: 'Anda harus login untuk checkout.' });
    }
    if (!items || items.length === 0) {
        return res.status(400).json({ success: false, message: 'Keranjang belanja kosong.' });
    }

    try {
        await db.query('START TRANSACTION'); 

        let totalAmount = 0;

        // 1. Validasi Stok dan Hitung Total
        for (const item of items) {
            const [product] = await db.query('SELECT stock, price FROM merchandise_products WHERE id = ?', [item.product_id]);
            
            if (product.length === 0) throw new Error(`Produk ID ${item.product_id} tidak ditemukan.`);
            if (product[0].stock < item.quantity) throw new Error(`Stok produk tidak mencukupi.`);
            
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
        
        await db.query('COMMIT'); 

        return res.status(201).json({ success: true, message: 'Checkout berhasil! Stok produk telah diperbarui.' });

    } catch (error) {
        await db.query('ROLLBACK'); 
        console.error("Error during checkout/stock update:", error);
        return res.status(500).json({ success: false, message: error.message || 'Gagal memproses checkout due to server error.' });
    }
};

// =========================================================
// 3. Laporan Penjualan (Admin Only) - Tidak Diubah
// =========================================================
exports.getSalesReport = async (req, res) => {
    
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
        res.status(500).json({ success: false, message: 'Gagal memuat laporan penjualan.' });
    }
};

// =========================================================
// 4. CRUD Produk (Admin Only) - IMPLEMENTASI MULTER
// =========================================================

// Tambah Produk Baru (CREATE)
exports.createProduct = async (req, res) => {
    const { name, description, price, stock } = req.body;
    const imageUrl = req.file ? path.basename(req.file.filename) : null; 
    
    if (!name || !price || !stock) {
        return res.status(400).json({ success: false, message: 'Nama, Harga, dan Stok wajib diisi.' });
    }

    const query = 'INSERT INTO merchandise_products (name, description, price, stock, image_url) VALUES (?, ?, ?, ?, ?)';
    try {
        const [result] = await db.query(query, [name, description, price, stock, imageUrl]);
        res.status(201).json({ 
            success: true, 
            message: 'Produk berhasil ditambahkan.',
            id: result.insertId
        });
    } catch (error) {
        console.error("Error creating product:", error);
        res.status(500).json({ success: false, message: 'Gagal menambahkan produk ke database.' });
    }
};

// Edit/Update Produk (UPDATE)
exports.updateProduct = async (req, res) => {
    const { id } = req.params;
    const { name, description, price, stock, existingImageUrl } = req.body;
    
    // Tentukan URL gambar baru: jika ada file baru diupload, ambil namanya. Jika tidak, gunakan yang lama.
    const newImageUrl = req.file ? path.basename(req.file.filename) : existingImageUrl; 
    
    const fields = [];
    const values = [];

    if (name) { fields.push('name = ?'); values.push(name); }
    if (description) { fields.push('description = ?'); values.push(description); }
    if (price) { fields.push('price = ?'); values.push(price); }
    if (stock) { fields.push('stock = ?'); values.push(stock); }
    
    // Update image_url hanya jika ada perubahan/file baru
    if (newImageUrl !== existingImageUrl) { fields.push('image_url = ?'); values.push(newImageUrl); }

    if (fields.length === 0) {
        return res.status(400).json({ success: false, message: 'Tidak ada data yang dikirim untuk diupdate.' });
    }

    values.push(id); 
    const query = `UPDATE merchandise_products SET ${fields.join(', ')} WHERE id = ?`;

    try {
        const [result] = await db.query(query, values);
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Produk tidak ditemukan atau tidak ada perubahan.' });
        }
        res.status(200).json({ success: true, message: 'Produk berhasil diupdate.' });
    } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).json({ success: false, message: 'Gagal mengupdate produk di database.' });
    }
};

// Hapus Produk (DELETE)
exports.deleteProduct = async (req, res) => {
    const { id } = req.params;
    
    const query = 'DELETE FROM merchandise_products WHERE id = ?';
    try {
        const [result] = await db.query(query, [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Produk tidak ditemukan.' });
        }
        res.status(200).json({ success: true, message: 'Produk berhasil dihapus.' });
    } catch (error) {
        console.error("Error deleting product:", error);
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
             return res.status(409).json({ success: false, message: 'Gagal menghapus produk karena masih terikat dengan transaksi penjualan.' });
        }
        res.status(500).json({ success: false, message: 'Gagal menghapus produk.' });
    }
};