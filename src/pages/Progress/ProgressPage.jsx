import { useState } from 'react';
import './ProgressPage.css';

const ProgressPage = () => {
  const [progress, setProgress] = useState(65);

  const timelineData = [
    {
      id: 1,
      title: 'Khởi tạo dự án',
      desc: 'Dự án đã được thiết lập và các yêu cầu ban đầu đã được thống nhất.',
      date: '20/04/2026',
      status: 'done'
    },
    {
      id: 2,
      title: 'Hoàn thành thiết kế giao diện',
      desc: 'Đã hoàn thành bản vẽ Figma và được khách hàng phê duyệt.',
      date: '25/04/2026',
      status: 'done',
      file: 'UI_Design_v1.pdf'
    },
    {
      id: 3,
      title: 'Phát triển Backend API',
      desc: 'Đang triển khai các module Core và Auth.',
      date: '01/05/2026',
      status: 'current'
    }
  ];

  const handleUpdateProgress = (e) => {
    setProgress(parseInt(e.target.value));
  };

  return (
    <div className="container py-5" style={{ minHeight: '80vh' }}>
      {/* Banner giả định */}
      <div 
        className="w-card mb-4" 
        style={{ 
          background: 'linear-gradient(135deg, var(--navy) 0%, #1e293b 100%)', 
          color: 'white', 
          padding: '40px' 
        }}
      >
        <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '10px' }}>Workroom</h1>
        <p style={{ opacity: '0.8' }}>Theo dõi tiến độ và quản lý kết quả dự án: <b>Xây dựng hệ thống TMDT cao cấp</b></p>
      </div>

      <div className="workroom-layout">
        {/* Main Content */}
        <div className="w-main">
          <div className="w-card">
            <div className="w-card-header">
              <h2>Tiến độ dự án</h2>
              <span className="badge" style={{ background: 'var(--teal)', color: 'white', padding: '5px 12px', borderRadius: '20px', fontSize: '12px' }}>
                Đang thực hiện
              </span>
            </div>
            <div className="w-card-body">
              <div className="progress-overview">
                <div className="progress-labels">
                  <span>Hoàn thành tổng thể</span>
                  <span>{progress}%</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={progress} 
                  onChange={handleUpdateProgress}
                  className="range-slider"
                />
                <p className="mt-2 text-muted" style={{ fontSize: '13px' }}>
                  <i className="fa-solid fa-circle-info me-1"></i>
                  Kéo thanh trượt để cập nhật tiến độ công việc mới nhất của bạn.
                </p>
              </div>

              <h3 className="section-title mt-4 mb-3" style={{ fontSize: '18px', fontWeight: '700' }}>Nhật ký công việc</h3>
              <div className="timeline">
                {timelineData.map((item) => (
                  <div key={item.id} className="timeline-item">
                    <div className={`timeline-dot ${item.status === 'done' ? 'done' : ''}`}></div>
                    <div className="timeline-content">
                      <div className="t-meta">{item.date}</div>
                      <div className="t-title">{item.title}</div>
                      <div className="t-desc">{item.desc}</div>
                      {item.file && (
                        <a href="#" className="t-file">
                          <i className="fa-solid fa-paperclip"></i>
                          {item.file}
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-sidebar">
          <div className="w-card">
            <div className="w-card-header">
              <h2>Thông tin hợp đồng</h2>
            </div>
            <div className="w-card-body">
              <ul className="project-meta-list">
                <li>
                  <span className="meta-key">Freelancer:</span>
                  <span className="meta-val">Trần Thị Bình</span>
                </li>
                <li>
                  <span className="meta-key">Người thuê:</span>
                  <span className="meta-val">Nguyễn Văn An</span>
                </li>
                <li>
                  <span className="meta-key">Ngân sách:</span>
                  <span className="meta-val">15,000,000đ</span>
                </li>
                <li>
                  <span className="meta-key">Thời hạn:</span>
                  <span className="meta-val">30/05/2026</span>
                </li>
              </ul>
              
              <div className="mt-4">
                <button 
                  className="btn-signup-premium w-100" 
                  style={{ marginBottom: '12px' }}
                  onClick={() => alert('Đã gửi yêu cầu xác nhận hoàn thành!')}
                >
                  Xác nhận hoàn thành
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressPage;
