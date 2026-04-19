import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { client_id, nama, email } = await request.json()

    if (!email || !nama) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 })
    }

    // Ambil data toko klien
    const { data: store } = await supabase
      .from('stores')
      .select('nama_toko, nomor_wa_toko, slug')
      .eq('client_id', client_id)
      .single()

    const nama_toko = store?.nama_toko || 'Toko kamu'
    const nomor_wa = store?.nomor_wa_toko || '-'
    const slug = store?.slug || ''

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bot WhatsApp Kamu Sudah Aktif!</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#25d366,#128c7e);border-radius:16px;padding:32px;text-align:center;margin-bottom:24px;">
      <div style="font-size:48px;margin-bottom:12px;">🤖</div>
      <h1 style="color:#fff;margin:0;font-size:24px;font-weight:800;">Bot WhatsApp Kamu Sudah Aktif!</h1>
      <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:14px;">Siap melayani pelanggan 24 jam non-stop 🎉</p>
    </div>

    <!-- Body -->
    <div style="background:#fff;border-radius:16px;padding:32px;margin-bottom:24px;border:1px solid #e5e7eb;">
      <p style="color:#374151;font-size:16px;margin:0 0 16px;">Halo <strong>${nama}</strong>! 🎉</p>
      <p style="color:#6b7280;font-size:14px;line-height:1.7;margin:0 0 24px;">
        Kabar gembira! Bot WhatsApp toko <strong style="color:#25d366;">${nama_toko}</strong> kamu sudah aktif dan siap melayani pelanggan otomatis 24 jam!
      </p>

      <!-- Detail Bot -->
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:20px;margin-bottom:24px;">
        <p style="color:#166534;font-weight:700;margin:0 0 12px;font-size:14px;">✅ Detail Bot Kamu</p>
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:6px 0;color:#6b7280;font-size:13px;width:140px;">Nama Toko</td>
            <td style="padding:6px 0;color:#374151;font-weight:600;font-size:13px;">${nama_toko}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#6b7280;font-size:13px;">Nomor WA Bot</td>
            <td style="padding:6px 0;color:#374151;font-weight:600;font-size:13px;">${nomor_wa}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#6b7280;font-size:13px;">Link Toko Online</td>
            <td style="padding:6px 0;font-size:13px;"><a href="https://mahirusaha.com/${slug}" style="color:#25d366;font-weight:600;">mahirusaha.com/${slug}</a></td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#6b7280;font-size:13px;">Status</td>
            <td style="padding:6px 0;"><span style="background:#dcfce7;color:#166534;padding:2px 10px;border-radius:100px;font-size:12px;font-weight:700;">🟢 Aktif</span></td>
          </tr>
        </table>
      </div>

      <!-- Langkah selanjutnya -->
      <p style="color:#374151;font-weight:700;font-size:15px;margin:0 0 14px;">🚀 Yang bisa dilakukan sekarang:</p>
      ${[
        ['Test bot kamu!', `Kirim pesan "Halo" ke nomor WA bot kamu dari HP lain — bot langsung menjawab!`],
        ['Share nomor WA bot ke pelanggan', 'Bagikan di bio Instagram, status WhatsApp, grup komunitas, atau kartu nama digital'],
        ['Share link toko online', `Link toko kamu: mahirusaha.com/${slug} — bagikan di semua media sosial!`],
        ['Pantau percakapan di dashboard', 'Login ke mahirusaha.com/dashboard → menu Percakapan'],
      ].map(([title, desc]) => `
      <div style="display:flex;gap:12px;padding:12px;background:#f9fafb;border-radius:10px;border:1px solid #e5e7eb;margin-bottom:10px;">
        <span style="color:#25d366;font-size:16px;flex-shrink:0;">✓</span>
        <div>
          <p style="margin:0 0 2px;font-weight:700;color:#374151;font-size:13px;">${title}</p>
          <p style="margin:0;color:#6b7280;font-size:12px;">${desc}</p>
        </div>
      </div>
      `).join('')}

      <!-- Info trial -->
      <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:16px;margin-top:8px;">
        <p style="color:#92400e;font-weight:700;margin:0 0 4px;font-size:13px;">💡 Info Trial 100 Pesan Gratis</p>
        <p style="color:#78350f;font-size:12px;margin:0;line-height:1.6;">
          Trial 100 pesan gratis kamu sudah mulai berjalan sejak bot aktif hari ini. Pantau penggunaan di dashboard. Setelah 100 pesan habis, pilih paket untuk melanjutkan mulai Rp 99.000/bulan.
        </p>
      </div>
    </div>

    <!-- Tips -->
    <div style="background:#fff;border-radius:16px;padding:24px;margin-bottom:24px;border:1px solid #e5e7eb;">
      <p style="color:#374151;font-weight:700;font-size:14px;margin:0 0 12px;">💡 Tips Memaksimalkan Bot</p>
      <ul style="margin:0;padding-left:20px;">
        <li style="color:#6b7280;font-size:13px;margin-bottom:8px;line-height:1.6;">Isi deskripsi produk <strong style="color:#374151;">selengkap mungkin</strong> — semakin detail, semakin pintar bot menjawab</li>
        <li style="color:#6b7280;font-size:13px;margin-bottom:8px;line-height:1.6;">Upload <strong style="color:#374151;">foto produk</strong> yang menarik di menu Produk</li>
        <li style="color:#6b7280;font-size:13px;margin-bottom:8px;line-height:1.6;">Atur <strong style="color:#374151;">jam buka dan pesan di luar jam</strong> agar bot tahu kapan toko tutup</li>
        <li style="color:#6b7280;font-size:13px;line-height:1.6;">Share link toko <strong style="color:#374151;">mahirusaha.com/${slug}</strong> di semua platform untuk dapat lebih banyak pelanggan</li>
      </ul>
    </div>

    <!-- CTA -->
    <div style="text-align:center;margin-bottom:24px;">
      <a href="https://mahirusaha.com/dashboard" style="display:inline-block;background:linear-gradient(135deg,#25d366,#128c7e);color:#fff;padding:14px 32px;border-radius:12px;text-decoration:none;font-weight:700;font-size:15px;">
        Buka Dashboard →
      </a>
    </div>

    <!-- Kontak -->
    <div style="background:#fff;border-radius:16px;padding:24px;border:1px solid #e5e7eb;text-align:center;">
      <p style="color:#374151;font-weight:700;margin:0 0 8px;font-size:14px;">Ada pertanyaan?</p>
      <div style="display:flex;justify-content:center;gap:16px;flex-wrap:wrap;">
        <a href="https://wa.me/628132531210" style="color:#25d366;font-size:13px;font-weight:600;text-decoration:none;">💬 +62 813-2531-210</a>
        <a href="mailto:hello@mahirusaha.com" style="color:#25d366;font-size:13px;font-weight:600;text-decoration:none;">📧 hello@mahirusaha.com</a>
      </div>
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
        subject: `🤖 Bot WhatsApp ${nama_toko} sudah aktif!`,
        html: htmlContent,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('Resend error:', error)
      return NextResponse.json({ error: 'Gagal kirim email' }, { status: 500 })
    }

    // Simpan notifikasi di database
    await supabase.from('notifications').insert({
      client_id,
      tipe: 'bot_aktif',
      judul: 'Bot WhatsApp Aktif',
      pesan: `Bot WhatsApp ${nama_toko} sudah aktif dan siap melayani pelanggan.`,
      channel: 'email',
      status: 'terkirim',
    })

    return NextResponse.json({ success: true, message: 'Email bot aktif terkirim!' })

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan' }, { status: 500 })
  }
}
