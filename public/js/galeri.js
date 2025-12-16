document.addEventListener('DOMContentLoaded', () => {
    const galleryContainer = document.getElementById('gallery-container'); 

    async function loadPublicGallery() {
        galleryContainer.innerHTML = '<p class="loading-text">Memuat galeri...</p>';

        try {
            const response = await fetch('/api/gallery'); 
            
            if (!response.ok) {
                throw new Error(`Gagal memuat data. Status: ${response.status}`);
            }

            const items = await response.json(); 
            galleryContainer.innerHTML = ''; 

            if (items.length === 0 || !Array.isArray(items)) {
                 galleryContainer.innerHTML = '<div class="no-content-message"><p class="text-muted">Belum ada media di galeri saat ini.</p></div>';
                 return;
            }

            items.forEach(item => {
                const galleryItem = document.createElement('div');
                galleryItem.className = 'gallery-item'; 
                
                const filePath = item.file_path; 
                let mediaElement = '';

                if (item.file_type === 'image') {
                    mediaElement = `<img src="${filePath}" alt="${item.caption || 'Galeri'}" loading="lazy">`;
                } else if (item.file_type === 'video') {
                    mediaElement = `<video controls src="${filePath}" preload="metadata"></video>`;
                }

                galleryItem.innerHTML = `
                    <div class="card h-100 shadow-sm border-0 overflow-hidden">
                        <div class="gallery-img-wrapper">
                            ${mediaElement}
                        </div>
                        <div class="card-body p-3">
                            <h6 class="gallery-card-title text-primary">${item.event_name || 'Tanpa Nama Acara'}</h6>
                            <p class="card-text text-muted small">${item.caption || 'Tidak ada keterangan'}</p>
                        </div>
                    </div>
                `;
                
                galleryContainer.appendChild(galleryItem);
            });

        } catch (error) {
            console.error("Error:", error);
            galleryContainer.innerHTML = '<p class="text-danger loading-text">Gagal memuat galeri.</p>';
        }
    }

    loadPublicGallery();
});