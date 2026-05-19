import { api } from "../utils/api";

/**
 * Supervisor Service
 * GET    /supervisors?skip=&take=
 * GET    /supervisors/search?keyword=&skip=&take=
 * GET    /supervisors/:id
 * POST   /supervisors
 * PUT    /supervisors/:id
 * DELETE /supervisors/:id
 *
 * Trạng thái: HoatDong | TamNghi | BiKhoa | ChoDuyet
 */
const supervisorService = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(query ? `/supervisors?${query}` : "/supervisors");
  },

  search: (keyword, params = {}) => {
    const query = new URLSearchParams({ keyword, ...params }).toString();
    return api.get(`/supervisors/search?${query}`);
  },

  getById: (id) => api.get(`/supervisors/${id}`),

  create: (data) => api.post("/supervisors", data),
  // data: { tenDonVi (required), moTa?, nangLuc?, chungChi?, phiGiamSat? }

  update: (id, data) => api.put(`/supervisors/${id}`, data),

  delete: (id) => api.delete(`/supervisors/${id}`),
};

export default supervisorService;
