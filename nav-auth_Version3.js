import { initApp, onAuthStateChanged, signOutUser } from './auth.js';

initApp();

const nav = document.querySelector('nav');
const path = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
const isLoginPage = path === 'login.html' || path === '';

function ensureNavLinks() {
  if (!nav) return;

  if (!document.querySelector('a[href="Login.html"]')) {
    const a = document.createElement('a');
    a.href = 'Login.html';
    a.textContent = 'Login';
    nav.insertBefore(a, nav.firstChild);
  }

  if (!document.getElementById('nav-logout')) {
    const logout = document.createElement('a');
    logout.href = '#';
    logout.id = 'nav-logout';
    logout.textContent = 'Logout';
    logout.style.display = 'none';
    logout.addEventListener('click', async (e) => {
      e.preventDefault();
      try {
        await signOutUser();
        window.location.href = 'Login.html';
      } catch (err) {
        console.error('Sign out error', err);
        alert('Could not sign out right now.');
      }
    });
    nav.appendChild(logout);
  }

  if (!document.getElementById('nav-profile')) {
    const p = document.createElement('a');
    p.href = 'Login.html';
    p.id = 'nav-profile';
    p.style.display = 'none';
    nav.appendChild(p);
  }
}

ensureNavLinks();

function updateNav(user) {
  const loginLink = document.querySelector('a[href="Login.html"]');
  const logoutLink = document.getElementById('nav-logout');
  const profileLink = document.getElementById('nav-profile');

  if (user) {
    if (loginLink) loginLink.style.display = 'none';
    if (logoutLink) logoutLink.style.display = '';
    if (profileLink) {
      profileLink.style.display = '';
      profileLink.textContent = user.email ? `Account (${user.email})` : `Account (${user.phoneNumber || 'user'})`;
    }
  } else {
    if (loginLink) loginLink.style.display = '';
    if (logoutLink) logoutLink.style.display = 'none';
    if (profileLink) profileLink.style.display = 'none';
  }
}

function getRedirectParam() {
  try {
    const params = new URLSearchParams(window.location.search);
    const redirect = params.get('redirect');
    return redirect ? decodeURIComponent(redirect) : null;
  } catch (e) {
    return null;
  }
}

onAuthStateChanged((user) => {
  updateNav(user);

  if (!user && !isLoginPage) {
    const original = window.location.pathname + window.location.search;
    const to = `Login.html?redirect=${encodeURIComponent(original)}`;
    window.location.replace(to);
    return;
  }

  if (user && isLoginPage) {
    const target = getRedirectParam() || 'index.html';
    if (window.location.pathname.split('/').pop() !== target.split('/').pop()) {
      window.location.replace(target);
    }
  }
});