# FRAS-TMDT Backend API Guide

**Base URL:** `http://localhost:8080`

---

## BREAKING CHANGES - Schema Refactor

### All Business Foreign Keys Now Use TaiKhoanID (User Account ID)

The entire database schema has been refactored. The key changes are:

1. **ALL business foreign keys now use `TaiKhoanID` directly** (the user account ID from the `TaiKhoan` table).
2. Tables `NguoiThue`, `Freelancer`, `DonViGiamSat` are now **ONLY profile/supplementary tables** - they store extra profile data but are NOT used as foreign keys in business tables.
3. **Creating a job (YeuCau):** You pass `nguoiThueId` which is the **TaiKhoanID** of the job creator, NOT a NguoiThue table ID.
4. **Creating a proposal (BaoGia):** You pass `freelancerId` which is the **TaiKhoanID** of the freelancer, NOT a Freelancer table ID.
5. **Contracts (CongViec):** `freelancerId` and `nguoiThueId` fields ARE TaiKhoanIDs directly.
6. **Supervision:** `giamSatId` in jobs, contracts, disputes, and contract details is the supervisor's **TaiKhoanID**, not `DonViGiamSat.GiamSatID`.
7. **Role determination:** The system determines user role by checking `TaiKhoan.VaiTro` field (values: `NguoiThue`, `Freelancer`, `DonViGiamSat`, `Admin`, `KhachVangLai`).

### Migration Summary

| Before (Old Schema) | After (New Schema) |
|---|---|
| `YeuCau.NguoiThueID` -> `NguoiThue.NguoiThueID` | `YeuCau.TaiKhoanID` -> `TaiKhoan.TaiKhoanID` |
| `BaoGia.FreelancerID` -> `Freelancer.FreelancerID` | `BaoGia.TaiKhoanID` -> `TaiKhoan.TaiKhoanID` |
| `CongViec.FreelancerID` -> `Freelancer.FreelancerID` | `CongViec.FreelancerID` -> `TaiKhoan.TaiKhoanID` |
| `CongViec.NguoiThueID` -> `NguoiThue.NguoiThueID` | `CongViec.NguoiThueID` -> `TaiKhoan.TaiKhoanID` |
| `CongViec.GiamSatID` -> supervisor profile ID | `CongViec.GiamSatID` -> `TaiKhoan.TaiKhoanID` |

### What This Means for Frontend

- When calling any API, use the **logged-in user's `taiKhoanId`** as the identifier.
- No need to look up NguoiThue/Freelancer profile IDs for business operations.
- Use `giamSat.giamSatId` or `giamSat.taiKhoanId` from contract responses as the supervisor account ID. Both fields return the same `TaiKhoanID`.
- Profile tables are only needed for displaying extra profile info (company name, experience, etc.).

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [Users](#2-users)
3. [Jobs (YeuCau)](#3-jobs)
4. [Proposals (BaoGia)](#4-proposals)
5. [Contracts (CongViec)](#5-contracts)
6. [Contract Flow](#6-contract-flow)
7. [Progress (TienDo)](#7-progress)
8. [Freelancers](#8-freelancers)
9. [Skills (KyNang)](#9-skills)
10. [Categories (LoaiDichVu)](#10-categories)
11. [Supervisors (DonViGiamSat)](#11-supervisors)
12. [Chat](#12-chat)
13. [WebSocket Chat Gateway](#13-websocket-chat-gateway)
14. [Recommendations](#14-recommendations)
15. [Payments (ThanhToan)](#15-payments)
16. [Disputes (TranhChap)](#16-disputes)
17. [Evidences (BangChung)](#17-evidences)
18. [Reviews (DanhGia)](#18-reviews)
19. [Notifications (ThongBao)](#19-notifications)
20. [Reports (BaoCao)](#20-reports)
21. [Admin](#21-admin)

---

## 1. Authentication

### POST /auth/register

Register a new user account.

**Request Body:**

| Field | Required | Description |
|---|---|---|
| tenDangNhap | Yes | Username |
| matKhau | Yes | Password |
| email | Yes | Email address |
| hoTen | Yes | Full name |
| soDienThoai | Optional | Phone number |
| gioiTinh | Optional | Gender: `Nam`, `Nu`, `Khac` |
| diaChi | Optional | Address |
| vaiTro | Optional | Role: `NguoiThue`, `Freelancer`, `DonViGiamSat`, `KhachVangLai` (default: `KhachVangLai`) |
| tenDonVi | Optional | Company/unit name (for DonViGiamSat role) |

**Response (200):**
```json
{
  "message": "Dang ky thanh cong",
  "user": {
    "taiKhoanId": 1,
    "tenDangNhap": "nguyenvana",
    "email": "nguyenvana@email.com",
    "hoTen": "Nguyen Van A",
    "soDienThoai": "0901234567",
    "gioiTinh": "Nam",
    "diaChi": "Ha Noi",
    "vaiTro": "NguoiThue",
    "trangThai": "HoatDong",
    "ngayTao": "2025-01-01T00:00:00.000Z"
  }
}
```

**Error Codes:**
- `400` - Missing required fields / Email already exists / Username already exists

---

### POST /auth/login

Login with email and password.

**Request Body:**

| Field | Required | Description |
|---|---|---|
| email | Yes | Email address |
| matKhau | Yes | Password |

**Response (200):**

```json
{
  "message": "Dang nhap thanh cong",
  "user": {
    "taiKhoanId": 1,
    "tenDangNhap": "nguyenvana",
    "email": "nguyenvana@email.com",
    "hoTen": "Nguyen Van A",
    "soDienThoai": "0901234567",
    "gioiTinh": "Nam",
    "diaChi": "Ha Noi",
    "vaiTro": "NguoiThue",
    "trangThai": "HoatDong",
    "ngayTao": "2025-01-01T00:00:00.000Z"
  }
}
```

**Error Codes:**
- `400` - Missing email or password
- `401` - Invalid credentials
- `403` - Account is banned/inactive

---

## 2. Users

### GET /users

Get all users.

**Response (200):**

```json
{
  "total": 5,
  "users": [
    {
      "taiKhoanId": 1,
      "tenDangNhap": "nguyenvana",
      "email": "nguyenvana@email.com",
      "hoTen": "Nguyen Van A",
      "soDienThoai": "0901234567",
      "gioiTinh": "Nam",
      "diaChi": "Ha Noi",
      "vaiTro": "NguoiThue",
      "trangThai": "HoatDong",
      "ngayTao": "2025-01-01T00:00:00.000Z",
      "ngayCapNhat": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### GET /users/search?keyword=nguyen

Search users by keyword (matches name or email).

**Query Parameters:**

| Param | Required | Description |
|---|---|---|
| keyword | Optional | Search keyword |

**Response:** Same format as GET /users.

---

### GET /users/:id

Get a single user by TaiKhoanID.

**Response (200):**

```json
{
  "user": {
    "taiKhoanId": 1,
    "tenDangNhap": "nguyenvana",
    "email": "nguyenvana@email.com",
    "hoTen": "Nguyen Van A",
    "soDienThoai": "0901234567",
    "gioiTinh": "Nam",
    "diaChi": "Ha Noi",
    "vaiTro": "NguoiThue",
    "trangThai": "HoatDong",
    "ngayTao": "2025-01-01T00:00:00.000Z",
    "ngayCapNhat": "2025-01-01T00:00:00.000Z"
  }
}
```

**Error Codes:**
- `404` - User not found

---

### GET /users/:id/profile

Get user profile with role-specific supplementary data.

**Response (200) - Example for NguoiThue:**

```json
{
  "user": {
    "taiKhoanId": 1,
    "tenDangNhap": "nguyenvana",
    "email": "nguyenvana@email.com",
    "hoTen": "Nguyen Van A",
    "soDienThoai": "0901234567",
    "gioiTinh": "Nam",
    "diaChi": "Ha Noi",
    "vaiTro": "NguoiThue",
    "trangThai": "HoatDong",
    "ngayTao": "2025-01-01T00:00:00.000Z",
    "ngayCapNhat": "2025-01-01T00:00:00.000Z"
  },
  "profile": {
    "role": "NguoiThue",
    "nguoiThue": {
      "nguoiThueId": 1,
      "congTy": "ABC Corp",
      "moTa": "Looking for developers",
      "diemTinCay": "4.5",
      "tongYeuCau": 10,
      "tyLeHoanThanh": "80.00"
    }
  }
}
```

**Response (200) - Example for Freelancer:**

```json
{
  "user": { "..." : "..." },
  "profile": {
    "role": "Freelancer",
    "freelancer": {
      "freelancerId": 1,
      "kinhNghiem": 5,
      "chuyenGia": "Web Development",
      "kyNang": "React, Node.js",
      "xepHang": "4.8",
      "soDu": "5000000",
      "xacThucEmail": true,
      "xacThucSDT": true,
      "tongCongViec": 15,
      "tyLeHoanThanh": "93.33"
    }
  }
}
```

**Error Codes:**
- `404` - User not found

---

### GET /users/:id/jobs

Get all jobs created by a user (by TaiKhoanID).

**Response:** Same format as GET /jobs.

---

### GET /users/:id/contracts

Get all contracts for a user as client, freelancer, or assigned supervisor. The `id` parameter is `TaiKhoanID`.

**Response:** Same format as GET /contracts.

---

### GET /users/:id/conversations

Get all chat conversations for a user. An accepted supervisor also receives conversations linked to contracts they supervise.

**Response:** Same format as conversation list.

---

### PUT /users/:id

Update user information.

**Request Body:**

| Field | Required | Description |
|---|---|---|
| tenDangNhap | Optional | Username |
| email | Optional | Email |
| hoTen | Optional | Full name |
| soDienThoai | Optional | Phone number |
| gioiTinh | Optional | Gender: `Nam`, `Nu`, `Khac` |
| diaChi | Optional | Address |
| trangThai | Optional | Status: `HoatDong`, `BiKhoa`, `ChoDuyet`, `DaBi` |

**Response (200):**

```json
{
  "message": "Cap nhat thanh cong",
  "user": { "...": "same as UserDto" }
}
```

**Error Codes:**
- `400` - No valid fields to update
- `404` - User not found

---

### DELETE /users/:id

Soft-delete (ban) a user account.

**Response (200):**

```json
{
  "message": "Xoa tai khoan thanh cong",
  "userId": 1,
  "trangThai": "BiKhoa"
}
```

**Error Codes:**
- `404` - User not found

---

## 3. Jobs

`YeuCau` represents a hiring request, while `CongViec` represents the work created after a freelancer is selected.

### Hiring Request Lifecycle

| Status | Meaning | How it is reached |
|---|---|---|
| `DangNhanHoSo` | The request accepts new freelancer proposals | Set automatically by `POST /jobs` |
| `DaDong` | No new proposals are accepted; existing proposals can still be selected | `PUT /jobs/:id` with `{ "trangThai": "DaDong" }` |
| `DaChot` | A freelancer is selected and a corresponding `CongViec` has been created | Set automatically by `POST /contracts/accept-proposal` |
| `DaHuy` | The hiring request is cancelled | `DELETE /jobs/:id` or `PUT /jobs/:id` with `{ "trangThai": "DaHuy" }` |

Allowed manual transitions are `DangNhanHoSo -> DaDong`, `DangNhanHoSo -> DaHuy`, and `DaDong -> DaHuy`. The `DaChot` state cannot be set directly from the jobs API.

### GET /jobs

Get all jobs.

**Response (200):**

```json
{
  "total": 3,
  "jobs": [
    {
      "yeuCauId": 1,
      "nguoiThueId": 1,
      "loaiDichVuId": 2,
      "tieuDe": "Build a React website",
      "moTa": "Need a responsive website...",
      "nganSachMin": "5000000",
      "nganSachMax": "10000000",
      "thoiHan": "2025-03-01T00:00:00.000Z",
      "trangThai": "DangNhanHoSo",
      "soLuongBaoGia": 3,
      "yeuCauGiamSat": false,
      "giamSatId": null,
      "ngayTao": "2025-01-15T00:00:00.000Z",
      "ngayCapNhat": "2025-01-15T00:00:00.000Z",
      "nguoiThue": {
        "taiKhoanId": 1,
        "hoTen": "Nguyen Van A",
        "email": "nguyenvana@email.com"
      },
      "loaiDichVu": {
        "loaiDichVuId": 2,
        "tenLoai": "Web Development"
      },
      "giamSat": null,
      "kyNangs": [
        { "kyNangId": 1, "tenKyNang": "React" },
        { "kyNangId": 2, "tenKyNang": "TypeScript" }
      ]
    }
  ]
}
```

---

### GET /jobs/search

Search jobs with filters.

**Query Parameters:**

| Param | Required | Description |
|---|---|---|
| keyword | Optional | Search in title and description |
| category | Optional | Category ID (LoaiDichVuID) |
| budget | Optional | Budget amount (finds jobs where min <= budget <= max) |
| skills | Optional | Comma-separated skill IDs (e.g. "1,2,3") |

**Response:** Same format as GET /jobs.

---

### GET /jobs/:id

Get a single job by ID.

**Response (200):**

```json
{
  "job": { "...": "same as job object above" }
}
```

**Error Codes:**
- `404` - Job not found

---

### GET /jobs/:id/proposals

Get all proposals for a specific job.

**Response:** Same format as proposals list.

---

### GET /jobs/:id/skills

Get skills required for a job.

**Response (200):**

```json
{
  "message": "Lay danh sach ky nang thanh cong",
  "kyNangs": [
    { "kyNangId": 1, "tenKyNang": "React" },
    { "kyNangId": 2, "tenKyNang": "Node.js" }
  ]
}
```

---

### POST /jobs

Create a new hiring request in status `DangNhanHoSo`. **IMPORTANT: `nguoiThueId` is the TaiKhoanID of the creator.**

**Request Body:**

| Field | Required | Description |
|---|---|---|
| nguoiThueId | Yes | **TaiKhoanID** of the job creator (NOT NguoiThue table ID) |
| loaiDichVuId | Yes | Category ID |
| tieuDe | Yes | Job title |
| moTa | Yes | Job description |
| nganSachMin | Yes | Minimum budget (>= 0) |
| nganSachMax | Yes | Maximum budget (>= nganSachMin) |
| thoiHan | Yes | Deadline (ISO date string) |
| yeuCauGiamSat | Optional | Whether supervision is required (boolean) |
| giamSatId | Optional | Supervisor TaiKhoanID (auto-sets yeuCauGiamSat=true) |
| kyNangIds | Optional | Array of skill IDs required |

**Response (201):**

```json
{
  "message": "Tao yeu cau thanh cong",
  "job": { "...": "full job object with details" }
}
```

**Error Codes:**
- `400` - Invalid input / User not found / Category not found / Budget validation failed / Invalid skills

---

### PUT /jobs/:id

Update a job.

**Request Body:**

| Field | Required | Description |
|---|---|---|
| loaiDichVuId | Optional | Category ID |
| tieuDe | Optional | Job title |
| moTa | Optional | Job description |
| nganSachMin | Optional | Minimum budget |
| nganSachMax | Optional | Maximum budget |
| thoiHan | Optional | Deadline (ISO date string) |
| trangThai | Optional | Status: `DangNhanHoSo`, `DaDong`, `DaHuy`. `DaChot` is set only by accepting a proposal. |
| yeuCauGiamSat | Optional | Whether supervision is required |

**Response (200):**

```json
{
  "message": "Cap nhat yeu cau thanh cong",
  "job": { "...": "full job object" }
}
```

**Error Codes:**
- `400` - No valid fields / Invalid status or status transition / Budget validation
- `404` - Job not found

---

### PUT /jobs/:id/skills

Replace all skills for a job (bulk set).

**Request Body:**

| Field | Required | Description |
|---|---|---|
| kyNangIds | Yes | Array of skill IDs (empty array removes all) |

**Response (200):**

```json
{
  "message": "Cap nhat ky nang yeu cau thanh cong",
  "kyNangs": [
    { "kyNangId": 1, "tenKyNang": "React" }
  ]
}
```

**Error Codes:**
- `400` - Invalid skill IDs
- `404` - Job not found

---

### POST /jobs/:id/skills/:kyNangId

Add a single skill to a job.

**Response (200):**

```json
{
  "message": "Lay danh sach ky nang thanh cong",
  "kyNangs": [
    { "kyNangId": 1, "tenKyNang": "React" },
    { "kyNangId": 3, "tenKyNang": "Docker" }
  ]
}
```

**Error Codes:**
- `400` - Invalid skill ID
- `404` - Job not found

---

### DELETE /jobs/:id/skills/:kyNangId

Remove a single skill from a job.

**Response:** Same format as POST /jobs/:id/skills/:kyNangId.

---

### DELETE /jobs/:id

Cancel a hiring request (sets status to `DaHuy`). Requests already in `DaChot` cannot be cancelled through this endpoint.

**Response (200):**

```json
{
  "message": "Xoa yeu cau thanh cong",
  "jobId": 1
}
```

**Error Codes:**
- `400` - Request has already been finalized or cancelled
- `404` - Job not found

---

## 4. Proposals

### GET /proposals/:id

Get a single proposal by ID.

**Response (200):**

```json
{
  "proposal": {
    "baoGiaId": 1,
    "yeuCauId": 1,
    "freelancerId": 2,
    "giaDeXuat": "7000000",
    "thoiGianThucHien": 30,
    "noiDung": "I can build this in 30 days...",
    "trangThai": "DaGui",
    "ngayTao": "2025-01-16T00:00:00.000Z",
    "ngayCapNhat": "2025-01-16T00:00:00.000Z",
    "freelancer": {
      "freelancerId": 1,
      "taiKhoanId": 2,
      "hoTen": "Tran Van B",
      "email": "tranvanb@email.com",
      "kinhNghiem": 5,
      "kyNang": "React, Node.js",
      "kyNangs": [
        { "kyNangId": 1, "tenKyNang": "React" }
      ],
      "xepHang": "4.8"
    },
    "yeuCau": {
      "yeuCauId": 1,
      "tieuDe": "Build a React website",
      "nguoiThueId": 1
    }
  }
}
```

**Error Codes:**
- `404` - Proposal not found

---

### POST /proposals

Create a new proposal. This endpoint only accepts proposals while the hiring request is in `DangNhanHoSo`. **IMPORTANT: `freelancerId` is the TaiKhoanID of the freelancer.**

**Request Body:**

| Field | Required | Description |
|---|---|---|
| yeuCauId | Yes | Job ID to submit proposal for |
| freelancerId | Yes | **TaiKhoanID** of the freelancer (NOT Freelancer table ID) |
| giaDeXuat | Yes | Proposed price |
| thoiGianThucHien | Yes | Estimated days to complete |
| noiDung | Optional | Proposal description/cover letter |

**Response (201):**

```json
{
  "message": "Tao bao gia thanh cong",
  "proposal": { "...": "full proposal object with details" }
}
```

**Error Codes:**
- `400` - Invalid input / Job not found / Request is not accepting proposals / Freelancer not found / Already submitted
- `404` - Job not found

---

### PUT /proposals/:id

Update a proposal.

**Request Body:**

| Field | Required | Description |
|---|---|---|
| giaDeXuat | Optional | Updated price |
| thoiGianThucHien | Optional | Updated timeline (days) |
| noiDung | Optional | Updated description |
| trangThai | Optional | Status: `DaGui`, `DuocChon`, `TuChoi`, `HetHan` |

**Response (200):**

```json
{
  "message": "Cap nhat bao gia thanh cong",
  "proposal": { "...": "full proposal object" }
}
```

**Error Codes:**
- `400` - No valid fields to update
- `404` - Proposal not found

---

### DELETE /proposals/:id

Delete a proposal.

**Response (200):**

```json
{
  "message": "Xoa bao gia thanh cong",
  "proposalId": 1
}
```

**Error Codes:**
- `404` - Proposal not found

---

## 5. Contracts

### GET /contracts

Get all contracts.

**Response (200):**

```json
{
  "total": 1,
  "contracts": [
    {
      "congViecId": 1,
      "yeuCauId": 1,
      "freelancerId": 13,
      "nguoiThueId": 1,
      "giaThoa": "32000000",
      "thoiGianThoa": 30,
      "trangThai": "DangThucHien",
      "ngayBatDau": "2026-05-02T09:00:00.000Z",
      "ngayKetThuc": null,
      "giamSatId": 21,
      "trangThaiGiamSat": "DangGiamSat",
      "phiGiamSat": "450000",
      "ngayTao": "2026-05-02T08:30:00.000Z",
      "yeuCau": {
        "yeuCauId": 1,
        "tieuDe": "Xây dựng API NestJS",
        "moTa": "Cần xây dựng hệ thống API RESTful quản lý đơn hàng và thanh toán."
      },
      "freelancer": {
        "freelancerId": 13,
        "taiKhoanId": 13,
        "hoTen": "User 13",
        "email": "dev1@freelancer.vn"
      },
      "nguoiThue": {
        "nguoiThueId": 1,
        "taiKhoanId": 1,
        "hoTen": "Nguyen Van An",
        "email": "manhhuy2@gmail.com"
      },
      "giamSat": {
        "giamSatId": 21,
        "taiKhoanId": 21,
        "tenDonVi": "ISO Quality Control",
        "email": "iso@giamsat.vn"
      }
    }
  ]
}
```

**Identifier Note:** `freelancerId`, `nguoiThueId`, top-level `giamSatId`, and `giamSat.giamSatId` are all `TaiKhoanID` values. For backward-friendly frontend mapping, `giamSat.taiKhoanId` is also returned and equals `giamSat.giamSatId`.

---

### GET /contracts/:id

Get a single contract.

**Response:** Same as single contract object wrapped in `{ "contract": {...} }`.

**Error Codes:**
- `404` - Contract not found

---

### GET /contracts/:id/detail

Get contract with full details (same as GET /contracts/:id but may include more nested data).

**Response:** Same format as GET /contracts/:id. The nested `giamSat` object includes `giamSatId`, `taiKhoanId`, `tenDonVi`, and `email`.

---

### GET /contracts/:id/progress

Get all progress reports for a contract.

**Response:** Same format as progress list.

---

### GET /contracts/:id/conversations

Get all chat conversations for a contract.

When a contract has an accepted supervisor (`trangThaiGiamSat` is `DangGiamSat` or `HoanThanh`), that supervisor can access and send messages in the contract conversations through their `TaiKhoanID`.

**Response:** Same format as conversation list.

---

### POST /contracts

Direct contract creation is disabled. Use `POST /contracts/accept-proposal` to finalize a freelancer and create the corresponding contract atomically.

**Error Codes:**
- `400` - Contracts must be created by accepting a proposal

---

### PUT /contracts/:id/status

Update contract status.

**Request Body:**

| Field | Required | Description |
|---|---|---|
| trangThai | Yes | Status: `MoiTao`, `DangThucHien`, `HoanThanh`, `DaHuy`, `TranhChap` |

**Response (200):**

```json
{
  "message": "Cap nhat trang thai thanh cong",
  "contract": { "...": "full contract object" }
}
```

**Error Codes:**
- `400` - Invalid status
- `404` - Contract not found

---

### POST /contracts/:id/supervisor

Select a supervisor for a contract.

**Request Body:**

| Field | Required | Description |
|---|---|---|
| giamSatId | Yes | Supervisor's **TaiKhoanID** |
| phiGiamSat | Yes | Supervision fee amount |

**Response (200):**

```json
{
  "message": "Chon giam sat thanh cong",
  "yeuCauGiamSatId": 1,
  "trangThai": "ChoDuyet"
}
```

**Error Codes:**
- `400` - Supervisor not found / Contract already has supervisor
- `404` - Contract not found

---

### PUT /contracts/:id/supervisor/accept

Supervisor accepts the supervision request.

**Response (200):**

```json
{
  "message": "Chap nhan don vi giam sat thanh cong",
  "yeuCauGiamSatId": 1,
  "trangThai": "DaChapNhan"
}
```

---

### PUT /contracts/:id/supervisor/reject

Supervisor rejects the supervision request.

**Response (200):**

```json
{
  "message": "Giam sat da tu choi",
  "yeuCauGiamSatId": 1,
  "trangThai": "TuChoi"
}
```

---

## 6. Contract Flow

This section describes the complete flow from finalizing a freelancer proposal to completing a contract with escrow payment.

### Flow Overview

1. **Client accepts proposal** -> Hiring request becomes `DaChot`, contract created, escrow payment held
2. **Work is done** -> Progress reports submitted
3. **Confirm completion** -> Each party confirms (Freelancer -> Supervisor -> Client)
4. **All confirmed** -> Escrow released (Freelancer gets 95%, System takes 5% fee)

---

### POST /contracts/accept-proposal

Accept a proposal from a hiring request in `DangNhanHoSo` or `DaDong`, finalize the freelancer selection, and create a contract with escrow payment.

**What happens internally:**
1. Creates a contract (CongViec) with status `DangThucHien`
2. Creates an escrow payment (100% agreed price + supervisor fee)
3. Creates the contract conversation between the client and selected freelancer
4. Creates a pending supervision request when `giamSatId` is provided
5. Updates the accepted proposal status to `DuocChon`
6. Rejects all other proposals for the same job (`TuChoi`)
7. Finalizes the hiring request (status -> `DaChot`)

**Request Body:**

| Field | Required | Description |
|---|---|---|
| baoGiaId | Yes | Proposal ID to accept |
| nguoiThueId | Yes | Client's **TaiKhoanID** (must own the job) |
| giamSatId | Optional | Supervisor's **TaiKhoanID** (for example, `21`; not the profile `GiamSatID`) |
| phiGiamSat | Optional | Supervisor fee (default: 0) |

**Response (200):**

```json
{
  "message": "Chap nhan bao gia thanh cong. Tien da duoc giu boi he thong (escrow).",
  "congViecId": 1,
  "escrow": {
    "giaThoa": "7000000",
    "phiGiamSat": "500000",
    "tongThanhToan": "7500000",
    "thanhToanId": 1
  }
}
```

**Error Codes:**
- `400` - Proposal already processed / User doesn't own the job / Request already finalized or cancelled / Invalid user
- `404` - Proposal not found

---

### PUT /contracts/:id/confirm-completion

Confirm contract completion (called by each party separately).

**Confirmation Order:**
1. Freelancer confirms first
2. Supervisor confirms (if contract has supervisor)
3. Client confirms last -> triggers payment release

**Request Body:**

| Field | Required | Description |
|---|---|---|
| role | Yes | Who is confirming: `Freelancer`, `GiamSat`, or `NguoiThue` |
| userId | Yes | **TaiKhoanID** of the person confirming |

**Response (200) - Partial confirmation:**

```json
{
  "message": "Freelancer da xac nhan hoan thanh.",
  "congViecId": 1,
  "freelancerXacNhan": true,
  "giamSatXacNhan": false,
  "nguoiThueXacNhan": false,
  "released": false
}
```

**Response (200) - All confirmed (payment released):**

```json
{
  "message": "Tat ca cac ben da xac nhan. Tien da duoc giai ngan.",
  "congViecId": 1,
  "freelancerXacNhan": true,
  "giamSatXacNhan": true,
  "nguoiThueXacNhan": true,
  "released": true,
  "disbursement": {
    "freelancerNhan": "6650000",
    "giamSatNhan": "500000",
    "phiHeThong": "350000"
  }
}
```

**Payment Release Logic:**
- Freelancer receives: `giaThoa - (giaThoa * 5%)` = 95% of agreed price
- Supervisor receives: `phiGiamSat` (full amount)
- System fee: `giaThoa * 5%`
- Contract status changes to `HoanThanh`
- Hiring request remains `DaChot`; completion belongs to the contract lifecycle

**Error Codes:**
- `400` - Wrong role/userId / Already confirmed / Prerequisites not met / No escrow
- `404` - Contract not found

---

## 7. Progress

### GET /progress/:id

Get a single progress report.

**Response (200):**

```json
{
  "progress": {
    "tienDoId": 1,
    "congViecId": 1,
    "freelancerId": 2,
    "tieuDe": "Completed homepage design",
    "moTa": "Finished the responsive layout",
    "phanTram": 30,
    "tepDinhKem": "https://example.com/file.pdf",
    "xacNhanBoi": null,
    "trangThaiXacNhan": "ChuaXacNhan",
    "ngayTao": "2025-01-25T00:00:00.000Z",
    "congViec": {
      "congViecId": 1,
      "yeuCauId": 1,
      "giaThoa": "7000000"
    },
    "freelancer": {
      "freelancerId": 2,
      "taiKhoanId": 2,
      "hoTen": "Tran Van B",
      "email": "tranvanb@email.com"
    },
    "donViGiamSat": null
  }
}
```

**Error Codes:**
- `404` - Progress report not found

---

### POST /progress

Create a progress report.

**Request Body:**

| Field | Required | Description |
|---|---|---|
| congViecId | Yes | Contract ID |
| freelancerId | Yes | Freelancer's **TaiKhoanID** |
| tieuDe | Yes | Progress title |
| moTa | Optional | Description |
| phanTram | Yes | Completion percentage (0-100) |
| tepDinhKem | Optional | Attachment URL |

**Response (201):**

```json
{
  "message": "Tao tien do thanh cong",
  "progress": { "...": "full progress object" }
}
```

**Error Codes:**
- `400` - Invalid input / Contract not found / Freelancer mismatch

---

### PUT /progress/:id

Update a progress report.

**Request Body:**

| Field | Required | Description |
|---|---|---|
| tieuDe | Optional | Title |
| moTa | Optional | Description |
| phanTram | Optional | Percentage (0-100) |
| tepDinhKem | Optional | Attachment URL |
| trangThaiXacNhan | Optional | Status: `ChuaXacNhan`, `DaXacNhan`, `TuChoi` |

**Response (200):**

```json
{
  "message": "Cap nhat tien do thanh cong",
  "progress": { "...": "full progress object" }
}
```

**Error Codes:**
- `400` - No valid fields
- `404` - Progress not found

---

### DELETE /progress/:id

Delete a progress report.

**Response (200):**

```json
{
  "message": "Xoa tien do thanh cong",
  "progressId": 1
}
```

**Error Codes:**
- `404` - Progress not found

---

## 8. Freelancers

### GET /freelancers/:id/proposals

Get all proposals submitted by a freelancer (by TaiKhoanID).

**Response:** Same format as proposals list.

---

### GET /freelancers/:id/skills

Get skills of a freelancer.

**Response (200):**

```json
{
  "message": "Lay danh sach ky nang thanh cong",
  "freelancerId": 2,
  "kyNangs": [
    { "kyNangId": 1, "tenKyNang": "React" },
    { "kyNangId": 2, "tenKyNang": "Node.js" }
  ]
}
```

---

### PUT /freelancers/:id/skills

Replace all skills for a freelancer (bulk set).

**Request Body:**

| Field | Required | Description |
|---|---|---|
| kyNangIds | Yes | Array of skill IDs |

**Response:** Same format as GET /freelancers/:id/skills.

---

### POST /freelancers/:id/skills/:kyNangId

Add a single skill to a freelancer.

**Response:** Same format as skills response.

---

### DELETE /freelancers/:id/skills/:kyNangId

Remove a single skill from a freelancer.

**Response:** Same format as skills response.

---

## 9. Skills

### GET /skills

Get all skills.

**Response (200):**

```json
{
  "total": 10,
  "skills": [
    { "kyNangId": 1, "tenKyNang": "React", "moTa": "React.js framework" },
    { "kyNangId": 2, "tenKyNang": "Node.js", "moTa": "Server-side JavaScript" }
  ]
}
```

---

### GET /skills/:id

Get a single skill.

**Response (200):**

```json
{
  "skill": { "kyNangId": 1, "tenKyNang": "React", "moTa": "React.js framework" }
}
```

**Error Codes:**
- `404` - Skill not found

---

### POST /skills

Create a new skill.

**Request Body:**

| Field | Required | Description |
|---|---|---|
| tenKyNang | Yes | Skill name |
| moTa | Optional | Description |

**Response (201):**

```json
{
  "message": "Tao ky nang thanh cong",
  "skill": { "kyNangId": 3, "tenKyNang": "Docker", "moTa": "Containerization" }
}
```

**Error Codes:**
- `400` - Missing name / Skill already exists

---

### PUT /skills/:id

Update a skill.

**Request Body:**

| Field | Required | Description |
|---|---|---|
| tenKyNang | Optional | Skill name |
| moTa | Optional | Description |

**Response (200):**

```json
{
  "message": "Cap nhat ky nang thanh cong",
  "skill": { "kyNangId": 1, "tenKyNang": "React.js", "moTa": "Updated description" }
}
```

**Error Codes:**
- `404` - Skill not found

---

### DELETE /skills/:id

Delete a skill.

**Response (200):**

```json
{
  "message": "Xoa ky nang thanh cong",
  "skillId": 1
}
```

**Error Codes:**
- `404` - Skill not found

---

## 10. Categories

### GET /categories

Get all service categories.

`hinhAnh` stores a simple professional icon key for the frontend icon set (for example, Lucide icons), not an image file URL. Seed examples include `palette`, `server-cog`, `megaphone`, `smartphone`, and `shield-check`.

**Response (200):**

```json
{
  "total": 5,
  "categories": [
    { "loaiDichVuId": 1, "tenLoai": "Thiet ke UI/UX", "moTa": "Thiet ke giao dien web va mobile", "hinhAnh": "palette" },
    { "loaiDichVuId": 2, "tenLoai": "Lap trinh backend", "moTa": "Phat trien API, he thong nghiep vu", "hinhAnh": "server-cog" }
  ]
}
```

---

### GET /categories/:id

Get a single category.

**Response (200):**

```json
{
  "category": { "loaiDichVuId": 1, "tenLoai": "Thiet ke UI/UX", "moTa": "Thiet ke giao dien web va mobile", "hinhAnh": "palette" }
}
```

**Error Codes:**
- `404` - Category not found

---

### POST /categories

Create a new category.

**Request Body:**

| Field | Required | Description |
|---|---|---|
| tenLoai | Yes | Category name |
| moTa | Optional | Description |
| hinhAnh | Optional | Frontend icon key, e.g. `brain-circuit` |

**Response (201):**

```json
{
  "message": "Tao loai dich vu thanh cong",
  "category": { "loaiDichVuId": 6, "tenLoai": "AI/ML", "moTa": "Machine learning services", "hinhAnh": "brain-circuit" }
}
```

**Error Codes:**
- `400` - Missing name / Already exists

---

### PUT /categories/:id

Update a category.

**Request Body:**

| Field | Required | Description |
|---|---|---|
| tenLoai | Optional | Category name |
| moTa | Optional | Description |
| hinhAnh | Optional | Frontend icon key, e.g. `panels-top-left` |

**Response (200):**

```json
{
  "message": "Cap nhat loai dich vu thanh cong",
  "category": { "loaiDichVuId": 1, "tenLoai": "Full-Stack Web", "moTa": "Updated", "hinhAnh": "code-xml" }
}
```

**Error Codes:**
- `404` - Category not found

---

### DELETE /categories/:id

Delete a category.

**Response (200):**

```json
{
  "message": "Xoa loai dich vu thanh cong",
  "categoryId": 1
}
```

**Error Codes:**
- `404` - Category not found

---

## 11. Supervisors

### GET /supervisors

Get all supervisors.

**Response (200):**

```json
{
  "total": 2,
  "supervisors": [
    {
      "giamSatId": 1,
      "taiKhoanId": 5,
      "tenDonVi": "QA Solutions",
      "moTa": "Professional QA services",
      "nangLuc": "Software testing, Code review",
      "chungChi": "ISTQB Certified",
      "phiGiamSat": "500000",
      "xepHang": "4.5",
      "tongCongViecGS": 10,
      "trangThai": "HoatDong",
      "ngayDangKy": "2025-01-01T00:00:00.000Z",
      "taiKhoan": {
        "taiKhoanId": 5,
        "hoTen": "Le Van E",
        "email": "levane@email.com",
        "soDienThoai": "0905555555"
      }
    }
  ]
}
```

---

### GET /supervisors/search?keyword=QA

Search supervisors by keyword.

**Query Parameters:**

| Param | Required | Description |
|---|---|---|
| keyword | Optional | Search in name/description |

**Response:** Same format as GET /supervisors.

---

### GET /supervisors/:id

Get a single supervisor.

**Response (200):**

```json
{
  "supervisor": { "...": "same as supervisor object above" }
}
```

**Error Codes:**
- `404` - Supervisor not found

---

### POST /supervisors

Create/register a supervisor profile.

**Request Body:**

| Field | Required | Description |
|---|---|---|
| taiKhoanId | Yes | **TaiKhoanID** of the user |
| tenDonVi | Yes | Organization/unit name |
| moTa | Optional | Description |
| nangLuc | Optional | Capabilities |
| chungChi | Optional | Certifications |
| phiGiamSat | Yes | Supervision fee |

**Response (201):**

```json
{
  "message": "Tao don vi giam sat thanh cong",
  "supervisor": { "...": "full supervisor object" }
}
```

**Error Codes:**
- `400` - User not found / Already registered

---

### PUT /supervisors/:id

Update supervisor profile.

**Request Body:**

| Field | Required | Description |
|---|---|---|
| tenDonVi | Optional | Organization name |
| moTa | Optional | Description |
| nangLuc | Optional | Capabilities |
| chungChi | Optional | Certifications |
| phiGiamSat | Optional | Fee |
| trangThai | Optional | Status: `HoatDong`, `TamNghi`, `BiKhoa`, `ChoDuyet` |

**Response (200):**

```json
{
  "message": "Cap nhat don vi giam sat thanh cong",
  "supervisor": { "...": "full supervisor object" }
}
```

**Error Codes:**
- `404` - Supervisor not found

---

### DELETE /supervisors/:id

Delete a supervisor profile.

**Response (200):**

```json
{
  "message": "Xoa don vi giam sat thanh cong",
  "supervisorId": 1
}
```

**Error Codes:**
- `404` - Supervisor not found

---

## 12. Chat

### POST /chat

Create a new conversation.

A contract conversation stores the client and freelancer as its two primary members. An accepted supervisor is linked through the associated contract and is returned in `giamSat`; a separate conversation does not need to be created for supervision.

**Request Body:**

| Field | Required | Description |
|---|---|---|
| thanhVien1Id | Yes | First member's **TaiKhoanID** |
| thanhVien2Id | Yes | Second member's **TaiKhoanID** |
| congViecId | Optional | Associated contract ID |

**Response (201):**

```json
{
  "message": "Tao cuoc hoi thoai thanh cong",
  "conversation": {
    "cuocHoiThoaiId": 1,
    "congViecId": 1,
    "thanhVien1": {
      "taiKhoanId": 1,
      "hoTen": "Nguyen Van An",
      "email": "manhhuy2@gmail.com"
    },
    "thanhVien2": {
      "taiKhoanId": 13,
      "hoTen": "Freelancer",
      "email": "dev1@freelancer.vn"
    },
    "giamSat": {
      "taiKhoanId": 21,
      "hoTen": "User 21",
      "email": "iso@giamsat.vn"
    },
    "tinNhanCuoi": "2026-05-20T10:10:00.000Z",
    "trangThai": "DangMo",
    "ngayTao": "2026-05-02T10:00:00.000Z"
  }
}
```

**Error Codes:**
- `400` - Users not found / Same user / Conversation already exists

---

### GET /chat/:id

Get a conversation by ID.

**Response (200):**

```json
{
  "conversation": { "...": "same as conversation object above" }
}
```

**Error Codes:**
- `404` - Conversation not found

---

### PUT /chat/:id/close

Close a conversation.

**Response (200):**

```json
{
  "message": "Dong cuoc hoi thoai thanh cong",
  "conversation": { "...": "conversation with trangThai: DaDong" }
}
```

---

### GET /chat/:id/messages

Get all messages in a conversation.

**Response (200):**

```json
{
  "total": 6,
  "messages": [
    {
      "tinNhanId": 1,
      "cuocHoiThoaiId": 1,
      "nguoiGui": {
        "taiKhoanId": 1,
        "hoTen": "Nguyen Van An",
        "email": "manhhuy2@gmail.com"
      },
      "noiDung": "Minh gui lai yeu cau API va deadline sprint dau.",
      "loaiTin": "VanBan",
      "daDoc": true,
      "ngayTao": "2026-05-02T10:01:00.000Z"
    }
  ]
}
```

---

### POST /chat/:id/messages

Send a message in a conversation.

**Request Body:**

| Field | Required | Description |
|---|---|---|
| nguoiGuiId | Yes | Sender's **TaiKhoanID** |
| noiDung | Yes | Message content |
| loaiTin | Optional | Message type: `VanBan`, `File`, `HinhAnh` (default: `VanBan`) |

**Note:** `cuocHoiThoaiId` is taken from the URL parameter.

**Response (201):**

```json
{
  "message": "Gui tin nhan thanh cong",
  "data": {
    "tinNhanId": 6,
    "cuocHoiThoaiId": 1,
    "nguoiGui": {
      "taiKhoanId": 21,
      "hoTen": "User 21",
      "email": "iso@giamsat.vn"
    },
    "noiDung": "Toi da xac nhan moc API va se theo doi sprint tiep theo.",
    "loaiTin": "VanBan",
    "daDoc": false,
    "ngayTao": "2026-05-20T10:10:00.000Z"
  }
}
```

**Error Codes:**
- `400` - Empty content / Sender is not a primary member or accepted supervisor of the contract conversation
- `404` - Conversation not found

---

### PUT /chat/:id/read/:userId

Mark all messages as read for a user in a conversation.

Primary members and the accepted supervisor of the associated contract may mark messages as read.

**Response (200):**

```json
{
  "message": "Da doc tin nhan",
  "count": 3
}
```

---

## 13. WebSocket Chat Gateway

The chat system also supports real-time messaging via WebSocket using Socket.IO.

### Connection

**Namespace:** `/chat`

**Connection URL:** `ws://localhost:8080/chat?userId=<TaiKhoanID>`

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:8080/chat', {
  query: { userId: '1' }  // Your TaiKhoanID
});
```

### Client Events (Emit)

#### `joinConversation`

Join a conversation room to receive real-time messages.

```javascript
socket.emit('joinConversation', { cuocHoiThoaiId: 1 });
```

#### `leaveConversation`

Leave a conversation room.

```javascript
socket.emit('leaveConversation', { cuocHoiThoaiId: 1 });
```

#### `sendMessage`

Send a message via WebSocket (saves to DB and broadcasts).

```javascript
socket.emit('sendMessage', {
  cuocHoiThoaiId: 1,
  nguoiGuiId: 1,
  noiDung: 'Hello from WebSocket!',
  loaiTin: 'VanBan'  // Optional, default: 'VanBan'
});
```

#### `markAsRead`

Mark messages as read in a conversation.

```javascript
socket.emit('markAsRead', {
  cuocHoiThoaiId: 1,
  userId: 1
});
```

#### `typing`

Send typing indicator.

```javascript
socket.emit('typing', {
  cuocHoiThoaiId: 1,
  userId: 1,
  isTyping: true
});
```

### Server Events (Listen)

#### `newMessage`

Received when a new message is sent in a joined conversation room.

```javascript
socket.on('newMessage', (data) => {
  // data = MessageDto object
  console.log(data);
  // {
  //   tinNhanId: 7,
  //   cuocHoiThoaiId: 1,
  //   nguoiGui: { taiKhoanId: 2, hoTen: "Tran Van B", email: "..." },
  //   noiDung: "Hi there!",
  //   loaiTin: "VanBan",
  //   daDoc: false,
  //   ngayTao: "2025-01-20T10:10:00.000Z"
  // }
});
```

#### `messageNotification`

Received when you get a message but are NOT in the conversation room (for unread badges).

```javascript
socket.on('messageNotification', (data) => {
  // data = { cuocHoiThoaiId: 1, message: MessageDto }
});
```

#### `messagesRead`

Received when someone reads messages in a conversation you're in.

```javascript
socket.on('messagesRead', (data) => {
  // data = { cuocHoiThoaiId: 1, userId: 2, count: 3 }
});
```

#### `userTyping`

Received when another user is typing in a conversation.

```javascript
socket.on('userTyping', (data) => {
  // data = { cuocHoiThoaiId: 1, userId: 2, isTyping: true }
});
```

#### `error`

Received when a WebSocket operation fails.

```javascript
socket.on('error', (data) => {
  // data = { message: "Failed to send message" }
});
```

---

## 14. Recommendations

### GET /recommendations/freelancers/:yeuCauId

Get recommended freelancers for a specific job (based on skill matching).

**Response (200):**

```json
{
  "yeuCauId": 1,
  "recommendations": [
    {
      "taiKhoanId": 2,
      "hoTen": "Tran Van B",
      "email": "tranvanb@email.com",
      "kinhNghiem": 5,
      "xepHang": "4.8",
      "matchingSkills": [
        { "kyNangId": 1, "tenKyNang": "React" }
      ],
      "matchScore": 0.85
    }
  ]
}
```

**Error Codes:**
- `404` - Job not found

---

### GET /recommendations/supervisors

Get recommended supervisors (active, sorted by rating).

**Response (200):**

```json
{
  "recommendations": [
    {
      "giamSatId": 1,
      "taiKhoanId": 5,
      "tenDonVi": "QA Solutions",
      "phiGiamSat": "500000",
      "xepHang": "4.5",
      "tongCongViecGS": 10,
      "trangThai": "HoatDong"
    }
  ]
}
```

---

## 15. Payments

### POST /payments/deposit

Create an escrow deposit payment for a contract.

**Request Body:**

| Field | Required | Description |
|---|---|---|
| contractId | Yes | Contract ID (CongViecID) |
| amount | Yes | Deposit amount |
| paymentMethod | Yes | Method: `ChuyenKhoan`, `ThanhToanQuaMang`, `Vi`, `TienMat` |
| note | Optional | Payment note |

**Response (201):**

```json
{
  "message": "Dat coc thanh cong",
  "payment": {
    "thanhToanId": 1,
    "congViecId": 1,
    "nguoiThueId": 1,
    "soTien": "7000000",
    "loaiTT": "DatCoc",
    "phuongThuc": "Vi",
    "trangThai": "ThanhCong",
    "ghiChu": "Escrow deposit",
    "ngayTao": "2025-01-20T00:00:00.000Z"
  }
}
```

**Error Codes:**
- `400` - Invalid amount / Contract not found
- `404` - Contract not found

---

### GET /payments/:id

Get a single payment by ID.

**Response (200):**

```json
{
  "payment": { "...": "same as payment object above" }
}
```

**Error Codes:**
- `404` - Payment not found

---

### GET /contracts/:id/payments

Get all payments for a contract.

**Response (200):**

```json
{
  "total": 3,
  "payments": [
    { "...": "payment objects" }
  ]
}
```

---

### PUT /payments/:id/release

Release an escrow payment (admin/system action).

**Response (200):**

```json
{
  "message": "Giai ngan thanh cong",
  "payment": { "...": "payment with trangThai: ThanhCong" }
}
```

**Error Codes:**
- `400` - Payment not in releasable state
- `404` - Payment not found

---

### PUT /payments/:id/refund

Refund a payment.

**Response (200):**

```json
{
  "message": "Hoan tien thanh cong",
  "payment": { "...": "payment with trangThai: DaHoan" }
}
```

**Error Codes:**
- `400` - Payment not refundable
- `404` - Payment not found

---

## 16. Disputes

### POST /disputes

Create a dispute for a contract.

**Request Body:**

| Field | Required | Description |
|---|---|---|
| congViecId | Yes | Contract ID |
| nguoiGuiId | Yes | Reporter's **TaiKhoanID** |
| lyDo | Yes | Reason for dispute |
| moTa | Optional | Detailed description |
| yeuCauHoanTien | Yes | Requested refund amount |

**Response (201):**

```json
{
  "message": "Tao tranh chap thanh cong",
  "dispute": {
    "tranhChapId": 1,
    "congViecId": 1,
    "nguoiGuiId": 1,
    "giamSatId": null,
    "lyDo": "Work not delivered on time",
    "moTa": "Freelancer missed the deadline by 2 weeks",
    "trangThai": "MoiMo",
    "yeuCauHoanTien": "3000000",
    "ngayMo": "2025-02-15T00:00:00.000Z",
    "ngayDong": null
  }
}
```

**Error Codes:**
- `400` - Contract not found / Already has open dispute
- `404` - Contract not found

---

### GET /disputes/:id

Get a single dispute.

**Response (200):**

```json
{
  "dispute": { "...": "same as dispute object" }
}
```

**Error Codes:**
- `404` - Dispute not found

---

### GET /contracts/:id/disputes

Get all disputes for a contract.

**Response (200):**

```json
{
  "total": 1,
  "disputes": [ { "...": "dispute objects" } ]
}
```

---

### PUT /disputes/:id/review

Assign a supervisor to review the dispute.

**Request Body:**

| Field | Required | Description |
|---|---|---|
| giamSatId | Yes | Supervisor's **TaiKhoanID** |

**Response (200):**

```json
{
  "message": "Giam sat da nhan xem xet tranh chap",
  "dispute": { "...": "dispute with giamSatId set, trangThai: DangXuLy" }
}
```

**Error Codes:**
- `400` - Supervisor not found / Dispute not in reviewable state
- `404` - Dispute not found

---

### PUT /disputes/:id/resolve

Resolve a dispute (by supervisor).

**Request Body:**

| Field | Required | Description |
|---|---|---|
| giamSatId | Yes | Supervisor's **TaiKhoanID** (must be assigned reviewer) |
| ketQua | Yes | Result: `TiepTuc`, `HoanTienNguoiThue`, `HuyHopDong`, `PhanChia` |
| lyDo | Yes | Resolution reason |
| soTienHoan | Yes | Refund amount |
| benChiuPhi | Yes | Who pays fees: `NguoiThue`, `Freelancer`, `ChiaSe`, `HeThong` |

**Response (200):**

```json
{
  "message": "Giai quyet tranh chap thanh cong",
  "dispute": { "...": "dispute with trangThai: DaKetLuan, ngayDong set" }
}
```

**Error Codes:**
- `400` - Not the assigned supervisor / Invalid state
- `404` - Dispute not found

---

## 17. Evidences

### POST /disputes/:id/evidences

Submit evidence for a dispute.

**Request Body:**

| Field | Required | Description |
|---|---|---|
| nguoiNopId | Yes | Submitter's **TaiKhoanID** |
| loaiBangChung | Yes | Type: `TinNhan`, `File`, `HinhAnh`, `GhiChu`, `KhacP` |
| noiDung | Optional | Text content/description |
| duongDanFile | Optional | File URL |

**Response (201):**

```json
{
  "message": "Nop bang chung thanh cong",
  "evidence": {
    "bangChungId": 1,
    "tranhChapId": 1,
    "nguoiNopId": 1,
    "loaiBangChung": "HinhAnh",
    "noiDung": "Screenshot of conversation",
    "duongDanFile": "https://example.com/evidence.png",
    "ngayNop": "2025-02-16T00:00:00.000Z"
  }
}
```

**Error Codes:**
- `400` - Dispute not open / User not involved
- `404` - Dispute not found

---

### GET /disputes/:id/evidences

Get all evidences for a dispute.

**Response (200):**

```json
{
  "total": 2,
  "evidences": [ { "...": "evidence objects" } ]
}
```

---

### DELETE /evidences/:id

Delete an evidence submission.

**Response (200):**

```json
{
  "message": "Xoa bang chung thanh cong",
  "evidence": null
}
```

**Error Codes:**
- `404` - Evidence not found

---

## 18. Reviews

### POST /reviews

Create a review for a completed contract.

**Request Body:**

| Field | Required | Description |
|---|---|---|
| congViecId | Yes | Contract ID (must be completed) |
| nguoiDanhGiaId | Yes | Reviewer's **TaiKhoanID** |
| nguoiDuocDGId | Yes | Reviewed person's **TaiKhoanID** |
| diemSo | Yes | Rating score (1-5) |
| binhLuan | Optional | Review comment |
| loaiDanhGia | Yes | Type: `NguoiThue_DanhGia_Freelancer`, `Freelancer_DanhGia_NguoiThue`, `NguoiThue_DanhGia_GiamSat`, `Freelancer_DanhGia_GiamSat`, `GiamSat_DanhGia_Freelancer`, `GiamSat_DanhGia_NguoiThue` |

**Response (201):**

```json
{
  "message": "Tao danh gia thanh cong",
  "review": {
    "danhGiaId": 1,
    "congViecId": 1,
    "nguoiDanhGiaId": 1,
    "nguoiDuocDGId": 2,
    "diemSo": 5,
    "binhLuan": "Excellent work, delivered on time!",
    "loaiDanhGia": "NguoiThue_DanhGia_Freelancer",
    "ngayTao": "2025-02-20T00:00:00.000Z"
  }
}
```

**Error Codes:**
- `400` - Contract not completed / Already reviewed / Invalid score
- `404` - Contract not found

---

### GET /reviews/:id

Get a single review.

**Response (200):**

```json
{
  "review": { "...": "same as review object" }
}
```

**Error Codes:**
- `404` - Review not found

---

### GET /users/:id/reviews

Get all reviews for a user (received reviews).

**Response (200):**

```json
{
  "total": 5,
  "reviews": [ { "...": "review objects" } ]
}
```

---

### GET /contracts/:id/reviews

Get all reviews for a contract.

**Response:** Same format as review list.

---

## 19. Notifications

### GET /notifications?userId=1

Get all notifications for a user.

**Query Parameters:**

| Param | Required | Description |
|---|---|---|
| userId | Yes | User's **TaiKhoanID** |

**Response (200):**

```json
{
  "total": 3,
  "notifications": [
    {
      "thongBaoId": 1,
      "taiKhoanId": 1,
      "tieuDe": "New proposal received",
      "noiDung": "You have a new proposal for your job",
      "loaiThongBao": "BaoGia",
      "daDoc": false,
      "ngayTao": "2025-01-16T00:00:00.000Z"
    }
  ]
}
```

---

### PUT /notifications/:id/read

Mark a notification as read.

**Response (200):**

```json
{
  "message": "Da doc thong bao",
  "notification": { "...": "notification with daDoc: true" }
}
```

**Error Codes:**
- `404` - Notification not found

---

### DELETE /notifications/:id

Delete a notification.

**Response (200):**

```json
{
  "message": "Xoa thong bao thanh cong"
}
```

**Error Codes:**
- `404` - Notification not found

---

## 20. Reports

### POST /reports

Create a user report (report another user for misconduct).

**Request Body:**

| Field | Required | Description |
|---|---|---|
| nguoiBaoCaoId | Yes | Reporter's **TaiKhoanID** |
| nguoiBiCaoId | Yes | Reported user's **TaiKhoanID** |
| lyDo | Yes | Reason for report |
| moTa | Optional | Detailed description |

**Response (201):**

```json
{
  "message": "Tao bao cao thanh cong",
  "report": {
    "baoCaoId": 1,
    "nguoiBaoCaoId": 1,
    "nguoiBiCaoId": 3,
    "lyDo": "Spam messages",
    "moTa": "User keeps sending unsolicited messages",
    "trangThai": "ChoXuLy",
    "ketQua": null,
    "adminXuLyId": null,
    "ngayTao": "2025-02-01T00:00:00.000Z",
    "ngayXuLy": null
  }
}
```

**Error Codes:**
- `400` - Cannot report yourself / Users not found

---

### GET /reports

Get all reports (admin endpoint).

**Response (200):**

```json
{
  "total": 5,
  "reports": [ { "...": "report objects" } ]
}
```

---

### PUT /reports/:id/resolve

Resolve a report (admin action).

**Request Body:**

| Field | Required | Description |
|---|---|---|
| adminId | Yes | Admin's **TaiKhoanID** |
| trangThai | Yes | Status: `DangXuLy`, `DaXuLy`, `HuyBo` |
| ketQua | Yes | Resolution result description |

**Response (200):**

```json
{
  "message": "Xu ly bao cao thanh cong",
  "report": { "...": "report with trangThai updated, adminXuLyId set, ngayXuLy set" }
}
```

**Error Codes:**
- `400` - Invalid status / Admin not found
- `404` - Report not found

---

## 21. Admin

### GET /admin/users

Get all users (admin view with management info).

**Response (200):**

```json
{
  "total": 10,
  "users": [
    {
      "taiKhoanId": 1,
      "tenDangNhap": "nguyenvana",
      "email": "nguyenvana@email.com",
      "hoTen": "Nguyen Van A",
      "vaiTro": "NguoiThue",
      "trangThai": "HoatDong",
      "ngayTao": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### PUT /admin/users/:id/ban

Ban a user account.

**Response (200):**

```json
{
  "message": "Da khoa tai khoan"
}
```

**Error Codes:**
- `404` - User not found

---

### GET /admin/supervisors

Get all supervisors (admin view).

**Response (200):**

```json
{
  "total": 3,
  "supervisors": [
    {
      "giamSatId": 1,
      "taiKhoanId": 5,
      "tenDonVi": "QA Solutions",
      "phiGiamSat": "500000",
      "trangThai": "ChoDuyet",
      "ngayDangKy": "2025-01-01T00:00:00.000Z",
      "hoTen": "Le Van E",
      "email": "levane@email.com"
    }
  ]
}
```

---

### PUT /admin/supervisors/:id/approve

Approve a supervisor registration.

**Response (200):**

```json
{
  "message": "Da duyet don vi giam sat"
}
```

**Error Codes:**
- `404` - Supervisor not found

---

### GET /admin/statistics

Get platform statistics.

**Response (200):**

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

## Enum Reference

### User Roles (VaiTroTaiKhoan)
- `NguoiThue` - Client/Employer
- `Freelancer` - Freelancer
- `DonViGiamSat` - Supervisor
- `Admin` - Administrator
- `KhachVangLai` - Guest

### Account Status (TrangThaiTaiKhoan)
- `HoatDong` - Active
- `BiKhoa` - Locked
- `ChoDuyet` - Pending approval
- `DaBi` - Deleted/disabled

### Job Status (TrangThaiYeuCau)
- `DangNhanHoSo` - Accepting freelancer proposals
- `DaDong` - Closed to new proposals; received proposals may still be selected
- `DaChot` - Freelancer selected and contract created
- `DaHuy` - Cancelled

### Proposal Status (TrangThaiBaoGia)
- `DaGui` - Submitted
- `DuocChon` - Accepted/Selected
- `TuChoi` - Rejected
- `HetHan` - Expired

### Contract Status (TrangThaiCongViec)
- `MoiTao` - Newly created
- `DangThucHien` - In progress
- `HoanThanh` - Completed
- `DaHuy` - Cancelled
- `TranhChap` - In dispute

### Supervisor Status (TrangThaiGiamSatCongViec)
- `KhongCo` - No supervisor
- `ChoDuyet` - Pending approval
- `DangGiamSat` - Supervising
- `HoanThanh` - Supervision completed
- `TuChoi` - Rejected

### Supervisor Request Status (TrangThaiYeuCauGiamSat)
- `ChoDuyet` - Pending approval
- `DaChapNhan` - Accepted
- `TuChoi` - Rejected
- `HoanThanh` - Completed

### Payment Type (LoaiThanhToan)
- `DatCoc` - Escrow deposit
- `ThanhToanCuoi` - Final payment (to freelancer)
- `PhiGiamSat` - Supervisor fee
- `PhiHeThong` - System fee
- `HoanTien` - Refund

### Payment Method (PhuongThucThanhToan)
- `ChuyenKhoan` - Bank transfer
- `ThanhToanQuaMang` - Online payment
- `Vi` - Wallet
- `TienMat` - Cash

### Payment Status (TrangThaiThanhToan)
- `ChoXuLy` - Pending
- `ThanhCong` - Successful
- `ThatBai` - Failed
- `DaHoan` - Refunded

### Dispute Status (TrangThaiTranhChap)
- `MoiMo` - Newly opened
- `DangXuLy` - In progress
- `DaKetLuan` - Concluded
- `DaDong` - Closed

### Dispute Result (KetQuaTranhChap)
- `TiepTuc` - Continue the contract
- `HoanTienNguoiThue` - Refund the client
- `HuyHopDong` - Cancel the contract
- `PhanChia` - Split settlement

### Dispute Fee Bearer (BenChiuPhiKetLuan)
- `NguoiThue` - Client pays the fees
- `Freelancer` - Freelancer pays the fees
- `ChiaSe` - Fees are shared
- `HeThong` - Platform pays the fees

### Evidence Type (LoaiBangChung)
- `TinNhan` - Message
- `File` - File
- `HinhAnh` - Image
- `GhiChu` - Note
- `KhacP` - Other

### Review Type (LoaiDanhGia)
- `NguoiThue_DanhGia_Freelancer` - Client reviews Freelancer
- `Freelancer_DanhGia_NguoiThue` - Freelancer reviews Client
- `NguoiThue_DanhGia_GiamSat` - Client reviews Supervisor
- `Freelancer_DanhGia_GiamSat` - Freelancer reviews Supervisor
- `GiamSat_DanhGia_Freelancer` - Supervisor reviews Freelancer
- `GiamSat_DanhGia_NguoiThue` - Supervisor reviews Client

### Message Type (LoaiTinNhan)
- `VanBan` - Text
- `File` - File
- `HinhAnh` - Image

### Gender (GioiTinh)
- `Nam` - Male
- `Nu` - Female
- `Khac` - Other

### Supervisor Organization Status (TrangThaiDonViGiamSat)
- `HoatDong` - Active
- `TamNghi` - Paused
- `BiKhoa` - Locked
- `ChoDuyet` - Pending approval

### Notification Type (LoaiThongBao)
- `HeThong` - System notification
- `YeuCau` - Hiring request notification
- `BaoGia` - Proposal notification
- `CongViec` - Contract notification
- `TranhChap` - Dispute notification
- `GiamSat` - Supervisor notification
- `ThanhToan` - Payment notification
- `DanhGia` - Review notification

### Report Status (TrangThaiBaoCao)
- `ChoXuLy` - Pending
- `DangXuLy` - In progress
- `DaXuLy` - Processed
- `HuyBo` - Cancelled

### Progress Confirmation Status (TrangThaiXacNhanTienDo)
- `ChuaXacNhan` - Not confirmed
- `DaXacNhan` - Confirmed
- `TuChoi` - Rejected

---

## Common Error Response Format

All error responses follow this format:

```json
{
  "statusCode": 400,
  "message": "Error description",
  "error": "Bad Request"
}
```

Common HTTP status codes:
- `400` - Bad Request (validation errors, business logic errors)
- `401` - Unauthorized (not authenticated)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error
