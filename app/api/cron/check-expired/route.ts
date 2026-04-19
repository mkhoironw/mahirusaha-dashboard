import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    // Verifikasi request dari Vercel Cron (keamanan)
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const sekarang = new Date().toISOString()
    const hari = new Date()

    // ================================================
    // 1. AUTO SUSPEND — klien yang sudah lewat jatuh tempo
    // ================================================
    const { data: expired } = await supabase
      .from('clients')
      .select('id, nama_pemilik, email, nomor_wa_pemilik, paket, tanggal_berakhir')
      .eq('status', 'aktif')
      .lt('tanggal_berakhir', sekarang)

    let totalSuspend = 0
    if (expired && expired.length > 0) {
      for (const client of expired) {
        await supabase
          .from('clients')
          .update({ status: 'suspend', updated_at: sekarang })
          .eq('id', client.id)

        await supabase
          .from('stores')
          .update({ aktif: false, updated_at: sekarang })
          .eq('client_id', client.id)

        await kirimNotifWA(
          client.nomor_wa_pemilik,
          `Halo *${client.nama_pemilik}*! 👋\n\nMasa aktif paket *${client.paket.toUpperCase()}* kamu di Mahirusaha sudah berakhir.\n\n❌ Bot WhatsApp toko kamu sementara dinonaktifkan.\n\n✅ Perpanjang sekarang agar bot kembali aktif:\nmahirusaha.com/dashboard\n\nAda pertanyaan? Balas pesan ini. 🙏`
        )

        await supabase.from('notifications').insert({
          client_id: client.id,
          tipe: 'subscription_expired',
          judul: 'Masa aktif berakhir',
          pesan: `Paket ${client.paket} sudah berakhir. Bot dinonaktifkan sementara.`,
          channel: 'wa',
          status: 'terkirim',
        })

        totalSuspend++
      }
    }

    // ================================================
    // 2. REMINDER H-7
    // ================================================
    const h7 = new Date(hari)
    h7.setDate(h7.getDate() + 7)
    const h7Start = new Date(h7.setHours(0, 0, 0, 0)).toISOString()
    const h7End = new Date(h7.setHours(23, 59, 59, 999)).toISOString()

    const { data: remind7 } = await supabase
      .from('clients')
      .select('id, nama_pemilik, nomor_wa_pemilik, paket, tanggal_berakhir')
      .eq('status', 'aktif')
      .gte('tanggal_berakhir', h7Start)
      .lte('tanggal_berakhir', h7End)

    let totalRemind7 = 0
    if (remind7 && remind7.length > 0) {
      for (const client of remind7) {
        const { data: subData } = await supabase
          .from('subscriptions')
          .select('id, reminder_sent_7d')
          .eq('client_id', client.id)
          .eq('status_bayar', 'lunas')
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        if (subData && !subData.reminder_sent_7d) {
          await kirimNotifWA(
            client.nomor_wa_pemilik,
            `Halo *${client.nama_pemilik}*! 👋\n\n⏰ *Reminder:* Paket *${client.paket.toUpperCase()}* kamu akan berakhir dalam *7 hari*.\n\nPerpanjang sekarang agar bot tidak terputus:\nmahirusaha.com/dashboard\n\nTerima kasih sudah menggunakan Mahirusaha! 🙏`
          )
          await supabase
            .from('subscriptions')
            .update({ reminder_sent_7d: true })
            .eq('id', subData.id)
          totalRemind7++
        }
      }
    }

    // ================================================
    // 3. REMINDER H-3
    // ================================================
    const h3 = new Date(hari)
    h3.setDate(h3.getDate() + 3)
    const h3Start = new Date(h3.setHours(0, 0, 0, 0)).toISOString()
    const h3End = new Date(h3.setHours(23, 59, 59, 999)).toISOString()

    const { data: remind3 } = await supabase
      .from('clients')
      .select('id, nama_pemilik, nomor_wa_pemilik, paket, tanggal_berakhir')
      .eq('status', 'aktif')
      .gte('tanggal_berakhir', h3Start)
      .lte('tanggal_berakhir', h3End)

    let totalRemind3 = 0
    if (remind3 && remind3.length > 0) {
      for (const client of remind3) {
        const { data: subData } = await supabase
          .from('subscriptions')
          .select('id, reminder_sent_3d')
          .eq('client_id', client.id)
          .eq('status_bayar', 'lunas')
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        if (subData && !subData.reminder_sent_3d) {
          await kirimNotifWA(
            client.nomor_wa_pemilik,
            `Halo *${client.nama_pemilik}*! ⚠️\n\nPaket *${client.paket.toUpperCase()}* kamu akan berakhir dalam *3 hari*.\n\nJangan sampai bot kamu mati! Perpanjang sekarang:\nmahirusaha.com/dashboard\n\nBantuan? Balas pesan ini. 🙏`
          )
          await supabase
            .from('subscriptions')
            .update({ reminder_sent_3d: true })
            .eq('id', subData.id)
          totalRemind3++
        }
      }
    }

    // ================================================
    // 4. REMINDER H-1
    // ================================================
    const h1 = new Date(hari)
    h1.setDate(h1.getDate() + 1)
    const h1Start = new Date(h1.setHours(0, 0, 0, 0)).toISOString()
    const h1End = new Date(h1.setHours(23, 59, 59, 999)).toISOString()

    const { data: remind1 } = await supabase
      .from('clients')
      .select('id, nama_pemilik, nomor_wa_pemilik, paket, tanggal_berakhir')
      .eq('status', 'aktif')
      .gte('tanggal_berakhir', h1Start)
      .lte('tanggal_berakhir', h1End)

    let totalRemind1 = 0
    if (remind1 && remind1.length > 0) {
      for (const client of remind1) {
        const { data: subData } = await supabase
          .from('subscriptions')
          .select('id, reminder_sent_1d')
          .eq('client_id', client.id)
          .eq('status_bayar', 'lunas')
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        if (subData && !subData.reminder_sent_1d) {
          await kirimNotifWA(
            client.nomor_wa_pemilik,
            `Halo *${client.nama_pemilik}*! 🚨\n\n*URGENT:* Paket *${client.paket.toUpperCase()}* kamu berakhir *BESOK*!\n\nBot akan otomatis dimatikan jika tidak diperpanjang.\n\n👉 Perpanjang sekarang:\nmahirusaha.com/dashboard\n\nProses bayar hanya 2 menit! 🙏`
          )
          await supabase
            .from('subscriptions')
            .update({ reminder_sent_1d: true })
            .eq('id', subData.id)
          totalRemind1++
        }
      }
    }

    // ================================================
    // 5. RESET KUOTA PESAN BULANAN (setiap tanggal 1)
    // ================================================
    let totalReset = 0
    if (hari.getDate() === 1) {
      const { data: activeStores } = await supabase
        .from('stores')
        .select('id')
        .eq('aktif', true)

      if (activeStores && activeStores.length > 0) {
        await supabase
          .from('stores')
          .update({
            pesan_terpakai: 0,
            pesan_terpakai_reset_at: sekarang,
            updated_at: sekarang,
          })
          .eq('aktif', true)
        totalReset = activeStores.length
      }
    }

    // ================================================
    // 6. REMINDER BOT BELUM AKTIF — 24 jam setelah daftar
    // ================================================
    const kemarin = new Date(hari)
    kemarin.setDate(kemarin.getDate() - 1)
    const kemarinStart = new Date(kemarin.setHours(0, 0, 0, 0)).toISOString()
    const kemarinEnd = new Date(kemarin.setHours(23, 59, 59, 999)).toISOString()

    const { data: belumAktif } = await supabase
      .from('clients')
      .select('id, nama_pemilik, email')
      .gte('created_at', kemarinStart)
      .lte('created_at', kemarinEnd)

    let totalReminderBot = 0
    if (belumAktif && belumAktif.length > 0) {
      for (const client of belumAktif) {
        // Cek apakah toko sudah punya wa_phone_number_id (bot sudah aktif)
        const { data: toko } = await supabase
          .from('stores')
          .select('wa_phone_number_id')
          .eq('client_id', client.id)
          .single()

        // Jika wa_phone_number_id masih kosong = bot belum aktif
        if (!toko?.wa_phone_number_id) {
          await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/email/reminder-bot`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              nama: client.nama_pemilik,
              email: client.email,
            })
          })
          totalReminderBot++
        }
      }
    }

    console.log(`✅ Cron selesai: ${totalSuspend} suspend, ${totalRemind7} remind7, ${totalRemind3} remind3, ${totalRemind1} remind1, ${totalReset} reset kuota, ${totalReminderBot} reminder bot belum aktif`)

    return NextResponse.json({
      success: true,
      hasil: {
        auto_suspend: totalSuspend,
        reminder_7_hari: totalRemind7,
        reminder_3_hari: totalRemind3,
        reminder_1_hari: totalRemind1,
        reset_kuota: totalReset,
        reminder_bot_belum_aktif: totalReminderBot,
      }
    })

  } catch (error) {
    console.error('Cron error:', error)
    return NextResponse.json({ error: 'Cron job gagal' }, { status: 500 })
  }
}

// Helper kirim notifikasi WA
async function kirimNotifWA(nomor: string, pesan: string) {
  if (!nomor) return
  try {
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
          to: nomor,
          type: 'text',
          text: { body: pesan }
        }),
      }
    )
  } catch (err) {
    console.error('Error kirim WA:', err)
  }
}
