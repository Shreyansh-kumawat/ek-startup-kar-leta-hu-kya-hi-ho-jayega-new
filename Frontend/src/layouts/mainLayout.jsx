import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useNotification } from '../hooks/useNotification';
import Notification from '../components/Notification';
import Footer from '../pages/Footer';

const MainLayout = () => {
  const { notifications, removeNotification } = useNotification();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        <Outlet />
      </main>

      <Footer />
      
      
      {/* Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map((notification) => (
          <Notification
            key={notification.id}
            type={notification.type}
            message={notification.message}
            onClose={() => removeNotification(notification.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default MainLayout;