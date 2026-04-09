import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

// GET — ambil daftar broadcast milik toko
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const store_id = searchParams.get('store_id')

    if (!store_id) {
      return NextResponse.json({ error: 'store_id wajib diisi' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('broadcasts')
      .select('*')
      .eq('store_id', store_id)
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error GET broadcasts:', error)
    return NextResponse.json({ error: 'Gagal mengambil data' }, { status: 500 })
  }
}

// POST — buat broadcast baru & mulai kirim
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { store_id, client_id, judul, pesan, delay_detik = 4 } = body

    if (!store_id || !client_id || !judul || !pesan) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 })
    }

    // Cek paket klien — broadcast hanya untuk Pro+
    const { data: client } = await supabase
      .from('clients')
      .select('paket, status')
      .eq('id', client_id)
      .single()

    if (!client || client.status !== 'aktif') {
      return NextResponse.json({ error: 'Akun tidak aktif' }, { status: 403 })
    }

    if (client.paket === 'starter' || client.paket === 'trial') {
      return NextResponse.json({
        error: 'Fitur broadcast hanya tersedia untuk paket Pro ke atas. Upgrade sekarang!'
      }, { status: 403 })
    }

    // Ambil semua kontak unik yang pernah chat dengan toko ini
    const { data: conversations } = await supabase
      .from('conversations')
      .select('nomor_pelanggan, nama_pelanggan')
      .eq('store_id', store_id)
      .not('nomor_pelanggan', 'is', null)

    if (!conversations || conversations.length === 0) {
      return NextResponse.json({
        error: 'Belum ada kontak. Bot harus sudah pernah diajak chat oleh pelanggan.'
      }, { status: 400 })
    }

    // Deduplikasi kontak
    const kontakMap = new Map<string, string>()
    for (const conv of conversations) {
      if (!kontakMap.has(conv.nomor_pelanggan)) {
        kontakMap.set(conv.nomor_pelanggan, conv.nama_pelanggan || '')
      }
    }
    const kontakList = Array.from(kontakMap.entries())

    // Buat record broadcast
    const { data: broadcast, error: broadcastError } = await supabase
      .from('broadcasts')
      .insert({
        store_id,
        client_id,
        judul,
        pesan,
        target: 'semua',
        total_target: kontakList.length,
        status: 'proses',
        delay_detik,
        mulai_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (broadcastError || !broadcast) throw broadcastError

    // Insert semua penerima dengan status pending
    const recipients = kontakList.map(([nomor, nama]) => ({
      broadcast_id: broadcast.id,
      nomor_pelanggan: nomor,
      nama_pelanggan: nama,
      status: 'pending',
    }))

    await supabase.from('broadcast_recipients').insert(recipients)

    // Ambil data toko untuk kirim pesan
    const { data: store } = await supabase
      .from('stores')
      .select('wa_phone_number_id, wa_access_token, nomor_wa_toko')
      .eq('id', store_id)
      .single()

    const phoneNumberId = store?.wa_phone_number_id || process.env.PHONE_NUMBER_ID
    const accessToken = store?.wa_access_token || process.env.WHATSAPP_TOKEN

    // Kirim pesan secara async (tidak tunggu selesai)
    kirimBroadcastAsync(broadcast.id, kontakList, pesan, phoneNumberId, accessToken, delay_detik)

    return NextResponse.json({
      success: true,
      broadcast_id: broadcast.id,
      total_target: kontakList.length,
      message: `Broadcast dimulai ke ${kontakList.length} kontak dengan delay ${delay_detik} detik antar pesan.`
    })

  } catch (error) {
    console.error('Error POST broadcast:', error)
    return NextResponse.json({ error: 'Gagal membuat broadcast' }, { status: 500 })
  }
}

// Fungsi kirim broadcast secara async dengan delay
async function kirimBroadcastAsync(
  broadcastId: string,
  kontakList: [string, string][],
  pesan: string,
  phoneNumberId: string,
  accessToken: string,
  delayDetik: number
) {
  let terkirim = 0
  let gagal = 0

  for (const [nomor, nama] of kontakList) {
    try {
      // Personalisasi pesan dengan nama pelanggan
      const pesanPersonal = nama
        ? pesan.replace(/\{nama\}/g, nama)
        : pesan.replace(/\{nama\}/g, 'Kak')

      // Kirim via WhatsApp API
      const response = await fetch(
        `https://graph.facebook.com/v22.0/${phoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: nomor,
            type: 'text',
            text: { body: pesanPersonal }
          }),
        }
      )

      const result = await response.json()

      if (result.messages && result.messages[0]?.id) {
        // Sukses
        terkirim++
        await supabase
          .from('broadcast_recipients')
          .update({ status: 'terkirim', dikirim_at: new Date().toISOString() })
          .eq('broadcast_id', broadcastId)
          .eq('nomor_pelanggan', nomor)
      } else {
        // Gagal
        gagal++
        await supabase
          .from('broadcast_recipients')
          .update({ status: 'gagal', error_message: result.error?.message || 'Unknown error' })
          .eq('broadcast_id', broadcastId)
          .eq('nomor_pelanggan', nomor)
      }

    } catch (err) {
      gagal++
      await supabase
        .from('broadcast_recipients')
        .update({ status: 'gagal', error_message: 'Network error' })
        .eq('broadcast_id', broadcastId)
        .eq('nomor_pelanggan', nomor)
    }

    // Update progress di broadcast
    await supabase
      .from('broadcasts')
      .update({ total_terkirim: terkirim, total_gagal: gagal })
      .eq('id', broadcastId)

    // Delay anti-banned
    await new Promise(resolve => setTimeout(resolve, delayDetik * 1000))
  }

  // Update status selesai
  await supabase
    .from('broadcasts')
    .update({
      status: 'selesai',
      total_terkirim: terkirim,
      total_gagal: gagal,
      selesai_at: new Date().toISOString(),
    })
    .eq('id', broadcastId)

  console.log(`✅ Broadcast ${broadcastId} selesai: ${terkirim} terkirim, ${gagal} gagal`)
}
