import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const RESERVED_SLUGS = [
  'dashboard', 'masuk', 'daftar', 'admin',
  'privasi', 'syarat', 'api', 'reset-password'
]

export default async function TokoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  if (RESERVED_SLUGS.includes(slug)) notFound()

  // Ambil data toko
  const { data: store } = await supabase
    .from('stores')
    .select('*')
    .eq('slug', slug)
    .eq('aktif', true)
    .single()

  if (!store) notFound()

  // Ambil produk
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('store_id', store.id)
    .eq('aktif', true)
    .order('urutan', { ascending: true })
    .order('created_at', { ascending: false })

  const produkList = products || []

  // Kategori unik
  const kategoriList = Array.from(new Set(produkList.map((p: any) => p.kategori).filter(Boolean)))

  const pesanWA = (namaProduk: string, harga: number) => {
    const pesan = `Halo, saya mau pesan *${namaProduk}* (Rp ${harga?.toLocaleString('id-ID') || 0})`
    return `https://wa.me/${store.nomor_wa_toko}?text=${encodeURIComponent(pesan)}`
  }

  return (
    <main style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: '#f8fafc', minHeight: '100vh' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .prod-card { transition: all 0.2s; }
        .prod-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,0.1); }
        .btn-wa { transition: opacity 0.2s; }
        .btn-wa:hover { opacity: 0.85; }
      `}</style>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#25d366,#128c7e)', padding: '32px 5%', color: '#fff' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ width: '72px', height: '72px', borderRadius: '18px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.2rem', flexShrink: 0 }}>
              🏪
            </div>
            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: '1.7rem', fontWeight: 800, marginBottom: '6px' }}>{store.nama_toko}</h1>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                {store.kategori && (
                  <span style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.2)', padding: '3px 10px', borderRadius: '100px' }}>
                    {store.kategori}
                  </span>
                )}
                {store.lokasi && (
                  <span style={{ fontSize: '0.8rem', opacity: 0.85 }}>📍 {store.lokasi}</span>
                )}
              </div>
            </div>
            <a
              href={`https://wa.me/${store.nomor_wa_toko}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-wa"
              style={{ background: '#fff', color: '#128c7e', padding: '12px 22px', borderRadius: '12px', textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}
            >
              💬 Chat WA
            </a>
          </div>

          <div style={{ display: 'flex', gap: '16px', marginTop: '14px', flexWrap: 'wrap' }}>
            {store.jam_buka && <span style={{ fontSize: '0.8rem', opacity: 0.9 }}>🕐 {store.jam_buka}</span>}
            {store.hari_buka && <span style={{ fontSize: '0.8rem', opacity: 0.9 }}>📅 {store.hari_buka}</span>}
            {store.metode_pembayaran && <span style={{ fontSize: '0.8rem', opacity: 0.9 }}>💳 {store.metode_pembayaran}</span>}
          </div>

          {store.deskripsi && (
            <p style={{ marginTop: '12px', fontSize: '0.875rem', opacity: 0.85, lineHeight: 1.6, maxWidth: '600px' }}>
              {store.deskripsi}
            </p>
          )}
        </div>
      </div>

      {/* Konten */}
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '28px 5%' }}>

        {/* Label kategori */}
        {kategoriList.length > 0 && (
          <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
            {kategoriList.map((kat: any) => (
              <span
                key={kat}
                style={{ padding: '6px 16px', borderRadius: '100px', background: '#fff', border: '1px solid #e5e7eb', fontSize: '0.82rem', fontWeight: 600, color: '#374151' }}
              >
                {kat} ({produkList.filter((p: any) => p.kategori === kat).length})
              </span>
            ))}
          </div>
        )}

        {/* Grid produk */}
        {produkList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📦</div>
            <p style={{ color: '#6b7280', fontSize: '0.95rem', marginBottom: '16px' }}>Produk sedang disiapkan. Hubungi kami via WhatsApp.</p>
            <a
              href={`https://wa.me/${store.nomor_wa_toko}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'inline-block', background: '#25d366', color: '#fff', padding: '11px 24px', borderRadius: '10px', textDecoration: 'none', fontWeight: 700 }}
            >
              💬 Tanya via WhatsApp
            </a>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
            {produkList.map((produk: any) => (
              <div
                key={produk.id}
                className="prod-card"
                style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb', overflow: 'hidden' }}
              >
                {/* Foto */}
                {produk.url_gambar ? (
                  <div style={{ height: '200px', overflow: 'hidden', background: '#f9fafb' }}>
                    <img
                      src={produk.url_gambar}
                      alt={produk.nama_produk}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                ) : (
                  <div style={{ height: '140px', background: 'linear-gradient(135deg,#f0fdf4,#dcfce7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>
                    🛍️
                  </div>
                )}

                {/* Info */}
                <div style={{ padding: '14px 16px' }}>
                  {produk.kategori && (
                    <span style={{ fontSize: '0.68rem', background: '#f0fdf4', color: '#16a34a', padding: '2px 8px', borderRadius: '100px', fontWeight: 600 }}>
                      {produk.kategori}
                    </span>
                  )}
                  <h3 style={{ fontWeight: 700, fontSize: '0.95rem', color: '#111827', margin: '6px 0 4px' }}>
                    {produk.nama_produk}
                  </h3>
                  {produk.deskripsi && (
                    <p style={{ fontSize: '0.78rem', color: '#6b7280', lineHeight: 1.5, marginBottom: '10px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {produk.deskripsi}
                    </p>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginTop: '8px' }}>
                    <div>
                      {produk.harga_coret > 0 && (
                        <div style={{ fontSize: '0.72rem', color: '#9ca3af', textDecoration: 'line-through' }}>
                          Rp {produk.harga_coret?.toLocaleString('id-ID')}
                        </div>
                      )}
                      <div style={{ fontWeight: 800, fontSize: '1rem', color: '#25d366' }}>
                        Rp {produk.harga?.toLocaleString('id-ID') || '0'}
                      </div>
                      <div style={{ fontSize: '0.68rem', color: produk.stok_tidak_terbatas ? '#16a34a' : produk.stok > 0 ? '#6b7280' : '#ef4444', marginTop: '1px' }}>
                        {produk.stok_tidak_terbatas ? '✓ Tersedia' : produk.stok > 0 ? `Stok: ${produk.stok}` : '✗ Habis'}
                      </div>
                    </div>
                    <a
                      href={pesanWA(produk.nama_produk, produk.harga)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-wa"
                      style={{
                        background: (!produk.stok_tidak_terbatas && produk.stok === 0) ? '#e5e7eb' : '#25d366',
                        color: (!produk.stok_tidak_terbatas && produk.stok === 0) ? '#9ca3af' : '#fff',
                        padding: '9px 16px',
                        borderRadius: '10px',
                        textDecoration: 'none',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      🛒 Pesan
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div style={{ marginTop: '48px', paddingTop: '24px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
            Powered by{' '}
            <a href="https://mahirusaha.com" style={{ color: '#25d366', textDecoration: 'none', fontWeight: 600 }}>
              Mahirusaha
            </a>
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
