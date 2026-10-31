import axios from 'axios';

const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/api\/?$/, '').replace(/\/$/, '');

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  },
  withCredentials: false,
  timeout: 15000
});

// Add request interceptor to add auth token and CSRF token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const login = async (credentials) => {
  try {
    // console.log(credentials)
    const response = await api.post('/api/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const register = async (userData) => {
  try {
    const response = await api.post('/api/register', userData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

export const logout = async () => {
  await api.post('/api/logout');
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
};

export const getUser = async () => {
  try {
    const response = await api.get('/api/user');
    if (response.data) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
};
export const updateProfile = async (profileData) => {
  try {
    const response = await api.put('/api/user/profile', profileData);
    return response.data;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

export const updatePassword = async (passwordData) => {
  try {
    const response = await api.put('/api/user/password', passwordData);
    return response.data;
  } catch (error) {
    console.error('Error updating password:', error);
    throw error;
  }
};

export const deleteAccount = async () => {
  try {
    const response = await api.delete('/api/user');
    return response.data;
  } catch (error) {
    console.error('Error deleting account:', error);
    throw error;
  }
};

export const getAppointments = async () => {
  try {
    const response = await api.get('/api/appointments');
    return response.data;
  } catch (error) {
    console.error('Error fetching appointments:', error);
    throw error;
  }
};

export const createAppointment = async (appointmentData) => {
  try {
    const response = await api.post('/api/appointments', appointmentData);
    return response.data;
  } catch (error) {
    console.error('Error creating appointment:', error);
    throw error;
  }
};

export const getTeleconsultations = async () => {
  try {
    const response = await api.get('/api/teleconsultations');
    return response.data;
  } catch (error) {
    console.error('Error fetching teleconsultations:', error);
    throw error;
  }
};

export const getUserTeleconsultations = async () => {
  try {
    const response = await api.get('/api/user/teleconsultations');
    return response.data;
  } catch (error) {
    console.error('Error fetching user teleconsultations:', error);
    throw error;
  }
};

export const createTeleconsultation = async (teleconsultationData) => {
  try {
    const response = await api.post('/api/teleconsultations', teleconsultationData);
    return response.data;
  } catch (error) {
    console.error('Error creating teleconsultation:', error);
    throw error;
  }
};

export const getDoctors = async () => {
  try {
    const response = await api.get('/api/doctors');
    return response.data;
  } catch (error) {
    console.error('Error fetching doctors:', error);
    throw error;
  }
};

export const getDoctor = async (id) => {
  try {
    const response = await api.get(`/api/doctors/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching doctor:', error);
    throw error;
  }
};

export default api;
