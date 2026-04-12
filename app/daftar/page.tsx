'use client'
import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Daftar() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    // Step 1 - Akun
    nama_pemilik: '',
    email: '',
    password: '',
    konfirmasi_password: '',
    nomor_wa_pemilik: '',
    // Step 2 - Toko
    nama_toko: '',
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

  const update = (field: string, value: string) =>
    setForm(p => ({ ...p, [field]: value }))

  const handleStep1 = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.konfirmasi_password) {
      setError('Password tidak cocok!')
      return
    }
    if (form.password.length < 8) {
      setError('Password minimal 8 karakter')
      return
    }
    setStep(2)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Generate referral code unik
      const referralCode = 'MHR' + Math.random().toString(36).substring(2, 8).toUpperCase()

      // Simpan client ke database
      const { data: client, error: clientError } = await supabase
        .from('clients')
        .insert({
          nama_pemilik: form.nama_pemilik,
          email: form.email.toLowerCase(),
          password_hash: form.password, // nanti diganti bcrypt
          nomor_wa_pemilik: form.nomor_wa_pemilik,
          status: 'trial',
          referral_code: referralCode,
        })
        .select()
        .single()

      if (clientError) {
        if (clientError.code === '23505') {
          setError('Email sudah terdaftar. Silakan masuk atau gunakan email lain.')
        } else {
          setError('Gagal membuat akun. Silakan coba lagi.')
        }
        setLoading(false)
        return
      }

      // Simpan toko
      const { data: store, error: storeError } = await supabase
        .from('stores')
        .insert({
          client_id: client.id,
          nama_toko: form.nama_toko,
          nomor_wa_toko: form.nomor_wa_toko.replace(/\D/g, ''),
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
        setError('Gagal menyimpan data toko. Nomor WA mungkin sudah terdaftar.')
        setLoading(false)
        return
      }

      // Proses kode referral jika ada
	  if (form.kode_referral) {
		const { data: referrer } = await supabase
		.from('clients')
		.select('id')
		.eq('referral_code', form.kode_referral.toUpperCase())
		.single()

	  if (referrer) {
		await supabase.from('referrals').insert({
		referrer_id: referrer.id,
		referred_id: client.id,
		status: 'aktif',
		diskon_referrer: 10,
		diskon_referred: 10,
		sudah_diklaim: false,
		})

		await supabase
		.from('clients')
		.update({ referred_by: referrer.id })
		.eq('id', client.id)
		}
	  }
	  
	  
	  // Buat onboarding steps
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

      // Lanjut ke step 3 (sukses)
      setStep(3)

    } catch (err) {
      setError('Terjadi kesalahan. Silakan coba lagi.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.12)',
    color: '#fff',
    padding: '12px 16px',
    borderRadius: '10px',
    fontSize: '0.9rem',
    fontFamily: 'inherit',
    outline: 'none',
  }

  const labelStyle = {
    display: 'block',
    fontSize: '0.82rem',
    fontWeight: 600,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: '6px',
  }

  const kategoriList = [
    'Kuliner & Makanan', 'Fashion & Pakaian', 'Kecantikan & Skincare',
    'Elektronik', 'Kesehatan', 'Pendidikan', 'Properti', 'Otomotif',
    'Jasa & Layanan', 'Retail & Toko', 'Lainnya'
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

      {/* Header */}
      <nav style={{ padding: '0 5%', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: '#fff' }}>
          <div style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg,#25d366,#128c7e)', borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px' }}>💬</div>
          <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>Mahirusaha</span>
        </a>
        <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)' }}>
          Sudah punya akun? <a href="/masuk" style={{ color: '#25d366', textDecoration: 'none', fontWeight: 600 }}>Masuk</a>
        </span>
      </nav>

      {/* Progress bar */}
      {step < 3 && (
        <div style={{ padding: '0 5%', paddingTop: '32px', maxWidth: '560px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '32px' }}>
            {[1, 2].map(s => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: step >= s ? 'linear-gradient(135deg,#25d366,#128c7e)' : 'rgba(255,255,255,0.06)',
                  border: step >= s ? 'none' : '1px solid rgba(255,255,255,0.12)',
                  fontWeight: 700, fontSize: '0.85rem', color: step >= s ? '#fff' : 'rgba(255,255,255,0.4)',
                  flexShrink: 0, transition: 'all 0.3s'
                }}>{step > s ? '✓' : s}</div>
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

        {/* STEP 1 — Info Akun */}
        {step === 1 && (
          <div className="fadeUp">
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.5px', marginBottom: '6px' }}>Buat akun Mahirusaha</h1>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.875rem', marginBottom: '28px' }}>Gratis 100 pesan pertama, tidak perlu kartu kredit</p>

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
                <input required style={inputStyle} placeholder="08xxxxxxxxxx" value={form.nomor_wa_pemilik} onChange={e => update('nomor_wa_pemilik', e.target.value)} />
                <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', marginTop: '4px', display: 'block' }}>Untuk notifikasi akun dan informasi penting</span>
              </div>
              <div>
                <label style={labelStyle}>Password *</label>
                <input required type="password" style={inputStyle} placeholder="Minimal 8 karakter" value={form.password} onChange={e => update('password', e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>Konfirmasi password *</label>
                <input required type="password" style={inputStyle} placeholder="Ulangi password" value={form.konfirmasi_password} onChange={e => update('konfirmasi_password', e.target.value)} />
              </div>

              {error && (
                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '12px 16px', fontSize: '0.85rem', color: '#fca5a5' }}>
                  ⚠️ {error}
                </div>
              )}

			<div>
				<label style={labelStyle}>Kode referral <span style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 400 }}>(opsional)</span></label>
				<input
				style={inputStyle}
				placeholder="Contoh: MHRABC123"
				value={form.kode_referral}
				onChange={e => update('kode_referral', e.target.value.toUpperCase())}
				/>
				<span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', marginTop: '4px', display: 'block' }}>
					Dapat kode dari teman? Masukkan di sini untuk dapat diskon 10%
				</span>
			</div>	



              <button type="submit" style={{ background: 'linear-gradient(135deg,#25d366,#128c7e)', color: '#fff', padding: '14px', borderRadius: '12px', border: 'none', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', fontFamily: 'inherit', marginTop: '4px' }}>
                Lanjut → Info Toko
              </button>

              <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', textAlign: 'center', lineHeight: 1.6 }}>
                Dengan mendaftar, kamu menyetujui <a href="/syarat" style={{ color: '#25d366', textDecoration: 'none' }}>Syarat Layanan</a> dan <a href="/privasi" style={{ color: '#25d366', textDecoration: 'none' }}>Kebijakan Privasi</a> Mahirusaha.
              </p>
            </form>
          </div>
        )}

        {/* STEP 2 — Info Toko */}
        {step === 2 && (
          <div className="fadeUp">
            <button onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '0.85rem', marginBottom: '20px', padding: 0, display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'inherit' }}>
              ← Kembali
            </button>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.5px', marginBottom: '6px' }}>Info toko kamu</h1>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.875rem', marginBottom: '28px' }}>Bot akan menggunakan info ini untuk menjawab pelanggan</p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* Wajib */}
              <div style={{ background: 'rgba(37,211,102,0.05)', border: '1px solid rgba(37,211,102,0.15)', borderRadius: '12px', padding: '16px', marginBottom: '4px' }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#25d366', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Informasi Utama</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={labelStyle}>Nama toko / bisnis *</label>
                    <input required style={inputStyle} placeholder="Warung Makan Bu Sari" value={form.nama_toko} onChange={e => update('nama_toko', e.target.value)} />
                  </div>
                  <div>
                    <label style={labelStyle}>Nomor WhatsApp toko *</label>
                    <input required style={inputStyle} placeholder="628xxxxxxxxxx (format internasional)" value={form.nomor_wa_toko} onChange={e => update('nomor_wa_toko', e.target.value)} />
                    <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', marginTop: '4px', display: 'block' }}>Nomor WA yang akan dipakai bot. Harus sudah terdaftar di WhatsApp.</span>
                  </div>
                  <div>
                    <label style={labelStyle}>Kategori bisnis *</label>
                    <select required style={{ ...inputStyle, appearance: 'none' }} value={form.kategori} onChange={e => update('kategori', e.target.value)}>
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
                    <textarea rows={3} style={{ ...inputStyle, resize: 'none' }} placeholder="Ceritakan bisnis kamu... Bot akan menggunakan ini untuk memperkenalkan diri ke pelanggan." value={form.deskripsi} onChange={e => update('deskripsi', e.target.value)} />
                  </div>
                  <div>
                    <label style={labelStyle}>Pesan sambutan bot</label>
                    <textarea rows={2} style={{ ...inputStyle, resize: 'none' }} placeholder="Halo! Selamat datang di [nama toko]. Ada yang bisa saya bantu? 😊" value={form.pesan_sambutan} onChange={e => update('pesan_sambutan', e.target.value)} />
                  </div>
                </div>
              </div>

              {error && (
                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '12px 16px', fontSize: '0.85rem', color: '#fca5a5' }}>
                  ⚠️ {error}
                </div>
              )}

              <button type="submit" disabled={loading} style={{ background: loading ? 'rgba(37,211,102,0.5)' : 'linear-gradient(135deg,#25d366,#128c7e)', color: '#fff', padding: '14px', borderRadius: '12px', border: 'none', fontWeight: 700, fontSize: '0.95rem', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', marginTop: '4px' }}>
                {loading ? 'Membuat akun...' : '🚀 Aktifkan Bot Sekarang'}
              </button>
            </form>
          </div>
        )}

        {/* STEP 3 — Sukses */}
        {step === 3 && (
          <div className="fadeUp" style={{ textAlign: 'center', paddingTop: '40px' }}>
            <div className="checkmark" style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg,#25d366,#128c7e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', margin: '0 auto 24px' }}>✅</div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.5px', marginBottom: '12px' }}>Selamat datang di Mahirusaha!</h1>
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.95rem', lineHeight: 1.7, marginBottom: '32px' }}>
              Akun dan bot <strong style={{ color: '#25d366' }}>{form.nama_toko}</strong> sudah aktif.<br/>
              Kamu mendapat <strong style={{ color: '#25d366' }}>100 pesan gratis</strong> untuk mencoba semua fitur.
            </p>

            {/* Next steps */}
            <div style={{ background: 'rgba(37,211,102,0.06)', border: '1px solid rgba(37,211,102,0.2)', borderRadius: '16px', padding: '24px', marginBottom: '24px', textAlign: 'left' }}>
              <p style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '16px' }}>Langkah selanjutnya:</p>
              {[
                { num: '1', text: 'Tambahkan produk di dashboard agar bot bisa menjelaskan detail produkmu', done: false },
                { num: '2', text: 'Test bot dengan kirim pesan ke nomor WA tokomu', done: false },
                { num: '3', text: 'Bagikan nomor WA toko ke pelanggan dan lihat bot bekerja!', done: false },
              ].map(s => (
                <div key={s.num} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '12px', fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>
                  <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(37,211,102,0.15)', border: '1px solid rgba(37,211,102,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: '#25d366', flexShrink: 0 }}>{s.num}</div>
                  {s.text}
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '12px', flexDirection: 'column' }}>
              <a href="/dashboard" style={{ display: 'block', background: 'linear-gradient(135deg,#25d366,#128c7e)', color: '#fff', padding: '14px', borderRadius: '12px', textDecoration: 'none', fontWeight: 700, fontSize: '0.95rem' }}>
                Masuk ke Dashboard →
              </a>
              <a href="/dashboard/produk" style={{ display: 'block', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', padding: '14px', borderRadius: '12px', textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem' }}>
                Tambah Produk Sekarang
              </a>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
