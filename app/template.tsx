// app/template.tsx
'use client';

import { motion } from 'framer-motion';

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      // Memulai dari bawah (y: 20) dan transparan
      initial={{ y: 20, opacity: 0 }}
      // Bergerak ke posisi asli (y: 0) dan solid
      animate={{ y: 0, opacity: 1 }}
      // Animasi "Snap" tegas (durasi cepat, tanpa bounce berlebih)
      transition={{
        type: 'spring',
        stiffness: 260,
        damping: 20,
        duration: 0.3,
      }}
    >
      {children}
    </motion.div>
  );
}
