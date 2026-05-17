/**
 * Reviews API Domain
 */

import { api as http } from "../../utils/api";
import { apiResponse, unwrapData, normalizeArray } from "./utils";

const reviewsAPI = {
  getAll: async (params = {}) => {
    try {
      if (params.userId) {
        const payload = await http.get(`/users/${params.userId}/reviews`);
        return apiResponse(normalizeArray(payload));
      }

      if (params.contractId) {
        const payload = await http.get(
          `/contracts/${params.contractId}/reviews`,
        );
        return apiResponse(normalizeArray(payload));
      }

      const payload = await http.get("/reviews");
      return apiResponse(normalizeArray(payload));
    } catch (error) {
      return apiResponse([], false, error.message || "API Error");
    }
  },

  create: async (data) => {
    try {
      const payload = await http.post("/reviews", {
        contractId: data.contractId ?? data.congViecId,
        nguoiDanhGiaId: data.reviewerId ?? data.nguoiDanhGiaId,
        diem: data.score ?? data.diem,
        noiDung: data.content ?? data.noiDung,
      });
      return apiResponse(unwrapData(payload), true, "Gửi đánh giá thành công");
    } catch (error) {
      return apiResponse(null, false, error.message || "API Error");
    }
  },
};

export default reviewsAPI;
