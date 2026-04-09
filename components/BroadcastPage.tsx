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
  const [totalKontak, setTotalKontak] = useState(0)
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
      loadTotalKontak()
    }
  }, [storeId])

  // Polling status broadcast yang sedang proses
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

  const loadTotalKontak = async () => {
    const { data } = await supabase
      .from('conversations')
      .select('nomor_pelanggan')
      .eq('store_id', storeId)
      .not('nomor_pelanggan', 'is', null)

    if (data) {
      const unik = new Set(data.map(c => c.nomor_pelanggan))
      setTotalKontak(unik.size)
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

    setSending(true)

    try {
      const response = await fetch('/api/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          store_id: storeId,
          client_id: clientId,
          judul: form.judul,
          pesan: form.pesan,
          delay_detik: form.delay_detik,
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

      // Tambah broadcast baru ke list dan mulai polling
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
            Kirim pesan promo ke {totalKontak} kontak yang pernah chat
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

      {/* Upgrade notice untuk Starter */}
      {!isPro && (
        <div style={{ background: 'rgba(239,159,39,0.08)', border: '1px solid rgba(239,159,39,0.2)', borderRadius: '16px', padding: '24px', marginBottom: '24px', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '12px' }}>📢</div>
          <h3 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '8px' }}>Fitur Broadcast tersedia di Paket Pro</h3>
          <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)', marginBottom: '16px', lineHeight: 1.6 }}>
            Kirim promo ke semua pelanggan yang pernah chat sekaligus.<br />
            Jadwal otomatis, delay anti-banned, personalisasi nama.
          </p>
          <a href="#" onClick={() => {}} style={{ display: 'inline-block', background: 'linear-gradient(135deg,#25d366,#128c7e)', color: '#fff', padding: '11px 24px', borderRadius: '10px', textDecoration: 'none', fontWeight: 700, fontSize: '0.875rem' }}>
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

      {/* Form buat broadcast */}
      {showForm && isPro && (
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(37,211,102,0.2)', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontWeight: 700, fontSize: '0.95rem' }}>📢 Buat Broadcast Baru</h3>
            <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '1.2rem' }}>×</button>
          </div>

          {/* Info kontak */}
          <div style={{ background: 'rgba(37,211,102,0.06)', border: '1px solid rgba(37,211,102,0.15)', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)' }}>
              👥 Target: <strong style={{ color: '#25d366' }}>{totalKontak} kontak</strong> yang pernah chat
            </span>
            <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>
              Estimasi: {estimasiWaktu(totalKontak, form.delay_detik)}
            </span>
          </div>

          <form onSubmit={handleKirim} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Judul kampanye <span style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 400 }}>(untuk catatan internal)</span></label>
              <input
                required
                style={inputStyle}
                placeholder="Contoh: Promo Lebaran 2026, Flash Sale Akhir Bulan"
                value={form.judul}
                onChange={e => setForm(p => ({ ...p, judul: e.target.value }))}
              />
            </div>

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
                placeholder={`Halo {nama}! 👋\n\nAda promo spesial buat kamu hari ini...\n\nGunakan {nama} untuk personalisasi nama pelanggan.`}
                value={form.pesan}
                onChange={e => setForm(p => ({ ...p, pesan: e.target.value }))}
              />
              <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', marginTop: '5px' }}>
                💡 Gunakan <code style={{ background: 'rgba(255,255,255,0.08)', padding: '1px 5px', borderRadius: '4px' }}>{'{nama}'}</code> untuk menyisipkan nama pelanggan secara otomatis
              </p>
            </div>

            <div>
              <label style={labelStyle}>Delay antar pesan <span style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 400 }}>(anti-banned)</span></label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[3, 4, 5, 8, 10].map(d => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setForm(p => ({ ...p, delay_detik: d }))}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: `1px solid ${form.delay_detik === d ? '#25d366' : 'rgba(255,255,255,0.1)'}`,
                      background: form.delay_detik === d ? 'rgba(37,211,102,0.15)' : 'transparent',
                      color: form.delay_detik === d ? '#25d366' : 'rgba(255,255,255,0.5)',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      fontSize: '0.82rem',
                      fontWeight: form.delay_detik === d ? 700 : 400,
                    }}
                  >
                    {d}s
                  </button>
                ))}
              </div>
              <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', marginTop: '6px' }}>
                ⚠️ Delay lebih lama = lebih aman dari banned. Disarankan minimal 4 detik.
              </p>
            </div>

            {error && (
              <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '10px', padding: '11px 14px', fontSize: '0.82rem', color: '#fca5a5' }}>
                ⚠️ {error}
              </div>
            )}

            {/* Preview estimasi */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', padding: '14px 16px' }}>
              <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', marginBottom: '8px', fontWeight: 600 }}>Ringkasan broadcast:</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)' }}>📨 Dikirim ke: <strong style={{ color: '#fff' }}>{totalKontak} kontak</strong></p>
                <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)' }}>⏱️ Estimasi waktu: <strong style={{ color: '#fff' }}>{estimasiWaktu(totalKontak, form.delay_detik)}</strong></p>
                <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)' }}>🛡️ Delay per pesan: <strong style={{ color: '#fff' }}>{form.delay_detik} detik</strong></p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={sending || totalKontak === 0}
                style={{ flex: 2, background: sending || totalKontak === 0 ? 'rgba(37,211,102,0.4)' : 'linear-gradient(135deg,#25d366,#128c7e)', color: '#fff', padding: '12px', borderRadius: '10px', border: 'none', fontWeight: 700, fontSize: '0.9rem', fontFamily: 'inherit', cursor: sending || totalKontak === 0 ? 'not-allowed' : 'pointer' }}
              >
                {sending ? '⏳ Memulai broadcast...' : `📢 Kirim ke ${totalKontak} Kontak`}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Notifikasi sukses */}
      {success && (
        <div style={{ background: 'rgba(37,211,102,0.08)', border: '1px solid rgba(37,211,102,0.25)', borderRadius: '12px', padding: '14px 18px', marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
          <span style={{ fontSize: '1.2rem' }}>✅</span>
          <div>
            <p style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '2px' }}>Broadcast dimulai!</p>
            <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)' }}>{success}</p>
          </div>
        </div>
      )}

      {/* Daftar broadcast */}
      {isPro && (
        <div>
          <h3 style={{ fontWeight: 600, fontSize: '0.875rem', color: 'rgba(255,255,255,0.6)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.72rem' }}>
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

                  {/* Pesan preview */}
                  <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '8px', padding: '10px 12px', marginBottom: '12px' }}>
                    <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                      {bc.pesan.length > 120 ? bc.pesan.substring(0, 120) + '...' : bc.pesan}
                    </p>
                  </div>

                  {/* Progress */}
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
