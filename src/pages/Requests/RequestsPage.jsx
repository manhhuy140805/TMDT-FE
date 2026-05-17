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
      const response = await api.categories.getAll();
      if (response.success) {
        const requestsResponse = await api.requests.getAll({
          status: "DangMo",
        });
        const allRequests = requestsResponse.data.data || [];

        const categoriesWithCount = response.data.map((cat) => ({
          ...cat,
          count: allRequests.filter((req) => req.categoryId === cat.id).length,
        }));

        categoriesWithCount.sort((a, b) => b.count - a.count);
        setCategories(categoriesWithCount);
      }
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
      const response = await api.requests.getAll({
        search: searchTerm,
        categories: filters.categories,
        status: filters.status === "ALL" ? "DangMo" : filters.status,
      });

      if (response.success) {
        setRequests(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
      setRequests([]);
    } finally {
      setLoading(false);
    }
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

