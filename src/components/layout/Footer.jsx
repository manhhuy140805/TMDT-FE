import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="modern-footer">
      <div className="footer-container">
        <div className="footer-links">
          <div className="fl-col">
            <h4>Dành cho khách hàng</h4>
            <Link to="#">Cách thuê người</Link>
            <Link to="#">Chợ nhân tài</Link>
            <Link to="#">Danh mục dự án</Link>
            <Link to="#">Giải pháp doanh nghiệp</Link>
          </div>
          <div className="fl-col">
            <h4>Dành cho freelancer</h4>
            <Link to="#">Cách tìm việc</Link>
            <Link to="#">Hợp đồng trực tiếp</Link>
            <Link to="#">Tìm việc tự do</Link>
          </div>
          <div className="fl-col">
            <h4>Tài nguyên</h4>
            <Link to="#">Trợ giúp & Hỗ trợ</Link>
            <Link to="#">Câu chuyện thành công</Link>
            <Link to="#">Đánh giá Upwork</Link>
            <Link to="#">Blog</Link>
          </div>
          <div className="fl-col">
            <h4>Công ty</h4>
            <Link to="#">Về chúng tôi</Link>
            <Link to="#">Lãnh đạo</Link>
            <Link to="#">Quan hệ nhà đầu tư</Link>
            <Link to="#">Tuyển dụng</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="fb-socials">
            <Link to="#"><i className="fa-brands fa-facebook-f"></i></Link>
            <Link to="#"><i className="fa-brands fa-linkedin-in"></i></Link>
            <Link to="#"><i className="fa-brands fa-twitter"></i></Link>
            <Link to="#"><i className="fa-brands fa-youtube"></i></Link>
            <Link to="#"><i className="fa-brands fa-instagram"></i></Link>
          </div>
          <p className="fb-rights">© 2015 - 2024 Upwork® Global Inc.</p>
          <div className="fb-legal">
            <Link to="#">Điều khoản dịch vụ</Link>
            <Link to="#">Chính sách bảo mật</Link>
            <Link to="#">Thông báo thu thập thông tin CA</Link>
            <Link to="#">Cài đặt Cookie</Link>
            <Link to="#">Trợ năng</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
