const QuoteModal = ({ show, onClose, onSubmit, formData, onChange, submitting = false }) => {
  if (!show) return null;

  const set = (key) => (e) => onChange({ ...formData, [key]: e.target.value });

  return (
    <div className="rd-modal-overlay" onClick={onClose}>
      <div className="rd-modal" onClick={(e) => e.stopPropagation()}>
        <div className="rd-modal-header">
          <h2>
            <i className="fa-solid fa-paper-plane" style={{ color: '#0EA5E9' }}></i>
            Gửi báo giá của bạn
          </h2>
          <button className="rd-modal-close" onClick={onClose} disabled={submitting}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <form onSubmit={onSubmit}>
          <div className="rd-modal-body">
            {/* Giá đề xuất + Thời gian */}
            <div className="rd-form-row">
              <div className="rd-form-group">
                <label className="rd-form-label">
                  Giá đề xuất <span className="req">*</span>
                </label>
                <div className="rd-input-wrap">
                  <input type="number" placeholder="0" value={formData.minPrice}
                    onChange={set('minPrice')} min="0" required />
                  <span className="rd-input-suffix">VNĐ</span>
                </div>
              </div>
              <div className="rd-form-group">
                <label className="rd-form-label">
                  Thời gian hoàn thành <span className="req">*</span>
                </label>
                <div className="rd-input-wrap">
                  <input type="number" placeholder="Ví dụ: 15" value={formData.duration}
                    onChange={set('duration')} min="1" required />
                  <span className="rd-input-suffix">ngày</span>
                </div>
              </div>
            </div>

            {/* Mô tả */}
            <div className="rd-form-group">
              <label className="rd-form-label">
                Mô tả đề xuất <span className="req">*</span>
              </label>
              <textarea rows="5"
                placeholder="Mô tả kinh nghiệm và cách bạn sẽ thực hiện dự án..."
                value={formData.description} onChange={set('description')} required />
            </div>
          </div>

          <div className="rd-modal-footer">
            <button type="button" className="rd-mf-btn cancel" onClick={onClose} disabled={submitting}>
              Hủy bỏ
            </button>
            <button type="submit" className="rd-mf-btn submit" disabled={submitting}>
              {submitting
                ? <><i className="fa-solid fa-circle-notch fa-spin"></i> Đang gửi...</>
                : <><i className="fa-solid fa-paper-plane"></i> Gửi báo giá</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuoteModal;
