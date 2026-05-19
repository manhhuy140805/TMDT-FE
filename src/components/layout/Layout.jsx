import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import ScrollToTop from '../common/ScrollToTop';

const Layout = () => {
  const location = useLocation();

  // Workspace dùng layout dạng "app shell": header + sidebar ghim, chỉ content cuộn
  const isWorkspace = location.pathname.startsWith('/workspace');

  return (
    <div className={isWorkspace ? 'app-shell' : 'app-default'}>
      <ScrollToTop />
      <Header />
      <main className={isWorkspace ? 'app-shell-main' : 'app-default-main'}>
        <Outlet />
      </main>
      {!isWorkspace && <Footer />}
    </div>
  );
};

export default Layout;
