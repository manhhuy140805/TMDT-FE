import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import './EditRequestPage.css';

const EditRequestPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [request, setRequest] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    location: '',
    description: '',
    skills: '',
    budgetMin: '',
    budgetMax: '',
    submissionDeadline: '',
    deadline: '',
    attachments: []
  });
  const [errors, setErrors] = useState({});
  const [charCounts, setCharCounts] = useState({
    title: 0,
    description: 0
  });
  const [showCancelModal, setShowCancelModal] = useState(false);

  const categories = [
    { id: 1, name: 'Công nghệ & Lập trình' },
    { id: 2, name: 'Thiết kế đồ họa & Kiến trúc' },
    { id: 3, name: 'Digital Marketing & SEO' },
    { id: 4, name: 'Sáng tạo nội dung & Biên dịch' }
  ];

  useEffect(() => {
    console.log('EditRequestPage - ID from params:', id);
    fetchRequestDetail();
  }, [id]);

  const fetchRequestDetail = async () => {
    setLoading(true);
    try {
      const response = await api.requests.getById(id);
      if (response.success) {
        const req = response.data;
        console.log('Fetched request data:', req);
        setRequest(req);
        
        // Populate form with existing data
        const skillsString = req.skills ? req.skills.join(', ') : '';
        
        // Extract budgetMin and budgetMax from budget string or use direct values
        let budgetMin = '';
        let budgetMax = '';
        
        if (req.budgetMin && req.budgetMax) {
          budgetMin = req.budgetMin.toString();
          budgetMax = req.budgetMax.toString();
        } else if (req.budgetMax) {
          // If only budgetMax exists, use it for both
          budgetMax = req.budgetMax.toString();
          budgetMin = Math.floor(req.budgetMax * 0.5).toString(); // Default to 50% of max
        } else if (req.budget) {
          // Parse from budget string like "25,000,000 VNĐ"
          const budgetValue = req.budget.replace(/[^\d]/g, '');
          budgetMax = budgetValue;
          budgetMin = Math.floor(parseInt(budgetValue) * 0.5).toString();
        }
        
        const newFormData = {
          title: req.title || '',
          category: req.categoryId?.toString() || '',
          location: req.location || '',
          description: req.description || '',
          skills: skillsString,
          budgetMin: budgetMin,
          budgetMax: budgetMax,
          submissionDeadline: req.submissionDeadlineDate || '',
          deadline: req.deadlineDate || '',
          attachments: []
        };
        
        console.log('Setting form data:', newFormData);
        setFormData(newFormData);
        
        setCharCounts({
          title: req.title?.length || 0,
          description: req.description?.length || 0
        });
      } else {
        alert('Không tìm thấy yêu cầu!');
        navigate('/my-requests');
      }
    } catch (error) {
      console.error('Error fetching request:', error);
      alert('Có lỗi xảy ra khi tải dữ liệu!');
      navigate('/my-requests');
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

    // Update character counts
    if (name === 'title') {
      setCharCounts(prev => ({ ...prev, title: value.length }));
    } else if (name === 'description') {
      setCharCounts(prev => ({ ...prev, description: value.length }));
    }

    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({
      ...prev,
      attachments: files
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    // Title validation
    if (!formData.title.trim() || formData.title.length < 10 || formData.title.length > 100) {
      newErrors.title = 'Vui lòng nhập tiêu đề (10 - 100 ký tự).';
    }

    // Category validation
    if (!formData.category) {
      newErrors.category = 'Vui lòng phân loại lĩnh vực.';
    }

    // Description validation
    if (!formData.description.trim() || formData.description.length < 50) {
      newErrors.description = 'Vui lòng mô tả ít nhất 50 ký tự.';
    }

    // Budget Min validation
    if (!formData.budgetMin || parseInt(formData.budgetMin) < 100000) {
      newErrors.budgetMin = 'Tối thiểu 100,000 VNĐ.';
    }

    // Budget Max validation
    if (!formData.budgetMax) {
      newErrors.budgetMax = 'Vui lòng nhập ngân sách tối đa.';
    } else if (parseInt(formData.budgetMax) < parseInt(formData.budgetMin || 0)) {
      newErrors.budgetMax = 'Phải lớn hơn hoặc bằng ngân sách tối thiểu.';
    }

    // Submission Deadline validation
    if (!formData.submissionDeadline) {
      newErrors.submissionDeadline = 'Hạn cuối phải lớn hơn ngày hiện tại.';
    } else {
      const selectedDate = new Date(formData.submissionDeadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate <= today) {
        newErrors.submissionDeadline = 'Hạn cuối phải lớn hơn ngày hiện tại.';
      }
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
      const skillsArray = formData.skills
        ? formData.skills.split(',').map(s => s.trim()).filter(s => s)
        : [];

      const updateData = {
        title: formData.title,
        categoryId: parseInt(formData.category),
        location: formData.location || 'Remote',
        description: formData.description,
        skills: skillsArray,
        budgetMin: parseInt(formData.budgetMin),
        budgetMax: parseInt(formData.budgetMax),
        budget: `${new Intl.NumberFormat('vi-VN').format(parseInt(formData.budgetMax))} VNĐ`,
        submissionDeadlineDate: formData.submissionDeadline,
        deadlineDate: formData.deadline,
        // Keep existing fields
        category: request.category,
        status: request.status,
        statusText: request.statusText,
        views: request.views,
        bids: request.bids,
        postedTime: request.postedTime,
        postedDate: request.postedDate,
        employer: request.employer
      };

      console.log('Submitting update with data:', updateData);

      const response = await api.requests.update(id, updateData);

      console.log('Update response:', response);

      if (response.success) {
        const toast = document.getElementById('success-toast');
        if (toast) {
          toast.style.transform = 'translateY(0)';
          toast.style.opacity = '1';
        }

        setTimeout(() => {
          navigate(`/requests/${id}`);
        }, 2000);
      } else {
        alert('Có lỗi xảy ra. Vui lòng thử lại!');
        setSaving(false);
      }
    } catch (error) {
      console.error('Error updating request:', error);
      alert('Có lỗi xảy ra. Vui lòng thử lại!');
      setSaving(false);
    }
  };

  const handleCancelRequest = async () => {
    console.log('Deleting request with ID:', id);
    try {
      const response = await api.requests.delete(id);
      console.log('Delete response:', response);
      if (response.success) {
        alert('Đã xóa yêu cầu thành công!');
        setShowCancelModal(false);
        navigate('/my-requests');
      } else {
        alert('Có lỗi xảy ra khi xóa yêu cầu!');
        setShowCancelModal(false);
      }
    } catch (error) {
      console.error('Error deleting request:', error);
      alert('Có lỗi xảy ra khi xóa yêu cầu!');
      setShowCancelModal(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-state" style={{minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
        <i className="fa-solid fa-circle-notch fa-spin" style={{fontSize: '48px', color: 'var(--teal)', marginBottom: '16px'}}></i>
        <p style={{fontSize: '16px', color: '#64748B'}}>Đang tải thông tin yêu cầu...</p>
      </div>
    );
  }

  if (!request) {
    return null;
  }

  console.log('Rendering form with formData:', formData);

  return (
    <div className="edit-request-page" style={{background: '#F8FAFC'}}>
      {/* Hero Banner */}
      <div className="d-hero" style={{paddingBottom: '60px', marginBottom: '40px'}}>
        <div className="d-hero-content" style={{textAlign: 'center'}}>
          <h1 className="d-title">Chỉnh sửa Yêu cầu</h1>
          <p className="d-meta" style={{justifyContent: 'center', maxWidth: '600px', margin: '16px auto 0'}}>
            Cập nhật thông tin yêu cầu tuyển dụng freelancer của bạn
          </p>
        </div>
      </div>

      <div className="page-container" style={{maxWidth: '1200px', margin: '0 auto', padding: '0 20px'}}>
        <div className="post-layout">
          {/* Main Form */}
          <main className="post-main">
            <form onSubmit={handleSubmit} noValidate>
              
              {/* Step 1: Tên dự án & Lĩnh vực */}
              <div className="step-card">
                <div className="step-header">
                  <div className="step-number">1</div>
                  <h2>Tên dự án & Lĩnh vực</h2>
                </div>
                <div className="step-body">
                  <div className="input-group">
                    <label htmlFor="title">
                      Tên dự án cụ thể <span className="text-danger">*</span>
                      <span className="char-count" style={{color: charCounts.title > 90 ? '#DC2626' : '#94A3B8'}}>
                        {charCounts.title} / 100
                      </span>
                    </label>
                    <div className="input-wrapper">
                      <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="VD: Xây dựng bộ nhận diện thương hiệu cho chuỗi Cafe"
                        maxLength="100"
                      />
                      <i className="fa-solid fa-pen-nib icon-left"></i>
                    </div>
                    {errors.title && (
                      <span className="error-msg">
                        <i className="fa-solid fa-circle-exclamation"></i> {errors.title}
                      </span>
                    )}
                  </div>

                  <div className="form-grid-2">
                    <div className="input-group m-0">
                      <label htmlFor="category">
                        Lĩnh vực chuyên môn <span className="text-danger">*</span>
                      </label>
                      <div className="input-wrapper">
                        <select
                          id="category"
                          name="category"
                          value={formData.category}
                          onChange={handleChange}
                        >
                          <option value="">--- Chọn lĩnh vực ---</option>
                          {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </select>
                        <i className="fa-solid fa-layer-group icon-left"></i>
                      </div>
                      {errors.category && (
                        <span className="error-msg">
                          <i className="fa-solid fa-circle-exclamation"></i> {errors.category}
                        </span>
                      )}
                    </div>

                    <div className="input-group m-0">
                      <label htmlFor="location">Địa điểm làm việc</label>
                      <div className="input-wrapper">
                        <input
                          type="text"
                          id="location"
                          name="location"
                          value={formData.location}
                          onChange={handleChange}
                          placeholder="VD: Remote, TP.HCM..."
                        />
                        <i className="fa-solid fa-map-pin icon-left"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2: Yêu cầu chuyên môn */}
              <div className="step-card">
                <div className="step-header">
                  <div className="step-number">2</div>
                  <h2>Yêu cầu chuyên môn</h2>
                </div>
                <div className="step-body">
                  <div className="input-group">
                    <label htmlFor="description">
                      Mô tả khối lượng công việc <span className="text-danger">*</span>
                      <span className="char-count">{charCounts.description} / 5000</span>
                    </label>
                    <div className="input-wrapper align-top">
                      <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows="6"
                        maxLength="5000"
                        placeholder="- Tầm nhìn / Đối tượng mục tiêu là ai?&#10;- Những chức năng chính yếu?&#10;- Yêu cầu về định dạng tệp bàn giao cuối cùng?"
                      />
                      <i className="fa-solid fa-align-left icon-left"></i>
                    </div>
                    {errors.description && (
                      <span className="error-msg">
                        <i className="fa-solid fa-circle-exclamation"></i> {errors.description}
                      </span>
                    )}
                  </div>

                  <div className="input-group" style={{marginTop: '24px'}}>
                    <label htmlFor="skills">
                      Kỹ năng & Công cụ yêu cầu (Cách nhau bằng dấu phẩy)
                    </label>
                    <div className="input-wrapper">
                      <input
                        type="text"
                        id="skills"
                        name="skills"
                        value={formData.skills}
                        onChange={handleChange}
                        placeholder="VD: Figma, ReactJS, Photoshop..."
                      />
                      <i className="fa-solid fa-wand-magic-sparkles icon-left" style={{color: '#D97706'}}></i>
                    </div>
                  </div>

                  <div className="input-group" style={{marginTop: '24px'}}>
                    <label>Tài liệu đính kèm (Tùy chọn)</label>
                    <div className="file-dropzone" onClick={() => document.getElementById('file-input').click()}>
                      <input
                        type="file"
                        id="file-input"
                        multiple
                        onChange={handleFileChange}
                        style={{display: 'none'}}
                        accept=".pdf,.doc,.docx,.zip"
                      />
                      <i className="fa-solid fa-cloud-arrow-up" style={{fontSize: '32px', color: '#94A3B8', marginBottom: '12px'}}></i>
                      <p style={{margin: '0 0 8px 0', color: 'var(--navy)', fontWeight: 600}}>
                        Kéo thả tệp vào đây hoặc nhấp để tải lên
                      </p>
                      <span style={{fontSize: '13px', color: '#64748B'}}>
                        Hỗ trợ PDF, DOCX, ZIP (Tối đa 25MB)
                      </span>
                      {formData.attachments.length > 0 && (
                        <div style={{marginTop: '12px', fontSize: '13px', color: 'var(--teal)', fontWeight: 600}}>
                          {formData.attachments.length} tệp đã chọn
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3: Ngân sách & Tiến độ */}
              <div className="step-card">
                <div className="step-header">
                  <div className="step-number">3</div>
                  <h2>Ngân sách & Tiến độ</h2>
                </div>
                <div className="step-body">
                  <div className="form-grid-2">
                    <div className="input-group m-0">
                      <label htmlFor="budgetMin">
                        Ngân sách tối thiểu <span className="text-danger">*</span>
                      </label>
                      <div className="input-wrapper">
                        <input
                          type="number"
                          id="budgetMin"
                          name="budgetMin"
                          value={formData.budgetMin}
                          onChange={handleChange}
                          placeholder="2.000.000"
                          min="100000"
                        />
                        <i className="fa-solid fa-money-bill-wave icon-left"></i>
                        <span className="input-suffix">VNĐ</span>
                      </div>
                      {errors.budgetMin && (
                        <span className="error-msg">
                          <i className="fa-solid fa-circle-exclamation"></i> {errors.budgetMin}
                        </span>
                      )}
                    </div>

                    <div className="input-group m-0">
                      <label htmlFor="budgetMax">
                        Ngân sách tối đa <span className="text-danger">*</span>
                      </label>
                      <div className="input-wrapper">
                        <input
                          type="number"
                          id="budgetMax"
                          name="budgetMax"
                          value={formData.budgetMax}
                          onChange={handleChange}
                          placeholder="10.000.000"
                          min="100000"
                        />
                        <i className="fa-solid fa-money-bill-wave icon-left"></i>
                        <span className="input-suffix">VNĐ</span>
                      </div>
                      {errors.budgetMax && (
                        <span className="error-msg">
                          <i className="fa-solid fa-circle-exclamation"></i> {errors.budgetMax}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="input-group" style={{marginTop: '24px'}}>
                    <label htmlFor="submissionDeadline">
                      Ngày chốt sổ (Deadline nhận hồ sơ) <span className="text-danger">*</span>
                    </label>
                    <div className="input-wrapper">
                      <input
                        type="date"
                        id="submissionDeadline"
                        name="submissionDeadline"
                        value={formData.submissionDeadline}
                        onChange={handleChange}
                      />
                      <i className="fa-regular fa-calendar-days icon-left"></i>
                    </div>
                    {errors.submissionDeadline && (
                      <span className="error-msg">
                        <i className="fa-solid fa-circle-exclamation"></i> {errors.submissionDeadline}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginTop: '20px', flexWrap: 'wrap'}}>
                <button
                  type="button"
                  className="btn-cancel-request"
                  onClick={() => setShowCancelModal(true)}
                >
                  <i className="fa-solid fa-trash"></i> Xóa yêu cầu
                </button>
                
                <div style={{display: 'flex', gap: '16px', marginLeft: 'auto'}}>
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => navigate(`/requests/${id}`)}
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
          <aside className="post-sidebar">
            <div className="sidebar-card" style={{background: '#FEF3C7', borderColor: '#F59E0B'}}>
              <h3 className="sidebar-title" style={{color: '#78350F'}}>
                <i className="fa-solid fa-triangle-exclamation" style={{color: '#F59E0B', fontSize: '24px'}}></i>
                Lưu ý khi chỉnh sửa
              </h3>
              <ul className="check-list">
                <li>
                  <i className="fa-solid fa-circle-info" style={{color: '#F59E0B'}}></i>
                  Các freelancer đã gửi báo giá sẽ được thông báo về thay đổi
                </li>
                <li>
                  <i className="fa-solid fa-circle-info" style={{color: '#F59E0B'}}></i>
                  Thay đổi lớn có thể ảnh hưởng đến báo giá hiện tại
                </li>
                <li>
                  <i className="fa-solid fa-circle-info" style={{color: '#F59E0B'}}></i>
                  Nên cập nhật thông tin rõ ràng để tránh hiểu lầm
                </li>
              </ul>
            </div>

            <div className="sidebar-card">
              <h3 className="sidebar-title">
                <i className="fa-solid fa-lightbulb" style={{color: '#F59E0B'}}></i>
                Mẹo chỉnh sửa hiệu quả
              </h3>
              <ul className="check-list">
                <li>
                  <i className="fa-solid fa-circle-check"></i>
                  <b>Cụ thể hóa:</b> Bổ sung thêm chi tiết để freelancer hiểu rõ hơn
                </li>
                <li>
                  <i className="fa-solid fa-circle-check"></i>
                  <b>Thông báo:</b> Gửi tin nhắn cho freelancer đã báo giá về thay đổi
                </li>
                <li>
                  <i className="fa-solid fa-circle-check"></i>
                  <b>Deadline:</b> Đảm bảo thời gian hợp lý cho công việc
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="modal-overlay" onClick={() => setShowCancelModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <i className="fa-solid fa-triangle-exclamation" style={{color: '#DC2626', marginRight: '12px'}}></i>
                Xác nhận xóa yêu cầu
              </h3>
              <button className="modal-close" onClick={() => setShowCancelModal(false)}>
                <i className="fa-solid fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <p style={{fontSize: '15px', lineHeight: '1.6', color: '#475569', marginBottom: '16px'}}>
                Bạn có chắc chắn muốn xóa yêu cầu này không? Hành động này không thể hoàn tác.
              </p>
              <div style={{background: '#FEF2F2', padding: '16px', borderRadius: '8px', border: '1px solid #FEE2E2'}}>
                <p style={{fontSize: '14px', color: '#991B1B', margin: 0, lineHeight: '1.6'}}>
                  <i className="fa-solid fa-info-circle" style={{marginRight: '8px'}}></i>
                  <b>Lưu ý:</b> Tất cả báo giá liên quan sẽ bị xóa và không thể khôi phục.
                </p>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => setShowCancelModal(false)}
              >
                Không, giữ lại
              </button>
              <button
                className="btn-danger"
                onClick={handleCancelRequest}
              >
                <i className="fa-solid fa-trash"></i>
                Có, xóa yêu cầu
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

export default EditRequestPage;
