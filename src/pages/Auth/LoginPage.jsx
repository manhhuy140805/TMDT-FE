import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Auth.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login data:', formData);
    // TODO: Implement login logic
    // Sau khi login thành công:
    // navigate('/');
  };

  return (
    <div className="signup-premium-wrapper">
      {/* Home Button */}
      <Link to="/" className="home-button">
        <i className="fa-solid fa-home"></i>
        <span>Trang chủ</span>
      </Link>

      <div className="signup-premium-card">
        {/* Left Side: Interactive Banner */}
        <div className="signup-banner">
          <img src="/images/signup_bg.png" alt="Premium Network" className="signup-bg" />
          <div className="signup-overlay">
            <h2>
              Chào mừng
              <br />
              trở lại!
            </h2>
            <p>
              Đăng nhập để tiếp tục khám phá hàng nghìn cơ hội việc làm và nâng tầm dự án phát triển của doanh nghiệp bạn.
            </p>

            <div className="banner-testimonials">
              <div className="b-testimo">
                <p>
                  "Quét qua hồ sơ, thanh toán an toàn và kết nối siêu tốc tất cả tại một nơi thiết kế tuyệt đẹp."
                </p>
                <div className="b-author">
                  <img src="/images/avatar_1.png" alt="User Avatar" />
                  <span>
                    <b>Sarah Jenkins</b> - Giám đốc Sản phẩm
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="signup-form-side">
          <div className="form-header text-center">
            <h2 style={{ textAlign: 'center' }}>Đăng Nhập</h2>
            <p style={{ textAlign: 'center' }}>Trở lại công việc của bạn trên Upwork</p>
          </div>

          <form id="loginForm" className="premium-form" onSubmit={handleSubmit}>
            {/* Fields */}
            <div className="premium-input-group">
              <label>Địa chỉ Email</label>
              <div className="pi-wrapper">
                <i className="fa-regular fa-envelope"></i>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@company.com"
                  required
                />
              </div>
            </div>

            <div className="premium-input-group">
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '8px',
                }}
              >
                <label style={{ marginBottom: '0' }}>Mật khẩu</label>
                <Link
                  to="#"
                  style={{
                    fontSize: '13px',
                    fontWeight: '600',
                    color: 'var(--teal)',
                    textDecoration: 'none',
                  }}
                >
                  Quên mật khẩu?
                </Link>
              </div>
              <div className="pi-wrapper">
                <i className="fa-solid fa-lock"></i>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Nhập mật khẩu"
                  required
                />
              </div>
            </div>

            <div
              style={{
                margin: '12px 0 24px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <input
                type="checkbox"
                id="remember"
                name="remember"
                checked={formData.remember}
                onChange={handleChange}
                style={{
                  width: '16px',
                  height: '16px',
                  accentColor: 'var(--teal)',
                  cursor: 'pointer',
                }}
              />
              <label
                htmlFor="remember"
                style={{
                  fontSize: '14px',
                  color: 'var(--text-dark)',
                  cursor: 'pointer',
                  fontWeight: '500',
                }}
              >
                Nhớ trạng thái đăng nhập
              </label>
            </div>

            {/* Submit */}
            <button type="submit" className="btn-signup-premium">
              Đăng Nhập
            </button>

            {/* Social Auth */}
            <div className="social-login-premium">
              <p>Hoặc đăng nhập siêu tốc bằng</p>
              <div className="slp-buttons">
                <button type="button" className="slp-btn">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" />{' '}
                  Google
                </button>
                <button type="button" className="slp-btn">
                  <i className="fa-brands fa-apple" style={{ fontSize: '18px' }}></i> Apple
                </button>
              </div>
            </div>

            <div className="premium-footer-text">
              Bạn chưa có tài khoản? <Link to="/signup">Đăng ký ngay</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
