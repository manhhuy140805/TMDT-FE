import { api } from "../utils/api";

/**
 * Chat Service
 * POST   /chat
 * GET    /chat
 * POST   /chat/:id/messages
 * GET    /chat/:id/messages?skip=&take=
 *
 * loaiTinNhan: VanBan | File | HinhAnh
 */
const chatService = {
  // Lấy danh sách cuộc hội thoại của user hiện tại
  getConversations: () => api.get("/chat"),

  // Tạo cuộc hội thoại mới
  createConversation: (data) => api.post("/chat", data),
  // data: { thanhVien2Id }

  // Gửi tin nhắn
  sendMessage: (conversationId, data) =>
    api.post(`/chat/${conversationId}/messages`, data),
  // data: { noiDung (required), loaiTinNhan? }

  // Lấy tin nhắn trong cuộc hội thoại
  getMessages: (conversationId, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(
      query
        ? `/chat/${conversationId}/messages?${query}`
        : `/chat/${conversationId}/messages`
    );
  },
  // params: { skip, take }
};

export default chatService;
