// public/js/merchandise.js

document.addEventListener('DOMContentLoaded', () => {
    const productContainer = document.getElementById('productContainer');
    const cartCount = document.getElementById('cartCount');
    const cartItemsList = document.getElementById('cartItemsList');
    const cartSummary = document.getElementById('cartSummary');
    const cartModal = new bootstrap.Modal(document.getElementById('cartModal'));

    let cart = JSON.parse(localStorage.getItem('merchCart')) || {}; // Keranjang di Local Storage

    // Fungsi untuk memperbarui jumlah item di ikon keranjang
    const updateCartCount = () => {
        const totalItems = Object.values(cart).reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
    };

    // Fungsi utama: Memuat daftar produk dari backend
    async function loadProducts() {
        try {
            const response = await fetch('/api/merch/products');
            const products = await response.json();
            
            productContainer.innerHTML = '';
            if (products.length === 0) {
                productContainer.innerHTML = '<p class="col-12 text-center">Belum ada produk yang dijual saat ini.</p>';
                return;
            }

            products.forEach(product => {
                const productCard = document.createElement('div');
                productCard.className = 'col-6 col-md-4 col-lg-3'; // Responsive grid
                
                // Cek ketersediaan stok
                const isOutOfStock = product.stock <= 0;
                
                productCard.innerHTML = `
                    <div class="card h-100 shadow-sm ${isOutOfStock ? 'bg-light text-muted' : ''}">
                        <img src="${product.image_url || '/Foto/logo/default_merch.png'}" class="card-img-top" alt="${product.name}" style="height: 200px; object-fit: cover;">
                        <div class="card-body d-flex flex-column">
                            <h5 class="card-title">${product.name}</h5>
                            <p class="card-text text-success fw-bold">Rp ${product.price.toLocaleString('id-ID')}</p>
                            <p class="card-text small text-info">Stok: ${product.stock}</p>
                            ${isOutOfStock 
                                ? '<button class="btn btn-secondary mt-auto" disabled>Stok Habis</button>'
                                : `<button class="btn btn-primary mt-auto add-to-cart-btn" data-id="${product.id}" data-name="${product.name}" data-price="${product.price}" data-stock="${product.stock}">Beli</button>`
                            }
                        </div>
                    </div>
                `;
                productContainer.appendChild(productCard);
            });
            
            updateCartCount(); // Perbarui hitungan keranjang setelah load
        } catch (error) {
            productContainer.innerHTML = '<p class="col-12 text-danger">Gagal memuat daftar produk.</p>';
        }
    }

    // Fungsi untuk menangani penambahan ke keranjang
    productContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('add-to-cart-btn')) {
            const btn = e.target;
            const id = btn.dataset.id;
            const name = btn.dataset.name;
            const price = parseFloat(btn.dataset.price);
            const stock = parseInt(btn.dataset.stock);

            // Cek apakah item sudah ada di keranjang
            const currentQty = cart[id] ? cart[id].quantity : 0;
            
            if (currentQty >= stock) {
                alert(`Maaf, stok ${name} hanya tersisa ${stock}.`);
                return;
            }

            cart[id] = { 
                id, name, price, stock, 
                quantity: currentQty + 1 
            };
            
            localStorage.setItem('merchCart', JSON.stringify(cart));
            updateCartCount();
            alert(`${name} ditambahkan ke keranjang!`);
        }
    });

    // --- LOGIKA MODAL KERANJANG & CHECKOUT ---
    
    // Tampilkan isi keranjang di modal
    document.getElementById('viewCartBtn').addEventListener('click', () => {
        cartItemsList.innerHTML = '';
        let totalPrice = 0;
        const currentCart = Object.values(cart);

        if (currentCart.length === 0) {
            cartItemsList.innerHTML = '<p class="text-center text-muted">Keranjang Anda kosong.</p>';
            cartSummary.innerHTML = '';
            document.getElementById('checkoutBtn').disabled = true;
            return;
        }

        const table = document.createElement('table');
        table.className = 'table';
        table.innerHTML = `
            <thead>
                <tr><th>Produk</th><th>Harga</th><th>Jumlah</th><th>Subtotal</th></tr>
            </thead>
            <tbody>
            </tbody>
        `;
        const tbody = table.querySelector('tbody');

        currentCart.forEach(item => {
            const subtotal = item.price * item.quantity;
            totalPrice += subtotal;
            
            const row = tbody.insertRow();
            row.innerHTML = `
                <td>${item.name}</td>
                <td>Rp ${item.price.toLocaleString('id-ID')}</td>
                <td>
                    <input type="number" min="1" max="${item.stock}" value="${item.quantity}" class="form-control form-control-sm cart-qty-input" data-id="${item.id}" style="width: 70px;">
                </td>
                <td>Rp ${subtotal.toLocaleString('id-ID')}</td>
            `;
        });
        
        cartItemsList.appendChild(table);
        cartSummary.innerHTML = `<h4>Total: Rp ${totalPrice.toLocaleString('id-ID')}</h4>`;
        document.getElementById('checkoutBtn').disabled = false;
        cartModal.show();
    });

    // Logika Checkout (Perlu dikembangkan di backend!)
    document.getElementById('checkoutBtn').addEventListener('click', async () => {
        if (confirm('Yakin ingin menyelesaikan pembelian dan melanjutkan pembayaran?')) {
            // Ambil data user dari session/auth check (asumsi authCheck.js menyediakan user ID)
            const userId = (await fetch('/api/auth/status')).user.id; 
            
            // Siapkan payload untuk API Sales Transaction
            const payload = {
                items: Object.values(cart).map(item => ({
                    product_id: item.id,
                    quantity: item.quantity,
                    price_at_sale: item.price
                })),
                user_id: userId
            };

            try {
                // Panggil API Checkout (endpoint baru yang akan Anda buat)
                const response = await fetch('/api/merch/checkout', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                    credentials: 'include'
                });
                
                if (response.ok) {
                    alert('Pembelian berhasil! Stok produk telah diperbarui. Silakan cek laporan admin.');
                    localStorage.removeItem('merchCart'); // Kosongkan keranjang
                    window.location.reload(); 
                } else {
                    alert('Gagal Checkout: Periksa stok atau status login Anda.');
                }
            } catch (error) {
                alert('Error jaringan saat checkout.');
            }
        }
    });
    
    // Logika Hapus Keranjang
    document.getElementById('clearCartBtn').addEventListener('click', () => {
        if (confirm('Anda yakin ingin mengosongkan seluruh isi keranjang?')) {
            cart = {};
            localStorage.removeItem('merchCart');
            updateCartCount();
            cartModal.hide();
            alert('Keranjang kosong!');
        }
    });

    loadProducts(); // Panggil saat halaman dimuat
});