# QUY TẮC CHUNG DỰ ÁN BOOKNEST FE

Tài liệu này là chuẩn chung cho toàn bộ team FE khi làm việc trong dự án BookNest.

## 1. Mục tiêu

- Đồng bộ cách đặt tên, tổ chức thư mục và bố trí code.
- Giảm conflict khi nhiều người cùng làm.
- Tăng tốc review, debug và bảo trì.

## 2. Cấu trúc thư mục chuẩn

```text
src/
  components/
    common/        # Component tái sử dụng (Button, Modal, Card...)
    layout/        # Thành phần layout dùng toàn app (Header, Footer...)
  pages/           # Mỗi feature/route chính
    Auth/
    Home/
    Books/
    Contact/
    Favorites/
  routes/          # Khai báo router tập trung
  services/        # Tầng gọi API theo domain
  config/          # Cấu hình app (axios, theme...)
  context/         # State chia sẻ toàn app
  hooks/           # Custom hooks
  constants/       # Hằng số dùng chung
  utils/           # Hàm thuần hỗ trợ
  assets/          # Ảnh, icon, tài nguyên tĩnh
```

Nguyên tắc áp dụng:

- Không tạo thư mục mới nếu có thể đặt đúng vào domain hiện có.
- Component chỉ dùng riêng cho 1 trang thì đặt trong `pages/<Feature>/components`.
- Component dùng lại nhiều nơi thì đặt trong `components/common` hoặc `components/layout`.

## 3. Quy tắc đặt tên

### 3.1 Biến, hàm, hằng số

- Biến/hàm: `camelCase`.
  - Ví dụ: `bookList`, `fetchBooks`, `handleSubmit`.
- Component React: `PascalCase`.
  - Ví dụ: `BookListItem`, `ForgotPasswordForm`.
- Hook custom: bắt đầu bằng `use` + `PascalCase`.
  - Ví dụ: `useAuth`.
- Context: `PascalCase` + hậu tố `Context`.
  - Ví dụ: `AuthContext`.
- Provider: `PascalCase` + hậu tố `Provider`.
  - Ví dụ: `AuthProvider`.
- Hằng số toàn cục: `UPPER_SNAKE_CASE`.
  - Ví dụ: `DEFAULT_PAGE_SIZE`, `API_TIMEOUT`.
- Biến boolean: bắt đầu bằng `is`, `has`, `can`, `should`.
  - Ví dụ: `isAuthenticated`, `hasError`.

### 3.2 Tên file

- File component: `PascalCase.jsx`.
  - Ví dụ: `BookCard.jsx`, `AppRouter.jsx`.
- File hook: `useXxx.js`.
  - Ví dụ: `useAuth.js`.
- File service/config/utils/constants: `camelCase.js` hoặc tên domain ngắn gọn.
  - Ví dụ: `auth.js`, `book.js`, `tokenUtils.js`, `api.js`.
- File CSS module: cùng tên component + `.module.css`.
  - Ví dụ: `BookCard.module.css` đi cùng `BookCard.jsx`.
- File CSS thường (không module): dùng cho page-level hoặc layout-level.
  - Ví dụ: `BookList.css`, `Footer.css`.

### 3.3 Tên thư mục

- Thư mục feature/page: `PascalCase`.
  - Ví dụ: `Auth`, `Books`, `Favorites`.
- Thư mục nhóm kỹ thuật chung: chữ thường.
  - Ví dụ: `components`, `services`, `hooks`, `utils`.

## 4. Quy tắc bố trí code trong file

Thứ tự khuyến nghị trong 1 file React:

1. Import thư viện ngoài.
2. Import module nội bộ (config, service, hook, component).
3. Import style.
4. Khai báo constants/helpers cục bộ.
5. Component chính.
6. Export.

Nguyên tắc:

- Mỗi file nên có 1 component chính.
- Tránh để file quá dài; nếu > 250-300 dòng nên xem xét tách nhỏ.
- Handler đặt tên theo hành động: `handleLogin`, `handleChangePassword`.
- Không viết logic business nặng trực tiếp trong JSX; tách ra helper/hook.

## 5. Quy tắc tổ chức theo tầng

### 5.1 UI Layer (components/pages)

- `pages`: quản lý màn hình theo route.
- `components`: khối UI tái sử dụng.
- Không gọi API trực tiếp trong component nếu đã có service tương ứng.

### 5.2 Data Layer (services)

- Mọi request backend đi qua `apiClient` trong `src/config/api.js`.
- Mỗi domain có file service riêng.
  - Ví dụ: `auth.js`, `book.js`, `favorites.js`.
- Tên hàm service theo động từ rõ nghĩa: `getBooks`, `login`, `resetPassword`.

### 5.3 Shared Layer (config/constants/utils/context)

- `config`: giữ cấu hình dùng chung (axios, theme).
- `constants`: hằng số không phụ thuộc UI.
- `utils`: hàm thuần, không side effect UI.
- `context`: state chia sẻ và logic phiên đăng nhập/toàn app.

## 6. Quy tắc style và giao diện

- Ưu tiên CSS Module cho component tái sử dụng.
- CSS thường chỉ dùng cho page/layout cần style phạm vi rộng.
- Hạn chế inline style kéo dài; chỉ dùng khi style động hoặc demo nhanh.
- Mọi trạng thái quan trọng phải rõ ràng: loading, error, empty, disabled.
- Đảm bảo responsive tối thiểu: mobile (375), tablet (768), desktop (>=1024).

## 7. Quy tắc Router

- Toàn bộ route tập trung tại `src/routes/AppRouter.jsx`.
- Path dùng `kebab-case`, ngắn gọn, dễ đoán.
  - Ví dụ: `/forgot-password`, `/books/:id`.
- Không hard-code điều hướng phức tạp ở nhiều nơi; ưu tiên thống nhất ở router và constants khi cần.

## 8. Quy tắc chất lượng code

- Trước khi commit bắt buộc chạy:
  - `npm run lint`
  - `npm run build` (khi thay đổi lớn)
- Không để import thừa, biến thừa, code chết.
- Comment ngắn gọn, chỉ để giải thích logic không hiển nhiên.
- Không đổi hành vi ngoài scope task.

## 9. Quy tắc Git và PR

- Không commit trực tiếp vào `main`.
- Mỗi task/feature làm trên 1 branch riêng.
- PR cần có:
  - Mục tiêu thay đổi.
  - Danh sách file chính bị ảnh hưởng.
  - Cách test và kết quả test.
  - Ảnh/video nếu thay đổi UI.
- Rebase với `main` trước khi mở PR để giảm conflict.

## 10. Checklist trước merge

- Đúng naming convention theo tài liệu này.
- File mới đặt đúng thư mục theo domain.
- Không gọi API sai tầng (UI gọi service, service gọi apiClient).
- Đã xử lý loading/error/empty state cho luồng chính.
- Lint pass, app build được.

---

## 11. Quy ước cập nhật tài liệu

- Khi team thống nhất quy ước mới, cập nhật ngay tại file này.
- Mọi thay đổi rule cần thông báo trong PR hoặc cuộc họp sync gần nhất.
