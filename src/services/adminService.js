import { api } from "../utils/api";

/**
 * Admin Service
 * PUT    /admin/users/:id/status
 * PUT    /admin/supervisors/:id/approve
 * PUT    /admin/reports/:id/status
 */
const adminService = {
  updateUserStatus: (id, trangThai) =>
    api.put(`/admin/users/${id}/status`, { trangThai }),
  // trangThai: HoatDong | BiKhoa | ChoDuyet | DaBi

  approveSupervisor: (id) => api.put(`/admin/supervisors/${id}/approve`),

  updateReportStatus: (id, data) =>
    api.put(`/admin/reports/${id}/status`, data),
  // data: { trangThai, hanhDong? }
};

export default adminService;
