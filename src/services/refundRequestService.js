import { api } from "../utils/api";

/**
 * Refund Request Service
 * POST   /refund-requests
 * PUT    /refund-requests/:id/accept
 * PUT    /refund-requests/:id/reject
 * GET    /contracts/:id/refund-requests
 */
const refundRequestService = {
  create: (data) => api.post("/refund-requests", data),
  // data: { congViecId, nguoiThueId, lyDo, moTa, requestedRefundAmount/tienHoan/yeuCauHoanTien }

  accept: (id, freelancerId, data = {}) => api.put(`/refund-requests/${id}/accept`, { freelancerId, ...data }),

  reject: (id, freelancerId, data = {}) => api.put(`/refund-requests/${id}/reject`, { freelancerId, ...data }),

  getByContractId: (contractId) => api.get(`/contracts/${contractId}/refund-requests`),
};

export default refundRequestService;
