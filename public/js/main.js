// File: public/js/main.js (Versi Bersih & Fix Logout Animasi)

document.addEventListener('DOMContentLoaded', async () => {

    // --- 1. INISIALISASI VARIABEL GLOBAL ---
    const adminOnlyElements = document.querySelectorAll('.admin-only');
    const jemaatOnlyElements = document.querySelectorAll('.jemaat-only');
    const authElements = document.querySelectorAll('.auth-only');

    // **PENTING: SEMBUNYIKAN SEMUA MENU SPESIFIK SAAT START**
    function hideAllRoleMenus() {
        adminOnlyElements.forEach(el => el.style.display = 'none');
        jemaatOnlyElements.forEach(el => el.style.display = 'none');
        authElements.forEach(el => el.style.display = 'none');
    }
    hideAllRoleMenus();

    // --- 2. FUNGSI LOAD HEADER ---
    async function loadHeader() {
        const currentHeader = document.querySelector('header');
        // Hanya muat jika header belum punya isi
        if (currentHeader && !currentHeader.querySelector('nav')) { 
            try {
                const response = await fetch('/index.html', { credentials: 'omit' }); 
                const htmlString = await response.text();
                const parser = new DOMParser();
                const doc = parser.parseFromString(htmlString, 'text/html');
                const nav = doc.querySelector('nav');
                if (nav) {
                    currentHeader.innerHTML = '';
                    currentHeader.appendChild(nav);
                }
            } catch (error) {
                console.error('Gagal memuat navigasi:', error);
            }
        }
    }

    // --- 3. FUNGSI UPDATE UI BERDASARKAN USER ---
    function updateUIVisibility(user) {
        const body = document.body;
        const loginLink = document.getElementById('login-link');
        const registerLink = document.getElementById('register-link');
        const userInfo = document.getElementById('user-info');
        const userNameSpan = document.getElementById('user-name');
        const welcomeUserName = document.getElementById('welcome-user-name');

        // Reset tampilan dulu
        hideAllRoleMenus();
        body.classList.remove('logged-in', 'role-admin', 'role-jemaat');

        if (user) { 
            // --- JIKA LOGIN ---
            body.classList.add('logged-in');
            
            if (loginLink) loginLink.style.display = 'none';
            if (registerLink) registerLink.style.display = 'none';
            if (userInfo) userInfo.style.display = 'flex';
            
            if (userNameSpan) userNameSpan.textContent = user.nama_lengkap;
            if (welcomeUserName) welcomeUserName.textContent = user.nama_lengkap;

            // Tampilkan menu umum untuk user login
            authElements.forEach(el => el.style.display = 'inline-block');

            // Cek Role
            if (user.role === 'admin') {
                body.classList.add('role-admin');
                adminOnlyElements.forEach(el => el.style.display = 'inline-block');
            } else if (user.role === 'jemaat') {
                body.classList.add('role-jemaat');
                jemaatOnlyElements.forEach(el => el.style.display = 'inline-block');
            }

        } else { 
            // --- JIKA TIDAK LOGIN ---
            if (loginLink) loginLink.style.display = 'inline-block';
            if (registerLink) registerLink.style.display = 'inline-block';
            if (userInfo) userInfo.style.display = 'none';
        }
    }

    // --- 4. FUNGSI CEK STATUS DARI SERVER ---
    async function checkAuthStatus() {
        try {
            const response = await fetch('/api/auth/status', { credentials: 'include' });
            const data = await response.json();
            
            if (data.success) {
                updateUIVisibility(data.user);
            } else {
                updateUIVisibility(null);
            }
        } catch (error) {
            console.error("Gagal memeriksa status login:", error);
            updateUIVisibility(null);
        }
    }

    // --- 5. FUNGSI POP-UP MODAL ---
    function createAndShowModal(contentHTML) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="modal-close">&times;</span>
                ${contentHTML}
            </div>
        `;
        document.body.appendChild(modal);
        modal.classList.add('visible');

        const closeModal = () => {
            modal.classList.remove('visible');
            setTimeout(() => {
                if (document.body.contains(modal)) {
                    document.body.removeChild(modal);
                }
            }, 300);
        };

        modal.querySelector('.modal-close').addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }

    // --- 6. FUNGSI MUAT GALERI ---
    async function muatGaleriPublik() {
        const galleryContainer = document.getElementById('gallery-container');
        if (!galleryContainer) return;
        
        try {
            const response = await fetch('/api/gallery', { credentials: 'omit' });
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

                galleryItem.innerHTML = `<div class="media-wrapper">${mediaElement}</div>`;
                galleryContainer.appendChild(galleryItem);
                
                // Event listener klik untuk pop-up
                galleryItem.addEventListener('click', (e) => {
                    e.preventDefault(); 
                    let modalContent = '';
                    if (item.file_type === 'image') {
                        modalContent = `<img src="${item.file_path}" alt="${item.caption || 'Galeri Gereja'}">`;
                    } else if (item.file_type === 'video') {
                        modalContent = `<video controls autoplay><source src="${item.file_path}"></video>`;
                    }
                    if (modalContent) createAndShowModal(modalContent);
                });
            });
            
        } catch (error) {
            console.error("Gagal memuat galeri:", error);
            galleryContainer.innerHTML = '<p>Gagal memuat galeri. Silakan coba lagi nanti.</p>';
        }
    }

    // =================================================================
    // EKSEKUSI UTAMA
    // =================================================================
    
    // 1. Muat Header Navigasi
    await loadHeader();

    // 2. Cek Status Login
    await checkAuthStatus();

    // 3. Muat Galeri (jika ada containernya)
    if (document.getElementById('gallery-container')) {
        muatGaleriPublik();
    }

    // 4. Event Listener Logout (Satu-satunya yang kita butuhkan)
    document.addEventListener('click', async (event) => {
        if (event.target && event.target.id === 'logout-btn') {
            try {
                await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
                
                // === INI KUNCI AGAR ANIMASI MUNCUL LAGI ===
                // Hapus catatan session storage saat logout
                sessionStorage.removeItem('introShown'); 
                
                window.location.href = '/index.html';
            } catch (error) {
                console.error("Logout gagal:", error);
            }
        }
    });

    // 5. Tanda halaman siap
    document.body.classList.add('ready');
});