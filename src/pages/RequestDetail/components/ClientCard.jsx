const DEFAULT_AVATAR = (name = 'U') =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0F172A&color=fff&size=96`;

const getInitials = (name = 'U') =>
  name
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(-2)
    .join('')
    .toUpperCase();

const ClientCard = ({ employer, location }) => {
  if (!employer) return null;

  const name = employer.fullName || employer.name || 'Khách hàng';
  const rating = employer.rating || 5;
  const avatarSrc = employer.avatar || DEFAULT_AVATAR(name);
  const initials = getInitials(name);
  const joined = employer.joinedAt || 'T3/2024';

  return (
    <div className="ac-card client-card">
      <div className="ac-section-title">Về Khách hàng</div>

      <div className="ac-client-profile">
        <div className="ac-client-avatar-wrap">
          <img
            src={avatarSrc}
            alt={name}
            className="ac-client-avatar"
            onError={(e) => {
              e.target.onerror = null;
              e.target.style.display = 'none';
              const fb = e.target.nextElementSibling;
              if (fb) fb.style.display = 'flex';
            }}
          />
          <span className="ac-client-avatar-fallback" aria-hidden="true">
            {initials}
          </span>
        </div>
        <div className="ac-client-info">
          <div className="ac-client-name">{name}</div>
          <div className="ac-client-loc">
            <i className="fa-regular fa-location-dot"></i>
            <span>{location || 'Việt Nam'}</span>
          </div>
        </div>
      </div>

      <ul className="ac-meta">
        <li className="ac-meta-item">
          <i className="fa-solid fa-star ac-meta-ico star"></i>
          <span className="ac-meta-label">Đánh giá</span>
          <span className="ac-meta-val">{rating.toFixed(1)} / 5.0</span>
        </li>
        <li className="ac-meta-item">
          <i className="fa-regular fa-circle-check ac-meta-ico"></i>
          <span className="ac-meta-label">Thanh toán</span>
          <span className="ac-meta-val">Đã xác minh</span>
        </li>
        <li className="ac-meta-item">
          <i className="fa-regular fa-calendar ac-meta-ico"></i>
          <span className="ac-meta-label">Tham gia</span>
          <span className="ac-meta-val">{joined}</span>
        </li>
      </ul>
    </div>
  );
};

export default ClientCard;
