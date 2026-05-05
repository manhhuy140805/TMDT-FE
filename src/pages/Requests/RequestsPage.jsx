import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import RequestCard from '../../components/RequestCard';
import './RequestsPage.css';

const RequestsPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [activeTab, setActiveTab] = useState('best-match');
  const [filters, setFilters] = useState({
    categoryId: searchParams.get('category') || 'all',
    status: 'ALL',
    workType: 'all',
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [filters, searchTerm]);

  const fetchCategories = async () => {
    try {
      const response = await api.categories.getAll();
      if (response.success) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const params = {
        search: searchTerm,
        status: 'DANG_MOI_THAU'
      };

      if (filters.categoryId !== 'all') {
        params.categoryId = filters.categoryId;
      }

      const response = await api.requests.getAll(params);
      if (response.success) {
        setRequests(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchRequests();
  };

  const handleRequestClick = (id) => {
    navigate(`/requests/${id}`);
  };

  const handleCategoryFilter = (categoryId) => {
    setFilters(prev => ({ ...prev, categoryId }));
  };

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
                  <input 
                    type="checkbox" 
                    checked={filters.categoryId === 'all'}
                    onChange={() => handleCategoryFilter('all')}
                  /> 
                  <span>Tất cả</span>
                </label>
                {categories.map((category) => (
                  <label key={category.id} className="r-cb">
                    <input 
                      type="checkbox"
                      checked={filters.categoryId === category.id.toString()}
                      onChange={() => handleCategoryFilter(category.id.toString())}
                    /> 
                    <span>{category.name}</span>
                    <span className="r-count">{category.count}</span>
                  </label>
                ))}
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
            {!loading && requests.length === 0 && (
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
            {!loading && requests.length > 0 && (
              <div className="r-job-list">
                {requests.map((request) => (
                  <RequestCard
                    key={request.id}
                    request={request}
                    onClick={handleRequestClick}
                  />
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
