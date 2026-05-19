# 📁 Services Architecture

## Cấu trúc thư mục

```
src/services/
├── api.js                 # Main export - aggregates all services
├── authService.js         # Authentication operations
├── jobService.js          # Job/Request operations
├── proposalService.js     # Proposal/Quote operations
├── userService.js         # User management
└── categoryService.js     # Service categories
```

## 🎯 Nguyên tắc thiết kế

- **Separation of Concerns**: Mỗi service xử lý một domain riêng biệt
- **Simple & Clean**: Không có thư mục con phức tạp
- **Easy to Use**: Import trực tiếp từ service hoặc qua api.js
- **Consistent API**: Tất cả service đều sử dụng cùng pattern

## 💡 Cách sử dụng

### Import từ api.js (Recommended)

```javascript
import api from "../../services/api";

// Authentication
await api.auth.login({ tenDangNhap, matKhau });
await api.auth.register(userData);

// Jobs
await api.jobs.getAll();
await api.jobs.getById(id);
await api.jobs.create(jobData);

// Proposals
await api.proposals.getByJobId(jobId);
await api.proposals.create(proposalData);

// Users
await api.users.getById(userId);
await api.users.update(userId, userData);

// Categories
await api.categories.getAll();
```

### Import trực tiếp từ service

```javascript
import jobService from "../../services/jobService";
import proposalService from "../../services/proposalService";

await jobService.getById(id);
await proposalService.create(data);
```

## 📦 Chi tiết các Services

### authService.js
- `login(credentials)` - Đăng nhập
- `register(userData)` - Đăng ký
- `logout()` - Đăng xuất

### jobService.js
- `getAll(params)` - Lấy tất cả jobs
- `getById(id)` - Lấy job theo ID
- `getByUserId(userId)` - Lấy jobs của user
- `search(params)` - Tìm kiếm jobs
- `create(jobData)` - Tạo job mới
- `update(id, jobData)` - Cập nhật job
- `delete(id)` - Xóa job
- `getProposals(jobId)` - Lấy proposals của job

### proposalService.js
- `getById(id)` - Lấy proposal theo ID
- `getByJobId(jobId)` - Lấy proposals của job
- `getByFreelancerId(freelancerId)` - Lấy proposals của freelancer
- `create(proposalData)` - Tạo proposal mới
- `update(id, proposalData)` - Cập nhật proposal
- `delete(id)` - Xóa proposal

### userService.js
- `getAll()` - Lấy tất cả users
- `getById(id)` - Lấy user theo ID
- `getProfile(id)` - Lấy profile user
- `search(keyword)` - Tìm kiếm users
- `update(id, userData)` - Cập nhật user
- `delete(id)` - Xóa user

### categoryService.js
- `getAll()` - Lấy tất cả categories
- `getById(id)` - Lấy category theo ID
- `create(categoryData)` - Tạo category mới
- `update(id, categoryData)` - Cập nhật category
- `delete(id)` - Xóa category

## 🔧 Base API Configuration

Tất cả services sử dụng `api` helper từ `utils/api.js`:

```javascript
import { api } from "../utils/api";

// api.get(endpoint)
// api.post(endpoint, body)
// api.put(endpoint, body)
// api.delete(endpoint)
```

**Base URL**: `http://localhost:8080` (cấu hình trong `utils/api.js`)

## ✨ Ví dụ sử dụng

### Đăng nhập

```javascript
import api from "../../services/api";

const handleLogin = async () => {
  try {
    const response = await api.auth.login({
      tenDangNhap: "user01",
      matKhau: "123456"
    });
    console.log("User:", response.data);
  } catch (error) {
    console.error("Login failed:", error.message);
  }
};
```

### Lấy danh sách jobs

```javascript
import api from "../../services/api";

const fetchJobs = async () => {
  try {
    const response = await api.jobs.getAll();
    console.log("Jobs:", response.data);
  } catch (error) {
    console.error("Failed to fetch jobs:", error.message);
  }
};
```

### Tạo proposal

```javascript
import api from "../../services/api";

const submitProposal = async () => {
  try {
    const response = await api.proposals.create({
      yeuCauId: 15,
      freelancerId: 8,
      giaDeXuat: 7000000,
      thoiGianThucHien: 25,
      noiDung: "Tôi có kinh nghiệm..."
    });
    console.log("Proposal created:", response.data);
  } catch (error) {
    console.error("Failed to create proposal:", error.message);
  }
};
```

## 🚀 Thêm Service mới

1. Tạo file mới: `src/services/[serviceName]Service.js`
2. Import api helper: `import { api } from "../utils/api";`
3. Định nghĩa service object với các methods
4. Export default service
5. Thêm vào `src/services/api.js`:

```javascript
import newService from "./newService";

const api = {
  // ... existing services
  newService: newService,
};
```

## 📝 Lưu ý

- Tất cả services đều throw Error với message rõ ràng
- Response format phụ thuộc vào backend API
- Sử dụng try-catch khi gọi service methods
- Error messages đã được Việt hóa

---

**Version**: 2.0.0  
**Last Updated**: 2026-05-17
