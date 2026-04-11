'use client'
import { useState, useEffect } from 'react'

interface LanggananPageProps {
  clientId: string
  clientStatus: string
  clientPaket: string
  clientTanggalBerakhir: string
  pesanTerpakai: number
  trialLimit: number
}


export default function LanggananPage({
  clientId,
  clientStatus,
  clientPaket,
  clientTanggalBerakhir,
  pesanTerpakai,
  trialLimit,
}: LanggananPageProps) {
  const [billing, setBilling] = useState<'bulanan' | 'tahunan'>('bulanan')
  const [loading, setLoading] = useState<string | null>(null)
  const [snapLoaded, setSnapLoaded] = useState(false)

  // Load Midtrans Snap script
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://app.sandbox.midtrans.com/snap/snap.js'
    script.setAttribute('data-client-key', process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || '')
    script.onload = () => setSnapLoaded(true)
    document.head.appendChild(script)
    return () => {
      document.head.removeChild(script)
    }
  }, [])

  const handleBayar = async (paket: string) => {
    if (!snapLoaded) {
      alert('Payment gateway belum siap. Coba lagi.')
      return
    }

    setLoading(paket)

    try {
      // Buat transaksi di server
      const response = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: clientId,
          paket,
          periode: billing,
        }),
      })

      const data = await response.json()

      if (!data.token) {
        alert('Gagal membuat transaksi. Coba lagi.')
        setLoading(null)
        return
      }

      // Buka popup Midtrans
      // @ts-ignore
      window.snap.pay(data.token, {
        onSuccess: (result: any) => {
          console.log('Payment success:', result)
          window.location.href = '/dashboard?payment=success'
        },
        onPending: (result: any) => {
          console.log('Payment pending:', result)
          window.location.href = '/dashboard?payment=pending'
        },
        onError: (result: any) => {
          console.log('Payment error:', result)
          alert('Pembayaran gagal. Silakan coba lagi.')
        },
        onClose: () => {
          console.log('Payment popup closed')
          setLoading(null)
        },
      })

    } catch (error) {
      console.error('Error:', error)
      alert('Terjadi kesalahan. Coba lagi.')
    } finally {
      setLoading(null)
    }
  }

  const getPaketLabel = (paket: string) => {
    const map: Record<string, string> = {
      trial: 'Trial', starter: 'Starter',
      pro: 'Pro', bisnis: 'Bisnis', enterprise: 'Enterprise'
    }
    return map[paket] || paket
  }

  const pakets = [
    {
      kode: 'starter',
      nama: 'Starter',
      desc: 'Untuk UMKM yang baru mulai',
      harga_bulanan: 99000,
      harga_tahunan: 79000,
      toko: 1,
      pesan: '1.000',
      fitur: ['1 Toko', '1.000 pesan/bln', 'AI Chatbot 24 jam', 'Katalog produk', 'Support email'],
      popular: false,
      color: 'rgba(255,255,255,0.04)',
      border: 'rgba(255,255,255,0.09)',
    },
    {
      kode: 'pro',
      nama: 'Pro',
      desc: 'Untuk bisnis yang ingin tumbuh',
      harga_bulanan: 299000,
      harga_tahunan: 239000,
      toko: 3,
      pesan: '5.000',
      fitur: ['3 Toko', '5.000 pesan/bln', 'Semua fitur Starter', 'Broadcast promo', 'CRM pelanggan', 'Laporan harian'],
      popular: true,
      color: 'rgba(37,211,102,0.07)',
      border: 'rgba(37,211,102,0.35)',
    },
    {
      kode: 'bisnis',
      nama: 'Bisnis',
      desc: 'Untuk bisnis menengah',
      harga_bulanan: 599000,
      harga_tahunan: 479000,
      toko: 10,
      pesan: '20.000',
      fitur: ['10 Toko', '20.000 pesan/bln', 'Semua fitur Pro', 'Multi-agent CS', 'API akses', 'Priority support'],
      popular: false,
      color: 'rgba(255,255,255,0.04)',
      border: 'rgba(255,255,255,0.09)',
    },
  ]

  const fmt = (n: number) => 'Rp ' + n.toLocaleString('id-ID')

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '4px' }}>Paket Langganan</h2>
        <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>Kelola paket dan pembayaran kamu</p>
      </div>

      {/* Status langganan */}
      <div style={{
        background: clientStatus === 'trial' ? 'rgba(239,159,39,0.08)' : 'rgba(37,211,102,0.08)',
        border: `1px solid ${clientStatus === 'trial' ? 'rgba(239,159,39,0.25)' : 'rgba(37,211,102,0.25)'}`,
        borderRadius: '16px', padding: '20px 24px', marginBottom: '28px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px'
      }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '4px' }}>
            {clientStatus === 'trial' ? '🎯 Kamu sedang dalam masa trial' : '✅ Langganan aktif'}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)' }}>
            {clientStatus === 'trial'
              ? `Sisa ${trialLimit - pesanTerpakai} pesan gratis dari ${trialLimit}. Upgrade untuk melanjutkan tanpa batas.`
              : `Paket ${getPaketLabel(clientPaket)} · Aktif hingga ${clientTanggalBerakhir ? new Date(clientTanggalBerakhir).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}`
            }
          </div>
        </div>
        <div style={{ fontWeight: 800, fontSize: '1.5rem', color: clientStatus === 'trial' ? '#EF9F27' : '#25d366' }}>
          {getPaketLabel(clientPaket)}
        </div>
      </div>

      {/* Toggle billing */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'inline-flex', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '100px', padding: '4px' }}>
          {(['bulanan', 'tahunan'] as const).map(b => (
            <button key={b} onClick={() => setBilling(b)} style={{
              padding: '8px 20px', borderRadius: '100px', border: 'none', cursor: 'pointer',
              fontWeight: 600, fontSize: '0.85rem', fontFamily: 'inherit',
              background: billing === b ? '#25d366' : 'transparent',
              color: billing === b ? '#070d1a' : 'rgba(255,255,255,0.6)',
              transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '6px'
            }}>
              {b === 'bulanan' ? 'Bulanan' : (
                <>Tahunan <span style={{ fontSize: '0.68rem', background: 'rgba(37,211,102,0.2)', color: '#25d366', padding: '2px 6px', borderRadius: '100px' }}>Hemat 20%</span></>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Paket cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px', marginBottom: '24px' }}>
        {pakets.map(p => {
          const harga = billing === 'tahunan' ? p.harga_tahunan : p.harga_bulanan
          const isCurrentPaket = clientPaket === p.kode && clientStatus !== 'suspend'
          const isLoading = loading === p.kode

          return (
            <div key={p.kode} style={{
              background: p.color, border: `1px solid ${p.border}`,
              borderRadius: '20px', padding: '24px', position: 'relative',
              display: 'flex', flexDirection: 'column'
            }}>
              {p.popular && (
                <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: '#25d366', color: '#070d1a', fontSize: '0.68rem', fontWeight: 800, padding: '4px 14px', borderRadius: '100px', whiteSpace: 'nowrap' }}>
                  TERPOPULER
                </div>
              )}
              {isCurrentPaket && (
                <div style={{ position: 'absolute', top: '14px', right: '14px', background: 'rgba(37,211,102,0.2)', color: '#25d366', fontSize: '0.65rem', fontWeight: 700, padding: '3px 8px', borderRadius: '100px' }}>
                  Paket Saat Ini
                </div>
              )}

              <h3 style={{ fontWeight: 800, fontSize: '1rem', marginBottom: '4px' }}>{p.nama}</h3>
              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.75rem', marginBottom: '16px' }}>{p.desc}</p>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: '3px', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>Rp</span>
                <span style={{ fontSize: '1.6rem', fontWeight: 800, color: p.popular ? '#25d366' : '#fff' }}>
                  {(harga / 1000).toLocaleString('id-ID')}rb
                </span>
                <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>/bln</span>
              </div>

              {billing === 'tahunan' && (
                <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', marginBottom: '16px' }}>
                  Ditagih {fmt(harga * 12)}/tahun
                </div>
              )}

              <div style={{ flex: 1, marginBottom: '20px' }}>
                {p.fitur.map(f => (
                  <div key={f} style={{ display: 'flex', gap: '8px', fontSize: '0.78rem', color: 'rgba(255,255,255,0.65)', marginBottom: '8px' }}>
                    <span style={{ color: '#25d366' }}>✓</span> {f}
                  </div>
                ))}
              </div>

              <button
                onClick={() => !isCurrentPaket && handleBayar(p.kode)}
                disabled={isCurrentPaket || isLoading}
                style={{
                  width: '100%',
                  background: isCurrentPaket ? 'rgba(255,255,255,0.06)' : isLoading ? 'rgba(37,211,102,0.4)' : p.popular ? 'linear-gradient(135deg,#25d366,#128c7e)' : 'rgba(255,255,255,0.08)',
                  color: isCurrentPaket ? 'rgba(255,255,255,0.3)' : '#fff',
                  padding: '13px', borderRadius: '12px',
                  border: (!p.popular && !isCurrentPaket) ? '1px solid rgba(255,255,255,0.1)' : 'none',
                  fontWeight: 700, fontSize: '0.875rem', fontFamily: 'inherit',
                  cursor: isCurrentPaket ? 'default' : isLoading ? 'wait' : 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {isCurrentPaket ? '✓ Paket Saat Ini' : isLoading ? '⏳ Memproses...' : `Pilih ${p.nama}`}
              </button>
            </div>
          )
        })}
      </div>

      {/* Info tambahan */}
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '16px 20px' }}>
        <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', textAlign: 'center', lineHeight: 1.7 }}>
          🔒 Pembayaran aman via Midtrans · Didukung Transfer Bank, QRIS, Kartu Kredit, GoPay, OVO, dll<br/>
          Setelah pembayaran berhasil, bot langsung aktif otomatis tanpa perlu konfirmasi manual
        </p>
      </div>
    </div>
  )
}
