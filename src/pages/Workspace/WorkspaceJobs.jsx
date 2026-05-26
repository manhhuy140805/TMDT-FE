import { useState } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";

const WorkspaceJobs = () => {
  const { currentUser, jobs } = useOutletContext();
  const navigate = useNavigate();
  const [filter, setFilter] = useState("ACTIVE"); // ACTIVE, COMPLETED, CANCELLED, ALL

  const filteredJobs = jobs.filter(j => {
    if (filter === "ACTIVE") return j.trangThai === "DangThucHien" || j.trangThai === "MoiTao" || j.trangThai === "TamDung" || j.trangThai === "TranhChap";
    if (filter === "COMPLETED") return j.trangThai === "HoanThanh";
    if (filter === "CANCELLED") return j.trangThai === "DaHuy";
    return true;
  });

  const getNormalizedStatus = (rr) => {
    if (!rr) return "";
    const statusVal = rr.trangThai || rr.status || "";
    return statusVal.toString().toUpperCase().replace(/_/g, "");
  };

  const getStatusBadge = (contract) => {
    const status = contract?.trangThai;
    const rr = contract?.refundRequest;
    const isPendingRefund = rr && 
      (getNormalizedStatus(rr) === "CHOFREELANCERDUYET" || 
       getNormalizedStatus(rr) === "PENDING" || 
       getNormalizedStatus(rr) === "CHODUYET");

    if (status === "DangThucHien" && isPendingRefund) {
      return (
        <span style={{ 
          background: "#FFFBEB", 
          color: "#D97706", 
          padding: "4px 8px", 
          borderRadius: "4px", 
          fontSize: "12px", 
          fontWeight: 600,
          border: "1px solid #FCD34D"
        }}>
          Đang yêu cầu hoàn tiền
        </span>
      );
    }

    if (status === "DangThucHien") return <span style={{ background: "#DBEAFE", color: "#1D4ED8", padding: "4px 8px", borderRadius: "4px", fontSize: "12px", fontWeight: 600 }}>Đang làm</span>;
    if (status === "HoanThanh") return <span style={{ background: "#D1FAE5", color: "#047857", padding: "4px 8px", borderRadius: "4px", fontSize: "12px", fontWeight: 600 }}>Hoàn thành</span>;
    if (status === "TamDung") return <span style={{ background: "#FEF3C7", color: "#D97706", padding: "4px 8px", borderRadius: "4px", fontSize: "12px", fontWeight: 600 }}>Tạm dừng</span>;
    if (status === "DaHuy") return <span style={{ background: "#FEE2E2", color: "#DC2626", padding: "4px 8px", borderRadius: "4px", fontSize: "12px", fontWeight: 600 }}>Đã hủy</span>;
    if (status === "MoiTao") return <span style={{ background: "#EFF6FF", color: "#2563EB", padding: "4px 8px", borderRadius: "4px", fontSize: "12px", fontWeight: 600 }}>Mới tạo</span>;
    if (status === "TranhChap") return <span style={{ background: "#FEF2F2", color: "#EF4444", padding: "4px 8px", borderRadius: "4px", fontSize: "12px", fontWeight: 600 }}>Tranh chấp</span>;
    return <span style={{ background: "#F1F5F9", color: "#64748B", padding: "4px 8px", borderRadius: "4px", fontSize: "12px", fontWeight: 600 }}>{status}</span>;
  };

  const formatCurrency = (amount) => {
    if (!amount) return "Chưa thỏa thuận";
    return new Intl.NumberFormat("vi-VN").format(Number(amount)) + " VNĐ";
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "Chưa xác định";
    try {
      return new Date(dateStr).toLocaleDateString("vi-VN");
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="wl-content-box">
      <div className="wl-content-header" style={{ marginBottom: "16px" }}>
        <h2>Công việc của tôi</h2>
      </div>

      <div className="wl-project-status-tabs">
        <button
          className={`wl-project-status-tab ${filter === "ACTIVE" ? "active" : ""}`}
          onClick={() => setFilter("ACTIVE")}
        >
          <i className="fa-solid fa-spinner fa-spin-slow icon-active"></i>
          <span>Đang thực hiện</span>
          <span className="wl-project-status-count">
            {jobs.filter(j => j.trangThai === "DangThucHien" || j.trangThai === "MoiTao" || j.trangThai === "TamDung" || j.trangThai === "TranhChap").length}
          </span>
        </button>
        <button
          className={`wl-project-status-tab ${filter === "COMPLETED" ? "active" : ""}`}
          onClick={() => setFilter("COMPLETED")}
        >
          <i className="fa-solid fa-circle-check icon-completed"></i>
          <span>Đã hoàn thành</span>
          <span className="wl-project-status-count">
            {jobs.filter(j => j.trangThai === "HoanThanh").length}
          </span>
        </button>
        <button
          className={`wl-project-status-tab ${filter === "CANCELLED" ? "active" : ""}`}
          onClick={() => setFilter("CANCELLED")}
        >
          <i className="fa-solid fa-ban icon-cancelled"></i>
          <span>Đã hủy</span>
          <span className="wl-project-status-count">
            {jobs.filter(j => j.trangThai === "DaHuy").length}
          </span>
        </button>
        <button
          className={`wl-project-status-tab ${filter === "ALL" ? "active" : ""}`}
          onClick={() => setFilter("ALL")}
        >
          <i className="fa-solid fa-briefcase icon-all"></i>
          <span>Tất cả</span>
          <span className="wl-project-status-count">
            {jobs.length}
          </span>
        </button>
      </div>

      {filteredJobs.length === 0 ? (
        <div style={{ color: "#64748B", fontSize: "15px", padding: "60px 20px", textAlign: "center", border: "1px dashed #CBD5E1", borderRadius: "12px" }}>
          <i className="fa-solid fa-folder-open" style={{ fontSize: "40px", color: "#E2E8F0", marginBottom: "16px" }}></i>
          <p>Hiện chưa có công việc nào trong danh mục này.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "16px" }}>
          {filteredJobs.map(contract => (
            <div key={contract.congViecId} onClick={() => navigate(`/workspace/jobs/${contract.congViecId}`)} style={{ padding: "20px", border: "1px solid #E2E8F0", borderRadius: "12px", background: "white", cursor: "pointer", transition: "0.2s" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                <div>
                  <h3 style={{ margin: "0 0 8px 0", color: "#0F172A", fontSize: "18px" }}>{contract.yeuCau?.tieuDe || "Công việc"}</h3>
                  <div style={{ display: "flex", gap: "16px", color: "#64748B", fontSize: "14px" }}>
                    <span>
                      <i className="fa-solid fa-user"></i>{" "}
                      {currentUser?.vaiTro === "NguoiThue"
                        ? contract.freelancer?.hoTen || "Chưa có freelancer"
                        : contract.nguoiThue?.hoTen || "Người thuê"}
                    </span>
                    <span>
                      <i className="fa-regular fa-clock"></i>{" "}
                      {formatDate(contract.ngayBatDau)} - {contract.ngayKetThuc ? formatDate(contract.ngayKetThuc) : `${contract.thoiGianThoa || "?"} ngày`}
                    </span>
                  </div>
                </div>
                {getStatusBadge(contract.trangThai)}
              </div>
              <p style={{ color: "#475569", fontSize: "14px", lineHeight: "1.5", margin: "0 0 16px 0" }}>
                {contract.yeuCau?.moTa?.substring(0, 150) || "Không có mô tả"}
                {contract.yeuCau?.moTa?.length > 150 ? "..." : ""}
              </p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #F1F5F9", paddingTop: "16px" }}>
                <div style={{ fontWeight: 600, color: "#0F172A" }}>{formatCurrency(contract.giaThoa)}</div>
                {contract.trangThai === "DangThucHien" && (
                  <div style={{ fontSize: "13px", color: "#0EA5E9", fontWeight: 600 }}>
                    <i className="fa-solid fa-circle-play"></i> Đang thực hiện
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WorkspaceJobs;
