# 🎓 Intellect Haven - Web Application

**Africa's Trusted Teacher-Parent Learning Platform**

*Nurturing Minds, Inspiring Futures*

---

## 📖 Overview

Intellect Haven is a modern web application that connects verified teachers with parents for personalized, one-on-one learning experiences. Built as a hosted web app using Firebase for backend services.

---

## 🌐 Live Demo

**Coming Soon** - The platform will be deployed to:
- **URL:** https://intellecthaven.com
- **Hosting:** Firebase Hosting (or Netlify/Vercel)

---

## 🛠️ Tech Stack

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with CSS Grid/Flexbox
- **JavaScript (ES6+)** - Client-side logic
- **Font Awesome 6** - Icons
- **Google Fonts** - Typography (Poppins, Inter)

### Backend (Firebase)
- **Firebase Authentication** - User login/registration
- **Cloud Firestore** - NoSQL database
- **Firebase Storage** - File uploads (documents, images)
- **Firebase Hosting** - Web hosting with CDN

### Deployment
- **Primary:** Firebase Hosting
- **Alternative:** Netlify or Vercel
- **SSL:** Automatic HTTPS
- **CDN:** Global content delivery

---

## 📁 Project Structure

```
intellect-haven/
├── index.html                  # Landing page
├── login.html                  # Login page
├── register.html               # Registration page
├── find-teacher.html           # Teacher search
├── teacher-profile.html        # Teacher profile
├── about.html                  # About page
│
├── pages/
│   ├── teacher/                # Teacher portal pages
│   ├── parent/                 # Parent portal pages
│   └── admin/                  # Admin dashboard pages
│
├── css/
│   └── style.css               # Main stylesheet
│
├── js/
│   ├── app.js                  # Main application logic
│   ├── auth.js                 # Authentication functions
│   ├── teacher.js              # Teacher portal logic
│   ├── parent.js               # Parent portal logic
│   └── admin.js                # Admin logic
│
├── config/
│   └── firebase-config.js      # Firebase configuration
│
├── images/                     # Image assets
├── firebase.json               # Firebase hosting config
├── .firebaserc                 # Firebase project config
└── README.md                   # This file
```

---

## 🚀 Getting Started

### Prerequisites

1. **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
2. **Firebase Account** - [Sign up](https://firebase.google.com/)
3. **Firebase CLI** - Install globally:
   ```bash
   npm install -g firebase-tools
   ```

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project"
3. Name it: `intellect-haven`
4. Enable Google Analytics (optional)
5. Click "Create Project"

### Step 2: Enable Firebase Services

#### Authentication
1. Go to **Authentication** → **Get Started**
2. Enable **Email/Password** sign-in method
3. Save

#### Firestore Database
1. Go to **Firestore Database** → **Create Database**
2. Choose **Start in production mode**
3. Select location (choose closest to your users)
4. Click **Enable**

#### Storage
1. Go to **Storage** → **Get Started**
2. Choose **Start in production mode**
3. Select location (same as Firestore)
4. Click **Done**

### Step 3: Get Firebase Configuration

1. Go to **Project Settings** (gear icon)
2. Scroll to **Your apps** section
3. Click the web icon `</>`
4. Register app name: `intellect-haven-web`
5. Click **Register app**
6. Copy the config object

### Step 4: Configure the App

1. Open `config/firebase-config.js`
2. Replace the placeholder config with your actual config:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "intellect-haven.firebaseapp.com",
  projectId: "intellect-haven",
  storageBucket: "intellect-haven.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

3. Save the file

### Step 5: Set Up Firestore Security Rules

1. Go to **Firestore Database** → **Rules**
2. Replace with these rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Teachers collection
    match /teachers/{teacherId} {
      allow read: if true; // Anyone can read verified teachers
      allow write: if request.auth != null && 
                      request.auth.uid == resource.data.userId;
    }
    
    // Parents collection
    match /parents/{parentId} {
      allow read, write: if request.auth != null && 
                          request.auth.uid == resource.data.userId;
    }
    
    // Bookings - teachers and parents involved can read/write
    match /bookings/{bookingId} {
      allow read, write: if request.auth != null && 
                          (request.auth.uid == resource.data.teacherId ||
                           request.auth.uid == resource.data.parentId);
    }
    
    // Reviews - anyone can read, authenticated users can create
    match /reviews/{reviewId} {
      allow read: if true;
      allow create: if request.auth != null;
    }
  }
}
```

3. Click **Publish**

### Step 6: Set Up Storage Rules

1. Go to **Storage** → **Rules**
2. Replace with these rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Users can upload their own files
    match /users/{userId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Teacher verification documents
    match /teachers/{teacherId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

3. Click **Publish**

### Step 7: Test Locally

1. Open `index.html` in your browser
2. Or use a local server:
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Using Node.js
   npx http-server
   ```
3. Visit `http://localhost:8000`

### Step 8: Deploy to Firebase Hosting

1. Login to Firebase:
   ```bash
   firebase login
   ```

2. Initialize Firebase in your project:
   ```bash
   firebase init
   ```

3. Select:
   - **Hosting** (use spacebar, then Enter)
   - Choose **Use an existing project**
   - Select your `intellect-haven` project
   - Public directory: `.` (current directory)
   - Single-page app: **No**
   - Automatic deploys: **No** (optional)

4. Deploy:
   ```bash
   firebase deploy
   ```

5. Your site will be live at: `https://intellect-haven.web.app`

### Step 9: Custom Domain (Optional)

1. Go to **Hosting** in Firebase Console
2. Click **Add custom domain**
3. Enter your domain (e.g., `intellecthaven.com`)
4. Follow DNS configuration instructions
5. Wait for SSL certificate (automatic, takes a few minutes)

---

## 🎨 Features

### For Parents
- ✅ Browse verified teachers by subject, curriculum, and location
- ✅ Create child profiles with learning needs
- ✅ Book sessions with preferred teachers
- ✅ Track progress with detailed session reports
- ✅ Leave reviews and ratings

### For Teachers
- ✅ Create professional profiles
- ✅ Upload verification documents
- ✅ Set availability and hourly rates
- ✅ Receive and manage booking requests
- ✅ Submit lesson reports

### For Admins
- ✅ Verify teacher credentials
- ✅ Monitor platform activity
- ✅ Manage users and bookings
- ✅ View analytics and reports

---

## 📊 Database Schema

### Collections

1. **users** - User accounts (teachers, parents, admins)
2. **teachers** - Teacher profiles and verification
3. **parents** - Parent profiles
4. **children** - Child profiles (subcollection)
5. **bookings** - Session bookings
6. **reviews** - Parent reviews
7. **sessions** - Lesson notes and progress

See `PROJECT_PLAN.md` for detailed schema documentation.

---

## 🔐 Security

### Authentication
- Firebase Authentication with email/password
- Secure password hashing (Firebase default)
- Session management
- Protected routes

### Data Protection
- Firestore security rules
- Storage security rules
- Encrypted data at rest (Firebase default)
- HTTPS everywhere

### Child Safety
- Mandatory teacher verification
- Document checks
- Safeguarding policies
- Parent reviews and monitoring

---

## 🚀 Deployment Options

### Option 1: Firebase Hosting (Recommended)
**Pros:** Free tier, automatic SSL, global CDN, easy setup
**Cons:** Limited to Firebase ecosystem

```bash
firebase deploy
```

### Option 2: Netlify
**Pros:** Free tier, automatic deployments, form handling
**Cons:** Requires manual Firebase setup

1. Push code to GitHub
2. Connect repo to Netlify
3. Set build command: (none)
4. Set publish directory: `.`
5. Deploy

### Option 3: Vercel
**Pros:** Free tier, automatic deployments, edge network
**Cons:** Requires manual Firebase setup

1. Push code to GitHub
2. Import project to Vercel
3. Deploy

---

## 💰 Cost Estimation

### Firebase Free Tier (Spark Plan)
- **Authentication:** Free (unlimited users)
- **Firestore:** Free (50K reads/day, 20K writes/day)
- **Storage:** Free (5GB storage, 1GB/day download)
- **Hosting:** Free (10GB storage, 360MB/day transfer)

### Estimated Monthly Cost (First Year)
- **Domain:** $12/year (~$1/month)
- **Firebase:** $0 (free tier sufficient for MVP)
- **Total:** ~$1/month

### Scaling Costs (Post-MVP)
- **Firebase Blaze Plan:** $25-100/month
- **Email Service:** $20/month (SendGrid)
- **Total:** $50-200/month

---

## 📱 Future Enhancements

### Phase 2 (Post-MVP)
- AI-powered teacher matching
- In-app messaging
- Video calling integration
- Payment processing (Paystack)
- Progressive Web App (PWA)

### Phase 3 (Growth)
- Native mobile apps (React Native)
- Learning materials marketplace
- Advanced analytics
- Expansion to other African countries

---

## 🧪 Testing

### Manual Testing Checklist
- [ ] User registration (teacher/parent)
- [ ] User login/logout
- [ ] Teacher profile creation
- [ ] Document upload
- [ ] Parent profile creation
- [ ] Child profile creation
- [ ] Teacher search and filtering
- [ ] Booking request
- [ ] Session management
- [ ] Review submission
- [ ] Admin verification workflow

### Browser Testing
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile browsers (iOS Safari, Chrome Mobile)

---

## 🐛 Troubleshooting

### Issue: Firebase config not working
**Solution:** Double-check your config values in `config/firebase-config.js`

### Issue: Firestore permission denied
**Solution:** Check your security rules in Firebase Console

### Issue: File upload fails
**Solution:** Check Storage rules and file size limits

### Issue: Login not working
**Solution:** Enable Email/Password authentication in Firebase Console

---

## 📞 Support

For technical support or questions:
- **Email:** support@intellecthaven.com
- **Documentation:** See `PROJECT_PLAN.md`
- **Issues:** Create GitHub issues (if public repo)

---

## 🙏 Acknowledgments

Built with ❤️ for African education

**Technologies:**
- Firebase by Google
- Font Awesome
- Google Fonts

---

## 📄 License

Proprietary - All rights reserved © 2024 Intellect Haven

---

## 🚀 Ready to Launch?

1. ✅ Complete all pages (login, register, dashboards)
2. ✅ Test all features thoroughly
3. ✅ Deploy to Firebase Hosting
4. ✅ Set up custom domain
5. ✅ Launch marketing campaign
6. ✅ Onboard first teachers and parents

**Let's build the future of African education! 🎓**
