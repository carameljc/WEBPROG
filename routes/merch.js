// routes/merch.js

const express = require('express');
const router = express.Router();
const merchController = require('../controllers/merchController');
const { isLoggedIn, isAdmin } = require('../middleware/authMiddleware'); // Asumsi middleware

// 1. GET /products: Daftar semua merchandise (Publik/Jemaat)
router.get('/products', merchController.getProducts);

// 2. POST /checkout: Menyimpan transaksi penjualan dan mengurangi stok (Jemaat)
router.post('/checkout', isLoggedIn, merchController.checkout);

// 3. GET /report: Laporan Penjualan (Admin Only)
router.get('/report', isAdmin, merchController.getSalesReport);

// 4. CRUD Produk (Admin Only) - Opsional, untuk manajemen stok/harga
// router.post('/product', isAdmin, merchController.createProduct);
// router.put('/product/:id', isAdmin, merchController.updateProduct);

module.exports = router;