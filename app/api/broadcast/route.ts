import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 60

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

// POST — buat broadcast baru & kirim via Railway
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { store_id, client_id, judul, pesan, delay_detik = 4, nomor_terpilih = null } = body

    if (!store_id || !client_id || !judul || !pesan) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 })
    }

    // Cek paket klien
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

    // Ambil semua kontak unik yang pernah chat
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

    // Ambil nama custom dari CRM (bot_sessions.nama_custom)
    const { data: botSessions } = await supabase
      .from('bot_sessions')
      .select('nomor_pelanggan, nama_custom')
      .eq('store_id', store_id)
      .not('nama_custom', 'is', null)

    const namaCustomMap = new Map<string, string>()
    for (const s of botSessions || []) {
      namaCustomMap.set(s.nomor_pelanggan, s.nama_custom)
    }

    // Deduplikasi kontak — prioritaskan nama dari CRM
    const kontakMap = new Map<string, string>()
    for (const conv of conversations) {
      if (!kontakMap.has(conv.nomor_pelanggan)) {
        const nama = namaCustomMap.get(conv.nomor_pelanggan) || conv.nama_pelanggan || ''
        kontakMap.set(conv.nomor_pelanggan, nama)
      }
    }

    let kontakList = Array.from(kontakMap.entries())

    // Filter jika ada nomor terpilih
    if (nomor_terpilih && Array.isArray(nomor_terpilih) && nomor_terpilih.length > 0) {
      kontakList = kontakList.filter(([nomor]) => nomor_terpilih.includes(nomor))
    }

    if (kontakList.length === 0) {
      return NextResponse.json({ error: 'Tidak ada kontak yang valid.' }, { status: 400 })
    }

    // Buat record broadcast
    const { data: broadcast, error: broadcastError } = await supabase
      .from('broadcasts')
      .insert({
        store_id,
        client_id,
        judul,
        pesan,
        target: nomor_terpilih ? 'pilihan' : 'semua',
        total_target: kontakList.length,
        status: 'proses',
        delay_detik,
        mulai_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (broadcastError || !broadcast) throw broadcastError

    // Insert semua penerima
    const recipients = kontakList.map(([nomor, nama]) => ({
      broadcast_id: broadcast.id,
      nomor_pelanggan: nomor,
      nama_pelanggan: nama,
      status: 'pending',
    }))

    await supabase.from('broadcast_recipients').insert(recipients)

    // Ambil data toko
    const { data: store } = await supabase
      .from('stores')
      .select('wa_phone_number_id, wa_access_token')
      .eq('id', store_id)
      .single()

    const phoneNumberId = store?.wa_phone_number_id || process.env.PHONE_NUMBER_ID
    const accessToken = store?.wa_access_token || process.env.WHATSAPP_TOKEN

    // Kirim ke Railway untuk proses broadcast tanpa timeout
    const railwayUrl = process.env.RAILWAY_URL || 'https://chatbot-wa-production-247e.up.railway.app'

    fetch(`${railwayUrl}/broadcast`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-broadcast-secret': process.env.BROADCAST_SECRET || 'mahirusaha_broadcast_2026'
      },
      body: JSON.stringify({
        broadcast_id: broadcast.id,
        kontak_list: kontakList.map(([nomor, nama]) => ({ nomor, nama })),
        pesan,
        phone_number_id: phoneNumberId,
        access_token: accessToken,
        delay_detik,
      })
    }).catch(err => console.error('Error kirim ke Railway:', err))

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
