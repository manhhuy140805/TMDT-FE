import { api } from "../utils/api";

/**
 * Chat Service (Updated API)
 *
 * GET    /users/:id/conversations       — danh sách hội thoại của user
 * POST   /chat                          — tạo hội thoại mới
 * GET    /chat/:id                      — chi tiết 1 hội thoại
 * PUT    /chat/:id/close                — đóng hội thoại
 * GET    /chat/:id/messages             — lấy tin nhắn
 * POST   /chat/:id/messages             — gửi tin nhắn
 * PUT    /chat/:id/read/:userId         — đánh dấu đã đọc
 *
 * loaiTin: VanBan | HinhAnh | TepTin
 */
const chatService = {
  // Lấy danh sách cuộc hội thoại của user
  getConversations: (userId) => api.get(`/users/${userId}/conversations`),

  // Tạo cuộc hội thoại mới
  createConversation: (data) => api.post("/chat", data),
  // data: { thanhVien1Id, thanhVien2Id, congViecId?, giamSatId? }

  // Lấy chi tiết 1 hội thoại
  getById: (id) => api.get(`/chat/${id}`),

  // Đóng hội thoại
  close: (id) => api.put(`/chat/${id}/close`),

  // Lấy tin nhắn trong cuộc hội thoại
  getMessages: (conversationId) => api.get(`/chat/${conversationId}/messages`),

  // Gửi tin nhắn
  sendMessage: (conversationId, data) =>
    api.post(`/chat/${conversationId}/messages`, data),
  // data: { cuocHoiThoaiId, nguoiGuiId, noiDung, loaiTin? }

  // Đánh dấu đã đọc
  markAsRead: (conversationId, userId) =>
    api.put(`/chat/${conversationId}/read/${userId}`),
};

export default chatService;
