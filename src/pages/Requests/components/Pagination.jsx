const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "8px",
        marginTop: "32px",
        paddingTop: "24px",
        borderTop: "1px solid #E2E8F0",
      }}
    >
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        style={{
          padding: "8px 16px",
          border: "1px solid #E2E8F0",
          borderRadius: "8px",
          background: currentPage === 1 ? "#F1F5F9" : "#fff",
          color: currentPage === 1 ? "#94A3B8" : "#0EA5E9",
          cursor: currentPage === 1 ? "not-allowed" : "pointer",
          fontWeight: "500",
          transition: "background 0.2s",
        }}
      >
        <i className="fa-solid fa-chevron-left"></i> Trước
      </button>

      {[...Array(totalPages)].map((_, index) => {
        const pageNum = index + 1;
        // Hiển thị: trang đầu, trang cuối, trang hiện tại và 2 trang xung quanh
        if (
          pageNum === 1 ||
          pageNum === totalPages ||
          (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
        ) {
          return (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              style={{
                padding: "8px 14px",
                border: "1px solid #E2E8F0",
                borderRadius: "8px",
                background: currentPage === pageNum ? "#0EA5E9" : "#fff",
                color: currentPage === pageNum ? "#fff" : "#475569",
                cursor: "pointer",
                fontWeight: currentPage === pageNum ? "600" : "500",
                minWidth: "40px",
                transition: "background 0.2s",
              }}
            >
              {pageNum}
            </button>
          );
        } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
          return (
            <span key={pageNum} style={{ color: "#94A3B8" }}>
              ...
            </span>
          );
        }
        return null;
      })}

      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        style={{
          padding: "8px 16px",
          border: "1px solid #E2E8F0",
          borderRadius: "8px",
          background: currentPage === totalPages ? "#F1F5F9" : "#fff",
          color: currentPage === totalPages ? "#94A3B8" : "#0EA5E9",
          cursor: currentPage === totalPages ? "not-allowed" : "pointer",
          fontWeight: "500",
          transition: "background 0.2s",
        }}
      >
        Sau <i className="fa-solid fa-chevron-right"></i>
      </button>
    </div>
  );
};

export default Pagination;
