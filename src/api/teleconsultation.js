import axios from 'axios';

const API = 'http://localhost:8000/api/teleconsultations';

// Create axios instance with default config
const axiosInstance = axios.create({
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Test function to check API connection
export const testTeleconsultationAPI = async () => {
  try {
    const response = await axiosInstance.get(API);
    console.log('API connection test response:', response);
    return true;
  } catch (error) {
    console.error('API connection test failed:', error);
    return false;
  }
};

export const createTeleconsultation = (data) => axiosInstance.post(API, data);
export const getTeleconsultations = () => axiosInstance.get(API);
export const getTeleconsultation = (id) => axiosInstance.get(`${API}/${id}`);
export const updateTeleconsultation = (id, data) => axiosInstance.put(`${API}/${id}`, data);
export const deleteTeleconsultation = (id) => axiosInstance.delete(`${API}/${id}`);
export const updateTeleconsultationStatus = (id, status) => 
  axiosInstance.patch(`${API}/${id}/status`, { status }); 