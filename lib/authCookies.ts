import Cookies from 'js-cookie';

const authCookieOptions: Cookies.CookieAttributes = {
  expires: 1,
  path: '/',
  sameSite: 'strict',
  secure: typeof window !== 'undefined' && window.location.protocol === 'https:',
};

export function setAuthCookies(token: string, role: string, name: string) {
  Cookies.set('auth_token', token, authCookieOptions);
  Cookies.set('user_role', role, authCookieOptions);
  Cookies.set('user_name', name, authCookieOptions);
}

export function clearAuthCookies() {
  for (const cookieName of Object.keys(Cookies.get())) {
    Cookies.remove(cookieName);
    Cookies.remove(cookieName, { path: '/' });
    Cookies.remove(cookieName, {
      path: '/',
      domain: window.location.hostname,
    });
  }
}
