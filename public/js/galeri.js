// public/js/galeri.js

document.addEventListener('DOMContentLoaded', () => {
    const galleryContainer = document.getElementById('gallery-container'); 

    async function loadPublicGallery() {
        galleryContainer.innerHTML = '<p class="col-12 text-center">Memuat galeri...</p>';

        try {
            // Memanggil endpoint yang ditangani oleh galleryController.getItems
            const response = await fetch('/api/gallery'); 
            
            if (!response.ok) {
                throw new Error(`Gagal memuat data dari server. Status: ${response.status}`);
            }

            const items = await response.json(); 
            galleryContainer.innerHTML = ''; 

            if (items.length === 0 || !Array.isArray(items)) {
                 galleryContainer.innerHTML = '<p class="col-12 text-center">Belum ada media di galeri saat ini.</p>';
                 return;
            }

            items.forEach(item => {
                const itemDiv = document.createElement('div');
                // Grid responsif: 3 kolom di desktop (lg-4), 4 kolom di layar besar (xl-3)
                itemDiv.className = 'col-6 col-md-4 col-lg-3 mb-4'; 
                
                // filePath dari Controller Anda adalah /galleryMedia/namafile
                const filePath = item.file_path; 
                let mediaElement = '';

                // Menentukan elemen media
                if (item.file_type === 'image') {
                    mediaElement = `<img src="${filePath}" alt="${item.caption}" class="img-fluid rounded">`;
                } else if (item.file_type === 'video') {
                    // Video publik harus memiliki controls
                    mediaElement = `<video controls src="${filePath}" class="img-fluid rounded"></video>`;
                } else {
                     mediaElement = `<p class="text-muted">Tipe file tidak didukung.</p>`;
                }

                itemDiv.innerHTML = `
                    <div class="card h-100 shadow-sm overflow-hidden">
                        <div class="card-img-top p-2 media-preview">
                            ${mediaElement}
                        </div>
                        <div class="card-body">
                            <h6 class="card-title">${item.event_name || 'Tanpa Acara'}</h6>
                            <p class="card-text text-muted small">${item.caption || 'Tidak ada keterangan'}</p>
                        </div>
                    </div>
                `;
                
                galleryContainer.appendChild(itemDiv);
            });

        } catch (error) {
            console.error("Error saat memuat galeri publik:", error);
            galleryContainer.innerHTML = '<p class="col-12 text-danger">Gagal memuat galeri. Periksa koneksi server.</p>';
        }
    }

    loadPublicGallery();
});