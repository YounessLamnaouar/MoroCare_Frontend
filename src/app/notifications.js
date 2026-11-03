export function notify(type, key, error) { window.dispatchEvent(new CustomEvent('morocare-feedback',{detail:{type,key,error}})); }
