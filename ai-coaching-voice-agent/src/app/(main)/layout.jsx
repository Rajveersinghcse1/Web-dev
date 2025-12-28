import React from 'react';
import AppHeader from './_components/AppHeader';

export const metadata = {
  title: "Dashboard | Brane Storm",
  description: "Your personal AI learning dashboard",
};

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-purple-50/30">
      <AppHeader />
      <div className='pt-20 px-6 md:px-12 lg:px-20 xl:px-32 2xl:px-48 pb-10'>
        {children}
      </div>
    </div>
  );
}