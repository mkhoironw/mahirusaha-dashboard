import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Props {
  params: { slug: string }
}

// Halaman yang sudah ada — jangan ditimpa
const RESERVED_SLUGS = [
  'dashboard', 'masuk', 'daftar', 'admin', 
  'privasi', 'syarat', 'api', 'reset-password'
]

export default async function TokoPage({ params }: Props) {
  const { slug } = params

  // Cek apakah slug adalah halaman reserved
  if (RESERVED_SLUGS.includes(slug)) {
    notFound()
  }

  // Ambil data toko dari database
  const { data: store } = await supabase
    .from('stores')
    .select(`
      *,
      clients (nama_pemilik, status, paket)
    `)
    .eq('slug', slug)
    .eq('aktif', true)
    .single()

  if (!store) notFound()

  // Ambil produk toko
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('store_id', store.id)
    .eq('aktif', true)
    .order('created_at', { ascending: false })

  const produkList = products || []

  // Kelompokkan produk per kategori
  const kategoriMap = new Map<string, typeof produkList>()
  for (const p of produkList) {
    const kat = p.kategori || 'Lainnya'
    if (!kategoriMap.has(kat)) kategoriMap.set(kat, [])
    kategoriMap.get(kat)!.push(p)
  }
  const kategoriList = Array.from(kategoriMap.keys())

  const pesanWA = (namaProduk: string, harga: number) => {
    const pesan = `Halo, saya mau pesan *${namaProduk}* (Rp ${harga.toLocaleString('id-ID')})`
    return `https://wa.me/${store.nomor_wa_toko}?text=${encodeURIComponent(pesan)}`
  }

  return (
    <main style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: '#f8fafc', minHeight: '100vh' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .prod-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.1); }
        .prod-card { transition: all 0.2s; }
        .btn-wa:hover { opacity: 0.9; }
        .btn-wa { transition: opacity 0.2s; }
      `}</style>

      {/* Header toko */}
      <div style={{ background: 'linear-gradient(135deg,#25d366,#128c7e)', padding: '32px 5%', color: '#fff' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            {/* Avatar toko */}
            <div style={{ width: '72px', height: '72px', borderRadius: '18px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', flexShrink: 0 }}>
              🏪
            </div>
            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '4px' }}>{store.nama_toko}</h1>
              {store.kategori && (
                <span style={{ fontSize: '0.82rem', background: 'rgba(255,255,255,0.2)', padding: '3px 10px', borderRadius: '100px' }}>
                  {store.kategori}
                </span>
              )}
              {store.lokasi && (
                <p style={{ fontSize: '0.82rem', marginTop: '6px', opacity: 0.85 }}>
                  📍 {store.lokasi}
                </p>
              )}
            </div>
            {/* Tombol chat WA */}
            <a
              href={`https://wa.me/${store.nomor_wa_toko}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-wa"
              style={{ background: '#fff', color: '#128c7e', padding: '12px 24px', borderRadius: '12px', textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}
            >
              💬 Chat WhatsApp
            </a>
          </div>

          {/* Info operasional */}
          <div style={{ display: 'flex', gap: '20px', marginTop: '16px', flexWrap: 'wrap' }}>
            {store.jam_buka && (
              <span style={{ fontSize: '0.82rem', opacity: 0.9 }}>🕐 {store.jam_buka}</span>
            )}
            {store.hari_buka && (
              <span style={{ fontSize: '0.82rem', opacity: 0.9 }}>📅 {store.hari_buka}</span>
            )}
            {store.metode_pembayaran && (
              <span style={{ fontSize: '0.82rem', opacity: 0.9 }}>💳 {store.metode_pembayaran}</span>
            )}
          </div>

          {/* Deskripsi */}
          {store.deskripsi && (
            <p style={{ marginTop: '12px', fontSize: '0.875rem', opacity: 0.85, lineHeight: 1.6, maxWidth: '600px' }}>
              {store.deskripsi}
            </p>
          )}
        </div>
      </div>

      {/* Konten produk */}
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '28px 5%' }}>

        {produkList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📦</div>
            <p style={{ color: '#6b7280', fontSize: '0.95rem' }}>Produk sedang disiapkan. Hubungi kami via WhatsApp.</p>
            <a
              href={`https://wa.me/${store.nomor_wa_toko}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'inline-block', marginTop: '16px', background: '#25d366', color: '#fff', padding: '11px 24px', borderRadius: '10px', textDecoration: 'none', fontWeight: 700 }}
            >
              💬 Chat WhatsApp
            </a>
          </div>
        ) : (
          <>
            {/* Filter kategori */}
            {kategoriList.length > 1 && (
              <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
                {kategoriList.map(kat => (
                  <span
                    key={kat}
                    style={{ padding: '6px 16px', borderRadius: '100px', background: '#fff', border: '1px solid #e5e7eb', fontSize: '0.82rem', fontWeight: 600, color: '#374151', cursor: 'pointer' }}
                  >
                    {kat}
                  </span>
                ))}
              </div>
            )}

            {/* Grid produk per kategori */}
            {kategoriList.map(kat => (
              <div key={kat} style={{ marginBottom: '32px' }}>
                {kategoriList.length > 1 && (
                  <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', marginBottom: '14px', paddingBottom: '8px', borderBottom: '2px solid #f3f4f6' }}>
                    {kat}
                  </h2>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
                  {kategoriMap.get(kat)?.map(produk => (
                    <div
                      key={produk.id}
                      className="prod-card"
                      style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb', overflow: 'hidden' }}
                    >
                      {/* Foto produk */}
                      {produk.foto_url ? (
                        <div style={{ height: '180px', overflow: 'hidden', background: '#f9fafb' }}>
                          <img
                            src={produk.foto_url}
                            alt={produk.nama}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </div>
                      ) : (
                        <div style={{ height: '120px', background: 'linear-gradient(135deg,#f0fdf4,#dcfce7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem' }}>
                          📦
                        </div>
                      )}

                      {/* Info produk */}
                      <div style={{ padding: '14px 16px' }}>
                        <h3 style={{ fontWeight: 700, fontSize: '0.95rem', color: '#111827', marginBottom: '4px' }}>
                          {produk.nama}
                        </h3>
                        {produk.deskripsi && (
                          <p style={{ fontSize: '0.78rem', color: '#6b7280', marginBottom: '8px', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {produk.deskripsi}
                          </p>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginTop: '10px' }}>
                          <div>
                            <div style={{ fontWeight: 800, fontSize: '1rem', color: '#25d366' }}>
                              Rp {produk.harga?.toLocaleString('id-ID') || '0'}
                            </div>
                            {produk.stok !== null && produk.stok !== undefined && (
                              <div style={{ fontSize: '0.7rem', color: produk.stok > 0 ? '#6b7280' : '#ef4444' }}>
                                {produk.stok > 0 ? `Stok: ${produk.stok}` : 'Habis'}
                              </div>
                            )}
                          </div>
                          <a
                            href={pesanWA(produk.nama, produk.harga)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-wa"
                            style={{ background: '#25d366', color: '#fff', padding: '8px 14px', borderRadius: '8px', textDecoration: 'none', fontWeight: 700, fontSize: '0.78rem', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '5px' }}
                          >
                            🛒 Pesan
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}

        {/* Footer toko */}
        <div style={{ marginTop: '40px', paddingTop: '24px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
            Powered by <a href="https://mahirusaha.com" style={{ color: '#25d366', textDecoration: 'none', fontWeight: 600 }}>Mahirusaha</a>
          </p>
          <a
            href={`https://wa.me/${store.nomor_wa_toko}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ background: '#25d366', color: '#fff', padding: '10px 20px', borderRadius: '10px', textDecoration: 'none', fontWeight: 700, fontSize: '0.85rem' }}
          >
            💬 Hubungi Kami
          </a>
        </div>
      </div>
    </main>
  )
}
