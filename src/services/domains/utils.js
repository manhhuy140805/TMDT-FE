/**
 * Shared utilities for API domain services
 */

// API Response wrapper
export const apiResponse = (data, success = true, message = "") => ({
  success,
  data,
  message,
  timestamp: new Date().toISOString(),
});

// ==================== DATA FORMATTING ====================
export const formatCurrency = (amount) => {
  if (!amount) return "0 VNĐ";
  return new Intl.NumberFormat("vi-VN").format(amount) + " VNĐ";
};

export const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN");
};

export const getTimeAgo = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Vừa xong";
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays < 7) return `${diffDays} ngày trước`;
  return formatDate(dateString);
};

// ==================== RESPONSE HELPERS ====================
export const unwrapData = (payload) => {
  if (!payload) return payload;
  if (payload.data !== undefined) return payload.data;
  if (payload.result !== undefined) return payload.result;
  return payload;
};

export const normalizeArray = (payload) => {
  const data = unwrapData(payload);
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.jobs)) return data.jobs;
  if (Array.isArray(data?.categories)) return data.categories;
  return [];
};

export const parseDurationDays = (duration) => {
  if (duration === undefined || duration === null) return null;
  if (typeof duration === "number") return duration;
  const match = duration.toString().match(/\d+/);
  return match ? parseInt(match[0], 10) : null;
};

// ==================== USER MAPPING ====================
export const mapUserFromApi = (user) => {
  if (!user) return null;
  const id = user.taiKhoanId ?? user.id;
  const fullName =
    user.hoTen ?? user.fullName ?? user.name ?? user.tenDangNhap ?? "N/A";

  return {
    id,
    username: user.tenDangNhap ?? user.username ?? user.email,
    email: user.email,
    fullName,
    name: fullName,
    phone: user.soDienThoai ?? user.phone,
    gender: user.gioiTinh ?? user.gender,
    address: user.diaChi ?? user.address,
    role: user.vaiTro ?? user.role,
    status: user.trangThai ?? user.status,
    createdDate: user.ngayTao ?? user.createdDate,
    updatedDate: user.ngayCapNhat ?? user.updatedDate,
    avatar: user.avatar,
  };
};

// ==================== CATEGORY MAPPING ====================
export const mapCategoryFromApi = (category) => {
  if (!category) return null;
  return {
    id: category.loaiDichVuId ?? category.id,
    name: category.tenLoai ?? category.name,
    description: category.moTa ?? category.description,
    image: category.hinhAnh ?? category.image,
    count: category.count ?? 0,
    createdDate: category.ngayTao ?? category.createdDate,
    updatedDate: category.ngayCapNhat ?? category.updatedDate,
  };
};

// ==================== FREELANCER MAPPING ====================
export const mapFreelancerFromApi = (freelancer) => {
  if (!freelancer) return null;
  const userInfo = mapUserFromApi(
    freelancer.user || freelancer.taiKhoan || freelancer.taiKhoanInfo,
  );

  const rawSkills = freelancer.kyNang ?? freelancer.skills;
  const skills = Array.isArray(rawSkills)
    ? rawSkills
    : rawSkills
      ? rawSkills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

  const rawCerts = freelancer.chungChi ?? freelancer.certifications;
  const certifications = Array.isArray(rawCerts)
    ? rawCerts
    : rawCerts
      ? rawCerts
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean)
      : [];

  const name =
    freelancer.hoTen ??
    freelancer.name ??
    freelancer.fullName ??
    userInfo?.fullName;

  return {
    id: freelancer.freelancerId ?? freelancer.id ?? userInfo?.id,
    userId: freelancer.taiKhoanId ?? freelancer.userId ?? userInfo?.id,
    name: name || "N/A",
    email: freelancer.email ?? userInfo?.email,
    avatar: freelancer.avatar ?? userInfo?.avatar ?? "/images/avatar_1.png",
    skills,
    experience: freelancer.kinhNghiem ?? freelancer.experience,
    expertise: freelancer.chuyenGia ?? freelancer.expertise,
    certifications,
    rating: parseFloat(freelancer.diemDanhGia ?? freelancer.rating) || 0,
    balance: freelancer.soDuTaiKhoan ?? freelancer.balance ?? 0,
    status: freelancer.trangThai ?? freelancer.status,
    verified: freelancer.verified ?? freelancer.trangThai === "HoatDong",
    completedProjects: freelancer.completedProjects ?? 0,
    reviews: freelancer.reviews ?? 0,
    createdDate: freelancer.ngayTao ?? freelancer.createdDate,
    updatedDate: freelancer.ngayCapNhat ?? freelancer.updatedDate,
  };
};

// ==================== PROPOSAL/QUOTE MAPPING ====================
export const mapProposalStatus = (status) => {
  const normalized = (status || "").toString();
  if (normalized === "DaGui" || normalized === "DA_GUI") return "DA_GUI";
  if (normalized === "DuocChon" || normalized === "DA_CHAP_NHAN")
    return "DA_CHAP_NHAN";
  if (normalized === "TuChoi" || normalized === "BI_TU_CHOI")
    return "BI_TU_CHOI";
  return normalized || "DA_GUI";
};

export const mapProposalStatusToApi = (status) => {
  if (status === "DA_GUI") return "DaGui";
  if (status === "DA_CHAP_NHAN") return "DuocChon";
  if (status === "BI_TU_CHOI") return "TuChoi";
  return status;
};

export const mapProposalFromApi = (proposal) => {
  if (!proposal) return null;
  const durationValue = parseDurationDays(
    proposal.thoiGianThucHien ?? proposal.duration,
  );
  const submittedDate =
    proposal.ngayTao ?? proposal.createdDate ?? proposal.submittedDate;

  const freelancerInfo = mapFreelancerFromApi(
    proposal.freelancer ||
      proposal.freelancerInfo ||
      proposal.freelancerUser ||
      proposal.freelancer,
  ) || {
    id: proposal.freelancerId,
    name: "N/A",
    avatar: "/images/avatar_1.png",
    rating: 0,
    skills: [],
    verified: false,
  };

  return {
    id: proposal.id ?? proposal.baoGiaId,
    requestId: proposal.yeuCauId ?? proposal.requestId,
    amount: parseFloat(proposal.giaDeXuat ?? proposal.amount) || 0,
    duration: durationValue
      ? `${durationValue} ngày`
      : (proposal.duration ?? "N/A"),
    description: proposal.noiDung ?? proposal.description ?? "",
    status: mapProposalStatus(proposal.trangThai ?? proposal.status),
    statusText: proposal.statusText ?? proposal.trangThaiText ?? "",
    submittedDate,
    submittedTime: proposal.submittedTime ?? getTimeAgo(submittedDate),
    freelancer: freelancerInfo,
  };
};

// ==================== REQUEST/JOB MAPPING ====================
export const mapRequestFromApi = (request) => {
  if (!request) return null;

  const employerId =
    request.nguoiThueId ??
    request.employerId ??
    request.employer?.id ??
    request.nguoiThue?.taiKhoanId;
  const employerInfo =
    mapUserFromApi(
      request.employer || request.nguoiThue || request.employerInfo,
    ) ||
    (employerId
      ? {
          id: employerId,
          name: "N/A",
          fullName: "N/A",
          avatar: "/images/avatar_1.png",
        }
      : null);

  const budgetMin = parseFloat(request.nganSachMin ?? request.budgetMin) || 0;
  const budgetMax = parseFloat(request.nganSachMax ?? request.budgetMax) || 0;
  const deadline = request.thoiHan ?? request.deadline ?? request.deadlineDate;
  const submissionDeadline =
    request.hanNopHoSo ??
    request.submissionDeadlineDate ??
    request.submissionDeadline;

  const rawSkills = request.kyNang ?? request.skills;
  const skills = Array.isArray(rawSkills)
    ? rawSkills
    : rawSkills
      ? rawSkills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

  const rawStatus = request.trangThai ?? request.status ?? "DangMo";
  const status = rawStatus === "MoDau" ? "DangMo" : rawStatus;

  const statusText =
    request.statusText ??
    (status === "DangMo"
      ? "Đang mở"
      : status === "DaDong"
        ? "Đã đóng"
        : status === "DaHuy"
          ? "Đã hủy"
          : status);

  const categoryName =
    request.categoryName ??
    request.loaiDichVu?.tenLoai ??
    request.category?.tenLoai ??
    request.category ??
    "Chưa phân loại";

  return {
    id: request.yeuCauId ?? request.id,
    employerId,
    categoryId: request.loaiDichVuId ?? request.categoryId,
    title: request.tieuDe ?? request.title ?? "Không có tiêu đề",
    description: request.moTa ?? request.description ?? "Không có mô tả",
    budgetMin,
    budgetMax,
    budget:
      budgetMin || budgetMax
        ? `${formatCurrency(budgetMin)} - ${formatCurrency(budgetMax)}`
        : "Thỏa thuận",
    deadline,
    deadlineDate: deadline,
    deadlineText: deadline ? formatDate(deadline) : "Chưa xác định",
    submissionDeadlineDate: submissionDeadline || deadline,
    submissionDeadlineText:
      submissionDeadline || deadline
        ? formatDate(submissionDeadline || deadline)
        : "Chưa xác định",
    requiresSupervision:
      request.yeuCauGiamSat ?? request.requiresSupervision ?? false,
    status,
    statusText,
    category: categoryName,
    employer: employerInfo,
    postedDate: request.ngayTao ?? request.createdDate,
    postedTime:
      getTimeAgo(request.ngayTao ?? request.createdDate) || "Vừa xong",
    updatedDate: request.ngayCapNhat ?? request.updatedDate,
    bids: request.bids ?? request.soLuongBaoGia ?? request.proposalCount ?? 0,
    views: request.views ?? 0,
    skills,
    location:
      request.diaDiem ??
      request.location ??
      employerInfo?.address ??
      "Việt Nam",
  };
};

// ==================== PAGINATION ====================
export const buildPagination = (items, page = 1, limit = 10) => ({
  page,
  limit,
  total: items.length,
  totalPages: Math.max(1, Math.ceil(items.length / limit)),
});

// ==================== USER UTILITIES ====================
export const getCurrentUserId = () => {
  try {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return null;
    const user = JSON.parse(storedUser);
    return user?.taiKhoanId ?? user?.id ?? null;
  } catch (error) {
    console.error("Error parsing user data:", error);
    return null;
  }
};
