import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './Auth.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear error when user types
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.auth.login({
        email: formData.email,
        password: formData.password,
      });

      if (response.success) {
        // Lưu thông tin user vào localStorage
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Nếu chọn "Nhớ đăng nhập", lưu thêm flag
        if (formData.remember) {
          localStorage.setItem('rememberMe', 'true');
        }

        // Chuyển hướng về trang chủ
        navigate('/');
      } else {
        setError(response.message || 'Đăng nhập thất bại');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Có lỗi xảy ra. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-fullscreen">
      {/* Home Button */}
      <Link to="/" className="auth-home-btn">
        <i className="fa-solid fa-arrow-left"></i>
        <span>Về trang chủ</span>
      </Link>

      <div className="auth-split-layout">
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
            {/* Error Message */}
            {error && (
              <div style={{
                padding: '12px',
                background: '#FEF2F2',
                border: '1px solid #FCA5A5',
                borderRadius: '8px',
                color: '#DC2626',
                fontSize: '13px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <i className="fa-solid fa-circle-exclamation"></i>
                <span>{error}</span>
              </div>
            )}

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
            <button type="submit" className="btn-signup-premium" disabled={loading}>
              {loading ? (
                <>
                  <i className="fa-solid fa-circle-notch fa-spin"></i>
                  Đang đăng nhập...
                </>
              ) : (
                'Đăng Nhập'
              )}
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
