# 📚 HƯỚNG DẪN API - FRAS TMDT (Freelance Service Marketplace)

## 📌 Mục lục

1. [Thông tin chung](#1-thông-tin-chung)
2. [Xác thực (Authentication)](#2-xác-thực)
3. [Người dùng (Users)](#3-người-dùng)
4. [Loại dịch vụ (Categories)](#4-loại-dịch-vụ)
5. [Kỹ năng (Skills)](#5-kỹ-năng) ⭐ MỚI
6. [Yêu cầu (Jobs/Requests)](#6-yêu-cầu)
7. [Báo giá (Proposals)](#7-báo-giá)
8. [Freelancer](#8-freelancer)
9. [Hợp đồng (Contracts)](#9-hợp-đồng)
10. [Đơn vị giám sát (Supervisors)](#10-đơn-vị-giám-sát)
11. [Tiến độ (Progress)](#11-tiến-độ)
12. [Tin nhắn (Chat/Messages)](#12-tin-nhắn)
13. [Tranh chấp (Disputes)](#13-tranh-chấp)
14. [Bằng chứng (Evidences)](#14-bằng-chứng)
15. [Thông báo (Notifications)](#15-thông-báo)
16. [Thanh toán (Payments)](#16-thanh-toán)
17. [Đánh giá (Reviews)](#17-đánh-giá)
18. [Báo cáo (Reports)](#18-báo-cáo)
19. [Admin](#19-admin)

---

## 1. Thông tin chung

### 1.1 Base URL

```
http://localhost:3000
```

### 1.2 Cấu hình chung

- **Port mặc định**: `3000` (có thể cấu hình qua biến `PORT`)
- **Content-Type**: `application/json`
- **Validation**: GlobalValidationPipe kích hoạt với:
  - `whitelist: true` - chỉ chấp nhận trường đã định nghĩa
  - `forbidNonWhitelisted: true` - từ chối các trường không được phép
  - `transform: true` - tự động chuyển đổi kiểu dữ liệu

### 1.3 HTTP Status Codes

| Mã  | Ý nghĩa                             |
| --- | ----------------------------------- |
| 200 | OK - Thành công                     |
| 201 | Created - Tạo thành công            |
| 400 | Bad Request - Dữ liệu không hợp lệ  |
| 401 | Unauthorized - Không xác thực       |
| 403 | Forbidden - Không có quyền truy cập |
| 404 | Not Found - Không tìm thấy          |
| 409 | Conflict - Dữ liệu bị trùng lặp     |
| 500 | Internal Server Error - Lỗi máy chủ |

### 1.4 Enum & Hằng số

#### Vai trò tài khoản (VaiTroTaiKhoan)

- `KhachVangLai` - Khách vãng lai
- `NguoiThue` - Người thuê
- `Freelancer` - Freelancer
- `DonViGiamSat` - Đơn vị giám sát
- `Admin` - Quản trị viên

#### Giới tính (GioiTinh)

- `Nam` - Nam
- `Nu` - Nữ
- `Khac` - Khác

#### Trạng thái tài khoản (TrangThaiTaiKhoan)

- `HoatDong` - Hoạt động
- `BiKhoa` - Bị khóa
- `ChoDuyet` - Chờ duyệt
- `DaBi` - Đã bị (vô hiệu hóa)

#### Trạng thái yêu cầu (TrangThaiYeuCau)

- `MoDau` - Mở đầu
- `DangMo` - Đang mở
- `DaDong` - Đã đóng
- `DaHuy` - Đã hủy
- `HoanThanh` - Hoàn thành

#### Trạng thái báo giá (TrangThaiBaoGia)

- `DaGui` - Đã gửi
- `DuocChon` - Được chọn
- `TuChoi` - Từ chối
- `HetHan` - Hết hạn

#### Trạng thái công việc (TrangThaiCongViec)

- `MoiTao` - Mới tạo
- `DangThucHien` - Đang thực hiện
- `HoanThanh` - Hoàn thành
- `DaHuy` - Đã hủy
- `TranhChap` - Tranh chấp

---

## 2. Xác thực

### 2.1 Kiểm tra trạng thái server

```http
GET /health
```

**Response 200:**

```json
{
  "status": "ok",
  "timestamp": "2026-04-22T12:00:00.000Z"
}
```

---

### 2.2 Đăng ký tài khoản

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
  "vaiTro": "NguoiThue",
  "tenDonVi": "Cong ty giam sat A"
}
```

**Trường bắt buộc:**

- `tenDangNhap` - Tên đăng nhập (duy nhất, 3-50 ký tự)
- `matKhau` - Mật khẩu (tối thiểu 6 ký tự)
- `email` - Email (duy nhất)
- `hoTen` - Họ tên đầy đủ

**Trường tùy chọn:**

- `soDienThoai` - Số điện thoại
- `gioiTinh` - Giới tính: `Nam` | `Nu` | `Khac`
- `diaChi` - Địa chỉ
- `vaiTro` - Vai trò: `KhachVangLai` | `NguoiThue` (mặc định) | `Freelancer` | `DonViGiamSat`
- `tenDonVi` - Tên đơn vị (bắt buộc khi `vaiTro=DonViGiamSat`)

**Response 201:**

```json
{
  "message": "Dang ky thanh cong",
  "user": {
    "taiKhoanId": 10,
    "tenDangNhap": "user01",
    "email": "user01@example.com",
    "hoTen": "Nguyen Van A",
    "soDienThoai": "0901000001",
    "gioiTinh": "Nam",
    "diaChi": "Ha Noi",
    "vaiTro": "NguoiThue",
    "trangThai": "HoatDong",
    "ngayTao": "2026-04-22T12:10:00.000Z"
  }
}
```

**Lỗi thường gặp (400):**

- `tenDangNhap is required` - Tên đăng nhập không được để trống
- `Email da ton tai` - Email đã được đăng ký
- `Ten dang nhap da ton tai` - Tên đăng nhập đã được sử dụng
- `GioiTinh khong hop le` - Giới tính không hợp lệ
- `VaiTro khong hop le` - Vai trò không hợp lệ

---

### 2.3 Đăng nhập

```http
POST /auth/login
```

**Body:**

```json
{
  "email": "user01@example.com",
  "matKhau": "123456"
}
```

**Trường bắt buộc:**

- `email` - Email tài khoản
- `matKhau` - Mật khẩu

**Response 200:**

```json
{
  "message": "Dang nhap thanh cong",
  "user": {
    "taiKhoanId": 10,
    "tenDangNhap": "user01",
    "email": "user01@example.com",
    "hoTen": "Nguyen Van A",
    "soDienThoai": "0901000001",
    "gioiTinh": "Nam",
    "diaChi": "Ha Noi",
    "vaiTro": "NguoiThue",
    "trangThai": "HoatDong",
    "ngayTao": "2026-04-22T12:10:00.000Z"
  }
}
```

**Lỗi (400):**

- `Email hoac mat khau khong chinh xac` - Email hoặc mật khẩu sai

---

## 3. Người dùng

### 3.1 Lấy danh sách người dùng

```http
GET /users
```

**Query Parameters:**

- `skip` - Bỏ qua số bản ghi (mặc định: 0)
- `take` - Số lượng bản ghi (mặc định: 10)

**Response 200:**

```json
{
  "data": [
    {
      "taiKhoanId": 1,
      "tenDangNhap": "user01",
      "email": "user01@example.com",
      "hoTen": "Nguyen Van A",
      "soDienThoai": "0901000001",
      "gioiTinh": "Nam",
      "diaChi": "Ha Noi",
      "vaiTro": "NguoiThue",
      "trangThai": "HoatDong",
      "ngayTao": "2026-04-22T12:00:00.000Z"
    }
  ],
  "total": 1
}
```

---

### 3.2 Tìm kiếm người dùng

```http
GET /users/search
```

**Query Parameters:**

- `keyword` - Từ khóa tìm kiếm (tên, email, số điện thoại)
- `skip` - Bỏ qua số bản ghi (mặc định: 0)
- `take` - Số lượng bản ghi (mặc định: 10)

**Response 200:**

```json
{
  "data": [
    {
      "taiKhoanId": 1,
      "tenDangNhap": "user01",
      "email": "user01@example.com",
      "hoTen": "Nguyen Van A",
      "soDienThoai": "0901000001",
      "vaiTro": "NguoiThue"
    }
  ],
  "total": 1
}
```

---

### 3.3 Lấy thông tin người dùng

```http
GET /users/:id
```

**Response 200:**

```json
{
  "taiKhoanId": 1,
  "tenDangNhap": "user01",
  "email": "user01@example.com",
  "hoTen": "Nguyen Van A",
  "soDienThoai": "0901000001",
  "gioiTinh": "Nam",
  "diaChi": "Ha Noi",
  "vaiTro": "NguoiThue",
  "trangThai": "HoatDong",
  "ngayTao": "2026-04-22T12:00:00.000Z"
}
```

---

### 3.4 Lấy profile chi tiết

```http
GET /users/:id/profile
```

Trả về thông tin chi tiết dựa trên vai trò.

**Response 200 (vai trò: NguoiThue):**

```json
{
  "taiKhoan": {
    "taiKhoanId": 1,
    "tenDangNhap": "user01",
    "email": "user01@example.com",
    "hoTen": "Nguyen Van A",
    "vaiTro": "NguoiThue"
  },
  "nguoiThue": {
    "nguoiThueId": 1,
    "congTy": "Cong ty ABC",
    "moTa": "Chi tiet ve cong ty",
    "diemTinCay": 4.5,
    "tongYeuCau": 10,
    "tyLeHoanThanh": 95.0
  }
}
```

**Response 200 (vai trò: Freelancer):**

```json
{
  "taiKhoan": {
    "taiKhoanId": 2,
    "tenDangNhap": "freelancer01",
    "email": "freelancer01@example.com",
    "hoTen": "Tran Thi B"
  },
  "freelancer": {
    "freelancerId": 1,
    "kinhNghiem": 5,
    "chuyenGia": "Web Development",
    "kyNang": "PHP, JavaScript, React",
    "xepHang": 4.8,
    "soDu": 1000.0,
    "xacThucEmail": true,
    "xacThucSDT": false,
    "tongCongViec": 20,
    "tyLeHoanThanh": 98.0
  }
}
```

---

### 3.5 Cập nhật thông tin người dùng

```http
PUT /users/:id
```

**Body:**

```json
{
  "hoTen": "Nguyen Van B",
  "soDienThoai": "0901000002",
  "gioiTinh": "Nam",
  "diaChi": "Ho Chi Minh"
}
```

**Response 200:**

```json
{
  "message": "Cap nhat thanh cong",
  "user": {
    "taiKhoanId": 1,
    "hoTen": "Nguyen Van B",
    "soDienThoai": "0901000002",
    "gioiTinh": "Nam",
    "diaChi": "Ho Chi Minh"
  }
}
```

---

### 3.6 Xóa người dùng (Soft Delete)

```http
DELETE /users/:id
```

**Response 200:**

```json
{
  "message": "Xoa nguoi dung thanh cong",
  "trangThai": "BiKhoa"
}
```

---

## 4. Loại dịch vụ

### 4.1 Lấy danh sách loại dịch vụ

```http
GET /categories
```

**Query Parameters:**

- `skip` - Bỏ qua số bản ghi (mặc định: 0)
- `take` - Số lượng bản ghi (mặc định: 10)

**Response 200:**

```json
{
  "data": [
    {
      "loaiDichVuId": 1,
      "tenLoai": "Thiet ke web",
      "moTa": "Thiet ke giao dien website",
      "hinhAnh": "https://example.com/image.jpg"
    }
  ],
  "total": 1
}
```

---

### 4.2 Lấy chi tiết loại dịch vụ

```http
GET /categories/:id
```

**Response 200:**

```json
{
  "loaiDichVuId": 1,
  "tenLoai": "Thiet ke web",
  "moTa": "Thiet ke giao dien website",
  "hinhAnh": "https://example.com/image.jpg"
}
```

---

### 4.3 Tạo loại dịch vụ mới

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

**Trường bắt buộc:**

- `tenLoai` - Tên loại dịch vụ

**Trường tùy chọn:**

- `moTa` - Mô tả
- `hinhAnh` - URL hình ảnh đại diện

**Response 201:**

```json
{
  "message": "Tao loai dich vu thanh cong",
  "data": {
    "loaiDichVuId": 1,
    "tenLoai": "Thiet ke web",
    "moTa": "Thiet ke giao dien website",
    "hinhAnh": "https://example.com/image.jpg"
  }
}
```

---

### 4.4 Cập nhật loại dịch vụ

```http
PUT /categories/:id
```

**Body:**

```json
{
  "tenLoai": "Thiet ke web va app",
  "moTa": "Thiet ke giao dien website va ung dung mobile",
  "hinhAnh": "https://example.com/new-image.jpg"
}
```

**Response 200:**

```json
{
  "message": "Cap nhat thanh cong",
  "data": {
    "loaiDichVuId": 1,
    "tenLoai": "Thiet ke web va app",
    "moTa": "Thiet ke giao dien website va ung dung mobile",
    "hinhAnh": "https://example.com/new-image.jpg"
  }
}
```

---

### 4.5 Xóa loại dịch vụ

```http
DELETE /categories/:id
```

**Response 200:**

```json
{
  "message": "Xoa loai dich vu thanh cong"
}
```

---

## 5. Kỹ năng ⭐ MỚI

Bảng `KyNang` là danh mục kỹ năng dùng chung cho cả `YeuCau` (kỹ năng yêu cầu) và `Freelancer` (kỹ năng sở hữu).

### 5.1 Lấy danh sách kỹ năng

```http
GET /skills
```

**Response 200:**

```json
{
  "total": 38,
  "skills": [
    { "kyNangId": 1, "tenKyNang": "NestJS", "moTa": "Framework Node.js cho backend" },
    { "kyNangId": 11, "tenKyNang": "React", "moTa": "Thu vien UI JavaScript" },
    { "kyNangId": 23, "tenKyNang": "SEO", "moTa": "Toi uu hoa cong cu tim kiem" }
  ]
}
```

---

### 5.2 Lấy chi tiết kỹ năng

```http
GET /skills/:id
```

**Response 200:**

```json
{
  "skill": { "kyNangId": 1, "tenKyNang": "NestJS", "moTa": "Framework Node.js cho backend" }
}
```

---

### 5.3 Tạo kỹ năng mới

```http
POST /skills
```

**Body:**

```json
{ "tenKyNang": "Golang", "moTa": "Ngon ngu lap trinh Go" }
```

**Trường bắt buộc:** `tenKyNang`

**Response 201:**

```json
{
  "message": "Tao ky nang thanh cong",
  "skill": { "kyNangId": 39, "tenKyNang": "Golang", "moTa": "Ngon ngu lap trinh Go" }
}
```

**Lỗi (400):** `Ten ky nang da ton tai`

---

### 5.4 Cập nhật kỹ năng

```http
PUT /skills/:id
```

**Body** (tất cả optional): `tenKyNang`, `moTa`

**Response 200:** `{ "message": "Cap nhat ky nang thanh cong", "skill": {...} }`

---

### 5.5 Xóa kỹ năng

```http
DELETE /skills/:id
```

**Response 200:** `{ "message": "Xoa ky nang thanh cong", "kyNangId": 1 }`

> ⚠️ Xóa kỹ năng sẽ tự động xóa tất cả liên kết trong `YeuCauKyNang` và `FreelancerKyNang` (CASCADE).

---

## 6. Yêu cầu

> ⭐ **Cập nhật:** Tất cả response của Jobs giờ có thêm trường `kyNangs`. Endpoint tạo mới hỗ trợ `kyNangIds`. Tìm kiếm hỗ trợ lọc theo kỹ năng.

### 6.1 Tạo yêu cầu mới

```http
POST /jobs
```

**Body:**

```json
{
  "nguoiThueId": 1,
  "loaiDichVuId": 2,
  "tieuDe": "Xay dung API NestJS",
  "moTa": "Can xay dung he thong API RESTful quan ly don hang va thanh toan...",
  "nganSachMin": 25000000,
  "nganSachMax": 40000000,
  "thoiHan": "2026-06-01",
  "yeuCauGiamSat": true,
  "kyNangIds": [1, 2, 3, 4, 10]
}
```

**Trường bắt buộc:** `nguoiThueId`, `loaiDichVuId`, `tieuDe`, `moTa`, `nganSachMin`, `nganSachMax`, `thoiHan`

**Trường tùy chọn:** `yeuCauGiamSat` (mặc định: false), `kyNangIds` (mặc định: [])

**Response 201:**

```json
{
  "message": "Tao yeu cau thanh cong",
  "job": {
    "yeuCauId": 1,
    "nguoiThueId": 1,
    "loaiDichVuId": 2,
    "tieuDe": "Xay dung API NestJS",
    "moTa": "...",
    "nganSachMin": "25000000.00",
    "nganSachMax": "40000000.00",
    "thoiHan": "2026-06-01T00:00:00.000Z",
    "trangThai": "DangMo",
    "soLuongBaoGia": 0,
    "yeuCauGiamSat": true,
    "ngayTao": "2026-04-19T10:00:00.000Z",
    "ngayCapNhat": "2026-04-19T10:00:00.000Z",
    "nguoiThue": { "taiKhoanId": 1, "hoTen": "Nguyen Van An", "email": "manhhuy2@gmail.com" },
    "loaiDichVu": { "loaiDichVuId": 2, "tenLoai": "Lap trinh backend" },
    "kyNangs": [
      { "kyNangId": 1, "tenKyNang": "NestJS" },
      { "kyNangId": 2, "tenKyNang": "PostgreSQL" },
      { "kyNangId": 3, "tenKyNang": "Redis" },
      { "kyNangId": 4, "tenKyNang": "REST API" },
      { "kyNangId": 10, "tenKyNang": "JWT" }
    ]
  }
}
```

---

### 6.2 Lấy danh sách yêu cầu

```http
GET /jobs
```

**Response 200:** Mảng jobs, mỗi job có thêm `kyNangs: [...]`

---

### 6.3 Tìm kiếm yêu cầu

```http
GET /jobs/search
```

**Query Parameters:**

| Param | Mô tả |
|---|---|
| `keyword` | Tìm trong tiêu đề và mô tả |
| `category` | ID loại dịch vụ |
| `budget` | Ngân sách (tìm yêu cầu có min ≤ budget ≤ max) |
| `skills` | Danh sách KyNangID cách nhau bằng dấu phẩy (e.g. `1,2,3`) |

**Ví dụ:**

```
GET /jobs/search?keyword=nestjs&category=2&skills=1,2
```

---

### 6.4 Lấy chi tiết yêu cầu

```http
GET /jobs/:id
```

**Response 200:** Job object với `kyNangs` đầy đủ.

---

### 6.5 Cập nhật yêu cầu

```http
PUT /jobs/:id
```

**Body** (tất cả optional): `loaiDichVuId`, `tieuDe`, `moTa`, `nganSachMin`, `nganSachMax`, `thoiHan`, `trangThai`, `yeuCauGiamSat`

> Để cập nhật kỹ năng, dùng endpoint riêng `PUT /jobs/:id/skills`.

---

### 6.6 Xóa yêu cầu (Soft Delete)

```http
DELETE /jobs/:id
```

**Response 200:** `{ "message": "Xoa yeu cau thanh cong", "jobId": 1 }`

---

### 6.7 Lấy kỹ năng của yêu cầu ⭐ MỚI

```http
GET /jobs/:id/skills
```

**Response 200:**

```json
{
  "message": "Lay danh sach ky nang thanh cong",
  "kyNangs": [
    { "kyNangId": 1, "tenKyNang": "NestJS" },
    { "kyNangId": 2, "tenKyNang": "PostgreSQL" }
  ]
}
```

---

### 6.8 Thay thế toàn bộ kỹ năng yêu cầu ⭐ MỚI

```http
PUT /jobs/:id/skills
```

**Body:**

```json
{ "kyNangIds": [1, 2, 4, 10] }
```

Truyền `kyNangIds: []` để xóa hết kỹ năng.

**Response 200:**

```json
{
  "message": "Cap nhat ky nang yeu cau thanh cong",
  "kyNangs": [
    { "kyNangId": 1, "tenKyNang": "NestJS" },
    { "kyNangId": 2, "tenKyNang": "PostgreSQL" }
  ]
}
```

**Lỗi (400):** `Ky nang khong ton tai: 99, 100`

---

### 6.9 Thêm 1 kỹ năng vào yêu cầu ⭐ MỚI

```http
POST /jobs/:id/skills/:kyNangId
```

Idempotent — gọi nhiều lần không lỗi.

**Response 200:** Danh sách kỹ năng hiện tại sau khi thêm.

---

### 6.10 Xóa 1 kỹ năng khỏi yêu cầu ⭐ MỚI

```http
DELETE /jobs/:id/skills/:kyNangId
```

**Response 200:** Danh sách kỹ năng hiện tại sau khi xóa.

---

## 7. Báo giá

> ⭐ **Cập nhật:** Thông tin freelancer trong response báo giá giờ có thêm `kyNangs`.

### 7.1 Tạo báo giá

```http
POST /proposals
```

**Body:**

```json
{
  "yeuCauId": 1,
  "freelancerId": 5,
  "giaDeXuat": 7000000,
  "thoiGianThucHien": 7,
  "noiDung": "De xuat giao dien hien dai voi Figma..."
}
```

**Response 201:**

```json
{
  "message": "Tao bao gia thanh cong",
  "proposal": {
    "baoGiaId": 1,
    "yeuCauId": 1,
    "freelancerId": 5,
    "giaDeXuat": "7000000.00",
    "thoiGianThucHien": 7,
    "noiDung": "...",
    "trangThai": "DaGui",
    "ngayTao": "...",
    "ngayCapNhat": "...",
    "freelancer": {
      "freelancerId": 5,
      "taiKhoanId": 13,
      "hoTen": "User 13",
      "email": "dev1@freelancer.vn",
      "kinhNghiem": 4,
      "kyNang": "NestJS, Prisma, React",
      "kyNangs": [
        { "kyNangId": 1, "tenKyNang": "NestJS" },
        { "kyNangId": 2, "tenKyNang": "PostgreSQL" },
        { "kyNangId": 11, "tenKyNang": "React" }
      ],
      "xepHang": "4.40"
    },
    "yeuCau": { "yeuCauId": 1, "tieuDe": "Xay dung API NestJS", "nguoiThueId": 1 }
  }
}
```

---

### 7.2 - 7.4 Lấy / Cập nhật / Xóa báo giá

```http
GET /proposals/:id
PUT /proposals/:id
DELETE /proposals/:id
```

Tương tự như trước, response freelancer có thêm `kyNangs`.

---

### 7.5 Lấy báo giá của yêu cầu

```http
GET /jobs/:id/proposals
```

---

### 7.6 Lấy báo giá của freelancer

```http
GET /freelancers/:id/proposals
```

---

## 8. Freelancer

> ⭐ **Cập nhật:** Thêm các endpoint quản lý kỹ năng chuẩn hóa.

### 8.1 Lấy kỹ năng của freelancer ⭐ MỚI

```http
GET /freelancers/:id/skills
```

**Response 200:**

```json
{
  "message": "Lay danh sach ky nang thanh cong",
  "freelancerId": 5,
  "kyNangs": [
    { "kyNangId": 1, "tenKyNang": "NestJS" },
    { "kyNangId": 2, "tenKyNang": "PostgreSQL" },
    { "kyNangId": 11, "tenKyNang": "React" }
  ]
}
```

---

### 8.2 Thay thế toàn bộ kỹ năng freelancer ⭐ MỚI

```http
PUT /freelancers/:id/skills
```

**Body:** `{ "kyNangIds": [1, 2, 11, 14, 6] }`

**Response 200:** Danh sách kỹ năng sau khi cập nhật.

---

### 8.3 Thêm 1 kỹ năng cho freelancer ⭐ MỚI

```http
POST /freelancers/:id/skills/:kyNangId
```

---

### 8.4 Xóa 1 kỹ năng của freelancer ⭐ MỚI

```http
DELETE /freelancers/:id/skills/:kyNangId
```



### 5.1 Tạo yêu cầu mới

```http
POST /jobs
```

**Body:**

```json
{
  "tieuDe": "Thiet ke website e-commerce",
  "moTa": "Can thiet ke website e-commerce cho cong ty ban dien tu",
  "loaiDichVuId": 1,
  "nganSachMin": 5000000,
  "nganSachMax": 10000000,
  "thoiHan": "2026-05-31",
  "yeuCauGiamSat": true
}
```

**Trường bắt buộc:**

- `tieuDe` - Tiêu đề yêu cầu
- `moTa` - Mô tả chi tiết
- `loaiDichVuId` - ID loại dịch vụ
- `nganSachMin` - Ngân sách tối thiểu
- `nganSachMax` - Ngân sách tối đa
- `thoiHan` - Thời hạn hoàn thành (định dạng: YYYY-MM-DD)

**Trường tùy chọn:**

- `yeuCauGiamSat` - Yêu cầu có giám sát hay không (mặc định: false)

**Response 201:**

```json
{
  "message": "Tao yeu cau thanh cong",
  "data": {
    "yeuCauId": 1,
    "tieuDe": "Thiet ke website e-commerce",
    "moTa": "Can thiet ke website e-commerce cho cong ty ban dien tu",
    "loaiDichVuId": 1,
    "nganSachMin": 5000000,
    "nganSachMax": 10000000,
    "thoiHan": "2026-05-31",
    "trangThai": "MoDau",
    "yeuCauGiamSat": true,
    "soLuongBaoGia": 0,
    "ngayTao": "2026-04-22T12:00:00.000Z"
  }
}
```

---

### 5.2 Lấy danh sách yêu cầu

```http
GET /jobs
```

**Query Parameters:**

- `skip` - Bỏ qua số bản ghi (mặc định: 0)
- `take` - Số lượng bản ghi (mặc định: 10)
- `trangThai` - Lọc theo trạng thái

**Response 200:**

```json
{
  "data": [
    {
      "yeuCauId": 1,
      "tieuDe": "Thiet ke website e-commerce",
      "moTa": "Can thiet ke website e-commerce cho cong ty ban dien tu",
      "loaiDichVuId": 1,
      "nganSachMin": 5000000,
      "nganSachMax": 10000000,
      "thoiHan": "2026-05-31",
      "trangThai": "MoDau",
      "soLuongBaoGia": 3
    }
  ],
  "total": 1
}
```

---

### 5.3 Tìm kiếm yêu cầu

```http
GET /jobs/search
```

**Query Parameters:**

- `keyword` - Từ khóa tìm kiếm (tiêu đề, mô tả)
- `skip` - Bỏ qua số bản ghi
- `take` - Số lượng bản ghi

**Response 200:**

```json
{
  "data": [
    {
      "yeuCauId": 1,
      "tieuDe": "Thiet ke website e-commerce"
    }
  ],
  "total": 1
}
```

---

### 5.4 Lấy chi tiết yêu cầu

```http
GET /jobs/:id
```

**Response 200:**

```json
{
  "yeuCauId": 1,
  "tieuDe": "Thiet ke website e-commerce",
  "moTa": "Can thiet ke website e-commerce cho cong ty ban dien tu",
  "loaiDichVu": {
    "loaiDichVuId": 1,
    "tenLoai": "Thiet ke web"
  },
  "nganSachMin": 5000000,
  "nganSachMax": 10000000,
  "thoiHan": "2026-05-31",
  "trangThai": "MoDau",
  "yeuCauGiamSat": true,
  "soLuongBaoGia": 3,
  "nguoiThue": {
    "nguoiThueId": 1,
    "congTy": "Cong ty ABC"
  },
  "ngayTao": "2026-04-22T12:00:00.000Z"
}
```

---

### 5.5 Cập nhật yêu cầu

```http
PUT /jobs/:id
```

**Body:**

```json
{
  "tieuDe": "Thiet ke website e-commerce (cap nhat)",
  "moTa": "Can thiet ke website e-commerce va app mobile",
  "nganSachMin": 5000000,
  "nganSachMax": 15000000,
  "thoiHan": "2026-06-30"
}
```

**Response 200:**

```json
{
  "message": "Cap nhat thanh cong",
  "data": {
    "yeuCauId": 1,
    "tieuDe": "Thiet ke website e-commerce (cap nhat)",
    "moTa": "Can thiet ke website e-commerce va app mobile",
    "nganSachMin": 5000000,
    "nganSachMax": 15000000,
    "thoiHan": "2026-06-30"
  }
}
```

---

### 5.6 Xóa yêu cầu (Soft Delete)

```http
DELETE /jobs/:id
```

**Response 200:**

```json
{
  "message": "Xoa yeu cau thanh cong",
  "trangThai": "DaHuy"
}
```

---

## 6. Báo giá

### 6.1 Tạo báo giá

```http
POST /proposals
```

**Body:**

```json
{
  "yeuCauId": 1,
  "giaThapNhat": 5000000,
  "giaNhieuNhat": 8000000,
  "thoiGianDuKien": 30,
  "moTa": "Toi co kinh nghiem 5 nam trong thiet ke website"
}
```

**Trường bắt buộc:**

- `yeuCauId` - ID yêu cầu
- `giaThapNhat` - Giá tối thiểu đề xuất
- `giaNhieuNhat` - Giá tối đa đề xuất
- `thoiGianDuKien` - Thời gian dự kiến (ngày)

**Trường tùy chọn:**

- `moTa` - Mô tả, lý do chọn

**Response 201:**

```json
{
  "message": "Tao bao gia thanh cong",
  "data": {
    "baoGiaId": 1,
    "yeuCauId": 1,
    "freelancerId": 1,
    "giaThapNhat": 5000000,
    "giaNhieuNhat": 8000000,
    "thoiGianDuKien": 30,
    "moTa": "Toi co kinh nghiem 5 nam trong thiet ke website",
    "trangThai": "DaGui",
    "ngayTao": "2026-04-22T12:00:00.000Z"
  }
}
```

---

### 6.2 Lấy chi tiết báo giá

```http
GET /proposals/:id
```

**Response 200:**

```json
{
  "baoGiaId": 1,
  "yeuCau": {
    "yeuCauId": 1,
    "tieuDe": "Thiet ke website e-commerce"
  },
  "freelancer": {
    "freelancerId": 1,
    "chuyenGia": "Web Development"
  },
  "giaThapNhat": 5000000,
  "giaNhieuNhat": 8000000,
  "thoiGianDuKien": 30,
  "moTa": "Toi co kinh nghiem 5 nam trong thiet ke website",
  "trangThai": "DaGui"
}
```

---

### 6.3 Cập nhật báo giá

```http
PUT /proposals/:id
```

**Body:**

```json
{
  "giaThapNhat": 5000000,
  "giaNhieuNhat": 7000000,
  "thoiGianDuKien": 25
}
```

**Response 200:**

```json
{
  "message": "Cap nhat thanh cong",
  "data": {
    "baoGiaId": 1,
    "giaThapNhat": 5000000,
    "giaNhieuNhat": 7000000,
    "thoiGianDuKien": 25
  }
}
```

---

### 6.4 Xóa báo giá

```http
DELETE /proposals/:id
```

**Response 200:**

```json
{
  "message": "Xoa bao gia thanh cong"
}
```

---

### 6.5 Lấy danh sách báo giá của yêu cầu

```http
GET /jobs/:id/proposals
```

**Response 200:**

```json
{
  "data": [
    {
      "baoGiaId": 1,
      "freelancer": {
        "freelancerId": 1,
        "chuyenGia": "Web Development",
        "xepHang": 4.8
      },
      "giaThapNhat": 5000000,
      "giaNhieuNhat": 8000000,
      "trangThai": "DaGui"
    }
  ],
  "total": 1
}
```

---

### 6.6 Lấy danh sách báo giá của freelancer

```http
GET /freelancers/:id/proposals
```

**Response 200:**

```json
{
  "data": [
    {
      "baoGiaId": 1,
      "yeuCau": {
        "yeuCauId": 1,
        "tieuDe": "Thiet ke website e-commerce"
      },
      "trangThai": "DaGui"
    }
  ],
  "total": 1
}
```

---

## 7. Freelancer

### 7.1 Lấy danh sách freelancer

```http
GET /freelancers
```

**Query Parameters:**

- `skip` - Bỏ qua số bản ghi
- `take` - Số lượng bản ghi

**Response 200:**

```json
{
  "data": [
    {
      "freelancerId": 1,
      "taiKhoan": {
        "taiKhoanId": 2,
        "hoTen": "Tran Thi B"
      },
      "chuyenGia": "Web Development",
      "xepHang": 4.8,
      "tongCongViec": 20,
      "tyLeHoanThanh": 98.0
    }
  ],
  "total": 1
}
```

---

### 7.2 Tìm kiếm freelancer

```http
GET /freelancers/search
```

**Query Parameters:**

- `keyword` - Từ khóa (tên, chuyên gia, kỹ năng)
- `skip` - Bỏ qua số bản ghi
- `take` - Số lượng bản ghi

---

### 7.3 Lấy chi tiết freelancer

```http
GET /freelancers/:id
```

**Response 200:**

```json
{
  "freelancerId": 1,
  "taiKhoan": {
    "taiKhoanId": 2,
    "hoTen": "Tran Thi B",
    "email": "freelancer01@example.com"
  },
  "kinhNghiem": 5,
  "chuyenGia": "Web Development",
  "kyNang": "PHP, JavaScript, React",
  "xepHang": 4.8,
  "soDu": 1000.0,
  "xacThucEmail": true,
  "xacThucSDT": false,
  "tongCongViec": 20,
  "tyLeHoanThanh": 98.0
}
```

---

### 7.4 Cập nhật thông tin freelancer

```http
PUT /freelancers/:id
```

**Body:**

```json
{
  "chuyenGia": "Web Development & Mobile App",
  "kyNang": "PHP, JavaScript, React, Flutter",
  "kinhNghiem": 6
}
```

**Response 200:**

```json
{
  "message": "Cap nhat thanh cong",
  "data": {
    "freelancerId": 1,
    "chuyenGia": "Web Development & Mobile App",
    "kyNang": "PHP, JavaScript, React, Flutter",
    "kinhNghiem": 6
  }
}
```

---

## 8. Hợp đồng

### 8.1 Tạo hợp đồng

```http
POST /contracts
```

**Body:**

```json
{
  "baoGiaId": 1,
  "giaThucTe": 7000000,
  "thoiHanThucTe": 25
}
```

**Trường bắt buộc:**

- `baoGiaId` - ID báo giá được chọn

**Trường tùy chọn:**

- `giaThucTe` - Giá thực tế (mặc định: lấy từ báo giá)
- `thoiHanThucTe` - Thời hạn thực tế (mặc định: lấy từ báo giá)

**Response 201:**

```json
{
  "message": "Tao hop dong thanh cong",
  "data": {
    "congViecId": 1,
    "yeuCau": {
      "yeuCauId": 1,
      "tieuDe": "Thiet ke website e-commerce"
    },
    "nguoiThue": {
      "nguoiThueId": 1
    },
    "freelancer": {
      "freelancerId": 1
    },
    "giaThucTe": 7000000,
    "thoiHanThucTe": 25,
    "trangThai": "MoiTao",
    "ngayTao": "2026-04-22T12:00:00.000Z"
  }
}
```

---

### 8.2 Lấy danh sách hợp đồng

```http
GET /contracts
```

**Query Parameters:**

- `skip` - Bỏ qua số bản ghi
- `take` - Số lượng bản ghi
- `trangThai` - Lọc theo trạng thái

**Response 200:**

```json
{
  "data": [
    {
      "congViecId": 1,
      "yeuCau": {
        "tieuDe": "Thiet ke website e-commerce"
      },
      "trangThai": "MoiTao"
    }
  ],
  "total": 1
}
```

---

### 8.3 Lấy chi tiết hợp đồng

```http
GET /contracts/:id
```

**Response 200:**

```json
{
  "congViecId": 1,
  "yeuCau": {
    "yeuCauId": 1,
    "tieuDe": "Thiet ke website e-commerce"
  },
  "nguoiThue": {
    "nguoiThueId": 1,
    "congTy": "Cong ty ABC"
  },
  "freelancer": {
    "freelancerId": 1,
    "chuyenGia": "Web Development"
  },
  "giaThucTe": 7000000,
  "thoiHanThucTe": 25,
  "trangThai": "MoiTao"
}
```

---

### 8.4 Lấy chi tiết hợp đồng (bao gồm tiến độ)

```http
GET /contracts/:id/detail
```

**Response 200:**

```json
{
  "hopDong": {
    "congViecId": 1,
    "yeuCau": {
      "yeuCauId": 1,
      "tieuDe": "Thiet ke website e-commerce"
    },
    "giaThucTe": 7000000,
    "trangThai": "DangThucHien"
  },
  "tiendos": [
    {
      "tiendoId": 1,
      "tieuDe": "Hoan thanh design",
      "moTa": "Hoan thanh design trang chu",
      "trangThai": "HoanThanh"
    }
  ]
}
```

---

### 8.5 Cập nhật trạng thái hợp đồng

```http
PUT /contracts/:id/status
```

**Body:**

```json
{
  "trangThai": "DangThucHien"
}
```

**Trạng thái hợp lệ:**

- `MoiTao` - Mới tạo
- `DangThucHien` - Đang thực hiện
- `HoanThanh` - Hoàn thành
- `DaHuy` - Đã hủy
- `TranhChap` - Tranh chấp

**Response 200:**

```json
{
  "message": "Cap nhat trang thai thanh cong",
  "data": {
    "congViecId": 1,
    "trangThai": "DangThucHien"
  }
}
```

---

### 8.6 Lấy danh sách hợp đồng của người dùng

```http
GET /users/:id/contracts
```

**Response 200:**

```json
{
  "data": [
    {
      "congViecId": 1,
      "yeuCau": {
        "tieuDe": "Thiet ke website e-commerce"
      },
      "trangThai": "DangThucHien"
    }
  ],
  "total": 1
}
```

---

## 9. Đơn vị giám sát

### 9.1 Lấy danh sách đơn vị giám sát

```http
GET /supervisors
```

**Query Parameters:**

- `skip` - Bỏ qua số bản ghi
- `take` - Số lượng bản ghi

**Response 200:**

```json
{
  "data": [
    {
      "giamSatId": 1,
      "tenDonVi": "Cong ty giam sat A",
      "moTa": "Chi tiet ve cong ty",
      "xepHang": 4.9,
      "tongCongViecGS": 50,
      "trangThai": "HoatDong"
    }
  ],
  "total": 1
}
```

---

### 9.2 Tìm kiếm đơn vị giám sát

```http
GET /supervisors/search
```

**Query Parameters:**

- `keyword` - Từ khóa (tên đơn vị)
- `skip` - Bỏ qua số bản ghi
- `take` - Số lượng bản ghi

---

### 9.3 Lấy chi tiết đơn vị giám sát

```http
GET /supervisors/:id
```

**Response 200:**

```json
{
  "giamSatId": 1,
  "taiKhoan": {
    "hoTen": "Cong ty giam sat A"
  },
  "tenDonVi": "Cong ty giam sat A",
  "moTa": "Chi tiet ve cong ty",
  "nangLuc": "Cac chung chi quan trong",
  "phiGiamSat": 100000.0,
  "xepHang": 4.9,
  "tongCongViecGS": 50,
  "trangThai": "HoatDong"
}
```

---

### 9.4 Tạo đơn vị giám sát mới

```http
POST /supervisors
```

**Body:**

```json
{
  "tenDonVi": "Cong ty giam sat B",
  "moTa": "Chi tiet ve cong ty",
  "nangLuc": "Cac chung chi quan trong",
  "chungChi": "Chung chi ISO 9001",
  "phiGiamSat": 150000.0
}
```

**Trường bắt buộc:**

- `tenDonVi` - Tên đơn vị

**Trường tùy chọn:**

- `moTa` - Mô tả
- `nangLuc` - Năng lực
- `chungChi` - Chứng chỉ
- `phiGiamSat` - Phí giám sát (mặc định: 0)

**Response 201:**

```json
{
  "message": "Tao don vi giam sat thanh cong",
  "data": {
    "giamSatId": 1,
    "tenDonVi": "Cong ty giam sat B",
    "trangThai": "ChoDuyet"
  }
}
```

---

### 9.5 Cập nhật đơn vị giám sát

```http
PUT /supervisors/:id
```

**Body:**

```json
{
  "tenDonVi": "Cong ty giam sat B (cap nhat)",
  "phiGiamSat": 200000.0
}
```

**Response 200:**

```json
{
  "message": "Cap nhat thanh cong",
  "data": {
    "giamSatId": 1,
    "tenDonVi": "Cong ty giam sat B (cap nhat)",
    "phiGiamSat": 200000.0
  }
}
```

---

### 9.6 Xóa đơn vị giám sát

```http
DELETE /supervisors/:id
```

**Response 200:**

```json
{
  "message": "Xoa don vi giam sat thanh cong"
}
```

---

### 9.7 Chọn giám sát cho hợp đồng

```http
POST /contracts/:id/supervisor
```

**Body:**

```json
{
  "giamSatId": 1
}
```

**Response 201:**

```json
{
  "message": "Chon giam sat thanh cong",
  "data": {
    "congViecId": 1,
    "giamSatId": 1,
    "trangThaiGiamSat": "ChoDuyet"
  }
}
```

---

### 9.8 Freelancer chấp nhận giám sát

```http
PUT /contracts/:id/supervisor/accept
```

**Response 200:**

```json
{
  "message": "Chap nhan giam sat thanh cong",
  "trangThaiGiamSat": "DangGiamSat"
}
```

---

### 9.9 Freelancer từ chối giám sát

```http
PUT /contracts/:id/supervisor/reject
```

**Body:**

```json
{
  "lyDo": "Toi khong dong y voi sle thanh"
}
```

**Response 200:**

```json
{
  "message": "Tu choi giam sat thanh cong",
  "trangThaiGiamSat": "TuChoi"
}
```

---

## 10. Tiến độ

### 10.1 Tạo tiến độ mới

```http
POST /contracts/:id/progress
```

**Body:**

```json
{
  "tieuDe": "Hoan thanh design",
  "moTa": "Hoan thanh design trang chu va trang san pham",
  "phanTramHoanThanh": 30
}
```

**Trường bắt buộc:**

- `tieuDe` - Tiêu đề tiến độ
- `phanTramHoanThanh` - Phần trăm hoàn thành (0-100)

**Trường tùy chọn:**

- `moTa` - Mô tả chi tiết

**Response 201:**

```json
{
  "message": "Tao tien do thanh cong",
  "data": {
    "tiendoId": 1,
    "congViecId": 1,
    "tieuDe": "Hoan thanh design",
    "moTa": "Hoan thanh design trang chu va trang san pham",
    "phanTramHoanThanh": 30,
    "trangThai": "ChuaXacNhan",
    "ngayTao": "2026-04-22T12:00:00.000Z"
  }
}
```

---

### 10.2 Lấy danh sách tiến độ của hợp đồng

```http
GET /contracts/:id/progress
```

**Response 200:**

```json
{
  "data": [
    {
      "tiendoId": 1,
      "tieuDe": "Hoan thanh design",
      "moTa": "Hoan thanh design trang chu va trang san pham",
      "phanTramHoanThanh": 30,
      "trangThai": "ChuaXacNhan"
    }
  ],
  "total": 1
}
```

---

### 10.3 Lấy chi tiết tiến độ

```http
GET /progress/:id
```

**Response 200:**

```json
{
  "tiendoId": 1,
  "congViec": {
    "congViecId": 1
  },
  "tieuDe": "Hoan thanh design",
  "moTa": "Hoan thanh design trang chu va trang san pham",
  "phanTramHoanThanh": 30,
  "trangThai": "ChuaXacNhan"
}
```

---

### 10.4 Cập nhật tiến độ

```http
PUT /progress/:id
```

**Body:**

```json
{
  "tieuDe": "Hoan thanh design (cap nhat)",
  "moTa": "Hoan thanh design day du",
  "phanTramHoanThanh": 50
}
```

**Response 200:**

```json
{
  "message": "Cap nhat thanh cong",
  "data": {
    "tiendoId": 1,
    "phanTramHoanThanh": 50
  }
}
```

---

### 10.5 Xóa tiến độ

```http
DELETE /progress/:id
```

**Response 200:**

```json
{
  "message": "Xoa tien do thanh cong"
}
```

---

## 11. Tin nhắn

### 11.1 Tạo cuộc hội thoại mới

```http
POST /chat
```

**Body:**

```json
{
  "thanhVien2Id": 2
}
```

**Trường bắt buộc:**

- `thanhVien2Id` - ID người dùng muốn chat với

**Response 201:**

```json
{
  "message": "Tao cuoc hoi thoai thanh cong",
  "data": {
    "cuocHoiThoaiId": 1,
    "thanhVien1": {
      "taiKhoanId": 1
    },
    "thanhVien2": {
      "taiKhoanId": 2
    },
    "trangThai": "DangMo",
    "ngayTao": "2026-04-22T12:00:00.000Z"
  }
}
```

---

### 11.2 Lấy danh sách cuộc hội thoại

```http
GET /chat
```

**Response 200:**

```json
{
  "data": [
    {
      "cuocHoiThoaiId": 1,
      "thanhVien1": {
        "taiKhoanId": 1,
        "hoTen": "Nguyen Van A"
      },
      "thanhVien2": {
        "taiKhoanId": 2,
        "hoTen": "Tran Thi B"
      },
      "tinNhanCuoi": "Toi se hoan thanh vao tuan sau",
      "trangThai": "DangMo"
    }
  ],
  "total": 1
}
```

---

### 11.3 Gửi tin nhắn

```http
POST /chat/:id/messages
```

**Body:**

```json
{
  "noiDung": "Toi se hoan thanh vao tuan sau",
  "loaiTinNhan": "VanBan"
}
```

**Trường bắt buộc:**

- `noiDung` - Nội dung tin nhắn

**Trường tùy chọn:**

- `loaiTinNhan` - Loại tin: `VanBan` | `File` | `HinhAnh` (mặc định: VanBan)

**Response 201:**

```json
{
  "message": "Gui tin nhan thanh cong",
  "data": {
    "tinNhanId": 1,
    "cuocHoiThoaiId": 1,
    "noiDung": "Toi se hoan thanh vao tuan sau",
    "loaiTinNhan": "VanBan",
    "ngayGui": "2026-04-22T12:30:00.000Z"
  }
}
```

---

### 11.4 Lấy danh sách tin nhắn

```http
GET /chat/:id/messages
```

**Query Parameters:**

- `skip` - Bỏ qua số bản ghi
- `take` - Số lượng bản ghi

**Response 200:**

```json
{
  "data": [
    {
      "tinNhanId": 1,
      "nguoiGui": {
        "taiKhoanId": 1,
        "hoTen": "Nguyen Van A"
      },
      "noiDung": "Toi se hoan thanh vao tuan sau",
      "loaiTinNhan": "VanBan",
      "ngayGui": "2026-04-22T12:30:00.000Z"
    }
  ],
  "total": 1
}
```

---

## 12. Tranh chấp

### 12.1 Tạo tranh chấp mới

```http
POST /disputes
```

**Body:**

```json
{
  "congViecId": 1,
  "tieuDe": "Cong viec khong dap ung yeu cau",
  "moTa": "Freelancer khong thuc hien dung yeu cau, design chua dat chat luong",
  "loaiTranhChap": "KhongDapUng"
}
```

**Trường bắt buộc:**

- `congViecId` - ID công việc/hợp đồng
- `tieuDe` - Tiêu đề tranh chấp
- `moTa` - Mô tả chi tiết vấn đề

**Trường tùy chọn:**

- `loaiTranhChap` - Loại tranh chấp

**Response 201:**

```json
{
  "message": "Tao tranh chap thanh cong",
  "data": {
    "tranhChapId": 1,
    "congViec": {
      "congViecId": 1
    },
    "tieuDe": "Cong viec khong dap ung yeu cau",
    "moTa": "Freelancer khong thuc hien dung yeu cau",
    "trangThai": "MoiMo",
    "ngayTao": "2026-04-22T12:00:00.000Z"
  }
}
```

---

### 12.2 Lấy danh sách tranh chấp

```http
GET /disputes
```

**Query Parameters:**

- `skip` - Bỏ qua số bản ghi
- `take` - Số lượng bản ghi
- `trangThai` - Lọc theo trạng thái

**Response 200:**

```json
{
  "data": [
    {
      "tranhChapId": 1,
      "tieuDe": "Cong viec khong dap ung yeu cau",
      "trangThai": "DangXuLy"
    }
  ],
  "total": 1
}
```

---

### 12.3 Lấy chi tiết tranh chấp

```http
GET /disputes/:id
```

**Response 200:**

```json
{
  "tranhChapId": 1,
  "congViec": {
    "congViecId": 1
  },
  "tieuDe": "Cong viec khong dap ung yeu cau",
  "moTa": "Freelancer khong thuc hien dung yeu cau",
  "trangThai": "DangXuLy",
  "baoGias": []
}
```

---

### 12.4 Cập nhật trạng thái tranh chấp

```http
PUT /disputes/:id/status
```

**Body:**

```json
{
  "trangThai": "DaKetLuan"
}
```

**Trạng thái hợp lệ:**

- `MoiMo` - Mới mở
- `DangXuLy` - Đang xử lý
- `DaKetLuan` - Đã kết luận
- `DaDong` - Đã đóng

**Response 200:**

```json
{
  "message": "Cap nhat trang thai thanh cong"
}
```

---

## 13. Bằng chứng

### 13.1 Tạo bằng chứng cho tranh chấp

```http
POST /evidences
```

**Body:**

```json
{
  "tranhChapId": 1,
  "loaiBangChung": "HinhAnh",
  "duongDan": "https://example.com/screenshot.jpg",
  "moTa": "Screenshot hien thi cong viec chua hoan thanh"
}
```

**Trường bắt buộc:**

- `tranhChapId` - ID tranh chấp
- `loaiBangChung` - Loại bằng chứng: `TinNhan` | `File` | `HinhAnh` | `GhiChu` | `KhacP`
- `duongDan` - Đường dẫn/URL bằng chứng

**Trường tùy chọn:**

- `moTa` - Mô tả bằng chứng

**Response 201:**

```json
{
  "message": "Tao bang chung thanh cong",
  "data": {
    "bangChungId": 1,
    "tranhChapId": 1,
    "loaiBangChung": "HinhAnh",
    "duongDan": "https://example.com/screenshot.jpg",
    "moTa": "Screenshot hien thi cong viec chua hoan thanh",
    "ngayTao": "2026-04-22T12:00:00.000Z"
  }
}
```

---

### 13.2 Lấy danh sách bằng chứng

```http
GET /evidences
```

**Query Parameters:**

- `tranhChapId` - Lọc theo ID tranh chấp
- `skip` - Bỏ qua số bản ghi
- `take` - Số lượng bản ghi

**Response 200:**

```json
{
  "data": [
    {
      "bangChungId": 1,
      "tranhChapId": 1,
      "loaiBangChung": "HinhAnh",
      "duongDan": "https://example.com/screenshot.jpg"
    }
  ],
  "total": 1
}
```

---

## 14. Thông báo

### 14.1 Lấy danh sách thông báo

```http
GET /notifications
```

**Query Parameters:**

- `skip` - Bỏ qua số bản ghi
- `take` - Số lượng bản ghi

**Response 200:**

```json
{
  "data": [
    {
      "thongBaoId": 1,
      "tieuDe": "Co bao gia moi cho yeu cau",
      "moTa": "Freelancer Tran Thi B da gui bao gia",
      "loai": "BaoGia",
      "daXem": false,
      "ngayTao": "2026-04-22T12:00:00.000Z"
    }
  ],
  "total": 1
}
```

---

### 14.2 Đánh dấu thông báo đã xem

```http
PUT /notifications/:id/read
```

**Response 200:**

```json
{
  "message": "Danh dau da xem thanh cong"
}
```

---

### 14.3 Xóa thông báo

```http
DELETE /notifications/:id
```

**Response 200:**

```json
{
  "message": "Xoa thong bao thanh cong"
}
```

---

## 15. Thanh toán

### 15.1 Tạo thanh toán

```http
POST /payments
```

**Body:**

```json
{
  "congViecId": 1,
  "soTien": 7000000,
  "loaiThanhToan": "DatCoc",
  "phuongThucThanhToan": "ChuyenKhoan",
  "moTa": "Dat coc 50% cong viec"
}
```

**Trường bắt buộc:**

- `congViecId` - ID công việc
- `soTien` - Số tiền thanh toán
- `loaiThanhToan` - Loại: `DatCoc` | `ThanhToanCuoi` | `HoanTien` | `PhiGiamSat` | `PhiHeThong`
- `phuongThucThanhToan` - Phương thức: `ChuyenKhoan` | `ThanhToanQuaMang` | `Vi` | `TienMat`

**Trường tùy chọn:**

- `moTa` - Mô tả

**Response 201:**

```json
{
  "message": "Tao thanh toan thanh cong",
  "data": {
    "thanhToanId": 1,
    "congViecId": 1,
    "soTien": 7000000,
    "loaiThanhToan": "DatCoc",
    "phuongThucThanhToan": "ChuyenKhoan",
    "trangThai": "ChoXuLy",
    "ngayTao": "2026-04-22T12:00:00.000Z"
  }
}
```

---

### 15.2 Lấy danh sách thanh toán

```http
GET /payments
```

**Query Parameters:**

- `congViecId` - Lọc theo ID công việc
- `skip` - Bỏ qua số bản ghi
- `take` - Số lượng bản ghi

**Response 200:**

```json
{
  "data": [
    {
      "thanhToanId": 1,
      "congViecId": 1,
      "soTien": 7000000,
      "loaiThanhToan": "DatCoc",
      "trangThai": "ThanhCong"
    }
  ],
  "total": 1
}
```

---

### 15.3 Cập nhật trạng thái thanh toán

```http
PUT /payments/:id/status
```

**Body:**

```json
{
  "trangThai": "ThanhCong"
}
```

**Trạng thái hợp lệ:**

- `ChoXuLy` - Chờ xử lý
- `ThanhCong` - Thành công
- `ThatBai` - Thất bại
- `DaHoan` - Đã hoàn

**Response 200:**

```json
{
  "message": "Cap nhat trang thai thanh cong"
}
```

---

## 16. Đánh giá

### 16.1 Tạo đánh giá

```http
POST /reviews
```

**Body:**

```json
{
  "congViecId": 1,
  "diem": 5,
  "binhLuan": "Thuc hien tot, chat luong cao, tui hoa luc",
  "loaiDanhGia": "NguoiThue_DanhGia_Freelancer"
}
```

**Trường bắt buộc:**

- `congViecId` - ID công việc
- `diem` - Điểm đánh giá (1-5)
- `loaiDanhGia` - Loại đánh giá

**Trường tùy chọn:**

- `binhLuan` - Bình luận

**Response 201:**

```json
{
  "message": "Tao danh gia thanh cong",
  "data": {
    "danhGiaId": 1,
    "congViecId": 1,
    "diem": 5,
    "binhLuan": "Thuc hien tot, chat luong cao",
    "loaiDanhGia": "NguoiThue_DanhGia_Freelancer",
    "ngayTao": "2026-04-22T12:00:00.000Z"
  }
}
```

---

### 16.2 Lấy danh sách đánh giá

```http
GET /reviews
```

**Query Parameters:**

- `congViecId` - Lọc theo ID công việc
- `skip` - Bỏ qua số bản ghi
- `take` - Số lượng bản ghi

**Response 200:**

```json
{
  "data": [
    {
      "danhGiaId": 1,
      "congViecId": 1,
      "diem": 5,
      "binhLuan": "Thuc hien tot, chat luong cao",
      "nguoiDanhGia": {
        "taiKhoanId": 1,
        "hoTen": "Nguyen Van A"
      }
    }
  ],
  "total": 1
}
```

---

## 17. Báo cáo

### 17.1 Tạo báo cáo

```http
POST /reports
```

**Body:**

```json
{
  "nguoiBiCaoId": 2,
  "tieuDe": "Freelancer lac tro trong lam viec",
  "moTa": "Freelancer pham quy dinh thuc hien cong viec an thoa",
  "loaiBaoCao": "VanPhaMuiCao"
}
```

**Trường bắt buộc:**

- `nguoiBiCaoId` - ID người bị báo cáo
- `tieuDe` - Tiêu đề báo cáo
- `moTa` - Mô tả chi tiết

**Response 201:**

```json
{
  "message": "Tao bao cao thanh cong",
  "data": {
    "baoCaoId": 1,
    "nguoiBiCaoId": 2,
    "tieuDe": "Freelancer lac tro trong lam viec",
    "moTa": "Freelancer pham quy dinh",
    "trangThai": "ChoXuLy",
    "ngayTao": "2026-04-22T12:00:00.000Z"
  }
}
```

---

### 17.2 Lấy danh sách báo cáo

```http
GET /reports
```

**Query Parameters:**

- `skip` - Bỏ qua số bản ghi
- `take` - Số lượng bản ghi
- `trangThai` - Lọc theo trạng thái

**Response 200:**

```json
{
  "data": [
    {
      "baoCaoId": 1,
      "tieuDe": "Freelancer lac tro trong lam viec",
      "trangThai": "ChoXuLy"
    }
  ],
  "total": 1
}
```

---

## 18. Admin

### 18.1 Cập nhật trạng thái tài khoản

```http
PUT /admin/users/:id/status
```

**Body:**

```json
{
  "trangThai": "HoatDong"
}
```

**Response 200:**

```json
{
  "message": "Cap nhat trang thai thanh cong"
}
```

---

### 18.2 Duyệt đơn vị giám sát

```http
PUT /admin/supervisors/:id/approve
```

**Response 200:**

```json
{
  "message": "Duyet don vi giam sat thanh cong",
  "trangThai": "HoatDong"
}
```

---

### 18.3 Xử lý báo cáo

```http
PUT /admin/reports/:id/status
```

**Body:**

```json
{
  "trangThai": "DaXuLy",
  "hanhDong": "CamHoatDong"
}
```

**Response 200:**

```json
{
  "message": "Cap nhat trang thai bao cao thanh cong"
}
```

---

## Lưu ý

- Tất cả các trường ngày tháng sử dụng định dạng ISO 8601: `YYYY-MM-DDTHH:mm:ss.fffZ`
- Tiền tệ sử dụng đồng Việt Nam (VND)
- Phần trăm được tính từ 0-100
- Điểm đánh giá từ 1-5 sao
- Xếp hạng (rating) từ 0-5 điểm
- Soft delete: các bản ghi bị xóa vẫn lưu trong cơ sở dữ liệu nhưng được đánh dấu là đã xóa
- Validation: GlobalValidationPipe tự động xóa các trường không được phép gửi lên

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
