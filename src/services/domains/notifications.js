/**
 * Notifications API Domain
 */

import { api as http } from "../../utils/api";
import { apiResponse, unwrapData, normalizeArray } from "./utils";

const notificationsAPI = {
  getByUserId: async (userId) => {
    try {
      const payload = await http.get(`/notifications?userId=${userId}`);
      return apiResponse(normalizeArray(payload));
    } catch (error) {
      return apiResponse([], false, error.message || "API Error");
    }
  },

  getUnreadCount: async (userId) => {
    try {
      const payload = await http.get(`/notifications?userId=${userId}`);
      const items = normalizeArray(payload);
      const unread = items.filter((n) => !n.read && !n.daDoc).length;
      return apiResponse({ count: unread });
    } catch (error) {
      return apiResponse({ count: 0 }, false, error.message || "API Error");
    }
  },

  markAsRead: async (id) => {
    try {
      const payload = await http.put(`/notifications/${id}/read`, {});
      return apiResponse(unwrapData(payload), true, "Đánh dấu đã đọc");
    } catch (error) {
      return apiResponse(null, false, error.message || "API Error");
    }
  },

  markAllAsRead: async (userId) => {
    try {
      const payload = await http.put(`/notifications/${userId}/read-all`, {});
      return apiResponse(unwrapData(payload), true, "Đánh dấu tất cả đã đọc");
    } catch (error) {
      return apiResponse(null, false, error.message || "API Error");
    }
  },
};

export default notificationsAPI;
