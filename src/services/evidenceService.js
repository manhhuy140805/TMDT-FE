import { api } from "../utils/api";

/**
 * Evidence Service
 * POST   /disputes/:id/evidences
 * GET    /disputes/:id/evidences
 * DELETE /evidences/:id
 *
 * loaiBangChung: TinNhan | File | HinhAnh | GhiChu | KhacP
 */
const evidenceService = {
  getByDisputeId: (disputeId) => api.get(`/disputes/${disputeId}/evidences`),

  create: (disputeId, data) => api.post(`/disputes/${disputeId}/evidences`, data),
  // data: { nguoiNopId, loaiBangChung, noiDung, duongDanFile? }

  delete: (id) => api.delete(`/evidences/${id}`),
};

export default evidenceService;
