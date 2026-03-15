import React, { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from './Navbar'
import { IconArrow, IconBrain, IconWatch, IconLeaf, IconChart, IconShield, IconTrophy, IconActivity, IconFood, IconMap } from './Icons'
import ChatbotWidget from './ChatbotWidget'
import s from './Intro.module.css'

function useInView(t = 0.15) {
  const ref = useRef(null); const [v, setV] = useState(false)
  useEffect(() => {
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) setV(true) }, { threshold: t })
    if (ref.current) o.observe(ref.current); return () => o.disconnect()
  }, [t]); return [ref, v]
}

const STEPS = [
  { num: '01', color: '#4ade80', title: 'Nhập mục tiêu của bạn', desc: 'Giảm cân, tăng cơ, ăn chay hay kiểm soát đường huyết — AI sẽ hiệu chỉnh toàn bộ hệ thống theo đúng bạn.' },
  { num: '02',  color: '#2dd4bf', title: 'Nhận thực đơn cá nhân', desc: 'Mỗi ngày AI gợi ý bữa sáng, trưa, tối phù hợp với calo, dinh dưỡng và khẩu vị từ 1000+ món Việt.' },
  { num: '03',  color: '#a3e635', title: 'Theo dõi sức khoẻ realtime', desc: 'Tracking calo ăn vào, vận động, giấc ngủ — đồng bộ từ điện thoại hoặc wearable.' },
  { num: '04',  color: '#f59e0b', title: 'Cảnh báo thông minh', desc: 'AI phát hiện thực phẩm gây dị ứng, tương tác thuốc-thực phẩm và thói quen xấu trước khi có hại.' },
  { num: '05',  color: '#e879f9', title: 'Thách thức & phần thưởng', desc: 'Cùng bạn bè thi đua sức khoẻ, tích điểm mỗi ngày, đổi voucher thực phẩm và gym.' },
]

const ECOSYSTEM = [
  { image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&q=80&w=600', label: 'App Dinh Dưỡng', sub: 'Core — miễn phí 100%' },
  { image: 'https://images.unsplash.com/photo-1557438159-51eec7a6c9e8?auto=format&fit=crop&q=80&w=600', label: 'Apple/Galaxy Watch', sub: '30k/tháng' },
  { image: 'https://images.unsplash.com/photo-1510017803434-a899398421b3?auto=format&fit=crop&q=80&w=600', label: 'Vòng Tay NutriAI', sub: '250k/vĩnh viễn' },
  { image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=600', label: 'Phòng Gym & PT', sub: 'API đối tác' },
  { image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbbb88?auto=format&fit=crop&q=80&w=600', label: 'Nhà Thuốc', sub: 'Gợi ý thực phẩm chức năng' },
  { image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=600', label: 'Bảo Hiểm', sub: 'InsurTech — giảm phí khi sống khoẻ' },
]

const TEAM = [
  { emoji: '', role: 'HTTT', name: 'Product Manager', desc: 'PM · Phân tích nghiệp vụ · Kết nối sản phẩm – thị trường' },
  { emoji: '', role: 'KTMT', name: 'Hardware Engineer', desc: 'IoT · Wearable · Tối ưu backend' },
  { emoji: '', role: 'KHMT ', name: 'AI / ML Engineers', desc: 'AI/ML · Dữ liệu thực phẩm · Chatbot · Tracking hành vi' },
  { emoji: '', role: 'TMĐT', name: 'Growth Marketer', desc: 'Marketing · TikTok · Growth hacking · B2C' },
  { emoji: '', role: 'CNSH', name: 'Nutrition Expert', desc: 'Thành phần thực phẩm · Tương tác sinh học · Cảnh báo khoa học' },
]

function HeroIntro() {
  const [r, v] = useInView(0.05)
  return (
    <section className={s.heroIntro} ref={r}>
      <div className={`${s.hiBadge} ${v ? s.vis : ''}`}>
        <span className="tag">Giới thiệu sản phẩm</span>
      </div>
      <h1 className={`${s.hiTitle} ${v ? s.vis : ''}`}>
        Hệ sinh thái sức khoẻ<br />
        <span className="grad-text">cá nhân hoá đầu tiên</span><br />
        cho người Việt
      </h1>
      <p className={`${s.hiSub} ${v ? s.vis : ''}`}>
        NutriAI không chỉ là app dinh dưỡng — đây là nền tảng kết nối AI, wearable, phòng gym, nhà thuốc và bảo hiểm trong một hệ sinh thái duy nhất, lấy người dùng làm trung tâm.
      </p>
      <div className={`${s.hiActions} ${v ? s.vis : ''}`} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
        <Link to="/login?mode=register" className="btn btn-primary">Tham gia ngay <IconArrow /></Link>
        <Link to="/" className="btn btn-ghost">← Về trang chủ</Link>
      </div>
    </section>
  )
}

function HowItWorks() {
  const [r, v] = useInView(0.05)
  return (
    <section className={s.hiw} ref={r} style={{ paddingBottom: 'var(--p-section)' }}>
      <div className={s.sectionHead}>
        <div className="tag">Cách hoạt động</div>
        <h2>5 bước đến sức khoẻ tối ưu</h2>
      </div>
      <div className={s.steps}>
        {STEPS.map((step, i) => (
          <div key={i} className={`${s.step} ${v ? s.vis : ''}`} style={{ animationDelay: `${i * .1}s` }}>
            <div className={s.stepNum} style={{ color: step.color, borderColor: step.color + '40' }}>{step.num}</div>
            <div className={s.stepBody}>
              <div className={s.stepIcon} style={{ background: step.color + '18', color: step.color }}>
                {step.icon}
              </div>
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
            </div>
            {i < STEPS.length - 1 && <div className={s.stepArrow}><IconArrow /></div>}
          </div>
        ))}
      </div>
    </section>
  )
}

function EcosystemSection() {
  const [r, v] = useInView(0.1)
  return (
    <section className={s.ecoSection} ref={r}>
      <div className={s.sectionHead}>
        <div className="tag">Hệ sinh thái</div>
        <h2>Kết nối mọi khía cạnh sức khoẻ</h2>
        <p>Từ thực đơn đến vận động, từ giấc ngủ đến bảo hiểm — tất cả trong một nền tảng.</p>
      </div>
      <div className={s.ecoGrid}>
        {ECOSYSTEM.map((e, i) => (
          <div 
            key={i} 
            className={`${s.ecoCard} ${v ? s.vis : ''}`} 
            style={{ 
              animationDelay: `${i * .08}s`,
              backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.8)), url(${e.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}>
            <div className={s.ecoContent} style={{ marginTop: 'auto', padding: '1.5rem', zIndex: 2 }}>
              <div className={s.ecoLabel} style={{ color: 'white', fontWeight: 700, fontSize: '1.2rem' }}>{e.label}</div>
              <div className={s.ecoSub} style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>{e.sub}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function TeamSection() {
  const [r, v] = useInView(0.1)
  return (
    <section className={s.teamSection} ref={r}>
      <div className={s.sectionHead}>
        <div className="tag">Đội ngũ</div>
        <h2>8 người · 4 chuyên môn · 1 mục tiêu</h2>
        <p>Kỹ thuật + Khoa học + Kinh doanh — đủ để xây startup từ 0 đến Series A.</p>
      </div>
      <div className={s.teamGrid}>
        {TEAM.map((m, i) => (
          <div key={i} className={`${s.teamCard} ${v ? s.vis : ''}`} style={{ animationDelay: `${i * .09}s` }}>
            <div className={s.teamEmoji}>{m.emoji}</div>
            <div className={s.teamRole}>{m.role}</div>
            <div className={s.teamName}>{m.name}</div>
            <p>{m.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function Vision() {
  const [r, v] = useInView(0.1)
  return (
    <section className={s.vision} ref={r}>
      <div className={`${s.visionInner} ${v ? s.vis : ''}`} style={{ background: 'rgba(15, 23, 42, 0.9)', padding: '4rem 2rem', borderRadius: '32px', color: 'white', maxWidth: '1000px', margin: '0 auto' }}>
        <div className="tag">Tầm nhìn 2035</div>
        <h2 style={{ color: 'white', marginBottom: '2.5rem' }}>"Trở thành nền tảng cá nhân hoá dinh dưỡng hàng đầu Đông Nam Á, được đầu tư Series A."</h2>
        <div className={s.visionStats}>
          {[['$10M+','Định giá mục tiêu'],['Series A','Gọi vốn 20–50 tỷ'],['>30','Thành viên team'],['3 quốc gia','SEA expansion']].map(([n, l]) => (
            <div key={l} className={s.vStat}>
              <div className={s.vStatNum} style={{ color: '#4ade80' }}>{n}</div>
              <div className={s.vStatLabel} style={{ color: 'rgba(255,255,255,0.7)' }}>{l}</div>
            </div>
          ))}
        </div>
        <Link to="/login?mode=register" className="btn btn-primary">Tham gia cùng chúng tôi <IconArrow /></Link>
      </div>
    </section>
  )
}

export default function Intro() {
  return (
    <div className="page-enter">
      <Navbar />
      <HeroIntro />
      <HowItWorks />
      <EcosystemSection />
      <TeamSection />
      <Vision />
      <ChatbotWidget purpose="Hỗ trợ về dự án" />
    </div>
  )
}
