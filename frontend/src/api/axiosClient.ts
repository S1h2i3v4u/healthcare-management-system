import axios from 'axios';

// Base client every other api/*.ts file will use. Two interceptors here:
// one attaches the JWT to every outgoing request automatically, the other
// catches 401s globally so an expired/invalid token logs the user out
// cleanly instead of every single component needing its own error handling
// for "my token stopped working."
const axiosClient = axios.create({
  baseURL: '/api', // proxied to localhost:8080 by vite.config.ts in dev
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired/invalid — clear it and force back to login. A hard
      // redirect (not React Router navigation) is deliberate here: this
      // interceptor runs outside any component's render context, so it
      // doesn't have access to the router's navigate() function. This is
      // a known, reasonable tradeoff for a global interceptor.
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export default axiosClient;