/**
 * Intellect Haven - Chat Widget
 * Floating chatbot for customer service
 */

let chatOpen = false;
let greetingSent = false;

// Chatbot responses
const chatbotResponses = {
    greetings: [
        "Hello! 👋 Welcome to Intellect Haven. How can I help you today?",
        "Hi there! I'm your Intellect Haven assistant. What can I do for you?",
        "Welcome! I'm here to help you find the perfect teacher for your child. How can I assist you?"
    ],
    
    howItWorks: {
        response: "Here's how Intellect Haven works:\n\n1️⃣ **Create an account** as a parent or teacher\n2️⃣ **Browse verified teachers** by subject, curriculum, and location\n3️⃣ **Book a session** with your preferred teacher\n4️⃣ **Attend the session** (online or in-person)\n5️⃣ **Leave a review** to help other parents\n\nWould you like to know more about any specific step?",
        quickReplies: ["Find a teacher", "Become a teacher", "Pricing", "Contact us"]
    },
    
    findTeacher: {
        response: "Great! Finding a teacher is easy:\n\n1. Click **'Find a Teacher'** in the navigation\n2. Use filters to search by:\n   - Subject (Math, English, Science, etc.)\n   - Curriculum (GES, British, Cambridge, IB)\n   - School Level (Nursery, Primary, JHS, SHS)\n   - City and hourly rate\n3. Browse teacher profiles with ratings and reviews\n4. Click **'View Profile & Book'** to schedule a session\n\nAll our teachers are verified and qualified!",
        quickReplies: ["How are teachers verified?", "What subjects are available?", "Book a session"]
    },
    
    becomeTeacher: {
        response: "Wonderful! To become a teacher on Intellect Haven:\n\n1. Click **'Sign Up'** and select **'Teacher'**\n2. Complete your profile with:\n   - Your qualifications and experience\n   - Subjects you teach\n   - Hourly rate\n   - Availability schedule\n3. Upload verification documents:\n   - Government ID\n   - Qualification certificates\n   - Reference letters (optional)\n4. Wait for admin approval (usually 24-48 hours)\n5. Start receiving booking requests!\n\nWould you like to sign up now?",
        quickReplies: ["Sign up now", "Verification process", "Teacher requirements"]
    },
    
    verification: {
        response: "Our teacher verification process ensures quality and safety:\n\n✅ **Document Verification:**\n- Government-issued ID\n- Educational qualifications\n- Professional certificates\n\n✅ **Background Check:**\n- Criminal record check\n- Reference verification\n\n✅ **Profile Review:**\n- Admin reviews all applications\n- Only qualified teachers are approved\n\n✅ **Ongoing Monitoring:**\n- Parent reviews and ratings\n- Session quality checks\n\nThis ensures your child learns from trusted, qualified teachers!",
        quickReplies: ["Find a teacher", "Become a teacher", "Safety measures"]
    },
    
    pricing: {
        response: "Our pricing is simple and transparent:\n\n💰 **For Parents:**\n- Free to browse and search teachers\n- Pay only for booked sessions\n- Hourly rates set by teachers (GHS 50-150/hour)\n- No hidden fees\n\n💰 **For Teachers:**\n- Free to create a profile\n- 15% service fee on completed sessions\n- You set your own hourly rate\n- Get paid within 48 hours after session\n\n💳 **Payment Methods:**\n- Mobile Money (MTN, Vodafone, AirtelTigo)\n- Credit/Debit cards (coming soon)\n\nWould you like to know more about payments?",
        quickReplies: ["Find a teacher", "Become a teacher", "Payment methods"]
    },
    
    subjects: {
        response: "We offer a wide range of subjects:\n\n📚 **Academic Subjects:**\n- Mathematics\n- English Language\n- Science (Physics, Chemistry, Biology)\n- ICT / Computing\n- Social Studies\n\n🎨 **Extracurricular:**\n- Music (Piano, Guitar, Vocal)\n- Art & Design\n- Sports & Fitness\n- Coding & Robotics\n\n🌍 **Languages:**\n- French\n- Spanish\n- Local languages (Twi, Ga, Ewe)\n\nWhich subject are you interested in?",
        quickReplies: ["Find Math teacher", "Find English teacher", "Find Science teacher"]
    },
    
    safety: {
        response: "Child safety is our top priority! Here's how we protect your child:\n\n🛡️ **Teacher Verification:**\n- All teachers undergo background checks\n- ID and qualification verification\n- Reference checks\n\n🛡️ **Session Monitoring:**\n- Parents can observe sessions\n- Session notes and reports\n- Review and rating system\n\n🛡️ **Secure Platform:**\n- Encrypted communications\n- Secure payment processing\n- Data protection compliance\n\n🛡️ **Support:**\n- 24/7 customer support\n- Dispute resolution\n- Emergency contact\n\nYour child's safety is guaranteed!",
        quickReplies: ["Find a teacher", "Contact support", "Learn more"]
    },
    
    contact: {
        response: "You can reach us through multiple channels:\n\n📧 **Email:**\n- support@intellecthaven.com\n- info@intellecthaven.com\n\n📞 **Phone:**\n- +233 (0) 30 277 8899\n- Mon-Fri: 8:00 AM - 6:00 PM\n- Saturday: 9:00 AM - 2:00 PM\n\n📍 **Office:**\n- 15 Independence Avenue\n- Ridge, Accra, Ghana\n\n💬 **Live Chat:**\n- You're using it right now! 😊\n\nWe typically respond within 24 hours. How can I help you?",
        quickReplies: ["Find a teacher", "Become a teacher", "FAQ"]
    },
    
    booking: {
        response: "Booking a session is easy:\n\n1️⃣ **Find a teacher** you like\n2️⃣ Click **'View Profile & Book'**\n3️⃣ **Select your child** (add child profile if needed)\n4️⃣ **Choose subject** and **date/time**\n5️⃣ **Select duration** (1-3 hours)\n6️⃣ **Add notes** (optional)\n7️⃣ **Confirm booking**\n\nThe teacher will receive your request and confirm within 24 hours. You'll get an email notification once confirmed!\n\nWould you like to book a session now?",
        quickReplies: ["Find a teacher", "View my bookings", "Cancel booking"]
    },
    
    default: {
        response: "I'm not sure I understood that. Let me help you with some common questions:\n\n• How does Intellect Haven work?\n• How do I find a teacher?\n• How do I become a teacher?\n• What are the prices?\n• Is it safe for my child?\n• How do I contact support?\n\nPlease ask me any of these questions, or visit our FAQ page for more information!",
        quickReplies: ["How it works", "Find a teacher", "Pricing", "Contact us"]
    }
};

// Toggle chat window
function toggleChat() {
    const chatWindow = document.getElementById('chatWindow');
    const chatButton = document.getElementById('chatButton');
    const chatBadge = document.getElementById('chatBadge');
    
    chatOpen = !chatOpen;
    
    if (chatOpen) {
        chatWindow.classList.add('active');
        chatButton.classList.add('active');
        chatBadge.classList.add('hidden');
        
        // Send greeting if not sent yet
        if (!greetingSent) {
            setTimeout(() => {
                sendGreeting();
                greetingSent = true;
            }, 500);
        }
        
        // Focus on input
        setTimeout(() => {
            document.getElementById('chatInput').focus();
        }, 300);
    } else {
        chatWindow.classList.remove('active');
        chatButton.classList.remove('active');
    }
}

// Send greeting message
function sendGreeting() {
    const greeting = chatbotResponses.greetings[Math.floor(Math.random() * chatbotResponses.greetings.length)];
    addMessage(greeting, 'bot', true);
}

// Add message to chat
function addMessage(text, sender, withQuickReplies = false, quickReplies = []) {
    const messagesContainer = document.getElementById('chatMessages');
    const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${sender}`;
    
    const avatarIcon = sender === 'bot' ? 'fa-robot' : 'fa-user';
    
    messageDiv.innerHTML = `
        <div class="chat-message-avatar">
            <i class="fas ${avatarIcon}"></i>
        </div>
        <div>
            <div class="chat-message-content">${text.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</div>
            <div class="chat-message-time">${time}</div>
            ${withQuickReplies && quickReplies.length > 0 ? `
                <div class="chat-quick-replies">
                    ${quickReplies.map(reply => `<button class="chat-quick-reply" onclick="handleQuickReply('${reply}')">${reply}</button>`).join('')}
                </div>
            ` : ''}
        </div>
    `;
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Show typing indicator
function showTypingIndicator() {
    const messagesContainer = document.getElementById('chatMessages');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'chat-message bot';
    typingDiv.id = 'typingIndicator';
    typingDiv.innerHTML = `
        <div class="chat-message-avatar">
            <i class="fas fa-robot"></i>
        </div>
        <div class="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
        </div>
    `;
    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Remove typing indicator
function removeTypingIndicator() {
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

// Handle user message
function sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Add user message
    addMessage(message, 'user');
    input.value = '';
    
    // Show typing indicator
    showTypingIndicator();
    
    // Process message and respond
    setTimeout(() => {
        removeTypingIndicator();
        processMessage(message);
    }, 1000 + Math.random() * 1000);
}

// Process message and generate response
function processMessage(message) {
    const lowerMessage = message.toLowerCase();
    
    let response = chatbotResponses.default;
    
    // Match keywords to responses
    if (lowerMessage.includes('how') && (lowerMessage.includes('work') || lowerMessage.includes('function'))) {
        response = chatbotResponses.howItWorks;
    } else if (lowerMessage.includes('find') && lowerMessage.includes('teacher')) {
        response = chatbotResponses.findTeacher;
    } else if (lowerMessage.includes('become') && lowerMessage.includes('teacher')) {
        response = chatbotResponses.becomeTeacher;
    } else if (lowerMessage.includes('verif')) {
        response = chatbotResponses.verification;
    } else if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('fee') || lowerMessage.includes('pay')) {
        response = chatbotResponses.pricing;
    } else if (lowerMessage.includes('subject') || lowerMessage.includes('course')) {
        response = chatbotResponses.subjects;
    } else if (lowerMessage.includes('safe') || lowerMessage.includes('security') || lowerMessage.includes('protect')) {
        response = chatbotResponses.safety;
    } else if (lowerMessage.includes('contact') || lowerMessage.includes('email') || lowerMessage.includes('phone') || lowerMessage.includes('reach')) {
        response = chatbotResponses.contact;
    } else if (lowerMessage.includes('book') || lowerMessage.includes('schedule') || lowerMessage.includes('session')) {
        response = chatbotResponses.booking;
    } else if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
        const greeting = chatbotResponses.greetings[Math.floor(Math.random() * chatbotResponses.greetings.length)];
        addMessage(greeting, 'bot', true, ["How it works", "Find a teacher", "Pricing"]);
        return;
    } else if (lowerMessage.includes('thank')) {
        addMessage("You're welcome! 😊 Is there anything else I can help you with?", 'bot', true, ["Find a teacher", "Contact us", "That's all"]);
        return;
    } else if (lowerMessage.includes('bye') || lowerMessage.includes('goodbye') || lowerMessage.includes("that's all")) {
        addMessage("Thank you for chatting with me! Have a great day! 👋 Feel free to come back if you have more questions.", 'bot');
        return;
    }
    
    // Add bot response
    addMessage(response.response, 'bot', true, response.quickReplies || []);
}

// Handle quick reply
function handleQuickReply(reply) {
    addMessage(reply, 'user');
    
    // Show typing indicator
    showTypingIndicator();
    
    // Process quick reply
    setTimeout(() => {
        removeTypingIndicator();
        processMessage(reply);
    }, 800 + Math.random() * 800);
}

// Handle enter key press
function handleChatKeyPress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

// Auto-show chat after delay
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        const chatBadge = document.getElementById('chatBadge');
        if (chatBadge && !chatOpen) {
            chatBadge.style.animation = 'pulse 2s infinite';
        }
    }, 3000);
});
