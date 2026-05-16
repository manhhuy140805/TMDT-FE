import QuoteSummary from './QuoteSummary';
import QuoteItem from './QuoteItem';

const BidsSection = ({ quotes, isOwner, onAcceptQuote }) => {
  const getQuoteStats = () => {
    if (quotes.length === 0) return null;
    
    const amounts = quotes.map(q => q.amount);
    const durations = quotes.map(q => {
      const match = q.duration.match(/\d+/);
      return match ? parseInt(match[0]) : 0;
    });

    return {
      minPrice: Math.min(...amounts),
      maxPrice: Math.max(...amounts),
      minTime: Math.min(...durations),
      maxTime: Math.max(...durations),
      count: quotes.length
    };
  };

  const stats = getQuoteStats();
  
  // Kiểm tra xem đã có báo giá được chấp nhận chưa
  const hasAcceptedQuote = quotes.some(quote => quote.status === 'DA_CHAP_NHAN');

  return (
    <div style={{maxWidth: '1200px', margin: '0 auto 40px', padding: '0 20px'}}>
      <div className="d-card" style={{boxShadow: '0 10px 40px -10px rgba(0,0,0,0.08)', borderColor: '#CBD5E1'}}>
        <h2 className="d-section-title" style={{fontSize: '24px', fontFamily: 'var(--font-sans)'}}>
          <i className="fa-solid fa-users-rectangle" style={{color: 'var(--teal)', marginRight: '8px'}}></i>
          Thông tin Freelancer đã chào giá
        </h2>
        <p className="bids-note">Các ứng viên tiềm năng cùng những đề xuất chuyên môn xuất sắc nhất.</p>

        {/* Hiển thị summary cho tất cả */}
        {stats && <QuoteSummary stats={stats} />}

        <div style={{marginTop: '30px'}}>
          {quotes.length === 0 ? (
            <div className="empty-quotes">
              <i className="fa-regular fa-file-lines"></i>
              <h3>Chưa có báo giá nào</h3>
              <p>Hãy là người đầu tiên gửi báo giá cho yêu cầu này!</p>
            </div>
          ) : (
            // Hiển thị danh sách cho tất cả, nhưng ẩn chi tiết cho non-owner
            quotes.map((quote) => (
              <QuoteItem 
                key={quote.id} 
                quote={quote} 
                isOwner={isOwner}
                onAccept={onAcceptQuote}
                hasAcceptedQuote={hasAcceptedQuote}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default BidsSection;
