import { Link } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
  return (
    <div className="landing-body">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-bg-wrapper">
          <img
            src="/images/hero.png"
            alt="Professional Background"
            className="hero-bg-img"
          />
          <div className="hero-overlay"></div>
        </div>

        <div className="hero-content">
          <h1 className="hero-title">
            Kết nối doanh nghiệp với những freelancer xuất sắc
          </h1>

          <div className="hero-action-box">
            <div className="action-tabs">
              <button className="active">Tìm nhân tài</button>
              <button>Tìm việc làm</button>
            </div>
            <div className="action-search">
              <i className="fa-solid fa-search search-icon"></i>
              <input type="text" placeholder="Kỹ năng hoặc vị trí" />
              <button className="btn-search-submit">
                <i className="fa-solid fa-magnifying-glass"></i> Tìm kiếm
              </button>
            </div>
            <div className="action-suggestions">
              <span className="suggestion-label">Phổ biến:</span>
              <Link to="#">Thiết kế Web</Link>
              <Link to="#">Thiết kế Logo</Link>
              <Link to="#">SEO</Link>
              <Link to="#">Viết bài</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="categories-section">
        <div className="container">
          <h2 className="section-title">Khám phá hàng triệu chuyên gia</h2>
          <div className="categories-grid">
            <Link to="#" className="category-card">
              <div className="cat-icon-wrapper"><i className="fa-solid fa-code"></i></div>
              <h3>Phát triển & CNTT</h3>
              <div className="cat-rating">
                <i className="fa-solid fa-star"></i> 4.85/5
                <span>(185K kỹ năng)</span>
              </div>
            </Link>
            <Link to="#" className="category-card">
              <div className="cat-icon-wrapper">
                <i className="fa-solid fa-pen-nib"></i>
              </div>
              <h3>Thiết kế & Sáng tạo</h3>
              <div className="cat-rating">
                <i className="fa-solid fa-star"></i> 4.91/5
                <span>(968K kỹ năng)</span>
              </div>
            </Link>
            <Link to="#" className="category-card">
              <div className="cat-icon-wrapper">
                <i className="fa-solid fa-bullhorn"></i>
              </div>
              <h3>Bán hàng & Tiếp thị</h3>
              <div className="cat-rating">
                <i className="fa-solid fa-star"></i> 4.77/5
                <span>(392K kỹ năng)</span>
              </div>
            </Link>
            <Link to="#" className="category-card">
              <div className="cat-icon-wrapper">
                <i className="fa-solid fa-language"></i>
              </div>
              <h3>Viết lách & Dịch thuật</h3>
              <div className="cat-rating">
                <i className="fa-solid fa-star"></i> 4.92/5
                <span>(505K kỹ năng)</span>
              </div>
            </Link>
            <Link to="#" className="category-card">
              <div className="cat-icon-wrapper">
                <i className="fa-solid fa-headset"></i>
              </div>
              <h3>Hành chính & Hỗ trợ KH</h3>
              <div className="cat-rating">
                <i className="fa-solid fa-star"></i> 4.77/5
                <span>(508K kỹ năng)</span>
              </div>
            </Link>
            <Link to="#" className="category-card">
              <div className="cat-icon-wrapper">
                <i className="fa-solid fa-calculator"></i>
              </div>
              <h3>Tài chính & Kế toán</h3>
              <div className="cat-rating">
                <i className="fa-solid fa-star"></i> 4.79/5
                <span>(214K kỹ năng)</span>
              </div>
            </Link>
            <Link to="#" className="category-card">
              <div className="cat-icon-wrapper">
                <i className="fa-solid fa-users"></i>
              </div>
              <h3>Nhân sự & Đào tạo</h3>
              <div className="cat-rating">
                <i className="fa-solid fa-star"></i> 4.81/5
                <span>(150K kỹ năng)</span>
              </div>
            </Link>
            <Link to="#" className="category-card">
              <div className="cat-icon-wrapper">
                <i className="fa-solid fa-scale-balanced"></i>
              </div>
              <h3>Pháp lý</h3>
              <div className="cat-rating">
                <i className="fa-solid fa-star"></i> 4.85/5
                <span>(133K kỹ năng)</span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="process-section">
        <div className="container">
          <div className="process-header">
            <h2 className="section-title">Cách thức hoạt động</h2>
            <Link to="#" className="btn-outline-gold">
              Tìm nhân tài <i className="fa-solid fa-arrow-right"></i>
            </Link>
          </div>

          <div className="process-cards">
            <div className="process-card">
              <div className="p-img-box">
                <img src="/images/process_1.png" alt="Join globally" />
              </div>
              <h3>Tham gia miễn phí</h3>
              <p>
                Đăng ký và duyệt các chuyên gia, khám phá các dự án hoặc đặt lịch
                tư vấn.
              </p>
            </div>
            <div className="process-card">
              <div className="p-img-box">
                <img src="/images/process_2.png" alt="Post a job" />
              </div>
              <h3>Đăng việc và thuê nhân tài hàng đầu</h3>
              <p>
                Việc tìm kiếm nhân tài không hề khó khăn. Hãy đăng việc hoặc chúng
                tôi sẽ tìm kiếm giúp bạn!
              </p>
            </div>
            <div className="process-card">
              <div className="p-img-box">
                <img src="/images/process_3.png" alt="Work securely" />
              </div>
              <h3>Làm việc với những người giỏi nhất — chi phí hợp lý</h3>
              <p>Upwork giúp bạn tiết kiệm chi phí với mức phí giao dịch thấp.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Insights Section */}
      <section className="insights-section">
        <div className="insights-container">
          <div className="inc-content">
            <h2 className="inc-title">Tìm hiểu chi phí thuê freelancer</h2>
            <p className="inc-desc">
              Hỏi đáp, so sánh giá cả và thuê những chuyên gia giỏi nhất cho dự án
              tiếp theo của bạn.
            </p>
            <div className="inc-search">
              <i className="fa-solid fa-magnifying-glass"></i>
              <input
                type="text"
                placeholder="vd: 'Giá thuê web developer theo giờ'"
              />
              <button className="btn-explore">
                Khám phá <i className="fa-solid fa-arrow-right"></i>
              </button>
            </div>
          </div>
          <div className="inc-graphic">
            <div className="glowing-orb"></div>
            <i className="fa-brands fa-connectdevelop graphic-icon"></i>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="pricing-section">
        <div className="container">
          <h2 className="section-title text-center">
            Khách hàng chỉ trả phí sau khi tuyển dụng
          </h2>
          <div className="pricing-grid">
            <div className="pricing-card">
              <h3 className="plan-name">Cơ bản</h3>
              <p className="plan-price">Tham gia miễn phí</p>
              <ul className="plan-features">
                <li><i className="fa-solid fa-check"></i> Duyệt chuyên gia</li>
                <li><i className="fa-solid fa-check"></i> Đăng tin tuyển dụng</li>
                <li><i className="fa-solid fa-check"></i> Xem xét báo giá</li>
              </ul>
              <button className="btn-plan btn-plan-outline">Bắt đầu miễn phí</button>
            </div>
            <div className="pricing-card recommended">
              <div className="rec-badge">Khuyên dùng</div>
              <h3 className="plan-name">Business Plus</h3>
              <p className="plan-price">Trả theo mức sử dụng</p>
              <ul className="plan-features">
                <li>
                  <i className="fa-solid fa-check"></i> Mọi thứ ở bản Cơ bản, cộng
                  thêm:
                </li>
                <li><i className="fa-solid fa-check"></i> Quản lý tài khoản</li>
                <li>
                  <i className="fa-solid fa-check"></i> Chuyên viên nhân sự chuyên
                  trách
                </li>
                <li><i className="fa-solid fa-check"></i> Chuyên gia đã xác minh</li>
              </ul>
              <button className="btn-plan btn-plan-solid">Liên hệ kinh doanh</button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials-section">
        <div className="container">
          <h2 className="section-title">Kết quả thực tế từ khách hàng</h2>
          <div className="testimo-grid">
            <div className="testimo-card">
              <div className="t-rating">
                <i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i>
                <i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i>
                <i className="fa-solid fa-star"></i>
              </div>
              <p className="t-text">
                "Nhân tài trên Upwork thực sự đẳng cấp. Tôi cần một lập trình viên
                chuyên nghiệp và nhận được báo giá chỉ trong vài giờ. Dự án hoàn
                thành hoàn hảo và trước thời hạn."
              </p>
              <div className="t-client">
                <img src="/images/avatar_1.png" alt="Client 1" />
                <div className="t-info">
                  <h4>Sarah Jenkins</h4>
                  <span>Quản lý Sản phẩm</span>
                </div>
              </div>
            </div>
            <div className="testimo-card t-raised">
              <div className="t-rating">
                <i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i>
                <i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i>
                <i className="fa-solid fa-star"></i>
              </div>
              <p className="t-text">
                "Là một startup, Upwork giúp chúng tôi tiếp cận nhân tài đẳng cấp
                thế giới mà không tốn nhiều chi phí. Chúng tôi đã xây dựng toàn bộ
                bộ nhận diện thương hiệu với các freelancer ở đây."
              </p>
              <div className="t-client">
                <img src="/images/avatar_2.png" alt="Client 2" />
                <div className="t-info">
                  <h4>David Chen</h4>
                  <span>Nhà Sáng Lập & CEO</span>
                </div>
              </div>
            </div>
            <div className="testimo-card">
              <div className="t-rating">
                <i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i>
                <i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i>
                <i className="fa-solid fa-star"></i>
              </div>
              <p className="t-text">
                "Nền tảng cực kỳ dễ sử dụng. Tôi thích cách thức giao tiếp dễ
                dàng, chia sẻ tệp và thanh toán an toàn tất cả ở một nơi. Rất
                khuyên dùng."
              </p>
              <div className="t-client">
                <img src="/images/avatar_3.png" alt="Client 3" />
                <div className="t-info">
                  <h4>Marcus Thorne</h4>
                  <span>Giám đốc Marketing</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="cta-banner">
        <div className="cta-content">
          <h2>
            Tìm ứng viên tiếp theo cho một nhiệm vụ ngắn hạn hoặc phát triển dài
            hạn
          </h2>
          <button className="btn-cta-large">Tìm nhân tài</button>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
