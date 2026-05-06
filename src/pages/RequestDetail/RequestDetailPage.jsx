import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import RequestHero from './components/RequestHero';
import RequestInfo from './components/RequestInfo';
import ActionCard from './components/ActionCard';
import ClientCard from './components/ClientCard';
import ShareCard from './components/ShareCard';
import BidsSection from './components/BidsSection';
import QuoteModal from './components/QuoteModal';
import './RequestDetailPage.css';

const RequestDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [request, setRequest] = useState(null);
  const [quotes, setQuotes] = useState([]);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [quoteForm, setQuoteForm] = useState({
    amount: '',
    duration: '',
    description: ''
  });

  // Lấy thông tin user hiện tại từ localStorage
  const getCurrentUser = () => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch (error) {
        console.error('Error parsing user data:', error);
        return null;
      }
    }
    return null;
  };

  const currentUser = getCurrentUser();

  // Kiểm tra xem user hiện tại có phải là chủ yêu cầu không
  const isOwner = request && currentUser && request.employer.id === currentUser.id;

  useEffect(() => {
    fetchRequestDetail();
    fetchQuotes();
  }, [id]);

  const fetchRequestDetail = async () => {
    setLoading(true);
    try {
      const response = await api.requests.getById(id);
      if (response.success) {
        setRequest(response.data);
      } else {
        navigate('/requests');
      }
    } catch (error) {
      console.error('Error fetching request:', error);
      navigate('/requests');
    } finally {
      setLoading(false);
    }
  };

  const fetchQuotes = async () => {
    try {
      const response = await api.quotes.getByRequestId(id);
      if (response.success) {
        setQuotes(response.data);
      }
    } catch (error) {
      console.error('Error fetching quotes:', error);
    }
  };

  const handleSubmitQuote = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      alert('Vui lòng đăng nhập để gửi báo giá!');
      navigate('/login');
      return;
    }
    
    try {
      const quoteData = {
        requestId: parseInt(id),
        amount: parseInt(quoteForm.amount),
        duration: quoteForm.duration,
        description: quoteForm.description,
        freelancerId: currentUser.id,
        freelancer: {
          id: currentUser.id,
          name: currentUser.name,
          avatar: currentUser.avatar,
          rating: currentUser.rating || 0,
          completedProjects: currentUser.completedProjects || 0,
          skills: currentUser.skills || []
        }
      };
      
      console.log('Submitting quote:', quoteData);
      
      const response = await api.quotes.create(quoteData);
      
      console.log('Quote response:', response);
      
      if (response.success) {
        alert('Gửi báo giá thành công!');
        setShowQuoteModal(false);
        setQuoteForm({ amount: '', duration: '', description: '' });
        // Refresh both quotes and request to update bids count
        await fetchQuotes();
        await fetchRequestDetail();
      }
    } catch (error) {
      console.error('Error submitting quote:', error);
      alert('Có lỗi xảy ra. Vui lòng thử lại!');
    }
  };

  const handleAcceptQuote = (quote) => {
    setSelectedQuote(quote);
    setShowAcceptModal(true);
  };

  const confirmAcceptQuote = async () => {
    if (!selectedQuote) return;

    try {
      // Update quote status to accepted
      const quoteResponse = await api.quotes.update(selectedQuote.id, {
        status: 'DA_CHAP_NHAN',
        statusText: 'Đã chấp nhận'
      });

      // Update request status
      const requestResponse = await api.requests.update(id, {
        status: 'DA_CHON_BAO_GIA',
        statusText: 'Đã chọn báo giá',
        selectedFreelancerId: selectedQuote.freelancerId,
        selectedQuoteId: selectedQuote.id
      });

      if (quoteResponse.success && requestResponse.success) {
        alert('Đã chấp nhận báo giá thành công!');
        setShowAcceptModal(false);
        setSelectedQuote(null);
        // Refresh data
        await fetchQuotes();
        await fetchRequestDetail();
      } else {
        alert('Có lỗi xảy ra. Vui lòng thử lại!');
      }
    } catch (error) {
      console.error('Error accepting quote:', error);
      alert('Có lỗi xảy ra. Vui lòng thử lại!');
    }
  };

  if (loading) {
    return (
      <div className="loading-state">
        <i className="fa-solid fa-circle-notch"></i>
        <p>Đang tải thông tin yêu cầu...</p>
      </div>
    );
  }

  if (!request) {
    return null;
  }

  return (
    <>
      <RequestHero request={request} onNavigate={navigate} />

      <div className="d-layout">
        <div className="d-main">
          <RequestInfo request={request} />
        </div>

        <div className="d-sidebar">
          <ActionCard 
            request={request} 
            onSubmitQuote={() => setShowQuoteModal(true)}
            isOwner={isOwner}
          />
          <ClientCard 
            employer={request.employer} 
            location={request.location} 
          />
          <ShareCard />
        </div>
      </div>

      <BidsSection quotes={quotes} isOwner={isOwner} onAcceptQuote={handleAcceptQuote} />

      <QuoteModal
        show={showQuoteModal}
        onClose={() => setShowQuoteModal(false)}
        onSubmit={handleSubmitQuote}
        formData={quoteForm}
        onChange={setQuoteForm}
      />

      {/* Accept Quote Modal */}
      {showAcceptModal && selectedQuote && (
        <div className="modal-overlay" onClick={() => setShowAcceptModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{maxWidth: '600px'}}>
            <div className="modal-header">
              <h3>
                <i className="fa-solid fa-check-circle" style={{color: '#16A34A', marginRight: '12px'}}></i>
                Xác nhận chấp nhận báo giá
              </h3>
              <button className="modal-close" onClick={() => setShowAcceptModal(false)}>
                <i className="fa-solid fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div style={{background: '#F0FDF4', padding: '20px', borderRadius: '12px', border: '1px solid #BBF7D0', marginBottom: '20px'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px'}}>
                  <img 
                    src={selectedQuote.freelancer.avatar || 'https://png.pngtree.com/png-vector/20191101/ourmid/pngtree-cartoon-color-simple-male-avatar-png-image_1934459.jpg'}
                    alt={selectedQuote.freelancer.name}
                    style={{width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover'}}
                  />
                  <div>
                    <h4 style={{margin: '0 0 4px 0', fontSize: '18px', color: '#064E3B'}}>
                      {selectedQuote.freelancer.name}
                    </h4>
                    <div style={{display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#059669'}}>
                      <i className="fa-solid fa-star"></i>
                      <span>{selectedQuote.freelancer.rating || 0} / 5.0</span>
                    </div>
                  </div>
                </div>
                
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px'}}>
                  <div>
                    <div style={{fontSize: '13px', color: '#059669', marginBottom: '4px'}}>Giá đề xuất</div>
                    <div style={{fontSize: '18px', fontWeight: '700', color: '#064E3B'}}>
                      {selectedQuote.amount.toLocaleString('vi-VN')} VNĐ
                    </div>
                  </div>
                  <div>
                    <div style={{fontSize: '13px', color: '#059669', marginBottom: '4px'}}>Thời gian</div>
                    <div style={{fontSize: '18px', fontWeight: '700', color: '#064E3B'}}>
                      {selectedQuote.duration}
                    </div>
                  </div>
                </div>
              </div>

              <p style={{fontSize: '15px', lineHeight: '1.6', color: '#475569', marginBottom: '16px'}}>
                Bạn có chắc chắn muốn chấp nhận báo giá này không? Sau khi chấp nhận:
              </p>
              
              <ul style={{fontSize: '14px', lineHeight: '1.8', color: '#475569', paddingLeft: '20px', marginBottom: '16px'}}>
                <li>Freelancer sẽ được thông báo và bắt đầu làm việc</li>
                <li>Các báo giá khác sẽ bị từ chối tự động</li>
                <li>Trạng thái yêu cầu sẽ chuyển sang "Đã chọn báo giá"</li>
                <li>Bạn có thể theo dõi tiến độ công việc</li>
              </ul>

              <div style={{background: '#FEF3C7', padding: '16px', borderRadius: '8px', border: '1px solid #FDE68A'}}>
                <p style={{fontSize: '14px', color: '#92400E', margin: 0, lineHeight: '1.6'}}>
                  <i className="fa-solid fa-info-circle" style={{marginRight: '8px'}}></i>
                  <b>Lưu ý:</b> Hãy đảm bảo bạn đã trao đổi kỹ với freelancer trước khi chấp nhận.
                </p>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => setShowAcceptModal(false)}
                style={{padding: '12px 24px', borderRadius: '10px', fontWeight: '600', fontSize: '14px', background: '#F1F5F9', color: '#475569', border: 'none', cursor: 'pointer'}}
              >
                Hủy bỏ
              </button>
              <button
                className="btn-accept"
                onClick={confirmAcceptQuote}
                style={{padding: '12px 24px', borderRadius: '10px', fontWeight: '600', fontSize: '14px', background: '#16A34A', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'}}
              >
                <i className="fa-solid fa-check"></i>
                Xác nhận chấp nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RequestDetailPage;
