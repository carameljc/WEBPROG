document.addEventListener('DOMContentLoaded', () => {
    const uploadForm = document.getElementById('upload-form');
    const uploadStatus = document.getElementById('upload-status');
    const adminGalleryContainer = document.getElementById('admin-gallery-container');

    async function loadAdminGallery() {
        try {
            const response = await fetch('http://localhost:3000/api/gallery', { credentials: 'include' });
            const items = await response.json();
            adminGalleryContainer.innerHTML = '';

            items.forEach(item => {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'gallery-item-admin';
                
                let mediaElement = '';
                if (item.file_type === 'image') {
                    mediaElement = `<img src="${item.file_path}" alt="${item.caption}">`;
                } else {
                    mediaElement = `<video controls><source src="${item.file_path}"></video>`;
                }

                itemDiv.innerHTML = `
                    <div class="media-wrapper">${mediaElement}</div>
                    <div class="caption-wrapper">
                        <h4>${item.event_name || ''}</h4>
                        <p>${item.caption || ''}</p>
                        <button class="deleteGalleryBtn" data-id="${item.id}">Hapus</button>
                    </div>
                `;
                adminGalleryContainer.appendChild(itemDiv);
            });
        } catch (error) {
            adminGalleryContainer.innerHTML = '<p>Gagal memuat galeri. Pastikan Anda sudah login sebagai admin.</p>';
        }
    }

    adminGalleryContainer.addEventListener('click', async (event) => {
        if (event.target.classList.contains('deleteGalleryBtn')) {
            const id = event.target.dataset.id;
            if (confirm('Apakah Anda yakin ingin menghapus media ini?')) {
                try {
                    const response = await fetch(`http://localhost:3000/api/gallery/${id}`, {
                        method: 'DELETE',
                        credentials: 'include'
                    });
                    if (response.ok) {
                        loadAdminGallery();
                    } else {
                        const err = await response.json();
                        alert(`Gagal menghapus media: ${err.message}`);
                    }
                } catch (error) {
                    alert('Error koneksi saat mencoba menghapus.');
                }
            }
        }
    });

    uploadForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const formData = new FormData(uploadForm);
        uploadStatus.textContent = 'Mengunggah...';

        try {
            const response = await fetch('http://localhost:3000/api/gallery/upload', {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });
            const result = await response.json();
            if (response.ok) {
                uploadStatus.textContent = result.message;
                uploadForm.reset();
                loadAdminGallery();
            } else {
                uploadStatus.textContent = `Gagal: ${result.message}`;
            }
        } catch (error) {
            uploadStatus.textContent = 'Error koneksi ke server.';
        }
    });

    loadAdminGallery();
});