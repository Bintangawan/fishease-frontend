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
            const response = await fetch(`http://localhost:3000/login`, {
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

    // Handle logout
    logout() {
        this.removeToken();
        window.location.href = '/admin-login/login.html';
    }
}

// Initialize auth service
const authService = new AuthService();

// Handle form submission
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('errorMessage');
    
    try {
      await authService.login(email, password);
      window.location.href = "http://localhost:5500/admin-login/uploadImage.html";
    } catch (error) {
      errorMessage.textContent = error.message;
      errorMessage.style.display = 'block';
    }
  });
}
