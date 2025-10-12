document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('profile-form');
    const loadingMessage = document.getElementById('loading-profile');
    const profilePicture = document.getElementById('profile-picture');
    const defaultProfilePic = 'https://via.placeholder.com/150?text=Foto+Profil';
    // Ambil elemen input URL yang terlihat
    const visibleUrlInput = document.getElementById('visible_url_input');

    async function muatProfile() {
        try {
            // 1. Mengambil data profil dari server
            const response = await fetch('http://localhost:3000/api/jemaat/me');
            
            // Redirect ke login jika sesi berakhir (ditangani oleh authMiddleware/401)
            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    window.location.href = '/login.html';
                    return;
                }
                throw new Error('Gagal memuat data profil dari server.');
            }
            
            const data = await response.json();
            
            // 2. Mengisi form dengan data dari database
            form.nama_lengkap.value = data.nama_lengkap || '';
            form.email.value = data.email || '';
            form.nomor_telepon.value = data.nomor_telepon || '';
            form.alamat.value = data.alamat || '';
            form.tempat_lahir.value = data.tempat_lahir || '';
            form.jenis_kelamin.value = data.jenis_kelamin || 'Laki-laki'; 
            
            // Penanganan Tanggal Lahir (format YYYY-MM-DD)
            if (data.tanggal_lahir) {
                form.tanggal_lahir.value = data.tanggal_lahir.split('T')[0];
            } else {
                form.tanggal_lahir.value = '';
            }
            
            // Penanganan Foto Profil
            const fotoUrl = data.foto_profile_url && data.foto_profile_url.trim() !== '' 
                           ? data.foto_profile_url : defaultProfilePic;
            
            // 🚨 PERBAIKAN: Mengisi input URL yang terlihat oleh user
            if (visibleUrlInput) {
                visibleUrlInput.value = data.foto_profile_url || '';
            }

            // Mengisi input URL tersembunyi (yang dikirim ke server)
            document.getElementById('foto_profile_url').value = data.foto_profile_url || '';
            
            profilePicture.src = fotoUrl;

            // 3. Tampilkan form dan sembunyikan pesan loading
            loadingMessage.style.display = 'none';
            form.style.display = 'flex'; // Menggunakan flex karena tata letak form
            
        } catch (error) {
            loadingMessage.textContent = `Gagal memuat profil. Pastikan data 'user_id' di database master_jemaat sudah benar.`;
            console.error('Error memuat profil:', error);
        }
    }

    // Listener untuk Simpan Perubahan (UPDATE)
    if (form) {
        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            
            // Pastikan data dari input yang terlihat sudah disalin ke input tersembunyi (sudah dilakukan di HTML, tapi untuk keamanan)
            if (visibleUrlInput) {
                document.getElementById('foto_profile_url').value = visibleUrlInput.value;
            }

            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());

            try {
                const response = await fetch('http://localhost:3000/api/jemaat/me', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                
                const result = await response.json();
                
                if (response.ok) {
                    alert('Profil berhasil diperbarui!');
                    muatProfile(); // Muat ulang data untuk verifikasi
                    
                    // Muat ulang status untuk memastikan nama di navbar terupdate
                    fetch('http://localhost:3000/api/auth/status'); 
                    
                } else {
                    alert('Gagal memperbarui: ' + result.message);
                }
                
            } catch (error) {
                alert('Tidak dapat terhubung ke server untuk menyimpan data.');
            }
        });
    }

    muatProfile();
});