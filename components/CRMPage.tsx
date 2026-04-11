'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface CRMPageProps {
  storeId: string
  clientPaket: string
}

interface Kontak {
  id: string
  nomor_pelanggan: string
  nama_pelanggan: string
  nama_custom: string
  label: string
  catatan: string
  last_message_at: string
  sesi_aktif: boolean
  created_at: string
}

const LABELS = [
  { kode: 'biasa', label: 'Biasa', icon: '👤', color: 'rgba(255,255,255,0.1)', text: 'rgba(255,255,255,0.5)' },
  { kode: 'prospek', label: 'Prospek', icon: '🎯', color: 'rgba(59,130,246,0.15)', text: '#378ADD' },
  { kode: 'panas', label: 'Prospek Panas', icon: '🔥', color: 'rgba(239,159,39,0.15)', text: '#EF9F27' },
  { kode: 'pelanggan', label: 'Pelanggan', icon: '✅', color: 'rgba(37,211,102,0.12)', text: '#25d366' },
  { kode: 'vip', label: 'VIP', icon: '👑', color: 'rgba(234,179,8,0.15)', text: '#EAB308' },
  { kode: 'followup', label: 'Follow Up', icon: '📞', color: 'rgba(168,85,247,0.15)', text: '#A855F7' },
  { kode: 'tidak_aktif', label: 'Tidak Aktif', icon: '😴', color: 'rgba(255,255,255,0.05)', text: 'rgba(255,255,255,0.3)' },
]

export default function CRMPage({ storeId, clientPaket }: CRMPageProps) {
  const [kontak, setKontak] = useState<Kontak[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [filterLabel, setFilterLabel] = useState('semua')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Kontak | null>(null)
  const [editForm, setEditForm] = useState({ nama_custom: '', label: 'biasa', catatan: '' })

  const isPro = clientPaket === 'pro' || clientPaket === 'bisnis' || clientPaket === 'enterprise'

  useEffect(() => {
    if (storeId && isPro) loadKontak()
  }, [storeId, filterLabel])

  const loadKontak = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('bot_sessions')
        .select('*')
        .eq('store_id', storeId)
        .order('last_message_at', { ascending: false })

      if (filterLabel !== 'semua') {
        query = query.eq('label', filterLabel)
      }

      const { data } = await query
      setKontak(data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectKontak = (k: Kontak) => {
    setSelected(k)
    setEditForm({
      nama_custom: k.nama_custom || k.nama_pelanggan || '',
      label: k.label || 'biasa',
      catatan: k.catatan || '',
    })
  }

  const handleSave = async () => {
    if (!selected) return
    setSaving(selected.id)
    try {
      await supabase
        .from('bot_sessions')
        .update({
          nama_custom: editForm.nama_custom,
          label: editForm.label,
          catatan: editForm.catatan,
          updated_at: new Date().toISOString(),
        })
        .eq('id', selected.id)

      setKontak(prev => prev.map(k => k.id === selected.id
        ? { ...k, nama_custom: editForm.nama_custom, label: editForm.label, catatan: editForm.catatan }
        : k
      ))
      setSelected(prev => prev ? { ...prev, nama_custom: editForm.nama_custom, label: editForm.label, catatan: editForm.catatan } : null)
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(null)
    }
  }

  const getLabelInfo = (kode: string) => LABELS.find(l => l.kode === kode) || LABELS[0]

  const formatWaktu = (str: string) => {
    const d = new Date(str)
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    const menit = Math.floor(diff / 60000)
    const jam = Math.floor(diff / 3600000)
    const hari = Math.floor(diff / 86400000)
    if (menit < 60) return `${menit} menit lalu`
    if (jam < 24) return `${jam} jam lalu`
    if (hari < 7) return `${hari} hari lalu`
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
  }

  const filteredKontak = kontak.filter(k => {
    const nama = k.nama_custom || k.nama_pelanggan || k.nomor_pelanggan
    return nama.toLowerCase().includes(search.toLowerCase()) ||
      k.nomor_pelanggan.includes(search)
  })

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#fff',
    padding: '10px 12px',
    borderRadius: '8px',
    fontSize: '0.875rem',
    fontFamily: 'inherit',
    outline: 'none',
  }

  if (!isPro) {
    return (
      <div>
        <h2 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '20px' }}>CRM Pelanggan</h2>
        <div style={{ background: 'rgba(239,159,39,0.08)', border: '1px solid rgba(239,159,39,0.2)', borderRadius: '16px', padding: '40px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>👥</div>
          <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '8px' }}>Fitur CRM tersedia di Paket Pro</h3>
          <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)', marginBottom: '20px', lineHeight: 1.6 }}>
            Kelola semua kontak pelanggan, beri label VIP atau Prospek,<br />
            tambahkan catatan, dan pantau aktivitas pelanggan setia kamu.
          </p>
          <a
            href="#"
            style={{ display: 'inline-block', background: 'linear-gradient(135deg,#25d366,#128c7e)', color: '#fff', padding: '11px 24px', borderRadius: '10px', textDecoration: 'none', fontWeight: 700, fontSize: '0.875rem' }}
          >
            Upgrade ke Pro — Rp 299.000/bln
          </a>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '4px' }}>CRM Pelanggan</h2>
          <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>
            {kontak.length} kontak terdaftar
          </p>
        </div>
      </div>

      {/* Summary label */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setFilterLabel('semua')}
          style={{ padding: '6px 14px', borderRadius: '100px', border: `1px solid ${filterLabel === 'semua' ? '#25d366' : 'rgba(255,255,255,0.1)'}`, background: filterLabel === 'semua' ? 'rgba(37,211,102,0.1)' : 'transparent', color: filterLabel === 'semua' ? '#25d366' : 'rgba(255,255,255,0.5)', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.78rem', fontWeight: filterLabel === 'semua' ? 700 : 400 }}
        >
          Semua ({kontak.length})
        </button>
        {LABELS.filter(l => l.kode !== 'biasa').map(l => {
          const count = kontak.filter(k => k.label === l.kode).length
          if (count === 0) return null
          return (
            <button
              key={l.kode}
              onClick={() => setFilterLabel(l.kode)}
              style={{ padding: '6px 14px', borderRadius: '100px', border: `1px solid ${filterLabel === l.kode ? l.text : 'rgba(255,255,255,0.1)'}`, background: filterLabel === l.kode ? l.color : 'transparent', color: filterLabel === l.kode ? l.text : 'rgba(255,255,255,0.5)', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.78rem', fontWeight: filterLabel === l.kode ? 700 : 400 }}
            >
              {l.icon} {l.label} ({count})
            </button>
          )
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 340px' : '1fr', gap: '16px' }}>

        {/* List kontak */}
        <div>
          {/* Search */}
          <input
            style={{ ...inputStyle, marginBottom: '12px' }}
            placeholder="🔍 Cari nama atau nomor..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.3)' }}>⏳ Memuat...</div>
          ) : filteredKontak.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px' }}>
              <div style={{ fontSize: '2rem', marginBottom: '12px' }}>👥</div>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.875rem' }}>
                {kontak.length === 0
                  ? 'Belum ada kontak. Bot harus sudah pernah menerima pesan.'
                  : 'Tidak ada kontak dengan filter ini.'
                }
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {filteredKontak.map(k => {
                const labelInfo = getLabelInfo(k.label)
                const nama = k.nama_custom || k.nama_pelanggan || k.nomor_pelanggan
                const isActive = selected?.id === k.id
                return (
                  <div
                    key={k.id}
                    onClick={() => handleSelectKontak(k)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 16px',
                      background: isActive ? 'rgba(37,211,102,0.06)' : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${isActive ? 'rgba(37,211,102,0.2)' : 'rgba(255,255,255,0.06)'}`,
                      borderRadius: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    {/* Avatar */}
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>
                      {labelInfo.icon}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{nama}</span>
                        <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', flexShrink: 0 }}>{formatWaktu(k.last_message_at)}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)' }}>{k.nomor_pelanggan}</span>
                        {k.label !== 'biasa' && (
                          <span style={{ fontSize: '0.68rem', padding: '2px 7px', borderRadius: '100px', background: labelInfo.color, color: labelInfo.text, fontWeight: 600 }}>
                            {labelInfo.label}
                          </span>
                        )}
                      </div>
                      {k.catatan && (
                        <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', marginTop: '3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          📝 {k.catatan}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Detail & Edit panel */}
        {selected && (
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '20px', height: 'fit-content', position: 'sticky', top: '80px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontWeight: 700, fontSize: '0.9rem' }}>Detail Kontak</h3>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '1.2rem' }}>×</button>
            </div>

            {/* Nomor */}
            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '12px 14px', marginBottom: '16px' }}>
              <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginBottom: '3px' }}>Nomor WhatsApp</div>
              <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{selected.nomor_pelanggan}</div>
              <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', marginTop: '3px' }}>
                Pertama chat: {new Date(selected.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
            </div>

            {/* Form edit */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: '5px' }}>Nama</label>
                <input
                  style={inputStyle}
                  placeholder="Nama pelanggan"
                  value={editForm.nama_custom}
                  onChange={e => setEditForm(p => ({ ...p, nama_custom: e.target.value }))}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: '5px' }}>Label</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {LABELS.map(l => (
                    <button
                      key={l.kode}
                      onClick={() => setEditForm(p => ({ ...p, label: l.kode }))}
                      style={{
                        padding: '5px 10px',
                        borderRadius: '100px',
                        border: `1px solid ${editForm.label === l.kode ? l.text : 'rgba(255,255,255,0.1)'}`,
                        background: editForm.label === l.kode ? l.color : 'transparent',
                        color: editForm.label === l.kode ? l.text : 'rgba(255,255,255,0.45)',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        fontSize: '0.72rem',
                        fontWeight: editForm.label === l.kode ? 700 : 400,
                      }}
                    >
                      {l.icon} {l.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: '5px' }}>Catatan</label>
                <textarea
                  rows={3}
                  style={{ ...inputStyle, resize: 'none' }}
                  placeholder="Catatan tentang pelanggan ini..."
                  value={editForm.catatan}
                  onChange={e => setEditForm(p => ({ ...p, catatan: e.target.value }))}
                />
              </div>

              <button
                onClick={handleSave}
                disabled={saving === selected.id}
                style={{ background: saving === selected.id ? 'rgba(37,211,102,0.4)' : 'linear-gradient(135deg,#25d366,#128c7e)', color: '#fff', padding: '11px', borderRadius: '10px', border: 'none', fontWeight: 700, fontSize: '0.875rem', cursor: saving === selected.id ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}
              >
                {saving === selected.id ? '⏳ Menyimpan...' : '💾 Simpan Perubahan'}
              </button>

              {/* Link chat WA */}
              <a
                href={`https://wa.me/${selected.nomor_pelanggan}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'block', textAlign: 'center', background: 'rgba(37,211,102,0.08)', border: '1px solid rgba(37,211,102,0.2)', color: '#25d366', padding: '10px', borderRadius: '10px', textDecoration: 'none', fontWeight: 600, fontSize: '0.82rem' }}
              >
                💬 Buka Chat WhatsApp
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
