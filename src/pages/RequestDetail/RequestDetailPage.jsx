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

      <BidsSection quotes={quotes} isOwner={isOwner} />

      <QuoteModal
        show={showQuoteModal}
        onClose={() => setShowQuoteModal(false)}
        onSubmit={handleSubmitQuote}
        formData={quoteForm}
        onChange={setQuoteForm}
      />
    </>
  );
};

export default RequestDetailPage;
