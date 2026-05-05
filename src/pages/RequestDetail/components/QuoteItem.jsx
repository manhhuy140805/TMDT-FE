const QuoteItem = ({ quote, isOwner }) => {
  const defaultAvatar = 'https://png.pngtree.com/png-vector/20191101/ourmid/pngtree-cartoon-color-simple-male-avatar-png-image_1934459.jpg';
  
  return (
    <div className="bid-item">
      {/* User Column */}
      <div className="bid-user-col">
        <img 
          src={quote.freelancer.avatar || defaultAvatar} 
          alt={quote.freelancer.name}
          className="bid-avatar"
          onError={(e) => {
            e.target.src = defaultAvatar;
          }}
        />
        <div className="stars">
          <i className="fa-solid fa-star"></i>
          <span>{quote.freelancer.rating}</span>
        </div>
      </div>

      {/* Main Column */}
      <div className="bid-main-col">
        <div className="bid-header">
          <div className="bid-name-wrap">
            <a href="#" className="bid-name">
              {quote.freelancer.name}
              {quote.freelancer.verified && (
                <i className="fa-solid fa-circle-check verified"></i>
              )}
            </a>
          </div>
          {isOwner && <button className="btn-success">Chấp nhận</button>}
        </div>

        <p className="bid-desc">{quote.description}</p>
      </div>

      {/* Stats Column - Chỉ hiển thị cho owner */}
      {isOwner ? (
        <div className="bid-stats-col">
          <div className="stat-row">
            <span>Giá đề xuất:</span>
            <span>{quote.amount.toLocaleString('vi-VN')} VNĐ</span>
          </div>
          <div className="stat-row">
            <span>Thời gian:</span>
            <span>{quote.duration}</span>
          </div>
          <div className="stat-row">
            <span>Gửi lúc:</span>
            <span>{quote.submittedTime}</span>
          </div>
        </div>
      ) : (
        <div className="bid-stats-col">
          <div style={{
            padding: '20px',
            background: '#F8FAFC',
            borderRadius: '8px',
            textAlign: 'center',
            color: '#64748B',
            fontSize: '13px'
          }}>
            <i className="fa-solid fa-lock" style={{fontSize: '24px', marginBottom: '8px', display: 'block', color: '#94A3B8'}}></i>
            <p style={{margin: 0}}>Thông tin giá và thời gian được bảo mật</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuoteItem;
