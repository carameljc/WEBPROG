document.addEventListener('DOMContentLoaded', () => {
    const galleryContainer = document.getElementById('gallery-container');
    const paginationContainer = document.getElementById('pagination-container');
    
    let allGalleryItems = []; // Menyimpan SEMUA data dari database
    const itemsPerPage = 6;   // Batas 6 foto per halaman
    let currentPage = 1;      // Halaman aktif saat ini

    // --- 1. Inisialisasi Modal (Tetap sama) ---
    function initModal() {
        const modal = document.getElementById('gallery-modal');
        const closeBtn = document.getElementById('modal-close-btn');
        const modalContent = document.getElementById('modal-content');
        
        if (!modal) return;
        
        closeBtn.addEventListener('click', () => modal.classList.remove('visible'));
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.remove('visible');
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('visible')) {
                modal.classList.remove('visible');
            }
        });
        
        // Fungsi global untuk membuka modal
        window.openModal = (globalIndex) => {
            if (!allGalleryItems[globalIndex]) return;
            
            const item = allGalleryItems[globalIndex];
            const isImage = item.file_type === 'image';
            
            modalContent.innerHTML = isImage
                ? `<img src="${item.file_path}" alt="${item.caption || 'Galeri'}">`
                : `<video controls autoplay src="${item.file_path}"></video>`;
            
            modal.classList.add('visible');
        };
    }

    // --- 2. Fungsi Render Galeri (Per Halaman) ---
    function renderGalleryPage(page) {
        galleryContainer.innerHTML = ''; // Kosongkan container

        // Hitung index mulai dan akhir (Rumus Pagination)
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        
        // Ambil potongan data (misal: index 0-6 untuk hal 1)
        const itemsToDisplay = allGalleryItems.slice(startIndex, endIndex);

        if (itemsToDisplay.length === 0) {
            galleryContainer.innerHTML = '<div class="col-12 text-center"><p class="text-muted">Tidak ada foto di halaman ini.</p></div>';
            return;
        }

        itemsToDisplay.forEach((item, loopIndex) => {
            // Index Asli (Global) diperlukan agar Modal menampilkan gambar yang benar
            const globalIndex = startIndex + loopIndex;

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
                <div class="card h-100 shadow-sm border-0 overflow-hidden" style="cursor: pointer;">
                    <div class="gallery-img-wrapper">
                        ${mediaElement}
                    </div>
                    </div>
            `;
            
            // Klik card membuka modal dengan index yang benar
            galleryItem.addEventListener('click', () => {
                window.openModal(globalIndex);
            });
            
            galleryContainer.appendChild(galleryItem);
        });

        // Setelah render foto, render tombol pagination
        renderPaginationControls();
    }

    // --- 3. Fungsi Render Tombol Pagination ---
    function renderPaginationControls() {
        if (!paginationContainer) return;
        paginationContainer.innerHTML = '';

        const totalPages = Math.ceil(allGalleryItems.length / itemsPerPage);

        // Jika hanya 1 halaman, tidak perlu tombol
        if (totalPages <= 1) return;

        // Tombol PREVIOUS
        const prevBtn = document.createElement('button');
        prevBtn.innerText = '←';
        prevBtn.className = 'btn btn-pagination';
        prevBtn.disabled = currentPage === 1;
        prevBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                renderGalleryPage(currentPage);
            }
        });
        paginationContainer.appendChild(prevBtn);


        // Tombol NEXT
        const nextBtn = document.createElement('button');
        nextBtn.innerText = '→';
        nextBtn.className = 'btn btn-pagination';
        nextBtn.disabled = currentPage === totalPages;
        nextBtn.addEventListener('click', () => {
            if (currentPage < totalPages) {
                currentPage++;
                renderGalleryPage(currentPage);
            }
        });
        paginationContainer.appendChild(nextBtn);
    }

    // --- 4. Fungsi Utama Fetch Data ---
    async function loadPublicGallery() {
        galleryContainer.innerHTML = '<p class="loading-text text-white text-center">Memuat galeri...</p>';

        try {
            const response = await fetch('/api/gallery'); 
            
            if (!response.ok) throw new Error(`Status: ${response.status}`);

            const items = await response.json(); 
            
            // Simpan data ke variabel global
            allGalleryItems = items; 

            if (allGalleryItems.length === 0) {
                 galleryContainer.innerHTML = '<div class="col-12 text-center text-white"><p>Belum ada media di galeri saat ini.</p></div>';
                 return;
            }

            // Render Halaman Pertama
            currentPage = 1;
            renderGalleryPage(1);

        } catch (error) {
            console.error("Error:", error);
            galleryContainer.innerHTML = '<p class="text-danger loading-text text-center">Gagal memuat galeri.</p>';
        }
    }

    // Jalankan
    initModal();
    loadPublicGallery();
});