import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      fraud_status,
    } = body

    // Verifikasi signature dari Midtrans
    const serverKey = process.env.MIDTRANS_SERVER_KEY!
    const expectedSignature = crypto
      .createHash('sha512')
      .update(`${order_id}${status_code}${gross_amount}${serverKey}`)
      .digest('hex')

    if (signature_key !== expectedSignature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    // Cek status pembayaran
    const isPaid =
      (transaction_status === 'capture' && fraud_status === 'accept') ||
      transaction_status === 'settlement'

    const isFailed =
      transaction_status === 'cancel' ||
      transaction_status === 'deny' ||
      transaction_status === 'expire'

    // Update status subscription di database
    const { data: subscription } = await supabase
      .from('subscriptions')
      .update({
        status_bayar: isPaid ? 'lunas' : isFailed ? 'gagal' : 'pending',
        tanggal_bayar: isPaid ? new Date().toISOString() : null,
        midtrans_response: body,
      })
      .eq('id_transaksi', order_id)
      .select('*, clients(*)')
      .single()

    if (isPaid && subscription) {
      const client = subscription.clients
      const sekarang = new Date()

      // ================================================
      // 1. Update status klien menjadi aktif
      // ================================================
      await supabase
        .from('clients')
        .update({
          status: 'aktif',
          paket: subscription.paket,
          tanggal_aktif: sekarang.toISOString(),
          tanggal_berakhir: subscription.tanggal_berakhir,
        })
        .eq('id', subscription.client_id)

      // ================================================
      // 2. Aktifkan semua toko klien
      // ================================================
      await supabase
        .from('stores')
        .update({
          aktif: true,
          is_trial: false,
          batas_pesan_bulan: getPesanLimit(subscription.paket),
        })
        .eq('client_id', subscription.client_id)

      // ================================================
      // 3. Update onboarding steps
      // ================================================
      await supabase
        .from('onboarding_steps')
        .update({
          step_pilih_paket: true,
          step_bayar: true,
          step_bot_aktif: true,
          persen_selesai: 87,
        })
        .eq('client_id', subscription.client_id)

      // ================================================
      // 4. Hitung & simpan komisi partner (fleksibel)
      // ================================================
      try {
        const { data: referral } = await supabase
          .from('referrals')
          .select('referrer_id, sudah_diklaim')
          .eq('referred_id', subscription.client_id)
          .single()

        if (referral?.referrer_id) {
          const { data: partner } = await supabase
            .from('clients')
            .select('id, nama_pemilik, nomor_wa_pemilik, is_partner, komisi_persen')
            .eq('id', referral.referrer_id)
            .single()

          if (partner?.is_partner) {
            // Pakai komisi_persen dari database, fallback ke 15%
            const komisiPersen = partner.komisi_persen || 15
            const jumlahKomisi = Math.round(parseInt(gross_amount) * (komisiPersen / 100))
            const bulan = sekarang.getMonth() + 1
            const tahun = sekarang.getFullYear()

            // Simpan komisi ke database
            await supabase.from('partner_komisi').insert({
              partner_client_id: partner.id,
              referred_client_id: subscription.client_id,
              jumlah_komisi: jumlahKomisi,
              bulan,
              tahun,
              status: 'pending',
            })

            // Kirim notifikasi WA ke partner
            await kirimNotifikasiWA(
              partner.nomor_wa_pemilik,
              `💰 *Komisi Mahirusaha Masuk!*\n\nHalo ${partner.nama_pemilik}!\n\nKlien referral kamu baru saja melakukan pembayaran.\n\n📦 Paket: ${subscription.paket.toUpperCase()}\n📊 Komisi: ${komisiPersen}%\n💵 Jumlah: Rp ${jumlahKomisi.toLocaleString('id-ID')}\n📅 Periode: ${bulan}/${tahun}\n\nLihat detail di:\nmahirusaha.com/partner/dashboard\n\nTerima kasih! 🙏`
            )

            console.log(`💰 Komisi ${komisiPersen}% = Rp ${jumlahKomisi} → partner ${partner.id}`)
          }
        }

        // Tandai referral sudah diklaim
        await supabase
          .from('referrals')
          .update({ sudah_diklaim: true, diklaim_at: sekarang.toISOString() })
          .eq('referred_id', subscription.client_id)
          .eq('sudah_diklaim', false)

      } catch (err) {
        console.error('Error hitung komisi partner:', err)
      }

      // ================================================
      // 5. Kirim notifikasi ke klien via WA
      // ================================================
      await kirimNotifikasiWA(
        client.nomor_wa_pemilik,
        `🎉 *Selamat! Pembayaran Mahirusaha Berhasil!*\n\nPaket *${subscription.paket.toUpperCase()}* (${subscription.periode}) sudah aktif.\n\n✅ Bot WhatsApp kamu sudah aktif!\n✅ Toko online sudah bisa diakses!\n\nMasuk ke dashboard:\nmahirusaha.com/dashboard\n\nTerima kasih sudah mempercayai Mahirusaha 🙏`
      )

      // ================================================
      // 6. Simpan notifikasi di database
      // ================================================
      await supabase.from('notifications').insert({
        client_id: subscription.client_id,
        tipe: 'payment_success',
        judul: 'Pembayaran Berhasil!',
        pesan: `Selamat! Paket ${subscription.paket} kamu sudah aktif.`,
        channel: 'wa',
        status: 'terkirim',
      })

      console.log(`✅ Pembayaran berhasil untuk klien ${subscription.client_id}`)
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

function getPesanLimit(paket: string): number {
  const limits: Record<string, number> = {
    starter: 1000,
    pro: 5000,
    bisnis: 20000,
    enterprise: 999999,
  }
  return limits[paket] || 1000
}

async function kirimNotifikasiWA(nomor: string, pesan: string) {
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
    console.error('Error kirim notifikasi WA:', err)
  }
}
