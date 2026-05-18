import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../pages/Home/HomePage.css';

const Header = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [hideTimeout, setHideTimeout] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Lấy thông tin user từ localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  // Đóng mobile menu khi chuyển hướng trang
  const handleLinkClick = () => {
    setMobileMenuOpen(false);
  };

  const handleMouseEnter = () => {
    if (hideTimeout) {
      clearTimeout(hideTimeout);
      setHideTimeout(null);
    }
    setShowDropdown(true);
  };

  const handleMouseLeave = () => {
    const timeout = setTimeout(() => {
      setShowDropdown(false);
    }, 200);
    setHideTimeout(timeout);
  };

  const handleLogout = () => {
    // Xóa thông tin user khỏi localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('rememberMe');
    setUser(null);
    setShowDropdown(false);
    setMobileMenuOpen(false);
    navigate('/');
  };

  return (
    <div className="global-header-sticky" style={{ position: 'sticky', top: 0, zIndex: 100, display: 'flex', flexDirection: 'column' }}>
      {/* Promo Banner */}
      <div className="promo-banner">
        <div className="promo-content">
          <span>Đừng ôm đồm mọi việc. Hãy thuê chuyên gia.</span>
          <Link to="#" className="promo-link">
            Khám phá Business Plus <i className="fa-solid fa-arrow-right"></i>
          </Link>
        </div>
      </div>

      {/* Header */}
      <header className="redesign-header" style={{ position: 'relative', top: 'auto', zIndex: 'auto' }}>
        <div className="header-container">
          <Link to="/" className="header-logo" style={{ textDecoration: 'none' }} onClick={handleLinkClick}>
            <i
              className="fa-brands fa-xing"
              style={{ color: 'var(--teal)', fontSize: '28px' }}
            ></i>
            <span className="logo-text">Upwork</span>
          </Link>

          {/* Toggle Hamburger Button for Mobile View */}
          <button 
            className={`mobile-menu-toggle ${mobileMenuOpen ? 'active' : ''}`} 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Menu"
          >
            <span className="bar"></span>
            <span className="bar"></span>
            <span className="bar"></span>
          </button>

          {/* Wrapper for Navigation and Actions */}
          <div className={`header-menu-wrapper ${mobileMenuOpen ? 'mobile-open' : ''}`}>
            <nav className="header-nav">
              {user && (user.role === 'FREELANCER' || user.vaiTro === 'FREELANCER') ? (
                <>
                  <Link to="/requests" onClick={handleLinkClick}>Tìm việc làm</Link>
                  <Link to="/progress" onClick={handleLinkClick}>Dự án của tôi</Link>
                  <Link to="/profile" onClick={handleLinkClick}>Hồ sơ</Link>
                  <Link to="/workspace/messages" onClick={handleLinkClick}>Tin nhắn</Link>
                </>
              ) : (
                <>
                  <Link to="#" onClick={handleLinkClick}>
                    Tìm nhân tài <i className="fa-solid fa-chevron-down nav-icon"></i>
                  </Link>
                  <Link to="/requests" onClick={handleLinkClick}>
                    Tìm việc làm <i className="fa-solid fa-chevron-down nav-icon"></i>
                  </Link>
                  <Link to="#" onClick={handleLinkClick}>
                    Tại sao chọn Upwork
                    <i className="fa-solid fa-chevron-down nav-icon"></i>
                  </Link>
                  <Link to="#" onClick={handleLinkClick}>Giải pháp doanh nghiệp</Link>
                </>
              )}
            </nav>
            
            <div className="header-actions">
              {/* Search simplified for header */}
              <div className="header-search">
                <i className="fa-solid fa-search"></i>
                <input type="text" placeholder="Tìm kiếm..." />
              </div>
              
              {user ? (
                // Hiển thị khi đã đăng nhập
                <div 
                  className="user-menu"
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  <button className="user-menu-btn" style={{ padding: 0, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <img 
                      src={user.avatar || 'https://png.pngtree.com/png-vector/20251230/ourlarge/pngtree-cartoon-character-avatar-png-image_18347258.webp'} 
                      alt={user.name || user.hoTen}
                      className="user-avatar"
                      style={{ margin: 0, display: 'block' }}
                      onError={(e) => {
                        e.target.src = 'https://png.pngtree.com/png-vector/20251230/ourlarge/pngtree-cartoon-character-avatar-png-image_18347258.webp';
                      }}
                    />
                    {(user.role === 'FREELANCER' || user.vaiTro === 'FREELANCER') && (
                      <span className="header-username-text" style={{ fontSize: '14px', fontWeight: '500', color: '#1e293b' }}>Freelancer</span>
                    )}
                  </button>
                  
                  {showDropdown && (
                    <div className="user-dropdown">
                      <div className="dropdown-user-info">
                        <img 
                          src={user.avatar || 'https://png.pngtree.com/png-vector/20251230/ourlarge/pngtree-cartoon-character-avatar-png-image_18347258.webp'} 
                          alt={user.name || user.hoTen}
                          className="dropdown-avatar"
                          onError={(e) => {
                            e.target.src = 'https://png.pngtree.com/png-vector/20251230/ourlarge/pngtree-cartoon-character-avatar-png-image_18347258.webp';
                          }}
                        />
                        <div className="dropdown-user-details">
                          <div className="dropdown-user-name">{user.name || user.hoTen}</div>
                          <div className="dropdown-user-email">{user.email}</div>
                          <div className="dropdown-user-role">{user.vaiTro || 'Thành viên'}</div>
                        </div>
                      </div>
                      <div className="dropdown-divider"></div>
                      
                      <Link to="/profile" className="dropdown-item" onClick={handleLinkClick}>
                        <i className="fa-solid fa-user"></i>
                        Hồ sơ của tôi
                      </Link>
                      
                      <Link to="/progress" className="dropdown-item" onClick={() => { setShowDropdown(false); handleLinkClick(); }}>
                        <i className="fa-solid fa-chart-line"></i>
                        Tiến độ công việc
                      </Link>
                      
                      {/* Hiển thị "Yêu cầu của tôi" cho NGUOI_THUE */}
                      {user.role === 'NGUOI_THUE' && (
                        <Link to="/my-requests" className="dropdown-item" onClick={() => { setShowDropdown(false); handleLinkClick(); }}>
                          <i className="fa-solid fa-briefcase"></i>
                          Yêu cầu của tôi
                        </Link>
                      )}
                      
                      {/* Hiển thị "Báo giá của tôi" cho FREELANCER */}
                      {user.role === 'FREELANCER' && (
                        <Link to="/my-quotes" className="dropdown-item" onClick={() => { setShowDropdown(false); handleLinkClick(); }}>
                          <i className="fa-solid fa-file-invoice"></i>
                          Báo giá của tôi
                        </Link>
                      )}
                      
                      <Link to="/settings" className="dropdown-item" onClick={() => { setShowDropdown(false); handleLinkClick(); }}>
                        <i className="fa-solid fa-gear"></i>
                        Cài đặt
                      </Link>
                      <div className="dropdown-divider"></div>
                      <button className="dropdown-item dropdown-item-logout" onClick={handleLogout}>
                        <i className="fa-solid fa-right-from-bracket"></i>
                        Đăng xuất
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                // Hiển thị khi chưa đăng nhập
                <>
                  <Link to="/login" className="btn-login-text" onClick={handleLinkClick}>
                    Đăng nhập
                  </Link>
                  <Link to="/signup" className="btn-signup-styled" onClick={handleLinkClick}>
                    Đăng ký
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>
    </div>
  );
};

export default Header;
