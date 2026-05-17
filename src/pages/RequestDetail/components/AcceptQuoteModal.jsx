import React from "react";
import "./AcceptQuoteModal.css";

const AcceptQuoteModal = ({ show, selectedQuote, onClose, onConfirm }) => {
  if (!show || !selectedQuote) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content accept-quote-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3>
            <i
              className="fa-solid fa-check-circle"
              style={{ color: "#16A34A", marginRight: "12px" }}
            ></i>
            Xác nhận chấp nhận báo giá
          </h3>
          <button className="modal-close" onClick={onClose}>
            <i className="fa-solid fa-times"></i>
          </button>
        </div>

        <div className="modal-body">
          {/* Freelancer Info */}
          <div className="accept-quote-info">
            <div className="freelancer-card">
              <img
                src={
                  selectedQuote.freelancer.avatar ||
                  "https://png.pngtree.com/png-vector/20191101/ourmid/pngtree-cartoon-color-simple-male-avatar-png-image_1934459.jpg"
                }
                alt={selectedQuote.freelancer.name}
                className="freelancer-avatar"
              />
              <div className="freelancer-details">
                <h4 className="freelancer-name">
                  {selectedQuote.freelancer.name}
                </h4>
                <div className="freelancer-rating">
                  <i className="fa-solid fa-star"></i>
                  <span>{selectedQuote.freelancer.rating || 0} / 5.0</span>
                </div>
              </div>
            </div>

            <div className="quote-details-grid">
              <div className="detail-item">
                <div className="detail-label">Giá đề xuất</div>
                <div className="detail-value">
                  {selectedQuote.amount.toLocaleString("vi-VN")} VNĐ
                </div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Thời gian</div>
                <div className="detail-value">{selectedQuote.duration}</div>
              </div>
            </div>
          </div>

          {/* Confirmation Text */}
          <p className="confirmation-text">
            Bạn có chắc chắn muốn chấp nhận báo giá này không? Sau khi chấp
            nhận:
          </p>

          <ul className="confirmation-list">
            <li>Freelancer sẽ được thông báo và bắt đầu làm việc</li>
            <li>Các báo giá khác sẽ bị từ chối tự động</li>
            <li>Trạng thái yêu cầu sẽ chuyển sang "Đã chọn báo giá"</li>
            <li>Bạn có thể theo dõi tiến độ công việc</li>
          </ul>

          {/* Warning Box */}
          <div className="warning-box">
            <p className="warning-text">
              <i
                className="fa-solid fa-info-circle"
                style={{ marginRight: "8px" }}
              ></i>
              <b>Lưu ý:</b> Hãy đảm bảo bạn đã trao đổi kỹ với freelancer trước
              khi chấp nhận.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Hủy bỏ
          </button>
          <button className="btn-accept" onClick={onConfirm}>
            <i className="fa-solid fa-check"></i>
            Xác nhận chấp nhận
          </button>
        </div>
      </div>
    </div>
  );
};

export default AcceptQuoteModal;
