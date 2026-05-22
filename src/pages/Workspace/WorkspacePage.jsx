import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../../utils/api";
import "./WorkspacePage.css";

const WorkspacePage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [user, setUser] = useState(null);
  const [activeMenu, setActiveMenu] = useState("projects");
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tabCounts, setTabCounts] = useState({ hiring: 0, progress: 0 });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const activeTab = searchParams.get("tab") || "hiring";

  useEffect(() => {
    // Lấy thông tin user từ localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser) {
          // Normalize role and name details
          let role = "FREELANCER";
          const r = parsedUser.role || parsedUser.vaiTro || "";
          const norm = r.toUpperCase().replace(/_/g, "");
          if (norm === "NGUOITHUE" || norm === "CLIENT") {
            role = "NGUOI_THUE";
          } else if (norm === "ADMIN") {
            role = "ADMIN";
          }

          const normalizedUser = {
            ...parsedUser,
            id: parsedUser.taiKhoanId || parsedUser.id,
            name: parsedUser.hoTen || parsedUser.name,
            role: role,
          };
          setUser(normalizedUser);
          console.log("Current user (normalized):", normalizedUser);
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchTabCounts();
      fetchProjects();
      fetchStats();
    }
  }, [user, activeTab]);

  const fetchTabCounts = async () => {
    if (!user) return;
    const userId = user.taiKhoanId || user.id;
    try {
      if (user.role === "NGUOI_THUE") {
        const response = await api.get(`/users/${userId}/jobs`);
        const jobs = response.jobs || [];
        const hiringCount = jobs.filter((j) => j.trangThai === "DangMo").length;
        const progressCount = jobs.filter((j) => j.trangThai === "DaDong").length;
        setTabCounts({
          hiring: hiringCount,
          progress: progressCount,
        });
      } else {
        // FREELANCER
        const response = await api.get(`/users/${userId}/contracts`);
        const contracts = response.contracts || [];
        const progressCount = contracts.filter((c) => c.trangThai === "DangThucHien").length;
        setTabCounts({
          hiring: 0,
          progress: progressCount,
        });
      }
    } catch (error) {
      console.error("Error fetching tab counts:", error);
    }
  };

  const fetchProjects = async () => {
    if (!user) return;
    const userId = user.taiKhoanId || user.id;
    try {
      setLoading(true);
      let mapped = [];
      if (user.role === "NGUOI_THUE") {
        const response = await api.get(`/users/${userId}/jobs`);
        const jobs = response.jobs || [];
        
        // Map backend jobs to frontend structure
        mapped = jobs.map((job) => {
          const minBudget = job.nganSachMin ? Number(job.nganSachMin).toLocaleString("vi-VN") : "0";
          const maxBudget = job.nganSachMax ? Number(job.nganSachMax).toLocaleString("vi-VN") : "0";
          return {
            id: job.yeuCauId,
            title: job.tieuDe,
            description: job.moTa,
            category: job.loaiDichVu?.tenLoai || "Khác",
            bids: job.soLuongBaoGia || 0,
            budget: `${minBudget} - ${maxBudget} VNĐ`,
            status: job.trangThai,
            postedDate: job.ngayTao,
          };
        });

        // Filter projects based on activeTab
        let filtered = [];
        if (activeTab === "hiring") {
          filtered = mapped.filter((p) => p.status === "DangMo");
        } else if (activeTab === "progress") {
          filtered = mapped.filter((p) => p.status === "DaDong");
        } else {
          filtered = mapped;
        }

        // Enrich with contract and progress details for progress tab
        if (activeTab === "progress" && filtered.length > 0) {
          try {
            const contractsRes = await api.get(`/users/${userId}/contracts`);
            const contracts = contractsRes.contracts || [];
            
            filtered = await Promise.all(filtered.map(async (project) => {
              const contract = contracts.find(c => c.yeuCauId === project.id);
              if (contract) {
                let progressPercent = 0;
                let progressNotes = "Đang hoàn thành các hạng mục công việc.";
                try {
                  const progressRes = await api.get(`/contracts/${contract.congViecId}/progress`);
                  const progressList = progressRes.progress || [];
                  if (progressList.length > 0) {
                    const latest = progressList[0];
                    progressPercent = latest.phanTram || 0;
                    progressNotes = latest.moTa || latest.tieuDe || "Đang thực hiện công việc.";
                  }
                } catch (pe) {
                  console.error("Error fetching progress for contract", contract.congViecId, pe);
                }

                return {
                  ...project,
                  job: {
                    contractId: contract.congViecId,
                    freelancer: {
                      name: contract.freelancer?.taiKhoan?.hoTen || "Không rõ",
                      avatar: contract.freelancer?.taiKhoan?.avatar || "https://png.pngtree.com/png-vector/20251230/ourlarge/pngtree-cartoon-character-avatar-png-image_18347258.webp",
                      rating: 5.0
                    },
                    progress: progressPercent,
                    notes: progressNotes
                  }
                };
              }
              
              return {
                ...project,
                job: {
                  freelancer: {
                    name: "Chưa xác định",
                    avatar: "https://png.pngtree.com/png-vector/20251230/ourlarge/pngtree-cartoon-character-avatar-png-image_18347258.webp",
                    rating: 5.0
                  },
                  progress: 0,
                  notes: "Hợp đồng đang được thiết lập."
                }
              };
            }));
          } catch (ce) {
            console.error("Error enriching client contracts:", ce);
          }
        }
        
        setProjects(filtered);
        setPagination({
          page: 1,
          limit: 100,
          total: filtered.length,
          totalPages: 1,
        });

      } else {
        // FREELANCER
        const response = await api.get(`/users/${userId}/contracts`);
        const contracts = response.contracts || [];
        
        mapped = await Promise.all(contracts.map(async (c) => {
          const budgetVal = c.giaThoa ? `${Number(c.giaThoa).toLocaleString("vi-VN")} VNĐ` : "Thỏa thuận";
          
          let progressPercent = 0;
          let progressNotes = "Đang hoàn thành các hạng mục công việc.";
          try {
            const progressRes = await api.get(`/contracts/${c.congViecId}/progress`);
            const progressList = progressRes.progress || [];
            if (progressList.length > 0) {
              const latest = progressList[0];
              progressPercent = latest.phanTram || 0;
              progressNotes = latest.moTa || latest.tieuDe || "Đang thực hiện công việc.";
            }
          } catch (pe) {
            console.error("Error fetching progress for contract", c.congViecId, pe);
          }

          return {
            id: c.yeuCau?.yeuCauId || c.congViecId,
            title: c.yeuCau?.tieuDe || "Dự án Freelance",
            description: c.yeuCau?.moTa || "",
            category: "Dịch vụ Freelance",
            bids: 0,
            budget: budgetVal,
            status: c.trangThai === "DangThucHien" ? "DaDong" : "HoanThanh",
            postedDate: c.ngayTao,
            job: {
              contractId: c.congViecId,
              freelancer: {
                name: c.freelancer?.taiKhoan?.hoTen || user.hoTen,
                avatar: c.freelancer?.taiKhoan?.avatar || "https://png.pngtree.com/png-vector/20251230/ourlarge/pngtree-cartoon-character-avatar-png-image_18347258.webp",
                rating: 5.0
              },
              progress: progressPercent,
              notes: progressNotes
            }
          };
        }));

        let filtered = [];
        if (activeTab === "progress") {
          filtered = mapped.filter((p) => p.status === "DaDong");
        } else {
          filtered = mapped;
        }

        setProjects(filtered);
        setPagination({
          page: 1,
          limit: 100,
          total: filtered.length,
          totalPages: 1,
        });
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    if (!user) return;
    const userId = user.taiKhoanId || user.id;
    try {
      if (user.role === "NGUOI_THUE") {
        const response = await api.get(`/users/${userId}/jobs`);
        const jobs = response.jobs || [];
        setStats({
          projectCount: jobs.length,
          activeCount: jobs.filter((j) => j.trangThai === "DaDong").length,
          completedCount: jobs.filter((j) => j.trangThai === "HoanThanh").length,
        });
      } else {
        // FREELANCER
        const response = await api.get(`/users/${userId}/contracts`);
        const contracts = response.contracts || [];
        const totalEarnings = contracts
          .filter((c) => c.trangThai === "HoanThanh")
          .reduce((sum, c) => sum + Number(c.giaThoa || 0), 0);
        setStats({
          projectCount: contracts.length,
          activeCount: contracts.filter((c) => c.trangThai === "DangThucHien").length,
          completedCount: contracts.filter((c) => c.trangThai === "HoanThanh").length,
          totalEarnings: totalEarnings.toLocaleString("vi-VN")
        });
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleMenuClick = (menu) => {
    setActiveMenu(menu);
  };

  const handleTabClick = (type) => {
    setSearchParams({ tab: type });
  };

  const handleCreateRequest = () => {
    navigate("/post-request");
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
              className={`sidebar-item ${activeMenu === "projects" ? `active ${activeTab}` : ""}`}
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

              {/* Projects Tabs Capsule */}
              <div className="workspace-page-tabs-capsule">
                <button
                  className={`workspace-page-tab-pill hiring ${
                    activeTab === "hiring" ? "active" : ""
                  }`}
                  onClick={() => handleTabClick("hiring")}
                >
                  Đang tuyển dụng
                  <span className="tab-pill-count">{tabCounts.hiring}</span>
                </button>
                <button
                  className={`workspace-page-tab-pill progress ${
                    activeTab === "progress" ? "active" : ""
                  }`}
                  onClick={() => handleTabClick("progress")}
                >
                  Đang thực hiện
                  <span className="tab-pill-count">{tabCounts.progress}</span>
                </button>
              </div>

              {/* Projects List */}
              <div className="projects-list">
                {loading ? (
                  <div className="loading">Đang tải...</div>
                ) : projects && projects.length > 0 ? (
                  projects.map((project) => {
                    if (activeTab === "hiring") {
                      return (
                        <div
                          key={project.id}
                          className="project-card recruiting-card"
                          onClick={() => navigate(`/requests/${project.id}`)}
                        >
                          <div className="card-row-1">
                            <h3 className="project-title">{project.title}</h3>
                            <span className="project-category-badge">{project.category || "Khác"}</span>
                          </div>
                          
                          <div className="card-row-2">
                            <div className="bids-badge-container">
                              {project.bids > 0 ? (
                                <span className="bids-badge active">
                                  <i className="fa-solid fa-users"></i> {project.bids} hồ sơ mới
                                </span>
                              ) : (
                                <span className="bids-badge empty">
                                  <i className="fa-solid fa-users"></i> 0 hồ sơ
                                </span>
                              )}
                            </div>
                            <div className="project-budget-display">
                              <span className="budget-label">Ngân sách:</span>
                              <span className="budget-value">{project.budget || "Thỏa thuận"}</span>
                            </div>
                          </div>

                          <div className="card-row-3">
                            <button className="card-action-btn view-bids" onClick={(e) => { e.stopPropagation(); navigate(`/requests/${project.id}`); }}>
                              Xem hồ sơ <i className="fa-solid fa-arrow-right"></i>
                            </button>
                            <button className="card-action-btn edit-project" onClick={(e) => { e.stopPropagation(); navigate(`/edit-request/${project.id}`); }}>
                              Chỉnh sửa <i className="fa-solid fa-arrow-right"></i>
                            </button>
                          </div>
                        </div>
                      );
                    } else {
                      // progress
                      return (
                        <div
                          key={project.id}
                          className="project-card in-progress-card"
                          onClick={() => navigate(`/requests/${project.id}`)}
                        >
                          <div className="progress-card-header">
                            <h3 className="project-title">{project.title}</h3>
                            <span className="project-category-badge">{project.category || "Khác"}</span>
                          </div>
                          
                          <div className="freelancer-details-block">
                            <div className="freelancer-info">
                              <img
                                src={project.job?.freelancer?.avatar || "https://png.pngtree.com/png-vector/20251230/ourlarge/pngtree-cartoon-character-avatar-png-image_18347258.webp"}
                                alt={project.job?.freelancer?.name}
                                className="freelancer-avatar"
                                onError={(e) => {
                                  e.target.src = "https://png.pngtree.com/png-vector/20251230/ourlarge/pngtree-cartoon-character-avatar-png-image_18347258.webp";
                                }}
                              />
                              <div className="freelancer-text">
                                <span className="freelancer-name">{project.job?.freelancer?.name || "Nguyễn Văn A"}</span>
                                <div className="freelancer-rating">
                                  <i className="fa-solid fa-star"></i>
                                  <span>{project.job?.freelancer?.rating || 4.9}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="milestone-details">
                              <span className="milestone-label">Chi tiết công việc:</span>
                              <p className="milestone-notes">{project.job?.notes || "Đang hoàn thành các hạng mục công việc."}</p>
                            </div>
                          </div>

                          <div className="progress-bar-section">
                            <div className="progress-bar-label">
                              <span>Tiến độ</span>
                              <span>{project.job?.progress || 45}%</span>
                            </div>
                            <div className="progress-bar-track">
                              <div className="progress-bar-fill" style={{ width: `${project.job?.progress || 45}%` }}></div>
                            </div>
                          </div>

                          <div className="progress-card-footer">
                            <div className="project-budget-display">
                              <span className="budget-label">Ngân sách thống nhất: </span>
                              <span className="budget-value">{project.budget || "Thỏa thuận"}</span>
                            </div>
                            <button className="card-action-btn manage-project" onClick={(e) => { e.stopPropagation(); navigate(`/requests/${project.id}`); }}>
                              Quản lý <i className="fa-solid fa-arrow-right"></i>
                            </button>
                          </div>
                        </div>
                      );
                    }
                  })
                ) : (
                  <div className="no-projects">
                    <i className="fa-solid fa-inbox"></i>
                    <p>Không có dự án nào</p>
                  </div>
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
