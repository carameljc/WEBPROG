// File: config/db.js
const mysql = require('mysql2');

// 1. Ganti 'createConnection' menjadi 'createPool'
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'gereja_db_uts'
});

// 2. Hapus blok 'db.connect' yang lama

// 3. Ekspor koneksi yang sudah diubah menjadi promise
module.exports = pool.promise();