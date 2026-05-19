import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../pages/Home/HomePage.css';

// Map vaiTro từ API sang label hiển thị
const ROLE_LABELS = {
  NguoiThue: 'Người thuê',
  Freelancer: 'Freelancer',
  DonViGiamSat: 'Đơn vị giám sát',
  Admin: 'Quản trị viên',
  KhachVangLai: 'Khách vãng lai',
};

// Workspace options theo từng vai trò
const WORKSPACE_OPTIONS = {
  NguoiThue: [
    { label: 'Đăng yêu cầu', icon: 'fa-solid fa-plus-circle', path: '/post-request' },
    { label: 'Yêu cầu của tôi', icon: 'fa-solid fa-briefcase', path: '/my-requests' },
    { label: 'Hợp đồng', icon: 'fa-solid fa-file-contract', path: '/contracts' },
  ],
  Freelancer: [
    { label: 'Tìm việc làm', icon: 'fa-solid fa-magnifying-glass', path: '/requests' },
    { label: 'Báo giá của tôi', icon: 'fa-solid fa-file-invoice', path: '/my-quotes' },
    { label: 'Hợp đồng', icon: 'fa-solid fa-file-contract', path: '/contracts' },
  ],
  DonViGiamSat: [
    { label: 'Giám sát công việc', icon: 'fa-solid fa-eye', path: '/supervisor/jobs' },
    { label: 'Hợp đồng giám sát', icon: 'fa-solid fa-file-contract', path: '/supervisor/contracts' },
  ],
  Admin: [
    { label: 'Bảng điều khiển', icon: 'fa-solid fa-gauge', path: '/admin' },
    { label: 'Quản lý người dùng', icon: 'fa-solid fa-users', path: '/admin/users' },
  ],
};

const Header = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showWorkspace, setShowWorkspace] = useState(false);
  const [hideTimeout, setHideTimeout] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        // Handle cả data cũ dạng { message, user } lẫn data mới dạng user trực tiếp
        const userData = parsed?.user ?? parsed;
        setUser(userData);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
        setShowWorkspace(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLinkClick = () => {
    setMobileMenuOpen(false);
    setShowDropdown(false);
    setShowWorkspace(false);
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
      setShowWorkspace(false);
    }, 200);
    setHideTimeout(timeout);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('rememberMe');
    setUser(null);
    setShowDropdown(false);
    setShowWorkspace(false);
    setMobileMenuOpen(false);
    navigate('/');
  };

  const roleLabel = user ? (ROLE_LABELS[user.vaiTro] || user.vaiTro || 'Thành viên') : '';
  const workspaceItems = user ? (WORKSPACE_OPTIONS[user.vaiTro] || []) : [];
  const displayName = user?.hoTen || user?.name || 'Người dùng';
  const displayEmail = user?.email || '';
  const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=0EA5E9&color=fff&size=40`;
  const displayAvatar = user?.anhDaiDien || user?.avatar || fallbackAvatar;

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
            <i className="fa-brands fa-xing" style={{ color: 'var(--teal)', fontSize: '28px' }}></i>
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
            </nav>

            <div className="header-actions">
              <div className="header-search">
                <i className="fa-solid fa-search"></i>
                <input type="text" placeholder="Tìm kiếm..." />
              </div>

              {user ? (
                <div
                  className="user-menu"
                  ref={dropdownRef}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  <button className="user-menu-btn" style={{ padding: 0, border: 'none', background: 'transparent', cursor: 'pointer' }}>
                    <img
                      src={displayAvatar}
                      alt={displayName}
                      className="user-avatar"
                      style={{ margin: 0, display: 'block' }}
                      onError={(e) => { e.target.src = fallbackAvatar; }}
                    />
                  </button>

                  {showDropdown && (
                    <div className="user-dropdown">
                      {/* User Info */}
                      <div className="dropdown-user-info">
                        <img
                          src={displayAvatar}
                          alt={displayName}
                          className="dropdown-avatar"
                          onError={(e) => { e.target.src = fallbackAvatar; }}
                        />
                        <div className="dropdown-user-details">
                          <div className="dropdown-user-name">{displayName}</div>
                          <div className="dropdown-user-email">{displayEmail}</div>
                          <div className="dropdown-user-role">{roleLabel}</div>
                        </div>
                      </div>

                      <div className="dropdown-divider"></div>

                      {/* Không gian làm việc */}
                      {workspaceItems.length > 0 && (
                        <>
                          <button
                            className="dropdown-item dropdown-workspace-toggle"
                            onClick={() => setShowWorkspace((v) => !v)}
                          >
                            <i className="fa-solid fa-layer-group"></i>
                            Không gian làm việc
                            <i
                              className={`fa-solid fa-chevron-${showWorkspace ? 'up' : 'down'} dropdown-chevron`}
                            ></i>
                          </button>

                          {showWorkspace && (
                            <div className="dropdown-workspace-list">
                              {workspaceItems.map((item) => (
                                <Link
                                  key={item.path}
                                  to={item.path}
                                  className="dropdown-item dropdown-workspace-item"
                                  onClick={handleLinkClick}
                                >
                                  <i className={item.icon}></i>
                                  {item.label}
                                </Link>
                              ))}
                            </div>
                          )}

                          <div className="dropdown-divider"></div>
                        </>
                      )}

                      <Link to="/profile" className="dropdown-item" onClick={handleLinkClick}>
                        <i className="fa-solid fa-user"></i>
                        Hồ sơ của tôi
                      </Link>

                      <Link to="/settings" className="dropdown-item" onClick={handleLinkClick}>
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
