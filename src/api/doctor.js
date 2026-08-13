import axios from 'axios';

const API = 'https://morocarebackend-production.up.railway.app/api/doctors';

// Create axios instance with default config
const axiosInstance = axios.create({
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

export const getDoctors = () => axiosInstance.get(API);
export const getDoctor = (id) => axiosInstance.get(`${API}/${id}`);
export const createDoctor = (data) => axiosInstance.post(API, data);
export const updateDoctor = (id, data) => axiosInstance.put(`${API}/${id}`, data);
export const deleteDoctor = (id) => axiosInstance.delete(`${API}/${id}`);
export const searchDoctors = (query) =>
  axiosInstance.get(`${API}?q=${encodeURIComponent(query.trim())}`);
