import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import PostRequestPage from '../PostRequest/PostRequestPage';
import './WorkspacePage.css';

const mockComplaints = [
  {
    id: 'KN-2026-001',
    nguoiKhieuNai: 'Nguyễn Văn A (Người thuê)',
    nguoiBiKhieuNai: 'Trần Văn B (Freelancer)',
    duAn: 'Xây dựng Website Thương mại điện tử',
    lyDo: 'Freelancer không bàn giao source code đúng hạn như cam kết trong hợp đồng mặc dù đã nhận tạm ứng 30%.',
    ngayTao: '05/05/2026',
    trangThai: 'CHUA_XU_LY',
    mucDo: 'Cao'
  },
  {
    id: 'KN-2026-002',
    nguoiKhieuNai: 'Lê Thị C (Freelancer)',
    nguoiBiKhieuNai: 'Công ty TNHH ABC (Người thuê)',
    duAn: 'Thiết kế bộ nhận diện thương hiệu',
    lyDo: 'Khách hàng từ chối thanh toán 50% chi phí còn lại sau khi đã nhận đầy đủ file thiết kế gốc.',
    ngayTao: '04/05/2026',
    trangThai: 'DANG_XEM_XET',
    mucDo: 'Nghiêm trọng'
  },
  {
    id: 'KN-2026-003',
    nguoiKhieuNai: 'Hệ thống tự động',
    nguoiBiKhieuNai: 'Phạm Minh E (Freelancer)',
    duAn: 'Lập trình ứng dụng di động',
    lyDo: 'Phát hiện mã độc trong các file được tải lên hệ thống dự án. Nghi ngờ vi phạm an toàn thông tin.',
    ngayTao: '06/05/2026',
    trangThai: 'CHUA_XU_LY',
    mucDo: 'Rất cao'
  }
];

const WorkspacePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // overview, jobs, messages, notifications
  const [currentUser, setCurrentUser] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [stats, setStats] = useState({
    activeJobs: 0,
    completedJobs: 0,
    totalEarnings: 0,
    avgRating: 0
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setCurrentUser(user);
        fetchWorkspaceData(user);
      } catch (error) {
        console.error('Error parsing user data:', error);
        navigate('/login');
      }
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const fetchWorkspaceData = async (user) => {
    setLoading(true);
    try {
      const userId = user.taiKhoanId || user.id;
      
      // Fetch jobs (Mock API)
      const jobsResponse = await api.jobs.getAll();
      if (jobsResponse.success) {
        let userJobs = jobsResponse.data;
        
        // Simulate data filtering based on roles since mock API might return all
        if (user.vaiTro === 'Freelancer') {
          userJobs = userJobs.filter(j => j.freelancer?.id === user.taiKhoanId || j.freelancer?.id === user.id);
          if (userJobs.length === 0) userJobs = jobsResponse.data.slice(0, 3 + ((user.taiKhoanId || user.id || 0) % 3));
        } else if (user.vaiTro === 'NguoiThue') {
          userJobs = userJobs.filter(j => j.employer?.id === user.taiKhoanId || j.employer?.id === user.id);
          if (userJobs.length === 0) userJobs = jobsResponse.data.slice(2, 6 + ((user.taiKhoanId || user.id || 0) % 2));
        } else if (user.vaiTro === 'DonViGiamSat') {
          userJobs = jobsResponse.data.slice(0, 8); 
        }

        setJobs(userJobs);
        
        // Calculate stats based on filtered jobs
        const activeJobs = userJobs.filter(j => j.status === 'DANG_THUC_HIEN').length;
        const completedJobs = userJobs.filter(j => j.status === 'HOAN_THANH').length;
        const totalEarnings = userJobs
          .filter(j => j.status === 'HOAN_THANH')
          .reduce((sum, j) => sum + (j.agreedPrice || 0), 0);
        const ratings = userJobs
          .filter(j => j.rating && j.rating.score)
          .map(j => j.rating.score);
        const avgRating = ratings.length > 0 
          ? (ratings.reduce((sum, r) => sum + r, 0) / ratings.length).toFixed(1)
          : 0;

        // Apply custom stats for Supervisor
        if (user.vaiTro === 'DonViGiamSat') {
           setStats({
              activeJobs: 12, // Mock system-wide active
              completedJobs: 45, // Mock system-wide completed
              totalEarnings: 0,
              avgRating: 0
           });
        } else {
           setStats({
              activeJobs,
              completedJobs,
              totalEarnings,
              avgRating
           });
        }
      }

      // Fetch conversations
      const conversationsResponse = await api.messages.getConversations(userId);
      if (conversationsResponse.success) {
        setConversations(conversationsResponse.data);
      }

      // Fetch notifications
      const notificationsResponse = await api.notifications.getByUserId(userId);
      if (notificationsResponse.success) {
        setNotifications(notificationsResponse.data);
      }
    } catch (error) {
      console.error('Error fetching workspace data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + ' VNĐ';
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'DANG_THUC_HIEN': { text: 'Đang thực hiện', class: 'status-active' },
      'HOAN_THANH': { text: 'Hoàn thành', class: 'status-completed' },
      'DA_HUY': { text: 'Đã hủy', class: 'status-cancelled' }
    };
    const statusInfo = statusMap[status] || { text: status, class: '' };
    return <span className={`status-badge ${statusInfo.class}`}>{statusInfo.text}</span>;
  };

  if (loading) {
    return (
      <div className="loading-state">
        <i className="fa-solid fa-circle-notch fa-spin"></i>
        <p>Đang tải không gian làm việc...</p>
      </div>
    );
  }

  const allowedRoles = ['NguoiThue', 'Freelancer', 'DonViGiamSat'];
  const hasWorkspaceAccess = currentUser && allowedRoles.includes(currentUser.vaiTro);

  if (!hasWorkspaceAccess) {
    return (
      <div className="workspace-page">
        <div className="workspace-header">
          <div className="workspace-container">
            <h1 className="workspace-title">Không gian làm việc</h1>
          </div>
        </div>
        <div className="workspace-container" style={{ marginTop: '40px' }}>
          <div className="empty-state">
            <i className="fa-solid fa-lock" style={{ fontSize: '64px', color: '#CBD5E1', marginBottom: '20px' }}></i>
            <h3 style={{ fontSize: '24px', color: 'var(--navy)', marginBottom: '12px' }}>Không có quyền truy cập</h3>
            <p style={{ color: '#64748B', fontSize: '16px', lineHeight: '1.6' }}>
              Không có không gian làm việc dành cho vai trò <strong>{currentUser?.vaiTro || 'của bạn'}</strong>.<br/>
              Chỉ <strong>Người thuê</strong>, <strong>Freelancer</strong> và <strong>Đơn vị giám sát</strong> mới có quyền truy cập khu vực này.
            </p>
            <div style={{ marginTop: '24px' }}>
              <Link to="/" className="btn-primary">
                <i className="fa-solid fa-home"></i> Về trang chủ
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="workspace-page">
      {/* Header */}
      <div className="workspace-header">
        <div className="workspace-container">
          <div className="header-content">
            <div>
              <h1 className="workspace-title">Không gian làm việc</h1>
              <p className="workspace-subtitle">Quản lý công việc và giao tiếp với khách hàng</p>
            </div>
          </div>
        </div>
      </div>

      <div className="workspace-container">

        {/* Main Layout (Sidebar + Content) */}
        <div className="workspace-main-layout">
          {/* Tabs Sidebar */}
          <div className="workspace-sidebar">
            <div className="workspace-tabs">
              <button
                className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                <i className="fa-solid fa-chart-line"></i>
                Tổng quan
              </button>
              <button
                className={`tab-btn ${activeTab === 'jobs' ? 'active' : ''}`}
                onClick={() => setActiveTab('jobs')}
              >
                <i className="fa-solid fa-briefcase"></i>
                {currentUser?.vaiTro === 'Freelancer' ? 'Công việc' : 'Dự án'} ({jobs.length})
              </button>
              <button
                className={`tab-btn ${activeTab === 'messages' ? 'active' : ''}`}
                onClick={() => setActiveTab('messages')}
              >
                <i className="fa-solid fa-comments"></i>
                Tin nhắn
                {conversations.filter(c => c.unreadCount > 0).length > 0 && (
                  <span className="badge">{conversations.filter(c => c.unreadCount > 0).length}</span>
                )}
              </button>
              <button
                className={`tab-btn ${activeTab === 'notifications' ? 'active' : ''}`}
                onClick={() => setActiveTab('notifications')}
              >
                <i className="fa-solid fa-bell"></i>
                Thông báo
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="badge">{notifications.filter(n => !n.read).length}</span>
                )}
              </button>
              {currentUser?.vaiTro === 'DonViGiamSat' && (
                <button
                  className={`tab-btn ${activeTab === 'complaints' ? 'active' : ''}`}
                  onClick={() => setActiveTab('complaints')}
                >
                  <i className="fa-solid fa-scale-balanced"></i>
                  Xử lý khiếu nại
                  <span className="badge" style={{background: '#EA580C', boxShadow: '0 2px 5px rgba(234, 88, 12, 0.3)'}}>5</span>
                </button>
              )}
            </div>
          </div>

          {/* Tab Content Area */}
          <div className="workspace-content-area">
            <div className="tab-content">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="overview-content">
                  {/* Stats Cards */}
                  <div className="stats-grid">
                    {currentUser?.vaiTro === 'Freelancer' && (
                      <>
                        <div className="stat-card">
                          <div className="stat-icon" style={{background: '#EFF6FF', color: '#0EA5E9'}}>
                            <i className="fa-solid fa-briefcase"></i>
                          </div>
                          <div className="stat-info">
                            <div className="stat-value">{stats.activeJobs}</div>
                            <div className="stat-label">Công việc đang làm</div>
                          </div>
                        </div>
                        <div className="stat-card">
                          <div className="stat-icon" style={{background: '#F0FDF4', color: '#16A34A'}}>
                            <i className="fa-solid fa-check-circle"></i>
                          </div>
                          <div className="stat-info">
                            <div className="stat-value">{stats.completedJobs}</div>
                            <div className="stat-label">Đã hoàn thành</div>
                          </div>
                        </div>
                        <div className="stat-card">
                          <div className="stat-icon" style={{background: '#FEF3C7', color: '#D97706'}}>
                            <i className="fa-solid fa-wallet"></i>
                          </div>
                          <div className="stat-info">
                            <div className="stat-value">{formatCurrency(stats.totalEarnings)}</div>
                            <div className="stat-label">Tổng thu nhập</div>
                          </div>
                        </div>
                        <div className="stat-card">
                          <div className="stat-icon" style={{background: '#FEF2F2', color: '#DC2626'}}>
                            <i className="fa-solid fa-star"></i>
                          </div>
                          <div className="stat-info">
                            <div className="stat-value">{stats.avgRating}/5.0</div>
                            <div className="stat-label">Đánh giá trung bình</div>
                          </div>
                        </div>
                      </>
                    )}

                    {currentUser?.vaiTro === 'NguoiThue' && (
                      <>
                        <div className="stat-card">
                          <div className="stat-icon" style={{background: '#EFF6FF', color: '#0EA5E9'}}>
                            <i className="fa-solid fa-file-contract"></i>
                          </div>
                          <div className="stat-info">
                            <div className="stat-value">{stats.activeJobs}</div>
                            <div className="stat-label">Dự án đang thuê</div>
                          </div>
                        </div>
                        <div className="stat-card">
                          <div className="stat-icon" style={{background: '#F0FDF4', color: '#16A34A'}}>
                            <i className="fa-solid fa-check-circle"></i>
                          </div>
                          <div className="stat-info">
                            <div className="stat-value">{stats.completedJobs}</div>
                            <div className="stat-label">Dự án hoàn thành</div>
                          </div>
                        </div>
                        <div className="stat-card">
                          <div className="stat-icon" style={{background: '#FEF3C7', color: '#D97706'}}>
                            <i className="fa-solid fa-money-bill-wave"></i>
                          </div>
                          <div className="stat-info">
                            <div className="stat-value">{formatCurrency(stats.totalEarnings)}</div>
                            <div className="stat-label">Tổng chi phí</div>
                          </div>
                        </div>
                        <div className="stat-card">
                          <div className="stat-icon" style={{background: '#F3E8FF', color: '#9333EA'}}>
                            <i className="fa-solid fa-users"></i>
                          </div>
                          <div className="stat-info">
                            <div className="stat-value">{stats.activeJobs + stats.completedJobs}</div>
                            <div className="stat-label">Freelancer đã hợp tác</div>
                          </div>
                        </div>
                      </>
                    )}

                    {currentUser?.vaiTro === 'DonViGiamSat' && (
                      <>
                        <div className="stat-card">
                          <div className="stat-icon" style={{background: '#EFF6FF', color: '#0EA5E9'}}>
                            <i className="fa-solid fa-shield-halved"></i>
                          </div>
                          <div className="stat-info">
                            <div className="stat-value">{stats.activeJobs}</div>
                            <div className="stat-label">Dự án đang giám sát</div>
                          </div>
                        </div>
                        <div className="stat-card">
                          <div className="stat-icon" style={{background: '#F0FDF4', color: '#16A34A'}}>
                            <i className="fa-solid fa-file-circle-check"></i>
                          </div>
                          <div className="stat-info">
                            <div className="stat-value">{stats.completedJobs}</div>
                            <div className="stat-label">Dự án đã nghiệm thu</div>
                          </div>
                        </div>
                        <div className="stat-card">
                          <div className="stat-icon" style={{background: '#FEF2F2', color: '#DC2626'}}>
                            <i className="fa-solid fa-triangle-exclamation"></i>
                          </div>
                          <div className="stat-info">
                            <div className="stat-value">2</div>
                            <div className="stat-label">Báo cáo vi phạm</div>
                          </div>
                        </div>
                        <div className="stat-card">
                          <div className="stat-icon" style={{background: '#FFF7ED', color: '#EA580C'}}>
                            <i className="fa-solid fa-scale-balanced"></i>
                          </div>
                          <div className="stat-info">
                            <div className="stat-value">5</div>
                            <div className="stat-label">Xử lý khiếu nại</div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="overview-grid">
                    {/* Active Jobs */}
                    <div className="overview-section">
                      <div className="section-header">
                        <h3>Công việc đang làm</h3>
                        <Link to="#" onClick={() => setActiveTab('jobs')}>Xem tất cả</Link>
                      </div>
                      <div className="jobs-list">
                        {jobs.filter(j => j.status === 'DANG_THUC_HIEN').slice(0, 3).map(job => (
                          <div key={job.id} className="job-item">
                            <div className="job-header">
                              <h4>{job.title}</h4>
                              {getStatusBadge(job.status)}
                            </div>
                            <div className="job-meta">
                              <span><i className="fa-solid fa-user"></i> {currentUser?.vaiTro === 'NguoiThue' ? job.freelancer?.name : job.employer?.name}</span>
                              <span><i className="fa-solid fa-calendar"></i> Hạn: {job.endDate}</span>
                            </div>
                            <div className="job-progress">
                              <div className="progress-bar">
                                <div className="progress-fill" style={{width: `${job.progress}%`}}></div>
                              </div>
                              <span className="progress-text">{job.progress}%</span>
                            </div>
                            <div className="job-footer">
                              <span className="job-price">{job.agreedPriceText}</span>
                              <Link to={`/jobs/${job.id}`} className="btn-view">Xem chi tiết</Link>
                            </div>
                          </div>
                        ))}
                        {jobs.filter(j => j.status === 'DANG_THUC_HIEN').length === 0 && (
                          <div className="empty-state-small">
                            <i className="fa-regular fa-folder-open"></i>
                            <p>Chưa có công việc đang làm</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Recent Messages */}
                    <div className="overview-section">
                      <div className="section-header">
                        <h3>Tin nhắn gần đây</h3>
                        <Link to="#" onClick={() => setActiveTab('messages')}>Xem tất cả</Link>
                      </div>
                      <div className="messages-list">
                        {conversations.slice(0, 5).map(conv => (
                          <div key={conv.id} className="message-item" onClick={() => navigate(`/messages/${conv.id}`)}>
                            <img src={conv.participant1.avatar} alt={conv.participant1.name} className="message-avatar" />
                            <div className="message-content">
                              <div className="message-header">
                                <h4>{conv.participant1.name}</h4>
                                <span className="message-time">{conv.lastMessageTimeText}</span>
                              </div>
                              <p className="message-preview">{conv.lastMessage}</p>
                            </div>
                            {conv.unreadCount > 0 && (
                              <span className="unread-badge">{conv.unreadCount}</span>
                            )}
                          </div>
                        ))}
                        {conversations.length === 0 && (
                          <div className="empty-state-small">
                            <i className="fa-regular fa-comments"></i>
                            <p>Chưa có tin nhắn nào</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Jobs Tab */}
              {activeTab === 'jobs' && (
                <div className="jobs-content">
                  {showCreateProject && currentUser?.vaiTro === 'NguoiThue' ? (
                    <PostRequestPage isEmbedded={true} onCancel={() => setShowCreateProject(false)} />
                  ) : (
                    <>
                      <div className="jobs-header-actions" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '24px', flexWrap: 'wrap'}}>
                        <div className="jobs-filters" style={{marginBottom: 0}}>
                          <button className="filter-btn active">Tất cả ({jobs.length})</button>
                          <button className="filter-btn">Đang làm ({jobs.filter(j => j.status === 'DANG_THUC_HIEN').length})</button>
                          <button className="filter-btn">Hoàn thành ({jobs.filter(j => j.status === 'HOAN_THANH').length})</button>
                        </div>
                        {currentUser?.vaiTro === 'NguoiThue' && (
                          <button className="btn-primary" onClick={() => setShowCreateProject(true)} style={{padding: '10px 24px', borderRadius: '12px', whiteSpace: 'nowrap', width: 'fit-content', height: 'fit-content'}}>
                            <i className="fa-solid fa-plus" style={{marginRight: '8px'}}></i> Đăng yêu cầu thuê mới
                          </button>
                        )}
                      </div>
                      <div className="jobs-grid">
                        {jobs.map(job => (
                          <div key={job.id} className="job-card">
                            <div className="job-card-header">
                              <h3>{job.title}</h3>
                              {getStatusBadge(job.status)}
                            </div>
                            <p className="job-description">{job.description.substring(0, 120)}...</p>
                            <div className="job-meta-grid">
                              <div className="meta-item">
                                <i className="fa-solid fa-user"></i>
                                <span>{currentUser?.vaiTro === 'NguoiThue' ? job.freelancer?.name : job.employer?.name}</span>
                              </div>
                              <div className="meta-item">
                                <i className="fa-solid fa-calendar"></i>
                                <span>{job.startDate} - {job.endDate}</span>
                              </div>
                              <div className="meta-item">
                                <i className="fa-solid fa-money-bill-wave"></i>
                                <span>{job.agreedPriceText}</span>
                              </div>
                              {job.status === 'DANG_THUC_HIEN' && (
                                <div className="meta-item">
                                  <i className="fa-solid fa-chart-line"></i>
                                  <span>Tiến độ: {job.progress}%</span>
                                </div>
                              )}
                            </div>
                            {job.status === 'HOAN_THANH' && job.rating && (
                              <div className="job-rating">
                                <div className="stars">
                                  {[...Array(5)].map((_, i) => (
                                    <i key={i} className={`fa-solid fa-star ${i < job.rating.score ? 'filled' : ''}`}></i>
                                  ))}
                                </div>
                                <span>{job.rating.score}/5.0</span>
                              </div>
                            )}
                            <div className="job-card-footer">
                              <Link to={`/jobs/${job.id}`} className="btn-view-detail">
                                Xem chi tiết
                                <i className="fa-solid fa-arrow-right"></i>
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Messages Tab */}
              {activeTab === 'messages' && (
                <div className="messages-content">
                  <div className="conversations-list">
                    {conversations.map(conv => (
                      <div 
                        key={conv.id} 
                        className={`conversation-item ${conv.unreadCount > 0 ? 'unread' : ''}`}
                        onClick={() => navigate(`/messages/${conv.id}`)}
                      >
                        <img src={conv.participant1.avatar} alt={conv.participant1.name} className="conv-avatar" />
                        <div className="conv-content">
                          <div className="conv-header">
                            <h4>{conv.participant1.name}</h4>
                            <span className="conv-time">{conv.lastMessageTimeText}</span>
                          </div>
                          {conv.requestTitle && (
                            <p className="conv-request">{conv.requestTitle}</p>
                          )}
                          <p className="conv-message">{conv.lastMessage}</p>
                        </div>
                        {conv.unreadCount > 0 && (
                          <span className="conv-unread">{conv.unreadCount}</span>
                        )}
                      </div>
                    ))}
                    {conversations.length === 0 && (
                      <div className="empty-state">
                        <i className="fa-regular fa-comments"></i>
                        <h3>Chưa có cuộc trò chuyện nào</h3>
                        <p>Khi bạn gửi báo giá hoặc nhận được tin nhắn, chúng sẽ xuất hiện ở đây</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div className="notifications-content">
                  <div className="notifications-list">
                    {notifications.map(notif => (
                      <div key={notif.id} className={`notification-item ${!notif.read ? 'unread' : ''}`}>
                        <div className="notif-icon">
                          {notif.type === 'BAO_GIA' && <i className="fa-solid fa-file-invoice"></i>}
                          {notif.type === 'CONG_VIEC' && <i className="fa-solid fa-briefcase"></i>}
                          {notif.type === 'THANH_TOAN' && <i className="fa-solid fa-money-bill-wave"></i>}
                          {notif.type === 'HE_THONG' && <i className="fa-solid fa-bell"></i>}
                          {notif.type === 'YEU_CAU' && <i className="fa-solid fa-clipboard-list"></i>}
                        </div>
                        <div className="notif-content">
                          <h4>{notif.title}</h4>
                          <p>{notif.content}</p>
                          <span className="notif-time">{notif.createdTime}</span>
                        </div>
                        {!notif.read && <span className="notif-dot"></span>}
                      </div>
                    ))}
                    {notifications.length === 0 && (
                      <div className="empty-state">
                        <i className="fa-regular fa-bell"></i>
                        <h3>Chưa có thông báo nào</h3>
                        <p>Các thông báo về công việc, tin nhắn và thanh toán sẽ xuất hiện ở đây</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Complaints Tab */}
              {activeTab === 'complaints' && currentUser?.vaiTro === 'DonViGiamSat' && (
                <div className="complaints-content">
                  <div className="section-header" style={{marginBottom: '24px'}}>
                    <h2 style={{fontSize: '22px', color: 'var(--navy)', margin: 0}}>Danh sách khiếu nại chờ xử lý</h2>
                    <span style={{color: '#64748B', fontSize: '14px'}}>Hiển thị {mockComplaints.length} khiếu nại</span>
                  </div>

                  <div className="complaints-list">
                    {mockComplaints.map(complaint => (
                      <div key={complaint.id} className="complaint-card">
                        <div className="complaint-header">
                          <div className="complaint-id">
                            <i className="fa-solid fa-file-shield" style={{color: '#EA580C'}}></i>
                            Mã số: {complaint.id}
                          </div>
                          <div className="complaint-date">Ngày báo cáo: {complaint.ngayTao}</div>
                        </div>

                        <div className="complaint-body">
                          <div className="complaint-info-group">
                            <label>Người khiếu nại</label>
                            <span><i className="fa-regular fa-user" style={{marginRight: '6px', color: '#64748B'}}></i>{complaint.nguoiKhieuNai}</span>
                          </div>
                          <div className="complaint-info-group">
                            <label>Người bị khiếu nại</label>
                            <span><i className="fa-solid fa-user-xmark" style={{marginRight: '6px', color: '#DC2626'}}></i>{complaint.nguoiBiKhieuNai}</span>
                          </div>
                          <div className="complaint-info-group" style={{gridColumn: 'span 2'}}>
                            <label>Dự án liên quan</label>
                            <span style={{fontWeight: '600', color: 'var(--navy)'}}>{complaint.duAn}</span>
                          </div>
                          <div className="complaint-reason">
                            <strong style={{display: 'block', marginBottom: '4px'}}>Lý do khiếu nại:</strong>
                            {complaint.lyDo}
                          </div>
                        </div>

                        <div className="complaint-footer">
                          <button className="btn-primary" style={{padding: '8px 16px', fontSize: '14px'}}>
                            <i className="fa-solid fa-gavel"></i> Xem xét / Phân xử
                          </button>
                          <button className="btn-warning">
                            <i className="fa-solid fa-envelope"></i> Yêu cầu giải trình
                          </button>
                          <button className="btn-danger" style={{marginLeft: 'auto'}}>
                            <i className="fa-solid fa-lock"></i> Đóng băng tài khoản
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkspacePage;
