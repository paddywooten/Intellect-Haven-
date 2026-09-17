/**
 * Intellect Haven - Main Application JavaScript
 * Web Application for Teacher-Parent Learning Platform
 */

// ============================================================================
// INITIALIZATION
// ============================================================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('Intellect Haven Platform Loaded');
    
    // Initialize features
    initNavigation();
    initMobileMenu();
    initScrollEffects();
    initSmoothScroll();
    loadPlatformStats();
});

// ============================================================================
// NAVIGATION
// ============================================================================

function initNavigation() {
    const navbar = document.getElementById('navbar');
    
    if (navbar) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }
}

// ============================================================================
// MOBILE MENU
// ============================================================================

function initMobileMenu() {
    const menuToggle = document.getElementById('mobileMenuToggle');
    const navLinks = document.getElementById('navLinks');
    
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            this.classList.toggle('active');
            
            // Toggle icon
            const icon = this.querySelector('i');
            if (navLinks.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
        
        // Close menu when clicking on a link
        const links = navLinks.querySelectorAll('.nav-link');
        links.forEach(link => {
            link.addEventListener('click', function() {
                navLinks.classList.remove('active');
                menuToggle.classList.remove('active');
                const icon = menuToggle.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            });
        });
    }
}

// ============================================================================
// SCROLL EFFECTS
// ============================================================================

function initScrollEffects() {
    // Animate elements on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe elements
    const animateElements = document.querySelectorAll('.trust-badge, .step, .category-card, .feature, .testimonial-card');
    animateElements.forEach(el => observer.observe(el));
}

// ============================================================================
// SMOOTH SCROLL
// ============================================================================

function initSmoothScroll() {
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    
    anchorLinks.forEach(function(link) {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                e.preventDefault();
                
                const offsetTop = targetElement.offsetTop - 80;
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ============================================================================
// PLATFORM STATS
// ============================================================================

async function loadPlatformStats() {
    try {
        // Get teacher count
        const teachersSnapshot = await firebaseDB.collection('teachers')
            .where('verificationStatus', '==', 'verified')
            .get();
        
        const teacherCount = teachersSnapshot.size;
        
        // Get parent count
        const parentsSnapshot = await firebaseDB.collection('parents').get();
        const parentCount = parentsSnapshot.size;
        
        // Update UI
        const teacherCountEl = document.getElementById('teacherCount');
        const parentCountEl = document.getElementById('parentCount');
        
        if (teacherCountEl) {
            teacherCountEl.textContent = teacherCount > 0 ? `${teacherCount}+` : '20+';
        }
        
        if (parentCountEl) {
            parentCountEl.textContent = parentCount > 0 ? `${parentCount}+` : '50+';
        }
        
    } catch (error) {
        console.log('Stats not available yet:', error);
        // Keep default values
    }
}

// ============================================================================
// AUTHENTICATION HELPERS
// ============================================================================

// Check if user is authenticated
function requireAuth() {
    if (!window.currentUser) {
        showFlashMessage('Please log in to access this page', 'warning');
        setTimeout(() => {
            window.location.href = '/login.html';
        }, 1500);
        return false;
    }
    return true;
}

// Check user type
function requireUserType(allowedTypes) {
    if (!requireAuth()) return false;
    
    if (!allowedTypes.includes(window.userData.userType)) {
        showFlashMessage('Access denied', 'error');
        setTimeout(() => {
            window.location.href = '/index.html';
        }, 1500);
        return false;
    }
    return true;
}

// Logout
function logout() {
    firebaseAuth.signOut().then(() => {
        showFlashMessage('Logged out successfully', 'success');
        setTimeout(() => {
            window.location.href = '/index.html';
        }, 1000);
    }).catch(error => {
        showFlashMessage('Error logging out', 'error');
    });
}

// ============================================================================
// FLASH MESSAGES
// ============================================================================

function showFlashMessage(message, type = 'info') {
    // Create container if it doesn't exist
    let container = document.querySelector('.flash-messages');
    if (!container) {
        container = document.createElement('div');
        container.className = 'flash-messages';
        document.body.appendChild(container);
    }
    
    // Create message element
    const messageEl = document.createElement('div');
    messageEl.className = `flash-message ${type}`;
    
    // Add icon
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    
    messageEl.innerHTML = `
        <i class="fas ${icons[type]}"></i>
        <span>${message}</span>
    `;
    
    container.appendChild(messageEl);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        messageEl.style.opacity = '0';
        messageEl.style.transform = 'translateX(400px)';
        messageEl.style.transition = 'all 0.3s ease';
        
        setTimeout(() => {
            messageEl.remove();
        }, 300);
    }, 5000);
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-GH', {
        style: 'currency',
        currency: 'GHS',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

// Format date
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-GB', options);
}

// Format time
function formatTime(timeString) {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
}

// Format timestamp
function formatTimestamp(timestamp) {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return formatDate(date);
}

// Validate email
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Validate phone (Ghana format)
function isValidPhone(phone) {
    const re = /^(\+233|0)[2357]\d{8}$/;
    return re.test(phone.replace(/\s/g, ''));
}

// Show loading state
function showLoading(element) {
    const originalText = element.innerHTML;
    element.disabled = true;
    element.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
    element.classList.add('loading');
    
    return function() {
        element.disabled = false;
        element.innerHTML = originalText;
        element.classList.remove('loading');
    };
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Generate unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Calculate age from date of birth
function calculateAge(dob) {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    
    return age;
}

// Display star rating
function displayStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    let stars = '';
    
    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fas fa-star"></i>';
    }
    
    if (hasHalfStar) {
        stars += '<i class="fas fa-star-half-alt"></i>';
    }
    
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="far fa-star"></i>';
    }
    
    return stars;
}

// ============================================================================
// FIRESTORE HELPERS
// ============================================================================

// Add document to collection
async function addDocument(collection, data) {
    try {
        const docRef = await firebaseDB.collection(collection).add({
            ...data,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error('Error adding document:', error);
        return { success: false, error: error.message };
    }
}

// Get document by ID
async function getDocument(collection, id) {
    try {
        const doc = await firebaseDB.collection(collection).doc(id).get();
        if (doc.exists) {
            return { success: true, data: { id: doc.id, ...doc.data() } };
        } else {
            return { success: false, error: 'Document not found' };
        }
    } catch (error) {
        console.error('Error getting document:', error);
        return { success: false, error: error.message };
    }
}

// Update document
async function updateDocument(collection, id, data) {
    try {
        await firebaseDB.collection(collection).doc(id).update({
            ...data,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        return { success: true };
    } catch (error) {
        console.error('Error updating document:', error);
        return { success: false, error: error.message };
    }
}

// Delete document
async function deleteDocument(collection, id) {
    try {
        await firebaseDB.collection(collection).doc(id).delete();
        return { success: true };
    } catch (error) {
        console.error('Error deleting document:', error);
        return { success: false, error: error.message };
    }
}

// Query collection
async function queryCollection(collection, field, operator, value) {
    try {
        const snapshot = await firebaseDB.collection(collection)
            .where(field, operator, value)
            .get();
        
        const documents = [];
        snapshot.forEach(doc => {
            documents.push({ id: doc.id, ...doc.data() });
        });
        
        return { success: true, data: documents };
    } catch (error) {
        console.error('Error querying collection:', error);
        return { success: false, error: error.message };
    }
}

// ============================================================================
// FILE UPLOAD HELPERS
// ============================================================================

// Upload file to Firebase Storage
async function uploadFile(file, path) {
    try {
        const storageRef = firebaseStorage.ref();
        const fileRef = storageRef.child(path);
        
        await fileRef.put(file);
        const downloadURL = await fileRef.getDownloadURL();
        
        return { success: true, url: downloadURL };
    } catch (error) {
        console.error('Error uploading file:', error);
        return { success: false, error: error.message };
    }
}

// Delete file from Firebase Storage
async function deleteFile(path) {
    try {
        const storageRef = firebaseStorage.ref();
        const fileRef = storageRef.child(path);
        
        await fileRef.delete();
        
        return { success: true };
    } catch (error) {
        console.error('Error deleting file:', error);
        return { success: false, error: error.message };
    }
}

// ============================================================================
// EXPORT FUNCTIONS
// ============================================================================

window.IntellectHaven = {
    // Auth
    requireAuth,
    requireUserType,
    logout,
    
    // UI
    showFlashMessage,
    showLoading,
    
    // Formatting
    formatCurrency,
    formatDate,
    formatTime,
    formatTimestamp,
    displayStars,
    
    // Validation
    isValidEmail,
    isValidPhone,
    
    // Utilities
    debounce,
    generateId,
    calculateAge,
    
    // Firestore
    addDocument,
    getDocument,
    updateDocument,
    deleteDocument,
    queryCollection,
    
    // Storage
    uploadFile,
    deleteFile
};
