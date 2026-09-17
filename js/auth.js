/**
 * Intellect Haven - Authentication JavaScript
 * Login & Registration Functionality
 */

// ============================================================================
// INITIALIZATION
// ============================================================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('Auth Page Loaded');
    
    // Check if user is already logged in
    if (window.currentUser && window.userData) {
        redirectBasedOnUserType(window.userData.userType);
        return;
    }
    
    // Initialize based on page
    if (document.getElementById('loginForm')) {
        initLoginPage();
    }
    
    if (document.getElementById('registerForm')) {
        initRegisterPage();
    }
});

// ============================================================================
// LOGIN PAGE
// ============================================================================

function initLoginPage() {
    const loginForm = document.getElementById('loginForm');
    const togglePassword = document.getElementById('togglePassword');
    
    // Password visibility toggle
    if (togglePassword) {
        togglePassword.addEventListener('click', function() {
            const passwordInput = document.getElementById('password');
            const icon = this.querySelector('i');
            
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                passwordInput.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    }
    
    // Form submission
    loginForm.addEventListener('submit', handleLogin);
}

async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const remember = document.getElementById('remember').checked;
    const loginBtn = document.getElementById('loginBtn');
    
    // Clear previous errors
    clearErrors();
    
    // Validate
    if (!email || !password) {
        showFlashMessage('Please fill in all fields', 'error');
        return;
    }
    
    if (!isValidEmail(email)) {
        showError('email', 'Please enter a valid email address');
        return;
    }
    
    if (password.length < 6) {
        showError('password', 'Password must be at least 6 characters');
        return;
    }
    
    // Show loading state
    const resetLoading = showLoading(loginBtn);
    
    try {
        // Sign in with Firebase
        const userCredential = await firebaseAuth.signInWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        // Get user data from Firestore
        const userDoc = await firebaseDB.collection('users').doc(user.uid).get();
        
        if (!userDoc.exists) {
            throw new Error('User profile not found. Please contact support.');
        }
        
        const userData = userDoc.data();
        
        // Success message
        showFlashMessage(`Welcome back, ${userData.firstName}!`, 'success');
        
        // Redirect based on user type
        setTimeout(() => {
            redirectBasedOnUserType(userData.userType);
        }, 1000);
        
    } catch (error) {
        console.error('Login error:', error);
        
        let errorMessage = 'Login failed. Please try again.';
        
        // Handle specific Firebase errors
        if (error.code === 'auth/user-not-found') {
            errorMessage = 'No account found with this email address.';
        } else if (error.code === 'auth/wrong-password') {
            errorMessage = 'Incorrect password. Please try again.';
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = 'Invalid email address format.';
        } else if (error.code === 'auth/too-many-requests') {
            errorMessage = 'Too many failed attempts. Please try again later.';
        } else if (error.code === 'auth/user-disabled') {
            errorMessage = 'This account has been disabled. Please contact support.';
        }
        
        showFlashMessage(errorMessage, 'error');
    } finally {
        resetLoading();
    }
}

// ============================================================================
// REGISTRATION PAGE
// ============================================================================

function initRegisterPage() {
    const userTypeSelector = document.getElementById('userTypeSelector');
    const registerForm = document.getElementById('registerForm');
    const userTypeOptions = document.querySelectorAll('.user-type-option');
    const backBtn = document.getElementById('backToSelection');
    const togglePassword = document.getElementById('togglePassword');
    const toggleConfirmPassword = document.getElementById('toggleConfirmPassword');
    
    // User type selection
    userTypeOptions.forEach(option => {
        option.addEventListener('click', function() {
            const userType = this.dataset.type;
            
            // Update UI
            userTypeOptions.forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
            
            // Set user type
            document.getElementById('userType').value = userType;
            
            // Show teacher-specific fields if teacher
            const teacherFields = document.getElementById('teacherFields');
            if (userType === 'teacher') {
                teacherFields.style.display = 'block';
                document.getElementById('hourlyRate').setAttribute('required', 'required');
            } else {
                teacherFields.style.display = 'none';
                document.getElementById('hourlyRate').removeAttribute('required');
            }
            
            // Show form
            setTimeout(() => {
                userTypeSelector.style.display = 'none';
                registerForm.style.display = 'block';
            }, 300);
        });
    });
    
    // Back button
    if (backBtn) {
        backBtn.addEventListener('click', function() {
            registerForm.style.display = 'none';
            userTypeSelector.style.display = 'block';
            userTypeOptions.forEach(opt => opt.classList.remove('selected'));
            registerForm.reset();
        });
    }
    
    // Password visibility toggles
    if (togglePassword) {
        togglePassword.addEventListener('click', function() {
            togglePasswordVisibility('password', this);
        });
    }
    
    if (toggleConfirmPassword) {
        toggleConfirmPassword.addEventListener('click', function() {
            togglePasswordVisibility('confirmPassword', this);
        });
    }
    
    // Form submission
    registerForm.addEventListener('submit', handleRegister);
}

function togglePasswordVisibility(inputId, button) {
    const input = document.getElementById(inputId);
    const icon = button.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    
    const userType = document.getElementById('userType').value;
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const city = document.getElementById('city').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const terms = document.getElementById('terms').checked;
    const registerBtn = document.getElementById('registerBtn');
    
    // Teacher-specific
    const hourlyRate = userType === 'teacher' ? document.getElementById('hourlyRate').value : null;
    
    // Clear previous errors
    clearErrors();
    
    // Validate all fields
    let isValid = true;
    
    if (!firstName) {
        showError('firstName', 'First name is required');
        isValid = false;
    }
    
    if (!lastName) {
        showError('lastName', 'Last name is required');
        isValid = false;
    }
    
    if (!email || !isValidEmail(email)) {
        showError('email', 'Please enter a valid email address');
        isValid = false;
    }
    
    if (!phone || !isValidPhone(phone)) {
        showError('phone', 'Please enter a valid Ghana phone number');
        isValid = false;
    }
    
    if (!city) {
        showError('city', 'Please select your city');
        isValid = false;
    }
    
    if (password.length < 6) {
        showError('password', 'Password must be at least 6 characters');
        isValid = false;
    }
    
    if (password !== confirmPassword) {
        showError('confirmPassword', 'Passwords do not match');
        isValid = false;
    }
    
    if (userType === 'teacher' && (!hourlyRate || hourlyRate < 10)) {
        showError('hourlyRate', 'Please enter a valid hourly rate (minimum 10 GHS)');
        isValid = false;
    }
    
    if (!terms) {
        showError('terms', 'You must agree to the Terms of Service');
        isValid = false;
    }
    
    if (!isValid) {
        showFlashMessage('Please fix the errors below', 'error');
        return;
    }
    
    // Show loading state
    const resetLoading = showLoading(registerBtn);
    
    try {
        // Create user with Firebase Auth
        const userCredential = await firebaseAuth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        // Create user document in Firestore
        const userData = {
            uid: user.uid,
            email: email,
            userType: userType,
            firstName: firstName,
            lastName: lastName,
            phone: phone,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            isActive: true
        };
        
        await firebaseDB.collection('users').doc(user.uid).set(userData);
        
        // Create user-type-specific document
        if (userType === 'teacher') {
            await firebaseDB.collection('teachers').doc(user.uid).set({
                userId: user.uid,
                bio: '',
                qualification: '',
                experienceYears: 0,
                hourlyRate: parseFloat(hourlyRate),
                subjects: [],
                curricula: [],
                schoolLevels: [],
                location: {
                    city: city,
                    area: ''
                },
                verificationStatus: 'pending',
                verificationDocuments: {},
                rating: 0,
                totalSessions: 0,
                totalReviews: 0,
                isAvailable: false,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
        } else if (userType === 'parent') {
            await firebaseDB.collection('parents').doc(user.uid).set({
                userId: user.uid,
                location: {
                    city: city,
                    area: ''
                },
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
        
        // Success message
        showFlashMessage('Account created successfully! Redirecting...', 'success');
        
        // Redirect based on user type
        setTimeout(() => {
            if (userType === 'teacher') {
                window.location.href = '/pages/teacher/profile.html';
            } else {
                window.location.href = '/pages/parent/dashboard.html';
            }
        }, 1500);
        
    } catch (error) {
        console.error('Registration error:', error);
        
        let errorMessage = 'Registration failed. Please try again.';
        
        // Handle specific Firebase errors
        if (error.code === 'auth/email-already-in-use') {
            errorMessage = 'An account with this email already exists. Please login instead.';
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = 'Invalid email address format.';
        } else if (error.code === 'auth/weak-password') {
            errorMessage = 'Password is too weak. Please use at least 6 characters.';
        }
        
        showFlashMessage(errorMessage, 'error');
    } finally {
        resetLoading();
    }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function showError(fieldId, message) {
    const errorElement = document.getElementById(fieldId + 'Error');
    const inputElement = document.getElementById(fieldId);
    
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.add('show');
    }
    
    if (inputElement) {
        inputElement.classList.add('error');
    }
}

function clearErrors() {
    const errorElements = document.querySelectorAll('.error-message');
    errorElements.forEach(el => {
        el.classList.remove('show');
        el.textContent = '';
    });
    
    const inputElements = document.querySelectorAll('.form-group input, .form-group select');
    inputElements.forEach(el => {
        el.classList.remove('error');
    });
}

function redirectBasedOnUserType(userType) {
    switch(userType) {
        case 'teacher':
            window.location.href = '/pages/teacher/dashboard.html';
            break;
        case 'parent':
            window.location.href = '/pages/parent/dashboard.html';
            break;
        case 'admin':
            window.location.href = '/pages/admin/dashboard.html';
            break;
        default:
            window.location.href = '/index.html';
    }
}

// ============================================================================
// REAL-TIME VALIDATION
// ============================================================================

// Email validation on blur
const emailInput = document.getElementById('email');
if (emailInput) {
    emailInput.addEventListener('blur', function() {
        if (this.value && !isValidEmail(this.value)) {
            showError('email', 'Please enter a valid email address');
        } else {
            this.classList.remove('error');
            document.getElementById('emailError').classList.remove('show');
        }
    });
}

// Password strength indicator
const passwordInput = document.getElementById('password');
if (passwordInput) {
    passwordInput.addEventListener('input', function() {
        const password = this.value;
        const strength = getPasswordStrength(password);
        
        // Remove previous classes
        this.classList.remove('weak', 'medium', 'strong');
        
        // Add strength class
        if (password.length > 0) {
            this.classList.add(strength);
        }
    });
}

function getPasswordStrength(password) {
    let strength = 0;
    
    if (password.length >= 6) strength++;
    if (password.length >= 10) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    
    if (strength <= 2) return 'weak';
    if (strength <= 4) return 'medium';
    return 'strong';
}

// Phone number formatting
const phoneInput = document.getElementById('phone');
if (phoneInput) {
    phoneInput.addEventListener('input', function() {
        let value = this.value.replace(/\D/g, '');
        
        // Format: +233 XX XXX XXXX
        if (value.length > 0) {
            if (!value.startsWith('233')) {
                if (value.startsWith('0')) {
                    value = '233' + value.substring(1);
                } else {
                    value = '233' + value;
                }
            }
            
            // Add + at the beginning
            if (!this.value.startsWith('+')) {
                this.value = '+' + value;
            }
        }
    });
}

// Password match validation
const confirmPasswordInput = document.getElementById('confirmPassword');
if (confirmPasswordInput) {
    confirmPasswordInput.addEventListener('blur', function() {
        const password = document.getElementById('password').value;
        if (this.value && this.value !== password) {
            showError('confirmPassword', 'Passwords do not match');
        } else {
            this.classList.remove('error');
            document.getElementById('confirmPasswordError').classList.remove('show');
        }
    });
}
