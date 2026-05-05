const RequestHero = ({ request, onNavigate }) => {
  return (
    <div className="d-hero">
      <div className="d-hero-container">
        <div className="d-breadcrumb">
          <a onClick={() => onNavigate('/')}>Trang chủ</a>
          <i className="fa-solid fa-chevron-right"></i>
          <a onClick={() => onNavigate('/requests')}>Việc làm Freelance</a>
          <i className="fa-solid fa-chevron-right"></i>
          <span>Chi tiết công việc</span>
        </div>

        <h1 className="d-title">{request.title}</h1>

        <div className="d-badges">
          <span className="job-badge" style={{background: 'rgba(255,255,255,0.2)', color: '#fff'}}>
            DỰ ÁN FREELANCE
          </span>
          <span className="job-badge red">TIN MỚI</span>
        </div>
      </div>
    </div>
  );
};

export default RequestHero;
