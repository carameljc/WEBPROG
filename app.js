const express = require('express');
const path = require('path');
const session = require('express-session');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware dasar
// ----------------------------------------------------------------

// 1. CORS Configuration: Mengaktifkan CORS (sesuai kebutuhan Front-End/Development)
app.use(cors({ 
    origin: 'null', // Ganti dengan URL frontend Anda saat deployment atau 'http://localhost:5173' saat testing
    credentials: true 
}));

// 2. Parsing Body: Untuk menangani data JSON dan URL-encoded dari request
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Static File Serving: Memastikan browser dapat mengakses file statis
app.use(express.static(path.join(__dirname, 'public')));

// 4. STATIC FILE KHUSUS MEDIA: Memastikan folder 'galleryMedia' dapat diakses browser
app.use('/galleryMedia', express.static(path.join(__dirname, 'public', 'galleryMedia')));

// 5. Session Middleware: Diperlukan untuk otentikasi (login/logout)
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // secure: false untuk development (HTTP)
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
// ✅ BARU: Import Route Merchandise
const merchRoutes = require('./routes/merch');

// Gunakan Routes (Pastikan semua route terdaftar)
// ----------------------------------------------------------------
app.use('/api/auth', authRoutes);
app.use('/api/jemaat', jemaatRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/kritik', kritikRoutes);
app.use('/api/event', eventRoutes); 
app.use('/api/transaction', transactionRoutes); 
// ✅ BARU: Gunakan Route Merchandise
app.use('/api/merch', merchRoutes);

const PORT = process.env.PORT || 30297;
app.listen(PORT, () => console.log(`🚀 Server API berjalan di http://localhost:${PORT}`));