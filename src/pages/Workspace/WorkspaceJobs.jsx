import { useState, useEffect } from "react";
import { useOutletContext, useLocation } from "react-router-dom";
import PostRequestPage from "../PostRequest/PostRequestPage";

const WorkspaceJobs = () => {
  const { currentUser, jobs } = useOutletContext();
  const location = useLocation();
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [filter, setFilter] = useState("ALL"); // ALL, ACTIVE, COMPLETED

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("action") === "new") {
      setShowCreateProject(true);
    }
  }, [location.search]);

  if (showCreateProject && currentUser?.vaiTro === "NguoiThue") {
    return (
      <div style={{ padding: "0 0 40px 0" }}>
        <PostRequestPage isEmbedded={true} onCancel={() => setShowCreateProject(false)} />
      </div>
    );
  }

  const filteredJobs = jobs.filter(j => filter === "ALL" ? true : filter === "ACTIVE" ? j.status === "DANG_THUC_HIEN" : j.status === "HOAN_THANH");

  const getStatusBadge = (status) => {
    if (status === "DANG_THUC_HIEN") return <span style={{ background: "#DBEAFE", color: "#1D4ED8", padding: "4px 8px", borderRadius: "4px", fontSize: "12px", fontWeight: 600 }}>Đang làm</span>;
    if (status === "HOAN_THANH") return <span style={{ background: "#D1FAE5", color: "#047857", padding: "4px 8px", borderRadius: "4px", fontSize: "12px", fontWeight: 600 }}>Hoàn thành</span>;
    return <span style={{ background: "#F1F5F9", color: "#64748B", padding: "4px 8px", borderRadius: "4px", fontSize: "12px", fontWeight: 600 }}>{status}</span>;
  };

  return (
    <div className="wl-content-box">
      <div className="wl-content-header" style={{ marginBottom: "16px" }}>
        <h2>{currentUser?.vaiTro === "Freelancer" ? "Công việc của tôi" : "Dự án của tôi"}</h2>
        {currentUser?.vaiTro === "NguoiThue" && (
          <button className="btn-wl-primary" onClick={() => setShowCreateProject(true)}>
            <i className="fa-solid fa-plus"></i> Đăng yêu cầu mới
          </button>
        )}
      </div>

      <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
        <button onClick={() => setFilter("ALL")} style={{ padding: "6px 16px", borderRadius: "20px", border: "1px solid #E2E8F0", background: filter === "ALL" ? "#0F172A" : "#F8FAFC", color: filter === "ALL" ? "white" : "#64748B", fontWeight: 600, cursor: "pointer", transition: "0.2s" }}>
          Tất cả ({jobs.length})
        </button>
        <button onClick={() => setFilter("ACTIVE")} style={{ padding: "6px 16px", borderRadius: "20px", border: "1px solid #E2E8F0", background: filter === "ACTIVE" ? "#0F172A" : "#F8FAFC", color: filter === "ACTIVE" ? "white" : "#64748B", fontWeight: 600, cursor: "pointer", transition: "0.2s" }}>
          Đang làm ({jobs.filter(j => j.status === "DANG_THUC_HIEN").length})
        </button>
        <button onClick={() => setFilter("COMPLETED")} style={{ padding: "6px 16px", borderRadius: "20px", border: "1px solid #E2E8F0", background: filter === "COMPLETED" ? "#0F172A" : "#F8FAFC", color: filter === "COMPLETED" ? "white" : "#64748B", fontWeight: 600, cursor: "pointer", transition: "0.2s" }}>
          Hoàn thành ({jobs.filter(j => j.status === "HOAN_THANH").length})
        </button>
      </div>

      {filteredJobs.length === 0 ? (
        <div style={{ color: "#64748B", fontSize: "15px", padding: "60px 20px", textAlign: "center", border: "1px dashed #CBD5E1", borderRadius: "12px" }}>
          <i className="fa-solid fa-folder-open" style={{ fontSize: "40px", color: "#E2E8F0", marginBottom: "16px" }}></i>
          <p>Hiện chưa có công việc/dự án nào được tạo.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "16px" }}>
          {filteredJobs.map(job => (
            <div key={job.id} style={{ padding: "20px", border: "1px solid #E2E8F0", borderRadius: "12px", background: "white" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                <div>
                  <h3 style={{ margin: "0 0 8px 0", color: "#0F172A", fontSize: "18px" }}>{job.title}</h3>
                  <div style={{ display: "flex", gap: "16px", color: "#64748B", fontSize: "14px" }}>
                    <span><i className="fa-solid fa-user"></i> {currentUser?.vaiTro === "NguoiThue" ? job.freelancer?.name || "Chưa có" : job.employer?.name}</span>
                    <span><i className="fa-regular fa-clock"></i> {job.startDate || "Chưa bắt đầu"} - {job.endDate || "Chưa có"}</span>
                  </div>
                </div>
                {getStatusBadge(job.status)}
              </div>
              <p style={{ color: "#475569", fontSize: "14px", lineHeight: "1.5", margin: "0 0 16px 0" }}>{job.description?.substring(0, 150)}...</p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #F1F5F9", paddingTop: "16px" }}>
                <div style={{ fontWeight: 600, color: "#0F172A" }}>{job.agreedPriceText || "Chưa thỏa thuận"}</div>
                {job.status === "DANG_THUC_HIEN" && (
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ width: "120px", height: "6px", background: "#E2E8F0", borderRadius: "4px", overflow: "hidden" }}>
                      <div style={{ width: `${job.progress || 0}%`, height: "100%", background: "#0EA5E9" }}></div>
                    </div>
                    <span style={{ fontSize: "13px", fontWeight: 600, color: "#0EA5E9" }}>{job.progress || 0}%</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WorkspaceJobs;
