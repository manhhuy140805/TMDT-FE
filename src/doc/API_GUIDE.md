# 📚 HƯỚNG DẪN SỬ DỤNG API - FRAS TMDT

## 🔧 Thông tin cơ bản

- **Base URL**: `http://localhost:3000`
- **Port mặc định**: `3000`
- **Authentication**: Chưa có (đang phát triển)
- **Content-Type**: `application/json`

---

## 📋 Mục lục

1. [Health Check](#1-health-check)
2. [Authentication (Xác thực)](#2-authentication)
3. [Users (Người dùng)](#3-users)
4. [Categories (Loại dịch vụ)](#4-categories)
5. [Jobs (Yêu cầu thuê)](#5-jobs)
6. [Proposals (Báo giá)](#6-proposals)
7. [Contracts (Hợp đồng)](#7-contracts)
8. [Supervisors (Đơn vị giám sát)](#8-supervisors)
9. [Progress (Tiến độ)](#9-progress)
10. [Freelancers (Freelancer)](#10-freelancers)
11. [Chat (Tin nhắn)](#11-chat)
12. [Disputes (Tranh chấp)](#12-disputes)
13. [Evidences (Bằng chứng)](#13-evidences)
14. [Notifications (Thông báo)](#14-notifications)
15. [Payments (Thanh toán)](#15-payments)
16. [Reviews (Đánh giá)](#16-reviews)
17. [Reports (Báo cáo)](#17-reports)
18. [Admin (Quản trị)](#18-admin)

---

## 1. Health Check

### Kiểm tra trạng thái server

```http
GET /health
```

**Response:**

```json
{
  "status": "ok",
  "timestamp": "2026-04-22T12:00:00.000Z"
}
```

---

## 2. Authentication

### 2.1. Đăng ký tài khoản

```http
POST /auth/register
```

**Body:**

```json
{
  "tenDangNhap": "user01",
  "matKhau": "123456",
  "email": "user01@example.com",
  "hoTen": "Nguyen Van A",
  "soDienThoai": "0901000001",
  "gioiTinh": "Nam",
  "diaChi": "Ha Noi",
  "vaiTro": "NguoiThue"
}
```

**Vai trò có thể chọn:**

- `NguoiThue` - Người thuê (mặc định)
- `Freelancer` - Freelancer
- `DonViGiamSat` - Đơn vị giám sát

### 2.2. Đăng nhập

```http
POST /auth/login
```

**Body:**

```json
{
  "tenDangNhap": "user01",
  "matKhau": "123456"
}
```

---

## 3. Users

### 3.1. Lấy danh sách người dùng

```http
GET /users
```

### 3.2. Tìm kiếm người dùng

```http
GET /users/search?keyword=nguyen
```

### 3.3. Lấy thông tin người dùng

```http
GET /users/:id
```

### 3.4. Lấy profile chi tiết

```http
GET /users/:id/profile
```

Trả về thông tin chi tiết theo vai trò (NguoiThue/Freelancer/DonViGiamSat)

### 3.5. Lấy danh sách yêu cầu của người dùng

```http
GET /users/:id/jobs
```

### 3.6. Cập nhật thông tin

```http
PUT /users/:id
```

**Body:**

```json
{
  "hoTen": "Nguyen Van B",
  "soDienThoai": "0901000002",
  "diaChi": "Ho Chi Minh"
}
```

### 3.7. Xóa người dùng (soft delete)

```http
DELETE /users/:id
```

---

## 4. Categories

### 4.1. Lấy danh sách loại dịch vụ

```http
GET /categories
```

### 4.2. Lấy chi tiết loại dịch vụ

```http
GET /categories/:id
```

### 4.3. Tạo loại dịch vụ mới

```http
POST /categories
```

**Body:**

```json
{
  "tenLoai": "Thiet ke web",
  "moTa": "Thiet ke giao dien website",
  "hinhAnh": "https://example.com/image.jpg"
}
```

### 4.4. Cập nhật loại dịch vụ

```http
PUT /categories/:id
```

### 4.5. Xóa loại dịch vụ

```http
DELETE /categories/:id
```

---

## 5. Jobs

### 5.1. Tạo yêu cầu thuê mới

```http
POST /jobs
```

**Body:**

```json
{
  "nguoiThueId": 5,
  "loaiDichVuId": 1,
  "tieuDe": "Can thiet ke website ban hang",
  "moTa": "Can thiet ke website ban hang online",
  "nganSachMin": 5000000,
  "nganSachMax": 10000000,
  "thoiHan": "2026-05-30",
  "yeuCauGiamSat": true
}
```

### 5.2. Lấy danh sách yêu cầu

```http
GET /jobs
```

### 5.3. Tìm kiếm yêu cầu

```http
GET /jobs/search?keyword=website&category=1&budget=7000000
```

**Query params:**

- `keyword` - Tìm trong tiêu đề và mô tả
- `category` - ID loại dịch vụ
- `budget` - Ngân sách

### 5.4. Lấy chi tiết yêu cầu

```http
GET /jobs/:id
```

### 5.5. Lấy báo giá của yêu cầu

```http
GET /jobs/:id/proposals
```

### 5.6. Cập nhật yêu cầu

```http
PUT /jobs/:id
```

**Trạng thái có thể cập nhật:**

- `MoDau` - Mở đầu
- `DangMo` - Đang mở
- `DaDong` - Đã đóng
- `DaHuy` - Đã hủy
- `HoanThanh` - Hoàn thành

### 5.7. Xóa yêu cầu (soft delete)

```http
DELETE /jobs/:id
```

---

## 6. Proposals

### 6.1. Tạo báo giá mới

```http
POST /proposals
```

**Body:**

```json
{
  "yeuCauId": 15,
  "freelancerId": 8,
  "giaDeXuat": 7000000,
  "thoiGianThucHien": 25,
  "noiDung": "Toi co kinh nghiem 3 nam ve thiet ke web"
}
```

### 6.2. Lấy chi tiết báo giá

```http
GET /proposals/:id
```

### 6.3. Lấy báo giá của freelancer

```http
GET /freelancers/:id/proposals
```

### 6.4. Cập nhật báo giá

```http
PUT /proposals/:id
```

**Trạng thái có thể cập nhật:**

- `DaGui` - Đã gửi
- `DuocChon` - Được chọn
- `TuChoi` - Từ chối
- `HetHan` - Hết hạn

### 6.5. Xóa báo giá

```http
DELETE /proposals/:id
```

---

## 7. Contracts

### 7.1. Tạo hợp đồng mới

```http
POST /contracts
```

**Body:**

```json
{
  "yeuCauId": 15,
  "freelancerId": 8,
  "nguoiThueId": 5,
  "giaThoa": 7000000,
  "thoiGianThoa": 25
}
```

### 7.2. Lấy danh sách hợp đồng

```http
GET /contracts
```

### 7.3. Lấy chi tiết hợp đồng

```http
GET /contracts/:id
GET /contracts/:id/detail
```

### 7.4. Lấy hợp đồng của user

```http
GET /users/:id/contracts
```

### 7.5. Cập nhật trạng thái hợp đồng

```http
PUT /contracts/:id/status
```

**Body:**

```json
{
  "trangThai": "DangThucHien"
}
```

**Trạng thái:**

- `MoiTao` - Mới tạo
- `DangThucHien` - Đang thực hiện
- `HoanThanh` - Hoàn thành
- `DaHuy` - Đã hủy
- `TranhChap` - Tranh chấp

### 7.6. Chọn đơn vị giám sát

```http
POST /contracts/:id/supervisor
```

**Body:**

```json
{
  "giamSatId": 1,
  "phiGiamSat": 2000000
}
```

### 7.7. Freelancer chấp nhận giám sát

```http
PUT /contracts/:id/supervisor/accept
```

### 7.8. Freelancer từ chối giám sát

```http
PUT /contracts/:id/supervisor/reject
```

---

## 8. Supervisors

### 8.1. Lấy danh sách đơn vị giám sát

```http
GET /supervisors
```

### 8.2. Tìm kiếm đơn vị giám sát

```http
GET /supervisors/search?keyword=ISO
```

### 8.3. Lấy chi tiết đơn vị giám sát

```http
GET /supervisors/:id
```

### 8.4. Tạo đơn vị giám sát mới

```http
POST /supervisors
```

**Body:**

```json
{
  "taiKhoanId": 15,
  "tenDonVi": "Cong ty giam sat A",
  "moTa": "Chuyen giam sat cac du an CNTT",
  "nangLuc": "ISO 9001, ISO 27001",
  "chungChi": "Chung chi giam sat quoc te",
  "phiGiamSat": 2000000
}
```

### 8.5. Cập nhật đơn vị giám sát

```http
PUT /supervisors/:id
```

**Trạng thái:**

- `HoatDong` - Hoạt động
- `TamNghi` - Tạm nghỉ
- `BiKhoa` - Bị khóa
- `ChoDuyet` - Chờ duyệt

### 8.6. Xóa đơn vị giám sát (soft delete)

```http
DELETE /supervisors/:id
```

---

## 9. Progress

### 9.1. Tạo tiến độ mới

```http
POST /progress
```

**Body:**

```json
{
  "congViecId": 30,
  "freelancerId": 8,
  "tieuDe": "Hoan thanh thiet ke giao dien",
  "moTa": "Da hoan thanh thiet ke giao dien trang chu",
  "phanTram": 30,
  "tepDinhKem": "https://example.com/files/design-v1.zip"
}
```

**Lưu ý:** `phanTram` phải từ 0-100

### 9.2. Lấy danh sách tiến độ của hợp đồng

```http
GET /contracts/:id/progress
```

### 9.3. Lấy chi tiết tiến độ

```http
GET /progress/:id
```

### 9.4. Cập nhật tiến độ

```http
PUT /progress/:id
```

**Body:**

```json
{
  "tieuDe": "Hoan thanh thiet ke giao dien - Cap nhat",
  "phanTram": 50,
  "trangThaiXacNhan": "DaXacNhan"
}
```

**Trạng thái xác nhận:**

- `ChuaXacNhan` - Chưa xác nhận
- `DaXacNhan` - Đã xác nhận
- `TuChoi` - Từ chối

### 9.5. Xóa tiến độ

```http
DELETE /progress/:id
```

---

## 10. Freelancers

### 10.1. Lấy báo giá của freelancer

```http
GET /freelancers/:id/proposals
```

---

## 11. Chat

### 11.1. Tạo cuộc trò chuyện

```http
POST /conversations
```

**Body:**

```json
{
  "contractId": 15,
  "nguoiThueId": 5,
  "freelancerId": 8
}
```

### 11.2. Lấy thông tin cuộc trò chuyện

```http
GET /conversations/:id
```

### 11.3. Lấy danh sách cuộc trò chuyện theo hợp đồng

```http
GET /contracts/:id/conversations
```

### 11.4. Gửi tin nhắn

```http
POST /messages
```

**Body:**

```json
{
  "conversationId": 10,
  "nguoiGuiId": 5,
  "noiDung": "Xin chao"
}
```

### 11.5. Lấy danh sách tin nhắn theo cuộc trò chuyện

```http
GET /conversations/:id/messages
```

---

## 12. Disputes

### 12.1. Tạo tranh chấp

```http
POST /disputes
```

**Body:**

```json
{
  "contractId": 15,
  "nguoiTaoId": 5,
  "lyDo": "Khong dat yeu cau"
}
```

### 12.2. Lấy chi tiết tranh chấp

```http
GET /disputes/:id
```

### 12.3. Lấy danh sách tranh chấp theo hợp đồng

```http
GET /contracts/:id/disputes
```

### 12.4. Duyệt tranh chấp

```http
PUT /disputes/:id/review
```

### 12.5. Giải quyết tranh chấp

```http
PUT /disputes/:id/resolve
```

---

## 13. Evidences

### 13.1. Tạo bằng chứng cho tranh chấp

```http
POST /disputes/:id/evidences
```

**Body:**

```json
{
  "tepDinhKem": "https://example.com/files/proof.zip",
  "moTa": "Tai lieu lien quan"
}
```

### 13.2. Lấy danh sách bằng chứng theo tranh chấp

```http
GET /disputes/:id/evidences
```

### 13.3. Xóa bằng chứng

```http
DELETE /evidences/:id
```

---

## 14. Notifications

### 14.1. Lấy danh sách thông báo theo user

```http
GET /notifications?userId=5
```

### 14.2. Đánh dấu đã đọc

```http
PUT /notifications/:id/read
```

### 14.3. Xóa thông báo

```http
DELETE /notifications/:id
```

---

## 15. Payments

### 15.1. Nạp tiền

```http
POST /payments/deposit
```

**Body:**

```json
{
  "nguoiThueId": 5,
  "soTien": 2000000
}
```

### 15.2. Lấy chi tiết giao dịch

```http
GET /payments/:id
```

### 15.3. Lấy danh sách giao dịch theo hợp đồng

```http
GET /contracts/:id/payments
```

### 15.4. Giai ngan

```http
PUT /payments/:id/release
```

### 15.5. Hoan tien

```http
PUT /payments/:id/refund
```

---

## 16. Reviews

### 16.1. Tao danh gia

```http
POST /reviews
```

**Body:**

```json
{
  "contractId": 15,
  "nguoiDanhGiaId": 5,
  "diem": 5,
  "noiDung": "Lam viec tot"
}
```

### 16.2. Lay chi tiet danh gia

```http
GET /reviews/:id
```

### 16.3. Lay danh gia theo user

```http
GET /users/:id/reviews
```

### 16.4. Lay danh gia theo hop dong

```http
GET /contracts/:id/reviews
```

---

## 17. Reports

### 17.1. Tao bao cao

```http
POST /reports
```

**Body:**

```json
{
  "nguoiBaoCaoId": 5,
  "doiTuongId": 8,
  "noiDung": "Co hanh vi vi pham"
}
```

### 17.2. Lay danh sach bao cao

```http
GET /reports
```

### 17.3. Giai quyet bao cao

```http
PUT /reports/:id/resolve
```

---

## 18. Admin

### 18.1. Lay danh sach user

```http
GET /admin/users
```

### 18.2. Khoa user

```http
PUT /admin/users/:id/ban
```

### 18.3. Lay danh sach don vi giam sat

```http
GET /admin/supervisors
```

### 18.4. Duyet don vi giam sat

```http
PUT /admin/supervisors/:id/approve
```

### 18.5. Thong ke

```http
GET /admin/statistics
```

---

## 🔍 Ví dụ sử dụng với cURL

### Đăng ký tài khoản

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "tenDangNhap": "user01",
    "matKhau": "123456",
    "email": "user01@example.com",
    "hoTen": "Nguyen Van A",
    "vaiTro": "NguoiThue"
  }'
```

### Tạo yêu cầu thuê

```bash
curl -X POST http://localhost:3000/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "nguoiThueId": 5,
    "loaiDichVuId": 1,
    "tieuDe": "Can thiet ke website",
    "moTa": "Thiet ke website ban hang",
    "nganSachMin": 5000000,
    "nganSachMax": 10000000,
    "thoiHan": "2026-05-30"
  }'
```

### Lấy danh sách yêu cầu

```bash
curl http://localhost:3000/jobs
```

---

## 🔍 Ví dụ sử dụng với JavaScript (Fetch API)

### Đăng ký tài khoản

```javascript
const register = async () => {
  const response = await fetch('http://localhost:3000/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      tenDangNhap: 'user01',
      matKhau: '123456',
      email: 'user01@example.com',
      hoTen: 'Nguyen Van A',
      vaiTro: 'NguoiThue',
    }),
  });

  const data = await response.json();
  console.log(data);
};
```

### Lấy danh sách yêu cầu

```javascript
const getJobs = async () => {
  const response = await fetch('http://localhost:3000/jobs');
  const data = await response.json();
  console.log(data);
};
```

### Tìm kiếm yêu cầu

```javascript
const searchJobs = async (keyword) => {
  const response = await fetch(
    `http://localhost:3000/jobs/search?keyword=${keyword}`,
  );
  const data = await response.json();
  console.log(data);
};
```

---

## 📝 Lưu ý quan trọng

1. **Validation**: Tất cả API đều có validation, kiểm tra kỹ dữ liệu trước khi gửi
2. **Soft Delete**: Một số endpoint xóa là soft delete (chỉ cập nhật trạng thái)
3. **Hard Delete**: Một số endpoint xóa là hard delete (xóa vĩnh viễn)
4. **Date Format**: Sử dụng format ISO 8601 cho ngày tháng (YYYY-MM-DD)
5. **Number Format**: Số tiền được trả về dạng string để tránh mất độ chính xác

---

## ⚠️ Xử lý lỗi

### Các mã lỗi thường gặp:

- `400 Bad Request` - Dữ liệu không hợp lệ
- `401 Unauthorized` - Chưa đăng nhập hoặc token không hợp lệ
- `404 Not Found` - Không tìm thấy tài nguyên
- `500 Internal Server Error` - Lỗi server

### Ví dụ response lỗi:

```json
{
  "statusCode": 400,
  "message": "tenDangNhap is required",
  "error": "Bad Request"
}
```

---

## 🚀 Luồng hoạt động cơ bản

### 1. Người thuê đăng yêu cầu

```
POST /auth/register (vaiTro: NguoiThue)
  ↓
POST /auth/login
  ↓
POST /jobs (tạo yêu cầu thuê)
```

### 2. Freelancer gửi báo giá

```
POST /auth/register (vaiTro: Freelancer)
  ↓
POST /auth/login
  ↓
GET /jobs (xem danh sách yêu cầu)
  ↓
POST /proposals (gửi báo giá)
```

### 3. Tạo hợp đồng và thực hiện

```
POST /contracts (tạo hợp đồng)
  ↓
PUT /contracts/:id/status (bắt đầu thực hiện)
  ↓
POST /progress (báo cáo tiến độ)
  ↓
PUT /contracts/:id/status (hoàn thành)
```

### 4. Sử dụng giám sát (tùy chọn)

```
POST /contracts/:id/supervisor (chọn giám sát)
  ↓
PUT /contracts/:id/supervisor/accept (freelancer chấp nhận)
  ↓
POST /progress (giám sát xác nhận tiến độ)
```

---

## 📞 Hỗ trợ

Nếu có vấn đề hoặc câu hỏi, vui lòng liên hệ team phát triển.

**Version**: 1.0.0  
**Last Updated**: 2026-05-06
