import React from 'react';

interface KioskLayoutProps {
  children: React.ReactNode;
}

export default function KioskLayout({ children }: KioskLayoutProps) {
  return (
    <div className="dashboard-container h-screen w-screen bg-[#020617] text-white font-sans flex flex-col relative overflow-hidden">
      {children}
    </div>
  );
}
