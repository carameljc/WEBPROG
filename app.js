const express = require('express');
const path = require('path');
const session = require('express-session');
const cors = require('cors');
require('dotenv').config();

const app = express();

// 🛑 DEBUGGING KRITIS (Hapus setelah masalah teratasi)
console.log('----------------------------------------------------');
console.log('LOKASI SERVER (__dirname):', __dirname);
console.log('LOKASI FOLDER EVENT: ' + path.resolve(__dirname, 'public', 'eventPosters'));
console.log('----------------------------------------------------');


// ----------------------------------------------------------------
// 💡 STATIC FILE SERVING (Dipindahkan ke atas untuk prioritas)
// ----------------------------------------------------------------

// 1. Static File Serving Standard (Akses ke public/ untuk HTML/CSS/JS)
app.use(express.static(path.join(__dirname, 'public')));

// 2. STATIC FILE KHUSUS MEDIA
app.use('/galleryMedia', express.static(path.join(__dirname, 'public', 'galleryMedia')));

// 3. PERBAIKAN KRITIS STATIC FILE KHUSUS EVENT: Endpoint untuk poster event
// Menggunakan path.resolve untuk mendapatkan path absolut yang tegas di semua OS.
app.use('/eventPosters', express.static(path.resolve(__dirname, 'public', 'eventPosters')));


// Middleware dasar
// ----------------------------------------------------------------

// 1. CORS Configuration: Mengaktifkan CORS (sesuai kebutuhan Front-End/Development)
app.use(cors({ 
    origin: 'null', 
    credentials: true 
}));

// 2. Parsing Body: Untuk menangani data JSON dan URL-encoded dari request
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 5. Session Middleware: Diperlukan untuk otentikasi (login/logout)
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } 
}));

// Health Check Endpoint (Berguna untuk testing deployment)
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'Aplikasi backend berjalan dengan baik.',
        timestamp: new Date().toISOString()
    });
});

// Koneksi Database (dari folder config)
const db = require('./config/db'); 

// Import Routes
// ----------------------------------------------------------------
const authRoutes = require('./routes/auth');
const jemaatRoutes = require('./routes/jemaat');
const galleryRoutes = require('./routes/gallery');
const kritikRoutes = require('./routes/kritik');
const eventRoutes = require('./routes/event');
const transactionRoutes = require('./routes/transaction'); 
const merchRoutes = require('./routes/merch');

// Gunakan Routes (Pastikan semua route terdaftar)
// ----------------------------------------------------------------
app.use('/api/auth', authRoutes);
app.use('/api/jemaat', jemaatRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/kritik', kritikRoutes);
app.use('/api/event', eventRoutes); 
app.use('/api/transaction', transactionRoutes); 
app.use('/api/merch', merchRoutes);

const PORT = process.env.PORT || 30297;
app.listen(PORT, () => console.log(`🚀 Server API berjalan di http://localhost:${PORT}`));