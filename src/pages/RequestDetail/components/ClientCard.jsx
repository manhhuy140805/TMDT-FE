const ClientCard = ({ employer, location }) => {
  const defaultAvatar = 'https://png.pngtree.com/png-vector/20191101/ourmid/pngtree-cartoon-color-simple-male-avatar-png-image_1934459.jpg';
  
  if (!employer) {
    return (
      <div className="d-card">
        <h3 className="d-section-title">Về Khách hàng yêu cầu</h3>
        <p style={{color: '#94A3B8', fontSize: '14px', fontStyle: 'italic'}}>
          Thông tin khách hàng không khả dụng
        </p>
      </div>
    );
  }
  
  return (
    <div className="d-card">
      <h3 className="d-section-title">Về Khách hàng yêu cầu</h3>
      <div className="d-client-profile">
        <img 
          src={employer.avatar || defaultAvatar} 
          alt={employer.fullName || employer.name}
          className="d-client-avatar"
          onError={(e) => {
            e.target.src = defaultAvatar;
          }}
        />
        <div>
          <h4 className="d-client-name">{employer.fullName || employer.name}</h4>
          <div style={{fontSize: '13px', color: '#64748B'}}>
            <i className="fa-solid fa-location-dot"></i> {location}
          </div>
        </div>
      </div>

      <div className="c-stat-list">
        <div className="c-stat">
          <div className="stars" style={{color: '#F59E0B'}}>
            <i className="fa-solid fa-star"></i>
            <i className="fa-solid fa-star"></i>
            <i className="fa-solid fa-star"></i>
            <i className="fa-solid fa-star"></i>
            <i className="fa-solid fa-star"></i>
          </div>
          <span style={{fontWeight: 600, paddingLeft: '5px'}}>5.0</span>
        </div>
        <div className="c-stat">
          <i className="fa-solid fa-check-circle"></i> Sẵn sàng thanh toán
        </div>
        <div className="c-stat">
          <i className="fa-regular fa-calendar" style={{color: 'var(--teal)'}}></i> Tham gia: T3/2024
        </div>
      </div>
    </div>
  );
};

export default ClientCard;
