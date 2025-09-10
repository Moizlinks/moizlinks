// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB6uZuSSCPwfVkWaJsolTEESAlPMVbaI1I",
  authDomain: "moiz-links.firebaseapp.com",
  projectId: "moiz-links",
  storageBucket: "moiz-links.appspot.com",
  messagingSenderId: "197716611273",
  appId: "1:197716611273:web:9a63a3299bb6d3c3b03d18",
  measurementId: "G-PTD0PDBS0L"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// DOM Elements
const loadingState = document.getElementById('loading-state');
const authContainer = document.getElementById('auth-container');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const showSignup = document.getElementById('show-signup');
const showLogin = document.getElementById('show-login');
const googleSignin = document.getElementById('google-signin');

// Toggle between login and signup forms
showSignup.addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.classList.add('hidden');
    signupForm.classList.remove('hidden');
});

showLogin.addEventListener('click', (e) => {
    e.preventDefault();
    signupForm.classList.add('hidden');
    loginForm.classList.remove('hidden');
});

// Signup
signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = signupForm['signup-email'].value;
    const password = signupForm['signup-password'].value;
    const confirmPassword = signupForm['signup-confirm-password'].value;

    if (password !== confirmPassword) {
        alert("Passwords do not match.");
        return;
    }

    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Signed in 
            const user = userCredential.user;
            console.log('Signed up:', user);
            window.location.href = 'dashboard.html';
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            alert(errorMessage);
        });
});

// Login
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = loginForm['login-email'].value;
    const password = loginForm['login-password'].value;

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Signed in 
            const user = userCredential.user;
            console.log('Logged in:', user);
            window.location.href = 'dashboard.html';
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            alert(errorMessage);
        });
});

// Google Signin
googleSignin.addEventListener('click', () => {
    signInWithPopup(auth, provider)
        .then((result) => {
            // This gives you a Google Access Token. You can use it to access the Google API.
            const credential = GoogleAuthProvider.credentialFromResult(result);
            const token = credential.accessToken;
            // The signed-in user info.
            const user = result.user;
            console.log('Google sign in:', user);
            window.location.href = 'dashboard.html';
        }).catch((error) => {
            // Handle Errors here.
            const errorCode = error.code;
            const errorMessage = error.message;
            // The email of the user's account used.
            const email = error.email;
            // The AuthCredential type that was used.
            const credential = GoogleAuthProvider.credentialFromError(error);
            alert(errorMessage);
        });
});

// Auth state observer
onAuthStateChanged(auth, (user) => {
  // This function runs whenever the user's sign-in state changes.
  
  // Check if we are on the login page
  const isLoginPage = window.location.pathname === '/' || window.location.pathname.endsWith('/index.html');

  if (user) {
    // User is signed in.
    console.log('User is signed in:', user);
    // If they are on the login page, redirect them to the dashboard.
    if (isLoginPage) {
      window.location.href = 'dashboard.html';
    }
  } else {
    // User is signed out.
    console.log('User is signed out');
    // If they are on the login page, show the login form.
    if (isLoginPage) {
      loadingState.classList.add('hidden');
      authContainer.classList.remove('hidden');
    } else {
      // If they are on any other page and not logged in, redirect to the login page.
      window.location.href = 'index.html';
    }
  }
});
