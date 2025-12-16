// routes/merch.js

const express = require('express');
const router = express.Router();
const merchController = require('../controllers/merchController');
const { isLoggedIn, isAdmin } = require('../middleware/authMiddleware'); // Asumsi middleware
const upload = require('../config/multerConfig'); // BARU: Import Multer

// 1. GET /products: Daftar semua merchandise (Publik/Jemaat)
router.get('/products', merchController.getProducts);

// BARU: GET /products/:id: Ambil data satu produk untuk Edit
router.get('/products/:id', merchController.getProductById); 

// 2. POST /checkout: Menyimpan transaksi penjualan dan mengurangi stok (Jemaat)
router.post('/checkout', isLoggedIn, merchController.checkout);

// 3. GET /report: Laporan Penjualan (Admin Only)
router.get('/report', isAdmin, merchController.getSalesReport);

// 4. CRUD Produk (Admin Only) - Tambahkan Multer middleware
router.post('/product', isAdmin, upload.single('imageFile'), merchController.createProduct); // DIGANTI
router.put('/product/:id', isAdmin, upload.single('imageFile'), merchController.updateProduct); // DIGANTI
router.delete('/product/:id', isAdmin, merchController.deleteProduct);

module.exports = router;