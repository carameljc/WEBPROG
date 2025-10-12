document.addEventListener('DOMContentLoaded', async () => {
    // =================================================================
    // --- 1. DEFINISI FUNGSI ---
    // =================================================================

    async function muatGaleriPublik() {
        const galleryContainer = document.getElementById('gallery-container');
        if (!galleryContainer) return; 

        try {
            const response = await fetch('http://localhost:3000/api/gallery');
            const items = await response.json();

            galleryContainer.innerHTML = ''; 

            if (items.length === 0) {
                galleryContainer.innerHTML = '<p>Belum ada foto/video yang diunggah.</p>';
                return;
            }

            items.forEach(item => {
                const galleryItem = document.createElement('div');
                galleryItem.className = 'gallery-item';

                let mediaElement = '';
                if (item.file_type === 'image') {
                    mediaElement = `<img src="${item.file_path}" alt="${item.caption || 'Galeri Gereja'}">`;
                } else if (item.file_type === 'video') {
                    mediaElement = `<video controls><source src="${item.file_path}"></video>`;
                }

                galleryItem.innerHTML = `
                    <div class="media-wrapper">
                        ${mediaElement}
                    </div>
                `;
                galleryContainer.appendChild(galleryItem);
            });
        } catch (error) {
            console.error("Gagal memuat galeri:", error);
            galleryContainer.innerHTML = '<p>Gagal memuat galeri. Silakan coba lagi nanti.</p>';
        }
    }

    /**
     * Mengatur elemen apa saja yang boleh terlihat berdasarkan peran pengguna.
     * @param {string} role Peran pengguna ('admin' atau 'jemaat').
     */
    function handleRoleVisibility(role) {
        const adminOnlyElements = document.querySelectorAll('.admin-only');
        const jemaatOnlyElements = document.querySelectorAll('.jemaat-only');
        const publicContent = document.getElementById('public-content');

        if (role === 'admin') {
            adminOnlyElements.forEach(el => el.style.display = 'block');
            jemaatOnlyElements.forEach(el => el.style.display = 'none');
        } else if (role === 'jemaat') {
            adminOnlyElements.forEach(el => el.style.display = 'none');
            jemaatOnlyElements.forEach(el => el.style.display = 'block');
        }

        // Sembunyikan pesan "Selamat Datang, silakan login" jika sudah login
        if (publicContent) {
            publicContent.style.display = 'none';
        }
    }

    // =================================================================
    // --- 2. LOGIKA UTAMA & PENGECEKAN STATUS LOGIN ---
    // =================================================================
    
    const body = document.body;
    const userNameSpan = document.getElementById('user-name');
    const welcomeUserName = document.getElementById('welcome-user-name');

    try {
        const response = await fetch('http://localhost:3000/api/auth/status');
        const data = await response.json();

        if (data.success) {
            // --- KONDISI JIKA PENGGUNA BERHASIL LOGIN ---
            body.classList.add('logged-in');
            if (userNameSpan) {
                userNameSpan.textContent = data.user.nama_lengkap;
            }
            if (welcomeUserName) {
                welcomeUserName.textContent = data.user.nama_lengkap;
            }
            handleRoleVisibility(data.user.role);
        } else {
            // --- KONDISI JIKA PENGGUNA TIDAK LOGIN ---
            body.classList.remove('logged-in');
            const publicContent = document.getElementById('public-content');
            if (publicContent) {
                publicContent.style.display = 'block';
            }
        }
    } catch (error) {
        console.error("Gagal memeriksa status login:", error);
        body.classList.remove('logged-in');
    }

    // =================================================================
    // --- 3. PEMANGGILAN FUNGSI & EVENT LISTENERS ---
    // =================================================================

    // Panggil fungsi untuk memuat galeri setelah pengecekan login selesai.
    // Ini berjalan untuk semua pengunjung.
    muatGaleriPublik();

    // Tambahkan event listener untuk tombol logout
    document.addEventListener('click', async (event) => {
        if (event.target && event.target.id === 'logout-btn') {
            await fetch('http://localhost:3000/api/auth/logout', { method: 'POST' });
            window.location.href = '/index.html';
        }
    });
});