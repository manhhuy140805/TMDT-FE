/**
 * Messages API Domain
 */

import { api as http } from "../../utils/api";
import { apiResponse, unwrapData, normalizeArray } from "./utils";

const messagesAPI = {
  getConversations: async (userId) => {
    try {
      const payload = await http.get(`/conversations?userId=${userId}`);
      return apiResponse(normalizeArray(payload));
    } catch (error) {
      return apiResponse([], false, error.message || "API Error");
    }
  },

  getMessages: async (conversationId) => {
    try {
      const payload = await http.get(
        `/conversations/${conversationId}/messages`,
      );
      return apiResponse(normalizeArray(payload));
    } catch (error) {
      return apiResponse([], false, error.message || "API Error");
    }
  },

  sendMessage: async (data) => {
    try {
      const payload = await http.post("/messages", {
        conversationId: data.conversationId,
        nguoiGuiId: data.senderId ?? data.nguoiGuiId,
        noiDung: data.content ?? data.noiDung,
      });
      return apiResponse(unwrapData(payload), true, "Gửi tin nhắn thành công");
    } catch (error) {
      return apiResponse(null, false, error.message || "API Error");
    }
  },
};

export default messagesAPI;
