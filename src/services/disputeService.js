import { api } from "../utils/api";

/**
 * Dispute Service
 * POST   /disputes
 * GET    /disputes?skip=&take=&trangThai=
 * GET    /disputes/:id
 * PUT    /disputes/:id/status
 *
 * Trạng thái: MoiMo | DangXuLy | DaKetLuan | DaDong
 */
const disputeService = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(query ? `/disputes?${query}` : "/disputes");
  },
  // params: { skip, take, trangThai }

  getById: (id) => api.get(`/disputes/${id}`),

  create: (data) => api.post("/disputes", data),
  // data: { congViecId, tieuDe, moTa, loaiTranhChap? }

  updateStatus: (id, trangThai) =>
    api.put(`/disputes/${id}/status`, { trangThai }),
  // trangThai: MoiMo | DangXuLy | DaKetLuan | DaDong
};

export default disputeService;
