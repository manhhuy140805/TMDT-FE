const QuoteSummary = ({ stats }) => (
  <div className="rd-summary-grid">
    <div className="rd-summary-box">
      <div className="rd-summary-box-title">
        <i className="fa-solid fa-coins" style={{ color: '#F59E0B', marginRight: '6px' }}></i>
        Tổng kết chi phí
      </div>
      <div className="rd-summary-row">
        <span>Giá thấp nhất</span>
        <strong className="up">{stats.minPrice.toLocaleString('vi-VN')} đ</strong>
      </div>
      <div className="rd-summary-row">
        <span>Giá cao nhất</span>
        <strong className="down">{stats.maxPrice.toLocaleString('vi-VN')} đ</strong>
      </div>
    </div>

    <div className="rd-summary-box">
      <div className="rd-summary-box-title">
        <i className="fa-regular fa-clock" style={{ color: '#0EA5E9', marginRight: '6px' }}></i>
        Thời gian ({stats.count} ứng tuyển)
      </div>
      <div className="rd-summary-row">
        <span>Nhanh nhất</span>
        <strong>{stats.minTime} ngày</strong>
      </div>
      <div className="rd-summary-row">
        <span>Lâu nhất</span>
        <strong>{stats.maxTime} ngày</strong>
      </div>
    </div>
  </div>
);

export default QuoteSummary;
