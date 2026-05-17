/**
 * Jobs/Contracts API Domain
 */

import { api as http } from "../../utils/api";
import { apiResponse, unwrapData, normalizeArray } from "./utils";

const jobsAPI = {
  getAll: async (params = {}) => {
    try {
      const payload = await http.get("/contracts");
      let items = normalizeArray(payload);

      if (params.freelancerId) {
        items = items.filter(
          (job) =>
            (job.freelancerId ?? job.freelancer?.id) === params.freelancerId,
        );
      }

      if (params.employerId) {
        items = items.filter(
          (job) =>
            (job.nguoiThueId ?? job.employerId ?? job.employer?.id) ===
            params.employerId,
        );
      }

      if (params.status) {
        items = items.filter(
          (job) => (job.trangThai ?? job.status) === params.status,
        );
      }

      return apiResponse(items);
    } catch (error) {
      return apiResponse([], false, error.message || "API Error");
    }
  },

  getById: async (id) => {
    try {
      const payload = await http.get(`/contracts/${id}`);
      return apiResponse(unwrapData(payload));
    } catch (error) {
      return apiResponse(null, false, error.message || "API Error");
    }
  },

  update: async (id, data) => {
    try {
      const payload = await http.put(`/contracts/${id}/status`, {
        trangThai: data.trangThai ?? data.status,
      });
      return apiResponse(
        unwrapData(payload),
        true,
        "Cập nhật công việc thành công",
      );
    } catch (error) {
      return apiResponse(null, false, error.message || "API Error");
    }
  },
};

export default jobsAPI;
