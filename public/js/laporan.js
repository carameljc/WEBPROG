document.addEventListener('DOMContentLoaded', () => {
    const tbody = document.getElementById('laporan-table-body');
    const filterForm = document.getElementById('filter-form');

    // Fungsi utama untuk memuat data (dengan parameter filter)
    async function muatDataLaporan(params = {}) {
        let url = '/api/jemaat';
        
        // Konversi objek params menjadi URL query string (misal: ?jenis_kelamin=Laki-laki)
        const queryString = new URLSearchParams(params).toString();
        if (queryString) {
            url += '?' + queryString;
        }

        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Memuat data...</td></tr>';
        
        try {
            const response = await fetch(url);
            
            // Cek otentikasi/otorisasi
            if (response.status === 403 || response.status === 401) {
                // Di sini, main.js seharusnya sudah mengurus redirect, tapi ini untuk jaga-jaga
                tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: red;">Akses Ditolak. Fitur ini hanya untuk Admin.</td></tr>';
                return;
            }
            if (!response.ok) {
                throw new Error('Gagal memuat data laporan.');
            }
            
            const data = await response.json();
            tbody.innerHTML = '';

            if (data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Tidak ada data jemaat yang ditemukan sesuai filter.</td></tr>';
                return;
            }

            data.forEach(jemaat => {
                const tr = document.createElement('tr');
                
                // Format tanggal menjadi DD/MM/YYYY
                const tglLahir = jemaat.tanggal_lahir 
                    ? new Date(jemaat.tanggal_lahir).toLocaleDateString('id-ID') 
                    : '-';

                tr.innerHTML = `
                    <td>${jemaat.nama_lengkap}</td>
                    <td>${jemaat.alamat || '-'}</td>
                    <td>${jemaat.nomor_telepon || '-'}</td>
                    <td>${jemaat.jenis_kelamin || '-'}</td>
                    <td>${tglLahir}</td>
                `;
                tbody.appendChild(tr);
            });
        } catch (error) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: red;">Error: ${error.message}</td></tr>`;
        }
    }

    // Listener untuk menangani filter dan pencarian
    if (filterForm) {
        filterForm.addEventListener('submit', (event) => {
            event.preventDefault();
            
            const formData = new FormData(filterForm);
            const params = Object.fromEntries(formData.entries());

            // Hilangkan parameter yang kosong
            for (const key in params) {
                if (!params[key]) {
                    delete params[key];
                }
            }
            
            muatDataLaporan(params);
        });
    }

    // Muat data awal tanpa filter saat halaman dimuat
    muatDataLaporan();
});