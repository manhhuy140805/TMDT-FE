import { api } from "../utils/api";

/**
 * User Service
 * GET    /users?skip=&take=
 * GET    /users/search?keyword=&skip=&take=
 * GET    /users/:id
 * GET    /users/:id/profile
 * GET    /users/:id/contracts
 * GET    /users/:id/reviews
 * PUT    /users/:id
 * DELETE /users/:id
 */
const userService = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(query ? `/users?${query}` : "/users");
  },
  // params: { skip, take }

  search: (keyword, params = {}) => {
    const query = new URLSearchParams({ keyword, ...params }).toString();
    return api.get(`/users/search?${query}`);
  },

  getById: (id) => api.get(`/users/${id}`),

  getProfile: (id) => api.get(`/users/${id}/profile`),

  getContracts: (id) => api.get(`/users/${id}/contracts`),

  getReviews: (id) => api.get(`/users/${id}/reviews`),

  update: (id, data) => api.put(`/users/${id}`, data),
  // data: { hoTen?, soDienThoai?, gioiTinh?, diaChi? }

  delete: (id) => api.delete(`/users/${id}`),
};

export default userService;
