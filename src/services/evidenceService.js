import { api } from "../utils/api";

/**
 * Evidence Service
 * POST   /evidences
 * GET    /evidences?tranhChapId=&skip=&take=
 *
 * loaiBangChung: TinNhan | File | HinhAnh | GhiChu | KhacP
 */
const evidenceService = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(query ? `/evidences?${query}` : "/evidences");
  },
  // params: { tranhChapId, skip, take }

  create: (data) => api.post("/evidences", data),
  // data: { tranhChapId, loaiBangChung, duongDan, moTa? }
};

export default evidenceService;
