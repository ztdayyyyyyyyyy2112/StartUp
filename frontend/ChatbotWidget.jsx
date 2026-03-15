import React, { useState } from 'react';
import s from './ChatbotWidget.module.css';

const SHOP_ITEMS = [
  { name: 'Vòng tay NutriAI', price: '250.000đ', icon: '⌚' },
  { name: 'Gói VIP 1 Tháng', price: '30.000đ', icon: '👑' },
  { name: 'Thực đơn 7 ngày', price: '99.000đ', icon: '🥗' },
]

export default function ChatbotWidget({ purpose }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [cart, setCart] = useState([]);

  let icon = '🤖';
  const isShopping = purpose.toLowerCase().includes('mua sắm');

  if (isShopping) icon = '🛍️';
  else if (purpose.toLowerCase().includes('dự án')) icon = '🚀';

  const handleAddToCart = (item) => {
    setCart([...cart, item]);
    alert(`Đã thêm "${item.name}" vào giỏ hàng! (Giả lập)`);
  };

  return (
    <>
      {isOpen && isShopping && (
        <div className={s.shopPopup}>
          <div className={s.popupHeader}>
            <span>Gợi ý sản phẩm ({cart.length})</span>
            <button onClick={(e) => { e.stopPropagation(); setIsOpen(false); }} className={s.closeBtn}>×</button>
          </div>
          <div className={s.productList}>
            {SHOP_ITEMS.map((item, i) => (
              <div key={i} className={s.productItem}>
                <div className={s.prodIcon}>{item.icon}</div>
                <div>
                  <div className={s.prodName}>{item.name}</div>
                  <div className={s.prodPrice}>{item.price}</div>
                </div>
                <button className={s.addBtn} onClick={() => handleAddToCart(item)}>+</button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div 
        className={`${s.widget} ${isOpen ? s.active : ''}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => isShopping && setIsOpen(!isOpen)}
      >
        {isHovered && !isOpen && (
          <div className={s.tooltip}>
            <p><strong>AI Assistant</strong></p>
            <p>{purpose}</p>
          </div>
        )}
        <div className={s.icon}>{isOpen ? '✕' : icon}</div>
      </div>
    </>
  );
}