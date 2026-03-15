import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from './useAuth'
import {
  IconHome, IconFood, IconActivity, IconChart, IconTrophy,
  IconBell, IconSettings, IconLogout, IconPlus, IconFire, IconTarget,
  IconLeaf, IconWatch, IconCheck, IconShield, IconStethoscope
} from './Icons'
import DoctorChat from './DoctorChat'
import s from './Dashboard.module.css'

/* ─ Mock data ─────────────────────────────────────────────────────────── */
const MEALS_TODAY = [
  { name: 'Phở bò tái', time: '07:30', calo: 380, protein: 22, type: 'Sáng', color: '#4ade80', image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=200&q=80' },
  { name: 'Cơm tấm sườn bì', time: '12:15', calo: 520, protein: 28, type: 'Trưa', color: '#2dd4bf', image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=200&q=80' },
  { name: 'Bánh mì trứng ốp', time: '15:00', calo: 260, protein: 14, type: 'Snack', color: '#a3e635', image: 'https://images.unsplash.com/photo-1541529086526-db283c563270?auto=format&fit=crop&w=200&q=80' },
]
const SUGGESTIONS = [
  { name: 'Bún bò Huế', calo: 450, protein: 25, match: 96, tag: 'Tối nay', image: 'https://images.unsplash.com/photo-1555126634-323283e090fa?auto=format&fit=crop&w=200&q=80' },
  { name: 'Rau muống xào tỏi', calo: 120, protein: 3, match: 91, tag: 'Kèm bữa tối', image: 'https://images.unsplash.com/photo-1617093727343-374698b1b08d?auto=format&fit=crop&w=200&q=80' },
  { name: 'Canh chua cá', calo: 180, protein: 18, match: 87, tag: 'Tối nay', image: 'https://images.unsplash.com/photo-1603082575960-466d713c2351?auto=format&fit=crop&w=200&q=80' },
]
const WEEK_CALO = [1780, 1950, 1620, 1800, 1840, 2100, 1160]
const WEEK_LABELS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']
const CHALLENGES = [
  { title: 'Uống 2L nước/ngày', progress: 6, total: 7, reward: ' 50 điểm', done: false },
  { title: 'Ăn đủ protein 7 ngày', progress: 4, total: 7, reward: '🎁 Voucher 20k', done: false },
  { title: 'Không bỏ bữa sáng', progress: 7, total: 7, reward: ' Hoàn thành', done: true },
]
const ALERTS = [
  { type: 'warn', msg: 'Hôm nay bạn ăn ít protein hơn mục tiêu 32g', icon: '⚠️' },
  { type: 'info', msg: 'Bún chả có gluten — cẩn thận nếu bạn nhạy cảm', icon: '🔔' },
  { type: 'good', msg: 'Đạt mục tiêu rau xanh hôm nay! Tuyệt vời 🥬', icon: '✅' },
]
const LEADERBOARD = [
  { rank: 1, name: 'Độ Mixi', pts: 2340, avatar: 'Đ' },
  { rank: 2, name: 'Thạch Phạm', pts: 2110, avatar: 'M' },
  { rank: 3, name: 'Thành Hà', pts: 1890, avatar: 'T' },
  { rank: 4, name: 'Bảo Nguyễn', pts: 1650, avatar: 'H' },
  { rank: 5, name: 'Duy Hiếu', pts: 1420, avatar: 'A' },
]

const NAV_ITEMS = [
  { id: 'home', label: 'Tổng quan', icon: <IconHome /> },
  { id: 'meals', label: 'Bữa ăn', icon: <IconFood /> },
  { id: 'tracking', label: 'Tracking', icon: <IconActivity /> },
  { id: 'analytics', label: 'Phân tích', icon: <IconChart /> },
  { id: 'challenges', label: 'Thử thách', icon: <IconTrophy /> },
  { id: 'doctor', label: 'Bác sĩ AI', icon: <IconStethoscope /> },
]

/* ─ Mini bar chart ────────────────────────────────────────────────────── */
function BarChart({ data, labels, goal = 1800 }) {
  const max = Math.max(...data, goal * 1.1)
  return (
    <div className={s.barChart}>
      {data.map((v, i) => (
        <div key={i} className={s.barGroup}>
          <div className={s.barWrap}>
            <div
              className={s.barCol}
              style={{
                height: `${(v / max) * 100}%`,
                background: v > goal ? 'rgba(239,68,68,.7)' : 'linear-gradient(180deg,#4ade80,#2dd4bf)',
              }}
            />
            <div className={s.barGoalLine} style={{ bottom: `${(goal / max) * 100}%` }} />
          </div>
          <span className={s.barLabel}>{labels[i]}</span>
        </div>
      ))}
    </div>
  )
}

/* ─ Ring progress ─────────────────────────────────────────────────────── */
function Ring({ pct, size = 80, stroke = 7, color = '#4ade80', children }) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  return (
    <div className={s.ring} style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,.06)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - pct / 100)}
          style={{ transition: '1.2s ease' }}
        />
      </svg>
      <div className={s.ringCenter}>{children}</div>
    </div>
  )
}

/* ─ Sections ──────────────────────────────────────────────────────────── */
function Overview({ user }) {
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Chào buổi sáng' : hour < 18 ? 'Chào buổi chiều' : 'Chào buổi tối'
  const caloriesEaten = MEALS_TODAY.reduce((a, m) => a + m.calo, 0)
  const caloriesGoal = user?.calories || 1800
  const calPct = Math.min(Math.round(caloriesEaten / caloriesGoal * 100), 100)

  return (
    <div className={`${s.tabContent} page-enter`}>
      {/* Greeting */}
      <div className={s.greetRow}>
        <div>
          <h1 className={s.greeting}>{greeting}, <span>{user?.name?.split(' ').pop() || 'bạn'}</span></h1>
          <p className={s.greetSub}>Hôm nay là Thứ 2 · 14/03/2025 · Mục tiêu: {user?.goal}</p>
        </div>
        <div className={s.streakBadge}><span>12 ngày liên tiếp</span></div>
      </div>

      {/* Macro cards */}
      <div className={s.macroGrid}>
        {[
          { label: 'Calo', val: caloriesEaten, goal: caloriesGoal, unit: 'kcal', pct: calPct, color: '#4ade80' },
          { label: 'Protein', val: 64, goal: 100, unit: 'g', pct: 64, color: '#2dd4bf' },
          { label: 'Carbs', val: 190, goal: 300, unit: 'g', pct: 63, color: '#a3e635' },
          { label: 'Fat', val: 38, goal: 70, unit: 'g', pct: 54, color: '#f59e0b' },
        ].map((m, i) => (
          <div key={i} className={s.macroCard}>
            <Ring pct={m.pct} size={72} stroke={6} color={m.color}>
              <span className={s.ringPct} style={{ color: m.color }}>{m.pct}%</span>
            </Ring>
            <div className={s.macroInfo}>
              <div className={s.macroLabel}>{m.label}</div>
              <div className={s.macroVal}>{m.val}<span>/{m.goal}{m.unit}</span></div>
            </div>
          </div>
        ))}
      </div>

      {/* Two columns */}
      <div className={s.twoCol}>
        {/* Alerts */}
        <div className={s.card}>
          <div className={s.cardHead}><span>Cảnh báo & Gợi ý</span></div>
          <div className={s.alertList}>
            {ALERTS.map((a, i) => (
              <div key={i} className={`${s.alertItem} ${s['alert_'+a.type]}`} style={{borderLeft: '4px solid currentColor'}}>
                <span>{a.msg}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly chart */}
        <div className={s.card}>
          <div className={s.cardHead}><span>Calo tuần này</span></div>
          <BarChart data={WEEK_CALO} labels={WEEK_LABELS} goal={1800} />
          <div className={s.chartLegend}>
            <span className={s.legendDot} style={{ background: '#4ade80' }} /> Calo ăn
            <span className={s.legendDot} style={{ background: 'rgba(239,68,68,.6)', marginLeft: '1rem' }} /> Vượt mục tiêu
            <span className={s.legendLine} /> Mục tiêu ({user?.calories}kcal)
          </div>
        </div>
      </div>

      {/* AI Suggestions */}
      <div className={s.card}>
        <div className={s.cardHead}><span>Gợi ý thực đơn tối</span></div>
        <div className={s.suggGrid}>
          {SUGGESTIONS.map((m, i) => (
            <div key={i} className={s.suggCard}>
              <div style={{display:'flex', gap:'12px', marginBottom:'8px'}}>
                <img src={m.image} style={{width:'48px', height:'48px', borderRadius:'8px', objectFit:'cover'}} alt={m.name} />
                <div>
                  <div className={s.suggName} style={{fontWeight: 600, fontSize:'0.95rem'}}>{m.name}</div>
                  <div className={s.suggMatch} style={{fontSize: '0.8rem', color:'#4ade80'}}>Phù hợp {m.match}%</div>
                </div>
              </div>
              <div className={s.suggMeta}>{m.calo} kcal · {m.protein}g protein</div>
              <div className={s.suggTag}>{m.tag}</div>
              <button className={s.suggAdd}>Thêm vào thực đơn</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function MealsTab() {
  return (
    <div className={`${s.tabContent} page-enter`}>
      <div className={s.tabHeader}>
        <h2>Bữa ăn hôm nay</h2>
        <button className={`btn btn-primary ${s.addBtn}`}><IconPlus /> Thêm bữa ăn</button>
      </div>
      <div className={s.mealsList} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {MEALS_TODAY.map((m, i) => (
          <div key={i} className={s.mealItem} style={{ 
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
              padding: '16px', background: 'var(--bg)', borderRadius: '16px', 
              border: '1px solid var(--border2)', boxShadow: '0 2px 5px rgba(0,0,0,0.02)'
            }}>
            <div className={s.mealLeft} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <img src={m.image} alt={m.name} style={{ width: '72px', height: '72px', borderRadius: '12px', objectFit: 'cover' }} />
              <div>
                <div className={s.mealItemName} style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--t1)', marginBottom: '4px' }}>{m.name}</div>
                <div className={s.mealItemMeta} style={{ color: 'var(--t2)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ background: m.color + '20', color: m.color, padding: '2px 8px', borderRadius: '6px', fontWeight: 500, fontSize: '0.8rem' }}>{m.type}</span>
                  <span>{m.time}</span>
                </div>
              </div>
            </div>
            <div className={s.mealRight} style={{ textAlign: 'right' }}>
              <div className={s.mealCalo} style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--t1)' }}>{m.calo} <span style={{fontSize:'0.85rem', fontWeight:400, color:'var(--t2)'}}>kcal</span></div>
              <div className={s.mealProt} style={{ color: '#0284c7', fontSize: '0.9rem', fontWeight: 500, marginTop: '2px' }}>{m.protein}g protein</div>
            </div>
          </div>
        ))}
      </div>
      <div className={s.card} style={{ marginTop: '1.5rem' }}>
        <div className={s.cardHead}><span> Gợi ý bữa tối</span></div>
        <div className={s.suggGrid} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {SUGGESTIONS.map((m, i) => (
            <div key={i} className={s.suggCard} style={{ 
              padding: '16px', borderRadius: '16px', border: '1px solid var(--border2)', 
              background: 'var(--bg)', display: 'flex', gap: '16px', alignItems: 'center' 
            }}>
              <img src={m.image} alt={m.name} style={{ width: '64px', height: '64px', borderRadius: '12px', objectFit: 'cover' }} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <div className={s.suggName} style={{ fontWeight: 600, color: 'var(--t1)' }}>{m.name}</div>
                  <div className={s.suggMatch} style={{ color: '#4ade80', fontWeight: 700 }}>{m.match}%</div>
                </div>
                <div className={s.suggMeta} style={{ fontSize: '0.9rem', color: 'var(--t2)', marginBottom: '8px' }}>{m.calo} kcal · {m.protein}g protein</div>
                <button className={s.suggAdd} style={{
                  width: '100%', padding: '8px', border: '1px dashed var(--g500)', 
                  color: 'var(--g500)', background: 'transparent', borderRadius: '8px', 
                  cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, display: 'flex', 
                  alignItems: 'center', justifyContent: 'center', gap: '6px'
                }}><IconPlus /> Thêm</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function TrackingTab() {
  // Thay thế dữ liệu cứng bằng State và useEffect gọi API
  const [metrics, setMetrics] = useState([
    { label: 'Bước chân', val: '0', goal: '10.000', unit: 'bước', pct: 0, color: '#4ade80', icon: '🚶' },
    { label: 'Giấc ngủ', val: '--', goal: '8h', unit: '', pct: 0, color: '#2dd4bf', icon: '🌙' },
    { label: 'Nước uống', val: '0L', goal: '2L', unit: '', pct: 0, color: '#a3e635', icon: '💧' },
    { label: 'Nhịp tim', val: '--', goal: '60-100', unit: 'bpm', pct: 0, color: '#f59e0b', icon: '❤️' },
  ]);

  useEffect(() => {
    // Giả lập gọi API lấy dữ liệu thực tế từ Backend (đã sync từ vòng tay)
    const fetchTracking = async () => {
        // const res = await fetch('/api/v1/wearable/latest');
        // const data = await res.json();
        
        // Cập nhật State tại đây. Ví dụ dữ liệu giả lập sau khi fetch:
        setTimeout(() => {
             setMetrics(prev => prev.map(m => m.label === 'Nhịp tim' ? {...m, val: '85', pct: 85} : m));
        }, 1000);
    };
    fetchTracking();
  }, []);

  return (
    <div className={`${s.tabContent} page-enter`}>
      <div className={s.tabHeader} style={{marginBottom: '1.5rem'}}><h2>Tracking sức khoẻ</h2></div>
      
      {/* Grid: Metrics */}
      <div className={s.trackGrid} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        {metrics.map((m, i) => (
          <div key={i} className={s.trackCard} style={{
              background: 'var(--bg)', borderRadius: '16px', border: '1px solid var(--border2)',
              padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02)'
            }}>
            <div className={s.trackTop} style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', width: '100%'}}>
              <span className={s.trackIcon} style={{fontSize: '1.5rem'}}>{m.icon}</span>
              <div className={s.trackLabel} style={{fontWeight: 600, color: 'var(--t2)', fontSize: '1rem'}}>{m.label}</div>
            </div>
            
            <Ring pct={m.pct} size={120} stroke={10} color={m.color}>
              <div className={s.trackRingVal} style={{fontSize: '1.5rem', fontWeight: 800, color: 'var(--t1)'}}>{m.pct}%</div>
            </Ring>

            <div style={{marginTop: '16px', textAlign: 'center'}}>
              <div className={s.trackVal} style={{fontSize: '1.8rem', fontWeight: 800, color: 'var(--t1)'}}>{m.val}</div>
              <div className={s.trackGoal} style={{fontSize: '0.9rem', color: 'var(--t2)', marginTop: '4px'}}>Mục tiêu: {m.goal} {m.unit}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Grid: Charts & Devices */}
      <div className={s.twoCol} style={{ marginTop: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
        
        {/* Calorie Chart */}
        <div className={s.card} style={{
           background: 'var(--bg)', borderRadius: '16px', border: '1px solid var(--border2)', padding: '24px'
        }}>
          <div className={s.cardHead} style={{marginBottom: '20px', fontWeight: 600, fontSize: '1.1rem', color: 'var(--t1)'}}><span>Calo tiêu thụ tuần này</span></div>
          <BarChart data={WEEK_CALO} labels={WEEK_LABELS} goal={1800} />
          <div className={s.chartLegend} style={{display:'flex', justifyContent:'center', gap:'20px', marginTop:'20px', fontSize:'0.9rem', color:'var(--t2)'}}>
             <div style={{display:'flex', alignItems:'center', gap:'8px'}}><span style={{width:'10px', height:'10px', borderRadius:'50%', background:'#4ade80'}}></span>Calo nạp</div>
             <div style={{display:'flex', alignItems:'center', gap:'8px'}}><span style={{width:'20px', height:'2px', background:'var(--t2)'}}></span>Mục tiêu</div>
          </div>
        </div>
        
        {/* Devices */}
        <div className={s.card} style={{
           background: 'var(--bg)', borderRadius: '16px', border: '1px solid var(--border2)', padding: '24px'
        }}>
          <div className={s.cardHead} style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
            <span style={{fontWeight: 600, fontSize: '1.1rem', color: 'var(--t1)'}}>Thiết bị kết nối</span>
            
          </div>
          <div className={s.deviceList} style={{display:'flex', flexDirection:'column', gap:'12px'}}>
            {[
               ['','Điện thoại','Đã đồng bộ','#4ade80'],
               ['','Apple Watch Series 8','Đã đồng bộ','#4ade80'],
               ['','Vòng tay bác sĩ','Chưa kết nối','#9ca3af']
            ].map(([ic,n,st,c], i)=>(
              <div key={i} className={s.deviceRow} style={{
                display:'flex', alignItems:'center', padding:'16px', background:'var(--bg2)', borderRadius:'12px', border:'1px solid var(--border2)'
              }}>
                <span className={s.deviceIcon} style={{fontSize:'1.5rem', marginRight:'16px'}}>{ic}</span>
                <span className={s.deviceName} style={{flex:1, fontWeight:600, color:'var(--t1)'}}>{n}</span>
                <span className={s.deviceStatus} style={{color:c, fontWeight:500, fontSize:'0.9rem'}}>● {st}</span>
              </div>
            ))}
          </div>
          <button style={{width:'100%', marginTop:'20px', padding:'12px', borderRadius:'12px', border:'1px dashed var(--g500)', color:'var(--g500)', background:'transparent', fontWeight:600, cursor:'pointer'}}>
            + Thêm thiết bị mới
          </button>
        </div>
      </div>
    </div>
  )
}

function AnalyticsTab() {
  return (
    <div className={`${s.tabContent} page-enter`}>
      <div className={s.tabHeader} style={{marginBottom: '1.5rem'}}><h2>Phân tích dinh dưỡng</h2></div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
        {/* Calorie Chart */}
        <div className={s.card} style={{ gridColumn: '1 / -1' }}>
          <div className={s.cardHead}><span>Lượng calo 7 ngày qua</span></div>
          <BarChart data={WEEK_CALO} labels={WEEK_LABELS} goal={1800} />
          <div className={s.chartLegend} style={{display:'flex', justifyContent:'center', gap:'20px', marginTop:'20px', fontSize:'0.9rem', color:'var(--t2)'}}>
             <div style={{display:'flex', alignItems:'center', gap:'8px'}}><span style={{width:'10px', height:'10px', borderRadius:'50%', background:'#4ade80'}}></span>Calo nạp</div>
             <div style={{display:'flex', alignItems:'center', gap:'8px'}}><span style={{width:'10px', height:'10px', borderRadius:'50%', background:'rgba(239,68,68,.7)'}}></span>Vượt mục tiêu</div>
             <div style={{display:'flex', alignItems:'center', gap:'8px'}}><span style={{width:'20px', height:'2px', background:'var(--t2)'}}></span>Mục tiêu</div>
          </div>
        </div>

        {/* Macro Breakdown */}
        <div className={s.card}>
          <div className={s.cardHead}><span>Phân bổ dinh dưỡng TB</span></div>
          <div className={s.macroBreakdown} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '1rem' }}>
            {[['Carbs','52%','#a3e635'],['Protein','26%','#4ade80'],['Fat','22%','#2dd4bf']].map(([l,v,c])=>(
              <div key={l} className={s.mbRow} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ width: '70px', color: 'var(--t2)', fontSize: '0.9rem' }}>{l}</span>
                <div className={s.mbBar} style={{ flex: 1, background: 'var(--bg2)', borderRadius: '99px', height: '12px', overflow: 'hidden' }}>
                  <div style={{width:v,background:c,height:'100%',borderRadius:'99px',transition:'width 1s ease'}} />
                </div>
                <span style={{color:c,fontWeight:700, width: '40px', textAlign: 'right' }}>{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* AI Review */}
        <div className={s.card}>
          <div className={s.cardHead}><span>Nhận xét từ AI</span></div>
          <div className={s.aiReview} style={{ display: 'flex', gap: '16px', marginTop: '1rem' }}>
            <div className={s.aiAvatar} style={{
              background: 'var(--g500)', color: 'white', width: '48px', height: '48px',
              borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.5rem', flexShrink: 0
            }}>🤖</div>
            <div className={s.aiText} style={{ color: 'var(--t2)', lineHeight: 1.6, fontSize: '0.95rem' }}>
              <p>Dựa trên dữ liệu 7 ngày qua, bạn đang ăn <strong>đủ calo</strong> nhưng thiếu protein khoảng <strong>15–20g/ngày</strong>. Thứ 7 hôm qua vượt mục tiêu 300kcal.</p>
              <p style={{ marginTop: '0.5rem', background: 'var(--bg2)', padding: '8px 12px', borderRadius: '8px' }}>
                <strong>Gợi ý:</strong> Thêm 1 quả trứng vào bữa sáng và uống 1 ly sữa tách béo buổi tối để đạt mục tiêu protein.
              </p>
            </div>
          </div>
        </div>

        {/* 30-day Trends */}
        <div className={s.card} style={{ gridColumn: '1 / -1' }}>
          <div className={s.cardHead}><span>Xu hướng 30 ngày</span></div>
          <div className={s.trendGrid} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginTop: '1rem' }}>
            {[
              ['Cân nặng','68.5 kg','↓ 1.2kg',true],
              ['BMI','22.4','↓ 0.4',true],
              ['Tỷ lệ cơ','32%','↑ 1.1%',true],
              ['Điểm sức khoẻ','87/100','↑ 5',true]
            ].map(([l,v,ch,up])=>(
              <div key={l} className={s.trendCard} style={{ background: 'var(--bg2)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border2)' }}>
                <div className={s.trendLabel} style={{ color: 'var(--t2)', fontSize: '0.9rem', marginBottom: '8px' }}>{l}</div>
                <div className={s.trendVal} style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--t1)', marginBottom: '4px' }}>{v}</div>
                <div className={s.trendChange} style={{color: up ? '#4ade80' : '#f87171', fontWeight: 600}}>{ch}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function ChallengesTab() {
  return (
    <div className={`${s.tabContent} page-enter`}>
      <div className={s.tabHeader} style={{marginBottom: '1.5rem'}}><h2>Thử thách sức khoẻ</h2></div>
      <div className={s.challengeList} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {CHALLENGES.map((c, i) => (
          <div key={i} className={`${s.challengeCard} ${c.done ? s.challengeDone : ''}`} style={{
            background: 'var(--bg)', border: '1px solid var(--border2)', borderRadius: '16px', padding: '20px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px',
            opacity: c.done ? 0.7 : 1, transition: 'all 0.3s ease'
          }}>
            <div className={s.challengeLeft} style={{ flex: 1 }}>
              <div className={s.challengeTitle} style={{ fontWeight: 600, color: 'var(--t1)', fontSize: '1.05rem', marginBottom: '12px' }}>{c.title}</div>
              <div className={s.challengeProgress} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className={s.progBar} style={{ flex: 1, height: '8px', background: 'var(--bg2)', borderRadius: '99px' }}>
                  <div className={s.progFill} style={{ width: `${(c.progress / c.total) * 100}%`, height: '100%', background: 'var(--g500)', borderRadius: '99px', transition: 'width 0.5s ease' }} />
                </div>
                <span style={{ fontSize: '0.85rem', color: 'var(--t2)', fontWeight: 500 }}>{c.progress}/{c.total} ngày</span>
              </div>
            </div>
            <div className={s.challengeRight} style={{ textAlign: 'right' }}>
              <div className={s.challengeReward} style={{
                background: c.done ? '#16a34a20' : 'var(--g500-10)',
                color: c.done ? '#16a34a' : 'var(--g500)',
                padding: '6px 12px', borderRadius: '8px', fontWeight: 600, fontSize: '0.9rem'
              }}>{c.reward}</div>
              {c.done && <span className={s.challengeCheckmark} style={{ color: '#16a34a', fontWeight: 800, fontSize: '1.2rem', marginTop: '8px', display: 'block' }}><IconCheck /></span>}
            </div>
          </div>
        ))}
      </div>

      <div className={s.card} style={{ marginTop: '2rem' }}>
        <div className={s.cardHead}><span>🏆 Bảng xếp hạng tuần này</span></div>
        <div className={s.leaderboard} style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '1rem' }}>
          {LEADERBOARD.map((u, i) => (
            <div key={i} className={s.lbRow} style={{
              display: 'flex', alignItems: 'center', gap: '16px', padding: '12px 16px',
              borderRadius: '12px', background: i === 0 ? 'var(--g500-10)' : 'var(--bg2)',
              border: '1px solid', borderColor: i === 0 ? 'var(--g500)' : 'var(--border2)'
            }}>
              <div className={s.lbRank} style={{
                color: i === 0 ? '#f59e0b' : i === 1 ? '#9ca3af' : i === 2 ? '#b45309' : 'var(--t2)',
                fontWeight: 700, fontSize: '1rem', width: '30px'
              }}>#{u.rank}</div>
              <div className={s.lbAvatar} style={{
                width: '40px', height: '40px', borderRadius: '50%', background: 'var(--g500)',
                color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 600, border: '2px solid white'
              }}>{u.avatar}</div>
              <div className={s.lbName} style={{ flex: 1, fontWeight: 600, color: 'var(--t1)' }}>{u.name}</div>
              <div className={s.lbPts} style={{ fontWeight: 700, color: 'var(--g500)' }}>{u.pts.toLocaleString()} điểm</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ─ Dashboard shell ───────────────────────────────────────────────────── */
export default function Dashboard() {
  const { user, logout } = useAuth()
  const nav = useNavigate()
  const [tab, setTab] = useState('home')
  const [sideOpen, setSideOpen] = useState(false)

  useEffect(() => { if (!user) nav('/login') }, [user, nav])
  if (!user) return null

  const handleLogout = () => { logout(); nav('/') }

  const CONTENT = {
    home: <Overview user={user} />,
    meals: <MealsTab />,
    tracking: <TrackingTab />,
    analytics: <AnalyticsTab />,
    challenges: <ChallengesTab />,
    doctor: <DoctorChat />,
  }

  return (
    <div className={s.shell}>
      {/* Sidebar */}
      <aside className={`${s.sidebar} ${sideOpen ? s.sideOpen : ''}`}>
        <div className={s.sideTop}>
          <Link to="/" className={s.sideLogo} style={{ textDecoration: 'none', color: 'var(--g500)', fontWeight: 800, fontSize: '1.4rem', marginBottom: '2.5rem', display: 'block', textAlign: 'center' }}>
            NutriAI
          </Link>
          <div className={s.userCard} style={{ display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid var(--border2)', borderRadius: 'var(--rx)', padding: '12px', marginBottom: '2rem' }}>
            <div className={s.userAvatar} style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--g500)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{user.avatar}</div>
            <div className={s.userInfo}>
              <div className={s.userName}>{user.name}</div>
              <div className={s.userGoal}>{user.goal}</div>
            </div>
          </div>
          <nav className={s.sideNav}>
            {NAV_ITEMS.map(item => (
              <button
                key={item.id}
                className={`${s.navItem} ${tab === item.id ? s.navActive : ''}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '12px',
                  marginBottom: '10px',
                  border: `1px solid ${tab === item.id ? 'var(--g500)' : 'var(--border2)'}`,
                  borderRadius: 'var(--rx)',
                  background: tab === item.id ? 'var(--bg2)' : 'transparent',
                  color: tab === item.id ? 'var(--g500)' : 'var(--t1)',
                  fontWeight: tab === item.id ? 600 : 500,
                  width: '100%',
                  transition: 'all 0.2s ease'
                }}
                onClick={() => { setTab(item.id); setSideOpen(false) }}
              >
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
        <div className={s.sideBot} style={{ marginTop: '2rem', borderTop: '1px solid var(--border2)', paddingTop: '1.5rem' }}>
          <button className={s.navItem} style={{ width: '100%', padding: '10px', marginBottom: '8px', border: '1px solid var(--border2)', borderRadius: 'var(--rx)', background: 'transparent', cursor: 'pointer', color: 'var(--t2)', fontSize: '0.9rem' }}>Thông báo</button>
          <button className={s.navItem} style={{ width: '100%', padding: '10px', marginBottom: '8px', border: '1px solid var(--border2)', borderRadius: 'var(--rx)', background: 'transparent', cursor: 'pointer', color: 'var(--t2)', fontSize: '0.9rem' }}>Cài đặt</button>
          <button className={`${s.navItem} ${s.logoutBtn}`} onClick={handleLogout} 
            style={{ width: '100%', padding: '10px', border: '1px solid #fee2e2', borderRadius: 'var(--rx)', background: '#fef2f2', color: '#ef4444', fontWeight: 600, cursor: 'pointer' }}>Đăng xuất</button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sideOpen && <div className={s.overlay} onClick={() => setSideOpen(false)} />}

      {/* Main content */}
      <main className={s.main}>
        {/* Topbar */}
        <header className={s.topbar}>
          <button className={s.menuBtn} onClick={() => setSideOpen(!sideOpen)}>
            <span /><span /><span />
          </button>
          <div className={s.topTitle}>
            {NAV_ITEMS.find(n => n.id === tab)?.label || 'Dashboard'}
          </div>
          <div className={s.topRight}>
            <div className={s.pointsBadge}><IconTrophy /><span>1.240 điểm</span></div>
            <div className={s.topAvatar} style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--g500)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '0.9rem' }}>{user.avatar}</div>
          </div>
        </header>

        <div className={s.content}>
          {CONTENT[tab]}
        </div>
      </main>
    </div>
  )
}
