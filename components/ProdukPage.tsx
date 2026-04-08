'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Product {
  id: string
  nama_produk: string
  deskripsi: string
  harga: number
  harga_coret: number | null
  kategori: string
  url_gambar: string | null
  tersedia: boolean
  created_at: string
}

interface ProductPageProps {
  storeId: string
}

export default function ProdukPage({ storeId }: ProductPageProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterKategori, setFilterKategori] = useState('semua')

  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [form, setForm] = useState({
    nama_produk: '',
    deskripsi: '',
    harga: '',
    harga_coret: '',
    kategori: '',
    url_gambar: '',
    tersedia: true,
  })

  const kategoriList = [
    'Makanan & Minuman', 'Fashion & Pakaian', 'Kecantikan & Skincare',
    'Elektronik', 'Kesehatan', 'Jasa & Layanan', 'Produk Digital',
    'Rumah & Furnitur', 'Olahraga', 'Lainnya'
  ]

  useEffect(() => {
    if (storeId) loadProducts()
  }, [storeId])

  const loadProducts = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('store_id', storeId)
      .order('created_at', { ascending: false })
    setProducts(data || [])
    setLoading(false)
  }

  const resetForm = () => {
    setForm({ nama_produk: '', deskripsi: '', harga: '', harga_coret: '', kategori: '', url_gambar: '', tersedia: true })
    setEditProduct(null)
    setShowForm(false)
  }

  const handleEdit = (p: Product) => {
    setForm({
      nama_produk: p.nama_produk,
      deskripsi: p.deskripsi || '',
      harga: p.harga?.toString() || '',
      harga_coret: p.harga_coret?.toString() || '',
      kategori: p.kategori || '',
      url_gambar: p.url_gambar || '',
      tersedia: p.tersedia,
    })
    setEditProduct(p)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const payload = {
      store_id: storeId,
      nama_produk: form.nama_produk,
      deskripsi: form.deskripsi,
      harga: parseInt(form.harga.replace(/\D/g, '')) || 0,
      harga_coret: form.harga_coret ? parseInt(form.harga_coret.replace(/\D/g, '')) : null,
      kategori: form.kategori,
      url_gambar: form.url_gambar || null,
      tersedia: form.tersedia,
      updated_at: new Date().toISOString(),
    }

    if (editProduct) {
      await supabase.from('products').update(payload).eq('id', editProduct.id)
    } else {
      await supabase.from('products').insert(payload)
    }

    await loadProducts()
    resetForm()
    setSaving(false)
  }

  const handleToggleAvailable = async (id: string, tersedia: boolean) => {
    await supabase.from('products').update({ tersedia: !tersedia }).eq('id', id)
    setProducts(prev => prev.map(p => p.id === id ? { ...p, tersedia: !tersedia } : p))
  }

  const handleDelete = async (id: string) => {
    await supabase.from('products').delete().eq('id', id)
    setProducts(prev => prev.filter(p => p.id !== id))
    setDeleteConfirm(null)
  }

  const fmt = (n: number) => 'Rp ' + n.toLocaleString('id-ID')
  
  // Kompres gambar otomatis sebelum upload
  const kompresGambar = (file: File, maxWidth = 800, kualitas = 0.75): Promise<Blob> => {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (e) => {
      const img = new Image()
      img.src = e.target?.result as string
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width)
          width = maxWidth
        }
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0, width, height)
        canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', kualitas)
      }
    }
  })
}

// Upload foto ke Supabase Storage
const handleUploadFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0]
  if (!file) return

  // Validasi tipe file
  if (!file.type.startsWith('image/')) {
    alert('Hanya file gambar yang diizinkan! (Format: JPG, PNG, WebP. Foto dikompres otomatis.)')
    return
  }

  setUploading(true)
  setUploadProgress(30)

  try {
    // Kompres gambar
    const compressed = await kompresGambar(file)
    setUploadProgress(60)

    // Generate nama file unik
    const ext = 'jpg'
    const fileName = `${storeId}/${Date.now()}.${ext}`

    // Upload ke Supabase Storage
    const { data, error } = await supabase.storage
      .from('produk-images')
      .upload(fileName, compressed, {
        contentType: 'image/jpeg',
        upsert: false
      })

    if (error) throw error
    setUploadProgress(90)

    // Ambil URL publik
    const { data: urlData } = supabase.storage
      .from('produk-images')
      .getPublicUrl(data.path)

    setForm(p => ({ ...p, url_gambar: urlData.publicUrl }))
    setUploadProgress(100)

    setTimeout(() => {
      setUploading(false)
      setUploadProgress(0)
    }, 500)

  } catch (err) {
    console.error('Error upload:', err)
    alert('Gagal upload foto. Coba lagi.')
    setUploading(false)
    setUploadProgress(0)
  }
}

  const filteredProducts = products.filter(p => {
    const matchSearch = p.nama_produk.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.deskripsi?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchKategori = filterKategori === 'semua' || p.kategori === filterKategori
    return matchSearch && matchKategori
  })

  const inputStyle = {
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

  const labelStyle = {
    display: 'block',
    fontSize: '0.78rem',
    fontWeight: 600,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: '5px',
  }

  const kategoriTersedia = [...new Set(products.map(p => p.kategori).filter(Boolean))]

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '4px' }}>Katalog Produk & Layanan</h2>
          <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>
            {products.length} produk · Bot akan gunakan info ini untuk menjawab pelanggan
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true) }}
          style={{ background: 'linear-gradient(135deg,#25d366,#128c7e)', color: '#fff', padding: '10px 20px', borderRadius: '10px', border: 'none', fontWeight: 700, fontSize: '0.85rem', fontFamily: 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          + Tambah Produk
        </button>
      </div>

      {/* Tips */}
      <div style={{ background: 'rgba(37,211,102,0.06)', border: '1px solid rgba(37,211,102,0.15)', borderRadius: '12px', padding: '12px 16px', marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
        <span style={{ fontSize: '1rem', flexShrink: 0 }}>💡</span>
        <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.65 }}>
          <strong style={{ color: '#25d366' }}>Tips:</strong> Semakin lengkap info produk kamu, semakin pintar bot menjawab pelanggan. Isi nama, deskripsi, dan harga untuk hasil terbaik. Kalau produk habis, cukup matikan toggle <strong style={{ color: '#fff' }}>Tersedia</strong>.
        </p>
      </div>

      {/* FORM TAMBAH / EDIT */}
      {showForm && (
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(37,211,102,0.2)', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontWeight: 700, fontSize: '0.95rem' }}>
              {editProduct ? '✏️ Edit Produk' : '➕ Tambah Produk Baru'}
            </h3>
            <button onClick={resetForm} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '1.2rem' }}>×</button>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Nama produk / layanan *</label>
                <input
                  required
                  style={inputStyle}
                  placeholder="Contoh: Nasi Gudeg Komplit, Jasa Desain Logo"
                  value={form.nama_produk}
                  onChange={e => setForm(p => ({ ...p, nama_produk: e.target.value }))}
                />
              </div>

              <div>
                <label style={labelStyle}>Harga *</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>Rp</span>
                  <input
                    required
                    style={{ ...inputStyle, paddingLeft: '36px' }}
                    placeholder="25000"
                    value={form.harga}
                    onChange={e => setForm(p => ({ ...p, harga: e.target.value.replace(/\D/g, '') }))}
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Harga coret / normal <span style={{ fontWeight: 400, color: 'rgba(255,255,255,0.3)' }}>(opsional — untuk promo)</span></label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>Rp</span>
                  <input
                    style={{ ...inputStyle, paddingLeft: '36px' }}
                    placeholder="30000"
                    value={form.harga_coret}
                    onChange={e => setForm(p => ({ ...p, harga_coret: e.target.value.replace(/\D/g, '') }))}
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Kategori</label>
                <select
                  style={{ ...inputStyle, appearance: 'none' }}
                  value={form.kategori}
                  onChange={e => setForm(p => ({ ...p, kategori: e.target.value }))}
                >
                  <option value="">Pilih kategori...</option>
                  {kategoriList.map(k => <option key={k} value={k} style={{ background: '#111827' }}>{k}</option>)}
                </select>
              </div>

              <div>
  <label style={labelStyle}>Foto produk <span style={{ fontWeight: 400, color: 'rgba(255,255,255,0.3)' }}>(opsional)</span></label>
  
  {/* Preview foto */}
  {form.url_gambar && (
    <div style={{ marginBottom: '10px', position: 'relative', display: 'inline-block' }}>
      <img src={form.url_gambar} alt="Preview" style={{ width: '120px', height: '90px', objectFit: 'cover', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }} />
      <button type="button" onClick={() => setForm(p => ({ ...p, url_gambar: '' }))} style={{ position: 'absolute', top: '-6px', right: '-6px', width: '20px', height: '20px', borderRadius: '50%', background: '#EF4444', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
    </div>
  )}

  {/* Upload button */}
  {!form.url_gambar && (
    <div>
      <label style={{ display: 'block', cursor: uploading ? 'not-allowed' : 'pointer' }}>
        <div style={{ ...inputStyle, display: 'flex', alignItems: 'center', gap: '10px', cursor: uploading ? 'not-allowed' : 'pointer', opacity: uploading ? 0.7 : 1 }}>
          <span>{uploading ? '⏳' : '📷'}</span>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>
            {uploading ? `Mengupload... ${uploadProgress}%` : 'Pilih foto dari komputer'}
          </span>
        </div>
        <input type="file" accept="image/*" onChange={handleUploadFoto} disabled={uploading} style={{ display: 'none' }} />
      </label>
      {/* Progress bar */}
      {uploading && (
        <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '100px', height: '3px', marginTop: '6px' }}>
          <div style={{ background: '#25d366', height: '100%', borderRadius: '100px', width: `${uploadProgress}%`, transition: 'width 0.3s' }}/>
        </div>
      )}
      <p style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.25)', marginTop: '5px' }}>Foto dikompres otomatis. Maks 5MB. Format: JPG, PNG, WebP</p>
    </div>
  )}
</div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Deskripsi produk</label>
                <textarea
                  rows={3}
                  style={{ ...inputStyle, resize: 'none' }}
                  placeholder="Jelaskan produk secara detail — bahan, ukuran, varian, cara pesan, dll. Semakin detail, semakin pintar bot menjawab."
                  value={form.deskripsi}
                  onChange={e => setForm(p => ({ ...p, deskripsi: e.target.value }))}
                />
              </div>

              {/* Toggle tersedia */}
              <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '12px 16px' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>Produk tersedia</div>
                  <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>Matikan kalau produk sedang tidak tersedia / habis</div>
                </div>
                <div
                  onClick={() => setForm(p => ({ ...p, tersedia: !p.tersedia }))}
                  style={{ width: '44px', height: '24px', borderRadius: '100px', background: form.tersedia ? '#25d366' : 'rgba(255,255,255,0.15)', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}
                >
                  <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '3px', left: form.tersedia ? '23px' : '3px', transition: 'left 0.2s' }}/>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button type="button" onClick={resetForm} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', padding: '10px 20px', borderRadius: '10px', fontFamily: 'inherit', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}>
                Batal
              </button>
              <button type="submit" disabled={saving} style={{ background: saving ? 'rgba(37,211,102,0.4)' : 'linear-gradient(135deg,#25d366,#128c7e)', color: '#fff', padding: '10px 24px', borderRadius: '10px', border: 'none', fontWeight: 700, fontSize: '0.875rem', fontFamily: 'inherit', cursor: saving ? 'not-allowed' : 'pointer' }}>
                {saving ? 'Menyimpan...' : editProduct ? '💾 Simpan Perubahan' : '➕ Tambah Produk'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search & Filter */}
      {products.length > 0 && (
        <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <input
            style={{ ...inputStyle, flex: 1, minWidth: '200px' }}
            placeholder="🔍 Cari produk..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <select
            style={{ ...inputStyle, width: 'auto', appearance: 'none', paddingRight: '20px' }}
            value={filterKategori}
            onChange={e => setFilterKategori(e.target.value)}
          >
            <option value="semua">Semua kategori</option>
            {kategoriTersedia.map(k => <option key={k} value={k} style={{ background: '#111827' }}>{k}</option>)}
          </select>
        </div>
      )}

      {/* Product list */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.3)' }}>Memuat produk...</div>
      ) : filteredProducts.length === 0 ? (
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📦</div>
          <p style={{ fontWeight: 600, marginBottom: '6px', fontSize: '0.95rem' }}>
            {searchQuery || filterKategori !== 'semua' ? 'Produk tidak ditemukan' : 'Belum ada produk'}
          </p>
          <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.4)', marginBottom: '20px' }}>
            {searchQuery || filterKategori !== 'semua' ? 'Coba kata kunci lain' : 'Tambahkan produk agar bot bisa menjelaskan ke pelanggan'}
          </p>
          {!searchQuery && filterKategori === 'semua' && (
            <button onClick={() => setShowForm(true)} style={{ background: 'linear-gradient(135deg,#25d366,#128c7e)', color: '#fff', padding: '12px 24px', borderRadius: '10px', border: 'none', fontWeight: 700, fontSize: '0.875rem', fontFamily: 'inherit', cursor: 'pointer' }}>
              + Tambah Produk Pertama
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
          {filteredProducts.map(p => (
            <div key={p.id} style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${p.tersedia ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)'}`, borderRadius: '14px', overflow: 'hidden', opacity: p.tersedia ? 1 : 0.6, transition: 'all 0.2s' }}>

              {/* Foto produk */}
              {p.url_gambar ? (
                <div style={{ height: '140px', background: `url(${p.url_gambar}) center/cover`, borderBottom: '1px solid rgba(255,255,255,0.06)' }}/>
              ) : (
                <div style={{ height: '80px', background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>📦</div>
              )}

              <div style={{ padding: '14px' }}>
                {/* Nama & kategori */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px', gap: '8px' }}>
                  <h4 style={{ fontWeight: 700, fontSize: '0.875rem', lineHeight: 1.3 }}>{p.nama_produk}</h4>
                  {p.kategori && (
                    <span style={{ fontSize: '0.65rem', padding: '2px 7px', borderRadius: '100px', background: 'rgba(37,211,102,0.1)', color: '#25d366', whiteSpace: 'nowrap', flexShrink: 0 }}>{p.kategori}</span>
                  )}
                </div>

                {/* Deskripsi */}
                {p.deskripsi && (
                  <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.55, marginBottom: '10px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.deskripsi}</p>
                )}

                {/* Harga */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <span style={{ fontWeight: 800, fontSize: '1rem', color: '#25d366' }}>{fmt(p.harga)}</span>
                  {p.harga_coret && (
                    <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', textDecoration: 'line-through' }}>{fmt(p.harga_coret)}</span>
                  )}
                  {p.harga_coret && (
                    <span style={{ fontSize: '0.65rem', background: 'rgba(239,68,68,0.15)', color: '#fca5a5', padding: '1px 6px', borderRadius: '100px' }}>
                      -{Math.round((1 - p.harga / p.harga_coret) * 100)}%
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {/* Toggle tersedia */}
                  <div
                    onClick={() => handleToggleAvailable(p.id, p.tersedia)}
                    style={{ width: '36px', height: '20px', borderRadius: '100px', background: p.tersedia ? '#25d366' : 'rgba(255,255,255,0.15)', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}
                    title={p.tersedia ? 'Klik untuk nonaktifkan' : 'Klik untuk aktifkan'}
                  >
                    <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '3px', left: p.tersedia ? '19px' : '3px', transition: 'left 0.2s' }}/>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', flex: 1 }}>{p.tersedia ? 'Tersedia' : 'Tidak tersedia'}</span>

                  <button onClick={() => handleEdit(p)} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', color: 'rgba(255,255,255,0.6)', padding: '5px 10px', borderRadius: '7px', cursor: 'pointer', fontSize: '0.75rem', fontFamily: 'inherit' }}>✏️ Edit</button>

                  {deleteConfirm === p.id ? (
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button onClick={() => handleDelete(p.id)} style={{ background: 'rgba(239,68,68,0.2)', border: 'none', color: '#fca5a5', padding: '5px 8px', borderRadius: '7px', cursor: 'pointer', fontSize: '0.72rem', fontFamily: 'inherit' }}>Hapus</button>
                      <button onClick={() => setDeleteConfirm(null)} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', color: 'rgba(255,255,255,0.4)', padding: '5px 8px', borderRadius: '7px', cursor: 'pointer', fontSize: '0.72rem', fontFamily: 'inherit' }}>Batal</button>
                    </div>
                  ) : (
                    <button onClick={() => setDeleteConfirm(p.id)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', padding: '5px', borderRadius: '7px', cursor: 'pointer', fontSize: '0.85rem' }}>🗑️</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
