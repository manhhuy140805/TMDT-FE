# Hướng dẫn Test Đăng Nhập

## Thông tin đăng nhập mẫu

### 1. Admin
- **Email**: `admin@freelance.vn`
- **Password**: Bất kỳ (mock không check password)
- **Role**: ADMIN

### 2. Người thuê (Khách hàng)
- **Email**: `nguyenvana@gmail.com`
- **Password**: Bất kỳ
- **Tên**: Nguyễn Văn A
- **Role**: NGUOI_THUE

### 3. Người thuê khác
- **Email**: `tranthib@gmail.com`
- **Password**: Bất kỳ
- **Tên**: Trần Thị B
- **Role**: NGUOI_THUE

### 4. Thêm các tài khoản khác
- `levanc@company.vn`
- `phamthid@startup.vn`
- `hoangvane@tech.vn`
- `vuthif@business.vn`
- `dangvang@ecommerce.vn`
- `buithih@marketing.vn`
- `dovani@agency.vn`

## Cách test

1. Truy cập trang đăng nhập: `/login`
2. Nhập một trong các email trên
3. Nhập bất kỳ password nào (mock không kiểm tra password)
4. Click "Đăng nhập"

## Sau khi đăng nhập thành công

- Thông tin user được lưu vào `localStorage.user`
- Nếu chọn "Nhớ đăng nhập", flag `localStorage.rememberMe` = 'true'
- Tự động chuyển về trang chủ

## Kiểm tra localStorage

Mở DevTools Console và chạy:
```javascript
// Xem thông tin user
console.log(JSON.parse(localStorage.getItem('user')));

// Xem remember me
console.log(localStorage.getItem('rememberMe'));
```

## Đăng xuất

Để xóa thông tin đăng nhập:
```javascript
localStorage.removeItem('user');
localStorage.removeItem('rememberMe');
```

