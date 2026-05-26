import { useNavigate } from 'react-router-dom';

const fmt = (d) => {
  if (!d) return 'N/A';
  const date = new Date(d);
  if (isNaN(date)) return d;
  return date.toLocaleDateString('vi-VN');
};

const ActionCard = ({
  request,
  onSubmitQuote,
  isOwner,
  isAcceptingBids = true,
  isFreelancer = false,
  currentUser = null,
  canSubmitQuote = true,
}) => {
  const navigate = useNavigate();
  const hasSelectedFreelancer = request.selectedQuoteId && request.selectedFreelancerId;

  const budget = typeof request.budget === 'string'
    ? request.budget
    : `${Number(request.budget?.min ?? 0).toLocaleString('vi-VN')} – ${Number(request.budget?.max ?? 0).toLocaleString('vi-VN')} VNĐ`;

  return (
    <div className="ac-card">
      {/* Budget */}
      <div className="ac-budget">
        <span className="ac-budget-label">Ngân sách dự án</span>
        <span className="ac-budget-val">{budget}</span>
      </div>

      {/* Info */}
      <ul className="ac-meta">
        <li className="ac-meta-item">
          <i className="fa-regular fa-calendar-xmark ac-meta-ico"></i>
          <span className="ac-meta-label">Hạn nhận hồ sơ</span>
          <span className="ac-meta-val red">{fmt(request.deadline)}</span>
        </li>
        <li className="ac-meta-item">
          <i className="fa-regular fa-calendar-check ac-meta-ico"></i>
          <span className="ac-meta-label">Thời hạn hoàn thành</span>
          <span className="ac-meta-val">{fmt(request.deadline)}</span>
        </li>
        <li className="ac-meta-item">
          <i className="fa-solid fa-user-group ac-meta-ico"></i>
          <span className="ac-meta-label">Ứng viên quan tâm</span>
          <span className="ac-meta-val">{request.bids} Freelancer</span>
        </li>
        {request.requiresSupervision && (
          <li className="ac-meta-item">
            <i className="fa-solid fa-shield-halved ac-meta-ico"></i>
            <span className="ac-meta-label">Giám sát</span>
            <span className="ac-meta-val">Có giám sát</span>
          </li>
        )}
      </ul>

      {/* Actions */}
      <div className="ac-actions">
        {isOwner ? (
          <>
            {hasSelectedFreelancer && (
              <button className="ac-btn-primary green"
                onClick={() => navigate(`/requests/${request.id}/progress`)}>
                <i className="fa-solid fa-chart-line"></i> Theo dõi tiến độ
              </button>
            )}
            <button className="ac-btn-primary"
              onClick={() => navigate('/my-requests')}>
              <i className="fa-solid fa-gear"></i> Quản lý yêu cầu
            </button>
            <button className="ac-btn-outline"
              onClick={() => navigate(`/requests/${request.id}/edit`)}>
              <i className="fa-solid fa-pen"></i> Chỉnh sửa
            </button>
          </>
        ) : isAcceptingBids ? (
          <>
            {isFreelancer || !currentUser ? (
              canSubmitQuote ? (
                <button className="ac-btn-primary" onClick={onSubmitQuote}>
                  <i className="fa-solid fa-paper-plane"></i> Nộp Hồ Sơ Báo Giá
                </button>
              ) : request.trangThaiGiamSat === "ChoDuyet" ? (
                <div className="ac-closed" style={{ background: '#FFFBEB', borderColor: '#FDE68A', color: '#B45309', display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'center', lineHeight: '1.4' }}>
                  <span style={{ fontWeight: 700 }}><i className="fa-solid fa-hourglass-half"></i> Chờ Giám Sát Duyệt</span>
                  <span style={{ fontSize: '11px', color: '#D97706', fontWeight: 500 }}>Đang chờ đơn vị giám sát phê duyệt yêu cầu để bắt đầu nhận báo giá.</span>
                </div>
              ) : (
                <div className="ac-closed" style={{ background: '#FEF2F2', borderColor: '#FCA5A5', color: '#B91C1C', display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'center', lineHeight: '1.4' }}>
                  <span style={{ fontWeight: 700 }}><i className="fa-solid fa-circle-xmark"></i> Giám Sát Từ Chối</span>
                  <span style={{ fontSize: '11px', color: '#DC2626', fontWeight: 500 }}>Đơn vị giám sát đã từ chối yêu cầu. Đang chờ người thuê chọn đơn vị khác.</span>
                </div>
              )
            ) : (
              <div className="ac-closed" style={{ background: '#F1F5F9', borderColor: '#CBD5E1', color: '#475569' }}>
                <i className="fa-solid fa-circle-info"></i>
                Chỉ dành cho Freelancer
              </div>
            )}
            <button className="ac-btn-outline">
              <i className="fa-regular fa-bookmark"></i> Lưu dự án
            </button>
          </>
        ) : (
          <div className="ac-closed">
            <i className="fa-solid fa-lock"></i>
            Dự án đã ngừng nhận hồ sơ
          </div>
        )}
      </div>
    </div>
  );
};

export default ActionCard;
