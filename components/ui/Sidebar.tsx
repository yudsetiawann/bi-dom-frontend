'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

import {
  Menu,
  X,
  AlertTriangle,
  BarChart2,
  UploadCloud,
  Coffee,
  PackageSearch,
  ReceiptText,
  ClipboardList,
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Panggil hook Auth untuk mendapatkan nama dan role
  const { state, setters, handlers } = useAuth();

  // Jika sedang di halaman login, jangan render Sidebar (Bypass)
  if (pathname === '/login') return null;

  const navItems = [
    {
      name: 'Dashboard',
      path: '/',
      icon: <BarChart2 size={20} strokeWidth={2.5} />,
    },
    {
      name: 'Import Data',
      path: '/import',
      icon: <UploadCloud size={20} strokeWidth={2.5} />,
    },
    {
      name: 'Master Product',
      path: '/products',
      icon: <Coffee size={20} strokeWidth={2.5} />,
    },
    {
      name: 'Inventory Alert',
      path: '/inventory',
      icon: <PackageSearch size={20} strokeWidth={2.5} />,
    },
    {
      name: 'Stock Adjustment',
      path: '/inventory/adjust',
      icon: <ClipboardList size={20} strokeWidth={2.5} />,
    },
    {
      name: 'Invoice',
      path: '/invoices',
      icon: <ReceiptText size={20} strokeWidth={2.5} />,
    },
  ];

  // 👉 LOGIKA PENYEMBUNYIAN MENU (FILTERING)
  const filteredNavItems = navItems.filter((item) => {
    // Kalau belum ke-load, sembunyikan semua dulu biar aman
    if (!state.userRole) return false;

    // Manager lihat semua
    if (state.userRole === 'manager') return true;

    // Kasir HANYA lihat Import Data dan Invoice
    if (state.userRole === 'kasir') {
      return ['/import', '/invoices'].includes(item.path);
    }

    return false;
  });

  const handleNavClick = () => setIsOpen(false);

  // 👉 FUNGSI UNTUK MENGAMBIL HURUF DEPAN NAMA (Misal: "Staff Kasir" -> "SK")
  const getInitials = (name: string | null) => {
    if (!name) return '??';
    const words = name.split(' ');
    if (words.length > 1) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <>
      {/* MODAL LOGOUT */}
      {state.isLogoutModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setters.setIsLogoutModalOpen(false)}
          ></div>
          <div className="relative z-10 bg-white border-4 border-black w-full max-w-sm shadow-[8px_8px_0px_#dc2626] p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle size={24} className="text-red-600" />
              <h2 className="font-black italic tracking-widest uppercase text-lg text-black">
                Terminate_Session?
              </h2>
            </div>
            <p className="text-xs font-bold text-gray-600 mb-6 uppercase tracking-wider">
              Are you sure you want to disconnect from DOM Social Hub?
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setters.setIsLogoutModalOpen(false)}
                type="button"
                className="flex-1 bg-gray-200 text-black p-3 font-black uppercase text-[10px] tracking-widest hover:bg-gray-300 transition-colors border-2 border-transparent hover:border-black"
              >
                Cancel
              </button>
              <button
                onClick={handlers.executeLogout}
                type="button"
                className="flex-1 bg-black text-white p-3 font-black uppercase text-[10px] tracking-widest hover:bg-red-600 transition-colors shadow-[4px_4px_0px_#444] hover:shadow-[4px_4px_0px_#dc2626]"
              >
                Confirm_Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MOBILE TOP BAR */}
      <div className="md:hidden fixed top-0 left-0 w-full h-16 bg-black border-b border-red-900/30 flex items-center justify-between px-6 z-40">
        <Link href="/" className="relative w-28 h-10 block">
          <Image
            src="/dom-logo.png"
            alt="DOM Social Hub"
            fill
            className="object-contain object-left"
            priority
          />
        </Link>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-white hover:text-red-500 transition-colors"
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/80 z-30 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* SIDEBAR UTAMA */}
      <aside
        className={`w-64 bg-black border-r border-red-900/30 h-[100dvh] fixed left-0 top-0 flex flex-col z-50 font-montserrat transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
      >
        <div className="p-8 border-b border-red-900/20 relative overflow-hidden flex flex-col items-center">
          <div className="scanline"></div>
          <div className="w-full max-w-[180px] relative">
            <Image
              src="/dom-logo.png"
              alt="DOM Social Hub"
              width={180}
              height={80}
              className="w-full h-auto object-contain drop-shadow-[0_0_15px_rgba(220,38,38,0.3)]"
              priority
            />
          </div>
          <p className="text-[9px] text-red-500 font-bold tracking-[0.3em] mt-3 opacity-70 border-t border-red-900/50 pt-2 w-full text-center">
            S_OS_V.1.0 // ACTIVE
          </p>
        </div>

        <nav className="flex-1 p-4 space-y-2 mt-2 overflow-y-auto">
          {/* 👉 Render Menu yang Sudah Difilter (Bukan navItems asli) */}
          {filteredNavItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.name}
                href={item.path}
                onClick={handleNavClick}
                className={`group flex items-center gap-4 px-4 py-3 transition-all duration-300 relative ${isActive ? 'text-red-500 font-black' : 'text-gray-500 hover:text-white'}`}
              >
                {isActive && (
                  <div className="absolute left-0 w-1 h-2/3 bg-red-600 shadow-[0_0_15px_rgba(220,38,38,1)]"></div>
                )}
                <span
                  className={`transition-colors ${isActive ? 'text-red-500' : 'text-gray-500 group-hover:text-white'}`}
                >
                  {item.icon}
                </span>
                <span className="uppercase tracking-widest text-[11px]">
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* 👉 PROFIL DINAMIS DI SINI */}
        <div className="p-4 border-t border-red-900/20 space-y-4 bg-black shrink-0">
          <div className="bg-red-900/10 border border-red-900/30 p-4 flex items-center gap-3">
            <div className="w-8 h-8 min-w-[32px] bg-red-600 flex items-center justify-center text-white font-black text-xs shadow-[0_0_10px_rgba(220,38,38,0.5)]">
              {getInitials(state.userName)}
            </div>
            <div className="overflow-hidden">
              <p className="text-[11px] font-black text-white truncate uppercase tracking-tighter">
                {state.userName || 'Loading...'}
              </p>
              <p className="text-[9px] text-red-500 font-bold tracking-widest uppercase">
                {state.userRole || 'Verifying'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setters.setIsLogoutModalOpen(true)}
            type="button"
            className="w-full text-left px-4 py-2 text-[10px] font-black text-gray-500 hover:text-red-500 uppercase tracking-[0.2em] transition-colors"
          >
            [ Disconnect_Session ]
          </button>
        </div>
      </aside>
    </>
  );
}
