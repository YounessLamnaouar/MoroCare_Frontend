import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Menu, X, LayoutDashboard, Users, CalendarDays, MessageCircle, UserRound, LogOut, Inbox } from 'lucide-react';
import { toast } from 'sonner';
import logo from '@/assets/logo-MoroCare-removebg-preview.png';
import { useLocale } from './locale';
import { homeFor, useAuth } from './auth';
import { errorText } from './client';
export function LanguagePicker() {
  const {
    language,
    setLanguage,
    t
  } = useLocale();
  return <select className="mc-language" aria-label={t('Language')} value={language} onChange={e => setLanguage(e.target.value)}><option value="en">English</option><option value="fr">Français</option><option value="ar">العربية</option></select>;
}
export function Header() {
  const {
      t
    } = useLocale(),
    {
      user,
      logout
    } = useAuth(),
    navigate = useNavigate();
  const [open, setOpen] = useState(false);
  async function signOut() {
    try {
      await logout();
      navigate('/login');
      setOpen(false);
    } catch (e) {
      toast.error(errorText(e, t));
    }
  }
  const links = [['Home', '/'], ['Services', '/services'], ['Directory', '/services/directory'], ['About us', '/about'], ['Contact', '/contact']];
  return <header className="mc-header"><div className="mc-header-inner"><Link to="/" aria-label="MoroCare"><img src={logo} alt="MoroCare" width="72" height="56" /></Link><nav className="mc-desktop-nav" aria-label={t('Menu')}>{links.map(([label, url]) => <NavLink key={url} to={url} end>{t(label)}</NavLink>)}</nav><div className="mc-header-actions"><LanguagePicker />{user ? <Link className="mc-account" to={homeFor(user)}>{t('My account')}</Link> : <Link className="mc-account" to="/login">{t('Login')}</Link>}<button className="mc-icon-button mc-menu-toggle" aria-label={t(open ? 'Close' : 'Menu')} aria-expanded={open} onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button></div></div>{open && <nav className="mc-mobile-nav">{links.map(([label, url]) => <Link key={url} to={url} onClick={() => setOpen(false)}>{t(label)}</Link>)}{user ? <button onClick={signOut}>{t('Logout')}</button> : <Link to="/register" onClick={() => setOpen(false)}>{t('Sign up')}</Link>}</nav>}</header>;
}
export function Footer() {
  const {
    t
  } = useLocale();
  return <footer className="mc-footer"><div><strong>MoroCare</strong><p>{t('Built for people in Morocco, on mobile and desktop.')}</p></div><nav><Link to="/about">{t('About us')}</Link><Link to="/contact">{t('Contact')}</Link><Link to="/services">{t('Services')}</Link></nav><small>© {new Date().getFullYear()} MoroCare. {t('All rights reserved.')}</small></footer>;
}
export function Workspace() {
  const {
      t
    } = useLocale(),
    {
      user,
      logout
    } = useAuth(),
    navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const admin = user.role === 'admin',
    base = admin ? '/admin' : '/doctor';
  const items = [['Dashboard', base, LayoutDashboard], ...(admin ? [['Doctors', `${base}/doctors`, Users]] : []), ['Appointments', `${base}/appointments`, CalendarDays], ['Consultations', `${base}/teleconsultations`, MessageCircle], ...(admin ? [['Messages', `${base}/messages`, Inbox]] : [['Profile', `${base}/profile`, UserRound]])];
  return <div className="mc-workspace"><button className="mc-workspace-toggle mc-button secondary" onClick={() => setOpen(!open)} aria-expanded={open}><Menu size={18} />{t(admin ? 'Admin workspace' : 'Doctor workspace')}</button><aside className={`mc-sidebar ${open ? 'is-open' : ''}`}><h2>{t(admin ? 'Admin workspace' : 'Doctor workspace')}</h2><nav>{items.map(([label, path, Icon]) => <NavLink key={path} to={path} end onClick={() => setOpen(false)}><Icon size={19} />{t(label)}</NavLink>)}</nav><button className="mc-button danger" onClick={async () => {
        try {
          await logout();
          navigate('/login');
        } catch (e) {
          toast.error(errorText(e, t));
        }
      }}><LogOut size={18} />{t('Logout')}</button></aside><main className="mc-workspace-content"><Outlet /></main></div>;
}
