import { useNavigate } from 'react-router-dom';
import './PublicProfilePage.css';

const PublicProfilePage = () => {
  const navigate = useNavigate();

  const profileData = {
    name: 'Lê Hoàng Duy',
    title: 'Senior UX/UI Designer & Web Developer',
    location: 'Ho Chi Minh City, Vietnam',
    joinDate: 'Tháng 8, 2024',
    avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=200',
    about: 'Là một nhà thiết kế UI/UX với hơn 5 năm kinh nghiệm, tôi chuyên tạo ra các sản phẩm công nghệ không chỉ đẹp mắt mà còn mang lại trải nghiệm người dùng tối ưu. Với nền tảng vững chắc về tâm lý học người dùng và khả năng sử dụng các công cụ thiết kế hiện đại, tôi đã đồng hành cùng nhiều startup trong việc xây dựng sản phẩm từ con số không...',
    successRate: '100%',
    rating: 4.9,
    totalProjects: 42
  };

  return (
    <div className="public-profile-container">
      <div className="profile-banner"></div>
      
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
            <button className="btn-hire">
              <i className="fa-solid fa-paper-plane"></i> Mời làm việc
            </button>
            <button 
              className="btn-report-profile" 
              onClick={() => navigate('/client/report')}
            >
              <i className="fa-solid fa-flag"></i> Báo cáo
            </button>
          </div>
        </div>

        <div className="profile-section">
          <h2 className="section-label">Giới thiệu</h2>
          <p className="about-text">{profileData.about}</p>
        </div>

        <div className="stats-row">
          <div className="stat-item">
            <span className="stat-label">Thành công</span>
            <span className="stat-value">{profileData.successRate}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Đánh giá</span>
            <span className="stat-value gold">
              {profileData.rating}
              <i className="fa-solid fa-star"></i>
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Tổng dự án</span>
            <span className="stat-value">{profileData.totalProjects}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicProfilePage;
