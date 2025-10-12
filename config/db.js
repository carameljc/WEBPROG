const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',        // sesuaikan
  password: '',        // sesuaikan
  database: 'gereja_db_uts' // sesuaikan
});

db.connect(err => {
  if (err) {
    console.error('❌ Gagal konek ke database:', err);
  } else {
    console.log('✅ Koneksi ke database MySQL berhasil!');
  }
});

module.exports = db;
