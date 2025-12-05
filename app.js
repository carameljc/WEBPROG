// app.js (MODIFIKASI KRITIS UNTUK PATH FILE)

const express = require('express');
const path = require('path');
const session = require('express-session');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware dasar
app.use(cors({ origin: 'null', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Menyajikan file statis dari folder 'public' (misal: CSS, JS, HTML)
app.use(express.static(path.join(__dirname, 'public')));

// ✅ BARIS TAMBAHAN KRITIS UNTUK GALERI MEDIA:
// Menyajikan folder 'public/galleryMedia' agar bisa diakses browser melalui URL /galleryMedia/
app.use('/galleryMedia', express.static(path.join(__dirname, 'public', 'galleryMedia')));

// Middleware Session
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// ******************************************************
// === HEALTH CHECK ENDPOINT ===
// ******************************************************
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'Aplikasi backend berjalan dengan baik.',
        timestamp: new Date().toISOString()
    });
});
// ******************************************************

// === Koneksi Database (dari folder config)
const db = require('./config/db'); 

// === Import routes ===
const eventRoutes = require('./routes/event');
app.use('/api/event', eventRoutes);

const authRoutes = require('./routes/auth');
const jemaatRoutes = require('./routes/jemaat');
const galleryRoutes = require('./routes/gallery');
const kritikRoutes = require('./routes/kritik');

// === Gunakan routes ===
app.use('/api/auth', authRoutes);
app.use('/api/jemaat', jemaatRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/kritik', kritikRoutes);

const PORT = process.env.PORT || 30297;
app.listen(PORT, () => console.log(`🚀 Server API berjalan di http://localhost:${PORT}`));