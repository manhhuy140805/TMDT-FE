/**
 * Authentication API Domain
 */

import { api as http } from "../../utils/api";
import { apiResponse, unwrapData } from "./utils";

const authAPI = {
  login: async (credentials) => {
    try {
      const payload = {
        tenDangNhap:
          credentials.tenDangNhap ?? credentials.username ?? credentials.email,
        matKhau: credentials.matKhau ?? credentials.password,
        email: credentials.email,
      };
      const response = await http.post("/auth/login", payload);
      const raw = unwrapData(response);
      const user = raw.user ?? raw.data?.user ?? raw;

      const normalizedUser = {
        id: user?.taiKhoanId ?? user?.id,
        taiKhoanId: user?.taiKhoanId ?? user?.id,
        username: user?.tenDangNhap ?? user?.username,
        email: user?.email,
        fullName: user?.hoTen ?? user?.fullName ?? user?.name,
        name: user?.hoTen ?? user?.fullName ?? user?.name,
        phone: user?.soDienThoai ?? user?.phone,
        gender: user?.gioiTinh ?? user?.gender,
        address: user?.diaChi ?? user?.address,
        role: user?.vaiTro ?? user?.role,
        vaiTro: user?.vaiTro ?? user?.role,
        status: user?.trangThai ?? user?.status,
        avatar: user?.avatar,
        createdDate: user?.ngayTao ?? user?.createdDate,
        updatedDate: user?.ngayCapNhat ?? user?.updatedDate,
      };

      return apiResponse(
        { user: normalizedUser },
        true,
        "Đăng nhập thành công",
      );
    } catch (error) {
      return apiResponse(null, false, error.message || "Đăng nhập thất bại");
    }
  },

  register: async (data) => {
    try {
      const payload = {
        tenDangNhap: data.tenDangNhap ?? data.username ?? data.email,
        matKhau: data.matKhau ?? data.password,
        email: data.email,
        hoTen: data.hoTen ?? data.fullName ?? data.name,
        soDienThoai: data.soDienThoai ?? data.phone,
        gioiTinh: data.gioiTinh ?? data.gender,
        diaChi: data.diaChi ?? data.address,
        vaiTro: data.vaiTro ?? data.role ?? "NguoiThue",
      };

      const response = await http.post("/auth/register", payload);
      const raw = unwrapData(response);
      const user = raw.user ?? raw.data?.user ?? raw;

      const normalizedUser = {
        id: user?.taiKhoanId ?? user?.id,
        taiKhoanId: user?.taiKhoanId ?? user?.id,
        username: user?.tenDangNhap ?? user?.username,
        email: user?.email,
        fullName: user?.hoTen ?? user?.fullName ?? user?.name,
        name: user?.hoTen ?? user?.fullName ?? user?.name,
        phone: user?.soDienThoai ?? user?.phone,
        gender: user?.gioiTinh ?? user?.gender,
        address: user?.diaChi ?? user?.address,
        role: user?.vaiTro ?? user?.role,
        vaiTro: user?.vaiTro ?? user?.role,
        status: user?.trangThai ?? user?.status,
        avatar: user?.avatar,
        createdDate: user?.ngayTao ?? user?.createdDate,
        updatedDate: user?.ngayCapNhat ?? user?.updatedDate,
      };

      return apiResponse({ user: normalizedUser }, true, "Đăng ký thành công");
    } catch (error) {
      return apiResponse(null, false, error.message || "Đăng ký thất bại");
    }
  },

  logout: async () => apiResponse(null, true, "Đăng xuất thành công"),
};

export default authAPI;
