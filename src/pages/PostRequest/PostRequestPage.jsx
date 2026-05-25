import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './PostRequestPage.css';

const PostRequestPage = ({ isEmbedded = false, onCancel }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    location: '',
    description: '',
    skills: '',
    kyNangIds: [],
    budgetMin: '',
    budgetMax: '',
    submissionDeadline: '',
    attachments: [],
    yeuCauGiamSat: false,
    giamSatId: ''
  });
  const [errors, setErrors] = useState({});
  const [charCounts, setCharCounts] = useState({
    title: 0,
    description: 0
  });

  const [globalSkills, setGlobalSkills] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [apiCategories, setApiCategories] = useState([]);
  const [skillsLoading, setSkillsLoading] = useState(false);
  const [supervisorsLoading, setSupervisorsLoading] = useState(false);
  const [skillSearch, setSkillSearch] = useState('');

  const fallbackCategories = [
    { id: 1, name: 'Công nghệ & Lập trình' },
    { id: 2, name: 'Thiết kế đồ họa & Kiến trúc' },
    { id: 3, name: 'Digital Marketing & SEO' },
    { id: 4, name: 'Sáng tạo nội dung & Biên dịch' }
  ];

  const categories = apiCategories.length > 0 ? apiCategories : fallbackCategories;

  useEffect(() => {
    const loadInitData = async () => {
      setSkillsLoading(true);
      setSupervisorsLoading(true);
      try {
        const [skillsRes, supervisorsRes, categoriesRes] = await Promise.allSettled([
          api.skills.getAll(),
          api.supervisors.getAll(),
          api.categories.getAll()
        ]);

        if (skillsRes.status === 'fulfilled') {
          const list = skillsRes.value?.skills || skillsRes.value?.data?.skills || skillsRes.value?.data || (Array.isArray(skillsRes.value) ? skillsRes.value : []);
          setGlobalSkills(list);
        }

        if (supervisorsRes.status === 'fulfilled') {
          const list = supervisorsRes.value?.supervisors || supervisorsRes.value?.data?.supervisors || supervisorsRes.value?.data || (Array.isArray(supervisorsRes.value) ? supervisorsRes.value : []);
          setSupervisors(list);
        }

        if (categoriesRes.status === 'fulfilled') {
          const list = categoriesRes.value?.categories || categoriesRes.value?.data?.categories || categoriesRes.value?.data || (Array.isArray(categoriesRes.value) ? categoriesRes.value : []);
          const mapped = list.map(c => ({ id: c.loaiDichVuId, name: c.tenLoai }));
          setApiCategories(mapped);
        }
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu khởi tạo:", err);
      } finally {
        setSkillsLoading(false);
        setSupervisorsLoading(false);
      }
    };

    loadInitData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'title') {
      setCharCounts(prev => ({ ...prev, title: value.length }));
    } else if (name === 'description') {
      setCharCounts(prev => ({ ...prev, description: value.length }));
    }

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleToggleSkill = (skillId) => {
    setFormData(prev => {
      const isSelected = prev.kyNangIds.includes(skillId);
      const newKyNangIds = isSelected 
        ? prev.kyNangIds.filter(id => id !== skillId)
        : [...prev.kyNangIds, skillId];
      return { ...prev, kyNangIds: newKyNangIds };
    });
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

    if (!formData.title.trim() || formData.title.length < 10 || formData.title.length > 100) {
      newErrors.title = 'Vui lòng nhập tiêu đề (10 - 100 ký tự).';
    }

    if (!formData.category) {
      newErrors.category = 'Vui lòng phân loại lĩnh vực.';
    }

    if (!formData.description.trim() || formData.description.length < 50) {
      newErrors.description = 'Vui lòng mô tả ít nhất 50 ký tự.';
    }

    if (!formData.budgetMin || parseInt(formData.budgetMin) < 100000) {
      newErrors.budgetMin = 'Tối thiểu 100,000 VNĐ.';
    }

    if (!formData.budgetMax) {
      newErrors.budgetMax = 'Vui lòng nhập ngân sách tối đa.';
    } else if (parseInt(formData.budgetMax) < parseInt(formData.budgetMin || 0)) {
      newErrors.budgetMax = 'Phải lớn hơn hoặc bằng ngân sách tối thiểu.';
    }

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

    if (formData.yeuCauGiamSat && !formData.giamSatId) {
      newErrors.giamSatId = 'Vui lòng chọn một đơn vị giám sát.';
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

    setLoading(true);

    try {
      const storedUser = localStorage.getItem('user');
      const user = storedUser ? JSON.parse(storedUser) : null;
      const currentUser = user?.user || user;
      const nguoiThueId = currentUser?.taiKhoanId || currentUser?.id;

      if (!nguoiThueId) {
        alert('Vui lòng đăng nhập lại để tạo yêu cầu.');
        setLoading(false);
        return;
      }

      const response = await api.requests.create({
        nguoiThueId: nguoiThueId,
        tieuDe: formData.title,
        loaiDichVuId: parseInt(formData.category),
        moTa: formData.description,
        nganSachMin: parseInt(formData.budgetMin),
        nganSachMax: parseInt(formData.budgetMax),
        thoiHan: new Date(formData.submissionDeadline).toISOString(),
        yeuCauGiamSat: formData.yeuCauGiamSat,
        giamSatId: formData.yeuCauGiamSat && formData.giamSatId ? parseInt(formData.giamSatId) : null,
        kyNangIds: formData.kyNangIds.length > 0 ? formData.kyNangIds : undefined
      });

      if (response) {
        const toast = document.getElementById('success-toast');
        if (toast) {
          toast.style.transform = 'translateY(0)';
          toast.style.opacity = '1';
        }

        setTimeout(() => {
          if (isEmbedded && onCancel) {
            onCancel();
          } else {
            navigate('/my-requests');
          }
        }, 2000);
      } else {
        alert('Có lỗi xảy ra. Vui lòng thử lại!');
        setLoading(false);
      }
    } catch (err) {
      console.error("Lỗi khi tạo yêu cầu:", err);
      alert('Có lỗi xảy ra khi tạo yêu cầu. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`post-request-page ${isEmbedded ? 'embedded' : ''}`} style={{ background: isEmbedded ? 'transparent' : '#F8FAFC', paddingBottom: isEmbedded ? '40px' : '60px' }}>
      
      <div className="page-container" style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', position: 'relative', zIndex: 10 }}>
        
        {!isEmbedded && (
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#0F172A', margin: 0 }}>Tạo yêu cầu thuê mới</h2>
            <p style={{ fontSize: '14px', color: '#64748B', marginTop: '4px', margin: 0 }}>
              Cung cấp các thông tin chi tiết dưới đây để tìm đối tác phù hợp nhất.
            </p>
          </div>
        )}

        {isEmbedded && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
            <div style={{ fontSize: '18px', fontWeight: 600, color: '#64748B', display: 'flex', alignItems: 'center' }}>
              <span style={{ cursor: 'pointer', transition: 'color 0.2s' }} onClick={onCancel} onMouseOver={(e) => e.target.style.color = 'var(--teal)'} onMouseOut={(e) => e.target.style.color = '#64748B'}>
                Dự án
              </span>
              <i className="fa-solid fa-chevron-right" style={{ margin: '0 12px', fontSize: '14px', color: '#CBD5E1' }}></i>
              <span style={{ color: 'var(--navy)' }}>
                Tạo yêu cầu thuê
              </span>
            </div>
            <button className="btn-outline" onClick={onCancel} style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid #CBD5E1', background: '#fff', color: '#64748B', cursor: 'pointer', fontWeight: 600 }}>
              <i className="fa-solid fa-arrow-left"></i> Trở về
            </button>
          </div>
        )}

        <div className="post-layout-single">
          <main className="post-main-full">
            <form onSubmit={handleSubmit} noValidate>
              <div className="form-card-unified" style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', padding: '30px' }}>
                
                {/* Phần 1 */}
                <div className="form-section">
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', marginBottom: '16px', borderBottom: '1px solid #F1F5F9', paddingBottom: '8px' }}>
                    1. Thông tin chung
                  </h3>
                  
                  <div className="input-group">
                    <label htmlFor="title" style={{ fontWeight: 600, fontSize: '14px', color: '#1E293B', display: 'block', marginBottom: '6px' }}>
                      Tên dự án <span className="text-danger">*</span>
                      <span className="char-count" style={{ float: 'right', fontSize: '12px', color: charCounts.title > 90 ? '#DC2626' : '#94A3B8' }}>
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
                        placeholder="VD: Xây dựng bộ nhận diện thương hiệu Cafe"
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
                      <label htmlFor="category" style={{ fontWeight: 600, fontSize: '14px', color: '#1E293B' }}>
                        Lĩnh vực <span className="text-danger">*</span>
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
                      <label htmlFor="location" style={{ fontWeight: 600, fontSize: '14px', color: '#1E293B' }}>Địa điểm làm việc</label>
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

                <div style={{ height: '24px' }}></div>

                {/* Phần 2 */}
                <div className="form-section">
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', marginBottom: '16px', borderBottom: '1px solid #F1F5F9', paddingBottom: '8px' }}>
                    2. Mô tả & Kỹ năng yêu cầu
                  </h3>
                  
                  <div className="input-group">
                    <label htmlFor="description" style={{ fontWeight: 600, fontSize: '14px', color: '#1E293B', display: 'block', marginBottom: '6px' }}>
                      Mô tả khối lượng công việc <span className="text-danger">*</span>
                      <span className="char-count" style={{ float: 'right', fontSize: '12px', color: '#94A3B8' }}>{charCounts.description} / 5000</span>
                    </label>
                    <div className="input-wrapper align-top">
                      <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows="5"
                        maxLength="5000"
                        placeholder="Mô tả cụ thể yêu cầu công việc, các chức năng cần xây dựng, định dạng tệp bàn giao..."
                      />
                      <i className="fa-solid fa-align-left icon-left" style={{ top: '16px', transform: 'none' }}></i>
                    </div>
                    {errors.description && (
                      <span className="error-msg">
                        <i className="fa-solid fa-circle-exclamation"></i> {errors.description}
                      </span>
                    )}
                  </div>

                  <div className="input-group" style={{ marginTop: '20px' }}>
                    <label style={{ fontWeight: 600, fontSize: '14px', color: '#1E293B' }}>
                      Kỹ năng & Công cụ <span className="text-danger">*</span>
                    </label>
                    
                    <div className="post-skills-selector" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '12px', marginTop: '6px' }}>
                      <div className="post-skills-search-wrapper" style={{ position: 'relative', marginBottom: '10px' }}>
                        <input
                          type="text"
                          placeholder="Tìm kiếm kỹ năng..."
                          value={skillSearch}
                          onChange={(e) => setSkillSearch(e.target.value)}
                          style={{ width: '100%', padding: '8px 12px 8px 34px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                        />
                        <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }}></i>
                      </div>

                      {skillsLoading ? (
                        <div style={{ color: '#64748B', fontSize: '12px', padding: '6px' }}>
                          <i className="fa-solid fa-circle-notch fa-spin" style={{ marginRight: '6px' }}></i> Đang tải...
                        </div>
                      ) : (
                        <div className="post-skills-list" style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', maxHeight: '120px', overflowY: 'auto', padding: '2px' }}>
                          {globalSkills
                            .filter(skill => 
                              skill.tenKyNang.toLowerCase().includes(skillSearch.toLowerCase()) ||
                              (skill.moTa && skill.moTa.toLowerCase().includes(skillSearch.toLowerCase()))
                            )
                            .map(skill => {
                              const isSelected = formData.kyNangIds.includes(skill.kyNangId);
                              return (
                                <div
                                  key={skill.kyNangId}
                                  className={`post-skill-pill ${isSelected ? 'selected' : ''}`}
                                  onClick={() => handleToggleSkill(skill.kyNangId)}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    background: isSelected ? '#F0F9FF' : '#fff',
                                    border: isSelected ? '1px solid #0EA5E9' : '1px solid #E2E8F0',
                                    color: isSelected ? '#0284C7' : '#475569',
                                    padding: '5px 10px',
                                    borderRadius: '16px',
                                    fontSize: '12px',
                                    fontWeight: 500,
                                    cursor: 'pointer',
                                    transition: 'all 0.15s'
                                  }}
                                >
                                  {isSelected ? (
                                    <i className="fa-solid fa-circle-check" style={{ color: '#0EA5E9' }}></i>
                                  ) : (
                                    <i className="fa-solid fa-plus"></i>
                                  )}
                                  {skill.tenKyNang}
                                </div>
                              );
                            })}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="input-group" style={{ marginTop: '20px' }}>
                    <label style={{ fontWeight: 600, fontSize: '14px', color: '#1E293B' }}>Tài liệu đính kèm</label>
                    <div className="file-dropzone-compact" onClick={() => document.getElementById('file-input').click()} style={{ border: '1.5px dashed #CBD5E1', borderRadius: '8px', padding: '16px', textAlign: 'center', background: '#FCFDFE', cursor: 'pointer', transition: 'all 0.2s', marginTop: '6px' }}>
                      <input
                        type="file"
                        id="file-input"
                        multiple
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                        accept=".pdf,.doc,.docx,.zip"
                      />
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <i className="fa-solid fa-cloud-arrow-up" style={{ fontSize: '18px', color: '#64748B' }}></i>
                        <span style={{ color: '#334155', fontWeight: 600, fontSize: '13px' }}>
                          Nhấp để chọn hoặc kéo thả tài liệu
                        </span>
                        <span style={{ fontSize: '11px', color: '#64748B' }}>
                          (Tối đa 25MB)
                        </span>
                      </div>
                      {formData.attachments.length > 0 && (
                        <div style={{ marginTop: '6px', fontSize: '12px', color: '#10B981', fontWeight: 600 }}>
                          <i className="fa-solid fa-circle-check"></i> Đã chọn {formData.attachments.length} tệp
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ height: '24px' }}></div>

                {/* Phần 3 */}
                <div className="form-section">
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', marginBottom: '16px', borderBottom: '1px solid #F1F5F9', paddingBottom: '8px' }}>
                    3. Ngân sách & Hạn chốt
                  </h3>
                  
                  <div className="form-grid-3">
                    <div className="input-group m-0">
                      <label htmlFor="budgetMin" style={{ fontWeight: 600, fontSize: '14px', color: '#1E293B' }}>
                        Ngân sách tối thiểu <span className="text-danger">*</span>
                      </label>
                      <div className="input-wrapper">
                        <input
                          type="number"
                          id="budgetMin"
                          name="budgetMin"
                          value={formData.budgetMin}
                          onChange={handleChange}
                          placeholder="Tối thiểu"
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
                      <label htmlFor="budgetMax" style={{ fontWeight: 600, fontSize: '14px', color: '#1E293B' }}>
                        Ngân sách tối đa <span className="text-danger">*</span>
                      </label>
                      <div className="input-wrapper">
                        <input
                          type="number"
                          id="budgetMax"
                          name="budgetMax"
                          value={formData.budgetMax}
                          onChange={handleChange}
                          placeholder="Tối đa"
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

                    <div className="input-group m-0">
                      <label htmlFor="submissionDeadline" style={{ fontWeight: 600, fontSize: '14px', color: '#1E293B' }}>
                        Hạn chốt nhận hồ sơ <span className="text-danger">*</span>
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

                <div style={{ height: '24px' }}></div>

                {/* Phần 4 */}
                <div className="form-section" style={{ paddingBottom: '10px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', marginBottom: '16px', borderBottom: '1px solid #F1F5F9', paddingBottom: '8px' }}>
                    4. Giám sát độc lập
                  </h3>
                  
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0', marginBottom: '16px' }}>
                    <div>
                      <span style={{ display: 'block', fontWeight: 600, fontSize: '14px', color: '#0F172A' }}>Yêu cầu Giám sát độc lập</span>
                      <span style={{ display: 'block', fontSize: '11.5px', color: '#64748B', marginTop: '2px' }}>Kiểm định chất lượng & giải ngân an toàn qua bên thứ ba</span>
                    </div>
                    <label className="post-toggle-switch">
                      <input
                        type="checkbox"
                        checked={formData.yeuCauGiamSat}
                        onChange={(e) => setFormData({ ...formData, yeuCauGiamSat: e.target.checked, giamSatId: e.target.checked ? (supervisors[0]?.taiKhoanId || '') : '' })}
                      />
                      <span className="post-toggle-slider"></span>
                    </label>
                  </div>

                  {formData.yeuCauGiamSat && (
                    <div className="input-group" style={{ margin: 0, animation: 'fadeIn 0.3s ease' }}>
                      <label htmlFor="giamSatId" style={{ fontWeight: 600, fontSize: '14px', color: '#1E293B', display: 'block', marginBottom: '6px' }}>
                        Lựa chọn Đơn vị Giám sát <span className="text-danger">*</span>
                      </label>
                      {supervisorsLoading ? (
                        <div style={{ color: '#64748B', fontSize: '13px' }}>
                          <i className="fa-solid fa-circle-notch fa-spin" style={{ marginRight: '6px' }}></i> Đang tải...
                        </div>
                      ) : supervisors.length === 0 ? (
                        <div style={{ color: '#EF4444', fontSize: '13px' }}>
                          <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: '6px' }}></i> Không tìm thấy đơn vị giám sát hoạt động.
                        </div>
                      ) : (
                        <div className="input-wrapper">
                          <select
                            id="giamSatId"
                            name="giamSatId"
                            value={formData.giamSatId}
                            onChange={(e) => setFormData({ ...formData, giamSatId: e.target.value })}
                          >
                            <option value="">--- Chọn đơn vị giám sát ---</option>
                            {supervisors.map(sv => (
                              <option key={sv.giamSatId} value={sv.taiKhoanId}>
                                {sv.tenDonVi} • Phí: {new Intl.NumberFormat('vi-VN').format(Number(sv.phiGiamSat))} VNĐ ({sv.xepHang || 'N/A'}★)
                              </option>
                            ))}
                          </select>
                          <i className="fa-solid fa-shield-halved icon-left"></i>
                        </div>
                      )}
                      {errors.giamSatId && (
                        <span className="error-msg">
                          <i className="fa-solid fa-circle-exclamation"></i> {errors.giamSatId}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Form Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => navigate(-1)}
                  style={{
                    background: '#fff',
                    border: '1px solid #CBD5E1',
                    color: '#64748B',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    fontSize: '13.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.2s'
                  }}
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loading}
                  style={{
                    background: '#0EA5E9',
                    color: '#fff',
                    border: 'none',
                    padding: '10px 24px',
                    fontSize: '13.5px',
                    fontWeight: 600,
                    borderRadius: '8px',
                    opacity: loading ? 0.8 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {loading ? (
                    <>
                      <i className="fa-solid fa-circle-notch fa-spin"></i> Đang xử lý...
                    </>
                  ) : (
                    <>
                      Đăng dự án <i className="fa-solid fa-paper-plane"></i>
                    </>
                  )}
                </button>
              </div>
            </form>
          </main>
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
          padding: '16px 24px',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontWeight: 600,
          fontSize: '14px',
          boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
          transform: 'translateY(120px)',
          opacity: 0,
          transition: 'all 0.4s',
          zIndex: 1000,
          borderLeft: '4px solid #10B981'
        }}
      >
        <i className="fa-solid fa-circle-check" style={{ color: '#34D399', fontSize: '20px' }}></i>
        <span>Đăng yêu cầu thuê thành công!</span>
      </div>
    </div>
  );
};

export default PostRequestPage;
