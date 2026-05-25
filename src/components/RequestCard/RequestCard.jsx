import './RequestCard.css';

const RequestCard = ({ request, onClick }) => {
  // Get status badge style
  const getStatusBadge = () => {
    const statusMap = {
      'DangMo': { text: 'Đang nhận hồ sơ', class: 'status-open' },
      'DangNhanHoSo': { text: 'Đang nhận hồ sơ', class: 'status-open' },
      'MoDau': { text: 'Đang nhận hồ sơ', class: 'status-open' },
      'DaDong': { text: 'Đã đóng', class: 'status-closed' },
      'DaHuy': { text: 'Đã hủy', class: 'status-cancelled' },
      'DaChot': { text: 'Đã chốt', class: 'status-selected' },
    };
    return statusMap[request.status] || { text: request.statusText || 'Không xác định', class: 'status-default' };
  };

  const statusBadge = getStatusBadge();

  return (
    <div className="r-job-card" onClick={() => onClick(request.id)}>
      <div className="r-job-header">
        <h3 className="r-job-title">{request.title}</h3>
        <span className={`r-status-badge ${statusBadge.class}`}>
          {statusBadge.text}
        </span>
      </div>

      <div className="r-job-meta">
        <span className="r-meta-item">
          <i className="fa-solid fa-tag"></i> {request.category}
        </span>
        <span className="r-meta-item">
          <i className="fa-solid fa-clock"></i> {request.postedTime}
        </span>
        {request.location && (
          <span className="r-meta-item">
            <i className="fa-solid fa-location-dot"></i> {request.location}
          </span>
        )}
      </div>

      <p className="r-job-desc">{request.description}</p>

      {request.skills && request.skills.length > 0 && (
        <div className="r-job-skills">
          {request.skills.map((skill, index) => (
            <span key={index} className="r-skill-tag">
              {skill}
            </span>
          ))}
        </div>
      )}

      <div className="r-job-footer">
        <div className="r-job-info">
          <span className="r-budget">
            <i className="fa-solid fa-money-bill-wave"></i> {request.budget}
          </span>
          <span className="r-deadline">
            <i className="fa-solid fa-calendar-check"></i> Hạn nộp: {request.submissionDeadlineText || request.deadlineText || 'Chưa xác định'}
          </span>
        </div>
        <div className="r-bids">
          <i className="fa-solid fa-users"></i> {request.bids} đề xuất
        </div>
      </div>
    </div>
  );
};

export default RequestCard;
