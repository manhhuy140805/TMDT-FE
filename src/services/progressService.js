import { api } from "../utils/api";

/**
 * Progress Service
 * POST   /progress
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

  create: (contractId, data) =>
    api.post("/progress", { ...data, congViecId: Number(contractId) }),
  // data: { freelancerId, tieuDe, phanTram (0-100), moTa? }

  update: (id, data) => api.put(`/progress/${id}`, data),
  // data: { tieuDe?, moTa?, phanTram? }

  delete: (id) => api.delete(`/progress/${id}`),
};

export default progressService;
