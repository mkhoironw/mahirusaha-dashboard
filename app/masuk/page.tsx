'use client'
import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Masuk() {
  const [mode, setMode] = useState<'login' | 'lupa'>('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)

  const update = (field: string, value: string) =>
    setForm(p => ({ ...p, [field]: value }))

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Cek email dan password di tabel clients
      const { data: client, error: err } = await supabase
        .from('clients')
        .select('*')
        .eq('email', form.email.toLowerCase())
        .single()

      if (err || !client) {
        setError('Email tidak terdaftar. Silakan daftar terlebih dahulu.')
        setLoading(false)
        return
      }

      // Cek password (sementara plain text, nanti pakai bcrypt)
      if (client.password_hash !== form.password) {
        setError('Password salah. Silakan coba lagi.')
        setLoading(false)
        return
      }

      // Cek status akun
	  // JANGAN blokir suspend — biarkan login agar bisa perpanjang
	  if (client.status === 'nonaktif') {
		setError('Akun kamu tidak aktif. Hubungi support@mahirusaha.com')
		setLoading(false)
		return
	  }

      // Simpan session di localStorage
      localStorage.setItem('mahirusaha_client', JSON.stringify({
        id: client.id,
        nama: client.nama_pemilik,
        email: client.email,
        status: client.status,
        paket: client.paket,
      }))

      // Update last_login
      await supabase
        .from('clients')
        .update({ last_login: new Date().toISOString() })
        .eq('id', client.id)

      // Redirect ke dashboard
      window.location.href = '/dashboard'

    } catch {
      setError('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  const handleLupaPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data: client } = await supabase
        .from('clients')
        .select('id, email')
        .eq('email', form.email.toLowerCase())
        .single()

      if (!client) {
        setError('Email tidak ditemukan.')
        setLoading(false)
        return
      }

      // Generate reset token
      const token = Math.random().toString(36).substring(2) + Date.now().toString(36)
      const expires = new Date(Date.now() + 3600000).toISOString() // 1 jam

      await supabase
        .from('clients')
        .update({
          reset_password_token: token,
          reset_password_expires: expires
        })
        .eq('id', client.id)

      // TODO: kirim email reset password
      setSuccess('Link reset password sudah dikirim ke email kamu. Cek inbox atau spam.')

    } catch {
      setError('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.12)',
    color: '#fff',
    padding: '13px 16px',
    borderRadius: '10px',
    fontSize: '0.9rem',
    fontFamily: 'inherit',
    outline: 'none',
    transition: 'border-color 0.2s',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.82rem',
    fontWeight: 600,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: '6px',
  }

  return (
    <main style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: '#070d1a', color: '#fff', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input { transition: border-color 0.2s; }
        input:focus { border-color: rgba(37,211,102,0.5) !important; outline: none; }
        input::placeholder { color: rgba(255,255,255,0.25); }
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .fadeUp { animation: fadeUp 0.5s ease forwards; }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        .btn-primary { transition: opacity 0.2s, transform 0.1s; }
        .btn-primary:hover { opacity: 0.9; }
        .btn-primary:active { transform: scale(0.98); }
      `}</style>

      {/* Background glow */}
      <div style={{ position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)', width: '600px', height: '400px', background: 'radial-gradient(circle, rgba(37,211,102,0.06) 0%, transparent 70%)', pointerEvents: 'none' }}/>

      {/* Nav */}
      <nav style={{ padding: '0 5%', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: '#fff' }}>
          <div style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg,#25d366,#128c7e)', borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px' }}>💬</div>
          <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>Mahirusaha</span>
        </a>
        <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)' }}>
          Belum punya akun?{' '}
          <a href="/daftar" style={{ color: '#25d366', textDecoration: 'none', fontWeight: 600 }}>Daftar gratis</a>
        </span>
      </nav>

      {/* Content */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 5%' }}>
        <div className="fadeUp" style={{ width: '100%', maxWidth: '420px' }}>

          {/* Logo besar */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ width: '56px', height: '56px', background: 'linear-gradient(135deg,#25d366,#128c7e)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', margin: '0 auto 16px', animation: 'float 3s ease-in-out infinite' }}>💬</div>
            <h1 style={{ fontSize: '1.7rem', fontWeight: 800, letterSpacing: '-0.5px', marginBottom: '6px' }}>
              {mode === 'login' ? 'Selamat datang kembali' : 'Reset password'}
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.875rem' }}>
              {mode === 'login' ? 'Masuk ke dashboard Mahirusaha kamu' : 'Masukkan email untuk reset password'}
            </p>
          </div>

          {/* Card */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '32px' }}>

            {/* LOGIN FORM */}
            {mode === 'login' && (
              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>Email</label>
                  <input
                    required
                    type="email"
                    style={inputStyle}
                    placeholder="kamu@email.com"
                    value={form.email}
                    onChange={e => update('email', e.target.value)}
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label style={{ ...labelStyle, marginBottom: 0 }}>Password</label>
                    <button
                      type="button"
                      onClick={() => setMode('lupa')}
                      style={{ background: 'none', border: 'none', color: '#25d366', fontSize: '0.78rem', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}
                    >
                      Lupa password?
                    </button>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <input
                      required
                      type={showPassword ? 'text' : 'password'}
                      style={{ ...inputStyle, paddingRight: '48px' }}
                      placeholder="Password kamu"
                      value={form.password}
                      onChange={e => update('password', e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '1rem', padding: 0 }}
                    >
                      {showPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>

                {error && (
                  <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '10px', padding: '11px 14px', fontSize: '0.82rem', color: '#fca5a5', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                    <span style={{ flexShrink: 0 }}>⚠️</span> {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary"
                  style={{ background: loading ? 'rgba(37,211,102,0.4)' : 'linear-gradient(135deg,#25d366,#128c7e)', color: '#fff', padding: '14px', borderRadius: '12px', border: 'none', fontWeight: 700, fontSize: '0.95rem', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', marginTop: '4px' }}
                >
                  {loading ? 'Memproses...' : 'Masuk ke Dashboard →'}
                </button>

                {/* Divider */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '4px 0' }}>
                  <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }}/>
                  <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)' }}>atau</span>
                  <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }}/>
                </div>

                <a
                  href="/daftar"
                  style={{ display: 'block', textAlign: 'center', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', padding: '13px', borderRadius: '12px', textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem' }}
                >
                  Buat akun baru — Gratis 100 pesan
                </a>
              </form>
            )}

            {/* LUPA PASSWORD FORM */}
            {mode === 'lupa' && (
              <form onSubmit={handleLupaPassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {success ? (
                  <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>📧</div>
                    <p style={{ color: '#25d366', fontWeight: 600, marginBottom: '8px' }}>Email terkirim!</p>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', lineHeight: 1.6 }}>{success}</p>
                  </div>
                ) : (
                  <>
                    <div>
                      <label style={labelStyle}>Email akun kamu</label>
                      <input
                        required
                        type="email"
                        style={inputStyle}
                        placeholder="kamu@email.com"
                        value={form.email}
                        onChange={e => update('email', e.target.value)}
                      />
                    </div>

                    {error && (
                      <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '10px', padding: '11px 14px', fontSize: '0.82rem', color: '#fca5a5' }}>
                        ⚠️ {error}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-primary"
                      style={{ background: loading ? 'rgba(37,211,102,0.4)' : 'linear-gradient(135deg,#25d366,#128c7e)', color: '#fff', padding: '14px', borderRadius: '12px', border: 'none', fontWeight: 700, fontSize: '0.95rem', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}
                    >
                      {loading ? 'Mengirim...' : 'Kirim Link Reset Password'}
                    </button>
                  </>
                )}

                <button
                  type="button"
                  onClick={() => { setMode('login'); setError(''); setSuccess('') }}
                  style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}
                >
                  ← Kembali ke login
                </button>
              </form>
            )}
          </div>

          {/* Footer note */}
          <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.75rem', color: 'rgba(255,255,255,0.25)', lineHeight: 1.6 }}>
            Dengan masuk, kamu menyetujui{' '}
            <a href="/syarat" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Syarat Layanan</a>
            {' '}dan{' '}
            <a href="/privasi" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Kebijakan Privasi</a>
          </p>
        </div>
      </div>
    </main>
  )
}
