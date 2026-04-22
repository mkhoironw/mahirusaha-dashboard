'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const formatNomorWA = (val: string) => {
  let nomor = val.replace(/\D/g, '')
  if (nomor.startsWith('0')) nomor = '62' + nomor.slice(1)
  else if (nomor.startsWith('8')) nomor = '62' + nomor
  return nomor
}

export default function Daftar() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [refFromUrl, setRefFromUrl] = useState(false)
  const [form, setForm] = useState({
    nama_pemilik: '',
    email: '',
    password: '',
    konfirmasi_password: '',
    nomor_wa_pemilik: '',
    nama_toko: '',
    slug: '',
    nomor_wa_toko: '',
    kategori: '',
    deskripsi: '',
    jam_buka: '',
    hari_buka: '',
    lokasi: '',
    kode_referral: '',
    nomor_admin: '',
    metode_pembayaran: '',
    metode_pengiriman: '',
    pesan_sambutan: '',
  })

  const update = (field: string, value: string) => setForm(p => ({ ...p, [field]: value }))

  // Auto-fill kode referral dari URL ?ref=XXXXX
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const ref = params.get('ref')
    if (ref) {
      update('kode_referral', ref.toUpperCase())
      setRefFromUrl(true)
    }
  }, [])

  const handleNomorWA = (field: string, val: string) => update(field, formatNomorWA(val))

  const handleStep1 = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.konfirmasi_password) { setError('Password tidak cocok!'); return }
    if (form.password.length < 8) { setError('Password minimal 8 karakter'); return }
    if (!form.nomor_wa_pemilik.startsWith('62')) { setError('Nomor WA tidak valid. Contoh: 08xxx atau 628xxx'); return }
    setStep(2)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const referralCode = 'MHR' + Math.random().toString(36).substring(2, 8).toUpperCase()

      const { data: client, error: clientError } = await supabase
        .from('clients')
        .insert({
          nama_pemilik: form.nama_pemilik,
          email: form.email.toLowerCase(),
          password_hash: form.password,
          nomor_wa_pemilik: form.nomor_wa_pemilik,
          status: 'trial',
          referral_code: referralCode,
        })
        .select()
        .single()

      if (clientError) {
        if (clientError.code === '23505') setError('Email sudah terdaftar. Silakan masuk atau gunakan email lain.')
        else setError('Gagal membuat akun. Silakan coba lagi.')
        setLoading(false)
        return
      }

      const { error: storeError } = await supabase
        .from('stores')
        .insert({
          client_id: client.id,
          nama_toko: form.nama_toko,
          slug: form.slug,
          nomor_wa_toko: form.nomor_wa_toko,
          kategori: form.kategori,
          deskripsi: form.deskripsi,
          jam_buka: form.jam_buka,
          hari_buka: form.hari_buka,
          lokasi: form.lokasi,
          nomor_admin: form.nomor_admin || form.nomor_wa_pemilik,
          metode_pembayaran: form.metode_pembayaran,
          metode_pengiriman: form.metode_pengiriman,
          pesan_sambutan: form.pesan_sambutan,
          is_trial: true,
          trial_pesan_limit: 100,
          pesan_terpakai: 0,
          aktif: true,
        })
        .select()
        .single()

      if (storeError) {
        setError('Gagal menyimpan data toko. Slug atau nomor WA mungkin sudah terdaftar.')
        setLoading(false)
        return
      }

      // Proses kode referral — cek dari tabel clients DAN tabel partners
      if (form.kode_referral) {
        const kode = form.kode_referral.toUpperCase()

        // Cek dari klien biasa
        const { data: referrerClient } = await supabase
          .from('clients')
          .select('id')
          .eq('referral_code', kode)
          .single()

        if (referrerClient) {
          await supabase.from('referrals').insert({
            referrer_id: referrerClient.id,
            referred_id: client.id,
            referral_code: kode,
            status: 'aktif',
            diskon_referrer: 10,
            diskon_referred: 10,
            sudah_diklaim: false,
          })
          await supabase.from('clients').update({ referred_by: referrerClient.id }).eq('id', client.id)
        } else {
          // Cek dari partner
          const { data: referrerPartner } = await supabase
            .from('partners')
            .select('id')
            .eq('referral_code', kode)
            .eq('status', 'aktif')
            .single()

          if (referrerPartner) {
            await supabase.from('referrals').insert({
              referrer_id: referrerPartner.id,
              referred_id: client.id,
              referral_code: kode,
              status: 'aktif',
              sudah_diklaim: false,
            })
          }
        }
      }

      await supabase.from('onboarding_steps').insert({
        client_id: client.id,
        step_daftar: true,
        step_verifikasi_email: false,
        step_isi_toko: true,
        step_tambah_produk: false,
        step_pilih_paket: false,
        step_bayar: false,
        step_bot_aktif: false,
        step_test_chat: false,
        persen_selesai: 25,
      })

      localStorage.setItem('mahirusaha_client', JSON.stringify({
        id: client.id,
        nama: client.nama_pemilik,
        email: client.email,
        status: client.status,
      }))

      try {
        await fetch('/api/email/welcome', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nama: form.nama_pemilik, email: form.email, nama_toko: form.nama_toko, slug: form.slug })
        })
      } catch { console.error('Email welcome gagal') }

      setStep(3)
    } catch (err) {
      setError('Terjadi kesalahan. Silakan coba lagi.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.12)',
    color: '#fff',
    padding: '12px 16px',
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

  const kategoriList = [
    'Kuliner & Makanan','Fashion & Pakaian','Kecantikan & Skincare',
    'Elektronik','Kesehatan','Pendidikan','Properti','Otomotif',
    'Jasa & Layanan','Retail & Toko','Lainnya'
  ]

  return (
    <main style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: '#070d1a', color: '#fff', minHeight: '100vh' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input, select, textarea { transition: border-color 0.2s; }
        input:focus, select:focus, textarea:focus { border-color: rgba(37,211,102,0.5) !important; outline: none; }
        input::placeholder, textarea::placeholder { color: rgba(255,255,255,0.25); }
        select option { background: #111827; color: #fff; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .fadeUp { animation: fadeUp 0.5s ease forwards; }
        @keyframes checkmark { from{transform:scale(0)} to{transform:scale(1)} }
        .checkmark { animation: checkmark 0.5s cubic-bezier(0.175,0.885,0.32,1.275) forwards; }
      `}</style>

      {/* Nav */}
      <nav style={{ padding: '0 5%', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: '#fff' }}>
          <div style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg,#25d366,#128c7e)', borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px' }}>💬</div>
          <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>Mahirusaha</span>
        </a>
        <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)' }}>
          Sudah punya akun? <a href="/masuk" style={{ color: '#25d366', textDecoration: 'none', fontWeight: 600 }}>Masuk</a>
        </span>
      </nav>

      {/* Progress */}
      {step < 3 && (
        <div style={{ padding: '0 5%', paddingTop: '32px', maxWidth: '560px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '32px' }}>
            {[1, 2].map(s => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: step >= s ? 'linear-gradient(135deg,#25d366,#128c7e)' : 'rgba(255,255,255,0.06)', border: step >= s ? 'none' : '1px solid rgba(255,255,255,0.12)', fontWeight: 700, fontSize: '0.85rem', color: step >= s ? '#fff' : 'rgba(255,255,255,0.4)', flexShrink: 0, transition: 'all 0.3s' }}>
                  {step > s ? '✓' : s}
                </div>
                <span style={{ fontSize: '0.8rem', color: step >= s ? '#fff' : 'rgba(255,255,255,0.35)', fontWeight: step >= s ? 600 : 400 }}>
                  {s === 1 ? 'Info Akun' : 'Info Toko'}
                </span>
                {s < 2 && <div style={{ flex: 1, height: '1px', background: step > s ? 'linear-gradient(90deg,#25d366,#128c7e)' : 'rgba(255,255,255,0.08)', borderRadius: '1px' }}/>}
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ maxWidth: '560px', margin: '0 auto', padding: '0 5% 60px' }}>

        {/* STEP 1 */}
        {step === 1 && (
          <div className="fadeUp">
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.5px', marginBottom: '6px' }}>Buat akun Mahirusaha</h1>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.875rem', marginBottom: '28px' }}>Gratis 100 pesan pertama, tidak perlu kartu kredit</p>

            {/* Banner referral jika datang dari link partner */}
            {refFromUrl && (
              <div style={{ background: 'rgba(129,140,248,0.1)', border: '1px solid rgba(129,140,248,0.25)', borderRadius: '12px', padding: '14px 16px', marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                <span style={{ fontSize: '1.2rem' }}>🎁</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#818cf8', marginBottom: '2px' }}>Kamu diundang oleh partner Mahirusaha!</div>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>Kode referral <strong style={{ color: '#818cf8' }}>{form.kode_referral}</strong> sudah terpasang otomatis</div>
                </div>
              </div>
            )}

            <form onSubmit={handleStep1} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Nama lengkap *</label>
                <input required style={inputStyle} placeholder="Mohammad Khoiron" value={form.nama_pemilik} onChange={e => update('nama_pemilik', e.target.value)} />
              </div>

              <div>
                <label style={labelStyle}>Email *</label>
                <input required type="email" style={inputStyle} placeholder="kamu@email.com" value={form.email} onChange={e => update('email', e.target.value)} />
              </div>

              <div>
                <label style={labelStyle}>Nomor WhatsApp *</label>
                <input
                  required
                  style={inputStyle}
                  placeholder="08xxxxxxxxxx atau 628xxxxxxxxxx"
                  value={form.nomor_wa_pemilik}
                  onChange={e => handleNomorWA('nomor_wa_pemilik', e.target.value)}
                />
                <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', marginTop: '4px', display: 'block' }}>
                  Format otomatis: 08xxx → 628xxx · Untuk notifikasi akun
                </span>
                {form.nomor_wa_pemilik && (
                  <span style={{ fontSize: '0.72rem', color: '#25d366', marginTop: '2px', display: 'block' }}>
                    ✓ Tersimpan: {form.nomor_wa_pemilik}
                  </span>
                )}
              </div>

              <div>
                <label style={labelStyle}>Password *</label>
                <input required type="password" style={inputStyle} placeholder="Minimal 8 karakter" value={form.password} onChange={e => update('password', e.target.value)} />
              </div>

              <div>
                <label style={labelStyle}>Konfirmasi password *</label>
                <input required type="password" style={inputStyle} placeholder="Ulangi password" value={form.konfirmasi_password} onChange={e => update('konfirmasi_password', e.target.value)} />
              </div>

              {/* Kode Referral */}
              <div>
                <label style={labelStyle}>
                  Kode referral{' '}
                  {!refFromUrl && <span style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 400 }}>(opsional)</span>}
                </label>
                <input
                  style={{ ...inputStyle, opacity: refFromUrl ? 0.7 : 1, cursor: refFromUrl ? 'not-allowed' : 'text' }}
                  placeholder="Contoh: MHRABC123"
                  value={form.kode_referral}
                  readOnly={refFromUrl}
                  onChange={e => { if (!refFromUrl) update('kode_referral', e.target.value.toUpperCase()) }}
                />
                {refFromUrl ? (
                  <span style={{ fontSize: '0.72rem', color: '#818cf8', marginTop: '4px', display: 'block' }}>
                    🔒 Kode referral terpasang otomatis dari link undangan
                  </span>
                ) : (
                  <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', marginTop: '4px', display: 'block' }}>
                    Dapat kode dari teman atau partner? Masukkan di sini
                  </span>
                )}
              </div>

              {error && (
                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '12px 16px', fontSize: '0.85rem', color: '#fca5a5' }}>⚠️ {error}</div>
              )}

              <button type="submit" style={{ background: 'linear-gradient(135deg,#25d366,#128c7e)', color: '#fff', padding: '14px', borderRadius: '12px', border: 'none', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', fontFamily: 'inherit', marginTop: '4px' }}>
                Lanjut → Info Toko
              </button>

              <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', textAlign: 'center', lineHeight: 1.6 }}>
                Dengan mendaftar, kamu menyetujui{' '}
                <a href="/syarat" style={{ color: '#25d366', textDecoration: 'none' }}>Syarat Layanan</a> dan{' '}
                <a href="/privasi" style={{ color: '#25d366', textDecoration: 'none' }}>Kebijakan Privasi</a> Mahirusaha.
              </p>
            </form>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="fadeUp">
            <button onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '0.85rem', marginBottom: '20px', padding: 0, display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'inherit' }}>← Kembali</button>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.5px', marginBottom: '6px' }}>Info toko kamu</h1>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.875rem', marginBottom: '28px' }}>Bot akan menggunakan info ini untuk menjawab pelanggan</p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Informasi Utama */}
              <div style={{ background: 'rgba(37,211,102,0.05)', border: '1px solid rgba(37,211,102,0.15)', borderRadius: '12px', padding: '16px', marginBottom: '4px' }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#25d366', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Informasi Utama</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={labelStyle}>Nama toko / bisnis *</label>
                    <input required style={inputStyle} placeholder="Warung Makan Bu Sari" value={form.nama_toko} onChange={e => update('nama_toko', e.target.value)} />
                  </div>
                  <div>
                    <label style={labelStyle}>Link Toko Online *</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.4)', whiteSpace: 'nowrap' }}>mahirusaha.com/</span>
                      <input required style={inputStyle} placeholder="nama-toko-kamu" value={form.slug} onChange={e => update('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '').replace(/\s+/g, '-'))} />
                    </div>
                    <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', marginTop: '4px', display: 'block' }}>Hanya huruf kecil, angka, dan tanda (-). Contoh: warung-bu-sari</span>
                  </div>
                  <div>
                    <label style={labelStyle}>Nomor WhatsApp Bot *</label>
                    <input
                      required
                      style={inputStyle}
                      placeholder="08xxxxxxxxxx atau 628xxxxxxxxxx"
                      value={form.nomor_wa_toko}
                      onChange={e => handleNomorWA('nomor_wa_toko', e.target.value)}
                    />
                    <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', marginTop: '4px', display: 'block' }}>
                      Format otomatis: 08xxx → 628xxx · Nomor khusus bot, JANGAN pakai nomor yang sudah ada WA-nya!
                    </span>
                    {form.nomor_wa_toko && (
                      <span style={{ fontSize: '0.72rem', color: '#25d366', marginTop: '2px', display: 'block' }}>
                        ✓ Tersimpan: {form.nomor_wa_toko}
                      </span>
                    )}
                  </div>
                  <div>
                    <label style={labelStyle}>Kategori bisnis *</label>
                    <select required style={{ ...inputStyle, appearance: 'none' as const }} value={form.kategori} onChange={e => update('kategori', e.target.value)}>
                      <option value="">Pilih kategori...</option>
                      {kategoriList.map(k => <option key={k} value={k}>{k}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Operasional */}
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '16px', marginBottom: '4px' }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Operasional (opsional tapi disarankan)</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={labelStyle}>Hari buka</label>
                      <input style={inputStyle} placeholder="Senin - Sabtu" value={form.hari_buka} onChange={e => update('hari_buka', e.target.value)} />
                    </div>
                    <div>
                      <label style={labelStyle}>Jam buka</label>
                      <input style={inputStyle} placeholder="08.00 - 21.00" value={form.jam_buka} onChange={e => update('jam_buka', e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>Lokasi / alamat</label>
                    <input style={inputStyle} placeholder="Jl. Mawar No.5, Jakarta" value={form.lokasi} onChange={e => update('lokasi', e.target.value)} />
                  </div>
                  <div>
                    <label style={labelStyle}>Metode pembayaran</label>
                    <input style={inputStyle} placeholder="Transfer, QRIS, COD" value={form.metode_pembayaran} onChange={e => update('metode_pembayaran', e.target.value)} />
                  </div>
                  <div>
                    <label style={labelStyle}>Metode pengiriman</label>
                    <input style={inputStyle} placeholder="JNE, J&T, Grab, COD" value={form.metode_pengiriman} onChange={e => update('metode_pengiriman', e.target.value)} />
                  </div>
                </div>
              </div>

              {/* Bot */}
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '16px' }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Kustomisasi Bot</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={labelStyle}>Deskripsi bisnis</label>
                    <textarea rows={3} style={{ ...inputStyle, resize: 'none' as const }} placeholder="Ceritakan bisnis kamu... Bot akan menggunakan ini untuk memperkenalkan diri ke pelanggan." value={form.deskripsi} onChange={e => update('deskripsi', e.target.value)} />
                  </div>
                  <div>
                    <label style={labelStyle}>Pesan sambutan bot</label>
                    <textarea rows={2} style={{ ...inputStyle, resize: 'none' as const }} placeholder="Halo! Selamat datang di [nama toko]. Ada yang bisa saya bantu? 😊" value={form.pesan_sambutan} onChange={e => update('pesan_sambutan', e.target.value)} />
                  </div>
                </div>
              </div>

              {error && (
                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '12px 16px', fontSize: '0.85rem', color: '#fca5a5' }}>⚠️ {error}</div>
              )}

              <button type="submit" disabled={loading} style={{ background: loading ? 'rgba(37,211,102,0.5)' : 'linear-gradient(135deg,#25d366,#128c7e)', color: '#fff', padding: '14px', borderRadius: '12px', border: 'none', fontWeight: 700, fontSize: '0.95rem', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', marginTop: '4px' }}>
                {loading ? 'Membuat akun...' : '✅ Selesai Daftar'}
              </button>
            </form>
          </div>
        )}

        {/* STEP 3 - Sukses */}
        {step === 3 && (
          <div className="fadeUp" style={{ textAlign: 'center', paddingTop: '40px' }}>
            <div className="checkmark" style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg,#25d366,#128c7e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', margin: '0 auto 24px' }}>✅</div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.5px', marginBottom: '12px' }}>Selamat datang di Mahirusaha!</h1>
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.95rem', lineHeight: 1.7, marginBottom: '32px' }}>
              Akun dan bot <strong style={{ color: '#25d366' }}>{form.nama_toko}</strong> sudah aktif.<br/>
              Kamu mendapat <strong style={{ color: '#25d366' }}>100 pesan gratis</strong> untuk mencoba semua fitur.
            </p>
            <div style={{ background: 'rgba(37,211,102,0.06)', border: '1px solid rgba(37,211,102,0.2)', borderRadius: '16px', padding: '24px', marginBottom: '24px', textAlign: 'left' }}>
              <p style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '16px' }}>Langkah selanjutnya:</p>
              {[
                'Tambahkan produk di dashboard agar bot bisa menjelaskan detail produkmu',
                'Test bot dengan kirim pesan ke nomor WA tokomu',
                'Bagikan nomor WA toko ke pelanggan dan lihat bot bekerja!',
              ].map((s, i) => (
                <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '12px', fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>
                  <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(37,211,102,0.15)', border: '1px solid rgba(37,211,102,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: '#25d366', flexShrink: 0 }}>{i + 1}</div>
                  {s}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '12px', flexDirection: 'column' }}>
              <a href="/dashboard" style={{ display: 'block', background: 'linear-gradient(135deg,#25d366,#128c7e)', color: '#fff', padding: '14px', borderRadius: '12px', textDecoration: 'none', fontWeight: 700, fontSize: '0.95rem' }}>Masuk ke Dashboard →</a>
              <a href="/dashboard" style={{ display: 'block', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', padding: '14px', borderRadius: '12px', textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem' }}>Tambah Produk Sekarang</a>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
