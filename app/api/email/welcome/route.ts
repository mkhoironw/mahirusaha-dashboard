import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { nama, email, nama_toko, slug } = await request.json()

    if (!email || !nama) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 })
    }

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Selamat Datang di Mahirusaha!</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#25d366,#128c7e);border-radius:16px;padding:32px;text-align:center;margin-bottom:24px;">
      <div style="width:56px;height:56px;background:rgba(255,255,255,0.2);border-radius:14px;display:inline-flex;align-items:center;justify-content:center;font-size:28px;margin-bottom:16px;">💬</div>
      <h1 style="color:#fff;margin:0;font-size:24px;font-weight:800;">Selamat datang di Mahirusaha!</h1>
      <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:14px;">Platform AI untuk UMKM Indonesia 🚀</p>
    </div>

    <!-- Body -->
    <div style="background:#fff;border-radius:16px;padding:32px;margin-bottom:24px;border:1px solid #e5e7eb;">
      <p style="color:#374151;font-size:16px;margin:0 0 16px;">Halo <strong>${nama}</strong>! 👋</p>
      <p style="color:#6b7280;font-size:14px;line-height:1.7;margin:0 0 20px;">
        Akun kamu sudah berhasil dibuat. Toko <strong style="color:#25d366;">${nama_toko}</strong> dan toko online kamu sudah aktif!
      </p>

      <!-- Toko Online -->
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:16px;margin-bottom:24px;">
        <p style="color:#166534;font-weight:700;margin:0 0 8px;font-size:14px;">🛍️ Link Toko Online Kamu</p>
        <a href="https://mahirusaha.com/${slug || ''}" style="color:#25d366;font-weight:700;font-size:16px;text-decoration:none;">mahirusaha.com/${slug || 'toko-kamu'}</a>
        <p style="color:#6b7280;font-size:12px;margin:6px 0 0;">Langsung bisa dishare ke pelanggan!</p>
      </div>

      <!-- Langkah selanjutnya -->
      <p style="color:#374151;font-weight:700;font-size:15px;margin:0 0 14px;">🚀 Langkah selanjutnya:</p>
      
      <div style="display:flex;flex-direction:column;gap:12px;">
        ${[
          ['1', '📦', 'Tambah produk di dashboard', 'Isi nama, harga, foto produk agar bot bisa menjelaskan ke pelanggan'],
          ['2', '📱', 'Siapkan SIM card baru untuk bot', 'Beli SIM Telkomsel baru ~Rp 35rb khusus untuk nomor bot WhatsApp'],
          ['3', '💬', 'Minta aktivasi bot ke tim kami', 'Kirim data ke WhatsApp +62 813-2531-202 untuk aktivasi bot'],
          ['4', '🎉', 'Bot aktif — trial 100 pesan dimulai!', 'Bagikan nomor bot ke pelanggan dan biarkan AI bekerja 24 jam'],
        ].map(([num, icon, title, desc]) => `
        <div style="display:flex;gap:12px;padding:12px;background:#f9fafb;border-radius:10px;border:1px solid #e5e7eb;">
          <div style="width:28px;height:28px;background:linear-gradient(135deg,#25d366,#128c7e);border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:12px;flex-shrink:0;">${num}</div>
          <div>
            <p style="margin:0 0 2px;font-weight:700;color:#374151;font-size:13px;">${icon} ${title}</p>
            <p style="margin:0;color:#6b7280;font-size:12px;">${desc}</p>
          </div>
        </div>
        `).join('')}
      </div>

      <!-- Info trial -->
      <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:16px;margin-top:20px;">
        <p style="color:#92400e;font-weight:700;margin:0 0 4px;font-size:13px;">💡 Tentang Trial 100 Pesan Gratis</p>
        <p style="color:#78350f;font-size:12px;margin:0;line-height:1.6;">
          Trial dimulai setelah bot WhatsApp kamu diaktifkan — bukan sejak daftar. Tidak perlu bayar apapun selama trial. Baru bayar setelah 100 pesan habis dan ingin melanjutkan.
        </p>
      </div>
    </div>

    <!-- CTA -->
    <div style="text-align:center;margin-bottom:24px;">
      <a href="https://mahirusaha.com/dashboard" style="display:inline-block;background:linear-gradient(135deg,#25d366,#128c7e);color:#fff;padding:14px 32px;border-radius:12px;text-decoration:none;font-weight:700;font-size:15px;">
        Masuk ke Dashboard →
      </a>
      <p style="color:#9ca3af;font-size:12px;margin:12px 0 0;">
        Atau baca <a href="https://mahirusaha.com/panduan" style="color:#25d366;">panduan lengkap</a> untuk memulai
      </p>
    </div>

    <!-- Kontak -->
    <div style="background:#fff;border-radius:16px;padding:24px;border:1px solid #e5e7eb;text-align:center;">
      <p style="color:#374151;font-weight:700;margin:0 0 8px;font-size:14px;">Butuh bantuan?</p>
      <p style="color:#6b7280;font-size:13px;margin:0 0 12px;">Tim kami siap membantu kamu!</p>
      <div style="display:flex;justify-content:center;gap:16px;flex-wrap:wrap;">
        <a href="https://wa.me/628132531202" style="color:#25d366;font-size:13px;font-weight:600;text-decoration:none;">💬 WhatsApp: +62 813-2531-202</a>
        <a href="mailto:hello@mahirusaha.com" style="color:#25d366;font-size:13px;font-weight:600;text-decoration:none;">📧 hello@mahirusaha.com</a>
      </div>
      <p style="color:#9ca3af;font-size:11px;margin:12px 0 0;">Senin-Sabtu 08.00-21.00 WIB</p>
    </div>

    <!-- Footer -->
    <div style="text-align:center;margin-top:24px;">
      <p style="color:#9ca3af;font-size:12px;margin:0;">
        © 2026 Mahirusaha · <a href="https://mahirusaha.com/privasi" style="color:#9ca3af;">Privasi</a> · <a href="https://mahirusaha.com/syarat" style="color:#9ca3af;">Syarat Layanan</a>
      </p>
    </div>

  </div>
</body>
</html>
    `

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Mahirusaha <hello@mahirusaha.com>',
        to: [email],
        subject: `Selamat datang di Mahirusaha, ${nama}! 🎉`,
        html: htmlContent,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('Resend error:', error)
      return NextResponse.json({ error: 'Gagal kirim email' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Email terkirim!' })

  } catch (error) {
    console.error('Error kirim email:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan' }, { status: 500 })
  }
}
