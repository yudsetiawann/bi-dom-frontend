'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/axios';
import Cookies from 'js-cookie';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const loginMutation = useMutation({
    mutationFn: async (credentials: any) => {
      const response = await api.post('/login', credentials);
      return response.data;
    },
    onSuccess: (data) => {
      // 1. Simpan Token ke Cookies (Berlaku 1 Hari)
      Cookies.set('auth_token', data.data.token, { expires: 1 });

      // 2. Munculkan Notifikasi
      toast.success('ACCESS_GRANTED', {
        description: 'Autentikasi berhasil. Selamat datang di sistem.',
      });

      // 3. Arahkan ke Dashboard
      router.push('/');
    },
    onError: (error: any) => {
      toast.error('ACCESS_DENIED', {
        description:
          error.response?.data?.message || 'Email atau Password tidak valid.',
      });
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ email, password });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-montserrat relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] text-[20vw] font-black text-black/5 select-none pointer-events-none">
        DOM
      </div>
      <div className="absolute bottom-[-10%] right-[-5%] text-[20vw] font-black text-black/5 select-none pointer-events-none">
        HUB
      </div>

      <div className="bg-white border-4 border-black p-10 md:p-14 w-full max-w-md shadow-[12px_12px_0px_#000000] relative z-10">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-black uppercase tracking-tighter italic text-black">
            Login_System
          </h1>
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="w-2 h-2 bg-red-600 animate-pulse"></span>
            <p className="text-[10px] font-black tracking-widest text-red-600 uppercase">
              Restricted Area // DOM Hub
            </p>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-[10px] font-black tracking-widest uppercase mb-2 text-black">
              User_Identification
            </label>
            <input
              type="email"
              required
              placeholder="ENTER EMAIL"
              className="w-full border-2 border-black p-4 font-bold text-sm bg-gray-50 focus:outline-none focus:bg-white focus:ring-0 focus:border-red-600 transition-colors"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-[10px] font-black tracking-widest uppercase mb-2 text-black">
              Security_Key
            </label>
            <input
              type="password"
              required
              placeholder="ENTER PASSWORD"
              className="w-full border-2 border-black p-4 font-bold text-sm bg-gray-50 focus:outline-none focus:bg-white focus:ring-0 focus:border-red-600 transition-colors"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full bg-black text-white border-2 border-black font-black uppercase tracking-[0.2em] py-5 mt-4 hover:bg-red-600 hover:text-white transition-colors disabled:bg-gray-400 disabled:border-gray-400 disabled:text-gray-600 shadow-[4px_4px_0px_#000000] active:shadow-none active:translate-y-1 active:translate-x-1"
          >
            {loginMutation.isPending ? 'VERIFYING...' : 'INITIALIZE_SESSION'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t-2 border-black text-center">
          <p className="text-[9px] font-bold text-black/40 tracking-widest uppercase">
            © {new Date().getFullYear()} DOM Social Hub Business Intelligence
          </p>
        </div>
      </div>
    </div>
  );
}
