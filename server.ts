// Minimal Bun server with cookie sessions and static file serving (TypeScript)
// Endpoints:
// - POST /api/login { username, password }
// - POST /api/logout
// - GET /api/me -> { authenticated, username }

const ROOT_DIR: string = new URL('./', import.meta.url).pathname;
const SRC_DIR: string = new URL('./src/', import.meta.url).pathname;

// Simple in-memory session store
const sessionIdToUser: Map<string, string> = new Map();

async function safeExists(file: any): Promise<boolean> {
  const maybeExists = (file as unknown as { exists?: () => Promise<boolean> }).exists;
  if (typeof maybeExists === 'function') {
    try { return await maybeExists.call(file); } catch { return false; }
  }
  try { await file.arrayBuffer(); return true; } catch { return false; }
}

function normalizePath(p: string): string {
  if (p.startsWith('/')) return p.slice(1);
  return p;
}

async function getFile(relativePath: string): Promise<any | null> {
  const rel = normalizePath(relativePath);
  const fromSrc = Bun.file(`${SRC_DIR}${rel}`);
  if (await safeExists(fromSrc)) return fromSrc;
  const fromRoot = Bun.file(`${ROOT_DIR}${rel}`);
  if (await safeExists(fromRoot)) return fromRoot;
  return null;
}

function generateSessionId(): string {
  const random = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(random, b => b.toString(16).padStart(2, '0')).join('');
}

function getCookieMap(cookieHeader: string | null): Map<string, string> {
  const map = new Map<string, string>();
  if (!cookieHeader) return map;
  const parts = cookieHeader.split(';');
  for (const part of parts) {
    const [k, v] = part.trim().split('=');
    if (k) map.set(k, v || '');
  }
  return map;
}

type SameSite = 'Lax' | 'Strict' | 'None' | undefined;

interface SetCookieOptions {
  httpOnly?: boolean;
  path?: string;
  sameSite?: SameSite;
  secure?: boolean;
  maxAge?: number;
}

function buildSetCookie(
  name: string,
  value: string,
  { httpOnly = true, path = '/', sameSite = 'Lax' as SameSite, secure, maxAge }: SetCookieOptions = {}
): string {
  const attrs: string[] = [];
  attrs.push(`${name}=${value}`);
  if (httpOnly) attrs.push('HttpOnly');
  attrs.push(`Path=${path}`);
  if (sameSite) attrs.push(`SameSite=${sameSite}`);
  if (secure ?? (Bun.env.NODE_ENV === 'production')) attrs.push('Secure');
  if (typeof maxAge === 'number') attrs.push(`Max-Age=${maxAge}`);
  return attrs.join('; ');
}

// Credentials from env with safe defaults for dev
const credentials: Record<string, string | undefined> = {
  admin: Bun.env.CCTV_ADMIN_PASSWORD || 'admin',
  viewer: Bun.env.CCTV_VIEWER_PASSWORD || undefined,
  manager: Bun.env.CCTV_MANAGER_PASSWORD || undefined,
  guest: Bun.env.CCTV_GUEST_PASSWORD || undefined,
};

function isValidUser(username?: string, password?: string): boolean {
  if (!username || !password) return false;
  const expected = credentials[username];
  if (!expected) return false;
  return expected === password;
}

function getUserFromRequest(req: Request): string | null {
  const cookies = getCookieMap(req.headers.get('cookie'));
  const sid = cookies.get('cctv_sid');
  if (!sid) return null;
  const username = sessionIdToUser.get(sid);
  return username || null;
}

async function serveStaticOrIndex(req: Request, path: string): Promise<Response> {
  // Protect app pages except login
  const url = new URL(req.url);
  const pathname = url.pathname;
  const isLogin = pathname === '/' || pathname.endsWith('login.html') || pathname === '/index.html';
  const user = getUserFromRequest(req);
  if (!user && !isLogin && (pathname.endsWith('.html') || pathname === '/')) {
    return Response.redirect('/login.html', 302);
  }

  try {
    const file = await getFile(path);
    if (file) return new Response(file);
  } catch {}

  {
    const fallback = await getFile('index.html');
    if (fallback) return new Response(fallback);
  }
  return new Response('Not Found', { status: 404 });
}

const server = Bun.serve({
  port: Number(Bun.env.PORT ?? 3000),
  async fetch(req: Request): Promise<Response> {
    const url = new URL(req.url);
    const pathname = url.pathname;

    // Serve favicon from logo to avoid 404s
    if (pathname === '/favicon.ico') {
      const icon = await getFile('logo_mark_gradient_sized.png');
      if (icon) return new Response(icon);
      return new Response(null, { status: 204 });
    }

    if (pathname === '/api/login' && req.method === 'POST') {
      try {
        const body = (await req.json()) as { username?: string; password?: string };
        const { username, password } = body || {};
        if (!isValidUser(username, password)) {
          return new Response(JSON.stringify({ ok: false, error: 'Invalid credentials' }), { status: 401, headers: { 'content-type': 'application/json' } });
        }
        const sid = generateSessionId();
        sessionIdToUser.set(sid, username!);
        const headers = new Headers({ 'content-type': 'application/json' });
        headers.append('set-cookie', buildSetCookie('cctv_sid', sid, { httpOnly: true, sameSite: 'Lax', secure: undefined, maxAge: 60 * 60 * 12 }));
        return new Response(JSON.stringify({ ok: true, username }), { status: 200, headers });
      } catch (e) {
        return new Response(JSON.stringify({ ok: false, error: 'Bad request' }), { status: 400, headers: { 'content-type': 'application/json' } });
      }
    }

    if (pathname === '/api/logout' && req.method === 'POST') {
      const cookies = getCookieMap(req.headers.get('cookie'));
      const sid = cookies.get('cctv_sid');
      if (sid) sessionIdToUser.delete(sid);
      const headers = new Headers({ 'content-type': 'application/json' });
      headers.append('set-cookie', buildSetCookie('cctv_sid', '', { httpOnly: true, sameSite: 'Lax', secure: undefined, maxAge: 0 }));
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
    }

    if (pathname === '/api/me' && req.method === 'GET') {
      const user = getUserFromRequest(req);
      return new Response(JSON.stringify({ authenticated: !!user, username: user || null }), { status: 200, headers: { 'content-type': 'application/json' } });
    }

    let filePath = pathname === '/' ? 'index.html' : pathname.slice(1);
    return await serveStaticOrIndex(req, filePath);
  },
});

console.log(`Server listening on http://localhost:${server.port}`);


