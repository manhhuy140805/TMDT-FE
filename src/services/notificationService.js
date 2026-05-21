import { api } from "../utils/api";

/**
 * Notification Service
 * GET    /notifications?userId=&skip=&take=
 * PUT    /notifications/:id/read
 * DELETE /notifications/:id
 */
const notificationService = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(query ? `/notifications?${query}` : "/notifications");
  },

  getByUserId: (userId, params = {}) => {
    const query = new URLSearchParams({ userId, ...params }).toString();
    return api.get(`/notifications?${query}`);
  },

  markAsRead: (id) => api.put(`/notifications/${id}/read`),

  delete: (id) => api.delete(`/notifications/${id}`),
};

export default notificationService;
