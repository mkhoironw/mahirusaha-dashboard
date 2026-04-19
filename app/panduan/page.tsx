export default function Panduan() {
  return (
    <main style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: '#070d1a', color: '#fff', minHeight: '100vh' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        h2 { font-size: 1.1rem; font-weight: 700; margin: 32px 0 12px; color: #25d366; }
        h3 { font-size: 0.95rem; font-weight: 600; margin: 20px 0 8px; color: rgba(255,255,255,0.9); }
        p { font-size: 0.875rem; color: rgba(255,255,255,0.6); line-height: 1.8; margin-bottom: 12px; }
        ul { padding-left: 20px; margin-bottom: 12px; }
        ul li { font-size: 0.875rem; color: rgba(255,255,255,0.6); line-height: 1.8; margin-bottom: 6px; }
        a { color: #25d366; text-decoration: none; }
        a:hover { text-decoration: underline; }
        .step-box { background: rgba(37,211,102,0.05); border: 1px solid rgba(37,211,102,0.15); border-radius: 14px; padding: 20px 24px; margin-bottom: 16px; }
        .info-box { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 20px 24px; margin-bottom: 16px; }
        .warning-box { background: rgba(239,159,39,0.08); border: 1px solid rgba(239,159,39,0.2); border-radius: 14px; padding: 16px 20px; margin-bottom: 16px; }
        .faq-item { border-bottom: 1px solid rgba(255,255,255,0.06); padding: 16px 0; }
      `}</style>

      {/* Nav */}
      <nav style={{ padding: '0 5%', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: '#fff' }}>
          <div style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg,#25d366,#128c7e)', borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px' }}>💬</div>
          <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>Mahirusaha</span>
        </a>
        <div style={{ display: 'flex', gap: '12px' }}>
          <a href="/" style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>← Beranda</a>
          <a href="/daftar" style={{ background: 'linear-gradient(135deg,#25d366,#128c7e)', color: '#fff', padding: '8px 16px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700, textDecoration: 'none' }}>Daftar Gratis</a>
        </div>
      </nav>

      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '48px 24px 80px' }}>

        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{ display: 'inline-block', background: 'rgba(37,211,102,0.1)', border: '1px solid rgba(37,211,102,0.2)', borderRadius: '100px', padding: '5px 14px', marginBottom: '16px', color: '#25d366', fontSize: '0.78rem', fontWeight: 700 }}>
            PANDUAN LENGKAP
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '12px', letterSpacing: '-0.5px' }}>
            Panduan Penggunaan Mahirusaha
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.95rem', lineHeight: 1.7 }}>
            Semua yang perlu kamu ketahui untuk memulai — dari pendaftaran hingga bot WhatsApp aktif melayani pelanggan.
          </p>
          <div style={{ height: '2px', background: 'linear-gradient(90deg,#25d366,transparent)', marginTop: '20px' }} />
        </div>

        {/* Daftar Isi */}
        <div className="info-box" style={{ marginBottom: '32px' }}>
          <p style={{ fontWeight: 700, color: '#fff', marginBottom: '12px', fontSize: '0.875rem' }}>📋 Daftar Isi</p>
          {[
            ['1', 'Apa itu Mahirusaha?', '#apa-itu'],
            ['2', 'Yang Perlu Disiapkan', '#persiapan'],
            ['3', 'Langkah Pendaftaran', '#pendaftaran'],
            ['4', 'Proses Aktivasi Bot WhatsApp', '#aktivasi'],
            ['5', 'Mengelola Toko & Produk', '#kelola'],
            ['6', 'Toko Online Gratis', '#toko-online'],
            ['7', 'FAQ', '#faq'],
            ['8', 'Kontak Bantuan', '#kontak'],
          ].map(([num, label, href]) => (
            <div key={href} style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
              <span style={{ color: '#25d366', fontWeight: 700, fontSize: '0.82rem', minWidth: '20px' }}>{num}.</span>
              <a href={href} style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)' }}>{label}</a>
            </div>
          ))}
        </div>

        {/* 1. Apa itu Mahirusaha */}
        <div id="apa-itu">
          <h2>1. Apa itu Mahirusaha?</h2>
          <p>
            Mahirusaha adalah platform digital all-in-one untuk UMKM Indonesia yang menyediakan:
          </p>
          <ul>
            <li><strong style={{ color: '#fff' }}>🤖 AI Chatbot WhatsApp 24 Jam</strong> — Bot menjawab pertanyaan pelanggan otomatis kapan saja, bahkan saat kamu tidur</li>
            <li><strong style={{ color: '#fff' }}>🛍️ Toko Online Gratis</strong> — Setiap toko mendapat halaman toko online cantik dengan subdomain gratis (mahirusaha.com/namatoko)</li>
            <li><strong style={{ color: '#fff' }}>📊 Dashboard Lengkap</strong> — Kelola produk, lihat percakapan, broadcast promo, dan pantau analytics dari satu tempat</li>
          </ul>
          <p>
            Tersedia mulai dari <strong style={{ color: '#25d366' }}>Rp 99.000/bulan</strong> dengan trial gratis 100 pesan untuk semua akun baru.
          </p>
        </div>

        {/* 2. Persiapan */}
        <div id="persiapan">
          <h2>2. Yang Perlu Disiapkan</h2>

          <h3>2.1 Akun & Data Toko</h3>
          <ul>
            <li>Alamat email aktif</li>
            <li>Nama lengkap pemilik bisnis</li>
            <li>Nama toko / bisnis</li>
            <li>Nomor WhatsApp pribadi (untuk notifikasi)</li>
            <li>Info toko: kategori, lokasi, jam buka, metode pembayaran</li>
            <li>Foto dan deskripsi produk (bisa dilengkapi nanti)</li>
          </ul>

          <h3>2.2 Nomor WhatsApp untuk Bot ⚠️</h3>
          <div className="warning-box">
            <p style={{ fontWeight: 700, color: '#EF9F27', marginBottom: '6px' }}>⚠️ Penting — Baca sebelum daftar!</p>
            <p style={{ marginBottom: '0' }}>
              Bot WhatsApp membutuhkan <strong style={{ color: '#fff' }}>nomor WA tersendiri yang terpisah dari nomor pribadimu</strong>.
              Satu nomor tidak bisa dipakai sebagai bot WA sekaligus WA biasa.
            </p>
          </div>

          <p><strong style={{ color: '#fff' }}>Pilihan nomor untuk bot:</strong></p>
          <ul>
            <li>⭐ <strong style={{ color: '#fff' }}>Beli SIM card baru</strong> — Paling disarankan. Beli Telkomsel/Indosat baru ~Rp 10.000-35.000 di Alfamart/Indomaret. Jangan install WhatsApp!</li>
            <li>✅ <strong style={{ color: '#fff' }}>Nomor lama tidak terpakai</strong> — Boleh, asalkan WhatsApp sudah dihapus dari nomor tersebut</li>
            <li>❌ <strong style={{ color: '#fff' }}>Nomor aktif saat ini</strong> — Tidak disarankan karena nomor tidak bisa dipakai WA biasa lagi</li>
          </ul>

          <div className="info-box">
            <p style={{ fontWeight: 700, color: '#fff', marginBottom: '6px' }}>💡 Tips memilih operator</p>
            <p style={{ marginBottom: '0' }}>Kami rekomendasikan <strong style={{ color: '#25d366' }}>Telkomsel</strong> (Simpati/AS/Loop) karena jaringan paling luas dan stabil di seluruh Indonesia.</p>
          </div>
        </div>

        {/* 3. Langkah Pendaftaran */}
        <div id="pendaftaran">
          <h2>3. Langkah Pendaftaran</h2>

          <div className="step-box">
            <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg,#25d366,#128c7e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem', flexShrink: 0 }}>1</div>
              <div>
                <p style={{ fontWeight: 700, color: '#fff', marginBottom: '6px' }}>Buka mahirusaha.com dan klik "Mulai Gratis"</p>
                <p style={{ marginBottom: 0 }}>Kamu akan diarahkan ke halaman pendaftaran. Tidak perlu kartu kredit.</p>
              </div>
            </div>
          </div>

          <div className="step-box">
            <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg,#25d366,#128c7e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem', flexShrink: 0 }}>2</div>
              <div>
                <p style={{ fontWeight: 700, color: '#fff', marginBottom: '6px' }}>Isi data akun (Step 1)</p>
                <ul style={{ marginBottom: 0 }}>
                  <li>Nama lengkap pemilik</li>
                  <li>Email dan password</li>
                  <li>Nomor WhatsApp pribadi</li>
                  <li>Kode referral (jika ada) — dapat diskon 10%!</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="step-box">
            <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg,#25d366,#128c7e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem', flexShrink: 0 }}>3</div>
              <div>
                <p style={{ fontWeight: 700, color: '#fff', marginBottom: '6px' }}>Isi info toko (Step 2)</p>
                <ul style={{ marginBottom: 0 }}>
                  <li>Nama toko dan kategori bisnis</li>
                  <li>Link toko online (contoh: warung-bu-sari → mahirusaha.com/warung-bu-sari)</li>
                  <li>Jam buka, lokasi, metode pembayaran</li>
                  <li>Deskripsi bisnis untuk bot</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="step-box">
            <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg,#25d366,#128c7e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem', flexShrink: 0 }}>4</div>
              <div>
                <p style={{ fontWeight: 700, color: '#fff', marginBottom: '6px' }}>Akun & toko online langsung aktif!</p>
                <p style={{ marginBottom: 0 }}>Setelah daftar, kamu langsung dapat <strong style={{ color: '#25d366' }}>100 pesan gratis</strong> dan toko online sudah bisa diakses. Lanjutkan dengan tambah produk di dashboard.</p>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Aktivasi Bot */}
        <div id="aktivasi">
          <h2>4. Proses Aktivasi Bot WhatsApp</h2>
          <p>
            Setelah daftar dan memilih paket berbayar, bot WhatsApp perlu diaktifkan oleh tim kami. Proses ini membutuhkan waktu <strong style={{ color: '#25d366' }}>maksimal 24 jam</strong> di jam kerja.
          </p>

          <div className="step-box">
            <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg,#25d366,#128c7e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem', flexShrink: 0 }}>1</div>
              <div>
                <p style={{ fontWeight: 700, color: '#fff', marginBottom: '6px' }}>Pilih paket dan bayar</p>
                <p style={{ marginBottom: 0 }}>Di dashboard → menu Langganan → pilih paket → bayar via Midtrans (transfer bank, QRIS, GoPay, dll)</p>
              </div>
            </div>
          </div>

          <div className="step-box">
            <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg,#25d366,#128c7e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem', flexShrink: 0 }}>2</div>
              <div>
                <p style={{ fontWeight: 700, color: '#fff', marginBottom: '6px' }}>Kirim data ke tim Mahirusaha via WhatsApp</p>
                <p style={{ marginBottom: '8px' }}>Kirim pesan ke <a href="https://wa.me/628132531210">+62 813-2531-210</a>:</p>
                <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '10px', padding: '12px 16px', fontFamily: 'monospace', fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.8 }}>
                  Halo Mahirusaha, saya ingin aktivasi bot.<br/>
                  Nama toko: [nama toko kamu]<br/>
                  Email akun: [email yang didaftarkan]<br/>
                  Nomor WA bot: [nomor WA baru untuk bot]
                </div>
              </div>
            </div>
          </div>

          <div className="step-box">
            <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg,#25d366,#128c7e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem', flexShrink: 0 }}>3</div>
              <div>
                <p style={{ fontWeight: 700, color: '#fff', marginBottom: '6px' }}>Terima & balas kode OTP</p>
                <p style={{ marginBottom: 0 }}>Tim kami akan proses pendaftaran nomor kamu ke WhatsApp. Kamu akan menerima <strong style={{ color: '#fff' }}>SMS kode OTP</strong> di nomor bot — segera kirim kode tersebut ke WhatsApp kami. OTP berlaku hanya 10 menit!</p>
              </div>
            </div>
          </div>

          <div className="step-box">
            <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg,#25d366,#128c7e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem', flexShrink: 0 }}>4</div>
              <div>
                <p style={{ fontWeight: 700, color: '#fff', marginBottom: '6px' }}>Bot aktif! 🎉</p>
                <p style={{ marginBottom: 0 }}>Tim kami akan kirim konfirmasi via WhatsApp. Coba test dengan kirim pesan "Halo" ke nomor bot kamu — bot langsung menjawab otomatis!</p>
              </div>
            </div>
          </div>

          <div className="warning-box">
            <p style={{ fontWeight: 700, color: '#EF9F27', marginBottom: '6px' }}>⏰ Jam Operasional Tim</p>
            <p style={{ marginBottom: 0 }}>Senin - Sabtu: 08.00 - 21.00 WIB · Minggu: 09.00 - 17.00 WIB<br/>
            Permintaan di luar jam operasional akan diproses keesokan harinya.</p>
          </div>
        </div>

        {/* 5. Kelola Toko */}
        <div id="kelola">
          <h2>5. Mengelola Toko & Produk</h2>

          <h3>5.1 Tambah Produk</h3>
          <p>Dashboard → menu <strong style={{ color: '#fff' }}>Produk</strong> → klik "Tambah Produk" → isi nama, harga, deskripsi, foto → simpan. Bot langsung bisa menjelaskan produk ke pelanggan!</p>

          <h3>5.2 Edit Info Toko</h3>
          <p>Dashboard → menu <strong style={{ color: '#fff' }}>Pengaturan Toko</strong> → ada 3 tab: Info Toko, Operasional, Kustomisasi Bot. Lengkapi semua agar bot lebih pintar menjawab.</p>

          <h3>5.3 Pantau Percakapan</h3>
          <p>Dashboard → menu <strong style={{ color: '#fff' }}>Percakapan</strong> → lihat semua pesan masuk dan balasan bot. Kamu bisa ambil alih percakapan kapan saja via fitur Human Takeover.</p>

          <h3>5.4 Broadcast Promo (Paket Pro+)</h3>
          <p>Dashboard → menu <strong style={{ color: '#fff' }}>Broadcast</strong> → tulis pesan promo → pilih delay → kirim ke semua kontak yang pernah chat dengan bot.</p>
        </div>

        {/* 6. Toko Online */}
        <div id="toko-online">
          <h2>6. Toko Online Gratis</h2>
          <p>
            Setiap toko Mahirusaha mendapat halaman toko online gratis yang bisa langsung dishare ke pelanggan.
          </p>

          <div className="info-box">
            <p style={{ fontWeight: 700, color: '#25d366', marginBottom: '8px' }}>🛍️ Link toko kamu:</p>
            <p style={{ fontFamily: 'monospace', fontSize: '1rem', color: '#fff', marginBottom: '0' }}>mahirusaha.com/<span style={{ color: '#25d366' }}>nama-toko-kamu</span></p>
          </div>

          <p><strong style={{ color: '#fff' }}>Yang tampil di toko online:</strong></p>
          <ul>
            <li>Nama toko, kategori, lokasi</li>
            <li>Jam buka dan metode pembayaran</li>
            <li>Semua produk dengan foto, harga, dan stok</li>
            <li>Tombol "Pesan via WhatsApp" untuk setiap produk</li>
          </ul>

          <p><strong style={{ color: '#fff' }}>Cara ubah link toko:</strong><br/>
          Dashboard → Pengaturan Toko → tab Info Toko → field "Link Toko Online" → ubah slug → simpan.</p>

          <p><strong style={{ color: '#fff' }}>Cara share toko online:</strong><br/>
          Dashboard → Overview → card "Link Toko Online Kamu" → klik "Salin" atau "Share WA".</p>
        </div>

        {/* 7. FAQ */}
        <div id="faq">
          <h2>7. FAQ — Pertanyaan yang Sering Ditanyakan</h2>

          {[
            {
              q: 'Apakah saya bisa mencoba sebelum bayar?',
              a: 'Ya! Semua akun baru mendapat 100 pesan gratis tanpa batas waktu. Cukup daftar dan bot langsung aktif dalam mode trial.'
            },
            {
              q: 'Berapa lama bot aktif setelah saya daftar dan bayar?',
              a: 'Maksimal 24 jam di jam kerja (Senin-Sabtu 08.00-21.00 WIB). Biasanya proses selesai dalam 1-2 jam setelah kamu mengirim data dan OTP ke tim kami.'
            },
            {
              q: 'Apakah nomor WA saya bisa dipakai biasa setelah jadi bot?',
              a: 'Tidak. Nomor yang sudah didaftarkan sebagai bot tidak bisa dipakai WhatsApp biasa secara bersamaan. Itulah kenapa kami sarankan pakai nomor baru/terpisah.'
            },
            {
              q: 'Operator apa yang paling disarankan untuk nomor bot?',
              a: 'Telkomsel (Simpati/AS) — jaringan paling luas dan stabil di seluruh Indonesia. Harga SIM card sekitar Rp 10.000-35.000 di Alfamart/Indomaret.'
            },
            {
              q: 'Apakah bot bisa menjawab dalam bahasa daerah?',
              a: 'Bot bisa menjawab dalam bahasa Indonesia dan bahasa Inggris. Untuk bahasa daerah, kamu bisa tambahkan instruksi khusus di Pengaturan Toko → Kustomisasi Bot.'
            },
            {
              q: 'Bagaimana cara bot tahu tentang produk saya?',
              a: 'Bot membaca data dari toko kamu secara otomatis — nama produk, harga, deskripsi, jam buka, metode pembayaran, dll. Semakin lengkap info yang kamu isi, semakin pintar bot menjawab.'
            },
            {
              q: 'Apakah bot bisa menerima pesanan dan proses pembayaran?',
              a: 'Saat ini bot mengarahkan pelanggan ke WhatsApp untuk pesan dan konfirmasi pembayaran. Fitur order dan payment otomatis sedang dalam pengembangan.'
            },
            {
              q: 'Bisakah saya ganti paket kapan saja?',
              a: 'Ya! Kamu bisa upgrade paket kapan saja dari dashboard → menu Langganan. Downgrade bisa dilakukan saat perpanjangan.'
            },
            {
              q: 'Apakah ada kontrak atau lock-in?',
              a: 'Tidak ada! Semua paket berbasis bulanan dan bisa cancel kapan saja dengan tidak memperpanjang. Data kamu tersimpan selama 90 hari setelah akun tidak aktif.'
            },
            {
              q: 'Bagaimana jika bot tidak bisa jawab pertanyaan pelanggan?',
              a: 'Bot akan mengarahkan pelanggan ke nomor admin yang kamu daftarkan. Kamu juga bisa ambil alih percakapan secara manual via fitur Human Takeover di dashboard.'
            },
            {
              q: 'Apakah ada refund jika tidak puas?',
              a: 'Kami tidak menyediakan refund untuk pembayaran yang sudah dilakukan. Itulah kenapa kami menyediakan trial 100 pesan gratis agar kamu bisa mencoba dulu sebelum bayar.'
            },
            {
              q: 'Paket Pro dapat 3 toko — apakah masing-masing butuh nomor WA berbeda?',
              a: 'Ya. Setiap toko butuh nomor WhatsApp tersendiri. Untuk 3 toko berarti butuh 3 SIM card berbeda (~Rp 35rb per SIM card).'
            },
          ].map((item, i) => (
            <div key={i} className="faq-item">
              <p style={{ fontWeight: 700, color: '#fff', marginBottom: '8px', fontSize: '0.875rem' }}>
                ❓ {item.q}
              </p>
              <p style={{ marginBottom: 0, color: 'rgba(255,255,255,0.6)' }}>
                {item.a}
              </p>
            </div>
          ))}
        </div>

        {/* 8. Kontak */}
        <div id="kontak">
          <h2>8. Kontak Bantuan</h2>
          <p>Butuh bantuan? Tim kami siap membantu kamu!</p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
            <div className="info-box" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>💬</div>
              <p style={{ fontWeight: 700, color: '#fff', marginBottom: '4px' }}>WhatsApp</p>
              <a href="https://wa.me/628132531210" target="_blank" rel="noopener noreferrer" style={{ color: '#25d366', fontSize: '0.875rem' }}>+62 813-2531-210</a>
              <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: '4px', marginBottom: 0 }}>Senin-Sabtu 08.00-21.00 WIB</p>
            </div>
            <div className="info-box" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📧</div>
              <p style={{ fontWeight: 700, color: '#fff', marginBottom: '4px' }}>Email</p>
              <a href="mailto:hello@mahirusaha.com" style={{ color: '#25d366', fontSize: '0.875rem' }}>hello@mahirusaha.com</a>
              <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: '4px', marginBottom: 0 }}>Dibalas dalam 24 jam kerja</p>
            </div>
          </div>

          {/* CTA */}
          <div style={{ background: 'linear-gradient(135deg,rgba(37,211,102,0.1),rgba(18,140,126,0.1))', border: '1px solid rgba(37,211,102,0.2)', borderRadius: '16px', padding: '28px', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '12px' }}>🚀</div>
            <h3 style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '8px', color: '#fff' }}>Siap mulai?</h3>
            <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '20px' }}>Daftar sekarang dan dapatkan 100 pesan gratis!</p>
            <a href="/daftar" style={{ display: 'inline-block', background: 'linear-gradient(135deg,#25d366,#128c7e)', color: '#fff', padding: '13px 28px', borderRadius: '12px', textDecoration: 'none', fontWeight: 700, fontSize: '0.95rem' }}>
              Mulai Gratis Sekarang →
            </a>
          </div>
        </div>

        {/* Footer nav */}
        <div style={{ marginTop: '48px', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <a href="/" style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)' }}>← Kembali ke Beranda</a>
          <div style={{ display: 'flex', gap: '20px' }}>
            <a href="/privasi" style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)' }}>Privasi</a>
            <a href="/syarat" style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)' }}>Syarat Layanan</a>
          </div>
        </div>
      </div>
    </main>
  )
}
