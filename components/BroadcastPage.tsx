'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Broadcast {
  id: string
  judul: string
  pesan: string
  total_target: number
  total_terkirim: number
  total_gagal: number
  status: string
  delay_detik: number
  mulai_at: string
  selesai_at: string
  created_at: string
}

interface Kontak {
  nomor: string
  nama: string
  terakhir_chat: string
}

interface BroadcastPageProps {
  storeId: string
  clientId: string
  clientPaket: string
}

export default function BroadcastPage({ storeId, clientId, clientPaket }: BroadcastPageProps) {
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [kontakList, setKontakList] = useState<Kontak[]>([])
  const [selectedKontak, setSelectedKontak] = useState<Set<string>>(new Set())
  const [targetMode, setTargetMode] = useState<'semua' | 'pilih'>('semua')
  const [searchKontak, setSearchKontak] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [pollingId, setPollingId] = useState<string | null>(null)
  const [form, setForm] = useState({
    judul: '',
    pesan: '',
    delay_detik: 4,
  })

  const isPro = clientPaket === 'pro' || clientPaket === 'bisnis' || clientPaket === 'enterprise'

  useEffect(() => {
    if (storeId) {
      loadBroadcasts()
      loadKontak()
    }
  }, [storeId])

  useEffect(() => {
    if (!pollingId) return
    const interval = setInterval(async () => {
      const { data } = await supabase
        .from('broadcasts')
        .select('*')
        .eq('id', pollingId)
        .single()
      if (data) {
        setBroadcasts(prev => prev.map(b => b.id === pollingId ? data : b))
        if (data.status === 'selesai' || data.status === 'gagal') {
          setPollingId(null)
          clearInterval(interval)
        }
      }
    }, 3000)
    return () => clearInterval(interval)
  }, [pollingId])

  const loadBroadcasts = async () => {
    setLoading(true)
    const response = await fetch(`/api/broadcast?store_id=${storeId}`)
    const data = await response.json()
    setBroadcasts(data.data || [])
    setLoading(false)
  }

  const loadKontak = async () => {
    const { data } = await supabase
      .from('conversations')
      .select('nomor_pelanggan, nama_pelanggan, created_at')
      .eq('store_id', storeId)
      .not('nomor_pelanggan', 'is', null)
      .order('created_at', { ascending: false })

    if (data) {
      const kontakMap = new Map<string, Kontak>()
      for (const conv of data) {
        if (!kontakMap.has(conv.nomor_pelanggan)) {
          kontakMap.set(conv.nomor_pelanggan, {
            nomor: conv.nomor_pelanggan,
            nama: conv.nama_pelanggan || '',
            terakhir_chat: conv.created_at,
          })
        }
      }
      setKontakList(Array.from(kontakMap.values()))
    }
  }

  const totalKontak = kontakList.length
  const kontakTerpilih = targetMode === 'semua' ? totalKontak : selectedKontak.size

  const filteredKontak = kontakList.filter(k =>
    k.nomor.includes(searchKontak) ||
    k.nama.toLowerCase().includes(searchKontak.toLowerCase())
  )

  const toggleKontak = (nomor: string) => {
    setSelectedKontak(prev => {
      const next = new Set(prev)
      if (next.has(nomor)) next.delete(nomor)
      else next.add(nomor)
      return next
    })
  }

  const toggleSemuaKontak = () => {
    if (selectedKontak.size === filteredKontak.length) {
      setSelectedKontak(new Set())
    } else {
      setSelectedKontak(new Set(filteredKontak.map(k => k.nomor)))
    }
  }

  const handleKirim = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!form.judul.trim() || !form.pesan.trim()) {
      setError('Judul dan pesan wajib diisi.')
      return
    }
    if (form.pesan.length > 1000) {
      setError('Pesan terlalu panjang. Maksimal 1000 karakter.')
      return
    }
    if (targetMode === 'pilih' && selectedKontak.size === 0) {
      setError('Pilih minimal 1 kontak untuk dikirim.')
      return
    }

    setSending(true)
    try {
      const nomorTerpilih = targetMode === 'pilih'
        ? Array.from(selectedKontak)
        : null // null = kirim ke semua

      const response = await fetch('/api/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          store_id: storeId,
          client_id: clientId,
          judul: form.judul,
          pesan: form.pesan,
          delay_detik: form.delay_detik,
          nomor_terpilih: nomorTerpilih,
        })
      })

      const result = await response.json()
      if (!response.ok) {
        setError(result.error || 'Gagal mengirim broadcast.')
        return
      }

      setSuccess(result.message)
      setShowForm(false)
      setForm({ judul: '', pesan: '', delay_detik: 4 })
      setSelectedKontak(new Set())
      setTargetMode('semua')
      await loadBroadcasts()
      setPollingId(result.broadcast_id)
    } catch {
      setError('Terjadi kesalahan. Coba lagi.')
    } finally {
      setSending(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const map: Record<string, { label: string, bg: string, color: string }> = {
      draft: { label: 'Draft', bg: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' },
      proses: { label: '⏳ Sedang Kirim...', bg: 'rgba(239,159,39,0.15)', color: '#EF9F27' },
      selesai: { label: '✅ Selesai', bg: 'rgba(37,211,102,0.12)', color: '#25d366' },
      gagal: { label: '❌ Gagal', bg: 'rgba(239,68,68,0.12)', color: '#EF4444' },
    }
    const s = map[status] || map.draft
    return (
      <span style={{ background: s.bg, color: s.color, padding: '3px 10px', borderRadius: '100px', fontSize: '0.72rem', fontWeight: 700 }}>
        {s.label}
      </span>
    )
  }

  const persen = (terkirim: number, target: number) =>
    target > 0 ? Math.round((terkirim / target) * 100) : 0

  const estimasiWaktu = (total: number, delay: number) => {
    const menit = Math.ceil((total * delay) / 60)
    return menit < 60 ? `~${menit} menit` : `~${Math.ceil(menit / 60)} jam`
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#fff',
    padding: '11px 14px',
    borderRadius: '10px',
    fontSize: '0.875rem',
    fontFamily: 'inherit',
    outline: 'none',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.78rem',
    fontWeight: 600,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: '5px',
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '4px' }}>Broadcast & Kampanye</h2>
          <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>
            {totalKontak} kontak tersedia untuk broadcast
          </p>
        </div>
        {isPro && (
          <button
            onClick={() => { setShowForm(true); setError(''); setSuccess('') }}
            style={{ background: 'linear-gradient(135deg,#25d366,#128c7e)', color: '#fff', padding: '10px 20px', borderRadius: '10px', border: 'none', fontWeight: 700, fontSize: '0.85rem', fontFamily: 'inherit', cursor: 'pointer' }}
          >
            📢 Buat Broadcast
          </button>
        )}
      </div>

      {/* Upgrade notice */}
      {!isPro && (
        <div style={{ background: 'rgba(239,159,39,0.08)', border: '1px solid rgba(239,159,39,0.2)', borderRadius: '16px', padding: '24px', marginBottom: '24px', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '12px' }}>📢</div>
          <h3 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '8px' }}>Fitur Broadcast tersedia di Paket Pro</h3>
          <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)', marginBottom: '16px', lineHeight: 1.6 }}>
            Kirim promo ke semua atau sebagian pelanggan sekaligus.<br/>
            Pilih kontak, delay anti-banned, personalisasi nama.
          </p>
          <a href="#" style={{ display: 'inline-block', background: 'linear-gradient(135deg,#25d366,#128c7e)', color: '#fff', padding: '11px 24px', borderRadius: '10px', textDecoration: 'none', fontWeight: 700, fontSize: '0.875rem' }}>
            Upgrade ke Pro — Rp 299.000/bln
          </a>
        </div>
      )}

      {/* Stats */}
      {isPro && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', marginBottom: '24px' }}>
          {[
            { label: 'Total Kontak', value: totalKontak.toLocaleString('id-ID'), icon: '👥', color: '#25d366' },
            { label: 'Broadcast Dikirim', value: broadcasts.filter(b => b.status === 'selesai').length.toString(), icon: '✅', color: '#25d366' },
            { label: 'Total Pesan Terkirim', value: broadcasts.reduce((a, b) => a + b.total_terkirim, 0).toLocaleString('id-ID'), icon: '📨', color: '#25d366' },
          ].map(stat => (
            <div key={stat.label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '16px' }}>
              <div style={{ fontSize: '1.4rem', marginBottom: '6px' }}>{stat.icon}</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: stat.color, marginBottom: '2px' }}>{stat.value}</div>
              <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Form broadcast */}
      {showForm && isPro && (
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(37,211,102,0.2)', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontWeight: 700, fontSize: '0.95rem' }}>📢 Buat Broadcast Baru</h3>
            <button onClick={() => { setShowForm(false); setSelectedKontak(new Set()); setTargetMode('semua') }} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '1.2rem' }}>×</button>
          </div>

          <form onSubmit={handleKirim} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Judul */}
            <div>
              <label style={labelStyle}>Judul kampanye <span style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 400 }}>(catatan internal)</span></label>
              <input required style={inputStyle} placeholder="Contoh: Promo Lebaran 2026" value={form.judul} onChange={e => setForm(p => ({ ...p, judul: e.target.value }))} />
            </div>

            {/* Pilih Target */}
            <div>
              <label style={labelStyle}>Target penerima</label>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                <button
                  type="button"
                  onClick={() => { setTargetMode('semua'); setSelectedKontak(new Set()) }}
                  style={{ flex: 1, padding: '10px', borderRadius: '10px', border: `1px solid ${targetMode === 'semua' ? '#25d366' : 'rgba(255,255,255,0.1)'}`, background: targetMode === 'semua' ? 'rgba(37,211,102,0.1)' : 'transparent', color: targetMode === 'semua' ? '#25d366' : 'rgba(255,255,255,0.5)', cursor: 'pointer', fontFamily: 'inherit', fontWeight: targetMode === 'semua' ? 700 : 500, fontSize: '0.82rem' }}
                >
                  👥 Semua Kontak ({totalKontak})
                </button>
                <button
                  type="button"
                  onClick={() => setTargetMode('pilih')}
                  style={{ flex: 1, padding: '10px', borderRadius: '10px', border: `1px solid ${targetMode === 'pilih' ? '#25d366' : 'rgba(255,255,255,0.1)'}`, background: targetMode === 'pilih' ? 'rgba(37,211,102,0.1)' : 'transparent', color: targetMode === 'pilih' ? '#25d366' : 'rgba(255,255,255,0.5)', cursor: 'pointer', fontFamily: 'inherit', fontWeight: targetMode === 'pilih' ? 700 : 500, fontSize: '0.82rem' }}
                >
                  ✋ Pilih Manual {targetMode === 'pilih' && selectedKontak.size > 0 ? `(${selectedKontak.size})` : ''}
                </button>
              </div>

              {/* Daftar kontak untuk dipilih */}
              {targetMode === 'pilih' && (
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', overflow: 'hidden' }}>
                  {/* Search + Select All */}
                  <div style={{ padding: '12px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      style={{ ...inputStyle, padding: '8px 12px', fontSize: '0.82rem' }}
                      placeholder="🔍 Cari nama atau nomor..."
                      value={searchKontak}
                      onChange={e => setSearchKontak(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={toggleSemuaKontak}
                      style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid rgba(37,211,102,0.3)', background: 'transparent', color: '#25d366', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.75rem', fontWeight: 600, whiteSpace: 'nowrap' }}
                    >
                      {selectedKontak.size === filteredKontak.length ? 'Batal Semua' : 'Pilih Semua'}
                    </button>
                  </div>

                  {/* List kontak */}
                  <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
                    {filteredKontak.length === 0 ? (
                      <div style={{ padding: '24px', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '0.82rem' }}>
                        Tidak ada kontak ditemukan
                      </div>
                    ) : (
                      filteredKontak.map((k, i) => (
                        <div
                          key={k.nomor}
                          onClick={() => toggleKontak(k.nomor)}
                          style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', borderTop: i > 0 ? '1px solid rgba(255,255,255,0.04)' : 'none', cursor: 'pointer', background: selectedKontak.has(k.nomor) ? 'rgba(37,211,102,0.06)' : 'transparent', transition: 'background 0.15s' }}
                        >
                          <div style={{ width: '18px', height: '18px', borderRadius: '4px', border: `2px solid ${selectedKontak.has(k.nomor) ? '#25d366' : 'rgba(255,255,255,0.2)'}`, background: selectedKontak.has(k.nomor) ? '#25d366' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s' }}>
                            {selectedKontak.has(k.nomor) && <span style={{ color: '#070d1a', fontSize: '11px', fontWeight: 800 }}>✓</span>}
                          </div>
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', flexShrink: 0 }}>👤</div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 600, fontSize: '0.82rem' }}>{k.nama || k.nomor}</div>
                            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>{k.nomor}</div>
                          </div>
                          <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.3)', flexShrink: 0 }}>
                            {new Date(k.terakhir_chat).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Footer info */}
                  <div style={{ padding: '10px 14px', borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>
                      {selectedKontak.size} dari {totalKontak} kontak dipilih
                    </span>
                    {selectedKontak.size > 0 && (
                      <button type="button" onClick={() => setSelectedKontak(new Set())} style={{ fontSize: '0.72rem', color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                        Hapus pilihan
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Pesan */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                <label style={{ ...labelStyle, marginBottom: 0 }}>Isi pesan *</label>
                <span style={{ fontSize: '0.7rem', color: form.pesan.length > 900 ? '#EF4444' : 'rgba(255,255,255,0.3)' }}>
                  {form.pesan.length}/1000
                </span>
              </div>
              <textarea
                required
                rows={5}
                style={{ ...inputStyle, resize: 'none' }}
                placeholder={`Halo {nama}! 👋\n\nAda promo spesial buat kamu hari ini...`}
                value={form.pesan}
                onChange={e => setForm(p => ({ ...p, pesan: e.target.value }))}
              />
              <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', marginTop: '5px' }}>
                💡 Gunakan <code style={{ background: 'rgba(255,255,255,0.08)', padding: '1px 5px', borderRadius: '4px' }}>{'{nama}'}</code> untuk personalisasi nama pelanggan
              </p>
            </div>

            {/* Delay */}
            <div>
              <label style={labelStyle}>Delay antar pesan <span style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 400 }}>(anti-banned)</span></label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[3, 4, 5, 8, 10].map(d => (
                  <button key={d} type="button" onClick={() => setForm(p => ({ ...p, delay_detik: d }))}
                    style={{ padding: '8px 16px', borderRadius: '8px', border: `1px solid ${form.delay_detik === d ? '#25d366' : 'rgba(255,255,255,0.1)'}`, background: form.delay_detik === d ? 'rgba(37,211,102,0.15)' : 'transparent', color: form.delay_detik === d ? '#25d366' : 'rgba(255,255,255,0.5)', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.82rem', fontWeight: form.delay_detik === d ? 700 : 400 }}>
                    {d}s
                  </button>
                ))}
              </div>
              <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', marginTop: '6px' }}>⚠️ Delay lebih lama = lebih aman dari banned. Minimal 4 detik.</p>
            </div>

            {error && (
              <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '10px', padding: '11px 14px', fontSize: '0.82rem', color: '#fca5a5' }}>⚠️ {error}</div>
            )}

            {/* Ringkasan */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', padding: '14px 16px' }}>
              <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', marginBottom: '8px', fontWeight: 600 }}>Ringkasan broadcast:</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)' }}>
                  📨 Dikirim ke: <strong style={{ color: '#25d366' }}>
                    {targetMode === 'semua' ? `${totalKontak} kontak (semua)` : `${selectedKontak.size} kontak terpilih`}
                  </strong>
                </p>
                <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)' }}>⏱️ Estimasi waktu: <strong style={{ color: '#fff' }}>{estimasiWaktu(kontakTerpilih, form.delay_detik)}</strong></p>
                <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)' }}>🛡️ Delay per pesan: <strong style={{ color: '#fff' }}>{form.delay_detik} detik</strong></p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="button" onClick={() => { setShowForm(false); setSelectedKontak(new Set()); setTargetMode('semua') }} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>
                Batal
              </button>
              <button type="submit" disabled={sending || kontakTerpilih === 0}
                style={{ flex: 2, background: sending || kontakTerpilih === 0 ? 'rgba(37,211,102,0.4)' : 'linear-gradient(135deg,#25d366,#128c7e)', color: '#fff', padding: '12px', borderRadius: '10px', border: 'none', fontWeight: 700, fontSize: '0.9rem', fontFamily: 'inherit', cursor: sending || kontakTerpilih === 0 ? 'not-allowed' : 'pointer' }}>
                {sending ? '⏳ Memulai broadcast...' : `📢 Kirim ke ${kontakTerpilih} Kontak`}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Sukses */}
      {success && (
        <div style={{ background: 'rgba(37,211,102,0.08)', border: '1px solid rgba(37,211,102,0.25)', borderRadius: '12px', padding: '14px 18px', marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
          <span style={{ fontSize: '1.2rem' }}>✅</span>
          <div>
            <p style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '2px' }}>Broadcast dimulai!</p>
            <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)' }}>{success}</p>
          </div>
        </div>
      )}

      {/* Riwayat */}
      {isPro && (
        <div>
          <h3 style={{ fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.72rem' }}>
            Riwayat Broadcast
          </h3>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.3)' }}>⏳ Memuat...</div>
          ) : broadcasts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px' }}>
              <div style={{ fontSize: '2rem', marginBottom: '12px' }}>📢</div>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.875rem' }}>Belum ada broadcast. Buat yang pertama!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {broadcasts.map(bc => (
                <div key={bc.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '18px 20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', gap: '12px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>{bc.judul}</span>
                        {getStatusBadge(bc.status)}
                      </div>
                      <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)' }}>
                        {new Date(bc.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '8px', padding: '10px 12px', marginBottom: '12px' }}>
                    <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                      {bc.pesan.length > 120 ? bc.pesan.substring(0, 120) + '...' : bc.pesan}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', marginBottom: '5px' }}>
                        <span>{bc.total_terkirim} terkirim dari {bc.total_target}</span>
                        <span>{persen(bc.total_terkirim, bc.total_target)}%</span>
                      </div>
                      <div style={{ height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '100px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${persen(bc.total_terkirim, bc.total_target)}%`, background: bc.status === 'selesai' ? '#25d366' : '#EF9F27', borderRadius: '100px', transition: 'width 0.5s' }} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', fontSize: '0.72rem' }}>
                      <span style={{ color: '#25d366' }}>✓ {bc.total_terkirim}</span>
                      {bc.total_gagal > 0 && <span style={{ color: '#EF4444' }}>✗ {bc.total_gagal}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
