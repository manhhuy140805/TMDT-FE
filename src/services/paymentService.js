import { api } from "../utils/api";

/**
 * Payment Service
 * POST   /payments/deposit       — Tạo thanh toán escrow (đặt cọc)
 * POST   /payments               — Tạo thanh toán chung
 * GET    /payments?congViecId=&skip=&take=
 * GET    /payments/:id
 * GET    /contracts/:id/payments  — Lấy tất cả thanh toán của hợp đồng
 * PUT    /payments/:id/status
 * PUT    /payments/:id/release    — Giải ngân cho freelancer
 * PUT    /payments/:id/refund     — Hoàn tiền cho người thuê
 *
 * loaiThanhToan: DatCoc | ThanhToan | HoanTien | PhiGiamSat | PhiHeThong
 * phuongThucThanhToan: ChuyenKhoan | ViDienTu | TheTinDung
 * Trạng thái: ChoXuLy | ThanhCong | ThatBai | DaHoan
 */
const paymentService = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(query ? `/payments?${query}` : "/payments");
  },
  // params: { congViecId, skip, take }

  getById: (id) => api.get(`/payments/${id}`),

  getByContractId: (contractId) => api.get(`/contracts/${contractId}/payments`),

  deposit: (data) => api.post("/payments/deposit", data),
  // data: { contractId, amount, paymentMethod, note? }

  release: (id) => api.put(`/payments/${id}/release`),
  // Giải ngân cho freelancer sau khi hoàn thành

  refund: (id) => api.put(`/payments/${id}/refund`),
  // Hoàn tiền cho người thuê

  updateStatus: (id, trangThai) =>
    api.put(`/payments/${id}/status`, { trangThai }),
  // trangThai: ChoXuLy | ThanhCong | ThatBai | DaHoan
};

export default paymentService;
