'use client';
import { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { HelpProvider, useHelp } from '@/context/HelpContext';

interface ResponsiveDashboardLayoutProps {
  children: React.ReactNode;
}

function DashboardContent({ children }: ResponsiveDashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>
      
      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-0 lg:max-w-none min-h-screen">
        <div className="sticky top-0 z-30 bg-background">
          <Navbar 
            onMenuClick={() => setSidebarOpen(true)}
          />
        </div>
        <main className="flex-1">
          <div className="px-4 sm:px-6 lg:px-8" style={{ scrollBehavior: 'smooth' }}>
            <div className="max-w-6xl mx-auto py-4 sm:py-6">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function ResponsiveDashboardLayout({ children }: ResponsiveDashboardLayoutProps) {
  return (
    <HelpProvider>
      <DashboardContent>{children}</DashboardContent>
    </HelpProvider>
  );
}
