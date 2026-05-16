import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './ProgressPage.css';

const ProgressPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [request, setRequest] = useState(null);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [progress, setProgress] = useState(0);
  const [milestones, setMilestones] = useState([]);
  const [showAddMilestone, setShowAddMilestone] = useState(false);
  const [newMilestone, setNewMilestone] = useState({
    title: '',
    description: ''
  });

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

  useEffect(() => {
    fetchProgressData();
  }, [id]);

  const fetchProgressData = async () => {
    setLoading(true);
    try {
      // Get request details
      const requestResponse = await api.requests.getById(id);
      if (!requestResponse.success) {
        alert('Không tìm thấy yêu cầu!');
        navigate('/my-requests');
        return;
      }

      const requestData = requestResponse.data;
      
      // Check if request has selected freelancer
      if (!requestData.selectedQuoteId) {
        alert('Yêu cầu này chưa chọn freelancer!');
        navigate(`/requests/${id}`);
        return;
      }

      // Get selected quote details
      const quotesResponse = await api.quotes.getByRequestId(id);
      if (quotesResponse.success) {
        const quote = quotesResponse.data.find(q => q.id === requestData.selectedQuoteId);
        setSelectedQuote(quote);
      }

      setRequest(requestData);
      
      // Load progress and milestones from localStorage
      const progressKey = `progress_${id}`;
      const milestonesKey = `milestones_${id}`;
      
      const savedProgress = localStorage.getItem(progressKey);
      const savedMilestones = localStorage.getItem(milestonesKey);
      
      if (savedProgress) {
        setProgress(parseInt(savedProgress));
      }
      
      if (savedMilestones) {
        setMilestones(JSON.parse(savedMilestones));
      }
      
    } catch (error) {
      console.error('Error fetching progress data:', error);
      alert('Có lỗi xảy ra!');
      navigate('/my-requests');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProgress = (e) => {
    const newProgress = parseInt(e.target.value);
    setProgress(newProgress);
    localStorage.setItem(`progress_${id}`, newProgress.toString());
  };

  const handleAddMilestone = () => {
    if (!newMilestone.title.trim()) {
      alert('Vui lòng nhập tiêu đề!');
      return;
    }

    const milestone = {
      id: Date.now(),
      title: newMilestone.title,
      description: newMilestone.description,
      date: new Date().toLocaleDateString('vi-VN'),
      status: 'current',
      createdBy: currentUser?.name || 'Unknown'
    };

    const updatedMilestones = [milestone, ...milestones];
    setMilestones(updatedMilestones);
    localStorage.setItem(`milestones_${id}`, JSON.stringify(updatedMilestones));
    
    setNewMilestone({ title: '', description: '' });
    setShowAddMilestone(false);
  };

  const handleMarkAsDone = (milestoneId) => {
    const updatedMilestones = milestones.map(m => 
      m.id === milestoneId ? { ...m, status: 'done' } : m
    );
    setMilestones(updatedMilestones);
    localStorage.setItem(`milestones_${id}`, JSON.stringify(updatedMilestones));
  };

  const handleDeleteMilestone = (milestoneId) => {
    if (!confirm('Bạn có chắc muốn xóa mốc thời gian này?')) return;
    
    const updatedMilestones = milestones.filter(m => m.id !== milestoneId);
    setMilestones(updatedMilestones);
    localStorage.setItem(`milestones_${id}`, JSON.stringify(updatedMilestones));
  };

  const handleCompleteProject = async () => {
    if (!confirm('Xác nhận dự án đã hoàn thành? Hành động này không thể hoàn tác.')) return;
    
    try {
      const response = await api.requests.update(id, {
        status: 'HOAN_THANH',
        statusText: 'Hoàn thành',
        completedDate: new Date().toISOString()
      });
      
      if (response.success) {
        alert('Đã xác nhận hoàn thành dự án!');
        navigate(`/requests/${id}`);
      }
    } catch (error) {
      console.error('Error completing project:', error);
      alert('Có lỗi xảy ra!');
    }
  };

  if (loading) {
    return (
      <div className="loading-state">
        <i className="fa-solid fa-circle-notch"></i>
        <p>Đang tải thông tin tiến độ...</p>
      </div>
    );
  }

  if (!request || !selectedQuote) {
    return null;
  }

  const isOwner = currentUser && request.employer.id === currentUser.id;
  const isFreelancer = currentUser && selectedQuote.freelancerId === currentUser.id;

  return (
    <div className="container py-5" style={{ minHeight: '80vh' }}>
      {/* Banner */}
      <div 
        className="w-card mb-4" 
        style={{ 
          background: 'linear-gradient(135deg, var(--navy) 0%, #1e293b 100%)', 
          color: 'white', 
          padding: '40px' 
        }}
      >
        <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px'}}>
          <button 
            onClick={() => navigate(`/requests/${id}`)}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              color: 'white',
              padding: '8px 12px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            <i className="fa-solid fa-arrow-left"></i> Quay lại
          </button>
          <h1 style={{ fontSize: '32px', fontWeight: '800', margin: '0' }}>Workroom</h1>
        </div>
        <p style={{ opacity: '0.8', margin: 0 }}>Theo dõi tiến độ và quản lý kết quả dự án: <b>{request.title}</b></p>
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
                {isFreelancer && (
                  <>
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
                      Kéo thanh trượt để cập nhật tiến độ công việc mới nhất.
                    </p>
                  </>
                )}
              </div>

              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '30px', marginBottom: '16px'}}>
                <h3 className="section-title" style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>Nhật ký công việc</h3>
                {isFreelancer && (
                  <button 
                    className="btn-add-milestone"
                    onClick={() => setShowAddMilestone(true)}
                  >
                    <i className="fa-solid fa-plus"></i> Thêm mốc
                  </button>
                )}
              </div>

              {milestones.length === 0 ? (
                <div style={{textAlign: 'center', padding: '40px', color: '#94A3B8'}}>
                  <i className="fa-regular fa-calendar" style={{fontSize: '48px', marginBottom: '16px', display: 'block'}}></i>
                  <p>Chưa có mốc thời gian nào. {isFreelancer && 'Hãy thêm mốc đầu tiên!'}</p>
                </div>
              ) : (
                <div className="timeline">
                  {milestones.map((item) => (
                    <div key={item.id} className="timeline-item">
                      <div className={`timeline-dot ${item.status === 'done' ? 'done' : ''}`}></div>
                      <div className="timeline-content">
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                          <div style={{flex: 1}}>
                            <div className="t-meta">{item.date} • {item.createdBy}</div>
                            <div className="t-title">{item.title}</div>
                            <div className="t-desc">{item.description}</div>
                          </div>
                          {isFreelancer && (
                            <div style={{display: 'flex', gap: '8px'}}>
                              {item.status !== 'done' && (
                                <button
                                  onClick={() => handleMarkAsDone(item.id)}
                                  style={{
                                    padding: '6px 12px',
                                    background: '#10B981',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontSize: '12px',
                                    cursor: 'pointer'
                                  }}
                                >
                                  <i className="fa-solid fa-check"></i>
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteMilestone(item.id)}
                                style={{
                                  padding: '6px 12px',
                                  background: '#EF4444',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '6px',
                                  fontSize: '12px',
                                  cursor: 'pointer'
                                }}
                              >
                                <i className="fa-solid fa-trash"></i>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
                  <span className="meta-val">{selectedQuote.freelancer.name}</span>
                </li>
                <li>
                  <span className="meta-key">Người thuê:</span>
                  <span className="meta-val">{request.employer.name}</span>
                </li>
                <li>
                  <span className="meta-key">Ngân sách:</span>
                  <span className="meta-val">{selectedQuote.amount.toLocaleString('vi-VN')}đ</span>
                </li>
                <li>
                  <span className="meta-key">Thời gian:</span>
                  <span className="meta-val">{selectedQuote.duration}</span>
                </li>
                <li>
                  <span className="meta-key">Tiến độ:</span>
                  <span className="meta-val">{progress}%</span>
                </li>
              </ul>
              
              {isOwner && progress >= 100 && (
                <div className="mt-4">
                  <button 
                    className="btn-signup-premium w-100"
                    onClick={handleCompleteProject}
                  >
                    <i className="fa-solid fa-check-circle"></i> Xác nhận hoàn thành
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Milestone Modal */}
      {showAddMilestone && (
        <div className="modal-overlay" onClick={() => setShowAddMilestone(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{maxWidth: '500px'}}>
            <div className="modal-header">
              <h3>
                <i className="fa-solid fa-plus-circle" style={{color: 'var(--teal)', marginRight: '8px'}}></i>
                Thêm mốc thời gian
              </h3>
              <button className="modal-close" onClick={() => setShowAddMilestone(false)}>
                <i className="fa-solid fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Tiêu đề <span className="required">*</span></label>
                <input
                  type="text"
                  value={newMilestone.title}
                  onChange={(e) => setNewMilestone({...newMilestone, title: e.target.value})}
                  placeholder="VD: Hoàn thành thiết kế giao diện"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #E2E8F0',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
              </div>
              <div className="form-group" style={{marginTop: '16px'}}>
                <label>Mô tả</label>
                <textarea
                  value={newMilestone.description}
                  onChange={(e) => setNewMilestone({...newMilestone, description: e.target.value})}
                  placeholder="Mô tả chi tiết về công việc đã hoàn thành..."
                  rows="4"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #E2E8F0',
                    borderRadius: '8px',
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                onClick={() => setShowAddMilestone(false)}
                style={{
                  padding: '12px 24px',
                  background: '#F1F5F9',
                  color: '#475569',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Hủy
              </button>
              <button
                onClick={handleAddMilestone}
                style={{
                  padding: '12px 24px',
                  background: 'var(--teal)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                <i className="fa-solid fa-plus"></i> Thêm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressPage;
