# Mock Data & API Documentation

## Tổng quan

Thư mục này chứa mock data và API service để mô phỏng backend cho frontend development.

## Cấu trúc

```
mock/
├── categories.json       # 8 danh mục dịch vụ
├── requests.json         # 10 yêu cầu công việc
├── freelancers.json      # 10 freelancers
├── quotes.json           # 10 báo giá
├── jobs.json             # 5 công việc
├── users.json            # 10 người dùng
├── notifications.json    # 20 thông báo
├── messages.json         # 21 tin nhắn
├── conversations.json    # 8 cuộc hội thoại
├── payments.json         # 8 thanh toán
├── reviews.json          # 4 đánh giá
├── reports.json          # 2 báo cáo
├── complaints.json       # 1 khiếu nại
├── statistics.json       # Thống kê tổng quan
└── index.js              # Export & helper functions
```

## Sử dụng Mock Data

### Import trực tiếp

```javascript
import { requests, freelancers, categories } from '@/mock';

// Sử dụng data
console.log(requests); // Array of 10 requests
console.log(categories); // Array of 8 categories
```

### Sử dụng Helper Functions

```javascript
import { 
  getRequestById, 
  searchRequests, 
  getQuotesByRequestId 
} from '@/mock';

// Lấy request theo ID
const request = getRequestById(1);

// Tìm kiếm requests
const results = searchRequests('react', { 
  categoryId: 1,
  minBudget: 10000000 
});

// Lấy quotes theo request
const quotes = getQuotesByRequestId(1);
```

## Sử dụng API Service

### Import API

```javascript
import api from '@/services/api';
```

### Categories API

```javascript
// GET all categories
const response = await api.categories.getAll();
// Response: { success: true, data: [...], timestamp: "..." }

// GET category by ID
const response = await api.categories.getById(1);
```

### Requests API

```javascript
// GET all requests với filters
const response = await api.requests.getAll({
  page: 1,
  limit: 10,
  categoryId: 1,
  status: 'DANG_MOI_THAU',
  search: 'react'
});

// GET request by ID
const response = await api.requests.getById(1);

// POST create new request
const response = await api.requests.create({
  title: 'Cần developer',
  description: 'Mô tả...',
  categoryId: 1,
  budgetMin: 10000000,
  budgetMax: 20000000,
  deadline: '30 ngày'
});

// PUT update request
const response = await api.requests.update(1, {
  title: 'Updated title'
});

// DELETE request
const response = await api.requests.delete(1);
```

### Freelancers API

```javascript
// GET all freelancers với filters
const response = await api.freelancers.getAll({
  page: 1,
  limit: 10,
  search: 'react',
  skills: ['React.js', 'Node.js'],
  minRating: 4.5
});

// GET freelancer by ID
const response = await api.freelancers.getById(11);
```

### Quotes API

```javascript
// GET quotes by request ID
const response = await api.quotes.getByRequestId(1);

// POST create quote
const response = await api.quotes.create({
  requestId: 1,
  freelancerId: 11,
  price: 20000000,
  duration: 60,
  content: 'Báo giá của tôi...'
});
```

### Jobs API

```javascript
// GET all jobs
const response = await api.jobs.getAll({
  freelancerId: 11,
  employerId: 2,
  status: 'DANG_THUC_HIEN'
});

// GET job by ID
const response = await api.jobs.getById(1);

// PUT update job
const response = await api.jobs.update(1, {
  progress: 50,
  notes: 'Đang làm...'
});
```

### Messages API

```javascript
// GET conversations
const response = await api.messages.getConversations(2);

// GET messages by conversation
const response = await api.messages.getMessages(1);

// POST send message
const response = await api.messages.sendMessage({
  conversationId: 1,
  senderId: 2,
  content: 'Hello!',
  type: 'VAN_BAN'
});
```

### Notifications API

```javascript
// GET notifications
const response = await api.notifications.getByUserId(2);

// GET unread count
const response = await api.notifications.getUnreadCount(2);

// PUT mark as read
const response = await api.notifications.markAsRead(1);

// PUT mark all as read
const response = await api.notifications.markAllAsRead(2);
```

### Payments API

```javascript
// GET payments
const response = await api.payments.getAll({
  jobId: 1,
  userId: 2
});

// POST create payment
const response = await api.payments.create({
  jobId: 1,
  payerId: 2,
  type: 'DAT_COC',
  amount: 10000000,
  method: 'Chuyển khoản ngân hàng'
});
```

### Reviews API

```javascript
// GET reviews
const response = await api.reviews.getAll({
  jobId: 4,
  freelancerId: 13
});

// POST create review
const response = await api.reviews.create({
  jobId: 4,
  reviewerId: 6,
  reviewedId: 13,
  rating: 5,
  comment: 'Rất tốt!',
  type: 'NGUOI_THUE_DANH_GIA_FREELANCER'
});
```

### Statistics API

```javascript
// GET overview
const response = await api.statistics.getOverview();

// GET requests by category
const response = await api.statistics.getRequestsByCategory();

// GET top freelancers
const response = await api.statistics.getTopFreelancers();

// GET revenue by month
const response = await api.statistics.getRevenueByMonth();
```

### Auth API

```javascript
// POST login
const response = await api.auth.login({
  email: 'user@example.com',
  password: 'password'
});

// POST register
const response = await api.auth.register({
  email: 'new@example.com',
  password: 'password',
  name: 'User Name',
  role: 'NGUOI_THUE'
});

// POST logout
const response = await api.auth.logout();
```

## Response Format

Tất cả API đều trả về format chuẩn:

```javascript
{
  success: true,           // Boolean
  data: {...},             // Data object/array
  message: "Success",      // Message string
  timestamp: "2026-04-26T12:00:00Z"  // ISO timestamp
}
```

## Pagination Response

API có pagination trả về:

```javascript
{
  success: true,
  data: {
    data: [...],           // Array of items
    pagination: {
      page: 1,
      limit: 10,
      total: 100,
      totalPages: 10
    }
  },
  message: "",
  timestamp: "..."
}
```

## Features

- ✅ Simulated network delay (500ms - 1000ms)
- ✅ Realistic response format
- ✅ Error handling
- ✅ Pagination support
- ✅ Filter & search support
- ✅ CRUD operations
- ✅ Relationship data (joins)

## Example: Component với API

```javascript
import { useState, useEffect } from 'react';
import api from '@/services/api';

const RequestsList = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await api.requests.getAll({
        page: 1,
        limit: 10,
        status: 'DANG_MOI_THAU'
      });

      if (response.success) {
        setRequests(response.data.data);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError('Failed to fetch requests');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {requests.map(request => (
        <div key={request.id}>{request.title}</div>
      ))}
    </div>
  );
};
```

## Notes

- Mock data được thiết kế để mô phỏng real-world scenarios
- Tất cả timestamps sử dụng ISO 8601 format
- IDs là integers
- Relationships được maintain qua foreign keys
- Data có đầy đủ Vietnamese content
