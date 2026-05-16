import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './MyQuotesPage.css';

const MyQuotesPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [quotes, setQuotes] = useState([]);
  const [filter, setFilter] = useState('all');
  const [currentUser, setCurrentUser] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [quoteToDelete, setQuoteToDelete] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setCurrentUser(user);
        fetchMyQuotes(user.id);
      } catch (error) {
        console.error('Error parsing user data:', error);
        navigate('/login');
      }
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const fetchMyQuotes = async (userId) => {
    setLoading(true);
    try {
      // Get all quotes from localStorage
      const storedQuotes = JSON.parse(localStorage.getItem('mock_quotes') || '{}');
      const allQuotes = Object.values(storedQuotes).filter(
        quote => quote.freelancerId === userId
      );
      
      // Fetch request details for each quote
      const quotesWithRequests = await Promise.all(
        allQuotes.map(async (quote) => {
          try {
            const response = await api.requests.getById(quote.requestId);
            return {
              ...quote,
              request: response.success ? response.data : null
            };
          } catch (error) {
            console.error('Error fetching request:', error);
            return { ...quote, request: null };
          }
        })
      );
      
      setQuotes(quotesWithRequests);
    } catch (error) {
      console.error('Error fetching quotes:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredQuotes = () => {
    if (filter === 'all') return quotes;
    if (filter === 'pending') {
      return quotes.filter(q => q.status === 'DA_GUI');
    }
    if (filter === 'accepted') {
      return quotes.filter(q => q.status === 'DA_CHAP_NHAN');
    }
    if (filter === 'rejected') {
      return quotes.filter(q => q.status === 'BI_TU_CHOI');
    }
    return quotes;
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'DA_GUI': { text: 'Đã gửi', class: 'status-pending' },
      'DA_CHAP_NHAN': { text: 'Đã chấp nhận', class: 'status-accepted' },
      'BI_TU_CHOI': { text: 'Bị từ chối', class: 'status-rejected' }
    };
    const statusInfo = statusMap[status] || { text: status, class: '' };
    return <span className={`status-badge ${statusInfo.class}`}>{statusInfo.text}</span>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  const formatCurrency = (amount) => {
    if (!amount) return '0 VNĐ';
    return new Intl.NumberFormat('vi-VN').format(amount) + ' VNĐ';
  };

  const handleEditQuote = (quoteId) => {
    navigate(`/quotes/${quoteId}/edit`);
  };

  const handleDeleteQuote = async () => {
    if (!quoteToDelete) return;
    
    try {
      const response = await api.quotes.delete(quoteToDelete);
      if (response.success) {
        setQuotes(prev => prev.filter(q => q.id !== quoteToDelete));
        alert('Xóa báo giá thành công!');
      } else {
        alert('Có lỗi xảy ra khi xóa báo giá!');
      }
    } catch (error) {
      console.error('Error deleting quote:', error);
      alert('Có lỗi xảy ra khi xóa báo giá!');
    }
    
    setShowDeleteModal(false);
    setQuoteToDelete(null);
  };

  const openDeleteModal = (quoteId) => {
    setQuoteToDelete(quoteId);
    setShowDeleteModal(true);
  };

  const filteredQuotes = getFilteredQuotes();

  if (loading) {
    return (
      <div className="loading-state">
        <i className="fa-solid fa-circle-notch fa-spin"></i>
        <p>Đang tải danh sách báo giá...</p>
      </div>
    );
  }

  return (
    <div className="my-quotes-page" style={{background: '#F8FAFC'}}>
      {/* Hero Banner */}
      <div className="d-hero" style={{paddingBottom: '60px', marginBottom: '40px'}}>
        <div className="d-hero-content" style={{textAlign: 'center'}}>
          <h1 className="d-title">Báo giá của tôi</h1>
          <p className="d-meta" style={{justifyContent: 'center', maxWidth: '600px', margin: '16px auto 0'}}>
            Theo dõi và quản lý tất cả các báo giá bạn đã gửi
          </p>
        </div>
      </div>

      <div className="page-container" style={{maxWidth: '1200px', margin: '0 auto', padding: '0 20px'}}>
        <div className="my-quotes-layout">
          {/* Main Content */}
          <main className="quotes-main">
            {/* Stats Cards */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon" style={{background: '#EFF6FF', color: '#0EA5E9'}}>
                  <i className="fa-solid fa-file-invoice"></i>
                </div>
                <div className="stat-info">
                  <div className="stat-value">{quotes.length}</div>
                  <div className="stat-label">Tổng báo giá</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{background: '#FEF3C7', color: '#D97706'}}>
                  <i className="fa-solid fa-clock"></i>
                </div>
                <div className="stat-info">
                  <div className="stat-value">
                    {quotes.filter(q => q.status === 'DA_GUI').length}
                  </div>
                  <div className="stat-label">Đang chờ</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{background: '#F0FDF4', color: '#16A34A'}}>
                  <i className="fa-solid fa-check-circle"></i>
                </div>
                <div className="stat-info">
                  <div className="stat-value">
                    {quotes.filter(q => q.status === 'DA_CHAP_NHAN').length}
                  </div>
                  <div className="stat-label">Đã chấp nhận</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{background: '#FEE2E2', color: '#DC2626'}}>
                  <i className="fa-solid fa-times-circle"></i>
                </div>
                <div className="stat-info">
                  <div className="stat-value">
                    {quotes.filter(q => q.status === 'BI_TU_CHOI').length}
                  </div>
                  <div className="stat-label">Bị từ chối</div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="filters-bar">
              <button
                className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                Tất cả ({quotes.length})
              </button>
              <button
                className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
                onClick={() => setFilter('pending')}
              >
                Đang chờ ({quotes.filter(q => q.status === 'DA_GUI').length})
              </button>
              <button
                className={`filter-btn ${filter === 'accepted' ? 'active' : ''}`}
                onClick={() => setFilter('accepted')}
              >
                Đã chấp nhận ({quotes.filter(q => q.status === 'DA_CHAP_NHAN').length})
              </button>
              <button
                className={`filter-btn ${filter === 'rejected' ? 'active' : ''}`}
                onClick={() => setFilter('rejected')}
              >
                Bị từ chối ({quotes.filter(q => q.status === 'BI_TU_CHOI').length})
              </button>
            </div>

            {/* Quotes List */}
            <div className="quotes-list">
              {filteredQuotes.length === 0 ? (
                <div className="empty-state">
                  <i className="fa-regular fa-folder-open"></i>
                  <h3>Chưa có báo giá nào</h3>
                  <p>Bắt đầu bằng cách tìm kiếm và gửi báo giá cho các yêu cầu phù hợp</p>
                  <Link to="/requests" className="btn-create-first">
                    <i className="fa-solid fa-search"></i>
                    Tìm kiếm yêu cầu
                  </Link>
                </div>
              ) : (
                filteredQuotes.map(quote => (
                  <div key={quote.id} className="quote-card">
                    <div className="quote-header">
                      <div className="quote-title-section">
                        {quote.request ? (
                          <Link to={`/requests/${quote.requestId}`} className="quote-title">
                            {quote.request.title}
                          </Link>
                        ) : (
                          <span className="quote-title">[Yêu cầu đã bị xóa]</span>
                        )}
                        {getStatusBadge(quote.status)}
                      </div>
                      <div className="quote-actions">
                        <button 
                          className="btn-icon" 
                          title="Chỉnh sửa"
                          onClick={() => handleEditQuote(quote.id)}
                          disabled={quote.status !== 'DA_GUI'}
                        >
                          <i className="fa-solid fa-pen"></i>
                        </button>
                        <button 
                          className="btn-icon" 
                          title="Xóa"
                          onClick={() => openDeleteModal(quote.id)}
                        >
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      </div>
                    </div>

                    {quote.request && (
                      <div className="quote-meta">
                        <span className="meta-item">
                          <i className="fa-solid fa-tag"></i>
                          {quote.request.category}
                        </span>
                        <span className="meta-item">
                          <i className="fa-solid fa-location-dot"></i>
                          {quote.request.location}
                        </span>
                        <span className="meta-item">
                          <i className="fa-solid fa-calendar"></i>
                          Gửi {quote.submittedTime}
                        </span>
                      </div>
                    )}

                    <p className="quote-description">
                      {quote.description}
                    </p>

                    {/* Quote Info Grid */}
                    <div className="quote-info-grid">
                      <div className="info-item">
                        <i className="fa-solid fa-money-bill-wave"></i>
                        <div>
                          <div className="info-label">Giá đề xuất</div>
                          <div className="info-value">{formatCurrency(quote.amount)}</div>
                        </div>
                      </div>
                      <div className="info-item">
                        <i className="fa-regular fa-clock"></i>
                        <div>
                          <div className="info-label">Thời gian hoàn thành</div>
                          <div className="info-value">{quote.duration}</div>
                        </div>
                      </div>
                      <div className="info-item">
                        <i className="fa-regular fa-calendar"></i>
                        <div>
                          <div className="info-label">Ngày gửi</div>
                          <div className="info-value">
                            {formatDate(quote.submittedDate)}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="quote-footer">
                      {quote.request && (
                        <div className="quote-stats">
                          <span className="stat-item">
                            <i className="fa-solid fa-users"></i>
                            <strong>{quote.request.bids}</strong> báo giá
                          </span>
                        </div>
                      )}
                      {quote.request && (
                        <Link to={`/requests/${quote.requestId}`} className="btn-view-detail">
                          Xem yêu cầu
                          <i className="fa-solid fa-arrow-right"></i>
                        </Link>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </main>

          {/* Sidebar */}
          <aside className="quotes-sidebar">
            <div className="sidebar-card">
              <Link to="/requests" className="btn-create-quote-full">
                <i className="fa-solid fa-search"></i>
                Tìm kiếm yêu cầu
              </Link>
            </div>

            <div className="sidebar-card">
              <h3 className="sidebar-title">
                <i className="fa-solid fa-lightbulb" style={{color: '#F59E0B'}}></i>
                Mẹo gửi báo giá hiệu quả
              </h3>
              <ul className="check-list">
                <li>
                  <i className="fa-solid fa-circle-check"></i>
                  <b>Giá cạnh tranh:</b> Nghiên cứu giá thị trường trước khi đưa ra mức giá
                </li>
                <li>
                  <i className="fa-solid fa-circle-check"></i>
                  <b>Mô tả chi tiết:</b> Giải thích rõ cách bạn sẽ thực hiện dự án
                </li>
                <li>
                  <i className="fa-solid fa-circle-check"></i>
                  <b>Thời gian thực tế:</b> Đưa ra timeline khả thi, tránh hứa quá nhiều
                </li>
              </ul>
            </div>

            <div className="sidebar-card" style={{background: '#EFF6FF', borderColor: '#0EA5E9'}}>
              <h3 className="sidebar-title" style={{color: '#1E3A8A'}}>
                <i className="fa-solid fa-star" style={{color: '#0EA5E9', fontSize: '24px'}}></i>
                Tăng tỷ lệ trúng thầu
              </h3>
              <p style={{color: '#1E40AF', fontSize: '14px', lineHeight: '1.6', margin: 0}}>
                Hoàn thiện profile, thêm portfolio và nhận đánh giá tốt từ khách hàng để tăng uy tín.
              </p>
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
                Hủy bỏ
              </button>
              <button
                className="btn-danger"
                onClick={handleDeleteQuote}
              >
                <i className="fa-solid fa-trash"></i>
                Xóa báo giá
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyQuotesPage;
