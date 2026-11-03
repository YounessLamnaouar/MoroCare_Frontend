import { createContext, useContext } from 'react';
export const AuthContext = createContext(null);
export function useAuth() { return useContext(AuthContext); }
export const homeFor = user => user?.role === 'admin' ? '/admin' : user?.role === 'doctor' ? '/doctor' : '/services/profile';
