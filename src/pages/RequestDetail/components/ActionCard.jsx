const ActionCard = ({ request, onSubmitQuote, isOwner }) => {
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
            {request.submissionDeadlineDate 
              ? new Date(request.submissionDeadlineDate).toLocaleDateString('vi-VN', {
                  day: '2-digit',
                  month: '2-digit', 
                  year: 'numeric'
                })
              : request.submissionDeadline || request.deadline
            }
          </span>
        </div>
      </div>

      <div className="d-deadline-item">
        <i className="fa-regular fa-calendar-check"></i>
        <div>
          <span className="d-label">Thời gian hoàn thành dự án</span>
          <span className="d-value">{request.deadline}</span>
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
