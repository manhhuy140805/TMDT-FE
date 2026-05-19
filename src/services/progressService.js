import { api } from "../utils/api";

/**
 * Progress Service
 * POST   /contracts/:id/progress
 * GET    /contracts/:id/progress
 * GET    /progress/:id
 * PUT    /progress/:id
 * DELETE /progress/:id
 *
 * Trạng thái: ChuaXacNhan | DaXacNhan | TuChoi
 */
const progressService = {
  getByContractId: (contractId) => api.get(`/contracts/${contractId}/progress`),

  getById: (id) => api.get(`/progress/${id}`),

  create: (contractId, data) => api.post(`/contracts/${contractId}/progress`, data),
  // data: { tieuDe (required), phanTramHoanThanh (required, 0-100), moTa? }

  update: (id, data) => api.put(`/progress/${id}`, data),
  // data: { tieuDe?, moTa?, phanTramHoanThanh? }

  delete: (id) => api.delete(`/progress/${id}`),
};

export default progressService;
