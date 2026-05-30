import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import api from "../../services/api";
import "./WorkspaceComplaints.css";

const CASE_FILTERS = [
  { value: "ALL", label: "Tất cả" },
  { value: "MoiMo", label: "Mới mở" },
  { value: "DangXuLy", label: "Đang xử lý" },
  { value: "CLOSED", label: "Đã kết luận" },
];

const PLATFORM_FEE_PERCENT = 5;

const WorkspaceComplaints = () => {
  const { currentUser, jobs, showToast, refreshWorkspaceData } =
    useOutletContext();
  const [disputes, setDisputes] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [caseLoading, setCaseLoading] = useState(false);
  const [error, setError] = useState(null);
  const [caseError, setCaseError] = useState(null);
  const [activeDispute, setActiveDispute] = useState(null);
  const [contract, setContract] = useState(null);
  const [progressList, setProgressList] = useState([]);
  const [refundRequest, setRefundRequest] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showResolution, setShowResolution] = useState(false);
  const [resolution, setResolution] = useState({
    ketQua: "TiepTuc",
    lyDo: "",
    soTienNguoiThue: "",
    soTienFreelancer: "",
    soTienGiamSat: "",
    bangChungs: [],
  });
  const [supervisorEvidenceForm, setSupervisorEvidenceForm] = useState({
    loaiBangChung: "GhiChu",
    noiDung: "",
    file: null,
  });
  const autoSyncedDisputesRef = useRef(new Set());

  const supervisorId = currentUser?.taiKhoanId || currentUser?.id;

  const getConclusionContractStatus = (ketQua) => {
    if (ketQua === "TiepTuc") return "HoanThanh";
    if (
      ketQua === "HoanTienNguoiThue" ||
      ketQua === "HuyHopDong" ||
      ketQua === "PhanChia"
    ) {
      return "DaHuy";
    }
    return null;
  };

  const fetchDisputes = useCallback(async () => {
    setLoading(true);
    setError(null);
    const contractIds = [
      ...new Set(jobs.map((item) => item.congViecId).filter(Boolean)),
    ];

    if (contractIds.length === 0) {
      setDisputes([]);
      setSelectedId(null);
      setLoading(false);
      return;
    }

    const results = await Promise.allSettled(
      contractIds.map((id) => api.disputes.getByContractId(id)),
    );
    const fulfilled = results.filter((result) => result.status === "fulfilled");

    if (fulfilled.length === 0) {
      setDisputes([]);
      setSelectedId(null);
      setError("Không tải được danh sách tranh chấp.");
      setLoading(false);
      return;
    }

    const list = fulfilled
      .flatMap((result) => {
        const value = result.value;
        return (
          value?.disputes ||
          value?.data?.disputes ||
          (Array.isArray(value?.data) ? value.data : [])
        );
      })
      .sort((left, right) => new Date(right.ngayMo) - new Date(left.ngayMo));

    setDisputes(list);
    setSelectedId((current) => {
      if (list.some((item) => item.tranhChapId === current)) return current;
      return list[0]?.tranhChapId ?? null;
    });
    setLoading(false);
  }, [jobs]);

  const fetchCaseDetails = useCallback(
    async (disputeId) => {
      if (!disputeId) {
        setActiveDispute(null);
        setContract(null);
        setProgressList([]);
        setCaseError(null);
        return;
      }
      setCaseLoading(true);
      setCaseError(null);
      setShowResolution(false);

      const selected = disputes.find((item) => item.tranhChapId === disputeId);
      const contractId = selected?.congViecId;
      const [disputeResult, contractResult, progressResult, refundResult] =
        await Promise.allSettled([
          api.disputes.getById(disputeId),
          contractId
            ? api.contracts.getDetail(contractId)
            : Promise.resolve(null),
          contractId
            ? api.progress.getByContractId(contractId)
            : Promise.resolve(null),
          contractId
            ? api.refundRequests.getByContractId(contractId)
            : Promise.resolve(null),
        ]);

      if (disputeResult.status === "fulfilled") {
        setActiveDispute(
          disputeResult.value?.dispute || disputeResult.value?.data || selected,
        );
      } else {
        setActiveDispute(selected || null);
        setCaseError("Không thể tải đầy đủ thông tin tranh chấp.");
      }

      if (contractResult.status === "fulfilled") {
        setContract(
          contractResult.value?.contract ||
            contractResult.value?.data ||
            contractResult.value,
        );
      } else {
        setContract(null);
      }

      if (progressResult.status === "fulfilled") {
        const value = progressResult.value;
        setProgressList(
          value?.progress || value?.data || (Array.isArray(value) ? value : []),
        );
      } else {
        setProgressList([]);
      }

      if (refundResult.status === "fulfilled") {
        const resVal = refundResult.value;
        const rr = resVal?.refundRequest ?? resVal?.refundRequests ?? resVal?.data?.refundRequest ?? resVal?.data?.refundRequests ?? resVal?.data ?? resVal;
        const finalRR = Array.isArray(rr) ? rr[rr.length - 1] : rr;
        setRefundRequest(finalRR && (finalRR.trangThai || finalRR.status || finalRR.refundRequestId || finalRR.id) ? finalRR : null);
      } else {
        setRefundRequest(null);
      }

      setCaseLoading(false);
    },
    [disputes],
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDisputes();
  }, [fetchDisputes]);

  useEffect(() => {
    // Loading a dossier follows the selected record in the case queue.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCaseDetails(selectedId);
  }, [fetchCaseDetails, selectedId]);

  useEffect(() => {
    const ketQua = activeDispute?.ketLuan?.ketQua;
    const nextStatus = getConclusionContractStatus(ketQua);
    const isResolved =
      activeDispute?.trangThai === "DaKetLuan" ||
      activeDispute?.trangThai === "DaDong";

    if (
      !isResolved ||
      !nextStatus ||
      contract?.trangThai !== "TranhChap" ||
      !activeDispute?.congViecId ||
      autoSyncedDisputesRef.current.has(activeDispute.tranhChapId)
    ) {
      return;
    }

    autoSyncedDisputesRef.current.add(activeDispute.tranhChapId);
    api.contracts
      .updateStatus(activeDispute.congViecId, nextStatus)
      .then(() => {
        setContract((current) =>
          current ? { ...current, trangThai: nextStatus } : current,
        );
        refreshWorkspaceData?.();
      })
      .catch((err) => {
        autoSyncedDisputesRef.current.delete(activeDispute.tranhChapId);
        console.warn("Khong the dong bo trang thai cong viec:", err);
      });
  }, [activeDispute, contract?.trangThai, refreshWorkspaceData]);

  const filteredDisputes = useMemo(() => {
    if (filter === "ALL") return disputes;
    if (filter === "CLOSED") {
      return disputes.filter(
        (item) => item.trangThai === "DaKetLuan" || item.trangThai === "DaDong",
      );
    }
    return disputes.filter((item) => item.trangThai === filter);
  }, [disputes, filter]);

  const getCount = (value) => {
    if (value === "ALL") return disputes.length;
    if (value === "CLOSED") {
      return disputes.filter(
        (item) => item.trangThai === "DaKetLuan" || item.trangThai === "DaDong",
      ).length;
    }
    return disputes.filter((item) => item.trangThai === value).length;
  };

  const handleFilterChange = (value) => {
    setFilter(value);
    const nextList =
      value === "ALL"
        ? disputes
        : value === "CLOSED"
          ? disputes.filter(
              (item) =>
                item.trangThai === "DaKetLuan" || item.trangThai === "DaDong",
            )
          : disputes.filter((item) => item.trangThai === value);
    if (!nextList.some((item) => item.tranhChapId === selectedId)) {
      setSelectedId(nextList[0]?.tranhChapId ?? null);
    }
  };

  const handleReview = async () => {
    setActionLoading(true);
    try {
      await api.disputes.review(
        activeDispute.tranhChapId,
        Number(supervisorId),
      );
      showToast("Đã tiếp nhận xử lý tranh chấp.", "success");
      await fetchDisputes();
      await fetchCaseDetails(activeDispute.tranhChapId);
    } catch (err) {
      showToast(err.message || "Không thể tiếp nhận tranh chấp.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const getSupervisorFee = useCallback(() => {
    return Number(contract?.phiGiamSat ?? contract?.yeuCau?.phiGiamSat ?? 0) || 0;
  }, [contract]);

  const getDisputeTotal = useCallback(() => {
    return Number(contract?.giaThoa ?? activeDispute?.yeuCauHoanTien ?? 0) || 0;
  }, [activeDispute, contract]);

  const getFreelancerFund = useCallback(() => {
    return Math.max(0, getDisputeTotal() - getSupervisorFee());
  }, [getDisputeTotal, getSupervisorFee]);

  const getRequestedRefundAmount = useCallback(() => {
    const contractId = activeDispute?.congViecId || contract?.congViecId;
    const requestId = refundRequest?.refundRequestId || refundRequest?.id || "pending";
    let rememberedAmount = 0;
    try {
      rememberedAmount = Number(
        localStorage.getItem(`refund-requested-amount:${contractId}:${requestId}`) ||
          localStorage.getItem(`refund-requested-amount:${contractId}:pending`) ||
          0,
      ) || 0;
    } catch {
      rememberedAmount = 0;
    }

    const candidates = [
      refundRequest?.requestedRefundAmount,
      refundRequest?.tienHoanYeuCau,
      refundRequest?.soTienYeuCau,
      refundRequest?.soTienHoanYeuCau,
      refundRequest?.yeuCauHoanTien,
      refundRequest?.soTienHoan,
      refundRequest?.refundAmount,
      refundRequest?.amount,
      rememberedAmount,
      activeDispute?.yeuCauHoanTien,
      refundRequest?.tienHoan,
    ];
    return candidates.map(Number).find((amount) => amount > 0) || 0;
  }, [activeDispute, contract, refundRequest]);

  const getMaxRefundAmount = useCallback(() => {
    const requestedRefund = getRequestedRefundAmount();
    return Math.min(getFreelancerFund(), requestedRefund || getFreelancerFund());
  }, [getFreelancerFund, getRequestedRefundAmount]);

  const calculateRefundResolution = useCallback(
    (refundAmount) => {
      const freelancerFund = getFreelancerFund();
      const maxRefund = getRequestedRefundAmount() || freelancerFund;
      const actualMaxRefund = Math.min(freelancerFund, maxRefund);

      const refundToEmployerGross = Math.max(
        0,
        Math.min(Number(refundAmount) || 0, actualMaxRefund),
      );
      const remainingForFreelancerGross = Math.max(0, freelancerFund - refundToEmployerGross);

      let systemFee = 0;
      let refundToEmployer = refundToEmployerGross;
      let freelancerReceives = remainingForFreelancerGross;
      let benChiuPhi = "Freelancer";

      if (refundToEmployerGross > remainingForFreelancerGross) {
        systemFee = Math.round((refundToEmployerGross * PLATFORM_FEE_PERCENT) / 100);
        refundToEmployer = Math.max(0, refundToEmployerGross - systemFee);
        benChiuPhi = "NguoiThue";
      } else {
        systemFee = Math.round((remainingForFreelancerGross * PLATFORM_FEE_PERCENT) / 100);
        freelancerReceives = Math.max(0, remainingForFreelancerGross - systemFee);
        benChiuPhi = "Freelancer";
      }

      return {
        refundToEmployer,
        supervisorReceives: getSupervisorFee(),
        systemFee,
        freelancerReceives,
        freelancerGross: remainingForFreelancerGross,
        benChiuPhi
      };
    },
    [getFreelancerFund, getRequestedRefundAmount, getSupervisorFee],
  );

  const openResolution = () => {
    const defaultAmount = getMaxRefundAmount();
    const amounts = calculateRefundResolution(defaultAmount);

    setResolution({
      ketQua: "TiepTuc",
      lyDo: "",
      soTienNguoiThue: amounts.refundToEmployer,
      soTienFreelancer: amounts.freelancerReceives,
      soTienGiamSat: amounts.supervisorReceives,
      soTienHeThong: amounts.systemFee,
      soTienHoan: amounts.refundToEmployer,
      benChiuPhi: amounts.benChiuPhi,
      bangChungs: [],
    });
    setSupervisorEvidenceForm({
      loaiBangChung: "GhiChu",
      noiDung: "",
      file: null,
    });
    setShowResolution(true);
  };

  const handleRefundAmountChange = (value) => {
    const amounts = calculateRefundResolution(value);
    setResolution((current) => ({
      ...current,
      soTienNguoiThue: amounts.refundToEmployer,
      soTienFreelancer: amounts.freelancerReceives,
      soTienGiamSat: amounts.supervisorReceives,
      soTienHeThong: amounts.systemFee,
      soTienHoan: amounts.refundToEmployer,
      benChiuPhi: amounts.benChiuPhi,
    }));
  };

  const handleAddSupervisorEvidence = async () => {
    if (!supervisorEvidenceForm.noiDung.trim() && !supervisorEvidenceForm.file) {
      return;
    }

    let duongDanFile = null;
    if (supervisorEvidenceForm.file) {
      const formData = new FormData();
      formData.append("file", supervisorEvidenceForm.file);
      try {
        const uploadRes = await fetch("http://localhost:8080/upload/evidence", {
          method: "POST",
          body: formData,
        });
        if (!uploadRes.ok) {
          throw new Error("Upload file thất bại");
        }
        const uploadData = await uploadRes.json();
        duongDanFile = uploadData?.filePath;
        if (!duongDanFile) {
          showToast("Không thể lấy đường dẫn tệp.", "error");
          return;
        }
      } catch (err) {
        console.error("File upload error:", err);
        showToast("Không thể tải lên tệp: " + (err.message || "Lỗi không xác định"), "error");
        return;
      }
    }

    try {
      const newEvidence = {
        loaiBangChung: supervisorEvidenceForm.loaiBangChung,
        noiDung: supervisorEvidenceForm.noiDung.trim() || undefined,
        duongDanFile: duongDanFile || undefined,
      };

      setResolution((current) => ({
        ...current,
        bangChungs: [...(current.bangChungs || []), newEvidence],
      }));

      setSupervisorEvidenceForm({
        loaiBangChung: "GhiChu",
        noiDung: "",
        file: null,
      });

      showToast("Đã thêm minh chứng.", "success");
    } catch (err) {
      console.error("Add evidence error:", err);
      showToast("Không thể thêm minh chứng.", "error");
    }
  };

  const handleRemoveSupervisorEvidence = (index) => {
    setResolution((current) => ({
      ...current,
      bangChungs: current.bangChungs.filter((_, i) => i !== index),
    }));
  };

  const handleResolve = async (event) => {
    event.preventDefault();
    if (!resolution.lyDo.trim()) {
      showToast("Vui lòng nhập căn cứ kết luận.", "warning");
      return;
    }

    setActionLoading(true);
    try {
      const isRefundConclusion = resolution.ketQua === "HoanTienNguoiThue";

      // Prepare evidence array if supervisor provided any
      let bangChungArray = [];
      if (resolution.bangChungs && resolution.bangChungs.length > 0) {
        bangChungArray = resolution.bangChungs;
      }

      await api.disputes.resolve(activeDispute.tranhChapId, {
        giamSatId: Number(supervisorId),
        ketQua: resolution.ketQua,
        lyDo: resolution.lyDo.trim(),
        soTienHoan: isRefundConclusion
          ? Number(resolution.soTienNguoiThue) || 0
          : 0,
        soTienFreelancer: isRefundConclusion
          ? Number(resolution.soTienFreelancer) || 0
          : 0,
        soTienGiamSat: isRefundConclusion
          ? Number(resolution.soTienGiamSat) || 0
          : 0,
        benChiuPhi: isRefundConclusion ? resolution.benChiuPhi : "ChiaSe",
        bangChungArray: bangChungArray.length > 0 ? bangChungArray : undefined,
      });

      let nextContractStatus = null;
      if (isRefundConclusion) {
        nextContractStatus = "DaHuy";
        setContract((current) =>
          current ? { ...current, trangThai: nextContractStatus } : current,
        );
      }

      if (!isRefundConclusion && contract?.trangThai === "TranhChap") {
        nextContractStatus =
          resolution.ketQua === "TiepTuc" ? "DangThucHien" : "DaHuy";
        try {
          await api.contracts.updateStatus(
            activeDispute.congViecId,
            nextContractStatus,
          );
          setContract((current) =>
            current ? { ...current, trangThai: nextContractStatus } : current,
          );
        } catch (statusError) {
          setShowResolution(false);
          await Promise.all([
            fetchDisputes(),
            fetchCaseDetails(activeDispute.tranhChapId),
            refreshWorkspaceData?.(),
          ]);
          showToast(
            `Kết luận đã lưu nhưng chưa cập nhật được trạng thái công việc.${statusError.message ? ` ${statusError.message}` : ""}`,
            "warning",
          );
          return;
        }
      }

      const message =
        nextContractStatus === "DangThucHien"
          ? "Đã kết luận tranh chấp và mở lại công việc."
          : nextContractStatus === "DaHuy"
            ? "Đã kết luận tranh chấp và cập nhật công việc đã hủy."
            : "Đã lưu kết luận tranh chấp.";
      showToast(message, "success");
      setShowResolution(false);
      await Promise.all([
        fetchDisputes(),
        fetchCaseDetails(activeDispute.tranhChapId),
        refreshWorkspaceData?.(),
      ]);
    } catch (err) {
      showToast(err.message || "Không thể kết luận tranh chấp.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSyncContractStatus = async (nextStatus) => {
    setActionLoading(true);
    try {
      await api.contracts.updateStatus(activeDispute.congViecId, nextStatus);
      setContract((current) =>
        current ? { ...current, trangThai: nextStatus } : current,
      );
      await Promise.all([
        fetchCaseDetails(activeDispute.tranhChapId),
        refreshWorkspaceData?.(),
      ]);
      showToast(
        nextStatus === "DangThucHien"
          ? "Đã mở lại công việc theo kết luận."
          : "Đã đóng công việc theo kết luận.",
        "success",
      );
    } catch (err) {
      showToast(
        err.message || "Không thể cập nhật trạng thái công việc.",
        "error",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (value) => {
    if (!value) return "Chưa có";
    return new Date(value).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatCurrency = (value) =>
    `${new Intl.NumberFormat("vi-VN").format(Number(value) || 0)} VNĐ`;

  const statusInfo = (status) =>
    ({
      MoiMo: { label: "Mới mở", className: "new" },
      DangXuLy: { label: "Đang xử lý", className: "processing" },
      DaKetLuan: { label: "Đã kết luận", className: "resolved" },
      DaDong: { label: "Đã đóng", className: "closed" },
    })[status] || { label: status || "Không rõ", className: "closed" };

  const getEvidenceIcon = (type) =>
    ({
      File: "fa-file-lines",
      HinhAnh: "fa-image",
      TinNhan: "fa-comments",
      GhiChu: "fa-note-sticky",
    })[type] || "fa-paperclip";

  const getFileUrl = (path) => {
    if (!path) return null;
    if (/^https?:\/\//i.test(path)) return path;
    return `http://localhost:8080/${path.replace(/^\/+/, "")}`;
  };

  const projectTitle =
    contract?.yeuCau?.tieuDe || `Hợp đồng #${activeDispute?.congViecId || ""}`;
  const employerName =
    contract?.nguoiThue?.congTy ||
    contract?.nguoiThue?.hoTen ||
    `Tài khoản #${activeDispute?.nguoiGuiId || ""}`;
  const freelancerName = contract?.freelancer?.hoTen || "Chưa có thông tin";

  if (loading) {
    return (
      <div className="wc-loading">
        <i className="fa-solid fa-circle-notch fa-spin"></i>
        <p>Đang tải hồ sơ tranh chấp...</p>
      </div>
    );
  }

  return (
    <div className="wc-page">
      <header className="wc-header">
        <div>
          <p className="wc-eyebrow">Trung tâm phân xử</p>
          <h2>Xử lý tranh chấp</h2>
          <p className="wc-header-description">
            Kiểm tra hồ sơ, minh chứng và đưa ra kết luận cho từng công việc.
          </p>
        </div>
        <div className="wc-header-stat">
          <strong>{disputes.length}</strong>
          <span>Hồ sơ được giao</span>
        </div>
      </header>

      {error && (
        <div className="wc-alert">
          <i className="fa-solid fa-triangle-exclamation"></i>
          {error}
        </div>
      )}

      <div className="wc-filter-bar">
        {CASE_FILTERS.map((item) => (
          <button
            key={item.value}
            type="button"
            className={`wc-filter ${filter === item.value ? "active" : ""}`}
            onClick={() => handleFilterChange(item.value)}
          >
            {item.label}
            <span>{getCount(item.value)}</span>
          </button>
        ))}
      </div>

      {disputes.length === 0 ? (
        <div className="wc-empty">
          <i className="fa-solid fa-scale-balanced"></i>
          <h3>Chưa có tranh chấp cần xử lý</h3>
          <p>Các vụ việc được phân công sẽ hiển thị tại đây.</p>
        </div>
      ) : (
        <div className="wc-grid">
          <aside className="wc-queue">
            <div className="wc-queue-label">
              {filteredDisputes.length} hồ sơ
            </div>
            {filteredDisputes.length === 0 && (
              <p className="wc-queue-empty">Không có hồ sơ ở trạng thái này.</p>
            )}
            {filteredDisputes.map((dispute) => {
              const status = statusInfo(dispute.trangThai);
              return (
                <button
                  type="button"
                  key={dispute.tranhChapId}
                  className={`wc-case-item ${selectedId === dispute.tranhChapId ? "selected" : ""}`}
                  onClick={() => setSelectedId(dispute.tranhChapId)}
                >
                  <div className="wc-case-row">
                    <strong>Tranh chấp #{dispute.tranhChapId}</strong>
                    <span className={`wc-status ${status.className}`}>
                      {status.label}
                    </span>
                  </div>
                  <p>{dispute.lyDo}</p>
                  <div className="wc-case-meta">
                    <span>HĐ #{dispute.congViecId}</span>
                    <span>{formatDate(dispute.ngayMo)}</span>
                  </div>
                  <div className="wc-case-money">
                    {formatCurrency(dispute.yeuCauHoanTien)} yêu cầu hoàn
                  </div>
                </button>
              );
            })}
          </aside>

          <main className="wc-dossier">
            {caseLoading ? (
              <div className="wc-detail-loading">
                <i className="fa-solid fa-circle-notch fa-spin"></i> Đang mở hồ
                sơ...
              </div>
            ) : activeDispute ? (
              <>
                <section className="wc-dossier-header">
                  <div>
                    <p className="wc-eyebrow">
                      Hồ sơ #{activeDispute.tranhChapId}
                    </p>
                    <h3>{projectTitle}</h3>
                    <p>
                      Hợp đồng #{activeDispute.congViecId} | Mở ngày{" "}
                      {formatDate(activeDispute.ngayMo)}
                    </p>
                  </div>
                  <span
                    className={`wc-status large ${statusInfo(activeDispute.trangThai).className}`}
                  >
                    {statusInfo(activeDispute.trangThai).label}
                  </span>
                </section>

                {caseError && <div className="wc-alert small">{caseError}</div>}

                <div className="wc-metrics">
                  <div>
                    <span>Yêu cầu hoàn</span>
                    <strong>
                      {formatCurrency(getRequestedRefundAmount() || activeDispute.yeuCauHoanTien)}
                    </strong>
                  </div>
                  <div>
                    <span>Giá hợp đồng</span>
                    <strong>{formatCurrency(contract?.giaThoa)}</strong>
                  </div>
                  <div>
                    <span>Minh chứng</span>
                    <strong>{(activeDispute?.bangChungs || []).length} tài liệu</strong>
                  </div>
                </div>

                <section className="wc-panel">
                  <div className="wc-panel-title">
                    <i className="fa-solid fa-file-circle-exclamation"></i>Nội
                    dung khiếu nại
                  </div>
                  <h4>{activeDispute.lyDo}</h4>
                  <p>
                    {activeDispute.moTa ||
                      "Người gửi không bổ sung mô tả chi tiết."}
                  </p>
                  <div className="wc-inline-info">
                    <span>
                      <i className="fa-regular fa-user"></i>Người gửi #
                      {activeDispute.nguoiGuiId}
                    </span>
                    <span>
                      <i className="fa-regular fa-calendar"></i>
                      {formatDate(activeDispute.ngayMo)}
                    </span>
                    {activeDispute.ngayDong && (
                      <span>
                        <i className="fa-solid fa-check"></i>Đóng{" "}
                        {formatDate(activeDispute.ngayDong)}
                      </span>
                    )}
                  </div>
                </section>

                <div className="wc-section-grid">
                  <section className="wc-panel">
                    <div className="wc-panel-title">
                      <i className="fa-solid fa-users"></i>Các bên liên quan
                    </div>
                    <div className="wc-parties">
                      <div>
                        <span>Người thuê</span>
                        <strong>{employerName}</strong>
                      </div>
                      <div>
                        <span>Freelancer</span>
                        <strong>{freelancerName}</strong>
                      </div>
                      <div>
                        <span>Đơn vị giám sát</span>
                        <strong>
                          {contract?.giamSat?.tenDonVi ||
                            currentUser?.tenDonVi ||
                            "Đơn vị của bạn"}
                        </strong>
                      </div>
                    </div>
                  </section>
                  <section className="wc-panel">
                    <div className="wc-panel-title">
                      <i className="fa-solid fa-briefcase"></i>Thông tin công
                      việc
                    </div>
                    <div className="wc-contract-info">
                      <div>
                        <span>Bắt đầu</span>
                        <strong>{formatDate(contract?.ngayBatDau)}</strong>
                      </div>
                      <div>
                        <span>Kết thúc</span>
                        <strong>{formatDate(contract?.ngayKetThuc)}</strong>
                      </div>
                      <div>
                        <span>Tiến độ nộp</span>
                        <strong>{progressList.length} mốc</strong>
                      </div>
                      <Link to={`/workspace/jobs/${activeDispute.congViecId}`}>
                        Xem hợp đồng đầy đủ{" "}
                        <i className="fa-solid fa-arrow-right"></i>
                      </Link>
                    </div>
                  </section>
                </div>

                <section className="wc-panel">
                  <div className="wc-panel-heading">
                    <div className="wc-panel-title">
                      <i className="fa-solid fa-list-check"></i>Mốc bàn giao
                      liên quan
                    </div>
                    <span className="wc-count">{progressList.length}</span>
                  </div>
                  {progressList.length === 0 ? (
                    <div className="wc-evidence-empty">
                      Chưa có mốc tiến độ để đối chiếu.
                    </div>
                  ) : (
                    <div className="wc-progress-list">
                      {progressList
                        .slice(-3)
                        .reverse()
                        .map((progress) => (
                          <div
                            key={progress.tienDoId}
                            className="wc-progress-item"
                          >
                            <div>
                              <strong>
                                {progress.tieuDe || "Cập nhật tiến độ"}
                              </strong>
                              <p>
                                {progress.moTa || "Không có mô tả bổ sung."}
                              </p>
                            </div>
                            <div className="wc-progress-value">
                              <strong>
                                {progress.phanTram ??
                                  progress.phanTramHoanThanh ??
                                  0}
                                %
                              </strong>
                              <span>
                                {progress.trangThaiXacNhan || "Chưa xác nhận"}
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </section>

                <section className="wc-panel">
                  <div className="wc-panel-heading">
                    <div className="wc-panel-title">
                      <i className="fa-solid fa-folder-open"></i>Minh chứng đã
                      nộp
                    </div>
                    <span className="wc-count">{(activeDispute?.bangChungs || []).length}</span>
                  </div>
                  {!activeDispute?.bangChungs || activeDispute.bangChungs.length === 0 ? (
                    <div className="wc-evidence-empty">
                      Chưa có minh chứng được nộp cho tranh chấp này.
                    </div>
                  ) : (
                    <div className="wc-evidences">
                      {activeDispute.bangChungs.map((evidence) => {
                        const fileUrl = getFileUrl(evidence.duongDanFile);
                        return (
                          <article
                            key={evidence.bangChungId}
                            className="wc-evidence"
                          >
                            <div className="wc-evidence-icon">
                              <i
                                className={`fa-solid ${getEvidenceIcon(evidence.loaiBangChung)}`}
                              ></i>
                            </div>
                            <div className="wc-evidence-body">
                              <div className="wc-evidence-top">
                                <strong>
                                  {evidence.loaiBangChung || "Minh chứng"}
                                </strong>
                                <span>{formatDate(evidence.ngayNop)}</span>
                              </div>
                              <p>
                                {evidence.noiDung || "Không có mô tả tài liệu."}
                              </p>
                              <small>
                                Nộp bởi: {evidence.loaiNguoiNop === "NguoiThue" ? "Người thuê" : "Freelancer"} (ID: {evidence.nguoiNopId})
                              </small>
                            </div>
                            {fileUrl && (
                              <a
                                href={fileUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="wc-file-link"
                              >
                                <i className="fa-solid fa-arrow-up-right-from-square"></i>{" "}
                                Xem tệp
                              </a>
                            )}
                          </article>
                        );
                      })}
                    </div>
                  )}
                </section>

                <section className="wc-decision">
                  <div>
                    <h4>Quyết định phân xử</h4>
                    <p>
                      Kiểm tra thông tin và minh chứng trước khi cập nhật trạng
                      thái hồ sơ.
                    </p>
                  </div>
                  {activeDispute.trangThai === "MoiMo" && (
                    <button
                      type="button"
                      className="wc-primary"
                      disabled={actionLoading}
                      onClick={handleReview}
                    >
                      {actionLoading ? "Đang tiếp nhận..." : "Tiếp nhận xử lý"}
                    </button>
                  )}
                  {activeDispute.trangThai === "DangXuLy" &&
                    !showResolution && (
                      <button
                        type="button"
                        className="wc-primary"
                        onClick={openResolution}
                      >
                        Mở phiếu kết luận
                      </button>
                    )}
                  {(activeDispute.trangThai === "DaKetLuan" ||
                    activeDispute.trangThai === "DaDong") &&
                    (contract?.trangThai !== "TranhChap" ||
                      activeDispute.ketLuan) && (
                      <span className="wc-finished">
                        <i className="fa-solid fa-circle-check"></i> Hồ sơ đã
                        được kết luận
                      </span>
                    )}
                </section>

                {(activeDispute.trangThai === "DaKetLuan" ||
                  activeDispute.trangThai === "DaDong") &&
                  contract?.trangThai === "TranhChap" &&
                  !activeDispute.ketLuan && (
                    <section className="wc-sync-warning">
                      <div>
                        <h4>Kết luận đã có, công việc chưa đồng bộ</h4>
                        <p>
                          Chọn trạng thái công việc tương ứng với quyết định đã
                          ghi nhận.
                        </p>
                      </div>
                      <div className="wc-sync-actions">
                        <button
                          type="button"
                          className="wc-secondary"
                          disabled={actionLoading}
                          onClick={() =>
                            handleSyncContractStatus("DangThucHien")
                          }
                        >
                          Tiếp tục công việc
                        </button>
                        <button
                          type="button"
                          className="wc-primary"
                          disabled={actionLoading}
                          onClick={() => handleSyncContractStatus("DaHuy")}
                        >
                          Đóng công việc
                        </button>
                      </div>
                    </section>
                  )}

                {showResolution && (
                  <form className="wc-resolution" onSubmit={handleResolve}>
                    <h4>Phiếu kết luận tranh chấp</h4>

                    <div className="wc-resolution-type">
                      <label>
                        Loại kết quả
                        <select
                          value={resolution.ketQua}
                          onChange={(event) =>
                            setResolution((value) => ({
                              ...value,
                              ketQua: event.target.value,
                            }))
                          }
                        >
                          <option value="TiepTuc">Tiếp tục hợp đồng</option>
                          <option value="HoanTienNguoiThue">
                            Hoàn tiền người thuê
                          </option>
                        </select>
                      </label>
                    </div>

                    {resolution.ketQua !== "TiepTuc" && (
                      <div className="wc-resolution-distribution">
                        <div className="wc-resolution-total">
                          Phân bổ quỹ Freelancer —{" "}
                          {formatCurrency(getFreelancerFund())}
                        </div>

                        <div className="wc-slider-group">
                          <div className="wc-slider-item">
                            <div className="wc-slider-header">
                              <span className="wc-party nguoithue">
                                <i className="fa-solid fa-circle"></i> Người thuê (Yêu cầu)
                              </span>
                              <div className="wc-slider-values">
                                <span className="wc-percentage">
                                  {Math.round(
                                    ((resolution.soTienHoan || 0) /
                                      (getFreelancerFund() || 1)) *
                                      100,
                                  )}
                                  %
                                </span>
                                <span className="wc-amount">
                                  {formatCurrency(resolution.soTienHoan || 0)}
                                </span>
                              </div>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max={getMaxRefundAmount()}
                              value={resolution.soTienHoan || 0}
                              onChange={(event) =>
                                handleRefundAmountChange(event.target.value)
                              }
                              className="wc-slider nguoithue-slider"
                            />
                            <div className="wc-slider-hint" style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>
                              Giới hạn tối đa: {formatCurrency(getMaxRefundAmount())}
                            </div>
                          </div>
                        </div>

                        <div className="wc-summary-card" style={{ background: "#F8FAFC", borderRadius: "8px", padding: "16px", marginTop: "16px", border: "1px solid #E2E8F0" }}>
                          <h5 style={{ margin: "0 0 12px 0", color: "#334155", fontSize: "14px", borderBottom: "1px solid #e2e8f0", paddingBottom: "8px" }}>
                            Phân bổ thực tế (đã trừ 5% phí hệ thống cho {resolution.benChiuPhi === "NguoiThue" ? "Người thuê" : "Freelancer"})
                          </h5>
                          
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                            <span style={{ color: "#475569" }}>Người thuê nhận lại:</span>
                            <strong style={{ color: "#3B82F6" }}>{formatCurrency(resolution.soTienNguoiThue)}</strong>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                            <span style={{ color: "#475569" }}>Freelancer nhận:</span>
                            <strong style={{ color: "#10B981" }}>{formatCurrency(resolution.soTienFreelancer)}</strong>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                            <span style={{ color: "#475569" }}>Giám sát viên:</span>
                            <strong style={{ color: "#F59E0B" }}>{formatCurrency(resolution.soTienGiamSat)}</strong>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span style={{ color: "#475569" }}>Phí hệ thống (5%):</span>
                            <strong style={{ color: "#EF4444" }}>{formatCurrency(resolution.soTienHeThong)}</strong>
                          </div>
                        </div>
                      </div>
                    )}

                    <label className="wc-resolution-reason">
                      Căn cứ & lý do kết luận
                      <textarea
                        required
                        rows="4"
                        value={resolution.lyDo}
                        onChange={(event) =>
                          setResolution((value) => ({
                            ...value,
                            lyDo: event.target.value,
                          }))
                        }
                        placeholder="Mô tả kết quả đánh giá minh chứng và căn cứ ra quyết định..."
                      />
                    </label>

                    <div className="wc-supervisor-evidence">
                      <h5>Minh chứng bổ sung (Tùy chọn)</h5>
                      <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "12px" }}>
                        Giám sát viên có thể cung cấp thêm minh chứng để hỗ trợ kết luận (không bắt buộc).
                      </p>

                      {resolution.bangChungs && resolution.bangChungs.length > 0 && (
                        <div style={{ marginBottom: "16px", padding: "12px", background: "#F0F9FF", borderRadius: "6px", border: "1px solid #BAE6FD" }}>
                          <strong style={{ fontSize: "13px", color: "#0369A1" }}>
                            {resolution.bangChungs.length} minh chứng đã thêm
                          </strong>
                          <div style={{ marginTop: "8px" }}>
                            {resolution.bangChungs.map((evidence, idx) => (
                              <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid #BAE6FD" }}>
                                <span style={{ fontSize: "12px", color: "#334155" }}>
                                  <i className="fa-solid fa-check" style={{ color: "#10B981", marginRight: "6px" }}></i>
                                  {evidence.loaiBangChung}: {evidence.noiDung?.substring(0, 30) || evidence.duongDanFile?.split("/").pop() || "Tệp"}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveSupervisorEvidence(idx)}
                                  style={{ background: "none", border: "none", color: "#EF4444", cursor: "pointer", fontSize: "12px" }}
                                >
                                  <i className="fa-solid fa-trash"></i>
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                        <label style={{ display: "flex", flexDirection: "column" }}>
                          <span style={{ fontSize: "12px", fontWeight: "500", marginBottom: "4px", color: "#334155" }}>Loại minh chứng</span>
                          <select
                            value={supervisorEvidenceForm.loaiBangChung}
                            onChange={(e) =>
                              setSupervisorEvidenceForm((current) => ({
                                ...current,
                                loaiBangChung: e.target.value,
                              }))
                            }
                            style={{ padding: "8px", borderRadius: "4px", border: "1px solid #CBD5E1", fontSize: "13px" }}
                          >
                            <option value="GhiChu">Ghi chú</option>
                            <option value="File">Tệp đính kèm</option>
                            <option value="HinhAnh">Hình ảnh</option>
                            <option value="TinNhan">Tin nhắn</option>
                          </select>
                        </label>
                        <label style={{ display: "flex", flexDirection: "column" }}>
                          <span style={{ fontSize: "12px", fontWeight: "500", marginBottom: "4px", color: "#334155" }}>Tệp (nếu có)</span>
                          <input
                            type="file"
                            onChange={(e) =>
                              setSupervisorEvidenceForm((current) => ({
                                ...current,
                                file: e.target.files?.[0] || null,
                              }))
                            }
                            style={{ padding: "6px", borderRadius: "4px", border: "1px solid #CBD5E1", fontSize: "12px" }}
                          />
                        </label>
                      </div>

                      <label style={{ display: "flex", flexDirection: "column", marginBottom: "12px" }}>
                        <span style={{ fontSize: "12px", fontWeight: "500", marginBottom: "4px", color: "#334155" }}>Nội dung minh chứng</span>
                        <textarea
                          rows="3"
                          value={supervisorEvidenceForm.noiDung}
                          onChange={(e) =>
                            setSupervisorEvidenceForm((current) => ({
                              ...current,
                              noiDung: e.target.value,
                            }))
                          }
                          placeholder="Mô tả minh chứng bổ sung (tùy chọn)..."
                          style={{ padding: "8px", borderRadius: "4px", border: "1px solid #CBD5E1", fontSize: "13px", fontFamily: "inherit" }}
                        />
                      </label>

                      <button
                        type="button"
                        onClick={handleAddSupervisorEvidence}
                        disabled={!supervisorEvidenceForm.noiDung.trim() && !supervisorEvidenceForm.file}
                        style={{
                          padding: "8px 12px",
                          background: (!supervisorEvidenceForm.noiDung.trim() && !supervisorEvidenceForm.file) ? "#E5E7EB" : "#E0F2FE",
                          color: (!supervisorEvidenceForm.noiDung.trim() && !supervisorEvidenceForm.file) ? "#9CA3AF" : "#0369A1",
                          border: (!supervisorEvidenceForm.noiDung.trim() && !supervisorEvidenceForm.file) ? "1px solid #D1D5DB" : "1px solid #BAE6FD",
                          borderRadius: "4px",
                          cursor: (!supervisorEvidenceForm.noiDung.trim() && !supervisorEvidenceForm.file) ? "not-allowed" : "pointer",
                          fontSize: "12px",
                          fontWeight: "500",
                          marginBottom: "16px",
                        }}
                      >
                        <i className="fa-solid fa-plus" style={{ marginRight: "4px" }}></i>
                        Thêm minh chứng
                      </button>
                    </div>

                    <div className="wc-resolution-actions">
                      <button
                        type="button"
                        className="wc-secondary"
                        onClick={() => setShowResolution(false)}
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        className="wc-primary"
                        disabled={actionLoading}
                      >
                        {actionLoading ? "Đang lưu..." : "Xác nhận kết luận"}
                      </button>
                    </div>
                  </form>
                )}
              </>
            ) : (
              <div className="wc-empty-detail">
                Chọn một hồ sơ để xem chi tiết.
              </div>
            )}
          </main>
        </div>
      )}
    </div>
  );
};

export default WorkspaceComplaints;
