import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import Navbar from './Navbar'
import { IconArrow, IconCheck, IconStar, IconBrain, IconLeaf, IconWatch,
         IconChart, IconShield, IconUsers } from './Icons'
import ChatbotWidget from './ChatbotWidget'
import s from './Landing.module.css'

/* ─ Hooks ─────────────────────────────────────────────────────────────── */
function useInView(threshold = 0.18) {
  const ref = useRef(null)
  const [v, setV] = useState(false)
  useEffect(() => {
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) setV(true) }, { threshold })
    if (ref.current) o.observe(ref.current)
    return () => o.disconnect()
  }, [threshold])
  return [ref, v]
}
function useCounter(target, dur = 1800, trigger = false) {
  const [n, setN] = useState(0)
  useEffect(() => {
    if (!trigger) return
    let s = 0; const step = target / (dur / 16)
    const t = setInterval(() => {
      s += step; if (s >= target) { setN(target); clearInterval(t) } else setN(Math.floor(s))
    }, 16)
    return () => clearInterval(t)
  }, [trigger, target, dur])
  return n
}
function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < breakpoint)
    check() // Check ngay khi mount
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [breakpoint])
  return isMobile
}

/* ─ Data ──────────────────────────────────────────────────────────────── */
const FEATURES = [
  {  title: 'AI Cá Nhân Hoá', desc: 'Phân tích mục tiêu sức khoẻ và thói quen ăn uống, gợi ý thực đơn phù hợp riêng cho bạn mỗi ngày.' },
  {  title: '1000+ Món Ăn Việt', desc: 'Cơ sở dữ liệu dinh dưỡng chuẩn khoa học kết hợp USDA và tài liệu chuyên ngành Việt Nam.' },
  {  title: 'Wearable Ecosystem', desc: 'Đồng bộ Apple Watch, Galaxy Watch hoặc vòng tay riêng chỉ 250k — mở khoá vĩnh viễn.' },
  {  title: 'Tracking Thông Minh', desc: 'Theo dõi calo, protein, carb, fat realtime. Cảnh báo tự động khi lệch mục tiêu.' },
  { title: 'Cảnh Báo Dị Ứng, Nguy cơ tiềm ẩn ', desc: 'Phát hiện thực phẩm độc hại và tương tác xấu dựa trên hồ sơ sức khoẻ cá nhân.' },
  {    title: 'Cộng Đồng', desc: 'Thi đua, tích điểm, đổi voucher — tạo habit sống khoẻ bền vững cùng bạn bè.' },
]
const PLANS = [
  { name: 'Free', price: '0đ', period: '/mãi mãi', badge: null,
    features: ['Gợi ý thực đơn AI', 'Tracking calo thủ công', '1000+ món ăn Việt', 'Tham gia thử thách', 'Tích điểm sức khoẻ'],
    cta: 'Dùng miễn phí', primary: false, link: '/login?mode=register' },
  { name: 'VIP Watch', price: '30k', period: '/tháng', badge: 'Phổ biến',
    features: ['Tất cả Free +', 'Tracking tự động Watch', 'Cảnh báo rung thông minh', 'Biểu đồ 30 ngày', 'Đồng bộ gym & PT'],
    cta: 'Thử 7 ngày miễn phí', primary: true, link: '/login?mode=register' },
  { name: 'Vòng Tay', price: '250k', period: '/vĩnh viễn', badge: null,
    features: ['Tất cả VIP +', 'Vòng tay chính hãng', 'Mở khoá vĩnh viễn', 'Không phụ thuộc Apple', 'Ưu tiên tính năng mới'],
    cta: 'Mua vòng tay', primary: false, link: '/shopping' },
]
const TESTIMONIALS = [
  { name: 'Độ Mixi', role: 'Gym · Hà Nội', text: 'App gợi ý thực đơn tăng cơ cực chuẩn! Không cần đếm calo thủ công nữa, chộ nào cũng có thể truy cập.', stars: 5 },
  { name: 'Dược sĩ Tiến', role: 'Văn phòng · Hà Nội', text: 'Cảnh báo dị ứng gluten cứu mình khỏi nhiều bữa tệ. Nà ná na na anh Phùng Thanh Độ.', stars: 5 },
  { name: 'Hiếu Thứ Hai', role: 'Sinh viên y · Đà Nẵng', text: 'Anh..muốn thấy em cười, túi chanel trên người, tay toàn vòng tay Nutri.', stars: 5 },
]
const ARTICLES = [
  { title: 'Tác dụng của chế độ ăn Low-Carb với người Việt', desc: 'Phân tích từ chuyên gia về việc áp dụng Low-Carb vào thực đơn cơm - phở truyền thống.', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=600', tag: 'Dinh dưỡng', date: '12/03' },
  { title: 'AI phát hiện sớm nguy cơ tiểu đường qua thói quen ăn uống', desc: 'Công nghệ Machine Learning giúp dự báo nguy cơ dựa trên nhật ký ăn uống 30 ngày.', image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=600', tag: 'Y tế số', date: '10/03' },
  { title: 'Top 5 loại rau củ bản địa tốt hơn siêu thực phẩm nhập ngoại', desc: 'Rau muống, khoai lang... chứa hàm lượng dinh dưỡng bất ngờ mà bạn có thể chưa biết.', image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&q=80&w=600', tag: 'Sống khoẻ', date: '08/03' },
]

/* ─ Phone Mockup ──────────────────────────────────────────────────────── */
function PhoneMockup() {
  const meals = [
    { name: 'Cơm tấm sườn bì', calo: 520, pct: 94 },
    { name: 'Phở bò tái', calo: 380, pct: 88 },
    { name: 'Bánh mì trứng', calo: 310, pct: 81 },
  ]
  return (
    <div className={s.phone}>
      <div className={s.phoneNotch} />
      <div className={s.phoneScreen}>
        <div className={s.appHeader}>
          <span>Chào Mày 👋</span><span className={s.appDate}>Thứ 2 · 14/03</span>
        </div>
        <div className={s.goalCard}>
          <div className={s.goalTitle}>Mục tiêu hôm nay</div>
          {[['Protein','68g','100g',68,'#4ade80'],['Carbs','135g','300g',45,'#a3e635'],['Fat','21g','70g',30,'#2dd4bf']].map(([l,v,m,p,c])=>(
            <div key={l} className={s.barRow}>
              <span>{l}</span>
              <div className={s.bar}><div className={s.barFill} style={{width:`${p}%`,background:c}} /></div>
              <span>{v}/{m}</span>
            </div>
          ))}
        </div>
        <div className={s.aiLabel}>🤖 AI gợi ý bữa trưa</div>
        {meals.map((m,i) => (
          <div key={i} className={s.mealRow}>
            <div>
              <div className={s.mealName}>{m.name}</div>
              <div className={s.mealMeta}>{m.calo} kcal</div>
            </div>
            <div className={s.matchPct}>{m.pct}%</div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─ Sections ──────────────────────────────────────────────────────────── */
function Hero() {
  const [r,v] = useInView(0.05)
  return (
    <section className={s.hero} ref={r}>
      <div className={`${s.heroContent} ${v?s.vis:''}`}>
        <div className="tag"> Ra mắt 2029 · Đông Nam Á</div>
        <h1 className={s.heroTitle}>
          AI dành riêng cho sức khỏe của bạn.<br/>
          <span className="grad-text">Thực đơn đúng mỗi ngày.</span>
        </h1>
        <p className={s.heroSub}>Nền tảng dinh dưỡng cá nhân hoá đầu tiên cho người Việt — phân tích mục tiêu, cảnh báo thực phẩm, cảnh báo sức khỏe, gợi ý thực đơn thông minh.</p>
        <div className={s.heroActions} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <Link to="/login?mode=register" className="btn btn-primary">Bắt đầu miễn phí <IconArrow /></Link>
          <Link to="/intro" className="btn btn-ghost">Xem giới thiệu</Link>
          <Link to="/shopping" className="btn btn-ghost">Mua sắm</Link>
        </div>
        <div className={s.proof}>
          {[['100%','Tính năng AI miễn phí'],['1000+','Món ăn Việt'],['250.000 VND','Vòng tay vĩnh viễn']].map(([n,l],i)=>(
            <div key={i} className={s.proofItem}>
              <span className={s.proofNum}>{n}</span><span>{l}</span>
            </div>
          ))}
        </div>
        <Link
          to="/policy/health-safety"
          className={s.policyBanner}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem',
            marginTop: '2.5rem',
            padding: '1rem 1.5rem',
            borderRadius: '16px',
            background: 'rgba(15, 23, 42, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            textDecoration: 'none',
            color: '#fff',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            transition: 'all 0.2s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '1.8rem' }}><IconShield /></span>
            <div>
              <div style={{ fontWeight: 600, color: 'white', fontSize: '1rem' }}>Cam kết An toàn & Bảo hiểm Sức khỏe</div>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>Bảo vệ người dùng là ưu tiên hàng đầu.</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#4ade80', fontWeight: 700, fontSize: '1rem', whiteSpace: 'nowrap', textDecoration: 'underline', textUnderlineOffset: '4px' }}>
            Xem chi tiết <IconArrow />
          </div>
        </Link>
      </div>
      <div className={`${s.heroVisual} ${v?s.vis:''}`}>
        <PhoneMockup />
      </div>
      {/* orbs */}
      <div className={s.orb1} /><div className={s.orb2} /><div className={s.orb3} />
    </section>
  )
}

function Stats() {
  const [r,v] = useInView(0.3)
  const u = useCounter(10000,1800,v)
  const f = useCounter(1000,1500,v)
  const a = useCounter(94,1600,v)
  const p = useCounter(50,1200,v)
  return (
    <section className={s.stats} ref={r} style={{ backgroundColor: '#0f172a', color: '#fff', padding: '2rem 0 5rem', margin: '0', width: '100%', maxWidth: 'none', display: 'flex', justifyContent: 'center' }}>
      {[[u,'k+','Người dùng 2031'],[f,'+','Món ăn Việt'],[a,'%','Độ chính xác AI'],[p,'+','Đối tác']].map(([n,sx,l],i)=>(
        <div key={i} className={`${s.statItem} ${v?s.vis:''}`} style={{animationDelay:`${i*.1}s`}}>
          <div className={s.statVal} style={{ color: '#ffffff' }}>{n.toLocaleString()}<span style={{ color: 'var(--g500)' }}>{sx}</span></div>
          <div className={s.statLabel} style={{ color: '#cbd5e1' }}>{l}</div>
        </div>
      ))}
    </section>
  )
}

function Features() {
  const [r,v] = useInView(0.05)
  const [hovered, setHovered] = useState(null)

  return (
    <section id="features" className={s.section} ref={r}>
      <div className={s.sectionHead}>
        <div className="tag">Tính năng</div>
        <h2>Mọi thứ bạn cần để sống khoẻ</h2>
        <p>Từ thực đơn cá nhân đến cảnh báo dị ứng — AI hiểu người Việt.</p>
      </div>
      <div className={`${s.featList} ${v ? s.vis : ''}`} style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '800px', margin: '0 auto' }}>
        {FEATURES.map((f, i) => (
          <div
            key={i}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            style={{
              background: hovered === i ? 'var(--bg)' : 'var(--bg2)',
              padding: '24px 32px',
              borderRadius: '16px',
              cursor: 'pointer',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              border: '1px solid',
              borderColor: hovered === i ? 'var(--g500)' : 'var(--border2)',
              boxShadow: hovered === i ? '0 10px 25px -5px rgba(0,0,0,0.05)' : 'none',
              overflow: 'hidden',
              animationDelay: `${i * 0.07}s`
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <span style={{ fontSize: '1.5rem', opacity: hovered === i ? 1 : 0.5, transition: '0.3s' }}>{f.icon}</span>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600, color: hovered === i ? 'var(--g500)' : 'var(--t1)' }}>{f.title}</h3>
              </div>
              <span style={{ transform: hovered === i ? 'rotate(90deg)' : 'none', transition: '0.3s', opacity: 0.3 }}><IconArrow /></span>
            </div>
            <div style={{
              maxHeight: hovered === i ? '120px' : '0',
              opacity: hovered === i ? 1 : 0,
              transition: 'all 0.4s ease',
              marginTop: hovered === i ? '16px' : '0',
              color: 'var(--t2)',
              lineHeight: '1.7',
              fontSize: '1rem'
            }}>
              {f.desc}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function Articles() {
  const [r,v] = useInView(0.05)
  return (
    <section id="articles" className={s.section} ref={r} style={{ backgroundColor: '#0f172a', color: '#fff', padding: 'var(--p-section) 0', margin: '0', width: '100%', maxWidth: 'none' }}>
      <div className={s.sectionHead}>
        <div className="tag">Kiến thức</div>
        <h2 style={{ color: '#ffffff' }}>Y khoa & Sức khoẻ</h2>
        <p style={{ color: '#cbd5e1' }}>Thông tin chuyên sâu từ đội ngũ bác sĩ và chuyên gia dinh dưỡng.</p>
      </div>
      <div className={s.grid} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', maxWidth: '1100px', margin: '0 auto', padding: '0 20px' }}>
        {ARTICLES.map((item,i)=>(
          <div key={i} className={`${s.articleCard} ${v?s.vis:''}`} style={{
            animationDelay:`${i*.1}s`,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '16px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{height: '200px', overflow: 'hidden'}}>
              <img src={item.image} alt={item.title} style={{width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s'}} />
            </div>
            <div style={{padding: '24px', flex: 1, display: 'flex', flexDirection: 'column'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '0.85rem', color: '#94a3b8'}}>
                <span style={{color: '#4ade80', fontWeight: 600}}>{item.tag}</span>
                <span>{item.date}</span>
              </div>
              <h3 style={{fontSize: '1.25rem', fontWeight: 600, color: 'white', marginBottom: '12px', lineHeight: 1.4}}>{item.title}</h3>
              <p style={{fontSize: '0.95rem', color: '#cbd5e1', lineHeight: 1.6, marginBottom: '20px', flex: 1}}>{item.desc}</p>
              <a href="#" style={{color: '#2dd4bf', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.95rem'}}>
                Đọc chi tiết <IconArrow />
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function Pricing() {
  const [r,v] = useInView(0.05)
  return (
    <section id="pricing" className={s.section} ref={r}>
      <div className={s.sectionHead}>
        <div className="tag">Bảng giá</div>
        <h2>Không mua cũng vẫn dùng đủ</h2>
        <p className={s.pricingSlogan}>— nhưng có vòng tay của chúng tôi, bạn sẽ sống khoẻ chủ động hơn!</p>
      </div>
      <div className={s.plansGrid}>
        {PLANS.map((plan,i)=>(
          <div key={i} className={`${s.planCard} ${plan.primary?s.planFeatured:''} ${v?s.vis:''}`} style={{animationDelay:`${i*.1}s`}}>
            {plan.badge && <div className={s.planBadge}>{plan.badge}</div>}
            <div className={s.planName}>{plan.name}</div>
            <div className={s.planPrice}><span className={s.planAmt}>{plan.price}</span><span className={s.planPer}>{plan.period}</span></div>
            <ul className={s.planList}>
              {plan.features.map((f,j)=>(
                <li key={j}><span className={s.planCheck}><IconCheck /></span>{f}</li>
              ))}
            </ul>
            <Link to={plan.link} className={`btn ${plan.primary?'btn-primary':'btn-ghost'} ${s.planCta}`}>{plan.cta}</Link>
          </div>
        ))}
      </div>
    </section>
  )
}

function Testimonials() {
  const [r,v] = useInView(0.1)
  return (
    <section className={s.section} ref={r} style={{ backgroundColor: '#0f172a', color: '#fff', padding: 'var(--p-section) 0', margin: '0', width: '100%', maxWidth: 'none' }}>
      <div className={s.sectionHead}>
        <div className="tag">Phản hồi</div>
        <h2 style={{ color: '#ffffff' }}>Người dùng nói gì?</h2>
      </div>
      <div className={s.testiGrid}>
        {TESTIMONIALS.map((t,i)=>(
          <div key={i} className={`${s.testiCard} ${v?s.vis:''}`} style={{animationDelay:`${i*.1}s`, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff'}}>
            <div className={s.stars}>{Array(t.stars).fill(0).map((_,j)=><IconStar key={j}/>)}</div>
            <p style={{ color: '#cbd5e1' }}>"{t.text}"</p>
            <div className={s.testiAuthor}>
              <div className={s.testiAvatar} style={{ background: 'var(--g500)' }}>{t.name[0]}</div>
              <div><div className={s.testiName} style={{ color: '#ffffff' }}>{t.name}</div><div className={s.testiRole} style={{ color: '#94a3b8' }}>{t.role}</div></div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function CtaStrip() {
  return (
    <section className={s.ctaStrip}>
      <div className={s.ctaOrb1}/><div className={s.ctaOrb2}/>
      <div className={s.ctaInner}>
        <h2>Sẵn sàng sống khoẻ hơn?</h2>
        <p>Tham gia ngay hôm nay — miễn phí mãi mãi.</p>
        <div className={s.ctaRow}>
          <input className={s.ctaInput} type="email" placeholder="email@example.com" />
          <Link to="/login?mode=register" className="btn btn-primary">Đăng ký ngay <IconArrow /></Link>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className={s.footer}>
      <div className={s.footerInner}>
        <div className={s.footerBrand}>
          <div className={s.footerLogo}><span></span><span>NutriAI</span></div>
          <p>Nền tảng AI dinh dưỡng cá nhân hoá hàng đầu Đông Nam Á.</p>
        </div>
        <div className={s.footerLinks}>
          {[['Sản phẩm',['Tính năng','Bảng giá','Lộ trình']],['Công ty',['Đội ngũ','Blog','Liên hệ']],['Pháp lý',['Điều khoản','Bảo mật','Cookie']]].map(([h,ls])=>(
            <div key={h}><h4>{h}</h4>{ls.map(l=><a key={l} href="#">{l}</a>)}</div>
          ))}
        </div>
      </div>
      <div style={{ textAlign: 'center', margin: '2rem 0 1rem' }}>
        <Link to="/policy/health-safety" style={{ fontWeight: '700', color: 'var(--g500)', fontSize: '1.1rem', textDecoration: 'none', borderBottom: '2px solid transparent', transition: 'border-color 0.2s' }}>🛡️ Chính sách An toàn Sức khỏe & Bảo hiểm</Link>
      </div>
      <div className={s.footerBottom}><p style={{ color: 'var(--t2)' }}>© 2029 NutriAI · Made with 💚 tại Việt Nam</p></div>
    </footer>
  )
}

/* ─ Mobile Layout ─────────────────────────────────────────────────────── */
function MobileLanding() {
  return (
    <div className="page-enter" style={{ background: '#0f172a', minHeight: '100vh', color: '#fff', paddingBottom: '80px' }}>
      <Navbar />
      <div style={{ padding: '80px 20px 40px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div className="tag" style={{ marginBottom: '1rem' }}>NutriAI Mobile</div>
        <h1 className={s.heroTitle} style={{ fontSize: '2rem', lineHeight: '1.2' }}>
          Sống khoẻ hơn<br />
          <span className="grad-text">ngay trên tay bạn</span>
        </h1>
        <p style={{ color: '#cbd5e1', margin: '16px 0 32px' }}>
          Trải nghiệm ứng dụng AI dinh dưỡng mượt mà, tối ưu hóa riêng cho màn hình điện thoại.
        </p>
        
        {/* Tái sử dụng PhoneMockup nhưng scale nhỏ lại chút */}
        <div style={{ transform: 'scale(0.9)', marginBottom: '20px' }}>
          <PhoneMockup />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', maxWidth: '300px' }}>
          <Link to="/login?mode=register" className="btn btn-primary" style={{ justifyContent: 'center' }}>Đăng ký ngay <IconArrow /></Link>
          <Link to="/login" className="btn btn-ghost" style={{ justifyContent: 'center', background: 'rgba(255,255,255,0.1)' }}>Đăng nhập</Link>
        </div>
      </div>
      <ChatbotWidget purpose="Hỗ trợ Mobile" />
    </div>
  )
}

/* ─ Page ──────────────────────────────────────────────────────────────── */
export default function Landing() {
  const isMobile = useIsMobile()
  if (isMobile) return <MobileLanding />

  return (
    <div className="page-enter">
      <Navbar />
      <Hero />
      <Stats />
      <Features />
      <Articles />
      <Pricing />
      <Testimonials />
      <CtaStrip />
      <Footer />
      <ChatbotWidget purpose="Hỗ trợ về dự án" />
    </div>
  )
}
