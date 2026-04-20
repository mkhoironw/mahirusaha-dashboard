'use client'
import { useState, useEffect } from 'react'

export default function PartnerPage() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <main style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: '#070d1a', color: '#fff', minHeight: '100vh', overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #818cf8; border-radius: 2px; }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
        @keyframes glow { 0%,100%{opacity:.5} 50%{opacity:1} }
        @keyframes pulse-p { 0%,100%{box-shadow:0 0 0 0 rgba(129,140,248,.4)} 50%{box-shadow:0 0 0 14px rgba(129,140,248,0)} }
        .fadeUp { animation: fadeUp .7s ease forwards; }
        .fadeUp-2 { animation: fadeUp .7s .15s ease forwards; opacity:0; }
        .fadeUp-3 { animation: fadeUp .7s .3s ease forwards; opacity:0; }
        .float { animation: float 4s ease-in-out infinite; }
        .pulse-p { animation: pulse-p 2.5s ease-in-out infinite; }
        .shimmer-text {
          background: linear-gradient(90deg,#818cf8 0%,#fff 40%,#818cf8 60%,#fff 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 3s linear infinite;
        }
        .card-h { transition: transform .3s, box-shadow .3s; }
        .card-h:hover { transform: translateY(-5px); box-shadow: 0 20px 50px rgba(129,140,248,.12); }
        .nav-a { color: rgba(255,255,255,.65); text-decoration:none; font-size:.9rem; font-weight:500; transition:color .2s; }
        .nav-a:hover { color: #818cf8; }
        @media(max-width:768px){
          .hero-grid{flex-direction:column!important;text-align:center}
          .h1{font-size:2.4rem!important}
          .feat-grid{grid-template-columns:1fr!important}
          .steps-grid{grid-template-columns:1fr 1fr!important}
          .hide-mob{display:none!important}
        }
      `}</style>

      {/* NAV */}
      <nav style={{ position:'fixed', top:0, left:0, right:0, zIndex:100, background: scrolled?'rgba(7,13,26,.95)':'transparent', backdropFilter: scrolled?'blur(20px)':'none', borderBottom: scrolled?'1px solid rgba(129,140,248,.1)':'none', transition:'all .3s', padding:'0 5%', display:'flex', alignItems:'center', justifyContent:'space-between', height:'68px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
          <a href="/" style={{ display:'flex', alignItems:'center', gap:'10px', textDecoration:'none', color:'#fff' }}>
            <div style={{ width:'34px', height:'34px', background:'linear-gradient(135deg,#25d366,#128c7e)', borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'16px' }}>💬</div>
            <span style={{ fontWeight:800, fontSize:'1.15rem', letterSpacing:'-.5px' }}>Mahirusaha</span>
          </a>
          <span style={{ background:'rgba(129,140,248,0.15)', color:'#818cf8', fontSize:'0.7rem', fontWeight:700, padding:'3px 10px', borderRadius:'100px', marginLeft:'6px' }}>Partner Program</span>
        </div>
        <div className="hide-mob" style={{ display:'flex', alignItems:'center', gap:'28px' }}>
          {[['Keuntungan','#keuntungan'],['Cara Kerja','#cara-kerja'],['Komisi','#komisi'],['FAQ','#faq']].map(([label, href]) => (
            <a key={label} href={href} className="nav-a">{label}</a>
          ))}
        </div>
        <div style={{ display:'flex', gap:'10px' }}>
          <a href="/partner/masuk" style={{ color:'rgba(255,255,255,.7)', padding:'10px 18px', borderRadius:'10px', textDecoration:'none', fontWeight:600, fontSize:'.85rem', border:'1px solid rgba(255,255,255,.1)' }}>Masuk</a>
          <a href="/partner/daftar" style={{ background:'linear-gradient(135deg,#818cf8,#6366f1)', color:'#fff', padding:'10px 18px', borderRadius:'10px', textDecoration:'none', fontWeight:700, fontSize:'.85rem' }}>Daftar Partner</a>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ minHeight:'100vh', display:'flex', alignItems:'center', padding:'110px 5% 70px', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:'15%', left:'5%', width:'500px', height:'500px', background:'radial-gradient(circle,rgba(129,140,248,.09) 0%,transparent 70%)', pointerEvents:'none' }}/>
        <div style={{ position:'absolute', bottom:'10%', right:'5%', width:'350px', height:'350px', background:'radial-gradient(circle,rgba(99,102,241,.08) 0%,transparent 70%)', pointerEvents:'none' }}/>

        <div className="hero-grid" style={{ maxWidth:'1200px', margin:'0 auto', display:'flex', alignItems:'center', gap:'60px', width:'100%' }}>
          <div style={{ flex:1 }}>
            <div className="fadeUp" style={{ display:'inline-flex', alignItems:'center', gap:'8px', background:'rgba(129,140,248,.1)', border:'1px solid rgba(129,140,248,.25)', borderRadius:'100px', padding:'6px 14px', marginBottom:'22px' }}>
              <div style={{ width:'7px', height:'7px', borderRadius:'50%', background:'#818cf8', animation:'glow 2s infinite' }}/>
              <span style={{ fontSize:'.78rem', color:'#818cf8', fontWeight:700 }}>Program Partner Mahirusaha — Komisi Rekurring Selamanya</span>
            </div>
            <h1 className="h1 fadeUp" style={{ fontSize:'3.6rem', fontWeight:800, lineHeight:1.12, letterSpacing:'-1.5px', marginBottom:'20px' }}>
              Hasilkan Passive<br/>
              <span className="shimmer-text">Income Jutaan</span><br/>
              Per Bulan
            </h1>
            <p className="fadeUp-2" style={{ fontSize:'1.05rem', color:'rgba(255,255,255,.6)', lineHeight:1.75, marginBottom:'34px', maxWidth:'500px' }}>
              Kenalkan Mahirusaha ke jaringan UMKM kamu dan dapatkan komisi <strong style={{ color:'#818cf8' }}>15% setiap bulan</strong> selama klien masih aktif — tanpa modal, tanpa keahlian teknis.
            </p>
            <div className="fadeUp-3" style={{ display:'flex', gap:'12px', flexWrap:'wrap' }}>
              <a href="/partner/daftar" className="pulse-p" style={{ background:'linear-gradient(135deg,#818cf8,#6366f1)', color:'#fff', padding:'15px 30px', borderRadius:'12px', textDecoration:'none', fontWeight:700, fontSize:'.95rem', display:'inline-flex', alignItems:'center', gap:'8px' }}>
                🤝 Daftar Jadi Partner
              </a>
              <a href="#cara-kerja" style={{ background:'rgba(255,255,255,.05)', border:'1px solid rgba(255,255,255,.15)', color:'#fff', padding:'15px 30px', borderRadius:'12px', textDecoration:'none', fontWeight:600, fontSize:'.95rem' }}>
                Pelajari Lebih →
              </a>
            </div>

            {/* Trust badges */}
            <div style={{ marginTop:'38px', display:'flex', alignItems:'center', gap:'24px', flexWrap:'wrap' }}>
              {[['15%','Komisi Rekurring'],['∞','Tanpa Batas Klien'],['0','Modal Diperlukan'],['24/7','Dashboard Real-time']].map(([n,l])=>(
                <div key={l}>
                  <div style={{ fontWeight:800, fontSize:'1.1rem', color:'#818cf8' }}>{n}</div>
                  <div style={{ fontSize:'.7rem', color:'rgba(255,255,255,.4)', fontWeight:500 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Income Calculator Mockup */}
          <div style={{ flex:1, display:'flex', justifyContent:'center' }}>
            <div className="float" style={{ position:'relative', width:'340px' }}>
              <div style={{ background:'#111827', border:'2px solid rgba(129,140,248,.2)', borderRadius:'24px', padding:'24px', boxShadow:'0 40px 80px rgba(0,0,0,.5)' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'20px', paddingBottom:'16px', borderBottom:'1px solid rgba(255,255,255,.06)' }}>
                  <div style={{ width:'36px', height:'36px', background:'linear-gradient(135deg,#818cf8,#6366f1)', borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'16px' }}>🤝</div>
                  <div>
                    <div style={{ fontWeight:700, fontSize:'.875rem' }}>Dashboard Partner</div>
                    <div style={{ fontSize:'.7rem', color:'rgba(255,255,255,.4)' }}>Komisi bulan ini</div>
                  </div>
                </div>
                <div style={{ textAlign:'center', marginBottom:'20px' }}>
                  <div style={{ fontSize:'2.5rem', fontWeight:800, color:'#818cf8', marginBottom:'4px' }}>Rp 1.496.000</div>
                  <div style={{ fontSize:'.75rem', color:'rgba(255,255,255,.4)' }}>Total komisi April 2026</div>
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:'10px', marginBottom:'16px' }}>
                  {[
                    { nama:'Warung Bu Sari', paket:'Pro', komisi:'Rp 44.850' },
                    { nama:'Toko Pak Budi', paket:'Bisnis', komisi:'Rp 104.850' },
                    { nama:'Salon Cantik', paket:'Starter', komisi:'Rp 14.850' },
                    { nama:'Laundry Express', paket:'Pro', komisi:'Rp 44.850' },
                    { nama:'Bakso Mas Eko', paket:'Starter', komisi:'Rp 14.850' },
                  ].map((k, i) => (
                    <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 12px', background:'rgba(255,255,255,.04)', borderRadius:'8px' }}>
                      <div>
                        <div style={{ fontSize:'.75rem', fontWeight:600 }}>{k.nama}</div>
                        <div style={{ fontSize:'.65rem', color:'rgba(255,255,255,.35)' }}>Paket {k.paket}</div>
                      </div>
                      <div style={{ fontSize:'.75rem', fontWeight:700, color:'#818cf8' }}>{k.komisi}</div>
                    </div>
                  ))}
                </div>
                <div style={{ background:'rgba(129,140,248,.1)', border:'1px solid rgba(129,140,248,.2)', borderRadius:'10px', padding:'10px 14px', textAlign:'center' }}>
                  <div style={{ fontSize:'.7rem', color:'rgba(255,255,255,.4)', marginBottom:'2px' }}>Status Pembayaran</div>
                  <div style={{ fontSize:'.82rem', fontWeight:700, color:'#25d366' }}>✅ Sudah Ditransfer</div>
                </div>
              </div>
              <div style={{ position:'absolute', top:'-14px', right:'-18px', background:'#818cf8', color:'#fff', padding:'7px 12px', borderRadius:'100px', fontWeight:800, fontSize:'.7rem', whiteSpace:'nowrap' }}>💰 Passive Income!</div>
              <div style={{ position:'absolute', bottom:'18px', left:'-22px', background:'#1e293b', border:'1px solid rgba(129,140,248,.3)', color:'#818cf8', padding:'8px 12px', borderRadius:'10px', fontWeight:700, fontSize:'.7rem' }}>📊 Real-time Dashboard</div>
            </div>
          </div>
        </div>
      </section>

      {/* KEUNTUNGAN */}
      <section id="keuntungan" style={{ padding:'80px 5%', background:'rgba(255,255,255,.015)' }}>
        <div style={{ maxWidth:'1100px', margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:'50px' }}>
            <div style={{ display:'inline-block', background:'rgba(129,140,248,.1)', border:'1px solid rgba(129,140,248,.2)', borderRadius:'100px', padding:'5px 14px', marginBottom:'14px', color:'#818cf8', fontSize:'.78rem', fontWeight:700 }}>KEUNTUNGAN PARTNER</div>
            <h2 style={{ fontSize:'2.2rem', fontWeight:800, letterSpacing:'-.5px', marginBottom:'10px' }}>Mengapa jadi Partner Mahirusaha?</h2>
          </div>
          <div className="feat-grid" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'16px' }}>
            {[
              { icon:'💰', title:'Komisi 15% Rekurring', desc:'Dapatkan 15% dari setiap pembayaran klien yang kamu referensikan — setiap bulan, selama klien masih aktif berlangganan.' },
              { icon:'🚀', title:'Tanpa Modal Apapun', desc:'Tidak perlu bayar apapun untuk jadi partner. Cukup daftar, dapat kode referral, dan mulai kenalkan ke jaringanmu.' },
              { icon:'📊', title:'Dashboard Real-time', desc:'Pantau semua klien yang kamu bawa, total komisi, dan status pembayaran kapan saja lewat dashboard partner khusus.' },
              { icon:'🎯', title:'Produk yang Menjual Sendiri', desc:'Mahirusaha menawarkan solusi nyata untuk UMKM — bot WA 24 jam + toko online gratis. Mudah dijual ke siapapun.' },
              { icon:'🤝', title:'Support Penuh dari Tim', desc:'Tim kami bantu proses teknis sepenuhnya. Kamu cukup kenalkan, kami yang setup dan maintain.' },
              { icon:'∞', title:'Tanpa Batas Klien', desc:'Semakin banyak klien yang kamu bawa, semakin besar passive income kamu. Tidak ada batasan jumlah referral.' },
            ].map((f,i)=>(
              <div key={i} className="card-h" style={{ background:'rgba(255,255,255,.03)', border:'1px solid rgba(255,255,255,.07)', borderRadius:'16px', padding:'24px' }}>
                <div style={{ fontSize:'2rem', marginBottom:'14px' }}>{f.icon}</div>
                <h3 style={{ fontWeight:700, fontSize:'.95rem', marginBottom:'8px' }}>{f.title}</h3>
                <p style={{ color:'rgba(255,255,255,.45)', fontSize:'.82rem', lineHeight:1.65 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CARA KERJA */}
      <section id="cara-kerja" style={{ padding:'80px 5%' }}>
        <div style={{ maxWidth:'1000px', margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:'50px' }}>
            <div style={{ display:'inline-block', background:'rgba(129,140,248,.1)', border:'1px solid rgba(129,140,248,.2)', borderRadius:'100px', padding:'5px 14px', marginBottom:'14px', color:'#818cf8', fontSize:'.78rem', fontWeight:700 }}>CARA KERJA</div>
            <h2 style={{ fontSize:'2.2rem', fontWeight:800, letterSpacing:'-.5px' }}>Mulai dalam 4 langkah mudah</h2>
          </div>
          <div className="steps-grid" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'20px' }}>
            {[
              { step:'01', icon:'📝', title:'Daftar Partner', desc:'Isi form pendaftaran partner. Tim kami akan review dan approve dalam 1x24 jam.' },
              { step:'02', icon:'🔗', title:'Dapat Kode Referral', desc:'Setelah diapprove, kamu dapat kode referral unik dan link pendaftaran khusus.' },
              { step:'03', icon:'📢', title:'Kenalkan ke Jaringan', desc:'Share ke komunitas UMKM, teman pengusaha, atau siapapun yang butuh chatbot WA.' },
              { step:'04', icon:'💰', title:'Komisi Masuk Otomatis', desc:'Setiap klien bayar, komisi 15% langsung tercatat di dashboard. Ditransfer tiap bulan!' },
            ].map((s,i)=>(
              <div key={i} style={{ textAlign:'center', position:'relative' }}>
                {i<3&&<div style={{ position:'absolute', top:'25px', left:'60%', right:'-10px', height:'1px', background:'linear-gradient(90deg,rgba(129,140,248,.3),transparent)' }}/>}
                <div style={{ width:'52px', height:'52px', borderRadius:'14px', background:'rgba(129,140,248,.12)', border:'1px solid rgba(129,140,248,.25)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.4rem', margin:'0 auto 14px', position:'relative', zIndex:1 }}>{s.icon}</div>
                <div style={{ fontSize:'.65rem', color:'#818cf8', fontWeight:700, letterSpacing:'.08em', marginBottom:'5px' }}>LANGKAH {s.step}</div>
                <h3 style={{ fontWeight:700, marginBottom:'6px', fontSize:'.9rem' }}>{s.title}</h3>
                <p style={{ color:'rgba(255,255,255,.45)', fontSize:'.78rem', lineHeight:1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SIMULASI KOMISI */}
      <section id="komisi" style={{ padding:'80px 5%', background:'rgba(255,255,255,.015)' }}>
        <div style={{ maxWidth:'900px', margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:'50px' }}>
            <div style={{ display:'inline-block', background:'rgba(129,140,248,.1)', border:'1px solid rgba(129,140,248,.2)', borderRadius:'100px', padding:'5px 14px', marginBottom:'14px', color:'#818cf8', fontSize:'.78rem', fontWeight:700 }}>SIMULASI KOMISI</div>
            <h2 style={{ fontSize:'2.2rem', fontWeight:800, letterSpacing:'-.5px', marginBottom:'10px' }}>Berapa yang bisa kamu hasilkan?</h2>
            <p style={{ color:'rgba(255,255,255,.5)', fontSize:'.95rem' }}>Komisi 15% dari setiap pembayaran, setiap bulan</p>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'16px', marginBottom:'32px' }}>
            {[
              { label:'Pemula', klien:5, mix:'3 Starter + 2 Pro', komisi: (3*99000 + 2*299000) * 0.15, color:'rgba(255,255,255,.04)', border:'rgba(255,255,255,.09)' },
              { label:'Aktif', klien:15, mix:'5 Starter + 7 Pro + 3 Bisnis', komisi: (5*99000 + 7*299000 + 3*699000) * 0.15, color:'rgba(129,140,248,.07)', border:'rgba(129,140,248,.35)', popular:true },
              { label:'Pro', klien:30, mix:'5 Starter + 15 Pro + 10 Bisnis', komisi: (5*99000 + 15*299000 + 10*699000) * 0.15, color:'rgba(255,255,255,.04)', border:'rgba(255,255,255,.09)' },
            ].map((s,i)=>(
              <div key={i} className="card-h" style={{ background:s.color, border:`1px solid ${s.border}`, borderRadius:'20px', padding:'28px', textAlign:'center', position:'relative' }}>
                {s.popular && <div style={{ position:'absolute', top:'-12px', left:'50%', transform:'translateX(-50%)', background:'#818cf8', color:'#fff', fontSize:'.68rem', fontWeight:800, padding:'4px 14px', borderRadius:'100px', whiteSpace:'nowrap' }}>PALING UMUM</div>}
                <div style={{ fontWeight:800, fontSize:'1rem', marginBottom:'8px' }}>{s.label}</div>
                <div style={{ fontSize:'.78rem', color:'rgba(255,255,255,.4)', marginBottom:'16px' }}>{s.klien} klien · {s.mix}</div>
                <div style={{ fontSize:'2rem', fontWeight:800, color:'#818cf8', marginBottom:'4px' }}>
                  Rp {Math.round(s.komisi).toLocaleString('id-ID')}
                </div>
                <div style={{ fontSize:'.75rem', color:'rgba(255,255,255,.4)' }}>passive income per bulan</div>
              </div>
            ))}
          </div>

          <div style={{ background:'rgba(129,140,248,.06)', border:'1px solid rgba(129,140,248,.15)', borderRadius:'16px', padding:'20px 24px', textAlign:'center' }}>
            <p style={{ fontSize:'.875rem', color:'rgba(255,255,255,.6)', lineHeight:1.7 }}>
              💡 Komisi dihitung dari harga paket × 15% dan dibayarkan setiap bulan selama klien aktif berlangganan. Semakin lama klien bertahan, semakin besar total komisi kamu.
            </p>
          </div>
        </div>
      </section>

      {/* SIAPA YANG COCOK */}
      <section style={{ padding:'80px 5%' }}>
        <div style={{ maxWidth:'1000px', margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:'50px' }}>
            <h2 style={{ fontSize:'2.2rem', fontWeight:800, letterSpacing:'-.5px', marginBottom:'10px' }}>Siapa yang cocok jadi partner?</h2>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'16px' }}>
            {[
              { icon:'👥', title:'Komunitas UMKM', desc:'Kamu aktif di komunitas pengusaha, arisan bisnis, atau grup WhatsApp UMKM' },
              { icon:'💼', title:'Konsultan Bisnis', desc:'Kamu konsultan, coach bisnis, atau mentor yang sering berinteraksi dengan UMKM' },
              { icon:'📱', title:'Influencer & Content Creator', desc:'Kamu punya followers yang terdiri dari pemilik usaha atau UMKM' },
              { icon:'🏢', title:'Asosiasi & Koperasi', desc:'Kamu pengurus asosiasi pengusaha, koperasi, atau organisasi UMKM' },
              { icon:'🎓', title:'Mahasiswa & Fresh Graduate', desc:'Kamu punya jaringan dan semangat untuk menghasilkan passive income' },
              { icon:'🌟', title:'Siapapun Berjaringan', desc:'Kamu punya kenalan pengusaha dan mau bantu mereka berkembang secara digital' },
            ].map((f,i)=>(
              <div key={i} className="card-h" style={{ background:'rgba(255,255,255,.03)', border:'1px solid rgba(255,255,255,.07)', borderRadius:'16px', padding:'20px' }}>
                <div style={{ fontSize:'1.8rem', marginBottom:'10px' }}>{f.icon}</div>
                <h3 style={{ fontWeight:700, fontSize:'.875rem', marginBottom:'6px' }}>{f.title}</h3>
                <p style={{ color:'rgba(255,255,255,.45)', fontSize:'.78rem', lineHeight:1.65 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" style={{ padding:'80px 5%', background:'rgba(255,255,255,.015)' }}>
        <div style={{ maxWidth:'700px', margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:'50px' }}>
            <h2 style={{ fontSize:'2.2rem', fontWeight:800, letterSpacing:'-.5px' }}>Pertanyaan Umum</h2>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:'0' }}>
            {[
              { q:'Apakah ada biaya untuk jadi partner?', a:'Tidak ada! Pendaftaran partner sepenuhnya gratis. Kamu tidak perlu modal apapun.' },
              { q:'Kapan komisi dibayarkan?', a:'Komisi dibayarkan setiap awal bulan untuk transaksi bulan sebelumnya, via transfer bank atau e-wallet.' },
              { q:'Berapa minimum klien untuk mulai dapat komisi?', a:'Tidak ada minimum! Satu klien pun sudah langsung mendapat komisi 15% setiap bulannya.' },
              { q:'Apakah komisi berlaku selamanya?', a:'Ya! Selama klien yang kamu referensikan masih aktif berlangganan Mahirusaha, kamu terus mendapat komisi setiap bulan.' },
              { q:'Bagaimana cara memantau komisi saya?', a:'Kamu punya dashboard partner khusus di mahirusaha.com/partner/dashboard. Bisa dipantau kapan saja, real-time.' },
              { q:'Apakah saya perlu bantu setup teknis klien?', a:'Tidak perlu! Tim Mahirusaha yang handle semua proses teknis — setup bot, aktivasi, dan maintenance. Kamu cukup kenalkan.' },
              { q:'Berapa lama proses approval pendaftaran partner?', a:'Maksimal 1x24 jam di jam kerja. Kamu akan mendapat notifikasi WhatsApp setelah diapprove.' },
            ].map((item, i) => (
              <div key={i} style={{ borderBottom:'1px solid rgba(255,255,255,.06)', padding:'20px 0' }}>
                <p style={{ fontWeight:700, color:'#fff', marginBottom:'8px', fontSize:'.875rem' }}>❓ {item.q}</p>
                <p style={{ color:'rgba(255,255,255,.55)', fontSize:'.82rem', lineHeight:1.7 }}>{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding:'80px 5%', textAlign:'center' }}>
        <div style={{ maxWidth:'650px', margin:'0 auto' }}>
          <div style={{ background:'linear-gradient(135deg,rgba(129,140,248,.12),rgba(99,102,241,.12))', border:'1px solid rgba(129,140,248,.2)', borderRadius:'28px', padding:'56px 40px' }}>
            <div style={{ fontSize:'3rem', marginBottom:'16px' }}>🤝</div>
            <h2 style={{ fontSize:'2.2rem', fontWeight:800, letterSpacing:'-.5px', marginBottom:'14px' }}>Siap mulai hasilkan passive income?</h2>
            <p style={{ color:'rgba(255,255,255,.55)', marginBottom:'32px', fontSize:'.95rem', lineHeight:1.7 }}>
              Daftar sekarang dan mulai kenalkan Mahirusaha ke jaringan UMKM kamu. Gratis, mudah, dan menguntungkan!
            </p>
            <a href="/partner/daftar" className="pulse-p" style={{ display:'inline-flex', alignItems:'center', gap:'8px', background:'linear-gradient(135deg,#818cf8,#6366f1)', color:'#fff', padding:'15px 36px', borderRadius:'12px', textDecoration:'none', fontWeight:800, fontSize:'1rem', marginBottom:'16px' }}>
              🤝 Daftar Jadi Partner Sekarang
            </a>
            <p style={{ fontSize:'.75rem', color:'rgba(255,255,255,.3)' }}>Gratis · Approval 24 jam · Komisi 15% rekurring</p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop:'1px solid rgba(255,255,255,.06)', padding:'36px 5%', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'16px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
          <div style={{ width:'28px', height:'28px', background:'linear-gradient(135deg,#25d366,#128c7e)', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'13px' }}>💬</div>
          <span style={{ fontWeight:800, fontSize:'.9rem' }}>Mahirusaha</span>
          <span style={{ color:'rgba(255,255,255,.2)', fontSize:'.8rem' }}>Partner Program</span>
        </div>
        <p style={{ color:'rgba(255,255,255,.25)', fontSize:'.75rem' }}>© 2026 Mahirusaha. All rights reserved.</p>
        <div style={{ display:'flex', gap:'20px' }}>
          <a href="/" style={{ color:'rgba(255,255,255,.35)', fontSize:'.78rem', textDecoration:'none' }}>Beranda</a>
          <a href="/privasi" style={{ color:'rgba(255,255,255,.35)', fontSize:'.78rem', textDecoration:'none' }}>Privasi</a>
          <a href="/syarat" style={{ color:'rgba(255,255,255,.35)', fontSize:'.78rem', textDecoration:'none' }}>Syarat</a>
        </div>
      </footer>
    </main>
  )
}
