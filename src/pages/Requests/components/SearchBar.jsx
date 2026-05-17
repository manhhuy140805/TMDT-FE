const SearchBar = ({ searchTerm, setSearchTerm, onSearch }) => {
  return (
    <div
      style={{
        marginBottom: "16px",
        display: "flex",
        gap: "12px",
        alignItems: "center",
      }}
    >
      <div
        style={{
          flex: 1,
          position: "relative",
          display: "flex",
          alignItems: "center",
        }}
      >
        <i
          className="fa-solid fa-magnifying-glass"
          style={{
            position: "absolute",
            left: "14px",
            color: "#94A3B8",
            fontSize: "16px",
          }}
        ></i>
        <input
          type="text"
          placeholder="Tìm kiếm theo từ khóa, lĩnh vực..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && onSearch()}
          style={{
            width: "100%",
            padding: "12px 44px 12px 44px",
            border: "1px solid #E2E8F0",
            borderRadius: "10px",
            fontSize: "15px",
            outline: "none",
            transition: "border-color 0.2s",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "#0EA5E9";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "#E2E8F0";
          }}
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            style={{
              position: "absolute",
              right: "12px",
              background: "#F1F5F9",
              border: "none",
              color: "#64748B",
              cursor: "pointer",
              padding: "6px 10px",
              borderRadius: "6px",
              fontSize: "14px",
              transition: "background 0.2s",
            }}
            onMouseOver={(e) => {
              e.target.style.background = "#E2E8F0";
            }}
            onMouseOut={(e) => {
              e.target.style.background = "#F1F5F9";
            }}
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        )}
      </div>
      <button
        onClick={onSearch}
        style={{
          padding: "12px 24px",
          background: "#0EA5E9",
          color: "#fff",
          border: "none",
          borderRadius: "10px",
          fontSize: "15px",
          fontWeight: "600",
          cursor: "pointer",
          transition: "background 0.2s",
          whiteSpace: "nowrap",
        }}
        onMouseOver={(e) => (e.target.style.background = "#0284C7")}
        onMouseOut={(e) => (e.target.style.background = "#0EA5E9")}
      >
        <i className="fa-solid fa-magnifying-glass"></i> Tìm kiếm
      </button>
    </div>
  );
};

export default SearchBar;
