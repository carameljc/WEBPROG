const express = require('express');
const router = express.Router();
// Pastikan path ini benar!
const transactionController = require('../controllers/transactionController'); 
const { isLoggedIn } = require('../middleware/authMiddleware'); // Pastikan middleware ini tersedia

// [a] Simpan Transaksi (Multiple Rows)
router.post('/save', isLoggedIn, transactionController.saveTransaction);

// [b], [c] Lihat Laporan Transaksi (Report, Search, Filter, Print)
// ERROR DIPERBAIKI: transactionController.getReport sekarang pasti function
router.get('/report', isLoggedIn, transactionController.getReport);

module.exports = router;