/**
 * Intellect Haven - Email Notification System
 * Handles all email notifications for the platform
 */

// Email notification types
const EMAIL_TYPES = {
    WELCOME: 'welcome',
    PASSWORD_RESET: 'password_reset',
    BOOKING_REQUEST: 'booking_request',
    BOOKING_CONFIRMED: 'booking_confirmed',
    BOOKING_CANCELLED: 'booking_cancelled',
    SESSION_REMINDER: 'session_reminder',
    SESSION_COMPLETED: 'session_completed',
    VERIFICATION_SUBMITTED: 'verification_submitted',
    VERIFICATION_APPROVED: 'verification_approved',
    VERIFICATION_REJECTED: 'verification_rejected',
    NEW_REVIEW: 'new_review',
    PAYMENT_RECEIVED: 'payment_received'
};

/**
 * Send email notification
 * @param {string} to - Recipient email
 * @param {string} type - Email type
 * @param {object} data - Email data
 */
async function sendEmailNotification(to, type, data) {
    try {
        // In production, this would integrate with an email service like SendGrid, Mailgun, etc.
        // For now, we'll log the email and store it in Firestore for tracking
        
        const emailData = {
            to: to,
            type: type,
            subject: getEmailSubject(type, data),
            body: getEmailBody(type, data),
            data: data,
            sentAt: firebase.firestore.FieldValue.serverTimestamp(),
            status: 'sent'
        };
        
        // Store in Firestore for tracking
        await firebaseDB.collection('emailNotifications').add(emailData);
        
        console.log('Email notification sent:', emailData);
        
        // TODO: Integrate with actual email service
        // Example with SendGrid:
        // await sendGridEmail(to, emailData.subject, emailData.body);
        
        return { success: true, message: 'Email sent successfully' };
        
    } catch (error) {
        console.error('Error sending email:', error);
        
        // Log failed email
        await firebaseDB.collection('emailNotifications').add({
            to: to,
            type: type,
            data: data,
            sentAt: firebase.firestore.FieldValue.serverTimestamp(),
            status: 'failed',
            error: error.message
        });
        
        return { success: false, error: error.message };
    }
}

/**
 * Get email subject based on type
 */
function getEmailSubject(type, data) {
    const subjects = {
        [EMAIL_TYPES.WELCOME]: 'Welcome to Intellect Haven!',
        [EMAIL_TYPES.PASSWORD_RESET]: 'Reset Your Password - Intellect Haven',
        [EMAIL_TYPES.BOOKING_REQUEST]: `New Booking Request from ${data.parentName}`,
        [EMAIL_TYPES.BOOKING_CONFIRMED]: `Booking Confirmed - ${data.subject} Session`,
        [EMAIL_TYPES.BOOKING_CANCELLED]: `Booking Cancelled - ${data.subject} Session`,
        [EMAIL_TYPES.SESSION_REMINDER]: `Reminder: ${data.subject} Session Tomorrow`,
        [EMAIL_TYPES.SESSION_COMPLETED]: `Session Completed - ${data.subject}`,
        [EMAIL_TYPES.VERIFICATION_SUBMITTED]: 'Verification Documents Submitted',
        [EMAIL_TYPES.VERIFICATION_APPROVED]: 'Congratulations! You\'re Verified',
        [EMAIL_TYPES.VERIFICATION_REJECTED]: 'Verification Update - Action Required',
        [EMAIL_TYPES.NEW_REVIEW]: `New Review from ${data.parentName}`,
        [EMAIL_TYPES.PAYMENT_RECEIVED]: `Payment Received - ${formatCurrency(data.amount)}`
    };
    
    return subjects[type] || 'Intellect Haven Notification';
}

/**
 * Get email body based on type
 */
function getEmailBody(type, data) {
    const bodies = {
        [EMAIL_TYPES.WELCOME]: `
            <h2>Welcome to Intellect Haven, ${data.firstName}!</h2>
            <p>Thank you for joining Africa's trusted teacher-parent learning platform.</p>
            <p>Here's what you can do next:</p>
            <ul>
                <li>Complete your profile</li>
                <li>${data.userType === 'parent' ? 'Add your children and find teachers' : 'Upload verification documents'}</li>
                <li>Explore our platform features</li>
            </ul>
            <p>If you have any questions, don't hesitate to contact our support team.</p>
            <p>Best regards,<br>The Intellect Haven Team</p>
        `,
        
        [EMAIL_TYPES.BOOKING_REQUEST]: `
            <h2>New Booking Request</h2>
            <p>Hello ${data.teacherName},</p>
            <p>You have received a new booking request:</p>
            <ul>
                <li><strong>Student:</strong> ${data.childName}</li>
                <li><strong>Parent:</strong> ${data.parentName}</li>
                <li><strong>Subject:</strong> ${data.subject}</li>
                <li><strong>Date:</strong> ${data.date}</li>
                <li><strong>Time:</strong> ${data.time}</li>
                <li><strong>Duration:</strong> ${data.duration} hours</li>
                <li><strong>Amount:</strong> ${formatCurrency(data.amount)}</li>
            </ul>
            <p>Please log in to your dashboard to review and respond to this request.</p>
            <p>Best regards,<br>The Intellect Haven Team</p>
        `,
        
        [EMAIL_TYPES.BOOKING_CONFIRMED]: `
            <h2>Booking Confirmed!</h2>
            <p>Hello ${data.parentName},</p>
            <p>Great news! Your booking has been confirmed:</p>
            <ul>
                <li><strong>Teacher:</strong> ${data.teacherName}</li>
                <li><strong>Subject:</strong> ${data.subject}</li>
                <li><strong>Student:</strong> ${data.childName}</li>
                <li><strong>Date:</strong> ${data.date}</li>
                <li><strong>Time:</strong> ${data.time}</li>
                <li><strong>Duration:</strong> ${data.duration} hours</li>
            </ul>
            <p>We'll send you a reminder 24 hours before the session.</p>
            <p>Best regards,<br>The Intellect Haven Team</p>
        `,
        
        [EMAIL_TYPES.VERIFICATION_APPROVED]: `
            <h2>Congratulations! You're Verified</h2>
            <p>Hello ${data.teacherName},</p>
            <p>We're excited to inform you that your verification has been approved!</p>
            <p>You can now:</p>
            <ul>
                <li>Receive booking requests from parents</li>
                <li>Display the "Verified" badge on your profile</li>
                <li>Start earning through tutoring sessions</li>
            </ul>
            <p>Make sure your availability is up to date so parents can book sessions with you.</p>
            <p>Best regards,<br>The Intellect Haven Team</p>
        `,
        
        [EMAIL_TYPES.SESSION_REMINDER]: `
            <h2>Session Reminder</h2>
            <p>Hello ${data.recipientName},</p>
            <p>This is a reminder about your upcoming session:</p>
            <ul>
                <li><strong>Subject:</strong> ${data.subject}</li>
                <li><strong>Date:</strong> ${data.date}</li>
                <li><strong>Time:</strong> ${data.time}</li>
                <li><strong>Duration:</strong> ${data.duration} hours</li>
            </ul>
            <p>Please make sure you're prepared and ready for the session.</p>
            <p>Best regards,<br>The Intellect Haven Team</p>
        `,
        
        [EMAIL_TYPES.NEW_REVIEW]: `
            <h2>New Review Received</h2>
            <p>Hello ${data.teacherName},</p>
            <p>${data.parentName} has left you a review:</p>
            <p><strong>Rating:</strong> ${'★'.repeat(data.rating)}${'☆'.repeat(5 - data.rating)}</p>
            <p><strong>Comment:</strong> "${data.comment}"</p>
            <p>Thank you for providing quality tutoring services!</p>
            <p>Best regards,<br>The Intellect Haven Team</p>
        `
    };
    
    return bodies[type] || '<p>You have a new notification from Intellect Haven.</p>';
}

/**
 * Send booking request notification to teacher
 */
async function notifyTeacherOfBookingRequest(booking) {
    const teacherDoc = await firebaseDB.collection('teachers').doc(booking.teacherId).get();
    const teacherUserDoc = await firebaseDB.collection('users').doc(teacherDoc.data().userId).get();
    const parentDoc = await firebaseDB.collection('users').doc(booking.parentId).get();
    const childDoc = await firebaseDB.collection('children').doc(booking.childId).get();
    
    const teacher = teacherUserDoc.data();
    const parent = parentDoc.data();
    const child = childDoc.data();
    
    await sendEmailNotification(teacher.email, EMAIL_TYPES.BOOKING_REQUEST, {
        teacherName: teacher.firstName,
        parentName: `${parent.firstName} ${parent.lastName}`,
        childName: child.firstName,
        subject: booking.subject,
        date: booking.sessionDate.toDate().toLocaleDateString('en-GB', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }),
        time: formatTime(booking.sessionTime),
        duration: booking.duration,
        amount: booking.totalAmount
    });
}

/**
 * Send booking confirmation notification to parent
 */
async function notifyParentOfBookingConfirmation(booking) {
    const teacherDoc = await firebaseDB.collection('teachers').doc(booking.teacherId).get();
    const teacherUserDoc = await firebaseDB.collection('users').doc(teacherDoc.data().userId).get();
    const parentDoc = await firebaseDB.collection('users').doc(booking.parentId).get();
    const childDoc = await firebaseDB.collection('children').doc(booking.childId).get();
    
    const teacher = teacherUserDoc.data();
    const parent = parentDoc.data();
    const child = childDoc.data();
    
    await sendEmailNotification(parent.email, EMAIL_TYPES.BOOKING_CONFIRMED, {
        parentName: parent.firstName,
        teacherName: `${teacher.firstName} ${teacher.lastName}`,
        childName: child.firstName,
        subject: booking.subject,
        date: booking.sessionDate.toDate().toLocaleDateString('en-GB', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }),
        time: formatTime(booking.sessionTime),
        duration: booking.duration
    });
}

/**
 * Send verification approval notification to teacher
 */
async function notifyTeacherOfVerificationApproval(teacherId) {
    const teacherDoc = await firebaseDB.collection('teachers').doc(teacherId).get();
    const teacherUserDoc = await firebaseDB.collection('users').doc(teacherDoc.data().userId).get();
    
    const teacher = teacherUserDoc.data();
    
    await sendEmailNotification(teacher.email, EMAIL_TYPES.VERIFICATION_APPROVED, {
        teacherName: teacher.firstName
    });
}

/**
 * Send session reminder (24 hours before)
 */
async function sendSessionReminders() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);
    
    const snapshot = await firebaseDB.collection('bookings')
        .where('status', '==', 'confirmed')
        .where('sessionDate', '>=', tomorrow)
        .where('sessionDate', '<', dayAfterTomorrow)
        .get();
    
    for (const doc of snapshot.docs) {
        const booking = doc.data();
        
        // Send reminder to teacher
        const teacherDoc = await firebaseDB.collection('teachers').doc(booking.teacherId).get();
        const teacherUserDoc = await firebaseDB.collection('users').doc(teacherDoc.data().userId).get();
        const teacher = teacherUserDoc.data();
        
        await sendEmailNotification(teacher.email, EMAIL_TYPES.SESSION_REMINDER, {
            recipientName: teacher.firstName,
            subject: booking.subject,
            date: booking.sessionDate.toDate().toLocaleDateString('en-GB', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }),
            time: formatTime(booking.sessionTime),
            duration: booking.duration
        });
        
        // Send reminder to parent
        const parentDoc = await firebaseDB.collection('users').doc(booking.parentId).get();
        const parent = parentDoc.data();
        
        await sendEmailNotification(parent.email, EMAIL_TYPES.SESSION_REMINDER, {
            recipientName: parent.firstName,
            subject: booking.subject,
            date: booking.sessionDate.toDate().toLocaleDateString('en-GB', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }),
            time: formatTime(booking.sessionTime),
            duration: booking.duration
        });
    }
}

// Export for use in other files
window.EmailNotifications = {
    sendEmailNotification,
    notifyTeacherOfBookingRequest,
    notifyParentOfBookingConfirmation,
    notifyTeacherOfVerificationApproval,
    sendSessionReminders,
    EMAIL_TYPES
};
