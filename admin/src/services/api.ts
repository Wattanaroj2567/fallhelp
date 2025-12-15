import axios from 'axios';

import Logger from '../utils/logger';
import { validateAndLogConfig } from '../utils/configValidator';

// Read API URL from environment variable (Vite)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Validate configuration at startup
validateAndLogConfig({ API_URL });

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to attach the token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        Logger.debug(`API Request: ${config.method?.toUpperCase()} ${config.url}`, config.data);
        return config;
    },
    (error) => {
        Logger.error('API Request Error', error);
        return Promise.reject(error);
    }
);

// Add a response interceptor to handle 401 errors
api.interceptors.response.use(
    (response) => {
        Logger.debug(`API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
        return response;
    },
    (error) => {
        Logger.error(`API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, error.response?.data || error.message);

        if (error.response?.status === 401) {
            Logger.warn('Unauthorized access (401), redirecting to login');
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
