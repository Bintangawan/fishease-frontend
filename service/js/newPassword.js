API_URL = 'http://localhost:3000'; // Change in prod

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('newPasswordForm');
    const errorMessageEl = document.getElementById('errorMessage');

    function createLoadingOverlay() {
        const overlay = document.createElement('div');
        overlay.innerHTML = `
        <link rel="stylesheet" href="css/loading.css" />
         <div class="loading-overlay">
          <div class="spinner">
           <div class="spinner-inner"></div>
          </div>
          <p>Resetting your password...</p>
         </div>
        `;
        document.body.appendChild(overlay);
        return overlay;
    }
      
    // Remove loading overlay
    function removeLoadingOverlay(overlay) {
        if (overlay) overlay.remove();
    }
    
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

        const loadingOverlay = createLoadingOverlay();
        
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
            const response = await fetch(`${API_URL}/resetPassword`, {
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
                window.location.href = '/service/login.html';
            } else {
                // Error scenario
                errorMessageEl.textContent = result.message || 'Failed to reset password';
                errorMessageEl.style.display = 'block';
            }
        } catch (error) {
            console.error('Error:', error);
            errorMessageEl.textContent = 'Network error. Please try again.';
            errorMessageEl.style.display = 'block';
        } finally {
            removeLoadingOverlay(loadingOverlay);
        }
    });
});
