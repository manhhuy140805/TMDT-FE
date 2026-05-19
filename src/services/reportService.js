import { api } from "../utils/api";

/**
 * Report Service
 * POST   /reports
 * GET    /reports?skip=&take=&trangThai=
 */
const reportService = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(query ? `/reports?${query}` : "/reports");
  },
  // params: { skip, take, trangThai }

  create: (data) => api.post("/reports", data),
  // data: { nguoiBiCaoId, tieuDe, moTa, loaiBaoCao? }
};

export default reportService;
