import { useState, useEffect } from "react";
import { Link, useOutletContext, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { isFreelancerRole } from "../../utils/role";
import "./WorkspaceMyQuotes.css";

/**
 * Trang quản lý báo giá đã gửi (chỉ dành cho Freelancer)
 * Hiển thị danh sách báo giá với link đến bài yêu cầu gốc
 *
 * API: GET /freelancers/:id/proposals
 */
const WorkspaceMyQuotes = () => {
  const { currentUser, showToast } = useOutletContext();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [quotes, setQuotes] = useState([]);
  const [filter, setFilter] = useState("all");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [quoteToDelete, setQuoteToDelete] = useState(null);
  const [error, setError] = useState(null);

  // ============ Lifecycle ============
  useEffect(() => {
    if (!currentUser) return;
    if (!isFreelancerRole(currentUser.vaiTro)) {
      setLoading(false);
      return;
    }

    const loadQuotes = async () => {
      let fId = currentUser.freelancerId;

      // Nếu chưa có freelancerId → gọi profile API để lấy
      if (!fId) {
        try {
          const profileRes = await api.users.getProfile(currentUser.taiKhoanId);
          fId = profileRes?.profile?.freelancer?.freelancerId;
          if (fId) {
            // Cập nhật localStorage để lần sau không cần gọi lại
            const updated = { ...currentUser, freelancerId: fId };
            localStorage.setItem("user", JSON.stringify(updated));
          }
        } catch (err) {
          console.warn("Không lấy được freelancerId từ profile:", err.message);
        }
      }

      // Fallback cuối cùng: dùng taiKhoanId
      if (!fId) fId = currentUser.taiKhoanId;

      fetchMyQuotes(fId);
    };

    loadQuotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  const fetchMyQuotes = async (freelancerId) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.proposals.getByFreelancerId(freelancerId);
      const list = Array.isArray(res)
        ? res
        : Array.isArray(res?.proposals)
          ? res.proposals
          : Array.isArray(res?.data)
            ? res.data
            : [];

      const mapped = list.map((p) => ({
        id: p.baoGiaId,
        requestId: p.yeuCauId,
        amount: Number(p.giaDeXuat ?? 0),
        duration: `${p.thoiGianThucHien ?? 0} ngày`,
        durationDays: p.thoiGianThucHien,
        description: p.noiDung ?? "",
        status: p.trangThai, // DaGui | DuocChon | DaTuChoi | DaHuy
        submittedDate: p.ngayTao,
        submittedTime: p.ngayTao
          ? new Date(p.ngayTao).toLocaleDateString("vi-VN")
          : "",
        request: p.yeuCau
          ? {
              id: p.yeuCau.yeuCauId,
              title: p.yeuCau.tieuDe,
              category: p.yeuCau.loaiDichVu?.tenLoai ?? "",
              bids: p.yeuCau.soLuongBaoGia ?? 0,
              budget:
                p.yeuCau.nganSachMin && p.yeuCau.nganSachMax
                  ? `${Number(p.yeuCau.nganSachMin).toLocaleString("vi-VN")} – ${Number(p.yeuCau.nganSachMax).toLocaleString("vi-VN")} VNĐ`
                  : null,
            }
          : null,
      }));

      setQuotes(mapped);
    } catch (err) {
      console.error("Error fetching quotes:", err);
      setError(err.message || "Không thể tải danh sách báo giá");
      setQuotes([]);
    } finally {
      setLoading(false);
    }
  };

  // ============ Helpers ============
  const getFilteredQuotes = () => {
    if (filter === "all") return quotes;
    if (filter === "pending") {
      return quotes.filter((q) => q.status === "DaGui" || q.status === "ChoXacNhan");
    }
    if (filter === "accepted") {
      return quotes.filter((q) => q.status === "DuocChon" || q.status === "DaChapNhan");
    }
    if (filter === "rejected") {
      return quotes.filter((q) => q.status === "DaTuChoi" || q.status === "DaHuy");
    }
    return quotes;
  };

  const getStatusBadge = (status) => {
    const map = {
      DaGui: { text: "Đã gửi", cls: "wmq-badge-pending" },
      ChoXacNhan: { text: "Chờ xác nhận", cls: "wmq-badge-pending" },
      DuocChon: { text: "Được chọn", cls: "wmq-badge-accepted" },
      DaChapNhan: { text: "Đã chấp nhận", cls: "wmq-badge-accepted" },
      DaTuChoi: { text: "Bị từ chối", cls: "wmq-badge-rejected" },
      DaHuy: { text: "Đã hủy", cls: "wmq-badge-rejected" },
      HetHan: { text: "Hết hạn", cls: "wmq-badge-rejected" },
    };
    const info = map[status] || { text: status, cls: "" };
    return <span className={`wmq-badge ${info.cls}`}>{info.text}</span>;
  };

  const formatCurrency = (amount) => {
    if (!amount) return "0 VNĐ";
    return new Intl.NumberFormat("vi-VN").format(amount) + " VNĐ";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date)) return dateString;
    return date.toLocaleDateString("vi-VN");
  };

  const handleEditQuote = (quoteId) => {
    navigate(`/quotes/${quoteId}/edit`);
  };

  const handleDeleteQuote = async () => {
    if (!quoteToDelete) return;
    try {
      await api.proposals.delete(quoteToDelete);
      setQuotes((prev) => prev.filter((q) => q.id !== quoteToDelete));
      showToast("Xóa báo giá thành công!", "success");
    } catch (err) {
      console.error("Error deleting quote:", err);
      showToast(err.message || "Có lỗi xảy ra khi xóa báo giá!", "error");
    }
    setShowDeleteModal(false);
    setQuoteToDelete(null);
  };

  const openDeleteModal = (quoteId) => {
    setQuoteToDelete(quoteId);
    setShowDeleteModal(true);
  };

  // ============ Computed ============
  const pendingCount = quotes.filter((q) => q.status === "DaGui" || q.status === "ChoXacNhan").length;
  const acceptedCount = quotes.filter((q) => q.status === "DuocChon" || q.status === "DaChapNhan").length;
  const rejectedCount = quotes.filter((q) => q.status === "DaTuChoi" || q.status === "DaHuy").length;
  const filteredQuotes = getFilteredQuotes();

  // ============ Guard: chỉ Freelancer được vào ============
  if (!isFreelancerRole(currentUser?.vaiTro)) {
    return (
      <div className="wl-content-box">
        <div className="wmq-empty">
          <i className="fa-solid fa-lock"></i>
          <h3>Không có quyền truy cập</h3>
          <p>Trang này chỉ dành cho Freelancer để quản lý báo giá đã gửi.</p>
          <Link to="/workspace" className="wmq-btn-primary">
            <i className="fa-solid fa-arrow-left"></i> Về tổng quan
          </Link>
        </div>
      </div>
    );
  }

  // ============ Render ============
  return (
    <div className="wl-content-box wmq-page">
      {/* Header */}
      <div className="wl-content-header" style={{ marginBottom: 16 }}>
        <h2>Báo giá đã gửi</h2>
        <Link to="/requests" className="btn-wl-primary">
          <i className="fa-solid fa-search"></i> Tìm yêu cầu
        </Link>
      </div>

      {/* Stats */}
      <div className="wmq-stats">
        <div className="wmq-stat">
          <div className="wmq-stat-icon" style={{ background: "#EFF6FF", color: "#0EA5E9" }}>
            <i className="fa-solid fa-file-invoice"></i>
          </div>
          <div>
            <div className="wmq-stat-value">{quotes.length}</div>
            <div className="wmq-stat-label">Tổng báo giá</div>
          </div>
        </div>
        <div className="wmq-stat">
          <div className="wmq-stat-icon" style={{ background: "#FEF3C7", color: "#D97706" }}>
            <i className="fa-solid fa-clock"></i>
          </div>
          <div>
            <div className="wmq-stat-value">{pendingCount}</div>
            <div className="wmq-stat-label">Đang chờ</div>
          </div>
        </div>
        <div className="wmq-stat">
          <div className="wmq-stat-icon" style={{ background: "#F0FDF4", color: "#16A34A" }}>
            <i className="fa-solid fa-circle-check"></i>
          </div>
          <div>
            <div className="wmq-stat-value">{acceptedCount}</div>
            <div className="wmq-stat-label">Đã chấp nhận</div>
          </div>
        </div>
        <div className="wmq-stat">
          <div className="wmq-stat-icon" style={{ background: "#FEE2E2", color: "#DC2626" }}>
            <i className="fa-solid fa-circle-xmark"></i>
          </div>
          <div>
            <div className="wmq-stat-value">{rejectedCount}</div>
            <div className="wmq-stat-label">Bị từ chối</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="wmq-filters">
        <button
          className={`wmq-filter-btn ${filter === "all" ? "active" : ""}`}
          onClick={() => setFilter("all")}
        >
          Tất cả ({quotes.length})
        </button>
        <button
          className={`wmq-filter-btn ${filter === "pending" ? "active" : ""}`}
          onClick={() => setFilter("pending")}
        >
          Đang chờ ({pendingCount})
        </button>
        <button
          className={`wmq-filter-btn ${filter === "accepted" ? "active" : ""}`}
          onClick={() => setFilter("accepted")}
        >
          Đã chấp nhận ({acceptedCount})
        </button>
        <button
          className={`wmq-filter-btn ${filter === "rejected" ? "active" : ""}`}
          onClick={() => setFilter("rejected")}
        >
          Bị từ chối ({rejectedCount})
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="wmq-loading">
          <i className="fa-solid fa-circle-notch fa-spin"></i>
          <p>Đang tải danh sách báo giá...</p>
        </div>
      ) : error ? (
        <div className="wmq-empty">
          <i className="fa-solid fa-circle-exclamation" style={{ color: "#DC2626" }}></i>
          <h3>Lỗi tải dữ liệu</h3>
          <p>{error}</p>
        </div>
      ) : filteredQuotes.length === 0 ? (
        <div className="wmq-empty">
          <i className="fa-regular fa-folder-open"></i>
          <h3>Chưa có báo giá nào</h3>
          <p>Bắt đầu bằng cách tìm kiếm và gửi báo giá cho các yêu cầu phù hợp.</p>
          <Link to="/requests" className="wmq-btn-primary">
            <i className="fa-solid fa-search"></i> Tìm kiếm yêu cầu
          </Link>
        </div>
      ) : (
        <div className="wmq-list">
          {filteredQuotes.map((quote) => (
            <div key={quote.id} className="wmq-card">
              <div className="wmq-card-header">
                <div className="wmq-card-title-row">
                  <Link
                    to={`/requests/${quote.requestId}`}
                    className="wmq-card-title"
                    title="Xem chi tiết yêu cầu"
                  >
                    {quote.request?.title ?? `Yêu cầu #${quote.requestId}`}
                  </Link>
                  {getStatusBadge(quote.status)}
                </div>
                <div className="wmq-card-actions">
                  {(quote.status === "DaGui" || quote.status === "ChoXacNhan") && (
                    <button
                      className="wmq-btn-icon"
                      title="Chỉnh sửa"
                      onClick={() => handleEditQuote(quote.id)}
                    >
                      <i className="fa-solid fa-pen"></i>
                    </button>
                  )}
                  <button
                    className="wmq-btn-icon"
                    title="Xóa"
                    onClick={() => openDeleteModal(quote.id)}
                  >
                    <i className="fa-solid fa-trash"></i>
                  </button>
                </div>
              </div>

              {/* Meta */}
              <div className="wmq-card-meta">
                {quote.request?.category && (
                  <span className="wmq-meta-item">
                    <i className="fa-solid fa-tag"></i>
                    {quote.request.category}
                  </span>
                )}
                {quote.request?.budget && (
                  <span className="wmq-meta-item">
                    <i className="fa-solid fa-money-bill-wave"></i>
                    Ngân sách: {quote.request.budget}
                  </span>
                )}
                <span className="wmq-meta-item">
                  <i className="fa-regular fa-calendar"></i>
                  Gửi {quote.submittedTime}
                </span>
              </div>

              {/* Description */}
              {quote.description && (
                <p className="wmq-card-desc">
                  {quote.description.length > 180
                    ? quote.description.slice(0, 180) + "..."
                    : quote.description}
                </p>
              )}

              {/* Info grid */}
              <div className="wmq-info-grid">
                <div className="wmq-info-item">
                  <i className="fa-solid fa-money-bill-wave" style={{ color: "#16A34A" }}></i>
                  <div>
                    <div className="wmq-info-label">Giá đề xuất</div>
                    <div className="wmq-info-value">{formatCurrency(quote.amount)}</div>
                  </div>
                </div>
                <div className="wmq-info-item">
                  <i className="fa-regular fa-clock" style={{ color: "#0EA5E9" }}></i>
                  <div>
                    <div className="wmq-info-label">Thời gian thực hiện</div>
                    <div className="wmq-info-value">{quote.duration}</div>
                  </div>
                </div>
                <div className="wmq-info-item">
                  <i className="fa-regular fa-calendar" style={{ color: "#94A3B8" }}></i>
                  <div>
                    <div className="wmq-info-label">Ngày gửi</div>
                    <div className="wmq-info-value">{formatDate(quote.submittedDate)}</div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="wmq-card-footer">
                {quote.request?.bids != null && (
                  <span className="wmq-card-stat">
                    <i className="fa-solid fa-users"></i>
                    <strong>{quote.request.bids}</strong> báo giá cùng dự án
                  </span>
                )}
                <Link to={`/requests/${quote.requestId}`} className="wmq-link-detail">
                  Xem yêu cầu
                  <i className="fa-solid fa-arrow-right"></i>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="wmq-modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="wmq-modal" onClick={(e) => e.stopPropagation()}>
            <div className="wmq-modal-header">
              <h3>
                <i className="fa-solid fa-triangle-exclamation" style={{ color: "#DC2626", marginRight: 10 }}></i>
                Xác nhận xóa báo giá
              </h3>
              <button className="wmq-modal-close" onClick={() => setShowDeleteModal(false)}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="wmq-modal-body">
              <p>Bạn có chắc chắn muốn xóa báo giá này không? Hành động này không thể hoàn tác.</p>
              <div className="wmq-warning">
                <i className="fa-solid fa-info-circle"></i>
                <span><strong>Lưu ý:</strong> Người thuê sẽ không còn thấy báo giá của bạn.</span>
              </div>
            </div>
            <div className="wmq-modal-footer">
              <button className="wmq-btn-secondary" onClick={() => setShowDeleteModal(false)}>
                Hủy bỏ
              </button>
              <button className="wmq-btn-danger" onClick={handleDeleteQuote}>
                <i className="fa-solid fa-trash"></i> Xóa báo giá
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkspaceMyQuotes;
