document.addEventListener('DOMContentLoaded', () => {
    const tbody = document.getElementById('jemaat-table-body');
    const formContainer = document.getElementById('form-jemaat-container');
    const form = document.getElementById('jemaat-form');
    const formTitle = document.getElementById('form-title');
    const jemaatIdInput = document.getElementById('jemaat-id');
    const showAddFormBtn = document.getElementById('show-add-form-btn');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    
    const searchSortForm = document.getElementById('search-sort-form');
    const searchInput = document.getElementById('search-input');
    const sortBy = document.getElementById('sort-by');
    const sortOrder = document.getElementById('sort-order');

    async function muatDataJemaat(params = {}) { 
        let url = 'http://localhost:3000/api/jemaat';
        const queryString = new URLSearchParams(params).toString();
        if (queryString) {
            url += '?' + queryString;
        }

        tbody.innerHTML = '<tr><td colspan="4" style="text-align: center;">Memuat data...</td></tr>';
        
        try {
            const response = await fetch(url, { credentials: 'include' });
            
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

    const triggerLoad = (event) => {
        if (event) event.preventDefault(); 
        const params = {
            search: searchInput ? searchInput.value : '',
            sort_by: sortBy ? sortBy.value : 'nama_lengkap',
            sort_order: sortOrder ? sortOrder.value : 'ASC'
        };
        for (const key in params) {
            if (!params[key]) { delete params[key]; }
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
            if (jemaat.tanggal_lahir) {
                form.tanggal_lahir.value = jemaat.tanggal_lahir.split('T')[0];
            } else {
                form.tanggal_lahir.value = '';
            }
            form.jenis_kelamin.value = jemaat.jenis_kelamin || '';
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
        const data = Object.fromEntries(new FormData(form).entries());
        if (!id) { delete data.id; }
        
        const url = id ? `http://localhost:3000/api/jemaat/${id}` : 'http://localhost:3000/api/jemaat';
        const method = id ? 'PUT' : 'POST';
        
        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
                credentials: 'include'
            });
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message);
            }
            hideForm();
            triggerLoad();
        } catch (error) {
            alert(`Gagal menyimpan data: ${error.message}`);
        }
    });

    tbody.addEventListener('click', async (event) => {
        if (event.target.classList.contains('delete-btn')) {
            const id = event.target.dataset.id;
            if (confirm(`Yakin ingin menghapus data ini?`)) {
                await fetch(`http://localhost:3000/api/jemaat/${id}`, { method: 'DELETE', credentials: 'include' });
                triggerLoad();
            }
        }
        if (event.target.classList.contains('edit-btn')) {
            const jemaatData = JSON.parse(event.target.dataset.jemaat);
            showForm(jemaatData);
        }
    });
    
    if (searchSortForm) {
        searchSortForm.addEventListener('submit', triggerLoad);
        if (sortBy) sortBy.addEventListener('change', triggerLoad);
        if (sortOrder) sortOrder.addEventListener('change', triggerLoad);
    }
    
    triggerLoad();
});