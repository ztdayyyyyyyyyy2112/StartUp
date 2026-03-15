import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from './useAuth'
import { IconMail, IconLock, IconUser, IconEye, IconEyeOff, IconArrow } from './Icons'
import s from './Login.module.css'

export default function Login() {
  const [params] = useSearchParams()
  const [mode, setMode] = useState(params.get('mode') === 'register' ? 'register' : 'login')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', email: 'demo111@gmail.com', password: '1234' })
  const { login, register, user } = useAuth()
  const nav = useNavigate()

  useEffect(() => { if (user) nav('/dashboard') }, [user, nav])

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setError('') }

  const submit = async (e) => {
    e.preventDefault(); setError('')
    if (!form.email || !form.password) { setError('Vui lòng điền đầy đủ thông tin.'); return }
    if (form.password.length < 4) { setError('Mật khẩu phải ít nhất 4 ký tự.'); return }
    setLoading(true)
    await new Promise(r => setTimeout(r, 900)) // simulate network
    if (mode === 'login') {
      const ok = login(form.email, form.password)
      if (ok) nav('/dashboard')
      else setError('Email hoặc mật khẩu không đúng.')
    } else {
      if (!form.name.trim()) { setError('Vui lòng nhập tên của bạn.'); setLoading(false); return }
      register(form.name, form.email)
      nav('/dashboard')
    }
    setLoading(false)
  }

  return (
    <div className={s.page} style={{ display: 'flex', minHeight: '100vh', width: '100%', background: 'var(--bg)' }}>
      {/* Left panel */}
      <div className={s.left} style={{ flex: '1 1 50%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 8%', background: 'var(--bg2)', borderRight: '1px solid var(--border2)' }}>
        <Link to="/" className={s.backLogo} style={{ textDecoration: 'none', marginBottom: '2.5rem', display: 'inline-block' }}>
          <span style={{color: 'var(--g500)', fontWeight: 800, fontSize: '1.5rem'}}>NutriAI</span>
        </Link>
        <div className={s.leftContent} style={{ maxWidth: '460px' }}>
          <div className="tag" style={{ marginBottom: '1.5rem', background: 'rgba(2, 132, 199, 0.1)', color: 'var(--g500)' }}>Nền tảng Y tế Số</div>
          <h2 className={s.leftTitle} style={{ fontSize: '2.8rem', fontWeight: 800, lineHeight: 1.2, color: 'var(--t1)', marginBottom: '1.5rem' }}>Giải pháp Dinh dưỡng<br /><span style={{color: 'var(--g500)'}}>Chuẩn Khoa học</span><br />cho người Việt</h2>
          <p className={s.leftSub} style={{ fontSize: '1.15rem', lineHeight: 1.6, color: 'var(--t2)', marginBottom: '2rem' }}>Hệ thống phân tích chỉ số cơ thể, cảnh báo tương tác thực phẩm và gợi ý thực đơn chuyên sâu từ chuyên gia.</p>
          <div className={s.features}>
            {['Phân tích dinh dưỡng cá nhân hóa', 'Cảnh báo dị ứng & tương tác thuốc', 'Theo dõi chỉ số sức khỏe realtime', 'Kết nối hệ sinh thái y tế'].map(f => (
              <div key={f} className={s.feat}>
                <span className={s.featDot} style={{background: 'var(--g500)'}} />
                <span>{f}</span>
              </div>
            ))}
          </div>
          <div className={s.avatarRow} style={{ display: 'flex', alignItems: 'center', marginTop: '2.5rem' }}>
            {['L','M','T','P','A'].map((a, i) => (
              <div key={i} className={s.avatar} style={{ marginLeft: i > 0 ? '-12px' : 0, width: '40px', height: '40px', borderRadius: '50%', border: '2px solid white', background: 'var(--g500)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '0.85rem' }}>{a}</div>
            ))}
            <span className={s.avatarText} style={{ marginLeft: '12px', fontSize: '0.95rem', color: 'var(--t2)', fontWeight: 500 }}>+2.400 người đang dùng</span>
          </div>
        </div>
      </div>

      {/* Right panel - form */}
      <div className={s.right} style={{ flex: '1 1 50%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
        <div className={s.formWrap} style={{ width: '100%', maxWidth: '400px' }}>
          <div className={s.formHeader} style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--t1)', marginBottom: '0.5rem' }}>{mode === 'login' ? 'Chào mừng trở lại' : 'Tạo tài khoản'}</h1>
            <p style={{ color: 'var(--t2)', fontSize: '1rem', lineHeight: '1.5' }}>{mode === 'login' ? 'Đăng nhập để tiếp tục hành trình sức khoẻ.' : 'Bắt đầu miễn phí, không cần thẻ tín dụng.'}</p>
          </div>

          {/* Social buttons */}
          <div className={s.socials} style={{ display: 'flex', gap: '12px', marginBottom: '1.5rem' }}>
            {[['G', '#ea4335', 'Google'], ['F', '#1877f2', 'Facebook']].map(([icon, color, name]) => (
              <button key={name} className={s.socialBtn} type="button" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px', border: '1.5px solid #cbd5e1', borderRadius: 'var(--rx)', background: 'white', cursor: 'pointer', fontSize: '0.95rem', fontWeight: 500, color: 'var(--t1)' }}>
                <span style={{ color, fontWeight: 700, marginRight: '8px' }}>{icon}</span>
                <span>{name}</span>
              </button>
            ))}
          </div>

          <div className={s.divider}><span>hoặc</span></div>

          <form onSubmit={submit} className={s.form}>
            {mode === 'register' && (
              <div className={s.field}>
                <label style={{fontWeight: 500, fontSize: '0.9rem', color: 'var(--t2)'}}>Họ và tên</label>
                <div className={s.inputWrap}>
                  <input
                    type="text" placeholder="Nguyễn Văn A"
                    value={form.name} onChange={e => set('name', e.target.value)}
                    className={s.input} style={{ width: '100%', padding: '12px', border: '1px solid var(--border2)', borderRadius: 'var(--rx)', marginTop: '4px', color: 'var(--t1)' }}
                  />
                </div>
              </div>
            )}

            <div className={s.field}>
              <label style={{fontWeight: 500, fontSize: '0.9rem', color: 'var(--t2)'}}>Email công việc / cá nhân</label>
              <div className={s.inputWrap}>
                <input
                  type="email" placeholder="email@example.com"
                  value={form.email} onChange={e => set('email', e.target.value)}
                  className={s.input} style={{ width: '100%', padding: '12px', border: '1px solid var(--border2)', borderRadius: 'var(--rx)', marginTop: '4px', color: 'var(--t1)' }}
                />
              </div>
            </div>

            <div className={s.field}>
              <label style={{fontWeight: 500, fontSize: '0.9rem', color: 'var(--t2)'}}>Mật khẩu</label>
              <div className={s.inputWrap} style={{ position: 'relative', display: 'flex', alignItems: 'center', marginTop: '4px' }}>
                <input
                  type={showPw ? 'text' : 'password'} placeholder="••••••••"
                  value={form.password} onChange={e => set('password', e.target.value)}
                  className={s.input} style={{ width: '100%', padding: '12px', paddingRight: '45px', border: '1px solid var(--border2)', borderRadius: 'var(--rx)', color: 'var(--t1)' }}
                />
                <button type="button" className={s.pwToggle} onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: '12px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                  {showPw ? <IconEyeOff /> : <IconEye />}
                </button>
              </div>
            </div>

            {mode === 'login' && (
              <div className={s.forgotRow}>
                <a href="#" className={s.forgot}>Quên mật khẩu?</a>
              </div>
            )}

            {error && <div className={s.errorMsg}>{error}</div>}

            <button type="submit" className={`btn btn-primary ${s.submitBtn}`} disabled={loading} style={{width: '100%', padding: '12px', marginTop: '10px'}}>
              {loading
                ? <span className={s.spinner} />
                : mode === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'
              }
            </button>
          </form>

          <div className={s.switchRow}>
            {mode === 'login' ? (
              <p>Chưa có tài khoản?{' '}
                <button type="button" className={s.switchBtn} onClick={() => setMode('register')} style={{color: 'var(--g500)', fontWeight: 600}}>Đăng ký ngay</button>
              </p>
            ) : (
              <p>Đã có tài khoản?{' '}
                <button type="button" className={s.switchBtn} onClick={() => setMode('login')} style={{color: 'var(--g500)', fontWeight: 600}}>Đăng nhập</button>
              </p>
            )}
          </div>

          <p className={s.terms}>
            Bằng cách tiếp tục, bạn đồng ý với{' '}
            <a href="#">Điều khoản dịch vụ</a> và <a href="#">Chính sách bảo mật</a> của chúng tôi.
          </p>
        </div>
      </div>
    </div>
  )
}
