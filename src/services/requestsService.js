import api from "./api";

/**
 * Lấy danh sách requests của employer cụ thể
 * @param {number} userId - ID của employer
 * @returns {Promise<Array>} Danh sách requests
 */
export const fetchEmployerRequests = async (userId) => {
  const response = await api.requests.getByUserId(userId);
  if (!response.success) {
    throw new Error(response.message || "Failed to fetch requests");
  }

  return response.data || [];
};

/**
 * Xóa request theo ID
 * @param {number} requestId - ID của request cần xóa
 * @returns {Promise<Object>} Response từ API
 */
export const deleteRequestById = async (requestId) => {
  const response = await api.requests.delete(requestId);
  if (!response.success) {
    throw new Error(response.message || "Failed to delete request");
  }

  return response;
};

