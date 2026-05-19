const DEFAULT_AVATAR = (name = 'F') =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0EA5E9&color=fff&size=56`;

const AcceptQuoteModal = ({ show, selectedQuote, onClose, onConfirm, accepting = false }) => {
  if (!show || !selectedQuote) return null;

  const { freelancer, minPrice, maxPrice, amount, duration } = selectedQuote;
  const avatarSrc = freelancer.avatar || DEFAULT_AVATAR(freelancer.name);

  return (
    <div className="rd-modal-overlay" onClick={onClose}>
      <div className="rd-modal" onClick={(e) => e.stopPropagation()}>
        <div className="rd-modal-header">
          <h3>
            <i className="fa-solid fa-circle-check" style={{ color: '#16A34A' }}></i>
            Xác nhận chấp nhận báo giá
          </h3>
          <button className="rd-modal-close" onClick={onClose} disabled={accepting}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="rd-modal-body">
          {/* Freelancer info */}
          <div className="rd-aq-freelancer">
            <img
              src={avatarSrc}
              alt={freelancer.name}
              className="rd-aq-avatar"
              onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_AVATAR(freelancer.name); }}
            />
            <div>
              <div className="rd-aq-name">{freelancer.name}</div>
              <div className="rd-aq-rating">
                <i className="fa-solid fa-star"></i>
                {(freelancer.rating || 0).toFixed(1)} / 5.0
              </div>
            </div>
          </div>

          {/* Price grid */}
          <div className="rd-aq-price-grid">
            <div className="rd-aq-price-item">
              <div className="rd-aq-price-label">Giá tối thiểu</div>
              <div className="rd-aq-price-value">
                {Number(minPrice ?? amount).toLocaleString('vi-VN')} đ
              </div>
            </div>
            <div className="rd-aq-price-item">
              <div className="rd-aq-price-label">Giá tối đa</div>
              <div className="rd-aq-price-value">
                {Number(maxPrice ?? amount).toLocaleString('vi-VN')} đ
              </div>
            </div>
            <div className="rd-aq-price-item">
              <div className="rd-aq-price-label">Thời gian</div>
              <div className="rd-aq-price-value">{duration}</div>
            </div>
          </div>

          <p className="rd-confirm-text">
            Bạn có chắc chắn muốn chấp nhận báo giá này? Sau khi xác nhận:
          </p>
          <ul className="rd-confirm-list">
            <li>Freelancer sẽ được thông báo và bắt đầu làm việc</li>
            <li>Các báo giá khác sẽ bị từ chối tự động</li>
            <li>Trạng thái yêu cầu chuyển sang "Đã chọn báo giá"</li>
            <li>Bạn có thể theo dõi tiến độ công việc</li>
          </ul>

          <div className="rd-warning-box">
            <p>
              <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: '6px', color: '#D97706' }}></i>
              <strong>Lưu ý:</strong> Hãy đảm bảo bạn đã trao đổi kỹ với freelancer trước khi chấp nhận.
            </p>
          </div>
        </div>

        <div className="rd-modal-footer">
          <button className="rd-mf-btn cancel" onClick={onClose} disabled={accepting}>
            Hủy bỏ
          </button>
          <button className="rd-mf-btn accept" onClick={onConfirm} disabled={accepting}>
            {accepting
              ? <><i className="fa-solid fa-circle-notch fa-spin"></i> Đang xử lý...</>
              : <><i className="fa-solid fa-check"></i> Xác nhận chấp nhận</>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AcceptQuoteModal;
