import { useNavigate } from 'react-router-dom';

const ActionCard = ({ request, onSubmitQuote, isOwner }) => {
  const navigate = useNavigate();

  const handleEditRequest = () => {
    navigate(`/requests/${request.id}/edit`);
  };

  const handleManageRequest = () => {
    navigate('/my-requests');
  };

  const handleViewProgress = () => {
    navigate(`/requests/${request.id}/progress`);
  };

  // Kiểm tra xem yêu cầu đã chọn freelancer chưa
  const hasSelectedFreelancer = request.selectedQuoteId && request.selectedFreelancerId;

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
          {hasSelectedFreelancer && (
            <button 
              className="bg-btn-primary" 
              onClick={handleViewProgress}
              style={{
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                marginBottom: '12px'
              }}
            >
              <i className="fa-solid fa-chart-line"></i> Theo dõi tiến độ
            </button>
          )}
          <button className="bg-btn-primary" onClick={handleManageRequest}>
            <i className="fa-solid fa-gear"></i> Quản lý yêu cầu
          </button>
          <button className="bg-btn-outline" onClick={handleEditRequest}>
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
