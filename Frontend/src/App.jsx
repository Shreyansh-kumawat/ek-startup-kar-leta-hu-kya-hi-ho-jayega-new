import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './features/auth/useAuth';
import Loader from './components/Loader';
import ScrollToTop from './components/ScrollToTop';
import { ReactLenis } from 'lenis/react';
import 'lenis/dist/lenis.css';

// Layouts
import MainLayout from './layouts/mainLayout';
import DashboardLayout from './layouts/DashboardLayout';
import PrivacyPolicy from './pages/PrivacyPolocy';

// Public Pages (Lazy loaded)
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const Templates = lazy(() => import('./pages/Templates'));
const TemplateDetails = lazy(() => import('./pages/TemplateDetails'));
const About = lazy(() => import('./pages/About'));
const LabsAbout = lazy(() => import('./pages/LabsAbout'));
const Contact = lazy(() => import('./pages/Contact'));
const Pricing = lazy(() => import('./pages/Pricing'));
const NotFound = lazy(() => import('./pages/NotFound'));

// ✅ Careers Pages
const CareerPage = lazy(() => import('./pages/CareerPage'));
const CareerJobDetail = lazy(() => import('./pages/CareerJobDetail'));

// ✅ B2B Booking Pages
const BookTemplate = lazy(() => import('./pages/BookTemplate'));
const UserBookings = lazy(() => import('./pages/UserBookings'));
const BookingDetails = lazy(() => import('./pages/BookingDetails'));

// Protected User Pages
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Account = lazy(() => import('./pages/Account'));
const MeetingList = lazy(() => import('./features/meeting/MeetingList'));
const MeetingSchedule = lazy(() => import('./pages/MeetingSchedule'));

// Admin Pages
const AdminPanel = lazy(() => import('./pages/AdminPanel'));
const TemplateManager = lazy(() => import('./features/admin/TemplateManager'));
const UserManager = lazy(() => import('./features/admin/UserManager'));
const SecondaryAdminPanel = lazy(() => import('./features/admin/SecondaryAdminPanel'));
const AdminTemplateBookingManager = lazy(() => import('./features/admin/AdminTemplateBookingManager'));
const AdminMeetingManager = lazy(() => import('./features/admin/AdminMeetingManager'));
const AdminCareerManager = lazy(() => import('./features/admin/AdminCareerManager')); // ✅ NEW

// Placeholder component
const PlaceholderPage = ({ title, description }) => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center p-8">
      <div className="text-6xl mb-4">🚧</div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">{title}</h2>
      <p className="text-gray-600 mb-6">{description}</p>
      <button onClick={() => window.history.back()} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Go Back</button>
    </div>
  </div>
);

// Protected Route Component
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
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;
  if (requiredRole && user.role !== requiredRole && !['admin', 'secondaryAdmin'].includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

// Public Route Component
const PublicRoute = ({ children }) => {
  const { loading } = useAuth();
  if (loading) return <div className="flex justify-center items-center h-screen bg-gray-50"></div>;
  return children;
};

function App() {
  return (
    <ReactLenis root options={{ lerp: 0.1, duration: 1.4, smoothTouch: false, prevent: (node) => node.classList.contains('scrollable-element') }}>
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
            {/* ========== PUBLIC ROUTES ========== */}
            <Route path="/" element={<MainLayout />}>
              <Route index element={<PublicRoute><Home /></PublicRoute>} />
              <Route path="home" element={<PublicRoute><Home /></PublicRoute>} />
              <Route path="pricing" element={<PublicRoute><Pricing /></PublicRoute>} />
              <Route path="about" element={<PublicRoute><About /></PublicRoute>} />
              <Route path="contact" element={<PublicRoute><Contact /></PublicRoute>} />
              <Route path="privacypolocy" element={<PublicRoute><PrivacyPolicy /></PublicRoute>} />
              <Route path="login" element={<PublicRoute><Login /></PublicRoute>} />
              <Route path="register" element={<PublicRoute><Register /></PublicRoute>} />
              <Route path="forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />

              {/* ✅ Careers - Public */}
              <Route path="careers" element={<PublicRoute><CareerPage /></PublicRoute>} />
              <Route path="careers/:jobId" element={<PublicRoute><CareerJobDetail /></PublicRoute>} />

              {/* ✅ Labs Routes */}
              <Route path="labs/about" element={<PublicRoute><LabsAbout /></PublicRoute>} />
            </Route>

            {/* ========== B2B BOOKING ROUTES ========== */}
            <Route path="/templates/:templateId/book" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
              <Route index element={<BookTemplate />} />
            </Route>

            {/* ========== PROTECTED USER ROUTES ========== */}
            <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
              <Route index element={<Dashboard />} />
              <Route path="account" element={<Account />} />
              <Route path="bookings" element={<UserBookings />} />
              <Route path="bookings/:bookingId" element={<BookingDetails />} />
              <Route path="meetings" element={<MeetingList />} />
              <Route path="meetings/schedule" element={<MeetingSchedule />} />
            </Route>

            {/* ========== ADMIN ROUTES ========== */}
            <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><DashboardLayout /></ProtectedRoute>}>
              <Route index element={<AdminPanel />} />
              <Route path="users" element={<UserManager />} />
              <Route path="templates" element={<TemplateManager />} />
              <Route path="bookings" element={<AdminTemplateBookingManager />} />
              <Route path="meetings" element={<AdminMeetingManager />} />
              <Route path="secondary" element={<SecondaryAdminPanel />} />
              <Route path="careers" element={<AdminCareerManager />} /> {/* ✅ NEW */}
            </Route>

            {/* ========== SECONDARY ADMIN ROUTES ========== */}
            <Route path="/secondary-admin" element={<ProtectedRoute requiredRole="secondaryAdmin"><DashboardLayout /></ProtectedRoute>}>
              <Route index element={<SecondaryAdminPanel />} />
              <Route path="bookings" element={<AdminTemplateBookingManager />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </div>
    </ReactLenis>
  );
}

export default App;
