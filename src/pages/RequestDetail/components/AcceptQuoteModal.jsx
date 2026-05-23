import { useState } from 'react';
import './AcceptQuoteModal.css';

const DEFAULT_AVATAR = (name = 'F') =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0EA5E9&color=fff&size=56`;

const PAYMENT_METHODS = [
  { value: 'ChuyenKhoan', label: 'Chuyển khoản ngân hàng', icon: 'fa-solid fa-building-columns' },
  { value: 'ViDienTu', label: 'Ví điện tử', icon: 'fa-solid fa-wallet' },
  { value: 'TheTinDung', label: 'Thẻ tín dụng', icon: 'fa-solid fa-credit-card' },
];

const PLATFORM_FEE_PERCENT = 5; // 5% phí hệ thống

/**
 * AcceptQuoteModal — 2 bước:
 * Bước 1: Xác nhận thông tin freelancer + báo giá
 * Bước 2: Thanh toán escrow (100% tiền freelancer + phí giám sát)
 *         Hiển thị chi tiết phân chia tiền khi hoàn thành
 */
const AcceptQuoteModal = ({
  show,
  selectedQuote,
  onClose,
  onConfirm,
  accepting = false,
  requiresSupervision = false,
  supervisorFee = 0,
}) => {
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('ChuyenKhoan');

  if (!show || !selectedQuote) return null;

  const { freelancer, minPrice, maxPrice, amount, duration } = selectedQuote;
  const avatarSrc = freelancer.avatar || DEFAULT_AVATAR(freelancer.name);

  // Tính toán chi tiết thanh toán
  const agreedPrice = Number(minPrice ?? amount ?? 0);
  const supervisionFee = requiresSupervision ? Number(supervisorFee) : 0;
  const totalEscrow = agreedPrice + supervisionFee; // Tổng tiền hệ thống giữ

  // Phân chia khi hoàn thành (sau khi 3 bên xác nhận)
  const platformFee = Math.round(agreedPrice * PLATFORM_FEE_PERCENT / 100);
  const freelancerReceives = agreedPrice - platformFee;
  const supervisorReceives = supervisionFee;

  const handleClose = () => {
    setStep(1);
    setPaymentMethod('ChuyenKhoan');
    onClose();
  };

  const handleNextStep = () => {
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleConfirmPayment = () => {
    onConfirm({
      paymentMethod,
      totalAmount: totalEscrow,
      agreedPrice,
      supervisorFee: supervisionFee,
    });
  };

  return (
    <div className="rd-modal-overlay" onClick={handleClose}>
      <div className="rd-modal aq-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="rd-modal-header">
          <h3>
            {step === 1 ? (
              <>
                <i className="fa-solid fa-circle-check" style={{ color: '#16A34A' }}></i>
                Xác nhận chấp nhận báo giá
              </>
            ) : (
              <>
                <i className="fa-solid fa-shield-halved" style={{ color: '#0EA5E9' }}></i>
                Thanh toán Escrow
              </>
            )}
          </h3>
          <button className="rd-modal-close" onClick={handleClose} disabled={accepting}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Step indicator */}
        <div className="aq-steps">
          <div className={`aq-step ${step >= 1 ? 'active' : ''}`}>
            <div className="aq-step-num">1</div>
            <span>Xác nhận</span>
          </div>
          <div className="aq-step-line"></div>
          <div className={`aq-step ${step >= 2 ? 'active' : ''}`}>
            <div className="aq-step-num">2</div>
            <span>Thanh toán</span>
          </div>
        </div>

        {/* Body */}
        <div className="rd-modal-body">
          {step === 1 ? (
            /* ═══════ STEP 1: Xác nhận thông tin ═══════ */
            <>
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
                  <div className="rd-aq-price-label">Giá đề xuất</div>
                  <div className="rd-aq-price-value">
                    {agreedPrice.toLocaleString('vi-VN')} đ
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
                <li>Bạn sẽ cần thanh toán <strong>100% giá thỏa thuận</strong> vào hệ thống escrow</li>
                {requiresSupervision && (
                  <li>Phí giám sát <strong>{supervisionFee.toLocaleString('vi-VN')} đ</strong> cũng sẽ được thanh toán</li>
                )}
                <li>Hệ thống sẽ giữ toàn bộ số tiền cho đến khi công việc hoàn thành</li>
                <li>Sau khi cả 3 bên xác nhận hoàn thành, tiền sẽ được giải ngân</li>
                <li>Hệ thống trích <strong>5% phí dịch vụ</strong> từ tiền freelancer nhận</li>
              </ul>

              <div className="rd-warning-box">
                <p>
                  <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: '6px', color: '#D97706' }}></i>
                  <strong>Lưu ý:</strong> Hãy đảm bảo bạn đã trao đổi kỹ với freelancer trước khi chấp nhận.
                  Tiền sẽ được giữ an toàn bởi hệ thống.
                </p>
              </div>
            </>
          ) : (
            /* ═══════ STEP 2: Thanh toán Escrow ═══════ */
            <>
              {/* Tóm tắt thanh toán */}
              <div className="aq-payment-summary">
                <h4 className="aq-section-title">
                  <i className="fa-solid fa-receipt"></i>
                  Chi tiết thanh toán
                </h4>

                <div className="aq-payment-rows">
                  <div className="aq-payment-row">
                    <span className="aq-payment-label">Tiền công freelancer</span>
                    <span className="aq-payment-value">{agreedPrice.toLocaleString('vi-VN')} đ</span>
                  </div>
                  {requiresSupervision && (
                    <div className="aq-payment-row">
                      <span className="aq-payment-label">Phí giám sát</span>
                      <span className="aq-payment-value">{supervisionFee.toLocaleString('vi-VN')} đ</span>
                    </div>
                  )}
                  <div className="aq-payment-row total">
                    <span className="aq-payment-label">Tổng thanh toán (Escrow)</span>
                    <span className="aq-payment-value">{totalEscrow.toLocaleString('vi-VN')} đ</span>
                  </div>
                </div>
              </div>

              {/* Phân chia khi hoàn thành */}
              <div className="aq-distribution">
                <h4 className="aq-section-title">
                  <i className="fa-solid fa-chart-pie"></i>
                  Phân chia khi công việc hoàn thành
                </h4>
                <div className="aq-dist-rows">
                  <div className="aq-dist-row">
                    <div className="aq-dist-icon freelancer">
                      <i className="fa-solid fa-user-tie"></i>
                    </div>
                    <div className="aq-dist-info">
                      <span className="aq-dist-label">Freelancer nhận</span>
                      <span className="aq-dist-sublabel">({100 - PLATFORM_FEE_PERCENT}% sau phí hệ thống)</span>
                    </div>
                    <span className="aq-dist-amount">{freelancerReceives.toLocaleString('vi-VN')} đ</span>
                  </div>
                  {requiresSupervision && (
                    <div className="aq-dist-row">
                      <div className="aq-dist-icon supervisor">
                        <i className="fa-solid fa-shield-halved"></i>
                      </div>
                      <div className="aq-dist-info">
                        <span className="aq-dist-label">Đơn vị giám sát nhận</span>
                        <span className="aq-dist-sublabel">(100% phí giám sát)</span>
                      </div>
                      <span className="aq-dist-amount">{supervisorReceives.toLocaleString('vi-VN')} đ</span>
                    </div>
                  )}
                  <div className="aq-dist-row">
                    <div className="aq-dist-icon platform">
                      <i className="fa-solid fa-building"></i>
                    </div>
                    <div className="aq-dist-info">
                      <span className="aq-dist-label">Phí hệ thống</span>
                      <span className="aq-dist-sublabel">({PLATFORM_FEE_PERCENT}% tiền công)</span>
                    </div>
                    <span className="aq-dist-amount">{platformFee.toLocaleString('vi-VN')} đ</span>
                  </div>
                </div>
              </div>

              {/* Chọn phương thức thanh toán */}
              <div className="aq-payment-method">
                <h4 className="aq-section-title">
                  <i className="fa-solid fa-credit-card"></i>
                  Phương thức thanh toán
                </h4>
                <div className="aq-method-list">
                  {PAYMENT_METHODS.map((method) => (
                    <label
                      key={method.value}
                      className={`aq-method-item ${paymentMethod === method.value ? 'selected' : ''}`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.value}
                        checked={paymentMethod === method.value}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      <i className={method.icon}></i>
                      <span>{method.label}</span>
                      {paymentMethod === method.value && (
                        <i className="fa-solid fa-circle-check aq-method-check"></i>
                      )}
                    </label>
                  ))}
                </div>
              </div>

              {/* Escrow notice */}
              <div className="aq-escrow-notice">
                <i className="fa-solid fa-lock"></i>
                <div>
                  <strong>Thanh toán an toàn qua Escrow</strong>
                  <p>
                    Tiền sẽ được hệ thống giữ an toàn. Chỉ khi công việc hoàn thành và được
                    cả 3 bên (Freelancer, Giám sát, Người thuê) xác nhận, tiền mới được giải ngân.
                    Người thuê là người xác nhận cuối cùng.
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="rd-modal-footer">
          {step === 1 ? (
            <>
              <button className="rd-mf-btn cancel" onClick={handleClose} disabled={accepting}>
                Hủy bỏ
              </button>
              <button className="rd-mf-btn accept" onClick={handleNextStep}>
                <i className="fa-solid fa-arrow-right"></i> Tiếp tục thanh toán
              </button>
            </>
          ) : (
            <>
              <button className="rd-mf-btn cancel" onClick={handleBack} disabled={accepting}>
                <i className="fa-solid fa-arrow-left"></i> Quay lại
              </button>
              <button className="rd-mf-btn submit aq-pay-btn" onClick={handleConfirmPayment} disabled={accepting}>
                {accepting ? (
                  <><i className="fa-solid fa-circle-notch fa-spin"></i> Đang xử lý...</>
                ) : (
                  <><i className="fa-solid fa-lock"></i> Thanh toán {totalEscrow.toLocaleString('vi-VN')} đ</>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AcceptQuoteModal;
