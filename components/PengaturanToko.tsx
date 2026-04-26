'use client'
import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Store {
  id: string
  client_id: string
  nama_toko: string
  nomor_wa_toko: string
  wa_phone_number_id: string
  wa_access_token: string
  kategori: string
  deskripsi: string
  jam_buka: string
  hari_buka: string
  lokasi: string
  link_maps: string
  nomor_admin: string
  metode_pembayaran: string
  metode_pengiriman: string
  pesan_sambutan: string
  pesan_di_luar_jam: string
  instruksi_bot: string
  bahasa_bot: string
  aktif: boolean
  is_trial: boolean
  pesan_terpakai: number
  trial_pesan_limit: number
  batas_pesan_bulan: number
  onboarding_selesai: boolean
  slug: string
  logo_url?: string
  tema_warna?: string
}

interface PengaturanTokoProps {
  store: Store
  onUpdate: (updatedStore: Store) => void
}

export default function PengaturanToko({ store, onUpdate }: PengaturanTokoProps) {
  const [form, setForm] = useState({
    nama_toko: store.nama_toko || '',
    nomor_wa_toko: store.nomor_wa_toko || '',
    kategori: store.kategori || '',
    deskripsi: store.deskripsi || '',
    jam_buka: store.jam_buka || '',
    hari_buka: store.hari_buka || '',
    lokasi: store.lokasi || '',
    link_maps: store.link_maps || '',
    nomor_admin: store.nomor_admin || '',
    metode_pembayaran: store.metode_pembayaran || '',
    metode_pengiriman: store.metode_pengiriman || '',
    pesan_sambutan: store.pesan_sambutan || '',
    pesan_di_luar_jam: store.pesan_di_luar_jam || '',
    instruksi_bot: store.instruksi_bot || '',
    bahasa_bot: store.bahasa_bot || 'indonesia',
    aktif: store.aktif,
	slug: store.slug || '',
  })

  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState('tampilan')
  const [logoUrl, setLogoUrl] = useState(store.logo_url || '')
  const [temaWarna, setTemaWarna] = useState(store.tema_warna || '')
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [deletingLogo, setDeletingLogo] = useState(false)

  const update = (field: string, value: string | boolean) =>
    setForm(p => ({ ...p, [field]: value }))

  const extractDominantColor = (file: File): Promise<string> =>
    new Promise((resolve) => {
      const img = new Image()
      const url = URL.createObjectURL(file)
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = 50; canvas.height = 50
        const ctx = canvas.getContext('2d')
        if (!ctx) { URL.revokeObjectURL(url); resolve('#25d366'); return }
        ctx.drawImage(img, 0, 0, 50, 50)
        const data = ctx.getImageData(0, 0, 50, 50).data
        let r = 0, g = 0, b = 0, count = 0
        for (let i = 0; i < data.length; i += 4) {
          const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3
          if (brightness > 30 && brightness < 230) {
            r += data[i]; g += data[i + 1]; b += data[i + 2]; count++
          }
        }
        URL.revokeObjectURL(url)
        if (count === 0) { resolve('#25d366'); return }
        resolve('#' +
          Math.round(r / count).toString(16).padStart(2, '0') +
          Math.round(g / count).toString(16).padStart(2, '0') +
          Math.round(b / count).toString(16).padStart(2, '0'))
      }
      img.onerror = () => { URL.revokeObjectURL(url); resolve('#25d366') }
      img.src = url
    })

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { alert('Ukuran file maksimal 2MB'); return }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      alert('Format harus JPG, PNG, atau WebP'); return
    }
    setUploadingLogo(true)
    try {
      const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg'
      const path = `${store.id}/logo.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('store-logos')
        .upload(path, file, { upsert: true, contentType: file.type })
      if (uploadError) throw uploadError
      const { data: urlData } = supabase.storage.from('store-logos').getPublicUrl(path)
      const publicUrl = urlData.publicUrl
      const warna = await extractDominantColor(file)
      await supabase.from('stores').update({ logo_url: publicUrl, tema_warna: warna }).eq('id', store.id)
      setLogoUrl(publicUrl)
      setTemaWarna(warna)
      onUpdate({ ...store, ...form, logo_url: publicUrl, tema_warna: warna })
    } catch (err) {
      console.error(err)
      alert('Gagal upload logo. Coba lagi.')
    }
    setUploadingLogo(false)
  }

  const handleLogoDelete = async () => {
    if (!logoUrl) return
    if (!confirm('Hapus logo toko? Tema warna juga akan direset ke hijau default.')) return
    setDeletingLogo(true)
    try {
      const ext = logoUrl.split('/').pop()?.split('.').pop()?.split('?')[0] || 'jpg'
      const path = `${store.id}/logo.${ext}`
      await supabase.storage.from('store-logos').remove([path])
      await supabase.from('stores').update({ logo_url: null, tema_warna: null }).eq('id', store.id)
      setLogoUrl('')
      setTemaWarna('')
      onUpdate({ ...store, ...form, logo_url: undefined, tema_warna: undefined })
    } catch (err) {
      console.error(err)
      alert('Gagal menghapus logo. Coba lagi.')
    }
    setDeletingLogo(false)
  }

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)

    const { error } = await supabase
      .from('stores')
      .update({
        ...form,
        updated_at: new Date().toISOString()
      })
      .eq('id', store.id)

    if (!error) {
      setSaved(true)
      onUpdate({ ...store, ...form })
      setTimeout(() => setSaved(false), 3000)
    } else {
      alert('Gagal menyimpan. Coba lagi.')
    }

    setSaving(false)
  }

  const kategoriList = [
    'Kuliner & Makanan', 'Fashion & Pakaian', 'Kecantikan & Skincare',
    'Elektronik', 'Kesehatan', 'Pendidikan', 'Properti', 'Otomotif',
    'Jasa & Layanan', 'Retail & Toko', 'Lainnya'
  ]

  const inputStyle = {
    width: '100%',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#fff',
    padding: '11px 14px',
    borderRadius: '10px',
    fontSize: '0.875rem',
    fontFamily: 'inherit',
    outline: 'none',
    transition: 'border-color 0.2s',
  }

  const labelStyle = {
    display: 'block',
    fontSize: '0.78rem',
    fontWeight: 600,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: '5px',
  }

  const tabs = [
    { id: 'tampilan', label: '🎨 Logo & Tema' },
    { id: 'info', label: '🏪 Info Toko' },
    { id: 'operasional', label: '🕐 Operasional' },
    { id: 'bot', label: '🤖 Pengaturan Bot' },
  ]

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '4px' }}>Pengaturan Toko</h2>
          <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>Info ini digunakan bot untuk menjawab pelanggan</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {saved && (
            <div style={{ background: 'rgba(37,211,102,0.15)', border: '1px solid rgba(37,211,102,0.3)', borderRadius: '8px', padding: '8px 14px', fontSize: '0.8rem', color: '#25d366', display: 'flex', gap: '6px', alignItems: 'center' }}>
              ✅ Tersimpan!
            </div>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            style={{ background: saving ? 'rgba(37,211,102,0.4)' : 'linear-gradient(135deg,#25d366,#128c7e)', color: '#fff', padding: '10px 22px', borderRadius: '10px', border: 'none', fontWeight: 700, fontSize: '0.875rem', fontFamily: 'inherit', cursor: saving ? 'not-allowed' : 'pointer' }}
          >
            {saving ? 'Menyimpan...' : '💾 Simpan Perubahan'}
          </button>
        </div>
      </div>

      {/* Status bot */}
      <div style={{ background: form.aktif ? 'rgba(37,211,102,0.06)' : 'rgba(239,68,68,0.06)', border: `1px solid ${form.aktif ? 'rgba(37,211,102,0.2)' : 'rgba(239,68,68,0.2)'}`, borderRadius: '12px', padding: '14px 18px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '2px' }}>
            {form.aktif ? '🟢 Bot sedang aktif' : '🔴 Bot sedang nonaktif'}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>
            {form.aktif ? 'Bot sedang menjawab pesan pelanggan secara otomatis' : 'Bot tidak akan menjawab pesan pelanggan'}
          </div>
        </div>
        <div
          onClick={() => update('aktif', !form.aktif)}
          style={{ width: '48px', height: '26px', borderRadius: '100px', background: form.aktif ? '#25d366' : 'rgba(255,255,255,0.15)', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}
        >
          <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '3px', left: form.aktif ? '25px' : '3px', transition: 'left 0.2s' }}/>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '4px' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{ flex: 1, padding: '9px 16px', borderRadius: '9px', border: 'none', fontFamily: 'inherit', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', background: activeTab === tab.id ? 'rgba(37,211,102,0.15)' : 'transparent', color: activeTab === tab.id ? '#25d366' : 'rgba(255,255,255,0.5)', transition: 'all 0.2s' }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: Logo & Tema */}
      {activeTab === 'tampilan' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Logo upload */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px' }}>
            <p style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: '16px' }}>📸 Logo Toko</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
              {/* Avatar preview */}
              <div style={{ width: '96px', height: '96px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: 'rgba(255,255,255,0.08)', border: '2px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem' }}>
                {logoUrl
                  ? <img src={logoUrl} alt="Logo toko" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : '🏪'}
              </div>

              {/* Upload info */}
              <div style={{ flex: 1, minWidth: '180px' }}>
                <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginBottom: '12px', lineHeight: 1.5 }}>
                  Format JPG, PNG, atau WebP. Maks. 2MB.<br />
                  Ditampilkan sebagai avatar di halaman toko online.
                </p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: uploadingLogo ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', padding: '10px 18px', cursor: (uploadingLogo || deletingLogo) ? 'not-allowed' : 'pointer', fontSize: '0.875rem', fontWeight: 600, transition: 'all 0.2s', opacity: deletingLogo ? 0.5 : 1 }}>
                    <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleLogoUpload} disabled={uploadingLogo || deletingLogo} style={{ display: 'none' }} />
                    {uploadingLogo ? '⏳ Mengupload...' : '📤 Upload Logo'}
                  </label>
                  {logoUrl && (
                    <button
                      onClick={handleLogoDelete}
                      disabled={deletingLogo || uploadingLogo}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '10px 18px', cursor: (deletingLogo || uploadingLogo) ? 'not-allowed' : 'pointer', fontSize: '0.875rem', fontWeight: 600, color: '#f87171', fontFamily: 'inherit', transition: 'all 0.2s' }}
                    >
                      {deletingLogo ? '⏳ Menghapus...' : '🗑️ Hapus Logo'}
                    </button>
                  )}
                </div>
                {logoUrl && !uploadingLogo && !deletingLogo && (
                  <p style={{ fontSize: '0.72rem', color: '#25d366', marginTop: '8px' }}>✅ Logo aktif</p>
                )}
              </div>
            </div>
          </div>

          {/* Tema warna */}
          {temaWarna ? (
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px' }}>
              <p style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: '16px' }}>🎨 Tema Warna Otomatis</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ width: '64px', height: '64px', borderRadius: '14px', background: temaWarna, boxShadow: `0 4px 20px ${temaWarna}60`, flexShrink: 0 }} />
                  <div style={{ width: '64px', height: '64px', borderRadius: '14px', background: `linear-gradient(135deg,${temaWarna},${temaWarna}99)`, flexShrink: 0 }} />
                </div>
                <div>
                  <div style={{ fontFamily: 'monospace', fontSize: '1.1rem', fontWeight: 700, letterSpacing: '0.05em', color: temaWarna }}>{temaWarna}</div>
                  <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>
                    Warna diekstrak otomatis dari logo. Diterapkan di header &amp; tombol halaman toko online.
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '16px', padding: '32px', textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>🎨</div>
              <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.35)', lineHeight: 1.6 }}>
                Upload logo toko untuk mengaktifkan tema warna otomatis.<br />
                Warna dominan logo akan digunakan sebagai tema di halaman toko online kamu.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tab: Info Toko */}
      {activeTab === 'info' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            
			<div>
				<label style={labelStyle}>Nama toko / bisnis *</label>
				<input style={inputStyle} value={form.nama_toko} onChange={e => update('nama_toko', e.target.value)} placeholder="Warung Makan Bu Sari" />
			</div>

			<div>
				<label style={labelStyle}>Link Toko Online</label>
				<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
				<span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.4)', whiteSpace: 'nowrap' }}>mahirusaha.com/</span>
				<input
					style={inputStyle}
					value={form.slug || ''}
					onChange={e => update('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '').replace(/\s+/g, '-'))}
					placeholder="nama-toko-kamu"
				/>
			</div>
			<span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', marginTop: '4px', display: 'block' }}>
				Hanya huruf kecil, angka, dan tanda (-). Contoh: warung-bu-sari
			</span>
			{form.slug && (
    
			<a href={`https://mahirusaha.com/${form.slug}`}
				target="_blank"
				rel="noopener noreferrer"
				style={{ fontSize: '0.72rem', color: '#25d366', marginTop: '4px', display: 'block' }}
				>
				🔗 Preview: mahirusaha.com/{form.slug}
			</a>
			)}
		</div>
            
			
			
			
			
			
			
			<div>
              <label style={labelStyle}>Kategori bisnis</label>
              <select style={{ ...inputStyle, appearance: 'none' }} value={form.kategori} onChange={e => update('kategori', e.target.value)}>
                <option value="">Pilih kategori...</option>
                {kategoriList.map(k => <option key={k} value={k} style={{ background: '#111827' }}>{k}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label style={labelStyle}>Deskripsi bisnis</label>
            <textarea rows={3} style={{ ...inputStyle, resize: 'none' }} value={form.deskripsi} onChange={e => update('deskripsi', e.target.value)} placeholder="Ceritakan bisnis kamu secara singkat..." />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={labelStyle}>Nomor WhatsApp toko</label>
              <input style={{ ...inputStyle, background: 'rgba(255,255,255,0.02)', color: 'rgba(255,255,255,0.4)' }} value={form.nomor_wa_toko} disabled />
              <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.25)', marginTop: '4px', display: 'block' }}>Nomor WA tidak bisa diubah. Hubungi support jika perlu.</span>
            </div>
            <div>
              <label style={labelStyle}>Nomor WA admin (untuk eskalasi)</label>
              <input style={inputStyle} value={form.nomor_admin} onChange={e => update('nomor_admin', e.target.value)} placeholder="628xxxxxxxxxx" />
              <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.25)', marginTop: '4px', display: 'block' }}>Bot akan arahkan pelanggan ke nomor ini jika butuh bantuan manusia</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={labelStyle}>Lokasi / alamat</label>
              <input style={inputStyle} value={form.lokasi} onChange={e => update('lokasi', e.target.value)} placeholder="Jl. Mawar No. 5, Surabaya" />
            </div>
            <div>
              <label style={labelStyle}>Link Google Maps (opsional)</label>
              <input style={inputStyle} value={form.link_maps} onChange={e => update('link_maps', e.target.value)} placeholder="https://maps.google.com/..." />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={labelStyle}>Metode pembayaran</label>
              <input style={inputStyle} value={form.metode_pembayaran} onChange={e => update('metode_pembayaran', e.target.value)} placeholder="Transfer BCA, QRIS, COD" />
            </div>
            <div>
              <label style={labelStyle}>Metode pengiriman</label>
              <input style={inputStyle} value={form.metode_pengiriman} onChange={e => update('metode_pengiriman', e.target.value)} placeholder="JNE, J&T, Grab, COD" />
            </div>
          </div>
        </div>
      )}

      {/* Tab: Operasional */}
      {activeTab === 'operasional' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={labelStyle}>Hari buka</label>
              <input style={inputStyle} value={form.hari_buka} onChange={e => update('hari_buka', e.target.value)} placeholder="Senin - Sabtu" />
            </div>
            <div>
              <label style={labelStyle}>Jam buka</label>
              <input style={inputStyle} value={form.jam_buka} onChange={e => update('jam_buka', e.target.value)} placeholder="08.00 - 21.00 WIB" />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Pesan saat di luar jam operasional</label>
            <textarea rows={3} style={{ ...inputStyle, resize: 'none' }} value={form.pesan_di_luar_jam} onChange={e => update('pesan_di_luar_jam', e.target.value)} placeholder="Maaf, kami sedang tutup. Jam operasional kami adalah Senin-Sabtu 08.00-21.00. Pesan kamu akan kami balas segera saat buka! 😊" />
            <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.25)', marginTop: '4px', display: 'block' }}>Bot akan kirim pesan ini saat ada yang chat di luar jam operasional</span>
          </div>
        </div>
      )}

      {/* Tab: Pengaturan Bot */}
      {activeTab === 'bot' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={labelStyle}>Pesan sambutan</label>
            <textarea rows={3} style={{ ...inputStyle, resize: 'none' }} value={form.pesan_sambutan} onChange={e => update('pesan_sambutan', e.target.value)} placeholder="Halo! Selamat datang di toko kami 😊 Ada yang bisa kami bantu?" />
            <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.25)', marginTop: '4px', display: 'block' }}>Pesan pertama yang dikirim bot saat ada pelanggan baru chat</span>
          </div>

          <div>
            <label style={labelStyle}>Instruksi khusus untuk bot</label>
            <textarea rows={4} style={{ ...inputStyle, resize: 'none' }} value={form.instruksi_bot} onChange={e => update('instruksi_bot', e.target.value)} placeholder="Contoh: Selalu tawarkan free ongkir untuk pembelian di atas Rp 100.000. Jangan sebut kompetitor. Selalu gunakan bahasa yang ramah dan sopan." />
            <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.25)', marginTop: '4px', display: 'block' }}>Instruksi ini akan diikuti bot saat menjawab semua pertanyaan pelanggan</span>
          </div>

          <div>
            <label style={labelStyle}>Bahasa bot</label>
            <select style={{ ...inputStyle, appearance: 'none' }} value={form.bahasa_bot} onChange={e => update('bahasa_bot', e.target.value)}>
              <option value="indonesia" style={{ background: '#111827' }}>🇮🇩 Bahasa Indonesia</option>
              <option value="inggris" style={{ background: '#111827' }}>🇬🇧 English</option>
              <option value="jawa" style={{ background: '#111827' }}>Bahasa Jawa</option>
              <option value="sunda" style={{ background: '#111827' }}>Bahasa Sunda</option>
            </select>
          </div>

          {/* Tips */}
          <div style={{ background: 'rgba(37,211,102,0.05)', border: '1px solid rgba(37,211,102,0.15)', borderRadius: '12px', padding: '14px 16px' }}>
            <p style={{ fontSize: '0.78rem', fontWeight: 700, color: '#25d366', marginBottom: '8px' }}>💡 Tips instruksi bot yang efektif:</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              {[
                'Tentukan tone: "Gunakan bahasa santai dan ramah seperti teman"',
                'Batasan: "Jangan bahas topik di luar produk kami"',
                'Promosi: "Selalu tawarkan promo bundling untuk pembelian 2 item"',
                'Eskalasi: "Jika pelanggan komplain, segera arahkan ke admin"',
              ].map((tip, i) => (
                <div key={i} style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', display: 'flex', gap: '6px' }}>
                  <span style={{ color: '#25d366' }}>·</span> {tip}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tombol simpan bawah */}
      <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
        {saved && (
          <div style={{ background: 'rgba(37,211,102,0.15)', border: '1px solid rgba(37,211,102,0.3)', borderRadius: '8px', padding: '10px 14px', fontSize: '0.8rem', color: '#25d366' }}>
            ✅ Perubahan berhasil disimpan!
          </div>
        )}
        <button
          onClick={handleSave}
          disabled={saving}
          style={{ background: saving ? 'rgba(37,211,102,0.4)' : 'linear-gradient(135deg,#25d366,#128c7e)', color: '#fff', padding: '12px 28px', borderRadius: '10px', border: 'none', fontWeight: 700, fontSize: '0.9rem', fontFamily: 'inherit', cursor: saving ? 'not-allowed' : 'pointer' }}
        >
          {saving ? 'Menyimpan...' : '💾 Simpan Perubahan'}
        </button>
      </div>
    </div>
  )
}
