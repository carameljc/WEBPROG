document.addEventListener('DOMContentLoaded', () => {
    const galleryContainer = document.getElementById('gallery-container'); 
    let galleryItems = [];

    // Inisialisasi Modal
    function initModal() {
        const modal = document.getElementById('gallery-modal');
        const closeBtn = document.getElementById('modal-close-btn');
        const modalContent = document.getElementById('modal-content');
        
        if (!modal) {
            console.warn('Modal element not found');
            return;
        }
        
        closeBtn.addEventListener('click', () => {
            modal.classList.remove('visible');
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('visible');
            }
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('visible')) {
                modal.classList.remove('visible');
            }
        });
        
        window.openModal = (index) => {
            if (!galleryItems[index]) return;
            
            const item = galleryItems[index];
            const isImage = item.file_type === 'image';
            
            modalContent.innerHTML = isImage
                ? `<img src="${item.file_path}" alt="${item.caption || 'Galeri'}">`
                : `<video controls autoplay src="${item.file_path}"></video>`;
            
            modal.classList.add('visible');
        };
    }

    async function loadPublicGallery() {
        galleryContainer.innerHTML = '<p class="loading-text">Memuat galeri...</p>';

        try {
            const response = await fetch('/api/gallery'); 
            
            if (!response.ok) {
                throw new Error(`Gagal memuat data. Status: ${response.status}`);
            }

            const items = await response.json(); 
            galleryItems = items;
            galleryContainer.innerHTML = ''; 

            if (items.length === 0 || !Array.isArray(items)) {
                 galleryContainer.innerHTML = '<div class="no-content-message"><p class="text-muted">Belum ada media di galeri saat ini.</p></div>';
                 return;
            }

            items.forEach((item, index) => {
                const galleryItem = document.createElement('div');
                galleryItem.className = 'gallery-item'; 
                
                const filePath = item.file_path; 
                let mediaElement = '';

                if (item.file_type === 'image') {
                    mediaElement = `<img src="${filePath}" alt="${item.caption || 'Galeri'}" loading="lazy">`;
                } else if (item.file_type === 'video') {
                    mediaElement = `<video src="${filePath}" preload="metadata"></video>`;
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
                
                galleryItem.addEventListener('click', () => {
                    if (typeof window.openModal === 'function') {
                        window.openModal(index);
                    } else {
                        console.error('Modal function not initialized');
                    }
                });
                
                galleryContainer.appendChild(galleryItem);
            });

        } catch (error) {
            console.error("Error:", error);
            galleryContainer.innerHTML = '<p class="text-danger loading-text">Gagal memuat galeri.</p>';
        }
    }

    // Inisialisasi
    initModal();
    loadPublicGallery();
});