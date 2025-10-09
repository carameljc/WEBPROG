document.addEventListener('DOMContentLoaded', async () => {
    const body = document.body;
    const userNameSpan = document.getElementById('user-name');
    const logoutBtn = document.getElementById('logout-btn');

    // Cek jika elemen header di halaman ini kosong, dan salin navigasi dari index.html jika ada
    const currentHeader = document.querySelector('header');
    if (currentHeader && !currentHeader.hasChildNodes() && window.location.pathname !== '/index.html') {
        // Ini adalah trik untuk tidak menulis ulang navigasi di setiap file HTML.
        // Cukup salin dari index.html.
        fetch('/index.html')
            .then(res => res.text())
            .then(htmlString => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(htmlString, 'text/html');
                const nav = doc.querySelector('nav');
                if (nav) {
                    currentHeader.appendChild(nav);
                }
            });
    }

    try {
        const response = await fetch('http://localhost:3000/api/auth/status');
        const data = await response.json();
        if (data.success) {
            body.classList.add('logged-in');
            if (data.user.role === 'admin') {
                body.classList.add('role-admin');
            } else if (data.user.role === 'jemaat') {
                body.classList.add('role-jemaat');
            }
            if(userNameSpan) userNameSpan.textContent = data.user.nama_lengkap;
        } else {
            body.classList.remove('logged-in', 'role-admin', 'role-jemaat');
        }
    } catch (error) {
        body.classList.remove('logged-in', 'role-admin', 'role-jemaat');
    }

    // Event listener untuk logout perlu delegasi karena header bisa jadi di-load secara dinamis
    document.addEventListener('click', async (event) => {
        if (event.target && event.target.id === 'logout-btn') {
            await fetch('http://localhost:3000/api/auth/logout', { method: 'POST' });
            window.location.href = '/index.html';
        }
    });
});
