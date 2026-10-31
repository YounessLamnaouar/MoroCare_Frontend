import { useState } from 'react';
export function Avatar({user}) { const [failed, setFailed] = useState(null); return user?.photo_url && failed !== user.photo_url ? <img className="mc-profile-photo" src={user.photo_url} alt="" onError={()=>setFailed(user.photo_url)}/> : <span className="mc-avatar">{user?.name?.slice(0,1)}</span>; }
export function PhotoInput({t}) { return <label className="mc-field">{t('Profile photo')}<input type="file" name="photo" accept="image/jpeg,image/png,image/webp"/><small>{t('JPG, PNG or WebP. Maximum 2 MB. Visible to other users.')}</small></label>; }
