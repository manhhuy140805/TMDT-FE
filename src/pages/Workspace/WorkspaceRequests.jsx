import { useState, useEffect } from "react";
import { useOutletContext, useLocation, useNavigate } from "react-router-dom";
import PostRequestPage from "../PostRequest/PostRequestPage";
import api from "../../services/api";

const WorkspaceRequests = () => {
  const { currentUser, jobs, showToast } = useOutletContext();
  const location = useLocation();
  const navigate = useNavigate();
  const [showCreateProject, setShowCreateProject] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("action") === "new";
  });
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState("RECRUITING");
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    if (currentUser?.vaiTro === "DonViGiamSat") {
      setFilter("PENDING");
    } else {
      setFilter("RECRUITING");
    }
  }, [currentUser]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("action") === "new") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowCreateProject(true);
    }
  }, [location.search]);

  const fetchRequests = () => {
    if (currentUser?.vaiTro === "NguoiThue") {
      const userId = currentUser.taiKhoanId || currentUser.id;
      api.jobs.getByUserId(userId).then(res => {
        setRequests(res?.jobs || res?.data || (Array.isArray(res) ? res : []));
      }).catch(err => console.error("Error fetching requests:", err));
    } else if (currentUser?.vaiTro === "DonViGiamSat") {
      const supervisorId = currentUser.taiKhoanId || currentUser.id;
      api.jobs.getAll().then(res => {
        const allJobs = res?.jobs || res?.data || (Array.isArray(res) ? res : []);
        const filtered = allJobs.filter(job => 
          Number(job.giamSatId || job.supervisorId) === Number(supervisorId)
        );
        setRequests(filtered);
      }).catch(err => console.error("Error fetching supervisor requests:", err));
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [currentUser]);

  const handleAccept = async (id) => {
    setActionLoading(id);
    try {
      await api.jobs.acceptSupervisor(id);
      if (showToast) {
        showToast("Chấp nhận yêu cầu giám sát thành công!", "success");
      }
      fetchRequests();
    } catch (err) {
      console.error(err);
      if (showToast) {
        showToast(err.message || "Có lỗi xảy ra khi chấp nhận yêu cầu.", "error");
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id) => {
    const reason = prompt("Nhập lý do từ chối giám sát:", "Không đủ nguồn lực vào thời điểm này.");
    if (reason === null) return; // User cancelled prompt
    
    setActionLoading(id);
    try {
      await api.jobs.rejectSupervisor(id, reason || "Không đủ nguồn lực vào thời điểm này.");
      if (showToast) {
        showToast("Đã từ chối yêu cầu giám sát.", "warning");
      }
      fetchRequests();
    } catch (err) {
      console.error(err);
      if (showToast) {
        showToast(err.message || "Có lỗi xảy ra khi từ chối yêu cầu.", "error");
      }
    } finally {
      setActionLoading(null);
    }
  };

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
      if (currentUser?.vaiTro === "DonViGiamSat") {
        // Nếu yêu cầu tuyển dụng đã bị hủy thì ẩn khỏi danh sách của Giám sát
        if (r.trangThai === "DaHuy" || r.status === "DaHuy") {
          return false;
        }
        const statusGS = r.trangThaiGiamSat;
        if (filter === "PENDING") {
          return statusGS === "ChoDuyet" || statusGS === "Pending";
        }
        if (filter === "ACCEPTED") {
          return statusGS === "DaChapNhan" || statusGS === "Accepted";
        }
        if (filter === "REJECTED") {
          return statusGS === "TuChoi" || statusGS === "Rejected";
        }
        return true;
      }
      
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
        <h2>{currentUser?.vaiTro === "DonViGiamSat" ? "Yêu cầu giám sát của tôi" : "Yêu cầu tuyển dụng của tôi"}</h2>
        {currentUser?.vaiTro === "NguoiThue" && (
          <button className="btn-wl-primary" onClick={() => setShowCreateProject(true)}>
            <i className="fa-solid fa-plus"></i> Đăng yêu cầu mới
          </button>
        )}
      </div>

      {currentUser?.vaiTro === "DonViGiamSat" ? (
        <div className="wl-project-status-tabs" style={{ marginBottom: "24px" }}>
          <button
            className={`wl-project-status-tab ${filter === "PENDING" ? "active" : ""}`}
            onClick={() => setFilter("PENDING")}
          >
            <i className="fa-solid fa-clock icon-recruiting" style={{ color: "#D97706" }}></i>
            <span>Chờ duyệt</span>
            <span className="wl-project-status-count">
              {requests.filter(r => r.trangThaiGiamSat === "ChoDuyet" || r.trangThaiGiamSat === "Pending").length}
            </span>
          </button>
          <button
            className={`wl-project-status-tab ${filter === "ACCEPTED" ? "active" : ""}`}
            onClick={() => setFilter("ACCEPTED")}
          >
            <i className="fa-solid fa-circle-check icon-finalized" style={{ color: "#10B981" }}></i>
            <span>Đã nhận</span>
            <span className="wl-project-status-count">
              {requests.filter(r => r.trangThaiGiamSat === "DaChapNhan" || r.trangThaiGiamSat === "Accepted").length}
            </span>
          </button>
          <button
            className={`wl-project-status-tab ${filter === "REJECTED" ? "active" : ""}`}
            onClick={() => setFilter("REJECTED")}
          >
            <i className="fa-solid fa-circle-xmark icon-closed" style={{ color: "#EF4444" }}></i>
            <span>Từ chối</span>
            <span className="wl-project-status-count">
              {requests.filter(r => r.trangThaiGiamSat === "TuChoi" || r.trangThaiGiamSat === "Rejected").length}
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
      ) : (
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
      )}

      {filteredRequests.length === 0 ? (
        <div style={{ color: "#64748B", fontSize: "15px", padding: "60px 20px", textAlign: "center", border: "1px dashed #CBD5E1", borderRadius: "12px" }}>
          <i className="fa-solid fa-folder-open" style={{ fontSize: "40px", color: "#E2E8F0", marginBottom: "16px" }}></i>
          <p>Hiện chưa có yêu cầu nào trong danh mục này.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "16px" }}>
          {filteredRequests.map(req => {
            const reqId = req.yeuCauId || req.id;
            const isContracted = contractedRequestIds.has(reqId);
            
            if (currentUser?.vaiTro === "DonViGiamSat") {
              const statusGS = req.trangThaiGiamSat;
              return (
                <div 
                  key={`req-${reqId}`} 
                  style={{ 
                    padding: "20px", 
                    border: "1.5px solid #E2E8F0", 
                    borderRadius: "16px", 
                    background: "white", 
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
                    position: "relative"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)";
                    e.currentTarget.style.borderColor = "#CBD5E1";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "none";
                    e.currentTarget.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)";
                    e.currentTarget.style.borderColor = "#E2E8F0";
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px", gap: "16px" }}>
                    <div style={{ cursor: "pointer", flex: 1 }} onClick={() => navigate(`/requests/${reqId}`)}>
                      <h3 style={{ margin: "0 0 8px 0", color: "#0F172A", fontSize: "18px", fontWeight: "700" }}>
                        {req.tieuDe || "Yêu cầu giám sát"} <span style={{ fontSize: "14px", color: "#94A3B8", fontWeight: "400" }}>(#{reqId})</span>
                      </h3>
                      <div style={{ display: "flex", gap: "16px", color: "#64748B", fontSize: "13.5px", flexWrap: "wrap" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <i className="fa-solid fa-user-tie" style={{ color: "#0EA5E9" }}></i> 
                          Khách hàng: <strong>{req.nguoiThue?.hoTen || req.employer?.name || "Khách hàng ẩn danh"}</strong>
                        </span>
                        <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <i className="fa-regular fa-calendar-days" style={{ color: "#10B981" }}></i> 
                          Đăng {req.ngayTao ? formatDate(req.ngayTao) : "Chưa xác định"}
                        </span>
                        <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <i className="fa-solid fa-shield-halved" style={{ color: "#F59E0B" }}></i> 
                          Phí giám sát: <strong style={{ color: "#D97706" }}>{formatCurrency(req.supervisorFee || req.phiGiamSat || 0)}</strong>
                        </span>
                      </div>
                    </div>
                    <div>
                      {statusGS === "DaChapNhan" || statusGS === "Accepted" ? (
                        <span style={{ background: "#D1FAE5", color: "#065F46", padding: "6px 12px", borderRadius: "30px", fontSize: "12px", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "6px" }}>
                          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10B981" }}></span> Đã chấp nhận
                        </span>
                      ) : statusGS === "TuChoi" || statusGS === "Rejected" ? (
                        <span style={{ background: "#FEE2E2", color: "#991B1B", padding: "6px 12px", borderRadius: "30px", fontSize: "12px", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "6px" }}>
                          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#EF4444" }}></span> Từ chối
                        </span>
                      ) : (
                        <span style={{ background: "#FEF3C7", color: "#92400E", padding: "6px 12px", borderRadius: "30px", fontSize: "12px", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "6px" }}>
                          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#F59E0B" }}></span> Chờ duyệt
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <p 
                    style={{ color: "#475569", fontSize: "14px", lineHeight: "1.6", margin: "0 0 16px 0", cursor: "pointer" }} 
                    onClick={() => navigate(`/requests/${reqId}`)}
                  >
                    {req.moTa?.substring(0, 200) || "Không có mô tả chi tiết."}
                    {req.moTa?.length > 200 ? "..." : ""}
                  </p>
                  
                  {statusGS === "TuChoi" && req.lyDoTuChoiGiamSat && (
                    <div style={{ marginBottom: "16px", padding: "12px", background: "#FEF2F2", border: "1px solid #FCA5A5", borderRadius: "8px", fontSize: "13px", color: "#B91C1C", display: "flex", gap: "8px", alignItems: "flex-start" }}>
                      <i className="fa-solid fa-circle-exclamation" style={{ marginTop: "2px" }}></i>
                      <div>
                        <strong>Lý do từ chối:</strong> {req.lyDoTuChoiGiamSat}
                      </div>
                    </div>
                  )}

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #F1F5F9", paddingTop: "16px", flexWrap: "wrap", gap: "12px" }}>
                    <div style={{ fontWeight: 600, color: "#1E293B", fontSize: "14px" }}>
                      Ngân sách dự án: <span style={{ color: "#0EA5E9" }}>{req.nganSachMin ? formatCurrency(req.nganSachMin) : "Thỏa thuận"}</span>
                      {req.nganSachMax && req.nganSachMax !== req.nganSachMin ? ` - ${formatCurrency(req.nganSachMax)}` : ""}
                    </div>
                    
                    <div style={{ display: "flex", gap: "12px" }}>
                      <button 
                        className="btn-wl-secondary" 
                        onClick={() => navigate(`/requests/${reqId}`)}
                        style={{ padding: "8px 16px", fontSize: "13px", borderRadius: "8px", height: "auto", display: "flex", alignItems: "center", gap: "6px", fontWeight: "600" }}
                      >
                        <i className="fa-solid fa-eye"></i> Xem chi tiết
                      </button>
                      
                      {(statusGS === "ChoDuyet" || statusGS === "Pending") && (
                        <>
                          <button 
                            className="btn-wl-primary"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAccept(reqId);
                            }}
                            disabled={actionLoading === reqId}
                            style={{ 
                              padding: "8px 16px", 
                              fontSize: "13px", 
                              borderRadius: "8px", 
                              background: "linear-gradient(135deg, #10B981 0%, #059669 100%)", 
                              borderColor: "transparent", 
                              height: "auto", 
                              color: "white",
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                              fontWeight: "600",
                              boxShadow: "0 2px 4px rgba(16, 185, 129, 0.2)"
                            }}
                          >
                            {actionLoading === reqId ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-check"></i>} Chấp nhận
                          </button>
                          
                          <button 
                            className="btn-wl-primary"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleReject(reqId);
                            }}
                            disabled={actionLoading === reqId}
                            style={{ 
                              padding: "8px 16px", 
                              fontSize: "13px", 
                              borderRadius: "8px", 
                              background: "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)", 
                              borderColor: "transparent", 
                              height: "auto", 
                              color: "white",
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                              fontWeight: "600",
                              boxShadow: "0 2px 4px rgba(239, 68, 68, 0.2)"
                            }}
                          >
                            <i className="fa-solid fa-xmark"></i> Từ chối
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <div 
                key={`req-${reqId}`} 
                onClick={() => navigate(`/requests/${reqId}`)} 
                style={{ 
                  padding: "20px", 
                  border: "1px solid #E2E8F0", 
                  borderRadius: "16px", 
                  background: "white", 
                  cursor: "pointer", 
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)";
                  e.currentTarget.style.borderColor = "#CBD5E1";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "none";
                  e.currentTarget.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)";
                  e.currentTarget.style.borderColor = "#E2E8F0";
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                  <div>
                    <h3 style={{ margin: "0 0 8px 0", color: "#0F172A", fontSize: "18px", fontWeight: "700" }}>{req.tieuDe || "Yêu cầu"}</h3>
                    <div style={{ display: "flex", gap: "16px", color: "#64748B", fontSize: "14px" }}>
                      <span>
                        <i className="fa-solid fa-users" style={{ marginRight: "4px" }}></i> {req.soLuongBaoGia || 0} báo giá
                      </span>
                      <span>
                        <i className="fa-regular fa-clock" style={{ marginRight: "4px" }}></i> Đăng {req.ngayTao ? formatDate(req.ngayTao) : "Chưa xác định"}
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
