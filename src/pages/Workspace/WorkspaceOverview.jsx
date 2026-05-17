import { useOutletContext, Link, useNavigate } from "react-router-dom";

const WorkspaceOverview = () => {
  const { currentUser, stats, jobs, conversations } = useOutletContext();
  const navigate = useNavigate();

  const formatCurrency = (amount) => new Intl.NumberFormat("vi-VN").format(amount) + " VNĐ";

  const getStatusBadge = (status) => {
    if (status === "DANG_THUC_HIEN") return <span style={{ background: "#DBEAFE", color: "#1D4ED8", padding: "4px 8px", borderRadius: "4px", fontSize: "12px", fontWeight: 600 }}>Đang làm</span>;
    if (status === "HOAN_THANH") return <span style={{ background: "#D1FAE5", color: "#047857", padding: "4px 8px", borderRadius: "4px", fontSize: "12px", fontWeight: 600 }}>Hoàn thành</span>;
    return <span style={{ background: "#F1F5F9", color: "#64748B", padding: "4px 8px", borderRadius: "4px", fontSize: "12px", fontWeight: 600 }}>{status}</span>;
  };

  return (
    <div className="wl-content-box">
      <div className="wl-content-header">
        <h2>Tổng quan hệ thống</h2>
      </div>
      
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "24px", marginBottom: "32px" }}>
        <div style={{ background: "#F8FAFC", padding: "20px", borderRadius: "12px", border: "1px solid #E2E8F0" }}>
          <div style={{ fontSize: "14px", color: "#64748B", marginBottom: "8px" }}>Dự án đang thực hiện</div>
          <div style={{ fontSize: "28px", fontWeight: "700", color: "#0F172A" }}>{stats.activeJobs}</div>
        </div>
        <div style={{ background: "#F8FAFC", padding: "20px", borderRadius: "12px", border: "1px solid #E2E8F0" }}>
          <div style={{ fontSize: "14px", color: "#64748B", marginBottom: "8px" }}>Dự án hoàn thành</div>
          <div style={{ fontSize: "28px", fontWeight: "700", color: "#0F172A" }}>{stats.completedJobs}</div>
        </div>
        <div style={{ background: "#F8FAFC", padding: "20px", borderRadius: "12px", border: "1px solid #E2E8F0" }}>
          <div style={{ fontSize: "14px", color: "#64748B", marginBottom: "8px" }}>Tổng {currentUser?.vaiTro === "NguoiThue" ? "chi phí" : "thu nhập"}</div>
          <div style={{ fontSize: "28px", fontWeight: "700", color: "#0F172A" }}>{formatCurrency(stats.totalEarnings)}</div>
        </div>
        <div style={{ background: "#F8FAFC", padding: "20px", borderRadius: "12px", border: "1px solid #E2E8F0" }}>
          <div style={{ fontSize: "14px", color: "#64748B", marginBottom: "8px" }}>Đánh giá trung bình</div>
          <div style={{ fontSize: "28px", fontWeight: "700", color: "#0F172A" }}>{stats.avgRating} <i className="fa-solid fa-star" style={{fontSize:"16px", color:"#F59E0B"}}></i></div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3 style={{ fontSize: "16px", color: "#0F172A", margin: 0 }}>Công việc đang làm</h3>
            <Link to="/workspace/jobs" style={{ fontSize: "14px", color: "#0EA5E9", textDecoration: "none" }}>Xem tất cả</Link>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {jobs.filter(j => j.status === "DANG_THUC_HIEN").slice(0, 3).map(job => (
              <div key={job.id} style={{ padding: "16px", background: "#F8FAFC", borderRadius: "8px", border: "1px solid #E2E8F0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                  <div style={{ fontWeight: 600, color: "#0F172A" }}>{job.title}</div>
                  {getStatusBadge(job.status)}
                </div>
                <div style={{ fontSize: "13px", color: "#64748B" }}>
                  <i className="fa-regular fa-clock"></i> Hạn: {job.endDate}
                </div>
              </div>
            ))}
            {jobs.filter(j => j.status === "DANG_THUC_HIEN").length === 0 && (
              <div style={{ color: "#64748B", fontSize: "14px", padding: "32px", textAlign: "center", background: "#F8FAFC", borderRadius: "8px" }}>
                Không có công việc nào đang thực hiện.
              </div>
            )}
          </div>
        </div>
        
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3 style={{ fontSize: "16px", color: "#0F172A", margin: 0 }}>Tin nhắn mới</h3>
            <Link to="/workspace/messages" style={{ fontSize: "14px", color: "#0EA5E9", textDecoration: "none" }}>Hộp thư</Link>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {conversations.slice(0, 3).map(conv => (
              <div key={conv.id} style={{ padding: "12px", background: "#F8FAFC", borderRadius: "8px", border: "1px solid #E2E8F0", display: "flex", gap: "12px", alignItems: "center", cursor: "pointer" }} onClick={() => navigate(`/workspace/messages/${conv.id}`)}>
                <img src={conv.participant1.avatar} alt="Avatar" style={{ width: "40px", height: "40px", borderRadius: "50%" }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div style={{ fontWeight: 600, fontSize: "14px", color: "#0F172A" }}>{conv.participant1.name}</div>
                    <div style={{ fontSize: "12px", color: "#94A3B8" }}>{conv.lastMessageTimeText}</div>
                  </div>
                  <div style={{ fontSize: "13px", color: "#64748B", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "200px" }}>{conv.lastMessage}</div>
                </div>
              </div>
            ))}
            {conversations.length === 0 && (
              <div style={{ color: "#64748B", fontSize: "14px", padding: "32px", textAlign: "center", background: "#F8FAFC", borderRadius: "8px" }}>
                Không có tin nhắn nào.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceOverview;
