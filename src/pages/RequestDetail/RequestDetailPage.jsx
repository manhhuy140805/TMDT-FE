import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getUserRole, isFreelancerRole } from "../../utils/role";
import RequestHero from "./components/RequestHero";
import RequestInfo from "./components/RequestInfo";
import ActionCard from "./components/ActionCard";
import ClientCard from "./components/ClientCard";
import BidsSection from "./components/BidsSection";
import QuoteModal from "./components/QuoteModal";
import AcceptQuoteModal from "./components/AcceptQuoteModal";
import api from "../../services/api";
import "./RequestDetailPage.css";

const RequestDetailPage = () => {
  // ============ Router & Navigation ============
  const { id } = useParams();
  const navigate = useNavigate();

  // ============ State Management ============
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [request, setRequest] = useState(null);
  const [quotes, setQuotes] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [quoteForm, setQuoteForm] = useState({
    minPrice: "",
    maxPrice: "",
    duration: "",
    description: "",
  });

  // ============ Helper Functions ============
  const getCurrentUser = () => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        // Handle cả data cũ dạng { message, user } lẫn data mới dạng user trực tiếp
        return parsed?.user ?? parsed;
      } catch (err) {
        console.error("Error parsing user data:", err);
        return null;
      }
    }
    return null;
  };

  /**
   * Map API response (GET /jobs/:id) sang format dùng trong UI
   * API mới: response wrap trong { job: {...} }, có thêm kyNangs
   */
  const mapJobToRequest = (job) => ({
    id: job.yeuCauId,
    title: job.tieuDe,
    description: job.moTa,
    budget: `${Number(job.nganSachMin).toLocaleString("vi-VN")} – ${Number(job.nganSachMax).toLocaleString("vi-VN")} VNĐ`,
    budgetMin: job.nganSachMin,
    budgetMax: job.nganSachMax,
    deadline: job.thoiHan,
    status: job.trangThai,
    requiresSupervision: job.yeuCauGiamSat,
    supervisorFee: job.phiGiamSat ?? 2000000,
    bids: job.soLuongBaoGia ?? 0,
    category: job.loaiDichVu?.tenLoai ?? "",
    createdAt: job.ngayTao,
    // kyNangs là mảng { kyNangId, tenKyNang } từ API mới
    skills: job.kyNangs ? job.kyNangs.map((k) => k.tenKyNang) : [],
    // nguoiThue trả về { taiKhoanId, hoTen, email }, nguoiThueId là ID riêng
    employer: job.nguoiThue
      ? {
          id: job.nguoiThueId ?? job.nguoiThue.taiKhoanId,
          name: job.nguoiThue.congTy || job.nguoiThue.hoTen || "Khách hàng",
          avatar: job.nguoiThue.anhDaiDien ?? null,
          rating: job.nguoiThue.diemTinCay ?? 0,
          verified: false,
        }
      : null,
    location: "Việt Nam",
  });

  /**
   * Map API response (GET /jobs/:id/proposals) sang format dùng trong UI
   *
   * Freelancer object từ API:
   * { freelancerId, taiKhoanId, hoTen, email, kinhNghiem, kyNang, kyNangs, xepHang }
   */
  const mapProposalToQuote = (proposal) => {
    const fl = proposal.freelancer ?? {};
    return {
      id: proposal.baoGiaId,
      amount: Number(proposal.giaDeXuat ?? proposal.giaThapNhat ?? 0),
      minPrice: Number(proposal.giaDeXuat ?? proposal.giaThapNhat ?? 0),
      maxPrice: Number(proposal.giaDeXuat ?? proposal.giaNhieuNhat ?? 0),
      duration: `${proposal.thoiGianThucHien ?? proposal.thoiGianDuKien ?? 0} ngày`,
      durationDays: proposal.thoiGianThucHien ?? proposal.thoiGianDuKien ?? 0,
      description: proposal.noiDung ?? proposal.moTa ?? "",
      status: proposal.trangThai,
      submittedTime: proposal.ngayTao
        ? new Date(proposal.ngayTao).toLocaleDateString("vi-VN")
        : "",
      freelancer: {
        id: fl.freelancerId ?? null,
        taiKhoanId: fl.taiKhoanId ?? null,
        // hoTen nằm trực tiếp trong freelancer object (không wrap trong taiKhoan)
        name: fl.hoTen ?? fl.taiKhoan?.hoTen ?? fl.chuyenGia ?? "Freelancer",
        avatar: fl.anhDaiDien ?? fl.taiKhoan?.anhDaiDien ?? null,
        rating: Number(fl.xepHang ?? 0),
        verified: fl.xacThucEmail ?? false,
        // kyNangs là mảng object { kyNangId, tenKyNang }, kyNang là string cũ
        skills: fl.kyNangs
          ? fl.kyNangs.map((k) => k.tenKyNang)
          : fl.kyNang
            ? fl.kyNang.split(",").map((s) => s.trim()).filter(Boolean)
            : [],
      },
    };
  };

  // ============ User & Permissions ============
  const currentUser = getCurrentUser();
  const userRole = getUserRole(currentUser);
  const isFreelancer = isFreelancerRole(userRole);

  // isOwner: so sánh taiKhoanId của currentUser với taiKhoanId của employer
  // employer.id được map từ job.nguoiThueId ?? job.nguoiThue.taiKhoanId
  const currentUserId = currentUser?.taiKhoanId ?? currentUser?.id ?? null;
  const isOwner =
    request &&
    currentUser &&
    request.employer &&
    request.employer.id === currentUserId;

  // Yêu cầu còn nhận hồ sơ khi: trạng thái MoiTao VÀ chưa có freelancer được chọn
  const isAcceptingBids =
    request &&
    request.status === "MoiTao" &&
    !quotes.some((q) => q.status === "DaChapNhan" || q.status === "DuocChon");

  const canSubmitQuote = isFreelancer && isAcceptingBids && !isOwner;

  // ============ API Calls ============
  const fetchRequestDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.jobs.getById(id);
      // API trả về { job: {...} } hoặc trực tiếp object job
      const job = res?.job ?? res;
      console.log("[RequestDetail] nguoiThueId:", job.nguoiThueId, "| taiKhoanId nguoiThue:", job.nguoiThue?.taiKhoanId, "| currentUser.taiKhoanId:", currentUser?.taiKhoanId);
      setRequest(mapJobToRequest(job));
    } catch (err) {
      console.error("Lỗi tải chi tiết yêu cầu:", err);
      setError(err.message || "Không thể tải thông tin yêu cầu");
      setRequest(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuotes = async () => {
    try {
      const res = await api.jobs.getProposals(id);
      console.log("[fetchQuotes] raw response:", res);

      // API có thể trả về nhiều dạng:
      // { proposals: [...] }  — API mới (section 7)
      // { data: [...] }       — API cũ
      // [...]                 — mảng trực tiếp
      const list =
        Array.isArray(res)             ? res :
        Array.isArray(res?.proposals)  ? res.proposals :
        Array.isArray(res?.data)       ? res.data :
        [];

      const mapped = list.map(mapProposalToQuote);
      setQuotes(mapped);

      // Đồng bộ bids count từ số proposals thực tế trả về
      setRequest((prev) => prev ? { ...prev, bids: mapped.length } : prev);
    } catch (err) {
      console.error("Lỗi tải danh sách báo giá:", err);
      setQuotes([]);
    }
  };

  // ============ Lifecycle ============
  useEffect(() => {
    fetchRequestDetail();
    fetchQuotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // ============ Event Handlers ============
  const handleSubmitQuote = async (e) => {
    e.preventDefault();

    if (!currentUser) {
      alert("Vui lòng đăng nhập để gửi báo giá!");
      navigate("/login");
      return;
    }

    const { minPrice, duration, description } = quoteForm;
    if (!minPrice || !duration || !description) {
      alert("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    setSubmitting(true);
    try {
      await api.proposals.create({
        yeuCauId: parseInt(id),
        freelancerId: currentUser.freelancerId ?? currentUser.taiKhoanId,
        giaDeXuat: Number(minPrice),
        thoiGianThucHien: Number(duration),
        noiDung: description,
      });
      alert("Gửi báo giá thành công!");
      setShowQuoteModal(false);
      setQuoteForm({ minPrice: "", maxPrice: "", duration: "", description: "" });
      fetchQuotes();
    } catch (err) {
      alert(err.message || "Gửi báo giá thất bại, vui lòng thử lại!");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAcceptQuote = (quote) => {
    setSelectedQuote(quote);
    setShowAcceptModal(true);
  };

  const handleChat = async (quote) => {
    if (!currentUser) {
      alert("Vui lòng đăng nhập để nhắn tin!");
      navigate("/login");
      return;
    }
    const targetId = quote.freelancer?.taiKhoanId;
    if (!targetId) {
      alert("Không tìm thấy thông tin freelancer!");
      return;
    }

    // Bước 1: Tìm conversation hiện có cùng (partner + requestId) trong localStorage mapping
    let contexts = {};
    try {
      contexts = JSON.parse(localStorage.getItem("chat_contexts") || "{}");
    } catch {
      contexts = {};
    }

    try {
      const listRes = await api.chat.getConversations(currentUserId);
      const list =
        listRes?.conversations || listRes?.data || (Array.isArray(listRes) ? listRes : []);

      // Tìm conversation đã tồn tại cho cặp partner + request hiện tại
      const existing = list.find((c) => {
        const m1 = Number(c.thanhVien1?.taiKhoanId);
        const m2 = Number(c.thanhVien2?.taiKhoanId);
        const isSamePair =
          (m1 === Number(currentUserId) && m2 === Number(targetId)) ||
          (m2 === Number(currentUserId) && m1 === Number(targetId));
        if (!isSamePair) return false;

        const convId = c.cuocHoiThoaiId;
        const ctx = contexts[convId];
        // Khớp khi: hội thoại có context = yêu cầu hiện tại
        return ctx?.type === "request" && Number(ctx.id) === Number(request.id);
      });

      if (existing) {
        navigate(
          `/workspace/messages?conversationId=${existing.cuocHoiThoaiId}`
        );
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
      });
      const conv = res?.conversation ?? res;
      const conversationId = conv?.cuocHoiThoaiId;
      if (conversationId && request) {
        contexts[conversationId] = {
          type: "request",
          id: request.id,
          title: request.title,
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
      navigate("/workspace/messages");
    }
  };

  const confirmAcceptQuote = async (paymentInfo) => {
    if (!selectedQuote) return;

    // Guard: không cho chấp nhận nếu yêu cầu đã đóng hoặc đã có quote được chấp nhận
    if (request.status === "DangNhan" || request.status === "HoanThanh" || request.status === "DaHuy") {
      alert("Yêu cầu này đã được chấp nhận hoặc không còn mở!");
      setShowAcceptModal(false);
      return;
    }
    if (quotes.some((q) => q.id !== selectedQuote.id && (q.status === "DaChapNhan" || q.status === "DuocChon"))) {
      alert("Đã có báo giá khác được chấp nhận cho yêu cầu này!");
      setShowAcceptModal(false);
      return;
    }

    setAccepting(true);
    try {
      // Bước 1: Cập nhật proposal sang DaChapNhan
      await api.proposals.update(selectedQuote.id, { trangThai: "DaChapNhan" });

      // Bước 2: Tạo hợp đồng từ báo giá được chọn
      const contractRes = await api.contracts.create({
        yeuCauId: request.id,
        freelancerId: selectedQuote.freelancer.taiKhoanId,
        nguoiThueId: currentUserId,
        giaThoa: paymentInfo.agreedPrice,
        thoiGianThoa: selectedQuote.durationDays,
      });

      const contractId = contractRes?.congViecId ?? contractRes?.contract?.congViecId;

      // Bước 3: Thanh toán escrow — 100% tiền freelancer + phí giám sát (nếu có)
      if (contractId) {
        const depositAmount = paymentInfo.agreedPrice + (paymentInfo.supervisorFee || 0);
        await api.payments.deposit({
          contractId: contractId,
          amount: depositAmount,
          paymentMethod: paymentInfo.paymentMethod,
          note: `Thanh toán escrow cho hợp đồng #${contractId}`,
        });
      }

      // Bước 4: Đóng yêu cầu thuê (chuyển trạng thái sang DangNhan)
      try {
        await api.jobs.update(request.id, { trangThai: "DangNhan" });
      } catch (statusErr) {
        console.warn("[confirmAcceptQuote] Lỗi đổi trạng thái job:", statusErr.message);
      }

      alert("Đã chấp nhận báo giá và thanh toán escrow thành công! Tiền sẽ được hệ thống giữ cho đến khi công việc hoàn thành.");
      setShowAcceptModal(false);
      setSelectedQuote(null);
      fetchQuotes();
      fetchRequestDetail();
    } catch (err) {
      alert(err.message || "Chấp nhận báo giá thất bại, vui lòng thử lại!");
    } finally {
      setAccepting(false);
    }
  };

  if (loading) {
    return (
      <div className="rd-loading">
        <i className="fa-solid fa-circle-notch spin"></i>
        <p>Đang tải thông tin yêu cầu...</p>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="rd-loading">
        <i className="fa-solid fa-circle-exclamation err"></i>
        <p>{error || "Không tìm thấy yêu cầu này!"}</p>
        <button onClick={() => navigate("/requests")} className="rd-back-btn">
          Quay lại danh sách
        </button>
      </div>
    );
  }

  // ============ Main Render ============
  return (
    <>
      <RequestHero request={request} onNavigate={navigate} isAcceptingBids={isAcceptingBids} />

      <div className="rd-layout">
        <div className="rd-main">
          <RequestInfo request={request} />
        </div>
        <div className="rd-sidebar">
          <ActionCard
            request={request}
            onSubmitQuote={() => setShowQuoteModal(true)}
            isOwner={isOwner}
            canSubmitQuote={canSubmitQuote}
          />
          <ClientCard employer={request.employer} location={request.location} />
        </div>
      </div>

      <BidsSection
        quotes={quotes}
        isOwner={isOwner}
        onAcceptQuote={handleAcceptQuote}
        onChat={handleChat}
      />

      <QuoteModal
        show={showQuoteModal}
        onClose={() => setShowQuoteModal(false)}
        onSubmit={handleSubmitQuote}
        formData={quoteForm}
        onChange={setQuoteForm}
        submitting={submitting}
      />

      <AcceptQuoteModal
        show={showAcceptModal}
        selectedQuote={selectedQuote}
        onClose={() => setShowAcceptModal(false)}
        onConfirm={confirmAcceptQuote}
        accepting={accepting}
        requiresSupervision={request?.requiresSupervision ?? false}
        supervisorFee={request?.supervisorFee ?? 2000000}
      />
    </>
  );
};

export default RequestDetailPage;
