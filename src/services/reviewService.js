import { api } from "../utils/api";

/**
 * Review Service
 * POST   /reviews
 * GET    /reviews?congViecId=&skip=&take=
 *
 * loaiDanhGia: NguoiThue_DanhGia_Freelancer | Freelancer_DanhGia_NguoiThue
 */
const reviewService = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(query ? `/reviews?${query}` : "/reviews");
  },
  // params: { congViecId, skip, take }

  create: (data) => api.post("/reviews", data),
  // data: { congViecId, diem (1-5), loaiDanhGia, binhLuan? }
};

export default reviewService;
