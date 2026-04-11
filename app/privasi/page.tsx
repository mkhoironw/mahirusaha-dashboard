export default function Privasi() {
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
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '12px' }}>Kebijakan Privasi</h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.82rem' }}>
            Terakhir diperbarui: 11 April 2026
          </p>
          <div style={{ height: '2px', background: 'linear-gradient(90deg,#25d366,transparent)', marginTop: '20px' }} />
        </div>

        <p>
          Mahirusaha ("kami", "kita", atau "platform") berkomitmen untuk melindungi privasi pengguna. Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, menyimpan, dan melindungi informasi pribadi kamu ketika menggunakan layanan Mahirusaha di <a href="https://mahirusaha.com">mahirusaha.com</a>.
        </p>
        <p>
          Dengan mendaftar dan menggunakan layanan Mahirusaha, kamu menyetujui kebijakan privasi ini.
        </p>

        <h2>1. Informasi yang Kami Kumpulkan</h2>

        <h3>1.1 Informasi Akun</h3>
        <p>Saat kamu mendaftar, kami mengumpulkan:</p>
        <ul>
          <li>Nama lengkap pemilik bisnis</li>
          <li>Alamat email</li>
          <li>Nomor WhatsApp pemilik</li>
          <li>Password (disimpan dalam format terenkripsi)</li>
        </ul>

        <h3>1.2 Informasi Bisnis</h3>
        <p>Saat kamu mengisi data toko, kami mengumpulkan:</p>
        <ul>
          <li>Nama toko dan kategori bisnis</li>
          <li>Nomor WhatsApp toko yang digunakan untuk bot</li>
          <li>Deskripsi bisnis, jam operasional, lokasi</li>
          <li>Data produk dan layanan yang kamu input</li>
          <li>Foto produk yang kamu upload</li>
        </ul>

        <h3>1.3 Data Percakapan</h3>
        <p>
          Kami menyimpan riwayat percakapan antara bot WhatsApp kamu dan pelanggan kamu. Data ini digunakan untuk:
        </p>
        <ul>
          <li>Menampilkan riwayat chat di dashboard kamu</li>
          <li>Meningkatkan kualitas respons AI</li>
          <li>Keperluan analitik penggunaan platform</li>
        </ul>

        <h3>1.4 Data Pembayaran</h3>
        <p>
          Kami tidak menyimpan data kartu kredit atau informasi pembayaran secara langsung. Semua transaksi diproses oleh <strong style={{ color: '#fff' }}>Midtrans</strong> sebagai payment gateway pihak ketiga yang telah tersertifikasi PCI-DSS.
        </p>

        <h3>1.5 Data Teknis</h3>
        <ul>
          <li>Alamat IP dan informasi browser</li>
          <li>Waktu login dan aktivitas di platform</li>
          <li>Log error untuk keperluan debugging</li>
        </ul>

        <h2>2. Bagaimana Kami Menggunakan Informasi</h2>
        <p>Informasi yang kami kumpulkan digunakan untuk:</p>
        <ul>
          <li>Menyediakan dan menjalankan layanan chatbot WhatsApp kamu</li>
          <li>Memproses pembayaran dan mengelola langganan</li>
          <li>Mengirimkan notifikasi penting via WhatsApp (konfirmasi pembayaran, reminder perpanjangan)</li>
          <li>Meningkatkan fitur dan performa platform</li>
          <li>Memberikan dukungan teknis jika kamu menghubungi kami</li>
          <li>Mematuhi kewajiban hukum yang berlaku</li>
        </ul>

        <h2>3. Berbagi Informasi dengan Pihak Ketiga</h2>
        <p>Kami tidak menjual, menyewakan, atau memperdagangkan informasi pribadi kamu kepada pihak ketiga. Informasi hanya dibagikan kepada:</p>
        <ul>
          <li><strong style={{ color: '#fff' }}>Midtrans</strong> — untuk memproses pembayaran langganan</li>
          <li><strong style={{ color: '#fff' }}>Meta (WhatsApp Cloud API)</strong> — untuk mengirim dan menerima pesan WhatsApp</li>
          <li><strong style={{ color: '#fff' }}>Groq / OpenAI</strong> — untuk memproses pertanyaan pelanggan dengan AI (tanpa menyimpan data di server mereka)</li>
          <li><strong style={{ color: '#fff' }}>Supabase</strong> — sebagai penyedia database terenkripsi</li>
        </ul>
        <p>
          Semua pihak ketiga yang kami gunakan telah memenuhi standar keamanan data internasional.
        </p>

        <h2>4. Keamanan Data</h2>
        <p>Kami menerapkan langkah-langkah keamanan berikut untuk melindungi data kamu:</p>
        <ul>
          <li>Enkripsi data saat transit menggunakan HTTPS/TLS</li>
          <li>Password disimpan dalam format hash yang tidak dapat dibaca</li>
          <li>Akses database dibatasi hanya untuk sistem yang berwenang</li>
          <li>Monitoring keamanan secara berkala</li>
          <li>Backup data otomatis setiap hari</li>
        </ul>

        <h2>5. Penyimpanan Data</h2>
        <p>
          Data kamu disimpan di server Supabase yang berlokasi di wilayah Asia Pasifik. Kami menyimpan data selama akun kamu aktif dan hingga 90 hari setelah akun dihapus, kecuali diwajibkan oleh hukum untuk menyimpan lebih lama.
        </p>

        <h2>6. Hak Pengguna</h2>
        <p>Kamu memiliki hak untuk:</p>
        <ul>
          <li><strong style={{ color: '#fff' }}>Mengakses</strong> — melihat data pribadi yang kami simpan tentang kamu</li>
          <li><strong style={{ color: '#fff' }}>Memperbarui</strong> — mengubah informasi akun melalui dashboard</li>
          <li><strong style={{ color: '#fff' }}>Menghapus</strong> — meminta penghapusan akun dan semua data terkait</li>
          <li><strong style={{ color: '#fff' }}>Ekspor</strong> — meminta salinan data kamu dalam format yang dapat dibaca</li>
        </ul>
        <p>
          Untuk menggunakan hak-hak di atas, hubungi kami di <a href="mailto:hello@mahirusaha.com">hello@mahirusaha.com</a>
        </p>

        <h2>7. Cookie</h2>
        <p>
          Mahirusaha menggunakan localStorage browser untuk menyimpan sesi login kamu secara lokal. Kami tidak menggunakan cookie pihak ketiga untuk keperluan iklan atau tracking.
        </p>

        <h2>8. Perubahan Kebijakan</h2>
        <p>
          Kami dapat memperbarui Kebijakan Privasi ini sewaktu-waktu. Perubahan signifikan akan diberitahukan melalui email atau notifikasi di dashboard. Penggunaan layanan setelah perubahan dianggap sebagai persetujuan terhadap kebijakan yang diperbarui.
        </p>

        <h2>9. Hubungi Kami</h2>
        <p>Jika ada pertanyaan tentang Kebijakan Privasi ini, hubungi kami:</p>
        <ul>
          <li>Email: <a href="mailto:hello@mahirusaha.com">hello@mahirusaha.com</a></li>
          <li>Website: <a href="https://mahirusaha.com">mahirusaha.com</a></li>
        </ul>

        {/* Back to top */}
        <div style={{ marginTop: '48px', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <a href="/" style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)' }}>← Kembali ke Beranda</a>
          <a href="/syarat" style={{ fontSize: '0.85rem', color: '#25d366' }}>Syarat Layanan →</a>
        </div>
      </div>
    </main>
  )
}
