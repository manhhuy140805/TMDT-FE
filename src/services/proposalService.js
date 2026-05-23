import { api } from "../utils/api";

/**
 * Proposal Service
 * POST   /proposals
 * GET    /proposals/:id
 * GET    /jobs/:id/proposals
 * GET    /freelancers/:id/proposals
 * PUT    /proposals/:id
 * DELETE /proposals/:id
 *
 * Trạng thái: DaGui | DuocChon | TuChoi | HetHan
 *
 * Body tạo mới (API mới):
 *   { yeuCauId, freelancerId, giaDeXuat, thoiGianThucHien, noiDung }
 *
 * Response freelancer có thêm kyNangs: [{ kyNangId, tenKyNang }]
 */
const proposalService = {
  getById: (id) => api.get(`/proposals/${id}`),

  getByJobId: (jobId) => api.get(`/jobs/${jobId}/proposals`),

  getByRequestId: (requestId) => api.get(`/jobs/${requestId}/proposals`),

  getByFreelancerId: (freelancerId) =>
    api.get(`/freelancers/${freelancerId}/proposals`),

  create: (data) => api.post("/proposals", data),
  // data: { yeuCauId, freelancerId, giaDeXuat, thoiGianThucHien, noiDung }

  update: (id, data) => api.put(`/proposals/${id}`, data),

  delete: (id) => api.delete(`/proposals/${id}`),
};

export default proposalService;
