document.addEventListener('DOMContentLoaded', async () => {
    
    async function loadHeader() {
        const currentHeader = document.querySelector('header');
        if (currentHeader && !currentHeader.hasChildNodes()) {
            try {
                const response = await fetch('/index.html');
                const htmlString = await response.text();
                const parser = new DOMParser();
                const doc = parser.parseFromString(htmlString, 'text/html');
                const nav = doc.querySelector('nav');
                if (nav) {
                    currentHeader.innerHTML = ''; // Pastikan header benar-benar kosong
                    currentHeader.appendChild(nav); // Tempel navigasi yang sudah di-copy
                }
            } catch (error) {
                console.error('Gagal memuat navigasi:', error);
            }
        }
    }

    async function updateAuthStatus() {
        const body = document.body;
        const userNameSpan = document.getElementById('user-name');
        const welcomeUserName = document.getElementById('welcome-user-name');
        const publicContent = document.getElementById('public-content');
        const adminContent = document.getElementById('admin-content');
    const jemaatContent = document.getElementById('jemaat-content');
        try {
            const response = await fetch('http://localhost:3000/api/auth/status');
            const data = await response.json();
            
            // Elemen ini mungkin baru ada setelah header dimuat, jadi kita cari di sini
            const userNameSpan = document.getElementById('user-name');

            if (data.success) {
                body.classList.add('logged-in');
                if (data.user.role === 'admin') {
                    body.classList.add('role-admin');
                } else if (data.user.role === 'jemaat') {
                    body.classList.add('role-jemaat');
                }
                if (userNameSpan) userNameSpan.textContent = data.user.nama_lengkap;
            } else {
                // --- BAGIAN INI AKTIF JIKA BELUM LOGIN ---
                body.classList.remove('logged-in', 'role-admin', 'role-jemaat');
            }
        } catch (error) {
            console.error("Gagal memeriksa status login:", error);
            body.classList.remove('logged-in', 'role-admin', 'role-jemaat');
        }
    }

    /**
     * FUNGSI PEMUAT GALERI PUBLIK
     */
    async function muatGaleriPublik() {
        const galleryContainer = document.getElementById('gallery-container');
        if (!galleryContainer) return; // Hentikan jika tidak ada elemen galeri di halaman ini.

        try {
            const response = await fetch('http://localhost:3000/api/gallery');
            const items = await response.json();
            galleryContainer.innerHTML = ''; // Kosongkan kontainer

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
                    <div class="media-wrapper">${mediaElement}</div>
                    <div class="caption-wrapper">
                    </div>
                `;
                galleryContainer.appendChild(galleryItem);
            });
        } catch (error) {
            console.error("Gagal memuat galeri:", error);
            galleryContainer.innerHTML = '<p>Gagal memuat galeri. Silakan coba lagi nanti.</p>';
        }
    }


    await loadHeader();

    await updateAuthStatus();

    document.addEventListener('click', async (event) => {
        if (event.target && event.target.id === 'logout-btn') {
            await fetch('http://localhost:3000/api/auth/logout', { method: 'POST' });
            window.location.href = '/index.html'; 
        }
    });

    if (document.getElementById('gallery-container')) {
        muatGaleriPublik();
    }
    
    document.body.classList.add('ready');
});