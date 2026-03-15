import React, { useState } from 'react';
import Navbar from './Navbar';
import { Link } from 'react-router-dom';
import { IconShield, IconCheck } from './Icons';
import s from './Policy.module.css';

const HOSPITALS = [
  'Bệnh viện Chợ Rẫy (TP.HCM)',
  'Bệnh viện Bạch Mai (Hà Nội)',
  'Bệnh viện Việt Đức (Hà Nội)',
  'Bệnh viện Trung ương Huế',
  'Bệnh viện Đại học Y Dược TP.HCM',
  'Bệnh viện K (Hà Nội)',
  'Bệnh viện Quân y 108',
  'Bệnh viện Nhi Đồng 1',
];

function PartnerCard({ data, onClick }) {
  const [hover, setHover] = useState(false);
  const isLink = data.url && data.url !== '#';
  
  // Render as <a> if it's a link, otherwise <div>
  const Wrapper = isLink ? 'a' : 'div';
  const props = isLink 
    ? { href: data.url, target: '_blank', rel: 'noopener noreferrer' }
    : { onClick };

  return (
    <Wrapper 
      {...props}
      style={{ textDecoration: 'none', cursor: 'pointer', display: 'block' }}
    >
      <div 
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{ 
          height: '180px',
          borderRadius: '16px', 
          boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
          border: '1px solid rgba(0,0,0,0.05)',
          position: 'relative',
          overflow: 'hidden',
          color: 'white'
        }}
      >
        {/* Background Image */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage: `url(${data.img})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transition: 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          transform: hover ? 'scale(1.1)' : 'scale(1)',
          zIndex: 1
        }} />

        {/* Overlay */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.85), rgba(0,0,0,0.1) 70%)',
          zIndex: 2
        }} />

        {/* Logo Badge */}
        <div style={{
          position: 'absolute', top: '16px', left: '16px',
          background: 'rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.25)',
          width: '48px',
          height: '48px',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 4,
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
        }}>
          {data.logo && data.logo.startsWith('http') ? (
            <img src={data.logo} alt="logo" style={{ height: '28px', objectFit: 'contain', borderRadius: '4px' }} />
          ) : (
            <span style={{ fontSize: '1.8rem', lineHeight: 1 }}>{data.logo || '🏥'}</span>
          )}
        </div>

        {/* Content */}
        <div style={{
          position: 'relative', zIndex: 3,
          padding: '20px', height: '100%', boxSizing: 'border-box',
          display: 'flex', flexDirection: 'column',
          justifyContent: 'flex-end', textAlign: 'center'
        }}>
          <div style={{ fontWeight: '800', fontSize: '1.1rem', color: 'white', marginBottom: '4px', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>{data.name}</div>
          <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.9)', textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>{data.desc}</div>
        </div>
      </div>
    </Wrapper>
  );
}

export default function PolicyHealthSafety() {
  const [showModal, setShowModal] = useState(false);

  const partners = [
    { name: 'Bảo Việt Health', desc: 'Bảo trợ rủi ro chấn thương', img: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=600', logo: 'https://logo.clearbit.com/baoviet.com.vn', url: 'https://www.baoviet.com.vn/' },
    { name: 'Manulife Vietnam', desc: 'Đối tác Sống Khỏe', img: 'https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?auto=format&fit=crop&q=80&w=600', logo: 'https://logo.clearbit.com/manulife.com.vn', url: 'https://www.manulife.com.vn/' },
    { name: 'Vinmec Healthcare', desc: 'Cố vấn chuyên môn y khoa', img: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=600', logo: 'https://logo.clearbit.com/vinmec.com', url: 'https://www.vinmec.com/' },
    { name: 'AIA Vitality', desc: 'Tài trợ đổi điểm thưởng', img: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&q=80&w=600', logo: 'https://logo.clearbit.com/aia.com.vn', url: 'https://www.aia.com.vn/vi/song-khoe/aia-vitality.html' },
    { name: '100+ Bệnh viện', desc: 'Đối tác trên cả nước', img: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&q=80&w=600', url: '#' }
  ];

  return (
    <div className="page-enter">
      <Navbar />
      <main className={s.page} style={{ maxWidth: '900px' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛡️</div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Chính sách An toàn Sức khỏe</h1>
          <p style={{ fontSize: '1.2rem', color: 'var(--t2)' }}>Cam kết bảo vệ người dùng và sự bảo trợ từ các quỹ y tế hàng đầu.</p>
        </div>

        <section style={{ marginBottom: '3rem', background: '#f0fdf4', padding: '2rem', borderRadius: '16px', border: '1px solid #bbf7d0' }}>
          <h2 style={{ color: '#166534', display: 'flex', alignItems: 'center', gap: '10px' }}><IconCheck /> Cam kết an toàn tuyệt đối</h2>
          <p>NutriAI cam kết mọi thực đơn và bài tập được gợi ý đều dựa trên dữ liệu khoa học được kiểm chứng. Khi người dùng tuân thủ đúng lộ trình được AI cá nhân hóa:</p>
          <ul style={{ marginTop: '1rem', listStyle: 'none', paddingLeft: 0 }}>
            {[
              'Đảm bảo không gây thiếu hụt dinh dưỡng (vi chất & đa lượng).',
              'Loại bỏ 100% thực phẩm gây dị ứng đã được khai báo trong hồ sơ.',
              'Cảnh báo ngay lập tức các tương tác thuốc - thực phẩm nguy hiểm.',
              'Theo dõi nhịp tim và dấu hiệu sinh tồn liên tục qua thiết bị đeo.'
            ].map((item, i) => (
              <li key={i} style={{ marginBottom: '10px', display: 'flex', gap: '10px' }}>
                <span style={{ color: '#16a34a' }}>✓</span> {item}
              </li>
            ))}
          </ul>
        </section>

        <section style={{ marginBottom: '3rem' }}>
          <h2>🤝 Bảo trợ bởi Quỹ Bảo hiểm & Y tế</h2>
          <p style={{ marginBottom: '1.5rem' }}>NutriAI tự hào là đối tác chiến lược của các đơn vị bảo hiểm và y tế uy tín. Người dùng NutriAI được hưởng quyền lợi đặc biệt khi xảy ra rủi ro sức khỏe trong quá trình luyện tập theo app.</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            {partners.map((p, i) => (
              <PartnerCard 
                key={i}
                data={p} 
                onClick={() => {
                  if (p.url === '#') setShowModal(true);
                }}
              />
            ))}
          </div>
        </section>

        <div style={{ marginTop: '4rem', textAlign: 'center', borderTop: '1px solid var(--border2)', paddingTop: '2rem' }}>
          <p style={{ fontStyle: 'italic', color: 'var(--t2)', fontSize: '0.9rem', marginBottom: '1rem' }}>* Lưu ý: Mọi quyền lợi bảo hiểm tuân theo điều khoản chi tiết của từng đối tác được tích hợp trong ứng dụng.</p>
          <Link to="/" style={{ color: 'var(--g500)', textDecoration: 'none', fontWeight: '600', fontSize: '1rem' }}>
            &larr; Quay lại trang chủ
          </Link>
        </div>
      </main>

      {/* Modal Popup */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }} onClick={() => setShowModal(false)}>
          <div style={{
            background: 'white', padding: '30px', borderRadius: '24px',
            maxWidth: '500px', width: '100%', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            animation: 'fadeIn 0.2s ease'
          }} onClick={e => e.stopPropagation()}>
            <h3 style={{fontSize: '1.5rem', marginTop: 0, marginBottom: '1rem', color: 'var(--t1)'}}>🏥 Danh sách đối tác y tế</h3>
            <p style={{marginBottom: '1.5rem', color: 'var(--t2)', lineHeight: 1.5}}>NutriAI liên kết với hệ thống dữ liệu của các bệnh viện lớn để đảm bảo hồ sơ sức khoẻ của bạn luôn chính xác.</p>
            <ul style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', paddingLeft: '20px', margin: 0, color: 'var(--t1)'}}>
              {HOSPITALS.map((h, i) => <li key={i}>{h}</li>)}
            </ul>
            <button onClick={() => setShowModal(false)} className="btn btn-primary" style={{marginTop: '25px', width: '100%'}}>Đóng</button>
          </div>
        </div>
      )}
    </div>
  );
}