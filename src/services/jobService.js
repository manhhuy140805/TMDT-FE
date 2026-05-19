import { api } from "../utils/api";

/**
 * Job Service
 * POST   /jobs                          — tạo yêu cầu
 * GET    /jobs?skip=&take=&trangThai=   — danh sách
 * GET    /jobs/search?keyword=&category=&budget=&skills=  — tìm kiếm
 * GET    /jobs/:id                      — chi tiết (có kyNangs)
 * GET    /jobs/:id/proposals            — báo giá của yêu cầu
 * PUT    /jobs/:id                      — cập nhật
 * DELETE /jobs/:id                      — xóa mềm
 *
 * Skills endpoints (mới):
 * GET    /jobs/:id/skills
 * PUT    /jobs/:id/skills               — { kyNangIds: [] }
 * POST   /jobs/:id/skills/:kyNangId
 * DELETE /jobs/:id/skills/:kyNangId
 *
 * Trạng thái: MoDau | DangMo | DaDong | DaHuy | HoanThanh
 */
const jobService = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(query ? `/jobs?${query}` : "/jobs");
  },
  // params: { skip, take, trangThai }

  search: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/jobs/search?${query}`);
  },
  // params: { keyword, category, budget, skills (comma-separated kyNangIds) }

  getById: (id) => api.get(`/jobs/${id}`),
  // response có thêm kyNangs: [{ kyNangId, tenKyNang }]

  getProposals: (id) => api.get(`/jobs/${id}/proposals`),

  create: (data) => api.post("/jobs", data),
  // data: { nguoiThueId, loaiDichVuId, tieuDe, moTa, nganSachMin, nganSachMax, thoiHan, yeuCauGiamSat?, kyNangIds? }

  update: (id, data) => api.put(`/jobs/${id}`, data),

  delete: (id) => api.delete(`/jobs/${id}`),

  // ── Skills ──
  getSkills: (id) => api.get(`/jobs/${id}/skills`),

  setSkills: (id, kyNangIds) => api.put(`/jobs/${id}/skills`, { kyNangIds }),
  // Thay thế toàn bộ kỹ năng. Truyền [] để xóa hết.

  addSkill: (id, kyNangId) => api.post(`/jobs/${id}/skills/${kyNangId}`),

  removeSkill: (id, kyNangId) => api.delete(`/jobs/${id}/skills/${kyNangId}`),
};

export default jobService;
