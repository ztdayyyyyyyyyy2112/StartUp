import React, { useState, useEffect, useRef } from 'react';
import s from './DoctorChat.module.css';
import { useAuth } from './useAuth';

// Mock AI responses
const getDoctorResponse = (message, user) => {
  const msg = message.toLowerCase();
  if (msg.includes('mệt') || msg.includes('tired')) {
    return `Chào ${user.name.split(' ').pop()}, tôi hiểu bạn đang cảm thấy mệt mỏi. Dựa trên dữ liệu, giấc ngủ của bạn gần đây hơi ngắn (khoảng 6.5h/đêm). Hãy thử ngủ đủ 7-8h và uống đủ nước xem sao nhé.`;
  }
  if (msg.includes('ăn gì') && msg.includes('tập')) {
    return 'Sau khi tập, bạn nên bổ sung protein và carb để phục hồi cơ bắp. Một gợi ý tốt là ức gà luộc với khoai lang, hoặc một ly sữa protein. Bạn có muốn tôi thêm vào thực đơn ngày mai không?';
  }
  if (msg.includes('đau đầu') || msg.includes('headache')) {
    return 'Đau đầu có thể do nhiều nguyên nhân như stress, thiếu nước hoặc thay đổi thời tiết. Bạn đã uống đủ 2L nước hôm nay chưa? Nếu tình trạng kéo dài, bạn nên tham khảo ý kiến bác sĩ chuyên khoa.';
  }
  if (msg.includes('calo')) {
    return `Mục tiêu calo hàng ngày của bạn là ${user.calories} kcal. Hôm nay bạn đã nạp khoảng 1160 kcal. Bạn có muốn xem gợi ý cho bữa tối không?`;
  }
  return 'Tôi là Bác sĩ AI, sẵn sàng lắng nghe và đưa ra lời khuyên dựa trên dữ liệu sức khoẻ của bạn. Bạn cần hỗ trợ về vấn đề gì?';
};

export default function DoctorChat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (user) {
      setMessages([
        { sender: 'ai', text: `Chào ${user.name.split(' ').pop()}, tôi là Bác sĩ AI cá nhân của bạn. Bạn đang cảm thấy thế nào hôm nay?` }
      ]);
    }
  }, [user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim() || !user) return;

    const userMessage = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const aiResponse = { sender: 'ai', text: getDoctorResponse(input, user) };
      setIsTyping(false);
      setMessages(prev => [...prev, aiResponse]);
    }, 1500 + Math.random() * 500);
  };

  if (!user) return null;

  return (
    <div className={`${s.chatContainer} page-enter`}>
      <div className={s.disclaimer}>
        <p>⚠️ <strong>Lưu ý:</strong> Tôi là một trợ lý AI. Thông tin tôi cung cấp chỉ mang tính tham khảo, không thay thế cho chẩn đoán y tế chuyên nghiệp. Hãy luôn tham khảo ý kiến bác sĩ cho các vấn đề sức khoẻ quan trọng.</p>
      </div>
      <div className={s.messages}>
        {messages.map((msg, index) => (
          <div key={index} className={`${s.message} ${s[msg.sender]}`}>
            <div className={s.avatar}>{msg.sender === 'ai' ? '🩺' : user.avatar}</div>
            <div className={s.bubble}>{msg.text}</div>
          </div>
        ))}
        {isTyping && (
          <div className={`${s.message} ${s.ai}`}>
            <div className={s.avatar}>🩺</div>
            <div className={`${s.bubble} ${s.typing}`}>
              <span /><span /><span />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form className={s.inputForm} onSubmit={handleSend}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Hỏi bác sĩ AI về sức khoẻ của bạn..."
          disabled={isTyping}
        />
        <button type="submit" disabled={isTyping}>Gửi</button>
      </form>
    </div>
  );
}