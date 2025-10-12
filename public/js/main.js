document.addEventListener('DOMContentLoaded', async () => {
    // Ambil elemen-elemen dari halaman
    const body = document.body;
    const userNameSpan = document.getElementById('user-name');
    const welcomeUserName = document.getElementById('welcome-user-name');

    /**
     * Fungsi untuk mengatur elemen apa saja yang boleh terlihat berdasarkan peran pengguna.
     * @param {string} role Peran pengguna ('admin' atau 'jemaat').
     */
    function handleRoleVisibility(role) {
        const adminOnlyElements = document.querySelectorAll('.admin-only');
        const jemaatOnlyElements = document.querySelectorAll('.jemaat-only');
        const publicContent = document.getElementById('public-content');

        if (role === 'admin') {
            // Jika admin, tampilkan elemen admin dan sembunyikan elemen jemaat
            adminOnlyElements.forEach(el => el.style.display = 'block');
            jemaatOnlyElements.forEach(el => el.style.display = 'none');
        } else if (role === 'jemaat') {
            // Jika jemaat, sembunyikan elemen admin dan tampilkan elemen jemaat
            adminOnlyElements.forEach(el => el.style.display = 'none');
            jemaatOnlyElements.forEach(el => el.style.display = 'block');
        }

        // Sembunyikan konten publik (Selamat Datang, Silakan login...) jika sudah login
        if (publicContent) {
            publicContent.style.display = 'none';
        }
    }

    // Blok utama untuk memeriksa status otentikasi
    try {
        // Hubungi API untuk memeriksa status login
        const response = await fetch('http://localhost:3000/api/auth/status');
        const data = await response.json();

        if (data.success) {
            // --- KONDISI JIKA PENGGUNA BERHASIL LOGIN ---

            // 1. Tambahkan kelas 'logged-in' ke body
            body.classList.add('logged-in');

            // 2. Ubah nama di Navbar
            if (userNameSpan) {
                userNameSpan.textContent = data.user.nama_lengkap;
            }

            // 3. Ubah nama di pesan selamat datang di halaman utama
            if (welcomeUserName) {
                welcomeUserName.textContent = data.user.nama_lengkap;
            }

            // 4. Panggil fungsi untuk mengatur tampilan menu berdasarkan peran
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

    // Tambahkan event listener untuk tombol logout
    document.addEventListener('click', async (event) => {
        if (event.target && event.target.id === 'logout-btn') {
            await fetch('http://localhost:3000/api/auth/logout', { method: 'POST' });
            // Arahkan kembali ke halaman login setelah logout berhasil
            window.location.href = '/login.html';
        }
    });
});