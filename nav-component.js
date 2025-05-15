// Navigation Component
import navigationService from './navigation-service.js';
import { auth } from './firebase-config.js';

class NavComponent extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
        this.setupEventListeners();
    }

    render() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    background: var(--primary-dark, #1B5E20);
                    padding: 1rem 0;
                }

                nav {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 0 1rem;
                }

                ul {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                    display: flex;
                    justify-content: center;
                    gap: 1rem;
                    flex-wrap: wrap;
                }

                a {
                    color: white;
                    text-decoration: none;
                    padding: 0.75rem 1.25rem;
                    border-radius: 4px;
                    transition: background-color 0.3s;
                    display: inline-block;
                }

                a:hover,
                a.active {
                    background-color: rgba(255, 255, 255, 0.1);
                }

                button {
                    background: none;
                    border: none;
                    color: white;
                    cursor: pointer;
                    padding: 0.75rem 1.25rem;
                    border-radius: 4px;
                    transition: background-color 0.3s;
                }

                button:hover {
                    background-color: rgba(255, 255, 255, 0.1);
                }

                @media (max-width: 768px) {
                    ul {
                        flex-direction: column;
                        align-items: center;
                    }

                    a, button {
                        width: 100%;
                        text-align: center;
                    }
                }
            </style>
            <nav>
                <ul>
                    ${auth.currentUser ? `
                        <li><a href="code (1).html" class="${currentPage === 'code (1).html' ? 'active' : ''}">Control Panel</a></li>
                        <li><a href="efficiency.html" class="${currentPage === 'efficiency.html' ? 'active' : ''}">Efficiency & Reminders</a></li>
                        <li><a href="report.html" class="${currentPage === 'report.html' ? 'active' : ''}">Annual Report</a></li>
                        <li><a href="account.html" class="${currentPage === 'account.html' ? 'active' : ''}">My Account</a></li>
                        <li><button id="logoutBtn">Logout</button></li>
                    ` : `
                        <li><a href="login.html" class="${currentPage === 'login.html' ? 'active' : ''}">Login</a></li>
                        <li><a href="register.html" class="${currentPage === 'register.html' ? 'active' : ''}">Register</a></li>
                    `}
                </ul>
            </nav>
        `;
    }

    setupEventListeners() {
        const logoutBtn = this.shadowRoot.querySelector('#logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                navigationService.logout();
            });
        }

        // Listen for auth state changes
        auth.onAuthStateChanged(() => {
            this.render();
        });
    }
}

// Register the custom element
customElements.define('nav-component', NavComponent);

export default NavComponent; 