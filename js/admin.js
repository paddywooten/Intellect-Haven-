/**
 * Intellect Haven - Admin Portal JavaScript
 * Admin-specific functionality
 */

// ============================================================================
// INITIALIZATION
// ============================================================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin Portal Loaded');
    
    // Check authentication and user type
    if (!requireUserType(['admin'])) {
        return;
    }
    
    // Initialize based on current page
    const path = window.location.pathname;
    
    if (path.endsWith('dashboard.html')) {
        initAdminDashboard();
    } else if (path.endsWith('verification.html')) {
        initVerificationPage();
    } else if (path.endsWith('users.html')) {
        initUsersPage();
    } else if (path.endsWith('bookings.html')) {
        initAdminBookingsPage();
    } else if (path.endsWith('reports.html')) {
        initReportsPage();
    }
});

// ============================================================================
// ADMIN DASHBOARD
// ============================================================================

async function initAdminDashboard() {
    try {
        // Load all stats
        await loadPlatformStats();
        await loadQuickStats();
        await loadRecentVerifications();
        await loadRecentBookings();
        await loadPlatformHealth();
        
    } catch (error) {
        console.error('Error initializing admin dashboard:', error);
        showFlashMessage('Error loading dashboard data', 'error');
    }
}

async function loadPlatformStats() {
    // Total users
    const usersSnapshot = await firebaseDB.collection('users').get();
    document.getElementById('totalUsers').textContent = usersSnapshot.size;
    
    // Total teachers
    const teachersSnapshot = await firebaseDB.collection('teachers').get();
    document.getElementById('totalTeachers').textContent = teachersSnapshot.size;
    
    // Total parents
    const parentsSnapshot = await firebaseDB.collection('parents').get();
    document.getElementById('totalParents').textContent = parentsSnapshot.size;
    
    // Total bookings
    const bookingsSnapshot = await firebaseDB.collection('bookings').get();
    document.getElementById('totalBookings').textContent = bookingsSnapshot.size;
}

async function loadQuickStats() {
    // Pending verifications
    const pendingSnapshot = await firebaseDB.collection('teachers')
        .where('verificationStatus', '==', 'pending')
        .get();
    document.getElementById('pendingVerifications').textContent = pendingSnapshot.size;
    
    // Verified teachers
    const verifiedSnapshot = await firebaseDB.collection('teachers')
        .where('verificationStatus', '==', 'verified')
        .get();
    document.getElementById('verifiedTeachers').textContent = verifiedSnapshot.size;
    
    // Total revenue (from completed bookings)
    const completedSnapshot = await firebaseDB.collection('bookings')
        .where('status', '==', 'completed')
        .get();
    
    let totalRevenue = 0;
    completedSnapshot.forEach(doc => {
        totalRevenue += doc.data().totalAmount || 0;
    });
    document.getElementById('totalRevenue').textContent = formatCurrency(totalRevenue);
    
    // Average teacher rating
    let totalRating = 0;
    let ratingCount = 0;
    
    verifiedSnapshot.forEach(doc => {
        const teacher = doc.data();
        if (teacher.rating && teacher.rating > 0) {
            totalRating += teacher.rating;
            ratingCount++;
        }
    });
    
    const avgRating = ratingCount > 0 ? (totalRating / ratingCount).toFixed(1) : '0.0';
    document.getElementById('averageRating').textContent = avgRating;
}

async function loadRecentVerifications() {
    const container = document.getElementById('recentVerifications');
    
    try {
        const snapshot = await firebaseDB.collection('teachers')
            .where('verificationStatus', '==', 'pending')
            .orderBy('createdAt', 'desc')
            .limit(5)
            .get();
        
        if (snapshot.empty) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-check-circle"></i>
                    <p>No pending verifications</p>
                </div>
            `;
            return;
        }
        
        let verificationsHTML = '';
        
        for (const doc of snapshot.docs) {
            const teacher = doc.data();
            const userDoc = await firebaseDB.collection('users').doc(teacher.userId).get();
            const user = userDoc.data();
            
            const submittedAt = teacher.createdAt.toDate();
            const timeAgo = getTimeAgo(submittedAt);
            
            verificationsHTML += `
                <div class="verification-card">
                    <div class="verification-header">
                        <div class="verification-info">
                            <h4>${user.firstName} ${user.lastName}</h4>
                            <div class="verification-meta">
                                <span><i class="fas fa-envelope"></i> ${user.email}</span>
                                <span><i class="fas fa-clock"></i> ${timeAgo}</span>
                            </div>
                        </div>
                        <div class="verification-status pending">Pending</div>
                    </div>
                    <div class="verification-actions">
                        <a href="verification.html?review=${doc.id}" class="btn btn-primary btn-small">
                            <i class="fas fa-eye"></i> Review
                        </a>
                    </div>
                </div>
            `;
        }
        
        container.innerHTML = verificationsHTML;
        
    } catch (error) {
        console.error('Error loading verifications:', error);
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-circle"></i>
                <p>Error loading verifications</p>
            </div>
        `;
    }
}

async function loadRecentBookings() {
    const container = document.getElementById('recentBookings');
    
    try {
        const snapshot = await firebaseDB.collection('bookings')
            .orderBy('createdAt', 'desc')
            .limit(5)
            .get();
        
        if (snapshot.empty) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-calendar-times"></i>
                    <p>No bookings yet</p>
                </div>
            `;
            return;
        }
        
        let bookingsHTML = '';
        
        for (const doc of snapshot.docs) {
            const booking = doc.data();
            
            // Get teacher and parent info
            const teacherDoc = await firebaseDB.collection('teachers').doc(booking.teacherId).get();
            const parentDoc = await firebaseDB.collection('users').doc(booking.parentId).get();
            const teacherUserDoc = await firebaseDB.collection('users').doc(teacherDoc.data().userId).get();
            
            const teacher = teacherUserDoc.data();
            const parent = parentDoc.data();
            
            const sessionDate = booking.sessionDate.toDate();
            const dateStr = sessionDate.toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short'
            });
            
            bookingsHTML += `
                <div class="session-card">
                    <div class="session-date">
                        <div class="day">${sessionDate.getDate()}</div>
                        <div class="month">${sessionDate.toLocaleString('default', { month: 'short' })}</div>
                    </div>
                    <div class="session-info">
                        <h4>${booking.subject}</h4>
                        <p>
                            <i class="fas fa-chalkboard-teacher"></i> ${teacher.firstName} ${teacher.lastName}
                            <span style="margin: 0 0.5rem;">•</span>
                            <i class="fas fa-user"></i> ${parent.firstName} ${parent.lastName}
                        </p>
                    </div>
                    <div class="session-status ${booking.status}">
                        ${booking.status}
                    </div>
                </div>
            `;
        }
        
        container.innerHTML = bookingsHTML;
        
    } catch (error) {
        console.error('Error loading bookings:', error);
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-circle"></i>
                <p>Error loading bookings</p>
            </div>
        `;
    }
}

async function loadPlatformHealth() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // Active teachers (had bookings in last 30 days)
    const activeTeachersSnapshot = await firebaseDB.collection('bookings')
        .where('sessionDate', '>=', thirtyDaysAgo)
        .get();
    
    const activeTeacherIds = new Set();
    activeTeachersSnapshot.forEach(doc => {
        activeTeacherIds.add(doc.data().teacherId);
    });
    
    const totalTeachers = (await firebaseDB.collection('teachers').get()).size;
    const activeTeachers = activeTeacherIds.size;
    const activeTeachersPercent = totalTeachers > 0 ? (activeTeachers / totalTeachers * 100) : 0;
    
    document.getElementById('activeTeachers').textContent = activeTeachers;
    document.getElementById('activeTeachersBar').style.width = activeTeachersPercent + '%';
    
    // Active parents (had bookings in last 30 days)
    const activeParentIds = new Set();
    activeTeachersSnapshot.forEach(doc => {
        activeParentIds.add(doc.data().parentId);
    });
    
    const totalParents = (await firebaseDB.collection('parents').get()).size;
    const activeParents = activeParentIds.size;
    const activeParentsPercent = totalParents > 0 ? (activeParents / totalParents * 100) : 0;
    
    document.getElementById('activeParents').textContent = activeParents;
    document.getElementById('activeParentsBar').style.width = activeParentsPercent + '%';
    
    // Booking completion rate
    const totalBookings = (await firebaseDB.collection('bookings').get()).size;
    const completedBookings = (await firebaseDB.collection('bookings')
        .where('status', '==', 'completed')
        .get()).size;
    
    const completionRate = totalBookings > 0 ? (completedBookings / totalBookings * 100) : 0;
    document.getElementById('completionRate').textContent = completionRate.toFixed(0) + '%';
    document.getElementById('completionRateBar').style.width = completionRate + '%';
    
    // Review rate
    const reviewsCount = (await firebaseDB.collection('reviews').get()).size;
    const reviewRate = completedBookings > 0 ? (reviewsCount / completedBookings * 100) : 0;
    document.getElementById('reviewRate').textContent = reviewRate.toFixed(0) + '%';
    document.getElementById('reviewRateBar').style.width = reviewRate + '%';
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
// VERIFICATION PAGE
// ============================================================================

async function initVerificationPage() {
    await loadVerificationRequests();
    initVerificationFilters();
}

async function loadVerificationRequests() {
    const container = document.getElementById('verificationList');
    
    if (!container) return;
    
    try {
        const snapshot = await firebaseDB.collection('teachers')
            .where('verificationStatus', '==', 'pending')
            .orderBy('createdAt', 'desc')
            .get();
        
        if (snapshot.empty) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-check-circle"></i>
                    <p>No pending verification requests</p>
                </div>
            `;
            return;
        }
        
        let verificationsHTML = '';
        
        for (const doc of snapshot.docs) {
            const teacher = doc.data();
            const userDoc = await firebaseDB.collection('users').doc(teacher.userId).get();
            const user = userDoc.data();
            
            const submittedAt = teacher.createdAt.toDate();
            const dateStr = submittedAt.toLocaleDateString('en-GB', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            
            verificationsHTML += `
                <div class="verification-card">
                    <div class="verification-header">
                        <div class="verification-info">
                            <h4>${user.firstName} ${user.lastName}</h4>
                            <div class="verification-meta">
                                <span><i class="fas fa-envelope"></i> ${user.email}</span>
                                <span><i class="fas fa-phone"></i> ${user.phone || 'N/A'}</span>
                                <span><i class="fas fa-calendar"></i> Submitted ${dateStr}</span>
                            </div>
                        </div>
                        <div class="verification-status pending">Pending</div>
                    </div>
                    
                    <div class="verification-documents">
                        ${teacher.verificationDocuments.idCard ? `
                            <div class="document-item">
                                <span class="document-label">ID Card</span>
                                <a href="${teacher.verificationDocuments.idCard}" target="_blank" class="document-link">
                                    <i class="fas fa-file-pdf"></i> View Document
                                </a>
                            </div>
                        ` : ''}
                        
                        ${teacher.verificationDocuments.qualification ? `
                            <div class="document-item">
                                <span class="document-label">Qualification</span>
                                <a href="${teacher.verificationDocuments.qualification}" target="_blank" class="document-link">
                                    <i class="fas fa-file-pdf"></i> View Document
                                </a>
                            </div>
                        ` : ''}
                        
                        ${teacher.verificationDocuments.references ? `
                            <div class="document-item">
                                <span class="document-label">References</span>
                                <a href="${teacher.verificationDocuments.references}" target="_blank" class="document-link">
                                    <i class="fas fa-file-pdf"></i> View Document
                                </a>
                            </div>
                        ` : ''}
                    </div>
                    
                    <div style="padding: 1rem; background: var(--bg-secondary); border-radius: var(--radius-sm); margin: 1rem 0;">
                        <strong>Qualification:</strong> ${teacher.qualification || 'Not specified'}<br>
                        <strong>Experience:</strong> ${teacher.experienceYears || 0} years<br>
                        <strong>Subjects:</strong> ${teacher.subjects ? teacher.subjects.join(', ') : 'None'}<br>
                        <strong>Location:</strong> ${teacher.location.city}${teacher.location.area ? ', ' + teacher.location.area : ''}
                    </div>
                    
                    <div class="verification-actions">
                        <button class="btn btn-primary" onclick="approveVerification('${doc.id}', '${user.firstName} ${user.lastName}')">
                            <i class="fas fa-check"></i> Approve
                        </button>
                        <button class="btn btn-outline" onclick="openRejectModal('${doc.id}', '${user.firstName} ${user.lastName}')">
                            <i class="fas fa-times"></i> Reject
                        </button>
                        <a href="teacher-profile.html?id=${doc.id}" class="btn btn-outline" target="_blank">
                            <i class="fas fa-eye"></i> View Full Profile
                        </a>
                    </div>
                </div>
            `;
        }
        
        container.innerHTML = verificationsHTML;
        
    } catch (error) {
        console.error('Error loading verifications:', error);
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-circle"></i>
                <p>Error loading verification requests</p>
            </div>
        `;
    }
}

async function approveVerification(teacherId, teacherName) {
    if (!confirm(`Approve verification for ${teacherName}? They will be able to receive bookings.`)) {
        return;
    }
    
    try {
        await firebaseDB.collection('teachers').doc(teacherId).update({
            verificationStatus: 'verified',
            verifiedAt: firebase.firestore.FieldValue.serverTimestamp(),
            isAvailable: true
        });
        
        showFlashMessage(`${teacherName} has been verified successfully!`, 'success');
        loadVerificationRequests();
        
    } catch (error) {
        console.error('Error approving verification:', error);
        showFlashMessage('Error approving verification', 'error');
    }
}

function openRejectModal(teacherId, teacherName) {
    const reason = prompt(`Reason for rejecting ${teacherName}'s verification:`);
    
    if (!reason) return;
    
    rejectVerification(teacherId, teacherName, reason);
}

async function rejectVerification(teacherId, teacherName, reason) {
    try {
        await firebaseDB.collection('teachers').doc(teacherId).update({
            verificationStatus: 'rejected',
            rejectionReason: reason,
            rejectedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        showFlashMessage(`${teacherName}'s verification has been rejected`, 'success');
        loadVerificationRequests();
        
    } catch (error) {
        console.error('Error rejecting verification:', error);
        showFlashMessage('Error rejecting verification', 'error');
    }
}

function initVerificationFilters() {
    // Add filter functionality if needed
}

// ============================================================================
// USERS PAGE
// ============================================================================

async function initUsersPage() {
    await loadAllUsers();
    initUserFilters();
}

async function loadAllUsers() {
    const container = document.getElementById('usersList');
    
    if (!container) return;
    
    try {
        const snapshot = await firebaseDB.collection('users')
            .orderBy('createdAt', 'desc')
            .get();
        
        if (snapshot.empty) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-users"></i>
                    <p>No users found</p>
                </div>
            `;
            return;
        }
        
        let usersHTML = '';
        
        for (const doc of snapshot.docs) {
            const user = { id: doc.id, ...doc.data() };
            
            // Get additional info based on user type
            let additionalInfo = '';
            let stats = '';
            
            if (user.userType === 'teacher') {
                const teacherDoc = await firebaseDB.collection('teachers').doc(user.uid).get();
                if (teacherDoc.exists) {
                    const teacher = teacherDoc.data();
                    const statusBadge = teacher.verificationStatus === 'verified' ? 
                        '<span class="user-badge verified">Verified</span>' : 
                        `<span class="user-badge" style="background: #FFF3E0; color: #E65100;">${teacher.verificationStatus}</span>`;
                    
                    additionalInfo = `
                        <div class="user-badges">
                            <span class="user-badge teacher">Teacher</span>
                            ${statusBadge}
                        </div>
                    `;
                    
                    stats = `
                        <div class="user-stats">
                            <div class="user-stat">
                                <span class="user-stat-value">${teacher.totalSessions || 0}</span>
                                <span class="user-stat-label">Sessions</span>
                            </div>
                            <div class="user-stat">
                                <span class="user-stat-value">${(teacher.rating || 0).toFixed(1)}</span>
                                <span class="user-stat-label">Rating</span>
                            </div>
                            <div class="user-stat">
                                <span class="user-stat-value">${formatCurrency(teacher.hourlyRate || 0)}</span>
                                <span class="user-stat-label">Rate</span>
                            </div>
                        </div>
                    `;
                }
            } else if (user.userType === 'parent') {
                const childrenSnapshot = await firebaseDB.collection('children')
                    .where('parentId', '==', user.uid)
                    .get();
                
                const bookingsSnapshot = await firebaseDB.collection('bookings')
                    .where('parentId', '==', user.uid)
                    .get();
                
                additionalInfo = `
                    <div class="user-badges">
                        <span class="user-badge parent">Parent</span>
                    </div>
                `;
                
                stats = `
                    <div class="user-stats">
                        <div class="user-stat">
                            <span class="user-stat-value">${childrenSnapshot.size}</span>
                            <span class="user-stat-label">Children</span>
                        </div>
                        <div class="user-stat">
                            <span class="user-stat-value">${bookingsSnapshot.size}</span>
                            <span class="user-stat-label">Bookings</span>
                        </div>
                    </div>
                `;
            } else if (user.userType === 'admin') {
                additionalInfo = `
                    <div class="user-badges">
                        <span class="user-badge admin">Admin</span>
                    </div>
                `;
            }
            
            const createdAt = user.createdAt.toDate();
            const dateStr = createdAt.toLocaleDateString('en-GB', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
            
            usersHTML += `
                <div class="user-card">
                    <div class="user-avatar">
                        <div class="user-avatar-placeholder">
                            ${(user.firstName[0] + user.lastName[0]).toUpperCase()}
                        </div>
                    </div>
                    <div class="user-info">
                        <h4>${user.firstName} ${user.lastName}</h4>
                        <p>${user.email} • Joined ${dateStr}</p>
                        ${additionalInfo}
                        ${stats}
                    </div>
                    <div class="user-actions">
                        ${user.userType !== 'admin' ? `
                            <button class="btn btn-outline btn-small" onclick="toggleUserStatus('${doc.id}', ${user.isActive})">
                                <i class="fas ${user.isActive ? 'fa-ban' : 'fa-check'}"></i>
                                ${user.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                        ` : ''}
                    </div>
                </div>
            `;
        }
        
        container.innerHTML = usersHTML;
        
    } catch (error) {
        console.error('Error loading users:', error);
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-circle"></i>
                <p>Error loading users</p>
            </div>
        `;
    }
}

async function toggleUserStatus(userId, currentStatus) {
    const action = currentStatus ? 'deactivate' : 'activate';
    
    if (!confirm(`Are you sure you want to ${action} this user?`)) {
        return;
    }
    
    try {
        await firebaseDB.collection('users').doc(userId).update({
            isActive: !currentStatus
        });
        
        showFlashMessage(`User ${action}d successfully`, 'success');
        loadAllUsers();
        
    } catch (error) {
        console.error('Error toggling user status:', error);
        showFlashMessage(`Error ${action}ing user`, 'error');
    }
}

function initUserFilters() {
    // Add filter functionality if needed
}

// ============================================================================
// ADMIN BOOKINGS PAGE
// ============================================================================

async function initAdminBookingsPage() {
    await loadAllBookings();
    initBookingFilters();
}

async function loadAllBookings() {
    const container = document.getElementById('bookingsList');
    
    if (!container) return;
    
    try {
        const snapshot = await firebaseDB.collection('bookings')
            .orderBy('createdAt', 'desc')
            .limit(100)
            .get();
        
        if (snapshot.empty) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-calendar-times"></i>
                    <p>No bookings found</p>
                </div>
            `;
            return;
        }
        
        // Similar to parent bookings but with more details
        // Implementation would be similar to parent bookings page
        
    } catch (error) {
        console.error('Error loading bookings:', error);
    }
}

function initBookingFilters() {
    // Add filter functionality
}

// ============================================================================
// REPORTS PAGE
// ============================================================================

async function initReportsPage() {
    await loadReports();
}

async function loadReports() {
    // Load various reports and analytics
    // This would include charts, metrics, etc.
    console.log('Reports page - to be fully implemented');
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

// Additional admin-specific utility functions can be added here
