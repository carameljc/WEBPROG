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
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// ******************************************************
// === HEALTH CHECK ENDPOINT (DITAMBAHKAN DI SINI) ===
// ******************************************************
app.get('/health', (req, res) => {
    // Mengirim respons 200 OK secara instan untuk menandakan server aktif
    res.status(200).json({
        status: 'OK',
        message: 'Aplikasi backend berjalan dengan baik.',
        timestamp: new Date().toISOString()
    });
});
// ******************************************************

// === Koneksi Database (dari folder config)
// Catatan: Jika koneksi DB Anda bersifat sinkron dan menyebabkan penundaan,
// health check di atas akan tetap merespons cepat.
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
app.listen(PORT, () => console.log(`🚀 Server API berjalan di ${PORT}`));