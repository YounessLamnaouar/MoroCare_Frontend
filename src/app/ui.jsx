import { useLocale } from './locale-state';
export function Page({
  title,
  subtitle,
  children,
  action
}) {
  return <section className="mc-page"><div className="mc-page-heading"><div><h1>{title}</h1>{subtitle && <p>{subtitle}</p>}</div>{action}</div>{children}</section>;
}
export function Field({
  label,
  children,
  ...props
}) {
  return <label className="mc-field"><span>{label}</span>{children || <input {...props} />}</label>;
}
export function Loading() {
  const {
    t
  } = useLocale();
  return <div className="mc-empty" role="status">{t('Loading...')}</div>;
}
export function Empty({
  children
}) {
  return <div className="mc-empty">{children}</div>;
}
export function ErrorNotice({
  message,
  retry
}) {
  const {
    t
  } = useLocale();
  return <div role="alert" className="mc-notice mc-error">{message}{retry && <button type="button" className="mc-button secondary" onClick={retry}>{t('Try again')}</button>}</div>;
}
export function Status({
  value
}) {
  const {
    t
  } = useLocale();
  return <span className={`mc-status status-${value}`}>{t(value)}</span>;
}
export const formValues = event => Object.fromEntries(new FormData(event.currentTarget));
