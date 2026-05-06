const QuoteItem = ({ quote, isOwner, onAccept, hasAcceptedQuote }) => {
  const defaultAvatar = 'https://png.pngtree.com/png-vector/20191101/ourmid/pngtree-cartoon-color-simple-male-avatar-png-image_1934459.jpg';
  
  const isAccepted = quote.status === 'DA_CHAP_NHAN';
  
  return (
    <div className={`bid-item ${isAccepted ? 'accepted' : ''}`}>
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
          <span>{quote.freelancer.rating || 0}</span>
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
            {isAccepted && (
              <span className="accepted-badge">
                <i className="fa-solid fa-check-circle"></i>
                Đã chấp nhận
              </span>
            )}
          </div>
          {isOwner && !hasAcceptedQuote && (
            <button 
              className="btn-success"
              onClick={() => onAccept(quote)}
            >
              Chấp nhận
            </button>
          )}
        </div>

        <p className="bid-desc">{quote.description}</p>
        
        {/* Skills */}
        {quote.freelancer.skills && quote.freelancer.skills.length > 0 && (
          <div className="freelancer-skills">
            {quote.freelancer.skills.slice(0, 5).map((skill, idx) => (
              <span key={idx} className="skill-badge">{skill}</span>
            ))}
            {quote.freelancer.skills.length > 5 && (
              <span className="skill-badge more">+{quote.freelancer.skills.length - 5}</span>
            )}
          </div>
        )}
      </div>

      {/* Stats Column - Chỉ hiển thị cho owner */}
      {isOwner ? (
        <div className="bid-stats-col">
          <div className="stat-row">
            <span>Giá đề xuất:</span>
            <span className="stat-value">{quote.amount.toLocaleString('vi-VN')} VNĐ</span>
          </div>
          <div className="stat-row">
            <span>Thời gian:</span>
            <span className="stat-value">{quote.duration}</span>
          </div>
          <div className="stat-row">
            <span>Gửi lúc:</span>
            <span className="stat-value">{quote.submittedTime}</span>
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
