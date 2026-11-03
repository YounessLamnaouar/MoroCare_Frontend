import { useEffect, useState } from 'react';
import { api } from './client';
import { AuthContext } from './auth-state';
export function AuthProvider({
  children
}) {
  const [user, setUser] = useState(null),
    [loading, setLoading] = useState(true);
  useEffect(() => {
    // Retire the legacy persistent credential cache.
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    let active = true;
    if (sessionStorage.getItem('morocare-token')) api.get('/user').then(r => {
      if (active) setUser(r.data);
    }).catch(() => {}).finally(() => {
      if (active) setLoading(false);
    });else setLoading(false);
    const expired = () => setUser(null);
    window.addEventListener('auth-expired', expired);
    return () => {
      active = false;
      window.removeEventListener('auth-expired', expired);
    };
  }, []);
  const authenticate = async (endpoint, data) => {
    const response = await api.post(endpoint, data);
    sessionStorage.setItem('morocare-token', response.data.token);
    setUser(response.data.user);
    return response.data.user;
  };
  const logout = async () => {
    await api.post('/logout');
    sessionStorage.removeItem('morocare-token');
    setUser(null);
  };
  return <AuthContext.Provider value={{
    user,
    setUser,
    loading,
    authenticate,
    logout
  }}>{children}</AuthContext.Provider>;
}
