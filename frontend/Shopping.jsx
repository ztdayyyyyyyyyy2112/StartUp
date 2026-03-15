import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';
import s from './Shopping.module.css';
import ChatbotWidget from './ChatbotWidget';

export default function Shopping() {
  return (
    <div className={s.page}>
      <Navbar />
      
      <header className={s.shopHeader}>
        <div className={s.container}>
          <h1 className={s.shopTitle}>STORE</h1>
          <nav className={s.shopNav}>
            <Link to="/shopping" className={s.navLink}>TRANG CHỦ</Link>
            <span>HÀNG MỚI</span>
            <span>SỨC KHỎE</span>
            <span className={s.active}>THIẾT BỊ ĐEO</span>
            <span>ƯU ĐÃI</span>
          </nav>
          <div className={s.searchWrap}>
            <input type="text" placeholder="Tìm kiếm sản phẩm..." className={s.searchInput} />
          </div>
        </div>
      </header>

      <main className={s.main}>
        <div className={s.container}>
          <div className={s.breadcrumb}>Trang chủ / Thiết bị đeo / Vòng tay bác sĩ</div>
          
          <div className={s.productDetail}>
            <div className={s.imageSection}>
              <img 
                src="https://images.unsplash.com/photo-1510017803434-a899398421b3?auto=format&fit=crop&q=80&w=800" 
                alt="Vòng tay bác sĩ NutriAI" 
              />
              <div className={s.comingSoonBadge}>SẮP RA MẮT</div>
            </div>

            <div className={s.infoSection}>
              <p className={s.brand}>NutriAI Wearable Series</p>
              <h2 className={s.productName}>Vòng tay bác sĩ (Doctor's Bracelet)</h2>
              <p className={s.price}>250.000đ</p>
              <div className={s.description}>
                Sản phẩm thiết bị đeo thông minh tích hợp AI, giúp theo dõi nhịp tim, giấc ngủ và cảnh báo thói quen xấu theo thời gian thực. Thiết kế tối giản, chất liệu thân thiện với da tay.
              </div>
              <button className={s.ctaBtn} disabled>ĐĂNG KÝ NHẬN TIN KHI CÓ HÀNG</button>
            </div>
          </div>
        </div>
      </main>

      <footer className={s.shopFooter}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '1.5rem', fontSize: '0.9rem', flexWrap: 'wrap' }}>
          <Link to="/policy/purchase" style={{ color: 'inherit', textDecoration: 'none' }}>Chính sách mua hàng</Link>
          <Link to="/policy/warranty" style={{ color: 'inherit', textDecoration: 'none' }}>Chính sách bảo hành</Link>
          <Link to="/policy/return" style={{ color: 'inherit', textDecoration: 'none' }}>Chính sách đổi trả</Link>
        </div>
        <p>© NutriAI Concept Store. All rights reserved.</p>
      </footer>

      <ChatbotWidget purpose="Hỗ trợ mua sắm" />
    </div>
  );
}