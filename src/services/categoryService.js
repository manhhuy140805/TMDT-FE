import { api } from "../utils/api";

/**
 * Category Service
 * GET    /categories?skip=&take=
 * GET    /categories/:id
 * POST   /categories
 * PUT    /categories/:id
 * DELETE /categories/:id
 */
const categoryService = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(query ? `/categories?${query}` : "/categories");
  },
  // params: { skip, take }

  getById: (id) => api.get(`/categories/${id}`),

  create: (data) => api.post("/categories", data),
  // data: { tenLoai (required), moTa?, hinhAnh? }

  update: (id, data) => api.put(`/categories/${id}`, data),

  delete: (id) => api.delete(`/categories/${id}`),
};

export default categoryService;
