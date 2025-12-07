// public/js/report.js

document.addEventListener('DOMContentLoaded', () => {
    const reportTableBody = document.getElementById('reportTableBody');
    const searchInput = document.getElementById('searchInput');

    // [b] & [c] Fungsi untuk memuat dan menampilkan laporan (termasuk search)
    window.loadReport = async (event) => {
        if (event) event.preventDefault();
        
        const searchQuery = searchInput.value.trim();
        let url = '/api/transaction/report';
        
        // Menambahkan query parameter untuk Search/Filter
        if (searchQuery) {
            url += `?q=${encodeURIComponent(searchQuery)}`;
        }
        
        reportTableBody.innerHTML = '<tr><td colspan="5" class="text-center">Memuat data laporan...</td></tr>';

        try {
            const response = await fetch(url, { credentials: 'include' });
            
            if (!response.ok) {
                throw new Error(`Gagal memuat data. Status: ${response.status}`);
            }

            const result = await response.json();
            const transactions = result.transactions;
            reportTableBody.innerHTML = '';

            if (transactions.length === 0) {
                reportTableBody.innerHTML = `<tr><td colspan="5" class="text-center">Tidak ada transaksi ditemukan ${searchQuery ? 'untuk kriteria ini.' : 'saat ini.'}</td></tr>`;
                return;
            }

            transactions.forEach(t => {
                const date = new Date(t.transaction_date).toLocaleDateString('id-ID', {
                    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                });
                
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${t.id}</td>
                    <td>${date}</td>
                    <td>${t.username}</td>
                    <td>Rp ${parseFloat(t.total_amount).toLocaleString('id-ID')}</td>
                    <td><button class="btn btn-sm btn-info detail-btn" data-id="${t.id}">Lihat Detail</button></td>
                `;
                reportTableBody.appendChild(tr);
            });

        } catch (error) {
            console.error("Error fetching report:", error);
            reportTableBody.innerHTML = `<tr><td colspan="5" class="text-center text-danger">❌ Gagal memuat data: ${error.message}</td></tr>`;
        }
    };
    
    // Initial Load
    loadReport();
    
    // Tambahkan event listener untuk tombol Detail (jika Anda mengimplementasikan pop-up detail)
    reportTableBody.addEventListener('click', (e) => {
        if (e.target.classList.contains('detail-btn')) {
            const transactionId = e.target.dataset.id;
            // Di sini Anda bisa memanggil API baru untuk mendapatkan detail_item berdasarkan transactionId
            alert(`Fungsi Detail Transaksi ID: ${transactionId} (Perlu implementasi API /api/transaction/detail/:id)`);
        }
    });

});