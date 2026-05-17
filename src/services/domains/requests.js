/**
 * Requests (Jobs) API Domain
 */

import { api as http } from "../../utils/api";
import {
  apiResponse,
  unwrapData,
  normalizeArray,
  mapRequestFromApi,
  buildPagination,
  getCurrentUserId,
} from "./utils";

const requestsAPI = {
  getAll: async (params = {}) => {
    try {
      const payload = await http.get("/jobs");
      let items = normalizeArray(payload);
      let mapped = items.map(mapRequestFromApi);

      if (params.search) {
        const keyword = params.search.toLowerCase();
        mapped = mapped.filter((req) => {
          const title = (req.title ?? "").toLowerCase();
          const desc = (req.description ?? "").toLowerCase();
          const category = (req.category ?? "").toLowerCase();
          return (
            title.includes(keyword) ||
            desc.includes(keyword) ||
            category.includes(keyword)
          );
        });
      }

      if (params.categories && params.categories.length > 0) {
        mapped = mapped.filter((req) =>
          params.categories.includes(req.categoryId),
        );
      }

      if (params.status && params.status !== "ALL") {
        mapped = mapped.filter((req) => req.status === params.status);
      }

      return apiResponse({
        data: mapped,
        total: mapped.length,
        pagination: buildPagination(mapped),
      });
    } catch (error) {
      return apiResponse(
        { data: [], total: 0, pagination: buildPagination([]) },
        false,
        error.message || "API Error",
      );
    }
  },

  getByUserId: async (userId) => {
    try {
      const payload = await http.get(`/users/${userId}/jobs`);
      const items = normalizeArray(payload);
      const mapped = items.map(mapRequestFromApi);
      return apiResponse(mapped);
    } catch (error) {
      return apiResponse([], false, error.message || "API Error");
    }
  },

  getById: async (id) => {
    try {
      const payload = await http.get(`/jobs/${id}`);
      const mapped = mapRequestFromApi(unwrapData(payload));
      return apiResponse(mapped);
    } catch (error) {
      return apiResponse(null, false, error.message || "API Error");
    }
  },

  create: async (data) => {
    try {
      const currentUserId = getCurrentUserId();
      const payload = {
        nguoiThueId: data.employerId ?? currentUserId,
        loaiDichVuId: data.categoryId,
        tieuDe: data.title,
        moTa: data.description,
        nganSachMin: data.budgetMin,
        nganSachMax: data.budgetMax,
        thoiHan: data.deadlineDate ?? data.submissionDeadlineDate,
        hanNopHoSo: data.submissionDeadlineDate,
        yeuCauGiamSat: data.requiresSupervision ?? false,
        kyNang: Array.isArray(data.skills)
          ? data.skills.join(", ")
          : data.skills,
        diaDiem: data.location,
      };

      const response = await http.post("/jobs", payload);
      const mapped = mapRequestFromApi(unwrapData(response));
      return apiResponse(mapped, true, "Tạo yêu cầu thành công");
    } catch (error) {
      return apiResponse(null, false, error.message || "API Error");
    }
  },

  update: async (id, data) => {
    try {
      const payload = {
        loaiDichVuId: data.categoryId,
        tieuDe: data.title,
        moTa: data.description,
        nganSachMin: data.budgetMin,
        nganSachMax: data.budgetMax,
        thoiHan: data.deadlineDate ?? data.submissionDeadlineDate,
        hanNopHoSo: data.submissionDeadlineDate,
        yeuCauGiamSat: data.requiresSupervision,
        trangThai: data.status ?? data.trangThai,
        kyNang: Array.isArray(data.skills)
          ? data.skills.join(", ")
          : data.skills,
        diaDiem: data.location,
      };

      const response = await http.put(`/jobs/${id}`, payload);
      const mapped = mapRequestFromApi(unwrapData(response));
      return apiResponse(mapped, true, "Cập nhật yêu cầu thành công");
    } catch (error) {
      return apiResponse(null, false, error.message || "API Error");
    }
  },

  delete: async (id) => {
    try {
      await http.delete(`/jobs/${id}`);
      return apiResponse(null, true, "Xóa yêu cầu thành công");
    } catch (error) {
      return apiResponse(null, false, error.message || "API Error");
    }
  },
};

export default requestsAPI;
