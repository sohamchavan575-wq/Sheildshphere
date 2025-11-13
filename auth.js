import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  onAuthStateChanged as fbOnAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

import { firebaseConfig } from './firebase-config.js';

let app, auth, db;
let confirmationResult = null;
let recaptchaVerifier = null;

export function initApp() {
  if (app) return { app, auth, db };
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);

  try {
    recaptchaVerifier = new RecaptchaVerifier('recaptcha-container', { 'size': 'invisible' }, auth);
  } catch (e) {
    // ignore if no recaptcha container on page
  }

  return { app, auth, db };
}

export function onAuthStateChanged(cb) {
  if (!auth) initApp();
  return fbOnAuthStateChanged(auth, cb);
}

function normalizePhone(phone) {
  return phone;
}

export async function loginWithEmailOrPhone(identifier, password) {
  if (!auth) initApp();
  if (identifier.includes('@')) {
    return signInWithEmailAndPassword(auth, identifier, password);
  } else {
    const phone = normalizePhone(identifier);
    if (!recaptchaVerifier) initApp();
    confirmationResult = await signInWithPhoneNumber(auth, phone, recaptchaVerifier);
    throw new Error('otp_sent');
  }
}

export async function registerWithEmailPassOrPhone({ email, phone, password }) {
  if (!auth) initApp();
  if (email && password) {
    const userCred = await createUserWithEmailAndPassword(auth, email, password);
    return userCred;
  } else if (phone && !email) {
    const phoneNorm = normalizePhone(phone);
    if (!recaptchaVerifier) initApp();
    confirmationResult = await signInWithPhoneNumber(auth, phoneNorm, recaptchaVerifier);
    return 'otp_sent';
  } else if (email && phone) {
    const userCred = await createUserWithEmailAndPassword(auth, email, password);
    return userCred;
  } else {
    throw new Error('Provide email+password or phone');
  }
}

export async function verifyOtp(code) {
  if (!confirmationResult) throw new Error('No OTP flow in progress.');
  const userCred = await confirmationResult.confirm(code);
  confirmationResult = null;
  return userCred;
}

export async function sendPasswordReset(email) {
  if (!auth) initApp();
  return sendPasswordResetEmail(auth, email);
}

export async function submitFeedback({ name, message, rating = null, user = null }) {
  if (!db) initApp();
  if (!user) throw new Error('User must be signed in to submit feedback.');
  const doc = {
    name: name || null,
    message: message || '',
    rating: rating || null,
    uid: user.uid || null,
    email: (user.email) ? user.email : null,
    createdAt: serverTimestamp()
  };
  const ref = await addDoc(collection(db, 'feedback'), doc);
  return ref;
}

export async function signOutUser() {
  if (!auth) initApp();
  return auth.signOut();
}
