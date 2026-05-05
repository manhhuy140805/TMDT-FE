import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './MyRequestsPage.css';

const MyRequestsPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState('all');
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setCurrentUser(user);
        fetchMyRequests(user.id);
      } catch (error) {
        console.error('Error parsing user data:', error);
        navigate('/login');
      }
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const fetchMyRequests = async (userId) => {
    setLoading(true);
    try {
      const response = await api.requests.getAll();
      if (response.success) {
        const myRequests = response.data.data.filter(
          req => req.employer.id === userId
        );
        setRequests(myRequests);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredRequests = () => {
    if (filter === 'all') return requests;
    if (filter === 'active') {
      return requests.filter(req => 
        req.status === 'DANG_MOI_THAU' || req.status === 'DA_CHON_BAO_GIA'
      );
    }
    if (filter === 'closed') {
      return requests.filter(req => req.status === 'DA_DONG');
    }
    return requests;
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'DANG_MOI_THAU': { text: 'Đang nhận hồ sơ', class: 'status-active' },
      'DA_CHON_BAO_GIA': { text: 'Đã chọn báo giá', class: 'status-selected' },
      'DA_DONG': { text: 'Đã đóng', class: 'status-closed' }
    };
    const statusInfo = statusMap[status] || { text: status, class: '' };
    return <span className={`status-badge ${statusInfo.class}`}>{statusInfo.text}</span>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  const formatCurrency = (amount) => {
    if (!amount) return '0 VNĐ';
    return new Intl.NumberFormat('vi-VN').format(amount) + ' VNĐ';
  };

  const filteredRequests = getFilteredRequests();

  if (loading) {
    return (
      <div className="loading-state">
        <i className="fa-solid fa-circle-notch fa-spin"></i>
        <p>Đang tải danh sách yêu cầu...</p>
      </div>
    );
  }

  return (
    <div className="my-requests-page" style={{background: '#F8FAFC'}}>
      {/* Hero Banner */}
      <div className="d-hero" style={{paddingBottom: '80px'}}>
        <div className="d-hero-content" style={{textAlign: 'center'}}>
          <h1 className="d-title">Quản lý Yêu cầu của tôi</h1>
          <p className="d-meta" style={{justifyContent: 'center', maxWidth: '600px', margin: '16px auto 0'}}>
            Theo dõi và quản lý tất cả các yêu cầu tuyển dụng freelancer của bạn
          </p>
        </div>
      </div>

      <div className="page-container" style={{maxWidth: '1200px', margin: '0 auto', padding: '0 20px'}}>
        <div className="my-requests-layout">
          {/* Main Content */}
          <main className="requests-main">
            {/* Stats Cards */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon" style={{background: '#EFF6FF', color: '#0EA5E9'}}>
                  <i className="fa-solid fa-file-lines"></i>
                </div>
                <div className="stat-info">
                  <div className="stat-value">{requests.length}</div>
                  <div className="stat-label">Tổng yêu cầu</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{background: '#F0FDF4', color: '#16A34A'}}>
                  <i className="fa-solid fa-clock"></i>
                </div>
                <div className="stat-info">
                  <div className="stat-value">
                    {requests.filter(r => r.status === 'DANG_MOI_THAU').length}
                  </div>
                  <div className="stat-label">Đang nhận hồ sơ</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{background: '#FEF3C7', color: '#D97706'}}>
                  <i className="fa-solid fa-check-circle"></i>
                </div>
                <div className="stat-info">
                  <div className="stat-value">
                    {requests.filter(r => r.status === 'DA_CHON_BAO_GIA').length}
                  </div>
                  <div className="stat-label">Đã chọn báo giá</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{background: '#F3F4F6', color: '#6B7280'}}>
                  <i className="fa-solid fa-archive"></i>
                </div>
                <div className="stat-info">
                  <div className="stat-value">
                    {requests.filter(r => r.status === 'DA_DONG').length}
                  </div>
                  <div className="stat-label">Đã đóng</div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="filters-bar">
              <button
                className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                Tất cả ({requests.length})
              </button>
              <button
                className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
                onClick={() => setFilter('active')}
              >
                Đang hoạt động ({requests.filter(r => r.status === 'DANG_MOI_THAU' || r.status === 'DA_CHON_BAO_GIA').length})
              </button>
              <button
                className={`filter-btn ${filter === 'closed' ? 'active' : ''}`}
                onClick={() => setFilter('closed')}
              >
                Đã đóng ({requests.filter(r => r.status === 'DA_DONG').length})
              </button>
            </div>

            {/* Requests List */}
            <div className="requests-list">
              {filteredRequests.length === 0 ? (
                <div className="empty-state">
                  <i className="fa-regular fa-folder-open"></i>
                  <h3>Chưa có yêu cầu nào</h3>
                  <p>Bắt đầu bằng cách tạo yêu cầu tuyển dụng freelancer đầu tiên của bạn</p>
                  <Link to="/post-request" className="btn-create-first">
                    <i className="fa-solid fa-plus"></i>
                    Tạo yêu cầu đầu tiên
                  </Link>
                </div>
              ) : (
                filteredRequests.map(request => (
                  <div key={request.id} className="request-card">
                    <div className="request-header">
                      <div className="request-title-section">
                        <Link to={`/requests/${request.id}`} className="request-title">
                          {request.title}
                        </Link>
                        {getStatusBadge(request.status)}
                      </div>
                      <div className="request-actions">
                        <button className="btn-icon" title="Chỉnh sửa">
                          <i className="fa-solid fa-pen"></i>
                        </button>
                        <button className="btn-icon" title="Xóa">
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      </div>
                    </div>

                    <div className="request-meta">
                      <span className="meta-item">
                        <i className="fa-solid fa-tag"></i>
                        {request.category}
                      </span>
                      <span className="meta-item">
                        <i className="fa-solid fa-location-dot"></i>
                        {request.location}
                      </span>
                      <span className="meta-item">
                        <i className="fa-solid fa-calendar"></i>
                        Đăng {request.postedTime}
                      </span>
                    </div>

                    <p className="request-description">
                      {request.description.length > 150 
                        ? request.description.substring(0, 150) + '...' 
                        : request.description
                      }
                    </p>

                    {/* Skills */}
                    {request.skills && request.skills.length > 0 && (
                      <div className="request-skills">
                        {request.skills.slice(0, 5).map((skill, idx) => (
                          <span key={idx} className="skill-tag">{skill}</span>
                        ))}
                        {request.skills.length > 5 && (
                          <span className="skill-tag more">+{request.skills.length - 5}</span>
                        )}
                      </div>
                    )}

                    {/* Budget & Deadline Info */}
                    <div className="request-info-grid">
                      <div className="info-item">
                        <i className="fa-solid fa-money-bill-wave"></i>
                        <div>
                          <div className="info-label">Ngân sách</div>
                          <div className="info-value">{request.budget}</div>
                        </div>
                      </div>
                      <div className="info-item">
                        <i className="fa-regular fa-calendar-check"></i>
                        <div>
                          <div className="info-label">Hạn nhận hồ sơ</div>
                          <div className="info-value">
                            {request.submissionDeadlineDate ? formatDate(request.submissionDeadlineDate) : 'N/A'}
                          </div>
                        </div>
                      </div>
                      <div className="info-item">
                        <i className="fa-regular fa-clock"></i>
                        <div>
                          <div className="info-label">Thời hạn hoàn thành</div>
                          <div className="info-value">
                            {request.deadlineDate ? formatDate(request.deadlineDate) : 'N/A'}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="request-footer">
                      <div className="request-stats">
                        <span className="stat-item">
                          <i className="fa-solid fa-users"></i>
                          <strong>{request.bids}</strong> báo giá
                        </span>
                        <span className="stat-item">
                          <i className="fa-solid fa-eye"></i>
                          <strong>{request.views}</strong> lượt xem
                        </span>
                      </div>
                      <Link to={`/requests/${request.id}`} className="btn-view-detail">
                        Xem chi tiết
                        <i className="fa-solid fa-arrow-right"></i>
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </main>

          {/* Sidebar */}
          <aside className="requests-sidebar">
            <div className="sidebar-card">
              <Link to="/post-request" className="btn-create-request-full">
                <i className="fa-solid fa-plus"></i>
                Tạo yêu cầu mới
              </Link>
            </div>

            <div className="sidebar-card">
              <h3 className="sidebar-title">
                <i className="fa-solid fa-lightbulb" style={{color: '#F59E0B'}}></i>
                Mẹo quản lý hiệu quả
              </h3>
              <ul className="check-list">
                <li>
                  <i className="fa-solid fa-circle-check"></i>
                  <b>Phản hồi nhanh:</b> Trả lời báo giá trong 24h để giữ độ nóng dự án
                </li>
                <li>
                  <i className="fa-solid fa-circle-check"></i>
                  <b>Đánh giá kỹ:</b> Xem xét hồ sơ và portfolio của freelancer trước khi chọn
                </li>
                <li>
                  <i className="fa-solid fa-circle-check"></i>
                  <b>Giao tiếp rõ ràng:</b> Mô tả yêu cầu chi tiết để tránh hiểu lầm
                </li>
              </ul>
            </div>

            <div className="sidebar-card" style={{background: '#ECFDF5', borderColor: '#10B981'}}>
              <h3 className="sidebar-title" style={{color: '#064E3B'}}>
                <i className="fa-solid fa-shield-halved" style={{color: '#059669', fontSize: '24px'}}></i>
                Thanh toán bảo mật
              </h3>
              <p style={{color: '#047857', fontSize: '14px', lineHeight: '1.6', margin: 0}}>
                Hệ thống Escrow (ký quỹ) giữ tiền của bạn an toàn. Bạn chỉ giải ngân khi hài lòng với sản phẩm cuối cùng.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default MyRequestsPage;
