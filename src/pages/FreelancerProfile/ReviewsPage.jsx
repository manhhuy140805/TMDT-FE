import { useState } from 'react';
import './ReviewsPage.css';

const ReviewsPage = () => {
  const [activeNav, setActiveNav] = useState('rating');
  const [replyingToId, setReplyingToId] = useState(null);
  const [replyText, setReplyText] = useState('');

  const distribution = [
    { label: '5 sao', count: 36, percentage: 85 },
    { label: '4 sao', count: 5, percentage: 12 },
    { label: '3 sao', count: 1, percentage: 2 },
    { label: '2 sao', count: 0, percentage: 0 },
    { label: '1 sao', count: 0, percentage: 0 },
  ];

  const initialReviews = [
    {
      id: 1,
      client: 'Minh Anh',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
      project: 'Thiết kế Frontend cho web app SaaS',
      rating: 5,
      date: '10/04/2026',
      text: '"Công việc thực sự tuyệt vời. Bạn rất hiểu ý đồ thiết kế, giao tiếp liên tục, cập nhật tiến độ mỗi ngày và hoàn thành mọi thứ, kể cả các yêu cầu phát sinh với thái độ cực kỳ chuyên nghiệp."',
      reply: null
    },
    {
      id: 2,
      client: 'Minh Nghĩa',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
      project: 'Landing page và Animation hiệu ứng Cuộn',
      rating: 4,
      date: '25/03/2026',
      text: '"Chất lượng code rất tốt, hiệu ứng mượt. Tuy nhiên có một chút trễ deadline một ngày so với dự kiến ban đầu, nhưng nhìn chung kết quả cuối cùng rất hài lòng."',
      reply: null
    },
    {
      id: 3,
      client: 'Alice Wonder',
      initials: 'AW',
      project: 'Xây dựng hệ thống UI Components React',
      rating: 5,
      date: '12/02/2026',
      text: '"Tôi đã làm việc với nhiều freelancer UI nhưng David thực sự khác biệt, mọi Component đều được test cẩn thận và có Storybook đính kèm. Sẽ tiếp tục hợp tác ở các dự án tới."',
      reply: 'Cảm ơn Alice! Rất vui được hỗ trợ bạn xây dựng hệ thống UI này. Hy vọng sẽ sớm được gặp lại bạn trong các dự án tiếp theo.'
    }
  ];

  const [reviews, setReviews] = useState(initialReviews);

  const handleReplySubmit = (id) => {
    if (!replyText.trim()) return;
    
    setReviews(prev => prev.map(r => 
      r.id === id ? { ...r, reply: replyText } : r
    ));
    setReplyingToId(null);
    setReplyText('');
  };

  return (
    <div className="freelancer-reviews-container">
      <aside className="fl-sidebar">
        <div className="sidebar-heading">Hồ sơ công khai</div>
        <nav className="sidebar-nav">
          <div className={`nav-item ${activeNav === 'settings' ? 'active' : ''}`} onClick={() => setActiveNav('settings')}>
            <i className="fa-regular fa-id-card"></i>
            Cài đặt Hồ sơ
          </div>
          <div className={`nav-item ${activeNav === 'portfolio' ? 'active' : ''}`} onClick={() => setActiveNav('portfolio')}>
            <i className="fa-solid fa-briefcase"></i>
            Portfolio
          </div>
          <div className={`nav-item ${activeNav === 'rating' ? 'active' : ''}`} onClick={() => setActiveNav('rating')}>
            <i className="fa-solid fa-star"></i>
            Đánh giá
          </div>
          <div className={`nav-item ${activeNav === 'metrics' ? 'active' : ''}`} onClick={() => setActiveNav('metrics')}>
            <i className="fa-solid fa-chart-line"></i>
            Chỉ số thành công
          </div>
        </nav>
      </aside>

      <main className="fl-reviews-main">
        <div className="rating-summary-card">
          <div className="overall-score">
            <div className="score-num">4.9</div>
            <div className="overall-stars">
              <i className="fa-solid fa-star"></i>
              <i className="fa-solid fa-star"></i>
              <i className="fa-solid fa-star"></i>
              <i className="fa-solid fa-star"></i>
              <i className="fa-solid fa-star-half-stroke"></i>
            </div>
            <div className="total-reviews">Dựa trên 42 nhận xét</div>
          </div>

          <div className="rating-distribution">
            {distribution.map((dist, idx) => (
              <div key={idx} className="dist-row">
                <div className="dist-label">{dist.label}</div>
                <div className="dist-bar-bg">
                  <div className="dist-bar-fill" style={{ width: `${dist.percentage}%` }}></div>
                </div>
                <div className="dist-count">{dist.count}</div>
              </div>
            ))}
          </div>
        </div>

        <h2 className="reviews-section-title">Đánh giá gần đây</h2>

        <div className="reviews-list">
          {reviews.map((review) => (
            <div key={review.id} className="review-item">
              {review.avatar ? (
                <img src={review.avatar} alt={review.client} className="client-avatar" />
              ) : (
                <div className="client-avatar-placeholder">{review.initials}</div>
              )}

              <div className="review-content-wrapper">
                <div className="review-top">
                  <div>
                    <div className="client-name">{review.client}</div>
                    <a href="#" className="project-link">{review.project}</a>
                  </div>
                  <div className="review-meta">
                    <div className="review-stars">
                      {[...Array(5)].map((_, i) => (
                        <i key={i} className={`fa-${i < review.rating ? 'solid' : 'regular'} fa-star`}></i>
                      ))}
                    </div>
                    <div className="review-date">{review.date}</div>
                  </div>
                </div>
                <p className="review-text">{review.text}</p>
                
                {review.reply ? (
                  <div className="reply-content">
                    <div className="reply-header">Phản hồi của bạn:</div>
                    <p>{review.reply}</p>
                  </div>
                ) : replyingToId === review.id ? (
                  <div className="reply-form">
                    <textarea 
                      placeholder="Nhập phản hồi của bạn tới khách hàng..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                    ></textarea>
                    <div className="reply-actions">
                      <button className="btn-cancel-reply" onClick={() => setReplyingToId(null)}>Hủy</button>
                      <button className="btn-send-reply" onClick={() => handleReplySubmit(review.id)}>Gửi phản hồi</button>
                    </div>
                  </div>
                ) : (
                  <div className="reply-link" onClick={() => setReplyingToId(review.id)}>
                    Phản hồi <i className="fa-solid fa-chevron-down" style={{ fontSize: '10px' }}></i>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="load-more-container">
          <button className="btn-load-more">Tải thêm đánh giá</button>
        </div>
      </main>
    </div>
  );
};

export default ReviewsPage;
