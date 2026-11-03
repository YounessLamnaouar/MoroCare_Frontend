import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Feedback } from './app/Feedback';
import AppRouter from './router/AppRouter';
import { LocaleProvider } from './app/locale';
import { AuthProvider } from './app/auth';
import './app/styles.css';
export default function App() {
  return <LocaleProvider><AuthProvider><BrowserRouter><Toaster position="top-center" richColors closeButton duration={3500} /><Feedback/><AppRouter /></BrowserRouter></AuthProvider></LocaleProvider>;
}
