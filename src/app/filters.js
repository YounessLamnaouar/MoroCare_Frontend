export function queryString(values) {return new URLSearchParams(Object.entries(values).filter(([,v])=>v!=='' && v!==undefined && v!==null)).toString();}
const normalize = value => String(value||'').normalize('NFD').replace(/\p{Diacritic}/gu,'').toLocaleLowerCase();
export function matchesFilters(filters, text, date='', status='', speciality='') {
 const day=(date||'').slice(0,10);
 return (!filters.q||normalize(text.join(' ')).includes(normalize(filters.q))) && (!filters.from||day>=filters.from) && (!filters.to||day<=filters.to) && (!filters.status||status===filters.status) && (!filters.speciality||speciality===filters.speciality);
}
