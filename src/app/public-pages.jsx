import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CalendarDays, MessageCircle, ShieldCheck, MapPin, Heart, ArrowRight, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import logo from '@/assets/logo-MoroCare-removebg-preview.png';
import appointmentImage from '@/assets/services/appointement.png';
import consultationImage from '@/assets/services/teleconsulation.png';
import directoryImage from '@/assets/services/directory.png';
import profileImage from '@/assets/services/patienProfile.png';
import assistantImage from '@/assets/services/AiAssistant.png';
const serviceImages = [appointmentImage, consultationImage, directoryImage, profileImage, assistantImage];
import background from '@/assets/landing2.png';
import { useLocale } from './locale';
import { useAuth, homeFor } from './auth';
import { api, errorText } from './client';
import { Page, Field, formValues, ErrorNotice } from './ui';
const serviceList = [['Book an appointment', 'Choose a doctor and request a time that works for you.', '/services/appointment', CalendarDays], ['Private consultation', 'Exchange messages with your doctor. Video is optional and requires your permission.', '/services/teleconsultation', MessageCircle], ['Directory', 'Browse by name, specialty, or city.', '/services/directory', MapPin], ['Your profile and bookings', 'Keep your contact details and follow your appointment requests.', '/services/profile', Heart], ['Health information assistant', 'General information to help you prepare for a consultation, never a diagnosis.', '/services/morocareAssistant', Sparkles]];
export function Home() {
  const {
    t
  } = useLocale();
  return <><section className="mc-hero" style={{
      backgroundImage: `linear-gradient(90deg,rgba(247,250,250,.96),rgba(247,250,250,.48)),url(${background})`
    }}><div><span className="mc-eyebrow">MoroCare · {t('Care that fits your day')}</span><h1>{t('Your health. A simpler next step.')}</h1><p>{t('Find a doctor, request an appointment, and talk privately with your care provider.')}</p><div className="mc-actions"><Link className="mc-button" to="/services/directory">{t('Find a doctor')}<ArrowRight size={18} /></Link><Link className="mc-button secondary" to="/services">{t('Explore services')}</Link></div></div></section><Services compact /></>;
}
export function Services({
  compact = false
}) {
  const {
    t
  } = useLocale();
  return <Page title={t(compact ? 'Care that fits your day' : 'Available services')} subtitle={t('Manage your care in one place.')}><div className="mc-service-grid">{serviceList.map(([title, description, url], index) => <Link className="mc-service mc-card mc-service-original" to={url} key={url}><img src={serviceImages[index]} alt="" loading="lazy" /><div className="mc-service-body"><h2>{t(title)}</h2><p>{t(description)}</p><span className="mc-button">{t("Explore services")} <ArrowRight size={16}/></span></div></Link>)}</div></Page>;
}
export function About() {
  const {
    t
  } = useLocale();
  return <Page title={t('About MoroCare')} subtitle={t('Closer to care, wherever you are.')}><div className="mc-about-intro"><div><span className="mc-eyebrow">MoroCare · Morocco</span><h2>{t('A clear path to care')}</h2><p>{t('MoroCare connects patients and doctors in Morocco through appointment requests and private online consultations.')}</p><Link className="mc-button" to="/services/directory">{t('Find a doctor')}</Link></div><div className="mc-about-mark" aria-hidden="true"><img src={logo} alt="" className="mc-about-logo" /></div></div><div className="mc-grid three">{[['Choose your doctor', 'Browse by name, specialty, or city.'], ['Request a time', 'Your doctor confirms your request before the consultation.'], ['Stay connected', 'Return to your account to follow appointments and private messages.']].map(([title, body], i) => <article className="mc-card" key={title}><span className="mc-step">0{i + 1}</span><h2>{t(title)}</h2><p>{t(body)}</p></article>)}</div><div className="mc-grid two mc-section-gap">{[['Privacy by design', 'Only you and your assigned doctor can access your consultation messages.', ShieldCheck], ['Honest information', 'We show available services without promising diagnoses or emergency care.', Heart]].map(([title, body, Icon]) => <article className="mc-card" key={title}><Icon className="mc-teal" /><h2>{t(title)}</h2><p>{t(body)}</p></article>)}</div><Emergency /></Page>;
}
export function Emergency() {
  const {
    t
  } = useLocale();
  return <aside className="mc-notice"><strong>{t('Not an emergency service')}</strong><p>{t('For urgent or severe symptoms, seek immediate in-person medical care.')}</p></aside>;
}
export function Contact() {
  const { user } = useAuth();
  const {
    t
  } = useLocale();
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [sent, setSent] = useState(false);
  async function submit(e) {
    e.preventDefault();
    const data = formValues(e),
      form = e.currentTarget;
    setBusy(true);
    setError('');
    setSent(false);
    try {
      await api.post('/contact', data);
      form.reset();
      setSent(true);
    } catch (e) {
      setError(errorText(e, t));
    } finally {
      setBusy(false);
    }
  }
  return <Page title={t('How can we help?')} subtitle={t('Questions about your account or using MoroCare? Send us a message.')}><div className="mc-contact-grid"><div><div className="mc-card mc-contact-note"><MessageCircle size={32} /><h2>{t('Contact support')}</h2><p>{t('For appointment changes, use your account or contact your doctor through your consultation.')}</p><Link to={user ? homeFor(user) : "/login"} className="mc-button secondary">{t('My account')}</Link></div><Emergency /></div><form className="mc-card mc-form" onSubmit={submit}><h2>{t('Send message')}</h2><p>{t('Do not include passwords or sensitive medical details in this form.')}</p>{error && <ErrorNotice message={error} />} {sent && <p className="mc-success" role="status">{t('Message received. Thank you.')}</p>}<Field label={t('Full name')} name="name" autoComplete="name" required maxLength={255} /><Field label={t('Email')} name="email" type="email" autoComplete="email" required maxLength={255} /><Field label={t('Message')}><textarea name="message" rows={6} required maxLength={5000} /></Field><button className="mc-button" disabled={busy}>{t(busy ? 'Sending...' : 'Send message')}</button></form></div></Page>;
}
export function AuthPage({
  register = false
}) {
  const {
      t
    } = useLocale(),
    {
      authenticate
    } = useAuth(),
    navigate = useNavigate();
  const [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  async function submit(e) {
    e.preventDefault();
    const data = formValues(e);
    if (register && data.password !== data.password_confirmation) {
      setError(t('Passwords do not match.'));
      return;
    }
    setBusy(true);
    setError('');
    try {
      const user = await authenticate(register ? '/register' : '/login', data);
      navigate(user.must_change_password ? '/change-password' : homeFor(user), {
        replace: true
      });
    } catch (e) {
      setError(!register && e.response?.status === 422 ? t('Email or password is incorrect.') : errorText(e, t));
    } finally {
      setBusy(false);
    }
  }
  return <section className="mc-auth"><form className="mc-card mc-form" onSubmit={submit}><span className="mc-eyebrow">MoroCare</span><h1>{t(register ? 'Patient registration' : 'Welcome back')}</h1>{register && <p>{t('Doctor accounts are created by an administrator.')}</p>}{error && <ErrorNotice message={error} />} {register && <Field label={t('Full name')} name="name" required maxLength={255} autoComplete="name" />}<Field label={t('Email')} name="email" type="email" required autoComplete="email" />{register && <><Field label={t('Phone')} name="phone" type="tel" required minLength={10} maxLength={30} autoComplete="tel" /><Field label={t('Date of birth')} name="birthday" type="date" required max={new Date(Date.now() - 86400000).toISOString().slice(0, 10)} /></>}<Field label={t('Password')} name="password" type="password" required minLength={register ? 12 : 1} maxLength={128} autoComplete={register ? 'new-password' : 'current-password'} />{register && <><small>{t('Use at least 12 characters.')}</small><Field label={t('Confirm password')} name="password_confirmation" type="password" required autoComplete="new-password" /></>}<button className="mc-button" disabled={busy}>{t(busy ? 'Loading...' : register ? 'Create account' : 'Login')}</button><p>{t(register ? 'Already have an account?' : 'New to MoroCare?')} <Link to={register ? '/login' : '/register'}>{t(register ? 'Login' : 'Sign up')}</Link></p></form></section>;
}
export function PasswordPage() {
  const {
      t
    } = useLocale(),
    {
      user,
      setUser
    } = useAuth(),
    navigate = useNavigate();
  const [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  async function submit(e) {
    e.preventDefault();
    const data = formValues(e);
    if (data.password !== data.password_confirmation) {
      setError(t('Passwords do not match.'));
      return;
    }
    setBusy(true);
    setError('');
    try {
      await api.put('/user/password', data);
      const {
        data: updated
      } = await api.get('/user');
      setUser(updated);
      toast.success(t('Password changed.'));
      navigate(homeFor(updated), {
        replace: true
      });
    } catch (e) {
      setError(errorText(e, t));
    } finally {
      setBusy(false);
    }
  }
  return <Page title={t('Change password')} subtitle={user?.must_change_password ? t('Change your temporary password to continue.') : undefined}><form className="mc-card mc-form mc-narrow" onSubmit={submit}>{error && <ErrorNotice message={error} />}<Field label={t('Current password')} name="current_password" type="password" required autoComplete="current-password" /><Field label={t('New password')} name="password" type="password" minLength={12} maxLength={128} required autoComplete="new-password" /><small>{t('Use at least 12 characters.')}</small><Field label={t('Confirm password')} name="password_confirmation" type="password" required autoComplete="new-password" /><button className="mc-button" disabled={busy}>{t('Change password')}</button></form></Page>;
}
export function NotFound() {
  const {
    t
  } = useLocale();
  return <Page title={t('Page not found')}><Link className="mc-button" to="/">{t('Return home')}</Link></Page>;
}
