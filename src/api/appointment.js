import api from '@/api';

const API = '/api/appointments';

// Test function to check API connection
export const testAppointmentAPI = async () => {
  try {
    const response = await api.get(API);
    console.log('API connection test response:', response);
    return true;
  } catch (error) {
    console.error('API connection test failed:', error);
    return false;
  }
};

export const createAppointment = (data) => api.post(API, data);
export const getAppointments = () => api.get(API);
export const getAppointment = (id) => api.get(`${API}/${id}`);
export const updateAppointment = (id, data) => api.put(`${API}/${id}`, data);
export const deleteAppointment = (id) => api.delete(`${API}/${id}`);
export const updateAppointmentStatus = (id, status) => api.patch(`${API}/${id}/status`, { status });
