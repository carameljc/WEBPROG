document.addEventListener('DOMContentLoaded', () => {
    const eventCardContainer = document.getElementById('eventCardContainer');
    const searchInput = document.getElementById('searchInput');
    const searchForm = document.getElementById('searchForm');

    async function loadEventList(searchQuery = '') {
        // Tampilan loading yang bersih
        eventCardContainer.innerHTML = '<p class="col-12 text-center text-muted py-5">Memuat daftar event...</p>';
        
        let url = `/api/event/daftar${searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ''}`;

        try {
            const response = await fetch(url);
            const result = await response.json();

            if (!result.success || result.data.length === 0) {
                eventCardContainer.innerHTML = `
                    <div class="col-12 text-center py-5">
                        <p class="alert alert-info d-inline-block px-5 shadow-sm">
                            Tidak ada event ditemukan ${searchQuery ? `untuk "${searchQuery}"` : ''}.
                        </p>
                    </div>`;
                return;
            }

            eventCardContainer.innerHTML = '';
            
            result.data.forEach(event => {
                const posterPath = `/eventPosters/${event.poster}`;
                
                // Struktur HTML Card yang sinkron dengan style.css (Borderless)
                const cardHtml = `
                    <div class="col">
                        <div class="event-card">
                            <div class="event-poster-container">
                                <img src="${posterPath}" alt="${event.nama_event}" class="event-poster">
                                <div class="event-info-overlay">
                                    <h5 class="m-0">${event.nama_event}</h5>
                                </div>
                            </div>
                            <div class="card-body p-4 text-center">
                                ${event.link_gform ? 
                                    `<a href="${event.link_gform}" target="_blank" class="btn btn-daftar-event w-100">
                                        Daftar / Info Lebih Lanjut
                                     </a>` : 
                                    `<button class="btn btn-secondary w-100" disabled>Pendaftaran Ditutup</button>`
                                }
                            </div>
                        </div>
                    </div>`;
                eventCardContainer.insertAdjacentHTML('beforeend', cardHtml);
            });
        } catch (e) {
            console.error("Fetch error:", e);
            eventCardContainer.innerHTML = '<p class="col-12 text-danger text-center py-5">Gagal terhubung ke server. Silakan coba lagi nanti.</p>';
        }
    }

    // Fungsi Pencarian
    window.searchEvents = () => loadEventList(searchInput.value.trim());

    // Reset list saat input pencarian dikosongkan (X button atau backspace)
    searchInput.addEventListener('input', () => { 
        if(searchInput.value.trim() === '') {
            loadEventList(''); 
        } 
    });

    // Menangani pencarian saat form disubmit (Enter)
    if (searchForm) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            window.searchEvents();
        });
    }

    // Pemanggilan awal saat halaman dibuka
    loadEventList();
});