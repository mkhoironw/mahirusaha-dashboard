import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nama, perusahaan, email, wa, kebutuhan } = body

    // Validasi field wajib
    if (!nama || !perusahaan || !email) {
      return NextResponse.json(
        { error: 'Nama, perusahaan, dan email wajib diisi' },
        { status: 400 }
      )
    }

    // Simpan ke database
    const { data, error } = await supabase
      .from('enterprise_leads')
      .insert({
        nama_pic: nama,
        nama_perusahaan: perusahaan,
        email: email.toLowerCase(),
        nomor_wa: wa || null,
        kebutuhan: kebutuhan || null,
        status: 'baru',
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error('Error simpan enterprise lead:', error)
      return NextResponse.json(
        { error: 'Gagal menyimpan data' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: true, message: 'Data berhasil disimpan', data },
      { status: 200 }
    )

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
