import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';
import AppRouter from './router/AppRouter';
import { LocaleProvider } from './app/locale';
import { AuthProvider } from './app/auth';
import './app/styles.css';
export default function App() {
  return <LocaleProvider><AuthProvider><BrowserRouter><Toaster position="top-center" richColors /><AppRouter /></BrowserRouter></AuthProvider></LocaleProvider>;
}
