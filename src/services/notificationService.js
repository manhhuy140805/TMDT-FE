import { api } from "../utils/api";

/**
 * Notification Service
 * GET    /notifications?skip=&take=
 * PUT    /notifications/:id/read
 * DELETE /notifications/:id
 */
const notificationService = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(query ? `/notifications?${query}` : "/notifications");
  },
  // params: { skip, take }

  // backward compat alias
  getByUserId: () => api.get("/notifications"),

  markAsRead: (id) => api.put(`/notifications/${id}/read`),

  delete: (id) => api.delete(`/notifications/${id}`),
};

export default notificationService;
