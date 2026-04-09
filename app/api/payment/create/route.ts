import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { client_id, paket, periode } = body

    // Validasi input
    if (!client_id || !paket || !periode) {
      return NextResponse.json(
        { error: 'client_id, paket, dan periode wajib diisi' },
        { status: 400 }
      )
    }

    // Ambil data klien
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', client_id)
      .single()

    if (clientError || !client) {
      return NextResponse.json(
        { error: 'Klien tidak ditemukan' },
        { status: 404 }
      )
    }

    // Ambil data paket
    const { data: packageData } = await supabase
      .from('packages')
      .select('*')
      .eq('kode', paket)
      .single()

    if (!packageData) {
      return NextResponse.json(
        { error: 'Paket tidak ditemukan' },
        { status: 404 }
      )
    }

    // Hitung harga
    const harga = periode === 'tahunan'
      ? packageData.harga_tahunan
      : packageData.harga_bulanan

    const diskon = periode === 'tahunan' ? packageData.diskon_tahunan_persen : 0

    // Generate order ID unik
    const orderId = `MHR-${client_id.substring(0, 8)}-${Date.now()}`

    // Buat transaksi di Midtrans
    const midtransPayload = {
      transaction_details: {
        order_id: orderId,
        gross_amount: harga,
      },
      credit_card: {
        secure: true,
      },
      customer_details: {
        first_name: client.nama_pemilik,
        email: client.email,
        phone: client.nomor_wa_pemilik || '',
      },
      item_details: [
        {
          id: paket,
          price: harga,
          quantity: 1,
          name: `Mahirusaha ${packageData.nama} - ${periode === 'tahunan' ? '1 Tahun' : '1 Bulan'}`,
        },
      ],
      callbacks: {
        finish: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=success`,
        error: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=error`,
        pending: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=pending`,
      }
    }

    // Hit Midtrans Snap API
    const midtransResponse = await fetch(
      'https://app.sandbox.midtrans.com/snap/v1/transactions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from(process.env.MIDTRANS_SERVER_KEY + ':').toString('base64')}`,
        },
        body: JSON.stringify(midtransPayload),
      }
    )

    const midtransData = await midtransResponse.json()

    if (!midtransData.token) {
      console.error('Midtrans error:', midtransData)
      return NextResponse.json(
        { error: 'Gagal membuat transaksi Midtrans' },
        { status: 500 }
      )
    }

    // Simpan subscription pending ke database
    await supabase.from('subscriptions').insert({
      client_id,
      package_id: packageData.id,
      paket,
      periode,
      harga_normal: harga,
      diskon_referral: 0,
      diskon_promo: diskon,
      harga_bayar: harga,
      status_bayar: 'pending',
      id_transaksi: orderId,
      midtrans_response: midtransData,
      tanggal_mulai: new Date().toISOString(),
      tanggal_berakhir: periode === 'tahunan'
        ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    })

    return NextResponse.json({
      success: true,
      token: midtransData.token,
      redirect_url: midtransData.redirect_url,
      order_id: orderId,
    })

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
