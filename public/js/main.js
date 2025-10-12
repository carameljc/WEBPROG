document.addEventListener('DOMContentLoaded', async () => {
    const body = document.body;
    const userNameSpan = document.getElementById('user-name');

    // Fungsi untuk mengelola elemen apa saja yang boleh terlihat berdasarkan peran
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

    try {
        // Cek status login ke API
        const response = await fetch('http://localhost:3000/api/auth/status');
        const data = await response.json();

        if (data.success) {
            // Jika user berhasil login
            body.classList.add('logged-in');
            if (userNameSpan) {
                userNameSpan.textContent = data.user.nama_lengkap;
            }

            // Panggil fungsi untuk mengatur tampilan berdasarkan peran user
            handleRoleVisibility(data.user.role);

        } else {
            // Jika user tidak login
            body.classList.remove('logged-in');
            const publicContent = document.getElementById('public-content');
            if(publicContent) publicContent.style.display = 'block';
        }
    } catch (error) {
        console.error("Gagal memeriksa status login:", error);
        body.classList.remove('logged-in');
    }

    // Event listener untuk tombol logout
    document.addEventListener('click', async (event) => {
        if (event.target && event.target.id === 'logout-btn') {
            await fetch('http://localhost:3000/api/auth/logout', { method: 'POST' });
            window.location.href = '/login.html'; // Arahkan ke halaman login
        }
    });
});