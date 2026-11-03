import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useLocale } from './locale-state';
export function BookingChart({
  appointments,
  consultations
}) {
  const {
    t,
    language
  } = useLocale();
  const [months, setMonths] = useState(6);
  const today = new Date(new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Africa/Casablanca',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date()) + 'T12:00:00');
  const data = Array.from({
    length: months
  }, (_, i) => {
    const d = new Date(today.getFullYear(), today.getMonth() - months + 1 + i, 1, 12);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    return {
      key,
      label: new Intl.DateTimeFormat(language, {
        month: 'short',
        year: '2-digit'
      }).format(d),
      appointments: appointments.filter(x => x.date.slice(0, 7) === key).length,
      consultations: consultations.filter(x => x.date.slice(0, 7) === key).length
    };
  });
  return <section className="mc-card mc-section-gap mc-chart"><div className="mc-page-heading"><div><h2>{t('Appointments and consultations')}</h2><p>{t('Monthly counts by scheduled date, including canceled bookings.')}</p></div><label>{t('Period')} <select value={months} onChange={e => setMonths(Number(e.target.value))}><option value={6}>{t('Last 6 months')}</option><option value={12}>{t('Last 12 months')}</option></select></label></div><div style={{
      height: 290,
      width: '100%',
      minWidth: 0
    }} role="img" aria-label={t('Appointments and consultations')}><ResponsiveContainer width="100%" height="100%"><AreaChart data={data} accessibilityLayer><defs><linearGradient id="mc-appointments-area" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#155b5f" stopOpacity={0.4} /><stop offset="100%" stopColor="#155b5f" stopOpacity={0.03} /></linearGradient><linearGradient id="mc-consultations-area" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#96c1b9" stopOpacity={0.6} /><stop offset="100%" stopColor="#96c1b9" stopOpacity={0.03} /></linearGradient></defs><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="label" tick={{
            fontSize: 12
          }} /><YAxis allowDecimals={false} width={32} /><Tooltip /><Legend /><Area type="monotone" dataKey="appointments" name={t('Appointments')} stroke="#155b5f" strokeWidth={2.5} fill="url(#mc-appointments-area)" /><Area type="monotone" dataKey="consultations" name={t('Consultations')} stroke="#75a69b" strokeWidth={2.5} fill="url(#mc-consultations-area)" /></AreaChart></ResponsiveContainer></div><details><summary>{t('View chart data')}</summary><div className="mc-table-scroll"><table><thead><tr><th>{t('Month')}</th><th>{t('Appointments')}</th><th>{t('Consultations')}</th></tr></thead><tbody>{data.map(row => <tr key={row.key}><td>{row.label}</td><td>{row.appointments}</td><td>{row.consultations}</td></tr>)}</tbody></table></div></details></section>;
}
