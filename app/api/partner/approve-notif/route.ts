import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { nama, nomor_wa, email } = await request.json()

    // ================================================
    // 1. Kirim notif WhatsApp (jika gagal tidak block)
    // ================================================
    const pesanWA = `🎉 *Selamat ${nama}!*\n\nPendaftaran partner Mahirusaha kamu telah *DIAPPROVE*! 🤝\n\nKamu sekarang bisa login ke dashboard partner:\nmahirusaha.com/partner/masuk\n\nGunakan email dan password yang kamu daftarkan saat mendaftar.\n\nSelamat bergabung dan semangat referral! 💪\n\n— Tim Mahirusaha`

    try {
      const waRes = await fetch(
        `https://graph.facebook.com/v22.0/${process.env.PHONE_NUMBER_ID}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: nomor_wa,
            type: 'text',
            text: { body: pesanWA }
          }),
        }
      )
      if (!waRes.ok) {
        const waError = await waRes.json()
        console.error('WA API error:', JSON.stringify(waError))
      }
    } catch (waErr) {
      console.error('WA gagal:', waErr)
    }

    // ================================================
    // 2. Kirim email via Resend
    // ================================================
    if (email) {
      try {
        await resend.emails.send({
          from: 'Mahirusaha <hello@mahirusaha.com>',
          to: email,
          subject: '🎉 Selamat! Kamu Resmi Jadi Partner Mahirusaha',
          html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#070d1a;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:580px;margin:0 auto;padding:40px 20px;">

    <div style="text-align:center;margin-bottom:32px;">
      <div style="display:inline-block;background:linear-gradient(135deg,#25d366,#128c7e);padding:12px 20px;border-radius:12px;">
        <span style="font-size:20px;">💬</span>
        <span style="color:#fff;font-weight:800;font-size:18px;margin-left:8px;vertical-align:middle;">Mahirusaha</span>
      </div>
    </div>

    <div style="background:linear-gradient(135deg,rgba(129,140,248,0.15),rgba(99,102,241,0.1));border:1px solid rgba(129,140,248,0.3);border-radius:20px;padding:40px 32px;text-align:center;margin-bottom:24px;">
      <div style="font-size:48px;margin-bottom:16px;">🎉</div>
      <h1 style="color:#fff;font-size:24px;font-weight:800;margin:0 0 12px;">Selamat, ${nama}!</h1>
      <p style="color:rgba(255,255,255,0.7);font-size:15px;line-height:1.7;margin:0 0 24px;">
        Pendaftaran partner Mahirusaha kamu telah <strong style="color:#818cf8;">DIAPPROVE</strong>!
        Kamu resmi bergabung dan siap mulai menghasilkan komisi.
      </p>
      <div style="background:rgba(129,140,248,0.1);border:1px solid rgba(129,140,248,0.25);border-radius:12px;padding:16px;margin-bottom:24px;">
        <div style="color:rgba(255,255,255,0.5);font-size:12px;margin-bottom:4px;">Komisi kamu</div>
        <div style="color:#818cf8;font-size:32px;font-weight:800;">15%</div>
        <div style="color:rgba(255,255,255,0.4);font-size:12px;">per transaksi klien, setiap bulan</div>
      </div>
      <a href="https://mahirusaha.com/partner/masuk" style="display:inline-block;background:linear-gradient(135deg,#818cf8,#6366f1);color:#fff;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px;">
        🚀 Masuk Dashboard Partner
      </a>
    </div>

    <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:24px;margin-bottom:24px;">
      <h3 style="color:#fff;font-size:15px;font-weight:700;margin:0 0 16px;">Langkah selanjutnya:</h3>
      <div style="display:flex;gap:12px;margin-bottom:14px;">
        <div style="width:32px;height:32px;background:rgba(129,140,248,0.15);border:1px solid rgba(129,140,248,0.25);border-radius:8px;text-align:center;line-height:32px;font-size:14px;flex-shrink:0;">🔐</div>
        <div>
          <div style="color:#fff;font-size:13px;font-weight:600;margin-bottom:2px;">Login ke dashboard partner</div>
          <div style="color:rgba(255,255,255,0.45);font-size:12px;">mahirusaha.com/partner/masuk — gunakan email & password saat daftar</div>
        </div>
      </div>
      <div style="display:flex;gap:12px;margin-bottom:14px;">
        <div style="width:32px;height:32px;background:rgba(129,140,248,0.15);border:1px solid rgba(129,140,248,0.25);border-radius:8px;text-align:center;line-height:32px;font-size:14px;flex-shrink:0;">🔗</div>
        <div>
          <div style="color:#fff;font-size:13px;font-weight:600;margin-bottom:2px;">Dapatkan link referral unik</div>
          <div style="color:rgba(255,255,255,0.45);font-size:12px;">Di dashboard → menu Link Referral → salin link kamu</div>
        </div>
      </div>
      <div style="display:flex;gap:12px;margin-bottom:14px;">
        <div style="width:32px;height:32px;background:rgba(129,140,248,0.15);border:1px solid rgba(129,140,248,0.25);border-radius:8px;text-align:center;line-height:32px;font-size:14px;flex-shrink:0;">📢</div>
        <div>
          <div style="color:#fff;font-size:13px;font-weight:600;margin-bottom:2px;">Bagikan ke jaringan UMKM</div>
          <div style="color:rgba(255,255,255,0.45);font-size:12px;">Kenalkan Mahirusaha ke teman-teman pengusaha di sekitarmu</div>
        </div>
      </div>
      <div style="display:flex;gap:12px;">
        <div style="width:32px;height:32px;background:rgba(129,140,248,0.15);border:1px solid rgba(129,140,248,0.25);border-radius:8px;text-align:center;line-height:32px;font-size:14px;flex-shrink:0;">💰</div>
        <div>
          <div style="color:#fff;font-size:13px;font-weight:600;margin-bottom:2px;">Komisi masuk otomatis</div>
          <div style="color:rgba(255,255,255,0.45);font-size:12px;">Setiap klien bayar, 15% komisi langsung tercatat di dashboardmu</div>
        </div>
      </div>
    </div>

    <div style="background:rgba(37,211,102,0.06);border:1px solid rgba(37,211,102,0.15);border-radius:16px;padding:20px;margin-bottom:24px;">
      <h3 style="color:#25d366;font-size:13px;font-weight:700;margin:0 0 12px;text-transform:uppercase;letter-spacing:0.05em;">💰 Simulasi Komisi</h3>
      <table style="width:100%;border-collapse:collapse;">
        <tr style="border-bottom:1px solid rgba(255,255,255,0.06);">
          <td style="color:rgba(255,255,255,0.5);font-size:12px;padding:8px 0;">5 klien Starter (Rp 99rb)</td>
          <td style="color:#25d366;font-size:12px;font-weight:700;text-align:right;padding:8px 0;">Rp 74.250/bln</td>
        </tr>
        <tr style="border-bottom:1px solid rgba(255,255,255,0.06);">
          <td style="color:rgba(255,255,255,0.5);font-size:12px;padding:8px 0;">10 klien Pro (Rp 299rb)</td>
          <td style="color:#25d366;font-size:12px;font-weight:700;text-align:right;padding:8px 0;">Rp 448.500/bln</td>
        </tr>
        <tr>
          <td style="color:rgba(255,255,255,0.5);font-size:12px;padding:8px 0;">5 klien Bisnis (Rp 699rb)</td>
          <td style="color:#25d366;font-size:12px;font-weight:700;text-align:right;padding:8px 0;">Rp 524.250/bln</td>
        </tr>
      </table>
    </div>

    <div style="text-align:center;margin-bottom:32px;">
      <a href="https://mahirusaha.com/partner/masuk" style="display:inline-block;background:linear-gradient(135deg,#818cf8,#6366f1);color:#fff;padding:14px 40px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px;margin-bottom:12px;">
        Masuk Dashboard Partner →
      </a>
      <p style="color:rgba(255,255,255,0.35);font-size:12px;margin:8px 0 0;">
        Ada pertanyaan? Chat kami di
        <a href="https://wa.me/628132531202" style="color:#25d366;text-decoration:none;">+62 813-2531-202</a>
      </p>
    </div>

    <div style="border-top:1px solid rgba(255,255,255,0.06);padding-top:20px;text-align:center;">
      <p style="color:rgba(255,255,255,0.2);font-size:11px;margin:0;">
        © 2026 Mahirusaha ·
        <a href="https://mahirusaha.com/privasi" style="color:rgba(255,255,255,0.2);text-decoration:none;">Privasi</a> ·
        <a href="https://mahirusaha.com/syarat" style="color:rgba(255,255,255,0.2);text-decoration:none;">Syarat</a>
      </p>
    </div>

  </div>
</body>
</html>
          `
        })
      } catch (emailErr) {
        console.error('Email gagal:', emailErr)
      }
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error approve notif:', error)
    return NextResponse.json({ error: 'Gagal kirim notif' }, { status: 500 })
  }
}
