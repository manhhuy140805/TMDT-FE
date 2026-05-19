import { api } from "../utils/api";

/**
 * Skill Service ⭐ MỚI
 * GET    /skills                        — danh sách tất cả kỹ năng
 * GET    /skills/:id                    — chi tiết kỹ năng
 * POST   /skills                        — tạo kỹ năng mới
 * PUT    /skills/:id                    — cập nhật kỹ năng
 * DELETE /skills/:id                    — xóa kỹ năng (CASCADE)
 *
 * Freelancer skills:
 * GET    /freelancers/:id/skills
 * PUT    /freelancers/:id/skills        — { kyNangIds: [] }
 * POST   /freelancers/:id/skills/:kyNangId
 * DELETE /freelancers/:id/skills/:kyNangId
 */
const skillService = {
  // ── Global skills ──
  getAll: () => api.get("/skills"),
  // response: { total, skills: [{ kyNangId, tenKyNang, moTa }] }

  getById: (id) => api.get(`/skills/${id}`),

  create: (data) => api.post("/skills", data),
  // data: { tenKyNang, moTa? }

  update: (id, data) => api.put(`/skills/${id}`, data),

  delete: (id) => api.delete(`/skills/${id}`),

  // ── Freelancer skills ──
  getFreelancerSkills: (freelancerId) =>
    api.get(`/freelancers/${freelancerId}/skills`),

  setFreelancerSkills: (freelancerId, kyNangIds) =>
    api.put(`/freelancers/${freelancerId}/skills`, { kyNangIds }),

  addFreelancerSkill: (freelancerId, kyNangId) =>
    api.post(`/freelancers/${freelancerId}/skills/${kyNangId}`),

  removeFreelancerSkill: (freelancerId, kyNangId) =>
    api.delete(`/freelancers/${freelancerId}/skills/${kyNangId}`),
};

export default skillService;
