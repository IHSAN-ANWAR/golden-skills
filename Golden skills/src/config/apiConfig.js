// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const API_ENDPOINTS = {
  AUTH: {
    ADMIN_LOGIN: `${API_BASE_URL}/api/auth/login`,
    USER_LOGIN: `${API_BASE_URL}/api/auth/user/login`,
    REGISTER: `${API_BASE_URL}/api/auth/user/register`,
    USERS: `${API_BASE_URL}/api/auth/users`,
    CREATE_USER: `${API_BASE_URL}/api/auth/user/create`,
    GET_USER: (id) => `${API_BASE_URL}/api/auth/user/${id}`,
    UPDATE_USER: (id) => `${API_BASE_URL}/api/auth/user/${id}`,
    DELETE_USER: (id) => `${API_BASE_URL}/api/auth/user/${id}`,
    FORGOT_PASSWORD: `${API_BASE_URL}/api/auth/forgot-password`,
    RESET_PASSWORD: `${API_BASE_URL}/api/auth/reset-password`
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
    ASSIGN_ALL: `${API_BASE_URL}/api/user-tasks/assign-all`,
    UPDATE_STATUS: (id) => `${API_BASE_URL}/api/user-tasks/${id}`,
    GET_USER: (email) => `${API_BASE_URL}/api/user-tasks/user/${email}`,
    CHECK_ELIGIBILITY: (email) => `${API_BASE_URL}/api/user-tasks/check-eligibility/${email}`,
    REFERRAL_VERIFICATION: (id) => `${API_BASE_URL}/api/user-tasks/${id}/referral-verification`,
    GET_EARNINGS: (email) => `${API_BASE_URL}/api/user-tasks/earnings/${email}`
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
    CREATE: `${API_BASE_URL}/api/courses`,
    DELETE: (id) => `${API_BASE_URL}/api/courses/${id}`
  },
  PROMOTIONS: {
    GET_ALL: `${API_BASE_URL}/api/promotions`,
    GET_PUBLIC: `${API_BASE_URL}/api/promotions/public`,
    CREATE: `${API_BASE_URL}/api/promotions`,
    UPDATE: (id) => `${API_BASE_URL}/api/promotions/${id}`,
    DELETE: (id) => `${API_BASE_URL}/api/promotions/${id}`
  },
  USER_PROMOTIONS: {
    SUBMIT: `${API_BASE_URL}/api/user-promotions/submit`,
    GET_ALL: `${API_BASE_URL}/api/user-promotions`,
    GET_BY_ID: (id) => `${API_BASE_URL}/api/user-promotions/${id}`,
    UPDATE_PAYMENT: (id) => `${API_BASE_URL}/api/user-promotions/${id}/payment`,
    ASSIGN_TASKS: (id) => `${API_BASE_URL}/api/user-promotions/${id}/tasks`,
    UPDATE_TASK: (id, taskId) => `${API_BASE_URL}/api/user-promotions/${id}/tasks/${taskId}`,
    SUBMIT_TASK: (id, taskId) => `${API_BASE_URL}/api/user-promotions/${id}/tasks/${taskId}/submit`,
    APPROVE_REWARD: (id) => `${API_BASE_URL}/api/user-promotions/${id}/reward`,
    ASSIGN_RANK: (id) => `${API_BASE_URL}/api/user-promotions/${id}/rank`,
    DELETE: (id) => `${API_BASE_URL}/api/user-promotions/${id}`,
    GET_USER: (email) => `${API_BASE_URL}/api/user-promotions/user/${email}`
  },
  ACCOUNT_DETAILS: {
    GET_ALL: `${API_BASE_URL}/api/account-details`,
    GET_PUBLIC: `${API_BASE_URL}/api/account-details/public`,
    CREATE: `${API_BASE_URL}/api/account-details`,
    UPDATE: (id) => `${API_BASE_URL}/api/account-details/${id}`,
    DELETE: (id) => `${API_BASE_URL}/api/account-details/${id}`
  },
  ADMIN: {
    REFERRAL_TREE: `${API_BASE_URL}/api/auth/admin/referral-tree`
  },
  REFERRAL: {
    VALIDATE: `${API_BASE_URL}/api/auth/validate-referral`,
    MY_INFO: `${API_BASE_URL}/api/auth/user/referral-info`,
    STATS: (referralCode) => `${API_BASE_URL}/api/auth/user/referral-stats/${referralCode}`
  },
  TEAM: {
    VERIFY: `${API_BASE_URL}/api/team/verify`,
    GET_ALL_MEMBERS: `${API_BASE_URL}/api/team/members`,
    GET_BLACKLIST: `${API_BASE_URL}/api/team/blacklist`,
    ADD_TO_BLACKLIST: `${API_BASE_URL}/api/team/blacklist/add`,
    REMOVE_FROM_BLACKLIST: (id) => `${API_BASE_URL}/api/team/blacklist/${id}`,
    UPDATE_MEMBER: (userId) => `${API_BASE_URL}/api/team/member/${userId}`,
    GET_SEARCH_TRACKING: `${API_BASE_URL}/api/team/search-tracking`,
    DELETE_SEARCH_TRACKING: (id) => `${API_BASE_URL}/api/team/search-tracking/${id}`
  },
  FRAUD: {
    SUBMIT: `${API_BASE_URL}/api/fraud/report`,
    GET_ALL: `${API_BASE_URL}/api/fraud/reports`,
    UPDATE: (id) => `${API_BASE_URL}/api/fraud/report/${id}`,
    DELETE: (id) => `${API_BASE_URL}/api/fraud/report/${id}`
  },
  SETTINGS: {
    GET_WHATSAPP: `${API_BASE_URL}/api/settings/whatsapp`,
    UPDATE_WHATSAPP: `${API_BASE_URL}/api/settings/whatsapp`,
    GET_SOCIAL_LINKS: `${API_BASE_URL}/api/settings/social-links`,
    UPDATE_SOCIAL_LINKS: `${API_BASE_URL}/api/settings/social-links`,
    GET_NTN: `${API_BASE_URL}/api/settings/ntn`,
    UPDATE_NTN: `${API_BASE_URL}/api/settings/ntn`
  }
};