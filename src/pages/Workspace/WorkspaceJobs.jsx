import { useState, useEffect } from "react";
import { useOutletContext, useLocation, useNavigate } from "react-router-dom";
import PostRequestPage from "../PostRequest/PostRequestPage";
import api from "../../services/api";

const WorkspaceJobs = () => {
  const { currentUser, jobs } = useOutletContext();
  const location = useLocation();
  const navigate = useNavigate();
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [filter, setFilter] = useState("ALL"); // ALL, RECRUITING, ACTIVE, COMPLETED
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("action") === "new") {
      setShowCreateProject(true);
    }
  }, [location.search]);

  useEffect(() => {
    if (currentUser?.vaiTro === "NguoiThue") {
      const userId = currentUser.taiKhoanId || currentUser.id;
      api.jobs.getByUserId(userId).then(res => {
        setRequests(res?.jobs || res?.data || (Array.isArray(res) ? res : []));
      }).catch(err => console.error("Error fetching requests:", err));
    }
  }, [currentUser]);

  if (showCreateProject && currentUser?.vaiTro === "NguoiThue") {
    return (
      <div style={{ padding: "0 0 40px 0" }}>
        <PostRequestPage isEmbedded={true} onCancel={() => setShowCreateProject(false)} />
      </div>
    );
  }

  const activeRequests = requests.filter(r => r.trangThai === "DangMo");

  const filteredJobs = jobs.filter(j => {
    if (filter === "ALL") return true;
    if (filter === "ACTIVE") return j.trangThai === "DangThucHien";
    if (filter === "COMPLETED") return j.trangThai === "HoanThanh";
    if (filter === "RECRUITING") return false;
    return true;
  });

  const filteredRequests = filter === "ALL" || filter === "RECRUITING" ? activeRequests : [];

  const getStatusBadge = (status) => {
    if (status === "DangThucHien") return <span style={{ background: "#DBEAFE", color: "#1D4ED8", padding: "4px 8px", borderRadius: "4px", fontSize: "12px", fontWeight: 600 }}>Đang làm</span>;
    if (status === "HoanThanh") return <span style={{ background: "#D1FAE5", color: "#047857", padding: "4px 8px", borderRadius: "4px", fontSize: "12px", fontWeight: 600 }}>Hoàn thành</span>;
    if (status === "TamDung") return <span style={{ background: "#FEF3C7", color: "#D97706", padding: "4px 8px", borderRadius: "4px", fontSize: "12px", fontWeight: 600 }}>Tạm dừng</span>;
    if (status === "DaHuy") return <span style={{ background: "#FEE2E2", color: "#DC2626", padding: "4px 8px", borderRadius: "4px", fontSize: "12px", fontWeight: 600 }}>Đã hủy</span>;
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
        <h2>{currentUser?.vaiTro === "Freelancer" ? "Công việc của tôi" : "Dự án của tôi"}</h2>
        {currentUser?.vaiTro === "NguoiThue" && (
          <button className="btn-wl-primary" onClick={() => setShowCreateProject(true)}>
            <i className="fa-solid fa-plus"></i> Đăng yêu cầu mới
          </button>
        )}
      </div>

      <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
        <button onClick={() => setFilter("ALL")} style={{ padding: "6px 16px", borderRadius: "20px", border: "1px solid #E2E8F0", background: filter === "ALL" ? "#0F172A" : "#F8FAFC", color: filter === "ALL" ? "white" : "#64748B", fontWeight: 600, cursor: "pointer", transition: "0.2s" }}>
          Tất cả ({jobs.length + activeRequests.length})
        </button>
        {currentUser?.vaiTro === "NguoiThue" && (
          <button onClick={() => setFilter("RECRUITING")} style={{ padding: "6px 16px", borderRadius: "20px", border: "1px solid #E2E8F0", background: filter === "RECRUITING" ? "#0F172A" : "#F8FAFC", color: filter === "RECRUITING" ? "white" : "#64748B", fontWeight: 600, cursor: "pointer", transition: "0.2s" }}>
            Đang nhận hồ sơ ({activeRequests.length})
          </button>
        )}
        <button onClick={() => setFilter("ACTIVE")} style={{ padding: "6px 16px", borderRadius: "20px", border: "1px solid #E2E8F0", background: filter === "ACTIVE" ? "#0F172A" : "#F8FAFC", color: filter === "ACTIVE" ? "white" : "#64748B", fontWeight: 600, cursor: "pointer", transition: "0.2s" }}>
          Đang làm ({jobs.filter(j => j.trangThai === "DangThucHien").length})
        </button>
        <button onClick={() => setFilter("COMPLETED")} style={{ padding: "6px 16px", borderRadius: "20px", border: "1px solid #E2E8F0", background: filter === "COMPLETED" ? "#0F172A" : "#F8FAFC", color: filter === "COMPLETED" ? "white" : "#64748B", fontWeight: 600, cursor: "pointer", transition: "0.2s" }}>
          Hoàn thành ({jobs.filter(j => j.trangThai === "HoanThanh").length})
        </button>
      </div>

      {filteredJobs.length === 0 && filteredRequests.length === 0 ? (
        <div style={{ color: "#64748B", fontSize: "15px", padding: "60px 20px", textAlign: "center", border: "1px dashed #CBD5E1", borderRadius: "12px" }}>
          <i className="fa-solid fa-folder-open" style={{ fontSize: "40px", color: "#E2E8F0", marginBottom: "16px" }}></i>
          <p>Hiện chưa có công việc/dự án nào.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "16px" }}>
          {filteredRequests.map(req => (
            <div key={`req-${req.yeuCauId}`} onClick={() => navigate(`/requests/${req.yeuCauId}`)} style={{ padding: "20px", border: "1px solid #E2E8F0", borderRadius: "12px", background: "white", cursor: "pointer", transition: "0.2s" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                <div>
                  <h3 style={{ margin: "0 0 8px 0", color: "#0F172A", fontSize: "18px" }}>{req.tieuDe || "Yêu cầu"}</h3>
                  <div style={{ display: "flex", gap: "16px", color: "#64748B", fontSize: "14px" }}>
                    <span>
                      <i className="fa-solid fa-users"></i> {req.soLuongBaoGia || 0} báo giá
                    </span>
                    <span>
                      <i className="fa-regular fa-clock"></i> Đăng {req.ngayTao ? formatDate(req.ngayTao) : "Chưa xác định"}
                    </span>
                  </div>
                </div>
                <span style={{ background: "#FEF3C7", color: "#D97706", padding: "4px 8px", borderRadius: "4px", fontSize: "12px", fontWeight: 600 }}>Đang nhận hồ sơ</span>
              </div>
              <p style={{ color: "#475569", fontSize: "14px", lineHeight: "1.5", margin: "0 0 16px 0" }}>
                {req.moTa?.substring(0, 150) || "Không có mô tả"}
                {req.moTa?.length > 150 ? "..." : ""}
              </p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #F1F5F9", paddingTop: "16px" }}>
                <div style={{ fontWeight: 600, color: "#0F172A" }}>
                  Ngân sách: {req.nganSachMin ? formatCurrency(req.nganSachMin) : "Thỏa thuận"}
                  {req.nganSachMax && req.nganSachMax !== req.nganSachMin ? ` - ${formatCurrency(req.nganSachMax)}` : ""}
                </div>
                <div style={{ fontSize: "13px", color: "#D97706", fontWeight: 600 }}>
                  <i className="fa-solid fa-file-signature"></i> Đang chờ
                </div>
              </div>
            </div>
          ))}
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
