'use client'
import ProdukPage from '@/components/ProdukPage'
import PengaturanToko from '@/components/PengaturanToko'
import LanggananPage from '@/components/LanggananPage'
import BroadcastPage from '@/components/BroadcastPage'
import AnalyticsPage from '@/components/AnalyticsPage'
import CRMPage from '@/components/CRMPage'
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
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null)
  const [replyPesan, setReplyPesan] = useState('')
  const [sendingReply, setSendingReply] = useState(false)
  const [showTambahToko, setShowTambahToko] = useState(false)
  const [formToko, setFormToko] = useState({ nama_toko: '', slug: '', nomor_wa_toko: '', kategori: '' })
  const [savingToko, setSavingToko] = useState(false)

  useEffect(() => {
    const session = localStorage.getItem('mahirusaha_client')
    if (!session) {
      window.location.href = '/masuk'
      return
    }
    const clientData = JSON.parse(session)
    loadDashboard(clientData.id)
  }, [])

  // Reload conversations saat activeStore berubah
  useEffect(() => {
    if (!activeStore) return
    loadConversations(activeStore.id)
    loadProduk(activeStore.id)
    setSelectedConv(null)
  }, [activeStore?.id])

  const loadDashboard = async (clientId: string) => {
    try {
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

      const { data: storesData } = await supabase
        .from('stores')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: true })

      if (storesData && storesData.length > 0) {
        setStores(storesData)
        setActiveStore(storesData[0])
        await loadConversations(storesData[0].id)
        await loadProduk(storesData[0].id)
      }

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

  const loadConversations = async (storeId: string) => {
    const { data: convData } = await supabase
      .from('conversations')
      .select('*')
      .eq('store_id', storeId)
      .order('created_at', { ascending: false })
      .limit(50)
    setConversations(convData || [])
    setUnreadCount((convData || []).filter((c: Conversation) => !c.dibaca).length)
  }

  const loadProduk = async (storeId: string) => {
    const { count } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('store_id', storeId)
    setTotalProduk(count || 0)
  }

  const handleLogout = () => {
    localStorage.removeItem('mahirusaha_client')
    window.location.href = '/masuk'
  }

  const handleAmbilAlih = async (nomorPelanggan: string) => {
    if (!activeStore) return
    await supabase.from('bot_sessions').upsert({
      store_id: activeStore.id,
      nomor_pelanggan: nomorPelanggan,
      human_takeover: true,
      updated_at: new Date().toISOString()
    }, { onConflict: 'store_id,nomor_pelanggan' })
    alert(`✅ Bot dinonaktifkan untuk ${nomorPelanggan}. Kamu bisa balas manual sekarang.`)
  }

  const handleAktifkanBot = async (nomorPelanggan: string) => {
    if (!activeStore) return
    await supabase.from('bot_sessions').upsert({
      store_id: activeStore.id,
      nomor_pelanggan: nomorPelanggan,
      human_takeover: false,
      updated_at: new Date().toISOString()
    }, { onConflict: 'store_id,nomor_pelanggan' })
    alert(`✅ Bot diaktifkan kembali untuk ${nomorPelanggan}.`)
  }

  const handleReplyManual = async (nomorPelanggan: string) => {
    if (!replyPesan.trim() || !activeStore) return
    setSendingReply(true)
    try {
      const response = await fetch('/api/reply-manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          store_id: activeStore.id,
          nomor_pelanggan: nomorPelanggan,
          pesan: replyPesan,
        })
      })
      if (response.ok) {
        setReplyPesan('')
        alert('✅ Pesan berhasil dikirim!')
        await loadConversations(activeStore.id)
      } else {
        alert('❌ Gagal kirim pesan. Coba lagi.')
      }
    } catch {
      alert('❌ Terjadi kesalahan.')
    } finally {
      setSendingReply(false)
    }
  }

  const handleTambahToko = async () => {
    if (!formToko.nama_toko || !formToko.slug || !client) return
    setSavingToko(true)
    try {
      const { data, error } = await supabase.from('stores').insert({
        client_id: client.id,
        nama_toko: formToko.nama_toko,
        slug: formToko.slug.toLowerCase().replace(/[^a-z0-9-]/g, ''),
        nomor_wa_toko: formToko.nomor_wa_toko,
        kategori: formToko.kategori,
        aktif: false,
        is_trial: false,
        pesan_terpakai: 0,
        batas_pesan_bulan: 1000,
        trial_pesan_limit: 100,
        onboarding_selesai: false,
      }).select().single()

      if (error) throw error

      setStores(prev => [...prev, data])
      setActiveStore(data)
      setShowTambahToko(false)
      setFormToko({ nama_toko: '', slug: '', nomor_wa_toko: '', kategori: '' })
      alert('✅ Toko berhasil ditambahkan! Hubungi tim kami di +62 813-2531-210 untuk aktivasi bot WhatsApp.')
    } catch (err) {
      alert('❌ Gagal tambah toko. Coba lagi.')
      console.error(err)
    } finally {
      setSavingToko(false)
    }
  }

  const getStatusColor = (status: string) => {
    if (status === 'aktif') return '#25d366'
    if (status === 'trial') return '#EF9F27'
    return '#EF4444'
  }

  const getPaketLabel = (paket: string) => {
    const map: Record<string, string> = {
      trial: 'Trial', starter: 'Starter',
      pro: 'Pro', bisnis: 'Bisnis', enterprise: 'Enterprise'
    }
    return map[paket] || paket
  }

  const batasToko: Record<string, number> = { trial: 1, starter: 1, pro: 3, bisnis: 10, enterprise: 999 }
  const maxToko = batasToko[client?.paket || 'trial'] || 1

  const kuotaPersen = activeStore
    ? Math.min(100, Math.round((activeStore.pesan_terpakai / (activeStore.is_trial ? activeStore.trial_pesan_limit : activeStore.batas_pesan_bulan)) * 100))
    : 0
  const kuotaWarning = kuotaPersen >= 80

  const menuItems = [
    { id: 'overview', icon: '📊', label: 'Overview' },
    { id: 'percakapan', icon: '💬', label: 'Percakapan', badge: unreadCount },
    { id: 'broadcast', icon: '📢', label: 'Broadcast' },
    { id: 'analytics', icon: '📈', label: 'Analytics' },
    { id: 'crm', icon: '👥', label: 'CRM' },
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
        .conv-item:hover { background: rgba(255,255,255,0.04) !important; }
        input, textarea, select { font-family: inherit; }
        input:focus, textarea:focus, select:focus { outline: none; border-color: rgba(37,211,102,0.5) !important; }
      `}</style>

      {/* SIDEBAR */}
      <div style={{ width: sidebarOpen ? '240px' : '64px', background: 'rgba(255,255,255,0.02)', borderRight: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', transition: 'width 0.3s ease', overflow: 'hidden', flexShrink: 0, position: 'sticky', top: 0, height: '100vh' }}>
        <div style={{ padding: '20px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
            <div style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg,#25d366,#128c7e)', borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', flexShrink: 0 }}>💬</div>
            {sidebarOpen && <span style={{ fontWeight: 800, fontSize: '1rem', whiteSpace: 'nowrap' }}>Mahirusaha</span>}
          </div>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '1rem', padding: '4px', flexShrink: 0 }}>
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>

        {/* Toko Selector */}
        {sidebarOpen && stores.length > 0 && (
          <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>Toko Aktif</div>

            {stores.length > 1 ? (
              <select
                value={activeStore?.id || ''}
                onChange={e => {
                  const toko = stores.find(s => s.id === e.target.value)
                  if (toko) setActiveStore(toko)
                }}
                style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '8px 10px', borderRadius: '8px', fontSize: '0.82rem', fontFamily: 'inherit', outline: 'none', cursor: 'pointer', marginBottom: '8px' }}
              >
                {stores.map(s => (
                  <option key={s.id} value={s.id} style={{ background: '#111827' }}>{s.nama_toko}</option>
                ))}
              </select>
            ) : (
              <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '10px 12px', marginBottom: '8px' }}>
                <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{activeStore?.nama_toko}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: activeStore?.aktif ? '#25d366' : '#EF4444', animation: activeStore?.aktif ? 'pulse 2s infinite' : 'none' }}/>
                  <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.45)' }}>{activeStore?.aktif ? 'Bot aktif' : 'Bot mati'}</span>
                </div>
              </div>
            )}

            {stores.length < maxToko ? (
              <button
                onClick={() => setShowTambahToko(true)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px', borderRadius: '8px', border: '1px dashed rgba(37,211,102,0.3)', background: 'transparent', color: '#25d366', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.78rem', fontWeight: 600 }}
              >
                ➕ Tambah Toko
              </button>
            ) : (
              <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: '4px 0' }}>
                Batas {getPaketLabel(client?.paket || '')}: {maxToko} toko
              </div>
            )}
          </div>
        )}

        <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
          {menuItems.map(item => (
            <div key={item.id} className="menu-item" onClick={() => setActiveMenu(item.id)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 10px', borderRadius: '10px', marginBottom: '2px', background: activeMenu === item.id ? 'rgba(37,211,102,0.1)' : 'transparent', border: activeMenu === item.id ? '1px solid rgba(37,211,102,0.2)' : '1px solid transparent' }}>
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
            <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '100px', padding: '6px 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: getStatusColor(client?.status || '') }}/>
              <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>{getPaketLabel(client?.paket || 'trial')}</span>
            </div>
            {(client?.status === 'trial' || client?.status === 'suspend') && (
              <a href="#" onClick={() => setActiveMenu('langganan')} style={{ background: client?.status === 'suspend' ? 'linear-gradient(135deg,#EF4444,#B91C1C)' : 'linear-gradient(135deg,#25d366,#128c7e)', color: '#fff', padding: '7px 16px', borderRadius: '100px', textDecoration: 'none', fontWeight: 700, fontSize: '0.78rem' }}>
                {client?.status === 'suspend' ? 'Perpanjang ↑' : 'Upgrade ↑'}
              </a>
            )}
          </div>
        </div>

        <div style={{ padding: '24px 28px' }}>

          {/* ==================== OVERVIEW ==================== */}
          {activeMenu === 'overview' && (
            <div className="fadeUp">
              {client?.status === 'suspend' && (
                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '14px', padding: '16px 20px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <span style={{ fontSize: '1.5rem' }}>🔴</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#EF4444', marginBottom: '4px' }}>Akun kamu disuspend</div>
                      <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>Masa aktif langganan sudah berakhir. Bot WhatsApp tidak aktif sementara.</div>
                    </div>
                  </div>
                  <button onClick={() => setActiveMenu('langganan')} style={{ background: 'linear-gradient(135deg,#EF4444,#B91C1C)', color: '#fff', padding: '10px 20px', borderRadius: '10px', border: 'none', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
                    Perpanjang Sekarang →
                  </button>
                </div>
              )}

              {kuotaWarning && (
                <div style={{ background: 'rgba(239,159,39,0.1)', border: '1px solid rgba(239,159,39,0.3)', borderRadius: '14px', padding: '14px 18px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <span style={{ fontSize: '1.2rem' }}>⚠️</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#EF9F27' }}>Kuota hampir habis!</div>
                      <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)' }}>{activeStore?.pesan_terpakai} dari {activeStore?.is_trial ? activeStore.trial_pesan_limit : activeStore?.batas_pesan_bulan} pesan terpakai ({kuotaPersen}%)</div>
                    </div>
                  </div>
                  <button onClick={() => setActiveMenu('langganan')} className="btn" style={{ background: '#EF9F27', color: '#070d1a', padding: '8px 16px', borderRadius: '8px', border: 'none', fontWeight: 700, fontSize: '0.78rem', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
                    Upgrade Sekarang
                  </button>
                </div>
              )}

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

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px', marginBottom: '24px' }}>
                {[
                  { icon: '💬', label: 'Pesan Terpakai', value: `${activeStore?.pesan_terpakai || 0}`, sub: `dari ${activeStore?.is_trial ? activeStore.trial_pesan_limit : activeStore?.batas_pesan_bulan || 0}`, color: '#25d366', progress: kuotaPersen },
                  { icon: '📦', label: 'Total Produk', value: totalProduk.toString(), sub: 'produk terdaftar', color: '#818cf8', progress: null },
                  { icon: '👥', label: 'Percakapan', value: conversations.length.toString(), sub: `${unreadCount} belum dibaca`, color: '#EF9F27', progress: null },
                  { icon: '🤖', label: 'Status Bot', value: client?.status === 'suspend' ? 'Suspended' : activeStore?.aktif ? 'Aktif' : 'Mati', sub: activeStore?.is_trial ? `Trial — ${100 - (activeStore?.pesan_terpakai || 0)} sisa` : 'Paket ' + getPaketLabel(client?.paket || ''), color: client?.status === 'suspend' ? '#EF4444' : activeStore?.aktif ? '#25d366' : '#EF4444', progress: null },
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '16px' }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', overflow: 'hidden' }}>
                  <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontWeight: 700, fontSize: '0.9rem' }}>💬 Percakapan Terbaru</h3>
                    <button onClick={() => setActiveMenu('percakapan')} style={{ background: 'none', border: 'none', color: '#25d366', fontSize: '0.78rem', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>Lihat semua →</button>
                  </div>
                  {conversations.length === 0 ? (
                    <div style={{ padding: '40px 20px', textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>
                      <div style={{ fontSize: '2rem', marginBottom: '10px' }}>💬</div>
                      <p style={{ fontSize: '0.85rem' }}>Belum ada percakapan</p>
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

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {activeStore?.slug && (
                    <div style={{ background: 'rgba(37,211,102,0.05)', border: '1px solid rgba(37,211,102,0.15)', borderRadius: '16px', padding: '18px' }}>
                      <h3 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '12px' }}>🛍️ Link Toko Online Kamu</h3>
                      <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '10px' }}>
                        <span style={{ fontSize: '0.78rem', color: '#25d366', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>mahirusaha.com/{activeStore.slug}</span>
                        <button onClick={() => { navigator.clipboard.writeText(`https://mahirusaha.com/${activeStore.slug}`); alert('Link toko berhasil disalin!') }} style={{ background: 'rgba(37,211,102,0.15)', border: '1px solid rgba(37,211,102,0.25)', color: '#25d366', padding: '5px 10px', borderRadius: '6px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.72rem', fontWeight: 700, flexShrink: 0 }}>📋 Salin</button>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <a href={`https://mahirusaha.com/${activeStore.slug}`} target="_blank" rel="noopener noreferrer" style={{ flex: 1, display: 'block', textAlign: 'center', background: 'linear-gradient(135deg,#25d366,#128c7e)', color: '#fff', padding: '9px', borderRadius: '8px', textDecoration: 'none', fontWeight: 700, fontSize: '0.78rem' }}>🔗 Buka Toko</a>
                        <a href={`https://wa.me/?text=${encodeURIComponent(`Yuk belanja di toko kami! https://mahirusaha.com/${activeStore.slug}`)}`} target="_blank" rel="noopener noreferrer" style={{ flex: 1, display: 'block', textAlign: 'center', background: 'rgba(37,211,102,0.1)', border: '1px solid rgba(37,211,102,0.25)', color: '#25d366', padding: '9px', borderRadius: '8px', textDecoration: 'none', fontWeight: 700, fontSize: '0.78rem' }}>📤 Share WA</a>
                      </div>
                    </div>
                  )}

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

                  {activeStore && (
                    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '18px' }}>
                      <h3 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '14px' }}>🏪 Info Toko</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {[
                          { label: 'Nama', value: activeStore.nama_toko },
                          { label: 'Kategori', value: activeStore.kategori || '-' },
                          { label: 'Nomor WA', value: activeStore.nomor_wa_toko },
                          { label: 'Status Bot', value: client?.status === 'suspend' ? '🔴 Suspended' : activeStore.aktif ? '🟢 Aktif' : '🔴 Mati' },
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
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '16px' }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', overflow: 'hidden' }}>
                  <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <h3 style={{ fontWeight: 700, fontSize: '0.9rem' }}>Semua Percakapan — {activeStore?.nama_toko}</h3>
                    <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>{conversations.length} percakapan · {unreadCount} belum dibaca</p>
                  </div>
                  {conversations.length === 0 ? (
                    <div style={{ padding: '60px 20px', textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>
                      <div style={{ fontSize: '3rem', marginBottom: '16px' }}>💬</div>
                      <p style={{ fontWeight: 600, marginBottom: '6px' }}>Belum ada percakapan</p>
                      <p style={{ fontSize: '0.85rem' }}>Bot siap menerima pesan dari pelanggan kamu</p>
                    </div>
                  ) : (
                    conversations.map((conv, i) => (
                      <div key={i} className="conv-item" onClick={() => setSelectedConv(conv)} style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', gap: '12px', alignItems: 'flex-start', background: selectedConv?.id === conv.id ? 'rgba(37,211,102,0.06)' : !conv.dibaca ? 'rgba(37,211,102,0.02)' : 'transparent', cursor: 'pointer', borderLeft: selectedConv?.id === conv.id ? '3px solid #25d366' : '3px solid transparent', transition: 'all 0.15s' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>👤</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                            <span style={{ fontWeight: 600, fontSize: '0.82rem' }}>{conv.nomor_pelanggan}</span>
                            <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.3)' }}>{new Date(conv.created_at).toLocaleDateString('id-ID')}</span>
                          </div>
                          <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>📥 {conv.pesan_masuk}</p>
                          <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>🤖 {conv.pesan_keluar}</p>
                        </div>
                        {!conv.dibaca && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#25d366', flexShrink: 0, marginTop: '4px' }}/>}
                      </div>
                    ))
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {selectedConv ? (
                    <>
                      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '16px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px', paddingBottom: '14px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>👤</div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{selectedConv.nomor_pelanggan}</div>
                            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>{new Date(selectedConv.created_at).toLocaleString('id-ID')}</div>
                          </div>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '10px 14px', marginBottom: '8px' }}>
                          <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)', marginBottom: '4px', fontWeight: 600 }}>📥 PESAN PELANGGAN</div>
                          <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.6 }}>{selectedConv.pesan_masuk}</p>
                        </div>
                        <div style={{ background: 'rgba(37,211,102,0.05)', border: '1px solid rgba(37,211,102,0.1)', borderRadius: '10px', padding: '10px 14px' }}>
                          <div style={{ fontSize: '0.65rem', color: '#25d366', marginBottom: '4px', fontWeight: 600 }}>🤖 BALASAN BOT</div>
                          <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>{selectedConv.pesan_keluar}</p>
                        </div>
                      </div>

                      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '16px 20px' }}>
                        <h3 style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: '8px' }}>👤 Human Takeover</h3>
                        <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginBottom: '12px', lineHeight: 1.6 }}>Ambil alih percakapan — bot berhenti menjawab dan kamu bisa balas manual dari sini.</p>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={() => handleAmbilAlih(selectedConv.nomor_pelanggan)} className="btn" style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg,#EF9F27,#d97706)', color: '#fff', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer', fontFamily: 'inherit' }}>👤 Ambil Alih</button>
                          <button onClick={() => handleAktifkanBot(selectedConv.nomor_pelanggan)} className="btn" style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid rgba(37,211,102,0.3)', background: 'transparent', color: '#25d366', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer', fontFamily: 'inherit' }}>🤖 Aktifkan Bot</button>
                        </div>
                      </div>

                      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '16px 20px' }}>
                        <h3 style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: '10px' }}>✏️ Balas Manual</h3>
                        <textarea value={replyPesan} onChange={e => setReplyPesan(e.target.value)} placeholder="Ketik balasan untuk pelanggan..." rows={4} style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '12px', borderRadius: '10px', fontSize: '0.82rem', fontFamily: 'inherit', resize: 'none', outline: 'none', marginBottom: '10px' }}/>
                        <button onClick={() => handleReplyManual(selectedConv.nomor_pelanggan)} disabled={!replyPesan.trim() || sendingReply} className="btn" style={{ width: '100%', padding: '11px', borderRadius: '10px', border: 'none', background: !replyPesan.trim() || sendingReply ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg,#25d366,#128c7e)', color: '#fff', fontWeight: 700, fontSize: '0.82rem', cursor: !replyPesan.trim() || sendingReply ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: !replyPesan.trim() || sendingReply ? 0.5 : 1 }}>
                          {sendingReply ? '⏳ Mengirim...' : '📤 Kirim Balasan'}
                        </button>
                      </div>
                    </>
                  ) : (
                    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '48px 20px', textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>
                      <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>👈</div>
                      <p style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px' }}>Pilih percakapan</p>
                      <p style={{ fontSize: '0.78rem' }}>Klik percakapan di kiri untuk melihat detail dan membalas</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ==================== PRODUK ==================== */}
          {activeMenu === 'produk' && (
            <div className="fadeUp">
              <ProdukPage storeId={activeStore?.id || ''} />
            </div>
          )}

          {/* ==================== BROADCAST ==================== */}
          {activeMenu === 'broadcast' && activeStore && client && (
            <div className="fadeUp">
              <BroadcastPage storeId={activeStore.id} clientId={client.id} clientPaket={client.paket} />
            </div>
          )}

          {/* ==================== ANALYTICS ==================== */}
          {activeMenu === 'analytics' && activeStore && client && (
            <div className="fadeUp">
              <AnalyticsPage storeId={activeStore.id} clientPaket={client.paket} />
            </div>
          )}

          {/* ==================== CRM ==================== */}
          {activeMenu === 'crm' && activeStore && client && (
            <div className="fadeUp">
              <CRMPage storeId={activeStore.id} clientPaket={client.paket} />
            </div>
          )}

          {/* ==================== LANGGANAN ==================== */}
          {activeMenu === 'langganan' && (
            <div className="fadeUp">
              <LanggananPage clientId={client?.id || ''} clientStatus={client?.status || 'trial'} clientPaket={client?.paket || 'trial'} clientTanggalBerakhir={client?.tanggal_berakhir || ''} pesanTerpakai={activeStore?.pesan_terpakai || 0} trialLimit={activeStore?.trial_pesan_limit || 100} />
            </div>
          )}

          {/* ==================== REFERRAL ==================== */}
          {activeMenu === 'referral' && (
            <div className="fadeUp">
              <div style={{ maxWidth: '600px' }}>
                <div style={{ background: 'linear-gradient(135deg,rgba(244,114,182,0.1),rgba(99,102,241,0.1))', border: '1px solid rgba(244,114,182,0.2)', borderRadius: '20px', padding: '32px', textAlign: 'center', marginBottom: '20px' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🎁</div>
                  <h2 style={{ fontWeight: 800, fontSize: '1.3rem', marginBottom: '8px' }}>Undang teman, dapat diskon!</h2>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem', lineHeight: 1.7, marginBottom: '24px' }}>Bagikan kode referralmu. Setiap teman yang daftar menggunakan kodemu, kamu dapat diskon 10% untuk bulan berikutnya.</p>
                  <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
                    <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', marginBottom: '6px' }}>Kode Referralmu</div>
                    <div style={{ fontFamily: 'monospace', fontSize: '1.6rem', fontWeight: 800, letterSpacing: '4px', color: '#F472B6' }}>{client?.referral_code || 'MHR000000'}</div>
                  </div>
                  <button className="btn" onClick={() => { navigator.clipboard.writeText(client?.referral_code || ''); alert('Kode disalin!') }} style={{ background: 'linear-gradient(135deg,#F472B6,#6366f1)', color: '#fff', padding: '12px 28px', borderRadius: '10px', border: 'none', fontWeight: 700, fontSize: '0.875rem', fontFamily: 'inherit', cursor: 'pointer' }}>📋 Salin Kode Referral</button>
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
          {activeMenu === 'pengaturan-toko' && activeStore && (
            <div className="fadeUp">
              <PengaturanToko store={activeStore} onUpdate={(updatedStore) => setActiveStore(updatedStore)} />
            </div>
          )}

        </div>
      </div>

      {/* MODAL TAMBAH TOKO */}
      {showTambahToko && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#0f1829', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '28px', width: '100%', maxWidth: '460px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontWeight: 800, fontSize: '1rem' }}>➕ Tambah Toko Baru</h2>
              <button onClick={() => setShowTambahToko(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: '6px' }}>Nama Toko *</label>
                <input style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '10px 14px', borderRadius: '10px', fontSize: '0.875rem', fontFamily: 'inherit', outline: 'none' }} placeholder="Toko Kedua Saya" value={formToko.nama_toko} onChange={e => setFormToko(p => ({ ...p, nama_toko: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: '6px' }}>Link Toko Online *</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', whiteSpace: 'nowrap' }}>mahirusaha.com/</span>
                  <input style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '10px 14px', borderRadius: '10px', fontSize: '0.875rem', fontFamily: 'inherit', outline: 'none' }} placeholder="nama-toko-kedua" value={formToko.slug} onChange={e => setFormToko(p => ({ ...p, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') }))} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: '6px' }}>Nomor WA Bot</label>
                <input style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '10px 14px', borderRadius: '10px', fontSize: '0.875rem', fontFamily: 'inherit', outline: 'none' }} placeholder="628xxxxxxxxxx" value={formToko.nomor_wa_toko} onChange={e => setFormToko(p => ({ ...p, nomor_wa_toko: e.target.value }))} />
                <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', marginTop: '4px', display: 'block' }}>Nomor WA khusus bot — jangan pakai nomor yang sudah ada WA-nya!</span>
              </div>
              <div>
                <label style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: '6px' }}>Kategori</label>
                <select style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '10px 14px', borderRadius: '10px', fontSize: '0.875rem', fontFamily: 'inherit', outline: 'none' }} value={formToko.kategori} onChange={e => setFormToko(p => ({ ...p, kategori: e.target.value }))}>
                  <option value="" style={{ background: '#111827' }}>Pilih kategori...</option>
                  {['Kuliner & Makanan','Fashion & Pakaian','Kecantikan & Skincare','Elektronik','Kesehatan','Pendidikan','Properti','Otomotif','Jasa & Layanan','Retail & Toko','Lainnya'].map(k => (
                    <option key={k} value={k} style={{ background: '#111827' }}>{k}</option>
                  ))}
                </select>
              </div>
              <div style={{ background: 'rgba(239,159,39,0.08)', border: '1px solid rgba(239,159,39,0.2)', borderRadius: '10px', padding: '12px 14px' }}>
                <p style={{ fontSize: '0.75rem', color: '#EF9F27', lineHeight: 1.6 }}>⚠️ Setelah tambah toko, hubungi tim kami di <strong>+62 813-2531-210</strong> untuk aktivasi bot WhatsApp toko ini.</p>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                <button onClick={() => setShowTambahToko(false)} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>Batal</button>
                <button onClick={handleTambahToko} disabled={!formToko.nama_toko || !formToko.slug || savingToko} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', background: !formToko.nama_toko || !formToko.slug ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg,#25d366,#128c7e)', color: '#fff', cursor: !formToko.nama_toko || !formToko.slug ? 'not-allowed' : 'pointer', fontFamily: 'inherit', fontWeight: 700, fontSize: '0.875rem', opacity: !formToko.nama_toko || !formToko.slug ? 0.5 : 1 }}>
                  {savingToko ? '⏳ Menyimpan...' : '✅ Tambah Toko'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
