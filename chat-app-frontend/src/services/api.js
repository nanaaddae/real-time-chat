import axios from 'axios';

const API_BASE_URL = 'https://real-time-chat-0ty1.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Create holders for show/hide actions
let activeRequests = 0;
let showGlobalLoader = () => {};
let hideGlobalLoader = () => {};

// Export a binder function to connect React to this plain JS file
export const bindInterceptorsToLoader = (show, hide) => {
  showGlobalLoader = show;
  hideGlobalLoader = hide;
};

api.interceptors.request.use((config) => {
  if (activeRequests === 0) {
    showGlobalLoader("Waking up backend server, please wait...");
  }
  activeRequests++;

  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  activeRequests--;
  if (activeRequests === 0) hideGlobalLoader();
  return Promise.reject(error);
});

api.interceptors.response.use((response) => {
  activeRequests--;
  if (activeRequests === 0) hideGlobalLoader();
  return response;
}, (error) => {
  activeRequests--;
  if (activeRequests === 0) hideGlobalLoader();
  
  if (error.response?.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }
  return Promise.reject(error);
});

export default api;