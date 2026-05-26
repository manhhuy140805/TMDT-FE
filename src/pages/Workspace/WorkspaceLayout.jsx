import { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { getUserRole, isEmployerRole, isFreelancerRole, isSupervisorRole } from "../../utils/role";
import "./WorkspaceLayout.css";

export const mockComplaints = [
  { id: "KN-2026-001", nguoiKhieuNai: "Nguyễn Văn A", duAn: "Web TMĐT", trangThai: "CHUA_XU_LY", mucDo: "Cao" },
  { id: "KN-2026-002", nguoiKhieuNai: "Lê Thị C", duAn: "Thiết kế Logo", trangThai: "DANG_XEM_XET", mucDo: "Nghiêm trọng" }
];

const WorkspaceLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({ activeJobs: 0, completedJobs: 0, totalEarnings: 0, avgRating: 0 });

  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 4000);
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        // Handle cả data cũ dạng { message, user } lẫn data mới dạng user trực tiếp
        const user = parsed?.user ?? parsed;
        setCurrentUser(user);
        fetchWorkspaceData(user);
      } catch {
        navigate("/login");
      }
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const fetchWorkspaceData = async (user, options = {}) => {
    const { silent = false } = options;
    if (!silent) setLoading(true);
    const userId = user.taiKhoanId || user.id;

    // Chạy song song và xử lý lỗi độc lập, 1 endpoint fail không vỡ các phần khác.
    const [contractsRes, convRes, notiRes] = await Promise.allSettled([
      api.users.getContracts(userId),
      api.chat.getConversations(userId),
      api.notifications.getByUserId(userId),
    ]);

    // ── Contracts (thay thế jobs) ──
    if (contractsRes.status === "fulfilled") {
      const v = contractsRes.value;
      const all = v?.contracts || v?.data || (Array.isArray(v) ? v : []);
      setJobs(all);

      const activeJobs = all.filter((c) => c.trangThai === "DangThucHien").length;
      const completedJobs = all.filter((c) => c.trangThai === "HoanThanh").length;
      const totalEarnings = all
        .filter((c) => c.trangThai === "HoanThanh")
        .reduce((sum, c) => sum + (Number(c.giaThoa) || 0), 0);
      setStats({ activeJobs, completedJobs, totalEarnings, avgRating: 4.8 });

      // Enrich active contracts with refund request details
      const activeContracts = all.filter(c => c.trangThai === "DangThucHien");
      if (activeContracts.length > 0) {
        Promise.allSettled(
          activeContracts.map(c => api.refundRequests.getByContractId(c.congViecId))
        ).then((refundResults) => {
          const enriched = all.map((c, index) => {
            if (c.trangThai === "DangThucHien") {
              const activeIndex = activeContracts.findIndex(ac => ac.congViecId === c.congViecId);
              if (activeIndex !== -1 && refundResults[activeIndex]?.status === "fulfilled") {
                const resVal = refundResults[activeIndex].value;
                const rr = resVal?.refundRequest ?? 
                           resVal?.refundRequests ?? 
                           resVal?.data?.refundRequest ?? 
                           resVal?.data?.refundRequests ?? 
                           resVal?.data ?? 
                           resVal;
                const finalRR = Array.isArray(rr) ? rr[rr.length - 1] : rr;
                if (finalRR && (finalRR.trangThai || finalRR.status || finalRR.refundRequestId || finalRR.id)) {
                  return { ...c, refundRequest: finalRR };
                }
              }
            }
            return c;
          });
          setJobs(enriched);
        });
      }
    } else {
      console.warn("[workspace] contracts failed:", contractsRes.reason?.message);
    }

    // ── Conversations ──
    if (convRes.status === "fulfilled") {
      const v = convRes.value;
      const list = v?.conversations || v?.data || (Array.isArray(v) ? v : []);
      setConversations(list);
    } else {
      console.warn("[workspace] conversations failed:", convRes.reason?.message);
    }

    // ── Notifications ──
    if (notiRes.status === "fulfilled") {
      const v = notiRes.value;
      const list = v?.notifications || v?.data || (Array.isArray(v) ? v : []);
      setNotifications(list);
    } else {
      console.warn("[workspace] notifications failed:", notiRes.reason?.message);
    }

    if (!silent) setLoading(false);
  };

  if (!currentUser) return null;

  const allowedRoles = ["NguoiThue", "Freelancer", "DonViGiamSat"];
  if (!allowedRoles.includes(currentUser.vaiTro)) {
    return (
      <div className="wl-no-access">
        <i className="fa-solid fa-lock"></i>
        <h3>Không có quyền truy cập</h3>
        <p>Không gian làm việc này chỉ dành cho Người thuê, Freelancer và Đơn vị giám sát.</p>
        <Link to="/" className="btn-wl-primary">Về trang chủ</Link>
      </div>
    );
  }

  const roleTitle = isFreelancerRole(currentUser.vaiTro) ? "Freelancer" : isEmployerRole(currentUser.vaiTro) ? "Khách hàng" : "Giám sát";

  return (
    <div className="wl-container">
      {/* Workspace Header Strip */}
      <div className="wl-header-strip">
        <div className="wl-max-width">
          <div className="wl-header-info">
            <h1>Không gian làm việc</h1>
            <span className="wl-role-badge">{roleTitle}</span>
          </div>
        </div>
      </div>

      <div className="wl-max-width wl-main-grid">
        {/* Sidebar */}
        <aside className="wl-sidebar">
          <nav className="wl-nav">
            <Link to="/workspace" className={`wl-nav-item ${location.pathname === "/workspace" ? "active" : ""}`}>
              <i className="fa-solid fa-chart-line"></i> Tổng quan
            </Link>
            {currentUser.vaiTro === "NguoiThue" && (
              <Link to="/workspace/requests" className={`wl-nav-item ${location.pathname.includes("/workspace/requests") ? "active" : ""}`}>
                <i className="fa-solid fa-file-invoice-dollar"></i> Yêu cầu thuê
              </Link>
            )}
            {currentUser.vaiTro === "DonViGiamSat" && (
              <Link to="/workspace/requests" className={`wl-nav-item ${location.pathname.includes("/workspace/requests") ? "active" : ""}`}>
                <i className="fa-solid fa-file-shield"></i> Yêu cầu giám sát
              </Link>
            )}
            <Link to="/workspace/jobs" className={`wl-nav-item ${location.pathname.includes("/workspace/jobs") ? "active" : ""}`}>
              <i className="fa-solid fa-briefcase"></i> Công việc
            </Link>
            <Link to="/workspace/messages" className={`wl-nav-item ${location.pathname.includes("/workspace/messages") ? "active" : ""}`}>
              <i className="fa-solid fa-comments"></i> Tin nhắn
            </Link>
            <Link to="/workspace/notifications" className={`wl-nav-item ${location.pathname.includes("/workspace/notifications") ? "active" : ""}`}>
              <i className="fa-solid fa-bell"></i> Thông báo
            </Link>
            {isFreelancerRole(currentUser.vaiTro) && (
              <Link to="/workspace/my-quotes" className={`wl-nav-item ${location.pathname.includes("/workspace/my-quotes") ? "active" : ""}`}>
                <i className="fa-solid fa-file-invoice"></i> Báo giá đã gửi
              </Link>
            )}
            {currentUser.vaiTro === "DonViGiamSat" && (
              <Link to="/workspace/complaints" className={`wl-nav-item ${location.pathname.includes("/workspace/complaints") ? "active" : ""}`}>
                <i className="fa-solid fa-scale-balanced"></i> Xử lý khiếu nại
              </Link>
            )}
          </nav>
        </aside>

        {/* Dynamic Content */}
        <main className="wl-content">
          {loading ? (
             <div style={{ textAlign: "center", padding: "100px", color: "#64748B" }}>
               <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: "32px", marginBottom: "16px", color: "#0EA5E9" }}></i>
               <p>Đang tải dữ liệu...</p>
             </div>
          ) : (
             <Outlet
               context={{
                 currentUser,
                 jobs,
                 stats,
                 conversations,
                 notifications,
                 showToast,
                 refreshWorkspaceData: () => fetchWorkspaceData(currentUser, { silent: true }),
               }}
             />
          )}
        </main>
      </div>

      {toast.show && (
        <div className={`rd-toast rd-toast-${toast.type}`}>
          <div className="rd-toast-inner">
            {toast.type === "success" && <i className="fa-solid fa-circle-check rd-toast-icon"></i>}
            {toast.type === "error" && <i className="fa-solid fa-circle-xmark rd-toast-icon"></i>}
            {toast.type === "warning" && <i className="fa-solid fa-triangle-exclamation rd-toast-icon"></i>}
            <span className="rd-toast-msg">{toast.message}</span>
            <button className="rd-toast-close" onClick={() => setToast({ ...toast, show: false })}>
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkspaceLayout;
