import QuoteSummary from './QuoteSummary';
import QuoteItem from './QuoteItem';

const BidsSection = ({ quotes, isOwner, onAcceptQuote, onChat }) => {
  const stats = (() => {
    if (!quotes.length) return null;
    const amounts = quotes.map(q => q.amount || 0);
    const days = quotes.map(q => { const m = String(q.duration).match(/\d+/); return m ? +m[0] : 0; });
    return {
      minPrice: Math.min(...amounts), maxPrice: Math.max(...amounts),
      minTime: Math.min(...days),     maxTime: Math.max(...days),
      count: quotes.length,
    };
  })();

  const hasAcceptedQuote = quotes.some(q => q.status === 'DuocChon' || q.status === 'DaChapNhan' || q.status === 'DA_CHAP_NHAN');

  return (
    <div className="rd-bids-wrap">
      <div className="rd-card" style={{ boxShadow: '0 4px 20px rgba(0,0,0,.06)' }}>
        <h2 className="rd-card-title" style={{ fontSize: '20px', marginBottom: '6px' }}>
          <i className="fa-solid fa-users-rectangle"></i>
          Freelancer đã chào giá
        </h2>
        <p style={{ fontSize: '14px', color: '#64748B', marginBottom: '24px' }}>
          Các ứng viên tiềm năng cùng những đề xuất chuyên môn xuất sắc nhất.
        </p>

        {stats && <QuoteSummary stats={stats} />}

        <div style={{ marginTop: '24px' }}>
          {quotes.length === 0 ? (
            <div className="rd-empty-bids">
              <i className="fa-regular fa-file-lines"></i>
              <h3>Chưa có báo giá nào</h3>
              <p>Hãy là người đầu tiên gửi báo giá cho yêu cầu này!</p>
            </div>
          ) : (
            quotes.map(q => (
              <QuoteItem
                key={q.id}
                quote={q}
                isOwner={isOwner}
                onAccept={onAcceptQuote}
                onChat={onChat}
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
