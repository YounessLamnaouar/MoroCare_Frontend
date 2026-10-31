import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { Header, Footer, Workspace } from '@/app/layout';
import { useAuth } from '@/app/auth';
import { useLocale } from '@/app/locale';
import { Loading } from '@/app/ui';
const page = (module, name) => lazy(() => module().then(m => ({
  default: m[name]
})));
const publicModule = () => import('@/app/public-pages');
const careModule = () => import('@/app/care-pages');
const Home = page(publicModule, 'Home'),
  Services = page(publicModule, 'Services'),
  About = page(publicModule, 'About'),
  Contact = page(publicModule, 'Contact'),
  AuthPage = page(publicModule, 'AuthPage'),
  PasswordPage = page(publicModule, 'PasswordPage'),
  NotFound = page(publicModule, 'NotFound');
const Directory = page(careModule, 'Directory'),
  BookingForm = page(careModule, 'BookingForm'),
  BookingList = page(careModule, 'BookingList'),
  Profile = page(careModule, 'Profile'),
  Dashboard = page(careModule, 'Dashboard'),
  DoctorsAdmin = page(careModule, 'DoctorsAdmin'),
  ContactInbox = page(careModule, 'ContactInbox');
const ConsultationRoom = page(() => import('@/app/consultation'), 'ConsultationRoom'),
  Assistant = page(() => import('@/app/consultation'), 'Assistant');
class Boundary extends React.Component {
  state = {
    error: false
  };
  static getDerivedStateFromError() {
    return {
      error: true
    };
  }
  render() {
    return this.state.error ? this.props.fallback : this.props.children;
  }
}
function Failure() {
  const {
    t
  } = useLocale();
  return <div className="mc-empty"><h1>{t('Something went wrong')}</h1><button className="mc-button" onClick={() => window.location.reload()}>{t('Refresh page')}</button></div>;
}
function Protect({
  roles,
  children,
  password = false
}) {
  const {
      user,
      loading
    } = useAuth(),
    location = useLocation();
  if (loading) return <Loading />;
  if (!user) return <Navigate to="/login" state={{
    from: location.pathname
  }} replace />;
  if (user.must_change_password && !password) return <Navigate to="/change-password" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}
export default function AppRouter() {
  return <Boundary fallback={<Failure />}><Header /><Suspense fallback={<Loading />}><Routes>
        <Route path="/" element={<Home />} /><Route path="/about" element={<About />} /><Route path="/contact" element={<Contact />} /><Route path="/services" element={<Services />} /><Route path="/services/directory" element={<Directory />} /><Route path="/login" element={<AuthPage />} /><Route path="/register" element={<AuthPage register />} />
        <Route path="/change-password" element={<Protect password><PasswordPage /></Protect>} />
        <Route path="/services/profile" element={<Protect roles={['user']}><Profile /></Protect>} /><Route path="/services/appointment" element={<Protect roles={['user']}><BookingForm /></Protect>} /><Route path="/services/teleconsultation" element={<Protect roles={['user']}><BookingForm consultation /></Protect>} /><Route path="/services/morocareAssistant" element={<Protect roles={['user', 'doctor']}><Assistant /></Protect>} /><Route path="/services/teleconsultation/room" element={<Protect roles={['user', 'doctor']}><ConsultationRoom /></Protect>} /><Route path="/services/success" element={<Navigate to="/services/profile" replace />} /><Route path="/history" element={<Protect roles={['user']}><BookingList /></Protect>} />
        <Route path="/admin" element={<Protect roles={['admin']}><Workspace /></Protect>}><Route index element={<Dashboard />} /><Route path="doctors" element={<DoctorsAdmin />} /><Route path="appointments" element={<BookingList />} /><Route path="teleconsultations" element={<BookingList consultation />} /><Route path="messages" element={<ContactInbox />} /><Route path="orders" element={<Navigate to="/admin" replace />} /></Route>
        <Route path="/doctor" element={<Protect roles={['doctor']}><Workspace /></Protect>}><Route index element={<Dashboard />} /><Route path="appointments" element={<BookingList />} /><Route path="teleconsultations" element={<BookingList consultation />} /><Route path="profile" element={<Profile />} /></Route>
        <Route path="*" element={<NotFound />} /></Routes></Suspense><Footer /></Boundary>;
}
