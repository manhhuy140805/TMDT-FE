# FRAS-TMDT-FE - Freelance Marketplace Frontend

Dự án React chuyển đổi từ HTML/CSS thuần sang React với React Router.

## 🚀 Công nghệ sử dụng

- **React 19** - UI Library
- **React Router DOM 7** - Routing
- **Vite 8** - Build tool
- **CSS thuần** - Styling (không dùng Tailwind)

## 📁 Cấu trúc dự án

```
src/
├── components/
│   └── layout/
│       ├── Header.jsx
│       ├── Footer.jsx
│       └── Layout.jsx
├── pages/
│   ├── Home/
│   │   └── HomePage.jsx
│   └── Auth/
│       ├── LoginPage.jsx
│       └── SignupPage.jsx
├── styles/
│   ├── landing.css
│   ├── signup.css
│   ├── style.css
│   ├── admin.css
│   ├── detail.css
│   ├── post.css
│   ├── profile.css
│   ├── progress.css
│   └── requests.css
├── App.jsx
├── main.jsx
└── index.css
```

## 🎨 Styling

Dự án sử dụng **CSS thuần** được copy từ thư mục UI gốc để đảm bảo giao diện giống 100%.

Các file CSS được import trong `src/index.css`:
- `landing.css` - Trang chủ
- `signup.css` - Đăng ký/Đăng nhập
- `style.css` - Styles chung

## 🛠️ Cài đặt và chạy

### Cài đặt dependencies
```bash
npm install
```

### Chạy development server
```bash
npm run dev
```

### Build production
```bash
npm run build
```

### Preview production build
```bash
npm run preview
```

## 📄 Các trang đã hoàn thành

- ✅ **Home Page** (`/`) - Trang landing với hero, categories, process, testimonials
- ✅ **Login Page** (`/login`) - Trang đăng nhập
- ✅ **Signup Page** (`/signup`) - Trang đăng ký

## 🔜 Các trang cần phát triển

- ⏳ **Requests Page** (`/requests`) - Danh sách công việc
- ⏳ **Request Detail** (`/requests/:id`) - Chi tiết công việc
- ⏳ **Post Request** (`/post-request`) - Đăng công việc mới
- ⏳ **Profile** (`/profile`) - Hồ sơ người dùng
- ⏳ **Progress** (`/progress`) - Tiến độ công việc
- ⏳ **Admin Dashboard** (`/admin`) - Quản trị

## 📝 Ghi chú

- Tất cả images được lưu trong `public/images/`
- Font Awesome được load từ CDN trong `index.html`
- CSS variables được định nghĩa trong các file CSS gốc
- React Router được cấu hình trong `App.jsx`

## 🎯 Mục tiêu

Chuyển đổi hoàn toàn từ HTML/CSS thuần sang React application với:
- Component-based architecture
- Client-side routing
- Reusable components
- Giữ nguyên 100% giao diện gốc
