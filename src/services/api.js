/**
 * Mock API Service
 * Mô phỏng các API calls với mock data
 */

import mockData from '../mock';

// Helper functions for localStorage
const getFromLocalStorage = (key, defaultValue = {}) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return defaultValue;
  }
};

const saveToLocalStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

// In-memory storage for updated data (now backed by localStorage)
const inMemoryStorage = {
  get requests() {
    return getFromLocalStorage('mock_requests', {});
  },
  set requests(value) {
    saveToLocalStorage('mock_requests', value);
  },
  get quotes() {
    return getFromLocalStorage('mock_quotes', {});
  },
  set quotes(value) {
    saveToLocalStorage('mock_quotes', value);
  },
  get jobs() {
    return getFromLocalStorage('mock_jobs', {});
  },
  set jobs(value) {
    saveToLocalStorage('mock_jobs', value);
  },
  get nextQuoteId() {
    return getFromLocalStorage('mock_nextQuoteId', 100);
  },
  set nextQuoteId(value) {
    saveToLocalStorage('mock_nextQuoteId', value);
  }
};

// Simulate API delay
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

// API Response wrapper
const apiResponse = (data, success = true, message = '') => ({
  success,
  data,
  message,
  timestamp: new Date().toISOString()
});

// ==================== CATEGORIES API ====================
export const categoriesAPI = {
  // GET /api/categories
  getAll: async () => {
    await delay();
    return apiResponse(mockData.categories);
  },

  // GET /api/categories/:id
  getById: async (id) => {
    await delay();
    const category = mockData.categories.find(c => c.id === parseInt(id));
    if (!category) {
      return apiResponse(null, false, 'Category not found');
    }
    return apiResponse(category);
  }
};

// ==================== REQUESTS API ====================
export const requestsAPI = {
  // GET /api/requests
  getAll: async (params = {}) => {
    await delay();
    // Merge mock data with localStorage updates
    const storedRequests = inMemoryStorage.requests;
    let results = mockData.requests.map(req => {
      const updated = storedRequests[req.id];
      return updated || req;
    }).filter(req => !req.deleted); // Filter out deleted items

    // Filter by category
    if (params.categoryId) {
      results = results.filter(r => r.categoryId === parseInt(params.categoryId));
    }

    // Filter by status
    if (params.status) {
      results = results.filter(r => r.status === params.status);
    }

    // Search
    if (params.search) {
      const keyword = params.search.toLowerCase();
      results = results.filter(r => 
        r.title.toLowerCase().includes(keyword) ||
        r.description.toLowerCase().includes(keyword) ||
        (r.skills && r.skills.some(skill => skill.toLowerCase().includes(keyword)))
      );
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

  // GET /api/requests/:id
  getById: async (id) => {
    await delay();
    const requestId = parseInt(id);
    // Check localStorage first
    const storedRequests = inMemoryStorage.requests;
    if (storedRequests[requestId]) {
      return apiResponse(storedRequests[requestId]);
    }
    const request = mockData.getRequestById(requestId);
    if (!request) {
      return apiResponse(null, false, 'Request not found');
    }
    return apiResponse(request);
  },

  // POST /api/requests
  create: async (data) => {
    await delay(800);
    const newRequest = {
      id: mockData.requests.length + 1,
      ...data,
      status: 'MOI_TAO',
      statusText: 'Mới tạo',
      views: 0,
      bids: 0,
      postedDate: new Date().toISOString(),
      postedTime: 'Vừa xong'
    };
    return apiResponse(newRequest, true, 'Tạo yêu cầu thành công');
  },

  // PUT /api/requests/:id
  update: async (id, data) => {
    await delay(800);
    const requestId = parseInt(id);
    // Get original request
    const storedRequests = inMemoryStorage.requests;
    let request = storedRequests[requestId] || mockData.getRequestById(requestId);
    if (!request) {
      return apiResponse(null, false, 'Request not found');
    }
    // Merge with new data
    const updated = { 
      ...request, 
      ...data,
      id: requestId // Ensure ID stays the same
    };
    // Store in localStorage
    const allRequests = { ...storedRequests, [requestId]: updated };
    inMemoryStorage.requests = allRequests;
    console.log('Updated request in localStorage:', updated);
    return apiResponse(updated, true, 'Cập nhật yêu cầu thành công');
  },

  // DELETE /api/requests/:id
  delete: async (id) => {
    await delay(800);
    const requestId = parseInt(id);
    // Mark as deleted in localStorage
    const request = mockData.getRequestById(requestId);
    if (request) {
      const storedRequests = inMemoryStorage.requests;
      const allRequests = { ...storedRequests, [requestId]: { ...request, deleted: true } };
      inMemoryStorage.requests = allRequests;
    }
    return apiResponse(null, true, 'Xóa yêu cầu thành công');
  },

  // POST /api/requests/:id/cancel
  cancel: async (id) => {
    console.log('API cancel called with ID:', id, 'Type:', typeof id);
    await delay(800);
    const requestId = parseInt(id);
    const storedRequests = inMemoryStorage.requests;
    let request = storedRequests[requestId] || mockData.getRequestById(requestId);
    console.log('Found request:', request);
    if (!request) {
      return apiResponse(null, false, 'Request not found');
    }
    const cancelled = { ...request, status: 'DA_HUY', statusText: 'Đã hủy' };
    const allRequests = { ...storedRequests, [requestId]: cancelled };
    inMemoryStorage.requests = allRequests;
    console.log('Cancelled request stored:', cancelled);
    return apiResponse(cancelled, true, 'Hủy yêu cầu thành công');
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
    const reqId = parseInt(requestId);
    
    // Get quotes from mock data
    const mockQuotes = mockData.getQuotesByRequestId(reqId);
    
    // Get quotes from localStorage
    const storedQuotes = inMemoryStorage.quotes;
    const memoryQuotes = Object.values(storedQuotes).filter(
      quote => quote.requestId === reqId
    );
    
    // Merge both
    const allQuotes = [...mockQuotes, ...memoryQuotes];
    
    console.log('Getting quotes for request', reqId, ':', allQuotes);
    return apiResponse(allQuotes);
  },

  // POST /api/quotes
  create: async (data) => {
    await delay(800);
    
    // Generate new ID
    let nextId = inMemoryStorage.nextQuoteId;
    const newId = nextId;
    inMemoryStorage.nextQuoteId = nextId + 1;
    
    const newQuote = {
      id: newId,
      ...data,
      status: 'DA_GUI',
      statusText: 'Đã gửi',
      submittedDate: new Date().toISOString(),
      submittedTime: 'Vừa xong'
    };
    
    // Store in localStorage
    const storedQuotes = inMemoryStorage.quotes;
    const allQuotes = { ...storedQuotes, [newId]: newQuote };
    inMemoryStorage.quotes = allQuotes;
    
    // Update request bids count
    const requestId = parseInt(data.requestId);
    const storedRequests = inMemoryStorage.requests;
    let request = storedRequests[requestId] || mockData.getRequestById(requestId);
    if (request) {
      const updatedRequest = {
        ...request,
        bids: (request.bids || 0) + 1
      };
      const allRequests = { ...storedRequests, [requestId]: updatedRequest };
      inMemoryStorage.requests = allRequests;
      console.log('Updated request bids count:', updatedRequest.bids);
    }
    
    console.log('Created new quote:', newQuote);
    console.log('All quotes in localStorage:', allQuotes);
    
    return apiResponse(newQuote, true, 'Gửi báo giá thành công');
  },

  // PUT /api/quotes/:id
  update: async (id, data) => {
    await delay(800);
    const quoteId = parseInt(id);
    
    // Get existing quote
    const storedQuotes = inMemoryStorage.quotes;
    let quote = storedQuotes[quoteId];
    if (!quote) {
      // Try to find in mock data
      const mockQuote = mockData.quotes.find(q => q.id === quoteId);
      if (mockQuote) {
        quote = mockQuote;
      }
    }
    
    if (!quote) {
      return apiResponse(null, false, 'Quote not found');
    }
    
    // Update quote
    const updated = { ...quote, ...data };
    const allQuotes = { ...storedQuotes, [quoteId]: updated };
    inMemoryStorage.quotes = allQuotes;
    
    return apiResponse(updated, true, 'Cập nhật báo giá thành công');
  },

  // DELETE /api/quotes/:id
  delete: async (id) => {
    await delay(800);
    const quoteId = parseInt(id);
    
    // Get quote to update request bids count
    const storedQuotes = inMemoryStorage.quotes;
    const quote = storedQuotes[quoteId];
    
    if (quote) {
      // Decrease request bids count
      const requestId = parseInt(quote.requestId);
      const storedRequests = inMemoryStorage.requests;
      let request = storedRequests[requestId] || mockData.getRequestById(requestId);
      if (request && request.bids > 0) {
        const updatedRequest = {
          ...request,
          bids: request.bids - 1
        };
        const allRequests = { ...storedRequests, [requestId]: updatedRequest };
        inMemoryStorage.requests = allRequests;
      }
      
      // Remove quote from storage
      const { [quoteId]: removed, ...remainingQuotes } = storedQuotes;
      inMemoryStorage.quotes = remainingQuotes;
    }
    
    return apiResponse(null, true, 'Xóa báo giá thành công');
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
