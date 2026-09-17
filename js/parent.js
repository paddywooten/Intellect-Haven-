/**
 * Intellect Haven - Parent Portal JavaScript
 * Parent-specific functionality
 */

// ============================================================================
// INITIALIZATION
// ============================================================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('Parent Portal Loaded');
    
    // Check authentication and user type
    if (!requireUserType(['parent'])) {
        return;
    }
    
    // Initialize based on current page
    const path = window.location.pathname;
    
    if (path.endsWith('dashboard.html')) {
        initParentDashboard();
    } else if (path.endsWith('children.html')) {
        initChildrenPage();
    } else if (path.endsWith('search.html')) {
        initSearchPage();
    } else if (path.endsWith('bookings.html')) {
        initBookingsPage();
    } else if (path.endsWith('history.html')) {
        initHistoryPage();
    } else if (path.endsWith('reviews.html')) {
        initReviewsPage();
    }
});

// ============================================================================
// PARENT DASHBOARD
// ============================================================================

async function initParentDashboard() {
    try {
        // Update user name
        document.getElementById('parentName').textContent = window.userData.firstName;
        
        // Load stats
        await loadParentStats();
        
        // Load children
        await loadChildren();
        
        // Load upcoming sessions
        await loadUpcomingSessions();
        
        // Load recent activity
        await loadRecentActivity();
        
    } catch (error) {
        console.error('Error initializing dashboard:', error);
        showFlashMessage('Error loading dashboard', 'error');
    }
}

async function loadParentStats() {
    const parentId = window.currentUser.uid;
    
    // Count children
    const childrenSnapshot = await firebaseDB.collection('children')
        .where('parentId', '==', parentId)
        .get();
    
    document.getElementById('childrenCount').textContent = childrenSnapshot.size;
    
    // Get upcoming sessions
    const upcomingSnapshot = await firebaseDB.collection('bookings')
        .where('parentId', '==', parentId)
        .where('status', '==', 'confirmed')
        .where('sessionDate', '>=', new Date())
        .get();
    
    document.getElementById('upcomingSessions').textContent = upcomingSnapshot.size;
    
    // Get completed sessions
    const completedSnapshot = await firebaseDB.collection('bookings')
        .where('parentId', '==', parentId)
        .where('status', '==', 'completed')
        .get();
    
    document.getElementById('completedSessions').textContent = completedSnapshot.size;
    
    // Calculate total spent
    let totalSpent = 0;
    completedSnapshot.forEach(doc => {
        totalSpent += doc.data().totalAmount || 0;
    });
    
    document.getElementById('totalSpent').textContent = formatCurrency(totalSpent);
}

async function loadChildren() {
    const parentId = window.currentUser.uid;
    const container = document.getElementById('childrenGrid');
    
    try {
        const snapshot = await firebaseDB.collection('children')
            .where('parentId', '==', parentId)
            .get();
        
        if (snapshot.empty) {
            container.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1;">
                    <i class="fas fa-child"></i>
                    <p>No children added yet</p>
                    <a href="children.html" class="btn btn-primary" style="margin-top: 1rem;">
                        <i class="fas fa-plus"></i> Add Your First Child
                    </a>
                </div>
            `;
            return;
        }
        
        let childrenHTML = '';
        
        snapshot.forEach(doc => {
            const child = doc.data();
            const initials = (child.firstName[0] + (child.lastName ? child.lastName[0] : '')).toUpperCase();
            
            childrenHTML += `
                <div class="child-card">
                    <div class="child-header">
                        <div class="child-avatar">${initials}</div>
                        <div class="child-info">
                            <h4>${child.firstName} ${child.lastName || ''}</h4>
                            <p>${child.schoolLevel} • ${child.curriculum}</p>
                        </div>
                    </div>
                    <div class="child-details">
                        <div class="child-detail">
                            <span class="child-detail-label">School</span>
                            <span class="child-detail-value">${child.currentSchool || 'Not specified'}</span>
                        </div>
                        <div class="child-detail">
                            <span class="child-detail-label">Subjects</span>
                            <span class="child-detail-value">${child.subjectsNeeded ? child.subjectsNeeded.length : 0} subjects</span>
                        </div>
                    </div>
                    <a href="children.html?edit=${doc.id}" class="btn btn-outline btn-small" style="width: 100%; margin-top: 1rem;">
                        <i class="fas fa-edit"></i> Edit Profile
                    </a>
                </div>
            `;
        });
        
        container.innerHTML = childrenHTML;
        
    } catch (error) {
        console.error('Error loading children:', error);
        container.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <i class="fas fa-exclamation-circle"></i>
                <p>Error loading children</p>
            </div>
        `;
    }
}

async function loadUpcomingSessions() {
    const parentId = window.currentUser.uid;
    const container = document.getElementById('upcomingSessionsList');
    
    try {
        const snapshot = await firebaseDB.collection('bookings')
            .where('parentId', '==', parentId)
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
                    <a href="search.html" class="btn btn-primary" style="margin-top: 1rem;">
                        <i class="fas fa-search"></i> Find a Teacher
                    </a>
                </div>
            `;
            return;
        }
        
        let sessionsHTML = '';
        
        for (const doc of snapshot.docs) {
            const booking = doc.data();
            
            // Get teacher and child info
            const teacherDoc = await firebaseDB.collection('teachers').doc(booking.teacherId).get();
            const childDoc = await firebaseDB.collection('children').doc(booking.childId).get();
            const teacherUserDoc = await firebaseDB.collection('users').doc(booking.teacherId).get();
            
            const teacher = teacherDoc.data();
            const child = childDoc.data();
            const teacherUser = teacherUserDoc.data();
            
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
                        <h4>${booking.subject} with ${teacherUser.firstName} ${teacherUser.lastName}</h4>
                        <p>
                            <i class="fas fa-child"></i> ${child.firstName}
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

async function loadRecentActivity() {
    const parentId = window.currentUser.uid;
    const container = document.getElementById('activityList');
    
    try {
        // Get recent bookings (last 10)
        const snapshot = await firebaseDB.collection('bookings')
            .where('parentId', '==', parentId)
            .orderBy('createdAt', 'desc')
            .limit(5)
            .get();
        
        if (snapshot.empty) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-history"></i>
                    <p>No recent activity</p>
                </div>
            `;
            return;
        }
        
        let activityHTML = '';
        
        for (const doc of snapshot.docs) {
            const booking = doc.data();
            const createdAt = booking.createdAt.toDate();
            const timeAgo = getTimeAgo(createdAt);
            
            let icon = 'fa-calendar';
            let message = '';
            
            if (booking.status === 'pending') {
                icon = 'fa-clock';
                message = `Booking request sent for ${booking.subject}`;
            } else if (booking.status === 'confirmed') {
                icon = 'fa-check';
                message = `Session confirmed for ${booking.subject}`;
            } else if (booking.status === 'completed') {
                icon = 'fa-check-circle';
                message = `Completed ${booking.subject} session`;
            } else if (booking.status === 'cancelled') {
                icon = 'fa-times';
                message = `Session cancelled`;
            }
            
            activityHTML += `
                <div class="activity-item">
                    <div class="activity-icon">
                        <i class="fas ${icon}"></i>
                    </div>
                    <div class="activity-content">
                        <p>${message}</p>
                        <span class="activity-time">${timeAgo}</span>
                    </div>
                </div>
            `;
        }
        
        container.innerHTML = activityHTML;
        
    } catch (error) {
        console.error('Error loading activity:', error);
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-circle"></i>
                <p>Error loading activity</p>
            </div>
        `;
    }
}

function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + ' years ago';
    
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + ' months ago';
    
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + ' days ago';
    
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + ' hours ago';
    
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + ' minutes ago';
    
    return 'Just now';
}

// ============================================================================
// CHILDREN PAGE
// ============================================================================

async function initChildrenPage() {
    // Load children list
    await loadChildrenList();
    
    // Check if editing
    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get('edit');
    
    if (editId) {
        openEditChildModal(editId);
    }
    
    // Initialize form
    initChildForm();
}

async function loadChildrenList() {
    const parentId = window.currentUser.uid;
    const container = document.getElementById('childrenList');
    
    if (!container) return;
    
    try {
        const snapshot = await firebaseDB.collection('children')
            .where('parentId', '==', parentId)
            .get();
        
        if (snapshot.empty) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-child"></i>
                    <p>No children added yet</p>
                    <p>Click "Add Child" to get started</p>
                </div>
            `;
            return;
        }
        
        let childrenHTML = '';
        
        snapshot.forEach(doc => {
            const child = { id: doc.id, ...doc.data() };
            const age = child.dateOfBirth ? calculateAge(child.dateOfBirth) : null;
            
            childrenHTML += `
                <div class="child-card">
                    <div class="child-header">
                        <div class="child-avatar">${(child.firstName[0] + (child.lastName ? child.lastName[0] : '')).toUpperCase()}</div>
                        <div class="child-info">
                            <h4>${child.firstName} ${child.lastName || ''}</h4>
                            <p>${child.schoolLevel} • ${child.curriculum}${age ? ` • Age ${age}` : ''}</p>
                        </div>
                    </div>
                    <div class="child-details">
                        <div class="child-detail">
                            <span class="child-detail-label">School</span>
                            <span class="child-detail-value">${child.currentSchool || 'Not specified'}</span>
                        </div>
                        <div class="child-detail">
                            <span class="child-detail-label">Subjects Needed</span>
                            <span class="child-detail-value">${child.subjectsNeeded ? child.subjectsNeeded.join(', ') : 'None'}</span>
                        </div>
                    </div>
                    ${child.learningChallenges ? `
                        <div style="margin-top: 1rem; padding: 1rem; background: var(--bg-secondary); border-radius: var(--radius-sm);">
                            <strong>Learning Challenges:</strong><br>
                            ${child.learningChallenges}
                        </div>
                    ` : ''}
                    <div style="display: flex; gap: 0.5rem; margin-top: 1rem;">
                        <button class="btn btn-outline btn-small" onclick="editChild('${doc.id}')" style="flex: 1;">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn btn-outline btn-small" onclick="deleteChild('${doc.id}', '${child.firstName}')" style="flex: 1;">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = childrenHTML;
        
    } catch (error) {
        console.error('Error loading children:', error);
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-circle"></i>
                <p>Error loading children</p>
            </div>
        `;
    }
}

function initChildForm() {
    const form = document.getElementById('childForm');
    if (!form) return;
    
    form.addEventListener('submit', handleChildSubmit);
}

async function handleChildSubmit(e) {
    e.preventDefault();
    
    const submitBtn = document.getElementById('saveChildBtn');
    const resetLoading = showLoading(submitBtn);
    
    try {
        const childId = document.getElementById('childId').value;
        
        const childData = {
            firstName: document.getElementById('firstName').value.trim(),
            lastName: document.getElementById('lastName').value.trim(),
            dateOfBirth: document.getElementById('dateOfBirth').value || null,
            schoolLevel: document.getElementById('schoolLevel').value,
            curriculum: document.getElementById('curriculum').value,
            currentSchool: document.getElementById('currentSchool').value.trim(),
            learningChallenges: document.getElementById('learningChallenges').value.trim(),
            academicPerformance: document.getElementById('academicPerformance').value.trim(),
            subjectsNeeded: Array.from(document.querySelectorAll('input[name="subjectsNeeded"]:checked')).map(cb => cb.value),
            parentId: window.currentUser.uid,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        // Validate
        if (!childData.firstName) {
            throw new Error('First name is required');
        }
        
        if (!childData.schoolLevel || !childData.curriculum) {
            throw new Error('School level and curriculum are required');
        }
        
        if (childId) {
            // Update existing
            await firebaseDB.collection('children').doc(childId).update(childData);
            showFlashMessage('Child profile updated!', 'success');
        } else {
            // Create new
            childData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            await firebaseDB.collection('children').add(childData);
            showFlashMessage('Child added successfully!', 'success');
        }
        
        // Reset form and reload
        document.getElementById('childForm').reset();
        document.getElementById('childId').value = '';
        closeModal('childModal');
        loadChildrenList();
        
    } catch (error) {
        console.error('Error saving child:', error);
        showFlashMessage(error.message, 'error');
    } finally {
        resetLoading();
    }
}

function editChild(childId) {
    openEditChildModal(childId);
}

async function openEditChildModal(childId) {
    try {
        const doc = await firebaseDB.collection('children').doc(childId).get();
        
        if (!doc.exists) {
            showFlashMessage('Child not found', 'error');
            return;
        }
        
        const child = doc.data();
        
        // Populate form
        document.getElementById('childId').value = childId;
        document.getElementById('firstName').value = child.firstName || '';
        document.getElementById('lastName').value = child.lastName || '';
        document.getElementById('dateOfBirth').value = child.dateOfBirth || '';
        document.getElementById('schoolLevel').value = child.schoolLevel || '';
        document.getElementById('curriculum').value = child.curriculum || '';
        document.getElementById('currentSchool').value = child.currentSchool || '';
        document.getElementById('learningChallenges').value = child.learningChallenges || '';
        document.getElementById('academicPerformance').value = child.academicPerformance || '';
        
        // Check subjects
        if (child.subjectsNeeded) {
            child.subjectsNeeded.forEach(subject => {
                const checkbox = document.querySelector(`input[name="subjectsNeeded"][value="${subject}"]`);
                if (checkbox) checkbox.checked = true;
            });
        }
        
        // Open modal
        document.getElementById('childModal').classList.add('active');
        
    } catch (error) {
        console.error('Error loading child:', error);
        showFlashMessage('Error loading child data', 'error');
    }
}

async function deleteChild(childId, childName) {
    if (!confirm(`Are you sure you want to delete ${childName}'s profile? This cannot be undone.`)) {
        return;
    }
    
    try {
        await firebaseDB.collection('children').doc(childId).delete();
        showFlashMessage('Child profile deleted', 'success');
        loadChildrenList();
    } catch (error) {
        console.error('Error deleting child:', error);
        showFlashMessage('Error deleting child', 'error');
    }
}

// ============================================================================
// PLACEHOLDER FUNCTIONS (to be implemented)
// ============================================================================

function initSearchPage() {
    console.log('Search page - to be implemented');
}

function initBookingsPage() {
    console.log('Bookings page - to be implemented');
}

function initHistoryPage() {
    console.log('History page - to be implemented');
}

function initReviewsPage() {
    console.log('Reviews page - to be implemented');
}
