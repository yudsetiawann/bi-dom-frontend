// hooks/useAuth.ts

import { useState } from 'react';
import api from '@/lib/axios';
import Cookies from 'js-cookie';

export function useAuth() {
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const executeLogout = async () => {
    // 1. Langsung tutup modal biar UI merespons cepat
    setIsLogoutModalOpen(false);

    try {
      // 2. Beri waktu backend untuk membalas (maksimal 2 detik)
      await Promise.race([
        api.post('/logout'),
        new Promise((resolve) => setTimeout(resolve, 2000)),
      ]);
    } catch (error) {
      console.log('Backend timeout/error, forcing local clear...');
    }

    // 3. NUKE SEMUA COOKIE (Meniru cara kerja F12)
    const allCookies = Cookies.get();
    for (const cookieName in allCookies) {
      Cookies.remove(cookieName);
      Cookies.remove(cookieName, { path: '/' });
      Cookies.remove(cookieName, {
        path: '/',
        domain: window.location.hostname,
      });
    }

    // 4. Hapus Local Storage & Tendang ke Login
    localStorage.clear();
    window.location.replace('/login');
  };

  return {
    state: { isLogoutModalOpen },
    setters: { setIsLogoutModalOpen },
    handlers: { executeLogout },
  };
}
