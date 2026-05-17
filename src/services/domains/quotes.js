/**
 * Quotes (Proposals) API Domain
 */

import { api as http } from "../../utils/api";
import {
  apiResponse,
  unwrapData,
  normalizeArray,
  mapProposalFromApi,
  mapProposalStatusToApi,
  parseDurationDays,
} from "./utils";

const quotesAPI = {
  getByRequestId: async (requestId) => {
    try {
      const payload = await http.get(`/jobs/${requestId}/proposals`);
      const items = normalizeArray(payload);
      const mapped = items.map(mapProposalFromApi);
      return apiResponse(mapped);
    } catch (error) {
      return apiResponse([], false, error.message || "API Error");
    }
  },

  create: async (data) => {
    try {
      const durationDays = parseDurationDays(data.duration);
      const payload = {
        yeuCauId: data.requestId,
        freelancerId: data.freelancerId,
        giaDeXuat: data.amount,
        thoiGianThucHien: durationDays ?? data.duration,
        noiDung: data.description,
      };

      const response = await http.post("/proposals", payload);
      const mapped = mapProposalFromApi(unwrapData(response));
      return apiResponse(mapped, true, "Gửi báo giá thành công");
    } catch (error) {
      return apiResponse(null, false, error.message || "API Error");
    }
  },

  update: async (id, data) => {
    try {
      const durationDays = parseDurationDays(data.duration);
      const payload = {
        giaDeXuat: data.amount,
        thoiGianThucHien: durationDays ?? data.duration,
        noiDung: data.description,
        trangThai: data.status
          ? mapProposalStatusToApi(data.status)
          : undefined,
      };

      const response = await http.put(`/proposals/${id}`, payload);
      const mapped = mapProposalFromApi(unwrapData(response));
      return apiResponse(mapped, true, "Cập nhật báo giá thành công");
    } catch (error) {
      return apiResponse(null, false, error.message || "API Error");
    }
  },

  delete: async (id) => {
    try {
      await http.delete(`/proposals/${id}`);
      return apiResponse(null, true, "Xóa báo giá thành công");
    } catch (error) {
      return apiResponse(null, false, error.message || "API Error");
    }
  },
};

export default quotesAPI;
