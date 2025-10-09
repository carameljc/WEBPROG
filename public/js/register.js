document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const formData = new FormData(event.target);
            const data = Object.fromEntries(formData.entries());
            const errorMessage = document.getElementById('error-message');
            try {
                const response = await fetch('http://localhost:3000/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                const result = await response.json();
                if (response.ok) {
                    alert(result.message);
                    window.location.href = '/login.html';
                } else {
                    errorMessage.textContent = result.message;
                }
            } catch (error) { errorMessage.textContent = 'Gagal mendaftar. Coba lagi nanti.'; }
        });
    }
});
