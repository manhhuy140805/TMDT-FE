/**
 * Categories API Domain
 */

import { api as http } from "../../utils/api";
import {
  apiResponse,
  unwrapData,
  normalizeArray,
  mapCategoryFromApi,
} from "./utils";

const categoriesAPI = {
  getAll: async () => {
    try {
      const payload = await http.get("/categories");
      const items = normalizeArray(payload);
      const mapped = items.map(mapCategoryFromApi);
      return apiResponse(mapped);
    } catch (error) {
      return apiResponse([], false, error.message || "API Error");
    }
  },

  getById: async (id) => {
    try {
      const payload = await http.get(`/categories/${id}`);
      const mapped = mapCategoryFromApi(unwrapData(payload));
      return apiResponse(mapped);
    } catch (error) {
      return apiResponse(null, false, error.message || "API Error");
    }
  },
};

export default categoriesAPI;
