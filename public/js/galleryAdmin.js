document.addEventListener('DOMContentLoaded', () => {
    // --- 1. AMBIL SEMUA ELEMEN YANG DIBUTUHKAN DI AWAL ---
    const uploadForm = document.getElementById('upload-form');
    const uploadStatus = document.getElementById('upload-status');
    const adminGalleryContainer = document.getElementById('admin-gallery-container');

    // Elemen-elemen baru untuk fungsionalitas pop-up (modal)
    const modal = document.getElementById('gallery-modal');
    const modalContent = document.getElementById('modal-content');
    const closeModalBtn = document.getElementById('modal-close-btn');

    // Jika elemen dasar tidak ada, hentikan eksekusi
    if (!adminGalleryContainer || !uploadForm) return;

    // --- 2. FUNGSI UTAMA UNTUK MEMUAT GALERI ---
    async function loadAdminGallery() {
        try {
            const response = await fetch('http://localhost:3000/api/gallery', { credentials: 'include' });
            const items = await response.json();
            adminGalleryContainer.innerHTML = '';

            items.forEach(item => {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'gallery-item-admin';
                
                // Siapkan dua versi elemen media: satu untuk thumbnail, satu untuk pop-up
                let mediaElementThumbnail = '';
                let mediaElementForModal = '';

                if (item.file_type === 'image') {
                    mediaElementThumbnail = `<img src="${item.file_path}" alt="${item.caption}">`;
                    mediaElementForModal = mediaElementThumbnail; // Untuk gambar, keduanya sama
                } else {
                    // Thumbnail video tidak perlu 'controls' agar terlihat bersih
                    mediaElementThumbnail = `<video><source src="${item.file_path}"></video>`;
                    // Video di pop-up perlu 'controls' agar bisa diputar
                    mediaElementForModal = `<video controls><source src="${item.file_path}"></video>`;
                }

                // Bangun HTML untuk item di galeri (menggunakan thumbnail)
                itemDiv.innerHTML = `
                    <div class="media-wrapper">${mediaElementThumbnail}</div>
                    <div class="caption-wrapper">
                        <h4>${item.event_name || ''}</h4>
                        <p>${item.caption || ''}</p>
                        <button class="deleteGalleryBtn" data-id="${item.id}">Hapus</button>
                    </div>
                `;

                // --- LOGIKA POP-UP BARU: Tambahkan event listener untuk klik pada gambar/video ---
                const mediaWrapper = itemDiv.querySelector('.media-wrapper');
                if (mediaWrapper) {
                    mediaWrapper.addEventListener('click', () => {
                        if (modal && modalContent) {
                            modalContent.innerHTML = mediaElementForModal; // Tampilkan versi pop-up
                            modal.classList.add('visible');
                        }
                    });
                }
                
                adminGalleryContainer.appendChild(itemDiv);
            });
        } catch (error) {
            adminGalleryContainer.innerHTML = '<p>Gagal memuat galeri. Pastikan Anda sudah login sebagai admin.</p>';
        }
    }

    // --- 3. EVENT LISTENERS ---

    // Event listener untuk tombol Hapus (tidak berubah)
    adminGalleryContainer.addEventListener('click', async (event) => {
        if (event.target.classList.contains('deleteGalleryBtn')) {
            const id = event.target.dataset.id;
            if (confirm('Apakah Anda yakin ingin menghapus media ini?')) {
                try {
                    const response = await fetch(`http://localhost:3000/api/gallery/${id}`, {
                        method: 'DELETE',
                        credentials: 'include'
                    });
                    if (response.ok) {
                        loadAdminGallery();
                    } else {
                        const err = await response.json();
                        alert(`Gagal menghapus media: ${err.message}`);
                    }
                } catch (error) {
                    alert('Error koneksi saat mencoba menghapus.');
                }
            }
        }
    });

    // Event listener untuk form Unggah (tidak berubah)
    uploadForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const formData = new FormData(uploadForm);
        uploadStatus.textContent = 'Mengunggah...';
        try {
            const response = await fetch('http://localhost:3000/api/gallery/upload', {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });
            const result = await response.json();
            if (response.ok) {
                uploadStatus.textContent = result.message;
                uploadForm.reset();
                loadAdminGallery();
            } else {
                uploadStatus.textContent = `Gagal: ${result.message}`;
            }
        } catch (error) {
            uploadStatus.textContent = 'Error koneksi ke server.';
        }
    });
    
    // --- LOGIKA POP-UP BARU: Event listeners untuk MENUTUP modal ---
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            modal.classList.remove('visible');
            modalContent.innerHTML = ''; // Penting untuk menghentikan video
        });
    }

    if (modal) {
        modal.addEventListener('click', (event) => {
            // Hanya tutup jika yang diklik adalah area overlay gelap, bukan kontennya
            if (event.target === modal) {
                modal.classList.remove('visible');
                modalContent.innerHTML = ''; // Penting untuk menghentikan video
            }
        });
    }

    // --- 4. PEMANGGILAN FUNGsi awal ---
    loadAdminGallery();
});