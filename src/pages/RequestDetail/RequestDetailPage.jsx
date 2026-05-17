import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { getUserRole, isFreelancerRole } from "../../utils/role";
import RequestHero from "./components/RequestHero";
import RequestInfo from "./components/RequestInfo";
import ActionCard from "./components/ActionCard";
import ClientCard from "./components/ClientCard";
import BidsSection from "./components/BidsSection";
import QuoteModal from "./components/QuoteModal";
import AcceptQuoteModal from "./components/AcceptQuoteModal";
import "./RequestDetailPage.css";

const RequestDetailPage = () => {
  // ============ Router & Navigation ============
  const { id } = useParams();
  const navigate = useNavigate();

  // ============ State Management ============
  const [loading, setLoading] = useState(true);
  const [request, setRequest] = useState(null);
  const [quotes, setQuotes] = useState([]);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [quoteForm, setQuoteForm] = useState({
    amount: "",
    duration: "",
    description: "",
  });

  // ============ Helper Functions ============
  const getCurrentUser = () => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch (error) {
        console.error("Error parsing user data:", error);
        return null;
      }
    }
    return null;
  };

  // ============ User & Permissions ============
  const currentUser = getCurrentUser();
  const userRole = getUserRole(currentUser);
  const isFreelancer = isFreelancerRole(userRole);
  const canSubmitQuote = !currentUser || isFreelancer;
  const isOwner =
    request &&
    currentUser &&
    request.employer &&
    request.employer.id === currentUser.id;

  // ============ API Calls ============
  const fetchRequestDetail = async () => {
    setLoading(true);
    try {
      const response = await api.requests.getById(id);

      if (response.success && response.data) {
        setRequest(response.data);
      } else {
        console.error("Failed to fetch request:", response.message);
        alert("Không tìm thấy yêu cầu này!");
        navigate("/requests");
      }
    } catch (error) {
      console.error("ERROR fetching request:", error);
      alert("Có lỗi xảy ra khi tải thông tin yêu cầu!");
      navigate("/requests");
    } finally {
      setLoading(false);
    }
  };

  const fetchQuotes = async () => {
    try {
      const response = await api.quotes.getByRequestId(id);

      if (response.success) {
        setQuotes(response.data || []);
      }
    } catch (error) {
      console.error("Error fetching quotes:", error);
    }
  };

  // ============ Lifecycle ============
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchRequestDetail();
    fetchQuotes();
  }, [id]);

  // ============ Event Handlers ============
  const handleSubmitQuote = async (e) => {
    e.preventDefault();

    if (!currentUser) {
      alert("Vui lòng đăng nhập để gửi báo giá!");
      navigate("/login");
      return;
    }

    if (!quoteForm.amount || !quoteForm.duration || !quoteForm.description) {
      alert("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    try {
      const quoteData = {
        requestId: parseInt(id),
        freelancerId: currentUser.id,
        amount: parseInt(quoteForm.amount),
        duration: quoteForm.duration,
        description: quoteForm.description,
      };

      const response = await api.quotes.create(quoteData);

      if (response.success) {
        alert("Gửi báo giá thành công!");
        setShowQuoteModal(false);
        setQuoteForm({ amount: "", duration: "", description: "" });
        await fetchQuotes();
        await fetchRequestDetail();
      } else {
        alert(response.message || "Có lỗi xảy ra. Vui lòng thử lại!");
      }
    } catch (error) {
      console.error("Error submitting quote:", error);
      alert("Có lỗi xảy ra. Vui lòng thử lại!");
    }
  };

  const handleAcceptQuote = (quote) => {
    setSelectedQuote(quote);
    setShowAcceptModal(true);
  };

  const confirmAcceptQuote = async () => {
    if (!selectedQuote) return;

    try {
      const quoteResponse = await api.quotes.update(selectedQuote.id, {
        status: "DA_CHAP_NHAN",
      });

      const requestResponse = await api.requests.update(id, {
        status: "DA_CHON_BAO_GIA",
      });

      if (quoteResponse.success && requestResponse.success) {
        alert("Đã chấp nhận báo giá thành công!");
        setShowAcceptModal(false);
        setSelectedQuote(null);
        await fetchQuotes();
        await fetchRequestDetail();
      } else {
        alert("Có lỗi xảy ra. Vui lòng thử lại!");
      }
    } catch (error) {
      console.error("Error accepting quote:", error);
      alert("Có lỗi xảy ra. Vui lòng thử lại!");
    }
  };

  if (loading) {
    return (
      <div className="loading-state">
        <i className="fa-solid fa-circle-notch fa-spin"></i>
        <p>Đang tải thông tin yêu cầu...</p>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="loading-state">
        <i className="fa-solid fa-exclamation-circle error-icon"></i>
        <p>Không tìm thấy yêu cầu này!</p>
        <button onClick={() => navigate("/requests")} className="btn-back-home">
          Quay lại danh sách
        </button>
      </div>
    );
  }

  // ============ Main Render ============
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
            canSubmitQuote={canSubmitQuote}
          />
          <ClientCard employer={request.employer} location={request.location} />
        </div>
      </div>

      <BidsSection
        quotes={quotes}
        isOwner={isOwner}
        onAcceptQuote={handleAcceptQuote}
      />

      {/* Modals */}
      <QuoteModal
        show={showQuoteModal}
        onClose={() => setShowQuoteModal(false)}
        onSubmit={handleSubmitQuote}
        formData={quoteForm}
        onChange={setQuoteForm}
      />

      <AcceptQuoteModal
        show={showAcceptModal}
        selectedQuote={selectedQuote}
        onClose={() => setShowAcceptModal(false)}
        onConfirm={confirmAcceptQuote}
      />
    </>
  );
};

export default RequestDetailPage;
