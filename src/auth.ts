// Typed client-side auth helpers. These are attached to window for HTML use.

type AuthSession = {
  username: string;
  loginTime: number;
};

const AUTH_KEY = 'cctv_auth_session';

function isAuthenticated(): boolean {
  const session = sessionStorage.getItem(AUTH_KEY);
  if (!session) return false;
  try {
    const sessionData = JSON.parse(session) as Partial<AuthSession>;
    return !!sessionData.username;
  } catch {
    sessionStorage.removeItem(AUTH_KEY);
    return false;
  }
}

function createSession(username: string): void {
  const sessionData: AuthSession = {
    username,
    loginTime: Date.now()
  };
  sessionStorage.setItem(AUTH_KEY, JSON.stringify(sessionData));
}

function getCurrentUser(): string | null {
  const session = sessionStorage.getItem(AUTH_KEY);
  if (!session) return null;
  try {
    const data = JSON.parse(session) as Partial<AuthSession>;
    return data.username ?? null;
  } catch {
    return null;
  }
}

async function handleLogin(event: Event): Promise<void> {
  event.preventDefault();
  const username = (document.getElementById('username') as HTMLInputElement)?.value.trim();
  const password = (document.getElementById('password') as HTMLInputElement)?.value;
  const errorMessage = document.getElementById('errorMessage') as HTMLElement | null;
  try {
    const res = await fetch('/api/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ username, password }) });
    if (!res.ok) throw new Error('Invalid credentials');
    const data = (await res.json()) as { ok: boolean; username?: string };
    if (data.ok) {
      createSession(data.username || username);
      window.location.href = 'cctv.html';
      return;
    }
    throw new Error('Login failed');
  } catch {
    if (errorMessage) errorMessage.style.display = 'block';
    const pw = document.getElementById('password') as HTMLInputElement | null;
    if (pw) pw.value = '';
    setTimeout(() => { if (errorMessage) errorMessage.style.display = 'none'; }, 3000);
  }
}

async function logout(): Promise<void> {
  try {
    await fetch('/api/logout', { method: 'POST' });
  } catch {}
  sessionStorage.removeItem(AUTH_KEY);
  window.location.href = 'login.html';
}

async function protectPage(): Promise<boolean> {
  try {
    const res = await fetch('/api/me');
    if (!res.ok) throw new Error('not ok');
    const data = (await res.json()) as { authenticated: boolean; username: string | null };
    if (data.authenticated) {
      if (data.username) createSession(data.username);
      return true;
    }
  } catch {}
  window.location.href = 'login.html';
  return false;
}

async function syncUserFromServer(): Promise<void> {
  const hasSession = !!sessionStorage.getItem(AUTH_KEY);
  if (hasSession) return;
  try {
    const res = await fetch('/api/me');
    if (!res.ok) return;
    const data = (await res.json()) as { authenticated: boolean; username: string | null };
    if (data.authenticated && data.username) createSession(data.username);
  } catch {}
}

document.addEventListener('DOMContentLoaded', async () => {
  if (!window.location.pathname.includes('login.html')) {
    await protectPage();
  }
  await syncUserFromServer();
});

// Expose globals for inline HTML handlers
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).handleLogin = handleLogin;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).logout = logout;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).getCurrentUser = getCurrentUser;


