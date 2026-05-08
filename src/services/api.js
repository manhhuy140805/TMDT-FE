/**
 * Mock API Service
 * Mô phỏng các API calls với mock data
 */

import mockData from '../mock';

// Simulate API delay
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

// API Response wrapper
const apiResponse = (data, success = true, message = '') => ({
  success,
  data,
  message,
  timestamp: new Date().toISOString()
});

// ==================== DATA MAPPING HELPERS ====================
// Map dữ liệu từ cấu trúc tiếng Việt sang cấu trúc tiếng Anh để component sử dụng

const mapCategory = (category) => {
  if (!category) return null;
  return {
    id: category.loaiDichVuId,
    name: category.tenLoai,
    description: category.moTa,
    image: category.hinhAnh,
    count: mockData.requests.filter(r => r.loaiDichVuId === category.loaiDichVuId).length,
    createdDate: category.ngayTao,
    updatedDate: category.ngayCapNhat
  };
};

const mapUser = (user) => {
  if (!user) return null;
  return {
    id: user.taiKhoanId,
    username: user.tenDangNhap,
    email: user.email,
    fullName: user.hoTen,
    phone: user.soDienThoai,
    gender: user.gioiTinh,
    address: user.diaChi,
    role: user.vaiTro,
    status: user.trangThai,
    createdDate: user.ngayTao,
    updatedDate: user.ngayCapNhat
  };
};

const mapFreelancer = (freelancer) => {
  if (!freelancer) return null;
  const user = mockData.getUserById(freelancer.taiKhoanId);
  return {
    id: freelancer.freelancerId,
    userId: freelancer.taiKhoanId,
    name: user ? user.hoTen : 'Unknown',
    email: user ? user.email : '',
    avatar: user ? `/images/avatars/user${freelancer.freelancerId}.jpg` : '/images/avatars/default.jpg',
    skills: freelancer.kyNang ? freelancer.kyNang.split(', ') : [],
    experience: freelancer.kinhNghiem,
    expertise: freelancer.chuyenGia,
    certifications: freelancer.chungChi ? freelancer.chungChi.split(', ') : [],
    rating: parseFloat(freelancer.diemDanhGia) || 0,
    balance: freelancer.soDuTaiKhoan,
    status: freelancer.trangThai,
    verified: freelancer.trangThai === 'HoatDong',
    completedProjects: 0, // TODO: Calculate from jobs
    reviews: 0, // TODO: Calculate from reviews
    createdDate: freelancer.ngayTao,
    updatedDate: freelancer.ngayCapNhat
  };
};

const formatCurrency = (amount) => {
  if (!amount) return '0 VNĐ';
  return new Intl.NumberFormat('vi-VN').format(amount) + ' VNĐ';
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN');
};

const getTimeAgo = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Vừa xong';
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays < 7) return `${diffDays} ngày trước`;
  return formatDate(dateString);
};

const mapRequest = (request) => {
  if (!request) return null;
  
  const category = mockData.categories.find(c => c.loaiDichVuId === request.loaiDichVuId);
  const employer = mockData.getUserById(request.nguoiThueId);
  const quotes = mockData.getQuotesByRequestId(request.yeuCauId);
  
  return {
    id: request.yeuCauId,
    employerId: request.nguoiThueId,
    categoryId: request.loaiDichVuId,
    title: request.tieuDe,
    description: request.moTa,
    budgetMin: request.nganSachMin,
    budgetMax: request.nganSachMax,
    budget: `${formatCurrency(request.nganSachMin)} - ${formatCurrency(request.nganSachMax)}`,
    deadline: request.thoiHan,
    deadlineDate: request.thoiHan,
    deadlineText: formatDate(request.thoiHan),
    requiresSupervision: request.yeuCauGiamSat,
    status: request.trangThai,
    statusText: request.trangThai === 'DangMo' ? 'Đang mở' : request.trangThai === 'DaDong' ? 'Đã đóng' : request.trangThai,
    category: category ? category.tenLoai : 'Chưa phân loại',
    employer: employer ? mapUser(employer) : null,
    postedDate: request.ngayTao,
    postedTime: getTimeAgo(request.ngayTao),
    updatedDate: request.ngayCapNhat,
    bids: quotes.length,
    views: Math.floor(Math.random() * 500) + 50, // Mock views
    skills: [], // TODO: Extract from description or add to data model
    location: employer ? employer.diaChi : 'Việt Nam',
    submissionDeadlineDate: request.thoiHan // Using same as deadline for now
  };
};

// ==================== CATEGORIES API ====================
export const categoriesAPI = {
  // GET /api/categories
  getAll: async () => {
    await delay();
    const mapped = mockData.categories.map(mapCategory);
    return apiResponse(mapped);
  },

  // GET /api/categories/:id
  getById: async (id) => {
    await delay();
    const category = mockData.categories.find(c => c.loaiDichVuId === parseInt(id));
    if (!category) {
      return apiResponse(null, false, 'Category not found');
    }
    return apiResponse(mapCategory(category));
  }
};

// ==================== REQUESTS API ====================
export const requestsAPI = {
  // GET /api/requests
  getAll: async (params = {}) => {
    await delay();
    let results = [...mockData.requests];

    // Filter by category
    if (params.categoryId) {
      results = results.filter(r => r.loaiDichVuId === parseInt(params.categoryId));
    }

    // Filter by status
    if (params.status) {
      results = results.filter(r => r.trangThai === params.status);
    }

    // Search
    if (params.search) {
      const keyword = params.search.toLowerCase();
      results = results.filter(r => 
        r.tieuDe.toLowerCase().includes(keyword) ||
        r.moTa.toLowerCase().includes(keyword)
      );
    }

    // Map to frontend format
    results = results.map(mapRequest);

    // Pagination
    const page = parseInt(params.page) || 1;
    const limit = parseInt(params.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedResults = results.slice(startIndex, endIndex);

    return apiResponse({
      data: paginatedResults,
      pagination: {
        page,
        limit,
        total: results.length,
        totalPages: Math.ceil(results.length / limit)
      }
    });
  },

  // GET /api/requests/:id
  getById: async (id) => {
    await delay();
    const request = mockData.getRequestById(id);
    if (!request) {
      return apiResponse(null, false, 'Request not found');
    }
    return apiResponse(mapRequest(request));
  },

  // POST /api/requests
  create: async (data) => {
    await delay(800);
    const newRequest = {
      yeuCauId: mockData.requests.length + 1,
      nguoiThueId: data.employerId || 1,
      loaiDichVuId: data.categoryId || 1,
      tieuDe: data.title,
      moTa: data.description,
      nganSachMin: data.budgetMin,
      nganSachMax: data.budgetMax,
      thoiHan: data.deadline,
      yeuCauGiamSat: data.requiresSupervision || false,
      trangThai: 'DangMo',
      ngayTao: new Date().toISOString(),
      ngayCapNhat: new Date().toISOString()
    };
    return apiResponse(mapRequest(newRequest), true, 'Tạo yêu cầu thành công');
  },

  // PUT /api/requests/:id
  update: async (id, data) => {
    await delay(800);
    const request = mockData.getRequestById(id);
    if (!request) {
      return apiResponse(null, false, 'Request not found');
    }
    const updated = { 
      ...request, 
      tieuDe: data.title || request.tieuDe,
      moTa: data.description || request.moTa,
      nganSachMin: data.budgetMin || request.nganSachMin,
      nganSachMax: data.budgetMax || request.nganSachMax,
      thoiHan: data.deadline || request.thoiHan,
      ngayCapNhat: new Date().toISOString()
    };
    return apiResponse(mapRequest(updated), true, 'Cập nhật yêu cầu thành công');
  },

  // DELETE /api/requests/:id
  delete: async (id) => {
    await delay(800);
    return apiResponse(null, true, 'Xóa yêu cầu thành công');
  }
};

// ==================== FREELANCERS API ====================
export const freelancersAPI = {
  // GET /api/freelancers
  getAll: async (params = {}) => {
    await delay();
    let results = [...mockData.freelancers];

    // Search
    if (params.search) {
      results = mockData.searchFreelancers(params.search, params);
    }

    // Filter by skills
    if (params.skills) {
      const skills = Array.isArray(params.skills) ? params.skills : [params.skills];
      results = results.filter(fl => 
        skills.some(skill => 
          fl.skills.some(flSkill => flSkill.toLowerCase().includes(skill.toLowerCase()))
        )
      );
    }

    // Filter by rating
    if (params.minRating) {
      results = results.filter(fl => fl.rating >= parseFloat(params.minRating));
    }

    // Pagination
    const page = parseInt(params.page) || 1;
    const limit = parseInt(params.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedResults = results.slice(startIndex, endIndex);

    return apiResponse({
      data: paginatedResults,
      pagination: {
        page,
        limit,
        total: results.length,
        totalPages: Math.ceil(results.length / limit)
      }
    });
  },

  // GET /api/freelancers/:id
  getById: async (id) => {
    await delay();
    const freelancer = mockData.getFreelancerById(id);
    if (!freelancer) {
      return apiResponse(null, false, 'Freelancer not found');
    }
    return apiResponse(freelancer);
  }
};

// ==================== QUOTES API ====================
export const quotesAPI = {
  // GET /api/requests/:requestId/quotes
  getByRequestId: async (requestId) => {
    await delay();
    const quotes = mockData.getQuotesByRequestId(requestId);
    return apiResponse(quotes);
  },

  // POST /api/quotes
  create: async (data) => {
    await delay(800);
    const newQuote = {
      id: mockData.quotes.length + 1,
      ...data,
      status: 'DA_GUI',
      statusText: 'Đã gửi',
      submittedDate: new Date().toISOString(),
      submittedTime: 'Vừa xong'
    };
    return apiResponse(newQuote, true, 'Gửi báo giá thành công');
  },

  // PUT /api/quotes/:id
  update: async (id, data) => {
    await delay(800);
    return apiResponse({ id, ...data }, true, 'Cập nhật báo giá thành công');
  }
};

// ==================== JOBS API ====================
export const jobsAPI = {
  // GET /api/jobs
  getAll: async (params = {}) => {
    await delay();
    let results = [...mockData.jobs];

    // Filter by freelancer
    if (params.freelancerId) {
      results = mockData.getJobsByFreelancerId(params.freelancerId);
    }

    // Filter by employer
    if (params.employerId) {
      results = mockData.getJobsByEmployerId(params.employerId);
    }

    // Filter by status
    if (params.status) {
      results = results.filter(j => j.status === params.status);
    }

    // Jobs are already in English format in the JSON, return as-is
    return apiResponse(results);
  },

  // GET /api/jobs/:id
  getById: async (id) => {
    await delay();
    const job = mockData.getJobById(id);
    if (!job) {
      return apiResponse(null, false, 'Job not found');
    }
    return apiResponse(job);
  },

  // PUT /api/jobs/:id
  update: async (id, data) => {
    await delay(800);
    const job = mockData.getJobById(id);
    if (!job) {
      return apiResponse(null, false, 'Job not found');
    }
    const updated = { ...job, ...data };
    return apiResponse(updated, true, 'Cập nhật công việc thành công');
  }
};

// ==================== MESSAGES API ====================
export const messagesAPI = {
  // GET /api/conversations
  getConversations: async (userId) => {
    await delay();
    const conversations = mockData.getConversationsByUserId(userId);
    // Conversations are already in English format in the JSON, return as-is
    return apiResponse(conversations);
  },

  // GET /api/conversations/:id/messages
  getMessages: async (conversationId) => {
    await delay();
    const messages = mockData.getMessagesByConversationId(conversationId);
    return apiResponse(messages);
  },

  // POST /api/messages
  sendMessage: async (data) => {
    await delay(500);
    const newMessage = {
      id: mockData.messages.length + 1,
      ...data,
      read: false,
      sentDate: new Date().toISOString(),
      sentTime: 'Vừa xong'
    };
    return apiResponse(newMessage, true, 'Gửi tin nhắn thành công');
  }
};

// ==================== NOTIFICATIONS API ====================
export const notificationsAPI = {
  // GET /api/notifications
  getByUserId: async (userId) => {
    await delay();
    const notifications = mockData.getNotificationsByUserId(userId);
    // Notifications are already in English format in the JSON, return as-is
    return apiResponse(notifications);
  },

  // GET /api/notifications/unread-count
  getUnreadCount: async (userId) => {
    await delay(200);
    const count = mockData.getUnreadNotificationsCount(userId);
    return apiResponse({ count });
  },

  // PUT /api/notifications/:id/read
  markAsRead: async (id) => {
    await delay(300);
    return apiResponse(null, true, 'Đánh dấu đã đọc');
  },

  // PUT /api/notifications/read-all
  markAllAsRead: async (userId) => {
    await delay(500);
    return apiResponse(null, true, 'Đánh dấu tất cả đã đọc');
  }
};

// ==================== PAYMENTS API ====================
export const paymentsAPI = {
  // GET /api/payments
  getAll: async (params = {}) => {
    await delay();
    let results = [...mockData.payments];

    if (params.jobId) {
      results = mockData.getPaymentsByJobId(params.jobId);
    }

    if (params.userId) {
      results = mockData.getPaymentsByUserId(params.userId);
    }

    return apiResponse(results);
  },

  // POST /api/payments
  create: async (data) => {
    await delay(1000);
    const newPayment = {
      id: mockData.payments.length + 1,
      ...data,
      status: 'CHO_THANH_TOAN',
      statusText: 'Chờ thanh toán',
      createdDate: new Date().toISOString(),
      createdTime: 'Vừa xong'
    };
    return apiResponse(newPayment, true, 'Tạo thanh toán thành công');
  }
};

// ==================== REVIEWS API ====================
export const reviewsAPI = {
  // GET /api/reviews
  getAll: async (params = {}) => {
    await delay();
    let results = [...mockData.reviews];

    if (params.jobId) {
      results = mockData.getReviewsByJobId(params.jobId);
    }

    if (params.freelancerId) {
      results = mockData.getReviewsByFreelancerId(params.freelancerId);
    }

    if (params.employerId) {
      results = mockData.getReviewsByEmployerId(params.employerId);
    }

    return apiResponse(results);
  },

  // POST /api/reviews
  create: async (data) => {
    await delay(800);
    const newReview = {
      id: mockData.reviews.length + 1,
      ...data,
      createdDate: new Date().toISOString(),
      createdTime: 'Vừa xong'
    };
    return apiResponse(newReview, true, 'Gửi đánh giá thành công');
  }
};

// ==================== REPORTS & COMPLAINTS API ====================
export const reportsAPI = {
  // GET /api/reports
  getAll: async (params = {}) => {
    await delay();
    let results = [...mockData.reports];

    if (params.status) {
      results = mockData.getReportsByStatus(params.status);
    }

    return apiResponse(results);
  },

  // POST /api/reports
  create: async (data) => {
    await delay(800);
    const newReport = {
      id: mockData.reports.length + 1,
      ...data,
      status: 'CHO_XU_LY',
      statusText: 'Chờ xử lý',
      createdDate: new Date().toISOString(),
      createdTime: 'Vừa xong'
    };
    return apiResponse(newReport, true, 'Gửi báo cáo thành công');
  }
};

export const complaintsAPI = {
  // GET /api/complaints
  getAll: async (params = {}) => {
    await delay();
    let results = [...mockData.complaints];

    if (params.status) {
      results = mockData.getComplaintsByStatus(params.status);
    }

    return apiResponse(results);
  },

  // POST /api/complaints
  create: async (data) => {
    await delay(800);
    const newComplaint = {
      id: mockData.complaints.length + 1,
      ...data,
      status: 'CHO_XU_LY',
      statusText: 'Chờ xử lý',
      createdDate: new Date().toISOString(),
      createdTime: 'Vừa xong'
    };
    return apiResponse(newComplaint, true, 'Gửi khiếu nại thành công');
  }
};

// ==================== STATISTICS API ====================
export const statisticsAPI = {
  // GET /api/statistics/overview
  getOverview: async () => {
    await delay();
    return apiResponse(mockData.statistics.overview);
  },

  // GET /api/statistics/requests-by-category
  getRequestsByCategory: async () => {
    await delay();
    return apiResponse(mockData.statistics.requestsByCategory);
  },

  // GET /api/statistics/top-freelancers
  getTopFreelancers: async () => {
    await delay();
    return apiResponse(mockData.statistics.topFreelancers);
  },

  // GET /api/statistics/revenue-by-month
  getRevenueByMonth: async () => {
    await delay();
    return apiResponse(mockData.statistics.revenueByMonth);
  }
};

// ==================== AUTH API ====================
export const authAPI = {
  // POST /api/auth/login
  login: async (credentials) => {
    await delay(1000);
    // Mock login - tìm user theo email
    const user = mockData.users.find(u => u.email === credentials.email);
    if (!user) {
      return apiResponse(null, false, 'Email hoặc mật khẩu không đúng');
    }
    return apiResponse({
      user
    }, true, 'Đăng nhập thành công');
  },

  // POST /api/auth/register
  register: async (data) => {
    await delay(1000);
    const newUser = {
      id: mockData.users.length + 1,
      ...data,
      status: 'CHO_XAC_MINH',
      createdDate: new Date().toISOString()
    };
    return apiResponse({
      user: newUser
    }, true, 'Đăng ký thành công');
  },

  // POST /api/auth/logout
  logout: async () => {
    await delay(500);
    return apiResponse(null, true, 'Đăng xuất thành công');
  }
};

// Export all APIs
export default {
  categories: categoriesAPI,
  requests: requestsAPI,
  freelancers: freelancersAPI,
  quotes: quotesAPI,
  jobs: jobsAPI,
  messages: messagesAPI,
  notifications: notificationsAPI,
  payments: paymentsAPI,
  reviews: reviewsAPI,
  reports: reportsAPI,
  complaints: complaintsAPI,
  statistics: statisticsAPI,
  auth: authAPI
};
