/**
 * Users API Domain
 */

import { api as http } from "../../utils/api";
import {
  apiResponse,
  unwrapData,
  normalizeArray,
  mapUserFromApi,
  mapRequestFromApi,
} from "./utils";

const usersAPI = {
  getAll: async () => {
    try {
      const payload = await http.get("/users");
      const items = normalizeArray(payload);
      const mapped = items.map(mapUserFromApi);
      return apiResponse(mapped);
    } catch (error) {
      return apiResponse([], false, error.message || "API Error");
    }
  },

  search: async (keyword) => {
    try {
      const payload = await http.get(
        `/users/search?keyword=${encodeURIComponent(keyword)}`,
      );
      const items = normalizeArray(payload);
      const mapped = items.map(mapUserFromApi);
      return apiResponse(mapped);
    } catch (error) {
      return apiResponse([], false, error.message || "API Error");
    }
  },

  getById: async (id) => {
    try {
      const payload = await http.get(`/users/${id}`);
      const mapped = mapUserFromApi(unwrapData(payload));
      return apiResponse(mapped);
    } catch (error) {
      return apiResponse(null, false, error.message || "API Error");
    }
  },

  getProfile: async (id) => {
    try {
      const payload = await http.get(`/users/${id}/profile`);
      const mapped = mapUserFromApi(unwrapData(payload));
      return apiResponse(mapped);
    } catch (error) {
      return apiResponse(null, false, error.message || "API Error");
    }
  },

  getJobs: async (id) => {
    try {
      const payload = await http.get(`/users/${id}/jobs`);
      const items = normalizeArray(payload);
      const mapped = items.map(mapRequestFromApi);
      return apiResponse(mapped);
    } catch (error) {
      return apiResponse([], false, error.message || "API Error");
    }
  },

  update: async (id, data) => {
    try {
      const payload = {
        tenDangNhap: data.username,
        email: data.email,
        hoTen: data.fullName ?? data.name,
        soDienThoai: data.phone,
        gioiTinh: data.gender,
        diaChi: data.address,
        vaiTro: data.role,
        trangThai: data.status,
      };

      const response = await http.put(`/users/${id}`, payload);
      const mapped = mapUserFromApi(unwrapData(response));
      return apiResponse(mapped, true, "Cập nhật người dùng thành công");
    } catch (error) {
      return apiResponse(null, false, error.message || "API Error");
    }
  },

  delete: async (id) => {
    try {
      await http.delete(`/users/${id}`);
      return apiResponse(null, true, "Xóa người dùng thành công");
    } catch (error) {
      return apiResponse(null, false, error.message || "API Error");
    }
  },
};

export default usersAPI;
