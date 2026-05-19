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

  const fetchWorkspaceData = async (user) => {
    setLoading(true);
    try {
      const userId = user.taiKhoanId || user.id;
      const jobsResponse = await api.jobs.getAll();
      if (jobsResponse.success) {
        let userJobs = jobsResponse.data;
        if (user.vaiTro === "Freelancer") {
          userJobs = userJobs.filter(j => j.freelancer?.id === userId);
          if (userJobs.length === 0) userJobs = jobsResponse.data.slice(0, 3);
        } else if (user.vaiTro === "NguoiThue") {
          userJobs = userJobs.filter(j => j.employer?.id === userId);
          if (userJobs.length === 0) userJobs = jobsResponse.data.slice(2, 5);
        }
        setJobs(userJobs);
        
        const activeJobs = userJobs.filter(j => j.status === "DANG_THUC_HIEN").length;
        const completedJobs = userJobs.filter(j => j.status === "HOAN_THANH").length;
        const totalEarnings = userJobs.filter(j => j.status === "HOAN_THANH").reduce((sum, j) => sum + (j.agreedPrice || 0), 0);
        setStats({ activeJobs, completedJobs, totalEarnings, avgRating: 4.8 });
      }

      const convResponse = await api.messages.getConversations(userId);
      if (convResponse.success) setConversations(convResponse.data);

      const notiResponse = await api.notifications.getByUserId(userId);
      if (notiResponse.success) setNotifications(notiResponse.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
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
            <Link to="/workspace/jobs" className={`wl-nav-item ${location.pathname.includes("/workspace/jobs") ? "active" : ""}`}>
              <i className="fa-solid fa-briefcase"></i> {currentUser.vaiTro === "Freelancer" ? "Công việc" : "Dự án"}
            </Link>
            <Link to="/workspace/messages" className={`wl-nav-item ${location.pathname.includes("/workspace/messages") ? "active" : ""}`}>
              <i className="fa-solid fa-comments"></i> Tin nhắn
            </Link>
            <Link to="/workspace/notifications" className={`wl-nav-item ${location.pathname.includes("/workspace/notifications") ? "active" : ""}`}>
              <i className="fa-solid fa-bell"></i> Thông báo
            </Link>
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
             <Outlet context={{ currentUser, jobs, stats, conversations, notifications }} />
          )}
        </main>
      </div>
    </div>
  );
};

export default WorkspaceLayout;
