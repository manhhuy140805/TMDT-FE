/**
 * Freelancers API Domain
 */

import { api as http } from "../../utils/api";
import {
  apiResponse,
  normalizeArray,
  mapFreelancerFromApi,
  buildPagination,
} from "./utils";

const freelancersAPI = {
  getAll: async (params = {}) => {
    try {
      const payload = await http.get("/freelancers");
      let items = normalizeArray(payload);

      if (params.search) {
        const keyword = params.search.toLowerCase();
        items = items.filter((fl) => {
          const name = (fl.hoTen ?? fl.name ?? "").toLowerCase();
          const skills = (fl.kyNang ?? fl.skills ?? "")
            .toString()
            .toLowerCase();
          return name.includes(keyword) || skills.includes(keyword);
        });
      }

      const mapped = items.map(mapFreelancerFromApi);
      return apiResponse({
        data: mapped,
        pagination: buildPagination(mapped),
      });
    } catch (error) {
      return apiResponse(
        { data: [], pagination: buildPagination([]) },
        false,
        error.message || "API Error",
      );
    }
  },
};

export default freelancersAPI;
