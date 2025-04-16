// Firebase Configuration
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT",
    storageBucket: "YOUR_BUCKET.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

// DOM Elements
const authSection = document.getElementById('auth-section');
const chatSection = document.getElementById('chat-section');
const userInfo = document.getElementById('user-info');
const loginBtn = document.getElementById('login-btn');
const signupBtn = document.getElementById('signup-btn');
const logoutBtn = document.getElementById('logout-btn');
const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const subjectSelect = document.getElementById('subject-select');
const uploadBtn = document.getElementById('upload-btn');
const fileInput = document.getElementById('file-input');

// Track current user
let currentUser = null;

// Auth State Listener
auth.onAuthStateChanged(user => {
    currentUser = user;
    if (user) {
        // User is logged in
        authSection.classList.add('hidden');
        chatSection.classList.remove('hidden');
        userInfo.classList.remove('hidden');
        document.getElementById('user-email').textContent = user.email;
    } else {
        // User is logged out
        authSection.classList.remove('hidden');
        chatSection.classList.add('hidden');
        userInfo.classList.add('hidden');
    }
});

// Login Function
loginBtn.addEventListener('click', () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    auth.signInWithEmailAndPassword(email, password)
        .catch(error => {
            alert("Login failed: " + error.message);
        });
});

// Signup Function
signupBtn.addEventListener('click', () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    auth.createUserWithEmailAndPassword(email, password)
        .catch(error => {
            alert("Signup failed: " + error.message);
        });
});

// Logout Function
logoutBtn.addEventListener('click', () => {
    auth.signOut();
});

// Send Message Function
sendBtn.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

function sendMessage() {
    const message = userInput.value.trim();
    const subject = subjectSelect.value;
    
    if (!message) return;
    
    // Add user message to chat
    addMessage('user', message);
    userInput.value = '';
    
    // Simulate AI response (replace with actual API call)
    setTimeout(() => {
        const aiResponse = `This is a simulated response for "${message}" (${subject})`;
        addMessage('ai', aiResponse);
        
        // Save to Firestore
        if (currentUser) {
            db.collection('chats').add({
                userId: currentUser.uid,
                message,
                response: aiResponse,
                subject,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
    }, 1000);
}

// Upload Image Function
uploadBtn.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        // In a real app, upload to Firebase Storage and process with Gemini
        addMessage('user', '[Image Uploaded]');
        setTimeout(() => {
            addMessage('ai', 'I see you uploaded an image. In a real app, Gemini would analyze this.');
        }, 1500);
    }
});

// Helper: Add message to chat UI
function addMessage(sender, text) {
    const messageDiv = document.createElement('div');
    messageDiv.className = sender === 'user' 
        ? 'bg-blue-100 p-3 rounded-lg self-end max-w-xs' 
        : 'bg-gray-200 p-3 rounded-lg self-start max-w-xs';
    messageDiv.textContent = text;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Add at the top of app.js
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini
const genAI = new GoogleGenerativeAI("AIzaSyAMJ37FR8KUMaYGCZMHVk-_BBz8awD0vPA");
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

// Modified sendMessage function
async function sendMessage() {
    const message = userInput.value.trim();
    const subject = subjectSelect.value;
    
    if (!message) return;
    
    // Add user message
    addMessage('user', message);
    userInput.value = '';
    
    try {
        // Show loading indicator
        const loadingDiv = addMessage('ai', 'Thinking...');
        
        // Get Gemini response
        const prompt = `Act as an expert ${subject} tutor. Explain this to a student: ${message}`;
        const result = await model.generateContent(prompt);
        const response = await result.response.text();
        
        // Update loading message
        loadingDiv.textContent = response;
        
        // Save to Firestore
        if (currentUser) {
            await db.collection('chats').add({
                userId: currentUser.uid,
                message,
                response,
                subject,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
    } catch (error) {
        addMessage('ai', 'Error: Could not get response. Please try again.');
        console.error("Gemini error:", error);
    }
}

// Update addMessage function to return element
function addMessage(sender, text) {
    const messageDiv = document.createElement('div');
    messageDiv.className = sender === 'user' 
        ? 'bg-blue-100 p-3 rounded-lg self-end max-w-xs' 
        : 'bg-gray-200 p-3 rounded-lg self-start max-w-xs';
    messageDiv.textContent = text;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return messageDiv; // Return reference to update later
}

// Add at top of file
let lastRequestTime = 0;

// Add inside sendMessage
const now = Date.now();
if (now - lastRequestTime < 2000) { // 2-second delay
    alert("Please wait a moment between questions!");
    return;
}
lastRequestTime = now;