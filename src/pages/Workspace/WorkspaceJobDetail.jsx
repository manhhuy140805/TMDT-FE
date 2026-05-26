import { useState, useEffect } from "react";
import {
  useParams,
  useNavigate,
  Link,
  useOutletContext,
} from "react-router-dom";
import api from "../../services/api";
import "./WorkspaceJobDetail.css";

const WorkspaceJobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast, refreshWorkspaceData } = useOutletContext();

  const [contract, setContract] = useState(null);
  const [progressList, setProgressList] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // Form thêm tiến độ
  const [showAddProgress, setShowAddProgress] = useState(false);
  const [newProgress, setNewProgress] = useState({
    tieuDe: "",
    moTa: "",
    phanTram: 0,
  });
  const [submitting, setSubmitting] = useState(false);
  const [showRefundRequest, setShowRefundRequest] = useState(false);
  const [refundReason, setRefundReason] = useState("");
  const [decisionSubmitting, setDecisionSubmitting] = useState(false);
  const [refundRequest, setRefundRequest] = useState(null);

  // Custom Confirmation Modal state
  const [confirmModal, setConfirmModal] = useState({
    show: false,
    title: "",
    message: "",
    type: "info", // success, warning, danger, info
    confirmText: "Xác nhận",
    cancelText: "Hủy",
    onConfirm: null,
  });

  const showConfirm = (title, message, type = "info", onConfirm, confirmText = "Xác nhận", cancelText = "Hủy") => {
    setConfirmModal({
      show: true,
      title,
      message,
      type,
      confirmText,
      cancelText,
      onConfirm,
    });
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setCurrentUser(parsed?.user ?? parsed);
      } catch {
        navigate("/login");
      }
    } else {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    if (!id || !currentUser) return;
    fetchData();
  }, [id, currentUser]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [contractRes, progressRes, paymentsRes, refundRes] = await Promise.allSettled([
        api.contracts.getDetail(id),
        api.progress.getByContractId(id),
        api.payments.getByContractId(id),
        api.refundRequests.getByContractId(id),
      ]);

      console.log("[WorkspaceJobDetail] contractRes:", contractRes);
      console.log("[WorkspaceJobDetail] progressRes:", progressRes);
      console.log("[WorkspaceJobDetail] paymentsRes:", paymentsRes);
      console.log("[WorkspaceJobDetail] refundRes:", refundRes);

      // Contract
      if (contractRes.status === "fulfilled") {
        const c =
          contractRes.value?.contract ||
          contractRes.value?.data ||
          contractRes.value;
        console.log("[WorkspaceJobDetail] contract:", c);
        setContract(c);
      } else {
        setError("Không tìm thấy hợp đồng");
      }

      // Progress
      if (progressRes.status === "fulfilled") {
        const list =
          progressRes.value?.progress ||
          progressRes.value?.data ||
          (Array.isArray(progressRes.value) ? progressRes.value : []);
        console.log("[WorkspaceJobDetail] progressList:", list);
        setProgressList(list);
      }

      // Payments
      if (paymentsRes.status === "fulfilled") {
        const list =
          paymentsRes.value?.payments ||
          paymentsRes.value?.data ||
          (Array.isArray(paymentsRes.value) ? paymentsRes.value : []);
        console.log("[WorkspaceJobDetail] payments:", list);
        setPayments(list);
      }

      // Refund Requests
      if (refundRes.status === "fulfilled") {
        const resVal = refundRes.value;
        console.log("[WorkspaceJobDetail] raw refund request response:", resVal);
        
        // Hỗ trợ cả danh sách dạng số nhiều refundRequests lẫn số ít refundRequest
        const rr = resVal?.refundRequest ?? 
                   resVal?.refundRequests ?? 
                   resVal?.data?.refundRequest ?? 
                   resVal?.data?.refundRequests ?? 
                   resVal?.data ?? 
                   resVal;
                   
        const finalRR = Array.isArray(rr) ? rr[rr.length - 1] : rr;
        if (finalRR && (finalRR.trangThai || finalRR.status || finalRR.refundRequestId || finalRR.id)) {
          console.log("[WorkspaceJobDetail] refundRequest loaded successfully:", finalRR);
          setRefundRequest(finalRR);
        } else {
          setRefundRequest(null);
        }
      } else {
        setRefundRequest(null);
      }
    } catch (err) {
      setError(err.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  const handleAddProgress = async () => {
    if (!newProgress.tieuDe.trim())
      return showToast("Vui lòng nhập tiêu đề!", "warning");
    if (newProgress.phanTram < 0 || newProgress.phanTram > 100)
      return showToast("Phần trăm phải từ 0-100!", "warning");

    setSubmitting(true);
    try {
      const userId = currentUser.taiKhoanId || currentUser.id;
      await api.progress.create(id, {
        congViecId: Number(id),
        freelancerId: userId,
        tieuDe: newProgress.tieuDe,
        moTa: newProgress.moTa || undefined,
        phanTram: Number(newProgress.phanTram),
      });
      setNewProgress({ tieuDe: "", moTa: "", phanTram: 0 });
      setShowAddProgress(false);
      showToast("Cập nhật tiến độ thành công!", "success");
      // Reload progress
      const res = await api.progress.getByContractId(id);
      const list =
        res?.progress || res?.data || (Array.isArray(res) ? res : []);
      setProgressList(list);
    } catch (err) {
      showToast("Lỗi: " + (err.message || "Không thể thêm tiến độ"), "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmProgress = async (progressId) => {
    const supervisorAccountId = currentUser?.taiKhoanId || currentUser?.id;
    if (!supervisorAccountId) {
      showToast("Không xác định được tài khoản giám sát!", "error");
      return;
    }
    try {
      await api.progress.update(progressId, {
        trangThaiXacNhan: "DaXacNhan",
        xacNhanBoi: Number(supervisorAccountId),
      });
      showToast("Đã xác nhận tiến độ này!", "success");
      setProgressList((prev) =>
        prev.map((p) =>
          p.tienDoId === progressId
            ? { ...p, trangThaiXacNhan: "DaXacNhan" }
            : p,
        ),
      );
    } catch (err) {
      showToast("Lỗi: " + (err.message || "Không thể xác nhận"), "error");
    }
  };

  const handleRejectProgress = async (progressId) => {
    const supervisorAccountId = currentUser?.taiKhoanId || currentUser?.id;
    if (!supervisorAccountId) {
      showToast("Không xác định được tài khoản giám sát!", "error");
      return;
    }
    try {
      await api.progress.update(progressId, {
        trangThaiXacNhan: "TuChoi",
        xacNhanBoi: Number(supervisorAccountId),
      });
      showToast("Đã từ chối tiến độ này!", "warning");
      setProgressList((prev) =>
        prev.map((p) =>
          p.tienDoId === progressId ? { ...p, trangThaiXacNhan: "TuChoi" } : p,
        ),
      );
    } catch (err) {
      showToast("Lỗi: " + (err.message || "Không thể từ chối"), "error");
    }
  };

  const handleCompleteContract = () => {
    showConfirm(
      "Xác nhận hoàn thành",
      "Xác nhận hoàn thành hợp đồng? Hành động này không thể hoàn tác và số tiền thanh toán sẽ được giải ngân cho freelancer.",
      "success",
      async () => {
        setDecisionSubmitting(true);
        try {
          await api.contracts.updateStatus(id, "HoanThanh");
          showToast("Đã cập nhật trạng thái hoàn thành hợp đồng!", "success");
          setContract((prev) => ({ ...prev, trangThai: "HoanThanh" }));
        } catch (err) {
          showToast("Lỗi: " + (err.message || "Không thể cập nhật"), "error");
        } finally {
          setDecisionSubmitting(false);
        }
      }
    );
  };

  const handleRequestRevision = () => {
    const activeUserId = currentUser?.taiKhoanId || currentUser?.id;
    if (!activeUserId) {
      showToast("Không xác định được tài khoản!", "error");
      return;
    }

    const submittedCompletion = progressList.find(
      (item) =>
        Number(item.phanTram) >= 100 && item.trangThaiXacNhan !== "TuChoi",
    );

    if (!submittedCompletion?.tienDoId) {
      showToast("Không tìm thấy tiến độ hoàn thành để yêu cầu làm lại.", "error");
      return;
    }

    showConfirm(
      "Yêu cầu làm lại",
      "Yêu cầu freelancer làm lại kết quả đã bàn giao? Tiến độ hoàn thành sẽ được chuyển về trạng thái từ chối.",
      "warning",
      async () => {
        setDecisionSubmitting(true);
        try {
          await api.progress.update(submittedCompletion.tienDoId, {
            trangThaiXacNhan: "TuChoi",
            xacNhanBoi: Number(activeUserId),
          });
          setProgressList((prev) =>
            prev.map((item) =>
              item.tienDoId === submittedCompletion.tienDoId
                ? { ...item, trangThaiXacNhan: "TuChoi" }
                : item,
            ),
          );
          showToast("Đã gửi yêu cầu làm lại cho freelancer.", "warning");
        } catch (err) {
          showToast("Lỗi: " + (err.message || "Không thể yêu cầu làm lại"), "error");
        } finally {
          setDecisionSubmitting(false);
        }
      }
    );
  };

  const handleRequestRefund = async () => {
    if (!refundReason.trim()) {
      showToast("Vui lòng nhập lý do yêu cầu hoàn tiền.", "warning");
      return;
    }

    const activeUserId = currentUser?.taiKhoanId || currentUser?.id;
    if (!activeUserId) {
      showToast("Không xác định được tài khoản!", "error");
      return;
    }

    setDecisionSubmitting(true);
    try {
      const res = await api.refundRequests.create({
        congViecId: Number(id),
        nguoiThueId: Number(activeUserId),
        lyDo: refundReason.trim(),
        moTa: refundReason.trim()
      });
      const rr = res?.refundRequest ?? res?.data ?? res;
      if (rr && (rr.trangThai || rr.status)) {
        console.log("[WorkspaceJobDetail] refundRequest created successfully:", rr);
        setRefundRequest(rr);
      }
      setShowRefundRequest(false);
      setRefundReason("");
      showToast("Đã gửi yêu cầu hoàn tiền. Đang chờ freelancer phản hồi.", "success");
      fetchData(); // Backup reload
    } catch (err) {
      showToast(
        "Lỗi: " + (err.message || "Không thể gửi yêu cầu hoàn tiền"),
        "error",
      );
    } finally {
      setDecisionSubmitting(false);
    }
  };

  const handleAcceptRefund = async () => {
    const activeUserId = currentUser?.taiKhoanId || currentUser?.id;
    if (!activeUserId) return showToast("Không xác định được tài khoản!", "error");
    if (!refundRequest) return showToast("Không tìm thấy yêu cầu hoàn tiền!", "error");

    showConfirm(
      "Đồng ý hoàn tiền",
      "Bạn có chắc chắn đồng ý hoàn tiền? Hợp đồng sẽ bị hủy và tiền ký quỹ sẽ được hoàn trả/phân chia theo quy tắc hệ thống.",
      "warning",
      async () => {
        setDecisionSubmitting(true);
        try {
          const reqId = refundRequest.refundRequestId || refundRequest.id;
          await api.refundRequests.accept(reqId, Number(activeUserId));
          setContract((prev) => prev ? { ...prev, trangThai: "DaHuy" } : prev);
          setRefundRequest((prev) => prev ? { ...prev, trangThai: "DaChapNhan" } : prev);
          showToast("Đã đồng ý hoàn tiền và hủy hợp đồng thành công!", "success");
          await Promise.all([fetchData(), refreshWorkspaceData?.()]);
        } catch (err) {
          showToast("Lỗi: " + (err.message || "Không thể đồng ý hoàn tiền"), "error");
        } finally {
          setDecisionSubmitting(false);
        }
      }
    );
  };

  const handleRejectRefund = async () => {
    const activeUserId = currentUser?.taiKhoanId || currentUser?.id;
    if (!activeUserId) return showToast("Không xác định được tài khoản!", "error");
    if (!refundRequest) return showToast("Không tìm thấy yêu cầu hoàn tiền!", "error");

    showConfirm(
      "Từ chối hoàn tiền",
      "Bạn từ chối hoàn tiền? Hợp đồng sẽ tự động chuyển sang trạng thái Tranh Chấp và Đơn vị giám sát sẽ tiến hành phân xử.",
      "danger",
      async () => {
        setDecisionSubmitting(true);
        try {
          const reqId = refundRequest.refundRequestId || refundRequest.id;
          await api.refundRequests.reject(reqId, Number(activeUserId));
          setContract((prev) => prev ? { ...prev, trangThai: "TranhChap" } : prev);
          setRefundRequest((prev) => prev ? { ...prev, trangThai: "TuChoi" } : prev);
          showToast("Đã từ chối hoàn tiền. Hệ thống đã chuyển hợp đồng sang Tranh chấp.", "warning");
          await Promise.all([fetchData(), refreshWorkspaceData?.()]);
        } catch (err) {
          showToast("Lỗi: " + (err.message || "Không thể từ chối hoàn tiền"), "error");
        } finally {
          setDecisionSubmitting(false);
        }
      }
    );
  };

  const handleChatWithUser = async (targetId, targetName) => {
    if (!currentUser) {
      showToast("Vui lòng đăng nhập để nhắn tin!", "warning");
      navigate("/login");
      return;
    }
    if (!targetId) {
      showToast("Không tìm thấy thông tin đối tác!", "error");
      return;
    }

    const currentUserId = currentUser.taiKhoanId || currentUser.id;

    // Bước 1: Tìm conversation hiện có cùng partner + contractId
    let contexts = {};
    try {
      contexts = JSON.parse(localStorage.getItem("chat_contexts") || "{}");
    } catch {
      contexts = {};
    }

    try {
      const listRes = await api.chat.getConversations(currentUserId);
      const list =
        listRes?.conversations ||
        listRes?.data ||
        (Array.isArray(listRes) ? listRes : []);

      // Bước 1: Ưu tiên tìm cuộc hội thoại đã liên kết trực tiếp với Hợp đồng này (Group Chat)
      const existingByContract = list.find(
        (c) => Number(c.congViecId) === Number(id),
      );
      if (existingByContract) {
        const existingId =
          existingByContract.cuocHoiThoaiId ?? existingByContract.id;
        navigate(`/workspace/messages?conversationId=${existingId}`);
        return;
      }

      // Fallback: Tìm conversation hiện có theo cặp thành viên
      const existing = list.find((c) => {
        const m1 = Number(c.thanhVien1?.taiKhoanId);
        const m2 = Number(c.thanhVien2?.taiKhoanId);
        const isSamePair =
          (m1 === Number(currentUserId) && m2 === Number(targetId)) ||
          (m2 === Number(currentUserId) && m1 === Number(targetId));
        if (!isSamePair) return false;

        const convId = c.cuocHoiThoaiId ?? c.id;
        const ctx = contexts[convId];
        const isLinkedToContract =
          Number(c.congViecId) === Number(id) ||
          (ctx?.type === "contract" && Number(ctx.id) === Number(id));
        return isLinkedToContract;
      });

      if (existing) {
        const existingId = existing.cuocHoiThoaiId ?? existing.id;
        navigate(`/workspace/messages?conversationId=${existingId}`);
        return;
      }
    } catch (err) {
      console.warn("Không lấy được danh sách hội thoại:", err.message);
    }

    // Bước 2: Tạo conversation mới
    try {
      const res = await api.chat.createConversation({
        thanhVien1Id: currentUserId,
        thanhVien2Id: targetId,
        congViecId: Number(id), // Link conversation with this contract
      });
      const conv = res?.conversation ?? res;
      const conversationId = conv?.cuocHoiThoaiId ?? conv?.id;
      if (conversationId && contract) {
        contexts[conversationId] = {
          type: "contract",
          id: id,
          title: contract.yeuCau?.tieuDe || "Dự án",
        };
        try {
          localStorage.setItem("chat_contexts", JSON.stringify(contexts));
        } catch (e) {
          console.warn("Không thể lưu chat context:", e);
        }
      }
      navigate(`/workspace/messages?conversationId=${conversationId}`);
    } catch (err) {
      console.error("Lỗi tạo hội thoại:", err);
      showToast("Không thể tạo cuộc trò chuyện!", "error");
    }
  };

  // Helpers
  const formatCurrency = (amount) => {
    if (!amount) return "0 VNĐ";
    return new Intl.NumberFormat("vi-VN").format(Number(amount)) + " VNĐ";
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    try {
      return new Date(dateStr).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const getLatestProgress = () => {
    const acceptedSubmissions = progressList.filter(
      (item) => item.trangThaiXacNhan !== "TuChoi",
    );
    if (acceptedSubmissions.length === 0) return 0;
    return Math.max(...acceptedSubmissions.map((item) => item.phanTram || 0));
  };

  const getStatusBadge = (status) => {
    if (status === "DangThucHien" && refundRequest && refundRequest.trangThai === "ChoFreelancerDuyet") {
      return (
        <span
          style={{
            background: "#FFFBEB",
            color: "#D97706",
            padding: "4px 12px",
            borderRadius: "6px",
            fontSize: "13px",
            fontWeight: 600,
            border: "1px solid #FCD34D",
          }}
        >
          Đang yêu cầu hoàn tiền
        </span>
      );
    }

    const map = {
      DangThucHien: {
        bg: "#DBEAFE",
        color: "#1D4ED8",
        label: "Đang thực hiện",
      },
      HoanThanh: { bg: "#D1FAE5", color: "#047857", label: "Hoàn thành" },
      TamDung: { bg: "#FEF3C7", color: "#D97706", label: "Tạm dừng" },
      DaHuy: { bg: "#FEE2E2", color: "#DC2626", label: "Đã hủy" },
      TranhChap: { bg: "#FEF3C7", color: "#B45309", label: "Tranh chấp" },
    };
    const s = map[status] || { bg: "#F1F5F9", color: "#64748B", label: status };
    return (
      <span
        style={{
          background: s.bg,
          color: s.color,
          padding: "4px 12px",
          borderRadius: "6px",
          fontSize: "13px",
          fontWeight: 600,
        }}
      >
        {s.label}
      </span>
    );
  };

  const getProgressStatusBadge = (status) => {
    const map = {
      ChuaXacNhan: { bg: "#FEF3C7", color: "#D97706", label: "Chờ xác nhận" },
      DaXacNhan: { bg: "#D1FAE5", color: "#047857", label: "Đã xác nhận" },
      TuChoi: { bg: "#FEE2E2", color: "#DC2626", label: "Từ chối" },
    };
    const s = map[status] || {
      bg: "#F1F5F9",
      color: "#64748B",
      label: status || "Chờ xác nhận",
    };
    return (
      <span
        style={{
          background: s.bg,
          color: s.color,
          padding: "3px 8px",
          borderRadius: "4px",
          fontSize: "11px",
          fontWeight: 600,
        }}
      >
        {s.label}
      </span>
    );
  };

  const userId = currentUser?.taiKhoanId || currentUser?.id;
  const isEmployer =
    contract && (Number(contract.nguoiThue?.taiKhoanId) === Number(userId) || Number(contract.nguoiThueId) === Number(userId));
  const isFreelancer =
    contract && (Number(contract.freelancer?.taiKhoanId) === Number(userId) || Number(contract.freelancerId) === Number(userId));
  const isSupervisor =
    contract &&
    currentUser?.vaiTro === "DonViGiamSat" &&
    (Number(contract.giamSatId) === Number(userId) || Number(contract.giamSat?.taiKhoanId) === Number(userId));

  const getNormalizedStatus = (rr) => {
    if (!rr) return "";
    const statusVal = rr.trangThai || rr.status || "";
    return statusVal.toString().toUpperCase().replace(/_/g, "");
  };

  const isPendingRefund = refundRequest && 
    (getNormalizedStatus(refundRequest) === "CHOFREELANCERDUYET" || 
     getNormalizedStatus(refundRequest) === "PENDING" || 
     getNormalizedStatus(refundRequest) === "CHODUYET");

  // Safe override to ensure correct supervisor details are displayed
  if (
    contract &&
    (currentUser?.vaiTro === "DonViGiamSat" ||
      Number(contract.giamSatId) === Number(userId))
  ) {
    contract.giamSat = {
      ...contract.giamSat,
      taiKhoanId: userId,
      tenDonVi: currentUser.tenDonVi || currentUser.hoTen || "Đơn vị giám sát",
      hoTen: currentUser.hoTen,
      email: currentUser.email,
      soDienThoai: currentUser.soDienThoai,
      anhDaiDien: currentUser.anhDaiDien || contract.giamSat?.anhDaiDien,
      nangLuc: currentUser.nangLuc || contract.giamSat?.nangLuc,
      chungChi: currentUser.chungChi || contract.giamSat?.chungChi,
    };
  }

  const overallProgress = getLatestProgress();

  const systemHeldAmount = (Array.isArray(payments) ? payments : []).reduce(
    (acc, p) => {
      if (p.trangThai === "ThanhCong") {
        if (p.loaiTT === "DatCoc") return acc + Number(p.soTien || 0);
        if (p.loaiTT === "ThanhToan" || p.loaiTT === "HoanTien")
          return acc - Number(p.soTien || 0);
      }
      return acc;
    },
    0,
  );

  if (loading) {
    return (
      <div className="wjd-loading">
        <i className="fa-solid fa-circle-notch fa-spin"></i>
        <p>Đang tải thông tin hợp đồng...</p>
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div className="wjd-error">
        <i className="fa-solid fa-triangle-exclamation"></i>
        <h3>Không tìm thấy hợp đồng</h3>
        <p>
          {error || "Hợp đồng không tồn tại hoặc bạn không có quyền truy cập."}
        </p>
        <Link to="/workspace/jobs" className="wjd-btn-back">
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  return (
    <div className="wjd-container">
      {/* Header */}
      <div className="wjd-header">
        <div className="wjd-header-left">
          <button
            className="wjd-back-btn"
            onClick={() => navigate("/workspace/jobs")}
          >
            <i className="fa-solid fa-arrow-left"></i>
          </button>
          <div>
            <h1 className="wjd-title">
              {contract.yeuCau?.tieuDe || "Công việc"}
            </h1>
            <div className="wjd-subtitle">
              Hợp đồng #{contract.congViecId} •{" "}
              {getStatusBadge(contract.trangThai)}
            </div>
          </div>
        </div>
      </div>

      <div className="wjd-grid">
        {/* Main Content */}
        <div className="wjd-main">
          {/* Communication Hub */}
          <div className="wjd-card wjd-comm-hub">
            <div className="wjd-comm-header">
              <h2>
                <i className="fa-solid fa-comments"></i> Trung tâm trao đổi &
                Chat trực tuyến
              </h2>
              <span className="wjd-comm-status">
                <span className="wjd-comm-dot"></span> Sẵn sàng kết nối
              </span>
            </div>
            <div className="wjd-comm-grid">
              {/* If user is Employer, show Freelancer & Supervisor */}
              {isEmployer && (
                <>
                  {contract.freelancer && (
                    <div className="wjd-comm-member">
                      <div className="wjd-comm-avatar-wrapper">
                        <img
                          src={
                            contract.freelancer.anhDaiDien ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(contract.freelancer.hoTen || "F")}&background=10B981&color=fff&size=40`
                          }
                          alt=""
                          className="wjd-comm-avatar wjd-comm-avatar--freelancer"
                        />
                        <span className="wjd-comm-role-badge freelancer">
                          Freelancer
                        </span>
                      </div>
                      <div className="wjd-comm-info">
                        <span className="wjd-comm-name">
                          {contract.freelancer.hoTen}
                        </span>
                        <span className="wjd-comm-desc">
                          Đối tác thực hiện công việc
                        </span>
                      </div>
                      <button
                        className="wjd-comm-chat-btn"
                        onClick={() => {
                          const fId =
                            contract.freelancer?.taiKhoanId ||
                            contract.freelancer?.taiKhoan?.taiKhoanId ||
                            contract.freelancerId;
                          const fName =
                            contract.freelancer?.hoTen ||
                            contract.freelancer?.taiKhoan?.hoTen ||
                            "Freelancer";
                          handleChatWithUser(fId, fName);
                        }}
                      >
                        <i className="fa-solid fa-paper-plane"></i> Nhắn tin
                      </button>
                    </div>
                  )}
                  {contract.giamSat && (
                    <div className="wjd-comm-member">
                      <div className="wjd-comm-avatar-wrapper">
                        <img
                          src={
                            contract.giamSat.anhDaiDien ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(contract.giamSat.tenDonVi || "S")}&background=F59E0B&color=fff&size=40`
                          }
                          alt=""
                          className="wjd-comm-avatar wjd-comm-avatar--donvigiamsat"
                        />
                        <span className="wjd-comm-role-badge supervisor">
                          Giám sát
                        </span>
                      </div>
                      <div className="wjd-comm-info">
                        <span className="wjd-comm-name">
                          {contract.giamSat.tenDonVi || contract.giamSat.hoTen}
                        </span>
                        <span className="wjd-comm-desc">
                          Đơn vị kiểm định độc lập
                        </span>
                      </div>
                      <button
                        className="wjd-comm-chat-btn"
                        onClick={() => {
                          const gsId =
                            contract.giamSat?.taiKhoanId ||
                            contract.giamSat?.taiKhoan?.taiKhoanId ||
                            contract.giamSat?.giamSatId ||
                            contract.giamSatId;
                          const gsName =
                            contract.giamSat?.tenDonVi ||
                            contract.giamSat?.hoTen ||
                            contract.giamSat?.taiKhoan?.hoTen ||
                            "Giám sát";
                          handleChatWithUser(gsId, gsName);
                        }}
                      >
                        <i className="fa-solid fa-paper-plane"></i> Nhắn tin
                      </button>
                    </div>
                  )}
                </>
              )}

              {/* If user is Freelancer, show Client & Supervisor */}
              {isFreelancer && (
                <>
                  {contract.nguoiThue && (
                    <div className="wjd-comm-member">
                      <div className="wjd-comm-avatar-wrapper">
                        <img
                          src={
                            contract.nguoiThue.anhDaiDien ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(contract.nguoiThue.hoTen || "C")}&background=0EA5E9&color=fff&size=40`
                          }
                          alt=""
                          className="wjd-comm-avatar wjd-comm-avatar--nguoithue"
                        />
                        <span className="wjd-comm-role-badge employer">
                          Khách hàng
                        </span>
                      </div>
                      <div className="wjd-comm-info">
                        <span className="wjd-comm-name">
                          {contract.nguoiThue.congTy ||
                            contract.nguoiThue.hoTen ||
                            "Khách hàng"}
                        </span>
                        <span className="wjd-comm-desc">Người thuê dự án</span>
                      </div>
                      <button
                        className="wjd-comm-chat-btn"
                        onClick={() => {
                          const ntId =
                            contract.nguoiThue?.taiKhoanId ||
                            contract.nguoiThue?.taiKhoan?.taiKhoanId ||
                            contract.nguoiThueId;
                          const ntName =
                            contract.nguoiThue?.congTy ||
                            contract.nguoiThue?.hoTen ||
                            contract.nguoiThue?.taiKhoan?.hoTen ||
                            "Khách hàng";
                          handleChatWithUser(ntId, ntName);
                        }}
                      >
                        <i className="fa-solid fa-paper-plane"></i> Nhắn tin
                      </button>
                    </div>
                  )}
                  {contract.giamSat && (
                    <div className="wjd-comm-member">
                      <div className="wjd-comm-avatar-wrapper">
                        <img
                          src={
                            contract.giamSat.anhDaiDien ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(contract.giamSat.tenDonVi || "S")}&background=F59E0B&color=fff&size=40`
                          }
                          alt=""
                          className="wjd-comm-avatar wjd-comm-avatar--donvigiamsat"
                        />
                        <span className="wjd-comm-role-badge supervisor">
                          Giám sát
                        </span>
                      </div>
                      <div className="wjd-comm-info">
                        <span className="wjd-comm-name">
                          {contract.giamSat.tenDonVi || contract.giamSat.hoTen}
                        </span>
                        <span className="wjd-comm-desc">
                          Đơn vị kiểm định độc lập
                        </span>
                      </div>
                      <button
                        className="wjd-comm-chat-btn"
                        onClick={() => {
                          const gsId =
                            contract.giamSat?.taiKhoanId ||
                            contract.giamSat?.taiKhoan?.taiKhoanId ||
                            contract.giamSat?.giamSatId ||
                            contract.giamSatId;
                          const gsName =
                            contract.giamSat?.tenDonVi ||
                            contract.giamSat?.hoTen ||
                            contract.giamSat?.taiKhoan?.hoTen ||
                            "Giám sát";
                          handleChatWithUser(gsId, gsName);
                        }}
                      >
                        <i className="fa-solid fa-paper-plane"></i> Nhắn tin
                      </button>
                    </div>
                  )}
                </>
              )}

              {/* If user is Supervisor, show Client & Freelancer */}
              {!isEmployer && !isFreelancer && (
                <>
                  {contract.nguoiThue && (
                    <div className="wjd-comm-member">
                      <div className="wjd-comm-avatar-wrapper">
                        <img
                          src={
                            contract.nguoiThue.anhDaiDien ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(contract.nguoiThue.hoTen || "C")}&background=0EA5E9&color=fff&size=40`
                          }
                          alt=""
                          className="wjd-comm-avatar wjd-comm-avatar--nguoithue"
                        />
                        <span className="wjd-comm-role-badge employer">
                          Khách hàng
                        </span>
                      </div>
                      <div className="wjd-comm-info">
                        <span className="wjd-comm-name">
                          {contract.nguoiThue.congTy ||
                            contract.nguoiThue.hoTen ||
                            "Khách hàng"}
                        </span>
                        <span className="wjd-comm-desc">Người thuê dự án</span>
                      </div>
                      <button
                        className="wjd-comm-chat-btn"
                        onClick={() => {
                          const ntId =
                            contract.nguoiThue?.taiKhoanId ||
                            contract.nguoiThue?.taiKhoan?.taiKhoanId ||
                            contract.nguoiThueId;
                          const ntName =
                            contract.nguoiThue?.congTy ||
                            contract.nguoiThue?.hoTen ||
                            contract.nguoiThue?.taiKhoan?.hoTen ||
                            "Khách hàng";
                          handleChatWithUser(ntId, ntName);
                        }}
                      >
                        <i className="fa-solid fa-paper-plane"></i> Nhắn tin
                      </button>
                    </div>
                  )}
                  {contract.freelancer && (
                    <div className="wjd-comm-member">
                      <div className="wjd-comm-avatar-wrapper">
                        <img
                          src={
                            contract.freelancer.anhDaiDien ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(contract.freelancer.hoTen || "F")}&background=10B981&color=fff&size=40`
                          }
                          alt=""
                          className="wjd-comm-avatar wjd-comm-avatar--freelancer"
                        />
                        <span className="wjd-comm-role-badge freelancer">
                          Freelancer
                        </span>
                      </div>
                      <div className="wjd-comm-info">
                        <span className="wjd-comm-name">
                          {contract.freelancer.hoTen}
                        </span>
                        <span className="wjd-comm-desc">
                          Đối tác thực hiện công việc
                        </span>
                      </div>
                      <button
                        className="wjd-comm-chat-btn"
                        onClick={() => {
                          const fId =
                            contract.freelancer?.taiKhoanId ||
                            contract.freelancer?.taiKhoan?.taiKhoanId ||
                            contract.freelancerId;
                          const fName =
                            contract.freelancer?.hoTen ||
                            contract.freelancer?.taiKhoan?.hoTen ||
                            "Freelancer";
                          handleChatWithUser(fId, fName);
                        }}
                      >
                        <i className="fa-solid fa-paper-plane"></i> Nhắn tin
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Progress Overview */}
          <div className="wjd-card">
            <div className="wjd-card-header">
              <h2>Tiến độ dự án</h2>
              <span className="wjd-progress-percent">{overallProgress}%</span>
            </div>
            <div className="wjd-progress-bar">
              <div
                className="wjd-progress-fill"
                style={{ width: `${overallProgress}%` }}
              ></div>
            </div>

            <div className="wjd-card-actions">
              <h3>Lịch sử cập nhật tiến độ</h3>
              {isFreelancer && contract.trangThai === "DangThucHien" && (!refundRequest || refundRequest.trangThai !== "ChoFreelancerDuyet") && (
                <button
                  className="wjd-btn-primary"
                  onClick={() => setShowAddProgress(true)}
                >
                  <i className="fa-solid fa-plus"></i> Cập nhật tiến độ
                </button>
              )}
            </div>

            {progressList.length === 0 ? (
              <div className="wjd-empty">
                <i className="fa-regular fa-calendar"></i>
                <p>Chưa có cập nhật tiến độ nào.</p>
              </div>
            ) : (
              <div className="wjd-timeline">
                {progressList.map((item) => (
                  <div key={item.tienDoId} className="wjd-timeline-item">
                    <div
                      className={`wjd-timeline-dot ${item.trangThaiXacNhan === "DaXacNhan" ? "confirmed" : item.trangThaiXacNhan === "TuChoi" ? "rejected" : ""}`}
                    ></div>
                    <div className="wjd-timeline-content">
                      <div className="wjd-timeline-header">
                        <div>
                          <div className="wjd-timeline-title">
                            {item.tieuDe}
                          </div>
                          <div className="wjd-timeline-meta">
                            {formatDate(item.ngayTao)} • {item.phanTram}% hoàn
                            thành{" "}
                            {getProgressStatusBadge(item.trangThaiXacNhan)}
                          </div>
                        </div>
                      </div>
                      {item.moTa && (
                        <div className="wjd-timeline-desc">{item.moTa}</div>
                      )}
                      {item.tepDinhKem && (
                        <a
                          href={item.tepDinhKem}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="wjd-attachment"
                        >
                          <i className="fa-solid fa-paperclip"></i> Tệp đính kèm
                        </a>
                      )}
                      {isSupervisor && item.trangThaiXacNhan === "ChuaXacNhan" && (
                        <div className="wjd-timeline-actions">
                          <button
                            className="wjd-btn-confirm"
                            onClick={() => handleConfirmProgress(item.tienDoId)}
                          >
                            <i className="fa-solid fa-check"></i> Xác nhận
                          </button>
                          <button
                            className="wjd-btn-reject"
                            onClick={() => handleRejectProgress(item.tienDoId)}
                          >
                            <i className="fa-solid fa-times"></i> Từ chối
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Payments */}
          {payments.length > 0 && (
            <div className="wjd-card">
              <div className="wjd-card-header">
                <h2>Thanh toán</h2>
              </div>
              <div className="wjd-payments">
                {payments.map((p) => (
                  <div key={p.thanhToanId} className="wjd-payment-item">
                    <div className="wjd-payment-icon">
                      <i
                        className={`fa-solid ${p.loaiTT === "DatCoc" ? "fa-lock" : p.loaiTT === "HoanTien" ? "fa-rotate-left" : "fa-credit-card"}`}
                      ></i>
                    </div>
                    <div className="wjd-payment-info">
                      <div className="wjd-payment-label">
                        {p.loaiTT === "DatCoc"
                          ? "Đặt cọc"
                          : p.loaiTT === "ThanhToan"
                            ? "Thanh toán"
                            : p.loaiTT === "HoanTien"
                              ? "Hoàn tiền"
                              : p.loaiTT}
                      </div>
                      <div className="wjd-payment-date">
                        {formatDate(p.ngayTao)}
                      </div>
                    </div>
                    <div className="wjd-payment-amount">
                      {formatCurrency(p.soTien)}
                    </div>
                    <div
                      className={`wjd-payment-status ${p.trangThai === "ThanhCong" ? "success" : p.trangThai === "DaHoan" ? "refunded" : "pending"}`}
                    >
                      {p.trangThai === "ThanhCong"
                        ? "Thành công"
                        : p.trangThai === "ChoXuLy"
                          ? "Chờ xử lý"
                          : p.trangThai === "DaHoan"
                            ? "Đã hoàn"
                            : p.trangThai}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="wjd-sidebar">
          {/* Contract specs */}
          <div className="wjd-card">
            <div className="wjd-card-header">
              <h2>Thông tin hợp đồng</h2>
            </div>
            <div className="wjd-info-list">
              <div className="wjd-info-item">
                <span className="wjd-info-label">Giá thỏa thuận</span>
                <span className="wjd-info-value wjd-info-highlight">
                  {formatCurrency(contract.giaThoa)}
                </span>
              </div>
              <div className="wjd-info-item">
                <span className="wjd-info-label">Tiền hệ thống giữ</span>
                <span
                  className="wjd-info-value"
                  style={{ color: "#10B981", fontWeight: "bold" }}
                >
                  <i
                    className="fa-solid fa-shield-halved"
                    style={{ marginRight: "6px" }}
                  ></i>
                  {formatCurrency(systemHeldAmount > 0 ? systemHeldAmount : 0)}
                </span>
              </div>
              <div className="wjd-info-item">
                <span className="wjd-info-label">Thời hạn</span>
                <span className="wjd-info-value">
                  {contract.thoiGianThoa
                    ? `${contract.thoiGianThoa} ngày`
                    : "—"}
                </span>
              </div>
              <div className="wjd-info-item">
                <span className="wjd-info-label">Ngày bắt đầu</span>
                <span className="wjd-info-value">
                  {formatDate(contract.ngayBatDau)}
                </span>
              </div>
              <div className="wjd-info-item">
                <span className="wjd-info-label">Ngày kết thúc</span>
                <span className="wjd-info-value">
                  {contract.ngayKetThuc
                    ? formatDate(contract.ngayKetThuc)
                    : "Chưa hoàn thành"}
                </span>
              </div>
              <div className="wjd-info-item">
                <span className="wjd-info-label">Tiến độ</span>
                <span className="wjd-info-value wjd-info-highlight">
                  {overallProgress}%
                </span>
              </div>
            </div>

            {contract.trangThai === "DangThucHien" && (
              <div className="wjd-completion-actions">
                <div className="wjd-completion-title">Nghiệm thu & Quyết định</div>
                
                {/* 1. Nếu đang có yêu cầu hoàn tiền chờ duyệt */}
                {isPendingRefund ? (
                  <div style={{ marginTop: "12px", width: "100%", boxSizing: "border-box" }}>
                    {isEmployer ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px", width: "100%", boxSizing: "border-box" }}>
                        <p style={{ fontSize: "13px", color: "#64748B", margin: "0 0 4px 0", lineHeight: "1.4" }}>
                          Yêu cầu hoàn tiền của bạn đã được gửi đi và đang đợi đối tác phản hồi.
                        </p>
                        <button
                          className="wjd-btn-refund"
                          disabled={true}
                          style={{ 
                            width: "100%", 
                            background: "#FEF3C7", 
                            color: "#D97706", 
                            borderColor: "#FCD34D",
                            cursor: "not-allowed",
                            opacity: 0.9,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "8px",
                            boxSizing: "border-box",
                            margin: 0
                          }}
                        >
                          <i className="fa-solid fa-spinner fa-spin"></i> Đang yêu cầu hoàn tiền
                        </button>
                        <div style={{ marginTop: "4px", padding: "8px 12px", background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "8px", fontSize: "12.5px", color: "#475569", lineHeight: "1.4", boxSizing: "border-box" }}>
                          <strong>Lý do:</strong> "{refundRequest.lyDo}"
                        </div>
                      </div>
                    ) : isFreelancer ? (
                      <div style={{ padding: "12px", background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: "8px", color: "#92400E", fontSize: "13px", boxSizing: "border-box" }}>
                        <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: "6px", color: "#F59E0B" }}></i>
                        <strong>Yêu cầu hoàn tiền từ Khách hàng</strong>
                        <p style={{ margin: "6px 0", fontSize: "12.5px", color: "#4B5563", lineHeight: "1.4" }}>
                          Khách hàng đã gửi yêu cầu chấm dứt hợp đồng sớm và hoàn lại tiền ký quỹ.
                        </p>
                        <blockquote style={{ margin: "0 0 12px 0", padding: "6px 10px", background: "#FEF3C7", borderRadius: "4px", fontSize: "12px", borderLeft: "3px solid #F59E0B", color: "#451A03" }}>
                          "{refundRequest.lyDo}"
                        </blockquote>
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%", boxSizing: "border-box" }}>
                          <button
                            className="wjd-btn-complete"
                            onClick={handleAcceptRefund}
                            disabled={decisionSubmitting}
                            style={{ 
                              width: "100%", 
                              background: "#10B981", 
                              borderColor: "#10B981",
                              boxSizing: "border-box",
                              margin: 0
                            }}
                          >
                            <i className="fa-solid fa-check"></i> Đồng ý hoàn tiền
                          </button>
                          <button
                            className="wjd-btn-complete"
                            onClick={handleRejectRefund}
                            disabled={decisionSubmitting}
                            style={{ 
                              width: "100%", 
                              background: "#EF4444", 
                              borderColor: "#EF4444",
                              color: "#fff",
                              boxSizing: "border-box",
                              margin: 0
                            }}
                          >
                            <i className="fa-solid fa-times"></i> Từ chối
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ padding: "12px", background: "#F1F5F9", borderRadius: "8px", color: "#475569", fontSize: "13px", boxSizing: "border-box" }}>
                        <i className="fa-solid fa-circle-info" style={{ marginRight: "6px" }}></i>
                        Đang có yêu cầu hoàn tiền chờ Freelancer phản hồi.
                      </div>
                    )}
                  </div>
                ) : (
                  /* 2. Nếu không có yêu cầu hoàn tiền nào đang chờ duyệt thì hiển thị controls bình thường cho Employer */
                  <>
                    {isEmployer ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px", width: "100%", marginTop: "10px", boxSizing: "border-box" }}>
                        <p style={{ fontSize: "13px", color: "#64748B", margin: "0 0 4px 0", lineHeight: "1.4" }}>
                          {overallProgress >= 100 
                            ? "Freelancer đã báo hoàn thành. Vui lòng kiểm tra kỹ kết quả trước khi đưa ra quyết định." 
                            : "Hợp đồng đang được thực hiện. Bạn có thể yêu cầu hoàn tiền nếu có tranh chấp phát sinh."}
                        </p>
                        
                        <button
                          className="wjd-btn-refund"
                          onClick={() => setShowRefundRequest(true)}
                          disabled={decisionSubmitting}
                          style={{ width: "100%", boxSizing: "border-box", margin: 0 }}
                        >
                          <i className="fa-solid fa-money-bill-transfer"></i> Yêu cầu hoàn tiền
                        </button>

                        {overallProgress >= 100 && (
                          <>
                            <button
                              className="wjd-btn-complete"
                              onClick={handleCompleteContract}
                              disabled={decisionSubmitting}
                              style={{ width: "100%", boxSizing: "border-box", margin: 0 }}
                            >
                              <i className="fa-solid fa-check-circle"></i> Xác nhận hoàn thành
                            </button>
                            <button
                              className="wjd-btn-revision"
                              onClick={handleRequestRevision}
                              disabled={decisionSubmitting}
                              style={{ 
                                width: "100%", 
                                background: "#FEF3C7", 
                                color: "#D97706", 
                                border: "1px solid #FCD34D", 
                                boxSizing: "border-box",
                                margin: 0 
                              }}
                            >
                              <i className="fa-solid fa-rotate-left"></i> Yêu cầu làm lại
                            </button>
                          </>
                        )}
                      </div>
                    ) : (
                      <p style={{ fontSize: "13px", color: "#64748B", margin: "10px 0 0 0", lineHeight: "1.4" }}>
                        Hợp đồng đang được thực hiện. Đang đợi freelancer nộp báo cáo các mốc tiến độ tiếp theo.
                      </p>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Stakeholders Card */}
          <div className="wjd-parties-card">
            <div className="wjd-card-header">
              <h2>Các bên liên quan</h2>
            </div>
            <div className="wjd-info-list" style={{ gap: "4px" }}>
              {/* Employer / Client */}
              {contract.nguoiThue && (
                <div className="wjd-party-item">
                  <img
                    src={
                      contract.nguoiThue.anhDaiDien ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(contract.nguoiThue.hoTen || "C")}&background=0EA5E9&color=fff&size=42`
                    }
                    alt={contract.nguoiThue.hoTen}
                    className="wjd-party-avatar wjd-party-avatar--nguoithue"
                  />
                  <div className="wjd-party-info">
                    <span className="wjd-party-role">
                      Khách hàng{" "}
                      {Number(contract.nguoiThue.taiKhoanId) ===
                        Number(userId) && "(Bạn)"}
                    </span>
                    <span className="wjd-party-name">
                      {contract.nguoiThue.congTy ||
                        contract.nguoiThue.hoTen ||
                        "Khách hàng"}
                    </span>
                    <span className="wjd-party-email">
                      {contract.nguoiThue.email}
                    </span>
                  </div>
                  {Number(
                    contract.nguoiThue.taiKhoanId ||
                      contract.nguoiThue.taiKhoan?.taiKhoanId,
                  ) !== Number(userId) && (
                    <button
                      className="wjd-party-chat-btn"
                      onClick={() => {
                        const ntId =
                          contract.nguoiThue?.taiKhoanId ||
                          contract.nguoiThue?.taiKhoan?.taiKhoanId ||
                          contract.nguoiThueId;
                        const ntName =
                          contract.nguoiThue?.congTy ||
                          contract.nguoiThue?.hoTen ||
                          contract.nguoiThue?.taiKhoan?.hoTen ||
                          "Khách hàng";
                        handleChatWithUser(ntId, ntName);
                      }}
                    >
                      <i className="fa-solid fa-comments"></i> Chat
                    </button>
                  )}
                </div>
              )}

              {/* Freelancer */}
              {contract.freelancer && (
                <div className="wjd-party-item">
                  <img
                    src={
                      contract.freelancer.anhDaiDien ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(contract.freelancer.hoTen || "F")}&background=10B981&color=fff&size=42`
                    }
                    alt={contract.freelancer.hoTen}
                    className="wjd-party-avatar wjd-party-avatar--freelancer"
                  />
                  <div className="wjd-party-info">
                    <span className="wjd-party-role">
                      Freelancer{" "}
                      {Number(contract.freelancer.taiKhoanId) ===
                        Number(userId) && "(Bạn)"}
                    </span>
                    <span className="wjd-party-name">
                      {contract.freelancer.hoTen}
                    </span>
                    <span className="wjd-party-email">
                      {contract.freelancer.email}
                    </span>
                  </div>
                  {Number(
                    contract.freelancer.taiKhoanId ||
                      contract.freelancer.taiKhoan?.taiKhoanId,
                  ) !== Number(userId) && (
                    <button
                      className="wjd-party-chat-btn"
                      onClick={() => {
                        const fId =
                          contract.freelancer?.taiKhoanId ||
                          contract.freelancer?.taiKhoan?.taiKhoanId ||
                          contract.freelancerId;
                        const fName =
                          contract.freelancer?.hoTen ||
                          contract.freelancer?.taiKhoan?.hoTen ||
                          "Freelancer";
                        handleChatWithUser(fId, fName);
                      }}
                    >
                      <i className="fa-solid fa-comments"></i> Chat
                    </button>
                  )}
                </div>
              )}

              {/* Supervisor */}
              {contract.giamSat ? (
                <div className="wjd-party-item">
                  <img
                    src={
                      contract.giamSat.anhDaiDien ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(contract.giamSat.tenDonVi || contract.giamSat.hoTen || "S")}&background=F59E0B&color=fff&size=42`
                    }
                    alt={contract.giamSat.tenDonVi || contract.giamSat.hoTen}
                    className="wjd-party-avatar wjd-party-avatar--donvigiamsat"
                  />
                  <div className="wjd-party-info">
                    <span className="wjd-party-role">
                      Giám sát{" "}
                      {Number(
                        contract.giamSat.taiKhoanId ||
                          contract.giamSat.taiKhoan?.taiKhoanId,
                      ) === Number(userId) && "(Bạn)"}
                    </span>
                    <span className="wjd-party-name">
                      {contract.giamSat.tenDonVi || contract.giamSat.hoTen}
                    </span>
                    <span className="wjd-party-email">
                      {contract.giamSat.email || "giamSat@email.com"}
                    </span>
                  </div>
                  {Number(
                    contract.giamSat.taiKhoanId ||
                      contract.giamSat.taiKhoan?.taiKhoanId,
                  ) !== Number(userId) && (
                    <button
                      className="wjd-party-chat-btn"
                      onClick={() => {
                        const gsId =
                          contract.giamSat?.taiKhoanId ||
                          contract.giamSat?.taiKhoan?.taiKhoanId ||
                          contract.giamSat?.giamSatId ||
                          contract.giamSatId;
                        const gsName =
                          contract.giamSat?.tenDonVi ||
                          contract.giamSat?.hoTen ||
                          contract.giamSat?.taiKhoan?.hoTen ||
                          "Giám sát";
                        handleChatWithUser(gsId, gsName);
                      }}
                    >
                      <i className="fa-solid fa-comments"></i> Chat
                    </button>
                  )}
                </div>
              ) : (
                <div className="wjd-party-item" style={{ padding: "8px 0" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      width: "100%",
                      color: "#94A3B8",
                      fontSize: "13px",
                    }}
                  >
                    <i
                      className="fa-solid fa-shield-halved"
                      style={{ fontSize: "16px", color: "#CBD5E1" }}
                    ></i>
                    <span>Dự án này không yêu cầu giám sát</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Đơn vị Giám sát độc lập chi tiết */}
          {(contract.yeuCauGiamSat || contract.giamSat) && (
            <div className="wjd-card">
              <div className="wjd-card-header">
                <h2>
                  <i
                    className="fa-solid fa-shield-halved"
                    style={{ color: "var(--gold)", marginRight: "8px" }}
                  ></i>{" "}
                  Đơn vị Giám sát độc lập
                </h2>
                {contract.trangThaiGiamSat ? (
                  <span
                    className={`wjd-giamsat-status ${contract.trangThaiGiamSat}`}
                  >
                    {contract.trangThaiGiamSat === "DaChapNhan" || contract.trangThaiGiamSat === "DangGiamSat"
                      ? "Đang giám sát"
                      : contract.trangThaiGiamSat === "ChoDuyet"
                        ? "Chờ phê duyệt"
                        : contract.trangThaiGiamSat === "TuChoi"
                          ? "Từ chối"
                          : contract.trangThaiGiamSat}
                  </span>
                ) : (
                  <span className="wjd-giamsat-status ChoDuyet">
                    Chờ phê duyệt
                  </span>
                )}
              </div>

              {contract.giamSat ? (
                <div
                  className="wjd-giamsat-profile"
                  style={{ marginTop: "10px" }}
                >
                  <div className="wjd-info-list" style={{ gap: "10px" }}>
                    <div className="wjd-info-item">
                      <span className="wjd-info-label">Đơn vị</span>
                      <span
                        className="wjd-info-value"
                        style={{ fontWeight: 700, color: "#0F172A" }}
                      >
                        {contract.giamSat.tenDonVi || "Giám sát viên"}
                      </span>
                    </div>
                    <div className="wjd-info-item">
                      <span className="wjd-info-label">Người đại diện</span>
                      <span className="wjd-info-value">
                        {contract.giamSat.hoTen || "Chưa cập nhật"}
                      </span>
                    </div>
                    <div className="wjd-info-item">
                      <span className="wjd-info-label">Phí giám sát</span>
                      <span
                        className="wjd-info-value wjd-info-highlight"
                        style={{ fontWeight: 700 }}
                      >
                        {formatCurrency(contract.phiGiamSat)}
                      </span>
                    </div>
                    {contract.giamSat.nangLuc && (
                      <div
                        className="wjd-info-item"
                        style={{
                          flexDirection: "column",
                          alignItems: "flex-start",
                          gap: "4px",
                        }}
                      >
                        <span className="wjd-info-label">
                          Năng lực kiểm định
                        </span>
                        <span
                          className="wjd-info-value"
                          style={{
                            fontSize: "13px",
                            color: "#475569",
                            textAlign: "left",
                          }}
                        >
                          {contract.giamSat.nangLuc}
                        </span>
                      </div>
                    )}
                    {contract.giamSat.chungChi && (
                      <div
                        className="wjd-info-item"
                        style={{
                          flexDirection: "column",
                          alignItems: "flex-start",
                          gap: "4px",
                        }}
                      >
                        <span className="wjd-info-label">
                          Chứng chỉ & Tiêu chuẩn
                        </span>
                        <span
                          className="wjd-info-value"
                          style={{
                            fontSize: "13px",
                            color: "#475569",
                            textAlign: "left",
                          }}
                        >
                          {contract.giamSat.chungChi}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div
                  className="wjd-empty"
                  style={{ padding: "16px 0", color: "#94A3B8" }}
                >
                  <p>
                    Hợp đồng yêu cầu giám sát, đang chờ phân bổ đơn vị phù hợp.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Thông tin Yêu cầu gốc */}
          {contract.yeuCau && (
            <div className="wjd-card">
              <div className="wjd-card-header">
                <h2>
                  <i
                    className="fa-solid fa-circle-info"
                    style={{ color: "#0EA5E9", marginRight: "8px" }}
                  ></i>{" "}
                  Thông tin Yêu cầu gốc
                </h2>
              </div>
              <div className="wjd-info-list" style={{ gap: "10px" }}>
                <div className="wjd-info-item">
                  <span className="wjd-info-label">Lĩnh vực</span>
                  <span className="wjd-info-value">
                    {contract.yeuCau.loaiDichVu?.tenLoai || "—"}
                  </span>
                </div>
                <div className="wjd-info-item">
                  <span className="wjd-info-label">Ngân sách dự kiến</span>
                  <span className="wjd-info-value" style={{ fontSize: "13px" }}>
                    {formatCurrency(contract.yeuCau.nganSachMin)} -{" "}
                    {formatCurrency(contract.yeuCau.nganSachMax)}
                  </span>
                </div>
                <div className="wjd-info-item">
                  <span className="wjd-info-label">Hạn nộp hồ sơ</span>
                  <span className="wjd-info-value">
                    {formatDate(contract.yeuCau.thoiHan)}
                  </span>
                </div>
                {contract.yeuCau.kyNangs &&
                  contract.yeuCau.kyNangs.length > 0 && (
                    <div style={{ marginTop: "6px" }}>
                      <span
                        className="wjd-info-label"
                        style={{ display: "block", marginBottom: "8px" }}
                      >
                        Kỹ năng yêu cầu:
                      </span>
                      <div
                        className="wjd-skill-tags"
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "6px",
                        }}
                      >
                        {contract.yeuCau.kyNangs.map((skill) => (
                          <span
                            key={skill.kyNangId}
                            className="wjd-skill-tag"
                            style={{
                              background: "#F1F5F9",
                              color: "#475569",
                              padding: "4px 10px",
                              borderRadius: "20px",
                              fontSize: "12px",
                              fontWeight: 500,
                            }}
                          >
                            {skill.tenKyNang}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            </div>
          )}

          {/* Mô tả yêu cầu */}
          {contract.yeuCau?.moTa && (
            <div className="wjd-card">
              <div className="wjd-card-header">
                <h2>Mô tả chi tiết</h2>
              </div>
              <p className="wjd-description">{contract.yeuCau.moTa}</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal thêm tiến độ */}
      {showAddProgress && (
        <div
          className="wjd-modal-overlay"
          onClick={() => setShowAddProgress(false)}
        >
          <div className="wjd-modal" onClick={(e) => e.stopPropagation()}>
            <div className="wjd-modal-header">
              <h3>
                <i className="fa-solid fa-chart-line"></i> Cập nhật tiến độ
              </h3>
              <button
                className="wjd-modal-close"
                onClick={() => setShowAddProgress(false)}
              >
                <i className="fa-solid fa-times"></i>
              </button>
            </div>
            <div className="wjd-modal-body">
              <div className="wjd-form-group">
                <label>
                  Tiêu đề <span style={{ color: "#EF4444" }}>*</span>
                </label>
                <input
                  type="text"
                  value={newProgress.tieuDe}
                  onChange={(e) =>
                    setNewProgress({ ...newProgress, tieuDe: e.target.value })
                  }
                  placeholder="VD: Hoàn thành thiết kế giao diện"
                />
              </div>
              <div className="wjd-form-group">
                <label>
                  Phần trăm hoàn thành{" "}
                  <span style={{ color: "#EF4444" }}>*</span>
                </label>
                <div className="wjd-range-group">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={newProgress.phanTram}
                    onChange={(e) =>
                      setNewProgress({
                        ...newProgress,
                        phanTram: e.target.value,
                      })
                    }
                  />
                  <span className="wjd-range-value">
                    {newProgress.phanTram}%
                  </span>
                </div>
              </div>
              <div className="wjd-form-group">
                <label>Mô tả</label>
                <textarea
                  value={newProgress.moTa}
                  onChange={(e) =>
                    setNewProgress({ ...newProgress, moTa: e.target.value })
                  }
                  placeholder="Mô tả chi tiết công việc đã hoàn thành..."
                  rows="4"
                />
              </div>
            </div>
            <div className="wjd-modal-footer">
              <button
                className="wjd-btn-cancel"
                onClick={() => setShowAddProgress(false)}
              >
                Hủy
              </button>
              <button
                className="wjd-btn-primary"
                onClick={handleAddProgress}
                disabled={submitting}
              >
                {submitting ? (
                  <i className="fa-solid fa-circle-notch fa-spin"></i>
                ) : (
                  <i className="fa-solid fa-plus"></i>
                )}{" "}
                Thêm
              </button>
            </div>
          </div>
        </div>
      )}

      {showRefundRequest && (
        <div
          className="wjd-modal-overlay"
          onClick={() => !decisionSubmitting && setShowRefundRequest(false)}
        >
          <div className="wjd-modal" onClick={(e) => e.stopPropagation()}>
            <div className="wjd-modal-header">
              <h3>
                <i className="fa-solid fa-money-bill-transfer"></i> Yêu cầu
                hoàn tiền
              </h3>
              <button
                className="wjd-modal-close"
                onClick={() => setShowRefundRequest(false)}
                disabled={decisionSubmitting}
              >
                <i className="fa-solid fa-times"></i>
              </button>
            </div>
            <div className="wjd-modal-body">
              <p className="wjd-refund-note">
                Yêu cầu này sẽ mở tranh chấp để hệ thống xem xét khoản tiền đang
                giữ: <strong>{formatCurrency(Math.max(systemHeldAmount, 0))}</strong>.
              </p>
              <div className="wjd-form-group">
                <label>
                  Lý do yêu cầu hoàn tiền{" "}
                  <span style={{ color: "#EF4444" }}>*</span>
                </label>
                <textarea
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="Mô tả kết quả chưa đáp ứng yêu cầu hoặc vấn đề cần xử lý..."
                  rows="4"
                />
              </div>
            </div>
            <div className="wjd-modal-footer">
              <button
                className="wjd-btn-cancel"
                onClick={() => setShowRefundRequest(false)}
                disabled={decisionSubmitting}
              >
                Hủy
              </button>
              <button
                className="wjd-btn-refund-submit"
                onClick={handleRequestRefund}
                disabled={decisionSubmitting}
              >
                {decisionSubmitting ? (
                  <i className="fa-solid fa-circle-notch fa-spin"></i>
                ) : (
                  <i className="fa-solid fa-paper-plane"></i>
                )}{" "}
                Gửi yêu cầu
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmModal.show && (
        <div
          className="wjd-modal-overlay"
          onClick={() => setConfirmModal((prev) => ({ ...prev, show: false }))}
        >
          <div
            className="wjd-modal wjd-confirm-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="wjd-confirm-body">
              <div className={`wjd-confirm-icon ${confirmModal.type}`}>
                {confirmModal.type === "success" && (
                  <i className="fa-solid fa-circle-check"></i>
                )}
                {confirmModal.type === "warning" && (
                  <i className="fa-solid fa-triangle-exclamation"></i>
                )}
                {confirmModal.type === "danger" && (
                  <i className="fa-solid fa-circle-exclamation"></i>
                )}
                {confirmModal.type === "info" && (
                  <i className="fa-solid fa-circle-info"></i>
                )}
              </div>
              <h3 className="wjd-confirm-title">{confirmModal.title}</h3>
              <p className="wjd-confirm-message">{confirmModal.message}</p>
            </div>
            <div className="wjd-confirm-footer">
              <button
                className="wjd-confirm-btn-cancel"
                onClick={() =>
                  setConfirmModal((prev) => ({ ...prev, show: false }))
                }
              >
                {confirmModal.cancelText}
              </button>
              <button
                className={`wjd-confirm-btn-action ${confirmModal.type}`}
                onClick={() => {
                  if (confirmModal.onConfirm) confirmModal.onConfirm();
                  setConfirmModal((prev) => ({ ...prev, show: false }));
                }}
              >
                {confirmModal.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkspaceJobDetail;
