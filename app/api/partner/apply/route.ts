import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { nama, email, nomor_wa } = await request.json()

    // Kirim notif WA ke admin
    const pesanAdmin = `🤝 *Pendaftaran Partner Baru!*\n\nNama: ${nama}\nEmail: ${email}\nWA: ${nomor_wa}\n\nReview di admin dashboard:\nmahirusaha.com/admin/dashboard\n\nMenu: Partner Applications`

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
          to: process.env.ADMIN_WA_NUMBER || '628132531210',
          type: 'text',
          text: { body: pesanAdmin }
        }),
      }
    )

    // Kirim email konfirmasi ke pemohon
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/email/partner-apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nama, email })
    }).catch(() => {}) // tidak block jika email gagal

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error partner apply:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan' }, { status: 500 })
  }
}
