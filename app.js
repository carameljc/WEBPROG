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

// === Koneksi Database (dari folder config)
const db = require('./config/db');

// === Import routes ===
const eventRoutes = require('./routes/event');
app.use('/api/event', eventRoutes);

const authRoutes = require('./routes/auth');
const jemaatRoutes = require('./routes/jemaat');
app.use('/api/auth', authRoutes);
app.use('/api/jemaat', jemaatRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server API berjalan di http://localhost:${PORT}`));
