import React from 'react';
import Navbar from './Navbar';
import { Link } from 'react-router-dom';
import s from './Policy.module.css';

export default function PolicyPurchase() {
  return (
    <div className="page-enter">
      <Navbar />
      <main className={s.page}>
        <h1>Chính sách Mua hàng</h1>
        
        <h2>1. Đặt hàng và Xác nhận đơn hàng</h2>
        <p>Quý khách có thể đặt hàng trực tiếp trên website NutriAI. Sau khi đặt hàng thành công, chúng tôi sẽ gửi email xác nhận đơn hàng bao gồm thông tin chi tiết và mã đơn hàng.</p>

        <h2>2. Phương thức thanh toán</h2>
        <p>Chúng tôi chấp nhận các hình thức thanh toán sau:</p>
        <ul>
          <li>Thanh toán khi nhận hàng (COD).</li>
          <li>Chuyển khoản ngân hàng.</li>
          <li>Thanh toán qua ví điện tử (Momo, ZaloPay).</li>
        </ul>

        <h2>3. Vận chuyển và Giao hàng</h2>
        <p>Thời gian giao hàng dự kiến từ 2-5 ngày làm việc tùy thuộc vào địa chỉ của quý khách. Phí vận chuyển sẽ được thông báo cụ thể trong quá trình đặt hàng.</p>

        <div style={{ marginTop: '3rem', textAlign: 'center' }}>
          <Link to="/shopping" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: '600', fontSize: '1rem' }}>
            &larr; Quay lại trang mua sắm
          </Link>
        </div>
      </main>
    </div>
  );
}