import { notify } from './notifications';
import { FilterBar } from './FilterBar';
import { queryString, matchesFilters } from './filters';
import { useData } from './data';
import { Avatar, Person, PhotoInput } from './avatar';
import { useState, lazy, Suspense } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { CalendarDays, MessageCircle, Users, Plus, Search, ShieldCheck } from 'lucide-react';
import { api, errorText } from './client';
import { useLocale } from './locale-state';
import { useAuth } from './auth-state';
import { Page, Field, Loading, Empty, ErrorNotice, Status, formValues } from './ui';
const BookingChart = lazy(() => import('./booking-chart').then(m => ({
  default: m.BookingChart
})));
export function Directory() {
  const {
      t
    } = useLocale(),
    {
      data,
      error,
      load
    } = useData('/doctors');
  const [query, setQuery] = useState('');
  const filtered = (data || []).filter(d => [d.name, d.speciality, d.address].some(v => v?.toLocaleLowerCase().includes(query.toLocaleLowerCase())));
  return <Page title={t('Find a doctor')} subtitle={t('Browse by name, specialty, or city.')}><div className="mc-search"><Search size={20} /><input aria-label={t('Search')} placeholder={t('Search by name, specialty, or city')} value={query} onChange={e => setQuery(e.target.value)} /></div>{error ? <ErrorNotice message={errorText(error, t)} retry={load} /> : !data ? <Loading /> : !filtered.length ? <Empty>{t('No doctors found.')}</Empty> : <div className="mc-grid three">{filtered.map(d => <article className="mc-card mc-doctor-card" key={d.id}><h2><Person user={d} /></h2><p className="mc-teal">{t(d.speciality)}</p><p>{d.address || t('No contact details provided.')}</p><Link className="mc-button" to={`/services/appointment?doctor=${d.id}`}>{t('Book an appointment')}</Link><Link className="mc-text-link" to={`/services/teleconsultation?doctor=${d.id}`}>{t('Private consultation')}</Link></article>)}</div>}</Page>;
}
export function BookingForm({
  consultation = false
}) {
  const {
      t
    } = useLocale(),
    {
      user
    } = useAuth(),
    navigate = useNavigate(),
    [params] = useSearchParams();
  const {
    data: doctors,
    error,
    load
  } = useData('/doctors');
  const [busy, setBusy] = useState(false),
    [failure, setFailure] = useState('');
  async function submit(e) {
    e.preventDefault();
    const data = formValues(e);
    setBusy(true);
    setFailure('');
    try {
      await api.post(consultation ? '/teleconsultations' : '/appointments', {
        ...data,
        patient_id: user.id
      });
      navigate('/services/profile');
    } catch (e) {
      setFailure(errorText(e, t));
    } finally {
      setBusy(false);
    }
  }
  return <Page title={t(consultation ? 'Request consultation' : 'Request appointment')} subtitle={t('Your doctor confirms your request before the consultation.')}>{error ? <ErrorNotice message={errorText(error, t)} retry={load} /> : !doctors ? <Loading /> : <form className="mc-card mc-form mc-narrow" onSubmit={submit}>{failure && <ErrorNotice message={failure} />}<div className="mc-booking-doctors">{doctors.map(d => <div key={d.id}><Avatar user={d} /><span>{d.name}</span></div>)}</div><Field label={t('Doctor')}><select name="doctor_id" defaultValue={params.get('doctor') || ''} required><option value="">{t('Select a doctor')}</option>{doctors.map(d => <option value={d.id} key={d.id}>{d.name} — {t(d.speciality)}</option>)}</select></Field><div className="mc-grid two"><Field label={t('Date')} name="date" type="date" min={new Intl.DateTimeFormat('en-CA', {
          timeZone: 'Africa/Casablanca',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        }).format(new Date())} required /><Field label={t('Time')} name="time" type="time" step="1800" required /></div><small>{t('Times are in Morocco time.')}</small><Field label={t('Notes (optional)')}><textarea name="notes" maxLength={2000} rows={4} /></Field><button className="mc-button" disabled={busy || !doctors.length}>{t(busy ? 'Loading...' : consultation ? 'Request consultation' : 'Request appointment')}</button></form>}</Page>;
}
export function BookingList({
  consultation = false,
  embedded = false,
  filters: incomingFilters = null
}) {
  const {
      t,
      date
    } = useLocale(),
    {
      user
    } = useAuth();
  const path = consultation ? '/teleconsultations' : '/appointments';
  const {
    data,
    error,
    load
  } = useData(path);
  const [busy, setBusy] = useState(null),
    [page, setPage] = useState(1),
    [filters, setFilters] = useState({});
  const applied = incomingFilters || filters;
  const filtered = (data || []).filter(item => matchesFilters(applied, [item.patient?.name, item.doctor?.name, item.patient?.email], item.date, item.status));
  const sorted = [...filtered].sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`));
  const pages = Math.max(1, Math.ceil(sorted.length / 10)),
    current = Math.min(page, pages);
  async function update(item, status) {
    if (status === 'Canceled' && !window.confirm(t('Cancel this booking?'))) return;
    setBusy(item.id);
    try {
      await api.patch(`${path}/${item.id}/status`, {
        status
      });
      await load();
    } catch {/* The API interceptor reports this failure once. */} finally {
      setBusy(null);
    }
  }
  const body = <>{user.role === 'admin' && !embedded && <FilterBar value={filters} dateLabel="Scheduled date" onApply={next => {
      setFilters(next);
      setPage(1);
    }} selects={[{
      name: 'status',
      label: 'Status',
      options: ['Pending', 'Confirmed', 'Completed', 'Canceled']
    }]} />} {error ? <ErrorNotice message={errorText(error, t)} retry={load} /> : !data ? <Loading /> : !filtered.length ? <Empty>{t(data.length ? 'No results match your filters.' : 'No bookings yet.')}</Empty> : <><div className="mc-bookings">{sorted.slice((current - 1) * 10, current * 10).map(item => <article className="mc-card mc-booking" key={item.id}><div><h3><Person user={user.role === 'user' ? item.doctor : item.patient} /></h3><p>{date(item.date)} · <bdi>{item.time?.slice(0, 5)}</bdi></p>{user.role === 'admin' && <p className="mc-person-line">{t('Doctor')}: <Person user={item.doctor} /></p>}<Status value={item.status} />{item.notes && <p className="mc-note">{item.notes}</p>}</div><div className="mc-actions">{consultation && user.role !== 'admin' && ['Confirmed', 'Completed'].includes(item.status) && <Link className="mc-button" to={`/services/teleconsultation/room?session=${item.id}`}>{t('Open consultation')}</Link>}{user.role !== 'user' && item.status === 'Pending' && <button className="mc-button" disabled={busy === item.id} onClick={() => update(item, 'Confirmed')}>{t('Confirm')}</button>}{consultation && user.role !== 'user' && item.status === 'Confirmed' && <button className="mc-button secondary" disabled={busy === item.id} onClick={() => update(item, 'Completed')}>{t('Complete')}</button>}{['Pending', 'Confirmed'].includes(item.status) && <button className="mc-button secondary" disabled={busy === item.id} onClick={() => update(item, 'Canceled')}>{t('Cancel')}</button>}</div></article>)}</div><div className="mc-pagination"><button className="mc-button secondary" disabled={current <= 1} onClick={() => setPage(current - 1)}>{t('Previous')}</button><span>{t('Page {page}', {
            page: current
          })}</span><button className="mc-button secondary" disabled={current >= pages} onClick={() => setPage(current + 1)}>{t('Next')}</button></div></>}</>;
  return embedded ? <div>{body}</div> : <Page title={t(consultation ? 'Consultations' : 'Appointments')} subtitle={t('Times are in Morocco time.')}>{body}</Page>;
}
export function Dashboard() {
  const {
      t
    } = useLocale(),
    {
      user
    } = useAuth();
  const [filters, setFilters] = useState({});
  const appointments = useData('/appointments'),
    consultations = useData('/teleconsultations'),
    doctors = useData('/doctors');
  const error = appointments.error || consultations.error || doctors.error,
    base = user.role === 'admin' ? '/admin' : '/doctor';
  const filter = rows => (rows || []).filter(x => matchesFilters(filters, [x.patient?.name, x.doctor?.name, x.patient?.email], x.date, x.status));
  const a = filter(appointments.data),
    c = filter(consultations.data);
  const cards = [['Appointments', appointments.data ? a.length : undefined, CalendarDays, `${base}/appointments`], ['Pending requests', appointments.data ? a.filter(x => x.status === 'Pending').length : undefined, CalendarDays, `${base}/appointments`], ['Confirmed consultations', consultations.data ? c.filter(x => x.status === 'Confirmed').length : undefined, MessageCircle, `${base}/teleconsultations`], ...(user.role === 'admin' ? [['Active doctors', doctors.data?.filter(d => d.is_active !== false).length, Users, `${base}/doctors`]] : [])];
  return <Page title={<span className="mc-welcome"><Avatar user={user} /><span>{t('Welcome, {name}', {
        name: user.name
      })}</span></span>} subtitle={t('Manage your care in one place.')}>{user.role === 'admin' && <FilterBar value={filters} dateLabel="Scheduled date" onApply={setFilters} />} {error ? <ErrorNotice message={errorText(error, t)} retry={() => {
      appointments.load();
      consultations.load();
      doctors.load();
    }} /> : <div className="mc-stats">{cards.map(([label, count, Icon, url]) => <Link className="mc-card mc-stat" to={url} key={label}><div><span>{t(label)}</span><strong>{count ?? '—'}</strong></div><Icon /></Link>)}</div>}{appointments.data && consultations.data && <Suspense fallback={<Loading />}><BookingChart appointments={a} consultations={c} /></Suspense>}<h2 className="mc-section-heading">{t('Appointments')}</h2><BookingList embedded filters={filters} /></Page>;
}
export function Profile() {
  const {
      t
    } = useLocale(),
    {
      user,
      setUser,
      logout
    } = useAuth(),
    navigate = useNavigate();
  const [busy, setBusy] = useState(false),
    [tab, setTab] = useState('personal');
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const {
        data
      } = await api.post('/user/profile', (() => {
        const body = new FormData(e.target);
        body.set('_method', 'PUT');
        if (!body.get('photo')?.size) body.delete('photo');
        return body;
      })());
      setUser(data);
    } catch {/* The API interceptor reports this failure once. */} finally {
      setBusy(false);
    }
  }
  return <Page title={<span className="mc-welcome"><Avatar user={user} /><span>{t('Welcome, {name}', {
        name: user.name
      })}</span></span>} action={<button className="mc-button secondary" onClick={async () => {
    try {
      await logout();
      navigate('/login');
    } catch {/* The API interceptor reports this failure once. */}
  }}>{t('Logout')}</button>}><div className="mc-tabs" role="tablist">{[['personal', 'Personal details'], ...(user.role === 'user' ? [['appointments', 'Appointments'], ['consultations', 'Consultations']] : [])].map(([key, label]) => <button role="tab" aria-selected={tab === key} key={key} className={tab === key ? 'active' : ''} onClick={() => setTab(key)}>{t(label)}</button>)}</div>{tab === 'personal' ? <form className="mc-card mc-form mc-narrow" onSubmit={submit}><Avatar user={user} /><PhotoInput t={t} /><Field label={t('Full name')} name="name" defaultValue={user.name} required /><Field label={t('Email')} value={user.email} readOnly type="email" /><Field label={t('Phone')} name="phone" defaultValue={user.phone || ''} minLength={10} maxLength={30} type="tel" /><Field label={t('Date of birth')} name="birthday" type="date" defaultValue={user.birthday?.slice(0, 10) || ''} /><div className="mc-actions"><button className="mc-button" disabled={busy}>{t('Save')}</button><Link className="mc-button secondary" to="/change-password">{t('Change password')}</Link></div></form> : <BookingList key={tab} consultation={tab === 'consultations'} embedded />}</Page>;
}
function generatedPassword() {
  const values = crypto.getRandomValues(new Uint8Array(20));
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';
  return Array.from(values, v => alphabet[v % alphabet.length]).join('');
}
export function DoctorsAdmin() {
  const [filters, setFilters] = useState({});
  const specialties = useData('/specialities');
  const {
    t
  } = useLocale();
  const {
    data,
    error,
    load
  } = useData('/doctors');
  const [editing, setEditing] = useState(null),
    [busy, setBusy] = useState(false),
    [password, setPassword] = useState(''),
    [credentials, setCredentials] = useState(null),
    [failure, setFailure] = useState('');
  function open(d) {
    setEditing(d);
    setPassword('');
    setFailure('');
    setCredentials(null);
  }
  async function submit(e) {
    e.preventDefault();
    const values = formValues(e);
    if (!values.password) delete values.password;
    setBusy(true);
    setFailure('');
    try {
      if (editing.id) {
        await api.put(`/doctors/${editing.id}`, {
          ...values,
          is_active: editing.is_active
        });
      } else {
        await api.post('/doctors', values);
        setCredentials({
          email: values.email,
          password: values.password
        });
      }
      setEditing(null);
      setPassword('');
      await load();
    } catch (e) {
      setFailure(errorText(e, t));
    } finally {
      setBusy(false);
    }
  }
  async function toggle(d) {
    if (d.is_active && !window.confirm(t('Deactivate this doctor? Existing bookings will be kept.'))) return;
    setBusy(true);
    try {
      if (d.is_active) await api.delete(`/doctors/${d.id}`);else await api.put(`/doctors/${d.id}`, {
        ...d,
        is_active: true
      });
      await load();
    } catch {/* The API interceptor reports this failure once. */} finally {
      setBusy(false);
    }
  }
  const filtered = (data || []).filter(d => matchesFilters(filters, [d.name, d.email, d.speciality, d.address], d.created_at, d.is_active ? 'active' : 'inactive', d.speciality));
  return <Page title={t('Doctors')} action={<button className="mc-button" onClick={() => open({})}><Plus size={18} />{t('Add doctor')}</button>}><FilterBar value={filters} onApply={setFilters} selects={[{
      name: 'status',
      label: 'Status',
      options: [['active', 'Active'], ['inactive', 'Inactive']]
    }, {
      name: 'speciality',
      label: 'Specialty',
      options: specialties.data || []
    }]} />{credentials && <div className="mc-notice" role="status"><strong>{t('Doctor account created.')}</strong><p>{t('Share these credentials privately with the doctor. A password change is required at first login.')}</p><p>{t('Email')}: <bdi>{credentials.email}</bdi></p><p>{t('Temporary password')}: <code dir="ltr">{credentials.password}</code></p><button className="mc-button secondary" onClick={() => setCredentials(null)}>{t('Close')}</button></div>}{specialties.error && <ErrorNotice message={errorText(specialties.error, t)} retry={specialties.load} />} {editing && <form className="mc-card mc-form mc-section-gap" onSubmit={submit}><h2>{t(editing.id ? 'Edit doctor' : 'Add doctor')}</h2>{failure && <ErrorNotice message={failure} />}<div className="mc-grid two"><Field label={t('Full name')} name="name" defaultValue={editing.name || ''} required maxLength={255} /><Field label={t('Email')} name="email" type="email" defaultValue={editing.email || ''} required autoComplete="off" /><Field label={t('Specialty')}><select name="speciality" defaultValue={editing.speciality || ''} required disabled={!specialties.data}><option value="">{t('Select a specialty')}</option>{editing.speciality && !specialties.data?.includes(editing.speciality) && <option value={editing.speciality}>{editing.speciality}</option>}{(specialties.data || []).map(value => <option value={value} key={value}>{t(value)}</option>)}</select></Field><Field label={t('Address / city')} name="address" defaultValue={editing.address || ''} maxLength={255} /><Field label={t('Phone')} name="phone" defaultValue={editing.phone || ''} maxLength={30} /><Field label={t('Temporary password')} name="password" type="text" value={password} onChange={e => setPassword(e.target.value)} required={!editing.id} minLength={12} maxLength={128} autoComplete="off" /></div><button type="button" className="mc-button secondary" onClick={() => {
        setPassword(generatedPassword());
        notify('success', 'Temporary password generated.');
      }}>{t('Generate password')}</button><small>{t(editing.id ? 'Leave blank to keep the current password.' : 'Share these credentials privately with the doctor. A password change is required at first login.')}</small><div className="mc-actions"><button className="mc-button" disabled={busy}>{t('Save')}</button><button type="button" className="mc-button secondary" onClick={() => setEditing(null)}>{t('Cancel')}</button></div></form>}{error ? <ErrorNotice message={errorText(error, t)} retry={load} /> : !data ? <Loading /> : <div className="mc-table-scroll"><table><thead><tr>{['Name', 'Email', 'Specialty', 'Status', 'Actions'].map(v => <th key={v}>{t(v)}</th>)}</tr></thead><tbody>{filtered.map(d => <tr key={d.id}><td><Person user={d} /></td><td><bdi>{d.email}</bdi></td><td>{t(d.speciality)}</td><td>{t(d.is_active ? 'Active' : 'Inactive')}</td><td><div className="mc-actions"><button className="mc-button secondary" onClick={() => open(d)}>{t('Edit')}</button><button className="mc-button secondary" disabled={busy} onClick={() => toggle(d)}>{t(d.is_active ? 'Deactivate' : 'Reactivate')}</button></div></td></tr>)}</tbody></table>{!filtered.length && <Empty>{t('No results match your filters.')}</Empty>}</div>}</Page>;
}
export function ContactInbox() {
  const {
    t,
    date
  } = useLocale();
  const [page, setPage] = useState(1),
    [filters, setFilters] = useState({});
  const {
    data,
    error,
    load
  } = useData(`/contact?${queryString({
    page,
    ...filters
  })}`);
  return <Page title={t('Contact messages')}><FilterBar value={filters} onApply={next => {
      setFilters(next);
      setPage(1);
    }} />{error ? <ErrorNotice message={errorText(error, t)} retry={load} /> : !data ? <Loading /> : !data.data.length ? <Empty>{t('No results match your filters.')}</Empty> : <><div className="mc-grid two">{data.data.map(m => <article className="mc-card" key={m.id}><h2><Person name={m.name} /></h2><p><bdi>{m.email}</bdi> · {date(m.created_at)}</p><p className="mc-message-body">{m.message}</p></article>)}</div><div className="mc-pagination"><button className="mc-button secondary" disabled={page <= 1} onClick={() => setPage(page - 1)}>{t('Previous')}</button><span>{t('Page {page}', {
            page
          })}</span><button className="mc-button secondary" disabled={page >= data.last_page} onClick={() => setPage(page + 1)}>{t('Next')}</button></div></>}</Page>;
}
