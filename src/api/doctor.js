import api from '@/api';

const API = '/api/doctors';

export const getDoctors = () => api.get(API);
export const getDoctor = (id) => api.get(`${API}/${id}`);
export const createDoctor = (data) => api.post(API, data);
export const updateDoctor = (id, data) => api.put(`${API}/${id}`, data);
export const deleteDoctor = (id) => api.delete(`${API}/${id}`);
export const searchDoctors = (query) =>
  api.get(`${API}?q=${encodeURIComponent(query.trim())}`);
