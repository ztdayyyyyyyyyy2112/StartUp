import React from 'react';
import Navbar from './Navbar';
import { Link } from 'react-router-dom';
import s from './Policy.module.css';

export default function PolicyWarranty() {
  return (
    <div className="page-enter">
      <Navbar />
      <main className={s.page}>
        <h1>Chính sách Bảo hành</h1>
        
        <h2>1. Thời gian bảo hành</h2>
        <p>Vòng tay NutriAI được bảo hành 12 tháng cho các lỗi từ nhà sản xuất. Các gói dịch vụ phần mềm không áp dụng chính sách bảo hành.</p>

        <h2>2. Điều kiện bảo hành</h2>
        <p>Sản phẩm được bảo hành miễn phí nếu:</p>
        <ul>
          <li>Còn trong thời hạn bảo hành.</li>
          <li>Lỗi được xác định là do nhà sản xuất.</li>
          <li>Sản phẩm không bị hư hỏng do người dùng (rơi, vỡ, vào nước...).</li>
        </ul>

        <h2>3. Quy trình bảo hành</h2>
        <p>Quý khách vui lòng liên hệ bộ phận Chăm sóc khách hàng qua email support@nutriai.com để được hướng dẫn chi tiết về quy trình gửi sản phẩm về trung tâm bảo hành.</p>

        <div style={{ marginTop: '3rem', textAlign: 'center' }}>
          <Link to="/shopping" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: '600', fontSize: '1rem' }}>
            &larr; Quay lại trang mua sắm
          </Link>
        </div>
      </main>
    </div>
  );
}