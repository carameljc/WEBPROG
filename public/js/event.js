// public/js/event.js (Kode Diperbaiki)

document.addEventListener('DOMContentLoaded', () => {
    const eventListContainer = document.getElementById('eventList');

    async function loadEventList() {
        eventListContainer.innerHTML = '<p>Sedang memuat event...</p>';

        try {
            const response = await fetch('/api/event/daftar');
            
            if (!response.ok) {
                throw new Error(`Gagal mengambil data dari server. (Status: ${response.status})`);
            }

            const result = await response.json();
            
            if (!result.success) {
                eventListContainer.innerHTML = `<p class="error-message">❌ ${result.message || 'Gagal memuat event dari server.'}</p>`;
                return;
            }

            const events = result.data;
            
            if (events.length === 0) {
                eventListContainer.innerHTML = '<p>Belum ada event gereja yang tersedia saat ini.</p>';
                return;
            }

            eventListContainer.innerHTML = ''; 

            events.forEach(event => {
                const eventCard = document.createElement('div');
                eventCard.className = 'event-card'; 

                // Baris dateDisplay sudah dihapus dari sini (benar)

                eventCard.innerHTML = `
                    <div class="event-poster">
                        <img src="/uploads/${event.poster}" alt="Poster Event: ${event.nama_event}">
                    </div>
                    <div class="event-info">
                        <h3>${event.nama_event}</h3>
                        
                        ${event.link_gform ? 
                            `<a href="${event.link_gform}" target="_blank" class="btn-primary">Daftar / Info Lebih Lanjut</a>` : 
                            '<span class="info-text">Informasi pendaftaran belum tersedia.</span>'
                        }
                    </div>
                `;
                eventListContainer.appendChild(eventCard);
            });

        } catch (error) {
            console.error("Error saat memuat daftar event:", error);
            eventListContainer.innerHTML = '<p class="error-message">❌ Terjadi kesalahan koneksi saat memuat event. (Cek Konsol Browser/Server)</p>';
        }
    }

    loadEventList();
});