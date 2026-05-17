/**
 * Payments API Domain
 */

import { api as http } from "../../utils/api";
import { apiResponse, unwrapData, normalizeArray } from "./utils";

const paymentsAPI = {
  getAll: async (params = {}) => {
    try {
      if (params.contractId) {
        const payload = await http.get(
          `/contracts/${params.contractId}/payments`,
        );
        return apiResponse(normalizeArray(payload));
      }

      if (params.jobId) {
        const payload = await http.get(`/contracts/${params.jobId}/payments`);
        return apiResponse(normalizeArray(payload));
      }

      if (params.userId) {
        const payload = await http.get(`/payments?userId=${params.userId}`);
        return apiResponse(normalizeArray(payload));
      }

      const payload = await http.get("/payments");
      return apiResponse(normalizeArray(payload));
    } catch (error) {
      return apiResponse([], false, error.message || "API Error");
    }
  },

  create: async (data) => {
    try {
      const payload = await http.post("/payments/deposit", {
        nguoiThueId: data.employerId ?? data.nguoiThueId,
        soTien: data.amount ?? data.soTien,
      });
      return apiResponse(
        unwrapData(payload),
        true,
        "Tạo thanh toán thành công",
      );
    } catch (error) {
      return apiResponse(null, false, error.message || "API Error");
    }
  },
};

export default paymentsAPI;
