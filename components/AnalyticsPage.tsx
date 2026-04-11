'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface AnalyticsPageProps {
  storeId: string
  clientPaket: string
}

interface DailyStats {
  tanggal: string
  total_pesan: number
  pelanggan_unik: number
}

interface HourlyStats {
  jam: number
  total: number
}

export default function AnalyticsPage({ storeId, clientPaket }: AnalyticsPageProps) {
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<7 | 30>(30)
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([])
  const [hourlyStats, setHourlyStats] = useState<HourlyStats[]>([])
  const [topProducts, setTopProducts] = useState<{ keyword: string, count: number }[]>([])
  const [summary, setSummary] = useState({
    totalPesan: 0,
    totalPelangganUnik: 0,
    rataHarian: 0,
    jamTersibuk: 0,
    totalHari: 0,
  })

  const isPro = clientPaket === 'pro' || clientPaket === 'bisnis' || clientPaket === 'enterprise'
  const isBisnis = clientPaket === 'bisnis' || clientPaket === 'enterprise'

  useEffect(() => {
    if (storeId && isPro) loadAnalytics()
  }, [storeId, period])

  const loadAnalytics = async () => {
    setLoading(true)
    try {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - period)

      // Load conversations dalam periode
      const { data: convData } = await supabase
        .from('conversations')
        .select('created_at, nomor_pelanggan, pesan_masuk')
        .eq('store_id', storeId)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true })

      const conversations = convData || []

      // Hitung daily stats
      const dailyMap = new Map<string, { pesan: number, pelanggan: Set<string> }>()
      const hourlyMap = new Map<number, number>()
      const keywordMap = new Map<string, number>()

      for (const conv of conversations) {
        const tanggal = conv.created_at.substring(0, 10)
        const jam = new Date(conv.created_at).getHours()

        // Daily
        if (!dailyMap.has(tanggal)) {
          dailyMap.set(tanggal, { pesan: 0, pelanggan: new Set() })
        }
        const day = dailyMap.get(tanggal)!
        day.pesan++
        if (conv.nomor_pelanggan) day.pelanggan.add(conv.nomor_pelanggan)

        // Hourly
        hourlyMap.set(jam, (hourlyMap.get(jam) || 0) + 1)

        // Keywords dari pesan masuk
        if (conv.pesan_masuk) {
          const words = conv.pesan_masuk.toLowerCase().split(/\s+/)
          for (const word of words) {
            if (word.length > 3) {
              keywordMap.set(word, (keywordMap.get(word) || 0) + 1)
            }
          }
        }
      }

      // Convert to array
      const daily: DailyStats[] = Array.from(dailyMap.entries()).map(([tanggal, data]) => ({
        tanggal,
        total_pesan: data.pesan,
        pelanggan_unik: data.pelanggan.size,
      })).sort((a, b) => a.tanggal.localeCompare(b.tanggal))

      const hourly: HourlyStats[] = Array.from(hourlyMap.entries())
        .map(([jam, total]) => ({ jam, total }))
        .sort((a, b) => a.jam - b.jam)

      // Top keywords (filter kata umum)
      const stopWords = ['yang', 'dan', 'atau', 'untuk', 'dengan', 'dari', 'itu', 'ini', 'ada', 'bisa', 'mau', 'mau', 'saya', 'kami', 'kamu', 'halo', 'hallo', 'hei', 'hay']
      const topKw = Array.from(keywordMap.entries())
        .filter(([word]) => !stopWords.includes(word))
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([keyword, count]) => ({ keyword, count }))

      // Summary
      const totalPesan = conversations.length
      const pelangganUnik = new Set(conversations.map(c => c.nomor_pelanggan).filter(Boolean)).size
      const jamTersibuk = hourly.length > 0 ? hourly.reduce((a, b) => a.total > b.total ? a : b).jam : 0

      setDailyStats(daily)
      setHourlyStats(hourly)
      setTopProducts(topKw)
      setSummary({
        totalPesan,
        totalPelangganUnik: pelangganUnik,
        rataHarian: daily.length > 0 ? Math.round(totalPesan / daily.length) : 0,
        jamTersibuk,
        totalHari: daily.length,
      })
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Chart bar sederhana
  const BarChart = ({ data, valueKey, labelKey, color = '#25d366' }: {
    data: any[]
    valueKey: string
    labelKey: string
    color?: string
  }) => {
    const max = Math.max(...data.map(d => d[valueKey]), 1)
    return (
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '80px', width: '100%' }}>
        {data.map((d, i) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', height: '100%', justifyContent: 'flex-end' }}>
            <div
              title={`${d[labelKey]}: ${d[valueKey]}`}
              style={{
                width: '100%',
                height: `${Math.max((d[valueKey] / max) * 100, 4)}%`,
                background: color,
                borderRadius: '3px 3px 0 0',
                opacity: 0.8,
                transition: 'height 0.3s',
                cursor: 'pointer',
                minHeight: '3px',
              }}
            />
          </div>
        ))}
      </div>
    )
  }

  const formatTanggal = (str: string) => {
    const d = new Date(str)
    return `${d.getDate()}/${d.getMonth() + 1}`
  }

  const formatJam = (jam: number) => `${jam.toString().padStart(2, '0')}:00`

  if (!isPro) {
    return (
      <div>
        <h2 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '20px' }}>Analytics & Laporan</h2>
        <div style={{ background: 'rgba(239,159,39,0.08)', border: '1px solid rgba(239,159,39,0.2)', borderRadius: '16px', padding: '40px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>📊</div>
          <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '8px' }}>Fitur Analytics tersedia di Paket Pro</h3>
          <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)', marginBottom: '20px', lineHeight: 1.6 }}>
            Lihat statistik percakapan, jam tersibuk, pelanggan aktif,<br />dan kata kunci yang paling sering ditanyakan pelanggan.
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '4px' }}>Analytics & Laporan</h2>
          <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>Statistik performa bot toko kamu</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {([7, 30] as const).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              style={{
                padding: '7px 16px',
                borderRadius: '8px',
                border: `1px solid ${period === p ? '#25d366' : 'rgba(255,255,255,0.1)'}`,
                background: period === p ? 'rgba(37,211,102,0.1)' : 'transparent',
                color: period === p ? '#25d366' : 'rgba(255,255,255,0.5)',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: '0.82rem',
                fontWeight: period === p ? 700 : 400,
              }}
            >
              {p} Hari
            </button>
          ))}
          <button
            onClick={loadAnalytics}
            style={{ padding: '7px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.82rem' }}
          >
            🔄
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'rgba(255,255,255,0.3)' }}>⏳ Memuat data...</div>
      ) : (
        <>
          {/* Summary stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '20px' }}>
            {[
              { label: 'Total Pesan', value: summary.totalPesan.toLocaleString('id-ID'), icon: '💬', color: '#25d366' },
              { label: 'Pelanggan Unik', value: summary.totalPelangganUnik.toLocaleString('id-ID'), icon: '👥', color: '#25d366' },
              { label: 'Rata-rata/Hari', value: summary.rataHarian.toString(), icon: '📈', color: '#25d366' },
              { label: 'Jam Tersibuk', value: formatJam(summary.jamTersibuk), icon: '⏰', color: '#EF9F27' },
            ].map(stat => (
              <div key={stat.label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '16px' }}>
                <div style={{ fontSize: '1.3rem', marginBottom: '6px' }}>{stat.icon}</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: stat.color, marginBottom: '2px' }}>{stat.value}</div>
                <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Grafik pesan harian */}
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '20px', marginBottom: '16px' }}>
            <h3 style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: '16px' }}>📈 Pesan Masuk {period} Hari Terakhir</h3>
            {dailyStats.length > 0 ? (
              <>
                <BarChart data={dailyStats} valueKey="total_pesan" labelKey="tanggal" color="#25d366" />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)' }}>
                  <span>{formatTanggal(dailyStats[0]?.tanggal || '')}</span>
                  <span>{formatTanggal(dailyStats[Math.floor(dailyStats.length / 2)]?.tanggal || '')}</span>
                  <span>{formatTanggal(dailyStats[dailyStats.length - 1]?.tanggal || '')}</span>
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '30px', color: 'rgba(255,255,255,0.3)', fontSize: '0.82rem' }}>
                Belum ada data percakapan dalam {period} hari terakhir
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            {/* Grafik jam tersibuk */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '20px' }}>
              <h3 style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: '16px' }}>⏰ Jam Tersibuk</h3>
              {hourlyStats.length > 0 ? (
                <>
                  <BarChart data={hourlyStats} valueKey="total" labelKey="jam" color="#378ADD" />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)' }}>
                    <span>00:00</span>
                    <span>12:00</span>
                    <span>23:00</span>
                  </div>
                  <div style={{ marginTop: '12px', fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)' }}>
                    Paling ramai: <strong style={{ color: '#378ADD' }}>{formatJam(summary.jamTersibuk)}</strong>
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '30px', color: 'rgba(255,255,255,0.3)', fontSize: '0.82rem' }}>Belum ada data</div>
              )}
            </div>

            {/* Top keywords */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '20px' }}>
              <h3 style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: '16px' }}>🔍 Kata Kunci Terbanyak</h3>
              {topProducts.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {topProducts.map((kw, i) => {
                    const max = topProducts[0].count
                    const persen = Math.round((kw.count / max) * 100)
                    return (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', width: '16px', textAlign: 'right' }}>{i + 1}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                            <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>{kw.keyword}</span>
                            <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>{kw.count}x</span>
                          </div>
                          <div style={{ height: '3px', background: 'rgba(255,255,255,0.06)', borderRadius: '100px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${persen}%`, background: '#25d366', borderRadius: '100px' }} />
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '30px', color: 'rgba(255,255,255,0.3)', fontSize: '0.82rem' }}>Belum ada data</div>
              )}
            </div>
          </div>

          {/* Pelanggan unik harian */}
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '20px', marginBottom: '16px' }}>
            <h3 style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: '16px' }}>👥 Pelanggan Unik per Hari</h3>
            {dailyStats.length > 0 ? (
              <>
                <BarChart data={dailyStats} valueKey="pelanggan_unik" labelKey="tanggal" color="#534AB7" />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)' }}>
                  <span>{formatTanggal(dailyStats[0]?.tanggal || '')}</span>
                  <span>{formatTanggal(dailyStats[Math.floor(dailyStats.length / 2)]?.tanggal || '')}</span>
                  <span>{formatTanggal(dailyStats[dailyStats.length - 1]?.tanggal || '')}</span>
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '30px', color: 'rgba(255,255,255,0.3)', fontSize: '0.82rem' }}>
                Belum ada data
              </div>
            )}
          </div>

          {/* Laporan harian tabel — hanya Bisnis+ */}
          {isBisnis && (
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '20px' }}>
              <h3 style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: '16px' }}>📋 Laporan Harian Detail</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                  <thead>
                    <tr>
                      {['Tanggal', 'Total Pesan', 'Pelanggan Unik', 'Trend'].map(h => (
                        <th key={h} style={{ textAlign: 'left', padding: '8px 12px', color: 'rgba(255,255,255,0.4)', fontWeight: 600, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {dailyStats.slice().reverse().slice(0, 14).map((d, i, arr) => {
                      const prev = arr[i + 1]
                      const trend = prev ? d.total_pesan - prev.total_pesan : 0
                      return (
                        <tr key={d.tanggal} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                          <td style={{ padding: '10px 12px', color: 'rgba(255,255,255,0.7)' }}>
                            {new Date(d.tanggal).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })}
                          </td>
                          <td style={{ padding: '10px 12px', fontWeight: 600 }}>{d.total_pesan}</td>
                          <td style={{ padding: '10px 12px', color: 'rgba(255,255,255,0.6)' }}>{d.pelanggan_unik}</td>
                          <td style={{ padding: '10px 12px' }}>
                            <span style={{ color: trend > 0 ? '#25d366' : trend < 0 ? '#EF4444' : 'rgba(255,255,255,0.3)', fontSize: '0.75rem', fontWeight: 600 }}>
                              {trend > 0 ? `↑ +${trend}` : trend < 0 ? `↓ ${trend}` : '→ sama'}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                    {dailyStats.length === 0 && (
                      <tr>
                        <td colSpan={4} style={{ textAlign: 'center', padding: '30px', color: 'rgba(255,255,255,0.3)' }}>Belum ada data</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Upgrade notice untuk Pro yang belum Bisnis */}
          {isPro && !isBisnis && (
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '4px' }}>📋 Laporan Harian Detail</div>
                <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)' }}>Tersedia di paket Bisnis — tabel laporan lengkap 30 hari</div>
              </div>
              <a href="#" style={{ fontSize: '0.78rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', padding: '8px 16px', borderRadius: '8px', textDecoration: 'none', fontWeight: 600, whiteSpace: 'nowrap' }}>
                Upgrade ke Bisnis
              </a>
            </div>
          )}
        </>
      )}
    </div>
  )
}
