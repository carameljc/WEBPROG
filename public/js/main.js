// File: public/js/main.js
document.addEventListener('DOMContentLoaded', async () => {
    // Definisi fungsi
    function handleRoleVisibility(role) {
        const adminOnlyElements = document.querySelectorAll('.admin-only');
        const jemaatOnlyElements = document.querySelectorAll('.jemaat-only');
        const publicContent = document.getElementById('public-content');
        const adminContent = document.getElementById('admin-content');
        const jemaatContent = document.getElementById('jemaat-content');

        // Sembunyikan semua konten spesifik terlebih dahulu
        adminContent.style.display = 'none';
        jemaatContent.style.display = 'none';
        publicContent.style.display = 'none';

        if (role === 'admin') {
            adminOnlyElements.forEach(el => el.style.display = 'inline-block');
            jemaatOnlyElements.forEach(el => {
                if (!el.classList.contains('admin-only')) {
                    el.style.display = 'none';
                }
            });
            adminContent.style.display = 'block';
        } else if (role === 'jemaat') {
            jemaatOnlyElements.forEach(el => el.style.display = 'inline-block');
            adminOnlyElements.forEach(el => {
                if (!el.classList.contains('jemaat-only')) {
                    el.style.display = 'none';
                }
            });
            jemaatContent.style.display = 'block';
        }
    }

    async function muatGaleriPublik() {
        const galleryContainer = document.getElementById('gallery-container');
        if (!galleryContainer) return;

        try {
            const response = await fetch('/api/gallery'); // Pastikan path API benar
            const items = await response.json();
            galleryContainer.innerHTML = '';
            if (items.length === 0) {
                galleryContainer.innerHTML = '<p>Belum ada foto/video yang diunggah.</p>';
                return;
            }
            items.forEach(item => {
                // ... (logika galeri Anda)
            });
        } catch (error) {
            console.error("Gagal memuat galeri:", error);
            galleryContainer.innerHTML = '<p>Gagal memuat galeri. Silakan coba lagi nanti.</p>';
        }
    }

    // Logika Utama
    const body = document.body;
    const welcomeUserName = document.getElementById('welcome-user-name');

    try {
        const response = await fetch('/api/auth/status');
        const data = await response.json();

        if (data.success) {
            body.classList.add('logged-in');
            if (welcomeUserName) {
                welcomeUserName.textContent = data.user.nama_lengkap;
            }
            handleRoleVisibility(data.user.role);
        } else {
            body.classList.remove('logged-in');
            const publicContent = document.getElementById('public-content');
            if (publicContent) publicContent.style.display = 'block';
        }
    } catch (error) {
        console.error("Gagal memeriksa status login:", error);
    }

    // Panggil fungsi lain & event listeners
    muatGaleriPublik();

    document.addEventListener('click', async (event) => {
        if (event.target && event.target.id === 'logout-btn') {
            await fetch('/api/auth/logout', { method: 'POST' });
            window.location.href = '/login.html';
        }
    });
});