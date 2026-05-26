# FRAS-TMDT Backend API Guide

Tài liệu này mô tả API hiện hành của backend, đặc biệt là luồng công việc có đơn vị giám sát chịu trách nhiệm theo dõi tiến độ, kiểm tra chất lượng và phân giải tranh chấp.

## Thông Tin Chung

| Mục                     | Giá trị                                                       |
| ----------------------- | ------------------------------------------------------------- |
| Base URL local          | `http://localhost:8080`                                       |
| Content-Type            | `application/json`                                            |
| CORS frontend local     | `http://localhost:5173`                                       |
| Authentication hiện tại | API nhận `TaiKhoanID` trong payload/path, chưa có token guard |

## Quy Ước ID

Tất cả ID người dùng trong nghiệp vụ đều là `TaiKhoanID`.

| Field API                            | Ý nghĩa                                    |
| ------------------------------------ | ------------------------------------------ |
| `nguoiThueId`                        | `TaiKhoanID` của người thuê                |
| `freelancerId`                       | `TaiKhoanID` của freelancer                |
| `giamSatId`                          | `TaiKhoanID` của tài khoản đơn vị giám sát |
| `userId`, `nguoiGuiId`, `nguoiNopId` | `TaiKhoanID` của người thực hiện hành động |

`NguoiThue`, `Freelancer` và `DonViGiamSat` là bảng hồ sơ bổ sung. Không truyền ID hồ sơ vào các field bên trên.

## Luồng Nghiệp Vụ Chính

### Vai Trò Đơn Vị Giám Sát

Mỗi yêu cầu và mỗi công việc bắt buộc có một đơn vị giám sát:

1. Người thuê tạo yêu cầu và chọn `giamSatId`.
2. Khi chọn báo giá, công việc kế thừa đơn vị giám sát từ yêu cầu.
3. Đơn vị giám sát nhận lời mời giám sát công việc.
4. Freelancer nộp các mốc tiến độ.
5. Chỉ đơn vị giám sát được gán cho công việc mới được duyệt hoặc từ chối tiến độ.
6. Bản giao `100%` phải được giám sát duyệt chất lượng trước khi giám sát xác nhận hoàn thành.
7. Sau khi công việc hoàn thành, nếu người thuê không hài lòng, người thuê có thể mở tranh chấp.
8. Chỉ đơn vị giám sát của công việc mới được tiếp nhận và kết luận tranh chấp.

### Vòng Đời Yêu Cầu

| Trạng thái     | Ý nghĩa                                               |
| -------------- | ----------------------------------------------------- |
| `DangNhanHoSo` | Đang nhận báo giá                                     |
| `DaDong`       | Đã đóng nhận báo giá, vẫn có thể chọn báo giá đã nhận |
| `DaChot`       | Đã chọn freelancer và tạo công việc                   |
| `DaHuy`        | Yêu cầu đã hủy                                        |

### Vòng Đời Công Việc

| Trạng thái     | Ý nghĩa                       |
| -------------- | ----------------------------- |
| `MoiTao`       | Vừa tạo                       |
| `DangThucHien` | Đang thực hiện và nộp tiến độ |
| `HoanThanh`    | Đã được xác nhận hoàn thành   |
| `DaHuy`        | Đã hủy                        |

Tranh chấp là dữ liệu riêng trong `TranhChap`; công việc có tranh chấp kết quả vẫn giữ trạng thái `HoanThanh`.

### Flow Tích Hợp Cho Frontend

```text
POST /jobs
  -> POST /proposals
  -> POST /contracts/accept-proposal
  -> PUT /contracts/:id/supervisor/accept
  -> POST /progress
  -> PUT /progress/:id       (giám sát duyệt các mốc, gồm mốc 100%)
  -> PUT /contracts/:id/confirm-completion  (Freelancer)
  -> PUT /contracts/:id/confirm-completion  (GiamSat)
  -> PUT /contracts/:id/confirm-completion  (NguoiThue, giải ngân)
  -> POST /disputes          (nếu người thuê khiếu nại sau hoàn thành)
  -> PUT /disputes/:id/review
  -> PUT /disputes/:id/resolve
```

## Jobs - Yêu Cầu Thuê

### `POST /jobs`

Tạo yêu cầu mới. `giamSatId` là bắt buộc.

```json
{
  "nguoiThueId": 1,
  "loaiDichVuId": 6,
  "giamSatId": 21,
  "tieuDe": "Giao diện frontend React",
  "moTa": "Phát triển giao diện responsive.",
  "nganSachMin": 7000000,
  "nganSachMax": 12000000,
  "thoiHan": "2026-08-10",
  "kyNangIds": [11, 14, 15]
}
```

Response:

```json
{
  "message": "Tao yeu cau thanh cong",
  "job": {
    "yeuCauId": 15,
    "nguoiThueId": 1,
    "giamSatId": 21,
    "yeuCauGiamSat": true,
    "trangThai": "DangNhanHoSo",
    "giamSat": {
      "giamSatId": 21,
      "tenDonVi": "ISO Quality Control"
    }
  }
}
```

### `PUT /jobs/:id`

Cập nhật yêu cầu chưa chốt. Có thể đổi đơn vị giám sát bằng `giamSatId`.

```json
{
  "giamSatId": 25,
  "tieuDe": "Giao diện React cập nhật",
  "trangThai": "DaDong"
}
```

### Các Endpoint Jobs

| Method   | Path                                              | Mô tả                   |
| -------- | ------------------------------------------------- | ----------------------- |
| `GET`    | `/jobs`                                           | Danh sách yêu cầu       |
| `GET`    | `/jobs/search?keyword=&category=&budget=&skills=` | Tìm kiếm yêu cầu        |
| `GET`    | `/jobs/:id`                                       | Chi tiết yêu cầu        |
| `GET`    | `/jobs/:id/proposals`                             | Báo giá của yêu cầu     |
| `GET`    | `/jobs/:id/skills`                                | Kỹ năng yêu cầu         |
| `POST`   | `/jobs`                                           | Tạo yêu cầu có giám sát |
| `PUT`    | `/jobs/:id`                                       | Cập nhật yêu cầu        |
| `PUT`    | `/jobs/:id/skills`                                | Thay toàn bộ kỹ năng    |
| `POST`   | `/jobs/:id/skills/:kyNangId`                      | Thêm kỹ năng            |
| `DELETE` | `/jobs/:id/skills/:kyNangId`                      | Xóa kỹ năng             |
| `DELETE` | `/jobs/:id`                                       | Hủy yêu cầu             |

## Proposals - Báo Giá

### `POST /proposals`

```json
{
  "yeuCauId": 15,
  "freelancerId": 13,
  "giaDeXuat": 9500000,
  "thoiGianThucHien": 18,
  "noiDung": "Phát triển React, TypeScript và TailwindCSS."
}
```

| Method   | Path             | Mô tả                  |
| -------- | ---------------- | ---------------------- |
| `GET`    | `/proposals/:id` | Chi tiết báo giá       |
| `POST`   | `/proposals`     | Freelancer gửi báo giá |
| `PUT`    | `/proposals/:id` | Cập nhật báo giá       |
| `DELETE` | `/proposals/:id` | Xóa báo giá            |

## Contracts - Công Việc

### `POST /contracts/accept-proposal`

Người thuê chọn báo giá. Backend:

- Đổi yêu cầu sang `DaChot`.
- Tạo công việc, kế thừa `giamSatId` từ yêu cầu.
- Tạo lời mời giám sát trạng thái `ChoDuyet`.
- Tạo khoản escrow bằng `giaThoa + phiGiamSat`.
- Đổi báo giá được chọn sang `DuocChon` và từ chối các báo giá còn lại.

```json
{
  "baoGiaId": 24,
  "nguoiThueId": 1,
  "phiGiamSat": 450000
}
```

Response:

```json
{
  "message": "Chap nhan bao gia thanh cong. Tien da duoc giu boi he thong (escrow).",
  "congViecId": 3,
  "escrow": {
    "giaThoa": "9500000",
    "phiGiamSat": "450000",
    "tongThanhToan": "9950000",
    "thanhToanId": 6
  }
}
```

### `GET /contracts/:id/detail`

Response hợp đồng bao gồm yêu cầu gốc và tên đơn vị giám sát.

```json
{
  "contract": {
    "congViecId": 3,
    "yeuCauId": 15,
    "freelancerId": 13,
    "nguoiThueId": 1,
    "giamSatId": 21,
    "trangThai": "DangThucHien",
    "trangThaiGiamSat": "DangGiamSat",
    "yeuCau": {
      "yeuCauId": 15,
      "tieuDe": "Giao diện frontend React",
      "moTa": "Phát triển giao diện hiện đại..."
    },
    "giamSat": {
      "giamSatId": 21,
      "tenDonVi": "ISO Quality Control",
      "email": "iso@giamsat.vn"
    }
  }
}
```

### Giám Sát Công Việc

#### `POST /contracts/:id/supervisor`

Chọn đơn vị thay thế khi cần.

```json
{
  "giamSatId": 25,
  "phiGiamSat": 530000
}
```

#### `PUT /contracts/:id/supervisor/accept`

Chuyển giám sát công việc sang `DangGiamSat`. Sau bước này freelancer mới có thể gửi tiến độ.

#### `PUT /contracts/:id/supervisor/reject`

Đánh dấu lời mời giám sát là `TuChoi`; người thuê cần chọn đơn vị thay thế.

### `PUT /contracts/:id/confirm-completion`

Mỗi bên xác nhận hoàn thành bằng tài khoản tương ứng:

```json
{
  "role": "Freelancer",
  "userId": 13
}
```

```json
{
  "role": "GiamSat",
  "userId": 21
}
```

```json
{
  "role": "NguoiThue",
  "userId": 1
}
```

Quy tắc:

| Role         | Điều kiện                                                     |
| ------------ | ------------------------------------------------------------- |
| `Freelancer` | Phải là freelancer của công việc                              |
| `GiamSat`    | Phải là giám sát của công việc và đã duyệt một tiến độ `100%` |
| `NguoiThue`  | Freelancer và giám sát đã xác nhận hoàn thành                 |

Khi người thuê xác nhận cuối cùng, backend đổi công việc sang `HoanThanh` và tạo các giao dịch giải ngân, phí hệ thống, phí giám sát.

### Các Endpoint Contracts

| Method | Path                                | Mô tả                                                 |
| ------ | ----------------------------------- | ----------------------------------------------------- |
| `GET`  | `/contracts`                        | Danh sách công việc                                   |
| `GET`  | `/contracts/:id`                    | Chi tiết công việc                                    |
| `GET`  | `/contracts/:id/detail`             | Chi tiết công việc mở rộng                            |
| `GET`  | `/contracts/:id/progress`           | Tiến độ công việc                                     |
| `GET`  | `/contracts/:id/conversations`      | Hội thoại của công việc                               |
| `POST` | `/contracts`                        | Không dùng trực tiếp; trả lỗi và yêu cầu chốt báo giá |
| `PUT`  | `/contracts/:id/status`             | Cập nhật trạng thái hợp lệ                            |
| `POST` | `/contracts/:id/supervisor`         | Chọn giám sát thay thế                                |
| `PUT`  | `/contracts/:id/supervisor/accept`  | Chấp nhận giám sát                                    |
| `PUT`  | `/contracts/:id/supervisor/reject`  | Từ chối giám sát                                      |
| `POST` | `/contracts/accept-proposal`        | Chốt báo giá, tạo công việc và escrow                 |
| `PUT`  | `/contracts/:id/confirm-completion` | Xác nhận hoàn thành theo vai trò                      |

## Progress - Tiến Độ Và Chất Lượng

### `POST /progress`

Chỉ freelancer được gán cho công việc `DangThucHien`, có trạng thái giám sát `DangGiamSat`, mới nộp được tiến độ.

```json
{
  "congViecId": 3,
  "freelancerId": 13,
  "tieuDe": "Bàn giao giao diện hoàn chỉnh",
  "moTa": "Đã hoàn thành bản giao để kiểm tra chất lượng.",
  "phanTram": 100,
  "tepDinhKem": "uploads/progress/frontend-final.zip"
}
```

Tiến độ mới có trạng thái `ChuaXacNhan`.

### `PUT /progress/:id`

Giám sát duyệt chất lượng:

```json
{
  "trangThaiXacNhan": "DaXacNhan",
  "xacNhanBoi": 21
}
```

Giám sát từ chối:

```json
{
  "trangThaiXacNhan": "TuChoi",
  "xacNhanBoi": 21
}
```

Quy tắc:

- Chỉ `giamSatId` của chính công việc đang giám sát được duyệt hoặc từ chối.
- Đơn vị giám sát phải đang hoạt động.
- Một mốc đã `DaXacNhan` hoặc `TuChoi` không thể sửa nội dung hay đổi kết quả.
- Mốc `100%` đã `DaXacNhan` là điều kiện để giám sát xác nhận hoàn thành công việc.

Response tiến độ có thông tin đơn vị giám sát:

```json
{
  "progress": {
    "tienDoId": 3,
    "congViecId": 3,
    "phanTram": 100,
    "xacNhanBoi": null,
    "trangThaiXacNhan": "ChuaXacNhan",
    "donViGiamSat": {
      "giamSatId": 21,
      "tenDonVi": "ISO Quality Control"
    }
  }
}
```

| Method   | Path            | Mô tả                                |
| -------- | --------------- | ------------------------------------ |
| `GET`    | `/progress/:id` | Chi tiết mốc tiến độ                 |
| `POST`   | `/progress`     | Freelancer nộp tiến độ               |
| `PUT`    | `/progress/:id` | Cập nhật hoặc giám sát duyệt/từ chối |
| `DELETE` | `/progress/:id` | Xóa mốc tiến độ                      |

## Disputes - Tranh Chấp

### Luật Mở Và Xử Lý Tranh Chấp

- Chỉ công việc `HoanThanh` mới được mở tranh chấp kết quả.
- Chỉ người thuê của công việc mới được mở tranh chấp.
- Mỗi công việc chỉ có tối đa một tranh chấp đang mở (`MoiMo` hoặc `DangXuLy`).
- Tranh chấp tự kế thừa `giamSatId` từ công việc.
- Chỉ đơn vị giám sát được gán cho công việc mới được review và resolve.
- Công việc vẫn giữ trạng thái `HoanThanh` trong khi có tranh chấp.

### `POST /disputes`

```json
{
  "congViecId": 7,
  "nguoiGuiId": 1,
  "lyDo": "Dashboard xuất sai tổng doanh thu",
  "moTa": "File xuất không khớp tiêu chí nghiệm thu.",
  "yeuCauHoanTien": 5000000
}
```

Không truyền `giamSatId` khi mở tranh chấp; backend lấy giám sát của công việc.

### `PUT /disputes/:id/review`

Đơn vị giám sát tiếp nhận tranh chấp `MoiMo`, chuyển thành `DangXuLy`.

```json
{
  "giamSatId": 21
}
```

### `PUT /disputes/:id/resolve`

```json
{
  "giamSatId": 21,
  "ketQua": "PhanChia",
  "lyDo": "Một phần báo cáo không đúng phạm vi đã nghiệm thu.",
  "soTienHoan": 5000000,
  "benChiuPhi": "HeThong"
}
```

Lưu ý quan trọng: endpoint `resolve` hiện lưu kết luận và đóng tranh chấp, nhưng chưa tự động tạo giao dịch `HoanTien` hoặc gọi luồng thanh toán hoàn tiền.

| Method | Path                      | Mô tả                            |
| ------ | ------------------------- | -------------------------------- |
| `POST` | `/disputes`               | Người thuê mở tranh chấp kết quả |
| `GET`  | `/disputes/:id`           | Chi tiết tranh chấp              |
| `GET`  | `/contracts/:id/disputes` | Tranh chấp của công việc         |
| `PUT`  | `/disputes/:id/review`    | Giám sát bắt đầu xử lý           |
| `PUT`  | `/disputes/:id/resolve`   | Giám sát kết luận                |

## Chat

Với tài khoản có vai trò `DonViGiamSat`, tên hiển thị trong hội thoại là `TenDonVi`, không phải tên tài khoản cá nhân.

| Method | Path                     | Mô tả              |
| ------ | ------------------------ | ------------------ |
| `POST` | `/chat`                  | Tạo hội thoại      |
| `GET`  | `/chat/:id`              | Chi tiết hội thoại |
| `PUT`  | `/chat/:id/close`        | Đóng hội thoại     |
| `GET`  | `/chat/:id/messages`     | Danh sách tin nhắn |
| `POST` | `/chat/:id/messages`     | Gửi tin nhắn       |
| `PUT`  | `/chat/:id/read/:userId` | Đánh dấu đã đọc    |

### WebSocket Chat

Kết nối Socket.IO:

```ts
const socket = io("http://localhost:8080/chat", {
  query: { userId: "21" },
});
```

| Event client gửi    | Payload                                                                            | Ý nghĩa                                   |
| ------------------- | ---------------------------------------------------------------------------------- | ----------------------------------------- |
| `joinConversation`  | `{ "cuocHoiThoaiId": 4 }`                                                          | Vào phòng hội thoại đã được phép truy cập |
| `leaveConversation` | `{ "cuocHoiThoaiId": 4 }`                                                          | Rời phòng                                 |
| `sendMessage`       | `{ "cuocHoiThoaiId": 4, "nguoiGuiId": 21, "noiDung": "...", "loaiTin": "VanBan" }` | Gửi và lưu tin nhắn                       |
| `markAsRead`        | `{ "cuocHoiThoaiId": 4, "userId": 21 }`                                            | Đánh dấu đã đọc                           |
| `typing`            | `{ "cuocHoiThoaiId": 4, "userId": 21, "isTyping": true }`                          | Báo đang nhập                             |

| Event server gửi      | Ý nghĩa                                |
| --------------------- | -------------------------------------- |
| `newMessage`          | Tin nhắn mới trong phòng đang tham gia |
| `messageNotification` | Có tin nhắn mới cho tài khoản          |
| `messagesRead`        | Thành viên đã đọc tin nhắn             |
| `userTyping`          | Thành viên đang nhập                   |
| `error`               | Hành động socket không hợp lệ          |

## Payments

| Method | Path                      | Mô tả                    |
| ------ | ------------------------- | ------------------------ |
| `POST` | `/payments/deposit`       | Tạo thanh toán đặt cọc   |
| `GET`  | `/payments/:id`           | Chi tiết thanh toán      |
| `GET`  | `/contracts/:id/payments` | Thanh toán của công việc |
| `PUT`  | `/payments/:id/release`   | Giải ngân thanh toán     |
| `PUT`  | `/payments/:id/refund`    | Hoàn tiền một thanh toán |

Trong luồng hoàn thành tự động:

| Loại thanh toán | Ý nghĩa                                     |
| --------------- | ------------------------------------------- |
| `DatCoc`        | Tiền người thuê nạp vào escrow              |
| `ThanhToanCuoi` | Tiền trả freelancer sau xác nhận hoàn thành |
| `PhiHeThong`    | Phí nền tảng 5% từ giá thỏa thuận           |
| `PhiGiamSat`    | Phí trả đơn vị giám sát                     |
| `HoanTien`      | Tiền hoàn khi thực hiện luồng refund        |

## Đặc Tả Request Và Response

Phần này mô tả payload và response để frontend có thể tích hợp trực tiếp. Các response ví dụ đã rút gọn mảng khi không ảnh hưởng đến cấu trúc; field của từng object vẫn được liệt kê đầy đủ ở response mẫu đầu tiên của module.

### Health Và Authentication

#### `GET /health`

Request: không có body.

Response `200`:

```json
{
  "status": "ok",
  "timestamp": "2026-05-26T03:15:22.402Z"
}
```

#### `POST /auth/register`

Request:

| Field         |                                      Kiểu | Bắt buộc | Ghi chú                                                 |
| ------------- | ----------------------------------------: | -------: | ------------------------------------------------------- |
| `tenDangNhap` |                                  `string` |       Có | Duy nhất                                                |
| `matKhau`     |                                  `string` |       Có | Hiện backend lưu theo implementation hiện tại           |
| `email`       |                                  `string` |       Có | Duy nhất                                                |
| `hoTen`       |                                  `string` |       Có | Tên tài khoản                                           |
| `soDienThoai` |                                  `string` |    Không | Số điện thoại                                           |
| `gioiTinh`    |                       `Nam \| Nu \| Khac` |    Không |                                                         |
| `diaChi`      |                                  `string` |    Không |                                                         |
| `vaiTro`      | `NguoiThue \| Freelancer \| DonViGiamSat` |    Không | Mặc định `NguoiThue`; không tự đăng ký `Admin`          |
| `tenDonVi`    |                                  `string` |    Không | Dùng khi `vaiTro = DonViGiamSat`; mặc định bằng `hoTen` |

```json
{
  "tenDangNhap": "gs_iso",
  "matKhau": "123123",
  "email": "quality@iso.vn",
  "hoTen": "Tai khoan quan ly ISO",
  "soDienThoai": "0901222333",
  "gioiTinh": "Khac",
  "diaChi": "Ha Noi",
  "vaiTro": "DonViGiamSat",
  "tenDonVi": "ISO Quality Control"
}
```

Response `201`:

```json
{
  "message": "Dang ky thanh cong",
  "user": {
    "taiKhoanId": 31,
    "tenDangNhap": "gs_iso",
    "email": "quality@iso.vn",
    "hoTen": "Tai khoan quan ly ISO",
    "soDienThoai": "0901222333",
    "gioiTinh": "Khac",
    "diaChi": "Ha Noi",
    "vaiTro": "DonViGiamSat",
    "trangThai": "HoatDong",
    "ngayTao": "2026-05-26T03:20:00.000Z"
  }
}
```

Khi đăng ký vai trò giám sát, backend tạo hồ sơ `DonViGiamSat`. Hồ sơ này tiếp tục được sử dụng khi chọn đơn vị phụ trách công việc.

#### `POST /auth/login`

Request:

```json
{
  "email": "iso@giamsat.vn",
  "matKhau": "123123"
}
```

Response `201`:

```json
{
  "message": "Dang nhap thanh cong",
  "user": {
    "taiKhoanId": 21,
    "tenDangNhap": "user_21",
    "email": "iso@giamsat.vn",
    "hoTen": "User 21",
    "soDienThoai": "0901000021",
    "gioiTinh": "Nam",
    "diaChi": "Ha Noi",
    "vaiTro": "DonViGiamSat",
    "trangThai": "HoatDong",
    "ngayTao": "2026-04-18T03:10:00.000Z"
  }
}
```

Lỗi nghiệp vụ thường gặp: thiếu email/mật khẩu, sai thông tin đăng nhập, tài khoản không ở trạng thái `HoatDong`.

### Users - Tài Khoản Và Hồ Sơ

`id` trong toàn bộ route users là `TaiKhoanID`.

#### User Object

```json
{
  "taiKhoanId": 1,
  "tenDangNhap": "thue_an",
  "email": "manhhuy2@gmail.com",
  "hoTen": "Nguyen Van An",
  "soDienThoai": "0901000001",
  "gioiTinh": "Nam",
  "diaChi": "Ha Noi",
  "vaiTro": "NguoiThue",
  "trangThai": "HoatDong",
  "ngayTao": "2026-04-18T01:00:00.000Z",
  "ngayCapNhat": "2026-04-22T02:00:00.000Z"
}
```

#### `GET /users`

Request: không có body.

Response `200`:

```json
{
  "total": 30,
  "users": [
    {
      "taiKhoanId": 1,
      "tenDangNhap": "thue_an",
      "email": "manhhuy2@gmail.com",
      "hoTen": "Nguyen Van An",
      "soDienThoai": "0901000001",
      "gioiTinh": "Nam",
      "diaChi": "Ha Noi",
      "vaiTro": "NguoiThue",
      "trangThai": "HoatDong",
      "ngayTao": "2026-04-18T01:00:00.000Z",
      "ngayCapNhat": "2026-04-22T02:00:00.000Z"
    }
  ]
}
```

#### `GET /users/search?keyword=iso`

Query:

| Query     |     Kiểu | Mô tả                                                     |
| --------- | -------: | --------------------------------------------------------- |
| `keyword` | `string` | Tìm trong tên đăng nhập, email, họ tên hoặc số điện thoại |

Response: cùng cấu trúc `GET /users`, nhưng `users` chỉ chứa kết quả khớp.

#### `GET /users/:id`

Response `200`:

```json
{
  "user": {
    "taiKhoanId": 21,
    "tenDangNhap": "user_21",
    "email": "iso@giamsat.vn",
    "hoTen": "User 21",
    "soDienThoai": "0901000021",
    "gioiTinh": "Nam",
    "diaChi": "Ha Noi",
    "vaiTro": "DonViGiamSat",
    "trangThai": "HoatDong",
    "ngayTao": "2026-04-18T03:10:00.000Z",
    "ngayCapNhat": "2026-04-22T03:40:00.000Z"
  }
}
```

#### `GET /users/:id/profile`

Request: không có body. Response thay đổi theo `vaiTro`.

Response cho người thuê:

```json
{
  "user": {
    "taiKhoanId": 1,
    "vaiTro": "NguoiThue",
    "hoTen": "Nguyen Van An",
    "email": "manhhuy2@gmail.com"
  },
  "profile": {
    "role": "NguoiThue",
    "nguoiThue": {
      "nguoiThueId": 1,
      "congTy": "An Tech Co",
      "moTa": "Can thue doi tac lam website",
      "diemTinCay": "4.6",
      "tongYeuCau": 20,
      "tyLeHoanThanh": "85"
    }
  }
}
```

Response cho freelancer:

```json
{
  "user": {
    "taiKhoanId": 13,
    "vaiTro": "Freelancer",
    "hoTen": "User 13",
    "email": "dev1@freelancer.vn"
  },
  "profile": {
    "role": "Freelancer",
    "freelancer": {
      "freelancerId": 5,
      "kinhNghiem": 4,
      "chuyenGia": "Fullstack Engineer",
      "kyNang": "NestJS, Prisma, React",
      "xepHang": "4.4",
      "soDu": "7600000",
      "xacThucEmail": true,
      "xacThucSDT": true,
      "tongCongViec": 25,
      "tyLeHoanThanh": "88"
    }
  }
}
```

Response cho đơn vị giám sát:

```json
{
  "user": {
    "taiKhoanId": 21,
    "vaiTro": "DonViGiamSat",
    "hoTen": "User 21",
    "email": "iso@giamsat.vn"
  },
  "profile": {
    "role": "DonViGiamSat",
    "donViGiamSat": {
      "giamSatId": 2,
      "tenDonVi": "ISO Quality Control",
      "moTa": "Giam sat chat luong ISO",
      "nangLuc": "Kiem thu, bao cao, ISO",
      "chungChi": "ISO-CERT",
      "phiGiamSat": "450000",
      "xepHang": "4.5",
      "tongCongViecGS": 35,
      "trangThai": "HoatDong",
      "ngayDangKy": "2026-04-11T02:00:00.000Z"
    }
  }
}
```

Lưu ý: `profile.donViGiamSat.giamSatId = 2` là ID hồ sơ, trong khi `giamSatId = 21` dùng ở yêu cầu/công việc là ID tài khoản của đơn vị này.

#### `PUT /users/:id`

Request có thể truyền một hoặc nhiều field:

```json
{
  "hoTen": "Nguyen Van An Updated",
  "soDienThoai": "0901999999",
  "diaChi": "TP HCM",
  "trangThai": "HoatDong"
}
```

Response:

```json
{
  "message": "Cap nhat nguoi dung thanh cong",
  "user": {
    "taiKhoanId": 1,
    "tenDangNhap": "thue_an",
    "email": "manhhuy2@gmail.com",
    "hoTen": "Nguyen Van An Updated",
    "soDienThoai": "0901999999",
    "gioiTinh": "Nam",
    "diaChi": "TP HCM",
    "vaiTro": "NguoiThue",
    "trangThai": "HoatDong",
    "ngayTao": "2026-04-18T01:00:00.000Z",
    "ngayCapNhat": "2026-05-26T03:30:00.000Z"
  }
}
```

#### `DELETE /users/:id`

Request: không có body. Đây là xóa mềm, tài khoản được chuyển trạng thái.

```json
{
  "message": "Xoa nguoi dung thanh cong",
  "userId": 30,
  "trangThai": "DaBi"
}
```

#### Các Route Liên Kết Của User

| Route                          | Request                                       | Response                                                  |
| ------------------------------ | --------------------------------------------- | --------------------------------------------------------- |
| `GET /users/:id/jobs`          | Không body; `:id` là người thuê               | `{ "total": number, "jobs": JobWithDetails[] }`           |
| `GET /users/:id/contracts`     | Không body; lấy công việc liên quan tài khoản | `{ "total": number, "contracts": ContractWithDetails[] }` |
| `GET /users/:id/conversations` | Không body; lấy hội thoại có thể truy cập     | `{ "total": number, "conversations": Conversation[] }`    |

### Categories - Loại Dịch Vụ

#### Category Object

```json
{
  "loaiDichVuId": 6,
  "tenLoai": "Frontend web",
  "moTa": "Giao dien web hien dai",
  "hinhAnh": "panels-top-left"
}
```

#### `GET /categories`

Response:

```json
{
  "total": 10,
  "categories": [
    {
      "loaiDichVuId": 6,
      "tenLoai": "Frontend web",
      "moTa": "Giao dien web hien dai",
      "hinhAnh": "panels-top-left"
    }
  ]
}
```

#### `GET /categories/:id`

Response:

```json
{
  "category": {
    "loaiDichVuId": 6,
    "tenLoai": "Frontend web",
    "moTa": "Giao dien web hien dai",
    "hinhAnh": "panels-top-left"
  }
}
```

#### `POST /categories`

Request:

```json
{
  "tenLoai": "Cybersecurity",
  "moTa": "Danh gia va bao mat he thong",
  "hinhAnh": "lock"
}
```

Response:

```json
{
  "message": "Tao loai dich vu thanh cong",
  "category": {
    "loaiDichVuId": 11,
    "tenLoai": "Cybersecurity",
    "moTa": "Danh gia va bao mat he thong",
    "hinhAnh": "lock"
  }
}
```

#### `PUT /categories/:id`

Request:

```json
{
  "moTa": "Danh gia bao mat web va mobile",
  "hinhAnh": "shield"
}
```

Response: `{ "message": "Cap nhat loai dich vu thanh cong", "category": CategoryObject }`.

#### `DELETE /categories/:id`

Request: không có body.

Response:

```json
{
  "message": "Xoa loai dich vu thanh cong",
  "categoryId": 11
}
```

### Skills - Danh Mục Kỹ Năng

#### Skill Object

```json
{
  "kyNangId": 11,
  "tenKyNang": "React",
  "moTa": "Thu vien UI JavaScript"
}
```

| Route                | Request                                                | Response                                                             |
| -------------------- | ------------------------------------------------------ | -------------------------------------------------------------------- |
| `GET /skills`        | Không body                                             | `{ "total": number, "skills": SkillObject[] }`                       |
| `GET /skills/:id`    | Không body                                             | `{ "skill": SkillObject }`                                           |
| `POST /skills`       | `{ "tenKyNang": "Playwright", "moTa": "E2E testing" }` | `{ "message": "Tao ky nang thanh cong", "skill": SkillObject }`      |
| `PUT /skills/:id`    | `{ "moTa": "Automated E2E testing" }`                  | `{ "message": "Cap nhat ky nang thanh cong", "skill": SkillObject }` |
| `DELETE /skills/:id` | Không body                                             | `{ "message": "Xoa ky nang thanh cong", "kyNangId": number }`        |

Tên kỹ năng phải không trùng khi tạo mới.

### Jobs - Request Và Response Đầy Đủ

#### JobWithDetails Object

Các API trả về yêu cầu sử dụng object sau:

```json
{
  "yeuCauId": 32,
  "nguoiThueId": 1,
  "loaiDichVuId": 8,
  "tieuDe": "Kiem thu nghiem thu cong thanh toan",
  "moTa": "Kiem thu hoan chinh cong thanh toan va bao cao loi.",
  "nganSachMin": "10000000",
  "nganSachMax": "14000000",
  "thoiHan": "2026-05-24T00:00:00.000Z",
  "trangThai": "DaChot",
  "soLuongBaoGia": 1,
  "yeuCauGiamSat": true,
  "giamSatId": 21,
  "ngayTao": "2026-04-25T02:00:00.000Z",
  "ngayCapNhat": "2026-05-24T10:00:00.000Z",
  "nguoiThue": {
    "taiKhoanId": 1,
    "hoTen": "Nguyen Van An",
    "email": "manhhuy2@gmail.com"
  },
  "loaiDichVu": {
    "loaiDichVuId": 8,
    "tenLoai": "QA testing"
  },
  "giamSat": {
    "giamSatId": 21,
    "tenDonVi": "ISO Quality Control"
  },
  "kyNangs": [
    {
      "kyNangId": 31,
      "tenKyNang": "Testing"
    },
    {
      "kyNangId": 33,
      "tenKyNang": "OWASP"
    }
  ]
}
```

#### `GET /jobs`

Request: không có body.

Response:

```json
{
  "total": 33,
  "jobs": [
    {
      "yeuCauId": 32,
      "tieuDe": "Kiem thu nghiem thu cong thanh toan",
      "giamSatId": 21,
      "trangThai": "DaChot",
      "giamSat": {
        "giamSatId": 21,
        "tenDonVi": "ISO Quality Control"
      },
      "kyNangs": [{ "kyNangId": 31, "tenKyNang": "Testing" }]
    }
  ]
}
```

Mỗi phần tử thật trong `jobs` có đủ field của `JobWithDetails Object`.

#### `GET /jobs/search`

Request query:

| Query      | Ví dụ      | Ý nghĩa                                    |
| ---------- | ---------- | ------------------------------------------ |
| `keyword`  | `react`    | Tìm trong tiêu đề và mô tả                 |
| `category` | `6`        | `LoaiDichVuID`                             |
| `budget`   | `12000000` | Lọc theo khoảng ngân sách phù hợp          |
| `skills`   | `11,14,15` | Lọc công việc có ít nhất một kỹ năng trùng |

Ví dụ: `GET /jobs/search?keyword=dashboard&category=6&skills=11,14`

Response: `{ "total": number, "jobs": JobWithDetails[] }`.

#### `GET /jobs/:id`

Request: không có body.

Response: `{ "job": JobWithDetailsObject }`.

#### `POST /jobs`

Request đầy đủ:

```json
{
  "nguoiThueId": 1,
  "loaiDichVuId": 6,
  "giamSatId": 21,
  "tieuDe": "Landing page gioi thieu san pham",
  "moTa": "Phat trien trang responsive va tich hop form.",
  "nganSachMin": 7000000,
  "nganSachMax": 12000000,
  "thoiHan": "2026-07-30",
  "kyNangIds": [11, 14, 15]
}
```

Response:

```json
{
  "message": "Tao yeu cau thanh cong",
  "job": {
    "yeuCauId": 34,
    "nguoiThueId": 1,
    "loaiDichVuId": 6,
    "giamSatId": 21,
    "tieuDe": "Landing page gioi thieu san pham",
    "moTa": "Phat trien trang responsive va tich hop form.",
    "nganSachMin": "7000000",
    "nganSachMax": "12000000",
    "thoiHan": "2026-07-30T00:00:00.000Z",
    "trangThai": "DangNhanHoSo",
    "soLuongBaoGia": 0,
    "yeuCauGiamSat": true,
    "nguoiThue": {
      "taiKhoanId": 1,
      "hoTen": "Nguyen Van An",
      "email": "manhhuy2@gmail.com"
    },
    "loaiDichVu": {
      "loaiDichVuId": 6,
      "tenLoai": "Frontend web"
    },
    "giamSat": {
      "giamSatId": 21,
      "tenDonVi": "ISO Quality Control"
    },
    "kyNangs": [
      { "kyNangId": 11, "tenKyNang": "React" },
      { "kyNangId": 14, "tenKyNang": "TypeScript" },
      { "kyNangId": 15, "tenKyNang": "TailwindCSS" }
    ]
  }
}
```

Điều kiện:

- `nguoiThueId`, danh mục và các kỹ năng phải tồn tại.
- `giamSatId` phải là `TaiKhoanID` có hồ sơ đơn vị giám sát đang `HoatDong`.
- `nganSachMin`, `nganSachMax` không âm và min không lớn hơn max.
- Yêu cầu mới luôn có `trangThai = DangNhanHoSo`, `yeuCauGiamSat = true`.

#### `PUT /jobs/:id`

Request, tất cả field đều tùy chọn:

```json
{
  "loaiDichVuId": 6,
  "giamSatId": 25,
  "tieuDe": "Landing page va dashboard",
  "moTa": "Cap nhat them dashboard thong ke.",
  "nganSachMin": 10000000,
  "nganSachMax": 18000000,
  "thoiHan": "2026-08-10",
  "trangThai": "DaDong"
}
```

Response: `{ "message": "Cap nhat yeu cau thanh cong", "job": JobWithDetailsObject }`.

Quy tắc trạng thái: `DangNhanHoSo -> DaDong | DaHuy`, `DaDong -> DaHuy`. Trạng thái `DaChot` chỉ phát sinh từ việc chấp nhận báo giá. Có thể đổi giám sát khi yêu cầu chưa chốt.

#### Kỹ Năng Của Yêu Cầu

| Route                               | Request                         | Response                                                                                                   |
| ----------------------------------- | ------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `GET /jobs/:id/skills`              | Không body                      | `{ "message": "Lay danh sach ky nang thanh cong", "kyNangs": [{ "kyNangId": 11, "tenKyNang": "React" }] }` |
| `PUT /jobs/:id/skills`              | `{ "kyNangIds": [11, 14, 15] }` | `{ "message": "Cap nhat ky nang yeu cau thanh cong", "kyNangs": SkillSummary[] }`                          |
| `POST /jobs/:id/skills/:kyNangId`   | Không body                      | `{ "message": "Lay danh sach ky nang thanh cong", "kyNangs": SkillSummary[] }`                             |
| `DELETE /jobs/:id/skills/:kyNangId` | Không body                      | `{ "message": "Lay danh sach ky nang thanh cong", "kyNangs": SkillSummary[] }`                             |

#### `DELETE /jobs/:id`

Request: không có body. API hủy yêu cầu.

Response:

```json
{
  "message": "Xoa yeu cau thanh cong",
  "jobId": 34
}
```

### Proposals - Báo Giá Chi Tiết

#### ProposalWithDetails Object

```json
{
  "baoGiaId": 33,
  "yeuCauId": 32,
  "freelancerId": 13,
  "giaDeXuat": "12000000",
  "thoiGianThucHien": 20,
  "noiDung": "Kiem thu cong thanh toan, tong hop test case va bao cao nghiem thu day du.",
  "trangThai": "DuocChon",
  "ngayTao": "2026-04-26T02:00:00.000Z",
  "ngayCapNhat": "2026-05-24T10:00:00.000Z",
  "freelancer": {
    "freelancerId": 5,
    "taiKhoanId": 13,
    "hoTen": "User 13",
    "email": "dev1@freelancer.vn",
    "kinhNghiem": 4,
    "kyNang": "NestJS, Prisma, React",
    "kyNangs": [
      { "kyNangId": 1, "tenKyNang": "NestJS" },
      { "kyNangId": 11, "tenKyNang": "React" }
    ],
    "xepHang": "4.4"
  },
  "yeuCau": {
    "yeuCauId": 32,
    "tieuDe": "Kiem thu nghiem thu cong thanh toan",
    "nguoiThueId": 1
  }
}
```

Trong proposal, `freelancerId` cấp ngoài là `TaiKhoanID`; `freelancer.freelancerId` là ID hồ sơ freelancer.

#### `GET /jobs/:id/proposals`

Response:

```json
{
  "total": 1,
  "proposals": [
    {
      "baoGiaId": 33,
      "yeuCauId": 32,
      "freelancerId": 13,
      "giaDeXuat": "12000000",
      "thoiGianThucHien": 20,
      "noiDung": "Kiem thu cong thanh toan...",
      "trangThai": "DuocChon",
      "freelancer": {
        "freelancerId": 5,
        "taiKhoanId": 13,
        "hoTen": "User 13",
        "email": "dev1@freelancer.vn",
        "kinhNghiem": 4,
        "kyNang": "NestJS, Prisma, React",
        "kyNangs": [],
        "xepHang": "4.4"
      },
      "yeuCau": {
        "yeuCauId": 32,
        "tieuDe": "Kiem thu nghiem thu cong thanh toan",
        "nguoiThueId": 1
      }
    }
  ]
}
```

#### `GET /proposals/:id`

Response: `{ "proposal": ProposalWithDetailsObject }`.

#### `POST /proposals`

Request:

```json
{
  "yeuCauId": 34,
  "freelancerId": 13,
  "giaDeXuat": 11000000,
  "thoiGianThucHien": 14,
  "noiDung": "Trien khai React va ban giao source kem tai lieu."
}
```

Response:

```json
{
  "message": "Tao bao gia thanh cong",
  "proposal": {
    "baoGiaId": 35,
    "yeuCauId": 34,
    "freelancerId": 13,
    "giaDeXuat": "11000000",
    "thoiGianThucHien": 14,
    "noiDung": "Trien khai React va ban giao source kem tai lieu.",
    "trangThai": "DaGui"
  }
}
```

Điều kiện: yêu cầu phải đang `DangNhanHoSo`; giá và thời gian phải lớn hơn `0`; một tài khoản freelancer không gửi hai báo giá cho cùng yêu cầu.

#### `PUT /proposals/:id`

Request:

```json
{
  "giaDeXuat": 10500000,
  "thoiGianThucHien": 12,
  "noiDung": "Cap nhat pham vi ban giao va lich trinh."
}
```

Response: `{ "message": "Cap nhat bao gia thanh cong", "proposal": ProposalWithDetailsObject }`.

`trangThai` có thể thuộc `DaGui`, `DuocChon`, `TuChoi`, `HetHan`; trong flow chính, `DuocChon` nên được backend thiết lập bằng `/contracts/accept-proposal`.

#### `DELETE /proposals/:id`

Request: không có body.

```json
{
  "message": "Xoa bao gia thanh cong",
  "proposalId": 35
}
```

### Freelancers - Kỹ Năng Và Báo Giá

`id` trong các route dưới là `TaiKhoanID` của freelancer.

| Route                                      | Request                           | Response                                                                                                                       |
| ------------------------------------------ | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `GET /freelancers/:id/proposals`           | Không body                        | `{ "total": number, "proposals": ProposalWithDetailsObject[] }`                                                                |
| `GET /freelancers/:id/skills`              | Không body                        | `{ "message": "Lay danh sach ky nang thanh cong", "freelancerId": 13, "kyNangs": [{ "kyNangId": 11, "tenKyNang": "React" }] }` |
| `PUT /freelancers/:id/skills`              | `{ "kyNangIds": [1, 2, 11, 14] }` | `{ "message": "Lay danh sach ky nang thanh cong", "freelancerId": 13, "kyNangs": SkillSummary[] }`                             |
| `POST /freelancers/:id/skills/:kyNangId`   | Không body                        | `{ "message": "Lay danh sach ky nang thanh cong", "freelancerId": 13, "kyNangs": SkillSummary[] }`                             |
| `DELETE /freelancers/:id/skills/:kyNangId` | Không body                        | `{ "message": "Lay danh sach ky nang thanh cong", "freelancerId": 13, "kyNangs": SkillSummary[] }`                             |

### Supervisors - Đơn Vị Giám Sát

Hai loại ID cần đặc biệt lưu ý:

| Nơi dùng                                                          | ID được truyền                               |
| ----------------------------------------------------------------- | -------------------------------------------- |
| `/supervisors/:id`, `/admin/supervisors/:id/approve`              | `DonViGiamSat.GiamSatID`, ví dụ `2`          |
| `/jobs`, `/contracts`, `/progress`, `/disputes` field `giamSatId` | `TaiKhoan.TaiKhoanID` của đơn vị, ví dụ `21` |

#### Supervisor Object

```json
{
  "giamSatId": 2,
  "taiKhoanId": 21,
  "tenDonVi": "ISO Quality Control",
  "moTa": "Giam sat chat luong ISO",
  "nangLuc": "Kiem thu, bao cao, ISO",
  "chungChi": "ISO-CERT",
  "phiGiamSat": "450000",
  "xepHang": "4.5",
  "tongCongViecGS": 35,
  "trangThai": "HoatDong",
  "ngayDangKy": "2026-04-11T02:00:00.000Z",
  "taiKhoan": {
    "taiKhoanId": 21,
    "hoTen": "User 21",
    "email": "iso@giamsat.vn",
    "soDienThoai": "0901000021"
  }
}
```

#### `GET /supervisors` Và `GET /supervisors/search?keyword=ISO`

Response:

```json
{
  "total": 1,
  "supervisors": [
    {
      "giamSatId": 2,
      "taiKhoanId": 21,
      "tenDonVi": "ISO Quality Control",
      "phiGiamSat": "450000",
      "xepHang": "4.5",
      "tongCongViecGS": 35,
      "trangThai": "HoatDong",
      "taiKhoan": {
        "taiKhoanId": 21,
        "hoTen": "User 21",
        "email": "iso@giamsat.vn",
        "soDienThoai": "0901000021"
      }
    }
  ]
}
```

Mỗi phần tử thật có đầy đủ field của `Supervisor Object`. Search tìm theo tên đơn vị, mô tả hoặc năng lực.

#### `GET /supervisors/:id`

Ví dụ `GET /supervisors/2`.

Response: `{ "supervisor": SupervisorObject }`.

#### `POST /supervisors`

Request:

```json
{
  "taiKhoanId": 31,
  "tenDonVi": "Quality Partner",
  "moTa": "Giam sat tien do va nghiem thu",
  "nangLuc": "QA, audit, bao cao",
  "chungChi": "QA-2026",
  "phiGiamSat": 500000
}
```

Response:

```json
{
  "message": "Tao don vi giam sat thanh cong",
  "supervisor": {
    "giamSatId": 10,
    "taiKhoanId": 31,
    "tenDonVi": "Quality Partner",
    "moTa": "Giam sat tien do va nghiem thu",
    "nangLuc": "QA, audit, bao cao",
    "chungChi": "QA-2026",
    "phiGiamSat": "500000",
    "xepHang": "0",
    "tongCongViecGS": 0,
    "trangThai": "ChoDuyet",
    "ngayDangKy": "2026-05-26T04:00:00.000Z"
  }
}
```

Điều kiện: tài khoản tồn tại, chưa có hồ sơ đơn vị giám sát, phí không âm. Hồ sơ mới bắt đầu ở `ChoDuyet`.

#### `PUT /supervisors/:id`

Request:

```json
{
  "tenDonVi": "Quality Partner Vietnam",
  "phiGiamSat": 550000,
  "trangThai": "HoatDong"
}
```

Response: `{ "message": "Cap nhat don vi giam sat thanh cong", "supervisor": SupervisorObject }`.

Trạng thái hồ sơ hợp lệ: `HoatDong`, `TamNghi`, `BiKhoa`, `ChoDuyet`.

#### `DELETE /supervisors/:id`

Request: không có body. Xóa mềm bằng cách chuyển trạng thái hồ sơ sang `BiKhoa`.

Response:

```json
{
  "message": "Xoa don vi giam sat thanh cong",
  "supervisorId": 10
}
```

### Recommendations - Gợi Ý

#### `GET /recommendations/freelancers/:yeuCauId`

Request: không có body; `:yeuCauId` là ID yêu cầu.

Response:

```json
{
  "total": 2,
  "yeuCauId": 15,
  "freelancers": [
    {
      "freelancerId": 5,
      "taiKhoanId": 13,
      "hoTen": "User 13",
      "email": "dev1@freelancer.vn",
      "chuyenGia": "Fullstack Engineer",
      "kinhNghiem": 4,
      "xepHang": "4.4",
      "tongCongViec": 25,
      "tyLeHoanThanh": "88",
      "kyNangs": [
        { "kyNangId": 11, "tenKyNang": "React" },
        { "kyNangId": 14, "tenKyNang": "TypeScript" }
      ],
      "soKyNangKhop": 2
    }
  ]
}
```

API chỉ đưa freelancer có tài khoản hoạt động; nếu yêu cầu có kỹ năng, freelancer cần khớp ít nhất một kỹ năng.

#### `GET /recommendations/supervisors`

Request: không có body.

Response:

```json
{
  "total": 2,
  "supervisors": [
    {
      "giamSatId": 2,
      "taiKhoanId": 21,
      "tenDonVi": "ISO Quality Control",
      "moTa": "Giam sat chat luong ISO",
      "nangLuc": "Kiem thu, bao cao, ISO",
      "chungChi": "ISO-CERT",
      "phiGiamSat": "450000",
      "xepHang": "4.5",
      "tongCongViecGS": 35
    }
  ]
}
```

Chỉ đơn vị `HoatDong` được đề xuất.

### Contracts - Response Model Và Tất Cả Hành Động

#### ContractWithDetails Object

```json
{
  "congViecId": 3,
  "yeuCauId": 15,
  "freelancerId": 13,
  "nguoiThueId": 1,
  "giaThoa": "9500000",
  "thoiGianThoa": 18,
  "trangThai": "DangThucHien",
  "ngayBatDau": "2026-05-14T02:00:00.000Z",
  "ngayKetThuc": null,
  "giamSatId": 21,
  "trangThaiGiamSat": "DangGiamSat",
  "phiGiamSat": "450000",
  "ngayTao": "2026-05-14T01:30:00.000Z",
  "yeuCau": {
    "yeuCauId": 15,
    "tieuDe": "Giao dien frontend React",
    "moTa": "Phat trien giao dien hien dai voi React 18..."
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
    "tenDonVi": "ISO Quality Control",
    "email": "iso@giamsat.vn"
  }
}
```

`freelancerId`, `nguoiThueId`, `giamSatId` trong công việc đều là `TaiKhoanID`.

#### `GET /contracts`

Response: `{ "total": number, "contracts": ContractWithDetailsObject[] }`.

#### `GET /contracts/:id` Và `GET /contracts/:id/detail`

Request: không có body.

Response: `{ "contract": ContractWithDetailsObject }`.

#### `POST /contracts`

Không dùng để tạo trực tiếp.

Request bất kỳ sẽ bị từ chối:

```json
{
  "yeuCauId": 15,
  "freelancerId": 13
}
```

Response lỗi:

```json
{
  "statusCode": 400,
  "message": "Cong viec chi duoc tao khi chot freelancer qua /contracts/accept-proposal",
  "error": "Bad Request"
}
```

#### `POST /contracts/accept-proposal`

Request:

```json
{
  "baoGiaId": 24,
  "nguoiThueId": 1,
  "phiGiamSat": 450000
}
```

Response:

```json
{
  "message": "Chap nhan bao gia thanh cong. Tien da duoc giu boi he thong (escrow).",
  "congViecId": 3,
  "escrow": {
    "giaThoa": "9500000",
    "phiGiamSat": "450000",
    "tongThanhToan": "9950000",
    "thanhToanId": 6
  }
}
```

Backend thực hiện đồng thời:

1. Xác nhận `nguoiThueId` sở hữu yêu cầu của báo giá.
2. Đổi báo giá đã chọn sang `DuocChon` và các báo giá khác sang `TuChoi`.
3. Đổi yêu cầu thành `DaChot`.
4. Tạo công việc có giám sát kế thừa từ yêu cầu.
5. Tạo lời mời giám sát `ChoDuyet`.
6. Tạo giao dịch escrow bằng `giaThoa + phiGiamSat`.

#### `PUT /contracts/:id/status`

Request:

```json
{
  "trangThai": "DangThucHien"
}
```

Response: `{ "message": "Cap nhat trang thai hop dong thanh cong", "contract": ContractWithDetailsObject }`.

Giá trị nhận: `MoiTao`, `DangThucHien`, `HoanThanh`, `DaHuy`. Công việc hoàn thành đang có tranh chấp không được chuyển sang trạng thái khác.

#### `POST /contracts/:id/supervisor`

Request chọn đơn vị phụ trách thay thế:

```json
{
  "giamSatId": 25,
  "phiGiamSat": 530000
}
```

Response:

```json
{
  "message": "Chon don vi giam sat thanh cong",
  "yeuCauGiamSatId": 8,
  "trangThai": "ChoDuyet"
}
```

Điều kiện: `giamSatId` là ID tài khoản của đơn vị đang hoạt động và phí không âm. Khi chọn đơn vị thay thế, backend chuyển các lời mời còn `ChoDuyet` trước đó sang `TuChoi`.

#### `PUT /contracts/:id/supervisor/accept`

Request: không có body.

Response:

```json
{
  "message": "Chap nhan don vi giam sat thanh cong",
  "yeuCauGiamSatId": 5,
  "trangThai": "DaChapNhan"
}
```

Hiệu lực: `CongViec.TrangThaiGiamSat` trở thành `DangGiamSat`, cho phép freelancer nộp tiến độ.

#### `PUT /contracts/:id/supervisor/reject`

Request: không có body.

Response:

```json
{
  "message": "Tu choi don vi giam sat thanh cong",
  "yeuCauGiamSatId": 8,
  "trangThai": "TuChoi"
}
```

#### `PUT /contracts/:id/confirm-completion`

Request của freelancer:

```json
{
  "role": "Freelancer",
  "userId": 13
}
```

Request của đơn vị giám sát:

```json
{
  "role": "GiamSat",
  "userId": 21
}
```

Request của người thuê:

```json
{
  "role": "NguoiThue",
  "userId": 1
}
```

Response khi chưa đủ ba bên:

```json
{
  "message": "GiamSat da xac nhan hoan thanh.",
  "congViecId": 3,
  "freelancerXacNhan": true,
  "giamSatXacNhan": true,
  "nguoiThueXacNhan": false,
  "released": false
}
```

Response khi người thuê xác nhận cuối cùng và hệ thống giải ngân:

```json
{
  "message": "Tat ca cac ben da xac nhan. Tien da duoc giai ngan.",
  "congViecId": 3,
  "freelancerXacNhan": true,
  "giamSatXacNhan": true,
  "nguoiThueXacNhan": true,
  "released": true,
  "disbursement": {
    "freelancerNhan": "9025000",
    "giamSatNhan": "450000",
    "phiHeThong": "475000"
  }
}
```

Điều kiện quan trọng:

- Công việc phải `DangThucHien` và đã có escrow.
- Mỗi role chỉ xác nhận bằng đúng `TaiKhoanID` được gán.
- Giám sát chỉ xác nhận hoàn thành sau khi chính đơn vị đó đã duyệt một tiến độ `100%` thành `DaXacNhan`.
- Người thuê chỉ xác nhận sau freelancer và giám sát.
- Xác nhận cuối chuyển công việc sang `HoanThanh` và ghi thanh toán giải ngân.

#### Route Dữ Liệu Con Của Công Việc

| Route                              | Request    | Response                                                       |
| ---------------------------------- | ---------- | -------------------------------------------------------------- |
| `GET /contracts/:id/progress`      | Không body | `{ "total": number, "progress": ProgressWithDetailsObject[] }` |
| `GET /contracts/:id/conversations` | Không body | `{ "total": number, "conversations": ConversationObject[] }`   |

### Progress - Tiến Độ Và Nghiệm Thu Chất Lượng

#### ProgressWithDetails Object

```json
{
  "tienDoId": 3,
  "congViecId": 3,
  "freelancerId": 13,
  "tieuDe": "Ban giao giao dien hoan chinh",
  "moTa": "Freelancer da nop ban giao giao dien dat moc 100%, dang cho don vi giam sat xac nhan chat luong.",
  "phanTram": 100,
  "tepDinhKem": "uploads/progress/frontend-final.zip",
  "xacNhanBoi": null,
  "trangThaiXacNhan": "ChuaXacNhan",
  "ngayTao": "2026-05-18T02:00:00.000Z",
  "congViec": {
    "congViecId": 3,
    "yeuCauId": 15,
    "giaThoa": "9500000"
  },
  "freelancer": {
    "freelancerId": 13,
    "taiKhoanId": 13,
    "hoTen": "User 13",
    "email": "dev1@freelancer.vn"
  },
  "donViGiamSat": {
    "giamSatId": 21,
    "tenDonVi": "ISO Quality Control"
  }
}
```

#### `GET /progress/:id`

Request: không có body.

Response: `{ "progress": ProgressWithDetailsObject }`.

#### `GET /contracts/:id/progress`

Response:

```json
{
  "total": 1,
  "progress": [
    {
      "tienDoId": 3,
      "congViecId": 3,
      "freelancerId": 13,
      "tieuDe": "Ban giao giao dien hoan chinh",
      "moTa": "Freelancer da nop ban giao...",
      "phanTram": 100,
      "tepDinhKem": "uploads/progress/frontend-final.zip",
      "xacNhanBoi": null,
      "trangThaiXacNhan": "ChuaXacNhan",
      "ngayTao": "2026-05-18T02:00:00.000Z",
      "congViec": {
        "congViecId": 3,
        "yeuCauId": 15,
        "giaThoa": "9500000"
      },
      "freelancer": {
        "freelancerId": 13,
        "taiKhoanId": 13,
        "hoTen": "User 13",
        "email": "dev1@freelancer.vn"
      },
      "donViGiamSat": {
        "giamSatId": 21,
        "tenDonVi": "ISO Quality Control"
      }
    }
  ]
}
```

#### `POST /progress`

Request:

```json
{
  "congViecId": 3,
  "freelancerId": 13,
  "tieuDe": "Ban giao giao dien hoan chinh",
  "moTa": "Da hoan thanh ban giao de giam sat nghiem thu.",
  "phanTram": 100,
  "tepDinhKem": "uploads/progress/frontend-final.zip"
}
```

Response:

```json
{
  "message": "Tao tien do thanh cong",
  "progress": {
    "tienDoId": 6,
    "congViecId": 3,
    "freelancerId": 13,
    "tieuDe": "Ban giao giao dien hoan chinh",
    "moTa": "Da hoan thanh ban giao de giam sat nghiem thu.",
    "phanTram": 100,
    "tepDinhKem": "uploads/progress/frontend-final.zip",
    "xacNhanBoi": null,
    "trangThaiXacNhan": "ChuaXacNhan",
    "donViGiamSat": {
      "giamSatId": 21,
      "tenDonVi": "ISO Quality Control"
    }
  }
}
```

Điều kiện:

- `phanTram` từ `0` đến `100`.
- `freelancerId` phải là freelancer của công việc.
- Công việc phải `DangThucHien`.
- Đơn vị giám sát đã nhận việc, tức `TrangThaiGiamSat = DangGiamSat`.

#### `PUT /progress/:id` - Freelancer Sửa Bản Chưa Duyệt

Request:

```json
{
  "tieuDe": "Ban giao UI cap nhat",
  "moTa": "Da bo sung responsive breakpoint.",
  "phanTram": 100,
  "tepDinhKem": "uploads/progress/frontend-final-v2.zip"
}
```

Response: `{ "message": "Cap nhat tien do thanh cong", "progress": ProgressWithDetailsObject }`.

Chỉ sửa được khi tiến độ còn `ChuaXacNhan`.

#### `PUT /progress/:id` - Giám Sát Duyệt

Request:

```json
{
  "trangThaiXacNhan": "DaXacNhan",
  "xacNhanBoi": 21
}
```

Response:

```json
{
  "message": "Cap nhat tien do thanh cong",
  "progress": {
    "tienDoId": 3,
    "congViecId": 3,
    "phanTram": 100,
    "xacNhanBoi": 21,
    "trangThaiXacNhan": "DaXacNhan",
    "donViGiamSat": {
      "giamSatId": 21,
      "tenDonVi": "ISO Quality Control"
    }
  }
}
```

#### `PUT /progress/:id` - Giám Sát Từ Chối

Request:

```json
{
  "trangThaiXacNhan": "TuChoi",
  "xacNhanBoi": 21
}
```

Response: cùng cấu trúc phía trên với `trangThaiXacNhan = TuChoi`.

Backend kiểm tra:

- `xacNhanBoi` bắt buộc khi có `trangThaiXacNhan`.
- Chỉ nhận `DaXacNhan` hoặc `TuChoi` làm kết quả duyệt; client không tự đặt `ChuaXacNhan`.
- `xacNhanBoi` phải bằng tài khoản đơn vị giám sát của công việc.
- Đơn vị đó phải đang hoạt động và công việc còn đang được đơn vị đó giám sát.
- Tiến độ đã xử lý không thể sửa hoặc duyệt lại.

#### `DELETE /progress/:id`

Request: không có body.

Response:

```json
{
  "message": "Xoa tien do thanh cong",
  "progressId": 6
}
```

### Chat REST Và Socket.IO

#### Conversation Object

```json
{
  "cuocHoiThoaiId": 4,
  "congViecId": 7,
  "thanhVien1": {
    "taiKhoanId": 1,
    "hoTen": "Nguyen Van An",
    "email": "manhhuy2@gmail.com"
  },
  "thanhVien2": {
    "taiKhoanId": 13,
    "hoTen": "User 13",
    "email": "dev1@freelancer.vn"
  },
  "giamSat": {
    "taiKhoanId": 21,
    "hoTen": "ISO Quality Control",
    "email": "iso@giamsat.vn"
  },
  "tinNhanCuoi": "2026-05-24T03:00:00.000Z",
  "trangThai": "DangMo",
  "ngayTao": "2026-05-23T03:00:00.000Z"
}
```

Khi member là giám sát, field `hoTen` hiển thị `TenDonVi`, ví dụ `ISO Quality Control`.

#### Message Object

```json
{
  "tinNhanId": 8,
  "cuocHoiThoaiId": 4,
  "nguoiGui": {
    "taiKhoanId": 21,
    "hoTen": "ISO Quality Control",
    "email": "iso@giamsat.vn"
  },
  "noiDung": "Don vi giam sat da tiep nhan va dang xem xet bang chung.",
  "loaiTin": "VanBan",
  "daDoc": false,
  "ngayTao": "2026-05-24T03:00:00.000Z"
}
```

#### `POST /chat`

Request:

```json
{
  "congViecId": 7,
  "thanhVien1Id": 1,
  "thanhVien2Id": 13
}
```

Response:

```json
{
  "message": "Tao cuoc hoi thoai thanh cong",
  "conversation": {
    "cuocHoiThoaiId": 5,
    "congViecId": 7,
    "thanhVien1": {
      "taiKhoanId": 1,
      "hoTen": "Nguyen Van An",
      "email": "manhhuy2@gmail.com"
    },
    "thanhVien2": {
      "taiKhoanId": 13,
      "hoTen": "User 13",
      "email": "dev1@freelancer.vn"
    },
    "giamSat": {
      "taiKhoanId": 21,
      "hoTen": "ISO Quality Control",
      "email": "iso@giamsat.vn"
    },
    "tinNhanCuoi": null,
    "trangThai": "DangMo",
    "ngayTao": "2026-05-26T04:20:00.000Z"
  }
}
```

Điều kiện: hai thành viên tồn tại và không trùng nhau. Nếu hội thoại tương ứng đã có, API trả hội thoại đang tồn tại.

#### Các Endpoint Chat REST

| Route                        | Request                                                                           | Response                                                                              |
| ---------------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `GET /chat/:id`              | Không body                                                                        | `{ "conversation": ConversationObject }`                                              |
| `PUT /chat/:id/close`        | Không body                                                                        | `{ "message": "Dong cuoc hoi thoai thanh cong", "conversation": ConversationObject }` |
| `GET /chat/:id/messages`     | Không body                                                                        | `{ "total": number, "messages": MessageObject[] }`                                    |
| `POST /chat/:id/messages`    | `{ "nguoiGuiId": 21, "noiDung": "Dang kiem tra ban giao.", "loaiTin": "VanBan" }` | `{ "message": "Gui tin nhan thanh cong", "data": MessageObject }`                     |
| `PUT /chat/:id/read/:userId` | Không body                                                                        | `{ "message": "Danh dau da doc thanh cong", "count": number }`                        |

Giám sát chỉ truy cập hội thoại công việc được phân công và có trạng thái giám sát `DangGiamSat` hoặc `HoanThanh`.

#### Socket.IO Namespace `/chat`

Kết nối:

```ts
const socket = io("http://localhost:8080/chat", {
  query: { userId: "21" },
});
```

Client emit:

```ts
socket.emit("joinConversation", { cuocHoiThoaiId: 4 });
socket.emit("sendMessage", {
  cuocHoiThoaiId: 4,
  nguoiGuiId: 21,
  noiDung: "Da tiep nhan bang chung.",
  loaiTin: "VanBan",
});
socket.emit("markAsRead", { cuocHoiThoaiId: 4, userId: 21 });
socket.emit("typing", { cuocHoiThoaiId: 4, userId: 21, isTyping: true });
socket.emit("leaveConversation", { cuocHoiThoaiId: 4 });
```

Server emit:

| Event                 | Payload chính                              |
| --------------------- | ------------------------------------------ |
| `newMessage`          | `MessageObject`                            |
| `messageNotification` | Thông báo tin nhắn cho tài khoản liên quan |
| `messagesRead`        | Thông tin hội thoại/người đọc              |
| `userTyping`          | `{ cuocHoiThoaiId, userId, isTyping }`     |
| `error`               | `{ message: string }`                      |

### Payments - Escrow Và Giải Ngân

#### Payment Object

```json
{
  "thanhToanId": 6,
  "congViecId": 3,
  "nguoiThueId": 1,
  "soTien": "9950000",
  "loaiTT": "DatCoc",
  "phuongThuc": "Vi",
  "trangThai": "ThanhCong",
  "ghiChu": "Escrow dang duoc giu trong khi cho xac nhan ban giao 100 phan tram.",
  "ngayTao": "2026-05-14T01:35:00.000Z"
}
```

#### `GET /payments/:id`

Response: `{ "payment": PaymentObject }`.

#### `GET /contracts/:id/payments`

Response:

```json
{
  "total": 1,
  "payments": [
    {
      "thanhToanId": 6,
      "congViecId": 3,
      "nguoiThueId": 1,
      "soTien": "9950000",
      "loaiTT": "DatCoc",
      "phuongThuc": "Vi",
      "trangThai": "ThanhCong",
      "ghiChu": "Escrow dang duoc giu trong khi cho xac nhan ban giao 100 phan tram.",
      "ngayTao": "2026-05-14T01:35:00.000Z"
    }
  ]
}
```

#### `POST /payments/deposit`

Request:

```json
{
  "contractId": 3,
  "amount": 9950000,
  "paymentMethod": "Vi",
  "note": "Nap escrow cho cong viec frontend."
}
```

Response:

```json
{
  "message": "Dat coc thanh cong",
  "payment": {
    "thanhToanId": 18,
    "congViecId": 3,
    "nguoiThueId": 1,
    "soTien": "9950000",
    "loaiTT": "DatCoc",
    "phuongThuc": "Vi",
    "trangThai": "ThanhCong",
    "ghiChu": "Nap escrow cho cong viec frontend.",
    "ngayTao": "2026-05-26T04:30:00.000Z"
  }
}
```

Nếu công việc đang `MoiTao`, deposit chuyển công việc sang `DangThucHien`.

#### `PUT /payments/:id/release`

Request: không có body; `:id` là giao dịch `DatCoc` thành công.

Response:

```json
{
  "message": "Giai ngan thanh cong",
  "payment": {
    "thanhToanId": 19,
    "congViecId": 3,
    "nguoiThueId": 1,
    "soTien": "9500000",
    "loaiTT": "ThanhToanCuoi",
    "phuongThuc": "Vi",
    "trangThai": "ThanhCong",
    "ghiChu": "Giai ngan cho freelancer: 13",
    "ngayTao": "2026-05-26T04:35:00.000Z"
  }
}
```

#### `PUT /payments/:id/refund`

Request: không có body.

Response:

```json
{
  "message": "Hoan tien thanh cong",
  "payment": {
    "thanhToanId": 19,
    "congViecId": 3,
    "nguoiThueId": 1,
    "loaiTT": "HoanTien",
    "soTien": "9950000",
    "phuongThuc": "Vi",
    "trangThai": "ThanhCong",
    "ghiChu": "Hoan tien cho giao dich: 18",
    "ngayTao": "2026-05-26T04:35:00.000Z"
  }
}
```

#### Lưu Ý Tích Hợp Thanh Toán

- Flow chuẩn của công việc có giám sát dùng `/contracts/accept-proposal` để tạo escrow, sau đó dùng `/contracts/:id/confirm-completion` ba lần để giải ngân.
- API `/payments/:id/release` là API giải ngân thủ công riêng; implementation hiện tại khác phép tính chia phí trong flow confirm-completion. Không gọi thêm endpoint này sau khi flow xác nhận đã giải ngân.
- `/disputes/:id/resolve` hiện chỉ ghi kết luận tranh chấp, chưa tự tạo giao dịch hoàn tiền.
- `/payments/:id/refund` hiện chuyển công việc sang `DaHuy`. Với tranh chấp kết quả của công việc đã `HoanThanh`, cần thống nhất thêm nghiệp vụ trước khi gọi, vì rule tranh chấp mới giữ công việc ở `HoanThanh`.

### Disputes - Khiếu Nại Kết Quả Và Phân Giải

#### Dispute Object

```json
{
  "tranhChapId": 3,
  "congViecId": 7,
  "nguoiGuiId": 1,
  "giamSatId": 21,
  "lyDo": "Dashboard xuat sai tong doanh thu",
  "moTa": "Nguoi thue khong hai long vi bao cao Excel va so lieu tong hop khong khop voi tieu chi nghiem thu.",
  "trangThai": "DangXuLy",
  "yeuCauHoanTien": "5000000",
  "ngayMo": "2026-05-23T01:00:00.000Z",
  "ngayDong": null
}
```

#### `POST /disputes`

Request:

```json
{
  "congViecId": 6,
  "nguoiGuiId": 1,
  "lyDo": "Bao cao kiem thu khong dung tieu chi",
  "moTa": "Mot so truong hop loi thanh toan chua duoc bao cao.",
  "yeuCauHoanTien": 4000000
}
```

Response:

```json
{
  "message": "Mo tranh chap thanh cong",
  "dispute": {
    "tranhChapId": 4,
    "congViecId": 6,
    "nguoiGuiId": 1,
    "giamSatId": 21,
    "lyDo": "Bao cao kiem thu khong dung tieu chi",
    "moTa": "Mot so truong hop loi thanh toan chua duoc bao cao.",
    "trangThai": "MoiMo",
    "yeuCauHoanTien": "4000000",
    "ngayMo": "2026-05-26T04:40:00.000Z",
    "ngayDong": null
  }
}
```

Không gửi `giamSatId`; backend kế thừa đơn vị giám sát của công việc.

Điều kiện:

- Chỉ người thuê được gán trong công việc được mở tranh chấp.
- Công việc phải đã `HoanThanh`.
- Công việc chưa có tranh chấp mở ở `MoiMo` hoặc `DangXuLy`.
- Công việc vẫn là `HoanThanh` sau khi khiếu nại.

#### `GET /disputes/:id`

Response: `{ "dispute": DisputeObject }`.

#### `GET /contracts/:id/disputes`

Response:

```json
{
  "total": 1,
  "disputes": [
    {
      "tranhChapId": 3,
      "congViecId": 7,
      "nguoiGuiId": 1,
      "giamSatId": 21,
      "lyDo": "Dashboard xuat sai tong doanh thu",
      "moTa": "Nguoi thue khong hai long...",
      "trangThai": "DangXuLy",
      "yeuCauHoanTien": "5000000",
      "ngayMo": "2026-05-23T01:00:00.000Z",
      "ngayDong": null
    }
  ]
}
```

#### `PUT /disputes/:id/review`

Request:

```json
{
  "giamSatId": 21
}
```

Response:

```json
{
  "message": "Bat dau xu ly tranh chap",
  "dispute": {
    "tranhChapId": 4,
    "congViecId": 6,
    "giamSatId": 21,
    "trangThai": "DangXuLy",
    "ngayDong": null
  }
}
```

Chỉ `giamSatId` đang phụ trách công việc và có trạng thái hoạt động được tiếp nhận tranh chấp `MoiMo`.

#### `PUT /disputes/:id/resolve`

Request:

```json
{
  "giamSatId": 21,
  "ketQua": "PhanChia",
  "lyDo": "Mot phan bao cao khong dung tieu chi nghiem thu.",
  "soTienHoan": 3000000,
  "benChiuPhi": "HeThong"
}
```

Response:

```json
{
  "message": "Ket luan tranh chap thanh cong",
  "dispute": {
    "tranhChapId": 4,
    "congViecId": 6,
    "nguoiGuiId": 1,
    "giamSatId": 21,
    "lyDo": "Bao cao kiem thu khong dung tieu chi",
    "moTa": "Mot so truong hop loi thanh toan chua duoc bao cao.",
    "trangThai": "DaKetLuan",
    "yeuCauHoanTien": "4000000",
    "ngayMo": "2026-05-26T04:40:00.000Z",
    "ngayDong": "2026-05-26T05:00:00.000Z"
  }
}
```

Điều kiện: tranh chấp phải `DangXuLy`; chỉ đơn vị giám sát của công việc kết luận. Backend tạo bản ghi `KetLuanTranhChap` và đóng xử lý, nhưng chưa tự hoàn tiền.

### Evidences - Bằng Chứng Tranh Chấp

#### Evidence Object

```json
{
  "bangChungId": 6,
  "tranhChapId": 3,
  "nguoiNopId": 1,
  "loaiBangChung": "File",
  "noiDung": "File Excel xuat tu dashboard cho thay so lieu tong doanh thu khong khop.",
  "duongDanFile": "uploads/evidence/revenue-export-mismatch.xlsx",
  "ngayNop": "2026-05-23T02:00:00.000Z"
}
```

#### `POST /disputes/:id/evidences`

Request:

```json
{
  "nguoiNopId": 1,
  "loaiBangChung": "File",
  "noiDung": "File doi chieu doanh thu tu he thong ke toan.",
  "duongDanFile": "uploads/evidence/revenue-check.xlsx"
}
```

Response:

```json
{
  "message": "Nop bang chung thanh cong",
  "evidence": {
    "bangChungId": 8,
    "tranhChapId": 3,
    "nguoiNopId": 1,
    "loaiBangChung": "File",
    "noiDung": "File doi chieu doanh thu tu he thong ke toan.",
    "duongDanFile": "uploads/evidence/revenue-check.xlsx",
    "ngayNop": "2026-05-26T05:05:00.000Z"
  }
}
```

#### `GET /disputes/:id/evidences`

Response: `{ "total": number, "evidences": EvidenceObject[] }`.

#### `DELETE /evidences/:id`

Request: không có body.

Response:

```json
{
  "message": "Xoa bang chung thanh cong",
  "evidence": null
}
```

Implementation hiện tại kiểm tra tranh chấp và tài khoản nộp tồn tại, nhưng chưa giới hạn người nộp phải là bên tham gia hoặc trạng thái tranh chấp phải còn mở.

### Reviews - Đánh Giá

#### Review Object

```json
{
  "danhGiaId": 1,
  "congViecId": 2,
  "nguoiDanhGiaId": 1,
  "nguoiDuocDGId": 13,
  "diemSo": 5,
  "binhLuan": "Ban giao dung cam ket va giao tiep ro rang.",
  "loaiDanhGia": "NguoiThue_DanhGia_Freelancer",
  "ngayTao": "2026-05-09T02:00:00.000Z"
}
```

#### `POST /reviews`

Request:

```json
{
  "congViecId": 6,
  "nguoiDanhGiaId": 1,
  "nguoiDuocDGId": 13,
  "diemSo": 2,
  "binhLuan": "Ket qua kiem thu chua dat yeu cau.",
  "loaiDanhGia": "NguoiThue_DanhGia_Freelancer"
}
```

Response:

```json
{
  "message": "Danh gia thanh cong",
  "review": {
    "danhGiaId": 7,
    "congViecId": 6,
    "nguoiDanhGiaId": 1,
    "nguoiDuocDGId": 13,
    "diemSo": 2,
    "binhLuan": "Ket qua kiem thu chua dat yeu cau.",
    "loaiDanhGia": "NguoiThue_DanhGia_Freelancer",
    "ngayTao": "2026-05-26T05:10:00.000Z"
  }
}
```

| Route                        | Request                                  | Response                                         |
| ---------------------------- | ---------------------------------------- | ------------------------------------------------ |
| `GET /reviews/:id`           | Không body                               | `{ "review": ReviewObject }`                     |
| `GET /users/:id/reviews`     | Không body; `:id` là người được đánh giá | `{ "total": number, "reviews": ReviewObject[] }` |
| `GET /contracts/:id/reviews` | Không body                               | `{ "total": number, "reviews": ReviewObject[] }` |

Điểm số phải từ `1` đến `5`; backend ngăn một cặp người/loại đánh giá bị gửi lặp trong cùng công việc. Hiện service chưa khóa việc đánh giá theo trạng thái hoàn thành hoặc xác minh người gửi là participant của công việc; frontend không nên dựa vào lỗ hổng này làm rule nghiệp vụ.

### Notifications - Thông Báo

#### Notification Object

```json
{
  "thongBaoId": 10,
  "taiKhoanId": 21,
  "tieuDe": "Tranh chap dashboard dang xu ly",
  "noiDung": "Tranh chap cong viec 7 dang cho don vi giam sat dua ra ket luan.",
  "loaiThongBao": "TranhChap",
  "daDoc": false,
  "ngayTao": "2026-05-23T01:01:00.000Z"
}
```

#### `GET /notifications?userId=21`

Response:

```json
{
  "total": 2,
  "notifications": [
    {
      "thongBaoId": 10,
      "taiKhoanId": 21,
      "tieuDe": "Tranh chap dashboard dang xu ly",
      "noiDung": "Tranh chap cong viec 7 dang cho don vi giam sat dua ra ket luan.",
      "loaiThongBao": "TranhChap",
      "daDoc": false,
      "ngayTao": "2026-05-23T01:01:00.000Z"
    }
  ]
}
```

#### `PUT /notifications/:id/read`

Request: không có body.

Response:

```json
{
  "message": "Da danh dau la da doc",
  "notification": {
    "thongBaoId": 10,
    "taiKhoanId": 21,
    "tieuDe": "Tranh chap dashboard dang xu ly",
    "noiDung": "Tranh chap cong viec 7 dang cho don vi giam sat dua ra ket luan.",
    "loaiThongBao": "TranhChap",
    "daDoc": true,
    "ngayTao": "2026-05-23T01:01:00.000Z"
  }
}
```

#### `DELETE /notifications/:id`

Response:

```json
{
  "message": "Xoa thong bao thanh cong"
}
```

### Reports - Báo Cáo Vi Phạm

#### Report Object

```json
{
  "baoCaoId": 2,
  "nguoiBaoCaoId": 13,
  "nguoiBiCaoId": 1,
  "lyDo": "Yeu cau thay doi pham vi",
  "moTa": "Admin dang thu thap noi dung trao doi.",
  "trangThai": "DangXuLy",
  "ketQua": null,
  "adminXuLyId": 6,
  "ngayTao": "2026-05-19T03:00:00.000Z",
  "ngayXuLy": null
}
```

#### `POST /reports`

Request:

```json
{
  "nguoiBaoCaoId": 1,
  "nguoiBiCaoId": 13,
  "lyDo": "Cham phan hoi",
  "moTa": "Freelancer khong phan hoi trong thoi han quy dinh."
}
```

Response:

```json
{
  "message": "Gui bao cao thanh cong",
  "report": {
    "baoCaoId": 5,
    "nguoiBaoCaoId": 1,
    "nguoiBiCaoId": 13,
    "lyDo": "Cham phan hoi",
    "moTa": "Freelancer khong phan hoi trong thoi han quy dinh.",
    "trangThai": "ChoXuLy",
    "ketQua": null,
    "adminXuLyId": null,
    "ngayTao": "2026-05-26T05:20:00.000Z",
    "ngayXuLy": null
  }
}
```

Người báo cáo và người bị báo cáo phải tồn tại và không được trùng nhau.

#### `GET /reports`

Response: `{ "total": number, "reports": ReportObject[] }`.

#### `PUT /reports/:id/resolve`

Request:

```json
{
  "adminId": 6,
  "trangThai": "DaXuLy",
  "ketQua": "Nhac nho tai khoan va ghi nhan ket qua xu ly."
}
```

Response: `{ "message": "Xu ly bao cao thanh cong", "report": ReportObject }`.

`adminId` phải là tài khoản có vai trò `Admin`; trạng thái xử lý nhận `DangXuLy`, `DaXuLy`, `HuyBo`.

### Admin

#### `GET /admin/users`

Response:

```json
{
  "total": 30,
  "users": [
    {
      "taiKhoanId": 1,
      "tenDangNhap": "thue_an",
      "email": "manhhuy2@gmail.com",
      "hoTen": "Nguyen Van An",
      "vaiTro": "NguoiThue",
      "trangThai": "HoatDong",
      "ngayTao": "2026-04-18T01:00:00.000Z"
    }
  ]
}
```

#### `PUT /admin/users/:id/ban`

Request: không có body.

Response:

```json
{
  "message": "Da khoa tai khoan thanh cong"
}
```

#### `GET /admin/supervisors`

Response:

```json
{
  "total": 9,
  "supervisors": [
    {
      "giamSatId": 2,
      "taiKhoanId": 21,
      "tenDonVi": "ISO Quality Control",
      "phiGiamSat": "450000",
      "trangThai": "HoatDong",
      "ngayDangKy": "2026-04-11T02:00:00.000Z",
      "hoTen": "User 21",
      "email": "iso@giamsat.vn"
    }
  ]
}
```

#### `PUT /admin/supervisors/:id/approve`

`:id` là `GiamSatID` hồ sơ đơn vị, không phải `TaiKhoanID`.

Request: không có body.

Response:

```json
{
  "message": "Phe duyet don vi giam sat thanh cong"
}
```

#### `GET /admin/statistics`

Response:

```json
{
  "statistics": {
    "totalUsers": 30,
    "totalContracts": 7,
    "activeContracts": 2,
    "pendingDisputes": 0,
    "pendingReports": 1
  }
}
```

`pendingDisputes` hiện đếm tranh chấp trạng thái `MoiMo`; tranh chấp `DangXuLy` không nằm trong chỉ số này.

## Enum Thường Dùng

| Enum                       | Giá trị                                                                                                                                                                              |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `GioiTinh`                 | `Nam`, `Nu`, `Khac`                                                                                                                                                                  |
| `VaiTroTaiKhoan`           | `NguoiThue`, `Freelancer`, `DonViGiamSat`, `Admin`, `KhachVangLai`                                                                                                                   |
| `TrangThaiTaiKhoan`        | `HoatDong`, `BiKhoa`, `ChoDuyet`, `DaBi`                                                                                                                                             |
| `TrangThaiDonViGiamSat`    | `HoatDong`, `TamNghi`, `BiKhoa`, `ChoDuyet`                                                                                                                                          |
| `TrangThaiYeuCau`          | `DangNhanHoSo`, `DaDong`, `DaChot`, `DaHuy`                                                                                                                                          |
| `TrangThaiBaoGia`          | `DaGui`, `DuocChon`, `TuChoi`, `HetHan`                                                                                                                                              |
| `TrangThaiCongViec`        | `MoiTao`, `DangThucHien`, `HoanThanh`, `DaHuy`                                                                                                                                       |
| `TrangThaiGiamSatCongViec` | `ChoDuyet`, `DangGiamSat`, `HoanThanh`, `TuChoi`                                                                                                                                     |
| `TrangThaiYeuCauGiamSat`   | `ChoDuyet`, `DaChapNhan`, `TuChoi`, `HoanThanh`                                                                                                                                      |
| `TrangThaiXacNhanTienDo`   | `ChuaXacNhan`, `DaXacNhan`, `TuChoi`                                                                                                                                                 |
| `TrangThaiTranhChap`       | `MoiMo`, `DangXuLy`, `DaKetLuan`, `DaDong`                                                                                                                                           |
| `LoaiBangChung`            | `TinNhan`, `File`, `HinhAnh`, `GhiChu`, `KhacP`                                                                                                                                      |
| `KetQuaTranhChap`          | `TiepTuc`, `HoanTienNguoiThue`, `HuyHopDong`, `PhanChia`                                                                                                                             |
| `BenChiuPhiKetLuan`        | `NguoiThue`, `Freelancer`, `ChiaSe`, `HeThong`                                                                                                                                       |
| `LoaiThanhToan`            | `DatCoc`, `ThanhToanCuoi`, `HoanTien`, `PhiGiamSat`, `PhiHeThong`                                                                                                                    |
| `PhuongThucThanhToan`      | `ChuyenKhoan`, `ThanhToanQuaMang`, `Vi`, `TienMat`                                                                                                                                   |
| `TrangThaiThanhToan`       | `ChoXuLy`, `ThanhCong`, `ThatBai`, `DaHoan`                                                                                                                                          |
| `TrangThaiCuocHoiThoai`    | `DangMo`, `DaDong`                                                                                                                                                                   |
| `LoaiTinNhan`              | `VanBan`, `File`, `HinhAnh`                                                                                                                                                          |
| `LoaiDanhGia`              | `NguoiThue_DanhGia_Freelancer`, `Freelancer_DanhGia_NguoiThue`, `NguoiThue_DanhGia_GiamSat`, `Freelancer_DanhGia_GiamSat`, `GiamSat_DanhGia_Freelancer`, `GiamSat_DanhGia_NguoiThue` |
| `LoaiThongBao`             | `HeThong`, `YeuCau`, `BaoGia`, `CongViec`, `TranhChap`, `GiamSat`, `ThanhToan`, `DanhGia`                                                                                            |
| `TrangThaiBaoCao`          | `ChoXuLy`, `DangXuLy`, `DaXuLy`, `HuyBo`                                                                                                                                             |

## Error Response

Các lỗi nghiệp vụ thông thường trả về:

```json
{
  "statusCode": 400,
  "message": "Mo ta loi",
  "error": "Bad Request"
}
```

| HTTP status | Khi sử dụng                                    |
| ----------- | ---------------------------------------------- |
| `400`       | Payload hoặc trạng thái nghiệp vụ không hợp lệ |
| `404`       | Không tìm thấy dữ liệu                         |
| `500`       | Lỗi máy chủ                                    |

## Dữ Liệu Seed Để Test Flow

Trong `db/exampleData.sql`:

| Công việc | Tình huống test                                                    |
| --------- | ------------------------------------------------------------------ |
| `#3`      | Tiến độ `100%`, `ChuaXacNhan`, đơn vị giám sát kiểm tra chất lượng |
| `#6`      | Đã hoàn thành `100%`, người thuê có thể mở tranh chấp kết quả      |
| `#7`      | Đang có tranh chấp `DangXuLy`, đơn vị giám sát kết luận tranh chấp |
