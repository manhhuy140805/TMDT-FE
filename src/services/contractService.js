import { api } from "../utils/api";

/**
 * Contract Service
 * POST   /contracts
 * GET    /contracts?skip=&take=&trangThai=
 * GET    /contracts/:id
 * GET    /contracts/:id/detail
 * GET    /contracts/:id/progress
 * GET    /users/:id/contracts
 * PUT    /contracts/:id/status
 * POST   /contracts/:id/supervisor
 * PUT    /contracts/:id/supervisor/accept
 * PUT    /contracts/:id/supervisor/reject
 *
 * Trạng thái: MoiTao | DangThucHien | HoanThanh | DaHuy | TranhChap
 */
const contractService = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(query ? `/contracts?${query}` : "/contracts");
  },
  // params: { skip, take, trangThai }

  getById: (id) => api.get(`/contracts/${id}`),

  getDetail: (id) => api.get(`/contracts/${id}/detail`),

  getProgress: (id) => api.get(`/contracts/${id}/progress`),

  create: (data) => api.post("/contracts", data),
  // data: { baoGiaId (required), giaThucTe?, thoiHanThucTe? }

  updateStatus: (id, trangThai) =>
    api.put(`/contracts/${id}/status`, { trangThai }),
  // trangThai: MoiTao | DangThucHien | HoanThanh | DaHuy | TranhChap

  assignSupervisor: (id, data) => api.post(`/contracts/${id}/supervisor`, data),
  // data: { giamSatId }

  acceptSupervisor: (id) => api.put(`/contracts/${id}/supervisor/accept`),

  rejectSupervisor: (id, lyDo) =>
    api.put(`/contracts/${id}/supervisor/reject`, { lyDo }),
};

export default contractService;
