// checkAuth.js - Create this as a new file to handle authentication checking
class AuthChecker {
    constructor() {
        this.authService = new AuthService();
        this.loginPath = '/service/login.html';
    }

    checkAuthentication() {
        if (!this.authService.isLoggedIn()) {
            window.location.href = this.loginPath;
            return false;
        }
        return true;
    }

    initializeAuthCheck() {
        // Check immediately when the script loads
        if (!this.checkAuthentication()) {
            return false;
        }

        // Also check when the page becomes visible again (tab switching)
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                this.checkAuthentication();
            }
        });

        return true;
    }
}

// Initialize and run the auth check
const authChecker = new AuthChecker();
// Run the check before the page loads
authChecker.initializeAuthCheck();