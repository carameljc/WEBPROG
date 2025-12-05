// public/js/event.js

document.addEventListener('DOMContentLoaded', () => {
    const eventListContainer = document.getElementById('eventList');
    const searchInput = document.getElementById('searchInput'); // Element input search

    // ========================================================
    // 1. FUNGSI UTAMA: LOAD DAN RENDER EVENT (TERMASUK SEARCH)
    // ========================================================
    async function loadEventList(searchQuery = '') { 
        eventListContainer.innerHTML = '<p class="col-12 text-center">Sedang memuat event...</p>';

        let url = '/api/event/daftar';
        // Tambahkan query parameter jika ada pencarian
        if (searchQuery) {
            url += `?q=${encodeURIComponent(searchQuery)}`;
        }

        try {
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`Gagal mengambil data dari server. (Status: ${response.status})`);
            }

            const result = await response.json();
            
            if (!result.success) {
                eventListContainer.innerHTML = `<p class="col-12 alert alert-danger">❌ ${result.message || 'Gagal memuat event dari server.'}</p>`;
                return;
            }

            const events = result.data;
            eventListContainer.innerHTML = ''; 

            if (events.length === 0) {
                 eventListContainer.innerHTML = `<p class="col-12 text-center">Tidak ada event gereja yang ditemukan ${searchQuery ? `untuk kata kunci: "${searchQuery}"` : 'saat ini'}.</p>`;
                 return;
            }
            
            // Container sudah memiliki class 'row' di event.html

            events.forEach(event => {
                const eventCard = document.createElement('div');
                // Gunakan class kolom Bootstrap untuk responsif (4 kolom di desktop, 6 di tablet, 12 di ponsel)
                eventCard.className = 'col-sm-12 col-md-6 col-lg-4 mb-4'; 

                // Path poster diasumsikan hanya nama file di DB, sehingga perlu prefix /uploads/
                const posterPath = `/galleryMedia/${event.poster}`; 

                eventCard.innerHTML = `
                    <div class="card h-100 shadow-sm overflow-hidden">
                        <div class="event-poster card-img-top">
                            <img src="${posterPath}" alt="Poster Event: ${event.nama_event}" class="img-fluid" style="object-fit: cover; height: 200px; width: 100%;">
                        </div>
                        <div class="event-info card-body d-flex flex-column">
                            <h5 class="card-title">${event.nama_event}</h5>
                            
                            ${event.link_gform ? 
                                `<a href="${event.link_gform}" target="_blank" class="btn btn-primary mt-auto">Daftar / Info Lebih Lanjut</a>` : 
                                '<span class="text-muted d-block mt-auto small">Pendaftaran ditutup.</span>'
                            }
                        </div>
                    </div>
                `;
                eventListContainer.appendChild(eventCard);
            });

        } catch (error) {
            console.error("Error saat memuat daftar event:", error);
            eventListContainer.innerHTML = '<p class="col-12 alert alert-danger">❌ Terjadi kesalahan koneksi saat memuat event. (Cek Konsol Browser/Server)</p>';
        }
    }
    
    // ========================================================
    // 2. FUNGSI HANDLER UNTUK FORM SEARCH
    // ========================================================
    window.searchEvents = () => {
        const query = searchInput.value.trim();
        loadEventList(query);
    };

    // ========================================================
    // 3. PEMANGGILAN AWAL
    // ========================================================
    loadEventList();
});