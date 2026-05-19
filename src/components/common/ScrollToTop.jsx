import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Tự động scroll về đầu trang mỗi khi đổi route.
 * Đặt trong <Router> ngay sau <Routes> hoặc trong Layout.
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
};

export default ScrollToTop;
