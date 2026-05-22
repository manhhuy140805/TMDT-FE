import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../utils/api';
import './Auth.css';

const SignupPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    accountType: 'client',
    fullname: '',
    email: '',
    password: '',
    confirmPassword: '',
    agree: false,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' || type === 'radio' ? (type === 'checkbox' ? checked : value) : value,
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu không khớp!');
      return;
    }

    if (!formData.agree) {
      setError('Vui lòng đồng ý với điều khoản dịch vụ!');
      return;
    }

    setLoading(true);

    try {
      // Derive username from email (everything before @)
      const username = formData.email.split('@')[0] || 'user';

      const response = await api.post('/auth/register', {
        tenDangNhap: username.toLowerCase() + Math.floor(Math.random() * 1000), // Ensure uniqueness
        matKhau: formData.password,
        email: formData.email,
        hoTen: formData.fullname,
        vaiTro: formData.accountType === 'client' ? 'NguoiThue' : 'Freelancer',
      });

      if (response && response.message) {
        alert('Đăng ký tài khoản thành công!');
        navigate('/login');
      } else {
        setError('Đăng ký thất bại. Vui lòng thử lại!');
      }
    } catch (err) {
      console.error('Signup error:', err);
      setError(err.message || 'Có lỗi xảy ra trong quá trình đăng ký!');
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
              Kiến tạo sự nghiệp.
              <br />
              Phát triển doanh nghiệp.
            </h2>
            <p>
              Tham gia nền tảng kết nối nhân tài cao cấp vững mạnh. Dù bạn ưu tiên chất lượng hay sự tốc độ, chúng tôi luôn đáp ứng ngoài mong đợi.
            </p>

            <div className="banner-testimonials">
              <div className="b-testimo">
                <p>
                  "Hệ thống tuyệt vời cho phép người có đam mê thực sự tìm được cơ hội đáng giá. Tôi đã nâng cao thu nhập gấp đôi."
                </p>
                <div className="b-author">
                  <img src="/images/avatar_2.png" alt="User Avatar" />
                  <span>
                    <b>Minh Tú</b> - Kỹ sư Phần mềm Senior
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="signup-form-side">
          <div className="form-header text-center">
            <h2 style={{ textAlign: 'center' }}>Tạo tài khoản mới</h2>
            <p style={{ textAlign: 'center' }}>Khám phá môi trường làm việc đột phá ngay hôm nay</p>
          </div>

          <form id="signupForm" className="premium-form" onSubmit={handleSubmit}>
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
            {/* Account Type Selection */}
            <div className="account-type-selection">
              <label className="account-type-card" title="Tìm người tài cho dự án">
                <input
                  type="radio"
                  name="accountType"
                  value="client"
                  checked={formData.accountType === 'client'}
                  onChange={handleChange}
                />
                <div className="type-card-inner">
                  <i className="fa-solid fa-briefcase"></i>
                  <span>
                    Tôi là Khách hàng
                    <br />
                    <small>Đăng dự án & tìm nhân tài</small>
                  </span>
                </div>
              </label>
              <label className="account-type-card" title="Tìm kiếm công việc freelance">
                <input
                  type="radio"
                  name="accountType"
                  value="freelancer"
                  checked={formData.accountType === 'freelancer'}
                  onChange={handleChange}
                />
                <div className="type-card-inner">
                  <i className="fa-solid fa-laptop-code"></i>
                  <span>
                    Tôi là Freelancer
                    <br />
                    <small>Tìm việc & gia tăng thu nhập</small>
                  </span>
                </div>
              </label>
            </div>

            {/* Fields */}
            <div className="premium-input-group">
              <label>Họ và tên</label>
              <div className="pi-wrapper">
                <i className="fa-regular fa-user"></i>
                <input
                  type="text"
                  name="fullname"
                  value={formData.fullname}
                  onChange={handleChange}
                  placeholder="Vd: Nguyễn Văn A"
                  required
                />
              </div>
            </div>

            <div className="premium-input-group">
              <label>Địa chỉ Email công việc</label>
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

            <div className="premium-row">
              <div className="premium-input-group">
                <label>Mật khẩu</label>
                <div className="pi-wrapper">
                  <i className="fa-solid fa-lock"></i>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Tạo mật khẩu"
                    required
                  />
                </div>
              </div>
              <div className="premium-input-group">
                <label>Xác nhận</label>
                <div className="pi-wrapper">
                  <i className="fa-solid fa-check-double"></i>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Nhập lại mật khẩu"
                    required
                  />
                </div>
              </div>
            </div>

            <div
              style={{
                margin: '4px 0 24px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
              }}
            >
              <input
                type="checkbox"
                id="agree"
                name="agree"
                checked={formData.agree}
                onChange={handleChange}
                style={{
                  width: '18px',
                  height: '18px',
                  accentColor: 'var(--teal)',
                  cursor: 'pointer',
                  marginTop: '2px',
                }}
              />
              <label
                htmlFor="agree"
                style={{
                  fontSize: '13px',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  fontWeight: '500',
                  lineHeight: '1.5',
                }}
              >
                Vâng, tôi đã đọc và đồng ý với các{' '}
                <Link
                  to="#"
                  style={{
                    color: 'var(--teal)',
                    fontWeight: '600',
                    textDecoration: 'none',
                  }}
                >
                  Điều khoản dịch vụ
                </Link>{' '}
                và{' '}
                <Link
                  to="#"
                  style={{
                    color: 'var(--teal)',
                    fontWeight: '600',
                    textDecoration: 'none',
                  }}
                >
                  Chính sách bảo mật
                </Link>
              </label>
            </div>

            {/* Submit */}
            <button type="submit" className="btn-signup-premium" disabled={loading}>
              {loading ? (
                <>
                  <i className="fa-solid fa-circle-notch fa-spin"></i>
                  Đang đăng ký...
                </>
              ) : (
                'Đăng Ký Tài Khoản Miễn Phí'
              )}
            </button>

            {/* Social Auth */}
            <div className="social-login-premium">
              <p>Hoặc đăng ký siêu tốc bằng</p>
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
              Bạn đã có tài khoản rồi? <Link to="/login">Đăng nhập ngay</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
