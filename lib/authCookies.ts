import Cookies from 'js-cookie';

const authCookieOptions: Cookies.CookieAttributes = {
  expires: 1,
  path: '/',
  sameSite: 'strict',
  secure: typeof window !== 'undefined' && window.location.protocol === 'https:',
};

/**
 * Save non-sensitive user info for client-side UI/routing.
 * Auth session is handled by HttpOnly cookie from Sanctum (not accessible via JS).
 */
export function setAuthCookies(role: string, name: string) {
  Cookies.set('user_role', role, authCookieOptions);
  Cookies.set('user_name', name, authCookieOptions);
}

export function clearAuthCookies() {
  Cookies.remove('user_role', { path: '/' });
  Cookies.remove('user_name', { path: '/' });
}
