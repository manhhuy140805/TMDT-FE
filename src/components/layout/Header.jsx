import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../pages/Home/HomePage.css';

const Header = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [hideTimeout, setHideTimeout] = useState(null);

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
    navigate('/');
  };

  return (
    <>
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
      <header className="redesign-header">
        <div className="header-container">
          <Link to="/" className="header-logo" style={{ textDecoration: 'none' }}>
            <i
              className="fa-brands fa-xing"
              style={{ color: 'var(--teal)', fontSize: '28px' }}
            ></i>
            <span className="logo-text">Upwork</span>
          </Link>
          <nav className="header-nav">
            <Link to="#">
              Tìm nhân tài <i className="fa-solid fa-chevron-down nav-icon"></i>
            </Link>
            <Link to="/requests">
              Tìm việc làm <i className="fa-solid fa-chevron-down nav-icon"></i>
            </Link>
            <Link to="#">
              Tại sao chọn Upwork
              <i className="fa-solid fa-chevron-down nav-icon"></i>
            </Link>
            <Link to="#">Giải pháp doanh nghiệp</Link>
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
                <button className="user-menu-btn" style={{ padding: 0, border: 'none', background: 'transparent', cursor: 'pointer' }}>
                  <img 
                    src={user.avatar || 'https://png.pngtree.com/png-vector/20251230/ourlarge/pngtree-cartoon-character-avatar-png-image_18347258.webp'} 
                    alt={user.name || user.hoTen}
                    className="user-avatar"
                    style={{ margin: 0, display: 'block' }}
                    onError={(e) => {
                      e.target.src = 'https://png.pngtree.com/png-vector/20251230/ourlarge/pngtree-cartoon-character-avatar-png-image_18347258.webp';
                    }}
                  />
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
                    
                    <Link to="/profile" className="dropdown-item">
                      <i className="fa-solid fa-user"></i>
                      Hồ sơ của tôi
                    </Link>
<<<<<<< HEAD
                    <Link to="/workspace" className="dropdown-item">
                      <i className="fa-solid fa-briefcase"></i>
                      Không gian làm việc
                    </Link>
                    <Link to="/settings" className="dropdown-item">
=======
                    
                    {/* Hiển thị "Yêu cầu của tôi" cho NGUOI_THUE */}
                    {user.role === 'NGUOI_THUE' && (
                      <Link to="/my-requests" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                        <i className="fa-solid fa-briefcase"></i>
                        Yêu cầu của tôi
                      </Link>
                    )}
                    
                    {/* Hiển thị "Báo giá của tôi" cho FREELANCER */}
                    {user.role === 'FREELANCER' && (
                      <Link to="/my-quotes" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                        <i className="fa-solid fa-file-invoice"></i>
                        Báo giá của tôi
                      </Link>
                    )}
                    
                    <Link to="/settings" className="dropdown-item" onClick={() => setShowDropdown(false)}>
>>>>>>> 355657d191b7f8bc3af54cda953e3e3b3413189f
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
                <Link to="/login" className="btn-login-text">
                  Đăng nhập
                </Link>
                <Link to="/signup" className="btn-signup-styled">
                  Đăng ký
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
