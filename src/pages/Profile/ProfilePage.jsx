import { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import './ProfilePage.css';

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('hoso'); // Active tab: 'hoso', 'caidat', 'baomat', 'thanhtoan'
  
  // State for Edit modes
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [isEditingAccount, setIsEditingAccount] = useState(false);
  
  // Form states
  const [infoForm, setInfoForm] = useState({
    tenDangNhap: 'nv_an_dev',
    hoTen: 'Nguyen Van An',
    email: 'an.nv@email.com',
    soDienThoai: '09x-xxxx-xxxx',
    gioiTinh: 'Nam',
    diaChi: 'Quận 1, TP. HCM',
    avatar: 'https://png.pngtree.com/png-vector/20251230/ourlarge/pngtree-cartoon-character-avatar-png-image_18347258.webp'
  });

  const [accountForm, setAccountForm] = useState({
    vaiTro: 'Freelancer',
    ngayTao: '22/05/2026',
    capNhatLanCuoi: '22/05/2026'
  });

  // State for interactive avatar editing
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [tempAvatarUrl, setTempAvatarUrl] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        // 1. Lấy thông tin user từ localStorage để hiển thị ngay lập tức
        const storedUser = localStorage.getItem("user");
        let initialUser = null;
        
        if (storedUser) {
          try {
            initialUser = JSON.parse(storedUser);
          } catch (e) {
            console.error("Error parsing user from localStorage:", e);
          }
        }

        // 2. Chuẩn hóa dữ liệu user
        if (initialUser) {
          const formattedInfo = {
            tenDangNhap: initialUser.tenDangNhap || initialUser.username || initialUser.email?.split('@')[0] || 'nv_an_dev',
            hoTen: initialUser.hoTen || initialUser.name || 'Nguyen Van An',
            email: initialUser.email || 'an.nv@email.com',
            soDienThoai: initialUser.soDienThoai || initialUser.phone || '09x-xxxx-xxxx',
            gioiTinh: initialUser.gioiTinh || 'Nam',
            diaChi: initialUser.diaChi || 'Quận 1, TP. HCM',
            avatar: initialUser.avatar || 'https://png.pngtree.com/png-vector/20251230/ourlarge/pngtree-cartoon-character-avatar-png-image_18347258.webp'
          };
          
          const formattedAccount = {
            vaiTro: initialUser.role === 'NGUOI_THUE' || initialUser.vaiTro === 'NGUOI_THUE' ? 'Người thuê' : 'Freelancer',
            ngayTao: initialUser.ngayTao ? new Date(initialUser.ngayTao).toLocaleDateString('vi-VN') : '22/05/2026',
            capNhatLanCuoi: initialUser.capNhatLanCuoi ? new Date(initialUser.capNhatLanCuoi).toLocaleDateString('vi-VN') : '22/05/2026'
          };

          setInfoForm(formattedInfo);
          setAccountForm(formattedAccount);
          setUser(initialUser);
        } else {
          // Fallback mặc định tài khoản demo
          const demoUser = {
            id: 8,
            hoTen: 'Nguyen Van An',
            email: 'an.nv@email.com',
            role: 'FREELANCER'
          };
          setUser(demoUser);
        }

        // 3. Cố gắng lấy thông tin chi tiết nhất từ API backend nếu có
        if (initialUser?.id) {
          try {
            const profileRes = await api.get(`/users/${initialUser.id}/profile`);
            if (profileRes && profileRes.user) {
              const u = profileRes.user;
              const apiInfo = {
                tenDangNhap: u.tenDangNhap || u.email?.split('@')[0] || infoForm.tenDangNhap,
                hoTen: u.hoTen || infoForm.hoTen,
                email: u.email || infoForm.email,
                soDienThoai: u.soDienThoai || infoForm.soDienThoai,
                gioiTinh: u.gioiTinh || infoForm.gioiTinh,
                diaChi: u.diaChi || infoForm.diaChi,
                avatar: u.avatar || infoForm.avatar
              };
              const apiAccount = {
                vaiTro: u.vaiTro === 'NGUOI_THUE' ? 'Người thuê' : 'Freelancer',
                ngayTao: u.ngayTao ? new Date(u.ngayTao).toLocaleDateString('vi-VN') : accountForm.ngayTao,
                capNhatLanCuoi: u.capNhatLanCuoi ? new Date(u.capNhatLanCuoi).toLocaleDateString('vi-VN') : accountForm.capNhatLanCuoi
              };
              setInfoForm(apiInfo);
              setAccountForm(apiAccount);
            }
          } catch (apiErr) {
            console.warn("Backend API not reachable or endpoint failed. Using LocalStorage/Demo fallback.", apiErr);
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Handle personal info change
  const handleInfoChange = (e) => {
    const { name, value } = e.target;
    setInfoForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Save personal info
  const handleSaveInfo = async () => {
    try {
      const updatedUser = {
        ...user,
        hoTen: infoForm.hoTen,
        email: infoForm.email,
        soDienThoai: infoForm.soDienThoai,
        gioiTinh: infoForm.gioiTinh,
        diaChi: infoForm.diaChi,
        avatar: infoForm.avatar,
        tenDangNhap: infoForm.tenDangNhap
      };

      // 1. Lưu vào localStorage
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);

      // 2. Đồng bộ lên API backend
      if (user && user.id) {
        try {
          await api.put(`/users/${user.id}`, {
            hoTen: infoForm.hoTen,
            email: infoForm.email,
            soDienThoai: infoForm.soDienThoai,
            gioiTinh: infoForm.gioiTinh,
            diaChi: infoForm.diaChi,
            avatar: infoForm.avatar,
            tenDangNhap: infoForm.tenDangNhap
          });
        } catch (apiErr) {
          console.warn("Could not sync with database. Local changes saved.", apiErr);
        }
      }

      setIsEditingInfo(false);
      
      // Cập nhật ngày chỉnh sửa cuối cùng
      const nowStr = new Date().toLocaleDateString('vi-VN');
      setAccountForm(prev => ({
        ...prev,
        capNhatLanCuoi: nowStr
      }));
      
      alert('Đã cập nhật thông tin cá nhân thành công!');
    } catch (error) {
      alert('Có lỗi xảy ra: ' + error.message);
    }
  };

  // Save account info
  const handleSaveAccount = async () => {
    try {
      const dbRole = accountForm.vaiTro === 'Người thuê' ? 'NGUOI_THUE' : 'FREELANCER';
      const updatedUser = {
        ...user,
        role: dbRole,
        vaiTro: dbRole
      };

      // 1. Lưu vào localStorage
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);

      // 2. Đồng bộ lên API backend
      if (user && user.id) {
        try {
          await api.put(`/users/${user.id}`, {
            vaiTro: dbRole
          });
        } catch (apiErr) {
          console.warn("Could not sync with database. Local changes saved.", apiErr);
        }
      }

      setIsEditingAccount(false);
      
      // Cập nhật ngày chỉnh sửa cuối cùng
      const nowStr = new Date().toLocaleDateString('vi-VN');
      setAccountForm(prev => ({
        ...prev,
        capNhatLanCuoi: nowStr
      }));

      // Reload header by triggering custom event or reloading window
      alert('Đã cập nhật chi tiết tài khoản thành công!');
      window.location.reload();
    } catch (error) {
      alert('Có lỗi xảy ra: ' + error.message);
    }
  };

  // Handle Avatar URL Update
  const handleUpdateAvatar = () => {
    if (tempAvatarUrl.trim()) {
      setInfoForm(prev => ({
        ...prev,
        avatar: tempAvatarUrl.trim()
      }));
      
      // Update directly in storage if not currently editing
      if (!isEditingInfo) {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          try {
            const parsed = JSON.parse(storedUser);
            parsed.avatar = tempAvatarUrl.trim();
            localStorage.setItem("user", JSON.stringify(parsed));
          } catch (e) {
            console.error(e);
          }
        }
      }

      setShowAvatarModal(false);
      setTempAvatarUrl('');
      alert('Đã đổi ảnh đại diện thành công! Nhớ bấm "Lưu" để đồng bộ.');
    }
  };

  if (loading) {
    return (
      <div className="profile-loading-overlay">
        <div className="profile-spinner"></div>
        <p>Đang tải dữ liệu hồ sơ...</p>
      </div>
    );
  }

  return (
    <div className="profile-page-background">
      <div className="profile-page-main-container">
        
        {/* Title */}
        <h1 className="profile-main-title">Hồ sơ của tôi</h1>

        {/* Layout Grid */}
        <div className="profile-layout-grid">
          
          {/* CỘT TRÁI - SIDEBAR */}
          <aside className="profile-sidebar-column">
            
            {/* Card: Thẻ Hồ sơ nhanh */}
            <div className="profile-card quick-profile-card">
              <h2 className="quick-profile-title">Thẻ Hồ sơ nhanh</h2>
              
              <div className="quick-profile-body">
                <div className="quick-avatar-container" onClick={() => {
                  setTempAvatarUrl(infoForm.avatar);
                  setShowAvatarModal(true);
                }}>
                  <img 
                    src={infoForm.avatar} 
                    alt={infoForm.hoTen} 
                    className="quick-avatar-img"
                    onError={(e) => {
                      e.target.src = 'https://png.pngtree.com/png-vector/20251230/ourlarge/pngtree-cartoon-character-avatar-png-image_18347258.webp';
                    }}
                  />
                  <div className="quick-avatar-hover-overlay">
                    <i className="fa-solid fa-camera"></i>
                  </div>
                </div>

                <h3 className="quick-profile-name">{infoForm.hoTen}</h3>
                <p className="quick-profile-role">{accountForm.vaiTro}</p>

                <div className="quick-status-badge">
                  <span className="status-dot"></span>
                  Đang hoạt động
                </div>
              </div>
            </div>

            {/* Navigation Menu */}
            <div className="profile-card sidebar-nav-card">
              <nav className="profile-vertical-nav">
                <button 
                  className={`nav-menu-item ${activeTab === 'hoso' ? 'active' : ''}`}
                  onClick={() => setActiveTab('hoso')}
                >
                  <i className="fa-regular fa-user menu-icon"></i>
                  <span>Hồ sơ cá nhân</span>
                </button>
                
                <button 
                  className={`nav-menu-item ${activeTab === 'caidat' ? 'active' : ''}`}
                  onClick={() => setActiveTab('caidat')}
                >
                  <i className="fa-solid fa-gear menu-icon"></i>
                  <span>Cài đặt tài khoản</span>
                </button>

                <button 
                  className={`nav-menu-item ${activeTab === 'baomat' ? 'active' : ''}`}
                  onClick={() => setActiveTab('baomat')}
                >
                  <i className="fa-solid fa-shield-halved menu-icon"></i>
                  <span>Mật khẩu & Bảo mật</span>
                </button>

                <button 
                  className={`nav-menu-item ${activeTab === 'thanhtoan' ? 'active' : ''}`}
                  onClick={() => setActiveTab('thanhtoan')}
                >
                  <i className="fa-regular fa-credit-card menu-icon"></i>
                  <span>Phương thức thanh toán</span>
                </button>
              </nav>
            </div>

          </aside>

          {/* CỘT PHẢI - CONTENT AREA */}
          <main className="profile-content-column">
            
            {activeTab === 'hoso' && (
              <>
                {/* THẺ 1: THÔNG TIN CÁ NHÂN */}
                <div className="profile-card content-info-card">
                  <div className="card-header-flex">
                    <h2 className="card-heading-title">Thông tin cá nhân</h2>
                    {!isEditingInfo ? (
                      <button 
                        className="btn-action-edit"
                        onClick={() => setIsEditingInfo(true)}
                      >
                        Chỉnh sửa
                      </button>
                    ) : (
                      <div className="edit-actions-group">
                        <button 
                          className="btn-action-cancel"
                          onClick={() => {
                            // Reset form to actual user state
                            setIsEditingInfo(false);
                            if (user) {
                              setInfoForm({
                                tenDangNhap: user.tenDangNhap || user.username || user.email?.split('@')[0] || 'nv_an_dev',
                                hoTen: user.hoTen || user.name || 'Nguyen Van An',
                                email: user.email || 'an.nv@email.com',
                                soDienThoai: user.soDienThoai || user.phone || '09x-xxxx-xxxx',
                                gioiTinh: user.gioiTinh || 'Nam',
                                diaChi: user.diaChi || 'Quận 1, TP. HCM',
                                avatar: user.avatar || 'https://png.pngtree.com/png-vector/20251230/ourlarge/pngtree-cartoon-character-avatar-png-image_18347258.webp'
                              });
                            }
                          }}
                        >
                          Hủy
                        </button>
                        <button 
                          className="btn-action-save"
                          onClick={handleSaveInfo}
                        >
                          Lưu
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="card-details-rows-container">
                    
                    {/* Row 1: Tên đăng nhập */}
                    <div className="detail-row">
                      <div className="row-label-with-icon">
                        <i className="fa-regular fa-user detail-row-icon"></i>
                        <span>Tên đăng nhập</span>
                      </div>
                      <div className="row-value-field">
                        {isEditingInfo ? (
                          <input 
                            type="text" 
                            name="tenDangNhap"
                            value={infoForm.tenDangNhap}
                            onChange={handleInfoChange}
                            className="profile-inline-input"
                          />
                        ) : (
                          <span className="value-text">{infoForm.tenDangNhap}</span>
                        )}
                      </div>
                    </div>

                    {/* Row 2: Họ và tên */}
                    <div className="detail-row">
                      <div className="row-label-with-icon">
                        <i className="fa-regular fa-id-card detail-row-icon"></i>
                        <span>Họ và tên</span>
                      </div>
                      <div className="row-value-field">
                        {isEditingInfo ? (
                          <input 
                            type="text" 
                            name="hoTen"
                            value={infoForm.hoTen}
                            onChange={handleInfoChange}
                            className="profile-inline-input"
                          />
                        ) : (
                          <span className="value-text highlight-dark">{infoForm.hoTen}</span>
                        )}
                      </div>
                    </div>

                    {/* Row 3: Email */}
                    <div className="detail-row">
                      <div className="row-label-with-icon">
                        <i className="fa-regular fa-envelope detail-row-icon"></i>
                        <span>Email</span>
                      </div>
                      <div className="row-value-field">
                        {isEditingInfo ? (
                          <input 
                            type="email" 
                            name="email"
                            value={infoForm.email}
                            onChange={handleInfoChange}
                            className="profile-inline-input"
                          />
                        ) : (
                          <span className="value-text">{infoForm.email}</span>
                        )}
                      </div>
                    </div>

                    {/* Row 4: Số điện thoại */}
                    <div className="detail-row">
                      <div className="row-label-with-icon">
                        <i className="fa-solid fa-phone detail-row-icon"></i>
                        <span>Số điện thoại</span>
                      </div>
                      <div className="row-value-field">
                        {isEditingInfo ? (
                          <input 
                            type="text" 
                            name="soDienThoai"
                            value={infoForm.soDienThoai}
                            onChange={handleInfoChange}
                            className="profile-inline-input"
                          />
                        ) : (
                          <span className="value-text">{infoForm.soDienThoai}</span>
                        )}
                      </div>
                    </div>

                    {/* Row 5: Giới tính */}
                    <div className="detail-row">
                      <div className="row-label-with-icon">
                        <i className="fa-solid fa-venus-mars detail-row-icon"></i>
                        <span>Giới tính</span>
                      </div>
                      <div className="row-value-field">
                        {isEditingInfo ? (
                          <select 
                            name="gioiTinh"
                            value={infoForm.gioiTinh}
                            onChange={handleInfoChange}
                            className="profile-inline-select"
                          >
                            <option value="Nam">Nam</option>
                            <option value="Nữ">Nữ</option>
                            <option value="Khác">Khác</option>
                          </select>
                        ) : (
                          <span className="value-text">{infoForm.gioiTinh}</span>
                        )}
                      </div>
                    </div>

                    {/* Row 6: Địa chỉ */}
                    <div className="detail-row">
                      <div className="row-label-with-icon">
                        <i className="fa-solid fa-location-dot detail-row-icon"></i>
                        <span>Địa chỉ</span>
                      </div>
                      <div className="row-value-field">
                        {isEditingInfo ? (
                          <input 
                            type="text" 
                            name="diaChi"
                            value={infoForm.diaChi}
                            onChange={handleInfoChange}
                            className="profile-inline-input"
                          />
                        ) : (
                          <span className="value-text">{infoForm.diaChi}</span>
                        )}
                      </div>
                    </div>

                  </div>
                </div>

                {/* THÈ 2: CHI TIẾT TÀI KHOẢN */}
                <div className="profile-card content-details-card">
                  <div className="card-header-flex">
                    <h2 className="card-heading-title">Chi tiết tài khoản</h2>
                    {!isEditingAccount ? (
                      <button 
                        className="btn-action-edit"
                        onClick={() => setIsEditingAccount(true)}
                      >
                        Chỉnh sửa
                      </button>
                    ) : (
                      <div className="edit-actions-group">
                        <button 
                          className="btn-action-cancel"
                          onClick={() => {
                            setIsEditingAccount(false);
                            if (user) {
                              setAccountForm(prev => ({
                                ...prev,
                                vaiTro: user.role === 'NGUOI_THUE' || user.vaiTro === 'NGUOI_THUE' ? 'Người thuê' : 'Freelancer'
                              }));
                            }
                          }}
                        >
                          Hủy
                        </button>
                        <button 
                          className="btn-action-save"
                          onClick={handleSaveAccount}
                        >
                          Lưu
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="card-details-rows-container">
                    
                    {/* Row 1: Vai trò */}
                    <div className="detail-row">
                      <div className="simple-row-label">
                        <span>Vai trò</span>
                      </div>
                      <div className="row-value-field text-left-align">
                        {isEditingAccount ? (
                          <select
                            value={accountForm.vaiTro}
                            onChange={(e) => setAccountForm(prev => ({ ...prev, vaiTro: e.target.value }))}
                            className="profile-inline-select"
                          >
                            <option value="Freelancer">Freelancer</option>
                            <option value="Người thuê">Người thuê (Client)</option>
                          </select>
                        ) : (
                          <span className="value-text highlight-dark">{accountForm.vaiTro}</span>
                        )}
                      </div>
                    </div>

                    {/* Row 2: Ngày tạo */}
                    <div className="detail-row">
                      <div className="simple-row-label">
                        <span>Ngày tạo</span>
                      </div>
                      <div className="row-value-field text-left-align">
                        <span className="value-text">{accountForm.ngayTao}</span>
                      </div>
                    </div>

                    {/* Row 3: Cập nhật lần cuối */}
                    <div className="detail-row">
                      <div className="simple-row-label">
                        <span>Cập nhật lần cuối</span>
                      </div>
                      <div className="row-value-field text-left-align">
                        <span className="value-text">{accountForm.capNhatLanCuoi}</span>
                      </div>
                    </div>

                  </div>
                </div>
              </>
            )}

            {activeTab === 'caidat' && (
              <div className="profile-card tab-content-placeholder-card">
                <i className="fa-solid fa-gear placeholder-large-icon"></i>
                <h3>Cài đặt tài khoản</h3>
                <p>Khu vực tùy chỉnh các thông số chuyên sâu về tài khoản, múi giờ và cấu hình thông báo.</p>
                <button className="btn-placeholder-action">Đi tới Cài đặt</button>
              </div>
            )}

            {activeTab === 'baomat' && (
              <div className="profile-card tab-content-placeholder-card">
                <i className="fa-solid fa-shield-halved placeholder-large-icon"></i>
                <h3>Mật khẩu & Bảo mật</h3>
                <p>Thiết lập mật khẩu mới, xác thực 2 lớp (2FA) và theo dõi các phiên đăng nhập bảo vệ tài khoản.</p>
                <button className="btn-placeholder-action">Thay đổi Mật khẩu</button>
              </div>
            )}

            {activeTab === 'thanhtoan' && (
              <div className="profile-card tab-content-placeholder-card">
                <i className="fa-regular fa-credit-card placeholder-large-icon"></i>
                <h3>Phương thức thanh toán</h3>
                <p>Quản lý tài khoản ngân hàng, ví điện tử liên kết và xem lịch sử giao dịch nạp/rút tiền.</p>
                <button className="btn-placeholder-action">Thêm Phương thức</button>
              </div>
            )}

          </main>

        </div>
      </div>

      {/* AVATAR UPLOAD URL MODAL */}
      {showAvatarModal && (
        <div className="profile-modal-overlay">
          <div className="profile-modal-content">
            <div className="modal-header">
              <h3>Thay đổi ảnh đại diện</h3>
              <button 
                className="btn-modal-close"
                onClick={() => setShowAvatarModal(false)}
              >
                &times;
              </button>
            </div>
            
            <div className="modal-body">
              <p className="modal-desc">Nhập đường dẫn URL ảnh đại diện của bạn dưới đây để cập nhật tức thì:</p>
              <input 
                type="text" 
                placeholder="https://example.com/avatar.jpg" 
                value={tempAvatarUrl}
                onChange={(e) => setTempAvatarUrl(e.target.value)}
                className="modal-url-input"
              />
              
              <div className="modal-avatar-preview">
                <span>Xem trước:</span>
                <img 
                  src={tempAvatarUrl || 'https://png.pngtree.com/png-vector/20251230/ourlarge/pngtree-cartoon-character-avatar-png-image_18347258.webp'} 
                  alt="Preview" 
                  onError={(e) => {
                    e.target.src = 'https://png.pngtree.com/png-vector/20251230/ourlarge/pngtree-cartoon-character-avatar-png-image_18347258.webp';
                  }}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="btn-modal-cancel"
                onClick={() => setShowAvatarModal(false)}
              >
                Hủy
              </button>
              <button 
                className="btn-modal-submit"
                onClick={handleUpdateAvatar}
              >
                Cập nhật
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProfilePage;
