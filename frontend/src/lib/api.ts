import axios, { AxiosError } from 'axios';
import toast from 'react-hot-toast';
import { store } from '../app/store';
import { logout, setCredentials } from '../features/auth/authSlice';

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api';

export const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach access token on every request.
api.interceptors.request.use((config) => {
  const token = store.getState().auth.accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;

// Handle 401 by attempting a single refresh, otherwise log out.
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<any>) => {
    const original = error.config as any;
    const status = error.response?.status;

    if (status === 401 && !original?._retry && store.getState().auth.refreshToken) {
      if (isRefreshing) {
        return Promise.reject(error);
      }
      original._retry = true;
      isRefreshing = true;
      try {
        const refreshToken = store.getState().auth.refreshToken;
        const { data } = await axios.post(`${baseURL}/auth/refresh`, { refreshToken });
        store.dispatch(setCredentials(data));
        isRefreshing = false;
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch (refreshErr) {
        isRefreshing = false;
        store.dispatch(logout());
        toast.error('Session expired. Please log in again.');
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(error);
  }
);

/** Extracts a human-readable message from an Axios error. */
export function apiError(err: unknown, fallback = 'Something went wrong'): string {
  const axiosErr = err as AxiosError<any>;
  return (
    axiosErr?.response?.data?.message ||
    axiosErr?.response?.data?.error ||
    axiosErr?.message ||
    fallback
  );
}
