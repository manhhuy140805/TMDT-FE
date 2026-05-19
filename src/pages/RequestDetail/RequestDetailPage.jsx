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

  // Yêu cầu còn nhận hồ sơ khi: đang mở VÀ chưa có freelancer được chọn
  const isAcceptingBids =
    request &&
    (request.status === "DangMo" || request.status === "MoDau") &&
    !quotes.some((q) => q.status === "DuocChon");

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
    try {
      await api.chat.createConversation({ thanhVien2Id: targetId });
    } catch {
      // Conversation có thể đã tồn tại — bỏ qua lỗi, navigate luôn
    }
    navigate("/workspace/messages");
  };

  const confirmAcceptQuote = async () => {
    if (!selectedQuote) return;

    setAccepting(true);
    try {
      // Tạo hợp đồng từ báo giá được chọn
      await api.contracts.create({
        baoGiaId: selectedQuote.id,
        giaThucTe: selectedQuote.minPrice,
        thoiHanThucTe: selectedQuote.durationDays,
      });
      alert("Đã chấp nhận báo giá và tạo hợp đồng thành công!");
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
      />
    </>
  );
};

export default RequestDetailPage;
