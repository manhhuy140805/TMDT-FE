/**
 * Progress API Domain
 */

import { api as http } from "../../utils/api";
import { apiResponse, unwrapData, normalizeArray } from "./utils";

const progressAPI = {
  getByContractId: async (contractId) => {
    try {
      const payload = await http.get(`/contracts/${contractId}/progress`);
      const items = normalizeArray(payload);
      return apiResponse(items);
    } catch (error) {
      return apiResponse([], false, error.message || "API Error");
    }
  },

  create: async (data) => {
    try {
      const payload = await http.post("/progress", {
        congViecId: data.congViecId ?? data.contractId,
        freelancerId: data.freelancerId,
        tieuDe: data.tieuDe ?? data.title,
        moTa: data.moTa ?? data.description,
        phanTram: data.phanTram ?? data.percentage,
        tepDinhKem: data.tepDinhKem ?? data.attachment,
      });
      return apiResponse(unwrapData(payload), true, "Tạo tiến độ thành công");
    } catch (error) {
      return apiResponse(null, false, error.message || "API Error");
    }
  },

  update: async (id, data) => {
    try {
      const payload = await http.put(`/progress/${id}`, {
        tieuDe: data.tieuDe ?? data.title,
        moTa: data.moTa ?? data.description,
        phanTram: data.phanTram ?? data.percentage,
        trangThaiXacNhan: data.trangThaiXacNhan ?? data.status,
      });
      return apiResponse(
        unwrapData(payload),
        true,
        "Cập nhật tiến độ thành công",
      );
    } catch (error) {
      return apiResponse(null, false, error.message || "API Error");
    }
  },

  updateProgress: async (contractId, data) => {
    try {
      const payload = await http.post("/progress", {
        congViecId: contractId,
        freelancerId: data.freelancerId,
        phanTram: data.phanTram,
        tieuDe: "Cập nhật tiến độ",
        moTa: `Tiến độ hiện tại: ${data.phanTram}%`,
      });
      return apiResponse(
        unwrapData(payload),
        true,
        "Cập nhật tiến độ thành công",
      );
    } catch (error) {
      return apiResponse(null, false, error.message || "API Error");
    }
  },

  delete: async (id) => {
    try {
      await http.delete(`/progress/${id}`);
      return apiResponse(null, true, "Xóa tiến độ thành công");
    } catch (error) {
      return apiResponse(null, false, error.message || "API Error");
    }
  },
};

export default progressAPI;
