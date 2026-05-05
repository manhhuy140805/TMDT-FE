import { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import './ProfilePage.css';

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState('info');
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reviews, setReviews] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Giả định User ID = 8 (Freelancer) để demo
  const userId = 8;

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        // 1. Lấy profile người dùng
        const profileRes = await api.get(`/users/${userId}/profile`);
        setUserProfile(profileRes);

        // 2. Lấy danh sách đánh giá
        const reviewsRes = await api.get(`/reviews/user/${userId}`);
        setReviews(reviewsRes.reviews);
      } catch (error) {
        console.error('Error fetching profile data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [userId]);

  const handleSubmitReport = async () => {
    try {
      await api.post('/reports', {
        nguoiBaoCaoId: 10, // Giả định ID người báo cáo (Client)
        doiTuongId: userId,
        loaiDoiTuong: 'TaiKhoan',
        lyDo: reportReason
      });
      alert('Cảm ơn bạn, báo cáo đã được gửi tới quản trị viên.');
      setShowReportModal(false);
      setReportReason('');
    } catch (error) {
      alert('Lỗi khi gửi báo cáo: ' + error.message);
    }
  };

  if (loading) return <div className="text-center py-5">Đang tải hồ sơ...</div>;

  return (
    <div className="settings-main-wrapper" style={{ background: '#F8FAFC', paddingBottom: '60px' }}>
      <div className="settings-container">
        {/* Sidebar */}
        <aside className="settings-sidebar">
          <div className="sidebar-title">Cài đặt</div>
          <nav className="settings-nav">
            <a href="#" className={activeTab === 'info' ? 'active' : ''} onClick={() => setActiveTab('info')}>
              <i className="fa-regular fa-user"></i>
              Thông tin cá nhân
            </a>
            <a href="#" className={activeTab === 'reviews' ? 'active' : ''} onClick={() => setActiveTab('reviews')}>
              <i className="fa-regular fa-star"></i>
              Đánh giá từ khách
            </a>
            <a href="#" className={activeTab === 'security' ? 'active' : ''} onClick={() => setActiveTab('security')}>
              <i className="fa-solid fa-shield-halved"></i>
              Bảo mật & Mật khẩu
            </a>
            <hr style={{ margin: '10px 0', border: 'none', borderTop: '1px solid #e2e8f0' }} />
            <a href="#" style={{ color: '#ef4444' }} onClick={() => setShowReportModal(true)}>
              <i className="fa-solid fa-triangle-exclamation"></i>
              Báo cáo vi phạm
            </a>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="settings-main">
          <div className="profile-power-card">
            <div className="profile-cover">
              <button className="btn-change-cover">
                <i className="fa-solid fa-camera me-2"></i> Đổi ảnh bìa
              </button>
            </div>
            
            <div className="profile-head">
              <div className="avatar-upload-wow">
                <img src="/images/avatar_1.png" alt="Avatar" />
                <div className="avatar-overlay">
                  <i className="fa-solid fa-camera"></i>
                </div>
              </div>
              <div className="profile-titles">
                <h1 className="user-name">
                  {userProfile?.user?.hoTen || 'N/A'}
                  <i className="fa-solid fa-circle-check verify-badge" title="Đã xác thực"></i>
                </h1>
                <div className="user-role">
                  {userProfile?.profile?.freelancer?.chuyenGia || 'Chuyên gia Freelancer'}
                </div>
              </div>
            </div>

            <div className="profile-body">
              {activeTab === 'info' && (
                <div className="section-block">
                  <h2 className="section-title">Thông tin cơ bản</h2>
                  <p className="section-desc">Cập nhật thông tin cá nhân của bạn để xây dựng uy tín trong cộng đồng.</p>
                  
                  <div className="form-grid-2">
                    <div className="input-group">
                      <label>Họ và Tên</label>
                      <div className="pi-wrapper">
                        <input type="text" defaultValue={userProfile?.user?.hoTen} />
                      </div>
                    </div>
                    <div className="input-group">
                      <label>Email</label>
                      <div className="pi-wrapper">
                        <input type="email" defaultValue={userProfile?.user?.email} />
                      </div>
                    </div>
                    <div className="input-group full-width">
                      <label>Giới thiệu bản thân</label>
                      <div className="input-wrapper">
                        <textarea defaultValue={userProfile?.profile?.freelancer?.kyNang || 'Chưa có mô tả kỹ năng.'}></textarea>
                      </div>
                    </div>
                  </div>
                  
                  <div className="sticky-footer">
                    <button className="p-btn-outline">Hủy bỏ</button>
                    <button className="p-btn-primary">Lưu thay đổi</button>
                  </div>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="section-block">
                  <h2 className="section-title">Đánh giá từ người thuê</h2>
                  <p className="section-desc">Dưới đây là những phản hồi từ khách hàng bạn đã từng làm việc cùng.</p>
                  
                  <div className="reviews-list" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {reviews.length > 0 ? reviews.map(review => (
                      <div key={review.danhGiaId} style={{ 
                        padding: '20px', 
                        border: '1px solid var(--border-light)', 
                        borderRadius: '16px',
                        background: '#f8fafc'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <div style={{ 
                              width: '40px', height: '40px', background: '#e2e8f0', borderRadius: '50%',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
                            }}>
                              {review.nguoiDanhGia?.hoTen?.[0] || 'U'}
                            </div>
                            <div>
                              <div style={{ fontWeight: '700', color: 'var(--navy)' }}>{review.nguoiDanhGia?.hoTen}</div>
                              <div style={{ fontSize: '12px', color: '#64748B' }}>
                                {new Date(review.ngayTao).toLocaleDateString('vi-VN')}
                              </div>
                            </div>
                          </div>
                          <div style={{ color: '#fbbf24' }}>
                            {[1, 2, 3, 4, 5].map(s => (
                              <i key={s} className={`fa-${review.diemSo >= s ? 'solid' : 'regular'} fa-star`} style={{ fontSize: '14px' }}></i>
                            ))}
                          </div>
                        </div>
                        <p style={{ fontSize: '14px', color: '#475569', lineHeight: '1.6', margin: 0 }}>
                          "{review.binhLuan}"
                        </p>
                      </div>
                    )) : (
                      <p className="text-muted">Chưa có đánh giá nào.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Modal Báo cáo */}
      {showReportModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="profile-power-card" style={{ width: '100%', maxWidth: '500px' }}>
            <div className="w-card-header" style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>Báo cáo tài khoản</h2>
              <button onClick={() => setShowReportModal(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '20px' }}>&times;</button>
            </div>
            <div style={{ padding: '24px' }}>
              <p style={{ fontSize: '14px', color: '#64748B', marginBottom: '20px' }}>
                Nếu bạn nhận thấy tài khoản này có dấu hiệu lừa đảo hoặc vi phạm tiêu chuẩn cộng đồng, hãy cho chúng tôi biết.
              </p>
              <div className="input-group mb-4">
                <label className="d-block mb-2 font-weight-bold">Lý do báo cáo</label>
                <textarea 
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  placeholder="Mô tả chi tiết hành vi vi phạm..."
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    minHeight: '100px'
                  }}
                ></textarea>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button className="p-btn-outline" style={{ flex: 1 }} onClick={() => setShowReportModal(false)}>Hủy</button>
                <button className="p-btn-primary" style={{ flex: 1, background: '#ef4444' }} onClick={handleSubmitReport}>Gửi báo cáo</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
