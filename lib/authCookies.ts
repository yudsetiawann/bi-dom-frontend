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
  Cookies.remove('auth_token', { path: '/' });
  Cookies.remove('user_role', { path: '/' });
  Cookies.remove('user_name', { path: '/' });
}
