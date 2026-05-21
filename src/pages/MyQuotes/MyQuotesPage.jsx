import { useState, useEffect } from "react";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import api from "../../services/api";
import { getUserRole, isFreelancerRole } from "../../utils/role";
import "./MyQuotesPage.css";

const MyQuotesPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [quotes, setQuotes] = useState([]);
  const [filter, setFilter] = useState("all");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [quoteToDelete, setQuoteToDelete] = useState(null);

  // Lấy context từ WorkspaceLayout (nếu render trong workspace)
  let outletContext = null;
  try { outletContext = useOutletContext(); } catch { /* ngoài workspace */ }
  const currentUser = outletContext?.currentUser ?? (() => {
    try { const s = localStorage.getItem("user"); return s ? JSON.parse(s) : null; } catch { return null; }
  })();

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
      return;
    }
    const role = getUserRole(currentUser);
    if (!isFreelancerRole(role)) {
      setLoading(false);
      return;
    }
    const freelancerId = currentUser.freelancerId ?? currentUser.taiKhoanId;
    fetchMyQuotes(freelancerId);
  }, []);

  const fetchMyQuotes = async (freelancerId) => {
    setLoading(true);
    try {
      const res = await api.proposals.getByFreelancerId(freelancerId);

      // API trả về { proposals: [...] } hoặc mảng trực tiếp
      const list = Array.isArray(res)
        ? res
        : Array.isArray(res?.proposals)
          ? res.proposals
          : Array.isArray(res?.data)
            ? res.data
            : [];

      // Map sang format UI
      const mapped = list.map((p) => ({
        id: p.baoGiaId,
        requestId: p.yeuCauId,
        amount: Number(p.giaDeXuat ?? 0),
        duration: `${p.thoiGianThucHien ?? 0} ngày`,
        durationDays: p.thoiGianThucHien,
        description: p.noiDung ?? "",
        status: p.trangThai, // DaGui | DaChapNhan (DuocChon) | DaTuChoi | DaHuy
        submittedDate: p.ngayTao,
        submittedTime: p.ngayTao
          ? new Date(p.ngayTao).toLocaleDateString("vi-VN")
          : "",
        // Thông tin yêu cầu nếu API trả kèm
        request: p.yeuCau
          ? {
              id: p.yeuCau.yeuCauId,
              title: p.yeuCau.tieuDe,
              category: p.yeuCau.loaiDichVu?.tenLoai ?? "",
              bids: p.yeuCau.soLuongBaoGia ?? 0,
              budget: p.yeuCau.nganSachMin && p.yeuCau.nganSachMax
                ? `${Number(p.yeuCau.nganSachMin).toLocaleString("vi-VN")} – ${Number(p.yeuCau.nganSachMax).toLocaleString("vi-VN")} VNĐ`
                : null,
            }
          : null,
      }));

      setQuotes(mapped);
    } catch (error) {
      console.error("Error fetching quotes:", error);
      setQuotes([]);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredQuotes = () => {
    if (filter === "all") return quotes;
    if (filter === "pending") {
      return quotes.filter((q) => q.status === "DaGui" || q.status === "ChoXacNhan");
    }
    if (filter === "accepted") {
      return quotes.filter((q) => q.status === "DaChapNhan" || q.status === "DuocChon");
    }
    if (filter === "rejected") {
      return quotes.filter((q) => q.status === "DaTuChoi" || q.status === "DaHuy");
    }
    return quotes;
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      DaGui: { text: "Đã gửi", class: "status-pending" },
      ChoXacNhan: { text: "Chờ xác nhận", class: "status-pending" },
      DaChapNhan: { text: "Đã chấp nhận", class: "status-accepted" },
      DuocChon: { text: "Được chọn", class: "status-accepted" },
      DaTuChoi: { text: "Bị từ chối", class: "status-rejected" },
      DaHuy: { text: "Đã hủy", class: "status-rejected" },
    };
    const statusInfo = statusMap[status] || { text: status, class: "" };
    return (
      <span className={`status-badge ${statusInfo.class}`}>
        {statusInfo.text}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date)) return dateString;
    return date.toLocaleDateString("vi-VN");
  };

  const formatCurrency = (amount) => {
    if (!amount) return "0 VNĐ";
    return new Intl.NumberFormat("vi-VN").format(amount) + " VNĐ";
  };

  const handleEditQuote = (quoteId) => {
    navigate(`/quotes/${quoteId}/edit`);
  };

  const handleDeleteQuote = async () => {
    if (!quoteToDelete) return;

    try {
      await api.proposals.delete(quoteToDelete);
      setQuotes((prev) => prev.filter((q) => q.id !== quoteToDelete));
      alert("Xóa báo giá thành công!");
    } catch (error) {
      console.error("Error deleting quote:", error);
      alert(error.message || "Có lỗi xảy ra khi xóa báo giá!");
    }

    setShowDeleteModal(false);
    setQuoteToDelete(null);
  };

  const openDeleteModal = (quoteId) => {
    setQuoteToDelete(quoteId);
    setShowDeleteModal(true);
  };

  const pendingCount = quotes.filter((q) => q.status === "DaGui" || q.status === "ChoXacNhan").length;
  const acceptedCount = quotes.filter((q) => q.status === "DaChapNhan" || q.status === "DuocChon").length;
  const rejectedCount = quotes.filter((q) => q.status === "DaTuChoi" || q.status === "DaHuy").length;
  const filteredQuotes = getFilteredQuotes();

  if (loading) {
    return (
      <div className="loading-state">
        <i className="fa-solid fa-circle-notch fa-spin"></i>
        <p>Đang tải danh sách báo giá...</p>
      </div>
    );
  }

  const userRole = getUserRole(currentUser);
  const isFreelancer = isFreelancerRole(userRole);

  if (currentUser && !isFreelancer) {
    return (
      <div className="mq-page">
        <div className="empty-state">
          <i className="fa-solid fa-lock"></i>
          <h3>Không có quyền truy cập</h3>
          <p>Trang này chỉ dành cho Freelancer để quản lý báo giá đã gửi.</p>
          <Link to="/workspace" className="btn-create-first">
            <i className="fa-solid fa-arrow-left"></i>
            Về không gian làm việc
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mq-page">
      {/* Page Title */}
      <div className="mq-page-header">
        <h2 className="mq-page-title">
          <i className="fa-solid fa-file-invoice"></i>
          Báo giá đã gửi
        </h2>
        <p className="mq-page-desc">Theo dõi và quản lý tất cả các báo giá bạn đã gửi</p>
      </div>
      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#EFF6FF", color: "#0EA5E9" }}>
            <i className="fa-solid fa-file-invoice"></i>
          </div>
          <div className="stat-info">
            <div className="stat-value">{quotes.length}</div>
            <div className="stat-label">Tổng báo giá</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#FEF3C7", color: "#D97706" }}>
            <i className="fa-solid fa-clock"></i>
          </div>
          <div className="stat-info">
            <div className="stat-value">{pendingCount}</div>
            <div className="stat-label">Đang chờ</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#F0FDF4", color: "#16A34A" }}>
            <i className="fa-solid fa-check-circle"></i>
          </div>
          <div className="stat-info">
            <div className="stat-value">{acceptedCount}</div>
            <div className="stat-label">Đã chấp nhận</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#FEE2E2", color: "#DC2626" }}>
            <i className="fa-solid fa-times-circle"></i>
          </div>
          <div className="stat-info">
            <div className="stat-value">{rejectedCount}</div>
            <div className="stat-label">Bị từ chối</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <button className={`filter-btn ${filter === "all" ? "active" : ""}`} onClick={() => setFilter("all")}>
          Tất cả ({quotes.length})
        </button>
        <button className={`filter-btn ${filter === "pending" ? "active" : ""}`} onClick={() => setFilter("pending")}>
          Đang chờ ({pendingCount})
        </button>
        <button className={`filter-btn ${filter === "accepted" ? "active" : ""}`} onClick={() => setFilter("accepted")}>
          Đã chấp nhận ({acceptedCount})
        </button>
        <button className={`filter-btn ${filter === "rejected" ? "active" : ""}`} onClick={() => setFilter("rejected")}>
          Bị từ chối ({rejectedCount})
        </button>
      </div>

      {/* Quotes List */}
      <div className="quotes-list">
        {filteredQuotes.length === 0 ? (
          <div className="empty-state">
            <i className="fa-regular fa-folder-open"></i>
            <h3>Chưa có báo giá nào</h3>
            <p>Bắt đầu bằng cách tìm kiếm và gửi báo giá cho các yêu cầu phù hợp</p>
            <Link to="/requests" className="btn-create-first">
              <i className="fa-solid fa-search"></i>
              Tìm kiếm yêu cầu
            </Link>
          </div>
        ) : (
          filteredQuotes.map((quote) => (
            <div key={quote.id} className="quote-card">
              <div className="quote-header">
                <div className="quote-title-section">
                  <Link to={`/requests/${quote.requestId}`} className="quote-title">
                    {quote.request?.title ?? `Yêu cầu #${quote.requestId}`}
                  </Link>
                  {getStatusBadge(quote.status)}
                </div>
                <div className="quote-actions">
                  {(quote.status === "DaGui" || quote.status === "ChoXacNhan") && (
                    <button className="btn-icon" title="Chỉnh sửa" onClick={() => handleEditQuote(quote.id)}>
                      <i className="fa-solid fa-pen"></i>
                    </button>
                  )}
                  <button className="btn-icon" title="Xóa" onClick={() => openDeleteModal(quote.id)}>
                    <i className="fa-solid fa-trash"></i>
                  </button>
                </div>
              </div>

              <div className="quote-meta">
                {quote.request?.category && (
                  <span className="meta-item">
                    <i className="fa-solid fa-tag"></i>
                    {quote.request.category}
                  </span>
                )}
                {quote.request?.budget && (
                  <span className="meta-item">
                    <i className="fa-solid fa-money-bill-wave"></i>
                    {quote.request.budget}
                  </span>
                )}
                <span className="meta-item">
                  <i className="fa-solid fa-calendar"></i>
                  Gửi {quote.submittedTime}
                </span>
              </div>

              {quote.description && (
                <p className="quote-description">
                  {quote.description.length > 150 ? quote.description.slice(0, 150) + "..." : quote.description}
                </p>
              )}

              {/* Quote Info Grid */}
              <div className="quote-info-grid">
                <div className="info-item">
                  <i className="fa-solid fa-money-bill-wave"></i>
                  <div>
                    <div className="info-label">Giá đề xuất</div>
                    <div className="info-value">{formatCurrency(quote.amount)}</div>
                  </div>
                </div>
                <div className="info-item">
                  <i className="fa-regular fa-clock"></i>
                  <div>
                    <div className="info-label">Thời gian hoàn thành</div>
                    <div className="info-value">{quote.duration}</div>
                  </div>
                </div>
                <div className="info-item">
                  <i className="fa-regular fa-calendar"></i>
                  <div>
                    <div className="info-label">Ngày gửi</div>
                    <div className="info-value">{formatDate(quote.submittedDate)}</div>
                  </div>
                </div>
              </div>

              <div className="quote-footer">
                {quote.request?.bids != null && (
                  <div className="quote-stats">
                    <span className="stat-item">
                      <i className="fa-solid fa-users"></i>
                      <strong>{quote.request.bids}</strong> báo giá
                    </span>
                  </div>
                )}
                <Link to={`/requests/${quote.requestId}`} className="btn-view-detail">
                  Xem yêu cầu <i className="fa-solid fa-arrow-right"></i>
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowDeleteModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <i
                  className="fa-solid fa-triangle-exclamation"
                  style={{ color: "#DC2626", marginRight: "12px" }}
                ></i>
                Xác nhận xóa báo giá
              </h3>
              <button
                className="modal-close"
                onClick={() => setShowDeleteModal(false)}
              >
                <i className="fa-solid fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <p
                style={{
                  fontSize: "15px",
                  lineHeight: "1.6",
                  color: "#475569",
                  marginBottom: "16px",
                }}
              >
                Bạn có chắc chắn muốn xóa báo giá này không? Hành động này không
                thể hoàn tác.
              </p>
              <div
                style={{
                  background: "#FEF2F2",
                  padding: "16px",
                  borderRadius: "8px",
                  border: "1px solid #FEE2E2",
                }}
              >
                <p
                  style={{
                    fontSize: "14px",
                    color: "#991B1B",
                    margin: 0,
                    lineHeight: "1.6",
                  }}
                >
                  <i
                    className="fa-solid fa-info-circle"
                    style={{ marginRight: "8px" }}
                  ></i>
                  <b>Lưu ý:</b> Người thuê sẽ không còn thấy báo giá của bạn.
                </p>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => setShowDeleteModal(false)}
              >
                Hủy bỏ
              </button>
              <button className="btn-danger" onClick={handleDeleteQuote}>
                <i className="fa-solid fa-trash"></i>
                Xóa báo giá
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyQuotesPage;
