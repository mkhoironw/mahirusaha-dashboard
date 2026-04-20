import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { store_id, nomor_pelanggan, pesan } = await request.json()

    if (!store_id || !nomor_pelanggan || !pesan) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 })
    }

    // Ambil data toko
    const { data: toko } = await supabase
      .from('stores')
      .select('wa_access_token, wa_phone_number_id')
      .eq('id', store_id)
      .single()

    if (!toko?.wa_phone_number_id) {
      return NextResponse.json({ error: 'Toko tidak ditemukan atau bot belum aktif' }, { status: 404 })
    }

    const waToken = toko.wa_access_token || process.env.WHATSAPP_TOKEN
    const phoneNumberId = toko.wa_phone_number_id

    // Kirim pesan via WhatsApp Cloud API
    const response = await fetch(
      `https://graph.facebook.com/v22.0/${phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${waToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: nomor_pelanggan,
          type: 'text',
          text: { body: pesan }
        }),
      }
    )

    if (!response.ok) {
      const error = await response.json()
      console.error('WA API error:', error)
      return NextResponse.json({ error: 'Gagal kirim pesan ke WhatsApp' }, { status: 500 })
    }

    // Simpan ke conversations
    await supabase.from('conversations').insert({
      store_id,
      nomor_pelanggan,
      pesan_masuk: '(Admin mengambil alih)',
      pesan_keluar: pesan,
      dibaca: true,
    })

    return NextResponse.json({ success: true, message: 'Pesan berhasil dikirim!' })

  } catch (error) {
    console.error('Error reply manual:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan' }, { status: 500 })
  }
}
