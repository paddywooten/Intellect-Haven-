# 🚀 Intellect Haven - Quick Start Guide

Get your web app running in 10 minutes!

---

## ⚡ Super Quick Start

### 1. Create Firebase Project (5 minutes)
1. Go to https://console.firebase.google.com/
2. Click "Add Project" → Name it `intellect-haven`
3. Enable these services:
   - **Authentication** → Enable Email/Password
   - **Firestore Database** → Create in production mode
   - **Storage** → Enable in production mode

### 2. Get Your Firebase Config (2 minutes)
1. In Firebase Console, go to **Project Settings**
2. Scroll to **Your apps** → Click web icon `</>`
3. Register app name: `intellect-haven-web`
4. Copy the config object

### 3. Configure the App (1 minute)
1. Open `config/firebase-config.js`
2. Replace placeholder config with your actual config
3. Save the file

### 4. Test Locally (1 minute)
```bash
# Option 1: Just open index.html in browser
open index.html

# Option 2: Use local server
python -m http.server 8000
# Then visit: http://localhost:8000
```

### 5. Deploy to Firebase (1 minute)
```bash
# Install Firebase CLI (if not installed)
npm install -g firebase-tools

# Login
firebase login

# Initialize (first time only)
firebase init
# Select: Hosting
# Choose: Use existing project
# Select: intellect-haven
# Public directory: .
# Single-page app: No

# Deploy
firebase deploy
```

**That's it! Your site is live at: https://intellect-haven.web.app** 🎉

---

## 📋 Detailed Steps

### Step 1: Firebase Setup

#### Create Project
1. Visit https://console.firebase.google.com/
2. Click "Add Project"
3. Enter project name: `intellect-haven`
4. Disable Google Analytics (optional for MVP)
5. Click "Create Project"

#### Enable Authentication
1. Left menu → **Authentication**
2. Click **Get Started**
3. Click **Email/Password**
4. Toggle **Enable** → Click **Save**

#### Enable Firestore
1. Left menu → **Firestore Database**
2. Click **Create Database**
3. Select **Start in production mode**
4. Choose location (e.g., `eur3` for Europe, `nam5` for US)
5. Click **Enable**

#### Enable Storage
1. Left menu → **Storage**
2. Click **Get Started**
3. Select **Start in production mode**
4. Choose same location as Firestore
5. Click **Done**

### Step 2: Get Firebase Config

1. Click gear icon → **Project Settings**
2. Scroll to **Your apps** section
3. Click web icon `</>`
4. App nickname: `intellect-haven-web`
5. Check "Also set up Firebase Hosting" (optional)
6. Click **Register app**
7. Copy the config object (you'll need this next)

### Step 3: Configure Your App

Open `config/firebase-config.js` and replace:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "intellect-haven.firebaseapp.com",
  projectId: "intellect-haven",
  storageBucket: "intellect-haven.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

With your actual config from Firebase Console.

### Step 4: Set Up Security Rules

#### Firestore Rules
1. Go to **Firestore Database** → **Rules** tab
2. Replace rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /teachers/{teacherId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    match /parents/{parentId} {
      allow read, write: if request.auth != null;
    }
    
    match /bookings/{bookingId} {
      allow read, write: if request.auth != null;
    }
    
    match /reviews/{reviewId} {
      allow read: if true;
      allow create: if request.auth != null;
    }
  }
}
```

3. Click **Publish**

#### Storage Rules
1. Go to **Storage** → **Rules** tab
2. Replace rules with:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{userId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /teachers/{teacherId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

3. Click **Publish**

### Step 5: Test Locally

**Option A: Just open in browser**
- Double-click `index.html`
- Or drag it into your browser

**Option B: Use local server (recommended)**
```bash
# Python 3
python -m http.server 8000

# Node.js
npx http-server

# PHP
php -S localhost:8000
```

Visit: `http://localhost:8000`

### Step 6: Deploy to Firebase

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize project (first time only)
firebase init

# Select options:
# - Hosting: ✓ (use spacebar)
# - Select: Use an existing project
# - Choose: intellect-haven
# - Public directory: . (dot)
# - Single-page app: No
# - Automatic deploys: No

# Deploy
firebase deploy
```

Your site will be live at: `https://intellect-haven.web.app`

---

## 🎯 Next Steps

### 1. Create Test Users

Open browser console (F12) and run:

```javascript
// Create a teacher
firebase.auth().createUserWithEmailAndPassword('teacher@test.com', 'password123')
  .then(user => {
    firebase.firestore().collection('users').doc(user.user.uid).set({
      email: 'teacher@test.com',
      userType: 'teacher',
      firstName: 'John',
      lastName: 'Doe',
      phone: '+233201234567'
    });
    
    firebase.firestore().collection('teachers').doc(user.user.uid).set({
      userId: user.user.uid,
      bio: 'Experienced mathematics teacher',
      qualification: 'B.Ed Mathematics',
      experienceYears: 5,
      hourlyRate: 50,
      subjects: ['Mathematics', 'Physics'],
      curricula: ['GES', 'British'],
      schoolLevels: ['Primary', 'JHS'],
      location: { city: 'Accra', area: 'East Legon' },
      verificationStatus: 'verified',
      rating: 4.8,
      totalSessions: 0,
      isAvailable: true
    });
  });

// Create a parent
firebase.auth().createUserWithEmailAndPassword('parent@test.com', 'password123')
  .then(user => {
    firebase.firestore().collection('users').doc(user.user.uid).set({
      email: 'parent@test.com',
      userType: 'parent',
      firstName: 'Jane',
      lastName: 'Smith',
      phone: '+233201234567'
    });
    
    firebase.firestore().collection('parents').doc(user.user.uid).set({
      userId: user.user.uid,
      location: { city: 'Accra', area: 'Airport Residential' }
    });
  });
```

### 2. Test the Features

1. **Login** as teacher@test.com / password123
2. **Login** as parent@test.com / password123
3. **Browse** teachers on find-teacher.html
4. **Book** a session
5. **Submit** a review

### 3. Build Remaining Pages

Current status:
- ✅ Landing page (index.html)
- ✅ CSS framework (css/style.css)
- ✅ JavaScript framework (js/app.js)
- ✅ Firebase configuration

Still need to build:
- ⏳ login.html
- ⏳ register.html
- ⏳ find-teacher.html
- ⏳ teacher-profile.html
- ⏳ Teacher portal pages
- ⏳ Parent portal pages
- ⏳ Admin dashboard pages

---

## 🆘 Troubleshooting

### "Firebase is not defined"
**Solution:** Make sure Firebase SDK scripts are loaded in your HTML before your custom scripts.

### "Permission denied" errors
**Solution:** Check your Firestore/Storage security rules.

### "App domain not authorized"
**Solution:** Add your domain to Firebase Authentication → Settings → Authorized domains.

### Login not working
**Solution:** Enable Email/Password authentication in Firebase Console.

---

## 📚 Additional Resources

- **Firebase Documentation:** https://firebase.google.com/docs
- **Firebase Hosting Guide:** https://firebase.google.com/docs/hosting
- **Firestore Security Rules:** https://firebase.google.com/docs/firestore/security/get-started
- **Project Plan:** See `PROJECT_PLAN.md`
- **Full README:** See `README.md`

---

## 🎉 You're Ready!

Your Intellect Haven web app is now:
- ✅ Set up with Firebase backend
- ✅ Ready for development
- ✅ Configured for deployment
- ✅ Hosted online (after deploy)

**Next:** Start building the remaining pages and features!

Need help? Check the full README or PROJECT_PLAN for detailed documentation.
