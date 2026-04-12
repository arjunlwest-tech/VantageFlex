/**
 * Supabase Configuration & Auth Client
 * Vantage Flex Premium Authentication
 */

// Supabase credentials
const SUPABASE_URL = 'https://vxeamsrfrogtzqumcvwc.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4ZWFtc3Jmcm9ndHpxdW1jdndjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU5NTU0NjIsImV4cCI6MjA5MTUzMTQ2Mn0.bRvren2lNEXMeUxLle3ys_vSPfqMUwYZuR_fUfe-dcg';

// Initialize Supabase client
let supabaseClient = null;
let currentUser = null;
let userSubscription = null;

/**
 * Initialize Supabase on page load
 */
function initSupabase() {
    // Load Supabase library dynamically
    return new Promise((resolve, reject) => {
        console.log('Initializing Supabase with URL:', SUPABASE_URL);
        console.log('Supabase key present:', SUPABASE_KEY ? 'Yes (length: ' + SUPABASE_KEY.length + ')' : 'No');
        
        if (!SUPABASE_KEY || SUPABASE_KEY.length < 20) {
            reject(new Error('Invalid Supabase key. Please check your configuration.'));
            return;
        }
        
        if (window.supabase) {
            try {
                supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
                console.log('Supabase client created successfully');
                resolve(supabaseClient);
            } catch (err) {
                console.error('Failed to create Supabase client:', err);
                reject(err);
            }
        } else {
            console.log('Loading Supabase library dynamically...');
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
            script.onload = () => {
                try {
                    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
                    console.log('Supabase client created successfully after loading library');
                    resolve(supabaseClient);
                } catch (err) {
                    console.error('Failed to create Supabase client after loading:', err);
                    reject(err);
                }
            };
            script.onerror = (e) => {
                console.error('Failed to load Supabase library:', e);
                reject(new Error('Failed to load Supabase library'));
            };
            document.head.appendChild(script);
        }
    });
}

/**
 * Authentication Manager
 */
const AuthManager = {
    async init() {
        await initSupabase();
        
        // Check existing session
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (session) {
            currentUser = session.user;
            await this.loadUserProfile();
        }
        
        // Listen for auth changes
        supabaseClient.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN') {
                currentUser = session.user;
                await this.loadUserProfile();
                this.showAuthSuccess();
            } else if (event === 'SIGNED_OUT') {
                currentUser = null;
                userSubscription = null;
                this.updateUIForGuest();
            }
        });
        
        this.setupAuthButtons();
    },
    
    async loadUserProfile() {
        if (!currentUser) return;
        
        // Get or create user profile
        const { data: profile, error } = await supabaseClient
            .from('profiles')
            .select('*')
            .eq('id', currentUser.id)
            .single();
        
        if (error && error.code === 'PGRST116') {
            // Profile doesn't exist, create it
            await this.createUserProfile();
        } else if (profile) {
            userSubscription = profile.subscription_tier || 'free';
            this.updateUIForUser(profile);
        }
    },
    
    async createUserProfile() {
        const profile = {
            id: currentUser.id,
            email: currentUser.email,
            username: currentUser.user_metadata?.preferred_username || currentUser.email?.split('@')[0],
            avatar_url: currentUser.user_metadata?.avatar_url,
            subscription_tier: 'free',
            subscription_status: 'active',
            xp_points: 0,
            level: 1,
            streak_days: 0,
            created_at: new Date().toISOString()
        };
        
        await supabaseClient.from('profiles').insert([profile]);
        userSubscription = 'free';
        this.updateUIForUser(profile);
    },
    
    async signInWithGoogle() {
        const basePath = window.location.pathname.includes('/VantageFlex') ? '/VantageFlex' : '';
        const { error } = await supabaseClient.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin + basePath + '/dashboard.html'
            }
        });
        if (error) this.showAuthError(error.message);
    },
    
    async signInWithGitHub() {
        const basePath = window.location.pathname.includes('/VantageFlex') ? '/VantageFlex' : '';
        const { error } = await supabaseClient.auth.signInWithOAuth({
            provider: 'github',
            options: {
                redirectTo: window.location.origin + basePath + '/dashboard.html'
            }
        });
        if (error) this.showAuthError(error.message);
    },
    
    async signIn(provider) {
        const basePath = window.location.pathname.includes('/VantageFlex') ? '/VantageFlex' : '';
        const redirectPage = sessionStorage.getItem('redirectAfterLogin') || 'workouts.html';
        const { error } = await supabaseClient.auth.signInWithOAuth({
            provider: provider,
            options: {
                redirectTo: window.location.origin + basePath + '/' + redirectPage
            }
        });
        if (error) {
            console.error('Auth error:', error);
            alert('Sign in failed: ' + error.message);
        }
    },
    
    async signOut() {
        await supabaseClient.auth.signOut();
        window.location.href = 'index.html'; // Landing page
    },
    
    async signUpWithEmail(email, password) {
        console.log('AuthManager.signUpWithEmail called');
        
        if (!supabaseClient) {
            console.error('Supabase client not initialized');
            throw new Error('Authentication system not ready. Please refresh the page.');
        }
        
        const basePath = window.location.pathname.includes('/VantageFlex') ? '/VantageFlex' : '';
        console.log('Calling supabase.auth.signUp...');
        
        const { data, error } = await supabaseClient.auth.signUp({
            email: email,
            password: password,
            options: {
                emailRedirectTo: window.location.origin + basePath + '/workouts.html'
            }
        });
        
        if (error) {
            console.error('Sign up error from Supabase:', error);
            throw error;
        }
        
        console.log('Sign up successful, data:', data);
        return data;
    },
    
    async signInWithEmail(email, password) {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password
        });
        
        if (error) {
            console.error('Sign in error:', error);
            throw error;
        }
        
        // Create profile if doesn't exist
        if (data.user) {
            const { data: profile } = await supabaseClient
                .from('profiles')
                .select('*')
                .eq('id', data.user.id)
                .single();
            
            if (!profile) {
                await this.createUserProfile(data.user);
            }
        }
        
        return data;
    },
    
    async resetPassword(email) {
        const basePath = window.location.pathname.includes('/VantageFlex') ? '/VantageFlex' : '';
        const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin + basePath + '/reset-password.html'
        });
        
        if (error) {
            console.error('Reset password error:', error);
            throw error;
        }
    },
    
    setupAuthButtons() {
        // Setup login buttons
        document.querySelectorAll('[data-auth="google"]').forEach(btn => {
            btn.addEventListener('click', () => this.signInWithGoogle());
        });
        
        document.querySelectorAll('[data-auth="github"]').forEach(btn => {
            btn.addEventListener('click', () => this.signInWithGitHub());
        });
        
        document.querySelectorAll('[data-auth="logout"]').forEach(btn => {
            btn.addEventListener('click', () => this.signOut());
        });
    },
    
    updateUIForUser(profile) {
        // Update nav with user avatar
        const navContainer = document.querySelector('.nav-container');
        const existingUserMenu = navContainer?.querySelector('.user-menu');
        if (existingUserMenu) existingUserMenu.remove();
        
        const userMenu = document.createElement('div');
        userMenu.className = 'user-menu';
        userMenu.innerHTML = `
            <div class="user-avatar">
                <img src="${profile.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + profile.username}" alt="${profile.username}">
                ${userSubscription !== 'free' ? '<span class="premium-badge">PRO</span>' : ''}
            </div>
            <div class="user-dropdown">
                <div class="user-info">
                    <span class="username">${profile.username}</span>
                    <span class="tier">${userSubscription === 'free' ? 'Free Plan' : 'Pro Member'}</span>
                </div>
                <a href="dashboard.html" class="dropdown-item">📊 Dashboard</a>
                <a href="subscription.html" class="dropdown-item">⚡ Upgrade</a>
                <button class="dropdown-item logout" data-auth="logout">🚪 Sign Out</button>
            </div>
        `;
        
        navContainer?.appendChild(userMenu);
        
        // Update UI elements for premium features
        document.querySelectorAll('[data-premium]').forEach(el => {
            if (userSubscription === 'free') {
                el.classList.add('premium-locked');
                el.addEventListener('click', (e) => {
                    if (!el.classList.contains('unlocked')) {
                        e.preventDefault();
                        this.showUpgradeModal();
                    }
                });
            } else {
                el.classList.add('unlocked');
            }
        });
        
        // Dispatch auth event
        window.dispatchEvent(new CustomEvent('auth:ready', { detail: profile }));
    },
    
    updateUIForGuest() {
        const navContainer = document.querySelector('.nav-container');
        const existingUserMenu = navContainer?.querySelector('.user-menu');
        if (existingUserMenu) existingUserMenu.remove();
        
        // Add login button
        const loginBtn = document.createElement('button');
        loginBtn.className = 'nav-cta login-trigger';
        loginBtn.innerHTML = '<span>👤</span> Sign In';
        loginBtn.addEventListener('click', () => this.showLoginModal());
        navContainer?.appendChild(loginBtn);
    },
    
    showAuthSuccess() {
        if (window.AnimationController) {
            window.fireConfetti();
        }
        if (window.showToast) {
            window.showToast('Welcome back! 🎉', 'success');
        }
    },
    
    showAuthError(message) {
        if (window.showToast) {
            window.showToast('Sign in failed: ' + message, 'error');
        }
    },
    
    showLoginModal() {
        const modal = document.createElement('div');
        modal.className = 'auth-modal';
        modal.innerHTML = `
            <div class="auth-modal-backdrop"></div>
            <div class="auth-modal-content">
                <button class="auth-modal-close">×</button>
                <div class="auth-header">
                    <div class="auth-logo">🔥</div>
                    <h2>Welcome to Vantage Flex</h2>
                    <p>Sign in to save your progress and unlock premium features</p>
                </div>
                <div class="auth-providers">
                    <button class="auth-btn google" data-auth="google">
                        <svg viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                        Continue with Google
                    </button>
                    <button class="auth-btn github" data-auth="github">
                        <svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.981.429.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                        Continue with GitHub
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Close modal handlers
        modal.querySelector('.auth-modal-close').addEventListener('click', () => modal.remove());
        modal.querySelector('.auth-modal-backdrop').addEventListener('click', () => modal.remove());
        
        // Setup auth buttons in modal
        modal.querySelector('[data-auth="google"]').addEventListener('click', () => this.signInWithGoogle());
        modal.querySelector('[data-auth="github"]').addEventListener('click', () => this.signInWithGitHub());
        
        // Animate in
        requestAnimationFrame(() => modal.classList.add('active'));
    },
    
    showUpgradeModal() {
        window.location.href = 'subscription.html?upgrade=true';
    },
    
    isPremium() {
        return userSubscription && userSubscription !== 'free';
    },
    
    getCurrentUser() {
        return currentUser;
    },
    
    getSubscription() {
        return userSubscription;
    }
};

/**
 * Subscription Manager
 */
const SubscriptionManager = {
    async checkSubscription(userId) {
        const { data, error } = await supabaseClient
            .from('subscriptions')
            .select('*')
            .eq('user_id', userId)
            .eq('status', 'active')
            .single();
        
        if (error) return 'free';
        return data?.tier || 'free';
    },
    
    async upgradeSubscription(tier) {
        if (!currentUser) {
            AuthManager.showLoginModal();
            return;
        }
        
        // Create checkout session (you'd integrate with Stripe here)
        const { data, error } = await supabaseClient.functions.invoke('create-checkout', {
            body: { tier, userId: currentUser.id }
        });
        
        if (data?.url) {
            window.location.href = data.url;
        }
    }
};

/**
 * Auth Gate - Enforces login before using the site
 */
const AuthGate = {
    init() {
        // Skip auth gate on landing page
        const currentPage = window.location.pathname.split('/').pop();
        if (currentPage === 'landing.html' || currentPage === '') {
            return;
        }
        
        // Add auth-required class immediately to prevent flash of content
        document.body.classList.add('auth-required');
        
        // Listen for auth state changes
        window.addEventListener('auth:ready', (e) => {
            if (e.detail?.id) {
                this.hide();
            } else {
                this.redirectToLanding();
            }
        });
        
        // Check auth state after a short delay to let AuthManager init
        setTimeout(() => {
            if (!currentUser && !window.AuthManager?.getCurrentUser()) {
                this.redirectToLanding();
            } else {
                this.hide();
            }
        }, 1500);
    },
    
    redirectToLanding() {
        // Save intended page for after login
        const currentPage = window.location.pathname.split('/').pop();
        if (currentPage && currentPage !== 'index.html') {
            sessionStorage.setItem('redirectAfterLogin', currentPage);
        }
        // Redirect to landing page (index.html)
        window.location.href = 'index.html';
    },
    
    createAuthGate() {
        // Don't create if already exists
        if (document.querySelector('.auth-gate')) return;
        
        const gate = document.createElement('div');
        gate.className = 'auth-gate';
        gate.innerHTML = `
            <div class="auth-gate-content">
                <div class="auth-gate-logo">🔥</div>
                <h1 class="auth-gate-title">Welcome to<br>Vantage Flex</h1>
                <p class="auth-gate-subtitle">
                    The ultimate AI-powered fitness platform.<br>
                    Sign in to generate workouts, track progress, and compete on the leaderboard.
                </p>
                
                <div class="auth-gate-benefits">
                    <div class="auth-gate-benefit">
                        <span class="auth-gate-benefit-icon">⚡</span>
                        <span class="auth-gate-benefit-text">AI Workouts</span>
                    </div>
                    <div class="auth-gate-benefit">
                        <span class="auth-gate-benefit-icon">🏆</span>
                        <span class="auth-gate-benefit-text">Leaderboard</span>
                    </div>
                    <div class="auth-gate-benefit">
                        <span class="auth-gate-benefit-icon">📊</span>
                        <span class="auth-gate-benefit-text">Progress Tracking</span>
                    </div>
                </div>
                
                <div class="auth-gate-providers">
                    <button class="auth-gate-btn google" onclick="AuthGate.signIn('google')">
                        <svg viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                        Continue with Google
                    </button>
                    <button class="auth-gate-btn github" onclick="AuthGate.signIn('github')">
                        <svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.981.429.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                        Continue with GitHub
                    </button>
                </div>
                
                <p class="auth-gate-terms">
                    By continuing, you agree to our <a href="privacy.html">Privacy Policy</a> and <a href="#">Terms of Service</a>.<br>
                    We only use your data to personalize your experience.
                </p>
            </div>
        `;
        
        document.body.appendChild(gate);
    },
    
    async signIn(provider) {
        if (!supabaseClient) {
            console.error('Supabase not initialized');
            return;
        }
        
        const basePath = window.location.pathname.includes('/VantageFlex') ? '/VantageFlex' : '';
        const currentPage = window.location.pathname.split('/').pop() || 'workouts.html';
        
        const { error } = await supabaseClient.auth.signInWithOAuth({
            provider: provider,
            options: {
                redirectTo: window.location.origin + basePath + '/' + currentPage
            }
        });
        
        if (error) {
            console.error('Auth error:', error);
            alert('Sign in failed. Please try again.');
        }
    },
    
    hide() {
        document.body.classList.remove('auth-required');
        document.body.classList.add('authenticated');
        
        const gate = document.querySelector('.auth-gate');
        if (gate) {
            gate.style.opacity = '0';
            gate.style.transition = 'opacity 0.5s ease';
            setTimeout(() => gate.remove(), 500);
        }
    },
    
    show() {
        document.body.classList.add('auth-required');
        document.body.classList.remove('authenticated');
        this.createAuthGate();
    }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Initialize auth gate immediately
    AuthGate.init();
    
    // Then initialize auth manager
    AuthManager.init().catch(console.error);
});

// Export for global access
window.AuthManager = AuthManager;
window.SubscriptionManager = SubscriptionManager;
window.AuthGate = AuthGate;
window.supabaseClient = supabaseClient;
