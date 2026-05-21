import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import "./WorkspacePage.css";

const WorkspacePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("client");
  const [activeMenu, setActiveMenu] = useState("projects");
  const [employerProjects, setEmployerProjects] = useState([]);
  const [freelancerProjects, setFreelancerProjects] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tabCounts, setTabCounts] = useState({ client: 0, freelancer: 0 });

  useEffect(() => {
    // Lấy thông tin user từ localStorage
    const storedUser = localStorage.getItem("user");
    let currentUser = null;
    if (storedUser) {
      try {
        currentUser = JSON.parse(storedUser);
        setUser(currentUser);
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }

    const userId = currentUser?.id || 2; // Mặc định ID 2 (Nguyễn Văn An) nếu chưa đăng nhập để hiển thị dữ liệu demo
    fetchWorkspaceData(userId);
    fetchStats(userId, currentUser?.role || "NGUOI_THUE");
  }, []);

  const fetchWorkspaceData = async (userId) => {
    try {
      setLoading(true);
      
      // 1. Gọi API thực tế lấy danh sách yêu cầu của Người thuê (Employer requests)
      const requestsRes = await api.requests.getAll();
      let empProj = [];
      if (requestsRes.success) {
        const allRequests = requestsRes.data?.data || [];
        empProj = allRequests.filter(
          (req) => req.employer?.id === userId && req.status === "DANG_MOI_THAU"
        );
      }

      // 2. Gọi API thực tế lấy danh sách công việc của Freelancer (Freelancer jobs)
      const jobsRes = await api.jobs.getAll({ freelancerId: userId });
      let freeProj = [];
      if (jobsRes.success) {
        const allJobs = jobsRes.data || [];
        freeProj = allJobs.filter(
          (job) => job.status === "DANG_THUC_HIEN"
        );
      }

      setEmployerProjects(empProj);
      setFreelancerProjects(freeProj);
      setTabCounts({
        client: empProj.length,
        freelancer: freeProj.length,
      });

      console.log("Workspace Data loaded from real APIs:", {
        employerRequests: empProj,
        freelancerJobs: freeProj,
      });
    } catch (error) {
      console.error("Error loading workspace data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async (userId, role) => {
    try {
      const response = await api.workspace.getStats(userId, role);
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleMenuClick = (menu) => {
    setActiveMenu(menu);
  };

  const handleTabClick = (type) => {
    setActiveTab(type);
  };

  const handleCreateRequest = () => {
    navigate("/post-request");
  };

  // Helper định dạng ngày tháng
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString("vi-VN");
  };

  // Helper tính toán và định dạng thời gian của Freelancer Job
  const getJobDuration = (job) => {
    if (!job.startDate) return "";
    const start = formatDate(job.startDate);
    if (!job.endDate) return start;
    
    const sDate = new Date(job.startDate);
    const eDate = new Date(job.endDate);
    if (isNaN(sDate.getTime()) || isNaN(eDate.getTime())) {
      return `${start} - ${job.endDate}`;
    }
    const diffTime = Math.abs(eDate - sDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${start} - ${diffDays} ngày`;
  };

  // Helper định dạng tiền tệ
  const formatCurrency = (amount) => {
    if (!amount) return "";
    if (typeof amount === "string") {
      if (amount.includes("VNĐ") || amount.includes("VND")) return amount;
      const parsed = parseFloat(amount.replace(/[^0-9]/g, ""));
      if (!isNaN(parsed)) {
        return new Intl.NumberFormat("vi-VN").format(parsed) + " VNĐ";
      }
      return amount;
    }
    return new Intl.NumberFormat("vi-VN").format(amount) + " VNĐ";
  };

  // Helper lấy thông tin hiển thị ngân sách/khoảng ngân sách
  const getBudgetDisplay = (project) => {
    if (project.budgetMin && project.budgetMax) {
      return `Ngân sách: ${formatCurrency(project.budgetMin)} - ${formatCurrency(project.budgetMax)}`;
    }
    const b = project.budget || project.agreedPriceText || project.agreedPrice;
    if (!b) return "Ngân sách: Thương lượng";
    const formatted = formatCurrency(b);
    if (formatted.startsWith("Ngân sách:")) return formatted;
    return `Ngân sách: ${formatted}`;
  };

  return (
    <div className="workspace-container">
      {/* Header */}
      <div className="workspace-header">
        <div className="workspace-header-content">
          <div className="workspace-title-section">
            <h1>Không gian làm việc</h1>
            {user?.role === "NGUOI_THUE" && (
              <span className="workspace-badge client">Người thuê</span>
            )}
            {user?.role === "FREELANCER" && (
              <span className="workspace-badge freelancer">Freelancer</span>
            )}
            {!user && (
              <span className="workspace-badge client">Người thuê</span>
            )}
          </div>
        </div>
      </div>

      <div className="workspace-main">
        {/* Sidebar */}
        <aside className="workspace-sidebar">
          <nav className="sidebar-nav">
            <button
              className={`sidebar-item ${activeMenu === "overview" ? "active" : ""}`}
              onClick={() => handleMenuClick("overview")}
            >
              <i className="fa-solid fa-chart-line"></i>
              Tổng quan
            </button>

            <button
              className={`sidebar-item ${activeMenu === "projects" ? "active" : ""}`}
              onClick={() => handleMenuClick("projects")}
            >
              <i className="fa-solid fa-briefcase"></i>
              Dự án
            </button>

            <button
              className={`sidebar-item ${activeMenu === "messages" ? "active" : ""}`}
              onClick={() => handleMenuClick("messages")}
            >
              <i className="fa-solid fa-message"></i>
              Tin nhắn
            </button>

            <button
              className={`sidebar-item ${activeMenu === "notifications" ? "active" : ""}`}
              onClick={() => handleMenuClick("notifications")}
            >
              <i className="fa-solid fa-bell"></i>
              Thông báo
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="workspace-content">
          {activeMenu === "projects" && (
            <div className="projects-section">
              {/* Projects Header */}
              <div className="projects-header">
                <div>
                  <h2>Dự án của tôi</h2>
                </div>
                <button
                  className="btn-create-request"
                  onClick={handleCreateRequest}
                >
                  <i className="fa-solid fa-plus"></i>
                  Đăng yêu cầu mới
                </button>
              </div>

              {/* Tabs */}
              <div className="projects-tabs">
                <button
                  className={`tab-button ${activeTab === "client" ? "active" : ""}`}
                  onClick={() => handleTabClick("client")}
                >
                  Người thuê ({tabCounts.client})
                </button>
                <button
                  className={`tab-button ${activeTab === "freelancer" ? "active" : ""}`}
                  onClick={() => handleTabClick("freelancer")}
                >
                  Freelancer ({tabCounts.freelancer})
                </button>
              </div>

              {/* Projects List */}
              <div className="projects-list">
                {loading ? (
                  <div className="loading">Đang tải...</div>
                ) : activeTab === "client" ? (
                  // PHẦN HIỂN THỊ DÀNH CHO NGƯỜI THUÊ (DỰ ÁN ĐANG NHẬN HỒ SƠ)
                  employerProjects.length > 0 ? (
                    employerProjects.map((project) => (
                      <div
                        key={project.id}
                        className="project-card"
                        onClick={() => navigate(`/requests/${project.id}`)}
                      >
                        <div className="project-card-content">
                          <div className="project-card-header">
                            <h3 className="project-title">{project.title}</h3>
                            <span className="project-badge-status open">Đang nhận hồ sơ</span>
                          </div>

                          <div className="project-meta">
                            <div className="meta-item">
                              <i className="fa-solid fa-users"></i>
                              <span>{project.bids || 0} báo giá</span>
                            </div>
                            <div className="meta-item">
                              <i className="fa-solid fa-clock"></i>
                              <span>Đăng {formatDate(project.postedDate) || project.postedTime || "Chưa xác định"}</span>
                            </div>
                          </div>

                          <p className="project-description">
                            {project.description}
                          </p>

                          <hr className="project-card-divider" />

                          <div className="project-card-footer">
                            <div className="project-budget">
                              {getBudgetDisplay(project)}
                            </div>
                            <div className="project-status-footer pending">
                              <i className="fa-solid fa-hourglass-half"></i>
                              <span>Đang chờ</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-projects">
                      <i className="fa-solid fa-inbox"></i>
                      <p>Không có yêu cầu tuyển dụng đang nhận hồ sơ nào</p>
                    </div>
                  )
                ) : (
                  // PHẦN HIỂN THỊ DÀNH CHO FREELANCER (DỰ ÁN ĐANG NHẬN LÀM)
                  freelancerProjects.length > 0 ? (
                    freelancerProjects.map((project) => (
                      <div
                        key={project.id}
                        className="project-card"
                        onClick={() => navigate(`/requests/${project.requestId || project.id}/progress`)}
                      >
                        <div className="project-card-content">
                          <div className="project-card-header">
                            <h3 className="project-title">{project.title}</h3>
                            <span className="project-badge-status working">Đang làm</span>
                          </div>

                          <div className="project-meta">
                            <div className="meta-item">
                              <i className="fa-solid fa-user"></i>
                              <span>{project.employer?.name || "Chưa xác định"}</span>
                            </div>
                            <div className="meta-item">
                              <i className="fa-solid fa-clock"></i>
                              <span>{getJobDuration(project)}</span>
                            </div>
                          </div>

                          <p className="project-description">
                            {project.description}
                          </p>

                          <hr className="project-card-divider" />

                          <div className="project-card-footer">
                            <div className="project-budget">
                              {formatCurrency(project.agreedPrice || project.budget) || "Chưa thỏa thuận"}
                            </div>
                            <div className="project-status-footer in-progress">
                              <i className="fa-solid fa-circle-play"></i>
                              <span>Đang thực hiện</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-projects">
                      <i className="fa-solid fa-inbox"></i>
                      <p>Không có công việc đang nhận làm nào</p>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {activeMenu === "overview" && (
            <div className="overview-section">
              {stats ? (
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-icon">
                      <i className="fa-solid fa-briefcase"></i>
                    </div>
                    <div className="stat-content">
                      <h3>{stats.projectCount}</h3>
                      <p>Tổng dự án</p>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon active">
                      <i className="fa-solid fa-spinner"></i>
                    </div>
                    <div className="stat-content">
                      <h3>{stats.activeCount}</h3>
                      <p>Đang hoạt động</p>
                    </div>
                  </div>

                  {user?.role === "NGUOI_THUE" && (
                    <div className="stat-card">
                      <div className="stat-icon completed">
                        <i className="fa-solid fa-check-circle"></i>
                      </div>
                      <div className="stat-content">
                        <h3>{stats.completedCount}</h3>
                        <p>Đã hoàn thành</p>
                      </div>
                    </div>
                  )}

                  {user?.role === "FREELANCER" && (
                    <div className="stat-card">
                      <div className="stat-icon earnings">
                        <i className="fa-solid fa-dollar-sign"></i>
                      </div>
                      <div className="stat-content">
                        <h3>${stats.totalEarnings}</h3>
                        <p>Tổng thu nhập</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="overview-placeholder">
                  <i className="fa-solid fa-chart-line"></i>
                  <h2>Tổng quan</h2>
                  <p>Các số liệu và thống kê của bạn sẽ hiển thị tại đây</p>
                </div>
              )}
            </div>
          )}

          {activeMenu === "messages" && (
            <div className="messages-section">
              <div className="placeholder">
                <i className="fa-solid fa-message"></i>
                <h2>Tin nhắn</h2>
                <p>Các cuộc trò chuyện của bạn sẽ hiển thị tại đây</p>
              </div>
            </div>
          )}

          {activeMenu === "notifications" && (
            <div className="notifications-section">
              <div className="placeholder">
                <i className="fa-solid fa-bell"></i>
                <h2>Thông báo</h2>
                <p>Các thông báo của bạn sẽ hiển thị tại đây</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default WorkspacePage;
