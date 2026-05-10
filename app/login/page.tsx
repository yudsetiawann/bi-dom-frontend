'use client';

import { useState, useEffect } from 'react'; // <-- Tambahkan useEffect di sini
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/axios';
import Cookies from 'js-cookie';
import { toast } from 'sonner';
import { Terminal, User, Lock, ArrowRight, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // 👉 RANJAU PEMBERSIH: Hancurkan semua sesi hantu saat halaman ini dibuka
  useEffect(() => {
    Cookies.remove('auth_token');
    Cookies.remove('auth_token', { path: '/' });
    Cookies.remove('user_role');
    Cookies.remove('user_role', { path: '/' });
    Cookies.remove('user_name');
    Cookies.remove('user_name', { path: '/' });
    localStorage.clear();
  }, []);

  const loginMutation = useMutation({
    mutationFn: async (credentials: any) => {
      const response = await api.post('/login', credentials);
      return response.data;
    },
    onSuccess: (data) => {
      // 1. Simpan Token
      Cookies.set('auth_token', data.data.token, { expires: 1 });

      // 2. Simpan Role & Nama (Asumsi struktur response: data.data.user.role)
      Cookies.set('user_role', data.data.user.role, { expires: 1 });
      Cookies.set('user_name', data.data.user.name, { expires: 1 });

      toast.success('ACCESS_GRANTED', {
        description: 'Autentikasi berhasil. Selamat datang di sistem.',
      });

      // 3. Redirect berdasarkan Role
      if (data.data.user.role === 'manager') {
        router.push('/');
      } else {
        router.push('/invoices'); // Kasir langsung lempar ke Invoices
      }
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
    <div className="min-h-screen flex bg-white font-montserrat">
      {/* KOLOM KIRI: BRANDING & SYSTEM INFO (Hanya tampil di Laptop/Desktop) */}
      <div className="hidden lg:flex w-1/2 bg-black border-r-4 border-black p-12 flex-col justify-between relative overflow-hidden">
        {/* Ornamen Background Teks Raksasa */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2 text-[20vw] font-black text-white/5 leading-none select-none pointer-events-none">
          DOM
        </div>

        {/* Header Kiri */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-red-600 text-white px-3 py-1 text-[10px] font-black tracking-[0.3em] uppercase mb-6 shadow-[4px_4px_0px_#ffffff]">
            <Terminal size={12} /> SYSTEM_ONLINE
          </div>
          <h1 className="text-6xl font-black italic tracking-tighter text-white uppercase leading-none mb-4">
            Social Hub <br />
            <span className="text-red-600">Analytics.</span>
          </h1>
          <p className="text-sm font-bold text-gray-400 tracking-widest uppercase max-w-md leading-relaxed border-l-2 border-red-600 pl-4">
            Integrated Business Intelligence & Centralized Control System
          </p>
        </div>

        {/* Footer Kiri */}
        <div className="relative z-10 grid grid-cols-2 gap-4 border-t-2 border-white/10 pt-6">
          <div>
            <p className="text-[10px] font-black text-gray-500 tracking-widest uppercase">
              Version
            </p>
            <p className="text-sm font-black text-white tracking-wider">
              v2.0.4-Stable
            </p>
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-500 tracking-widest uppercase">
              Security_Protocol
            </p>
            <p className="text-sm font-black text-green-400 tracking-wider flex items-center gap-1">
              <ShieldCheck size={14} /> ACTIVE
            </p>
          </div>
        </div>
      </div>

      {/* KOLOM KANAN: FORM LOGIN */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 relative bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+CjxwYXRoIGQ9Ik0wIDBoNDB2NDBIMHoiIGZpbGw9Im5vbmUiLz4KPHBhdGggZD0iTTAgMGg0MHYxSDB6IiBmaWxsPSJyZ2JhKDAsMCwwLDAuMDMpIi8+CjxwYXRoIGQ9Ik0wIDBoMXY0MEgweiIgZmlsbD0icmdiYSgwLDAsMCwwLjAzKSIvPgo8L3N2Zz4=')]">
        {/* KOTAK LOGIN BRUTALIST */}
        <div className="bg-white border-4 border-black p-8 md:p-12 w-full max-w-md shadow-[12px_12px_0px_#dc2626] relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="mb-10">
            <h2 className="text-3xl font-black uppercase tracking-tighter italic text-black mb-2">
              Access_Portal
            </h2>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-red-600 animate-pulse"></span>
              <p className="text-[10px] font-black tracking-[0.2em] text-gray-500 uppercase">
                Awaiting Authentication...
              </p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Input Email */}
            <div className="space-y-2">
              <label className="block text-[10px] font-black tracking-widest uppercase text-black">
                User_Identification
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-black/40 group-focus-within:text-red-600 transition-colors">
                  <User size={18} />
                </div>
                <input
                  type="email"
                  required
                  placeholder="ENTER_EMAIL_ADDRESS"
                  className="w-full border-2 border-black p-4 pl-12 font-bold text-xs bg-gray-50 focus:outline-none focus:bg-white focus:border-red-600 transition-all uppercase tracking-wider placeholder:text-gray-300"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Input Password */}
            <div className="space-y-2">
              <label className="block text-[10px] font-black tracking-widest uppercase text-black">
                Security_Key
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-black/40 group-focus-within:text-red-600 transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  className="w-full border-2 border-black p-4 pl-12 font-bold text-xs bg-gray-50 focus:outline-none focus:bg-white focus:border-red-600 transition-all tracking-wider placeholder:text-gray-300"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {/* Tombol Submit */}
            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full bg-black text-white border-2 border-black font-black uppercase tracking-[0.2em] p-4 mt-8 flex items-center justify-center gap-3 hover:bg-red-600 hover:text-white transition-all disabled:bg-gray-400 disabled:border-gray-400 disabled:text-gray-600 shadow-[6px_6px_0px_#000000] active:shadow-none active:translate-y-1 active:translate-x-1 group"
            >
              {loginMutation.isPending
                ? 'VERIFYING_CREDENTIALS...'
                : 'INITIALIZE_SESSION'}
              {!loginMutation.isPending && (
                <ArrowRight
                  size={18}
                  className="group-hover:translate-x-1 transition-transform"
                />
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t-2 border-black/10 text-center">
            <p className="text-[9px] font-bold text-gray-400 tracking-widest uppercase">
              &copy; {new Date().getFullYear()} DOM Hub. Unauthorized access is
              strictly prohibited.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
