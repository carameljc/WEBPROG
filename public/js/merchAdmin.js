// public/js/merchAdmin.js

document.addEventListener('DOMContentLoaded', () => {
    const tbody = document.getElementById('merch-table-body');
    const formContainer = document.getElementById('form-merch-container');
    const form = document.getElementById('merch-form');
    const formTitle = document.getElementById('form-title');
    const merchIdInput = document.getElementById('merch-id');
    const showAddFormBtn = document.getElementById('show-add-form-btn');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    const imageFile = document.getElementById('imageFile');
    const imageHelp = document.getElementById('imageHelp');
    const statusMessage = document.getElementById('merchStatusMessage'); 

    let isEditMode = false;

    // ===============================================
    // FUNGSI UTILITY: NOTIFIKASI & FORM
    // ===============================================
    const showStatus = (message, isSuccess = false) => {
        statusMessage.textContent = message;
        statusMessage.classList.remove('d-none', 'alert-success', 'alert-danger', 'alert-warning');
        statusMessage.classList.add(isSuccess ? 'alert-success' : 'alert-danger');
        statusMessage.classList.remove('d-none');
        setTimeout(() => statusMessage.classList.add('d-none'), 5000);
    };

    function hideForm() {
        formContainer.style.display = 'none';
        form.reset();
        merchIdInput.value = '';
        isEditMode = false;
        imageHelp.textContent = '';
        formTitle.textContent = 'Tambah Produk Baru';
        imageFile.required = true; // Set required kembali untuk Tambah
    }

    // ===============================================
    // CRUD - READ: Memuat Data Produk
    // ===============================================
    async function loadProducts() {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">Memuat data produk...</td></tr>';
        try {
            const response = await fetch('/api/merch/products', { credentials: 'include' });
            const products = await response.json();
            
            tbody.innerHTML = '';
            if (products.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" class="text-center">Tidak ada produk tersedia.</td></tr>';
                return;
            }
            
            products.forEach(p => {
                const tr = document.createElement('tr');
                const imageSrc = p.image_url ? p.image_url : '/Foto/logo/default_merch.png';
                
                tr.innerHTML = `
                    <td><img src="${imageSrc}" style="width: 50px; height: 50px; object-fit: cover;" class="rounded"></td>
                    <td>${p.name}</td>
                    <td>Rp ${parseFloat(p.price).toLocaleString('id-ID')}</td>
                    <td><span class="badge ${p.stock > 0 ? 'bg-success' : 'bg-danger'}">${p.stock}</span></td>
                    <td>
                        <button class="btn btn-sm btn-warning edit-btn" 
                            data-id="${p.id}" data-name="${p.name}" data-price="${p.price}" data-stock="${p.stock}" data-url="${imageSrc}">
                            Edit
                        </button>
                        <button class="btn btn-sm btn-danger delete-btn" data-id="${p.id}" data-name="${p.name}">Hapus</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        } catch (error) {
            tbody.innerHTML = `<tr><td colspan="5" class="text-center text-danger">Gagal memuat data: ${error.message}</td></tr>`;
        }
    }

    // ===============================================
    // CRUD - CREATE/UPDATE (SAVE)
    // ===============================================
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = merchIdInput.value;
        const actionText = id ? 'diperbarui' : 'disimpan';
        
        // (a) Konfirmasi sebelum save/update (Kriteria UAS)
        if (!confirm(`Yakin ingin ${actionText} produk ${document.getElementById('name').value}?`)) {
            return;
        }

        const formData = new FormData(form);
        const url = id ? `/api/merch/product/${id}` : '/api/merch/product';
        const method = id ? 'PUT' : 'POST';

        showStatus(`⏳ Sedang ${actionText} produk...`, false);

        try {
            // (c) Melakukan CRUD (POST/PUT)
            const response = await fetch(url, { method: method, body: formData, credentials: 'include' });
            const result = await response.json();
            
            if (response.ok) {
                // (b) Notifikasi berhasil
                showStatus(`✅ Produk ${result.name || ''} berhasil ${actionText}!`, true);
                hideForm();
                loadProducts();
            } else {
                // (b) Notifikasi gagal
                throw new Error(result.message || `Gagal ${actionText}. Status: ${response.status}`);
            }
        } catch (error) {
            showStatus(`❌ Gagal ${actionText}: ${error.message}`, false);
        }
    });

    // ===============================================
    // CRUD - DELETE (HAPUS)
    // ===============================================
    tbody.addEventListener('click', async (event) => {
        const target = event.target;
        
        if (target.classList.contains('delete-btn')) {
            const id = target.dataset.id;
            const name = target.dataset.name;

            // (a) Konfirmasi sebelum delete (Kriteria UAS)
            if (!confirm(`Yakin ingin menghapus produk "${name}"? Aksi ini tidak dapat dibatalkan.`)) {
                return;
            }

            try {
                // (c) Melakukan CRUD (DELETE)
                const response = await fetch(`/api/merch/product/${id}`, { method: 'DELETE', credentials: 'include' });
                const result = await response.json();
                
                if (response.ok) {
                    // (b) Notifikasi berhasil
                    showStatus(`🗑️ Produk "${name}" berhasil dihapus.`, true);
                    loadProducts();
                } else {
                    // (b) Notifikasi gagal
                    throw new Error(result.message || 'Gagal menghapus produk.');
                }
            } catch (error) {
                showStatus(`❌ Gagal menghapus: ${error.message}`, false);
            }
        }
    });
    
    // ===============================================
    // HANDLER TAMBAH/EDIT FORM
    // ===============================================
    showAddFormBtn.addEventListener('click', () => hideForm() || showForm(null)); // Toggle
    cancelEditBtn.addEventListener('click', hideForm);

    function showForm(p) {
        if (p) {
            // EDIT MODE
            isEditMode = true;
            formTitle.textContent = 'Edit Produk: ' + p.name;
            merchIdInput.value = p.id;
            form.name.value = p.name;
            form.price.value = p.price;
            form.stock.value = p.stock;
            imageFile.required = false; // Tidak wajib upload ulang saat edit
            imageHelp.textContent = `Kosongkan input file jika tidak ingin mengubah gambar. Gambar saat ini: ${p.url.split('/').pop()}`;
        }
        formContainer.style.display = 'block';
    }

    // Delegasi event untuk tombol Edit di tabel
    tbody.addEventListener('click', (event) => {
        if (event.target.classList.contains('edit-btn')) {
            const btn = event.target;
            const p = {
                id: btn.dataset.id,
                name: btn.dataset.name,
                price: btn.dataset.price,
                stock: btn.dataset.stock,
                url: btn.dataset.url // Asumsi URL gambar dimasukkan ke data-url
            };
            showForm(p);
        }
    });

    loadProducts(); // Panggil saat halaman dimuat
});