import { useNavigate } from 'react-router-dom';
import './PublicProfilePage.css'; // Reusing the same CSS for consistency

const PublicClientProfilePage = () => {
  const navigate = useNavigate();

  // Dữ liệu Người thuê (Client) giả định
  const profileData = {
    name: 'Nguyễn Văn An',
    title: 'Project Manager | Doanh nghiệp Startup Tech',
    location: 'Hanoi, Vietnam',
    joinDate: 'Tháng 1, 2023',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
    about: 'Tôi là người sáng lập của một startup công nghệ tại Hà Nội. Chúng tôi thường xuyên tìm kiếm các tài năng freelancer để hợp tác trong các dự án phát triển Web và Mobile. Phương châm của tôi là làm việc minh bạch, đúng hạn và tôn trọng chất lượng sản phẩm...',
    paymentVerified: 'Đã xác thực thanh toán',
    rating: 4.8,
    totalJobsPosted: 15
  };

  return (
    <div className="public-profile-container">
      <div className="profile-banner" style={{ background: 'linear-gradient(90deg, #1e293b, #334155, #475569)' }}></div>
      
      <div className="profile-content">
        <div className="avatar-wrapper">
          <img src={profileData.avatar} alt={profileData.name} className="public-avatar" />
        </div>

        <div className="profile-header-row">
          <div className="user-main-info">
            <h1>
              {profileData.name}
              <i className="fa-solid fa-circle-check verify-badge"></i>
            </h1>
            <div className="user-tagline">{profileData.title}</div>
            <div className="user-meta-info">
              <span><i className="fa-solid fa-location-dot"></i> {profileData.location}</span>
              <span><i className="fa-solid fa-calendar-days"></i> Tham gia từ {profileData.joinDate}</span>
            </div>
          </div>

          <div className="profile-actions">
            <button className="btn-hire" style={{ background: '#10b981' }}>
              <i className="fa-solid fa-envelope"></i> Gửi tin nhắn
            </button>
            <button 
              className="btn-report-profile" 
              onClick={() => navigate('/freelancer/report')}
            >
              <i className="fa-solid fa-flag"></i> Báo cáo
            </button>
          </div>
        </div>

        <div className="profile-section">
          <h2 className="section-label">Giới thiệu về người thuê</h2>
          <p className="about-text">{profileData.about}</p>
        </div>

        <div className="stats-row">
          <div className="stat-item">
            <span className="stat-label">Thanh toán</span>
            <span className="stat-value" style={{ color: '#10b981', fontSize: '16px' }}>{profileData.paymentVerified}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Đánh giá</span>
            <span className="stat-value gold">
              {profileData.rating}
              <i className="fa-solid fa-star"></i>
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Tổng bài đăng</span>
            <span className="stat-value">{profileData.totalJobsPosted}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicClientProfilePage;
