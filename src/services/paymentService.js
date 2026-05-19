import { api } from "../utils/api";

/**
 * Payment Service
 * POST   /payments
 * GET    /payments?congViecId=&skip=&take=
 * PUT    /payments/:id/status
 *
 * loaiThanhToan: DatCoc | ThanhToanCuoi | HoanTien | PhiGiamSat | PhiHeThong
 * phuongThucThanhToan: ChuyenKhoan | ThanhToanQuaMang | Vi | TienMat
 * Trạng thái: ChoXuLy | ThanhCong | ThatBai | DaHoan
 */
const paymentService = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(query ? `/payments?${query}` : "/payments");
  },
  // params: { congViecId, skip, take }

  create: (data) => api.post("/payments", data),
  // data: { congViecId, soTien, loaiThanhToan, phuongThucThanhToan, moTa? }

  updateStatus: (id, trangThai) =>
    api.put(`/payments/${id}/status`, { trangThai }),
  // trangThai: ChoXuLy | ThanhCong | ThatBai | DaHoan
};

export default paymentService;
