import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach access token to headers
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

// Keep track of refresh state to prevent multiple simultaneous refresh calls
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response Interceptor: Handle standardized API responses and global error codes
api.interceptors.response.use(
  (response) => {
    // Return data object directly for convenient access
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;
    const message = error.response?.data?.message || 'Something went wrong';

    // Prevent retry loops for login or refresh calls
    const isAuthRoute = originalRequest?.url?.includes('/auth/login') || originalRequest?.url?.includes('/auth/refresh');

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthRoute) {
      const refreshToken = localStorage.getItem('refreshToken');

      if (refreshToken) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return api(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const res = await axios.post('/api/auth/refresh', { refreshToken });
          
          if (res.data?.success) {
            const { accessToken: newToken, refreshToken: newRefreshToken } = res.data.data;
            localStorage.setItem('token', newToken);
            if (newRefreshToken) {
              localStorage.setItem('refreshToken', newRefreshToken);
            }

            api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
            originalRequest.headers.Authorization = `Bearer ${newToken}`;

            processQueue(null, newToken);
            return api(originalRequest);
          }
        } catch (refreshErr) {
          processQueue(refreshErr, null);
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
          return Promise.reject(refreshErr);
        } finally {
          isRefreshing = false;
        }
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject({
      message,
      status: error.response?.status,
      errors: error.response?.data?.errors || [],
      originalError: error,
    });
  }
);

export default api;
