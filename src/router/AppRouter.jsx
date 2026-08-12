import React, { useEffect, useState, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "@/componentsCreated/NavBar";
import Footer from "@/componentsCreated/Footer";
import NotFound from "@/pages/NotFound";
import { getUser } from "@/api";

// Lazy load components for better performance
const Home = React.lazy(() => import("@/pages/Home"));
const About = React.lazy(() => import("@/pages/About"));
const Contact = React.lazy(() => import("@/pages/Contact"));
const Login = React.lazy(() => import("@/pages/Login"));
const Signup = React.lazy(() => import("@/pages/Signup"));
const Services = React.lazy(() => import("@/pages/Services"));
const Directory = React.lazy(() => import("@/services/Directory"));
const Appointment = React.lazy(() => import("@/services/Appointment"));
const Teleconsultation = React.lazy(() => import("@/services/Teleconsultation"));
const Success = React.lazy(() => import("@/services/Success"));
const PatientProfile = React.lazy(() => import("@/services/PatientProfile"));
const AdminLayout = React.lazy(() => import("@/pages/admin/AdminLayout"));
const DashboardAdmin = React.lazy(() => import("@/pages/admin/DashboardAdmin"));
const DoctorsAdmin = React.lazy(() => import("@/pages/admin/DoctorsAdmin"));
const AppointmentsAdmin = React.lazy(() => import("@/pages/admin/AppointmentsAdmin"));
const TeleconsultationsAdmin = React.lazy(() => import("@/pages/admin/TeleconsultationsAdmin"));
const OrdersAdmin = React.lazy(() => import("@/pages/admin/OrdersAdmin"));
const TeleconsultationRoom = React.lazy(() => import("@/pages/TeleconsultationRoom"));
const DoctorDashboard = React.lazy(() => import("@/pages/doctor/DoctorDashboard"));
const DoctorLayout = React.lazy(() => import("@/pages/doctor/DoctorLayout"));
const DoctorAppointments = React.lazy(() => import("@/pages/doctor/DoctorAppointments"));
const DoctorTeleconsultations = React.lazy(() => import("@/pages/doctor/DoctorTeleconsultations"));
const DoctorProfile = React.lazy(() => import("@/pages/doctor/DoctorProfile"));
const AssistantChat = React.lazy(() => import("@/pages/AssistantChat"));

const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#155B5F]"></div>
  </div>
);

const ErrorBoundary = ({ children }) => {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleError = (error, errorInfo) => {
      console.error('Error caught by boundary:', error, errorInfo);
      setHasError(true);
      setError(error);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
          <p className="text-gray-600 mb-4">Please try refreshing the page</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[#155B5F] text-white rounded hover:bg-[#0F4A4D]"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return children;
};

const RoleProtectedRoute = ({ children, allowedRoles }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setIsAuthenticated(false);
          return;
        }
        
        const userData = await getUser();
        if (userData) {
          setIsAuthenticated(true);
          setUserRole(userData.role);
        } else {
          setIsAuthenticated(false);
          setUserRole(null);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuthenticated(false);
        setUserRole(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default function AppRouter() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const userData = await getUser();
          if (userData) {
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
          } else {
            setUser(null);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        } else {
          setUser(null);
          localStorage.removeItem('user');
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('admin');
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Add event listener for storage changes
    const handleStorageChange = (e) => {
      if (e.key === 'token' || e.key === 'user') {
        fetchData();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <ErrorBoundary>
      <Navbar userAuth={user} />
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Signup />} />

          {/* Protected user routes */}
          <Route path="/services" element={<RoleProtectedRoute allowedRoles={['user']}><Services /></RoleProtectedRoute>} />
          <Route path="/services/directory" element={<RoleProtectedRoute allowedRoles={['user']}><Directory /></RoleProtectedRoute>} />
          <Route path="/services/appointment" element={<RoleProtectedRoute allowedRoles={['user']}><Appointment /></RoleProtectedRoute>} />
          <Route path="/services/teleconsultation" element={<RoleProtectedRoute allowedRoles={['user']}><Teleconsultation /></RoleProtectedRoute>} />
          <Route path="/services/success" element={<RoleProtectedRoute allowedRoles={['user']}><Success /></RoleProtectedRoute>} />
          <Route path="/services/profile" element={<RoleProtectedRoute allowedRoles={['user']}><PatientProfile /></RoleProtectedRoute>} />
          <Route path="/services/morocareAssistant" element={<AssistantChat />} />
          
          {/* Protected doctor routes */}
          <Route path="/doctor" element={<RoleProtectedRoute allowedRoles={['doctor']}><DoctorLayout /></RoleProtectedRoute>}>
            <Route index element={<DoctorDashboard />} />
            <Route path="appointments" element={<DoctorAppointments />} />
            <Route path="teleconsultations" element={<DoctorTeleconsultations />} />
            <Route path="profile" element={<DoctorProfile />} />
          </Route>

          {/* Protected admin routes */}
          <Route path="/admin" element={<RoleProtectedRoute allowedRoles={['admin']}><AdminLayout /></RoleProtectedRoute>}>
            <Route index element={<DashboardAdmin />} />
            <Route path="doctors" element={<DoctorsAdmin />} />
            <Route path="appointments" element={<AppointmentsAdmin />} />
            <Route path="teleconsultations" element={<TeleconsultationsAdmin />} />
            <Route path="orders" element={<OrdersAdmin />} />
          </Route>

          {/* Other routes */}
          <Route path="/services/teleconsultation/room" element={<RoleProtectedRoute allowedRoles={['user', 'doctor']}><TeleconsultationRoom /></RoleProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      <Footer />
    </ErrorBoundary>
  );
}







