import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import Cookies from 'js-cookie';
import { clearAuthCookies } from '@/lib/authCookies';

export function useAuth() {
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    setUserRole(Cookies.get('user_role') || null);
    setUserName(Cookies.get('user_name') || null);
  }, []);

  const executeLogout = async () => {
    setIsLogoutModalOpen(false);
    try {
      await Promise.race([
        api.post('/logout'),
        new Promise((resolve) => setTimeout(resolve, 2000)),
      ]);
    } catch (error) {
      console.log('Backend timeout/error, forcing local clear...');
    }
    clearAuthCookies();
    localStorage.clear();
    window.location.replace('/login');
  };

  return {
    state: { isLogoutModalOpen, userRole, userName },
    setters: { setIsLogoutModalOpen },
    handlers: { executeLogout },
  };
}
