import { api } from "../utils/api";

/**
 * Dispute Service
 * POST   /disputes
 * GET    /disputes/:id
 * GET    /contracts/:id/disputes
 * PUT    /disputes/:id/review
 * PUT    /disputes/:id/resolve
 *
 * Trạng thái: MoiMo | DangXuLy | DaKetLuan | DaDong
 */
const disputeService = {
  getById: (id) => api.get(`/disputes/${id}`),

  getByContractId: (contractId) => api.get(`/contracts/${contractId}/disputes`),

  create: (data) => api.post("/disputes", data),
  // data: { congViecId, nguoiGuiId, lyDo, moTa?, yeuCauHoanTien? }

  review: (id, giamSatId) =>
    api.put(`/disputes/${id}/review`, { giamSatId }),

  resolve: (id, data) => api.put(`/disputes/${id}/resolve`, data),
  // data: { giamSatId, ketQua, lyDo, soTienHoan, soTienFreelancer, soTienGiamSat, soTienHeThong, benChiuPhi }
};

export default disputeService;
