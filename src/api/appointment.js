import axios from 'axios';

const API = 'https://morocarebackend-production.up.railway.app/api/appointments';

// Create axios instance with default config
const axiosInstance = axios.create({
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Test function to check API connection
export const testAppointmentAPI = async () => {
  try {
    const response = await axiosInstance.get(API);
    console.log('API connection test response:', response);
    return true;
  } catch (error) {
    console.error('API connection test failed:', error);
    return false;
  }
};

export const createAppointment = (data) => axiosInstance.post(API, data);
export const getAppointments = () => axiosInstance.get(API);
export const getAppointment = (id) => axiosInstance.get(`${API}/${id}`);
export const updateAppointment = (id, data) => axiosInstance.put(`${API}/${id}`, data);
export const deleteAppointment = (id) => axiosInstance.delete(`${API}/${id}`); 