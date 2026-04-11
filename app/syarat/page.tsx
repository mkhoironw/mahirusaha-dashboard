export default function SyaratLayanan() {
  return (
    <main style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: '#070d1a', color: '#fff', minHeight: '100vh' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        h2 { font-size: 1.1rem; font-weight: 700; margin: 32px 0 12px; color: #25d366; }
        h3 { font-size: 0.95rem; font-weight: 600; margin: 20px 0 8px; color: rgba(255,255,255,0.9); }
        p { font-size: 0.875rem; color: rgba(255,255,255,0.6); line-height: 1.8; margin-bottom: 12px; }
        ul { padding-left: 20px; margin-bottom: 12px; }
        ul li { font-size: 0.875rem; color: rgba(255,255,255,0.6); line-height: 1.8; margin-bottom: 4px; }
        a { color: #25d366; text-decoration: none; }
        a:hover { text-decoration: underline; }
      `}</style>

      {/* Nav */}
      <nav style={{ padding: '0 5%', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: '#fff' }}>
          <div style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg,#25d366,#128c7e)', borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px' }}>💬</div>
          <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>Mahirusaha</span>
        </a>
        <a href="/" style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>← Kembali ke Beranda</a>
      </nav>

      {/* Content */}
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '48px 24px 80px' }}>

        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '12px' }}>Syarat & Ketentuan Layanan</h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.82rem' }}>
            Terakhir diperbarui: 11 April 2026
          </p>
          <div style={{ height: '2px', background: 'linear-gradient(90deg,#25d366,transparent)', marginTop: '20px' }} />
        </div>

        <p>
          Selamat datang di Mahirusaha. Dengan mendaftar dan menggunakan layanan kami, kamu menyetujui Syarat dan Ketentuan berikut. Harap baca dengan seksama sebelum menggunakan platform ini.
        </p>

        <h2>1. Definisi</h2>
        <ul>
          <li><strong style={{ color: '#fff' }}>Mahirusaha</strong> — platform SaaS yang menyediakan layanan AI Chatbot WhatsApp untuk UMKM</li>
          <li><strong style={{ color: '#fff' }}>Klien / Pengguna</strong> — individu atau badan usaha yang mendaftar dan menggunakan layanan Mahirusaha</li>
          <li><strong style={{ color: '#fff' }}>Pelanggan</strong> — pihak ketiga yang berinteraksi dengan bot WhatsApp milik klien</li>
          <li><strong style={{ color: '#fff' }}>Layanan</strong> — semua fitur yang tersedia di platform Mahirusaha termasuk chatbot, dashboard, dan API</li>
        </ul>

        <h2>2. Pendaftaran & Akun</h2>
        <ul>
          <li>Kamu harus berusia minimal 17 tahun atau memiliki izin dari wali untuk menggunakan layanan ini</li>
          <li>Informasi yang kamu berikan saat pendaftaran harus akurat dan lengkap</li>
          <li>Kamu bertanggung jawab menjaga kerahasiaan password akun</li>
          <li>Satu akun hanya boleh digunakan oleh satu entitas bisnis</li>
          <li>Kami berhak menonaktifkan akun yang terbukti memberikan informasi palsu</li>
        </ul>

        <h2>3. Paket & Pembayaran</h2>

        <h3>3.1 Paket Langganan</h3>
        <p>Mahirusaha menawarkan beberapa paket langganan:</p>
        <ul>
          <li><strong style={{ color: '#fff' }}>Trial</strong> — 100 pesan gratis, tanpa batas waktu</li>
          <li><strong style={{ color: '#fff' }}>Starter</strong> — Rp 99.000/bulan, 1 toko, 1.000 pesan/bulan</li>
          <li><strong style={{ color: '#fff' }}>Pro</strong> — Rp 299.000/bulan, 3 toko, 5.000 pesan/bulan</li>
          <li><strong style={{ color: '#fff' }}>Bisnis</strong> — Rp 599.000/bulan, 10 toko, 20.000 pesan/bulan</li>
          <li><strong style={{ color: '#fff' }}>Enterprise</strong> — harga custom, hubungi tim kami</li>
        </ul>

        <h3>3.2 Pembayaran</h3>
        <ul>
          <li>Pembayaran diproses melalui Midtrans dan mendukung transfer bank, QRIS, kartu kredit, dan e-wallet</li>
          <li>Langganan bersifat prabayar — layanan aktif setelah pembayaran berhasil dikonfirmasi</li>
          <li>Harga dapat berubah sewaktu-waktu dengan pemberitahuan minimal 30 hari sebelumnya</li>
          <li>Diskon 20% tersedia untuk pembayaran tahunan</li>
        </ul>

        <h3>3.3 Perpanjangan & Penangguhan</h3>
        <ul>
          <li>Langganan tidak diperpanjang otomatis — klien harus melakukan pembayaran manual setiap periode</li>
          <li>Akun akan ditangguhkan otomatis jika pembayaran tidak dilakukan setelah masa aktif berakhir</li>
          <li>Data tetap tersimpan selama 90 hari setelah penangguhan sebelum dihapus permanen</li>
          <li>Klien dapat mengaktifkan kembali akun kapan saja dengan melakukan pembayaran</li>
        </ul>

        <h3>3.4 Refund</h3>
        <p>
          Kami tidak menyediakan refund untuk pembayaran yang sudah dilakukan, kecuali terjadi kesalahan teknis dari pihak Mahirusaha yang menyebabkan layanan tidak dapat digunakan. Pengajuan refund dapat dilakukan melalui <a href="mailto:hello@mahirusaha.com">hello@mahirusaha.com</a> dalam 7 hari setelah pembayaran.
        </p>

        <h2>4. Penggunaan Layanan yang Diizinkan</h2>
        <p>Layanan Mahirusaha boleh digunakan untuk:</p>
        <ul>
          <li>Menjawab pertanyaan pelanggan secara otomatis</li>
          <li>Memberikan informasi produk dan layanan bisnis</li>
          <li>Mengirim broadcast promo kepada pelanggan yang telah berinteraksi dengan bot</li>
          <li>Mengelola komunikasi bisnis via WhatsApp</li>
        </ul>

        <h2>5. Larangan Penggunaan</h2>
        <p>Kamu dilarang menggunakan layanan Mahirusaha untuk:</p>
        <ul>
          <li>Mengirim pesan spam atau konten yang tidak diminta secara massal</li>
          <li>Menyebarkan informasi palsu, menyesatkan, atau penipuan</li>
          <li>Melanggar hak kekayaan intelektual pihak lain</li>
          <li>Menyebarkan konten yang mengandung SARA, pornografi, atau kekerasan</li>
          <li>Melakukan aktivitas ilegal berdasarkan hukum Indonesia</li>
          <li>Menggunakan bot untuk harassing atau mengancam pengguna lain</li>
          <li>Melakukan reverse engineering atau mengeksploitasi kelemahan sistem</li>
          <li>Menjual kembali akses layanan tanpa izin tertulis dari Mahirusaha</li>
        </ul>
        <p>
          Pelanggaran terhadap ketentuan ini dapat mengakibatkan penangguhan atau penghapusan akun secara permanen tanpa pengembalian dana.
        </p>

        <h2>6. Kuota & Batasan Layanan</h2>
        <ul>
          <li>Setiap paket memiliki batas pesan bulanan sesuai ketentuan paket yang dipilih</li>
          <li>Bot akan berhenti menjawab secara otomatis ketika kuota pesan habis</li>
          <li>Kuota direset setiap tanggal 1 setiap bulannya</li>
          <li>Penggunaan melebihi kuota tidak akan dikenakan biaya tambahan — bot hanya berhenti sampai kuota direset atau klien upgrade paket</li>
        </ul>

        <h2>7. Ketersediaan Layanan</h2>
        <p>
          Kami berupaya menjaga ketersediaan layanan sebaik mungkin. Namun kami tidak menjamin layanan tersedia 100% tanpa gangguan. Pemeliharaan terjadwal akan diberitahukan minimal 24 jam sebelumnya. Kami tidak bertanggung jawab atas kerugian yang disebabkan oleh gangguan layanan yang di luar kendali kami, termasuk gangguan dari pihak Meta/WhatsApp.
        </p>

        <h2>8. Kepemilikan Data</h2>
        <ul>
          <li>Data bisnis yang kamu input (produk, info toko, dll) adalah milik kamu sepenuhnya</li>
          <li>Data percakapan pelanggan yang melalui bot kamu juga menjadi hak kamu</li>
          <li>Kami tidak mengklaim kepemilikan atas konten yang kamu buat atau upload</li>
          <li>Kamu memberikan lisensi kepada kami untuk memproses data tersebut guna menjalankan layanan</li>
        </ul>

        <h2>9. Batasan Tanggung Jawab</h2>
        <p>
          Mahirusaha tidak bertanggung jawab atas:
        </p>
        <ul>
          <li>Kerugian bisnis yang timbul akibat gangguan layanan</li>
          <li>Konten yang dikirim bot berdasarkan data yang kamu input</li>
          <li>Perubahan kebijakan dari Meta/WhatsApp yang mempengaruhi layanan</li>
          <li>Kerugian tidak langsung, insidental, atau konsekuensial</li>
        </ul>
        <p>
          Tanggung jawab maksimal Mahirusaha kepada klien tidak melebihi jumlah yang telah dibayarkan klien dalam 1 bulan terakhir.
        </p>

        <h2>10. Perubahan Layanan</h2>
        <p>
          Kami berhak mengubah, menambah, atau menghentikan fitur layanan kapan saja. Perubahan signifikan akan diberitahukan melalui email atau notifikasi di dashboard minimal 14 hari sebelumnya.
        </p>

        <h2>11. Penghentian Layanan</h2>
        <p>
          Kamu dapat menghentikan langganan kapan saja dengan tidak memperpanjang pembayaran. Kami berhak menghentikan layanan kepada klien yang melanggar syarat dan ketentuan ini tanpa pemberitahuan sebelumnya.
        </p>

        <h2>12. Hukum yang Berlaku</h2>
        <p>
          Syarat dan Ketentuan ini diatur oleh hukum Republik Indonesia. Setiap sengketa yang timbul akan diselesaikan melalui musyawarah terlebih dahulu, dan jika tidak tercapai kesepakatan, akan diselesaikan melalui pengadilan yang berwenang di Indonesia.
        </p>

        <h2>13. Hubungi Kami</h2>
        <p>Jika ada pertanyaan tentang Syarat dan Ketentuan ini:</p>
        <ul>
          <li>Email: <a href="mailto:hello@mahirusaha.com">hello@mahirusaha.com</a></li>
          <li>Website: <a href="https://mahirusaha.com">mahirusaha.com</a></li>
        </ul>

        {/* Footer nav */}
        <div style={{ marginTop: '48px', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <a href="/privasi" style={{ fontSize: '0.85rem', color: '#25d366' }}>← Kebijakan Privasi</a>
          <a href="/" style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)' }}>Kembali ke Beranda →</a>
        </div>
      </div>
    </main>
  )
}
