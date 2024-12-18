API_URL = 'http://localhost:3000';

// Loading Spinner Overlay
function createLoadingOverlay(loading_message) {
    const overlay = document.createElement('div');
    overlay.innerHTML = `
    <link rel="stylesheet" href="css/loading.css" />
     <div class="loading-overlay">
      <div class="spinner">
       <div class="spinner-inner"></div>
      </div>
      <p>${loading_message}</p>
     </div>
    `;
    document.body.appendChild(overlay);
    return overlay;
   }
  
// Remove loading overlay
function removeLoadingOverlay(overlay) {
    if (overlay) overlay.remove();
}

class AuthService {
    constructor() {
        this.tokenKey = 'fishease_token';
    }

    // Store token
    setToken(token) {
        localStorage.setItem(this.tokenKey, token);
    }

    // Get token
    getToken() {
        return localStorage.getItem(this.tokenKey);
    }

    // Remove token
    removeToken() {
        localStorage.removeItem(this.tokenKey);
    }

    // Check if user is logged in
    isLoggedIn() {
        const token = this.getToken();
        if (!token) return false;
        
        // Optional: Check token expiration
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.exp > Date.now() / 1000;
        } catch (error) {
            return false;
        }
    }

    // Handle login
    async login(email, password) {
        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            this.setToken(data.token);
            return data;

        } catch (error) {
            throw error;
        }
    }

    // method for password reset request
    async requestPasswordReset(email) {
        try {
            const response = await fetch(`${API_URL}/requestReset`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Password reset request failed');
            }

            return data;
        } catch (error) {
            throw error;
        }
    }

    // method for password reset
    async resetPassword(token, newPassword) {
        try {
            const response = await fetch(`${API_URL}/resetPassword`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    token, 
                    newPassword 
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Password reset failed');
            }

            return data;
        } catch (error) {
            throw error;
        }
    }

    // Handle logout
    logout() {
        this.removeToken();
        window.location.href = '/service/login.html';
    }
}

// Initialize auth service
const authService = new AuthService();

// Handle form submission
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();   
        const loadingOverlay = createLoadingOverlay("Logging in..."); 
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const errorMessage = document.getElementById('errorMessage');
        
        try {
            await authService.login(email, password);
            window.location.href = "/service/uploadImage.html";
        } catch (error) {
            errorMessage.textContent = error.message;
            errorMessage.style.display = 'block';
        } finally {
            removeLoadingOverlay(loadingOverlay);
        }
    });
}

// Handle forgot password form submission
const forgotPasswordForm = document.getElementById('forgotPasswordForm');
if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const loadingOverlay = createLoadingOverlay("Sending password reset link...");

        const email = document.getElementById('email').value;
        const errorMessage = document.getElementById('errorMessage');
        const successMessage = document.getElementById('successMessage');

        // Clear previous messages
        errorMessage.textContent = '';
        errorMessage.style.display = 'none';
        if (successMessage) {
            successMessage.textContent = '';
            successMessage.style.display = 'none';
        }

        try {
            await authService.requestPasswordReset(email);
            
            // Show success message
            if (successMessage) {
                successMessage.textContent = 'Password reset link sent to your email';
                successMessage.style.display = 'block';
            } else {
                alert('Password reset link sent to your email');
            }
        } catch (error) {
            errorMessage.textContent = error.message;
            errorMessage.style.display = 'block';
        } finally {
            removeLoadingOverlay(loadingOverlay);
            window.location.href = '/service/login.html';
        }
    });
}

const newPasswordForm = document.getElementById('newPasswordForm');
    const errorMessage = document.getElementById('errorMessage');

    if (newPasswordForm) {
        newPasswordForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const loadingOverlay = createLoadingOverlay("Resetting password...");
            
            // Clear previous error messages
            errorMessage.textContent = '';
            errorMessage.style.display = 'none';

            // Get form inputs
            const passwordInput = document.getElementById('password');
            const confirmPasswordInput = document.getElementById('confirm-password');

            const password = passwordInput.value;
            const confirmPassword = confirmPasswordInput.value;

            // Validate passwords match
            if (password !== confirmPassword) {
                errorMessage.textContent = 'Passwords do not match';
                errorMessage.style.display = 'block';
                return;
            }

            // Validate password complexity
            const passwordComplexityCheck = (password) => {
                if (password.length < 8) {
                    throw new Error('Password must be at least 8 characters long');
                }
                if (!/[A-Z]/.test(password)) {
                    throw new Error('Password must contain at least one uppercase letter');
                }
                if (!/[a-z]/.test(password)) {
                    throw new Error('Password must contain at least one lowercase letter');
                }
                if (!/[0-9]/.test(password)) {
                    throw new Error('Password must contain at least one number');
                }
            };

            try {
                // Validate password complexity
                passwordComplexityCheck(password);

                // Extract reset token from URL
                const urlParams = new URLSearchParams(window.location.search);
                const token = urlParams.get('token');

                if (!token) {
                    throw new Error('Invalid or missing reset token');
                }

                // Use AuthService to reset password
                await authService.resetPassword(token, password);

                // Show success message and redirect
                alert('Password reset successful. Redirecting to login...');
                window.location.href = '/service/login.html';

            } catch (error) {
                errorMessage.textContent = error.message;
                errorMessage.style.display = 'block';
            } finally {
                removeLoadingOverlay(loadingOverlay);
            }
        });
    }
