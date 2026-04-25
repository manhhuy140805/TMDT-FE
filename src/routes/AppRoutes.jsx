import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "../components/layout/Layout";
import HomePage from "../pages/Home/HomePage";
import LoginPage from "../pages/Auth/LoginPage";
import SignupPage from "../pages/Auth/SignupPage";
import RequestsPage from "../pages/Requests/RequestsPage";

// Import các pages khác khi đã tạo
// import RequestDetailPage from "../pages/RequestDetail/RequestDetailPage";
// import PostRequestPage from "../pages/PostRequest/PostRequestPage";
// import ProfilePage from "../pages/Profile/ProfilePage";
// import ProgressPage from "../pages/Progress/ProgressPage";
// import AdminPage from "../pages/Admin/AdminPage";

// 404 Page
const NotFound = () => {
  return (
    <div style={{ 
      textAlign: 'center', 
      padding: '100px 20px',
      minHeight: '60vh'
    }}>
      <h1 style={{ fontSize: '72px', margin: '0', color: '#0EA5E9' }}>404</h1>
      <h2 style={{ fontSize: '32px', margin: '20px 0' }}>Trang không tồn tại</h2>
      <p style={{ fontSize: '18px', color: '#64748B', marginBottom: '30px' }}>
        Xin lỗi, trang bạn đang tìm kiếm không tồn tại.
      </p>
      <a 
        href="/" 
        style={{
          display: 'inline-block',
          padding: '12px 30px',
          background: '#0EA5E9',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '8px',
          fontWeight: '600'
        }}
      >
        Về trang chủ
      </a>
    </div>
  );
};

function AppRoutes() {
  return (
    <Router>
      <Routes>
        {/* Auth routes - KHÔNG có Layout (không có header/footer) */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        
        {/* Main routes - CÓ Layout (có header/footer) */}
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          
          {/* Job routes */}
          <Route path="requests" element={<RequestsPage />} />
          {/* <Route path="requests/:id" element={<RequestDetailPage />} /> */}
          {/* <Route path="post-request" element={<PostRequestPage />} /> */}
          
          {/* User routes - uncomment khi đã tạo */}
          {/* <Route path="profile" element={<ProfilePage />} /> */}
          {/* <Route path="progress" element={<ProgressPage />} /> */}
          
          {/* Admin routes - uncomment khi đã tạo */}
          {/* <Route path="admin" element={<AdminPage />} /> */}
          
          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default AppRoutes;
