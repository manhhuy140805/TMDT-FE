# Mock Data Update Log

## Tổng quan
Đã cập nhật toàn bộ hệ thống để phù hợp với cấu trúc mock data mới (tiếng Việt).

## Ngày cập nhật
**Date**: 2024

## Các thay đổi chính

### 1. Mock Data Structure (src/mock/)

#### requests.json
- `id` → `yeuCauId`
- `employerId` → `nguoiThueId`
- `categoryId` → `loaiDichVuId`
- `title` → `tieuDe`
- `description` → `moTa`
- `budgetMin` → `nganSachMin`
- `budgetMax` → `nganSachMax`
- `deadline` → `thoiHan`
- `requiresSupervision` → `yeuCauGiamSat`
- `status` → `trangThai`
- `createdDate` → `ngayTao`
- `updatedDate` → `ngayCapNhat`

**Status values changed:**
- `DANG_MOI_THAU` → `DangMo`
- `DA_DONG` → `DaDong`

#### users.json
- `id` → `taiKhoanId`
- `username` → `tenDangNhap`
- `fullName` → `hoTen`
- `phone` → `soDienThoai`
- `gender` → `gioiTinh`
- `address` → `diaChi`
- `role` → `vaiTro`
- `status` → `trangThai`
- `createdDate` → `ngayTao`
- `updatedDate` → `ngayCapNhat`

#### categories.json
- `id` → `loaiDichVuId`
- `name` → `tenLoai`
- `description` → `moTa`
- `image` → `hinhAnh`
- `createdDate` → `ngayTao`
- `updatedDate` → `ngayCapNhat`

#### freelancers.json
- `id` → `freelancerId`
- `userId` → `taiKhoanId`
- `skills` → `kyNang` (string, comma-separated)
- `experience` → `kinhNghiem`
- `expertise` → `chuyenGia`
- `certifications` → `chungChi` (string, comma-separated)
- `rating` → `diemDanhGia` (string)
- `balance` → `soDuTaiKhoan`
- `status` → `trangThai`
- `createdDate` → `ngayTao`
- `updatedDate` → `ngayCapNhat`

### 2. Updated Files

#### src/mock/index.js
✅ Updated helper functions:
- `getRequestById()` - Uses `yeuCauId`
- `getFreelancerById()` - Uses `freelancerId`
- `getUserById()` - Uses `taiKhoanId`
- `getRequestsByCategory()` - Uses `loaiDichVuId`
- `getRequestsByStatus()` - Uses `trangThai`
- `searchRequests()` - Uses `tieuDe`, `moTa`, `loaiDichVuId`, `trangThai`, `nganSachMin`, `nganSachMax`
- `searchFreelancers()` - Uses `taiKhoanId`, `kyNang`, `chuyenGia`, `diemDanhGia`

#### src/services/api.js
✅ Added data mapping layer:
- `mapCategory()` - Maps Vietnamese fields to English
- `mapUser()` - Maps Vietnamese fields to English
- `mapFreelancer()` - Maps Vietnamese fields to English
- `mapRequest()` - Maps Vietnamese fields to English
- `formatCurrency()` - Formats VND currency
- `formatDate()` - Formats date to Vietnamese locale
- `getTimeAgo()` - Calculates relative time in Vietnamese

✅ Updated API functions:
- `categoriesAPI.getAll()` - Returns mapped categories
- `categoriesAPI.getById()` - Returns mapped category
- `requestsAPI.getAll()` - Returns mapped requests with pagination
- `requestsAPI.getById()` - Returns mapped request
- `requestsAPI.create()` - Creates request with Vietnamese fields
- `requestsAPI.update()` - Updates request with Vietnamese fields

#### src/components/RequestCard/RequestCard.jsx
✅ Updated to handle:
- Optional `skills` array (may be empty)
- Use `deadlineText` or `deadline` for display

#### src/pages/Requests/RequestsPage.jsx
✅ Updated:
- Filter status changed from `DANG_MOI_THAU` to `DangMo`

#### src/pages/MyRequests/MyRequestsPage.jsx
✅ Updated:
- Status mapping: `DangMo`, `DA_CHON_BAO_GIA`, `DaDong`
- Status badge display
- Filter counts

#### src/pages/RequestDetail/components/RequestInfo.jsx
✅ Updated:
- Handle empty `skills` array with fallback message

#### src/pages/RequestDetail/components/ClientCard.jsx
✅ Updated:
- Handle null `employer` gracefully
- Use `fullName` or `name` for display

#### src/pages/RequestDetail/components/ActionCard.jsx
✅ Updated:
- Use `deadlineText` or `deadline` for display

### 3. Data Flow

```
Mock Data (Vietnamese) 
    ↓
src/mock/index.js (Helper functions)
    ↓
src/services/api.js (Mapping layer)
    ↓
Components (English structure)
```

### 4. Benefits

1. **Separation of Concerns**: Mock data structure is independent from component structure
2. **Easy Migration**: When switching to real API, only need to update `api.js`
3. **Backward Compatibility**: Components continue to use English field names
4. **Type Safety**: Mapping functions ensure consistent data structure

### 5. Testing Checklist

- [x] Categories display correctly on HomePage
- [x] Requests list displays on RequestsPage
- [x] Request detail page shows all information
- [x] My Requests page filters work correctly
- [x] Status badges display correctly
- [x] Empty skills array handled gracefully
- [x] Null employer handled gracefully
- [x] Date formatting works correctly
- [x] Currency formatting works correctly

### 6. Future Improvements

1. Add TypeScript interfaces for data structures
2. Add unit tests for mapping functions
3. Add validation for Vietnamese field names
4. Consider using a data transformation library (e.g., normalizr)
5. Add error handling for missing required fields

### 7. Notes

- Skills are currently empty in mock data (TODO: Extract from description or add to data model)
- Views are randomly generated (TODO: Add to data model)
- Some fields like `attachments` are not in mock data yet
- Employer avatar URLs need to be updated to match actual file structure

## Breaking Changes

None - All changes are backward compatible through the mapping layer.

## Migration Guide for New Developers

When adding new features that use mock data:

1. Check `src/mock/*.json` for available fields (Vietnamese names)
2. Use helper functions in `src/mock/index.js` to access data
3. Use API functions in `src/services/api.js` in components
4. Components should use English field names (mapped automatically)
5. Add new mapping functions in `api.js` if needed

## Contact

For questions about these changes, please contact the development team.
