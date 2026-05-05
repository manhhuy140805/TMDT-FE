const QuoteSummary = ({ stats }) => {
  return (
    <div className="bids-summary-card" style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px'}}>
      <div style={{padding: '16px', background: '#fff', borderRadius: '12px', border: '1px solid var(--border-light)'}}>
        <div style={{marginBottom: '12px', fontWeight: 600, color: 'var(--navy)', borderBottom: '2px solid #E2E8F0', paddingBottom: '8px', fontSize: '15px'}}>
          Tổng kết chi phí
        </div>
        <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
          <div style={{display: 'flex', justifyContent: 'space-between'}}>
            <span>Giá thấp nhất:</span>
            <strong style={{color: '#16A34A'}}>{stats.minPrice.toLocaleString('vi-VN')} đ</strong>
          </div>
          <div style={{display: 'flex', justifyContent: 'space-between'}}>
            <span>Giá cao nhất:</span>
            <strong style={{color: '#DC2626'}}>{stats.maxPrice.toLocaleString('vi-VN')} đ</strong>
          </div>
        </div>
      </div>

      <div style={{padding: '16px', background: '#fff', borderRadius: '12px', border: '1px solid var(--border-light)'}}>
        <div style={{marginBottom: '12px', fontWeight: 600, color: 'var(--navy)', borderBottom: '2px solid #E2E8F0', paddingBottom: '8px', fontSize: '15px'}}>
          Tổng kết thời gian (<strong>{stats.count}</strong> lượt ứng tuyển)
        </div>
        <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
          <div style={{display: 'flex', justifyContent: 'space-between'}}>
            <span>Nhanh nhất:</span>
            <strong style={{color: 'var(--navy)'}}>{stats.minTime} ngày</strong>
          </div>
          <div style={{display: 'flex', justifyContent: 'space-between'}}>
            <span>Lâu nhất:</span>
            <strong style={{color: 'var(--navy)'}}>{stats.maxTime} ngày</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuoteSummary;
