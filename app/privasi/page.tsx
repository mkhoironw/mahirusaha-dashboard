'use client'
import { useState } from 'react'

export default function Privasi() {
  const [lang, setLang] = useState<'id' | 'en'>('id')

  const id = {
    title: 'Kebijakan Privasi',
    updated: 'Terakhir diperbarui: 25 April 2026',
    subtitle: 'Mahirusaha berkomitmen melindungi privasi seluruh pengguna platform kami.',
    sections: [
      {
        title: '1. Pendahuluan',
        content: `Mahirusaha ("kami", "platform") adalah layanan SaaS berbasis WhatsApp Business API yang membantu UMKM Indonesia mengotomatiskan komunikasi pelanggan. Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, menyimpan, dan melindungi informasi pribadi kamu ketika menggunakan layanan di mahirusaha.com.\n\nDengan mendaftar dan menggunakan layanan Mahirusaha, kamu menyatakan telah membaca, memahami, dan menyetujui seluruh ketentuan dalam Kebijakan Privasi ini.`,
      },
      {
        title: '2. Informasi yang Kami Kumpulkan',
        subsections: [
          {
            title: '2.1 Informasi Akun',
            items: ['Nama lengkap pemilik bisnis', 'Alamat email', 'Nomor WhatsApp pemilik', 'Password (disimpan dalam format hash terenkripsi)'],
          },
          {
            title: '2.2 Informasi Bisnis',
            items: ['Nama toko, kategori, dan deskripsi bisnis', 'Nomor WhatsApp toko yang digunakan untuk bot', 'Jam operasional, lokasi, link Google Maps', 'Data produk dan layanan yang kamu input', 'Foto produk yang kamu unggah ke platform'],
          },
          {
            title: '2.3 Data Percakapan',
            items: ['Pesan masuk dari pelanggan toko kamu', 'Balasan yang dikirim oleh bot AI', 'Waktu dan tanggal percakapan', 'Nomor WhatsApp pelanggan yang menghubungi bot'],
          },
          {
            title: '2.4 Data Pembayaran',
            text: 'Kami tidak menyimpan data kartu kredit atau rekening bank secara langsung. Semua transaksi diproses oleh Midtrans sebagai payment gateway pihak ketiga yang telah tersertifikasi PCI-DSS. Kami hanya menyimpan status transaksi dan ID pembayaran.',
          },
          {
            title: '2.5 Data Teknis',
            items: ['Alamat IP dan informasi browser saat login', 'Waktu login dan aktivitas di dashboard', 'Log error untuk keperluan debugging teknis', 'Device dan sistem operasi yang digunakan'],
          },
        ],
      },
      {
        title: '3. Cara Kami Menggunakan Informasi',
        items: [
          'Menyediakan dan menjalankan layanan chatbot WhatsApp untuk bisnis kamu',
          'Memproses pembayaran dan mengelola langganan aktif',
          'Mengirimkan notifikasi penting (konfirmasi pembayaran, reminder perpanjangan, aktivasi bot)',
          'Memberikan dukungan teknis ketika kamu menghubungi tim kami',
          'Meningkatkan kualitas fitur, performa AI, dan pengalaman pengguna platform',
          'Mematuhi kewajiban hukum yang berlaku di Indonesia',
          'Mendeteksi dan mencegah penyalahgunaan layanan atau aktivitas penipuan',
        ],
      },
      {
        title: '4. Berbagi Informasi dengan Pihak Ketiga',
        text: 'Kami tidak menjual, menyewakan, atau memperdagangkan informasi pribadi kamu kepada pihak ketiga untuk tujuan komersial. Informasi hanya dibagikan kepada mitra teknis berikut untuk menjalankan layanan:',
        partners: [
          { name: 'Meta (WhatsApp Cloud API)', desc: 'Untuk mengirim dan menerima pesan WhatsApp. Tunduk pada Meta Platform Policy.' },
          { name: 'Midtrans (by GoTo Financial)', desc: 'Untuk memproses pembayaran langganan secara aman (PCI-DSS certified).' },
          { name: 'Groq / AI Provider', desc: 'Untuk memproses pertanyaan pelanggan menggunakan model bahasa AI. Data tidak disimpan permanen di server mereka.' },
          { name: 'Supabase', desc: 'Sebagai penyedia database cloud terenkripsi dengan keamanan enterprise-grade.' },
          { name: 'Resend', desc: 'Untuk pengiriman email transaksional (selamat datang, notifikasi, konfirmasi).' },
          { name: 'Vercel', desc: 'Sebagai penyedia hosting platform yang berlokasi di wilayah Asia Pasifik.' },
        ],
      },
      {
        title: '5. Keamanan Data',
        text: 'Kami menerapkan standar keamanan teknis dan organisasi untuk melindungi data kamu:',
        items: [
          'Enkripsi data saat transit menggunakan HTTPS/TLS 1.2+',
          'Password disimpan dalam format bcrypt hash yang tidak dapat dibaca',
          'Akses database dibatasi dengan Row Level Security (RLS) berbasis autentikasi',
          'API key dan kredensial sensitif disimpan sebagai environment variable terenkripsi',
          'Monitoring keamanan dan audit log secara berkala',
          'Backup data otomatis setiap hari dengan retensi 30 hari',
        ],
      },
      {
        title: '6. Penyimpanan dan Retensi Data',
        text: 'Data kamu disimpan di server Supabase yang berlokasi di wilayah Asia Pasifik (Singapore). Kami menyimpan data selama:\n\n• Akun aktif: selama langganan berlangsung\n• Setelah akun dinonaktifkan: hingga 90 hari, kemudian dihapus permanen\n• Data percakapan: 12 bulan sejak tanggal percakapan\n• Catatan pembayaran: 5 tahun sesuai kewajiban perpajakan Indonesia\n\nKamu dapat meminta penghapusan data lebih awal dengan menghubungi kami.',
      },
      {
        title: '7. Integrasi WhatsApp & Meta Platform',
        text: 'Layanan Mahirusaha menggunakan WhatsApp Cloud API dari Meta. Dengan menggunakan layanan kami, kamu memahami dan menyetujui bahwa:\n\n• Nomor WhatsApp bot kamu akan terdaftar di platform Meta Business\n• Pesan yang dikirim dan diterima melalui bot diproses melalui infrastruktur Meta\n• Mahirusaha tunduk pada Meta Platform Policy, WhatsApp Business Terms of Service, dan Meta Terms of Service\n• Data percakapan juga tunduk pada Kebijakan Data Meta (meta.com/privacy)\n\nKami tidak bertanggung jawab atas pemrosesan data yang dilakukan langsung oleh Meta sesuai kebijakan mereka sendiri.',
      },
      {
        title: '8. Cookie dan Penyimpanan Lokal',
        text: 'Mahirusaha menggunakan localStorage browser untuk menyimpan sesi login kamu secara lokal di perangkat. Data ini tidak dikirimkan ke server pihak ketiga dan hanya digunakan untuk mempertahankan status login.\n\nKami tidak menggunakan cookie pihak ketiga untuk keperluan iklan, retargeting, atau tracking perilaku pengguna di luar platform kami.',
      },
      {
        title: '9. Hak Pengguna',
        text: 'Sebagai pengguna Mahirusaha, kamu memiliki hak berikut atas data pribadi kamu:',
        rights: [
          { name: 'Akses', desc: 'Melihat data pribadi yang kami simpan melalui dashboard atau permintaan langsung.' },
          { name: 'Perbaikan', desc: 'Memperbarui informasi akun dan bisnis kapan saja melalui dashboard.' },
          { name: 'Penghapusan', desc: 'Meminta penghapusan akun beserta seluruh data terkait secara permanen.' },
          { name: 'Portabilitas', desc: 'Meminta salinan data kamu dalam format yang dapat dibaca (JSON/CSV).' },
          { name: 'Keberatan', desc: 'Menolak pemrosesan data untuk tujuan tertentu, dengan konsekuensi pembatasan layanan.' },
          { name: 'Pembatasan', desc: 'Meminta pembatasan pemrosesan data sementara dalam situasi tertentu.' },
        ],
        footer: 'Untuk menggunakan hak-hak di atas, hubungi kami di hello@mahirusaha.com. Kami akan merespons dalam 14 hari kerja.',
      },
      {
        title: '10. Privasi Anak-anak (Tidak untuk Pengguna di Bawah 13 Tahun)',
        text: 'Layanan Mahirusaha ditujukan untuk pelaku bisnis dan UMKM dewasa. Kami secara tegas tidak mengizinkan penggunaan platform oleh individu yang berusia di bawah 13 tahun.\n\nKami tidak secara sengaja mengumpulkan informasi pribadi dari anak-anak di bawah usia 13 tahun. Jika kami mengetahui bahwa kami telah mengumpulkan data pribadi dari anak di bawah 13 tahun tanpa persetujuan orang tua yang dapat diverifikasi, kami akan segera mengambil langkah untuk menghapus informasi tersebut dari sistem kami.\n\nJika kamu adalah orang tua atau wali dan percaya bahwa anakmu telah memberikan informasi pribadi kepada kami, silakan hubungi kami segera di hello@mahirusaha.com.',
      },
      {
        title: '11. Transfer Data Internasional',
        text: 'Dengan menggunakan layanan Mahirusaha, kamu menyetujui bahwa data kamu dapat diproses di luar Indonesia oleh mitra layanan kami (Supabase di Singapore, Vercel, Meta di AS). Seluruh transfer data internasional dilakukan dengan perlindungan kontraktual yang memadai sesuai standar keamanan data internasional.\n\nKami memastikan bahwa seluruh pihak ketiga yang menangani data kamu terikat oleh perjanjian pemrosesan data (Data Processing Agreement) yang sesuai.',
      },
      {
        title: '12. Perubahan Kebijakan Privasi',
        text: 'Kami dapat memperbarui Kebijakan Privasi ini dari waktu ke waktu untuk mencerminkan perubahan layanan, teknologi, atau regulasi yang berlaku. Perubahan akan dipublikasikan di halaman ini dengan tanggal pembaruan terbaru.\n\nUntuk perubahan yang signifikan, kami akan memberikan pemberitahuan melalui:\n• Email ke alamat yang terdaftar di akun kamu\n• Notifikasi di dashboard Mahirusaha\n\nPenggunaan layanan yang berlanjut setelah perubahan dipublikasikan dianggap sebagai persetujuan kamu terhadap kebijakan yang telah diperbarui.',
      },
      {
        title: '13. Informasi Kontak',
        text: 'Jika kamu memiliki pertanyaan, kekhawatiran, atau permintaan terkait Kebijakan Privasi ini atau pengelolaan data pribadi kamu, silakan hubungi kami melalui:',
        contact: true,
      },
    ],
  }

  const en = {
    title: 'Privacy Policy',
    updated: 'Last updated: April 25, 2026',
    subtitle: 'Mahirusaha is committed to protecting the privacy of all users of our platform.',
    sections: [
      {
        title: '1. Introduction',
        content: `Mahirusaha ("we", "us", "platform") is a WhatsApp Business API-based SaaS service that helps Indonesian SMEs automate customer communication. This Privacy Policy explains how we collect, use, store, and protect your personal information when you use our services at mahirusaha.com.\n\nBy registering and using Mahirusaha's services, you acknowledge that you have read, understood, and agreed to all terms of this Privacy Policy.`,
      },
      {
        title: '2. Information We Collect',
        subsections: [
          {
            title: '2.1 Account Information',
            items: ['Full name of the business owner', 'Email address', "Owner's WhatsApp number", 'Password (stored in encrypted hash format)'],
          },
          {
            title: '2.2 Business Information',
            items: ['Store name, category, and business description', 'Store WhatsApp number used for the bot', 'Operating hours, location, Google Maps link', 'Product and service data you input', 'Product photos you upload to the platform'],
          },
          {
            title: '2.3 Conversation Data',
            items: ['Incoming messages from your store customers', 'Replies sent by the AI bot', 'Time and date of conversations', "Customer's WhatsApp number that contacts the bot"],
          },
          {
            title: '2.4 Payment Data',
            text: 'We do not directly store credit card or bank account data. All transactions are processed by Midtrans as a PCI-DSS certified third-party payment gateway. We only store transaction status and payment IDs.',
          },
          {
            title: '2.5 Technical Data',
            items: ['IP address and browser information upon login', 'Login time and dashboard activity', 'Error logs for technical debugging', 'Device and operating system used'],
          },
        ],
      },
      {
        title: '3. How We Use Your Information',
        items: [
          'Providing and operating the WhatsApp chatbot service for your business',
          'Processing payments and managing active subscriptions',
          'Sending important notifications (payment confirmation, renewal reminders, bot activation)',
          'Providing technical support when you contact our team',
          'Improving AI quality, platform performance, and user experience',
          'Complying with applicable legal obligations in Indonesia',
          'Detecting and preventing service abuse or fraudulent activity',
        ],
      },
      {
        title: '4. Sharing Information with Third Parties',
        text: 'We do not sell, rent, or trade your personal information to third parties for commercial purposes. Information is only shared with the following technical partners to operate the service:',
        partners: [
          { name: 'Meta (WhatsApp Cloud API)', desc: 'To send and receive WhatsApp messages. Subject to Meta Platform Policy.' },
          { name: 'Midtrans (by GoTo Financial)', desc: 'To securely process subscription payments (PCI-DSS certified).' },
          { name: 'Groq / AI Provider', desc: 'To process customer queries using AI language models. Data is not permanently stored on their servers.' },
          { name: 'Supabase', desc: 'As an encrypted cloud database provider with enterprise-grade security.' },
          { name: 'Resend', desc: 'For transactional email delivery (welcome, notifications, confirmations).' },
          { name: 'Vercel', desc: 'As the platform hosting provider located in the Asia Pacific region.' },
        ],
      },
      {
        title: '5. Data Security',
        text: 'We implement technical and organizational security standards to protect your data:',
        items: [
          'Data encrypted in transit using HTTPS/TLS 1.2+',
          'Passwords stored in bcrypt hash format that cannot be read',
          'Database access restricted with authentication-based Row Level Security (RLS)',
          'API keys and sensitive credentials stored as encrypted environment variables',
          'Regular security monitoring and audit logs',
          'Automatic daily data backups with 30-day retention',
        ],
      },
      {
        title: '6. Data Storage and Retention',
        text: 'Your data is stored on Supabase servers located in the Asia Pacific region (Singapore). We retain data for the following periods:\n\n• Active accounts: throughout the subscription period\n• After account deactivation: up to 90 days, then permanently deleted\n• Conversation data: 12 months from the date of conversation\n• Payment records: 5 years in compliance with Indonesian tax obligations\n\nYou may request earlier deletion by contacting us.',
      },
      {
        title: '7. WhatsApp & Meta Platform Integration',
        text: "Mahirusaha uses the WhatsApp Cloud API from Meta. By using our service, you understand and agree that:\n\n• Your bot's WhatsApp number will be registered on the Meta Business platform\n• Messages sent and received through the bot are processed through Meta's infrastructure\n• Mahirusaha is subject to Meta Platform Policy, WhatsApp Business Terms of Service, and Meta Terms of Service\n• Conversation data is also subject to Meta's Data Policy (meta.com/privacy)\n\nWe are not responsible for data processing performed directly by Meta in accordance with their own policies.",
      },
      {
        title: '8. Cookies and Local Storage',
        text: "Mahirusaha uses browser localStorage to store your login session locally on your device. This data is not transmitted to third-party servers and is only used to maintain your login status.\n\nWe do not use third-party cookies for advertising, retargeting, or tracking user behavior outside our platform.",
      },
      {
        title: '9. User Rights',
        text: 'As a Mahirusaha user, you have the following rights over your personal data:',
        rights: [
          { name: 'Access', desc: 'View personal data we store via the dashboard or direct request.' },
          { name: 'Correction', desc: 'Update account and business information at any time through the dashboard.' },
          { name: 'Deletion', desc: 'Request permanent deletion of your account and all related data.' },
          { name: 'Portability', desc: 'Request a copy of your data in a readable format (JSON/CSV).' },
          { name: 'Objection', desc: 'Object to data processing for certain purposes, with consequences for service limitations.' },
          { name: 'Restriction', desc: 'Request temporary restriction of data processing in certain situations.' },
        ],
        footer: 'To exercise these rights, contact us at hello@mahirusaha.com. We will respond within 14 business days.',
      },
      {
        title: '10. Children\'s Privacy (Not for Users Under 13 Years Old)',
        text: "Mahirusaha's services are intended for adult business operators and SMEs. We explicitly do not permit use of the platform by individuals under the age of 13.\n\nWe do not knowingly collect personal information from children under the age of 13. If we become aware that we have collected personal data from a child under 13 without verifiable parental consent, we will take immediate steps to delete that information from our systems.\n\nIf you are a parent or guardian and believe your child has provided personal information to us, please contact us immediately at hello@mahirusaha.com.",
      },
      {
        title: '11. International Data Transfers',
        text: "By using Mahirusaha's services, you consent to your data being processed outside of Indonesia by our service partners (Supabase in Singapore, Vercel, Meta in the US). All international data transfers are carried out with adequate contractual protections in accordance with international data security standards.\n\nWe ensure that all third parties handling your data are bound by appropriate Data Processing Agreements.",
      },
      {
        title: '12. Changes to Privacy Policy',
        text: 'We may update this Privacy Policy from time to time to reflect changes in our service, technology, or applicable regulations. Changes will be published on this page with the latest update date.\n\nFor significant changes, we will provide notice via:\n• Email to the address registered in your account\n• Notification in the Mahirusaha dashboard\n\nContinued use of the service after changes are published constitutes your acceptance of the updated policy.',
      },
      {
        title: '13. Contact Information',
        text: 'If you have questions, concerns, or requests regarding this Privacy Policy or the management of your personal data, please contact us through:',
        contact: true,
      },
    ],
  }

  const t = lang === 'id' ? id : en

  return (
    <main style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: '#070d1a', color: '#fff', minHeight: '100vh' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(37,211,102,0.3); border-radius: 2px; }
        a { color: #25d366; text-decoration: none; }
        a:hover { text-decoration: underline; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        .fadeUp { animation: fadeUp 0.5s ease forwards; }
      `}</style>

      {/* Nav */}
      <nav style={{ padding: '0 5%', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'sticky', top: 0, background: 'rgba(7,13,26,0.95)', backdropFilter: 'blur(12px)', zIndex: 50 }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: '#fff' }}>
          <div style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg,#25d366,#128c7e)', borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px' }}>💬</div>
          <span style={{ fontWeight: 800, fontSize: '1.05rem' }}>Mahirusaha</span>
        </a>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Language toggle */}
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '100px', padding: '3px' }}>
            {(['id', 'en'] as const).map(l => (
              <button key={l} onClick={() => setLang(l)} style={{ padding: '5px 14px', borderRadius: '100px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.78rem', fontFamily: 'inherit', background: lang === l ? '#25d366' : 'transparent', color: lang === l ? '#070d1a' : 'rgba(255,255,255,0.5)', transition: 'all 0.2s' }}>
                {l === 'id' ? '🇮🇩 ID' : '🇬🇧 EN'}
              </button>
            ))}
          </div>
          <a href="/" style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.45)' }}>← {lang === 'id' ? 'Beranda' : 'Home'}</a>
        </div>
      </nav>

      {/* Content */}
      <div className="fadeUp" style={{ maxWidth: '760px', margin: '0 auto', padding: '52px 24px 96px' }}>

        {/* Header */}
        <div style={{ marginBottom: '44px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(37,211,102,0.1)', border: '1px solid rgba(37,211,102,0.2)', borderRadius: '100px', padding: '5px 14px', marginBottom: '18px' }}>
            <span style={{ fontSize: '0.72rem', color: '#25d366', fontWeight: 700 }}>🔒 {lang === 'id' ? 'KEBIJAKAN PRIVASI' : 'PRIVACY POLICY'}</span>
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-0.5px', marginBottom: '12px', lineHeight: 1.2 }}>{t.title}</h1>
          <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.45)', marginBottom: '8px' }}>{t.updated}</p>
          <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.7 }}>{t.subtitle}</p>
          <div style={{ height: '2px', background: 'linear-gradient(90deg,#25d366,transparent)', marginTop: '24px' }} />
        </div>

        {/* Table of Contents */}
        <div style={{ background: 'rgba(37,211,102,0.04)', border: '1px solid rgba(37,211,102,0.12)', borderRadius: '14px', padding: '20px 24px', marginBottom: '40px' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#25d366', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>
            {lang === 'id' ? '📋 Daftar Isi' : '📋 Table of Contents'}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 24px' }}>
            {t.sections.map((s, i) => (
              <a key={i} href={`#section-${i + 1}`} style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', textDecoration: 'none', lineHeight: 1.6, transition: 'color 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#25d366')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}>
                {s.title}
              </a>
            ))}
          </div>
        </div>

        {/* Sections */}
        {t.sections.map((s, i) => (
          <div key={i} id={`section-${i + 1}`} style={{ marginBottom: '40px', scrollMarginTop: '80px' }}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#25d366', marginBottom: '14px', paddingBottom: '10px', borderBottom: '1px solid rgba(37,211,102,0.15)' }}>
              {s.title}
            </h2>

            {/* Intro paragraph for section 2 */}
            {'content' in s && s.content && (
              <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.85, whiteSpace: 'pre-line' }}>{s.content}</p>
            )}

            {/* Top-level text */}
            {'text' in s && s.text && !('contact' in s) && (
              <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.85, marginBottom: '14px', whiteSpace: 'pre-line' }}>{s.text}</p>
            )}

            {/* Top-level items */}
            {'items' in s && s.items && (
              <ul style={{ paddingLeft: '20px', marginBottom: '12px' }}>
                {s.items.map((item: string, j: number) => (
                  <li key={j} style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.85, marginBottom: '5px' }}>{item}</li>
                ))}
              </ul>
            )}

            {/* Subsections */}
            {'subsections' in s && s.subsections && s.subsections.map((sub: any, j: number) => (
              <div key={j} style={{ marginBottom: '16px' }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'rgba(255,255,255,0.85)', marginBottom: '8px' }}>{sub.title}</h3>
                {sub.text && <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.85 }}>{sub.text}</p>}
                {sub.items && (
                  <ul style={{ paddingLeft: '20px' }}>
                    {sub.items.map((item: string, k: number) => (
                      <li key={k} style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.85, marginBottom: '4px' }}>{item}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}

            {/* Partners */}
            {'partners' in s && s.partners && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '4px' }}>
                {s.partners.map((p: any, j: number) => (
                  <div key={j} style={{ display: 'flex', gap: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '12px 14px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#25d366', flexShrink: 0, marginTop: '6px' }} />
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fff', marginBottom: '2px' }}>{p.name}</div>
                      <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>{p.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Rights */}
            {'rights' in s && s.rights && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
                  {s.rights.map((r: any, j: number) => (
                    <div key={j} style={{ background: 'rgba(37,211,102,0.04)', border: '1px solid rgba(37,211,102,0.1)', borderRadius: '10px', padding: '12px 14px' }}>
                      <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#25d366', marginBottom: '4px' }}>{r.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>{r.desc}</div>
                    </div>
                  ))}
                </div>
                {'footer' in s && <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>{s.footer}</p>}
              </>
            )}

            {/* Contact section */}
            {'contact' in s && s.contact && (
              <>
                <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.85, marginBottom: '18px' }}>{s.text}</p>
                <div style={{ background: 'rgba(37,211,102,0.05)', border: '1px solid rgba(37,211,102,0.15)', borderRadius: '14px', padding: '20px 24px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {[
                      { icon: '📧', label: 'Email', value: 'hello@mahirusaha.com', href: 'mailto:hello@mahirusaha.com' },
                      { icon: '💬', label: 'WhatsApp', value: '+62 813-2531-202', href: 'https://wa.me/628132531202' },
                      { icon: '📍', label: lang === 'id' ? 'Alamat' : 'Address', value: 'Jl. Bumi Rosela Indah No. 9, Dsn. Ngumpak, Ds. Jabon, Kec. Mojoanyar, Kab. Mojokerto, Jawa Timur 61364', href: null },
                      { icon: '🌐', label: 'Website', value: 'mahirusaha.com', href: 'https://mahirusaha.com' },
                    ].map((c, j) => (
                      <div key={j} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                        <span style={{ fontSize: '1rem', flexShrink: 0, marginTop: '1px' }}>{c.icon}</span>
                        <div>
                          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>{c.label}</div>
                          {c.href ? (
                            <a href={c.href} target={c.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" style={{ fontSize: '0.875rem', color: '#25d366', fontWeight: 600 }}>{c.value}</a>
                          ) : (
                            <span style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>{c.value}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        ))}

        {/* Footer nav */}
        <div style={{ marginTop: '56px', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <a href="/" style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.4)' }}>← {lang === 'id' ? 'Kembali ke Beranda' : 'Back to Home'}</a>
          <div style={{ display: 'flex', gap: '20px' }}>
            <a href="/syarat" style={{ fontSize: '0.82rem', color: '#25d366' }}>{lang === 'id' ? 'Syarat Layanan →' : 'Terms of Service →'}</a>
          </div>
        </div>
      </div>
    </main>
  )
}
