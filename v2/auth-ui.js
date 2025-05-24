// Authentication UI components and functionality
import { signUp, signIn, resetPassword, signOut, getCurrentUser, onAuthStateChange } from './auth.js';
import { migrateUserDataToSupabase } from './migration.js';

// DOM Elements for Auth UI
let authElements = {};

// Initialize auth UI
export function initializeAuthUI() {
    authElements = {
        authContainer: document.getElementById('authContainer'),
        loginForm: document.getElementById('loginForm'),
        registerForm: document.getElementById('registerForm'),
        resetForm: document.getElementById('resetPasswordForm'),
        loginEmail: document.getElementById('loginEmail'),
        loginPassword: document.getElementById('loginPassword'),
        registerEmail: document.getElementById('registerEmail'),
        registerPassword: document.getElementById('registerPassword'),
        resetEmail: document.getElementById('resetEmail'),
        loginBtn: document.getElementById('loginBtn'),
        registerBtn: document.getElementById('registerBtn'),
        resetBtn: document.getElementById('resetBtn'),
        logoutBtn: document.getElementById('logoutBtn'),
        switchToRegister: document.getElementById('switchToRegister'),
        switchToLogin: document.getElementById('switchToLogin'),
        switchToReset: document.getElementById('switchToReset'),
        authError: document.getElementById('authError'),
        authSuccess: document.getElementById('authSuccess'),
        migrationBtn: document.getElementById('migrationBtn'),
        migrationStatus: document.getElementById('migrationStatus')
    };

    // Add event listeners
    const loginFormElement = document.getElementById('loginFormElement');
    if (loginFormElement) {
        loginFormElement.addEventListener('submit', handleLogin);
    } else {
        console.error('Login form element not found');
    }
    
    // Add click event to login button as a backup
    if (authElements.loginBtn) {
        authElements.loginBtn.addEventListener('click', function(e) {
            // Only handle click if not part of a form submission
            if (!e.target.form) {
                e.preventDefault();
                handleLogin(e);
            }
        });
    }
    const registerFormElement = document.getElementById('registerFormElement');
    if (registerFormElement) {
        registerFormElement.addEventListener('submit', handleRegister);
    } else {
        console.error('Register form element not found');
    }
    
    // Add click event to register button as a backup
    if (authElements.registerBtn) {
        authElements.registerBtn.addEventListener('click', function(e) {
            // Only handle click if not part of a form submission
            if (!e.target.form) {
                e.preventDefault();
                handleRegister(e);
            }
        });
    }
    if (authElements.resetForm) {
        authElements.resetForm.addEventListener('submit', handleResetPassword);
    }
    if (authElements.logoutBtn) {
        authElements.logoutBtn.addEventListener('click', handleLogout);
    }
    if (authElements.switchToRegister) {
        authElements.switchToRegister.addEventListener('click', () => switchAuthForm('register'));
    }
    if (authElements.switchToLogin) {
        authElements.switchToLogin.addEventListener('click', () => switchAuthForm('login'));
    }
    if (authElements.switchToReset) {
        authElements.switchToReset.addEventListener('click', () => switchAuthForm('reset'));
    }
    if (authElements.migrationBtn) {
        authElements.migrationBtn.addEventListener('click', handleDataMigration);
    }

    // Check auth state on load
    checkAuthState();

    // Listen for auth state changes
    onAuthStateChange((event, session) => {
        updateAuthUI(session);
    });
}

// Handle login form submission
async function handleLogin(e) {
    e.preventDefault();
    
    // Get form values
    const email = authElements.loginEmail?.value || '';
    const password = authElements.loginPassword?.value || '';
    
    // Validate form input
    if (!email || !password) {
        showAuthError('Please enter both email and password');
        return;
    }
    
    // Clear previous messages and show loading state
    clearAuthMessages();
    showAuthMessage('Logging in...', false);
    
    // Disable login button to prevent multiple submissions
    if (authElements.loginBtn) {
        authElements.loginBtn.disabled = true;
        authElements.loginBtn.textContent = 'Logging in...';
    }
    
    try {
        console.log(`Attempting to sign in with email: ${email}`);
        
        // For demo purposes only - if using a test account
        if (email === 'demo@example.com' && password === 'password123') {
            console.log('Using demo account');
            // Simulate a successful login for demo purposes
            const mockSession = {
                user: { id: 'demo-user-id', email: email }
            };
            
            // Show success and update UI
            clearAuthForms();
            showAuthSuccess('Logged in successfully with demo account!');
            updateAuthUI(mockSession);
            
            // Re-enable login button
            if (authElements.loginBtn) {
                authElements.loginBtn.disabled = false;
                authElements.loginBtn.textContent = 'Login';
            }
            
            return;
        }
        
        // Attempt to sign in with Supabase
        const { session } = await signIn(email, password);
        
        // Show success message
        clearAuthForms();
        showAuthSuccess('Logged in successfully!');
        
        // Update UI based on session
        updateAuthUI(session);
        
        // Redirect to main app section if needed
        const appContainer = document.getElementById('appContainer');
        if (appContainer) {
            appContainer.classList.remove('hidden');
        }
    } catch (error) {
        console.error('Login error:', error);
        showAuthError(`Login failed: ${error.message || 'Unknown error'}`);
    } finally {
        // Re-enable login button
        if (authElements.loginBtn) {
            authElements.loginBtn.disabled = false;
            authElements.loginBtn.textContent = 'Login';
        }
    }
}

// Handle register form submission
async function handleRegister(e) {
    e.preventDefault();
    
    // Get form values
    const email = authElements.registerEmail?.value || '';
    const password = authElements.registerPassword?.value || '';
    
    // Validate form input
    if (!email || !password) {
        showAuthError('Please enter both email and password');
        return;
    }
    
    if (password.length < 6) {
        showAuthError('Password must be at least 6 characters');
        return;
    }
    
    // Clear previous messages and show loading state
    clearAuthMessages();
    showAuthMessage('Creating account...', false);
    
    // Disable register button to prevent multiple submissions
    if (authElements.registerBtn) {
        authElements.registerBtn.disabled = true;
        authElements.registerBtn.textContent = 'Creating account...';
    }
    
    try {
        console.log(`Attempting to register with email: ${email}`);
        
        // For demo purposes only - if using a test account
        if (email === 'demo@example.com') {
            console.log('Demo account registration');
            // Show success and redirect to login
            clearAuthForms();
            showAuthSuccess('Demo account registration successful! You can now log in.');
            switchAuthForm('login');
            
            // Re-enable register button
            if (authElements.registerBtn) {
                authElements.registerBtn.disabled = false;
                authElements.registerBtn.textContent = 'Register';
            }
            
            return;
        }
        
        // Attempt to register with Supabase
        await signUp(email, password);
        
        // Show success message
        clearAuthForms();
        showAuthSuccess('Registration successful! Please check your email for confirmation.');
        
        // Switch to login form
        switchAuthForm('login');
    } catch (error) {
        console.error('Registration error:', error);
        showAuthError(`Registration failed: ${error.message || 'Unknown error'}`);
    } finally {
        // Re-enable register button
        if (authElements.registerBtn) {
            authElements.registerBtn.disabled = false;
            authElements.registerBtn.textContent = 'Register';
        }
    }
}

// Handle reset password form submission
async function handleResetPassword(e) {
    e.preventDefault();
    
    const email = authElements.resetEmail.value;
    
    if (!email) {
        showAuthError('Please enter your email address');
        return;
    }
    
    try {
        showAuthMessage('Sending reset instructions...', false);
        await resetPassword(email);
        clearAuthForms();
        showAuthSuccess('Password reset instructions sent to your email.');
        switchAuthForm('login');
    } catch (error) {
        showAuthError(`Password reset failed: ${error.message}`);
    }
}

// Handle logout
async function handleLogout() {
    try {
        await signOut();
        showAuthSuccess('Logged out successfully');
    } catch (error) {
        showAuthError(`Logout failed: ${error.message}`);
    }
}

// Handle data migration from localStorage to Supabase
async function handleDataMigration() {
    try {
        if (authElements.migrationStatus) {
            authElements.migrationStatus.textContent = 'Migration in progress...';
            authElements.migrationStatus.classList.remove('hidden');
        }
        
        const user = await getCurrentUser();
        if (!user) {
            if (authElements.migrationStatus) {
                authElements.migrationStatus.textContent = 'Error: User not authenticated';
            }
            return;
        }
        
        const result = await migrateUserDataToSupabase(user.id);
        
        if (result.success) {
            if (authElements.migrationStatus) {
                authElements.migrationStatus.textContent = 'Migration successful!';
            }
            showAuthSuccess('Data migration completed successfully!');
            // Trigger page reload to refresh data
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        } else {
            if (authElements.migrationStatus) {
                authElements.migrationStatus.textContent = `Migration failed: ${result.error.message}`;
            }
            showAuthError(`Migration failed: ${result.error.message}`);
        }
    } catch (error) {
        console.error('Migration error:', error);
        if (authElements.migrationStatus) {
            authElements.migrationStatus.textContent = `Migration error: ${error.message}`;
        }
        showAuthError(`Migration error: ${error.message}`);
    }
}

// Switch between auth forms (login, register, reset)
function switchAuthForm(formType) {
    if (authElements.loginForm) {
        authElements.loginForm.classList.add('hidden');
    }
    if (authElements.registerForm) {
        authElements.registerForm.classList.add('hidden');
    }
    if (authElements.resetForm) {
        authElements.resetForm.classList.add('hidden');
    }
    
    clearAuthMessages();
    
    switch (formType) {
        case 'login':
            if (authElements.loginForm) {
                authElements.loginForm.classList.remove('hidden');
            }
            break;
        case 'register':
            if (authElements.registerForm) {
                authElements.registerForm.classList.remove('hidden');
            }
            break;
        case 'reset':
            if (authElements.resetForm) {
                authElements.resetForm.classList.remove('hidden');
            }
            break;
    }
}

// Check authentication state
async function checkAuthState() {
    try {
        const user = await getCurrentUser();
        updateAuthUI(user ? { user } : null);
    } catch (error) {
        console.error('Auth state check failed:', error);
        updateAuthUI(null);
    }
}

// Update UI based on authentication state
function updateAuthUI(session) {
    const isLoggedIn = !!session;
    
    // Toggle auth container visibility
    if (authElements.authContainer) {
        if (isLoggedIn) {
            authElements.authContainer.classList.add('auth-logged-in');
            authElements.authContainer.classList.remove('auth-logged-out');
        } else {
            authElements.authContainer.classList.remove('auth-logged-in');
            authElements.authContainer.classList.add('auth-logged-out');
            switchAuthForm('login');
        }
    }
    
    // Toggle app container visibility
    const appContainer = document.getElementById('appContainer');
    if (appContainer) {
        if (isLoggedIn) {
            appContainer.classList.remove('hidden');
        } else {
            appContainer.classList.add('hidden');
        }
    }
    
    // Update user info display if logged in
    const userInfo = document.getElementById('userInfo');
    if (userInfo && session && session.user) {
        userInfo.textContent = session.user.email;
        userInfo.classList.remove('hidden');
    } else if (userInfo) {
        userInfo.classList.add('hidden');
    }
    
    // Toggle logout button visibility
    if (authElements.logoutBtn) {
        if (isLoggedIn) {
            authElements.logoutBtn.classList.remove('hidden');
        } else {
            authElements.logoutBtn.classList.add('hidden');
        }
    }
    
    // Toggle migration button visibility
    if (authElements.migrationBtn) {
        if (isLoggedIn) {
            authElements.migrationBtn.classList.remove('hidden');
        } else {
            authElements.migrationBtn.classList.add('hidden');
        }
    }
    
    // Trigger app data loading if logged in
    if (isLoggedIn && session && session.user) {
        if (typeof loadUserStateFromSupabase === 'function') {
            loadUserStateFromSupabase(session.user.id);
        }
    }
}

// Show auth error message
function showAuthError(message) {
    if (authElements.authError) {
        authElements.authError.textContent = message;
        authElements.authError.classList.remove('hidden');
    }
    
    if (authElements.authSuccess) {
        authElements.authSuccess.classList.add('hidden');
    }
}

// Show auth success message
function showAuthSuccess(message) {
    if (authElements.authSuccess) {
        authElements.authSuccess.textContent = message;
        authElements.authSuccess.classList.remove('hidden');
    }
    
    if (authElements.authError) {
        authElements.authError.classList.add('hidden');
    }
}

// Show general auth message (not error or success)
function showAuthMessage(message, isError = true) {
    if (isError) {
        showAuthError(message);
    } else {
        showAuthSuccess(message);
    }
}

// Clear auth error and success messages
function clearAuthMessages() {
    if (authElements.authError) {
        authElements.authError.classList.add('hidden');
    }
    
    if (authElements.authSuccess) {
        authElements.authSuccess.classList.add('hidden');
    }
}

// Clear auth form inputs
function clearAuthForms() {
    if (authElements.loginEmail) {
        authElements.loginEmail.value = '';
    }
    if (authElements.loginPassword) {
        authElements.loginPassword.value = '';
    }
    if (authElements.registerEmail) {
        authElements.registerEmail.value = '';
    }
    if (authElements.registerPassword) {
        authElements.registerPassword.value = '';
    }
    if (authElements.resetEmail) {
        authElements.resetEmail.value = '';
    }
}
