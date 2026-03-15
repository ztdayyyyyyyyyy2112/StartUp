import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './useAuth';
import Landing from './Landing';
import Intro from './Intro';
import Login from './Login';
import Dashboard from './Dashboard';
import Shopping from './Shopping';
import PolicyPurchase from './PolicyPurchase';
import PolicyWarranty from './PolicyWarranty';
import PolicyReturn from './PolicyReturn';
import PolicyHealthSafety from './PolicyHealthSafety';
import './index.css'; // Đảm bảo bạn có file css chung cho biến :root

// Component để tự động cuộn lên đầu trang khi chuyển route
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/intro" element={<Intro />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/shopping" element={<Shopping />} />
          <Route path="/policy/purchase" element={<PolicyPurchase />} />
          <Route path="/policy/warranty" element={<PolicyWarranty />} />
          <Route path="/policy/return" element={<PolicyReturn />} />
          <Route path="/policy/health-safety" element={<PolicyHealthSafety />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;