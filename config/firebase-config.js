// Firebase Configuration for Intellect Haven
// Replace these with your actual Firebase project credentials

const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "intellect-haven.firebaseapp.com",
  projectId: "intellect-haven",
  storageBucket: "intellect-haven.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// Export for use in other files
window.firebaseAuth = auth;
window.firebaseDB = db;
window.firebaseStorage = storage;

// Authentication state observer
auth.onAuthStateChanged((user) => {
  if (user) {
    // User is signed in
    console.log('User signed in:', user.email);
    window.currentUser = user;
    
    // Get user data from Firestore
    db.collection('users').doc(user.uid).get().then((doc) => {
      if (doc.exists) {
        window.userData = doc.data();
        console.log('User data loaded:', window.userData);
        
        // Redirect based on user type if on login page
        if (window.location.pathname.includes('login.html')) {
          redirectBasedOnUserType(window.userData.userType);
        }
      }
    });
  } else {
    // User is signed out
    console.log('User signed out');
    window.currentUser = null;
    window.userData = null;
    
    // Redirect to login if on protected page
    const protectedPages = ['/pages/', 'dashboard', 'profile'];
    const currentPath = window.location.pathname;
    if (protectedPages.some(page => currentPath.includes(page))) {
      window.location.href = '/login.html';
    }
  }
});

// Redirect based on user type
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

// Check if user is authenticated
function requireAuth() {
  if (!window.currentUser) {
    window.location.href = '/login.html';
    return false;
  }
  return true;
}

// Check user type
function requireUserType(allowedTypes) {
  if (!requireAuth()) return false;
  
  if (!allowedTypes.includes(window.userData.userType)) {
    alert('Access denied');
    window.location.href = '/index.html';
    return false;
  }
  return true;
}
