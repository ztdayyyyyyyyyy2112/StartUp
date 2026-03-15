import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { IconPhone, IconSmartWatch } from './Icons';

// Component nút download có dropdown QR
function DownloadBtn({ icon, label, platforms }) {
  const [hover, setHover] = useState(false);

  const btnStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    borderRadius: '20px',
    background: hover ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#cbd5e1',
    textDecoration: 'none',
    fontSize: '0.85rem',
    fontWeight: 500,
    transition: 'all 0.2s ease',
    cursor: 'pointer',
    position: 'relative',
  };

  return (
    <div 
      style={{ position: 'relative' }} 
      onMouseEnter={() => setHover(true)} 
      onMouseLeave={() => setHover(false)}
    >
      <a href="#" style={btnStyle} onClick={e => e.preventDefault()}>
        {icon} {label}
      </a>
      
      {/* Dropdown QR */}
      <div style={{
        position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)',
        marginTop: '12px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '16px', padding: '20px', display: hover ? 'flex' : 'none', gap: '20px',
        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)', zIndex: 50
      }}>
        {platforms.map((p, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <div style={{ background: 'white', padding: '8px', borderRadius: '12px' }}>
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${p.url}`} alt={p.name} style={{ width: '100px', height: '100px', display: 'block' }} />
            </div>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{p.name}</span>
          </div>
        ))}
        {/* Arrow */}
        <div style={{ position: 'absolute', top: '-6px', left: '50%', marginLeft: '-6px', width: '12px', height: '12px', background: '#1e293b', borderLeft: '1px solid rgba(255,255,255,0.1)', borderTop: '1px solid rgba(255,255,255,0.1)', transform: 'rotate(45deg)' }} />
      </div>
    </div>
  );
}

export default function Navbar() {
  const style = {
    padding: '1rem 5%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: '#0f172a',
    borderBottom: '1px solid rgba(255,255,255,0.1)'
  };

  return (
    <nav style={style}>
      <Link to="/" style={{fontSize: '1.5rem', fontWeight: 700, color: '#ffffff', textDecoration: 'none'}}>NutriAI</Link>
      <div style={{display: 'flex', gap: '12px'}}>
        <DownloadBtn 
          icon={<IconPhone />} 
          label="Tải App" 
          platforms={[{name: 'iOS', url: 'https://apple.com'}, {name: 'Android', url: 'https://play.google.com'}]} 
        />
        <DownloadBtn 
          icon={<IconSmartWatch />} 
          label="App Watch" 
          platforms={[{name: 'WatchOS', url: 'https://apple.com/watch'}, {name: 'WearOS', url: 'https://android.com'}]} 
        />
      </div>
      <div style={{display: 'flex', gap: '2rem', alignItems: 'center'}}>
        <Link to="/" style={{color: '#f8fafc', textDecoration: 'none', fontWeight: 500}}>Trang chủ</Link>
        <Link to="/intro" style={{color: '#f8fafc', textDecoration: 'none', fontWeight: 500}}>Giới thiệu</Link>
        <Link to="/shopping" style={{color: '#f8fafc', textDecoration: 'none', fontWeight: 500}}>Mua sắm</Link>
        <Link to="/login" className="btn btn-primary" style={{borderRadius: '4px'}}>Đăng nhập</Link>
      </div>
    </nav>
  );
}