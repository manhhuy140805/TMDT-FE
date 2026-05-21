import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import api from "../../services/api";

const WorkspaceComplaints = () => {
  const { currentUser, jobs } = useOutletContext();
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDisputes = async () => {
      setLoading(true);
      setError(null);
      try {
        // Lấy disputes từ tất cả contracts của user
        const contractIds = jobs.map((c) => c.congViecId).filter(Boolean);
        if (contractIds.length === 0) {
          setDisputes([]);
          setLoading(false);
          return;
        }

        const results = await Promise.allSettled(
          contractIds.map((id) => api.disputes.getAll ? api.disputes.getAll() : Promise.resolve({ disputes: [] }))
        );

        // Nếu có endpoint getAll, dùng nó
        const res = await api.disputes.getAll();
        const all = res?.disputes || res?.data || (Array.isArray(res) ? res : []);
        setDisputes(all);
      } catch (err) {
        // Fallback: thử lấy disputes từ từng contract
        try {
          const contractIds = jobs.map((c) => c.congViecId).filter(Boolean);
          const results = await Promise.allSettled(
            contractIds.map((id) =>
              api.contracts
                ? fetch(`http://localhost:8080/contracts/${id}/disputes`).then(r => r.json())
                : Promise.resolve({ disputes: [] })
            )
          );
          const allDisputes = results
            .filter((r) => r.status === "fulfilled")
            .flatMap((r) => r.value?.disputes || []);
          setDisputes(allDisputes);
        } catch (e) {
          setError(e.message || "Không tải được dữ liệu khiếu nại");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDisputes();
  }, [jobs]);

  const getStatusBadge = (status) => {
    switch (status) {
      case "DangMo":
        return <span style={{ background: "#FEF3C7", color: "#D97706", padding: "4px 10px", borderRadius: "4px", fontSize: "12px", fontWeight: 600 }}>Đang mở</span>;
      case "DangXuLy":
        return <span style={{ background: "#DBEAFE", color: "#1D4ED8", padding: "4px 10px", borderRadius: "4px", fontSize: "12px", fontWeight: 600 }}>Đang xử lý</span>;
      case "DaDong":
        return <span style={{ background: "#D1FAE5", color: "#047857", padding: "4px 10px", borderRadius: "4px", fontSize: "12px", fontWeight: 600 }}>Đã đóng</span>;
      default:
        return <span style={{ background: "#F1F5F9", color: "#64748B", padding: "4px 10px", borderRadius: "4px", fontSize: "12px", fontWeight: 600 }}>{status}</span>;
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      return new Date(dateStr).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
    } catch {
      return "";
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return "0 VNĐ";
    return new Intl.NumberFormat("vi-VN").format(Number(amount)) + " VNĐ";
  };

  if (loading) {
    return (
      <div className="wl-content-box">
        <div className="wl-content-header"><h2>Xử lý khiếu nại</h2></div>
        <div style={{ textAlign: "center", padding: "60px", color: "#64748B" }}>
          <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: "32px", color: "#0EA5E9", marginBottom: "16px" }}></i>
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="wl-content-box">
      <div className="wl-content-header" style={{ marginBottom: "16px" }}>
        <h2>Xử lý khiếu nại</h2>
        {disputes.length > 0 && (
          <span style={{ fontSize: "14px", color: "#64748B" }}>
            Tổng: {disputes.length} khiếu nại
          </span>
        )}
      </div>

      {error && (
        <div style={{ padding: "12px 16px", background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "8px", color: "#DC2626", fontSize: "14px", marginBottom: "16px" }}>
          <i className="fa-solid fa-triangle-exclamation"></i> {error}
        </div>
      )}

      {disputes.length === 0 ? (
        <div style={{ color: "#64748B", fontSize: "15px", padding: "60px 20px", textAlign: "center", border: "1px dashed #CBD5E1", borderRadius: "12px" }}>
          <i className="fa-solid fa-scale-balanced" style={{ fontSize: "40px", color: "#E2E8F0", marginBottom: "16px", display: "block" }}></i>
          <p>Không có khiếu nại nào cần giải quyết.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {disputes.map((dispute) => (
            <div
              key={dispute.tranhChapId}
              style={{
                padding: "20px",
                border: "1px solid #E2E8F0",
                borderRadius: "12px",
                background: "white",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                <div>
                  <div style={{ fontWeight: 700, color: "#0F172A", fontSize: "16px", marginBottom: "4px" }}>
                    Khiếu nại #{dispute.tranhChapId}
                  </div>
                  <div style={{ fontSize: "13px", color: "#64748B" }}>
                    Hợp đồng #{dispute.congViecId} • Mở ngày {formatDate(dispute.ngayMo)}
                  </div>
                </div>
                {getStatusBadge(dispute.trangThai)}
              </div>

              <div style={{ fontSize: "14px", color: "#334155", lineHeight: "1.6", marginBottom: "12px" }}>
                <strong>Lý do:</strong> {dispute.lyDo}
              </div>

              {dispute.moTa && (
                <div style={{ fontSize: "13px", color: "#64748B", lineHeight: "1.5", marginBottom: "12px" }}>
                  {dispute.moTa}
                </div>
              )}

              <div style={{ display: "flex", gap: "24px", fontSize: "13px", color: "#64748B", borderTop: "1px solid #F1F5F9", paddingTop: "12px" }}>
                {dispute.yeuCauHoanTien && (
                  <span>
                    <i className="fa-solid fa-money-bill"></i> Yêu cầu hoàn: {formatCurrency(dispute.yeuCauHoanTien)}
                  </span>
                )}
                {dispute.ngayDong && (
                  <span>
                    <i className="fa-solid fa-calendar-check"></i> Đóng: {formatDate(dispute.ngayDong)}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WorkspaceComplaints;
