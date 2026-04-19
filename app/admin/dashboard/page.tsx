'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
interface Admin {
  id: string
  nama: string
  email: string
  role: string
}
interface Client {
  id: string
  nama_pemilik: string
  email: string
  status: string
  paket: string
  tanggal_berakhir: string
  nomor_wa_pemilik: string
  created_at: string
}
interface Store {
  id: string
  client_id: string
  nama_toko: string
  nomor_wa_toko: string
  wa_phone_number_id: string
  aktif: boolean
  is_trial: boolean
  pesan_terpakai: number
  batas_pesan_bulan: number
  created_at: string
}
interface EnterpriseLead {
  id: string
  nama_pic: string
  nama_perusahaan: string
  email: string
  nomor_wa: string
  kebutuhan: string
  status: string
  created_at: string
}
export default function AdminDashboard() {
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [activeMenu, setActiveMenu] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [clients, setClients] = useState<Client[]>([])
  const [stores, setStores] = useState<Store[]>([])
  const [leads, setLeads] = useState<EnterpriseLead[]>([])
  const [stats, setStats] = useState({
    totalKlien: 0,
    klienAktif: 0,
    klienTrial: 0,
    totalToko: 0,
    tokoAktif: 0,
    totalLeads: 0,
    mrr: 0,
  })
  const [editingStore, setEditingStore] = useState<string | null>(null)
  const [newNomorWA, setNewNomorWA] = useState('')
  const [saving, setSaving] = useState(false)
  const [searchKlien, setSearchKlien] = useState('')
  const [filterStatus, setFilterStatus] = useState('semua')
  const [sendingEmail, setSendingEmail] = useState<string | null>(null)

  useEffect(() => {
    const session = localStorage.getItem('mahirusaha_admin')
    if (!session) {
      window.location.href = '/admin'
      return
    }
    const adminData = JSON.parse(session)
    setAdmin(adminData)
    loadAllData()
  }, [])

  const loadAllData = async () => {
    setLoading(true)
    try {
      const { data: clientsData } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false })
      const { data: storesData } = await supabase
        .from('stores')
        .select('*')
        .order('created_at', { ascending: false })
      const { data: leadsData } = await supabase
        .from('enterprise_leads')
        .select('*')
        .order('created_at', { ascending: false })
      const c = clientsData || []
      const s = storesData || []
      const l = leadsData || []
      setClients(c)
      setStores(s)
      setLeads(l)
      const hargaPaket: Record<string, number> = { starter: 99000, pro: 299000, bisnis: 699000 }
      const mrr = c.filter(cl => cl.status === 'aktif').reduce((sum, cl) => sum + (hargaPaket[cl.paket] || 0), 0)
      setStats({
        totalKlien: c.length,
        klienAktif: c.filter(cl => cl.status === 'aktif').length,
        klienTrial: c.filter(cl => cl.status === 'trial').length,
        totalToko: s.length,
        tokoAktif: s.filter(st => st.aktif).length,
        totalLeads: l.length,
        mrr,
      })
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('mahirusaha_admin')
    window.location.href = '/admin'
  }

  const handleUpdateNomorWA = async (storeId: string) => {
    if (!newNomorWA.trim()) return
    setSaving(true)
    try {
      await supabase
        .from('stores')
        .update({ nomor_wa_toko: newNomorWA, updated_at: new Date().toISOString() })
        .eq('id', storeId)
      setStores(prev => prev.map(s => s.id === storeId ? { ...s, nomor_wa_toko: newNomorWA } : s))
      setEditingStore(null)
      setNewNomorWA('')
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleSuspendKlien = async (clientId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'suspend' ? 'trial' : 'suspend'
    const confirm = window.confirm(`${newStatus === 'suspend' ? 'Suspend' : 'Aktifkan kembali'} klien ini?`)
    if (!confirm) return
    await supabase.from('clients').update({ status: newStatus }).eq('id', clientId)
    setClients(prev => prev.map(c => c.id === clientId ? { ...c, status: newStatus } : c))
  }

  const handleKirimNotifBotAktif = async (clientId: string, nama: string, email: string) => {
    const confirm = window.confirm(`Kirim email "Bot Aktif" ke ${nama} (${email})?`)
    if (!confirm) return
    setSendingEmail(clientId)
    try {
      const response = await fetch('/api/email/bot-aktif', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client_id: clientId, nama, email })
      })
      if (response.ok) {
        alert(`✅ Email "Bot Aktif" berhasil dikirim ke ${email}`)
      } else {
        alert('❌ Gagal kirim email. Coba lagi.')
      }
    } catch {
      alert('❌ Terjadi kesalahan.')
    } finally {
      setSendingEmail(null)
    }
  }

  const handleUpdateLeadStatus = async (leadId: string, newStatus: string) => {
    await supabase.from('enterprise_leads').update({ status: newStatus }).eq('id', leadId)
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus } : l))
  }

  const fmt = (n: number) => 'Rp ' + n.toLocaleString('id-ID')

  const filteredClients = clients.filter(c => {
    const matchSearch = c.nama_pemilik.toLowerCase().includes(searchKlien.toLowerCase()) ||
      c.email.toLowerCase().includes(searchKlien.toLowerCase())
    const matchStatus = filterStatus === 'semua' || c.status === filterStatus
    return matchSearch && matchStatus
  })

  const menuItems = [
    { id: 'overview', icon: '📊', label: 'Overview' },
    { id: 'klien', icon: '👥', label: 'Klien' },
    { id: 'toko', icon: '🏪', label: 'Toko' },
    { id: 'leads', icon: '📋', label: 'Enterprise Leads' },
    { id: 'revenue', icon: '💰', label: 'Revenue' },
  ]

  const getStatusColor = (status: string) => {
    if (status === 'aktif') return '#25d366'
    if (status === 'trial') return '#EF9F27'
    if (status === 'suspend') return '#EF4444'
    return '#888'
  }

  const getStatusLabel = (status: string) => {
    const map: Record<string, string> = { aktif: 'Aktif', trial: 'Trial', suspend: 'Suspend', nonaktif: 'Nonaktif' }
    return map[status] || status
  }

  const getPaketLabel = (paket: string) => {
    const map: Record<string, string> = { starter: 'Starter', pro: 'Pro', bisnis: 'Bisnis', enterprise: 'Enterprise', trial: 'Trial' }
    return map[paket] || paket
  }

  if (loading) {
    return (
      <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: '#070d1a', color: '#fff', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '12px' }}>⚙️</div>
          <p style={{ color: 'rgba(255,255,255,0.4)' }}>Memuat dashboard admin...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: '#070d1a', color: '#fff', minHeight: '100vh', display: 'flex' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input:focus { border-color: rgba(37,211,102,0.5) !important; outline: none; }
        input::placeholder { color: rgba(255,255,255,0.25); }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 100px; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .fadeUp { animation: fadeUp 0.4s ease forwards; }
        .menu-item:hover { background: rgba(255,255,255,0.05) !important; }
        .btn-action { transition: opacity 0.2s; }
        .btn-action:hover { opacity: 0.8; }
      `}</style>

      {/* SIDEBAR */}
      <div style={{ width: '220px', background: 'rgba(255,255,255,0.02)', borderRight: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', flexShrink: 0, position: 'sticky', top: 0, height: '100vh' }}>
        <div style={{ padding: '20px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg,#25d366,#128c7e)', borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', flexShrink: 0 }}>⚙️</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>Admin Panel</div>
            <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)' }}>Mahirusaha Internal</div>
          </div>
        </div>
        <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
          {menuItems.map(item => (
            <div
              key={item.id}
              className="menu-item"
              onClick={() => setActiveMenu(item.id)}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', marginBottom: '2px', cursor: 'pointer', background: activeMenu === item.id ? 'rgba(37,211,102,0.1)' : 'transparent', border: activeMenu === item.id ? '1px solid rgba(37,211,102,0.2)' : '1px solid transparent' }}
            >
              <span style={{ fontSize: '1rem' }}>{item.icon}</span>
              <span style={{ fontSize: '0.875rem', fontWeight: activeMenu === item.id ? 600 : 500, color: activeMenu === item.id ? '#25d366' : 'rgba(255,255,255,0.65)' }}>{item.label}</span>
            </div>
          ))}
        </nav>
        <div style={{ padding: '12px 8px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ padding: '10px 12px', marginBottom: '4px' }}>
            <div style={{ fontWeight: 600, fontSize: '0.82rem' }}>{admin?.nama}</div>
            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)' }}>{admin?.role}</div>
          </div>
          <button
            onClick={handleLogout}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.875rem' }}
          >
            <span>🚪</span> Keluar
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, overflowY: 'auto', height: '100vh' }}>
        <div style={{ padding: '16px 28px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(7,13,26,0.8)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 10 }}>
          <h1 style={{ fontSize: '1rem', fontWeight: 700 }}>
            {menuItems.find(m => m.id === activeMenu)?.icon} {menuItems.find(m => m.id === activeMenu)?.label}
          </h1>
          <button
            onClick={loadAllData}
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', padding: '7px 14px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.8rem' }}
          >
            🔄 Refresh
          </button>
        </div>

        <div style={{ padding: '24px 28px' }}>

          {/* ===== OVERVIEW ===== */}
          {activeMenu === 'overview' && (
            <div className="fadeUp">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px', marginBottom: '28px' }}>
                {[
                  { label: 'Total Klien', value: stats.totalKlien, icon: '👥', color: '#25d366' },
                  { label: 'Klien Aktif', value: stats.klienAktif, icon: '✅', color: '#25d366' },
                  { label: 'Klien Trial', value: stats.klienTrial, icon: '🎯', color: '#EF9F27' },
                  { label: 'MRR', value: fmt(stats.mrr), icon: '💰', color: '#25d366' },
                ].map(stat => (
                  <div key={stat.label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '18px' }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>{stat.icon}</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: stat.color, marginBottom: '2px' }}>{stat.value}</div>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>{stat.label}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '14px', marginBottom: '28px' }}>
                {[
                  { label: 'Total Toko', value: stats.totalToko, icon: '🏪', color: '#fff' },
                  { label: 'Toko Aktif', value: stats.tokoAktif, icon: '🟢', color: '#25d366' },
                  { label: 'Enterprise Leads', value: stats.totalLeads, icon: '📋', color: '#378ADD' },
                ].map(stat => (
                  <div key={stat.label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '18px' }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>{stat.icon}</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: stat.color, marginBottom: '2px' }}>{stat.value}</div>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>{stat.label}</div>
                  </div>
                ))}
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '20px' }}>
                <h3 style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: '16px' }}>👥 Klien Terbaru</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {clients.slice(0, 5).map(c => (
                    <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px' }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{c.nama_pemilik}</div>
                        <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>{c.email}</div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.72rem', background: 'rgba(255,255,255,0.06)', padding: '3px 8px', borderRadius: '100px' }}>{getPaketLabel(c.paket)}</span>
                        <span style={{ fontSize: '0.72rem', color: getStatusColor(c.status), fontWeight: 600 }}>{getStatusLabel(c.status)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ===== KLIEN ===== */}
          {activeMenu === 'klien' && (
            <div className="fadeUp">
              <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <input
                  style={{ flex: 1, minWidth: '200px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '10px 14px', borderRadius: '10px', fontSize: '0.875rem', fontFamily: 'inherit', outline: 'none' }}
                  placeholder="🔍 Cari nama atau email..."
                  value={searchKlien}
                  onChange={e => setSearchKlien(e.target.value)}
                />
                <select
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '10px 14px', borderRadius: '10px', fontSize: '0.875rem', fontFamily: 'inherit', outline: 'none' }}
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value)}
                >
                  {['semua', 'aktif', 'trial', 'suspend'].map(s => (
                    <option key={s} value={s} style={{ background: '#111827' }}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', marginBottom: '12px' }}>
                {filteredClients.length} klien ditemukan
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', overflow: 'hidden' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr 1.5fr', gap: '12px', padding: '12px 16px', background: 'rgba(255,255,255,0.04)', fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <span>Nama</span>
                  <span>Email</span>
                  <span>Paket</span>
                  <span>Status</span>
                  <span>Bergabung</span>
                  <span>Aksi</span>
                </div>
                {filteredClients.map((c, i) => (
                  <div key={c.id} style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr 1.5fr', gap: '12px', padding: '14px 16px', borderTop: i > 0 ? '1px solid rgba(255,255,255,0.04)' : 'none', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{c.nama_pemilik}</div>
                      <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)' }}>{c.nomor_wa_pemilik || '-'}</div>
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.email}</div>
                    <div>
                      <span style={{ fontSize: '0.72rem', background: 'rgba(255,255,255,0.06)', padding: '3px 8px', borderRadius: '100px' }}>{getPaketLabel(c.paket)}</span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: getStatusColor(c.status), fontWeight: 600 }}>{getStatusLabel(c.status)}</div>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>
                      {new Date(c.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: '2-digit' })}
                    </div>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      <button
                        className="btn-action"
                        onClick={() => handleSuspendKlien(c.id, c.status)}
                        style={{ fontSize: '0.68rem', padding: '5px 8px', borderRadius: '6px', border: `1px solid ${c.status === 'suspend' ? 'rgba(37,211,102,0.3)' : 'rgba(239,68,68,0.3)'}`, background: 'transparent', color: c.status === 'suspend' ? '#25d366' : '#EF4444', cursor: 'pointer', fontFamily: 'inherit' }}
                      >
                        {c.status === 'suspend' ? 'Aktifkan' : 'Suspend'}
                      </button>
                      <button
                        className="btn-action"
                        onClick={() => handleKirimNotifBotAktif(c.id, c.nama_pemilik, c.email)}
                        disabled={sendingEmail === c.id}
                        style={{ fontSize: '0.68rem', padding: '5px 8px', borderRadius: '6px', border: '1px solid rgba(37,211,102,0.3)', background: 'transparent', color: '#25d366', cursor: 'pointer', fontFamily: 'inherit', opacity: sendingEmail === c.id ? 0.5 : 1 }}
                      >
                        {sendingEmail === c.id ? '⏳' : '📧 Bot Aktif'}
                      </button>
                    </div>
                  </div>
                ))}
                {filteredClients.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.3)', fontSize: '0.875rem' }}>
                    Tidak ada klien ditemukan
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ===== TOKO ===== */}
          {activeMenu === 'toko' && (
            <div className="fadeUp">
              <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', marginBottom: '16px' }}>
                {stores.length} toko terdaftar · {stores.filter(s => s.aktif).length} aktif
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', overflow: 'hidden' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1.5fr 0.8fr 1fr 1.2fr', gap: '12px', padding: '12px 16px', background: 'rgba(255,255,255,0.04)', fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <span>Nama Toko</span>
                  <span>Nomor WA</span>
                  <span>Pesan</span>
                  <span>Trial</span>
                  <span>Status</span>
                  <span>Aksi</span>
                </div>
                {stores.map((s, i) => (
                  <div key={s.id} style={{ borderTop: i > 0 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1.5fr 0.8fr 1fr 1.2fr', gap: '12px', padding: '14px 16px', alignItems: 'center' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{s.nama_toko}</div>
                      <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)' }}>{s.nomor_wa_toko}</div>
                      <div>
                        <div style={{ fontSize: '0.78rem', marginBottom: '4px' }}>
                          {s.pesan_terpakai} / {s.batas_pesan_bulan}
                        </div>
                        <div style={{ height: '3px', background: 'rgba(255,255,255,0.08)', borderRadius: '100px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${Math.min((s.pesan_terpakai / s.batas_pesan_bulan) * 100, 100)}%`, background: '#25d366', borderRadius: '100px' }} />
                        </div>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: s.is_trial ? '#EF9F27' : 'rgba(255,255,255,0.4)' }}>
                        {s.is_trial ? 'Trial' : 'Paid'}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: s.aktif ? '#25d366' : '#EF4444', fontWeight: 600 }}>
                        {s.aktif ? '🟢 Aktif' : '🔴 Mati'}
                      </div>
                      <div>
                        <button
                          className="btn-action"
                          onClick={() => { setEditingStore(s.id); setNewNomorWA(s.nomor_wa_toko) }}
                          style={{ fontSize: '0.72rem', padding: '5px 10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.15)', background: 'transparent', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontFamily: 'inherit' }}
                        >
                          ✏️ Ganti Nomor
                        </button>
                      </div>
                    </div>
                    {editingStore === s.id && (
                      <div style={{ padding: '0 16px 16px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <input
                          style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(37,211,102,0.3)', color: '#fff', padding: '9px 12px', borderRadius: '8px', fontSize: '0.875rem', fontFamily: 'inherit', outline: 'none' }}
                          placeholder="628xxxxxxxxxx"
                          value={newNomorWA}
                          onChange={e => setNewNomorWA(e.target.value)}
                        />
                        <button
                          onClick={() => handleUpdateNomorWA(s.id)}
                          disabled={saving}
                          style={{ padding: '9px 16px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg,#25d366,#128c7e)', color: '#fff', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'inherit' }}
                        >
                          {saving ? '...' : 'Simpan'}
                        </button>
                        <button
                          onClick={() => setEditingStore(null)}
                          style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontFamily: 'inherit' }}
                        >
                          Batal
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                {stores.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.3)', fontSize: '0.875rem' }}>
                    Belum ada toko terdaftar
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ===== ENTERPRISE LEADS ===== */}
          {activeMenu === 'leads' && (
            <div className="fadeUp">
              <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', marginBottom: '16px' }}>
                {leads.length} leads masuk
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {leads.map(lead => (
                  <div key={lead.id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '18px 20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '4px' }}>{lead.nama_perusahaan}</div>
                        <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>PIC: {lead.nama_pic}</div>
                        <div style={{ display: 'flex', gap: '16px', fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', flexWrap: 'wrap' }}>
                          <span>📧 {lead.email}</span>
                          {lead.nomor_wa && <span>📱 {lead.nomor_wa}</span>}
                        </div>
                        {lead.kebutuhan && (
                          <div style={{ marginTop: '10px', fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', padding: '8px 12px', lineHeight: 1.6 }}>
                            {lead.kebutuhan}
                          </div>
                        )}
                        <div style={{ marginTop: '8px', fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>
                          Masuk: {new Date(lead.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                        <select
                          value={lead.status}
                          onChange={e => handleUpdateLeadStatus(lead.id, e.target.value)}
                          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '7px 12px', borderRadius: '8px', fontSize: '0.78rem', fontFamily: 'inherit', outline: 'none', cursor: 'pointer' }}
                        >
                          {['baru', 'dihubungi', 'demo', 'negosiasi', 'closing', 'batal'].map(s => (
                            <option key={s} value={s} style={{ background: '#111827' }}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                          ))}
                        </select>
                        {lead.nomor_wa && (
                          <a
                            href={`https://wa.me/${lead.nomor_wa}?text=Halo ${lead.nama_pic}, kami dari Mahirusaha ingin menindaklanjuti permintaan demo Anda.`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ fontSize: '0.75rem', background: 'rgba(37,211,102,0.1)', border: '1px solid rgba(37,211,102,0.25)', color: '#25d366', padding: '7px 12px', borderRadius: '8px', textDecoration: 'none', fontWeight: 600 }}
                          >
                            💬 Chat WA
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {leads.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '60px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '12px' }}>📋</div>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.875rem' }}>Belum ada enterprise lead masuk</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ===== REVENUE ===== */}
          {activeMenu === 'revenue' && (
            <div className="fadeUp">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '14px', marginBottom: '24px' }}>
                {[
                  { label: 'MRR', value: fmt(stats.mrr), sub: 'Monthly Recurring Revenue', color: '#25d366' },
                  { label: 'ARR', value: fmt(stats.mrr * 12), sub: 'Annual Recurring Revenue', color: '#25d366' },
                  { label: 'Avg Revenue/Klien', value: stats.klienAktif > 0 ? fmt(Math.round(stats.mrr / stats.klienAktif)) : 'Rp 0', sub: 'Per aktif klien', color: '#fff' },
                ].map(stat => (
                  <div key={stat.label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '20px' }}>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: stat.color, marginBottom: '4px' }}>{stat.value}</div>
                    <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)' }}>{stat.sub}</div>
                  </div>
                ))}
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '20px', marginBottom: '24px' }}>
                <h3 style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: '16px' }}>💰 Revenue per Paket</h3>
                {[
                  { paket: 'starter', harga: 99000, label: 'Starter' },
                  { paket: 'pro', harga: 299000, label: 'Pro' },
                  { paket: 'bisnis', harga: 699000, label: 'Bisnis' },
                ].map(p => {
                  const jumlah = clients.filter(c => c.status === 'aktif' && c.paket === p.paket).length
                  const revenue = jumlah * p.harga
                  const persen = stats.mrr > 0 ? Math.round((revenue / stats.mrr) * 100) : 0
                  return (
                    <div key={p.paket} style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '14px' }}>
                      <div style={{ width: '80px', fontSize: '0.82rem', fontWeight: 600 }}>{p.label}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '100px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${persen}%`, background: 'linear-gradient(90deg,#25d366,#128c7e)', borderRadius: '100px' }} />
                        </div>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', width: '40px', textAlign: 'right' }}>{jumlah} klien</div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#25d366', width: '100px', textAlign: 'right' }}>{fmt(revenue)}</div>
                    </div>
                  )
                })}
              </div>
              <div style={{ background: 'rgba(37,211,102,0.05)', border: '1px solid rgba(37,211,102,0.15)', borderRadius: '14px', padding: '16px 20px' }}>
                <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.7 }}>
                  💡 <strong style={{ color: '#25d366' }}>BEP:</strong> Dengan biaya server ~Rp 655rb/bln, kamu butuh minimal <strong style={{ color: '#fff' }}>7 klien Starter</strong> atau <strong style={{ color: '#fff' }}>3 klien Pro</strong> untuk break even. MRR saat ini <strong style={{ color: '#25d366' }}>{fmt(stats.mrr)}</strong> dengan margin <strong style={{ color: '#25d366' }}>{stats.mrr > 655000 ? Math.round(((stats.mrr - 655000) / stats.mrr) * 100) : 0}%</strong>.
                </p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
