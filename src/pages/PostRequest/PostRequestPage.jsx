import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './PostRequestPage.css';

const PostRequestPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
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

  const categories = [
    { id: 1, name: 'Công nghệ & Lập trình' },
    { id: 2, name: 'Thiết kế đồ họa & Kiến trúc' },
    { id: 3, name: 'Digital Marketing & SEO' },
    { id: 4, name: 'Sáng tạo nội dung & Biên dịch' }
  ];

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
      // Scroll to first error
      const firstErrorField = Object.keys(errors)[0];
      const errorElement = document.querySelector(`[name="${firstErrorField}"]`);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setLoading(true);

    try {
      // Parse skills from comma-separated string
      const skillsArray = formData.skills
        ? formData.skills.split(',').map(s => s.trim()).filter(s => s)
        : [];

      const response = await api.requests.create({
        title: formData.title,
        categoryId: parseInt(formData.category),
        location: formData.location || 'Remote',
        description: formData.description,
        skills: skillsArray,
        budgetMin: parseInt(formData.budgetMin),
        budgetMax: parseInt(formData.budgetMax),
        submissionDeadlineDate: formData.submissionDeadline,
        deadlineDate: formData.deadline,
        attachments: formData.attachments
      });

      if (response.success) {
        // Show success toast
        const toast = document.getElementById('success-toast');
        if (toast) {
          toast.style.transform = 'translateY(0)';
          toast.style.opacity = '1';
        }

        setTimeout(() => {
          navigate('/my-requests');
        }, 2000);
      } else {
        alert('Có lỗi xảy ra. Vui lòng thử lại!');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error creating request:', error);
      alert('Có lỗi xảy ra. Vui lòng thử lại!');
      setLoading(false);
    }
  };

  return (
    <div className="post-request-page" style={{background: '#F8FAFC'}}>
      {/* Hero Banner */}
      <div className="d-hero" style={{paddingBottom: '80px'}}>
        <div className="d-hero-content" style={{textAlign: 'center'}}>
          <h1 className="d-title">Khởi tạo Dự án của bạn</h1>
          <p className="d-meta" style={{justifyContent: 'center', maxWidth: '600px', margin: '16px auto 0'}}>
            Hoàn thiện biểu mẫu dưới đây để thuật toán của chúng tôi kết nối bạn với những chuyên gia hàng đầu trên toàn cầu.
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
              <div style={{display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '20px'}}>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => navigate(-1)}
                  style={{background: 'transparent', border: '1px solid var(--border-light)', color: '#64748B'}}
                >
                  <i className="fa-regular fa-floppy-disk"></i> Lưu bản nháp
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loading}
                  style={{
                    background: 'var(--navy)',
                    color: 'var(--gold)',
                    border: 'none',
                    padding: '14px 32px',
                    fontSize: '15px',
                    fontWeight: 700,
                    opacity: loading ? 0.8 : 1
                  }}
                >
                  {loading ? (
                    <>
                      <i className="fa-solid fa-circle-notch fa-spin"></i> Đang xử lý...
                    </>
                  ) : (
                    <>
                      PHÁT HÀNH DỰ ÁN <i className="fa-solid fa-paper-plane" style={{marginLeft: '8px'}}></i>
                    </>
                  )}
                </button>
              </div>
            </form>
          </main>

          {/* Sidebar */}
          <aside className="post-sidebar">
            <div className="sidebar-card">
              <h3 className="sidebar-title">
                <i className="fa-solid fa-bolt" style={{color: '#F59E0B'}}></i> Checklist thành công
              </h3>
              <ul className="check-list">
                <li>
                  <i className="fa-solid fa-circle-check"></i>
                  <b>Cụ thể hóa:</b> Đừng nói "Tôi cần 1 website", hãy nói "Tôi cần 1 Landing Page 5 sections bán mỹ phẩm."
                </li>
                <li>
                  <i className="fa-solid fa-circle-check"></i>
                  <b>Giao tiếp:</b> Trả lời tin nhắn của freelancer ứng tuyển trong vòng 24H để giữ độ nóng dự án.
                </li>
                <li>
                  <i className="fa-solid fa-circle-check"></i>
                  <b>Kỳ vọng:</b> Nêu rõ bạn yêu cầu số lần chỉnh sửa (Revisions) là bao nhiêu.
                </li>
              </ul>
            </div>

            <div className="sidebar-card" style={{background: '#ECFDF5', borderColor: '#10B981'}}>
              <h3 className="sidebar-title" style={{color: '#064E3B'}}>
                <i className="fa-solid fa-shield-halved" style={{color: '#059669', fontSize: '24px'}}></i> Thanh toán bảo mật
              </h3>
              <p style={{color: '#047857', fontSize: '14px', lineHeight: '1.6', margin: 0}}>
                Hệ thống Escrow (ký quỹ) giữ tiền của bạn an toàn. Bạn chỉ giải ngân khi hài lòng với sản phẩm cuối cùng. 100% yên tâm giao dịch.
              </p>
            </div>
          </aside>
        </div>
      </div>

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
        <span>Tuyệt vời! Dự án đã trực tuyến.</span>
      </div>
    </div>
  );
};

export default PostRequestPage;
