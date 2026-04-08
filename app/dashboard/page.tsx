'use client'
import ProdukPage from '@/components/ProdukPage'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Client {
  id: string
  nama_pemilik: string
  email: string
  status: string
  paket: string
  tanggal_berakhir: string
  referral_code: string
}

interface Store {
  id: string
  nama_toko: string
  nomor_wa_toko: string
  kategori: string
  aktif: boolean
  is_trial: boolean
  pesan_terpakai: number
  trial_pesan_limit: number
  batas_pesan_bulan: number
  onboarding_selesai: boolean
}

interface Conversation {
  id: string
  nomor_pelanggan: string
  pesan_masuk: string
  pesan_keluar: string
  dibaca: boolean
  created_at: string
}

interface OnboardingSteps {
  step_daftar: boolean
  step_verifikasi_email: boolean
  step_isi_toko: boolean
  step_tambah_produk: boolean
  step_pilih_paket: boolean
  step_bayar: boolean
  step_bot_aktif: boolean
  step_test_chat: boolean
  persen_selesai: number
}

export default function Dashboard() {
  const [client, setClient] = useState<Client | null>(null)
  const [stores, setStores] = useState<Store[]>([])
  const [activeStore, setActiveStore] = useState<Store | null>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [onboarding, setOnboarding] = useState<OnboardingSteps | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeMenu, setActiveMenu] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [totalProduk, setTotalProduk] = useState(0)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    // Cek session
    const session = localStorage.getItem('mahirusaha_client')
    if (!session) {
      window.location.href = '/masuk'
      return
    }

    const clientData = JSON.parse(session)
    loadDashboard(clientData.id)
  }, [])

  const loadDashboard = async (clientId: string) => {
    try {
      // Load client data
      const { data: clientData } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .single()

      if (!clientData) {
        localStorage.removeItem('mahirusaha_client')
        window.location.href = '/masuk'
        return
      }

      setClient(clientData)

      // Load stores
      const { data: storesData } = await supabase
        .from('stores')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: true })

      if (storesData && storesData.length > 0) {
        setStores(storesData)
        setActiveStore(storesData[0])

        // Load conversations untuk toko pertama
        const { data: convData } = await supabase
          .from('conversations')
          .select('*')
          .eq('store_id', storesData[0].id)
          .order('created_at', { ascending: false })
          .limit(20)

        setConversations(convData || [])
        setUnreadCount((convData || []).filter((c: Conversation) => !c.dibaca).length)

        // Load total produk
        const { count } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('store_id', storesData[0].id)

        setTotalProduk(count || 0)
      }

      // Load onboarding
      const { data: onboardingData } = await supabase
        .from('onboarding_steps')
        .select('*')
        .eq('client_id', clientId)
        .single()

      setOnboarding(onboardingData)

    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('mahirusaha_client')
    window.location.href = '/masuk'
  }

  const getStatusColor = (status: string) => {
    if (status === 'aktif') return '#25d366'
    if (status === 'trial') return '#EF9F27'
    return '#EF4444'
  }

  const getStatusLabel = (status: string) => {
    if (status === 'aktif') return 'Aktif'
    if (status === 'trial') return 'Trial'
    if (status === 'nonaktif') return 'Nonaktif'
    return 'Suspend'
  }

  const getPaketLabel = (paket: string) => {
    const map: Record<string, string> = {
      trial: 'Trial', starter: 'Starter',
      pro: 'Pro', bisnis: 'Bisnis', enterprise: 'Enterprise'
    }
    return map[paket] || paket
  }

  const kuotaPersen = activeStore
    ? Math.min(100, Math.round((activeStore.pesan_terpakai / (activeStore.is_trial ? activeStore.trial_pesan_limit : activeStore.batas_pesan_bulan)) * 100))
    : 0

  const kuotaWarning = kuotaPersen >= 80

  const menuItems = [
    { id: 'overview', icon: '📊', label: 'Overview' },
    { id: 'percakapan', icon: '💬', label: 'Percakapan', badge: unreadCount },
    { id: 'produk', icon: '📦', label: 'Produk' },
    { id: 'pengaturan-toko', icon: '🏪', label: 'Pengaturan Toko' },
    { id: 'langganan', icon: '💳', label: 'Langganan' },
    { id: 'referral', icon: '🎁', label: 'Referral' },
  ]

  if (loading) {
    return (
      <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: '#070d1a', color: '#fff', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap'); * { box-sizing: border-box; margin: 0; padding: 0; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid rgba(37,211,102,0.2)', borderTop: '3px solid #25d366', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}/>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>Memuat dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: '#070d1a', color: '#fff', minHeight: '100vh', display: 'flex' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(37,211,102,0.3); border-radius: 2px; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        @keyframes spin { to{transform:rotate(360deg)} }
        .fadeUp { animation: fadeUp 0.4s ease forwards; }
        .menu-item { transition: all 0.2s; cursor: pointer; }
        .menu-item:hover { background: rgba(255,255,255,0.05) !important; }
        .card { transition: transform 0.2s, box-shadow 0.2s; }
        .card:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(0,0,0,0.3); }
        .btn { transition: opacity 0.2s, transform 0.1s; cursor: pointer; }
        .btn:hover { opacity: 0.85; }
        .btn:active { transform: scale(0.98); }
        input, textarea, select { font-family: inherit; }
        input:focus, textarea:focus, select:focus { outline: none; border-color: rgba(37,211,102,0.5) !important; }
      `}</style>

      {/* SIDEBAR */}
      <div style={{ width: sidebarOpen ? '240px' : '64px', background: 'rgba(255,255,255,0.02)', borderRight: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', transition: 'width 0.3s ease', overflow: 'hidden', flexShrink: 0, position: 'sticky', top: 0, height: '100vh' }}>
        {/* Logo */}
        <div style={{ padding: '20px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
            <div style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg,#25d366,#128c7e)', borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', flexShrink: 0 }}>💬</div>
            {sidebarOpen && <span style={{ fontWeight: 800, fontSize: '1rem', whiteSpace: 'nowrap' }}>Mahirusaha</span>}
          </div>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '1rem', padding: '4px', flexShrink: 0 }}>
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>

        {/* Store selector */}
        {sidebarOpen && stores.length > 0 && (
          <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>Toko Aktif</div>
            <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '10px 12px' }}>
              <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{activeStore?.nama_toko}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: activeStore?.aktif ? '#25d366' : '#EF4444', animation: activeStore?.aktif ? 'pulse 2s infinite' : 'none' }}/>
                <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.45)' }}>{activeStore?.aktif ? 'Bot aktif' : 'Bot mati'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Menu */}
        <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
          {menuItems.map(item => (
            <div key={item.id} className="menu-item" onClick={() => setActiveMenu(item.id)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 10px', borderRadius: '10px', marginBottom: '2px', background: activeMenu === item.id ? 'rgba(37,211,102,0.1)' : 'transparent', border: activeMenu === item.id ? '1px solid rgba(37,211,102,0.2)' : '1px solid transparent', position: 'relative' }}>
              <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{item.icon}</span>
              {sidebarOpen && (
                <>
                  <span style={{ fontSize: '0.875rem', fontWeight: activeMenu === item.id ? 600 : 500, color: activeMenu === item.id ? '#25d366' : 'rgba(255,255,255,0.65)', whiteSpace: 'nowrap' }}>{item.label}</span>
                  {item.badge && item.badge > 0 && (
                    <div style={{ marginLeft: 'auto', background: '#EF4444', color: '#fff', fontSize: '0.65rem', fontWeight: 700, padding: '2px 6px', borderRadius: '100px', minWidth: '18px', textAlign: 'center' }}>{item.badge}</div>
                  )}
                </>
              )}
            </div>
          ))}
        </nav>

        {/* User info + logout */}
        <div style={{ padding: '12px 8px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          {sidebarOpen && client && (
            <div style={{ padding: '10px 10px', marginBottom: '4px' }}>
              <div style={{ fontWeight: 600, fontSize: '0.82rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{client.nama_pemilik}</div>
              <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{client.email}</div>
            </div>
          )}
          <button onClick={handleLogout} className="menu-item" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 10px', borderRadius: '10px', background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontFamily: 'inherit' }}>
            <span style={{ fontSize: '1.1rem' }}>🚪</span>
            {sidebarOpen && <span style={{ fontSize: '0.875rem' }}>Keluar</span>}
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, overflowY: 'auto', height: '100vh' }}>

        {/* Top bar */}
        <div style={{ padding: '16px 28px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(7,13,26,0.8)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 10 }}>
          <div>
            <h1 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
              {menuItems.find(m => m.id === activeMenu)?.icon} {menuItems.find(m => m.id === activeMenu)?.label}
            </h1>
            <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>
              {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Status paket */}
            <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '100px', padding: '6px 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: getStatusColor(client?.status || '') }}/>
              <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>{getPaketLabel(client?.paket || 'trial')}</span>
            </div>
            {client?.status === 'trial' && (
              <a href="#" onClick={() => setActiveMenu('langganan')} style={{ background: 'linear-gradient(135deg,#25d366,#128c7e)', color: '#fff', padding: '7px 16px', borderRadius: '100px', textDecoration: 'none', fontWeight: 700, fontSize: '0.78rem' }}>
                Upgrade ↑
              </a>
            )}
          </div>
        </div>

        <div style={{ padding: '24px 28px' }}>

          {/* ==================== OVERVIEW ==================== */}
          {activeMenu === 'overview' && (
            <div className="fadeUp">

              {/* Kuota warning */}
              {kuotaWarning && (
                <div style={{ background: 'rgba(239,159,39,0.1)', border: '1px solid rgba(239,159,39,0.3)', borderRadius: '14px', padding: '14px 18px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <span style={{ fontSize: '1.2rem' }}>⚠️</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#EF9F27' }}>Kuota hampir habis!</div>
                      <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)' }}>
                        {activeStore?.pesan_terpakai} dari {activeStore?.is_trial ? activeStore.trial_pesan_limit : activeStore?.batas_pesan_bulan} pesan terpakai ({kuotaPersen}%)
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setActiveMenu('langganan')} className="btn" style={{ background: '#EF9F27', color: '#070d1a', padding: '8px 16px', borderRadius: '8px', border: 'none', fontWeight: 700, fontSize: '0.78rem', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
                    Upgrade Sekarang
                  </button>
                </div>
              )}

              {/* Onboarding progress */}
              {onboarding && onboarding.persen_selesai < 100 && (
                <div style={{ background: 'rgba(37,211,102,0.06)', border: '1px solid rgba(37,211,102,0.15)', borderRadius: '16px', padding: '18px 20px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: '2px' }}>Setup akun kamu</div>
                      <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)' }}>Selesaikan setup untuk memaksimalkan bot kamu</div>
                    </div>
                    <div style={{ fontWeight: 800, fontSize: '1.2rem', color: '#25d366' }}>{onboarding.persen_selesai}%</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '100px', height: '6px', marginBottom: '14px' }}>
                    <div style={{ background: 'linear-gradient(90deg,#25d366,#128c7e)', height: '100%', borderRadius: '100px', width: `${onboarding.persen_selesai}%`, transition: 'width 0.5s ease' }}/>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '8px' }}>
                    {[
                      { done: onboarding.step_daftar, label: 'Daftar' },
                      { done: onboarding.step_isi_toko, label: 'Info Toko' },
                      { done: onboarding.step_tambah_produk, label: 'Produk' },
                      { done: onboarding.step_bayar, label: 'Bayar' },
                    ].map((s, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: s.done ? '#25d366' : 'rgba(255,255,255,0.4)' }}>
                        <span>{s.done ? '✅' : '○'}</span> {s.label}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Stats cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px', marginBottom: '24px' }}>
                {[
                  {
                    icon: '💬', label: 'Pesan Terpakai',
                    value: `${activeStore?.pesan_terpakai || 0}`,
                    sub: `dari ${activeStore?.is_trial ? activeStore.trial_pesan_limit : activeStore?.batas_pesan_bulan || 0}`,
                    color: '#25d366',
                    progress: kuotaPersen
                  },
                  {
                    icon: '📦', label: 'Total Produk',
                    value: totalProduk.toString(),
                    sub: 'produk terdaftar',
                    color: '#818cf8',
                    progress: null
                  },
                  {
                    icon: '👥', label: 'Percakapan',
                    value: conversations.length.toString(),
                    sub: `${unreadCount} belum dibaca`,
                    color: '#EF9F27',
                    progress: null
                  },
                  {
                    icon: '🤖', label: 'Status Bot',
                    value: activeStore?.aktif ? 'Aktif' : 'Mati',
                    sub: activeStore?.is_trial ? `Trial — ${100 - (activeStore?.pesan_terpakai || 0)} sisa` : 'Paket ' + getPaketLabel(client?.paket || ''),
                    color: activeStore?.aktif ? '#25d366' : '#EF4444',
                    progress: null
                  },
                ].map((s, i) => (
                  <div key={i} className="card" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '18px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <span style={{ fontSize: '1.4rem' }}>{s.icon}</span>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: s.color }}/>
                    </div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: s.color, marginBottom: '4px' }}>{s.value}</div>
                    <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', marginBottom: s.progress !== null ? '10px' : 0 }}>{s.label}</div>
                    {s.progress !== null && (
                      <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '100px', height: '4px' }}>
                        <div style={{ background: s.progress >= 80 ? '#EF9F27' : s.color, height: '100%', borderRadius: '100px', width: `${s.progress}%` }}/>
                      </div>
                    )}
                    <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', marginTop: '4px' }}>{s.sub}</div>
                  </div>
                ))}
              </div>

              {/* Recent conversations + Quick actions */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '16px' }}>

                {/* Recent conversations */}
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', overflow: 'hidden' }}>
                  <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontWeight: 700, fontSize: '0.9rem' }}>💬 Percakapan Terbaru</h3>
                    <button onClick={() => setActiveMenu('percakapan')} style={{ background: 'none', border: 'none', color: '#25d366', fontSize: '0.78rem', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>Lihat semua →</button>
                  </div>
                  {conversations.length === 0 ? (
                    <div style={{ padding: '40px 20px', textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>
                      <div style={{ fontSize: '2rem', marginBottom: '10px' }}>💬</div>
                      <p style={{ fontSize: '0.85rem' }}>Belum ada percakapan</p>
                      <p style={{ fontSize: '0.75rem', marginTop: '4px' }}>Bot siap menerima pesan dari pelanggan</p>
                    </div>
                  ) : (
                    conversations.slice(0, 6).map((conv, i) => (
                      <div key={i} style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', gap: '12px', alignItems: 'flex-start', background: !conv.dibaca ? 'rgba(37,211,102,0.03)' : 'transparent' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg,rgba(37,211,102,0.2),rgba(18,140,126,0.2))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', flexShrink: 0 }}>👤</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                            <span style={{ fontWeight: 600, fontSize: '0.82rem' }}>{conv.nomor_pelanggan}</span>
                            <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.3)' }}>{new Date(conv.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{conv.pesan_masuk}</p>
                        </div>
                        {!conv.dibaca && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#25d366', flexShrink: 0, marginTop: '4px' }}/>}
                      </div>
                    ))
                  )}
                </div>

                {/* Quick actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '18px' }}>
                    <h3 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '14px' }}>⚡ Aksi Cepat</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {[
                        { icon: '📦', label: 'Tambah Produk', action: () => setActiveMenu('produk'), color: '#818cf8' },
                        { icon: '🏪', label: 'Edit Info Toko', action: () => setActiveMenu('pengaturan-toko'), color: '#25d366' },
                        { icon: '💳', label: 'Upgrade Paket', action: () => setActiveMenu('langganan'), color: '#EF9F27' },
                        { icon: '🎁', label: 'Undang Teman', action: () => setActiveMenu('referral'), color: '#F472B6' },
                      ].map((a, i) => (
                        <button key={i} onClick={a.action} className="btn" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', color: '#fff', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', width: '100%' }}>
                          <span style={{ fontSize: '1.1rem' }}>{a.icon}</span>
                          <span style={{ fontSize: '0.82rem', fontWeight: 500 }}>{a.label}</span>
                          <span style={{ marginLeft: 'auto', color: a.color, fontSize: '0.9rem' }}>→</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Info toko */}
                  {activeStore && (
                    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '18px' }}>
                      <h3 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '14px' }}>🏪 Info Toko</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {[
                          { label: 'Nama', value: activeStore.nama_toko },
                          { label: 'Kategori', value: activeStore.kategori || '-' },
                          { label: 'Nomor WA', value: activeStore.nomor_wa_toko },
                          { label: 'Status Bot', value: activeStore.aktif ? '🟢 Aktif' : '🔴 Mati' },
                        ].map((info, i) => (
                          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', gap: '8px' }}>
                            <span style={{ color: 'rgba(255,255,255,0.4)' }}>{info.label}</span>
                            <span style={{ fontWeight: 600, textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px' }}>{info.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ==================== PERCAKAPAN ==================== */}
          {activeMenu === 'percakapan' && (
            <div className="fadeUp">
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ fontWeight: 700, fontSize: '0.9rem' }}>Semua Percakapan</h3>
                    <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>{conversations.length} percakapan · {unreadCount} belum dibaca</p>
                  </div>
                </div>
                {conversations.length === 0 ? (
                  <div style={{ padding: '60px 20px', textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '16px' }}>💬</div>
                    <p style={{ fontWeight: 600, marginBottom: '6px' }}>Belum ada percakapan</p>
                    <p style={{ fontSize: '0.85rem' }}>Bot siap menerima pesan dari pelanggan kamu</p>
                  </div>
                ) : (
                  conversations.map((conv, i) => (
                    <div key={i} style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'grid', gridTemplateColumns: '40px 1fr 1fr auto', gap: '12px', alignItems: 'center', background: !conv.dibaca ? 'rgba(37,211,102,0.02)' : 'transparent' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>👤</div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.82rem', marginBottom: '3px' }}>{conv.nomor_pelanggan}</div>
                        <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>📥 {conv.pesan_masuk}</div>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>🤖 {conv.pesan_keluar}</div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.3)' }}>{new Date(conv.created_at).toLocaleDateString('id-ID')}</div>
                        {!conv.dibaca && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#25d366', marginLeft: 'auto', marginTop: '4px' }}/>}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ==================== PRODUK ==================== */}
          {activeMenu === 'produk' && (
            <div className="fadeUp">
				<ProdukPage storeId={activeStore?.id || ''} />
			</div>
          )}

          {/* ==================== LANGGANAN ==================== */}
          {activeMenu === 'langganan' && (
            <div className="fadeUp">
              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '4px' }}>Paket Langganan</h2>
                <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>Kelola paket dan pembayaran kamu</p>
              </div>

              {/* Status langganan */}
              <div style={{ background: client?.status === 'trial' ? 'rgba(239,159,39,0.08)' : 'rgba(37,211,102,0.08)', border: `1px solid ${client?.status === 'trial' ? 'rgba(239,159,39,0.25)' : 'rgba(37,211,102,0.25)'}`, borderRadius: '16px', padding: '20px 24px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: '4px' }}>
                    {client?.status === 'trial' ? '🎯 Kamu sedang dalam masa trial' : '✅ Langganan aktif'}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)' }}>
                    {client?.status === 'trial'
                      ? `Sisa ${100 - (activeStore?.pesan_terpakai || 0)} pesan gratis. Upgrade untuk melanjutkan tanpa batas.`
                      : `Paket ${getPaketLabel(client?.paket || '')} · Aktif hingga ${client?.tanggal_berakhir ? new Date(client.tanggal_berakhir).toLocaleDateString('id-ID') : '-'}`
                    }
                  </div>
                </div>
                <div style={{ fontWeight: 800, fontSize: '1.5rem', color: client?.status === 'trial' ? '#EF9F27' : '#25d366' }}>
                  {getPaketLabel(client?.paket || 'trial')}
                </div>
              </div>

              {/* Pilih paket */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '14px' }}>
                {[
                  { kode: 'starter', nama: 'Starter', harga: 99000, toko: 1, pesan: '1.000', fitur: ['1 Toko', '1.000 pesan/bln', 'AI Chatbot', 'Katalog produk', 'Support email'] },
                  { kode: 'pro', nama: 'Pro', harga: 299000, toko: 3, pesan: '5.000', fitur: ['3 Toko', '5.000 pesan/bln', 'Broadcast promo', 'CRM pelanggan', 'Laporan harian'], popular: true },
                  { kode: 'bisnis', nama: 'Bisnis', harga: 599000, toko: 10, pesan: '20.000', fitur: ['10 Toko', '20.000 pesan/bln', 'Multi-agent CS', 'API akses', 'Priority support'] },
                ].map(p => (
                  <div key={p.kode} style={{ background: p.popular ? 'rgba(37,211,102,0.07)' : 'rgba(255,255,255,0.03)', border: `1px solid ${p.popular ? 'rgba(37,211,102,0.3)' : 'rgba(255,255,255,0.08)'}`, borderRadius: '16px', padding: '20px', position: 'relative' }}>
                    {p.popular && <div style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', background: '#25d366', color: '#070d1a', fontSize: '0.65rem', fontWeight: 800, padding: '3px 12px', borderRadius: '100px', whiteSpace: 'nowrap' }}>TERPOPULER</div>}
                    <h3 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '6px' }}>{p.nama}</h3>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '3px', marginBottom: '16px' }}>
                      <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>Rp</span>
                      <span style={{ fontSize: '1.4rem', fontWeight: 800, color: p.popular ? '#25d366' : '#fff' }}>{(p.harga / 1000).toLocaleString('id-ID')}rb</span>
                      <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>/bln</span>
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                      {p.fitur.map(f => (
                        <div key={f} style={{ display: 'flex', gap: '7px', fontSize: '0.75rem', color: 'rgba(255,255,255,0.65)', marginBottom: '6px' }}>
                          <span style={{ color: '#25d366' }}>✓</span> {f}
                        </div>
                      ))}
                    </div>
                    <button disabled={client?.paket === p.kode} className="btn" style={{ width: '100%', background: client?.paket === p.kode ? 'rgba(255,255,255,0.06)' : p.popular ? 'linear-gradient(135deg,#25d366,#128c7e)' : 'rgba(255,255,255,0.08)', color: client?.paket === p.kode ? 'rgba(255,255,255,0.3)' : '#fff', padding: '11px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', fontWeight: 700, fontSize: '0.82rem', fontFamily: 'inherit', cursor: client?.paket === p.kode ? 'default' : 'pointer' }}>
                      {client?.paket === p.kode ? '✓ Paket Saat Ini' : 'Pilih Paket'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==================== REFERRAL ==================== */}
          {activeMenu === 'referral' && (
            <div className="fadeUp">
              <div style={{ maxWidth: '600px' }}>
                <div style={{ background: 'linear-gradient(135deg,rgba(244,114,182,0.1),rgba(99,102,241,0.1))', border: '1px solid rgba(244,114,182,0.2)', borderRadius: '20px', padding: '32px', textAlign: 'center', marginBottom: '20px' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🎁</div>
                  <h2 style={{ fontWeight: 800, fontSize: '1.3rem', marginBottom: '8px' }}>Undang teman, dapat diskon!</h2>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem', lineHeight: 1.7, marginBottom: '24px' }}>
                    Bagikan kode referralmu. Setiap teman yang daftar menggunakan kodemu, kamu dapat diskon 10% untuk bulan berikutnya.
                  </p>
                  <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
                    <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', marginBottom: '6px' }}>Kode Referralmu</div>
                    <div style={{ fontFamily: 'monospace', fontSize: '1.6rem', fontWeight: 800, letterSpacing: '4px', color: '#F472B6' }}>{client?.referral_code || 'MHR000000'}</div>
                  </div>
                  <button className="btn" onClick={() => { navigator.clipboard.writeText(client?.referral_code || ''); alert('Kode disalin!') }} style={{ background: 'linear-gradient(135deg,#F472B6,#6366f1)', color: '#fff', padding: '12px 28px', borderRadius: '10px', border: 'none', fontWeight: 700, fontSize: '0.875rem', fontFamily: 'inherit', cursor: 'pointer' }}>
                    📋 Salin Kode Referral
                  </button>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '20px' }}>
                  <h3 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '14px' }}>📊 Statistik Referral</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                    {[['0', 'Total Referral'], ['0', 'Berhasil Daftar'], ['Rp 0', 'Total Diskon']].map(([v, l]) => (
                      <div key={l} style={{ textAlign: 'center', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '14px' }}>
                        <div style={{ fontWeight: 800, fontSize: '1.3rem', color: '#F472B6', marginBottom: '4px' }}>{v}</div>
                        <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>{l}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================== PENGATURAN TOKO ==================== */}
          {activeMenu === 'pengaturan-toko' && (
            <div className="fadeUp" style={{ maxWidth: '600px' }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '24px' }}>
                <h3 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '20px' }}>🏪 Pengaturan Toko</h3>
                {activeStore && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {[
                      { label: 'Nama Toko', value: activeStore.nama_toko, key: 'nama_toko' },
                      { label: 'Nomor WA Toko', value: activeStore.nomor_wa_toko, key: 'nomor_wa_toko' },
                      { label: 'Kategori', value: activeStore.kategori, key: 'kategori' },
                    ].map(field => (
                      <div key={field.key}>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: '6px' }}>{field.label}</label>
                        <input defaultValue={field.value || ''} style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '11px 14px', borderRadius: '10px', fontSize: '0.875rem', fontFamily: 'inherit' }} />
                      </div>
                    ))}
                    <button className="btn" style={{ background: 'linear-gradient(135deg,#25d366,#128c7e)', color: '#fff', padding: '12px', borderRadius: '10px', border: 'none', fontWeight: 700, fontSize: '0.875rem', fontFamily: 'inherit', cursor: 'pointer', marginTop: '8px' }}>
                      Simpan Perubahan
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
