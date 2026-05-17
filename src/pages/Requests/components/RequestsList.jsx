import RequestCard from "../../../components/RequestCard";

const RequestsList = ({
  loading,
  requests,
  currentRequests,
  indexOfFirstItem,
  indexOfLastItem,
  onRequestClick,
  activeTab,
  onTabChange,
  onShowMobileFilters,
}) => {
  return (
    <>
      <div className="r-tabs-row">
        <button
          className="btn-mobile-filters"
          onClick={onShowMobileFilters}
        >
          <i className="fa-solid fa-sliders"></i> Bộ lọc
        </button>
        <div
          className={`r-tab ${activeTab === "best-match" ? "active" : ""}`}
          onClick={() => onTabChange("best-match")}
        >
          Trùng khớp tốt nhất
        </div>
        <div
          className={`r-tab ${activeTab === "newest" ? "active" : ""}`}
          onClick={() => onTabChange("newest")}
        >
          Mới nhất
        </div>
      </div>

      {/* Results count */}
      {!loading && requests.length > 0 && (
        <div
          style={{
            padding: "12px 0",
            color: "#64748B",
            fontSize: "14px",
            borderBottom: "1px solid #E2E8F0",
            marginBottom: "16px",
          }}
        >
          Hiển thị {indexOfFirstItem + 1}-
          {Math.min(indexOfLastItem, requests.length)} của {requests.length}{" "}
          kết quả
        </div>
      )}

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
          {currentRequests.map((request) => (
            <RequestCard
              key={request.id}
              request={request}
              onClick={onRequestClick}
            />
          ))}
        </div>
      )}
    </>
  );
};

export default RequestsList;
