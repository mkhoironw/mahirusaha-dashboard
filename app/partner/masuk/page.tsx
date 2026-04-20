'use client'
import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function PartnerMasuk() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async () => {
    if (!form.email || !form.password) { setError('Harap isi email dan password'); return }
    setLoading(true)
    setError('')
    try {
      // Cek di tabel partners
      const { data: partner } = await supabase
        .from('partners')
        .select('*')
        .eq('email', form.email)
        .eq('password', form.password)
        .single()

      if (!partner) {
        setError('Email atau password salah')
        setLoading(false)
        return
      }

      if (partner.status === 'pending') {
        setError('Akun partner kamu sedang dalam proses review. Tim kami akan menghubungi kamu dalam 24 jam.')
        setLoading(false)
        return
      }

      if (partner.status === 'ditolak') {
        setError('Pendaftaran partner kamu tidak disetujui. Hubungi tim kami untuk info lebih lanjut.')
        setLoading(false)
        return
      }

      // Simpan session partner
      localStorage.setItem('mahirusaha_partner', JSON.stringify({
        id: partner.id,
        nama: partner.nama_lengkap,
        email: partner.email,
        komisi_persen: partner.komisi_persen || 15,
        referral_code: partner.referral_code,
      }))

      window.location.href = '/partner/dashboard'

    } catch (err) {
      console.error(err)
      setError('Terjadi kesalahan. Coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#fff',
    padding: '13px 16px',
    borderRadius: '10px',
    fontSize: '0.875rem',
    fontFamily: 'inherit',
    outline: 'none',
    transition: 'border 0.2s',
  }

  return (
    <main style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: '#070d1a', color: '#fff', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input:focus { outline: none; border-color: rgba(129,140,248,0.5) !important; }
        input::placeholder { color: rgba(255,255,255,0.25); }
      `}</style>

      {/* Nav */}
      <nav style={{ padding: '0 5%', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <a href="/partner" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: '#fff' }}>
          <div style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg,#25d366,#128c7e)', borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px' }}>💬</div>
          <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>Mahirusaha</span>
          <span style={{ background: 'rgba(129,140,248,0.15)', color: '#818cf8', fontSize: '0.7rem', fontWeight: 700, padding: '3px 10px', borderRadius: '100px' }}>Partner</span>
        </a>
        <a href="/partner/daftar" style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>Belum punya akun? Daftar →</a>
      </nav>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🤝</div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '8px' }}>Masuk Dashboard Partner</h1>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem' }}>Pantau komisi dan klien referral kamu</p>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', padding: '28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {error && (
              <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '12px 16px', fontSize: '0.82rem', color: '#EF4444', lineHeight: 1.6 }}>
                ❌ {error}
              </div>
            )}

            <div>
              <label style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>Email</label>
              <input type="email" style={inputStyle} placeholder="email@kamu.com" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} onKeyDown={e => e.key === 'Enter' && handleLogin()} />
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>Password</label>
              <input type="password" style={inputStyle} placeholder="••••••••" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} onKeyDown={e => e.key === 'Enter' && handleLogin()} />
            </div>

            <button onClick={handleLogin} disabled={loading} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg,#818cf8,#6366f1)', color: '#fff', fontWeight: 700, fontSize: '0.95rem', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: loading ? 0.7 : 1, marginTop: '8px' }}>
              {loading ? '⏳ Memverifikasi...' : '🔐 Masuk Dashboard'}
            </button>

            <div style={{ textAlign: 'center', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)' }}>
                Belum punya akun?{' '}
                <a href="/partner/daftar" style={{ color: '#818cf8', fontWeight: 600, textDecoration: 'none' }}>Daftar partner</a>
              </p>
            </div>
          </div>

          <div style={{ marginTop: '20px', background: 'rgba(129,140,248,0.06)', border: '1px solid rgba(129,140,248,0.15)', borderRadius: '12px', padding: '14px 16px' }}>
            <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>
              💡 Gunakan email dan password yang kamu daftarkan saat mendaftar partner. Akun partner <strong style={{ color: '#fff' }}>terpisah</strong> dari akun klien Mahirusaha.
            </p>
          </div>

          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <a href="/partner" style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>← Kembali ke halaman partner</a>
          </div>
        </div>
      </div>
    </main>
  )
}
