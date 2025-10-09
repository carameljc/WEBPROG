document.addEventListener('DOMContentLoaded', () => {
    const tbody = document.getElementById('jemaat-table-body');
    const formContainer = document.getElementById('form-jemaat-container');
    const form = document.getElementById('jemaat-form');
    const formTitle = document.getElementById('form-title');
    const jemaatIdInput = document.getElementById('jemaat-id');
    const showAddFormBtn = document.getElementById('show-add-form-btn');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');

    async function muatDataJemaat() {
        try {
            const response = await fetch('http://localhost:3000/api/jemaat');
            if (!response.ok) { throw new Error('Gagal memuat data'); }
            const data = await response.json();
            tbody.innerHTML = '';
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

    function showForm(jemaat = null) {
        form.reset();
        if (jemaat) {
            formTitle.textContent = 'Edit Data Jemaat';
            jemaatIdInput.value = jemaat.id;
            form.nama_lengkap.value = jemaat.nama_lengkap;
            form.alamat.value = jemaat.alamat;
            form.nomor_telepon.value = jemaat.nomor_telepon;
            if (jemaat.tanggal_lahir) {
                form.tanggal_lahir.value = jemaat.tanggal_lahir.split('T')[0];
            }
            form.jenis_kelamin.value = jemaat.jenis_kelamin;
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
            muatDataJemaat();
        } catch (error) {
            alert(`Gagal menyimpan data: ${error.message}`);
        }
    });

    tbody.addEventListener('click', async (event) => {
        if (event.target.classList.contains('delete-btn')) {
            const id = event.target.dataset.id;
            if (confirm(`Yakin ingin menghapus data ini?`)) {
                await fetch(`http://localhost:3000/api/jemaat/${id}`, { method: 'DELETE' });
                muatDataJemaat();
            }
        }
        if (event.target.classList.contains('edit-btn')) {
            const jemaatData = JSON.parse(event.target.dataset.jemaat);
            showForm(jemaatData);
        }
    });
    muatDataJemaat();
});
