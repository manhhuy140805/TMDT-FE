/**
 * Complaints/Disputes API Domain
 */

import { api as http } from "../../utils/api";
import { apiResponse, unwrapData, normalizeArray } from "./utils";

const complaintsAPI = {
  getAll: async (params = {}) => {
    try {
      const payload = await http.get("/disputes");
      let items = normalizeArray(payload);
      if (params.status) {
        items = items.filter(
          (d) => (d.trangThai ?? d.status) === params.status,
        );
      }
      return apiResponse(items);
    } catch (error) {
      return apiResponse([], false, error.message || "API Error");
    }
  },

  create: async (data) => {
    try {
      const payload = await http.post("/disputes", {
        contractId: data.contractId ?? data.hopDongId,
        nguoiTaoId: data.creatorId ?? data.nguoiTaoId,
        lyDo: data.reason ?? data.lyDo,
      });
      return apiResponse(unwrapData(payload), true, "Gửi khiếu nại thành công");
    } catch (error) {
      return apiResponse(null, false, error.message || "API Error");
    }
  },
};

export default complaintsAPI;
