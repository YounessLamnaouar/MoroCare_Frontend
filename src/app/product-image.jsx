import { useEffect, useRef, useState } from 'react';
import { Package } from 'lucide-react';
import { useLocale } from './locale-state';
export function ProductImage({
  product,
  compact = false
}) {
  const [failed, setFailed] = useState(null);
  const url = product?.image_url;
  return <span className={compact ? 'mc-product-thumb' : 'mc-product-art'}>{url && failed !== url ? <img src={url} alt="" loading="lazy" onError={() => setFailed(url)} /> : <Package size={compact ? 22 : 54} />}</span>;
}
export function ProductImageField({
  product
}) {
  const {
      t
    } = useLocale(),
    [file, setFile] = useState(null),
    [preview, setPreview] = useState(null),
    [remove, setRemove] = useState(false);
  const input = useRef(null);
  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);
  return <div className="mc-product-upload"><ProductImage product={{
      image_url: remove ? null : preview || product?.image_url
    }} /><label className="mc-field"><span>{t('Product image')}</span><input ref={input} type="file" name="image" accept="image/jpeg,image/png,image/webp" onChange={e => {
        setFile(e.target.files[0] || null);
        setRemove(false);
      }} /><small>{t('JPG, PNG or WebP. Maximum 2 MB.')}</small></label>{product?.image_url && <label className="mc-checkbox"><input name="remove_image" type="checkbox" checked={remove} onChange={e => {
        setRemove(e.target.checked);
        if (e.target.checked) {
          setFile(null);
          if (input.current) input.current.value = '';
        }
      }} />{t('Remove current image')}</label>}</div>;
}
