// public/js/merchandise.js

document.addEventListener('DOMContentLoaded', () => {
    loadMerchandise();
    setupCheckoutListeners(); // Panggil fungsi baru
});

let availableProducts = []; // Menyimpan data produk yang dimuat

async function loadMerchandise() {
    const listContainer = document.getElementById('merchandiseList');
    const statusMessage = document.getElementById('statusMessage');
    listContainer.innerHTML = '<p class="text-center w-100">Memuat daftar produk...</p>';
    
    const apiUrl = '/api/merch/products'; 

    try {
        const response = await fetch(apiUrl);
        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.message || 'Gagal mengambil data merchandise dari server.');
        }

        availableProducts = result.data; // Simpan data produk
        
        listContainer.innerHTML = ''; 

        if (availableProducts.length === 0) {
            listContainer.innerHTML = '<p class="text-center w-100">Belum ada *merchandise* yang tersedia saat ini.</p>';
            return;
        }

        availableProducts.forEach(item => {
            const price = parseFloat(item.price).toLocaleString('id-ID');
            
            // Perbaikan Path Gambar
            const merchImagePath = item.imageUrl 
                ? `/images/merch/${item.imageUrl}` 
                : '/images/default_merch.jpg'; 
            
            const itemHtml = `
                <div class="col">
                    <div class="card h-100 shadow-sm">
                        <img src="${merchImagePath}" class="card-img-top" alt="${item.name}" style="height: 200px; object-fit: cover;">
                        <div class="card-body d-flex flex-column">
                            <h5 class="card-title">${item.name}</h5>
                            <p class="card-text flex-grow-1">${item.description ? item.description.substring(0, 100) : ''}...</p>
                            <h4 class="text-success mt-auto" data-price-value="${item.price}">Rp ${price}</h4>
                            <button class="btn btn-primary mt-2 buy-btn" 
                                    data-id="${item.id}" 
                                    data-name="${item.name}" 
                                    data-price="${item.price}">Beli Sekarang</button>
                        </div>
                    </div>
                </div>
            `;
            listContainer.insertAdjacentHTML('beforeend', itemHtml);
        });

    } catch (error) {
        console.error("Error loading merchandise:", error);
        listContainer.innerHTML = `<p class="text-center w-100 text-danger">Gagal memuat produk. Error: ${error.message}</p>`;
        statusMessage.textContent = 'Gagal memuat produk.';
        statusMessage.classList.remove('d-none', 'alert-info');
        statusMessage.classList.add('alert-danger');
    }
}

// =========================================================
// FITUR CHECKOUT
// =========================================================

function setupCheckoutListeners() {
    const checkoutModalElement = document.getElementById('checkoutModal');
    const checkoutQuantityInput = document.getElementById('checkoutQuantity');
    const checkoutForm = document.getElementById('checkoutForm');
    const listContainer = document.getElementById('merchandiseList');

    // 1. LISTENER KLIK TOMBOL 'BELI SEKARANG'
    listContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('buy-btn')) {
            const btn = e.target;
            const id = btn.dataset.id;
            const name = btn.dataset.name;
            const price = parseFloat(btn.dataset.price);

            // Isi modal
            document.getElementById('checkoutProductName').textContent = name;
            document.getElementById('checkoutProductId').value = id;
            document.getElementById('checkoutPriceAtSale').value = price;
            document.getElementById('checkoutQuantity').value = 1;

            updateTotal(price); // Hitung total awal

            // Tampilkan modal
            const myModal = new bootstrap.Modal(checkoutModalElement);
            myModal.show();
        }
    });

    // 2. LISTENER PERUBAHAN QUANTITY
    checkoutQuantityInput.addEventListener('input', () => {
        const quantity = parseInt(checkoutQuantityInput.value) || 0;
        const price = parseFloat(document.getElementById('checkoutPriceAtSale').value);
        updateTotal(price, quantity);
    });

    // 3. LISTENER SUBMIT FORM CHECKOUT
    checkoutForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const quantity = parseInt(document.getElementById('checkoutQuantity').value);
        const productId = document.getElementById('checkoutProductId').value;
        const priceAtSale = parseFloat(document.getElementById('checkoutPriceAtSale').value);

        if (quantity < 1) {
            alert("Jumlah pembelian harus minimal 1.");
            return;
        }

        const transactionData = {
            items: [{
                product_id: productId,
                quantity: quantity,
                price_at_sale: priceAtSale // Menggunakan harga saat ini
            }]
        };

        try {
            const response = await fetch('/api/merch/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(transactionData),
            });
            const result = await response.json();

            // Tutup modal
            bootstrap.Modal.getInstance(checkoutModalElement).hide();

            if (response.ok) {
                alert(`✅ Checkout Berhasil! Total: Rp ${result.total_paid ? result.total_paid.toLocaleString('id-ID') : (priceAtSale * quantity).toLocaleString('id-ID')}`);
                loadMerchandise(); // Muat ulang daftar produk untuk update stok
            } else if (response.status === 401) {
                alert("❌ Pembelian gagal: Anda harus login terlebih dahulu.");
            } else {
                alert(`❌ Pembelian gagal: ${result.message}`);
            }

        } catch (error) {
            console.error("Error during checkout:", error);
            alert('Error jaringan atau server saat memproses checkout.');
        }
    });
}

// Fungsi bantu untuk update total bayar
function updateTotal(price, quantity = 1) {
    const qty = parseInt(document.getElementById('checkoutQuantity').value) || 0;
    const total = price * qty;
    document.getElementById('checkoutTotalAmount').textContent = total.toLocaleString('id-ID');
}