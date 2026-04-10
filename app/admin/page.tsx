'use client'
import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function AdminLogin() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data: admin } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', form.email.toLowerCase())
        .eq('aktif', true)
        .single()

      if (!admin) {
        setError('Email tidak ditemukan atau akun tidak aktif.')
        setLoading(false)
        return
      }

      if (admin.password_hash !== form.password) {
        setError('Password salah.')
        setLoading(false)
        return
      }

      // Update last_login
      await supabase
        .from('admin_users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', admin.id)

      // Simpan session admin
      localStorage.setItem('mahirusaha_admin', JSON.stringify({
        id: admin.id,
        nama: admin.nama,
        email: admin.email,
        role: admin.role,
      }))

      window.location.href = '/admin/dashboard'

    } catch {
      setError('Terjadi kesalahan. Coba lagi.')
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
  }

  return (
    <main style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: '#070d1a', color: '#fff', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input:focus { border-color: rgba(37,211,102,0.5) !important; outline: none; }
        input::placeholder { color: rgba(255,255,255,0.25); }
      `}</style>

      <div style={{ width: '100%', maxWidth: '400px', padding: '24px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ width: '52px', height: '52px', background: 'linear-gradient(135deg,#25d366,#128c7e)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', margin: '0 auto 16px' }}>⚙️</div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '6px' }}>Admin Mahirusaha</h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>Panel pengelola internal</p>
        </div>

        {/* Form */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '28px' }}>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginBottom: '6px' }}>Email Admin</label>
              <input
                required
                type="email"
                style={inputStyle}
                placeholder="admin@mahirusaha.com"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginBottom: '6px' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  required
                  type={showPassword ? 'text' : 'password'}
                  style={{ ...inputStyle, paddingRight: '48px' }}
                  placeholder="Password admin"
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
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
              <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '10px', padding: '11px 14px', fontSize: '0.82rem', color: '#fca5a5' }}>
                ⚠️ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{ background: loading ? 'rgba(37,211,102,0.4)' : 'linear-gradient(135deg,#25d366,#128c7e)', color: '#fff', padding: '14px', borderRadius: '12px', border: 'none', fontWeight: 700, fontSize: '0.95rem', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', marginTop: '4px' }}
            >
              {loading ? 'Memproses...' : 'Masuk ke Panel Admin →'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.75rem', color: 'rgba(255,255,255,0.2)' }}>
          Akses terbatas — hanya untuk tim internal Mahirusaha
        </p>
      </div>
    </main>
  )
}
