import { api } from "../utils/api";

/**
 * Auth Service
 * POST /auth/register
 * POST /auth/login
 *
 * Vai trò: KhachVangLai | NguoiThue | Freelancer | DonViGiamSat | Admin
 */
const authService = {
  register: (data) => api.post("/auth/register", data),
  // data: { tenDangNhap, matKhau, email, hoTen, soDienThoai?, gioiTinh?, diaChi?, vaiTro?, tenDonVi? }

  login: (data) => api.post("/auth/login", data),
  // data: { email, matKhau }  ← API mới dùng email thay vì tenDangNhap
};

export default authService;
