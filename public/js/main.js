// File: public/js/main.js (Gabungan Final untuk Fix Role Visibility)

document.addEventListener('DOMContentLoaded', async () => {

    // --- 1. INISIALISASI DAN VISIBILITAS ROLE ---
    const adminOnlyElements = document.querySelectorAll('.admin-only');
    const jemaatOnlyElements = document.querySelectorAll('.jemaat-only');

    // **PENTING: SEMBUNYIKAN SEMUA MENU SPESIFIK SAAT START**
    adminOnlyElements.forEach(el => el.style.display = 'none');
    jemaatOnlyElements.forEach(el => el.style.display = 'none');


    function handleRoleVisibility(role) {
        // Terapkan Logika Tampilan:
        adminOnlyElements.forEach(el => el.style.display = 'none');
        jemaatOnlyElements.forEach(el => el.style.display = 'none');

        if (role === 'admin') {
            // Jika Admin, tampilkan menu Admin
            adminOnlyElements.forEach(el => el.style.display = 'inline-block');
        } else if (role === 'jemaat') {
            // Jika Jemaat, tampilkan menu Jemaat
            jemaatOnlyElements.forEach(el => el.style.display = 'inline-block');
        }
        // Jika 'public', semua tetap 'none'
    }
    
    // --- 2. FUNGSI LOAD HEADER (Fitur Lama Anda) ---
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

    // --- 3. FUNGSI CHECK STATUS AUTENTIKASI (PENTING) ---
    async function updateAuthStatus() {
        const body = document.body;
        const loginLink = document.getElementById('login-link');
        const userInfoDiv = document.getElementById('user-info');
        const welcomeUserName = document.getElementById('welcome-user-name');
        
        // Hapus class role lama sebelum dicek
        body.classList.remove('logged-in', 'role-admin', 'role-jemaat');
        
        try {
            const response = await fetch('/api/auth/status');
            const data = await response.json();
            
            if (data.success && data.user) {
                // Berhasil Login
                body.classList.add('logged-in');
                
                // Atur Class Role pada Body
                if (data.user.role === 'admin') {
                    body.classList.add('role-admin');
                } else if (data.user.role === 'jemaat') {
                    body.classList.add('role-jemaat');
                }

                // **CALL FIX:** Panggil fungsi penyesuaian menu
                handleRoleVisibility(data.user.role); 

                // Menampilkan Logout dan Info User
                if (loginLink) loginLink.style.display = 'none';
                if (userInfoDiv) userInfoDiv.style.display = 'block';
                if (welcomeUserName) welcomeUserName.textContent = data.user.nama_lengkap;
                
            } else {
                // Belum Login/Gagal
                handleRoleVisibility('public'); // Sembunyikan semua menu spesifik
                if (loginLink) loginLink.style.display = 'inline-block';
                if (userInfoDiv) userInfoDiv.style.display = 'none';
            }
            
        } catch (error) {
            console.error("Gagal memeriksa status login:", error);
            handleRoleVisibility('public');
        }
    }

    async function muatGaleriPublik() {
        const galleryContainer = document.getElementById('gallery-container');
        if (!galleryContainer) return;
        try {
            const response = await fetch('/api/gallery'); 
            const items = await response.json();
            galleryContainer.innerHTML = '';
        } catch (error) {
            console.error("Gagal memuat galeri:", error);
            if (galleryContainer) {
                galleryContainer.innerHTML = '<p>Gagal memuat galeri. Silakan coba lagi nanti.</p>';
            }
        }
    }

    /**
     * @param {object | null} user - Objek user jika login, atau null jika tidak.
     */
    function updateUIVisibility(user) {
        const body = document.body;
        const loginLink = document.getElementById('login-link');
        const registerLink = document.getElementById('register-link');
        const userInfo = document.getElementById('user-info');
        const adminElements = document.querySelectorAll('.admin-only');
        const jemaatElements = document.querySelectorAll('.jemaat-only');
        const authElements = document.querySelectorAll('.auth-only');

        if (user) { // Jika user terdeteksi (sudah login)
            body.classList.add('logged-in');
            if (loginLink) loginLink.style.display = 'none';
            if (registerLink) registerLink.style.display = 'none';
            if (userInfo) userInfo.style.display = 'flex';

            const userNameSpan = document.getElementById('user-name');
            if (userNameSpan) userNameSpan.textContent = user.nama_lengkap;

            authElements.forEach(el => el.style.display = 'inline-block');

            if (user.role === 'admin') {
                body.classList.add('role-admin');
                adminElements.forEach(el => el.style.display = 'inline-block');
                jemaatElements.forEach(el => el.style.display = 'none');
            } else if (user.role === 'jemaat') {
                body.classList.add('role-jemaat');
                adminElements.forEach(el => el.style.display = 'none');
                jemaatElements.forEach(el => el.style.display = 'inline-block');
            }
        } else { // Jika user tidak terdeteksi (belum login)
            body.classList.remove('logged-in', 'role-admin', 'role-jemaat');
            if (loginLink) loginLink.style.display = 'inline-block';
            if (registerLink) registerLink.style.display = 'inline-block';
            if (userInfo) userInfo.style.display = 'none';
            adminElements.forEach(el => el.style.display = 'none');
            jemaatElements.forEach(el => el.style.display = 'none');
            authElements.forEach(el => el.style.display = 'none');
        }
    }

    async function muatGaleriPublik() {
        const galleryContainer = document.getElementById('gallery-container');
        if (!galleryContainer) return;
        try {
            const response = await fetch('http://localhost:3000/api/gallery', { credentials: 'omit' });
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
                
                // Asumsi item.file_path sudah menunjuk ke /uploads/
                if (item.file_type === 'image') {
                    mediaElement = `<img src="${item.file_path}" alt="${item.caption || 'Galeri Gereja'}">`;
                } else if (item.file_type === 'video') {
                    mediaElement = `<video controls><source src="${item.file_path}"></video>`;
                }

                galleryItem.innerHTML = `<div class="media-wrapper">${mediaElement}</div>`;
                galleryContainer.appendChild(galleryItem);
            });
            
        } catch (error) {
            console.error("Gagal memuat galeri:", error);
            galleryContainer.innerHTML = '<p>Gagal memuat galeri. Silakan coba lagi nanti.</p>';
        }
    }

    // --- PROSES UTAMA ---
    
    await loadHeader(); // 1. Tunggu header selesai di-copy

    // --- 5. ALUR EKSEKUSI UTAMA ---
    // Pastikan loadHeader berjalan duluan
    await loadHeader();
    
    // Lalu update status autentikasi dan visibilitas
    await updateAuthStatus();

    // Event Listener untuk Logout
    document.addEventListener('click', async (event) => {
        if (event.target && event.target.id === 'logout-btn') {
            await fetch('/api/auth/logout', { method: 'POST' }); 
            window.location.href = '/index.html'; 
        }
    });

    // Panggil Galeri jika elemennya ada di halaman
    try {
        const response = await fetch('http://localhost:3000/api/auth/status', { credentials: 'include' });
        const data = await response.json();
        
        // 2. Perbarui UI berdasarkan hasil status
        if (data.success) {
            updateUIVisibility(data.user);
        } else {
            updateUIVisibility(null);
        }
    } catch (error) {
        console.error("Gagal memeriksa status login:", error);
        updateUIVisibility(null); // Jika error, anggap tidak login
    }

    // 3. Pasang event listener untuk logout
    document.addEventListener('click', async (event) => {
        if (event.target && event.target.id === 'logout-btn') {
            await fetch('http://localhost:3000/api/auth/logout', { method: 'POST', credentials: 'include' });
            window.location.href = '/index.html';
        }
    });

    // 4. Muat konten dinamis lainnya
    if (document.getElementById('gallery-container')) {
        muatGaleriPublik();
    }
    
    // 5. Akhirnya, tampilkan halaman
    document.body.classList.add('ready');
});