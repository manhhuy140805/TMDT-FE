import { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import './AdminPage.css';

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activeTab === 'reports') {
      fetchReports();
    }
  }, [activeTab]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await api.get('/reports');
      setReports(res.reports);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolveReport = async (reportId, status) => {
    try {
      await api.put(`/reports/${reportId}/resolve`, {
        trangThai: status === 'resolved' ? 'DaXuLy' : 'DangXuLy',
        ghiChu: 'Đã xử lý bởi quản trị viên.'
      });
      alert('Đã cập nhật trạng thái báo cáo!');
      fetchReports();
    } catch (error) {
      alert('Lỗi: ' + error.message);
    }
  };

  return (
    <div className="bw-body" style={{ minHeight: '100vh', display: 'flex' }}>
      <div className="bw-layout">
        <aside className="bw-sidebar">
          <div className="bw-user-profile">
            <img src="/images/avatar_1.png" alt="Admin" className="bw-avatar" />
            <span className="bw-user-name">Admin Panel</span>
          </div>
          
          <nav>
            <ul className="bw-nav-list">
              <li className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>
                <div className="bw-nav-item-inner">
                  <span><i className="fa-solid fa-chart-pie"></i> Tổng quan</span>
                </div>
              </li>
              <li className={activeTab === 'reports' ? 'active' : ''} onClick={() => setActiveTab('reports')}>
                <div className="bw-nav-item-inner">
                  <span><i className="fa-solid fa-triangle-exclamation"></i> Báo cáo vi phạm</span>
                  {reports.filter(r => r.trangThai === 'ChoXuLy').length > 0 && (
                    <span className="bw-badge">{reports.filter(r => r.trangThai === 'ChoXuLy').length}</span>
                  )}
                </div>
              </li>
              <li className={activeTab === 'users' ? 'active' : ''} onClick={() => setActiveTab('users')}>
                <div className="bw-nav-item-inner">
                  <span><i className="fa-solid fa-users"></i> Người dùng</span>
                </div>
              </li>
            </ul>
          </nav>
        </aside>

        <main className="bw-main">
          <header className="bw-topbar">
            <div className="bw-topbar-left">
              <div className="bw-breadcrumbs">
                <span className="text-muted">Trang quản trị</span>
                <span className="bw-slash">/</span>
                <span className="text-dark">
                  {activeTab === 'dashboard' ? 'Tổng quan' : activeTab === 'reports' ? 'Báo cáo vi phạm' : 'Người dùng'}
                </span>
              </div>
            </div>
            <div className="bw-topbar-right">
              <div className="bw-search-box">
                <i className="fa-solid fa-magnifying-glass"></i>
                <input type="text" placeholder="Tìm kiếm..." />
              </div>
            </div>
          </header>

          <div className="bw-content-scroll">
            {activeTab === 'dashboard' && (
              <>
                <div className="bw-metrics-row">
                  <div className="bw-card bw-card-blueish">
                    <div className="bw-card-title">Tổng doanh thu</div>
                    <div className="bw-card-data">
                      <span className="bw-val">128M</span>
                      <span className="bw-trend positive">+12%</span>
                    </div>
                  </div>
                  <div className="bw-card bw-card-cyan">
                    <div className="bw-card-title">Người dùng mới</div>
                    <div className="bw-card-data">
                      <span className="bw-val">450</span>
                      <span className="bw-trend positive">+5%</span>
                    </div>
                  </div>
                  <div className="bw-card bw-card-grayish">
                    <div className="bw-card-title">Hợp đồng hoàn thành</div>
                    <div className="bw-card-data">
                      <span className="bw-val">89</span>
                      <span className="bw-trend negative">-2%</span>
                    </div>
                  </div>
                  <div className="bw-card bw-card-indigo">
                    <div className="bw-card-title">Tỉ lệ hài lòng</div>
                    <div className="bw-card-data">
                      <span className="bw-val">98%</span>
                    </div>
                  </div>
                </div>

                <div className="bw-grid-row-1">
                  <div className="bw-chart-card">
                    <div className="bw-chart-header">
                      <div className="bw-chart-tabs">
                        <span className="active">Thống kê giao dịch</span>
                        <span>Hoạt động</span>
                      </div>
                    </div>
                    <div style={{ height: '200px', background: '#f9fafb', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
                      [Biểu đồ thống kê]
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'reports' && (
              <div className="bw-panel-wrapper">
                <div className="bw-panel-header">
                  <div>
                    <h2 className="bw-panel-title">Danh sách báo cáo vi phạm</h2>
                    <p className="bw-panel-subtitle">Xử lý các khiếu nại và báo cáo từ người dùng.</p>
                  </div>
                </div>

                <div className="bw-table-container">
                  {loading ? <p>Đang tải báo cáo...</p> : (
                    <table className="bw-table">
                      <thead>
                        <tr>
                          <th>Người báo cáo</th>
                          <th>Đối tượng bị báo cáo</th>
                          <th>Lý do</th>
                          <th>Thời gian</th>
                          <th>Trạng thái</th>
                          <th>Hành động</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reports.length > 0 ? reports.map(report => (
                          <tr key={report.baoCaoId}>
                            <td className="font-medium">{report.nguoiBaoCao?.hoTen}</td>
                            <td className="text-danger">{report.doiTuongId} (ID)</td>
                            <td>{report.lyDo}</td>
                            <td className="text-muted">{new Date(report.ngayBaoCao).toLocaleString('vi-VN')}</td>
                            <td>
                              <span className={`status-badge ${report.trangThai === 'ChoXuLy' ? 'b-warn' : 'b-active'}`}>
                                {report.trangThai === 'ChoXuLy' ? 'Chờ xử lý' : 'Đã xử lý'}
                              </span>
                            </td>
                            <td>
                              <div className="table-actions">
                                {report.trangThai === 'ChoXuLy' && (
                                  <>
                                    <button 
                                      className="t-btn btn-recover" 
                                      onClick={() => handleResolveReport(report.baoCaoId, 'resolved')}
                                    >
                                      Giải quyết
                                    </button>
                                    <button className="t-btn btn-ban" title="Khóa tài khoản"><i className="fa-solid fa-user-slash"></i></button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        )) : (
                          <tr><td colSpan="6" className="text-center py-4">Không có báo cáo nào.</td></tr>
                        )}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="bw-panel-wrapper">
                <div className="bw-panel-header">
                  <h2 className="bw-panel-title">Quản lý người dùng</h2>
                </div>
                <p className="text-muted">Tính năng đang được phát triển...</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminPage;
