import { useEffect } from 'react';
import { toast } from 'sonner';
import { useLocale } from './locale-state';
import { errorText } from './client';
export function Feedback() {
  const {
    t
  } = useLocale();
  useEffect(() => {
    const show = event => {
      const {
        type,
        key,
        error
      } = event.detail;
      toast[type === 'error' ? 'error' : type === 'info' ? 'info' : 'success'](error ? errorText(error, t) : t(key));
    };
    window.addEventListener('morocare-feedback', show);
    return () => window.removeEventListener('morocare-feedback', show);
  }, [t]);
  return null;
}
