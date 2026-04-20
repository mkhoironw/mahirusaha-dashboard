'use client'
import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function PartnerDaftar() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    nama_lengkap: '',
    email: '',
    nomor_wa: '',
    domisili: '',
    profesi: '',
    jaringan_umkm: '',
    estimasi_kontak: '',
    alasan: '',
    setuju: false,
  })

  const update = (key: string, value: string | boolean) => setForm(p => ({ ...p, [key]: value }))

  const handleSubmit = async () => {
    if (!form.setuju) { alert('Harap setujui syarat & ketentuan'); return }
    setLoading(true)
    try {
      // Simpan pendaftaran ke database
      const { error } = await supabase.from('partner_applications').insert({
        nama_lengkap: form.nama_lengkap,
        email: form.email,
        nomor_wa: form.nomor_wa.replace(/\D/g, ''),
        domisili: form.domisili,
        profesi: form.profesi,
        jaringan_umkm: form.jaringan_umkm,
        estimasi_kontak: form.estimasi_kontak,
        alasan: form.alasan,
        status: 'pending',
      })

      if (error) throw error

      // Kirim notif ke admin via WA
      await fetch('/api/partner/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nama: form.nama_lengkap, email: form.email, nomor_wa: form.nomor_wa })
      })

      setStep(3) // Success
    } catch (err) {
      console.error(err)
      alert('Terjadi kesalahan. Coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#fff',
    padding: '12px 16px',
    borderRadius: '10px',
    fontSize: '0.875rem',
    fontFamily: 'inherit',
    outline: 'none',
    transition: 'border 0.2s',
  }

  const labelStyle: React.CSSProperties = {
    fontSize: '0.78rem',
    color: 'rgba(255,255,255,0.5)',
    display: 'block',
    marginBottom: '6px',
    fontWeight: 600,
  }

  return (
    <main style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: '#070d1a', color: '#fff', minHeight: '100vh' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input:focus, textarea:focus, select:focus { outline: none; border-color: rgba(129,140,248,0.5) !important; }
        input::placeholder, textarea::placeholder { color: rgba(255,255,255,0.25); }
      `}</style>

      {/* Nav */}
      <nav style={{ padding: '0 5%', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <a href="/partner" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: '#fff' }}>
          <div style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg,#25d366,#128c7e)', borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px' }}>💬</div>
          <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>Mahirusaha</span>
          <span style={{ background: 'rgba(129,140,248,0.15)', color: '#818cf8', fontSize: '0.7rem', fontWeight: 700, padding: '3px 10px', borderRadius: '100px' }}>Partner</span>
        </a>
        <a href="/partner/masuk" style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>Sudah punya akun? Masuk →</a>
      </nav>

      <div style={{ maxWidth: '560px', margin: '0 auto', padding: '48px 24px 80px' }}>

        {/* Header */}
        {step !== 3 && (
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🤝</div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '8px' }}>Daftar Jadi Partner</h1>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem' }}>Isi form di bawah ini — tim kami akan review dalam 24 jam</p>

            {/* Progress */}
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '20px' }}>
              {[1, 2].map(s => (
                <div key={s} style={{ height: '4px', width: '60px', borderRadius: '100px', background: step >= s ? 'linear-gradient(90deg,#818cf8,#6366f1)' : 'rgba(255,255,255,0.1)' }} />
              ))}
            </div>
            <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', marginTop: '8px' }}>Langkah {step} dari 2</p>
          </div>
        )}

        {/* Step 1 - Data Pribadi */}
        {step === 1 && (
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', padding: '28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h2 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '4px' }}>📋 Data Pribadi</h2>

            <div>
              <label style={labelStyle}>Nama Lengkap *</label>
              <input style={inputStyle} placeholder="Mohammad Khoiron" value={form.nama_lengkap} onChange={e => update('nama_lengkap', e.target.value)} />
            </div>

            <div>
              <label style={labelStyle}>Email *</label>
              <input type="email" style={inputStyle} placeholder="email@kamu.com" value={form.email} onChange={e => update('email', e.target.value)} />
            </div>

            <div>
              <label style={labelStyle}>Nomor WhatsApp *</label>
              <input style={inputStyle} placeholder="08123456789" value={form.nomor_wa} onChange={e => update('nomor_wa', e.target.value)} />
            </div>

            <div>
              <label style={labelStyle}>Domisili</label>
              <input style={inputStyle} placeholder="Surabaya, Jawa Timur" value={form.domisili} onChange={e => update('domisili', e.target.value)} />
            </div>

            <div>
              <label style={labelStyle}>Profesi / Pekerjaan</label>
              <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.profesi} onChange={e => update('profesi', e.target.value)}>
                <option value="" style={{ background: '#111827' }}>Pilih profesi...</option>
                {['Pengusaha/UMKM','Konsultan Bisnis','Komunitas/Organisasi','Content Creator/Influencer','Mahasiswa','Karyawan','Lainnya'].map(p => (
                  <option key={p} value={p} style={{ background: '#111827' }}>{p}</option>
                ))}
              </select>
            </div>

            <button
              onClick={() => {
                if (!form.nama_lengkap || !form.email || !form.nomor_wa) { alert('Harap isi semua field wajib'); return }
                setStep(2)
              }}
              style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg,#818cf8,#6366f1)', color: '#fff', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', fontFamily: 'inherit', marginTop: '8px' }}
            >
              Lanjut →
            </button>
          </div>
        )}

        {/* Step 2 - Info Jaringan */}
        {step === 2 && (
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', padding: '28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h2 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '4px' }}>🌐 Info Jaringan UMKM</h2>

            <div>
              <label style={labelStyle}>Jaringan UMKM yang kamu miliki *</label>
              <textarea
                style={{ ...inputStyle, resize: 'none' }}
                rows={3}
                placeholder="Contoh: Saya aktif di komunitas pengusaha muda Surabaya dengan 500+ anggota, juga admin grup WA UMKM Jatim..."
                value={form.jaringan_umkm}
                onChange={e => update('jaringan_umkm', e.target.value)}
              />
            </div>

            <div>
              <label style={labelStyle}>Estimasi jumlah kontak UMKM *</label>
              <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.estimasi_kontak} onChange={e => update('estimasi_kontak', e.target.value)}>
                <option value="" style={{ background: '#111827' }}>Pilih estimasi...</option>
                {['< 50 kontak','50 - 100 kontak','100 - 500 kontak','500 - 1000 kontak','> 1000 kontak'].map(k => (
                  <option key={k} value={k} style={{ background: '#111827' }}>{k}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Mengapa ingin jadi partner Mahirusaha? *</label>
              <textarea
                style={{ ...inputStyle, resize: 'none' }}
                rows={4}
                placeholder="Ceritakan motivasi kamu dan bagaimana rencana kamu untuk mengenalkan Mahirusaha ke jaringan UMKM..."
                value={form.alasan}
                onChange={e => update('alasan', e.target.value)}
              />
            </div>

            {/* Syarat & Ketentuan */}
            <div style={{ background: 'rgba(129,140,248,0.06)', border: '1px solid rgba(129,140,248,0.15)', borderRadius: '12px', padding: '16px' }}>
              <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, marginBottom: '12px' }}>
                Dengan mendaftar sebagai partner Mahirusaha, kamu setuju bahwa:
              </p>
              <ul style={{ paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {[
                  'Komisi 15% dihitung dari harga paket klien yang berhasil didaftarkan',
                  'Komisi dibayarkan setiap awal bulan untuk transaksi bulan sebelumnya',
                  'Mahirusaha berhak mengubah persentase komisi dengan pemberitahuan 30 hari',
                  'Partner dilarang memberikan informasi yang menyesatkan kepada calon klien',
                ].map((s, i) => (
                  <li key={i} style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>{s}</li>
                ))}
              </ul>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '14px' }}>
                <input
                  type="checkbox"
                  id="setuju"
                  checked={form.setuju}
                  onChange={e => update('setuju', e.target.checked)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#818cf8' }}
                />
                <label htmlFor="setuju" style={{ fontSize: '0.82rem', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>
                  Saya setuju dengan syarat & ketentuan partner
                </label>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
              <button onClick={() => setStep(1)} style={{ flex: 1, padding: '13px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>
                ← Kembali
              </button>
              <button
                onClick={handleSubmit}
                disabled={!form.jaringan_umkm || !form.estimasi_kontak || !form.alasan || !form.setuju || loading}
                style={{ flex: 2, padding: '13px', borderRadius: '12px', border: 'none', background: !form.jaringan_umkm || !form.estimasi_kontak || !form.alasan || !form.setuju ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg,#818cf8,#6366f1)', color: '#fff', cursor: !form.jaringan_umkm || !form.estimasi_kontak || !form.alasan || !form.setuju ? 'not-allowed' : 'pointer', fontFamily: 'inherit', fontWeight: 700, fontSize: '0.95rem', opacity: loading ? 0.7 : 1 }}
              >
                {loading ? '⏳ Mengirim...' : '🤝 Kirim Pendaftaran'}
              </button>
            </div>
          </div>
        )}

        {/* Step 3 - Success */}
        {step === 3 && (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🎉</div>
            <h2 style={{ fontWeight: 800, fontSize: '1.5rem', marginBottom: '12px' }}>Pendaftaran Berhasil!</h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem', lineHeight: 1.7, marginBottom: '24px' }}>
              Terima kasih <strong style={{ color: '#fff' }}>{form.nama_lengkap}</strong>! Pendaftaran partnermu sudah kami terima.
              Tim kami akan review dan menghubungi kamu via WhatsApp <strong style={{ color: '#818cf8' }}>{form.nomor_wa}</strong> dalam 1x24 jam.
            </p>
            <div style={{ background: 'rgba(129,140,248,0.08)', border: '1px solid rgba(129,140,248,0.2)', borderRadius: '16px', padding: '20px', marginBottom: '24px' }}>
              <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.7 }}>
                📱 Pastikan nomor WhatsApp kamu aktif dan bisa dihubungi.<br/>
                📧 Cek email kamu untuk konfirmasi pendaftaran.<br/>
                ⏰ Proses review maksimal 1x24 jam di jam kerja.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href="/partner" style={{ display: 'inline-block', background: 'linear-gradient(135deg,#818cf8,#6366f1)', color: '#fff', padding: '12px 24px', borderRadius: '10px', textDecoration: 'none', fontWeight: 700, fontSize: '0.875rem' }}>
                ← Kembali ke Partner
              </a>
              <a href="/" style={{ display: 'inline-block', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '12px 24px', borderRadius: '10px', textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem' }}>
                Ke Beranda
              </a>
            </div>
          </div>
        )}

      </div>
    </main>
  )
}
