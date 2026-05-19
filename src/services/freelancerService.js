import { api } from "../utils/api";

/**
 * Freelancer Service
 * GET    /freelancers?skip=&take=
 * GET    /freelancers/search?keyword=&skip=&take=
 * GET    /freelancers/:id
 * GET    /freelancers/:id/proposals
 * PUT    /freelancers/:id
 */
const freelancerService = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(query ? `/freelancers?${query}` : "/freelancers");
  },
  // params: { skip, take }

  search: (keyword, params = {}) => {
    const query = new URLSearchParams({ keyword, ...params }).toString();
    return api.get(`/freelancers/search?${query}`);
  },

  getById: (id) => api.get(`/freelancers/${id}`),

  getProposals: (id) => api.get(`/freelancers/${id}/proposals`),

  update: (id, data) => api.put(`/freelancers/${id}`, data),
  // data: { chuyenGia?, kyNang?, kinhNghiem? }
};

export default freelancerService;
