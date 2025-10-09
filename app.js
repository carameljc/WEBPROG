const express = require('express');
const path = require('path');
const session = require('express-session');
const cors = require('cors');
require('dotenv').config();

const app = express();

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

// Mengimpor file Rute yang dibutuhkan
const authRoutes = require('./routes/auth');
const jemaatRoutes = require('./routes/jemaat');

// Menggunakan Rute dengan prefix
app.use('/api/auth', authRoutes);
app.use('/api/jemaat', jemaatRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server API berjalan di http://localhost:${PORT}`));
