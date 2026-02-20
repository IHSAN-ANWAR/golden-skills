// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const API_ENDPOINTS = {
  AUTH: {
    ADMIN_LOGIN: `${API_BASE_URL}/api/auth/login`,
    USER_LOGIN: `${API_BASE_URL}/api/auth/user/login`,
    REGISTER: `${API_BASE_URL}/api/auth/user/register`,
    USERS: `${API_BASE_URL}/api/auth/users`,
    CREATE_USER: `${API_BASE_URL}/api/auth/user/create`
  },
  PLANS: {
    GET_ALL: `${API_BASE_URL}/api/plans`,
    CREATE: `${API_BASE_URL}/api/plans`,
    UPDATE: (id) => `${API_BASE_URL}/api/plans/${id}`,
    DELETE: (id) => `${API_BASE_URL}/api/plans/${id}`
  },
  SUBMISSIONS: {
    SUBMIT: `${API_BASE_URL}/api/submissions`,
    GET_ALL: `${API_BASE_URL}/api/submissions`,
    GET_BY_ID: (id) => `${API_BASE_URL}/api/submissions/${id}`,
    UPDATE_STATUS: (id) => `${API_BASE_URL}/api/submissions/${id}`,
    DELETE: (id) => `${API_BASE_URL}/api/submissions/${id}`
  },
  TASKS: {
    GET_ALL: `${API_BASE_URL}/api/admin/all`,
    CREATE: `${API_BASE_URL}/api/admin/create`,
    UPDATE: (id) => `${API_BASE_URL}/api/admin/update/${id}`,
    DELETE: (id) => `${API_BASE_URL}/api/admin/delete/${id}`
  },
  USER_TASKS: {
    GET_ALL: `${API_BASE_URL}/api/user-tasks`,
    ASSIGN: `${API_BASE_URL}/api/user-tasks/assign`,
    UPDATE_STATUS: (id) => `${API_BASE_URL}/api/user-tasks/${id}`
  },
  COURSE_LINKS: {
    SEND: `${API_BASE_URL}/api/course-links/send`,
    GET_ALL: `${API_BASE_URL}/api/course-links`
  }
};