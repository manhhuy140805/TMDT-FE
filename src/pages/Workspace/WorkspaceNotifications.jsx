import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import api from "../../services/api";

const WorkspaceNotifications = () => {
  const { notifications: initialNotifications } = useOutletContext();
  const [notifications, setNotifications] = useState(initialNotifications || []);

  const getTypeIcon = (loai) => {
    switch (loai) {
      case "CongViec": return "fa-solid fa-briefcase";
      case "ThanhToan": return "fa-solid fa-credit-card";
      case "TranhChap": return "fa-solid fa-scale-balanced";
      case "HeThong": return "fa-solid fa-gear";
      default: return "fa-solid fa-bell";
    }
  };

  const getTypeColor = (loai) => {
    switch (loai) {
      case "CongViec": return "#0EA5E9";
      case "ThanhToan": return "#10B981";
      case "TranhChap": return "#F59E0B";
      case "HeThong": return "#6366F1";
      default: return "#64748B";
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      const now = new Date();
      const diff = now - d;
      if (diff < 60000) return "Vừa xong";
      if (diff < 3600000) return `${Math.floor(diff / 60000)} phút trước`;
      if (diff < 86400000) return `${Math.floor(diff / 3600000)} giờ trước`;
      if (diff < 604800000) return `${Math.floor(diff / 86400000)} ngày trước`;
      return d.toLocaleDateString("vi-VN");
    } catch {
      return "";
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await api.notifications.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.thongBaoId === id ? { ...n, daDoc: true } : n))
      );
    } catch (err) {
      console.warn("Mark as read failed:", err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.notifications.delete(id);
      setNotifications((prev) => prev.filter((n) => n.thongBaoId !== id));
    } catch (err) {
      console.warn("Delete notification failed:", err.message);
    }
  };

  const handleMarkAllRead = async () => {
    const unread = notifications.filter((n) => !n.daDoc);
    await Promise.allSettled(
      unread.map((n) => api.notifications.markAsRead(n.thongBaoId))
    );
    setNotifications((prev) => prev.map((n) => ({ ...n, daDoc: true })));
  };

  const unreadCount = notifications.filter((n) => !n.daDoc).length;

  return (
    <div className="wl-content-box">
      <div className="wl-content-header" style={{ marginBottom: "16px" }}>
        <h2>
          Thông báo
          {unreadCount > 0 && (
            <span style={{ marginLeft: "12px", fontSize: "14px", background: "#EF4444", color: "white", padding: "2px 10px", borderRadius: "12px" }}>
              {unreadCount} mới
            </span>
          )}
        </h2>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            style={{ padding: "8px 16px", border: "1px solid #E2E8F0", borderRadius: "8px", background: "white", color: "#0EA5E9", fontWeight: 600, cursor: "pointer", fontSize: "13px" }}
          >
            <i className="fa-solid fa-check-double"></i> Đánh dấu tất cả đã đọc
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div style={{ color: "#64748B", fontSize: "15px", padding: "60px 20px", textAlign: "center", border: "1px dashed #CBD5E1", borderRadius: "12px" }}>
          <i className="fa-regular fa-bell" style={{ fontSize: "40px", color: "#E2E8F0", marginBottom: "16px", display: "block" }}></i>
          <p>Không có thông báo nào.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {notifications.map((noti) => (
            <div
              key={noti.thongBaoId}
              style={{
                padding: "16px 20px",
                borderRadius: "10px",
                border: "1px solid #E2E8F0",
                background: noti.daDoc ? "#FFFFFF" : "#F0F9FF",
                display: "flex",
                gap: "16px",
                alignItems: "flex-start",
                transition: "0.2s",
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  background: `${getTypeColor(noti.loaiThongBao)}15`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <i className={getTypeIcon(noti.loaiThongBao)} style={{ color: getTypeColor(noti.loaiThongBao), fontSize: "16px" }}></i>
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ fontWeight: noti.daDoc ? 500 : 700, color: "#0F172A", fontSize: "14px", marginBottom: "4px" }}>
                    {noti.tieuDe}
                  </div>
                  <div style={{ fontSize: "12px", color: "#94A3B8", whiteSpace: "nowrap", marginLeft: "12px" }}>
                    {formatDate(noti.ngayTao)}
                  </div>
                </div>
                <div style={{ fontSize: "13px", color: "#64748B", lineHeight: "1.5" }}>
                  {noti.noiDung}
                </div>
                <div style={{ marginTop: "8px", display: "flex", gap: "12px" }}>
                  {!noti.daDoc && (
                    <button
                      onClick={() => handleMarkAsRead(noti.thongBaoId)}
                      style={{ fontSize: "12px", color: "#0EA5E9", background: "none", border: "none", cursor: "pointer", padding: 0, fontWeight: 600 }}
                    >
                      Đánh dấu đã đọc
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(noti.thongBaoId)}
                    style={{ fontSize: "12px", color: "#EF4444", background: "none", border: "none", cursor: "pointer", padding: 0, fontWeight: 600 }}
                  >
                    Xóa
                  </button>
                </div>
              </div>

              {!noti.daDoc && (
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#0EA5E9", flexShrink: 0, marginTop: "6px" }}></div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WorkspaceNotifications;
