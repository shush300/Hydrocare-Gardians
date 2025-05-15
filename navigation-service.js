// Navigation Service
import { auth } from './firebase-config.js';
import { onAuthStateChanged } from 'firebase/auth';

class NavigationService {
    constructor() {
        // Define protected routes that require authentication
        this.protectedRoutes = [
            'code (1).html',
            'efficiency.html',
            'report.html',
            'account.html'
        ];

        // Define public routes
        this.publicRoutes = [
            'login.html',
            'register.html'
        ];

        // Initialize auth state listener
        this.initAuthListener();
    }

    initAuthListener() {
        onAuthStateChanged(auth, (user) => {
            const currentPage = window.location.pathname.split('/').pop() || 'index.html';
            
            if (user) {
                // User is signed in
                if (this.publicRoutes.includes(currentPage)) {
                    // If on a public page, redirect to main app
                    this.navigateTo('code (1).html');
                }
            } else {
                // User is signed out
                if (this.protectedRoutes.includes(currentPage)) {
                    // If on a protected page, redirect to login
                    this.navigateTo('login.html');
                }
            }
        });
    }

    navigateTo(page) {
        window.location.href = page;
    }

    async logout() {
        try {
            await auth.signOut();
            this.navigateTo('login.html');
        } catch (error) {
            console.error('Logout error:', error);
        }
    }

    // Check if current user is authenticated
    isAuthenticated() {
        return auth.currentUser !== null;
    }
}

// Create and export a single instance
const navigationService = new NavigationService();
export default navigationService; 