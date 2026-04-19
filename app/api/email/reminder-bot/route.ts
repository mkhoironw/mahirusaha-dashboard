import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { nama, email } = await request.json()

    if (!email || !nama) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 })
    }

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bot WhatsApp Kamu Belum Aktif</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#EF9F27,#d97706);border-radius:16px;padding:32px;text-align:center;margin-bottom:24px;">
      <div style="font-size:48px;margin-bottom:12px;">⏰</div>
      <h1 style="color:#fff;margin:0;font-size:22px;font-weight:800;">Bot kamu belum aktif nih!</h1>
      <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:14px;">Ada yang bisa kami bantu? 🙏</p>
    </div>

    <!-- Body -->
    <div style="background:#fff;border-radius:16px;padding:32px;margin-bottom:24px;border:1px solid #e5e7eb;">
      <p style="color:#374151;font-size:16px;margin:0 0 16px;">Halo <strong>${nama}</strong>! 👋</p>
      <p style="color:#6b7280;font-size:14px;line-height:1.7;margin:0 0 20px;">
        Kami melihat kamu sudah daftar di Mahirusaha sejak kemarin, tapi bot WhatsApp toko kamu <strong style="color:#EF9F27;">belum aktif</strong>.
      </p>
      <p style="color:#6b7280;font-size:14px;line-height:1.7;margin:0 0 24px;">
        Apakah ada kendala dalam proses aktivasi? Kami siap membantu!
      </p>

      <!-- Langkah yang mungkin terlewat -->
      <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:20px;margin-bottom:24px;">
        <p style="color:#92400e;font-weight:700;margin:0 0 12px;font-size:14px;">📋 Langkah yang mungkin terlewat:</p>
        ${[
          ['Siapkan SIM card baru', 'Beli SIM Telkomsel baru ~Rp 35rb khusus untuk bot. Jangan install WhatsApp!'],
          ['Kirim data ke tim kami', 'Kirim nama toko, email, dan nomor WA bot ke +62 813-2531-210'],
          ['Balas kode OTP', 'Kamu akan menerima SMS kode OTP — segera kirim ke WhatsApp kami (berlaku 10 menit)'],
        ].map(([title, desc]) => `
        <div style="display:flex;gap:10px;margin-bottom:10px;padding:10px;background:#fff;border-radius:8px;">
          <span style="color:#EF9F27;font-size:16px;flex-shrink:0;">○</span>
          <div>
            <p style="margin:0 0 2px;font-weight:700;color:#374151;font-size:13px;">${title}</p>
            <p style="margin:0;color:#6b7280;font-size:12px;">${desc}</p>
          </div>
        </div>
        `).join('')}
      </div>

      <!-- CTA Hubungi -->
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:16px;margin-bottom:24px;text-align:center;">
        <p style="color:#166534;font-weight:700;margin:0 0 8px;font-size:14px;">💬 Hubungi tim kami sekarang</p>
        <a href="https://wa.me/628132531210?text=Halo Mahirusaha, saya ${nama} ingin aktivasi bot tapi ada kendala." style="display:inline-block;background:linear-gradient(135deg,#25d366,#128c7e);color:#fff;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:700;font-size:14px;margin-bottom:8px;">
          💬 Chat WhatsApp Sekarang
        </a>
        <p style="color:#6b7280;font-size:12px;margin:8px 0 0;">+62 813-2531-210 · Senin-Sabtu 08.00-21.00 WIB</p>
      </div>

      <p style="color:#6b7280;font-size:13px;line-height:1.7;margin:0;">
        Atau baca <a href="https://mahirusaha.com/panduan" style="color:#25d366;font-weight:600;">panduan lengkap aktivasi bot</a> untuk langkah-langkah detail.
      </p>
    </div>

    <!-- CTA Dashboard -->
    <div style="text-align:center;margin-bottom:24px;">
      <a href="https://mahirusaha.com/dashboard" style="display:inline-block;background:linear-gradient(135deg,#25d366,#128c7e);color:#fff;padding:14px 32px;border-radius:12px;text-decoration:none;font-weight:700;font-size:15px;">
        Masuk ke Dashboard →
      </a>
      <p style="color:#9ca3af;font-size:12px;margin:10px 0 0;">
        Sambil menunggu aktivasi, lengkapi <strong>produk</strong> dan <strong>info toko</strong> kamu!
      </p>
    </div>

    <!-- Footer -->
    <div style="text-align:center;margin-top:24px;">
      <p style="color:#9ca3af;font-size:12px;margin:0;">
        © 2026 Mahirusaha · <a href="https://mahirusaha.com/privasi" style="color:#9ca3af;">Privasi</a> · <a href="https://mahirusaha.com/syarat" style="color:#9ca3af;">Syarat Layanan</a>
      </p>
      <p style="color:#d1d5db;font-size:11px;margin:8px 0 0;">
        Email ini dikirim karena kamu mendaftar di mahirusaha.com
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
        subject: `⏰ ${nama}, bot WhatsApp kamu belum aktif — ada yang bisa kami bantu?`,
        html: htmlContent,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('Resend error:', error)
      return NextResponse.json({ error: 'Gagal kirim email' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Email reminder terkirim!' })

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan' }, { status: 500 })
  }
}
