document.addEventListener('DOMContentLoaded', () => {
    const tbody = document.getElementById('jemaat-table-body');
    const formContainer = document.getElementById('form-jemaat-container');
    const form = document.getElementById('jemaat-form');
    const formTitle = document.getElementById('form-title');
    const jemaatIdInput = document.getElementById('jemaat-id');
    const showAddFormBtn = document.getElementById('show-add-form-btn');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    
    // 🚨 Ambil elemen filter/sorting/pencarian yang baru ditambahkan
    const searchSortForm = document.getElementById('search-sort-form'); // Form kontainer
    const searchInput = document.getElementById('search-input'); // Input Pencarian
    const sortBy = document.getElementById('sort-by'); // Dropdown Urutkan Berdasarkan
    const sortOrder = document.getElementById('sort-order'); // Dropdown ASC/DESC


    async function muatDataJemaat(params = {}) { 
        let url = 'http://localhost:3000/api/jemaat';
        
        // Konversi objek params menjadi URL query string
        const queryString = new URLSearchParams(params).toString();
        if (queryString) {
            url += '?' + queryString;
        }

        tbody.innerHTML = '<tr><td colspan="4" style="text-align: center;">Memuat data...</td></tr>';
        
        try {
            const response = await fetch(url);
            
            if (response.status === 403) {
                 tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: red;">Akses Ditolak. Halaman ini hanya untuk Admin.</td></tr>';
                 return;
            }
            if (!response.ok) { throw new Error('Gagal memuat data'); }
            
            const data = await response.json();
            tbody.innerHTML = '';

            if (data.length === 0) {
                 tbody.innerHTML = '<tr><td colspan="4" style="text-align: center;">Tidak ada data jemaat yang ditemukan.</td></tr>';
                 return;
            }
            
            data.forEach(jemaat => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${jemaat.nama_lengkap}</td>
                    <td>${jemaat.alamat || '-'}</td>
                    <td>${jemaat.nomor_telepon || '-'}</td>
                    <td>
                        <button class="edit-btn" data-jemaat='${JSON.stringify(jemaat)}'>Edit</button>
                        <button class="delete-btn" data-id="${jemaat.id}">Hapus</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        } catch (error) {
            tbody.innerHTML = `<tr><td colspan="4">Gagal memuat data: ${error.message}</td></tr>`;
        }
    }


    // 🚨 FUNGSI PERBAIKAN: Mengambil nilai kontrol dari ID elemen
    const triggerLoad = (event) => {
        // Mencegah form submit default jika dipanggil dari listener
        if (event) event.preventDefault(); 
        
        const params = {
            // Ambil nilai langsung dari elemen-elemen
            search: searchInput ? searchInput.value : '',
            sort_by: sortBy ? sortBy.value : 'nama_lengkap',
            sort_order: sortOrder ? sortOrder.value : 'ASC'
        };
        
        // Menghapus nilai kosong agar URL bersih
        for (const key in params) {
            if (!params[key]) {
                delete params[key];
            }
        }
        muatDataJemaat(params);
    };


    function showForm(jemaat = null) {
        form.reset();
        if (jemaat) {
            formTitle.textContent = 'Edit Data Jemaat';
            jemaatIdInput.value = jemaat.id;
            form.nama_lengkap.value = jemaat.nama_lengkap || '';
            form.alamat.value = jemaat.alamat || '';
            form.nomor_telepon.value = jemaat.nomor_telepon || '';
            
            if (form.tempat_lahir) form.tempat_lahir.value = jemaat.tempat_lahir || '';
            if (form.email) form.email.value = jemaat.email || '';
            
            if (jemaat.tanggal_lahir) {
                form.tanggal_lahir.value = jemaat.tanggal_lahir.split('T')[0];
            } else {
                 form.tanggal_lahir.value = '';
            }
            form.jenis_kelamin.value = jemaat.jenis_kelamin || 'Laki-laki';
            
        } else {
            formTitle.textContent = 'Tambah Jemaat Baru';
            jemaatIdInput.value = '';
        }
        formContainer.style.display = 'block';
    }

    function hideForm() {
        formContainer.style.display = 'none';
        form.reset();
        jemaatIdInput.value = '';
    }

    showAddFormBtn.addEventListener('click', () => showForm());
    cancelEditBtn.addEventListener('click', hideForm);

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const id = jemaatIdInput.value;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        if (!id) { delete data.id; }
        
        const url = id ? `http://localhost:3000/api/jemaat/${id}` : 'http://localhost:3000/api/jemaat';
        const method = id ? 'PUT' : 'POST';
        
        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message);
            }
            hideForm();
            triggerLoad(); // Muat ulang data
        } catch (error) {
            alert(`Gagal menyimpan data: ${error.message}`);
        }
    });

    tbody.addEventListener('click', async (event) => {
        if (event.target.classList.contains('delete-btn')) {
            const id = event.target.dataset.id;
            if (confirm(`Yakin ingin menghapus data ini?`)) {
                await fetch(`http://localhost:3000/api/jemaat/${id}`, { method: 'DELETE' });
                triggerLoad(); // Muat ulang data
            }
        }
        if (event.target.classList.contains('edit-btn')) {
            const jemaatData = JSON.parse(event.target.dataset.jemaat);
            showForm(jemaatData);
        }
    });
    
    
    // 🚨 Listener untuk Pencarian dan Sorting
    if (searchSortForm) {
        // Panggil triggerLoad saat tombol submit di form pencarian diklik
        searchSortForm.addEventListener('submit', triggerLoad);
        
        // Panggil triggerLoad saat sorting dropdown diubah
        if (sortBy) sortBy.addEventListener('change', triggerLoad);
        if (sortOrder) sortOrder.addEventListener('change', triggerLoad);
    }
    
    
    // 🚨 Panggil fungsi saat halaman pertama kali dimuat
    triggerLoad();
});