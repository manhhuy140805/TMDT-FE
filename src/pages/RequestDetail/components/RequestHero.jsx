const STATUS_MAP = {
  MoiTao:    { label: 'Đang mở',      cls: 'rd-badge-green' },
  DangNhan:  { label: 'Đang thực hiện', cls: 'rd-badge-teal' },
  HoanThanh: { label: 'Hoàn thành',   cls: 'rd-badge-gold' },
  DaHuy:     { label: 'Đã hủy',       cls: 'rd-badge-red'  },
};

const RequestHero = ({ request, onNavigate, isAcceptingBids = true }) => {
  const status = STATUS_MAP[request.status] || { label: request.status, cls: 'rd-badge-white' };

  const formatDate = (d) => {
    if (!d) return null;
    const date = new Date(d);
    if (isNaN(date)) return null;
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div className="rd-hero">
      <div className="rd-hero-inner">
        {/* Breadcrumb */}
        <div className="rd-breadcrumb">
          <a onClick={() => onNavigate('/')}>Trang chủ</a>
          <i className="fa-solid fa-chevron-right"></i>
          <a onClick={() => onNavigate('/requests')}>Việc làm Freelance</a>
          <i className="fa-solid fa-chevron-right"></i>
          <span>Chi tiết công việc</span>
        </div>

        {/* Badges */}
        <div className="rd-badges">
          <span className="rd-badge rd-badge-white">
            <i className="fa-solid fa-briefcase"></i> Dự án Freelance
          </span>
          <span className={`rd-badge ${status.cls}`}>
            <i className="fa-solid fa-circle" style={{ fontSize: '7px' }}></i>
            {status.label}
          </span>
          {!isAcceptingBids && request.status === 'MoiTao' && (
            <span className="rd-badge rd-badge-red">
              <i className="fa-solid fa-lock"></i> Ngừng nhận hồ sơ
            </span>
          )}
          {request.requiresSupervision && (
            <span className="rd-badge rd-badge-gold">
              <i className="fa-solid fa-shield-halved"></i> Có giám sát
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className="rd-hero-title">{request.title}</h1>

        {/* Meta */}
        <div className="rd-hero-meta">
          {request.category && (
            <span className="rd-hero-meta-item">
              <i className="fa-solid fa-tag"></i> {request.category}
            </span>
          )}
          <span className="rd-hero-meta-item">
            <i className="fa-solid fa-location-dot"></i> {request.location}
          </span>
          {request.createdAt && (
            <span className="rd-hero-meta-item">
              <i className="fa-regular fa-clock"></i>
              Đăng ngày <strong>{formatDate(request.createdAt)}</strong>
            </span>
          )}
          <span className="rd-hero-meta-item">
            <i className="fa-solid fa-users"></i>
            <strong>{request.bids}</strong> ứng viên
          </span>
        </div>
      </div>
    </div>
  );
};

export default RequestHero;
