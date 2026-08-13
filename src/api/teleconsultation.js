import api from '@/api';

const API = '/api/teleconsultations';

// Test function to check API connection
export const testTeleconsultationAPI = async () => {
  try {
    const response = await api.get(API);
    console.log('API connection test response:', response);
    return true;
  } catch (error) {
    console.error('API connection test failed:', error);
    return false;
  }
};

export const createTeleconsultation = (data) => api.post(API, data);
export const getTeleconsultations = () => api.get(API);
export const getTeleconsultation = (id) => api.get(`${API}/${id}`);
export const updateTeleconsultation = (id, data) => api.put(`${API}/${id}`, data);
export const deleteTeleconsultation = (id) => api.delete(`${API}/${id}`);
export const updateTeleconsultationStatus = (id, status) => 
  api.patch(`${API}/${id}/status`, { status });
