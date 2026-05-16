import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import './EditQuotePage.css';

const EditQuotePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [quote, setQuote] = useState(null);
  const [request, setRequest] = useState(null);
  const [formData, setFormData] = useState({
    amount: '',
    duration: '',
    description: ''
  });
  const [errors, setErrors] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    fetchQuoteDetail();
  }, [id]);

  const fetchQuoteDetail = async () => {
    setLoading(true);
    try {
      // Get quote from localStorage
      const storedQuotes = JSON.parse(localStorage.getItem('mock_quotes') || '{}');
      const quoteData = storedQuotes[id];
      
      if (!quoteData) {
        alert('Không tìm thấy báo giá!');
        navigate('/my-quotes');
        return;
      }
      
      setQuote(quoteData);
      
      // Fetch request details
      const response = await api.requests.getById(quoteData.requestId);
      if (response.success) {
        setRequest(response.data);
      }
      
      // Populate form
      setFormData({
        amount: quoteData.amount?.toString() || '',
        duration: quoteData.duration || '',
        description: quoteData.description || ''
      });
    } catch (error) {
      console.error('Error fetching quote:', error);
      alert('Có lỗi xảy ra khi tải dữ liệu!');
      navigate('/my-quotes');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Amount validation
    if (!formData.amount || parseInt(formData.amount) < 100000) {
      newErrors.amount = 'Giá đề xuất tối thiểu 100,000 VNĐ.';
    }

    // Duration validation
    if (!formData.duration.trim()) {
      newErrors.duration = 'Vui lòng nhập thời gian hoàn thành.';
    }

    // Description validation
    if (!formData.description.trim() || formData.description.length < 50) {
      newErrors.description = 'Vui lòng mô tả ít nhất 50 ký tự.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      const firstErrorField = Object.keys(errors)[0];
      const errorElement = document.querySelector(`[name="${firstErrorField}"]`);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setSaving(true);

    try {
      const updateData = {
        amount: parseInt(formData.amount),
        duration: formData.duration,
        description: formData.description
      };

      console.log('Updating quote with data:', updateData);

      const response = await api.quotes.update(id, updateData);

      console.log('Update response:', response);

      if (response.success) {
        const toast = document.getElementById('success-toast');
        if (toast) {
          toast.style.transform = 'translateY(0)';
          toast.style.opacity = '1';
        }

        setTimeout(() => {
          navigate('/my-quotes');
        }, 2000);
      } else {
        alert('Có lỗi xảy ra. Vui lòng thử lại!');
        setSaving(false);
      }
    } catch (error) {
      console.error('Error updating quote:', error);
      alert('Có lỗi xảy ra. Vui lòng thử lại!');
      setSaving(false);
    }
  };

  const handleDeleteQuote = async () => {
    try {
      const response = await api.quotes.delete(id);
      if (response.success) {
        alert('Đã xóa báo giá thành công!');
        setShowDeleteModal(false);
        navigate('/my-quotes');
      } else {
        alert('Có lỗi xảy ra khi xóa báo giá!');
        setShowDeleteModal(false);
      }
    } catch (error) {
      console.error('Error deleting quote:', error);
      alert('Có lỗi xảy ra khi xóa báo giá!');
      setShowDeleteModal(false);
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return '0 VNĐ';
    return new Intl.NumberFormat('vi-VN').format(amount) + ' VNĐ';
  };

  if (loading) {
    return (
      <div className="loading-state" style={{minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
        <i className="fa-solid fa-circle-notch fa-spin" style={{fontSize: '48px', color: 'var(--teal)', marginBottom: '16px'}}></i>
        <p style={{fontSize: '16px', color: '#64748B'}}>Đang tải thông tin báo giá...</p>
      </div>
    );
  }

  if (!quote) {
    return null;
  }

  return (
    <div className="edit-quote-page" style={{background: '#F8FAFC'}}>
      {/* Hero Banner */}
      <div className="d-hero" style={{paddingBottom: '60px', marginBottom: '40px'}}>
        <div className="d-hero-content" style={{textAlign: 'center'}}>
          <h1 className="d-title">Chỉnh sửa Báo giá</h1>
          <p className="d-meta" style={{justifyContent: 'center', maxWidth: '600px', margin: '16px auto 0'}}>
            Cập nhật thông tin báo giá của bạn
          </p>
        </div>
      </div>

      <div className="page-container" style={{maxWidth: '1200px', margin: '0 auto', padding: '0 20px'}}>
        <div className="edit-layout">
          {/* Main Form */}
          <main className="edit-main">
            {/* Request Info Card */}
            {request && (
              <div className="request-info-card">
                <h3>
                  <i className="fa-solid fa-briefcase"></i>
                  Thông tin yêu cầu
                </h3>
                <div className="request-details">
                  <h4>{request.title}</h4>
                  <div className="request-meta">
                    <span><i className="fa-solid fa-tag"></i> {request.category}</span>
                    <span><i className="fa-solid fa-location-dot"></i> {request.location}</span>
                    <span><i className="fa-solid fa-money-bill-wave"></i> {request.budget}</span>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              {/* Quote Details */}
              <div className="form-card">
                <div className="form-header">
                  <h2>Thông tin báo giá</h2>
                </div>
                <div className="form-body">
                  <div className="input-group">
                    <label htmlFor="amount">
                      Giá đề xuất <span className="text-danger">*</span>
                    </label>
                    <div className="input-wrapper">
                      <input
                        type="number"
                        id="amount"
                        name="amount"
                        value={formData.amount}
                        onChange={handleChange}
                        placeholder="5.000.000"
                        min="100000"
                      />
                      <i className="fa-solid fa-money-bill-wave icon-left"></i>
                      <span className="input-suffix">VNĐ</span>
                    </div>
                    {errors.amount && (
                      <span className="error-msg">
                        <i className="fa-solid fa-circle-exclamation"></i> {errors.amount}
                      </span>
                    )}
                  </div>

                  <div className="input-group">
                    <label htmlFor="duration">
                      Thời gian hoàn thành <span className="text-danger">*</span>
                    </label>
                    <div className="input-wrapper">
                      <input
                        type="text"
                        id="duration"
                        name="duration"
                        value={formData.duration}
                        onChange={handleChange}
                        placeholder="VD: 2 tuần, 30 ngày, 1 tháng..."
                      />
                      <i className="fa-regular fa-clock icon-left"></i>
                    </div>
                    {errors.duration && (
                      <span className="error-msg">
                        <i className="fa-solid fa-circle-exclamation"></i> {errors.duration}
                      </span>
                    )}
                  </div>

                  <div className="input-group">
                    <label htmlFor="description">
                      Mô tả chi tiết <span className="text-danger">*</span>
                      <span className="char-count">{formData.description.length} / 2000</span>
                    </label>
                    <div className="input-wrapper align-top">
                      <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows="8"
                        maxLength="2000"
                        placeholder="Mô tả cách bạn sẽ thực hiện dự án, kinh nghiệm liên quan, và những gì khách hàng sẽ nhận được..."
                      />
                      <i className="fa-solid fa-align-left icon-left"></i>
                    </div>
                    {errors.description && (
                      <span className="error-msg">
                        <i className="fa-solid fa-circle-exclamation"></i> {errors.description}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginTop: '20px', flexWrap: 'wrap'}}>
                <button
                  type="button"
                  className="btn-delete-quote"
                  onClick={() => setShowDeleteModal(true)}
                >
                  <i className="fa-solid fa-trash"></i> Xóa báo giá
                </button>
                
                <div style={{display: 'flex', gap: '16px', marginLeft: 'auto'}}>
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => navigate('/my-quotes')}
                    style={{background: 'transparent', border: '1px solid var(--border-light)', color: '#64748B', whiteSpace: 'nowrap'}}
                  >
                    <i className="fa-solid fa-times"></i> Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={saving}
                    style={{
                      background: 'var(--navy)',
                      color: 'var(--gold)',
                      border: 'none',
                      padding: '14px 36px',
                      fontSize: '15px',
                      fontWeight: 700,
                      opacity: saving ? 0.8 : 1,
                      whiteSpace: 'nowrap',
                      minWidth: '180px'
                    }}
                  >
                    {saving ? (
                      <>
                        <i className="fa-solid fa-circle-notch fa-spin"></i> Đang lưu...
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-check" style={{marginRight: '8px'}}></i>
                        LƯU THAY ĐỔI
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </main>

          {/* Sidebar */}
          <aside className="edit-sidebar">
            <div className="sidebar-card" style={{background: '#FEF3C7', borderColor: '#F59E0B'}}>
              <h3 className="sidebar-title" style={{color: '#78350F'}}>
                <i className="fa-solid fa-lightbulb" style={{color: '#F59E0B', fontSize: '24px'}}></i>
                Mẹo chỉnh sửa báo giá
              </h3>
              <ul className="check-list">
                <li>
                  <i className="fa-solid fa-circle-info" style={{color: '#F59E0B'}}></i>
                  Chỉ có thể chỉnh sửa khi báo giá đang ở trạng thái "Đã gửi"
                </li>
                <li>
                  <i className="fa-solid fa-circle-info" style={{color: '#F59E0B'}}></i>
                  Người thuê sẽ được thông báo về thay đổi của bạn
                </li>
                <li>
                  <i className="fa-solid fa-circle-info" style={{color: '#F59E0B'}}></i>
                  Đảm bảo giá và thời gian thực tế để tăng uy tín
                </li>
              </ul>
            </div>

            <div className="sidebar-card">
              <h3 className="sidebar-title">
                <i className="fa-solid fa-star" style={{color: '#F59E0B'}}></i>
                Tăng cơ hội trúng thầu
              </h3>
              <ul className="check-list">
                <li>
                  <i className="fa-solid fa-circle-check"></i>
                  <b>Giá cạnh tranh:</b> So sánh với các báo giá khác
                </li>
                <li>
                  <i className="fa-solid fa-circle-check"></i>
                  <b>Mô tả chi tiết:</b> Giải thích rõ cách thực hiện
                </li>
                <li>
                  <i className="fa-solid fa-circle-check"></i>
                  <b>Timeline rõ ràng:</b> Đưa ra lộ trình cụ thể
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <i className="fa-solid fa-triangle-exclamation" style={{color: '#DC2626', marginRight: '12px'}}></i>
                Xác nhận xóa báo giá
              </h3>
              <button className="modal-close" onClick={() => setShowDeleteModal(false)}>
                <i className="fa-solid fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <p style={{fontSize: '15px', lineHeight: '1.6', color: '#475569', marginBottom: '16px'}}>
                Bạn có chắc chắn muốn xóa báo giá này không? Hành động này không thể hoàn tác.
              </p>
              <div style={{background: '#FEF2F2', padding: '16px', borderRadius: '8px', border: '1px solid #FEE2E2'}}>
                <p style={{fontSize: '14px', color: '#991B1B', margin: 0, lineHeight: '1.6'}}>
                  <i className="fa-solid fa-info-circle" style={{marginRight: '8px'}}></i>
                  <b>Lưu ý:</b> Người thuê sẽ không còn thấy báo giá của bạn.
                </p>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => setShowDeleteModal(false)}
              >
                Không, giữ lại
              </button>
              <button
                className="btn-danger"
                onClick={handleDeleteQuote}
              >
                <i className="fa-solid fa-trash"></i>
                Có, xóa báo giá
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Toast */}
      <div
        id="success-toast"
        style={{
          position: 'fixed',
          bottom: '32px',
          right: '32px',
          background: '#064E3B',
          color: '#fff',
          padding: '18px 28px',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          fontWeight: 600,
          fontSize: '15px',
          boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
          transform: 'translateY(120px)',
          opacity: 0,
          transition: 'all 0.4s',
          zIndex: 1000,
          borderLeft: '6px solid #10B981'
        }}
      >
        <i className="fa-solid fa-circle-check" style={{color: '#34D399', fontSize: '24px'}}></i>
        <span>Cập nhật thành công!</span>
      </div>
    </div>
  );
};

export default EditQuotePage;
