// Copied from project root auth.js (client-side helpers)
// The server handles real auth via HTTP-only cookies.
const AUTH_KEY = 'cctv_auth_session';

function isAuthenticated() {
  const session = sessionStorage.getItem(AUTH_KEY);
  if (!session) return false;
  try {
    const sessionData = JSON.parse(session);
    return sessionData.username ? true : false;
  } catch (e) {
    sessionStorage.removeItem(AUTH_KEY);
    return false;
  }
}

function createSession(username) {
  const sessionData = { username, loginTime: Date.now() };
  sessionStorage.setItem(AUTH_KEY, JSON.stringify(sessionData));
}

function getCurrentUser() {
  const session = sessionStorage.getItem(AUTH_KEY);
  if (!session) return null;
  try {
    const sessionData = JSON.parse(session);
    return sessionData.username;
  } catch (e) {
    return null;
  }
}

async function handleLogin(event) {
  event.preventDefault();
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  const errorMessage = document.getElementById('errorMessage');
  try {
    const res = await fetch('/api/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ username, password }) });
    if (!res.ok) throw new Error('Invalid credentials');
    const data = await res.json();
    if (data && data.ok) {
      createSession(data.username || username);
      window.location.href = 'cctv.html';
      return;
    }
    throw new Error('Login failed');
  } catch (e) {
    errorMessage.style.display = 'block';
    document.getElementById('password').value = '';
    setTimeout(() => { errorMessage.style.display = 'none'; }, 3000);
  }
}

async function logout() {
  try { await fetch('/api/logout', { method: 'POST' }); } catch {}
  sessionStorage.removeItem(AUTH_KEY);
  window.location.href = 'login.html';
}

async function protectPage() {
  try {
    const res = await fetch('/api/me', { method: 'GET' });
    if (!res.ok) throw new Error('not ok');
    const data = await res.json();
    if (data && data.authenticated) {
      if (data.username) createSession(data.username);
      return true;
    }
  } catch {}
  window.location.href = 'login.html';
  return false;
}

async function syncUserFromServer() {
  const hasSession = !!sessionStorage.getItem(AUTH_KEY);
  if (hasSession) return;
  try {
    const res = await fetch('/api/me');
    if (!res.ok) return;
    const data = await res.json();
    if (data && data.authenticated && data.username) {
      createSession(data.username);
    }
  } catch {}
}

document.addEventListener('DOMContentLoaded', async function() {
  if (!window.location.pathname.includes('login.html')) {
    await protectPage();
  }
  await syncUserFromServer();
});


