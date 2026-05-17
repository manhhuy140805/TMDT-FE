import { useOutletContext } from "react-router-dom";

const WorkspaceNotifications = () => {
  const { currentUser } = useOutletContext();

  return (
    <div className="wl-content-box">
      <div className="wl-content-header">
        <h2>Thông báo</h2>
      </div>

      <div style={{ color: "#64748B", fontSize: "15px", padding: "60px 20px", textAlign: "center", border: "1px dashed #CBD5E1", borderRadius: "12px" }}>
        <i className="fa-regular fa-bell" style={{ fontSize: "40px", color: "#E2E8F0", marginBottom: "16px" }}></i>
        <p>Không có thông báo mới nào.</p>
      </div>
    </div>
  );
};

export default WorkspaceNotifications;
