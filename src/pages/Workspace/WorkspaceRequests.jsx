import { useState, useEffect } from "react";
import { useOutletContext, useLocation, useNavigate } from "react-router-dom";
import PostRequestPage from "../PostRequest/PostRequestPage";
import api from "../../services/api";

const WorkspaceRequests = () => {
  const { currentUser, jobs } = useOutletContext();
  const location = useLocation();
  const navigate = useNavigate();
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState("RECRUITING"); // RECRUITING, FINALIZED, CLOSED, ALL

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

  const contractedRequestIds = new Set(
    jobs.map((j) => j.yeuCauId || j.yeuCau?.yeuCauId).filter(Boolean),
  );

  const getFilteredRequests = () => {
    return requests.filter((r) => {
      const requestId = r.yeuCauId || r.id;
      const isContracted = contractedRequestIds.has(requestId);
      const isOpen = r.trangThai === "DangNhanHoSo" || r.trangThai === "DangMo" || r.trangThai === "MoDau" || r.trangThai === "MoiTao";
      
      let reqStatus = r.trangThai || r.status;
      if (isContracted && isOpen) {
        reqStatus = "DaChot";
      }

      if (filter === "RECRUITING") {
        return isOpen && !isContracted;
      }
      if (filter === "FINALIZED") {
        return reqStatus === "DaChot" || isContracted;
      }
      if (filter === "CLOSED") {
        return reqStatus === "DaDong" || reqStatus === "DaHuy";
      }
      return true;
    });
  };

  const getStatusBadge = (status, isContracted) => {
    if (isContracted || status === "DaChot") {
      return <span style={{ background: "#D1FAE5", color: "#047857", padding: "4px 8px", borderRadius: "4px", fontSize: "12px", fontWeight: 600 }}>Đã chốt</span>;
    }
    if (status === "DaDong") {
      return <span style={{ background: "#F1F5F9", color: "#64748B", padding: "4px 8px", borderRadius: "4px", fontSize: "12px", fontWeight: 600 }}>Đã đóng</span>;
    }
    if (status === "DaHuy") {
      return <span style={{ background: "#FEE2E2", color: "#DC2626", padding: "4px 8px", borderRadius: "4px", fontSize: "12px", fontWeight: 600 }}>Đã hủy</span>;
    }
    return <span style={{ background: "#FEF3C7", color: "#D97706", padding: "4px 8px", borderRadius: "4px", fontSize: "12px", fontWeight: 600 }}>Đang tuyển dụng</span>;
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

  const filteredRequests = getFilteredRequests();

  return (
    <div className="wl-content-box">
      <div className="wl-content-header" style={{ marginBottom: "20px" }}>
        <h2>Yêu cầu tuyển dụng của tôi</h2>
        {currentUser?.vaiTro === "NguoiThue" && (
          <button className="btn-wl-primary" onClick={() => setShowCreateProject(true)}>
            <i className="fa-solid fa-plus"></i> Đăng yêu cầu mới
          </button>
        )}
      </div>

      <div className="wl-project-status-tabs" style={{ marginBottom: "24px" }}>
        <button
          className={`wl-project-status-tab ${filter === "RECRUITING" ? "active" : ""}`}
          onClick={() => setFilter("RECRUITING")}
        >
          <i className="fa-solid fa-bullhorn icon-recruiting"></i>
          <span>Đang tuyển dụng</span>
          <span className="wl-project-status-count">
            {requests.filter(r => (r.trangThai === "DangNhanHoSo" || r.trangThai === "DangMo" || r.trangThai === "MoDau" || r.trangThai === "MoiTao") && !contractedRequestIds.has(r.yeuCauId || r.id)).length}
          </span>
        </button>
        <button
          className={`wl-project-status-tab ${filter === "FINALIZED" ? "active" : ""}`}
          onClick={() => setFilter("FINALIZED")}
        >
          <i className="fa-solid fa-circle-check icon-finalized"></i>
          <span>Đã chốt</span>
          <span className="wl-project-status-count">
            {requests.filter(r => (r.trangThai === "DaChot" || contractedRequestIds.has(r.yeuCauId || r.id))).length}
          </span>
        </button>
        <button
          className={`wl-project-status-tab ${filter === "CLOSED" ? "active" : ""}`}
          onClick={() => setFilter("CLOSED")}
        >
          <i className="fa-solid fa-circle-minus icon-closed"></i>
          <span>Đóng / Hủy</span>
          <span className="wl-project-status-count">
            {requests.filter(r => r.trangThai === "DaDong" || r.trangThai === "DaHuy").length}
          </span>
        </button>
        <button
          className={`wl-project-status-tab ${filter === "ALL" ? "active" : ""}`}
          onClick={() => setFilter("ALL")}
        >
          <i className="fa-solid fa-folder icon-all"></i>
          <span>Tất cả</span>
          <span className="wl-project-status-count">
            {requests.length}
          </span>
        </button>
      </div>

      {filteredRequests.length === 0 ? (
        <div style={{ color: "#64748B", fontSize: "15px", padding: "60px 20px", textAlign: "center", border: "1px dashed #CBD5E1", borderRadius: "12px" }}>
          <i className="fa-solid fa-folder-open" style={{ fontSize: "40px", color: "#E2E8F0", marginBottom: "16px" }}></i>
          <p>Hiện chưa có yêu cầu tuyển dụng nào trong danh mục này.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "16px" }}>
          {filteredRequests.map(req => {
            const isContracted = contractedRequestIds.has(req.yeuCauId || req.id);
            return (
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
                  {getStatusBadge(req.trangThai, isContracted)}
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
                  <div style={{ fontSize: "13px", color: isContracted ? "#10B981" : "#D97706", fontWeight: 600 }}>
                    {isContracted ? (
                      <><i className="fa-solid fa-file-contract"></i> Đã có hợp đồng</>
                    ) : (
                      <><i className="fa-solid fa-file-signature"></i> Chưa chốt freelancer</>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default WorkspaceRequests;
