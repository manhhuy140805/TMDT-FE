/**
 * Statistics API Domain
 */

import { api as http } from "../../utils/api";
import { apiResponse, unwrapData } from "./utils";

const statisticsAPI = {
  getOverview: async () => {
    try {
      const payload = await http.get("/admin/statistics");
      return apiResponse(unwrapData(payload));
    } catch (error) {
      return apiResponse(null, false, error.message || "API Error");
    }
  },

  getRequestsByCategory: async () => {
    try {
      const payload = await http.get("/admin/statistics");
      const data = unwrapData(payload);
      return apiResponse(
        data?.requestsByCategory ?? data?.jobsByCategory ?? [],
      );
    } catch (error) {
      return apiResponse([], false, error.message || "API Error");
    }
  },

  getTopFreelancers: async () => {
    try {
      const payload = await http.get("/admin/statistics");
      const data = unwrapData(payload);
      return apiResponse(data?.topFreelancers ?? []);
    } catch (error) {
      return apiResponse([], false, error.message || "API Error");
    }
  },

  getRevenueByMonth: async () => {
    try {
      const payload = await http.get("/admin/statistics");
      const data = unwrapData(payload);
      return apiResponse(data?.revenueByMonth ?? []);
    } catch (error) {
      return apiResponse([], false, error.message || "API Error");
    }
  },
};

export default statisticsAPI;
