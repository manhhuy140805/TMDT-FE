// Dùng UI Avatars làm fallback — không phụ thuộc external image host
const getAvatarFallback = (name = 'F') =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0EA5E9&color=fff&size=56`;

const QuoteItem = ({ quote, isOwner, onAccept, onChat, hasAcceptedQuote }) => {
  const isAccepted = quote.status === 'DuocChon' || quote.status === 'DaChapNhan' || quote.status === 'DA_CHAP_NHAN';
  const rating = Number(quote.freelancer?.rating ?? 0);
  const name = quote.freelancer?.name || 'Freelancer';

  const avatarSrc = quote.freelancer?.avatar || getAvatarFallback(name);

  return (
    <div className={`rd-quote-item ${isAccepted ? 'accepted' : ''}`}>
      {/* Avatar col */}
      <div className="rd-quote-avatar-col">
        <img
          src={avatarSrc}
          alt={name}
          className="rd-quote-avatar"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = getAvatarFallback(name);
          }}
        />
        <div className="rd-quote-rating">
          <i className="fa-solid fa-star"></i>
          <span>{rating.toFixed(1)}</span>
        </div>
      </div>

      {/* Main col */}
      <div className="rd-quote-main">
        <div className="rd-quote-header">
          <div className="rd-quote-name-row">
            <a href="#" className="rd-quote-name">{name}</a>
            {quote.freelancer?.verified && (
              <i className="fa-solid fa-circle-check rd-quote-verified"></i>
            )}
            {isAccepted && (
              <span className="rd-accepted-badge">
                <i className="fa-solid fa-check"></i> Đã chấp nhận
              </span>
            )}
          </div>
          {isOwner && !hasAcceptedQuote && (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button className="rd-btn-accept" onClick={() => onAccept(quote)}>
                Chấp nhận
              </button>
              <button className="rd-btn-chat" onClick={() => onChat(quote)}
                title="Nhắn tin với freelancer">
                <i className="fa-regular fa-comment-dots"></i>
              </button>
            </div>
          )}
          {isOwner && hasAcceptedQuote && !isAccepted && (
            <button className="rd-btn-chat" onClick={() => onChat(quote)}
              title="Nhắn tin với freelancer">
              <i className="fa-regular fa-comment-dots"></i>
            </button>
          )}
          {isOwner && isAccepted && (
            <button className="rd-btn-chat rd-btn-chat-active" onClick={() => onChat(quote)}>
              <i className="fa-regular fa-comment-dots"></i> Nhắn tin
            </button>
          )}
        </div>

        <p className="rd-quote-desc">{quote.description}</p>

        {quote.freelancer?.skills?.length > 0 && (
          <div className="rd-skill-chips">
            {quote.freelancer.skills.slice(0, 5).map((s, i) => (
              <span key={i} className="rd-skill-chip">{s}</span>
            ))}
            {quote.freelancer.skills.length > 5 && (
              <span className="rd-skill-chip more">
                +{quote.freelancer.skills.length - 5}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Stats col */}
      {isOwner ? (
        <div className="rd-quote-stats">
          <div className="rd-stat-row">
            <span>Giá đề xuất</span>
            <span>{Number(quote.amount ?? 0).toLocaleString('vi-VN')} đ</span>
          </div>
          <div className="rd-stat-row">
            <span>Thời gian</span>
            <span>{quote.duration}</span>
          </div>
          <div className="rd-stat-row">
            <span>Gửi lúc</span>
            <span>{quote.submittedTime}</span>
          </div>
        </div>
      ) : (
        <div className="rd-quote-stats">
          <div className="rd-stat-locked">
            <i className="fa-solid fa-lock"></i>
            Thông tin giá được bảo mật
          </div>
        </div>
      )}
    </div>
  );
};

export default QuoteItem;
