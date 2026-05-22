import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../utils/api';
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
  const [user, setUser] = useState(null);
  const [quoteForm, setQuoteForm] = useState({
    amount: '',
    duration: '',
    description: ''
  });

  // Lấy và chuẩn hóa thông tin user từ localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser) {
          let role = "FREELANCER";
          const r = parsedUser.role || parsedUser.vaiTro || "";
          const norm = r.toUpperCase().replace(/_/g, "");
          if (norm === "NGUOITHUE" || norm === "CLIENT") {
            role = "NGUOI_THUE";
          } else if (norm === "ADMIN") {
            role = "ADMIN";
          }

          const normalizedUser = {
            ...parsedUser,
            id: parsedUser.taiKhoanId || parsedUser.id,
            name: parsedUser.hoTen || parsedUser.name,
            role: role,
          };
          setUser(normalizedUser);
          console.log("Current user (normalized):", normalizedUser);
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  // Kiểm tra xem user hiện tại có phải là chủ yêu cầu không
  const isOwner = request && user && request.employer.id === user.id;

  useEffect(() => {
    fetchRequestDetail();
    fetchQuotes();
  }, [id]);

  const fetchRequestDetail = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/jobs/${id}`);
      if (response && response.job) {
        const job = response.job;
        const minBudget = job.nganSachMin ? Number(job.nganSachMin).toLocaleString('vi-VN') : '0';
        const maxBudget = job.nganSachMax ? Number(job.nganSachMax).toLocaleString('vi-VN') : '0';
        
        // Định dạng thời hạn
        const submissionDeadline = job.thoiHan ? new Date(job.thoiHan).toLocaleDateString('vi-VN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }) : 'Thỏa thuận';

        // Lấy thông tin hợp đồng để check xem đã chốt freelancer chưa
        let selectedQuoteId = null;
        let selectedFreelancerId = null;
        try {
          const contractsRes = await api.get('/contracts');
          const contracts = contractsRes.contracts || [];
          const contract = contracts.find(c => c.yeuCauId === job.yeuCauId);
          if (contract) {
            selectedFreelancerId = contract.freelancerId;
            selectedQuoteId = contract.congViecId;
          }
        } catch (ce) {
          console.error("Error fetching contracts:", ce);
        }

        const normalizedRequest = {
          id: job.yeuCauId,
          title: job.tieuDe,
          description: job.moTa,
          category: job.loaiDichVu?.tenLoai || 'Khác',
          bids: job.soLuongBaoGia || 0,
          budget: `${minBudget} - ${maxBudget} VNĐ`,
          status: job.trangThai,
          postedTime: job.ngayTao ? new Date(job.ngayTao).toLocaleDateString('vi-VN') : '',
          location: 'Toàn quốc',
          skills: (job.kyNangs || []).map(k => k.tenKyNang),
          attachments: [],
          deadline: submissionDeadline,
          submissionDeadlineDate: job.thoiHan,
          selectedFreelancerId,
          selectedQuoteId,
          employer: {
            id: job.nguoiThue?.taiKhoanId,
            name: job.nguoiThue?.hoTen || 'Khách hàng',
            avatar: 'https://png.pngtree.com/png-vector/20191101/ourmid/pngtree-cartoon-color-simple-male-avatar-png-image_1934459.jpg',
            rating: 5.0
          }
        };
        setRequest(normalizedRequest);
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
      const response = await api.get(`/jobs/${id}/proposals`);
      if (response && response.proposals) {
        const mapped = response.proposals.map((p) => {
          let skillsList = [];
          if (p.freelancer?.kyNangs && p.freelancer.kyNangs.length > 0) {
            skillsList = p.freelancer.kyNangs.map(k => k.tenKyNang);
          } else if (p.freelancer?.kyNang) {
            skillsList = p.freelancer.kyNang.split(',').map(s => s.trim()).filter(Boolean);
          }

          return {
            id: p.baoGiaId,
            freelancerId: p.freelancerId,
            amount: Number(p.giaDeXuat),
            duration: `${p.thoiGianThucHien} ngày`,
            description: p.noiDung || '',
            status: p.trangThai === 'DuocChon' ? 'DA_CHAP_NHAN' : p.trangThai,
            submittedTime: p.ngayTao ? new Date(p.ngayTao).toLocaleDateString('vi-VN') : '',
            freelancer: {
              id: p.freelancerId,
              name: p.freelancer?.hoTen || 'Freelancer',
              avatar: 'https://png.pngtree.com/png-vector/20191101/ourmid/pngtree-cartoon-color-simple-male-avatar-png-image_1934459.jpg',
              rating: p.freelancer?.xepHang ? Number(p.freelancer.xepHang) : 5.0,
              verified: true,
              skills: skillsList
            }
          };
        });
        setQuotes(mapped);
      }
    } catch (error) {
      console.error('Error fetching quotes:', error);
    }
  };

  const handleSubmitQuote = async (e) => {
    e.preventDefault();
    
    if (!user) {
      alert('Vui lòng đăng nhập để gửi báo giá!');
      navigate('/login');
      return;
    }
    
    try {
      // Tìm freelancerId của user này từ endpoint profile
      let freelancerId = user.freelancerId;
      if (!freelancerId) {
        const profileRes = await api.get(`/users/${user.id}/profile`);
        if (profileRes && profileRes.profile && profileRes.profile.freelancer) {
          freelancerId = profileRes.profile.freelancer.freelancerId;
        }
      }

      if (!freelancerId) {
        alert('Tài khoản của bạn chưa được kích hoạt vai trò Freelancer!');
        return;
      }

      const durationNum = parseInt(quoteForm.duration.replace(/\D/g, '')) || 7;

      console.log('Submitting quote...');
      const response = await api.post('/proposals', {
        yeuCauId: parseInt(id),
        freelancerId: freelancerId,
        giaDeXuat: parseInt(quoteForm.amount),
        thoiGianThucHien: durationNum,
        noiDung: quoteForm.description
      });
      
      console.log('Quote response:', response);
      
      alert('Gửi báo giá thành công!');
      setShowQuoteModal(false);
      setQuoteForm({ amount: '', duration: '', description: '' });
      await fetchQuotes();
      await fetchRequestDetail();
    } catch (error) {
      console.error('Error submitting quote:', error);
      alert('Có lỗi xảy ra hoặc bạn đã gửi báo giá cho yêu cầu này rồi!');
    }
  };

  const handleAcceptQuote = (quote) => {
    setSelectedQuote(quote);
    setShowAcceptModal(true);
  };

  const confirmAcceptQuote = async () => {
    if (!selectedQuote) return;

    try {
      let nguoiThueId = user.nguoiThueId;
      if (!nguoiThueId) {
        const profileRes = await api.get(`/users/${user.id}/profile`);
        if (profileRes && profileRes.profile && profileRes.profile.nguoiThue) {
          nguoiThueId = profileRes.profile.nguoiThue.nguoiThueId;
        }
      }

      // 1. Cập nhật trạng thái báo giá thành 'DuocChon'
      await api.put(`/proposals/${selectedQuote.id}`, {
        trangThai: 'DuocChon'
      });

      // 2. Cập nhật trạng thái dự án/yêu cầu thành 'DaDong'
      await api.put(`/jobs/${id}`, {
        trangThai: 'DaDong'
      });

      // 3. Tạo hợp đồng/công việc mới
      const durationNum = parseInt(selectedQuote.duration.replace(/\D/g, '')) || 7;
      await api.post('/contracts', {
        yeuCauId: parseInt(id),
        freelancerId: selectedQuote.freelancerId,
        nguoiThueId: nguoiThueId || 1,
        giaThoa: selectedQuote.amount,
        thoiGianThoa: durationNum
      });

      alert('Đã chấp nhận báo giá thành công!');
      setShowAcceptModal(false);
      setSelectedQuote(null);
      await fetchQuotes();
      await fetchRequestDetail();
    } catch (error) {
      console.error('Error accepting quote:', error);
      alert('Có lỗi xảy ra khi chấp nhận báo giá. Vui lòng thử lại!');
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
