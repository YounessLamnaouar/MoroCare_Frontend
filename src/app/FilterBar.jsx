import { useEffect, useState } from 'react';
import { Search, SlidersHorizontal, RotateCcw } from 'lucide-react';
import { useLocale } from './locale-state';
import { Field } from './ui';
import { notify } from './notifications';
export function FilterBar({
  value,
  onApply,
  selects = [],
  dateLabel = 'Created date',
  placeholder = 'Search'
}) {
  const {
      t
    } = useLocale(),
    [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value]);
  const change = (key, val) => setDraft(old => ({
    ...old,
    [key]: val
  }));
  return <form className="mc-filter-bar" onSubmit={e => {
    e.preventDefault();
    onApply({
      ...draft,
      q: (draft.q || '').trim()
    });
    notify('info', 'Filters applied.');
  }}><div className="mc-filter-search"><Field label={t('Search')}><div className="mc-search-control"><Search size={17} /><input type="search" value={draft.q || ''} onChange={e => change('q', e.target.value)} placeholder={t(placeholder)} maxLength={100} /></div></Field></div>{selects.map(field => <Field key={field.name} label={t(field.label)}><select value={draft[field.name] || ''} onChange={e => change(field.name, e.target.value)}><option value="">{t('All')}</option>{field.options.map(option => {
          const [key, label] = Array.isArray(option) ? option : [option, option];
          return <option value={key} key={key}>{t(label)}</option>;
        })}</select></Field>)}{dateLabel && <><Field label={`${t(dateLabel)} · ${t('From')}`}><input type="date" value={draft.from || ''} onChange={e => change('from', e.target.value)} max={draft.to || undefined} /></Field><Field label={`${t(dateLabel)} · ${t('To')}`}><input type="date" value={draft.to || ''} onChange={e => change('to', e.target.value)} min={draft.from || undefined} /></Field></>}<div className="mc-actions"><button className="mc-button"><SlidersHorizontal size={16} />{t('Apply filters')}</button><button type="button" className="mc-button secondary" onClick={() => {
        setDraft({});
        onApply({});
        notify('info', 'Filters reset.');
      }}><RotateCcw size={16} />{t('Reset')}</button></div></form>;
}
