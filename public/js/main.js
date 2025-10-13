// File: public/js/main.js (VERSI PERBAIKAN)

document.addEventListener('DOMContentLoaded', async () => {
    
    // --- Bagian 1: Inisialisasi dan Logika Visibilitas ---
    
    // Sembunyikan semua elemen admin-only dan jemaat-only secara default
    const adminOnlyElements = document.querySelectorAll('.admin-only');
    const jemaatOnlyElements = document.querySelectorAll('.jemaat-only');
    
    // **PENTING: Pastikan semua menu Admin Sembunyi DULU**
    adminOnlyElements.forEach(el => el.style.display = 'none');
    jemaatOnlyElements.forEach(el => el.style.display = 'none');


    function handleRoleVisibility(role) {
        // Tampilkan semua menu non-role spesifik secara default
        
        if (role === 'admin') {
            // Jika Admin, tampilkan menu Admin
            adminOnlyElements.forEach(el => el.style.display = 'inline-block');
            // Sembunyikan menu Jemaat-only jika ada (kecuali di halaman non-admin)
            jemaatOnlyElements.forEach(el => el.style.display = 'none');
            
        } else if (role === 'jemaat') {
            // Jika Jemaat, tampilkan menu Jemaat
            jemaatOnlyElements.forEach(el => el.style.display = 'inline-block');
            // Sembunyikan menu Admin-only
            adminOnlyElements.forEach(el => el.style.display = 'none'); 

        } else {
            // Jika Publik/Belum Login
            adminOnlyElements.forEach(el => el.style.display = 'none');
            jemaatOnlyElements.forEach(el => el.style.display = 'none');
        }
    }


    // --- Bagian 2: Logika Pengecekan Status Login ---

    const body = document.body;
    const loginLink = document.getElementById('login-link');
    const userInfoDiv = document.getElementById('user-info');

    try {
        const response = await fetch('/api/auth/status');
        const data = await response.json();

        if (data.success && data.user) {
            // Jika Berhasil Login
            body.classList.add('logged-in');
            loginLink.style.display = 'none';
            userInfoDiv.style.display = 'block';

            // Panggil fungsi visibilitas role
            handleRoleVisibility(data.user.role); 
            
        } else {
            // Jika Belum Login / Gagal
            body.classList.remove('logged-in');
            loginLink.style.display = 'inline-block';
            userInfoDiv.style.display = 'none';
            
            // Sembunyikan semua menu spesifik
            handleRoleVisibility('public');
        }
    } catch (error) {
        console.error("Gagal memeriksa status login:", error);
        // Tetap sembunyikan semua menu admin jika ada error
        handleRoleVisibility('public'); 
    }

    // --- Bagian 3: Event Listeners dan Panggilan Lain ---

    // Panggil fungsi lain seperti muatGaleriPublik()
    // Anda bisa memindahkan logika muatGaleriPublik() dari main.js ke galeri.html jika itu hanya untuk galeri
    if (typeof muatGaleriPublik === 'function') {
        muatGaleriPublik();
    }


    document.addEventListener('click', async (event) => {
        if (event.target && event.target.id === 'logout-btn') {
            await fetch('/api/auth/logout', { method: 'POST' });
            window.location.href = '/login.html';
        }
    });
});