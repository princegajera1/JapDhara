import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import DesktopSidebar from './DesktopSidebar';
import MobileBottomNav from './MobileBottomNav';
import ProfileSetupModal from '../common/ProfileSetupModal';

export const AppLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text transition-colors duration-200">
      <Header />
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <DesktopSidebar />
        <main className="flex-1 p-4 md:p-8 pb-28 lg:pb-8 max-w-full overflow-x-hidden">
          <Outlet />
        </main>
      </div>
      <MobileBottomNav />
      <ProfileSetupModal />
    </div>
  );
};

export default AppLayout;
