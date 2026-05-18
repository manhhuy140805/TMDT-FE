/**
 * Reports API Domain
 */

import { api as http } from "../../utils/api";
import {
  apiResponse,
  unwrapData,
  normalizeArray,
  mapUserFromApi,
} from "./utils";

const reportsAPI = {
  getAll: async () => {
    try {
      const payload = await http.get("/reports");
      const items = normalizeArray(payload);
      const mapped = items.map((report) => {
        const status = report.trangThai ?? report.status ?? "CHO_XU_LY";
        return {
          id: report.id ?? report.baoCaoId,
          reporter: mapUserFromApi(report.reporter ?? report.nguoiBaoCao),
          reported: mapUserFromApi(report.reported ?? report.doiTuong),
          reportedId: report.doiTuongId ?? report.reportedId,
          reason: report.noiDung ?? report.reason,
          createdDate: report.ngayTao ?? report.createdDate,
          status,
          statusText:
            report.statusText ??
            report.trangThaiText ??
            (status === "CHO_XU_LY" ? "Chờ xử lý" : "Đã xử lý"),
        };
      });
      return apiResponse(mapped);
    } catch (error) {
      return apiResponse([], false, error.message || "API Error");
    }
  },

  create: async (data) => {
    try {
      const payload = await http.post("/reports", {
        nguoiBaoCaoId: data.reporterId ?? data.nguoiBaoCaoId,
        doiTuongId: data.reportedId ?? data.doiTuongId,
        noiDung: data.reason ?? data.noiDung,
      });
      return apiResponse(unwrapData(payload), true, "Gửi báo cáo vi phạm thành công");
    } catch (error) {
      return apiResponse(null, false, error.message || "API Error");
    }
  },
};

export default reportsAPI;
