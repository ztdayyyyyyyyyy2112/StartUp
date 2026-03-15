import React from 'react';
import Navbar from './Navbar';
import { Link } from 'react-router-dom';
import s from './Policy.module.css';

export default function PolicyReturn() {
  return (
    <div className="page-enter">
      <Navbar />
      <main className={s.page}>
        <h1>Chính sách Đổi trả</h1>
        
        <h2>1. Thời gian đổi trả</h2>
        <p>Chúng tôi hỗ trợ đổi trả sản phẩm trong vòng 7 ngày kể từ ngày nhận hàng đối với các sản phẩm vật lý (Vòng tay NutriAI).</p>

        <h2>2. Điều kiện đổi trả</h2>
        <p>Sản phẩm được chấp nhận đổi trả khi:</p>
        <ul>
          <li>Sản phẩm còn nguyên vẹn, đầy đủ phụ kiện, chưa qua sử dụng.</li>
          <li>Sản phẩm bị lỗi do nhà sản xuất.</li>
          <li>Sản phẩm giao không đúng với đơn đặt hàng.</li>
        </ul>

        <h2>3. Chi phí đổi trả</h2>
        <p>NutriAI sẽ chịu toàn bộ chi phí vận chuyển nếu lỗi thuộc về nhà sản xuất hoặc do giao sai sản phẩm. Trong các trường hợp khác, quý khách vui lòng thanh toán phí vận chuyển hai chiều.</p>

        <div style={{ marginTop: '3rem', textAlign: 'center' }}>
          <Link to="/shopping" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: '600', fontSize: '1rem' }}>
            &larr; Quay lại trang mua sắm
          </Link>
        </div>
      </main>
    </div>
  );
}