const QuoteModal = ({ show, onClose, onSubmit, formData, onChange }) => {
  if (!show) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Gửi báo giá của bạn</h2>
          <button className="modal-close" onClick={onClose}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <form onSubmit={onSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label htmlFor="amount">
                Giá đề xuất <span className="required">*</span>
              </label>
              <div className="input-group">
                <input
                  type="number"
                  id="amount"
                  placeholder="Nhập số tiền"
                  value={formData.amount}
                  onChange={(e) => onChange({...formData, amount: e.target.value})}
                  required
                />
                <span className="input-suffix">VNĐ</span>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="duration">
                Thời gian hoàn thành <span className="required">*</span>
              </label>
              <input
                type="text"
                id="duration"
                placeholder="Ví dụ: 15 ngày"
                value={formData.duration}
                onChange={(e) => onChange({...formData, duration: e.target.value})}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">
                Mô tả đề xuất <span className="required">*</span>
              </label>
              <textarea
                id="description"
                rows="6"
                placeholder="Mô tả chi tiết về cách bạn sẽ thực hiện dự án, kinh nghiệm liên quan..."
                value={formData.description}
                onChange={(e) => onChange({...formData, description: e.target.value})}
                required
              ></textarea>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Hủy bỏ
            </button>
            <button type="submit" className="btn-submit">
              <i className="fa-solid fa-paper-plane"></i>
              Gửi báo giá
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuoteModal;
