// Local Storage Configuration (No API needed - all data stored locally)
// API Configuration (Commented out - using local storage instead)
// export const API_CONFIG = {
//   BASE_URL: 'http://localhost:8080/api/v1',
//   TIMEOUT: 10000,
// };

// API Endpoints (Commented out - using local storage instead)
// export const API_ENDPOINTS = {
//   // Authentication
//   LOGIN: '/auth/login',
//   REGISTER: '/auth/register',
//   ADMIN_LOGIN: '/auth/admin/login',
//   REFRESH_TOKEN: '/auth/refresh',
//
//   // Users
//   USERS: '/users',
//   USER_PROFILE: '/users/profile',
//
//   // Tasks
//   TASKS: '/tasks',
//   TASK_BY_ID: (id: string) => `/tasks/${id}`,
//   TASKS_BY_QUADRANT: (quadrant: string) => `/tasks/quadrant/${quadrant}`,
//
//   // Admin
//   ADMIN_USERS: '/admin/users',
//   ADMIN_STATS: '/admin/stats',
// };

// Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'auth_token',
  USER: 'user_data',
  REFRESH_TOKEN: 'refresh_token',
};

// Eisenhower Matrix Quadrants
export const EISENHOWER_QUADRANTS = {
  URGENT_IMPORTANT: {
    key: 'URGENT_IMPORTANT',
    title: 'Do First',
    subtitle: 'Urgent & Important',
    color: '#FF6B6B',
  },
  NOT_URGENT_IMPORTANT: {
    key: 'NOT_URGENT_IMPORTANT',
    title: 'Schedule',
    subtitle: 'Important, Not Urgent',
    color: '#4ECDC4',
  },
  URGENT_NOT_IMPORTANT: {
    key: 'URGENT_NOT_IMPORTANT',
    title: 'Delegate',
    subtitle: 'Urgent, Not Important',
    color: '#45B7D1',
  },
  NOT_URGENT_NOT_IMPORTANT: {
    key: 'NOT_URGENT_NOT_IMPORTANT',
    title: 'Eliminate',
    subtitle: 'Neither Urgent nor Important',
    color: '#96CEB4',
  },
} as const;

// Task Priorities
export const TASK_PRIORITIES = {
  LOW: { label: 'Low', color: '#96CEB4', value: 'LOW' },
  MEDIUM: { label: 'Medium', color: '#FFEAA7', value: 'MEDIUM' },
  HIGH: { label: 'High', color: '#FD79A8', value: 'HIGH' },
  URGENT: { label: 'Urgent', color: '#E17055', value: 'URGENT' },
} as const;

// Task Statuses
export const TASK_STATUSES = {
  TODO: { label: 'To Do', color: '#74B9FF', value: 'TODO' },
  IN_PROGRESS: { label: 'In Progress', color: '#FDCB6E', value: 'IN_PROGRESS' },
  COMPLETED: { label: 'Completed', color: '#00B894', value: 'COMPLETED' },
  CANCELLED: { label: 'Cancelled', color: '#636E72', value: 'CANCELLED' },
} as const;
