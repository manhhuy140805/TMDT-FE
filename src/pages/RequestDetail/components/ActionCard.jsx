const ActionCard = ({ request, onSubmitQuote, isOwner }) => {
  // Helper function to format dates correctly and generate a logical submission deadline
  const formatDeadline = (dateStr) => {
    if (!dateStr) return '';
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      return `${parts[0].padStart(2, '0')}/${parts[1].padStart(2, '0')}/${parts[2]}`;
    }
    return dateStr;
  };

  const getSubmissionDeadline = () => {
    if (request.submissionDeadline) return formatDeadline(request.submissionDeadline);
    if (request.submissionDeadlineDate) {
      return new Date(request.submissionDeadlineDate).toLocaleDateString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric'
      });
    }
    // Generate a date ~10 days before the deadline if possible
    if (request.deadline) {
      const parts = request.deadline.split('/');
      if (parts.length === 3) {
        let d = parseInt(parts[0], 10);
        let m = parseInt(parts[1], 10);
        let y = parseInt(parts[2], 10);
        d -= 10;
        if (d <= 0) {
          m -= 1;
          if (m <= 0) { m = 12; y -= 1; }
          d = 28 + d; // Rough estimation just for mock display
        }
        return `${d.toString().padStart(2, '0')}/${m.toString().padStart(2, '0')}/${y}`;
      }
    }
    return request.deadline;
  };

  return (
    <div className="d-card">
      <div className="d-budget-block">
        <span className="d-budget-label">Ngân sách dự kiến</span>
        <div className="d-budget-value">{request.budget}</div>
      </div>

      <div className="d-deadline-item">
        <i className="fa-regular fa-clock"></i>
        <div>
          <span className="d-label">Hạn nhận hồ sơ tham gia</span>
          <span className="d-value text-danger" style={{color: '#DC2626'}}>
            {getSubmissionDeadline()}
          </span>
        </div>
      </div>

      <div className="d-deadline-item">
        <i className="fa-regular fa-calendar-check"></i>
        <div>
          <span className="d-label">Thời gian hoàn thành dự án</span>
          <span className="d-value">{request.deadlineText || formatDeadline(request.deadline)}</span>
        </div>
      </div>

      <div className="d-deadline-item" style={{marginBottom: '24px'}}>
        <i className="fa-solid fa-users"></i>
        <div>
          <span className="d-label">Lượng ứng viên quan tâm</span>
          <span className="d-value">{request.bids} Freelancer</span>
        </div>
      </div>

      {isOwner ? (
        // Giao diện cho người đăng yêu cầu
        <>
          <button className="bg-btn-primary" onClick={() => alert('Chức năng quản lý yêu cầu')}>
            <i className="fa-solid fa-gear"></i> Quản lý yêu cầu
          </button>
          <button className="bg-btn-outline" onClick={() => alert('Chức năng chỉnh sửa')}>
            <i className="fa-solid fa-pen"></i> Chỉnh sửa yêu cầu
          </button>
        </>
      ) : (
        // Giao diện cho freelancer/người xem khác
        <>
          <button className="bg-btn-primary" onClick={onSubmitQuote}>
            Nộp Hồ Sơ Báo Giá
          </button>
          <button className="bg-btn-outline">
            <i className="fa-regular fa-bookmark"></i> Lưu tâm dự án này
          </button>
        </>
      )}
    </div>
  );
};

export default ActionCard;
