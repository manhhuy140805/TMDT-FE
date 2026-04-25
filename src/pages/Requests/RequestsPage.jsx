import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './RequestsPage.css';

const RequestsPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('best-match');
  const [filters, setFilters] = useState({
    category: 'all',
    status: 'ALL',
    workType: 'all',
  });

  // Mock data
  const mockRequests = [
    {
      id: 1,
      title: 'Cần lập trình viên React.js cho dự án E-commerce',
      category: 'Công nghệ & Lập trình',
      budget: '15,000,000 - 25,000,000 VNĐ',
      deadline: '30 ngày',
      bids: 12,
      status: 'DANG_MOI_THAU',
      description: 'Tìm kiếm lập trình viên React.js có kinh nghiệm để xây dựng website thương mại điện tử...',
      skills: ['React.js', 'Node.js', 'MongoDB'],
      postedTime: '2 giờ trước',
    },
    {
      id: 2,
      title: 'Thiết kế logo và bộ nhận diện thương hiệu',
      category: 'Thiết kế & Đồ họa',
      budget: '5,000,000 - 10,000,000 VNĐ',
      deadline: '15 ngày',
      bids: 8,
      status: 'DANG_MOI_THAU',
      description: 'Cần thiết kế logo chuyên nghiệp và bộ nhận diện thương hiệu hoàn chỉnh...',
      skills: ['Adobe Illustrator', 'Photoshop', 'Branding'],
      postedTime: '5 giờ trước',
    },
    {
      id: 3,
      title: 'Viết content cho website du lịch',
      category: 'Viết lách & Dịch thuật',
      budget: '3,000,000 - 5,000,000 VNĐ',
      deadline: '20 ngày',
      bids: 15,
      status: 'DANG_MOI_THAU',
      description: 'Cần người viết content SEO cho website du lịch, 20-30 bài viết...',
      skills: ['Content Writing', 'SEO', 'Travel'],
      postedTime: '1 ngày trước',
    },
  ];

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setRequests(mockRequests);
      setLoading(false);
    }, 1000);
  }, []);

  const handleSearch = () => {
    console.log('Searching for:', searchTerm);
    // TODO: Implement search logic
  };

  const handleRequestClick = (id) => {
    navigate(`/requests/${id}`);
  };

  const filteredRequests = requests.filter(req => {
    if (searchTerm && !req.title.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="bg-slate">
      {/* Hero Section */}
      <div className="requests-hero">
        <div className="r-hero-container">
          <h1 className="r-hero-title">Khám phá cơ hội tuyệt vời</h1>
          <p className="r-hero-desc">
            Hơn 67,639 dự án đang mong đợi tài năng của bạn. Tìm kiếm ngay!
          </p>

          <div className="r-search-box">
            <div className="r-search-input">
              <i className="fa-solid fa-magnifying-glass"></i>
              <input
                type="text"
                placeholder="Gõ kỹ năng, tên công việc hoặc công cụ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <button onClick={handleSearch} className="btn-r-search">
              Tìm việc
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="requests-main-wrap">
        <div className="r-container">
          {/* Sidebar Filters */}
          <aside className="r-sidebar">
            <div className="r-filter-widget">
              <h3>
                Lĩnh vực <i className="fa-solid fa-chevron-up"></i>
              </h3>
              <div className="r-filter-list">
                <label className="r-cb">
                  <input type="checkbox" defaultChecked /> <span>Tất cả</span>
                </label>
                <label className="r-cb">
                  <input type="checkbox" /> <span>Công nghệ & Lập trình</span>
                  <span className="r-count">45</span>
                </label>
                <label className="r-cb">
                  <input type="checkbox" /> <span>Thiết kế & Đồ họa</span>
                  <span className="r-count">16K</span>
                </label>
                <label className="r-cb">
                  <input type="checkbox" /> <span>Digital Marketing</span>
                  <span className="r-count">6K</span>
                </label>
                <label className="r-cb">
                  <input type="checkbox" /> <span>Viết lách & Dịch thuật</span>
                  <span className="r-count">3K</span>
                </label>
              </div>
            </div>

            <div className="r-filter-widget">
              <h3>
                Trạng thái <i className="fa-solid fa-chevron-up"></i>
              </h3>
              <div className="r-filter-list">
                <label className="r-rb">
                  <input type="radio" name="status" value="ALL" defaultChecked />
                  <span>Tất cả</span>
                </label>
                <label className="r-rb">
                  <input type="radio" name="status" value="DANG_MOI_THAU" />
                  <span>Đang nhận hồ sơ</span>
                </label>
              </div>
            </div>

            <div className="r-filter-widget">
              <h3>
                Hình thức <i className="fa-solid fa-chevron-up"></i>
              </h3>
              <div className="r-filter-list">
                <label className="r-rb">
                  <input type="radio" name="worktype" defaultChecked />
                  <span>Tất cả</span>
                </label>
                <label className="r-rb">
                  <input type="radio" name="worktype" />
                  <span>Làm online (Remote)</span>
                </label>
                <label className="r-rb">
                  <input type="radio" name="worktype" />
                  <span>Làm tại văn phòng</span>
                </label>
              </div>
            </div>
          </aside>

          {/* Right Job Board */}
          <main className="r-content">
            <div className="r-tabs-row">
              <div
                className={`r-tab ${activeTab === 'best-match' ? 'active' : ''}`}
                onClick={() => setActiveTab('best-match')}
              >
                Trùng khớp tốt nhất
              </div>
              <div
                className={`r-tab ${activeTab === 'newest' ? 'active' : ''}`}
                onClick={() => setActiveTab('newest')}
              >
                Mới nhất
              </div>
              <div
                className={`r-tab ${activeTab === 'saved' ? 'active' : ''}`}
                onClick={() => setActiveTab('saved')}
              >
                Đã lưu
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="r-placeholder loading">
                <i className="fa-solid fa-circle-notch fa-spin"></i>
                <p>Hệ thống đang truy xuất dữ liệu trên máy chủ...</p>
              </div>
            )}

            {/* Empty State */}
            {!loading && filteredRequests.length === 0 && (
              <div className="r-placeholder empty">
                <i className="fa-regular fa-folder-open"></i>
                <h3>Không tìm thấy yêu cầu nào</h3>
                <p>
                  Không có công việc nào khớp với bộ lọc hiện tại của bạn.
                  <br />
                  Hãy thử thay đổi từ khóa hoặc nới lỏng các tiêu chí.
                </p>
              </div>
            )}

            {/* Job List */}
            {!loading && filteredRequests.length > 0 && (
              <div className="r-job-list">
                {filteredRequests.map((request) => (
                  <div
                    key={request.id}
                    className="r-job-card"
                    onClick={() => handleRequestClick(request.id)}
                  >
                    <div className="r-job-header">
                      <h3 className="r-job-title">{request.title}</h3>
                      <button className="r-save-btn">
                        <i className="fa-regular fa-heart"></i>
                      </button>
                    </div>

                    <div className="r-job-meta">
                      <span className="r-meta-item">
                        <i className="fa-solid fa-tag"></i> {request.category}
                      </span>
                      <span className="r-meta-item">
                        <i className="fa-solid fa-clock"></i> {request.postedTime}
                      </span>
                    </div>

                    <p className="r-job-desc">{request.description}</p>

                    <div className="r-job-skills">
                      {request.skills.map((skill, index) => (
                        <span key={index} className="r-skill-tag">
                          {skill}
                        </span>
                      ))}
                    </div>

                    <div className="r-job-footer">
                      <div className="r-job-info">
                        <span className="r-budget">
                          <i className="fa-solid fa-money-bill-wave"></i> {request.budget}
                        </span>
                        <span className="r-deadline">
                          <i className="fa-solid fa-calendar-days"></i> {request.deadline}
                        </span>
                      </div>
                      <div className="r-bids">
                        <i className="fa-solid fa-users"></i> {request.bids} đề xuất
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default RequestsPage;
