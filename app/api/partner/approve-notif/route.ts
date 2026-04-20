import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { nama, nomor_wa } = await request.json()

    const pesan = `🎉 *Selamat ${nama}!*\n\nPendaftaran partner Mahirusaha kamu telah *DIAPPROVE*! 🤝\n\nKamu sekarang bisa login ke dashboard partner:\nmahirusaha.com/partner/masuk\n\nGunakan email dan password yang kamu daftarkan saat mendaftar.\n\nSelamat bergabung dan semangat referral! 💪\n\n— Tim Mahirusaha`

    await fetch(
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
          text: { body: pesan }
        }),
      }
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error notif approve partner:', error)
    return NextResponse.json({ error: 'Gagal kirim notif' }, { status: 500 })
  }
}
