import { Link } from 'react-router-dom';
import '../../pages/Home/HomePage.css';

const Header = () => {
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
            <Link to="/login" className="btn-login-text">
              Đăng nhập
            </Link>
            <Link to="/signup" className="btn-signup-styled">
              Đăng ký
            </Link>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
