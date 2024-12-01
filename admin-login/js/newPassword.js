document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('newPasswordForm');
    const errorMessageEl = document.getElementById('errorMessage');
    
    // Function to get URL parameter
    const getUrlParameter = (name) => {
        name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
        const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
        const results = regex.exec(location.search);
        return results === null ? '' : decodeURIComponent(results[1]);
    };

    // Get reset token from URL
    const resetToken = getUrlParameter('token');

    if (!resetToken) {
        errorMessageEl.textContent = 'Invalid or missing reset token';
        errorMessageEl.style.display = 'block';
        form.querySelector('button').disabled = true;
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Reset error message
        errorMessageEl.textContent = '';
        errorMessageEl.style.display = 'none';

        // Get password inputs
        const passwordInput = document.getElementById('password');
        const confirmPasswordInput = document.getElementById('confirm-password');

        // Validate passwords match
        if (passwordInput.value !== confirmPasswordInput.value) {
            errorMessageEl.textContent = 'Passwords do not match';
            errorMessageEl.style.display = 'block';
            return;
        }

        // Validate password strength (example criteria)
        if (passwordInput.value.length < 6) {
            errorMessageEl.textContent = 'Password must be at least 6 characters long';
            errorMessageEl.style.display = 'block';
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/resetPassword', { // Change in prode
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token: resetToken,
                    newPassword: passwordInput.value
                })
            });

            const result = await response.json();

            if (response.ok) {
                // Success scenario
                alert('Password reset successfully. Redirecting to login...');
                // Redirect to login page
                window.location.href = '/admin-login/login.html';
            } else {
                // Error scenario
                errorMessageEl.textContent = result.message || 'Failed to reset password';
                errorMessageEl.style.display = 'block';
            }
        } catch (error) {
            console.error('Error:', error);
            errorMessageEl.textContent = 'Network error. Please try again.';
            errorMessageEl.style.display = 'block';
        }
    });
});
