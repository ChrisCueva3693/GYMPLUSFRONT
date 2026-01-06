import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add JWT token to all requests
apiClient.interceptors.request.use(
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

// Response interceptor - Handle errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Handle 401 Unauthorized - redirect to login
      if (error.response.status === 401) {
        // Avoid loop if already on login
        if (!window.location.pathname.includes('/login')) {
          // Optional: Import toast if possible or just use alert/console for now, 
          // but since this is a separate file, accessing React Toast is tricky without a custom event.
          // Let's simpler: just clear and redirect.
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login?expired=true';
        }
      }

      // Extract error message from response
      const message = error.response.data?.message || error.response.data?.error || 'Ha ocurrido un error';
      error.message = message;
    } else if (error.request) {
      error.message = 'No se pudo conectar con el servidor';
    }

    return Promise.reject(error);
  }
);

export default apiClient;
