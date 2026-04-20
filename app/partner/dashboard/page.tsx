'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Partner {
  id: string
  nama: string
  email: string
  komisi_persen: number
}

interface Komisi {
  id: string
  referred_client_id: string
  jumlah_komisi: number
  bulan: number
  tahun: number
  status: string
  tanggal_dibayar: string
  created_at: string
}

interface ReferredClient {
  id: string
  nama_pemilik: string
  email: string
  paket: string
  status: string
  created_at: string
}

export default function PartnerDashboard() {
  const [partner, setPartner] = useState<Partner | null>(null)
  const [komisiList, setKomisiList] = useState<Komisi[]>([])
  const [referredClients, setReferredClients] = useState<ReferredClient[]>([])
  const [loading, setLoading] = useState(true)
  const [activeMenu, setActiveMenu] = useState('overview')
  const [referralCode, setReferralCode] = useState('')

  useEffect(() => {
    const session = localStorage.getItem('mahirusaha_partner')
    if (!session) {
      window.location.href = '/partner/masuk'
      return
    }
    const partnerData = JSON.parse(session)
    setPartner(partnerData)
    loadDashboard(partnerData.id)
  }, [])

  const loadDashboard = async (partnerId: string) => {
    try {
      // Ambil data komisi partner
      const { data: komisiData } = await supabase
        .from('partner_komisi')
        .select('*')
        .eq('partner_client_id', partnerId)
        .order('created_at', { ascending: false })

      setKomisiList(komisiData || [])

      // Ambil referral code partner
      const { data: clientData } = await supabase
        .from('clients')
        .select('referral_code, komisi_persen')
        .eq('id', partnerId)
        .single()

      if (clientData) {
        setReferralCode(clientData.referral_code || '')
        setPartner(prev => prev ? { ...prev, komisi_persen: clientData.komisi_persen || 15 } : prev)
      }

      // Ambil daftar klien yang direferensikan
      const { data: referrals } = await supabase
        .from('referrals')
        .select('referred_id')
        .eq('referrer_id', partnerId)

      if (referrals && referrals.length > 0) {
        const referredIds = referrals.map(r => r.referred_id)
        const { data: clientsData } = await supabase
          .from('clients')
          .select('id, nama_pemilik, email, paket, status, created_at')
          .in('id', referredIds)
          .order('created_at', { ascending: false })

        setReferredClients(clientsData || [])
      }

    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('mahirusaha_partner')
    window.location.href = '/partner/masuk'
  }

  const fmt = (n: number) => 'Rp ' + n.toLocaleString('id-ID')
  const namaBulan = (bulan: number) => ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Ags','Sep','Okt','Nov','Des'][bulan - 1]
  const getPaketColor = (paket: string) => ({ starter: '#25d366', pro: '#818cf8', bisnis: '#EF9F27', enterprise: '#6366f1' }[paket] || '#888')
  const getStatusColor = (status: string) => ({ aktif: '#25d366', trial: '#EF9F27', suspend: '#EF4444' }[status] || '#888')

  // Statistik
  const totalKomisi = komisiList.reduce((sum, k) => sum + k.jumlah_komisi, 0)
  const komisiPending = komisiList.filter(k => k.status === 'pending').reduce((sum, k) => sum + k.jumlah_komisi, 0)
  const komisiDibayar = komisiList.filter(k => k.status === 'dibayar').reduce((sum, k) => sum + k.jumlah_komisi, 0)
  const bulanIni = new Date().getMonth() + 1
  const tahunIni = new Date().getFullYear()
  const komisiBulanIni = komisiList.filter(k => k.bulan === bulanIni && k.tahun === tahunIni).reduce((sum, k) => sum + k.jumlah_komisi, 0)
  const klienAktif = referredClients.filter(c => c.status === 'aktif').length

  const menuItems = [
    { id: 'overview', icon: '📊', label: 'Overview' },
    { id: 'komisi', icon: '💰', label: 'Komisi' },
    { id: 'klien', icon: '👥', label: 'Klien Referral' },
    { id: 'referral', icon: '🔗', label: 'Link Referral' },
  ]

  if (loading) {
    return (
      <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: '#070d1a', color: '#fff', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap'); * { box-sizing: border-box; margin: 0; padding: 0; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid rgba(129,140,248,0.2)', borderTop: '3px solid #818cf8', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}/>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>Memuat dashboard partner...</p>
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
        ::-webkit-scrollbar-thumb { background: rgba(129,140,248,0.3); border-radius: 2px; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        .fadeUp { animation: fadeUp 0.4s ease forwards; }
        .menu-item { transition: all 0.2s; cursor: pointer; }
        .menu-item:hover { background: rgba(255,255,255,0.05) !important; }
        .card { transition: transform 0.2s, box-shadow 0.2s; }
        .card:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(0,0,0,0.3); }
        .btn { transition: opacity 0.2s; cursor: pointer; }
        .btn:hover { opacity: 0.85; }
      `}</style>

      {/* SIDEBAR */}
      <div style={{ width: '220px', background: 'rgba(255,255,255,0.02)', borderRight: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', flexShrink: 0, position: 'sticky', top: 0, height: '100vh' }}>
        <div style={{ padding: '20px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg,#818cf8,#6366f1)', borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', flexShrink: 0 }}>🤝</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>Partner Panel</div>
            <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)' }}>Mahirusaha</div>
          </div>
        </div>

        {/* Komisi Badge */}
        <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', marginBottom: '6px' }}>Komisi kamu</div>
          <div style={{ background: 'rgba(129,140,248,0.1)', border: '1px solid rgba(129,140,248,0.2)', borderRadius: '8px', padding: '10px 12px', textAlign: 'center' }}>
            <div style={{ fontWeight: 800, fontSize: '1.5rem', color: '#818cf8' }}>{partner?.komisi_persen || 15}%</div>
            <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.4)' }}>per transaksi klien</div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
          {menuItems.map(item => (
            <div key={item.id} className="menu-item" onClick={() => setActiveMenu(item.id)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', marginBottom: '2px', background: activeMenu === item.id ? 'rgba(129,140,248,0.1)' : 'transparent', border: activeMenu === item.id ? '1px solid rgba(129,140,248,0.2)' : '1px solid transparent' }}>
              <span style={{ fontSize: '1rem' }}>{item.icon}</span>
              <span style={{ fontSize: '0.875rem', fontWeight: activeMenu === item.id ? 600 : 500, color: activeMenu === item.id ? '#818cf8' : 'rgba(255,255,255,0.65)' }}>{item.label}</span>
            </div>
          ))}
        </nav>

        <div style={{ padding: '12px 8px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ padding: '10px 12px', marginBottom: '4px' }}>
            <div style={{ fontWeight: 600, fontSize: '0.82rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{partner?.nama}</div>
            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{partner?.email}</div>
          </div>
          <button onClick={handleLogout} className="menu-item" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.875rem' }}>
            <span>🚪</span> Keluar
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, overflowY: 'auto', height: '100vh' }}>
        <div style={{ padding: '16px 28px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(7,13,26,0.8)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 10 }}>
          <h1 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
            {menuItems.find(m => m.id === activeMenu)?.icon} {menuItems.find(m => m.id === activeMenu)?.label}
          </h1>
          <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>
            {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>

        <div style={{ padding: '24px 28px' }}>

          {/* ===== OVERVIEW ===== */}
          {activeMenu === 'overview' && (
            <div className="fadeUp">
              {/* Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px', marginBottom: '24px' }}>
                {[
                  { icon: '💰', label: 'Komisi Bulan Ini', value: fmt(komisiBulanIni), color: '#818cf8' },
                  { icon: '⏳', label: 'Komisi Pending', value: fmt(komisiPending), color: '#EF9F27' },
                  { icon: '✅', label: 'Total Dibayar', value: fmt(komisiDibayar), color: '#25d366' },
                  { icon: '👥', label: 'Klien Aktif', value: `${klienAktif}`, color: '#818cf8' },
                ].map((s, i) => (
                  <div key={i} className="card" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '18px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <span style={{ fontSize: '1.4rem' }}>{s.icon}</span>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: s.color }}/>
                    </div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: s.color, marginBottom: '4px' }}>{s.value}</div>
                    <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Info Komisi */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <div style={{ background: 'rgba(129,140,248,0.06)', border: '1px solid rgba(129,140,248,0.15)', borderRadius: '16px', padding: '20px' }}>
                  <h3 style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: '14px', color: '#818cf8' }}>📊 Ringkasan Komisi</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {[
                      { label: 'Total Klien Referral', value: referredClients.length.toString() },
                      { label: 'Klien Aktif', value: klienAktif.toString() },
                      { label: 'Total Komisi All-time', value: fmt(totalKomisi) },
                      { label: 'Persentase Komisi', value: `${partner?.komisi_persen || 15}%` },
                    ].map((item, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', paddingBottom: '8px', borderBottom: i < 3 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                        <span style={{ color: 'rgba(255,255,255,0.5)' }}>{item.label}</span>
                        <span style={{ fontWeight: 700, color: '#fff' }}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '20px' }}>
                  <h3 style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: '14px' }}>🔗 Link Referral Kamu</h3>
                  <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '10px 14px', marginBottom: '10px' }}>
                    <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginBottom: '4px' }}>Kode Referral</div>
                    <div style={{ fontFamily: 'monospace', fontSize: '1.2rem', fontWeight: 800, letterSpacing: '3px', color: '#818cf8' }}>{referralCode || 'Loading...'}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn" onClick={() => { navigator.clipboard.writeText(`https://mahirusaha.com/daftar?ref=${referralCode}`); alert('Link disalin!') }} style={{ flex: 1, padding: '9px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg,#818cf8,#6366f1)', color: '#fff', fontWeight: 700, fontSize: '0.78rem', fontFamily: 'inherit' }}>
                      📋 Salin Link
                    </button>
                    <a href={`https://wa.me/?text=${encodeURIComponent(`Halo! Coba platform chatbot WA + toko online gratis untuk UMKM ini:\nhttps://mahirusaha.com/daftar?ref=${referralCode}`)}`} target="_blank" rel="noopener noreferrer" style={{ flex: 1, display: 'block', textAlign: 'center', padding: '9px', borderRadius: '8px', border: '1px solid rgba(129,140,248,0.3)', background: 'transparent', color: '#818cf8', textDecoration: 'none', fontWeight: 700, fontSize: '0.78rem' }}>
                      📤 Share WA
                    </a>
                  </div>
                </div>
              </div>

              {/* Klien terbaru */}
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontWeight: 700, fontSize: '0.9rem' }}>👥 Klien Referral Terbaru</h3>
                  <button onClick={() => setActiveMenu('klien')} style={{ background: 'none', border: 'none', color: '#818cf8', fontSize: '0.78rem', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>Lihat semua →</button>
                </div>
                {referredClients.length === 0 ? (
                  <div style={{ padding: '40px 20px', textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '10px' }}>👥</div>
                    <p style={{ fontSize: '0.85rem' }}>Belum ada klien referral</p>
                    <p style={{ fontSize: '0.75rem', marginTop: '4px' }}>Share link referralmu ke jaringan UMKM!</p>
                  </div>
                ) : (
                  referredClients.slice(0, 5).map((c, i) => (
                    <div key={i} style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.82rem' }}>{c.nama_pemilik}</div>
                        <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>{c.email}</div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.7rem', background: `rgba(${getPaketColor(c.paket) === '#25d366' ? '37,211,102' : getPaketColor(c.paket) === '#818cf8' ? '129,140,248' : '239,159,39'},0.15)`, color: getPaketColor(c.paket), padding: '2px 8px', borderRadius: '100px', fontWeight: 600 }}>
                          {c.paket.charAt(0).toUpperCase() + c.paket.slice(1)}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: getStatusColor(c.status), fontWeight: 600 }}>
                          {c.status === 'aktif' ? '🟢 Aktif' : c.status === 'trial' ? '🟡 Trial' : '🔴 Suspend'}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ===== KOMISI ===== */}
          {activeMenu === 'komisi' && (
            <div className="fadeUp">
              {/* Summary */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '14px', marginBottom: '24px' }}>
                {[
                  { label: 'Total Komisi', value: fmt(totalKomisi), color: '#818cf8' },
                  { label: 'Pending', value: fmt(komisiPending), color: '#EF9F27' },
                  { label: 'Sudah Dibayar', value: fmt(komisiDibayar), color: '#25d366' },
                ].map((s, i) => (
                  <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '18px', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: s.color, marginBottom: '4px' }}>{s.value}</div>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Riwayat Komisi */}
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <h3 style={{ fontWeight: 700, fontSize: '0.9rem' }}>💰 Riwayat Komisi</h3>
                </div>
                {komisiList.length === 0 ? (
                  <div style={{ padding: '60px 20px', textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '16px' }}>💰</div>
                    <p style={{ fontWeight: 600, marginBottom: '6px' }}>Belum ada komisi</p>
                    <p style={{ fontSize: '0.85rem' }}>Komisi akan masuk setelah klien referral kamu melakukan pembayaran</p>
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px', padding: '10px 20px', background: 'rgba(255,255,255,0.04)', fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      <span>Klien</span><span>Jumlah</span><span>Periode</span><span>Status</span>
                    </div>
                    {komisiList.map((k, i) => {
                      const klien = referredClients.find(c => c.id === k.referred_client_id)
                      return (
                        <div key={k.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px', padding: '14px 20px', borderTop: '1px solid rgba(255,255,255,0.04)', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.82rem' }}>{klien?.nama_pemilik || '-'}</div>
                            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>{klien?.paket ? klien.paket.charAt(0).toUpperCase() + klien.paket.slice(1) : '-'}</div>
                          </div>
                          <div style={{ fontWeight: 700, color: '#818cf8', fontSize: '0.875rem' }}>{fmt(k.jumlah_komisi)}</div>
                          <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)' }}>{namaBulan(k.bulan)} {k.tahun}</div>
                          <div>
                            {k.status === 'pending' ? (
                              <span style={{ fontSize: '0.72rem', background: 'rgba(239,159,39,0.15)', color: '#EF9F27', padding: '3px 10px', borderRadius: '100px', fontWeight: 600 }}>⏳ Pending</span>
                            ) : (
                              <div>
                                <span style={{ fontSize: '0.72rem', background: 'rgba(37,211,102,0.15)', color: '#25d366', padding: '3px 10px', borderRadius: '100px', fontWeight: 600 }}>✅ Dibayar</span>
                                {k.tanggal_dibayar && <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', marginTop: '4px' }}>{new Date(k.tanggal_dibayar).toLocaleDateString('id-ID')}</div>}
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </>
                )}
              </div>

              {/* Info Pembayaran */}
              <div style={{ marginTop: '16px', background: 'rgba(129,140,248,0.06)', border: '1px solid rgba(129,140,248,0.15)', borderRadius: '14px', padding: '16px 20px' }}>
                <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.7 }}>
                  💡 Komisi dengan status <strong style={{ color: '#EF9F27' }}>Pending</strong> akan ditransfer ke rekening kamu setiap awal bulan. Pastikan nomor rekening kamu sudah terdaftar. Hubungi tim kami di <strong style={{ color: '#818cf8' }}>+62 813-2531-210</strong> jika ada pertanyaan.
                </p>
              </div>
            </div>
          )}

          {/* ===== KLIEN REFERRAL ===== */}
          {activeMenu === 'klien' && (
            <div className="fadeUp">
              <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', marginBottom: '16px' }}>
                {referredClients.length} klien referral · {klienAktif} aktif
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', overflow: 'hidden' }}>
                {referredClients.length === 0 ? (
                  <div style={{ padding: '60px 20px', textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '16px' }}>👥</div>
                    <p style={{ fontWeight: 600, marginBottom: '6px' }}>Belum ada klien referral</p>
                    <p style={{ fontSize: '0.85rem' }}>Share link referralmu dan mulai dapatkan komisi!</p>
                    <button onClick={() => setActiveMenu('referral')} style={{ marginTop: '16px', background: 'linear-gradient(135deg,#818cf8,#6366f1)', color: '#fff', padding: '10px 20px', borderRadius: '10px', border: 'none', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                      🔗 Lihat Link Referral
                    </button>
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr', gap: '12px', padding: '12px 20px', background: 'rgba(255,255,255,0.04)', fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      <span>Nama</span><span>Email</span><span>Paket</span><span>Status</span><span>Bergabung</span>
                    </div>
                    {referredClients.map((c, i) => (
                      <div key={c.id} style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr', gap: '12px', padding: '14px 20px', borderTop: '1px solid rgba(255,255,255,0.04)', alignItems: 'center' }}>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{c.nama_pemilik}</div>
                        <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.email}</div>
                        <div>
                          <span style={{ fontSize: '0.72rem', background: 'rgba(129,140,248,0.15)', color: '#818cf8', padding: '2px 8px', borderRadius: '100px', fontWeight: 600 }}>
                            {c.paket.charAt(0).toUpperCase() + c.paket.slice(1)}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.78rem', color: getStatusColor(c.status), fontWeight: 600 }}>
                          {c.status === 'aktif' ? '🟢 Aktif' : c.status === 'trial' ? '🟡 Trial' : '🔴 Suspend'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>
                          {new Date(c.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: '2-digit' })}
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          )}

          {/* ===== LINK REFERRAL ===== */}
          {activeMenu === 'referral' && (
            <div className="fadeUp">
              <div style={{ maxWidth: '600px' }}>
                {/* Kode Referral */}
                <div style={{ background: 'linear-gradient(135deg,rgba(129,140,248,0.1),rgba(99,102,241,0.1))', border: '1px solid rgba(129,140,248,0.2)', borderRadius: '20px', padding: '32px', textAlign: 'center', marginBottom: '20px' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🔗</div>
                  <h2 style={{ fontWeight: 800, fontSize: '1.2rem', marginBottom: '8px' }}>Link & Kode Referral Kamu</h2>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.82rem', marginBottom: '24px' }}>
                    Bagikan ke jaringan UMKM kamu dan dapatkan komisi {partner?.komisi_persen || 15}% setiap bulan!
                  </p>

                  {/* Kode */}
                  <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
                    <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', marginBottom: '6px' }}>Kode Referral</div>
                    <div style={{ fontFamily: 'monospace', fontSize: '1.8rem', fontWeight: 800, letterSpacing: '4px', color: '#818cf8' }}>{referralCode || '-'}</div>
                  </div>

                  {/* Link */}
                  <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '10px 14px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      mahirusaha.com/daftar?ref={referralCode}
                    </span>
                    <button className="btn" onClick={() => { navigator.clipboard.writeText(`https://mahirusaha.com/daftar?ref=${referralCode}`); alert('Link disalin!') }} style={{ background: 'rgba(129,140,248,0.2)', border: '1px solid rgba(129,140,248,0.3)', color: '#818cf8', padding: '5px 12px', borderRadius: '6px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.72rem', fontWeight: 700, flexShrink: 0 }}>
                      📋 Salin
                    </button>
                  </div>

                  {/* Share buttons */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn" onClick={() => { navigator.clipboard.writeText(`https://mahirusaha.com/daftar?ref=${referralCode}`); alert('Link disalin!') }} style={{ flex: 1, padding: '11px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg,#818cf8,#6366f1)', color: '#fff', fontWeight: 700, fontSize: '0.82rem', fontFamily: 'inherit' }}>
                      📋 Salin Link
                    </button>
                    <a href={`https://wa.me/?text=${encodeURIComponent(`Halo! Mau rekomendasikan platform chatbot WA + toko online gratis untuk UMKM.\n\nMahirusaha bisa bantu bisnis kamu:\n✅ Bot WA otomatis 24 jam\n✅ Toko online gratis\n✅ Mulai Rp 99rb/bulan\n\nDaftar gratis di sini:\nhttps://mahirusaha.com/daftar?ref=${referralCode}`)}`} target="_blank" rel="noopener noreferrer" style={{ flex: 1, display: 'block', textAlign: 'center', padding: '11px', borderRadius: '10px', border: '1px solid rgba(129,140,248,0.3)', background: 'transparent', color: '#818cf8', textDecoration: 'none', fontWeight: 700, fontSize: '0.82rem' }}>
                      📤 Share WA
                    </a>
                  </div>
                </div>

                {/* Tips */}
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '20px' }}>
                  <h3 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '14px' }}>💡 Tips Referral yang Efektif</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {[
                      { icon: '🎯', tip: 'Target UMKM yang aktif di WhatsApp dan butuh layanan pelanggan 24 jam' },
                      { icon: '📱', tip: 'Demo langsung bot di +62 813-2531-210 ke calon klien agar mereka lihat sendiri' },
                      { icon: '🛍️', tip: 'Tunjukkan toko online gratis — ini nilai tambah yang jarang ada di platform lain' },
                      { icon: '💰', tip: 'Fokus ke bisnis kuliner, fashion, kecantikan — mereka paling banyak tanya via WA' },
                      { icon: '🤝', tip: 'Tawarkan bantu setup gratis — tim Mahirusaha yang kerjakan, kamu yang dapat komisi' },
                    ].map((t, i) => (
                      <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                        <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>{t.icon}</span>
                        <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>{t.tip}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
