import { useState } from "react";

const FilterSidebar = ({
  categories,
  filters,
  onCategoryToggle,
  onToggleAllCategories,
  onFilterChange,
  showMobileFilters,
  onCloseMobileFilters,
}) => {
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [collapsed, setCollapsed] = useState({
    categories: false,
    status: false,
    workType: false,
  });

  const toggleSection = (section) => {
    setCollapsed((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const displayedCategories = showAllCategories
    ? categories
    : categories.slice(0, 8);

  return (
    <aside className={`r-sidebar ${showMobileFilters ? "mobile-open" : ""}`}>
      <div className="r-sidebar-header">
        <h3>Bộ lọc</h3>
        <button
          className="btn-close-filters"
          onClick={onCloseMobileFilters}
          aria-label="Đóng bộ lọc"
        >
          <i className="fa-solid fa-xmark"></i>
        </button>
      </div>

      {/* Lĩnh vực */}
      <div className="r-filter-widget">
        <h3
          onClick={() => toggleSection("categories")}
          style={{ cursor: "pointer", userSelect: "none" }}
        >
          Lĩnh vực{" "}
          <i
            className={`fa-solid fa-chevron-${collapsed.categories ? "down" : "up"}`}
          ></i>
        </h3>

        {!collapsed.categories && (
          <div className="r-filter-list">
            <label
              className="r-cb"
              style={{
                fontWeight: "600",
                borderBottom: "1px solid #e2e8f0",
                paddingBottom: "8px",
                marginBottom: "8px",
              }}
            >
              <input
                type="checkbox"
                checked={
                  filters.categories.length === categories.length &&
                  categories.length > 0
                }
                onChange={onToggleAllCategories}
              />
              <span>Tất cả</span>
              <span className="r-count">
                {categories.reduce((sum, cat) => sum + (cat.count || 0), 0)}
              </span>
            </label>

            {displayedCategories.map((category) => (
              <label key={category.id} className="r-cb">
                <input
                  type="checkbox"
                  checked={filters.categories.includes(category.id)}
                  onChange={() => onCategoryToggle(category.id)}
                />
                <span>{category.name}</span>
                <span className="r-count">{category.count || 0}</span>
              </label>
            ))}

            {categories.length > 8 && (
              <button
                onClick={() => setShowAllCategories(!showAllCategories)}
                style={{
                  width: "100%",
                  padding: "8px",
                  marginTop: "8px",
                  background: "transparent",
                  border: "1px dashed #cbd5e1",
                  borderRadius: "6px",
                  color: "#0ea5e9",
                  fontSize: "14px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  transition: "background 0.2s",
                }}
                onMouseOver={(e) => (e.target.style.background = "#f1f5f9")}
                onMouseOut={(e) => (e.target.style.background = "transparent")}
              >
                <i
                  className={`fa-solid fa-chevron-${showAllCategories ? "up" : "down"}`}
                ></i>
                {showAllCategories
                  ? "Thu gọn"
                  : `Xem thêm ${categories.length - 8} lĩnh vực`}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Trạng thái */}
      <div className="r-filter-widget">
        <h3
          onClick={() => toggleSection("status")}
          style={{ cursor: "pointer", userSelect: "none" }}
        >
          Trạng thái{" "}
          <i
            className={`fa-solid fa-chevron-${collapsed.status ? "down" : "up"}`}
          ></i>
        </h3>

        {!collapsed.status && (
          <div className="r-filter-list">
            <label className="r-rb">
              <input
                type="radio"
                name="status"
                value="ALL"
                checked={filters.status === "ALL"}
                onChange={(e) =>
                  onFilterChange({ ...filters, status: e.target.value })
                }
              />
              <span>Tất cả</span>
            </label>
            <label className="r-rb">
              <input
                type="radio"
                name="status"
                value="DangMo"
                checked={filters.status === "DangMo"}
                onChange={(e) =>
                  onFilterChange({ ...filters, status: e.target.value })
                }
              />
              <span>Đang nhận hồ sơ</span>
            </label>
            <label className="r-rb">
              <input
                type="radio"
                name="status"
                value="DaDong"
                checked={filters.status === "DaDong"}
                onChange={(e) =>
                  onFilterChange({ ...filters, status: e.target.value })
                }
              />
              <span>Đã đóng</span>
            </label>
          </div>
        )}
      </div>

      {/* Hình thức */}
      <div className="r-filter-widget">
        <h3
          onClick={() => toggleSection("workType")}
          style={{ cursor: "pointer", userSelect: "none" }}
        >
          Hình thức{" "}
          <i
            className={`fa-solid fa-chevron-${collapsed.workType ? "down" : "up"}`}
          ></i>
        </h3>

        {!collapsed.workType && (
          <div className="r-filter-list">
            <label className="r-rb">
              <input
                type="radio"
                name="worktype"
                value="all"
                checked={filters.workType === "all"}
                onChange={(e) =>
                  onFilterChange({ ...filters, workType: e.target.value })
                }
              />
              <span>Tất cả</span>
            </label>
            <label className="r-rb">
              <input
                type="radio"
                name="worktype"
                value="remote"
                checked={filters.workType === "remote"}
                onChange={(e) =>
                  onFilterChange({ ...filters, workType: e.target.value })
                }
              />
              <span>Làm online (Remote)</span>
            </label>
            <label className="r-rb">
              <input
                type="radio"
                name="worktype"
                value="office"
                checked={filters.workType === "office"}
                onChange={(e) =>
                  onFilterChange({ ...filters, workType: e.target.value })
                }
              />
              <span>Làm tại văn phòng</span>
            </label>
          </div>
        )}
      </div>
    </aside>
  );
};

export default FilterSidebar;
