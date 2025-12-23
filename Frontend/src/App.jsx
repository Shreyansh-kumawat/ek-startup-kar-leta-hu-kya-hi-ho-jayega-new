import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './features/auth/useAuth';
import Loader from './components/Loader';
import ScrollToTop from './components/ScrollToTop';


// import { inject } from '@vercel/analytics';


import { ReactLenis } from 'lenis/react';
import 'lenis/dist/lenis.css';
// import { Analytics } from '@vercel/analytics';


// Layouts
import MainLayout from './layouts/mainLayout';
import DashboardLayout from './layouts/DashboardLayout';


// Public Pages (Lazy loaded)
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword')); // ✅ NEW
const Templates = lazy(() => import('./pages/Templates'));
const TemplateDetails = lazy(() => import('./pages/TemplateDetails'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));


// 🔥 NEW: Template Booking Pages
const BookTemplate = lazy(() => import('./pages/BookTemplate'));
const UserBookings = lazy(() => import('./pages/UserBookings'));
const BookingDetails = lazy(() => import('./pages/BookingDetails'));


// Protected Pages (Lazy loaded)
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Account = lazy(() => import('./pages/Account')); // ✅ Account Page
const OrderList = lazy(() => import('./features/order/OrderList'));
const OrderDetails = lazy(() => import('./features/order/OrderDetails'));
const MeetingList = lazy(() => import('./features/meeting/MeetingList'));
const MeetingSchedule = lazy(() => import('./pages/MeetingSchedule'));
const ProjectPage = lazy(() => import('./pages/ProjectPage'));


// Admin Pages (Lazy loaded)
const AdminPanel = lazy(() => import('./pages/AdminPanel'));
const TemplateManager = lazy(() => import('./features/admin/TemplateManager'));
const UserManager = lazy(() => import('./features/admin/UserManager'));
const SecondaryAdminPanel = lazy(() => import('./features/admin/SecondaryAdminPanel'));


// 🔥 NEW: Admin Template Booking Manager
const AdminTemplateBookingManager = lazy(() => import('./features/admin/AdminTemplateBookingManager'));


// ADDED: Admin-specific management pages
const AdminOrderManager = lazy(() => import('./features/admin/AdminOrderManager'));
const AdminMeetingManager = lazy(() => import('./features/admin/AdminMeetingManager'));
const AdminProjectManager = lazy(() => import('./features/admin/AdminProjectManager'));


// Placeholder component for missing pages
const PlaceholderPage = ({ title, description }) => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center p-8">
      <div className="text-6xl mb-4">🚧</div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">{title}</h2>
      <p className="text-gray-600 mb-6">{description}</p>
      <button 
        onClick={() => window.history.back()} 
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Go Back
      </button>
    </div>
  </div>
);


// 🔥 UPDATED: Enhanced ProtectedRoute Component
const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { user, loading, isAuthenticated } = useAuth();
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm">Checking authentication...</p>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }
  
  if (requiredRole && user.role !== requiredRole && !['admin', 'secondaryAdmin'].includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};


// 🔥 UPDATED: Enhanced PublicRoute Component  
const PublicRoute = ({ children }) => {
  const { user, loading, isAuthenticated } = useAuth();
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        {/* <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm">Loading...</p>
        </div> */}
      </div>
    );
  }
  
  return children;
};


function App() {
  
  return (
    <ReactLenis root 
      options={{ 
        lerp: 0.1, 
        duration: 1.4, 
        smoothTouch: false,
        prevent: (node) => node.classList.contains('scrollable-element')
      }}
    >
      <div className="min-h-screen bg-gray-50">
        <ScrollToTop />
        
        <Suspense fallback={
          <div className="flex justify-center items-center h-screen bg-gray-50">
            <div className="flex justify-center items-center flex-col">
              <Loader size="xl" />
              <p className="mt-4 text-gray-600">Loading Application...</p>
            </div>
          </div>
        }>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<MainLayout />}>
              <Route index element={
                <PublicRoute>
                  <Home />
                </PublicRoute>
              } />
              
              <Route path="home" element={
                <PublicRoute>
                  <Home />
                </PublicRoute>
              } />
              
              <Route path="about" element={
                <PublicRoute>
                  <About />
                </PublicRoute>
              } />


              <Route path="contact" element={
                <PublicRoute>
                  <Contact />
                </PublicRoute>
              } />


              <Route path="templates/:id" element={
                <PublicRoute>
                  <TemplateDetails />
                </PublicRoute>
              } />
              
              <Route path="login" element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } />
              
              <Route path="register" element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              } />

              {/* ✅ NEW: Forgot Password Route */}
              <Route path="forgot-password" element={
                <PublicRoute>
                  <ForgotPassword />
                </PublicRoute>
              } />
            </Route>


            {/* Template Booking Routes */}
            <Route path="/templates/:templateId/book" element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }>
              <Route index element={<BookTemplate />} />
            </Route>


            {/* Protected User Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              
              {/* ✅ Account Page Route */}
              <Route path="account" element={<Account />} />
              
              <Route path="orders" element={<OrderList />} />
              <Route path="orders/:orderId" element={<OrderDetails />} />
              
              <Route path="meetings" element={<MeetingList />} />
              <Route path="meetings/schedule" element={<MeetingSchedule />} />
              
              <Route path="projects" element={<ProjectPage />} />
              <Route path="projects/:projectId" element={<ProjectPage />} />


              <Route path="bookings" element={<UserBookings />} />
              <Route path="bookings/:bookingId" element={<BookingDetails />} />
            </Route>


            {/* Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute requiredRole="admin">
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route index element={<AdminPanel />} />
              
              <Route path="users" element={<UserManager />} />
              <Route path="templates" element={<TemplateManager />} />
              <Route path="bookings" element={<AdminTemplateBookingManager />} />
              
              <Route path="orders" element={
                <Suspense fallback={<Loader />}>
                  <PlaceholderPage 
                    title="Order Management" 
                    description="Admin order management coming soon!" 
                  />
                </Suspense>
              } />
              
              <Route path="meetings" element={
                <Suspense fallback={<Loader />}>
                  <AdminMeetingManager />
                </Suspense>
              } />
              
              <Route path="projects" element={
                <Suspense fallback={<Loader />}>
                  <PlaceholderPage 
                    title="Project Management" 
                    description="Admin project management coming soon!" 
                  />
                </Suspense>
              } />
              
              <Route path="secondary" element={<SecondaryAdminPanel />} />
            </Route>


            {/* Secondary Admin Routes */}
            <Route path="/secondary-admin" element={
              <ProtectedRoute requiredRole="secondaryAdmin">
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route index element={<SecondaryAdminPanel />} />
              <Route path="bookings" element={<AdminTemplateBookingManager />} />
              
              <Route path="orders" element={
                <Suspense fallback={<Loader />}>
                  <PlaceholderPage 
                    title="Order Management" 
                    description="Secondary admin order management coming soon!" 
                  />
                </Suspense>
              } />
              
              <Route path="meetings" element={
                <Suspense fallback={<Loader />}>
                  <PlaceholderPage 
                    title="Meeting Management" 
                    description="Secondary admin meeting management coming soon!" 
                  />
                </Suspense>
              } />
            </Route>


            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
        {/* <Analytics /> */}
      </div>
    </ReactLenis>
  );
}


export default App;
