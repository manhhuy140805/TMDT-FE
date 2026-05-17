# API Architecture - Domain-Based Organization

## 📁 Cấu trúc thư mục

```
src/services/
├── api.js                    # Main export - aggregates all domains
├── domains/
│   ├── index.js             # Exports all domain APIs
│   ├── utils.js             # Shared utilities & helpers
│   ├── auth.js              # Authentication (login, register, logout)
│   ├── categories.js        # Service categories
│   ├── requests.js          # Job requests management
│   ├── quotes.js            # Proposals/Quotes for requests
│   ├── freelancers.js       # Freelancer profiles & listings
│   ├── users.js             # User management
│   ├── jobs.js              # Job contracts
│   ├── messages.js          # Messaging system
│   ├── notifications.js     # Notifications
│   ├── payments.js          # Payment handling
│   ├── reviews.js           # Reviews & ratings
│   ├── reports.js           # User reports
│   ├── complaints.js        # Complaints/Disputes
│   ├── progress.js          # Work progress tracking
│   └── statistics.js        # Admin statistics
```

## 🎯 Mục đích của cấu trúc này

- **Separation of Concerns**: Mỗi domain có một file riêng
- **Scalability**: Dễ dàng thêm, sửa hoặc xóa API domains
- **Maintainability**: Code dễ đọc, dễ tìm, dễ bảo trì
- **Reusability**: Shared utilities giúp tránh code duplicate

## 💡 Cách sử dụng

### Import từ main file (backward compatible)

```javascript
import api from "../../services/api";

// Sử dụng như trước
api.requests.getById(id);
api.quotes.create(data);
api.users.search(keyword);
```

### Import từ domains (recommended)

```javascript
import { requestsAPI, quotesAPI } from "../../services/domains";

// Hoặc import specific domain
import requestsAPI from "../../services/domains/requests";
```

### Import utilities

```javascript
import {
  formatCurrency,
  mapRequestFromApi,
  apiResponse,
} from "../../services/domains/utils";
```

## 📦 Danh sách các Domains

### auth.js

- `login(credentials)` - Đăng nhập
- `register(data)` - Đăng ký
- `logout()` - Đăng xuất

### categories.js

- `getAll()` - Lấy tất cả danh mục dịch vụ
- `getById(id)` - Lấy danh mục theo ID

### requests.js

- `getAll(params)` - Lấy tất cả yêu cầu (hỗ trợ lọc)
- `getByUserId(userId)` - Lấy yêu cầu của user
- `getById(id)` - Lấy chi tiết yêu cầu
- `create(data)` - Tạo yêu cầu mới
- `update(id, data)` - Cập nhật yêu cầu
- `delete(id)` - Xóa yêu cầu

### quotes.js

- `getByRequestId(requestId)` - Lấy báo giá cho yêu cầu
- `create(data)` - Gửi báo giá
- `update(id, data)` - Cập nhật báo giá
- `delete(id)` - Xóa báo giá

### freelancers.js

- `getAll(params)` - Lấy danh sách freelancer (hỗ trợ tìm kiếm)

### users.js

- `getAll()` - Lấy tất cả users
- `search(keyword)` - Tìm kiếm users
- `getById(id)` - Lấy thông tin user
- `getProfile(id)` - Lấy profile user
- `getJobs(id)` - Lấy job của user
- `update(id, data)` - Cập nhật user
- `delete(id)` - Xóa user

### jobs.js

- `getAll(params)` - Lấy danh sách công việc (hỗ trợ lọc)
- `getById(id)` - Lấy chi tiết công việc
- `update(id, data)` - Cập nhật trạng thái công việc

### messages.js

- `getConversations(userId)` - Lấy danh sách cuộc trò chuyện
- `getMessages(conversationId)` - Lấy tin nhắn trong cuộc trò chuyện
- `sendMessage(data)` - Gửi tin nhắn

### notifications.js

- `getByUserId(userId)` - Lấy thông báo của user
- `getUnreadCount(userId)` - Đếm thông báo chưa đọc
- `markAsRead(id)` - Đánh dấu thông báo đã đọc
- `markAllAsRead(userId)` - Đánh dấu tất cả thông báo đã đọc

### payments.js

- `getAll(params)` - Lấy danh sách thanh toán (hỗ trợ lọc)
- `create(data)` - Tạo thanh toán

### reviews.js

- `getAll(params)` - Lấy danh sách đánh giá (hỗ trợ lọc)
- `create(data)` - Tạo đánh giá

### reports.js

- `getAll()` - Lấy danh sách báo cáo

### complaints.js

- `getAll(params)` - Lấy danh sách khiếu nại
- `create(data)` - Tạo khiếu nại

### progress.js

- `getByContractId(contractId)` - Lấy tiến độ của contract
- `create(data)` - Tạo tiến độ mới
- `update(id, data)` - Cập nhật tiến độ
- `updateProgress(contractId, data)` - Cập nhật phần trăm tiến độ
- `delete(id)` - Xóa tiến độ

### statistics.js

- `getOverview()` - Lấy tổng quan thống kê
- `getRequestsByCategory()` - Lấy yêu cầu theo danh mục
- `getTopFreelancers()` - Lấy top freelancer
- `getRevenueByMonth()` - Lấy doanh thu theo tháng

## 🔧 Utilities (utils.js)

### Data Formatting

- `formatCurrency(amount)` - Format tiền
- `formatDate(dateString)` - Format ngày
- `getTimeAgo(dateString)` - Tính thời gian đã trôi qua

### Response Helpers

- `apiResponse(data, success, message)` - Tạo API response
- `unwrapData(payload)` - Unwrap API response payload
- `normalizeArray(payload)` - Normalize mảng từ API
- `parseDurationDays(duration)` - Parse duration thành ngày

### Data Mapping

- `mapUserFromApi(user)` - Map user từ API format
- `mapCategoryFromApi(category)` - Map category từ API format
- `mapFreelancerFromApi(freelancer)` - Map freelancer từ API format
- `mapProposalFromApi(proposal)` - Map proposal/quote từ API format
- `mapRequestFromApi(request)` - Map request từ API format

### Status Mapping

- `mapProposalStatus(status)` - Map proposal status từ API
- `mapProposalStatusToApi(status)` - Map proposal status sang API

### Other Utilities

- `buildPagination(items, page, limit)` - Tạo pagination object
- `getCurrentUserId()` - Lấy ID user hiện tại từ localStorage

## 🔄 Migration Guide

Nếu bạn có code cũ sử dụng file api.js nguyên khối, không cần thay đổi!

Cách import vẫn hoạt động:

```javascript
import api from "../../services/api";
api.requests.getById(id);
```

Nhưng để tốt hơn, có thể import trực tiếp từ domain:

```javascript
import requestsAPI from "../../services/domains/requests";
requestsAPI.getById(id);
```

## 📝 Thêm Domain Mới

1. Tạo file `src/services/domains/[newDomain].js`
2. Import utilities cần dùng
3. Định nghĩa API methods
4. Export default
5. Thêm vào `src/services/domains/index.js`
6. Thêm vào `src/services/api.js`

Ví dụ:

```javascript
// src/services/domains/myDomain.js
import { api as http } from "../../utils/api";
import { apiResponse, unwrapData } from "./utils";

const myDomainAPI = {
  getAll: async () => {
    try {
      const payload = await http.get("/my-endpoint");
      return apiResponse(unwrapData(payload));
    } catch (error) {
      return apiResponse([], false, error.message || "API Error");
    }
  },
};

export default myDomainAPI;
```
