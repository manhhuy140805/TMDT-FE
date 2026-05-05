import { useState } from 'react';
import './ReportPage.css';

const ReportPage = () => {
  const [description, setDescription] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  // Dữ liệu mục tiêu giả định (Lấy từ context hoặc URL trong thực tế)
  const targetUser = {
    name: 'Lê Hoàng Duy',
    role: 'Senior UX/UI Designer',
    avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=150'
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Luồng thay thế A1: Thiếu thông tin
    if (!description.trim()) {
      setError('Vui lòng nhập nội dung báo cáo chi tiết để chúng tôi có cơ sở xử lý.');
      return;
    }

    // Luồng chính: Gửi báo cáo
    setError('');
    console.log('Sending report to system...', { target: targetUser.name, content: description });
    
    // Giả lập hệ thống lưu thông tin và thông báo thành công
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="report-page-wrapper">
        <div className="report-card report-success">
          <i className="fa-solid fa-circle-check"></i>
          <h1>Báo cáo đã được gửi!</h1>
          <p style={{ color: '#64748b', marginBottom: '12px' }}>
            Hệ thống đã ghi nhận thông tin của bạn. Báo cáo sẽ được <b>Quản trị viên</b> xem xét và xử lý sớm nhất.
          </p>
          <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '32px' }}>Cảm ơn bạn đã góp phần xây dựng cộng đồng an toàn.</p>
          <button className="btn-report-submit" style={{ background: '#0ea5e9' }} onClick={() => window.location.href = '/'}>
            QUAY LẠI TRANG CHỦ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="report-page-wrapper">
      <div className="report-card">
        <div className="report-header">
          <h1>Báo cáo vi phạm</h1>
          <p>Mô tả hành vi vi phạm của tài khoản này để hệ thống xem xét.</p>
        </div>

        <div className="target-user-box">
          <img src={targetUser.avatar} alt={targetUser.name} className="target-avatar" />
          <div className="target-info">
            <b>{targetUser.name}</b>
            <span>{targetUser.role}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="report-form-group">
            <label className="report-label">Nội dung báo cáo <span>*</span></label>
            <textarea 
              className={`report-textarea ${error ? 'border-danger' : ''}`}
              placeholder="Vui lòng nhập chi tiết lý do bạn báo cáo tài khoản này (ví dụ: lừa đảo dự án, ngôn từ không phù hợp...)"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (e.target.value.trim()) setError('');
              }}
            ></textarea>
            {error && <div style={{ color: '#ef4444', fontSize: '13px', marginTop: '8px', fontWeight: '600' }}>
              <i className="fa-solid fa-triangle-exclamation me-1"></i> {error}
            </div>}
          </div>

          <div className="report-form-group">
            <label className="report-label">Hình ảnh minh chứng (nếu có)</label>
            <div className="evidence-upload">
              <i className="fa-solid fa-camera"></i>
              <p>Tải lên bằng chứng vi phạm</p>
            </div>
          </div>

          <div className="report-actions">
            <button type="button" className="btn-report-cancel" onClick={() => window.history.back()}>
              Hủy bỏ
            </button>
            <button 
              type="submit" 
              className="btn-report-submit"
              disabled={!description.trim()}
              title={!description.trim() ? "Vui lòng nhập nội dung báo cáo" : ""}
            >
              GỬI BÁO CÁO
            </button>
          </div>

          <div style={{ marginTop: '24px', padding: '16px', background: '#fff7ed', borderRadius: '8px', border: '1px solid #ffedd5' }}>
            <p style={{ margin: 0, fontSize: '13px', color: '#9a3412', lineHeight: '1.5' }}>
              <i className="fa-solid fa-circle-info me-2"></i>
              <b>Ghi chú:</b> Báo cáo này sẽ được quản trị viên xem xét và xử lý theo quy định của hệ thống.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportPage;
