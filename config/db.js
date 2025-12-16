// File: config/db.js - Menggunakan createConnection (Paling Dasar)
const mysql = require('mysql2');

// Membuat fungsi untuk mendapatkan koneksi baru setiap kali
const getConnection = () => {
    // Membuat koneksi baru yang bisa menggunakan Promise
    const connection = mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'gereja_db_uts'
    }).promise();
    
    return connection;
};

// Objek yang kita ekspor harus memiliki fungsi query() dan getConnection()
module.exports = {
    // Digunakan untuk GET queries (seperti /daftar)
    query: async (sql, params) => {
        const conn = getConnection();
        try {
            const [results] = await conn.execute(sql, params);
            return [results];
        } finally {
            await conn.end(); // Tutup koneksi setelah selesai
        }
    },
    // Digunakan untuk INSERT/UPDATE yang butuh transaksi
    getConnection: getConnection 
};