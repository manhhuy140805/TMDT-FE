# Design: Complete API Integration

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Components                            │
│              (Expect English field names)                    │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                   src/services/api.js                        │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │         Data Mapping Layer                          │    │
│  │  - mapXxxFromApi() functions                        │    │
│  │  - Vietnamese → English field conversion            │    │
│  │  - Status normalization                             │    │
│  │  - Date formatting                                  │    │
│  └────────────────────────────────────────────────────┘    │
│                         ↕                                    │
│  ┌────────────────────────────────────────────────────┐    │
│  │         Real API Adapters                           │    │
│  │  - realAuthAPI                                      │    │
│  │  - realUsersAPI                                     │    │
│  │  - realContractsAPI                                 │    │
│  │  - realSupervisorsAPI                               │    │
│  │  - realProgressAPI                                  │    │
│  │  - realDisputesAPI                                  │    │
│  │  - realEvidencesAPI                                 │    │
│  │  - realMessagesAPI                                  │    │
│  │  - realNotificationsAPI                             │    │
│  │  - realPaymentsAPI                                  │    │
│  │  - realReviewsAPI                                   │    │
│  │  - realAdminAPI                                     │    │
│  └────────────────────────────────────────────────────┘    │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                   src/utils/api.js                           │
│                   HTTP Client (axios)                        │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────┐
│              Backend API (port 8080)                         │
│           (Returns Vietnamese field names)                   │
└─────────────────────────────────────────────────────────────┘
```

## File Structure

```
src/
├── services/
│   └── api.js                 # Main API service file
├── utils/
│   └── api.js                 # HTTP client (axios)
├── doc/
│   └── API_GUIDE.md           # API documentation
└── mock/
    ├── index.js               # Mock data helpers (keep for reference)
    └── *.json                 # Mock data files (keep for testing)
```

## Data Mapping Strategy

### 1. Mapping Functions Pattern

```javascript
const mapXxxFromApi = (data) => {
  if (!data) return null;
  
  return {
    // English field names for components
    id: data.xxxId ?? data.id,
    name: data.tenXxx ?? data.name,
    description: data.moTa ?? data.description,
    status: normalizeStatus(data.trangThai ?? data.status),
    createdDate: data.ngayTao ?? data.createdDate,
    updatedDate: data.ngayCapNhat ?? data.updatedDate,
    // ... other fields
  };
};
```

### 2. Reverse Mapping (To API)

```javascript
const mapXxxToApi = (data) => {
  return {
    // Vietnamese field names for backend
    tenXxx: data.name,
    moTa: data.description,
    trangThai: data.status,
    // ... other fields
  };
};
```

### 3. Status Normalization

```javascript
const normalizeXxxStatus = (status) => {
  const statusMap = {
    'DangMo': 'DANG_MO',
    'DaDong': 'DA_DONG',
    // ... other mappings
  };
  return statusMap[status] || status;
};
```

## API Adapter Pattern

### Standard CRUD Pattern

```javascript
const realXxxAPI = {
  // GET all
  getAll: async (params = {}) => {
    try {
      const payload = await http.get('/endpoint', { params });
      const items = normalizeArray(payload);
      const mapped = items.map(mapXxxFromApi);
      return apiResponse(mapped);
    } catch (error) {
      return apiResponse([], false, error.message);
    }
  },

  // GET by ID
  getById: async (id) => {
    try {
      const payload = await http.get(`/endpoint/${id}`);
      const mapped = mapXxxFromApi(unwrapData(payload));
      return apiResponse(mapped);
    } catch (error) {
      return apiResponse(null, false, error.message);
    }
  },

  // POST create
  create: async (data) => {
    try {
      const payload = mapXxxToApi(data);
      const response = await http.post('/endpoint', payload);
      const mapped = mapXxxFromApi(unwrapData(response));
      return apiResponse(mapped, true, 'Tạo thành công');
    } catch (error) {
      return apiResponse(null, false, error.message);
    }
  },

  // PUT update
  update: async (id, data) => {
    try {
      const payload = mapXxxToApi(data);
      const response = await http.put(`/endpoint/${id}`, payload);
      const mapped = mapXxxFromApi(unwrapData(response));
      return apiResponse(mapped, true, 'Cập nhật thành công');
    } catch (error) {
      return apiResponse(null, false, error.message);
    }
  },

  // DELETE
  delete: async (id) => {
    try {
      await http.delete(`/endpoint/${id}`);
      return apiResponse(null, true, 'Xóa thành công');
    } catch (error) {
      return apiResponse(null, false, error.message);
    }
  },
};
```

## Entity Mapping Specifications

### 1. Contract Mapping

```javascript
const mapContractFromApi = (contract) => {
  if (!contract) return null;
  
  return {
    id: contract.hopDongId ?? contract.id,
    requestId: contract.yeuCauId ?? contract.requestId,
    freelancerId: contract.freelancerId,
    employerId: contract.nguoiThueId ?? contract.employerId,
    agreedPrice: contract.giaThoa ?? contract.agreedPrice,
    agreedDuration: contract.thoiGianThoa ?? contract.agreedDuration,
    status: contract.trangThai ?? contract.status,
    statusText: getContractStatusText(contract.trangThai ?? contract.status),
    supervisorId: contract.giamSatId ?? contract.supervisorId,
    supervisorFee: contract.phiGiamSat ?? contract.supervisorFee,
    supervisorStatus: contract.trangThaiGiamSat ?? contract.supervisorStatus,
    startDate: contract.ngayBatDau ?? contract.startDate,
    endDate: contract.ngayKetThuc ?? contract.endDate,
    createdDate: contract.ngayTao ?? contract.createdDate,
    updatedDate: contract.ngayCapNhat ?? contract.updatedDate,
    // Nested objects
    request: mapRequestFromApi(contract.yeuCau ?? contract.request),
    freelancer: mapFreelancerFromApi(contract.freelancer),
    employer: mapUserFromApi(contract.nguoiThue ?? contract.employer),
    supervisor: mapSupervisorFromApi(contract.giamSat ?? contract.supervisor),
  };
};
```

### 2. Supervisor Mapping

```javascript
const mapSupervisorFromApi = (supervisor) => {
  if (!supervisor) return null;
  
  return {
    id: supervisor.giamSatId ?? supervisor.id,
    userId: supervisor.taiKhoanId ?? supervisor.userId,
    companyName: supervisor.tenDonVi ?? supervisor.companyName,
    description: supervisor.moTa ?? supervisor.description,
    capabilities: supervisor.nangLuc ?? supervisor.capabilities,
    certifications: supervisor.chungChi ?? supervisor.certifications,
    fee: supervisor.phiGiamSat ?? supervisor.fee,
    status: supervisor.trangThai ?? supervisor.status,
    statusText: getSupervisorStatusText(supervisor.trangThai ?? supervisor.status),
    rating: parseFloat(supervisor.diemDanhGia ?? supervisor.rating) || 0,
    completedProjects: supervisor.duAnHoanThanh ?? supervisor.completedProjects ?? 0,
    createdDate: supervisor.ngayTao ?? supervisor.createdDate,
    updatedDate: supervisor.ngayCapNhat ?? supervisor.updatedDate,
    user: mapUserFromApi(supervisor.taiKhoan ?? supervisor.user),
  };
};
```

### 3. Progress Mapping

```javascript
const mapProgressFromApi = (progress) => {
  if (!progress) return null;
  
  return {
    id: progress.tienDoId ?? progress.id,
    contractId: progress.congViecId ?? progress.contractId,
    freelancerId: progress.freelancerId,
    title: progress.tieuDe ?? progress.title,
    description: progress.moTa ?? progress.description,
    percentage: progress.phanTram ?? progress.percentage,
    attachment: progress.tepDinhKem ?? progress.attachment,
    confirmationStatus: progress.trangThaiXacNhan ?? progress.confirmationStatus,
    confirmationStatusText: getProgressStatusText(progress.trangThaiXacNhan),
    createdDate: progress.ngayTao ?? progress.createdDate,
    updatedDate: progress.ngayCapNhat ?? progress.updatedDate,
    freelancer: mapFreelancerFromApi(progress.freelancer),
  };
};
```

### 4. Dispute Mapping

```javascript
const mapDisputeFromApi = (dispute) => {
  if (!dispute) return null;
  
  return {
    id: dispute.tranhChapId ?? dispute.id,
    contractId: dispute.hopDongId ?? dispute.contractId,
    creatorId: dispute.nguoiTaoId ?? dispute.creatorId,
    reason: dispute.lyDo ?? dispute.reason,
    status: dispute.trangThai ?? dispute.status,
    statusText: getDisputeStatusText(dispute.trangThai ?? dispute.status),
    resolution: dispute.ketQua ?? dispute.resolution,
    createdDate: dispute.ngayTao ?? dispute.createdDate,
    resolvedDate: dispute.ngayGiaiQuyet ?? dispute.resolvedDate,
    contract: mapContractFromApi(dispute.hopDong ?? dispute.contract),
    creator: mapUserFromApi(dispute.nguoiTao ?? dispute.creator),
  };
};
```

### 5. Evidence Mapping

```javascript
const mapEvidenceFromApi = (evidence) => {
  if (!evidence) return null;
  
  return {
    id: evidence.bangChungId ?? evidence.id,
    disputeId: evidence.tranhChapId ?? evidence.disputeId,
    attachment: evidence.tepDinhKem ?? evidence.attachment,
    description: evidence.moTa ?? evidence.description,
    createdDate: evidence.ngayTao ?? evidence.createdDate,
  };
};
```

### 6. Notification Mapping

```javascript
const mapNotificationFromApi = (notification) => {
  if (!notification) return null;
  
  return {
    id: notification.thongBaoId ?? notification.id,
    userId: notification.nguoiNhanId ?? notification.userId,
    title: notification.tieuDe ?? notification.title,
    content: notification.noiDung ?? notification.content,
    type: notification.loai ?? notification.type,
    read: notification.daDoc ?? notification.read ?? false,
    link: notification.lienKet ?? notification.link,
    createdDate: notification.ngayTao ?? notification.createdDate,
  };
};
```

### 7. Payment Mapping

```javascript
const mapPaymentFromApi = (payment) => {
  if (!payment) return null;
  
  return {
    id: payment.giaoDichId ?? payment.id,
    contractId: payment.hopDongId ?? payment.contractId,
    payerId: payment.nguoiTraId ?? payment.payerId,
    receiverId: payment.nguoiNhanId ?? payment.receiverId,
    amount: parseFloat(payment.soTien ?? payment.amount) || 0,
    type: payment.loai ?? payment.type,
    status: payment.trangThai ?? payment.status,
    statusText: getPaymentStatusText(payment.trangThai ?? payment.status),
    description: payment.moTa ?? payment.description,
    createdDate: payment.ngayTao ?? payment.createdDate,
    completedDate: payment.ngayHoanThanh ?? payment.completedDate,
  };
};
```

### 8. Review Mapping

```javascript
const mapReviewFromApi = (review) => {
  if (!review) return null;
  
  return {
    id: review.danhGiaId ?? review.id,
    contractId: review.hopDongId ?? review.contractId,
    reviewerId: review.nguoiDanhGiaId ?? review.reviewerId,
    reviewedId: review.nguoiDuocDanhGiaId ?? review.reviewedId,
    score: review.diem ?? review.score,
    content: review.noiDung ?? review.content,
    type: review.loai ?? review.type,
    createdDate: review.ngayTao ?? review.createdDate,
    reviewer: mapUserFromApi(review.nguoiDanhGia ?? review.reviewer),
    reviewed: mapUserFromApi(review.nguoiDuocDanhGia ?? review.reviewed),
  };
};
```

## API Endpoints Implementation

### 1. Authentication API

```javascript
const realAuthAPI = {
  login: async (credentials) => {
    // POST /auth/login
    // Map: tenDangNhap, matKhau
    // Return: user object with taiKhoanId, vaiTro
  },
  
  register: async (data) => {
    // POST /auth/register
    // Map: tenDangNhap, matKhau, email, hoTen, soDienThoai, gioiTinh, diaChi, vaiTro
    // Return: user object
  },
};
```

### 2. Users API

```javascript
const realUsersAPI = {
  getAll: async () => {
    // GET /users
  },
  
  search: async (keyword) => {
    // GET /users/search?keyword=xxx
  },
  
  getById: async (id) => {
    // GET /users/:id
  },
  
  getProfile: async (id) => {
    // GET /users/:id/profile
  },
  
  getJobs: async (id) => {
    // GET /users/:id/jobs
  },
  
  update: async (id, data) => {
    // PUT /users/:id
  },
  
  delete: async (id) => {
    // DELETE /users/:id
  },
};
```

### 3. Contracts API

```javascript
const realContractsAPI = {
  create: async (data) => {
    // POST /contracts
    // Body: yeuCauId, freelancerId, nguoiThueId, giaThoa, thoiGianThoa
  },
  
  getAll: async (params) => {
    // GET /contracts
    // Support filtering by freelancerId, employerId, status
  },
  
  getById: async (id) => {
    // GET /contracts/:id
  },
  
  getDetail: async (id) => {
    // GET /contracts/:id/detail
  },
  
  getByUserId: async (userId) => {
    // GET /users/:id/contracts
  },
  
  updateStatus: async (id, status) => {
    // PUT /contracts/:id/status
    // Body: trangThai
  },
  
  selectSupervisor: async (id, data) => {
    // POST /contracts/:id/supervisor
    // Body: giamSatId, phiGiamSat
  },
  
  acceptSupervisor: async (id) => {
    // PUT /contracts/:id/supervisor/accept
  },
  
  rejectSupervisor: async (id) => {
    // PUT /contracts/:id/supervisor/reject
  },
};
```

### 4. Supervisors API

```javascript
const realSupervisorsAPI = {
  getAll: async () => {
    // GET /supervisors
  },
  
  search: async (keyword) => {
    // GET /supervisors/search?keyword=xxx
  },
  
  getById: async (id) => {
    // GET /supervisors/:id
  },
  
  create: async (data) => {
    // POST /supervisors
    // Body: taiKhoanId, tenDonVi, moTa, nangLuc, chungChi, phiGiamSat
  },
  
  update: async (id, data) => {
    // PUT /supervisors/:id
  },
  
  delete: async (id) => {
    // DELETE /supervisors/:id
  },
};
```

### 5. Progress API

```javascript
const realProgressAPI = {
  create: async (data) => {
    // POST /progress
    // Body: congViecId, freelancerId, tieuDe, moTa, phanTram, tepDinhKem
  },
  
  getByContractId: async (contractId) => {
    // GET /contracts/:id/progress
  },
  
  getById: async (id) => {
    // GET /progress/:id
  },
  
  update: async (id, data) => {
    // PUT /progress/:id
    // Body: tieuDe, moTa, phanTram, trangThaiXacNhan
  },
  
  delete: async (id) => {
    // DELETE /progress/:id
  },
};
```

### 6. Disputes API

```javascript
const realDisputesAPI = {
  create: async (data) => {
    // POST /disputes
    // Body: contractId, nguoiTaoId, lyDo
  },
  
  getById: async (id) => {
    // GET /disputes/:id
  },
  
  getByContractId: async (contractId) => {
    // GET /contracts/:id/disputes
  },
  
  review: async (id) => {
    // PUT /disputes/:id/review
  },
  
  resolve: async (id, resolution) => {
    // PUT /disputes/:id/resolve
  },
};
```

### 7. Evidences API

```javascript
const realEvidencesAPI = {
  create: async (disputeId, data) => {
    // POST /disputes/:id/evidences
    // Body: tepDinhKem, moTa
  },
  
  getByDisputeId: async (disputeId) => {
    // GET /disputes/:id/evidences
  },
  
  delete: async (id) => {
    // DELETE /evidences/:id
  },
};
```

### 8. Admin API

```javascript
const realAdminAPI = {
  getUsers: async () => {
    // GET /admin/users
  },
  
  banUser: async (id) => {
    // PUT /admin/users/:id/ban
  },
  
  getSupervisors: async () => {
    // GET /admin/supervisors
  },
  
  approveSupervisor: async (id) => {
    // PUT /admin/supervisors/:id/approve
  },
  
  getStatistics: async () => {
    // GET /admin/statistics
  },
};
```

## Export Strategy

```javascript
// At the end of api.js
export default {
  // Existing exports
  categories: realCategoriesAPI,
  requests: realRequestsAPI,
  quotes: realQuotesAPI,
  freelancers: realFreelancersAPI,
  reports: realReportsAPI,
  jobs: realJobsAPI,
  messages: realMessagesAPI,
  notifications: realNotificationsAPI,
  payments: realPaymentsAPI,
  reviews: realReviewsAPI,
  complaints: realComplaintsAPI,
  progress: realProgressAPI,
  statistics: realStatisticsAPI,
  auth: realAuthAPI,
  
  // New exports
  users: realUsersAPI,
  contracts: realContractsAPI,
  supervisors: realSupervisorsAPI,
  disputes: realDisputesAPI,
  evidences: realEvidencesAPI,
  admin: realAdminAPI,
};
```

## Error Handling Strategy

```javascript
// Consistent error handling pattern
try {
  const response = await http.get('/endpoint');
  const data = unwrapData(response);
  const mapped = mapXxxFromApi(data);
  return apiResponse(mapped, true, 'Success message');
} catch (error) {
  console.error('API Error:', error);
  return apiResponse(null, false, error.message || 'Unknown error');
}
```

## Testing Strategy

1. **Unit Tests** (Optional)
   - Test mapping functions with sample data
   - Test status normalization
   - Test error handling

2. **Integration Tests**
   - Test API calls with real backend
   - Verify data mapping correctness
   - Test error scenarios

3. **Manual Testing**
   - Test each endpoint through UI
   - Verify data displays correctly
   - Test CRUD operations
   - Test error messages

## Migration Strategy

1. **Phase 1: Core Entities** (Already done)
   - Categories ✓
   - Requests ✓
   - Proposals ✓
   - Freelancers ✓

2. **Phase 2: User & Auth**
   - Complete authentication
   - Complete user management

3. **Phase 3: Contracts & Supervisors**
   - Implement contracts API
   - Implement supervisors API

4. **Phase 4: Progress & Disputes**
   - Complete progress API
   - Implement disputes API
   - Implement evidences API

5. **Phase 5: Supporting Features**
   - Complete notifications
   - Complete payments
   - Complete reviews
   - Complete chat

6. **Phase 6: Admin**
   - Implement admin functions

## Performance Considerations

1. **Caching**
   - Cache user info in localStorage
   - Cache categories (rarely change)
   - Consider caching frequently accessed data

2. **Lazy Loading**
   - Load data only when needed
   - Paginate large lists

3. **Optimization**
   - Reuse mapping functions
   - Avoid unnecessary API calls
   - Batch operations when possible

## Security Considerations

1. **Authentication**
   - Store tokens securely
   - Handle token expiration
   - Implement logout

2. **Data Validation**
   - Validate data before sending to API
   - Sanitize user inputs
   - Handle malformed responses

3. **Error Messages**
   - Don't expose sensitive info in errors
   - Log errors for debugging
   - Show user-friendly messages
