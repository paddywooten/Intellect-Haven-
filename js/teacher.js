/**
 * Intellect Haven - Teacher Portal JavaScript
 * Teacher-specific functionality
 */

// ============================================================================
// INITIALIZATION
// ============================================================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('Teacher Portal Loaded');
    
    // Check authentication and user type
    if (!requireUserType(['teacher'])) {
        return;
    }
    
    // Initialize based on current page
    const path = window.location.pathname;
    
    if (path.endsWith('dashboard.html')) {
        initTeacherDashboard();
    } else if (path.endsWith('profile.html')) {
        initTeacherProfile();
    } else if (path.endsWith('verification.html')) {
        initTeacherVerification();
    } else if (path.endsWith('availability.html')) {
        initTeacherAvailability();
    } else if (path.endsWith('bookings.html')) {
        initTeacherBookings();
    }
});

// ============================================================================
// TEACHER DASHBOARD
// ============================================================================

async function initTeacherDashboard() {
    try {
        // Load teacher data
        await loadTeacherData();
        
        // Load stats
        await loadTeacherStats();
        
        // Load upcoming sessions
        await loadUpcomingSessions();
        
        // Load recent reviews
        await loadRecentReviews();
        
        // Check profile completion
        await checkProfileCompletion();
        
    } catch (error) {
        console.error('Error initializing dashboard:', error);
        showFlashMessage('Error loading dashboard data', 'error');
    }
}

async function loadTeacherData() {
    const teacherDoc = await firebaseDB.collection('teachers').doc(window.currentUser.uid).get();
    
    if (!teacherDoc.exists) {
        showFlashMessage('Teacher profile not found', 'error');
        return;
    }
    
    const teacherData = teacherDoc.data();
    window.teacherData = teacherData;
    
    // Update UI
    document.getElementById('teacherName').textContent = window.userData.firstName;
    
    // Update verification badge
    const badge = document.getElementById('verificationBadge');
    const status = teacherData.verificationStatus;
    
    badge.className = 'verification-badge ' + status;
    
    if (status === 'verified') {
        badge.innerHTML = '<i class="fas fa-check-circle"></i><span>Verified Teacher</span>';
        document.getElementById('verificationAction').style.display = 'none';
    } else if (status === 'pending') {
        badge.innerHTML = '<i class="fas fa-clock"></i><span>Verification Pending</span>';
    } else if (status === 'rejected') {
        badge.innerHTML = '<i class="fas fa-times-circle"></i><span>Verification Rejected</span>';
    }
}

async function loadTeacherStats() {
    const teacherId = window.currentUser.uid;
    
    // Get upcoming sessions
    const upcomingSnapshot = await firebaseDB.collection('bookings')
        .where('teacherId', '==', teacherId)
        .where('status', '==', 'confirmed')
        .where('sessionDate', '>=', new Date())
        .get();
    
    document.getElementById('upcomingSessions').textContent = upcomingSnapshot.size;
    
    // Get completed sessions
    const completedSnapshot = await firebaseDB.collection('bookings')
        .where('teacherId', '==', teacherId)
        .where('status', '==', 'completed')
        .get();
    
    document.getElementById('completedSessions').textContent = completedSnapshot.size;
    
    // Calculate total earnings
    let totalEarnings = 0;
    completedSnapshot.forEach(doc => {
        totalEarnings += doc.data().totalAmount || 0;
    });
    
    document.getElementById('totalEarnings').textContent = formatCurrency(totalEarnings);
    
    // Get average rating
    const rating = window.teacherData.rating || 0;
    document.getElementById('averageRating').textContent = rating.toFixed(1);
}

async function loadUpcomingSessions() {
    const teacherId = window.currentUser.uid;
    const container = document.getElementById('upcomingSessionsList');
    
    try {
        const snapshot = await firebaseDB.collection('bookings')
            .where('teacherId', '==', teacherId)
            .where('status', 'in', ['confirmed', 'pending'])
            .where('sessionDate', '>=', new Date())
            .orderBy('sessionDate', 'asc')
            .limit(5)
            .get();
        
        if (snapshot.empty) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-calendar-times"></i>
                    <p>No upcoming sessions</p>
                    <p>Share your profile to get bookings!</p>
                </div>
            `;
            return;
        }
        
        let sessionsHTML = '';
        
        for (const doc of snapshot.docs) {
            const booking = doc.data();
            
            // Get parent and child info
            const parentDoc = await firebaseDB.collection('users').doc(booking.parentId).get();
            const childDoc = await firebaseDB.collection('children').doc(booking.childId).get();
            
            const parent = parentDoc.data();
            const child = childDoc.data();
            
            const sessionDate = booking.sessionDate.toDate();
            const day = sessionDate.getDate();
            const month = sessionDate.toLocaleString('default', { month: 'short' });
            
            sessionsHTML += `
                <div class="session-card">
                    <div class="session-date">
                        <div class="day">${day}</div>
                        <div class="month">${month}</div>
                    </div>
                    <div class="session-info">
                        <h4>${booking.subject}</h4>
                        <p>
                            <i class="fas fa-user"></i> ${child.firstName} ${child.lastName || ''}
                            <span style="margin: 0 0.5rem;">•</span>
                            <i class="fas fa-clock"></i> ${formatTime(booking.sessionTime)}
                            <span style="margin: 0 0.5rem;">•</span>
                            <i class="fas fa-hourglass-half"></i> ${booking.duration}h
                        </p>
                    </div>
                    <div class="session-status ${booking.status}">
                        ${booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </div>
                </div>
            `;
        }
        
        container.innerHTML = sessionsHTML;
        
    } catch (error) {
        console.error('Error loading sessions:', error);
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-circle"></i>
                <p>Error loading sessions</p>
            </div>
        `;
    }
}

async function loadRecentReviews() {
    const teacherId = window.currentUser.uid;
    const container = document.getElementById('recentReviewsList');
    
    try {
        const snapshot = await firebaseDB.collection('reviews')
            .where('teacherId', '==', teacherId)
            .orderBy('createdAt', 'desc')
            .limit(3)
            .get();
        
        if (snapshot.empty) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-star"></i>
                    <p>No reviews yet</p>
                    <p>Complete sessions to receive reviews!</p>
                </div>
            `;
            return;
        }
        
        let reviewsHTML = '';
        
        for (const doc of snapshot.docs) {
            const review = doc.data();
            
            // Get parent info
            const parentDoc = await firebaseDB.collection('users').doc(review.parentId).get();
            const parent = parentDoc.data();
            
            const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
            const date = review.createdAt.toDate().toLocaleDateString('en-GB', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            
            reviewsHTML += `
                <div class="review-card">
                    <div class="review-header">
                        <div class="review-author">${parent.firstName} ${parent.lastName}</div>
                        <div class="review-rating">${stars}</div>
                    </div>
                    <div class="review-text">"${review.comment}"</div>
                    <div class="review-date">${date}</div>
                </div>
            `;
        }
        
        container.innerHTML = reviewsHTML;
        
    } catch (error) {
        console.error('Error loading reviews:', error);
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-circle"></i>
                <p>Error loading reviews</p>
            </div>
        `;
    }
}

async function checkProfileCompletion() {
    const teacher = window.teacherData;
    const tasks = [];
    let completedCount = 0;
    
    // Check profile photo
    if (teacher.profilePhoto) {
        tasks.push({ text: 'Profile photo uploaded', completed: true, link: 'profile.html' });
        completedCount++;
    } else {
        tasks.push({ text: 'Upload profile photo', completed: false, link: 'profile.html' });
    }
    
    // Check bio
    if (teacher.bio && teacher.bio.length > 50) {
        tasks.push({ text: 'Bio completed (50+ characters)', completed: true, link: 'profile.html' });
        completedCount++;
    } else {
        tasks.push({ text: 'Write your bio (50+ characters)', completed: false, link: 'profile.html' });
    }
    
    // Check qualification
    if (teacher.qualification) {
        tasks.push({ text: 'Qualification added', completed: true, link: 'profile.html' });
        completedCount++;
    } else {
        tasks.push({ text: 'Add your qualification', completed: false, link: 'profile.html' });
    }
    
    // Check subjects
    if (teacher.subjects && teacher.subjects.length > 0) {
        tasks.push({ text: 'Subjects selected', completed: true, link: 'profile.html' });
        completedCount++;
    } else {
        tasks.push({ text: 'Select subjects you teach', completed: false, link: 'profile.html' });
    }
    
    // Check availability
    if (teacher.availability && teacher.availability.length > 0) {
        tasks.push({ text: 'Availability set', completed: true, link: 'availability.html' });
        completedCount++;
    } else {
        tasks.push({ text: 'Set your availability', completed: false, link: 'availability.html' });
    }
    
    // Check verification
    if (teacher.verificationStatus === 'verified') {
        tasks.push({ text: 'Account verified', completed: true, link: 'verification.html' });
        completedCount++;
    } else {
        tasks.push({ text: 'Complete verification', completed: false, link: 'verification.html' });
    }
    
    // Calculate percentage
    const percentage = Math.round((completedCount / tasks.length) * 100);
    
    // Update UI
    document.getElementById('completionProgress').style.width = percentage + '%';
    document.getElementById('completionText').textContent = percentage + '% complete';
    
    // Render tasks
    const tasksContainer = document.getElementById('completionTasks');
    tasksContainer.innerHTML = tasks.map(task => `
        <div class="completion-task ${task.completed ? 'completed' : ''}">
            <i class="fas ${task.completed ? 'fa-check-circle' : 'fa-circle'}"></i>
            <span>${task.text}</span>
            ${!task.completed ? `<a href="${task.link}">Complete</a>` : ''}
        </div>
    `).join('');
    
    // Hide section if 100% complete
    if (percentage === 100) {
        document.getElementById('profileCompletionSection').style.display = 'none';
    }
}

// ============================================================================
// TEACHER PROFILE
// ============================================================================

async function initTeacherProfile() {
    // Load profile data
    await loadProfileData();
    
    // Initialize form
    initProfileForm();
}

async function loadProfileData() {
    const teacherDoc = await firebaseDB.collection('teachers').doc(window.currentUser.uid).get();
    
    if (!teacherDoc.exists) {
        showFlashMessage('Teacher profile not found', 'error');
        return;
    }
    
    window.teacherData = teacherDoc.data();
    
    // Populate form
    const teacher = window.teacherData;
    
    if (document.getElementById('bio')) {
        document.getElementById('bio').value = teacher.bio || '';
    }
    
    if (document.getElementById('qualification')) {
        document.getElementById('qualification').value = teacher.qualification || '';
    }
    
    if (document.getElementById('experienceYears')) {
        document.getElementById('experienceYears').value = teacher.experienceYears || 0;
    }
    
    if (document.getElementById('hourlyRate')) {
        document.getElementById('hourlyRate').value = teacher.hourlyRate || 0;
    }
    
    // Load subjects
    if (teacher.subjects && teacher.subjects.length > 0) {
        teacher.subjects.forEach(subject => {
            const checkbox = document.querySelector(`input[name="subjects"][value="${subject}"]`);
            if (checkbox) checkbox.checked = true;
        });
    }
    
    // Load curricula
    if (teacher.curricula && teacher.curricula.length > 0) {
        teacher.curricula.forEach(curriculum => {
            const checkbox = document.querySelector(`input[name="curricula"][value="${curriculum}"]`);
            if (checkbox) checkbox.checked = true;
        });
    }
    
    // Load school levels
    if (teacher.schoolLevels && teacher.schoolLevels.length > 0) {
        teacher.schoolLevels.forEach(level => {
            const checkbox = document.querySelector(`input[name="schoolLevels"][value="${level}"]`);
            if (checkbox) checkbox.checked = true;
        });
    }
}

function initProfileForm() {
    const form = document.getElementById('profileForm');
    
    if (form) {
        form.addEventListener('submit', handleProfileUpdate);
    }
}

async function handleProfileUpdate(e) {
    e.preventDefault();
    
    const submitBtn = document.getElementById('saveProfileBtn');
    const resetLoading = showLoading(submitBtn);
    
    try {
        // Collect form data
        const bio = document.getElementById('bio').value.trim();
        const qualification = document.getElementById('qualification').value.trim();
        const experienceYears = parseInt(document.getElementById('experienceYears').value) || 0;
        const hourlyRate = parseFloat(document.getElementById('hourlyRate').value) || 0;
        
        // Collect checkboxes
        const subjects = Array.from(document.querySelectorAll('input[name="subjects"]:checked'))
            .map(cb => cb.value);
        
        const curricula = Array.from(document.querySelectorAll('input[name="curricula"]:checked'))
            .map(cb => cb.value);
        
        const schoolLevels = Array.from(document.querySelectorAll('input[name="schoolLevels"]:checked'))
            .map(cb => cb.value);
        
        // Validate
        if (!bio || bio.length < 50) {
            throw new Error('Bio must be at least 50 characters');
        }
        
        if (!qualification) {
            throw new Error('Please enter your qualification');
        }
        
        if (subjects.length === 0) {
            throw new Error('Please select at least one subject');
        }
        
        if (curricula.length === 0) {
            throw new Error('Please select at least one curriculum');
        }
        
        if (schoolLevels.length === 0) {
            throw new Error('Please select at least one school level');
        }
        
        if (hourlyRate < 10) {
            throw new Error('Hourly rate must be at least 10 GHS');
        }
        
        // Update Firestore
        await firebaseDB.collection('teachers').doc(window.currentUser.uid).update({
            bio: bio,
            qualification: qualification,
            experienceYears: experienceYears,
            hourlyRate: hourlyRate,
            subjects: subjects,
            curricula: curricula,
            schoolLevels: schoolLevels,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        showFlashMessage('Profile updated successfully!', 'success');
        
        // Reload data
        await loadProfileData();
        
    } catch (error) {
        console.error('Error updating profile:', error);
        showFlashMessage(error.message, 'error');
    } finally {
        resetLoading();
    }
}

// ============================================================================
// PLACEHOLDER FUNCTIONS (to be implemented)
// ============================================================================

function initTeacherVerification() {
    console.log('Verification page - to be implemented');
}

function initTeacherAvailability() {
    console.log('Availability page - to be implemented');
}

function initTeacherBookings() {
    console.log('Bookings page - to be implemented');
}
