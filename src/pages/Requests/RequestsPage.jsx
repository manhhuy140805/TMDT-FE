import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../../services/api";
import {
  HeroSection,
  SearchBar,
  FilterSidebar,
  RequestsList,
  Pagination,
} from "./components";
import "./RequestsPage.css";

const RequestsPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || ""
  );
  const [activeTab, setActiveTab] = useState("best-match");
  const [filters, setFilters] = useState({
    categories: [],
    status: "ALL",
    workType: "all",
  });
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRequests = requests.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(requests.length / itemsPerPage);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchRequests();
    setCurrentPage(1);
  }, [filters, searchTerm]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  const fetchCategories = async () => {
    try {
      const catResponse = await api.categories.getAll();
      const jobsResponse = await api.jobs.getAll({ trangThai: "DangMo" });

      // API trả về { categories: [...], total: N } và { jobs: [...], total: N }
      const cats = catResponse.categories || catResponse.data || [];
      const allJobs = jobsResponse.jobs || jobsResponse.data || [];

      const categoriesWithCount = cats.map((cat) => ({
        ...cat,
        id: cat.loaiDichVuId,
        name: cat.tenLoai,
        count: allJobs.filter(
          (job) => job.loaiDichVuId === cat.loaiDichVuId
        ).length,
      }));

      categoriesWithCount.sort((a, b) => b.count - a.count);
      setCategories(categoriesWithCount);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleToggleAllCategories = () => {
    if (filters.categories.length === categories.length) {
      setFilters((prev) => ({ ...prev, categories: [] }));
    } else {
      setFilters((prev) => ({
        ...prev,
        categories: categories.map((c) => c.id),
      }));
    }
  };

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const params = {};

      if (searchTerm) {
        params.keyword = searchTerm;
      }

      if (filters.status !== "ALL") {
        params.trangThai = filters.status;
      } else {
        params.trangThai = "DangMo";
      }

      const response = searchTerm
        ? await api.jobs.search(params)
        : await api.jobs.getAll(params);

      // API trả về { jobs: [...], total: N }
      let jobs = [];
      if (Array.isArray(response)) {
        jobs = response;
      } else if (Array.isArray(response?.jobs)) {
        jobs = response.jobs;
      } else if (Array.isArray(response?.data)) {
        jobs = response.data;
      }

      // Map từ API format sang format mà RequestCard đang dùng
      const mapped = jobs.map((job) => mapJobToRequest(job));

      // Lọc theo category ở client nếu có
      const filtered =
        filters.categories.length > 0
          ? mapped.filter((req) =>
              filters.categories.includes(req.categoryId)
            )
          : mapped;

      setRequests(filtered);
    } catch (error) {
      console.error("Error fetching requests:", error);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  // Map job từ API format sang format component đang dùng
  const mapJobToRequest = (job) => {
    const formatBudget = (min, max) => {
      if (!min && !max) return "Thỏa thuận";
      const fmt = (n) =>
        new Intl.NumberFormat("vi-VN").format(n) + " VNĐ";
      if (min && max) return `${fmt(min)} - ${fmt(max)}`;
      if (min) return `Từ ${fmt(min)}`;
      return `Đến ${fmt(max)}`;
    };

    const getPostedTime = (dateStr) => {
      if (!dateStr) return "Vừa đăng";
      const diff = Date.now() - new Date(dateStr).getTime();
      const days = Math.floor(diff / 86400000);
      if (days === 0) return "Hôm nay";
      if (days === 1) return "1 ngày trước";
      if (days < 30) return `${days} ngày trước`;
      return new Date(dateStr).toLocaleDateString("vi-VN");
    };

    const formatDeadline = (dateStr) => {
      if (!dateStr) return "Chưa xác định";
      return new Date(dateStr).toLocaleDateString("vi-VN");
    };

    return {
      id: job.yeuCauId,
      title: job.tieuDe,
      description: job.moTa,
      status: job.trangThai,
      category: job.loaiDichVu?.tenLoai || "Chưa phân loại",
      categoryId: job.loaiDichVuId,
      budget: formatBudget(job.nganSachMin, job.nganSachMax),
      bids: job.soLuongBaoGia || 0,
      postedTime: getPostedTime(job.ngayTao),
      deadlineText: formatDeadline(job.thoiHan),
      submissionDeadlineText: formatDeadline(job.thoiHan),
      requiresSupervision: job.yeuCauGiamSat,
      skills: [],
      location: null,
    };
  };

  const handleCategoryToggle = (categoryId) => {
    setFilters((prev) => {
      const categories = prev.categories.includes(categoryId)
        ? prev.categories.filter((id) => id !== categoryId)
        : [...prev.categories, categoryId];
      return { ...prev, categories };
    });
  };

  const handleRequestClick = (id) => {
    navigate(`/requests/${id}`);
  };

  return (
    <div className="bg-slate">
      <HeroSection/>

      <div className="requests-main-wrap">
        {showMobileFilters && (
          <div
            className="r-sidebar-overlay"
            onClick={() => setShowMobileFilters(false)}
          ></div>
        )}

        <div className="r-container">
          <FilterSidebar
            categories={categories}
            filters={filters}
            onCategoryToggle={handleCategoryToggle}
            onToggleAllCategories={handleToggleAllCategories}
            onFilterChange={setFilters}
            showMobileFilters={showMobileFilters}
            onCloseMobileFilters={() => setShowMobileFilters(false)}
          />

          <main className="r-content">
            <SearchBar
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              onSearch={fetchRequests}
            />

            <RequestsList
              loading={loading}
              requests={requests}
              currentRequests={currentRequests}
              indexOfFirstItem={indexOfFirstItem}
              indexOfLastItem={indexOfLastItem}
              onRequestClick={handleRequestClick}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              onShowMobileFilters={() => setShowMobileFilters(true)}
            />

            {!loading && requests.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default RequestsPage;

