import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Requests (keeping API endpoints as /tickets for backend compatibility)
export const ticketsApi = {
  getAll: (params) => axios.get(`${API_URL}/tickets`, { params }),
  getById: (id) => axios.get(`${API_URL}/tickets/${id}`),
  create: (data) => axios.post(`${API_URL}/tickets`, data),
  update: (id, data) => axios.patch(`${API_URL}/tickets/${id}`, data),
  delete: (id) => axios.delete(`${API_URL}/tickets/${id}`),
  addComment: (id, data) => axios.post(`${API_URL}/tickets/${id}/comments`, data),
  getStats: () => axios.get(`${API_URL}/tickets/stats`),
};

// Alias for clearer usage in code
export const requestsApi = ticketsApi;

// Users
export const usersApi = {
  getAll: (params) => axios.get(`${API_URL}/users`, { params }),
  getById: (id) => axios.get(`${API_URL}/users/${id}`),
  create: (data) => axios.post(`${API_URL}/users`, data),
  update: (id, data) => axios.patch(`${API_URL}/users/${id}`, data),
  delete: (id) => axios.delete(`${API_URL}/users/${id}`),
  changePassword: (data) => axios.post(`${API_URL}/users/change-password`, data),
  resetPassword: (id, data) => axios.post(`${API_URL}/users/${id}/reset-password`, data),
};

// Categories
export const categoriesApi = {
  getAll: () => axios.get(`${API_URL}/categories`),
  create: (data) => axios.post(`${API_URL}/categories`, data),
  update: (id, data) => axios.patch(`${API_URL}/categories/${id}`, data),
  delete: (id) => axios.delete(`${API_URL}/categories/${id}`),
};

// Notifications
export const notificationsApi = {
  getAll: (params) => axios.get(`${API_URL}/notifications`, { params }),
  getUnreadCount: () => axios.get(`${API_URL}/notifications/unread-count`),
  markAsRead: (id) => axios.patch(`${API_URL}/notifications/${id}/read`),
  markAllAsRead: () => axios.post(`${API_URL}/notifications/mark-all-read`),
};

export default {
  tickets: ticketsApi,
  users: usersApi,
  categories: categoriesApi,
  notifications: notificationsApi,
};


