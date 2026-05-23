# FRAS-TMDT Backend API Guide

> Complete API documentation for the Freelancer Marketplace (FRAS-TMDT) backend.
> Base URL: `http://localhost:8080`

---

## Table of Contents

1. [Health](#1-health)
2. [Auth](#2-auth)
3. [Users](#3-users)
4. [Categories](#4-categories)
5. [Skills](#5-skills)
6. [Jobs](#6-jobs)
7. [Proposals](#7-proposals)
8. [Freelancers](#8-freelancers)
9. [Contracts](#9-contracts)
10. [Supervisors](#10-supervisors)
11. [Progress](#11-progress)
12. [Chat](#12-chat)
13. [Payments](#13-payments)
14. [Disputes](#14-disputes)
15. [Evidences](#15-evidences)
16. [Reviews](#16-reviews)
17. [Notifications](#17-notifications)
18. [Reports](#18-reports)
19. [Admin](#19-admin)

---

## General Information

### Authentication
Most endpoints require a valid JWT token in the `Authorization` header:
```
Authorization: Bearer <token>
```

### Common Error Response Format
```json
{
  "statusCode": 400,
  "message": "Error description",
  "error": "Bad Request"
}
```

### Enum Values Reference

| Enum | Values |
|------|--------|
| VaiTroTaiKhoan | `KhachVangLai`, `NguoiThue`, `Freelancer`, `DonViGiamSat`, `Admin` |
| TrangThaiTaiKhoan | `HoatDong`, `Khoa`, `TamNgung` |
| GioiTinh | `Nam`, `Nu`, `Khac` |
| TrangThaiYeuCau | `MoiTao`, `DangNhan`, `HoanThanh`, `DaHuy` |
| TrangThaiBaoGia | `ChoXacNhan`, `DaChapNhan`, `DaTuChoi`, `DaHuy` |
| TrangThaiCongViec | `DangThucHien`, `HoanThanh`, `DaHuy`, `TamDung` |
| TrangThaiGiamSatCongViec | `ChuaYeuCau`, `ChoChapNhan`, `DaChapNhan`, `DaTuChoi` |
| TrangThaiDonViGiamSat | `ChoDuyet`, `DaDuyet`, `TuChoi`, `TamNgung` |
| TrangThaiXacNhanTienDo | `ChoXacNhan`, `DaXacNhan`, `TuChoi` |
| TrangThaiTranhChap | `DangMo`, `DangXuLy`, `DaDong` |
| KetQuaTranhChap | `HoanTien`, `KhongHoanTien`, `HoanMotPhan` |
| BenChiuPhiKetLuan | `NguoiThue`, `Freelancer`, `ChiaDeu` |
| LoaiThanhToan | `DatCoc`, `ThanhToan`, `HoanTien` |
| PhuongThucThanhToan | `ViDienTu`, `ChuyenKhoan`, `TheTinDung` |
| TrangThaiThanhToan | `ChoXuLy`, `ThanhCong`, `ThatBai`, `DaHoan` |
| LoaiTinNhan | `VanBan`, `HinhAnh`, `TepTin` |
| TrangThaiCuocHoiThoai | `DangMo`, `DaDong` |
| LoaiBangChung | `HinhAnh`, `Video`, `TaiLieu`, `VanBan` |
| LoaiDanhGia | `NguoiThue_DanhGia_Freelancer`, `Freelancer_DanhGia_NguoiThue` |
| LoaiThongBao | `HeThong`, `CongViec`, `ThanhToan`, `TranhChap` |
| TrangThaiBaoCao | `ChoXuLy`, `DaXuLy`, `TuChoi` |

---


## 1. Health

### GET /health

Check if the API server is running and healthy.

**Request:**
- No parameters required.

**Response 200:**
```json
{
  "status": "ok",
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

---

## 2. Auth

### POST /auth/register

Register a new user account.

**Request:**
- Body:
```json
{
  "tenDangNhap": "nguyenvana",
  "matKhau": "password123",
  "email": "nguyenvana@email.com",
  "hoTen": "Nguyen Van A",
  "soDienThoai": "0901234567",
  "gioiTinh": "Nam",
  "diaChi": "Ho Chi Minh City",
  "vaiTro": "Freelancer",
  "tenDonVi": "ABC Supervision Co."
}
```

> Note: `tenDonVi` is only required when `vaiTro` is `DonViGiamSat`.

**Response 201:**
```json
{
  "message": "Registration successful",
  "user": {
    "taiKhoanId": 1,
    "tenDangNhap": "nguyenvana",
    "email": "nguyenvana@email.com",
    "hoTen": "Nguyen Van A",
    "soDienThoai": "0901234567",
    "gioiTinh": "Nam",
    "diaChi": "Ho Chi Minh City",
    "vaiTro": "Freelancer",
    "trangThai": "HoatDong",
    "ngayTao": "2025-01-15T10:30:00.000Z"
  }
}
```

**Errors:**
- `400` - Missing required fields or invalid data
- `409` - Email or username already exists

---


### POST /auth/login

Authenticate a user and return user info.

**Request:**
- Body:
```json
{
  "email": "nguyenvana@email.com",
  "matKhau": "password123"
}
```

**Response 200:**
```json
{
  "message": "Login successful",
  "user": {
    "taiKhoanId": 1,
    "tenDangNhap": "nguyenvana",
    "email": "nguyenvana@email.com",
    "hoTen": "Nguyen Van A",
    "soDienThoai": "0901234567",
    "gioiTinh": "Nam",
    "diaChi": "Ho Chi Minh City",
    "vaiTro": "Freelancer",
    "trangThai": "HoatDong",
    "ngayTao": "2025-01-15T10:30:00.000Z"
  }
}
```

**Errors:**
- `400` - Missing email or password
- `401` - Invalid credentials
- `403` - Account is locked or suspended

---

## 3. Users

### GET /users

Get all users in the system.

**Request:**
- No parameters required.

**Response 200:**
```json
{
  "total": 2,
  "users": [
    {
      "taiKhoanId": 1,
      "tenDangNhap": "nguyenvana",
      "email": "nguyenvana@email.com",
      "hoTen": "Nguyen Van A",
      "soDienThoai": "0901234567",
      "gioiTinh": "Nam",
      "diaChi": "Ho Chi Minh City",
      "vaiTro": "Freelancer",
      "trangThai": "HoatDong",
      "ngayTao": "2025-01-15T10:30:00.000Z",
      "ngayCapNhat": "2025-01-15T10:30:00.000Z"
    }
  ]
}
```

---


### GET /users/search

Search users by keyword (matches name or email).

**Request:**
- Query params: `keyword` - search term (optional)

Example: `GET /users/search?keyword=nguyen`

**Response 200:**
```json
{
  "total": 1,
  "users": [
    {
      "taiKhoanId": 1,
      "tenDangNhap": "nguyenvana",
      "email": "nguyenvana@email.com",
      "hoTen": "Nguyen Van A",
      "soDienThoai": "0901234567",
      "gioiTinh": "Nam",
      "diaChi": "Ho Chi Minh City",
      "vaiTro": "Freelancer",
      "trangThai": "HoatDong",
      "ngayTao": "2025-01-15T10:30:00.000Z",
      "ngayCapNhat": "2025-01-15T10:30:00.000Z"
    }
  ]
}
```

---

### GET /users/:id

Get a single user by ID.

**Request:**
- Path params: `:id` - user account ID (integer)

**Response 200:**
```json
{
  "user": {
    "taiKhoanId": 1,
    "tenDangNhap": "nguyenvana",
    "email": "nguyenvana@email.com",
    "hoTen": "Nguyen Van A",
    "soDienThoai": "0901234567",
    "gioiTinh": "Nam",
    "diaChi": "Ho Chi Minh City",
    "vaiTro": "Freelancer",
    "trangThai": "HoatDong",
    "ngayTao": "2025-01-15T10:30:00.000Z",
    "ngayCapNhat": "2025-01-15T10:30:00.000Z"
  }
}
```

**Errors:**
- `404` - User not found

---


### GET /users/:id/profile

Get user profile with role-specific details (NguoiThue, Freelancer, or DonViGiamSat profile).

**Request:**
- Path params: `:id` - user account ID (integer)

**Response 200 (Freelancer example):**
```json
{
  "user": {
    "taiKhoanId": 1,
    "tenDangNhap": "nguyenvana",
    "email": "nguyenvana@email.com",
    "hoTen": "Nguyen Van A",
    "soDienThoai": "0901234567",
    "gioiTinh": "Nam",
    "diaChi": "Ho Chi Minh City",
    "vaiTro": "Freelancer",
    "trangThai": "HoatDong",
    "ngayTao": "2025-01-15T10:30:00.000Z",
    "ngayCapNhat": "2025-01-15T10:30:00.000Z"
  },
  "profile": {
    "role": "Freelancer",
    "freelancer": {
      "freelancerId": 1,
      "kinhNghiem": 3,
      "chuyenGia": "Web Development",
      "kyNang": "React, Node.js",
      "xepHang": "4.5",
      "soDu": "5000000",
      "xacThucEmail": true,
      "xacThucSDT": true,
      "tongCongViec": 10,
      "tyLeHoanThanh": "90.00"
    }
  }
}
```

**Response 200 (NguoiThue example):**
```json
{
  "user": { "...same as above..." },
  "profile": {
    "role": "NguoiThue",
    "nguoiThue": {
      "nguoiThueId": 1,
      "congTy": "ABC Corp",
      "moTa": "Looking for developers",
      "diemTinCay": "4.8",
      "tongYeuCau": 5,
      "tyLeHoanThanh": "80.00"
    }
  }
}
```

**Errors:**
- `404` - User not found

---


### GET /users/:id/jobs

Get all jobs posted by a user (NguoiThue).

**Request:**
- Path params: `:id` - user account ID (integer)

**Response 200:**
```json
{
  "total": 1,
  "jobs": [
    {
      "yeuCauId": 1,
      "nguoiThueId": 1,
      "loaiDichVuId": 2,
      "tieuDe": "Build a React website",
      "moTa": "Need a responsive website",
      "nganSachMin": "5000000",
      "nganSachMax": "10000000",
      "thoiHan": "2025-03-01T00:00:00.000Z",
      "trangThai": "MoiTao",
      "soLuongBaoGia": 3,
      "yeuCauGiamSat": false,
      "ngayTao": "2025-01-15T10:30:00.000Z",
      "ngayCapNhat": "2025-01-15T10:30:00.000Z",
      "nguoiThue": {
        "taiKhoanId": 1,
        "hoTen": "Nguyen Van A",
        "email": "nguyenvana@email.com"
      },
      "loaiDichVu": {
        "loaiDichVuId": 2,
        "tenLoai": "Web Development"
      },
      "kyNangs": [
        { "kyNangId": 1, "tenKyNang": "React" },
        { "kyNangId": 2, "tenKyNang": "Node.js" }
      ]
    }
  ]
}
```

**Errors:**
- `404` - User not found

---

### GET /users/:id/contracts

Get all contracts associated with a user.

**Request:**
- Path params: `:id` - user account ID (integer)

**Response 200:**
```json
{
  "total": 1,
  "contracts": [
    {
      "congViecId": 1,
      "yeuCauId": 1,
      "freelancerId": 2,
      "nguoiThueId": 1,
      "giaThoa": "8000000",
      "thoiGianThoa": 30,
      "trangThai": "DangThucHien",
      "ngayBatDau": "2025-01-20T00:00:00.000Z",
      "ngayKetThuc": null,
      "giamSatId": null,
      "trangThaiGiamSat": "ChuaYeuCau",
      "phiGiamSat": "0",
      "ngayTao": "2025-01-18T10:30:00.000Z",
      "yeuCau": {
        "yeuCauId": 1,
        "tieuDe": "Build a React website",
        "moTa": "Need a responsive website"
      },
      "freelancer": {
        "freelancerId": 2,
        "taiKhoanId": 3,
        "hoTen": "Tran Van B",
        "email": "tranvanb@email.com"
      },
      "nguoiThue": {
        "nguoiThueId": 1,
        "taiKhoanId": 1,
        "hoTen": "Nguyen Van A",
        "email": "nguyenvana@email.com"
      },
      "giamSat": null
    }
  ]
}
```

**Errors:**
- `404` - User not found

---

### GET /users/:id/conversations

Get all chat conversations for a user.

**Request:**
- Path params: `:id` - user account ID (integer)

**Response 200:**
```json
{
  "total": 1,
  "conversations": [
    {
      "cuocHoiThoaiId": 1,
      "congViecId": 1,
      "thanhVien1": {
        "taiKhoanId": 1,
        "hoTen": "Nguyen Van A",
        "email": "nguyenvana@email.com"
      },
      "thanhVien2": {
        "taiKhoanId": 3,
        "hoTen": "Tran Van B",
        "email": "tranvanb@email.com"
      },
      "giamSatId": null,
      "tinNhanCuoi": "Hello, I am interested in your project",
      "trangThai": "DangMo",
      "ngayTao": "2025-01-18T10:30:00.000Z"
    }
  ]
}
```

**Errors:**
- `404` - User not found

---


### PUT /users/:id

Update user information.

**Request:**
- Path params: `:id` - user account ID (integer)
- Body:
```json
{
  "hoTen": "Nguyen Van A Updated",
  "soDienThoai": "0909876543",
  "gioiTinh": "Nam",
  "diaChi": "Ha Noi",
  "trangThai": "HoatDong"
}
```

> All fields are optional. Only provided fields will be updated.

**Response 200:**
```json
{
  "message": "User updated successfully",
  "user": {
    "taiKhoanId": 1,
    "tenDangNhap": "nguyenvana",
    "email": "nguyenvana@email.com",
    "hoTen": "Nguyen Van A Updated",
    "soDienThoai": "0909876543",
    "gioiTinh": "Nam",
    "diaChi": "Ha Noi",
    "vaiTro": "Freelancer",
    "trangThai": "HoatDong",
    "ngayTao": "2025-01-15T10:30:00.000Z",
    "ngayCapNhat": "2025-01-16T08:00:00.000Z"
  }
}
```

**Errors:**
- `400` - Invalid data
- `404` - User not found

---

### DELETE /users/:id

Soft-delete (deactivate) a user account.

**Request:**
- Path params: `:id` - user account ID (integer)

**Response 200:**
```json
{
  "message": "User deleted successfully",
  "userId": 1,
  "trangThai": "Khoa"
}
```

**Errors:**
- `404` - User not found

---

## 4. Categories

### GET /categories

Get all service categories.

**Request:**
- No parameters required.

**Response 200:**
```json
{
  "total": 3,
  "categories": [
    {
      "loaiDichVuId": 1,
      "tenLoai": "Web Development",
      "moTa": "Website and web application development",
      "hinhAnh": "https://example.com/web-dev.png"
    }
  ]
}
```

---


### GET /categories/:id

Get a single category by ID.

**Request:**
- Path params: `:id` - category ID (integer)

**Response 200:**
```json
{
  "category": {
    "loaiDichVuId": 1,
    "tenLoai": "Web Development",
    "moTa": "Website and web application development",
    "hinhAnh": "https://example.com/web-dev.png"
  }
}
```

**Errors:**
- `404` - Category not found

---

### POST /categories

Create a new service category.

**Request:**
- Body:
```json
{
  "tenLoai": "Mobile Development",
  "moTa": "iOS and Android app development",
  "hinhAnh": "https://example.com/mobile-dev.png"
}
```

> `moTa` and `hinhAnh` are optional.

**Response 201:**
```json
{
  "message": "Category created successfully",
  "category": {
    "loaiDichVuId": 4,
    "tenLoai": "Mobile Development",
    "moTa": "iOS and Android app development",
    "hinhAnh": "https://example.com/mobile-dev.png"
  }
}
```

**Errors:**
- `400` - Missing required field `tenLoai`
- `409` - Category name already exists

---

### PUT /categories/:id

Update an existing category.

**Request:**
- Path params: `:id` - category ID (integer)
- Body:
```json
{
  "tenLoai": "Full-Stack Development",
  "moTa": "End-to-end web development",
  "hinhAnh": "https://example.com/fullstack.png"
}
```

> All fields are optional.

**Response 200:**
```json
{
  "message": "Category updated successfully",
  "category": {
    "loaiDichVuId": 1,
    "tenLoai": "Full-Stack Development",
    "moTa": "End-to-end web development",
    "hinhAnh": "https://example.com/fullstack.png"
  }
}
```

**Errors:**
- `400` - Invalid data
- `404` - Category not found

---


### DELETE /categories/:id

Delete a category.

**Request:**
- Path params: `:id` - category ID (integer)

**Response 200:**
```json
{
  "message": "Category deleted successfully",
  "categoryId": 1
}
```

**Errors:**
- `404` - Category not found
- `409` - Category is in use by existing jobs

---

## 5. Skills

### GET /skills

Get all skills.

**Request:**
- No parameters required.

**Response 200:**
```json
{
  "total": 5,
  "skills": [
    {
      "kyNangId": 1,
      "tenKyNang": "React",
      "moTa": "React.js frontend framework"
    },
    {
      "kyNangId": 2,
      "tenKyNang": "Node.js",
      "moTa": "Server-side JavaScript runtime"
    }
  ]
}
```

---

### GET /skills/:id

Get a single skill by ID.

**Request:**
- Path params: `:id` - skill ID (integer)

**Response 200:**
```json
{
  "skill": {
    "kyNangId": 1,
    "tenKyNang": "React",
    "moTa": "React.js frontend framework"
  }
}
```

**Errors:**
- `404` - Skill not found

---

### POST /skills

Create a new skill.

**Request:**
- Body:
```json
{
  "tenKyNang": "TypeScript",
  "moTa": "Typed superset of JavaScript"
}
```

> `moTa` is optional.

**Response 201:**
```json
{
  "message": "Skill created successfully",
  "skill": {
    "kyNangId": 6,
    "tenKyNang": "TypeScript",
    "moTa": "Typed superset of JavaScript"
  }
}
```

**Errors:**
- `400` - Missing required field `tenKyNang`
- `409` - Skill name already exists

---


### PUT /skills/:id

Update an existing skill.

**Request:**
- Path params: `:id` - skill ID (integer)
- Body:
```json
{
  "tenKyNang": "React.js",
  "moTa": "A JavaScript library for building user interfaces"
}
```

> All fields are optional.

**Response 200:**
```json
{
  "message": "Skill updated successfully",
  "skill": {
    "kyNangId": 1,
    "tenKyNang": "React.js",
    "moTa": "A JavaScript library for building user interfaces"
  }
}
```

**Errors:**
- `400` - Invalid data
- `404` - Skill not found

---

### DELETE /skills/:id

Delete a skill.

**Request:**
- Path params: `:id` - skill ID (integer)

**Response 200:**
```json
{
  "message": "Skill deleted successfully",
  "kyNangId": 1
}
```

**Errors:**
- `404` - Skill not found

---

## 6. Jobs

### GET /jobs

Get all job postings.

**Request:**
- No parameters required.

**Response 200:**
```json
{
  "total": 2,
  "jobs": [
    {
      "yeuCauId": 1,
      "nguoiThueId": 1,
      "loaiDichVuId": 2,
      "tieuDe": "Build a React website",
      "moTa": "Need a responsive website with modern UI",
      "nganSachMin": "5000000",
      "nganSachMax": "10000000",
      "thoiHan": "2025-03-01T00:00:00.000Z",
      "trangThai": "MoiTao",
      "soLuongBaoGia": 3,
      "yeuCauGiamSat": false,
      "ngayTao": "2025-01-15T10:30:00.000Z",
      "ngayCapNhat": "2025-01-15T10:30:00.000Z",
      "nguoiThue": {
        "taiKhoanId": 1,
        "hoTen": "Nguyen Van A",
        "email": "nguyenvana@email.com"
      },
      "loaiDichVu": {
        "loaiDichVuId": 2,
        "tenLoai": "Web Development"
      },
      "kyNangs": [
        { "kyNangId": 1, "tenKyNang": "React" },
        { "kyNangId": 2, "tenKyNang": "Node.js" }
      ]
    }
  ]
}
```

---


### GET /jobs/search

Search jobs by keyword, category, budget, and skills.

**Request:**
- Query params:
  - `keyword` - search in title/description (optional)
  - `category` - category ID (optional)
  - `budget` - budget range filter (optional)
  - `skills` - comma-separated skill IDs, e.g. "1,2,3" (optional)

Example: `GET /jobs/search?keyword=react&category=2&skills=1,2`

**Response 200:**
```json
{
  "total": 1,
  "jobs": [
    {
      "yeuCauId": 1,
      "nguoiThueId": 1,
      "loaiDichVuId": 2,
      "tieuDe": "Build a React website",
      "moTa": "Need a responsive website with modern UI",
      "nganSachMin": "5000000",
      "nganSachMax": "10000000",
      "thoiHan": "2025-03-01T00:00:00.000Z",
      "trangThai": "MoiTao",
      "soLuongBaoGia": 3,
      "yeuCauGiamSat": false,
      "ngayTao": "2025-01-15T10:30:00.000Z",
      "ngayCapNhat": "2025-01-15T10:30:00.000Z",
      "nguoiThue": {
        "taiKhoanId": 1,
        "hoTen": "Nguyen Van A",
        "email": "nguyenvana@email.com"
      },
      "loaiDichVu": {
        "loaiDichVuId": 2,
        "tenLoai": "Web Development"
      },
      "kyNangs": [
        { "kyNangId": 1, "tenKyNang": "React" }
      ]
    }
  ]
}
```

---

### GET /jobs/:id

Get a single job by ID.

**Request:**
- Path params: `:id` - job ID (integer)

**Response 200:**
```json
{
  "job": {
    "yeuCauId": 1,
    "nguoiThueId": 1,
    "loaiDichVuId": 2,
    "tieuDe": "Build a React website",
    "moTa": "Need a responsive website with modern UI",
    "nganSachMin": "5000000",
    "nganSachMax": "10000000",
    "thoiHan": "2025-03-01T00:00:00.000Z",
    "trangThai": "MoiTao",
    "soLuongBaoGia": 3,
    "yeuCauGiamSat": false,
    "ngayTao": "2025-01-15T10:30:00.000Z",
    "ngayCapNhat": "2025-01-15T10:30:00.000Z",
    "nguoiThue": {
      "taiKhoanId": 1,
      "hoTen": "Nguyen Van A",
      "email": "nguyenvana@email.com"
    },
    "loaiDichVu": {
      "loaiDichVuId": 2,
      "tenLoai": "Web Development"
    },
    "kyNangs": [
      { "kyNangId": 1, "tenKyNang": "React" }
    ]
  }
}
```

**Errors:**
- `404` - Job not found

---


### GET /jobs/:id/proposals

Get all proposals submitted for a specific job.

**Request:**
- Path params: `:id` - job ID (integer)

**Response 200:**
```json
{
  "total": 2,
  "proposals": [
    {
      "baoGiaId": 1,
      "yeuCauId": 1,
      "freelancerId": 2,
      "giaDeXuat": "7000000",
      "thoiGianThucHien": 25,
      "noiDung": "I can build this with React and Next.js",
      "trangThai": "ChoXacNhan",
      "ngayTao": "2025-01-16T08:00:00.000Z",
      "ngayCapNhat": "2025-01-16T08:00:00.000Z",
      "freelancer": {
        "freelancerId": 2,
        "taiKhoanId": 3,
        "hoTen": "Tran Van B",
        "email": "tranvanb@email.com",
        "kinhNghiem": 5,
        "kyNang": "React, Node.js",
        "kyNangs": [
          { "kyNangId": 1, "tenKyNang": "React" }
        ],
        "xepHang": "4.5"
      },
      "yeuCau": {
        "yeuCauId": 1,
        "tieuDe": "Build a React website",
        "nguoiThueId": 1
      }
    }
  ]
}
```

**Errors:**
- `404` - Job not found

---

### GET /jobs/:id/skills

Get skills required for a specific job.

**Request:**
- Path params: `:id` - job ID (integer)

**Response 200:**
```json
{
  "message": "Job skills retrieved successfully",
  "kyNangs": [
    { "kyNangId": 1, "tenKyNang": "React" },
    { "kyNangId": 2, "tenKyNang": "Node.js" }
  ]
}
```

**Errors:**
- `404` - Job not found

---


### POST /jobs

Create a new job posting.

**Request:**
- Body:
```json
{
  "nguoiThueId": 1,
  "loaiDichVuId": 2,
  "tieuDe": "Build a React website",
  "moTa": "Need a responsive website with modern UI",
  "nganSachMin": 5000000,
  "nganSachMax": 10000000,
  "thoiHan": "2025-03-01T00:00:00.000Z",
  "yeuCauGiamSat": false,
  "kyNangIds": [1, 2, 3]
}
```

> `yeuCauGiamSat` defaults to `false`. `kyNangIds` is optional.

**Response 201:**
```json
{
  "message": "Job created successfully",
  "job": {
    "yeuCauId": 5,
    "nguoiThueId": 1,
    "loaiDichVuId": 2,
    "tieuDe": "Build a React website",
    "moTa": "Need a responsive website with modern UI",
    "nganSachMin": "5000000",
    "nganSachMax": "10000000",
    "thoiHan": "2025-03-01T00:00:00.000Z",
    "trangThai": "MoiTao",
    "soLuongBaoGia": 0,
    "yeuCauGiamSat": false,
    "ngayTao": "2025-01-15T10:30:00.000Z",
    "ngayCapNhat": "2025-01-15T10:30:00.000Z",
    "nguoiThue": {
      "taiKhoanId": 1,
      "hoTen": "Nguyen Van A",
      "email": "nguyenvana@email.com"
    },
    "loaiDichVu": {
      "loaiDichVuId": 2,
      "tenLoai": "Web Development"
    },
    "kyNangs": [
      { "kyNangId": 1, "tenKyNang": "React" },
      { "kyNangId": 2, "tenKyNang": "Node.js" }
    ]
  }
}
```

**Errors:**
- `400` - Missing required fields
- `404` - NguoiThue or category not found

---


### PUT /jobs/:id

Update an existing job.

**Request:**
- Path params: `:id` - job ID (integer)
- Body:
```json
{
  "tieuDe": "Build a React + Next.js website",
  "moTa": "Updated description",
  "nganSachMin": 6000000,
  "nganSachMax": 12000000,
  "thoiHan": "2025-04-01T00:00:00.000Z",
  "trangThai": "DangNhan",
  "yeuCauGiamSat": true
}
```

> All fields are optional.

**Response 200:**
```json
{
  "message": "Job updated successfully",
  "job": {
    "yeuCauId": 1,
    "nguoiThueId": 1,
    "loaiDichVuId": 2,
    "tieuDe": "Build a React + Next.js website",
    "moTa": "Updated description",
    "nganSachMin": "6000000",
    "nganSachMax": "12000000",
    "thoiHan": "2025-04-01T00:00:00.000Z",
    "trangThai": "DangNhan",
    "soLuongBaoGia": 3,
    "yeuCauGiamSat": true,
    "ngayTao": "2025-01-15T10:30:00.000Z",
    "ngayCapNhat": "2025-01-16T08:00:00.000Z",
    "nguoiThue": {
      "taiKhoanId": 1,
      "hoTen": "Nguyen Van A",
      "email": "nguyenvana@email.com"
    },
    "loaiDichVu": {
      "loaiDichVuId": 2,
      "tenLoai": "Web Development"
    },
    "kyNangs": [
      { "kyNangId": 1, "tenKyNang": "React" }
    ]
  }
}
```

**Errors:**
- `400` - Invalid data
- `404` - Job not found

---

### PUT /jobs/:id/skills

Replace all skills for a job (set operation).

**Request:**
- Path params: `:id` - job ID (integer)
- Body:
```json
{
  "kyNangIds": [1, 3, 5]
}
```

**Response 200:**
```json
{
  "message": "Job skills updated successfully",
  "kyNangs": [
    { "kyNangId": 1, "tenKyNang": "React" },
    { "kyNangId": 3, "tenKyNang": "TypeScript" },
    { "kyNangId": 5, "tenKyNang": "PostgreSQL" }
  ]
}
```

**Errors:**
- `404` - Job not found

---


### POST /jobs/:id/skills/:kyNangId

Add a single skill to a job.

**Request:**
- Path params:
  - `:id` - job ID (integer)
  - `:kyNangId` - skill ID to add (integer)

**Response 200:**
```json
{
  "message": "Skill added to job successfully",
  "kyNangs": [
    { "kyNangId": 1, "tenKyNang": "React" },
    { "kyNangId": 2, "tenKyNang": "Node.js" },
    { "kyNangId": 3, "tenKyNang": "TypeScript" }
  ]
}
```

**Errors:**
- `404` - Job or skill not found
- `409` - Skill already assigned to this job

---

### DELETE /jobs/:id/skills/:kyNangId

Remove a single skill from a job.

**Request:**
- Path params:
  - `:id` - job ID (integer)
  - `:kyNangId` - skill ID to remove (integer)

**Response 200:**
```json
{
  "message": "Skill removed from job successfully",
  "kyNangs": [
    { "kyNangId": 1, "tenKyNang": "React" },
    { "kyNangId": 2, "tenKyNang": "Node.js" }
  ]
}
```

**Errors:**
- `404` - Job or skill not found

---

### DELETE /jobs/:id

Delete a job posting.

**Request:**
- Path params: `:id` - job ID (integer)

**Response 200:**
```json
{
  "message": "Job deleted successfully",
  "jobId": 1
}
```

**Errors:**
- `404` - Job not found
- `409` - Cannot delete job with active contracts

---

## 7. Proposals

### GET /proposals/:id

Get a single proposal by ID.

**Request:**
- Path params: `:id` - proposal ID (integer)

**Response 200:**
```json
{
  "proposal": {
    "baoGiaId": 1,
    "yeuCauId": 1,
    "freelancerId": 2,
    "giaDeXuat": "7000000",
    "thoiGianThucHien": 25,
    "noiDung": "I can build this with React and Next.js",
    "trangThai": "ChoXacNhan",
    "ngayTao": "2025-01-16T08:00:00.000Z",
    "ngayCapNhat": "2025-01-16T08:00:00.000Z",
    "freelancer": {
      "freelancerId": 2,
      "taiKhoanId": 3,
      "hoTen": "Tran Van B",
      "email": "tranvanb@email.com",
      "kinhNghiem": 5,
      "kyNang": "React, Node.js",
      "kyNangs": [
        { "kyNangId": 1, "tenKyNang": "React" }
      ],
      "xepHang": "4.5"
    },
    "yeuCau": {
      "yeuCauId": 1,
      "tieuDe": "Build a React website",
      "nguoiThueId": 1
    }
  }
}
```

**Errors:**
- `404` - Proposal not found

---


### POST /proposals

Create a new proposal (freelancer submits a bid for a job).

**Request:**
- Body:
```json
{
  "yeuCauId": 1,
  "freelancerId": 2,
  "giaDeXuat": 7000000,
  "thoiGianThucHien": 25,
  "noiDung": "I can build this with React and Next.js"
}
```

> `noiDung` is optional.

**Response 201:**
```json
{
  "message": "Proposal created successfully",
  "proposal": {
    "baoGiaId": 5,
    "yeuCauId": 1,
    "freelancerId": 2,
    "giaDeXuat": "7000000",
    "thoiGianThucHien": 25,
    "noiDung": "I can build this with React and Next.js",
    "trangThai": "ChoXacNhan",
    "ngayTao": "2025-01-16T08:00:00.000Z",
    "ngayCapNhat": "2025-01-16T08:00:00.000Z",
    "freelancer": {
      "freelancerId": 2,
      "taiKhoanId": 3,
      "hoTen": "Tran Van B",
      "email": "tranvanb@email.com",
      "kinhNghiem": 5,
      "kyNang": "React, Node.js",
      "kyNangs": [],
      "xepHang": "4.5"
    },
    "yeuCau": {
      "yeuCauId": 1,
      "tieuDe": "Build a React website",
      "nguoiThueId": 1
    }
  }
}
```

**Errors:**
- `400` - Missing required fields
- `404` - Job or freelancer not found
- `409` - Freelancer already submitted a proposal for this job

---

### PUT /proposals/:id

Update an existing proposal.

**Request:**
- Path params: `:id` - proposal ID (integer)
- Body:
```json
{
  "giaDeXuat": 6500000,
  "thoiGianThucHien": 20,
  "noiDung": "Updated proposal content",
  "trangThai": "DaChapNhan"
}
```

> All fields are optional.

**Response 200:**
```json
{
  "message": "Proposal updated successfully",
  "proposal": {
    "baoGiaId": 1,
    "yeuCauId": 1,
    "freelancerId": 2,
    "giaDeXuat": "6500000",
    "thoiGianThucHien": 20,
    "noiDung": "Updated proposal content",
    "trangThai": "DaChapNhan",
    "ngayTao": "2025-01-16T08:00:00.000Z",
    "ngayCapNhat": "2025-01-17T09:00:00.000Z",
    "freelancer": {
      "freelancerId": 2,
      "taiKhoanId": 3,
      "hoTen": "Tran Van B",
      "email": "tranvanb@email.com",
      "kinhNghiem": 5,
      "kyNang": "React, Node.js",
      "kyNangs": [],
      "xepHang": "4.5"
    },
    "yeuCau": {
      "yeuCauId": 1,
      "tieuDe": "Build a React website",
      "nguoiThueId": 1
    }
  }
}
```

**Errors:**
- `400` - Invalid data
- `404` - Proposal not found

---


### DELETE /proposals/:id

Delete a proposal.

**Request:**
- Path params: `:id` - proposal ID (integer)

**Response 200:**
```json
{
  "message": "Proposal deleted successfully",
  "proposalId": 1
}
```

**Errors:**
- `404` - Proposal not found

---

## 8. Freelancers

### GET /freelancers/:id/proposals

Get all proposals submitted by a freelancer.

**Request:**
- Path params: `:id` - freelancer ID (integer)

**Response 200:**
```json
{
  "total": 2,
  "proposals": [
    {
      "baoGiaId": 1,
      "yeuCauId": 1,
      "freelancerId": 2,
      "giaDeXuat": "7000000",
      "thoiGianThucHien": 25,
      "noiDung": "I can build this with React and Next.js",
      "trangThai": "ChoXacNhan",
      "ngayTao": "2025-01-16T08:00:00.000Z",
      "ngayCapNhat": "2025-01-16T08:00:00.000Z",
      "freelancer": {
        "freelancerId": 2,
        "taiKhoanId": 3,
        "hoTen": "Tran Van B",
        "email": "tranvanb@email.com",
        "kinhNghiem": 5,
        "kyNang": "React, Node.js",
        "kyNangs": [],
        "xepHang": "4.5"
      },
      "yeuCau": {
        "yeuCauId": 1,
        "tieuDe": "Build a React website",
        "nguoiThueId": 1
      }
    }
  ]
}
```

**Errors:**
- `404` - Freelancer not found

---

### GET /freelancers/:id/skills

Get all skills of a freelancer.

**Request:**
- Path params: `:id` - freelancer ID (integer)

**Response 200:**
```json
{
  "message": "Freelancer skills retrieved successfully",
  "freelancerId": 2,
  "kyNangs": [
    { "kyNangId": 1, "tenKyNang": "React" },
    { "kyNangId": 2, "tenKyNang": "Node.js" }
  ]
}
```

**Errors:**
- `404` - Freelancer not found

---


### PUT /freelancers/:id/skills

Replace all skills for a freelancer (set operation).

**Request:**
- Path params: `:id` - freelancer ID (integer)
- Body:
```json
{
  "kyNangIds": [1, 2, 5]
}
```

**Response 200:**
```json
{
  "message": "Freelancer skills updated successfully",
  "freelancerId": 2,
  "kyNangs": [
    { "kyNangId": 1, "tenKyNang": "React" },
    { "kyNangId": 2, "tenKyNang": "Node.js" },
    { "kyNangId": 5, "tenKyNang": "PostgreSQL" }
  ]
}
```

**Errors:**
- `404` - Freelancer not found

---

### POST /freelancers/:id/skills/:kyNangId

Add a single skill to a freelancer.

**Request:**
- Path params:
  - `:id` - freelancer ID (integer)
  - `:kyNangId` - skill ID to add (integer)

**Response 200:**
```json
{
  "message": "Skill added to freelancer successfully",
  "freelancerId": 2,
  "kyNangs": [
    { "kyNangId": 1, "tenKyNang": "React" },
    { "kyNangId": 2, "tenKyNang": "Node.js" },
    { "kyNangId": 3, "tenKyNang": "TypeScript" }
  ]
}
```

**Errors:**
- `404` - Freelancer or skill not found
- `409` - Skill already assigned to this freelancer

---

### DELETE /freelancers/:id/skills/:kyNangId

Remove a single skill from a freelancer.

**Request:**
- Path params:
  - `:id` - freelancer ID (integer)
  - `:kyNangId` - skill ID to remove (integer)

**Response 200:**
```json
{
  "message": "Skill removed from freelancer successfully",
  "freelancerId": 2,
  "kyNangs": [
    { "kyNangId": 1, "tenKyNang": "React" },
    { "kyNangId": 2, "tenKyNang": "Node.js" }
  ]
}
```

**Errors:**
- `404` - Freelancer or skill not found

---

## 9. Contracts

### GET /contracts

Get all contracts.

**Request:**
- No parameters required.

**Response 200:**
```json
{
  "total": 1,
  "contracts": [
    {
      "congViecId": 1,
      "yeuCauId": 1,
      "freelancerId": 2,
      "nguoiThueId": 1,
      "giaThoa": "8000000",
      "thoiGianThoa": 30,
      "trangThai": "DangThucHien",
      "ngayBatDau": "2025-01-20T00:00:00.000Z",
      "ngayKetThuc": null,
      "giamSatId": null,
      "trangThaiGiamSat": "ChuaYeuCau",
      "phiGiamSat": "0",
      "ngayTao": "2025-01-18T10:30:00.000Z",
      "yeuCau": {
        "yeuCauId": 1,
        "tieuDe": "Build a React website",
        "moTa": "Need a responsive website"
      },
      "freelancer": {
        "freelancerId": 2,
        "taiKhoanId": 3,
        "hoTen": "Tran Van B",
        "email": "tranvanb@email.com"
      },
      "nguoiThue": {
        "nguoiThueId": 1,
        "taiKhoanId": 1,
        "hoTen": "Nguyen Van A",
        "email": "nguyenvana@email.com"
      },
      "giamSat": null
    }
  ]
}
```

---

### GET /contracts/:id

Get a single contract by ID.

**Request:**
- Path params: `:id` - contract ID (integer)

**Response 200:**
```json
{
  "contract": {
    "congViecId": 1,
    "yeuCauId": 1,
    "freelancerId": 2,
    "nguoiThueId": 1,
    "giaThoa": "8000000",
    "thoiGianThoa": 30,
    "trangThai": "DangThucHien",
    "ngayBatDau": "2025-01-20T00:00:00.000Z",
    "ngayKetThuc": null,
    "giamSatId": null,
    "trangThaiGiamSat": "ChuaYeuCau",
    "phiGiamSat": "0",
    "ngayTao": "2025-01-18T10:30:00.000Z",
    "yeuCau": {
      "yeuCauId": 1,
      "tieuDe": "Build a React website",
      "moTa": "Need a responsive website"
    },
    "freelancer": {
      "freelancerId": 2,
      "taiKhoanId": 3,
      "hoTen": "Tran Van B",
      "email": "tranvanb@email.com"
    },
    "nguoiThue": {
      "nguoiThueId": 1,
      "taiKhoanId": 1,
      "hoTen": "Nguyen Van A",
      "email": "nguyenvana@email.com"
    },
    "giamSat": null
  }
}
```

**Errors:**
- `404` - Contract not found

---


### GET /contracts/:id/detail

Get detailed contract information (same as GET /contracts/:id but may include additional computed fields).

**Request:**
- Path params: `:id` - contract ID (integer)

**Response 200:**
```json
{
  "contract": {
    "congViecId": 1,
    "yeuCauId": 1,
    "freelancerId": 2,
    "nguoiThueId": 1,
    "giaThoa": "8000000",
    "thoiGianThoa": 30,
    "trangThai": "DangThucHien",
    "ngayBatDau": "2025-01-20T00:00:00.000Z",
    "ngayKetThuc": null,
    "giamSatId": null,
    "trangThaiGiamSat": "ChuaYeuCau",
    "phiGiamSat": "0",
    "ngayTao": "2025-01-18T10:30:00.000Z",
    "yeuCau": {
      "yeuCauId": 1,
      "tieuDe": "Build a React website",
      "moTa": "Need a responsive website"
    },
    "freelancer": {
      "freelancerId": 2,
      "taiKhoanId": 3,
      "hoTen": "Tran Van B",
      "email": "tranvanb@email.com"
    },
    "nguoiThue": {
      "nguoiThueId": 1,
      "taiKhoanId": 1,
      "hoTen": "Nguyen Van A",
      "email": "nguyenvana@email.com"
    },
    "giamSat": null
  }
}
```

**Errors:**
- `404` - Contract not found

---

### GET /contracts/:id/progress

Get all progress reports for a contract.

**Request:**
- Path params: `:id` - contract ID (integer)

**Response 200:**
```json
{
  "total": 2,
  "progress": [
    {
      "tienDoId": 1,
      "congViecId": 1,
      "freelancerId": 2,
      "tieuDe": "Completed homepage design",
      "moTa": "Finished the homepage layout and responsive design",
      "phanTram": 30,
      "tepDinhKem": "https://example.com/files/design.pdf",
      "xacNhanBoi": null,
      "trangThaiXacNhan": "ChoXacNhan",
      "ngayTao": "2025-01-25T10:00:00.000Z",
      "congViec": {
        "congViecId": 1,
        "yeuCauId": 1,
        "giaThoa": "8000000"
      },
      "freelancer": {
        "freelancerId": 2,
        "taiKhoanId": 3,
        "hoTen": "Tran Van B",
        "email": "tranvanb@email.com"
      },
      "donViGiamSat": null
    }
  ]
}
```

**Errors:**
- `404` - Contract not found

---


### GET /contracts/:id/conversations

Get all chat conversations for a contract.

**Request:**
- Path params: `:id` - contract ID (integer)

**Response 200:**
```json
{
  "total": 1,
  "conversations": [
    {
      "cuocHoiThoaiId": 1,
      "congViecId": 1,
      "thanhVien1": {
        "taiKhoanId": 1,
        "hoTen": "Nguyen Van A",
        "email": "nguyenvana@email.com"
      },
      "thanhVien2": {
        "taiKhoanId": 3,
        "hoTen": "Tran Van B",
        "email": "tranvanb@email.com"
      },
      "giamSatId": null,
      "tinNhanCuoi": "Let me know when you finish the homepage",
      "trangThai": "DangMo",
      "ngayTao": "2025-01-20T10:30:00.000Z"
    }
  ]
}
```

**Errors:**
- `404` - Contract not found

---

### POST /contracts

Create a new contract (after accepting a proposal).

**Request:**
- Body:
```json
{
  "yeuCauId": 1,
  "freelancerId": 2,
  "nguoiThueId": 1,
  "giaThoa": 8000000,
  "thoiGianThoa": 30
}
```

**Response 201:**
```json
{
  "message": "Contract created successfully",
  "contract": {
    "congViecId": 3,
    "yeuCauId": 1,
    "freelancerId": 2,
    "nguoiThueId": 1,
    "giaThoa": "8000000",
    "thoiGianThoa": 30,
    "trangThai": "DangThucHien",
    "ngayBatDau": "2025-01-20T00:00:00.000Z",
    "ngayKetThuc": null,
    "giamSatId": null,
    "trangThaiGiamSat": "ChuaYeuCau",
    "phiGiamSat": "0",
    "ngayTao": "2025-01-20T10:30:00.000Z",
    "yeuCau": {
      "yeuCauId": 1,
      "tieuDe": "Build a React website",
      "moTa": "Need a responsive website"
    },
    "freelancer": {
      "freelancerId": 2,
      "taiKhoanId": 3,
      "hoTen": "Tran Van B",
      "email": "tranvanb@email.com"
    },
    "nguoiThue": {
      "nguoiThueId": 1,
      "taiKhoanId": 1,
      "hoTen": "Nguyen Van A",
      "email": "nguyenvana@email.com"
    },
    "giamSat": null
  }
}
```

**Errors:**
- `400` - Missing required fields
- `404` - Job, freelancer, or employer not found

---


### PUT /contracts/:id/status

Update contract status.

**Request:**
- Path params: `:id` - contract ID (integer)
- Body:
```json
{
  "trangThai": "HoanThanh"
}
```

> Valid values: `DangThucHien`, `HoanThanh`, `DaHuy`, `TamDung`

**Response 200:**
```json
{
  "message": "Contract status updated successfully",
  "contract": {
    "congViecId": 1,
    "yeuCauId": 1,
    "freelancerId": 2,
    "nguoiThueId": 1,
    "giaThoa": "8000000",
    "thoiGianThoa": 30,
    "trangThai": "HoanThanh",
    "ngayBatDau": "2025-01-20T00:00:00.000Z",
    "ngayKetThuc": "2025-02-15T00:00:00.000Z",
    "giamSatId": null,
    "trangThaiGiamSat": "ChuaYeuCau",
    "phiGiamSat": "0",
    "ngayTao": "2025-01-18T10:30:00.000Z",
    "yeuCau": {
      "yeuCauId": 1,
      "tieuDe": "Build a React website",
      "moTa": "Need a responsive website"
    },
    "freelancer": {
      "freelancerId": 2,
      "taiKhoanId": 3,
      "hoTen": "Tran Van B",
      "email": "tranvanb@email.com"
    },
    "nguoiThue": {
      "nguoiThueId": 1,
      "taiKhoanId": 1,
      "hoTen": "Nguyen Van A",
      "email": "nguyenvana@email.com"
    },
    "giamSat": null
  }
}
```

**Errors:**
- `400` - Invalid status value
- `404` - Contract not found

---

### POST /contracts/:id/supervisor

Select a supervisor for a contract.

**Request:**
- Path params: `:id` - contract ID (integer)
- Body:
```json
{
  "giamSatId": 1,
  "phiGiamSat": 500000
}
```

**Response 200:**
```json
{
  "message": "Supervisor request sent successfully",
  "yeuCauGiamSatId": 1,
  "trangThai": "ChoChapNhan"
}
```

**Errors:**
- `400` - Invalid data
- `404` - Contract or supervisor not found
- `409` - Contract already has a supervisor

---


### PUT /contracts/:id/supervisor/accept

Supervisor accepts the supervision request for a contract.

**Request:**
- Path params: `:id` - contract ID (integer)

**Response 200:**
```json
{
  "message": "Supervisor accepted successfully",
  "yeuCauGiamSatId": 1,
  "trangThai": "DaChapNhan"
}
```

**Errors:**
- `404` - Contract not found or no pending supervisor request
- `409` - Request already processed

---

### PUT /contracts/:id/supervisor/reject

Supervisor rejects the supervision request for a contract.

**Request:**
- Path params: `:id` - contract ID (integer)

**Response 200:**
```json
{
  "message": "Supervisor rejected successfully",
  "yeuCauGiamSatId": 1,
  "trangThai": "DaTuChoi"
}
```

**Errors:**
- `404` - Contract not found or no pending supervisor request
- `409` - Request already processed

---

## 10. Supervisors

### GET /supervisors

Get all supervisors.

**Request:**
- No parameters required.

**Response 200:**
```json
{
  "total": 2,
  "supervisors": [
    {
      "giamSatId": 1,
      "taiKhoanId": 5,
      "tenDonVi": "Quality Assurance Corp",
      "moTa": "Professional project supervision",
      "nangLuc": "IT project management",
      "chungChi": "PMP, ISO 9001",
      "phiGiamSat": "500000",
      "xepHang": "4.8",
      "tongCongViecGS": 15,
      "trangThai": "DaDuyet",
      "ngayDangKy": "2025-01-01T00:00:00.000Z",
      "taiKhoan": {
        "taiKhoanId": 5,
        "hoTen": "Le Van C",
        "email": "levanc@email.com",
        "soDienThoai": "0912345678"
      }
    }
  ]
}
```

---


### GET /supervisors/search

Search supervisors by keyword.

**Request:**
- Query params: `keyword` - search term (optional)

Example: `GET /supervisors/search?keyword=quality`

**Response 200:**
```json
{
  "total": 1,
  "supervisors": [
    {
      "giamSatId": 1,
      "taiKhoanId": 5,
      "tenDonVi": "Quality Assurance Corp",
      "moTa": "Professional project supervision",
      "nangLuc": "IT project management",
      "chungChi": "PMP, ISO 9001",
      "phiGiamSat": "500000",
      "xepHang": "4.8",
      "tongCongViecGS": 15,
      "trangThai": "DaDuyet",
      "ngayDangKy": "2025-01-01T00:00:00.000Z",
      "taiKhoan": {
        "taiKhoanId": 5,
        "hoTen": "Le Van C",
        "email": "levanc@email.com",
        "soDienThoai": "0912345678"
      }
    }
  ]
}
```

---

### GET /supervisors/:id

Get a single supervisor by ID.

**Request:**
- Path params: `:id` - supervisor ID (integer)

**Response 200:**
```json
{
  "supervisor": {
    "giamSatId": 1,
    "taiKhoanId": 5,
    "tenDonVi": "Quality Assurance Corp",
    "moTa": "Professional project supervision",
    "nangLuc": "IT project management",
    "chungChi": "PMP, ISO 9001",
    "phiGiamSat": "500000",
    "xepHang": "4.8",
    "tongCongViecGS": 15,
    "trangThai": "DaDuyet",
    "ngayDangKy": "2025-01-01T00:00:00.000Z",
    "taiKhoan": {
      "taiKhoanId": 5,
      "hoTen": "Le Van C",
      "email": "levanc@email.com",
      "soDienThoai": "0912345678"
    }
  }
}
```

**Errors:**
- `404` - Supervisor not found

---


### POST /supervisors

Register a new supervisor.

**Request:**
- Body:
```json
{
  "taiKhoanId": 5,
  "tenDonVi": "Quality Assurance Corp",
  "moTa": "Professional project supervision",
  "nangLuc": "IT project management",
  "chungChi": "PMP, ISO 9001",
  "phiGiamSat": 500000
}
```

> `moTa`, `nangLuc`, `chungChi` are optional.

**Response 201:**
```json
{
  "message": "Supervisor created successfully",
  "supervisor": {
    "giamSatId": 3,
    "taiKhoanId": 5,
    "tenDonVi": "Quality Assurance Corp",
    "moTa": "Professional project supervision",
    "nangLuc": "IT project management",
    "chungChi": "PMP, ISO 9001",
    "phiGiamSat": "500000",
    "xepHang": "0",
    "tongCongViecGS": 0,
    "trangThai": "ChoDuyet",
    "ngayDangKy": "2025-01-15T10:30:00.000Z",
    "taiKhoan": {
      "taiKhoanId": 5,
      "hoTen": "Le Van C",
      "email": "levanc@email.com",
      "soDienThoai": "0912345678"
    }
  }
}
```

**Errors:**
- `400` - Missing required fields
- `404` - Account not found
- `409` - Account already registered as supervisor

---

### PUT /supervisors/:id

Update supervisor information.

**Request:**
- Path params: `:id` - supervisor ID (integer)
- Body:
```json
{
  "tenDonVi": "Quality Assurance Corp Updated",
  "moTa": "Updated description",
  "nangLuc": "IT project management, QA",
  "chungChi": "PMP, ISO 9001, CMMI",
  "phiGiamSat": 600000,
  "trangThai": "DaDuyet"
}
```

> All fields are optional.

**Response 200:**
```json
{
  "message": "Supervisor updated successfully",
  "supervisor": {
    "giamSatId": 1,
    "taiKhoanId": 5,
    "tenDonVi": "Quality Assurance Corp Updated",
    "moTa": "Updated description",
    "nangLuc": "IT project management, QA",
    "chungChi": "PMP, ISO 9001, CMMI",
    "phiGiamSat": "600000",
    "xepHang": "4.8",
    "tongCongViecGS": 15,
    "trangThai": "DaDuyet",
    "ngayDangKy": "2025-01-01T00:00:00.000Z",
    "taiKhoan": {
      "taiKhoanId": 5,
      "hoTen": "Le Van C",
      "email": "levanc@email.com",
      "soDienThoai": "0912345678"
    }
  }
}
```

**Errors:**
- `400` - Invalid data
- `404` - Supervisor not found

---


### DELETE /supervisors/:id

Delete a supervisor.

**Request:**
- Path params: `:id` - supervisor ID (integer)

**Response 200:**
```json
{
  "message": "Supervisor deleted successfully",
  "supervisorId": 1
}
```

**Errors:**
- `404` - Supervisor not found
- `409` - Supervisor has active contracts

---

## 11. Progress

### GET /progress/:id

Get a single progress report by ID.

**Request:**
- Path params: `:id` - progress ID (integer)

**Response 200:**
```json
{
  "progress": {
    "tienDoId": 1,
    "congViecId": 1,
    "freelancerId": 2,
    "tieuDe": "Completed homepage design",
    "moTa": "Finished the homepage layout and responsive design",
    "phanTram": 30,
    "tepDinhKem": "https://example.com/files/design.pdf",
    "xacNhanBoi": null,
    "trangThaiXacNhan": "ChoXacNhan",
    "ngayTao": "2025-01-25T10:00:00.000Z",
    "congViec": {
      "congViecId": 1,
      "yeuCauId": 1,
      "giaThoa": "8000000"
    },
    "freelancer": {
      "freelancerId": 2,
      "taiKhoanId": 3,
      "hoTen": "Tran Van B",
      "email": "tranvanb@email.com"
    },
    "donViGiamSat": null
  }
}
```

**Errors:**
- `404` - Progress report not found

---

### POST /progress

Create a new progress report.

**Request:**
- Body:
```json
{
  "congViecId": 1,
  "freelancerId": 2,
  "tieuDe": "Completed homepage design",
  "moTa": "Finished the homepage layout and responsive design",
  "phanTram": 30,
  "tepDinhKem": "https://example.com/files/design.pdf"
}
```

> `moTa` and `tepDinhKem` are optional.

**Response 201:**
```json
{
  "message": "Progress created successfully",
  "progress": {
    "tienDoId": 3,
    "congViecId": 1,
    "freelancerId": 2,
    "tieuDe": "Completed homepage design",
    "moTa": "Finished the homepage layout and responsive design",
    "phanTram": 30,
    "tepDinhKem": "https://example.com/files/design.pdf",
    "xacNhanBoi": null,
    "trangThaiXacNhan": "ChoXacNhan",
    "ngayTao": "2025-01-25T10:00:00.000Z",
    "congViec": {
      "congViecId": 1,
      "yeuCauId": 1,
      "giaThoa": "8000000"
    },
    "freelancer": {
      "freelancerId": 2,
      "taiKhoanId": 3,
      "hoTen": "Tran Van B",
      "email": "tranvanb@email.com"
    },
    "donViGiamSat": null
  }
}
```

**Errors:**
- `400` - Missing required fields or invalid phanTram (must be 0-100)
- `404` - Contract or freelancer not found

---


### PUT /progress/:id

Update a progress report (can also be used to confirm/reject progress).

**Request:**
- Path params: `:id` - progress ID (integer)
- Body:
```json
{
  "tieuDe": "Updated title",
  "moTa": "Updated description",
  "phanTram": 50,
  "tepDinhKem": "https://example.com/files/updated.pdf",
  "trangThaiXacNhan": "DaXacNhan"
}
```

> All fields are optional.

**Response 200:**
```json
{
  "message": "Progress updated successfully",
  "progress": {
    "tienDoId": 1,
    "congViecId": 1,
    "freelancerId": 2,
    "tieuDe": "Updated title",
    "moTa": "Updated description",
    "phanTram": 50,
    "tepDinhKem": "https://example.com/files/updated.pdf",
    "xacNhanBoi": 1,
    "trangThaiXacNhan": "DaXacNhan",
    "ngayTao": "2025-01-25T10:00:00.000Z",
    "congViec": {
      "congViecId": 1,
      "yeuCauId": 1,
      "giaThoa": "8000000"
    },
    "freelancer": {
      "freelancerId": 2,
      "taiKhoanId": 3,
      "hoTen": "Tran Van B",
      "email": "tranvanb@email.com"
    },
    "donViGiamSat": null
  }
}
```

**Errors:**
- `400` - Invalid data
- `404` - Progress report not found

---

### DELETE /progress/:id

Delete a progress report.

**Request:**
- Path params: `:id` - progress ID (integer)

**Response 200:**
```json
{
  "message": "Progress deleted successfully",
  "progressId": 1
}
```

**Errors:**
- `404` - Progress report not found

---

## 12. Chat

### POST /chat

Create a new conversation.

**Request:**
- Body:
```json
{
  "congViecId": 1,
  "thanhVien1Id": 1,
  "thanhVien2Id": 3,
  "giamSatId": 5
}
```

> `congViecId` and `giamSatId` are optional.

**Response 201:**
```json
{
  "message": "Conversation created successfully",
  "conversation": {
    "cuocHoiThoaiId": 5,
    "congViecId": 1,
    "thanhVien1": {
      "taiKhoanId": 1,
      "hoTen": "Nguyen Van A",
      "email": "nguyenvana@email.com"
    },
    "thanhVien2": {
      "taiKhoanId": 3,
      "hoTen": "Tran Van B",
      "email": "tranvanb@email.com"
    },
    "giamSatId": 5,
    "tinNhanCuoi": null,
    "trangThai": "DangMo",
    "ngayTao": "2025-01-20T10:30:00.000Z"
  }
}
```

**Errors:**
- `400` - Missing required fields
- `404` - User(s) not found

---


### GET /chat/:id

Get a single conversation by ID.

**Request:**
- Path params: `:id` - conversation ID (integer)

**Response 200:**
```json
{
  "conversation": {
    "cuocHoiThoaiId": 1,
    "congViecId": 1,
    "thanhVien1": {
      "taiKhoanId": 1,
      "hoTen": "Nguyen Van A",
      "email": "nguyenvana@email.com"
    },
    "thanhVien2": {
      "taiKhoanId": 3,
      "hoTen": "Tran Van B",
      "email": "tranvanb@email.com"
    },
    "giamSatId": null,
    "tinNhanCuoi": "Hello, I am interested in your project",
    "trangThai": "DangMo",
    "ngayTao": "2025-01-18T10:30:00.000Z"
  }
}
```

**Errors:**
- `404` - Conversation not found

---

### PUT /chat/:id/close

Close a conversation.

**Request:**
- Path params: `:id` - conversation ID (integer)

**Response 200:**
```json
{
  "message": "Conversation closed successfully",
  "conversation": {
    "cuocHoiThoaiId": 1,
    "congViecId": 1,
    "thanhVien1": {
      "taiKhoanId": 1,
      "hoTen": "Nguyen Van A",
      "email": "nguyenvana@email.com"
    },
    "thanhVien2": {
      "taiKhoanId": 3,
      "hoTen": "Tran Van B",
      "email": "tranvanb@email.com"
    },
    "giamSatId": null,
    "tinNhanCuoi": "Goodbye!",
    "trangThai": "DaDong",
    "ngayTao": "2025-01-18T10:30:00.000Z"
  }
}
```

**Errors:**
- `404` - Conversation not found
- `409` - Conversation already closed

---

### GET /chat/:id/messages

Get all messages in a conversation.

**Request:**
- Path params: `:id` - conversation ID (integer)

**Response 200:**
```json
{
  "total": 3,
  "messages": [
    {
      "tinNhanId": 1,
      "cuocHoiThoaiId": 1,
      "nguoiGui": {
        "taiKhoanId": 1,
        "hoTen": "Nguyen Van A",
        "email": "nguyenvana@email.com"
      },
      "noiDung": "Hello, I am interested in your project",
      "loaiTin": "VanBan",
      "daDoc": true,
      "ngayTao": "2025-01-18T10:30:00.000Z"
    },
    {
      "tinNhanId": 2,
      "cuocHoiThoaiId": 1,
      "nguoiGui": {
        "taiKhoanId": 3,
        "hoTen": "Tran Van B",
        "email": "tranvanb@email.com"
      },
      "noiDung": "Great! Let me share my portfolio",
      "loaiTin": "VanBan",
      "daDoc": false,
      "ngayTao": "2025-01-18T10:35:00.000Z"
    }
  ]
}
```

**Errors:**
- `404` - Conversation not found

---


### POST /chat/:id/messages

Send a message in a conversation.

**Request:**
- Path params: `:id` - conversation ID (integer)
- Body:
```json
{
  "cuocHoiThoaiId": 1,
  "nguoiGuiId": 1,
  "noiDung": "Can you start working on the homepage first?",
  "loaiTin": "VanBan"
}
```

> `loaiTin` is optional, defaults to `VanBan`. Valid values: `VanBan`, `HinhAnh`, `TepTin`.

**Response 201:**
```json
{
  "message": "Message sent successfully",
  "data": {
    "tinNhanId": 5,
    "cuocHoiThoaiId": 1,
    "nguoiGui": {
      "taiKhoanId": 1,
      "hoTen": "Nguyen Van A",
      "email": "nguyenvana@email.com"
    },
    "noiDung": "Can you start working on the homepage first?",
    "loaiTin": "VanBan",
    "daDoc": false,
    "ngayTao": "2025-01-19T08:00:00.000Z"
  }
}
```

**Errors:**
- `400` - Missing required fields
- `404` - Conversation or sender not found
- `409` - Conversation is closed

---

### PUT /chat/:id/read/:userId

Mark all messages in a conversation as read for a specific user.

**Request:**
- Path params:
  - `:id` - conversation ID (integer)
  - `:userId` - user account ID (integer)

**Response 200:**
```json
{
  "message": "Messages marked as read",
  "count": 5
}
```

**Errors:**
- `404` - Conversation not found

---

## 13. Payments

### POST /payments/deposit

Create a deposit payment for a contract (escrow).

**Request:**
- Body:
```json
{
  "contractId": 1,
  "amount": 8000000,
  "paymentMethod": "ChuyenKhoan",
  "note": "Deposit for React website project"
}
```

> `note` is optional. Valid `paymentMethod`: `ViDienTu`, `ChuyenKhoan`, `TheTinDung`.

**Response 201:**
```json
{
  "message": "Deposit created successfully",
  "payment": {
    "thanhToanId": 1,
    "congViecId": 1,
    "nguoiThueId": 1,
    "soTien": "8000000",
    "loaiTT": "DatCoc",
    "phuongThuc": "ChuyenKhoan",
    "trangThai": "ChoXuLy",
    "giamSatId": null,
    "phiGiamSatTT": "0",
    "ghiChu": "Deposit for React website project",
    "ngayTao": "2025-01-20T10:30:00.000Z"
  }
}
```

**Errors:**
- `400` - Missing required fields or invalid amount
- `404` - Contract not found

---


### GET /payments/:id

Get a single payment by ID.

**Request:**
- Path params: `:id` - payment ID (integer)

**Response 200:**
```json
{
  "payment": {
    "thanhToanId": 1,
    "congViecId": 1,
    "nguoiThueId": 1,
    "soTien": "8000000",
    "loaiTT": "DatCoc",
    "phuongThuc": "ChuyenKhoan",
    "trangThai": "ThanhCong",
    "giamSatId": null,
    "phiGiamSatTT": "0",
    "ghiChu": "Deposit for React website project",
    "ngayTao": "2025-01-20T10:30:00.000Z"
  }
}
```

**Errors:**
- `404` - Payment not found

---

### GET /contracts/:id/payments

Get all payments for a specific contract.

**Request:**
- Path params: `:id` - contract ID (integer)

**Response 200:**
```json
{
  "total": 2,
  "payments": [
    {
      "thanhToanId": 1,
      "congViecId": 1,
      "nguoiThueId": 1,
      "soTien": "8000000",
      "loaiTT": "DatCoc",
      "phuongThuc": "ChuyenKhoan",
      "trangThai": "ThanhCong",
      "giamSatId": null,
      "phiGiamSatTT": "0",
      "ghiChu": "Deposit for React website project",
      "ngayTao": "2025-01-20T10:30:00.000Z"
    },
    {
      "thanhToanId": 2,
      "congViecId": 1,
      "nguoiThueId": 1,
      "soTien": "8000000",
      "loaiTT": "ThanhToan",
      "phuongThuc": "ChuyenKhoan",
      "trangThai": "ThanhCong",
      "giamSatId": null,
      "phiGiamSatTT": "0",
      "ghiChu": "Final payment released",
      "ngayTao": "2025-02-15T10:30:00.000Z"
    }
  ]
}
```

**Errors:**
- `404` - Contract not found

---

### PUT /payments/:id/release

Release a payment to the freelancer (from escrow).

**Request:**
- Path params: `:id` - payment ID (integer)

**Response 200:**
```json
{
  "message": "Payment released successfully",
  "payment": {
    "thanhToanId": 1,
    "congViecId": 1,
    "nguoiThueId": 1,
    "soTien": "8000000",
    "loaiTT": "ThanhToan",
    "phuongThuc": "ChuyenKhoan",
    "trangThai": "ThanhCong",
    "giamSatId": null,
    "phiGiamSatTT": "0",
    "ghiChu": "Payment released to freelancer",
    "ngayTao": "2025-02-15T10:30:00.000Z"
  }
}
```

**Errors:**
- `404` - Payment not found
- `409` - Payment already released or refunded

---


### PUT /payments/:id/refund

Refund a payment back to the employer.

**Request:**
- Path params: `:id` - payment ID (integer)

**Response 200:**
```json
{
  "message": "Payment refunded successfully",
  "payment": {
    "thanhToanId": 1,
    "congViecId": 1,
    "nguoiThueId": 1,
    "soTien": "8000000",
    "loaiTT": "HoanTien",
    "phuongThuc": "ChuyenKhoan",
    "trangThai": "DaHoan",
    "giamSatId": null,
    "phiGiamSatTT": "0",
    "ghiChu": "Refund due to dispute resolution",
    "ngayTao": "2025-02-15T10:30:00.000Z"
  }
}
```

**Errors:**
- `404` - Payment not found
- `409` - Payment already refunded or released

---

## 14. Disputes

### POST /disputes

Create a new dispute for a contract.

**Request:**
- Body:
```json
{
  "congViecId": 1,
  "nguoiGuiId": 1,
  "lyDo": "Work not delivered on time",
  "moTa": "The freelancer missed the deadline by 2 weeks without communication",
  "yeuCauHoanTien": 5000000
}
```

> `moTa` is optional.

**Response 201:**
```json
{
  "message": "Dispute created successfully",
  "dispute": {
    "tranhChapId": 1,
    "congViecId": 1,
    "nguoiGuiId": 1,
    "giamSatId": null,
    "lyDo": "Work not delivered on time",
    "moTa": "The freelancer missed the deadline by 2 weeks without communication",
    "trangThai": "DangMo",
    "yeuCauHoanTien": "5000000",
    "ngayMo": "2025-02-10T10:30:00.000Z",
    "ngayDong": null
  }
}
```

**Errors:**
- `400` - Missing required fields
- `404` - Contract not found
- `409` - Active dispute already exists for this contract

---

### GET /disputes/:id

Get a single dispute by ID.

**Request:**
- Path params: `:id` - dispute ID (integer)

**Response 200:**
```json
{
  "dispute": {
    "tranhChapId": 1,
    "congViecId": 1,
    "nguoiGuiId": 1,
    "giamSatId": 5,
    "lyDo": "Work not delivered on time",
    "moTa": "The freelancer missed the deadline by 2 weeks",
    "trangThai": "DangXuLy",
    "yeuCauHoanTien": "5000000",
    "ngayMo": "2025-02-10T10:30:00.000Z",
    "ngayDong": null
  }
}
```

**Errors:**
- `404` - Dispute not found

---


### GET /contracts/:id/disputes

Get all disputes for a specific contract.

**Request:**
- Path params: `:id` - contract ID (integer)

**Response 200:**
```json
{
  "total": 1,
  "disputes": [
    {
      "tranhChapId": 1,
      "congViecId": 1,
      "nguoiGuiId": 1,
      "giamSatId": 5,
      "lyDo": "Work not delivered on time",
      "moTa": "The freelancer missed the deadline by 2 weeks",
      "trangThai": "DangXuLy",
      "yeuCauHoanTien": "5000000",
      "ngayMo": "2025-02-10T10:30:00.000Z",
      "ngayDong": null
    }
  ]
}
```

**Errors:**
- `404` - Contract not found

---

### PUT /disputes/:id/review

Assign a supervisor to review a dispute.

**Request:**
- Path params: `:id` - dispute ID (integer)
- Body:
```json
{
  "giamSatId": 5
}
```

**Response 200:**
```json
{
  "message": "Dispute assigned for review",
  "dispute": {
    "tranhChapId": 1,
    "congViecId": 1,
    "nguoiGuiId": 1,
    "giamSatId": 5,
    "lyDo": "Work not delivered on time",
    "moTa": "The freelancer missed the deadline by 2 weeks",
    "trangThai": "DangXuLy",
    "yeuCauHoanTien": "5000000",
    "ngayMo": "2025-02-10T10:30:00.000Z",
    "ngayDong": null
  }
}
```

**Errors:**
- `404` - Dispute or supervisor not found
- `409` - Dispute already assigned or closed

---

### PUT /disputes/:id/resolve

Resolve a dispute with a final decision.

**Request:**
- Path params: `:id` - dispute ID (integer)
- Body:
```json
{
  "giamSatId": 5,
  "ketQua": "HoanMotPhan",
  "lyDo": "Freelancer completed 60% of work, partial refund granted",
  "soTienHoan": 3000000,
  "benChiuPhi": "ChiaDeu"
}
```

> Valid `ketQua`: `HoanTien`, `KhongHoanTien`, `HoanMotPhan`.
> Valid `benChiuPhi`: `NguoiThue`, `Freelancer`, `ChiaDeu`.

**Response 200:**
```json
{
  "message": "Dispute resolved successfully",
  "dispute": {
    "tranhChapId": 1,
    "congViecId": 1,
    "nguoiGuiId": 1,
    "giamSatId": 5,
    "lyDo": "Work not delivered on time",
    "moTa": "The freelancer missed the deadline by 2 weeks",
    "trangThai": "DaDong",
    "yeuCauHoanTien": "5000000",
    "ngayMo": "2025-02-10T10:30:00.000Z",
    "ngayDong": "2025-02-15T14:00:00.000Z"
  }
}
```

**Errors:**
- `400` - Missing required fields
- `404` - Dispute not found
- `409` - Dispute already resolved

---


## 15. Evidences

### POST /disputes/:id/evidences

Submit evidence for a dispute.

**Request:**
- Path params: `:id` - dispute ID (integer)
- Body:
```json
{
  "nguoiNopId": 1,
  "giamSatId": 5,
  "loaiBangChung": "TaiLieu",
  "noiDung": "Contract agreement showing deadline was January 31",
  "duongDanFile": "https://example.com/files/contract.pdf"
}
```

> `giamSatId`, `noiDung`, `duongDanFile` are optional.
> Valid `loaiBangChung`: `HinhAnh`, `Video`, `TaiLieu`, `VanBan`.

**Response 201:**
```json
{
  "message": "Evidence submitted successfully",
  "evidence": {
    "bangChungId": 1,
    "tranhChapId": 1,
    "nguoiNopId": 1,
    "giamSatId": 5,
    "loaiBangChung": "TaiLieu",
    "noiDung": "Contract agreement showing deadline was January 31",
    "duongDanFile": "https://example.com/files/contract.pdf",
    "ngayNop": "2025-02-11T08:00:00.000Z"
  }
}
```

**Errors:**
- `400` - Missing required fields
- `404` - Dispute not found

---

### GET /disputes/:id/evidences

Get all evidences for a dispute.

**Request:**
- Path params: `:id` - dispute ID (integer)

**Response 200:**
```json
{
  "total": 2,
  "evidences": [
    {
      "bangChungId": 1,
      "tranhChapId": 1,
      "nguoiNopId": 1,
      "giamSatId": 5,
      "loaiBangChung": "TaiLieu",
      "noiDung": "Contract agreement showing deadline was January 31",
      "duongDanFile": "https://example.com/files/contract.pdf",
      "ngayNop": "2025-02-11T08:00:00.000Z"
    },
    {
      "bangChungId": 2,
      "tranhChapId": 1,
      "nguoiNopId": 3,
      "giamSatId": null,
      "loaiBangChung": "HinhAnh",
      "noiDung": "Screenshot of chat showing extension request",
      "duongDanFile": "https://example.com/files/screenshot.png",
      "ngayNop": "2025-02-12T09:00:00.000Z"
    }
  ]
}
```

**Errors:**
- `404` - Dispute not found

---

### DELETE /evidences/:id

Delete an evidence submission.

**Request:**
- Path params: `:id` - evidence ID (integer)

**Response 200:**
```json
{
  "message": "Evidence deleted successfully",
  "evidence": null
}
```

**Errors:**
- `404` - Evidence not found

---


## 16. Reviews

### POST /reviews

Create a new review for a completed contract.

**Request:**
- Body:
```json
{
  "congViecId": 1,
  "nguoiDanhGiaId": 1,
  "nguoiDuocDGId": 3,
  "diemSo": 5,
  "binhLuan": "Excellent work, delivered on time with great quality",
  "loaiDanhGia": "NguoiThue_DanhGia_Freelancer",
  "giamSatId": 5
}
```

> `binhLuan` and `giamSatId` are optional.
> Valid `loaiDanhGia`: `NguoiThue_DanhGia_Freelancer`, `Freelancer_DanhGia_NguoiThue`.
> `diemSo` range: 1-5.

**Response 201:**
```json
{
  "message": "Review created successfully",
  "review": {
    "danhGiaId": 1,
    "congViecId": 1,
    "nguoiDanhGiaId": 1,
    "nguoiDuocDGId": 3,
    "diemSo": 5,
    "binhLuan": "Excellent work, delivered on time with great quality",
    "loaiDanhGia": "NguoiThue_DanhGia_Freelancer",
    "giamSatId": 5,
    "ngayTao": "2025-02-20T10:30:00.000Z"
  }
}
```

**Errors:**
- `400` - Missing required fields or invalid diemSo
- `404` - Contract, reviewer, or reviewee not found
- `409` - Review already exists for this contract by this user

---

### GET /reviews/:id

Get a single review by ID.

**Request:**
- Path params: `:id` - review ID (integer)

**Response 200:**
```json
{
  "review": {
    "danhGiaId": 1,
    "congViecId": 1,
    "nguoiDanhGiaId": 1,
    "nguoiDuocDGId": 3,
    "diemSo": 5,
    "binhLuan": "Excellent work, delivered on time with great quality",
    "loaiDanhGia": "NguoiThue_DanhGia_Freelancer",
    "giamSatId": 5,
    "ngayTao": "2025-02-20T10:30:00.000Z"
  }
}
```

**Errors:**
- `404` - Review not found

---

### GET /users/:id/reviews

Get all reviews for a specific user (received reviews).

**Request:**
- Path params: `:id` - user account ID (integer)

**Response 200:**
```json
{
  "total": 2,
  "reviews": [
    {
      "danhGiaId": 1,
      "congViecId": 1,
      "nguoiDanhGiaId": 1,
      "nguoiDuocDGId": 3,
      "diemSo": 5,
      "binhLuan": "Excellent work",
      "loaiDanhGia": "NguoiThue_DanhGia_Freelancer",
      "giamSatId": null,
      "ngayTao": "2025-02-20T10:30:00.000Z"
    }
  ]
}
```

**Errors:**
- `404` - User not found

---


### GET /contracts/:id/reviews

Get all reviews for a specific contract.

**Request:**
- Path params: `:id` - contract ID (integer)

**Response 200:**
```json
{
  "total": 2,
  "reviews": [
    {
      "danhGiaId": 1,
      "congViecId": 1,
      "nguoiDanhGiaId": 1,
      "nguoiDuocDGId": 3,
      "diemSo": 5,
      "binhLuan": "Excellent work, delivered on time",
      "loaiDanhGia": "NguoiThue_DanhGia_Freelancer",
      "giamSatId": null,
      "ngayTao": "2025-02-20T10:30:00.000Z"
    },
    {
      "danhGiaId": 2,
      "congViecId": 1,
      "nguoiDanhGiaId": 3,
      "nguoiDuocDGId": 1,
      "diemSo": 4,
      "binhLuan": "Good communication, clear requirements",
      "loaiDanhGia": "Freelancer_DanhGia_NguoiThue",
      "giamSatId": null,
      "ngayTao": "2025-02-20T11:00:00.000Z"
    }
  ]
}
```

**Errors:**
- `404` - Contract not found

---

## 17. Notifications

### GET /notifications

Get all notifications for a user.

**Request:**
- Query params: `userId` - user account ID (integer, required)

Example: `GET /notifications?userId=1`

**Response 200:**
```json
{
  "total": 3,
  "notifications": [
    {
      "thongBaoId": 1,
      "taiKhoanId": 1,
      "tieuDe": "New proposal received",
      "noiDung": "You have a new proposal for your job posting",
      "loaiThongBao": "CongViec",
      "daDoc": false,
      "giamSatId": null,
      "ngayTao": "2025-01-16T08:00:00.000Z"
    },
    {
      "thongBaoId": 2,
      "taiKhoanId": 1,
      "tieuDe": "Payment received",
      "noiDung": "Your deposit of 8,000,000 VND has been confirmed",
      "loaiThongBao": "ThanhToan",
      "daDoc": true,
      "giamSatId": null,
      "ngayTao": "2025-01-20T10:30:00.000Z"
    }
  ]
}
```

---

### PUT /notifications/:id/read

Mark a notification as read.

**Request:**
- Path params: `:id` - notification ID (integer)

**Response 200:**
```json
{
  "message": "Notification marked as read",
  "notification": {
    "thongBaoId": 1,
    "taiKhoanId": 1,
    "tieuDe": "New proposal received",
    "noiDung": "You have a new proposal for your job posting",
    "loaiThongBao": "CongViec",
    "daDoc": true,
    "giamSatId": null,
    "ngayTao": "2025-01-16T08:00:00.000Z"
  }
}
```

**Errors:**
- `404` - Notification not found

---

### DELETE /notifications/:id

Delete a notification.

**Request:**
- Path params: `:id` - notification ID (integer)

**Response 200:**
```json
{
  "message": "Notification deleted successfully"
}
```

**Errors:**
- `404` - Notification not found

---


## 18. Reports

### POST /reports

Create a new user report (report a user for misconduct).

**Request:**
- Body:
```json
{
  "nguoiBaoCaoId": 1,
  "nguoiBiCaoId": 3,
  "lyDo": "Spam messages",
  "moTa": "This user keeps sending unsolicited promotional messages"
}
```

> `moTa` is optional.

**Response 201:**
```json
{
  "message": "Report created successfully",
  "report": {
    "baoCaoId": 1,
    "nguoiBaoCaoId": 1,
    "nguoiBiCaoId": 3,
    "lyDo": "Spam messages",
    "moTa": "This user keeps sending unsolicited promotional messages",
    "trangThai": "ChoXuLy",
    "ketQua": null,
    "adminXuLyId": null,
    "ngayTao": "2025-02-01T10:30:00.000Z",
    "ngayXuLy": null
  }
}
```

**Errors:**
- `400` - Missing required fields
- `404` - Reporter or reported user not found

---

### GET /reports

Get all reports (admin view).

**Request:**
- No parameters required.

**Response 200:**
```json
{
  "total": 2,
  "reports": [
    {
      "baoCaoId": 1,
      "nguoiBaoCaoId": 1,
      "nguoiBiCaoId": 3,
      "lyDo": "Spam messages",
      "moTa": "This user keeps sending unsolicited promotional messages",
      "trangThai": "ChoXuLy",
      "ketQua": null,
      "adminXuLyId": null,
      "ngayTao": "2025-02-01T10:30:00.000Z",
      "ngayXuLy": null
    },
    {
      "baoCaoId": 2,
      "nguoiBaoCaoId": 5,
      "nguoiBiCaoId": 7,
      "lyDo": "Fake profile",
      "moTa": null,
      "trangThai": "DaXuLy",
      "ketQua": "User account suspended",
      "adminXuLyId": 10,
      "ngayTao": "2025-01-28T08:00:00.000Z",
      "ngayXuLy": "2025-01-30T14:00:00.000Z"
    }
  ]
}
```

---

### PUT /reports/:id/resolve

Resolve a report (admin action).

**Request:**
- Path params: `:id` - report ID (integer)
- Body:
```json
{
  "adminId": 10,
  "trangThai": "DaXuLy",
  "ketQua": "User has been warned and messages deleted"
}
```

> Valid `trangThai`: `ChoXuLy`, `DaXuLy`, `TuChoi`.

**Response 200:**
```json
{
  "message": "Report resolved successfully",
  "report": {
    "baoCaoId": 1,
    "nguoiBaoCaoId": 1,
    "nguoiBiCaoId": 3,
    "lyDo": "Spam messages",
    "moTa": "This user keeps sending unsolicited promotional messages",
    "trangThai": "DaXuLy",
    "ketQua": "User has been warned and messages deleted",
    "adminXuLyId": 10,
    "ngayTao": "2025-02-01T10:30:00.000Z",
    "ngayXuLy": "2025-02-03T09:00:00.000Z"
  }
}
```

**Errors:**
- `400` - Missing required fields
- `404` - Report not found
- `409` - Report already resolved

---


## 19. Admin

### GET /admin/users

Get all users for admin management.

**Request:**
- No parameters required.

**Response 200:**
```json
{
  "total": 10,
  "users": [
    {
      "taiKhoanId": 1,
      "tenDangNhap": "nguyenvana",
      "email": "nguyenvana@email.com",
      "hoTen": "Nguyen Van A",
      "vaiTro": "Freelancer",
      "trangThai": "HoatDong",
      "ngayTao": "2025-01-15T10:30:00.000Z"
    },
    {
      "taiKhoanId": 2,
      "tenDangNhap": "tranvanb",
      "email": "tranvanb@email.com",
      "hoTen": "Tran Van B",
      "vaiTro": "NguoiThue",
      "trangThai": "HoatDong",
      "ngayTao": "2025-01-10T08:00:00.000Z"
    }
  ]
}
```

---

### PUT /admin/users/:id/ban

Ban (lock) a user account.

**Request:**
- Path params: `:id` - user account ID (integer)

**Response 200:**
```json
{
  "message": "User banned successfully"
}
```

**Errors:**
- `404` - User not found
- `409` - User already banned

---

### GET /admin/supervisors

Get all supervisors for admin management.

**Request:**
- No parameters required.

**Response 200:**
```json
{
  "total": 3,
  "supervisors": [
    {
      "giamSatId": 1,
      "taiKhoanId": 5,
      "tenDonVi": "Quality Assurance Corp",
      "phiGiamSat": "500000",
      "trangThai": "DaDuyet",
      "ngayDangKy": "2025-01-01T00:00:00.000Z",
      "hoTen": "Le Van C",
      "email": "levanc@email.com"
    },
    {
      "giamSatId": 2,
      "taiKhoanId": 8,
      "tenDonVi": "Project Monitor Ltd",
      "phiGiamSat": "400000",
      "trangThai": "ChoDuyet",
      "ngayDangKy": "2025-01-20T00:00:00.000Z",
      "hoTen": "Pham Van D",
      "email": "phamvand@email.com"
    }
  ]
}
```

---

### PUT /admin/supervisors/:id/approve

Approve a supervisor registration.

**Request:**
- Path params: `:id` - supervisor ID (integer)

**Response 200:**
```json
{
  "message": "Supervisor approved successfully"
}
```

**Errors:**
- `404` - Supervisor not found
- `409` - Supervisor already approved

---

### GET /admin/statistics

Get platform statistics overview.

**Request:**
- No parameters required.

**Response 200:**
```json
{
  "statistics": {
    "totalUsers": 150,
    "totalContracts": 45,
    "activeContracts": 12,
    "pendingDisputes": 3,
    "pendingReports": 5
  }
}
```

---


## Endpoint Summary

| # | Method | Path | Module | Description |
|---|--------|------|--------|-------------|
| 1 | GET | /health | Health | Health check |
| 2 | POST | /auth/register | Auth | Register new account |
| 3 | POST | /auth/login | Auth | Login |
| 4 | GET | /users | Users | Get all users |
| 5 | GET | /users/search | Users | Search users |
| 6 | GET | /users/:id | Users | Get user by ID |
| 7 | GET | /users/:id/profile | Users | Get user profile |
| 8 | GET | /users/:id/jobs | Users | Get user's jobs |
| 9 | GET | /users/:id/contracts | Users | Get user's contracts |
| 10 | GET | /users/:id/conversations | Users | Get user's conversations |
| 11 | PUT | /users/:id | Users | Update user |
| 12 | DELETE | /users/:id | Users | Delete user |
| 13 | GET | /categories | Categories | Get all categories |
| 14 | GET | /categories/:id | Categories | Get category by ID |
| 15 | POST | /categories | Categories | Create category |
| 16 | PUT | /categories/:id | Categories | Update category |
| 17 | DELETE | /categories/:id | Categories | Delete category |
| 18 | GET | /skills | Skills | Get all skills |
| 19 | GET | /skills/:id | Skills | Get skill by ID |
| 20 | POST | /skills | Skills | Create skill |
| 21 | PUT | /skills/:id | Skills | Update skill |
| 22 | DELETE | /skills/:id | Skills | Delete skill |
| 23 | GET | /jobs | Jobs | Get all jobs |
| 24 | GET | /jobs/search | Jobs | Search jobs |
| 25 | GET | /jobs/:id | Jobs | Get job by ID |
| 26 | GET | /jobs/:id/proposals | Jobs | Get job proposals |
| 27 | GET | /jobs/:id/skills | Jobs | Get job skills |
| 28 | POST | /jobs | Jobs | Create job |
| 29 | PUT | /jobs/:id | Jobs | Update job |
| 30 | PUT | /jobs/:id/skills | Jobs | Set job skills |
| 31 | POST | /jobs/:id/skills/:kyNangId | Jobs | Add skill to job |
| 32 | DELETE | /jobs/:id/skills/:kyNangId | Jobs | Remove skill from job |
| 33 | DELETE | /jobs/:id | Jobs | Delete job |
| 34 | GET | /proposals/:id | Proposals | Get proposal by ID |
| 35 | POST | /proposals | Proposals | Create proposal |
| 36 | PUT | /proposals/:id | Proposals | Update proposal |
| 37 | DELETE | /proposals/:id | Proposals | Delete proposal |
| 38 | GET | /freelancers/:id/proposals | Freelancers | Get freelancer proposals |
| 39 | GET | /freelancers/:id/skills | Freelancers | Get freelancer skills |
| 40 | PUT | /freelancers/:id/skills | Freelancers | Set freelancer skills |
| 41 | POST | /freelancers/:id/skills/:kyNangId | Freelancers | Add skill to freelancer |
| 42 | DELETE | /freelancers/:id/skills/:kyNangId | Freelancers | Remove skill from freelancer |
| 43 | GET | /contracts | Contracts | Get all contracts |
| 44 | GET | /contracts/:id | Contracts | Get contract by ID |
| 45 | GET | /contracts/:id/detail | Contracts | Get contract detail |
| 46 | GET | /contracts/:id/progress | Contracts | Get contract progress |
| 47 | GET | /contracts/:id/conversations | Contracts | Get contract conversations |
| 48 | POST | /contracts | Contracts | Create contract |
| 49 | PUT | /contracts/:id/status | Contracts | Update contract status |
| 50 | POST | /contracts/:id/supervisor | Contracts | Select supervisor |
| 51 | PUT | /contracts/:id/supervisor/accept | Contracts | Accept supervisor |
| 52 | PUT | /contracts/:id/supervisor/reject | Contracts | Reject supervisor |
| 53 | GET | /supervisors | Supervisors | Get all supervisors |
| 54 | GET | /supervisors/search | Supervisors | Search supervisors |
| 55 | GET | /supervisors/:id | Supervisors | Get supervisor by ID |
| 56 | POST | /supervisors | Supervisors | Create supervisor |
| 57 | PUT | /supervisors/:id | Supervisors | Update supervisor |
| 58 | DELETE | /supervisors/:id | Supervisors | Delete supervisor |
| 59 | GET | /progress/:id | Progress | Get progress by ID |
| 60 | POST | /progress | Progress | Create progress |
| 61 | PUT | /progress/:id | Progress | Update progress |
| 62 | DELETE | /progress/:id | Progress | Delete progress |
| 63 | POST | /chat | Chat | Create conversation |
| 64 | GET | /chat/:id | Chat | Get conversation by ID |
| 65 | PUT | /chat/:id/close | Chat | Close conversation |
| 66 | GET | /chat/:id/messages | Chat | Get messages |
| 67 | POST | /chat/:id/messages | Chat | Send message |
| 68 | PUT | /chat/:id/read/:userId | Chat | Mark messages as read |
| 69 | POST | /payments/deposit | Payments | Create deposit |
| 70 | GET | /payments/:id | Payments | Get payment by ID |
| 71 | GET | /contracts/:id/payments | Payments | Get contract payments |
| 72 | PUT | /payments/:id/release | Payments | Release payment |
| 73 | PUT | /payments/:id/refund | Payments | Refund payment |
| 74 | POST | /disputes | Disputes | Create dispute |
| 75 | GET | /disputes/:id | Disputes | Get dispute by ID |
| 76 | GET | /contracts/:id/disputes | Disputes | Get contract disputes |
| 77 | PUT | /disputes/:id/review | Disputes | Assign reviewer |
| 78 | PUT | /disputes/:id/resolve | Disputes | Resolve dispute |
| 79 | POST | /disputes/:id/evidences | Evidences | Submit evidence |
| 80 | GET | /disputes/:id/evidences | Evidences | Get dispute evidences |
| 81 | DELETE | /evidences/:id | Evidences | Delete evidence |
| 82 | POST | /reviews | Reviews | Create review |
| 83 | GET | /reviews/:id | Reviews | Get review by ID |
| 84 | GET | /users/:id/reviews | Reviews | Get user reviews |
| 85 | GET | /contracts/:id/reviews | Reviews | Get contract reviews |
| 86 | GET | /notifications | Notifications | Get user notifications |
| 87 | PUT | /notifications/:id/read | Notifications | Mark as read |
| 88 | DELETE | /notifications/:id | Notifications | Delete notification |
| 89 | POST | /reports | Reports | Create report |
| 90 | GET | /reports | Reports | Get all reports |
| 91 | PUT | /reports/:id/resolve | Reports | Resolve report |
| 92 | GET | /admin/users | Admin | Get all users (admin) |
| 93 | PUT | /admin/users/:id/ban | Admin | Ban user |
| 94 | GET | /admin/supervisors | Admin | Get supervisors (admin) |
| 95 | PUT | /admin/supervisors/:id/approve | Admin | Approve supervisor |
| 96 | GET | /admin/statistics | Admin | Get statistics |

---


---

## 20. WebSocket - Realtime Chat

The chat system supports realtime messaging via Socket.IO alongside the REST API.

### Connection

```
URL: http://localhost:3000/chat
Query: { userId: "1" }
```

**Frontend example:**
```js
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000/chat', {
  query: { userId: '1' }
});
```

---

### Client -> Server Events

#### joinConversation

Join a conversation room to receive realtime messages.

```json
{ "cuocHoiThoaiId": 1 }
```

Call this when user opens a conversation.

---

#### leaveConversation

Leave a conversation room.

```json
{ "cuocHoiThoaiId": 1 }
```

Call this when user navigates away from a conversation.

---

#### sendMessage

Send a message via WebSocket (saves to DB + broadcasts to room).

```json
{
  "cuocHoiThoaiId": 1,
  "nguoiGuiId": 1,
  "noiDung": "Hello!",
  "loaiTin": "VanBan"
}
```

| Field | Required | Description |
|-------|----------|-------------|
| cuocHoiThoaiId | Yes | Conversation ID |
| nguoiGuiId | Yes | Sender user ID (must be a member) |
| noiDung | Yes | Message content |
| loaiTin | No | VanBan (default) / File / HinhAnh |

On success, server emits `newMessage` to the room.
On error, server emits `error` to the sender.

---

#### markAsRead

Mark all messages (not sent by userId) as read.

```json
{ "cuocHoiThoaiId": 1, "userId": 1 }
```

Server emits `messagesRead` to the room.

---

#### typing

Typing indicator.

```json
{ "cuocHoiThoaiId": 1, "userId": 1, "isTyping": true }
```

Server broadcasts `userTyping` to other members in the room.

---

### Server -> Client Events

#### newMessage

Emitted to all clients in the conversation room when a new message is sent.

```json
{
  "tinNhanId": 4,
  "cuocHoiThoaiId": 1,
  "nguoiGui": {
    "taiKhoanId": 1,
    "hoTen": "Nguyen Van An",
    "email": "manhhuy2@gmail.com"
  },
  "noiDung": "Hello!",
  "loaiTin": "VanBan",
  "daDoc": false,
  "ngayTao": "2026-04-24T09:00:00.000Z"
}
```

---

#### messageNotification

Emitted to the other member when they are NOT in the conversation room (for unread badge/notification).

```json
{
  "cuocHoiThoaiId": 1,
  "message": { ... same as newMessage ... }
}
```

---

#### messagesRead

Emitted to the room when someone marks messages as read.

```json
{
  "cuocHoiThoaiId": 1,
  "userId": 1,
  "count": 5
}
```

---

#### userTyping

Emitted to other members in the room when someone is typing.

```json
{
  "cuocHoiThoaiId": 1,
  "userId": 1,
  "isTyping": true
}
```

---

#### error

Emitted to the sender when an operation fails.

```json
{ "message": "Cuoc hoi thoai khong ton tai" }
```

---

### Usage Flow

1. **Connect** when user logs in: `io('/chat', { query: { userId } })`
2. **Join room** when opening a conversation: emit `joinConversation`
3. **Send messages** via `sendMessage` event (realtime) or `POST /chat/:id/messages` (REST)
4. **Receive messages** by listening to `newMessage` event
5. **Mark as read** when user views messages: emit `markAsRead`
6. **Show typing** indicator: emit `typing` with `isTyping: true/false`
7. **Leave room** when switching conversations: emit `leaveConversation`
8. **Listen to `messageNotification`** for unread badges on conversation list

> Note: REST endpoints (`GET /chat/:id/messages`, `POST /chat`) still work for loading history, creating conversations, etc. WebSocket is only for realtime updates.
