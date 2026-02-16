// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const API_ENDPOINTS = {
  AUTH: {
    ADMIN_LOGIN: `${API_BASE_URL}/api/auth/login`,
    USER_LOGIN: `${API_BASE_URL}/api/auth/user/login`,
    REGISTER: `${API_BASE_URL}/api/auth/user/register`,
    USERS: `${API_BASE_URL}/api/auth/users`,
    CREATE_USER: `${API_BASE_URL}/api/auth/user/create`
  }
};