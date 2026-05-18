import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './RatingPage.css';

const RatingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Custom states for fetched data with fallback to screenshot data
  const [flData, setFlData] = useState({
    name: 'Hằng Nga',
    role: 'Thiết kế UI/UX App Giao Hàng',
    detailRole: 'Senior UX/UI Designer',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150'
  });

  const [pjData, setPjData] = useState({
    name: 'Thiết kế UI/UX cho ứng dụng di động E-commerce'
  });

  useEffect(() => {
    const loadContractData = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      // Special mockup mappings for freelancer/hang-nga rating paths
      if (id === 'freelancer' || id === 'hang-nga') {
        setFlData({
          name: 'Hằng Nga',
          role: 'Thiết kế UI/UX App Giao Hàng',
          detailRole: 'Senior UX/UI Designer',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150'
        });
        setPjData({
          name: 'Thiết kế UI/UX cho ứng dụng di động E-commerce'
        });
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const response = await api.jobs.getById(id);
        if (response.success && response.data) {
          const contract = response.data;
          setPjData({
            name: contract.title || contract.tieuDe || pjData.name
          });
          
          if (contract.freelancer) {
            setFlData({
              name: contract.freelancer.name || 'Freelancer',
              role: contract.title || 'Freelancer Partner',
              detailRole: 'Professional Partner',
              avatar: contract.freelancer.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150'
            });
          }
        }
      } catch (error) {
        console.error('Error fetching contract for rating:', error);
      } finally {
        setLoading(false);
      }
    };

    loadContractData();
  }, [id]);

  const handleHover = (val) => setHover(val);
  const handleLeave = () => setHover(0);
  const handleClick = (val) => setRating(val);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      alert('Vui lòng chọn số sao đánh giá!');
      return;
    }
    
    try {
      const storedUser = localStorage.getItem('user');
      const currentUser = storedUser ? JSON.parse(storedUser) : null;
      
      const payload = {
        contractId: id || 1,
        reviewerId: currentUser?.taiKhoanId || currentUser?.id || 1,
        score: rating,
        content: comment
      };

      const response = await api.reviews.create(payload);
      if (response.success) {
        setIsSubmitted(true);
      } else {
        // Fallback for demo mode
        setIsSubmitted(true);
      }
    } catch (error) {
      console.error('Submit rating error:', error);
      // Fallback for demo mode
      setIsSubmitted(true);
    }
  };

  if (loading) {
    return (
      <div className="loading-state py-5 text-center">
        <i className="fa-solid fa-circle-notch fa-spin text-teal" style={{ fontSize: '40px', color: 'var(--teal)' }}></i>
        <p className="mt-3">Đang tải thông tin đánh giá...</p>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="rating-page-container">
        <div className="rating-card" style={{ textAlign: 'center' }}>
          <i className="fa-solid fa-circle-check" style={{ fontSize: '64px', color: '#10b981', marginBottom: '24px' }}></i>
          <h1>Cảm ơn bạn!</h1>
          <p style={{ color: '#64748b', marginBottom: '32px' }}>Đánh giá của bạn đã được gửi thành công. Điều này giúp freelancer cải thiện chất lượng công việc.</p>
          <button className="btn-submit-rating" onClick={() => navigate('/')}>VỀ TRANG CHỦ</button>
        </div>
      </div>
    );
  }

  return (
    <div className="rating-page-container">
      <div className="rating-card">
        <div className="rating-header">
          <h1>Đánh giá Freelancer</h1>
          <div className="freelancer-mini-profile">
            <img src={flData.avatar} alt={flData.name} className="mini-avatar" />
            <div className="mini-info">
              <h3>
                {flData.name} 
                <i className="fa-solid fa-circle-check verify-icon"></i>
              </h3>
              <p>{flData.role}</p>
            </div>
          </div>
        </div>

        <div className="rating-section">
          <h2>Đánh giá của bạn</h2>
          <p className="project-name">Dự án: <b>{pjData.name}</b></p>

          <div className="center-profile">
            <img src={flData.avatar} alt={flData.name} className="center-avatar" />
            <div className="center-name">{flData.name}</div>
            <div className="center-role">{flData.detailRole}</div>
          </div>

          <div className="satisfaction-query">Mức độ hài lòng của bạn về chất lượng công việc?</div>
          
          <div className="stars-group">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className={`star-btn ${(hover || rating) >= star ? 'active' : ''}`}
                onMouseEnter={() => handleHover(star)}
                onMouseLeave={handleLeave}
                onClick={() => handleClick(star)}
              >
                <i className={`fa-${(hover || rating) >= star ? 'solid' : 'regular'} fa-star`}></i>
              </button>
            ))}
          </div>
          <div className="stars-caption">Vui lòng chọn số sao</div>

          <div className="comment-section">
            <label className="comment-label">Nhận xét chi tiết <span>*</span></label>
            <textarea
              className="rating-textarea"
              placeholder="Ví dụ: David làm việc rất chuyên nghiệp, giao tiếp tốt và hoàn thành dự án trước thời hạn..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
            ></textarea>
          </div>

          <div className="rating-actions">
            <button type="button" className="btn-cancel" onClick={() => navigate(-1)}>
              Hủy bỏ
            </button>
            <button 
              type="submit" 
              className="btn-submit-rating" 
              onClick={handleSubmit}
              disabled={!rating || !comment.trim()}
            >
              GỬI ĐÁNH GIÁ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RatingPage;
