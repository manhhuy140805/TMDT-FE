# Requirements: Complete API Integration

## Overview
Hoàn thiện việc tích hợp API cho ứng dụng FRAS TMDT Frontend, đảm bảo tất cả các endpoint từ API Guide được implement đầy đủ với data mapping chính xác giữa Vietnamese (backend) và English (frontend) field names.

## Business Requirements

### BR-1: Authentication System
**Priority:** High  
**Description:** Implement đầy đủ hệ thống xác thực người dùng
- Đăng ký tài khoản với các vai trò: NguoiThue, Freelancer, DonViGiamSat
- Đăng nhập với username/email và password
- Lưu trữ thông tin user trong localStorage
- Xử lý token authentication (nếu có)

### BR-2: User Management
**Priority:** High  
**Description:** Quản lý thông tin người dùng
- Lấy danh sách người dùng
- Tìm kiếm người dùng theo keyword
- Lấy thông tin chi tiết user
- Lấy profile theo vai trò (NguoiThue/Freelancer/DonViGiamSat)
- Cập nhật thông tin user
- Xóa user (soft delete)

### BR-3: Contract Management
**Priority:** High  
**Description:** Quản lý hợp đồng giữa người thuê và freelancer
- Tạo hợp đồng mới từ proposal được chọn
- Lấy danh sách hợp đồng
- Lấy chi tiết hợp đồng
- Cập nhật trạng thái hợp đồng (MoiTao, DangThucHien, HoanThanh, DaHuy, TranhChap)
- Chọn đơn vị giám sát cho hợp đồng
- Freelancer chấp nhận/từ chối giám sát

### BR-4: Supervisor Management
**Priority:** Medium  
**Description:** Quản lý đơn vị giám sát
- Lấy danh sách đơn vị giám sát
- Tìm kiếm đơn vị giám sát
- Lấy chi tiết đơn vị giám sát
- Tạo đơn vị giám sát mới
- Cập nhật thông tin và trạng thái (HoatDong, TamNghi, BiKhoa, ChoDuyet)
- Xóa đơn vị giám sát (soft delete)

### BR-5: Progress Tracking
**Priority:** High  
**Description:** Theo dõi tiến độ công việc
- Tạo báo cáo tiến độ mới
- Lấy danh sách tiến độ của hợp đồng
- Lấy chi tiết tiến độ
- Cập nhật tiến độ (phần trăm, trạng thái xác nhận)
- Xóa tiến độ
- Validation: phần trăm từ 0-100

### BR-6: Chat System
**Priority:** Medium  
**Description:** Hệ thống chat giữa các bên
- Tạo cuộc trò chuyện mới
- Lấy thông tin cuộc trò chuyện
- Lấy danh sách cuộc trò chuyện theo hợp đồng
- Gửi tin nhắn
- Lấy danh sách tin nhắn theo cuộc trò chuyện

### BR-7: Dispute Management
**Priority:** High  
**Description:** Quản lý tranh chấp
- Tạo tranh chấp mới
- Lấy chi tiết tranh chấp
- Lấy danh sách tranh chấp theo hợp đồng
- Duyệt tranh chấp
- Giải quyết tranh chấp

### BR-8: Evidence Management
**Priority:** Medium  
**Description:** Quản lý bằng chứng cho tranh chấp
- Tạo bằng chứng cho tranh chấp
- Lấy danh sách bằng chứng theo tranh chấp
- Xóa bằng chứng

### BR-9: Notification System
**Priority:** Medium  
**Description:** Hoàn thiện hệ thống thông báo
- Lấy danh sách thông báo theo user
- Đếm số thông báo chưa đọc
- Đánh dấu đã đọc (single)
- Đánh dấu tất cả đã đọc
- Xóa thông báo

### BR-10: Payment System
**Priority:** High  
**Description:** Hoàn thiện hệ thống thanh toán
- Nạp tiền
- Lấy chi tiết giao dịch
- Lấy danh sách giao dịch theo hợp đồng/user
- Giải ngân
- Hoàn tiền

### BR-11: Review System
**Priority:** Medium  
**Description:** Hoàn thiện hệ thống đánh giá
- Tạo đánh giá
- Lấy chi tiết đánh giá
- Lấy đánh giá theo user
- Lấy đánh giá theo hợp đồng

### BR-12: Admin Functions
**Priority:** Medium  
**Description:** Các chức năng quản trị
- Lấy danh sách user
- Khóa user
- Lấy danh sách đơn vị giám sát
- Duyệt đơn vị giám sát
- Thống kê tổng quan

## Technical Requirements

### TR-1: Data Mapping Layer
**Priority:** High  
**Description:** Tạo mapping functions cho tất cả entities
- mapUserFromApi() ✓
- mapCategoryFromApi() ✓
- mapFreelancerFromApi() ✓
- mapRequestFromApi() ✓
- mapProposalFromApi() ✓
- mapContractFromApi() - cần implement
- mapSupervisorFromApi() - cần implement
- mapProgressFromApi() - cần implement
- mapDisputeFromApi() - cần implement
- mapEvidenceFromApi() - cần implement
- mapNotificationFromApi() - cần implement
- mapPaymentFromApi() - cần implement
- mapReviewFromApi() - cần implement

### TR-2: API Response Handling
**Priority:** High  
**Description:** Xử lý response từ API một cách nhất quán
- unwrapData() - extract data từ response wrapper
- normalizeArray() - normalize array responses
- apiResponse() - wrap response với success/message/timestamp
- Error handling với try-catch
- Fallback values khi data null/undefined

### TR-3: API Endpoint Implementation
**Priority:** High  
**Description:** Implement tất cả API endpoints theo API Guide
- Sử dụng http client từ utils/api.js
- Mapping Vietnamese field names sang English
- Consistent naming: realXxxAPI
- CRUD operations: getAll, getById, create, update, delete

### TR-4: Field Name Conventions
**Priority:** High  
**Description:** Quy ước đặt tên fields
- Backend (Vietnamese): taiKhoanId, yeuCauId, nguoiThueId, hoTen, moTa, etc.
- Frontend (English): id, requestId, employerId, name, description, etc.
- Mapping phải handle cả 2 chiều (to API và from API)

### TR-5: Status Value Mapping
**Priority:** Medium  
**Description:** Map status values giữa backend và frontend
- Request status: DangMo, DaDong, DaHuy, HoanThanh
- Proposal status: DaGui, DuocChon, TuChoi, HetHan
- Contract status: MoiTao, DangThucHien, HoanThanh, DaHuy, TranhChap
- Progress status: ChuaXacNhan, DaXacNhan, TuChoi
- Supervisor status: HoatDong, TamNghi, BiKhoa, ChoDuyet

## Functional Requirements

### FR-1: Authentication API
- POST /auth/register - Đăng ký tài khoản
- POST /auth/login - Đăng nhập
- Lưu user info vào localStorage
- Normalize user object với taiKhoanId và vaiTro

### FR-2: Users API
- GET /users - Lấy danh sách
- GET /users/search?keyword=xxx - Tìm kiếm
- GET /users/:id - Lấy thông tin
- GET /users/:id/profile - Lấy profile chi tiết
- GET /users/:id/jobs - Lấy yêu cầu của user
- PUT /users/:id - Cập nhật
- DELETE /users/:id - Xóa (soft delete)

### FR-3: Contracts API
- POST /contracts - Tạo hợp đồng
- GET /contracts - Lấy danh sách
- GET /contracts/:id - Lấy chi tiết
- GET /contracts/:id/detail - Lấy chi tiết đầy đủ
- GET /users/:id/contracts - Lấy hợp đồng của user
- PUT /contracts/:id/status - Cập nhật trạng thái
- POST /contracts/:id/supervisor - Chọn giám sát
- PUT /contracts/:id/supervisor/accept - Chấp nhận giám sát
- PUT /contracts/:id/supervisor/reject - Từ chối giám sát

### FR-4: Supervisors API
- GET /supervisors - Lấy danh sách
- GET /supervisors/search?keyword=xxx - Tìm kiếm
- GET /supervisors/:id - Lấy chi tiết
- POST /supervisors - Tạo mới
- PUT /supervisors/:id - Cập nhật
- DELETE /supervisors/:id - Xóa (soft delete)

### FR-5: Progress API
- POST /progress - Tạo tiến độ
- GET /contracts/:id/progress - Lấy danh sách tiến độ
- GET /progress/:id - Lấy chi tiết
- PUT /progress/:id - Cập nhật
- DELETE /progress/:id - Xóa

### FR-6: Chat API
- POST /conversations - Tạo cuộc trò chuyện
- GET /conversations/:id - Lấy thông tin
- GET /contracts/:id/conversations - Lấy theo hợp đồng
- POST /messages - Gửi tin nhắn
- GET /conversations/:id/messages - Lấy tin nhắn

### FR-7: Disputes API
- POST /disputes - Tạo tranh chấp
- GET /disputes/:id - Lấy chi tiết
- GET /contracts/:id/disputes - Lấy theo hợp đồng
- PUT /disputes/:id/review - Duyệt
- PUT /disputes/:id/resolve - Giải quyết

### FR-8: Evidences API
- POST /disputes/:id/evidences - Tạo bằng chứng
- GET /disputes/:id/evidences - Lấy danh sách
- DELETE /evidences/:id - Xóa

### FR-9: Notifications API (Complete)
- GET /notifications?userId=xxx - Lấy danh sách
- GET /notifications/unread-count?userId=xxx - Đếm chưa đọc
- PUT /notifications/:id/read - Đánh dấu đã đọc
- PUT /notifications/read-all?userId=xxx - Đánh dấu tất cả
- DELETE /notifications/:id - Xóa

### FR-10: Payments API (Complete)
- POST /payments/deposit - Nạp tiền
- GET /payments/:id - Lấy chi tiết
- GET /contracts/:id/payments - Lấy theo hợp đồng
- GET /payments?userId=xxx - Lấy theo user
- PUT /payments/:id/release - Giải ngân
- PUT /payments/:id/refund - Hoàn tiền

### FR-11: Reviews API (Complete)
- POST /reviews - Tạo đánh giá
- GET /reviews/:id - Lấy chi tiết
- GET /users/:id/reviews - Lấy theo user
- GET /contracts/:id/reviews - Lấy theo hợp đồng

### FR-12: Admin API
- GET /admin/users - Lấy danh sách user
- PUT /admin/users/:id/ban - Khóa user
- GET /admin/supervisors - Lấy danh sách giám sát
- PUT /admin/supervisors/:id/approve - Duyệt giám sát
- GET /admin/statistics - Thống kê

## Non-Functional Requirements

### NFR-1: Error Handling
- Tất cả API calls phải có try-catch
- Return apiResponse với success=false khi có lỗi
- Log error message để debug
- Không crash app khi API fail

### NFR-2: Data Consistency
- Mapping phải consistent cho tất cả entities
- Field names phải match với component expectations
- Status values phải được normalize
- Date format phải consistent (ISO 8601)

### NFR-3: Code Organization
- Mỗi entity có một API object (realXxxAPI)
- Mapping functions ở đầu file
- Helper functions được reuse
- Comments rõ ràng cho complex logic

### NFR-4: Performance
- Không gọi API không cần thiết
- Cache user info trong localStorage
- Reuse mapping functions
- Optimize array operations

## Success Criteria

1. ✅ Tất cả 18 API sections được implement đầy đủ
2. ✅ Tất cả mapping functions hoạt động chính xác
3. ✅ Components nhận được data với English field names
4. ✅ Error handling hoạt động tốt, không crash app
5. ✅ Code được organize tốt, dễ maintain
6. ✅ Không có console errors khi sử dụng app
7. ✅ Data flow từ API → mapping → component hoạt động mượt mà

## Out of Scope

- Mock data sẽ không bị xóa (giữ lại cho testing)
- UI/UX changes không nằm trong scope này
- Backend API implementation không nằm trong scope
- Authentication token/JWT implementation (nếu backend chưa có)
- Real-time features (WebSocket, etc.)

## Dependencies

- Backend API phải running trên port 8080
- API Guide (`src/doc/API_GUIDE.md`) là source of truth
- `src/utils/api.js` - HTTP client
- Mock data files trong `src/mock/` - reference cho data structure

## Assumptions

- Backend API follow đúng API Guide
- Backend trả về Vietnamese field names
- Components expect English field names
- Status values match với API Guide
- Date format là ISO 8601
