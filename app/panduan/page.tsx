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
        .success-box { background: rgba(37,211,102,0.08); border: 1px solid rgba(37,211,102,0.2); border-radius: 14px; padding: 16px 20px; margin-bottom: 16px; }
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
            Semua yang perlu kamu ketahui — dari pendaftaran hingga bot WhatsApp aktif melayani pelanggan 24 jam.
          </p>
          <div style={{ height: '2px', background: 'linear-gradient(90deg,#25d366,transparent)', marginTop: '20px' }} />
        </div>

        {/* Alur Lengkap */}
        <div className="success-box" style={{ marginBottom: '32px' }}>
          <p style={{ fontWeight: 700, color: '#25d366', marginBottom: '12px', fontSize: '0.875rem' }}>🚀 Alur Lengkap Mahirusaha</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              '1️⃣ Daftar akun gratis di mahirusaha.com',
              '2️⃣ Lengkapi data toko dan tambah produk',
              '3️⃣ Siapkan SIM card baru untuk bot WhatsApp',
              '4️⃣ Kirim nomor WA ke tim kami → bot diaktifkan (maks 24 jam)',
              '5️⃣ Bot aktif → 100 pesan gratis mulai berjalan',
              '6️⃣ Kuota 100 pesan habis → pilih paket & bayar → bot terus aktif!',
            ].map((step, i) => (
              <div key={i} style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.7)', display: 'flex', gap: '8px' }}>
                <span>{step}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '12px', padding: '10px 14px', background: 'rgba(37,211,102,0.1)', borderRadius: '8px' }}>
            <p style={{ fontSize: '0.78rem', color: '#25d366', fontWeight: 700, marginBottom: 0 }}>
              💡 Tidak perlu bayar dulu! Bayar baru dilakukan setelah 100 pesan gratis habis.
            </p>
          </div>
        </div>

        {/* Daftar Isi */}
        <div className="info-box" style={{ marginBottom: '32px' }}>
          <p style={{ fontWeight: 700, color: '#fff', marginBottom: '12px', fontSize: '0.875rem' }}>📋 Daftar Isi</p>
          {[
            ['1', 'Apa itu Mahirusaha?', '#apa-itu'],
            ['2', 'Yang Perlu Disiapkan', '#persiapan'],
            ['3', 'Langkah Pendaftaran', '#pendaftaran'],
            ['4', 'Aktivasi Bot WhatsApp', '#aktivasi'],
            ['5', 'Trial 100 Pesan Gratis', '#trial'],
            ['6', 'Pilih Paket & Bayar', '#bayar'],
            ['7', 'Mengelola Toko & Produk', '#kelola'],
            ['8', 'Toko Online Gratis', '#toko-online'],
            ['9', 'FAQ', '#faq'],
            ['10', 'Kontak Bantuan', '#kontak'],
          ].map(([num, label, href]) => (
            <div key={href} style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
              <span style={{ color: '#25d366', fontWeight: 700, fontSize: '0.82rem', minWidth: '24px' }}>{num}.</span>
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
            Tersedia mulai dari <strong style={{ color: '#25d366' }}>Rp 99.000/bulan</strong> dengan <strong style={{ color: '#25d366' }}>trial gratis 100 pesan</strong> untuk semua akun baru — tidak perlu kartu kredit, tidak perlu bayar dulu!
          </p>
        </div>

        {/* 2. Persiapan */}
        <div id="persiapan">
          <h2>2. Yang Perlu Disiapkan</h2>

          <h3>2.1 Data untuk Pendaftaran</h3>
          <ul>
            <li>Alamat email aktif</li>
            <li>Nama lengkap pemilik bisnis</li>
            <li>Nomor WhatsApp pribadi (untuk notifikasi dari Mahirusaha)</li>
            <li>Nama toko dan kategori bisnis</li>
            <li>Info toko: lokasi, jam buka, metode pembayaran (bisa dilengkapi nanti)</li>
            <li>Foto dan deskripsi produk (bisa ditambahkan setelah daftar)</li>
          </ul>

          <h3>2.2 Nomor WhatsApp Khusus untuk Bot ⚠️</h3>
          <div className="warning-box">
            <p style={{ fontWeight: 700, color: '#EF9F27', marginBottom: '8px' }}>⚠️ Penting — Baca sebelum aktivasi bot!</p>
            <p style={{ marginBottom: '8px' }}>
              Bot WhatsApp membutuhkan <strong style={{ color: '#fff' }}>nomor WA tersendiri yang terpisah dari nomor pribadimu</strong>.
            </p>
            <p style={{ marginBottom: 0, fontSize: '0.82rem' }}>
              Satu nomor WhatsApp tidak bisa dipakai sebagai bot sekaligus WA biasa di HP. Jika dipaksakan, bot akan berhenti bekerja.
            </p>
          </div>

          <p><strong style={{ color: '#fff' }}>Pilihan nomor untuk bot:</strong></p>
          <ul>
            <li>⭐ <strong style={{ color: '#fff' }}>Beli SIM card baru (paling disarankan)</strong> — Beli Telkomsel/Indosat baru ~Rp 10.000-35.000 di Alfamart/Indomaret. Jangan install WhatsApp!</li>
            <li>✅ <strong style={{ color: '#fff' }}>Nomor lama tidak terpakai</strong> — Boleh, asalkan WhatsApp sudah dihapus dari nomor tersebut</li>
            <li>❌ <strong style={{ color: '#fff' }}>Nomor aktif yang sedang dipakai WA</strong> — Tidak bisa, karena WA harus dihapus dari HP terlebih dahulu</li>
          </ul>

          <div className="info-box">
            <p style={{ fontWeight: 700, color: '#fff', marginBottom: '6px' }}>💡 Operator yang disarankan</p>
            <p style={{ marginBottom: 0 }}>Kami rekomendasikan <strong style={{ color: '#25d366' }}>Telkomsel</strong> (Simpati/AS/Loop) karena jaringan paling luas dan stabil di seluruh Indonesia. Harga SIM card ~Rp 10.000-35.000.</p>
          </div>
        </div>

        {/* 3. Pendaftaran */}
        <div id="pendaftaran">
          <h2>3. Langkah Pendaftaran</h2>
          <p>Pendaftaran gratis dan tidak butuh kartu kredit. Kamu bisa daftar dulu, baru bayar setelah trial habis.</p>

          <div className="step-box">
            <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg,#25d366,#128c7e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem', flexShrink: 0 }}>1</div>
              <div>
                <p style={{ fontWeight: 700, color: '#fff', marginBottom: '6px' }}>Buka mahirusaha.com → klik "Mulai Gratis"</p>
                <p style={{ marginBottom: 0 }}>Kamu akan diarahkan ke halaman pendaftaran 2 langkah.</p>
              </div>
            </div>
          </div>

          <div className="step-box">
            <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg,#25d366,#128c7e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem', flexShrink: 0 }}>2</div>
              <div>
                <p style={{ fontWeight: 700, color: '#fff', marginBottom: '6px' }}>Isi data akun (Langkah 1)</p>
                <ul style={{ marginBottom: 0 }}>
                  <li>Nama lengkap pemilik</li>
                  <li>Email dan password (minimal 8 karakter)</li>
                  <li>Nomor WhatsApp pribadi</li>
                  <li>Kode referral dari teman (opsional — dapat diskon 10%!)</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="step-box">
            <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg,#25d366,#128c7e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem', flexShrink: 0 }}>3</div>
              <div>
                <p style={{ fontWeight: 700, color: '#fff', marginBottom: '6px' }}>Isi data toko (Langkah 2)</p>
                <ul style={{ marginBottom: 0 }}>
                  <li>Nama toko dan kategori bisnis</li>
                  <li>Link toko online — pilih nama unik (contoh: warung-bu-sari → mahirusaha.com/warung-bu-sari)</li>
                  <li>Nomor WA toko (nomor bot yang sudah disiapkan)</li>
                  <li>Jam buka, lokasi, metode pembayaran (opsional, bisa dilengkapi nanti)</li>
                  <li>Deskripsi bisnis untuk bot (opsional)</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="step-box">
            <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg,#25d366,#128c7e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem', flexShrink: 0 }}>4</div>
              <div>
                <p style={{ fontWeight: 700, color: '#fff', marginBottom: '6px' }}>Akun & toko online langsung aktif! ✅</p>
                <p style={{ marginBottom: 0 }}>
                  Setelah daftar, dashboard dan toko online sudah bisa diakses. Tambahkan produk agar toko online langsung tampil cantik. Bot WA belum aktif — perlu proses aktivasi terlebih dahulu (lihat langkah 4).
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Aktivasi Bot */}
        <div id="aktivasi">
          <h2>4. Aktivasi Bot WhatsApp</h2>

          <div className="warning-box">
            <p style={{ fontWeight: 700, color: '#EF9F27', marginBottom: '6px' }}>⚠️ Perhatikan urutan ini!</p>
            <p style={{ marginBottom: 0 }}>
              Bot WhatsApp harus diaktifkan dulu oleh tim kami sebelum bisa menerima pesan. <strong style={{ color: '#fff' }}>Trial 100 pesan gratis baru mulai berjalan setelah bot aktif</strong> — bukan sejak daftar.
            </p>
          </div>

          <div className="step-box">
            <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg,#25d366,#128c7e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem', flexShrink: 0 }}>1</div>
              <div>
                <p style={{ fontWeight: 700, color: '#fff', marginBottom: '6px' }}>Siapkan SIM card baru untuk bot</p>
                <p style={{ marginBottom: 0 }}>Beli SIM card Telkomsel baru ~Rp 35rb. Aktifkan, pastikan bisa terima SMS. Jangan install WhatsApp di nomor ini!</p>
              </div>
            </div>
          </div>

          <div className="step-box">
            <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg,#25d366,#128c7e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem', flexShrink: 0 }}>2</div>
              <div>
                <p style={{ fontWeight: 700, color: '#fff', marginBottom: '8px' }}>Kirim data ke tim Mahirusaha via WhatsApp</p>
                <p style={{ marginBottom: '8px' }}>Kirim pesan ke <a href="https://wa.me/628132531210" target="_blank" rel="noopener noreferrer">+62 813-2531-210</a>:</p>
                <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '10px', padding: '12px 16px', fontFamily: 'monospace', fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.8 }}>
                  Halo Mahirusaha, saya ingin aktivasi bot.<br/>
                  Nama toko: [nama toko kamu]<br/>
                  Email akun: [email yang didaftarkan]<br/>
                  Nomor WA bot: [nomor SIM card baru]
                </div>
              </div>
            </div>
          </div>

          <div className="step-box">
            <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg,#25d366,#128c7e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem', flexShrink: 0 }}>3</div>
              <div>
                <p style={{ fontWeight: 700, color: '#fff', marginBottom: '6px' }}>Terima & balas kode OTP</p>
                <p style={{ marginBottom: 0 }}>Tim kami akan proses pendaftaran nomor. Kamu akan menerima <strong style={{ color: '#fff' }}>SMS kode OTP</strong> di nomor bot — segera kirim kode tersebut ke WhatsApp kami. <strong style={{ color: '#EF9F27' }}>OTP berlaku hanya 10 menit!</strong></p>
              </div>
            </div>
          </div>

          <div className="step-box">
            <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg,#25d366,#128c7e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem', flexShrink: 0 }}>4</div>
              <div>
                <p style={{ fontWeight: 700, color: '#fff', marginBottom: '6px' }}>Bot aktif — trial 100 pesan mulai berjalan! 🎉</p>
                <p style={{ marginBottom: 0 }}>Tim kami kirim konfirmasi via WhatsApp. Coba test dengan kirim pesan "Halo" ke nomor bot kamu dari HP lain — bot langsung menjawab!</p>
              </div>
            </div>
          </div>

          <div className="warning-box">
            <p style={{ fontWeight: 700, color: '#EF9F27', marginBottom: '6px' }}>⏰ Jam Operasional Tim</p>
            <p style={{ marginBottom: 0 }}>Senin - Sabtu: 08.00 - 21.00 WIB · Minggu: 09.00 - 17.00 WIB<br/>
            Permintaan di luar jam operasional akan diproses keesokan harinya.</p>
          </div>
        </div>

        {/* 5. Trial */}
        <div id="trial">
          <h2>5. Trial 100 Pesan Gratis</h2>

          <div className="success-box">
            <p style={{ fontWeight: 700, color: '#25d366', marginBottom: '8px' }}>✅ Yang perlu diketahui tentang trial:</p>
            <ul style={{ marginBottom: 0 }}>
              <li>Trial <strong style={{ color: '#fff' }}>dimulai setelah bot WhatsApp aktif</strong> — bukan sejak daftar</li>
              <li>100 pesan gratis = 100 percakapan dengan pelanggan via bot</li>
              <li><strong style={{ color: '#fff' }}>Tidak ada batas waktu</strong> — trial berlaku sampai 100 pesan habis</li>
              <li>Tidak perlu bayar apapun selama trial</li>
              <li>Toko online tetap bisa diakses selama trial</li>
            </ul>
          </div>

          <h3>Notifikasi selama trial:</h3>
          <ul>
            <li>⚠️ <strong style={{ color: '#fff' }}>Pesan ke-80:</strong> Bot akan mengirim notifikasi ke nomor WA pemilik bahwa kuota hampir habis</li>
            <li>🚨 <strong style={{ color: '#fff' }}>Pesan ke-95:</strong> Notifikasi urgent — segera pilih paket agar bot tidak berhenti</li>
            <li>🔴 <strong style={{ color: '#fff' }}>Pesan ke-100:</strong> Bot berhenti menjawab — perlu upgrade paket untuk melanjutkan</li>
          </ul>
        </div>

        {/* 6. Bayar */}
        <div id="bayar">
          <h2>6. Pilih Paket & Bayar</h2>
          <p>Setelah 100 pesan gratis habis, pilih paket yang sesuai untuk melanjutkan layanan bot.</p>

          <h3>Cara bayar:</h3>
          <ul>
            <li>Login ke dashboard → menu <strong style={{ color: '#fff' }}>Langganan</strong></li>
            <li>Pilih paket yang sesuai (Starter, Pro, atau Bisnis)</li>
            <li>Pilih periode (bulanan atau tahunan — hemat 25%)</li>
            <li>Bayar via Midtrans: transfer bank, QRIS, GoPay, OVO, dll</li>
            <li>Bot <strong style={{ color: '#fff' }}>langsung aktif kembali</strong> setelah pembayaran berhasil — otomatis tanpa perlu hubungi tim!</li>
          </ul>

          <div className="info-box">
            <p style={{ fontWeight: 700, color: '#fff', marginBottom: '8px' }}>💰 Perbandingan Paket</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                ['Starter', 'Rp 99.000/bln', '1 toko, 1.000 pesan/bulan, cocok untuk UMKM baru mulai'],
                ['Pro', 'Rp 299.000/bln', '3 toko, 5.000 pesan/bulan, + Broadcast & CRM'],
                ['Bisnis', 'Rp 699.000/bln', '10 toko, 20.000 pesan/bulan, + Analytics advanced'],
              ].map(([name, price, desc]) => (
                <div key={name} style={{ display: 'flex', gap: '12px', padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                  <div style={{ minWidth: '70px', fontWeight: 700, color: '#25d366', fontSize: '0.82rem' }}>{name}</div>
                  <div style={{ minWidth: '110px', fontWeight: 600, color: '#fff', fontSize: '0.82rem' }}>{price}</div>
                  <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)' }}>{desc}</div>
                </div>
              ))}
            </div>
            <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: '10px', marginBottom: 0 }}>
              * Bayar tahunan hemat 25%. Semua paket bisa cancel kapan saja.
            </p>
          </div>
        </div>

        {/* 7. Kelola */}
        <div id="kelola">
          <h2>7. Mengelola Toko & Produk</h2>

          <h3>7.1 Tambah Produk</h3>
          <p>Dashboard → menu <strong style={{ color: '#fff' }}>Produk</strong> → klik "Tambah Produk" → isi nama, harga, deskripsi, foto → simpan. Bot dan toko online langsung update otomatis!</p>

          <h3>7.2 Edit Info Toko</h3>
          <p>Dashboard → menu <strong style={{ color: '#fff' }}>Pengaturan Toko</strong> → ada 3 tab: Info Toko, Operasional, Kustomisasi Bot. Semakin lengkap info yang diisi, semakin pintar bot menjawab pelanggan.</p>

          <h3>7.3 Pantau Percakapan</h3>
          <p>Dashboard → menu <strong style={{ color: '#fff' }}>Percakapan</strong> → lihat semua pesan masuk dan balasan bot secara real-time.</p>

          <h3>7.4 Human Takeover</h3>
          <p>Kamu bisa ambil alih percakapan dari bot kapan saja. Dashboard → Pengaturan Toko → matikan toggle "Bot Aktif" → kamu bisa balas manual via WhatsApp biasa.</p>

          <h3>7.5 Broadcast Promo (Paket Pro+)</h3>
          <p>Dashboard → menu <strong style={{ color: '#fff' }}>Broadcast</strong> → tulis pesan promo → atur delay anti-banned → kirim ke semua kontak yang pernah chat dengan bot.</p>
        </div>

        {/* 8. Toko Online */}
        <div id="toko-online">
          <h2>8. Toko Online Gratis</h2>
          <p>
            Setiap toko Mahirusaha mendapat halaman toko online gratis yang bisa langsung dishare ke pelanggan — hosting dan subdomain sudah termasuk!
          </p>

          <div className="info-box">
            <p style={{ fontWeight: 700, color: '#25d366', marginBottom: '8px' }}>🛍️ Link toko kamu:</p>
            <p style={{ fontFamily: 'monospace', fontSize: '1rem', color: '#fff', marginBottom: '4px' }}>mahirusaha.com/<span style={{ color: '#25d366' }}>nama-toko-kamu</span></p>
            <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginBottom: 0 }}>Contoh: mahirusaha.com/warung-bu-sari</p>
          </div>

          <p><strong style={{ color: '#fff' }}>Yang tampil di toko online:</strong></p>
          <ul>
            <li>Nama toko, kategori, lokasi, dan jam buka</li>
            <li>Semua produk dengan foto, harga, dan status stok</li>
            <li>Filter produk per kategori</li>
            <li>Tombol "Pesan via WhatsApp" untuk setiap produk</li>
            <li>Tombol "Chat WhatsApp" untuk hubungi toko langsung</li>
          </ul>

          <p><strong style={{ color: '#fff' }}>Cara share toko online:</strong><br/>
          Dashboard → Overview → card "Link Toko Online Kamu" → klik "📋 Salin" atau "📤 Share WA".</p>

          <p><strong style={{ color: '#fff' }}>Cara ubah link toko:</strong><br/>
          Dashboard → Pengaturan Toko → tab Info Toko → field "Link Toko Online" → ubah → simpan.</p>
        </div>

        {/* 9. FAQ */}
        <div id="faq">
          <h2>9. FAQ — Pertanyaan yang Sering Ditanyakan</h2>

          {[
            {
              q: 'Apakah saya perlu bayar untuk daftar?',
              a: 'Tidak! Pendaftaran gratis. Kamu mendapat 100 pesan gratis setelah bot aktif. Baru bayar setelah 100 pesan habis dan ingin melanjutkan.'
            },
            {
              q: 'Kapan trial 100 pesan gratis mulai berjalan?',
              a: 'Trial mulai berjalan setelah bot WhatsApp kamu diaktifkan oleh tim kami — bukan sejak daftar. Jadi daftar dulu, siapkan nomor WA, minta aktivasi ke tim kami, baru trial dimulai.'
            },
            {
              q: 'Berapa lama proses aktivasi bot?',
              a: 'Maksimal 24 jam di jam kerja (Senin-Sabtu 08.00-21.00 WIB). Biasanya selesai dalam 1-2 jam setelah kamu mengirim data dan kode OTP ke tim kami.'
            },
            {
              q: 'Apakah nomor WA saya bisa dipakai biasa setelah jadi bot?',
              a: 'Tidak. Nomor yang sudah didaftarkan sebagai bot tidak bisa dipakai WhatsApp biasa secara bersamaan. Itulah kenapa kami sarankan pakai SIM card baru/terpisah khusus untuk bot.'
            },
            {
              q: 'Berapa biaya SIM card baru?',
              a: 'Sekitar Rp 10.000 - 35.000 di Alfamart, Indomaret, atau konter HP terdekat. Kami rekomendasikan Telkomsel karena jaringan paling luas.'
            },
            {
              q: 'Bagaimana cara bot tahu tentang produk saya?',
              a: 'Bot membaca data dari toko kamu secara otomatis — nama produk, harga, deskripsi, jam buka, metode pembayaran, dll. Semakin lengkap info yang kamu isi di dashboard, semakin pintar bot menjawab.'
            },
            {
              q: 'Apakah toko online langsung aktif setelah daftar?',
              a: 'Ya! Toko online (mahirusaha.com/namatoko) langsung bisa diakses setelah daftar. Kamu tinggal tambahkan produk di dashboard dan link toko bisa langsung dishare ke pelanggan.'
            },
            {
              q: 'Paket Pro dapat 3 toko — apakah setiap toko butuh nomor WA berbeda?',
              a: 'Ya. Setiap toko butuh nomor WhatsApp tersendiri. Untuk 3 toko berarti butuh 3 SIM card berbeda (~Rp 35rb per SIM card = total ~Rp 105rb).'
            },
            {
              q: 'Bagaimana jika bot tidak bisa jawab pertanyaan pelanggan?',
              a: 'Bot akan mengarahkan pelanggan ke nomor admin yang kamu daftarkan. Kamu juga bisa ambil alih percakapan manual via fitur Human Takeover di dashboard.'
            },
            {
              q: 'Apakah ada kontrak atau lock-in?',
              a: 'Tidak ada! Semua paket berbasis bulanan dan bisa cancel kapan saja dengan tidak memperpanjang. Data tersimpan selama 90 hari setelah akun tidak aktif.'
            },
            {
              q: 'Bagaimana cara perpanjang setelah masa aktif habis?',
              a: 'Login ke dashboard → menu Langganan → pilih paket → bayar. Bot langsung aktif kembali otomatis setelah pembayaran berhasil tanpa perlu hubungi tim.'
            },
            {
              q: 'Apakah ada refund?',
              a: 'Kami tidak menyediakan refund. Itulah kenapa kami menyediakan trial gratis 100 pesan agar kamu bisa mencoba dulu sebelum memutuskan berlangganan.'
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

        {/* 10. Kontak */}
        <div id="kontak">
          <h2>10. Kontak Bantuan</h2>
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
            <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '20px' }}>Daftar gratis sekarang — bayar baru setelah 100 pesan trial habis!</p>
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
