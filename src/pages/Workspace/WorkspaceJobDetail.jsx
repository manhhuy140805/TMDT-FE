import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../../services/api";
import "./WorkspaceJobDetail.css";

const WorkspaceJobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [contract, setContract] = useState(null);
  const [progressList, setProgressList] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // Form thêm tiến độ
  const [showAddProgress, setShowAddProgress] = useState(false);
  const [newProgress, setNewProgress] = useState({ tieuDe: "", moTa: "", phanTram: 0 });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setCurrentUser(parsed?.user ?? parsed);
      } catch {
        navigate("/login");
      }
    } else {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    if (!id || !currentUser) return;
    fetchData();
  }, [id, currentUser]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [contractRes, progressRes, paymentsRes] = await Promise.allSettled([
        api.contracts.getDetail(id),
        api.progress.getByContractId(id),
        api.payments.getAll({ congViecId: id }),
      ]);

      // Contract
      if (contractRes.status === "fulfilled") {
        const c = contractRes.value?.contract || contractRes.value?.data || contractRes.value;
        setContract(c);
      } else {
        setError("Không tìm thấy hợp đồng");
      }

      // Progress
      if (progressRes.status === "fulfilled") {
        const list = progressRes.value?.progress || progressRes.value?.data || (Array.isArray(progressRes.value) ? progressRes.value : []);
        setProgressList(list);
      }

      // Payments
      if (paymentsRes.status === "fulfilled") {
        const list = paymentsRes.value?.payments || paymentsRes.value?.data || (Array.isArray(paymentsRes.value) ? paymentsRes.value : []);
        setPayments(list);
      }
    } catch (err) {
      setError(err.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  const handleAddProgress = async () => {
    if (!newProgress.tieuDe.trim()) return alert("Vui lòng nhập tiêu đề!");
    if (newProgress.phanTram < 0 || newProgress.phanTram > 100) return alert("Phần trăm phải từ 0-100!");

    setSubmitting(true);
    try {
      const userId = currentUser.taiKhoanId || currentUser.id;
      await api.progress.create(id, {
        congViecId: Number(id),
        freelancerId: userId,
        tieuDe: newProgress.tieuDe,
        moTa: newProgress.moTa || undefined,
        phanTram: Number(newProgress.phanTram),
      });
      setNewProgress({ tieuDe: "", moTa: "", phanTram: 0 });
      setShowAddProgress(false);
      // Reload progress
      const res = await api.progress.getByContractId(id);
      const list = res?.progress || res?.data || (Array.isArray(res) ? res : []);
      setProgressList(list);
    } catch (err) {
      alert("Lỗi: " + (err.message || "Không thể thêm tiến độ"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmProgress = async (progressId) => {
    try {
      await api.progress.update(progressId, { trangThaiXacNhan: "DaXacNhan" });
      setProgressList((prev) =>
        prev.map((p) => (p.tienDoId === progressId ? { ...p, trangThaiXacNhan: "DaXacNhan" } : p))
      );
    } catch (err) {
      alert("Lỗi: " + (err.message || "Không thể xác nhận"));
    }
  };

  const handleRejectProgress = async (progressId) => {
    try {
      await api.progress.update(progressId, { trangThaiXacNhan: "TuChoi" });
      setProgressList((prev) =>
        prev.map((p) => (p.tienDoId === progressId ? { ...p, trangThaiXacNhan: "TuChoi" } : p))
      );
    } catch (err) {
      alert("Lỗi: " + (err.message || "Không thể từ chối"));
    }
  };

  const handleCompleteContract = async () => {
    if (!confirm("Xác nhận hoàn thành hợp đồng? Hành động này không thể hoàn tác.")) return;
    try {
      await api.contracts.updateStatus(id, "HoanThanh");
      setContract((prev) => ({ ...prev, trangThai: "HoanThanh" }));
    } catch (err) {
      alert("Lỗi: " + (err.message || "Không thể cập nhật"));
    }
  };

  // Helpers
  const formatCurrency = (amount) => {
    if (!amount) return "0 VNĐ";
    return new Intl.NumberFormat("vi-VN").format(Number(amount)) + " VNĐ";
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    try {
      return new Date(dateStr).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
    } catch {
      return dateStr;
    }
  };

  const getLatestProgress = () => {
    if (progressList.length === 0) return 0;
    return Math.max(...progressList.map((p) => p.phanTram || 0));
  };

  const getStatusBadge = (status) => {
    const map = {
      DangThucHien: { bg: "#DBEAFE", color: "#1D4ED8", label: "Đang thực hiện" },
      HoanThanh: { bg: "#D1FAE5", color: "#047857", label: "Hoàn thành" },
      TamDung: { bg: "#FEF3C7", color: "#D97706", label: "Tạm dừng" },
      DaHuy: { bg: "#FEE2E2", color: "#DC2626", label: "Đã hủy" },
    };
    const s = map[status] || { bg: "#F1F5F9", color: "#64748B", label: status };
    return <span style={{ background: s.bg, color: s.color, padding: "4px 12px", borderRadius: "6px", fontSize: "13px", fontWeight: 600 }}>{s.label}</span>;
  };

  const getProgressStatusBadge = (status) => {
    const map = {
      ChoXacNhan: { bg: "#FEF3C7", color: "#D97706", label: "Chờ xác nhận" },
      DaXacNhan: { bg: "#D1FAE5", color: "#047857", label: "Đã xác nhận" },
      TuChoi: { bg: "#FEE2E2", color: "#DC2626", label: "Từ chối" },
    };
    const s = map[status] || { bg: "#F1F5F9", color: "#64748B", label: status || "Chờ xác nhận" };
    return <span style={{ background: s.bg, color: s.color, padding: "3px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: 600 }}>{s.label}</span>;
  };

  const userId = currentUser?.taiKhoanId || currentUser?.id;
  const isEmployer = contract && Number(contract.nguoiThue?.taiKhoanId) === Number(userId);
  const isFreelancer = contract && Number(contract.freelancer?.taiKhoanId) === Number(userId);
  const overallProgress = getLatestProgress();

  const systemHeldAmount = (Array.isArray(payments) ? payments : []).reduce((acc, p) => {
    if (p.trangThai === "ThanhCong") {
      if (p.loaiTT === "DatCoc") return acc + Number(p.soTien || 0);
      if (p.loaiTT === "ThanhToan" || p.loaiTT === "HoanTien") return acc - Number(p.soTien || 0);
    }
    return acc;
  }, 0);

  if (loading) {
    return (
      <div className="wjd-loading">
        <i className="fa-solid fa-circle-notch fa-spin"></i>
        <p>Đang tải thông tin hợp đồng...</p>
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div className="wjd-error">
        <i className="fa-solid fa-triangle-exclamation"></i>
        <h3>Không tìm thấy hợp đồng</h3>
        <p>{error || "Hợp đồng không tồn tại hoặc bạn không có quyền truy cập."}</p>
        <Link to="/workspace/jobs" className="wjd-btn-back">Quay lại danh sách</Link>
      </div>
    );
  }

  return (
    <div className="wjd-container">
      {/* Header */}
      <div className="wjd-header">
        <div className="wjd-header-left">
          <button className="wjd-back-btn" onClick={() => navigate("/workspace/jobs")}>
            <i className="fa-solid fa-arrow-left"></i>
          </button>
          <div>
            <h1 className="wjd-title">{contract.yeuCau?.tieuDe || "Công việc"}</h1>
            <div className="wjd-subtitle">
              Hợp đồng #{contract.congViecId} • {getStatusBadge(contract.trangThai)}
            </div>
          </div>
        </div>
      </div>

      <div className="wjd-grid">
        {/* Main Content */}
        <div className="wjd-main">
          {/* Progress Overview */}
          <div className="wjd-card">
            <div className="wjd-card-header">
              <h2>Tiến độ dự án</h2>
              <span className="wjd-progress-percent">{overallProgress}%</span>
            </div>
            <div className="wjd-progress-bar">
              <div className="wjd-progress-fill" style={{ width: `${overallProgress}%` }}></div>
            </div>

            <div className="wjd-card-actions">
              <h3>Lịch sử cập nhật tiến độ</h3>
              {isFreelancer && contract.trangThai === "DangThucHien" && (
                <button className="wjd-btn-primary" onClick={() => setShowAddProgress(true)}>
                  <i className="fa-solid fa-plus"></i> Cập nhật tiến độ
                </button>
              )}
            </div>

            {progressList.length === 0 ? (
              <div className="wjd-empty">
                <i className="fa-regular fa-calendar"></i>
                <p>Chưa có cập nhật tiến độ nào.</p>
              </div>
            ) : (
              <div className="wjd-timeline">
                {progressList.map((item) => (
                  <div key={item.tienDoId} className="wjd-timeline-item">
                    <div className={`wjd-timeline-dot ${item.trangThaiXacNhan === "DaXacNhan" ? "confirmed" : item.trangThaiXacNhan === "TuChoi" ? "rejected" : ""}`}></div>
                    <div className="wjd-timeline-content">
                      <div className="wjd-timeline-header">
                        <div>
                          <div className="wjd-timeline-title">{item.tieuDe}</div>
                          <div className="wjd-timeline-meta">
                            {formatDate(item.ngayTao)} • {item.phanTram}% hoàn thành
                            {" "}{getProgressStatusBadge(item.trangThaiXacNhan)}
                          </div>
                        </div>
                      </div>
                      {item.moTa && <div className="wjd-timeline-desc">{item.moTa}</div>}
                      {item.tepDinhKem && (
                        <a href={item.tepDinhKem} target="_blank" rel="noopener noreferrer" className="wjd-attachment">
                          <i className="fa-solid fa-paperclip"></i> Tệp đính kèm
                        </a>
                      )}
                      {isEmployer && item.trangThaiXacNhan === "ChoXacNhan" && (
                        <div className="wjd-timeline-actions">
                          <button className="wjd-btn-confirm" onClick={() => handleConfirmProgress(item.tienDoId)}>
                            <i className="fa-solid fa-check"></i> Xác nhận
                          </button>
                          <button className="wjd-btn-reject" onClick={() => handleRejectProgress(item.tienDoId)}>
                            <i className="fa-solid fa-times"></i> Từ chối
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Payments */}
          {payments.length > 0 && (
            <div className="wjd-card">
              <div className="wjd-card-header">
                <h2>Thanh toán</h2>
              </div>
              <div className="wjd-payments">
                {payments.map((p) => (
                  <div key={p.thanhToanId} className="wjd-payment-item">
                    <div className="wjd-payment-icon">
                      <i className={`fa-solid ${p.loaiTT === "DatCoc" ? "fa-lock" : p.loaiTT === "HoanTien" ? "fa-rotate-left" : "fa-credit-card"}`}></i>
                    </div>
                    <div className="wjd-payment-info">
                      <div className="wjd-payment-label">
                        {p.loaiTT === "DatCoc" ? "Đặt cọc" : p.loaiTT === "ThanhToan" ? "Thanh toán" : p.loaiTT === "HoanTien" ? "Hoàn tiền" : p.loaiTT}
                      </div>
                      <div className="wjd-payment-date">{formatDate(p.ngayTao)}</div>
                    </div>
                    <div className="wjd-payment-amount">{formatCurrency(p.soTien)}</div>
                    <div className={`wjd-payment-status ${p.trangThai === "ThanhCong" ? "success" : p.trangThai === "DaHoan" ? "refunded" : "pending"}`}>
                      {p.trangThai === "ThanhCong" ? "Thành công" : p.trangThai === "ChoXuLy" ? "Chờ xử lý" : p.trangThai === "DaHoan" ? "Đã hoàn" : p.trangThai}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="wjd-sidebar">
          <div className="wjd-card">
            <div className="wjd-card-header">
              <h2>Thông tin hợp đồng</h2>
            </div>
            <div className="wjd-info-list">
              <div className="wjd-info-item">
                <span className="wjd-info-label">Freelancer</span>
                <span className="wjd-info-value">{contract.freelancer?.hoTen || "—"}</span>
              </div>
              <div className="wjd-info-item">
                <span className="wjd-info-label">Người thuê</span>
                <span className="wjd-info-value">{contract.nguoiThue?.hoTen || "—"}</span>
              </div>
              <div className="wjd-info-item">
                <span className="wjd-info-label">Giá thỏa thuận</span>
                <span className="wjd-info-value wjd-info-highlight">{formatCurrency(contract.giaThoa)}</span>
              </div>
              <div className="wjd-info-item">
                <span className="wjd-info-label">Tiền hệ thống giữ</span>
                <span className="wjd-info-value" style={{ color: "#10B981", fontWeight: "bold" }}>
                  <i className="fa-solid fa-shield-halved" style={{ marginRight: '6px' }}></i>
                  {formatCurrency(systemHeldAmount > 0 ? systemHeldAmount : 0)}
                </span>
              </div>
              <div className="wjd-info-item">
                <span className="wjd-info-label">Thời hạn</span>
                <span className="wjd-info-value">{contract.thoiGianThoa ? `${contract.thoiGianThoa} ngày` : "—"}</span>
              </div>
              <div className="wjd-info-item">
                <span className="wjd-info-label">Ngày bắt đầu</span>
                <span className="wjd-info-value">{formatDate(contract.ngayBatDau)}</span>
              </div>
              <div className="wjd-info-item">
                <span className="wjd-info-label">Ngày kết thúc</span>
                <span className="wjd-info-value">{contract.ngayKetThuc ? formatDate(contract.ngayKetThuc) : "Chưa hoàn thành"}</span>
              </div>
              {contract.giamSat && (
                <div className="wjd-info-item">
                  <span className="wjd-info-label">Giám sát</span>
                  <span className="wjd-info-value">{contract.giamSat?.tenDonVi || "—"}</span>
                </div>
              )}
              <div className="wjd-info-item">
                <span className="wjd-info-label">Tiến độ</span>
                <span className="wjd-info-value wjd-info-highlight">{overallProgress}%</span>
              </div>
            </div>

            {isEmployer && contract.trangThai === "DangThucHien" && overallProgress >= 100 && (
              <button className="wjd-btn-complete" onClick={handleCompleteContract}>
                <i className="fa-solid fa-check-circle"></i> Xác nhận hoàn thành
              </button>
            )}
          </div>

          {/* Mô tả yêu cầu */}
          {contract.yeuCau?.moTa && (
            <div className="wjd-card">
              <div className="wjd-card-header">
                <h2>Mô tả yêu cầu</h2>
              </div>
              <p className="wjd-description">{contract.yeuCau.moTa}</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal thêm tiến độ */}
      {showAddProgress && (
        <div className="wjd-modal-overlay" onClick={() => setShowAddProgress(false)}>
          <div className="wjd-modal" onClick={(e) => e.stopPropagation()}>
            <div className="wjd-modal-header">
              <h3><i className="fa-solid fa-chart-line"></i> Cập nhật tiến độ</h3>
              <button className="wjd-modal-close" onClick={() => setShowAddProgress(false)}>
                <i className="fa-solid fa-times"></i>
              </button>
            </div>
            <div className="wjd-modal-body">
              <div className="wjd-form-group">
                <label>Tiêu đề <span style={{ color: "#EF4444" }}>*</span></label>
                <input
                  type="text"
                  value={newProgress.tieuDe}
                  onChange={(e) => setNewProgress({ ...newProgress, tieuDe: e.target.value })}
                  placeholder="VD: Hoàn thành thiết kế giao diện"
                />
              </div>
              <div className="wjd-form-group">
                <label>Phần trăm hoàn thành <span style={{ color: "#EF4444" }}>*</span></label>
                <div className="wjd-range-group">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={newProgress.phanTram}
                    onChange={(e) => setNewProgress({ ...newProgress, phanTram: e.target.value })}
                  />
                  <span className="wjd-range-value">{newProgress.phanTram}%</span>
                </div>
              </div>
              <div className="wjd-form-group">
                <label>Mô tả</label>
                <textarea
                  value={newProgress.moTa}
                  onChange={(e) => setNewProgress({ ...newProgress, moTa: e.target.value })}
                  placeholder="Mô tả chi tiết công việc đã hoàn thành..."
                  rows="4"
                />
              </div>
            </div>
            <div className="wjd-modal-footer">
              <button className="wjd-btn-cancel" onClick={() => setShowAddProgress(false)}>Hủy</button>
              <button className="wjd-btn-primary" onClick={handleAddProgress} disabled={submitting}>
                {submitting ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-plus"></i>}
                {" "}Thêm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkspaceJobDetail;
