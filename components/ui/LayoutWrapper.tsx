'use client';

import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  // Jika di halaman login, tampilkan polosan tanpa sidebar & margin
  if (isLoginPage) {
    return <main className="min-h-screen bg-gray-100">{children}</main>;
  }

  // Jika di halaman dalam (Dashboard, dll), pasang Sidebar & Margin
  return (
    <div className="flex min-h-screen bg-gray-100 font-montserrat">
      <Sidebar />
      {/* md:ml-64 = Dorong konten ke kanan di layar laptop agar tidak tertimpa Sidebar 
        pt-16 = Beri ruang di atas untuk Top Bar di layar HP
        md:pt-0 = Hilangkan ruang atas tersebut saat di laptop
      */}
      <main className="flex-1 md:ml-64 pt-16 md:pt-0 min-h-screen overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
