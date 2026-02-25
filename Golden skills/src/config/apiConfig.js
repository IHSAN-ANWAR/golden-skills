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
  COURSE_PLANS: {
    GET_ALL: `${API_BASE_URL}/api/course-plans`,
    GET_BY_ID: (id) => `${API_BASE_URL}/api/course-plans/${id}`,
    CREATE: `${API_BASE_URL}/api/course-plans`,
    UPDATE: (id) => `${API_BASE_URL}/api/course-plans/${id}`,
    DELETE: (id) => `${API_BASE_URL}/api/course-plans/${id}`
  },
  COURSE_PLAN_SUBMISSIONS: {
    SUBMIT: `${API_BASE_URL}/api/course-plan-submissions/submit`,
    GET_ALL: `${API_BASE_URL}/api/course-plan-submissions`,
    GET_BY_ID: (id) => `${API_BASE_URL}/api/course-plan-submissions/${id}`,
    UPDATE_STATUS: (id) => `${API_BASE_URL}/api/course-plan-submissions/${id}`,
    DELETE: (id) => `${API_BASE_URL}/api/course-plan-submissions/${id}`,
    GET_USER: (userId) => `${API_BASE_URL}/api/course-plan-submissions/user/${userId}`
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
  },
  USER_COURSE_COMPLETIONS: {
    SUBMIT: `${API_BASE_URL}/api/user-course-completions/submit`,
    GET_ALL: `${API_BASE_URL}/api/user-course-completions/all`,
    GET_PENDING: `${API_BASE_URL}/api/user-course-completions/pending`,
    GET_SUBMITTED: `${API_BASE_URL}/api/user-course-completions/submitted`,
    UPDATE_STATUS: (id) => `${API_BASE_URL}/api/user-course-completions/${id}/status`,
    GET_USER_ASSIGNED: (userId) => `${API_BASE_URL}/api/user-course-completions/user/${userId}/assigned`,
    GET_USER_COMPLETIONS: (userId) => `${API_BASE_URL}/api/user-course-completions/user/${userId}`
  },
  COURSES: {
    GET_ALL: `${API_BASE_URL}/api/courses`,
    GET_BY_ID: (id) => `${API_BASE_URL}/api/courses/${id}`,
    GET_QUIZ: (id) => `${API_BASE_URL}/api/courses/${id}/quiz`,
    CREATE: `${API_BASE_URL}/api/courses`,
    UPDATE_QUIZ: (id) => `${API_BASE_URL}/api/courses/${id}/quiz`,
    DELETE: (id) => `${API_BASE_URL}/api/courses/${id}`
  }
};