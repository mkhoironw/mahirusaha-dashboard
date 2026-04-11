'use client'
import { useState, useEffect } from 'react'

export default function Home() {
  const [scrolled, setScrolled] = useState(false)
  const [billing, setBilling] = useState<'bulanan' | 'tahunan'>('bulanan')
  const [formEnterprise, setFormEnterprise] = useState({ nama: '', perusahaan: '', email: '', wa: '', kebutuhan: '' })
  const [formStatus, setFormStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleEnterpriseSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormStatus('loading')
    try {
      await fetch('/api/enterprise-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formEnterprise)
      })
      setFormStatus('success')
      setFormEnterprise({ nama: '', perusahaan: '', email: '', wa: '', kebutuhan: '' })
    } catch {
      setFormStatus('error')
    }
  }

  const prices = {
    starter: { bulanan: 99000, tahunan: 79000 },
    pro: { bulanan: 299000, tahunan: 239000 },
    bisnis: { bulanan: 599000, tahunan: 479000 },
  }

  const fmt = (n: number) => 'Rp ' + n.toLocaleString('id-ID')

  return (
    <main style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: '#070d1a', color: '#fff', minHeight: '100vh', overflowX: 'hidden' }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #25d366; border-radius: 2px; }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes pulse-g { 0%,100%{box-shadow:0 0 0 0 rgba(37,211,102,.4)} 50%{box-shadow:0 0 0 14px rgba(37,211,102,0)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
        @keyframes ticker { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        @keyframes glow { 0%,100%{opacity:.5} 50%{opacity:1} }
        .fadeUp { animation: fadeUp .7s ease forwards; }
        .fadeUp-2 { animation: fadeUp .7s .15s ease forwards; opacity:0; }
        .fadeUp-3 { animation: fadeUp .7s .3s ease forwards; opacity:0; }
        .float { animation: float 4s ease-in-out infinite; }
        .pulse-g { animation: pulse-g 2.5s ease-in-out infinite; }
        .shimmer-text {
          background: linear-gradient(90deg,#25d366 0%,#fff 40%,#25d366 60%,#fff 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 3s linear infinite;
        }
        .card-h { transition: transform .3s, box-shadow .3s; }
        .card-h:hover { transform: translateY(-5px); box-shadow: 0 20px 50px rgba(37,211,102,.12); }
        .nav-a { color: rgba(255,255,255,.65); text-decoration:none; font-size:.9rem; font-weight:500; transition:color .2s; }
        .nav-a:hover { color: #25d366; }
        .input-f { width:100%; background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.1); color:#fff; padding:12px 16px; border-radius:10px; font-size:.9rem; font-family:inherit; outline:none; transition:border .2s; }
        .input-f:focus { border-color: rgba(37,211,102,.5); }
        .input-f::placeholder { color: rgba(255,255,255,.3); }
        @media(max-width:768px){
          .hero-grid{flex-direction:column!important;text-align:center}
          .h1{font-size:2.4rem!important}
          .feat-grid{grid-template-columns:1fr!important}
          .price-grid{grid-template-columns:1fr!important}
          .steps-grid{grid-template-columns:1fr 1fr!important}
          .ent-grid{grid-template-columns:1fr!important}
          .hide-mob{display:none!important}
        }
      `}</style>

      {/* NAV */}
      <nav style={{ position:'fixed', top:0, left:0, right:0, zIndex:100, background: scrolled?'rgba(7,13,26,.95)':'transparent', backdropFilter: scrolled?'blur(20px)':'none', borderBottom: scrolled?'1px solid rgba(37,211,102,.1)':'none', transition:'all .3s', padding:'0 5%', display:'flex', alignItems:'center', justifyContent:'space-between', height:'68px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
          <div style={{ width:'34px', height:'34px', background:'linear-gradient(135deg,#25d366,#128c7e)', borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'16px' }}>💬</div>
          <span style={{ fontWeight:800, fontSize:'1.15rem', letterSpacing:'-.5px' }}>Mahirusaha</span>
        </div>
        <div className="hide-mob" style={{ display:'flex', alignItems:'center', gap:'28px' }}>
          {['Fitur','Harga','Enterprise','Cara Kerja'].map(t=>(
            <a key={t} href={`#${t.toLowerCase()}`} className="nav-a">{t}</a>
          ))}
        </div>
        <div style={{ display:'flex', gap:'10px' }}>
          <a href="/masuk" style={{ color:'rgba(255,255,255,.7)', padding:'10px 18px', borderRadius:'10px', textDecoration:'none', fontWeight:600, fontSize:'.85rem', border:'1px solid rgba(255,255,255,.1)' }}>Masuk</a>
          <a href="/daftar" style={{ background:'linear-gradient(135deg,#25d366,#128c7e)', color:'#fff', padding:'10px 18px', borderRadius:'10px', textDecoration:'none', fontWeight:700, fontSize:'.85rem' }}>Mulai Gratis</a>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ minHeight:'100vh', display:'flex', alignItems:'center', padding:'110px 5% 70px', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:'15%', left:'5%', width:'500px', height:'500px', background:'radial-gradient(circle,rgba(37,211,102,.09) 0%,transparent 70%)', pointerEvents:'none' }}/>
        <div style={{ position:'absolute', bottom:'10%', right:'5%', width:'350px', height:'350px', background:'radial-gradient(circle,rgba(18,140,126,.08) 0%,transparent 70%)', pointerEvents:'none' }}/>

        <div className="hero-grid" style={{ maxWidth:'1200px', margin:'0 auto', display:'flex', alignItems:'center', gap:'60px', width:'100%' }}>
          <div style={{ flex:1 }}>
            <div className="fadeUp" style={{ display:'inline-flex', alignItems:'center', gap:'8px', background:'rgba(37,211,102,.1)', border:'1px solid rgba(37,211,102,.25)', borderRadius:'100px', padding:'6px 14px', marginBottom:'22px' }}>
              <div style={{ width:'7px', height:'7px', borderRadius:'50%', background:'#25d366', animation:'glow 2s infinite' }}/>
              <span style={{ fontSize:'.78rem', color:'#25d366', fontWeight:700 }}>Platform WhatsApp Business — UMKM hingga Enterprise</span>
            </div>

            <h1 className="h1 fadeUp" style={{ fontSize:'3.6rem', fontWeight:800, lineHeight:1.12, letterSpacing:'-1.5px', marginBottom:'20px' }}>
              Satu Platform,<br/>
              <span className="shimmer-text">Semua Skala</span><br/>
              Bisnis
            </h1>

            <p className="fadeUp-2" style={{ fontSize:'1.05rem', color:'rgba(255,255,255,.6)', lineHeight:1.75, marginBottom:'34px', maxWidth:'500px' }}>
              Dari warung makan hingga perusahaan multinasional — Mahirusaha mengotomatiskan layanan WhatsApp Business dengan AI yang cerdas dan dashboard yang powerful.
            </p>

            <div className="fadeUp-3" style={{ display:'flex', gap:'12px', flexWrap:'wrap' }}>
              <a href="/daftar" className="pulse-g" style={{ background:'linear-gradient(135deg,#25d366,#128c7e)', color:'#fff', padding:'15px 30px', borderRadius:'12px', textDecoration:'none', fontWeight:700, fontSize:'.95rem', display:'inline-flex', alignItems:'center', gap:'8px' }}>
                💬 Mulai Gratis — 100 Pesan
              </a>
              <a href="#enterprise" style={{ background:'rgba(255,255,255,.05)', border:'1px solid rgba(255,255,255,.15)', color:'#fff', padding:'15px 30px', borderRadius:'12px', textDecoration:'none', fontWeight:600, fontSize:'.95rem' }}>
                Solusi Enterprise →
              </a>
            </div>

            {/* Trust badges */}
            <div style={{ marginTop:'38px', display:'flex', alignItems:'center', gap:'24px', flexWrap:'wrap' }}>
              {[['10+','UMKM Aktif'],['99%','Uptime SLA'],['24/7','AI Support'],['<2s','Response Time']].map(([n,l])=>(
                <div key={l}>
                  <div style={{ fontWeight:800, fontSize:'1.1rem', color:'#25d366' }}>{n}</div>
                  <div style={{ fontSize:'.7rem', color:'rgba(255,255,255,.4)', fontWeight:500 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat mockup */}
          <div style={{ flex:1, display:'flex', justifyContent:'center' }}>
            <div className="float" style={{ position:'relative', width:'320px' }}>
              <div style={{ background:'#111827', border:'2px solid rgba(255,255,255,.08)', borderRadius:'28px', padding:'14px', boxShadow:'0 40px 80px rgba(0,0,0,.5)' }}>
                <div style={{ background:'#128c7e', borderRadius:'14px 14px 0 0', padding:'10px 14px', display:'flex', alignItems:'center', gap:'10px' }}>
                  <div style={{ width:'34px', height:'34px', borderRadius:'50%', background:'#25d366', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:'13px' }}>PT</div>
                  <div>
                    <div style={{ fontWeight:700, fontSize:'.82rem' }}>PT Maju Bersama</div>
                    <div style={{ fontSize:'.68rem', opacity:.8 }}>● Bot Aktif</div>
                  </div>
                  <div style={{ marginLeft:'auto', fontSize:'.65rem', background:'rgba(255,255,255,.15)', padding:'3px 8px', borderRadius:'100px' }}>Enterprise</div>
                </div>
                <div style={{ background:'#0b141a', padding:'10px', borderRadius:'0 0 14px 14px', minHeight:'260px' }}>
                  {[
                    { from:'user', msg:'Halo, saya mau tanya soal produk asuransi jiwa' },
                    { from:'bot', msg:'Selamat datang di PT Maju Bersama! 😊\n\nKami memiliki 3 produk asuransi jiwa:\n• Proteksi Plus — Rp 200rb/bln\n• Family Shield — Rp 350rb/bln\n• Premium Guard — Rp 600rb/bln\n\nMau info lebih detail produk yang mana?' },
                    { from:'user', msg:'Family Shield dong' },
                    { from:'bot', msg:'Baik! Family Shield melindungi hingga 4 anggota keluarga dengan UP Rp 500 juta.\n\nMau saya sambungkan ke agen kami? 📋' },
                  ].map((c,i)=>(
                    <div key={i} style={{ display:'flex', justifyContent:c.from==='user'?'flex-end':'flex-start', marginBottom:'7px' }}>
                      <div style={{ background:c.from==='user'?'#005c4b':'#1f2c34', color:'#fff', fontSize:'.68rem', padding:'7px 10px', borderRadius:c.from==='user'?'10px 10px 0 10px':'10px 10px 10px 0', maxWidth:'82%', lineHeight:1.55, whiteSpace:'pre-line' }}>{c.msg}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ position:'absolute', top:'-14px', right:'-18px', background:'#25d366', color:'#070d1a', padding:'7px 12px', borderRadius:'100px', fontWeight:800, fontSize:'.7rem', whiteSpace:'nowrap' }}>🤖 AI Aktif 24 Jam</div>
              <div style={{ position:'absolute', bottom:'18px', left:'-22px', background:'#1e293b', border:'1px solid rgba(37,211,102,.3)', color:'#25d366', padding:'8px 12px', borderRadius:'10px', fontWeight:700, fontSize:'.7rem' }}>⚡ Respons &lt; 1 detik</div>
            </div>
          </div>
        </div>
      </section>

      {/* TICKER */}
      <div style={{ background:'rgba(37,211,102,.07)', borderTop:'1px solid rgba(37,211,102,.12)', borderBottom:'1px solid rgba(37,211,102,.12)', padding:'12px 0', overflow:'hidden' }}>
        <div style={{ display:'flex', animation:'ticker 25s linear infinite', width:'max-content' }}>
          {[...Array(2)].map((_,r)=>(
            <div key={r} style={{ display:'flex', gap:'40px', paddingRight:'40px' }}>
              {['500+ Bisnis Aktif','UMKM hingga Enterprise','AI Bahasa Indonesia','Respons Otomatis 24 Jam','Setup 15 Menit','Tanpa Coding','Dashboard Real-time','Broadcast Promo','CRM Terintegrasi'].map((t,i)=>(
                <span key={i} style={{ color:'#25d366', fontWeight:600, fontSize:'.82rem', whiteSpace:'nowrap', display:'flex', alignItems:'center', gap:'10px' }}>
                  {t} <span style={{ opacity:.3 }}>✦</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* SIAPA YANG COCOK */}
      <section style={{ padding:'80px 5%' }}>
        <div style={{ maxWidth:'1100px', margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:'48px' }}>
            <h2 style={{ fontSize:'2.2rem', fontWeight:800, letterSpacing:'-.5px', marginBottom:'12px' }}>Cocok untuk semua skala bisnis</h2>
            <p style={{ color:'rgba(255,255,255,.5)', fontSize:'.95rem' }}>Satu platform, dikustomisasi sesuai kebutuhan bisnismu</p>
          </div>
          <div className="ent-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px' }}>
            {/* UMKM */}
            <div className="card-h" style={{ background:'rgba(37,211,102,.06)', border:'1px solid rgba(37,211,102,.2)', borderRadius:'20px', padding:'32px' }}>
              <div style={{ fontSize:'2rem', marginBottom:'14px' }}>🏪</div>
              <h3 style={{ fontWeight:700, fontSize:'1.2rem', marginBottom:'8px', color:'#25d366' }}>UMKM & Bisnis Kecil</h3>
              <p style={{ color:'rgba(255,255,255,.55)', fontSize:'.875rem', lineHeight:1.7, marginBottom:'20px' }}>Warung, toko online, kuliner, fashion, jasa kecantikan, dan bisnis kecil lainnya yang ingin tampil profesional dan meningkatkan penjualan.</p>
              <div style={{ display:'flex', flexDirection:'column', gap:'8px', marginBottom:'24px' }}>
                {['Setup mudah, 15 menit langsung aktif','Harga terjangkau mulai Rp 99rb/bln','Tidak perlu tim IT','Bot berbahasa Indonesia natural'].map(f=>(
                  <div key={f} style={{ display:'flex', gap:'8px', fontSize:'.82rem', color:'rgba(255,255,255,.7)' }}>
                    <span style={{ color:'#25d366' }}>✓</span> {f}
                  </div>
                ))}
              </div>
              <a href="/daftar" style={{ display:'inline-block', background:'linear-gradient(135deg,#25d366,#128c7e)', color:'#fff', padding:'12px 24px', borderRadius:'10px', textDecoration:'none', fontWeight:700, fontSize:'.875rem' }}>Mulai Gratis →</a>
            </div>
            {/* Enterprise */}
            <div className="card-h" style={{ background:'rgba(99,102,241,.06)', border:'1px solid rgba(99,102,241,.25)', borderRadius:'20px', padding:'32px' }}>
              <div style={{ fontSize:'2rem', marginBottom:'14px' }}>🏢</div>
              <h3 style={{ fontWeight:700, fontSize:'1.2rem', marginBottom:'8px', color:'#818cf8' }}>Perusahaan & Enterprise</h3>
              <p style={{ color:'rgba(255,255,255,.55)', fontSize:'.875rem', lineHeight:1.7, marginBottom:'20px' }}>Bank, asuransi, retail chain, properti, healthcare, dan perusahaan besar yang butuh solusi WhatsApp Business terintegrasi dan skalabel.</p>
              <div style={{ display:'flex', flexDirection:'column', gap:'8px', marginBottom:'24px' }}>
                {['White-label dengan brand perusahaan','API integration ke sistem existing','SLA 99.9% uptime guarantee','Dedicated support & onboarding','Multi-departemen & multi-agent'].map(f=>(
                  <div key={f} style={{ display:'flex', gap:'8px', fontSize:'.82rem', color:'rgba(255,255,255,.7)' }}>
                    <span style={{ color:'#818cf8' }}>✓</span> {f}
                  </div>
                ))}
              </div>
              <a href="#enterprise" style={{ display:'inline-block', background:'linear-gradient(135deg,#6366f1,#4f46e5)', color:'#fff', padding:'12px 24px', borderRadius:'10px', textDecoration:'none', fontWeight:700, fontSize:'.875rem' }}>Hubungi Sales →</a>
            </div>
          </div>
        </div>
      </section>

      {/* FITUR */}
      <section id="fitur" style={{ padding:'80px 5%', background:'rgba(255,255,255,.015)' }}>
        <div style={{ maxWidth:'1100px', margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:'50px' }}>
            <div style={{ display:'inline-block', background:'rgba(37,211,102,.1)', border:'1px solid rgba(37,211,102,.2)', borderRadius:'100px', padding:'5px 14px', marginBottom:'14px', color:'#25d366', fontSize:'.78rem', fontWeight:700 }}>FITUR LENGKAP</div>
            <h2 style={{ fontSize:'2.2rem', fontWeight:800, letterSpacing:'-.5px', marginBottom:'10px' }}>Semua yang kamu butuhkan</h2>
          </div>
          <div className="feat-grid" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'16px' }}>
            {[
              { icon:'🤖', title:'AI Chatbot 24 Jam', desc:'Jawab pertanyaan pelanggan otomatis kapan saja dengan AI yang memahami konteks bisnis kamu.', tag:'Semua Paket' },
              { icon:'📦', title:'Katalog Produk & Layanan', desc:'Isi produk sekali, bot langsung bisa jelaskan harga, stok, dan detail ke semua pelanggan.', tag:'Semua Paket' },
              { icon:'📢', title:'Broadcast & Campaign', desc:'Kirim promo ke ribuan kontak sekaligus. Jadwal otomatis, anti-banned, personalisasi pesan.', tag:'Pro+' },
              { icon:'👥', title:'CRM & Pipeline', desc:'Kelola prospek, tandai pelanggan VIP, dan follow-up otomatis untuk closing lebih banyak.', tag:'Pro+' },
              { icon:'🔌', title:'API & Integrasi', desc:'Hubungkan ke CRM, ERP, atau sistem internal perusahaan melalui REST API yang lengkap.', tag:'Enterprise' },
              { icon:'🏷️', title:'White-label', desc:'Bot tampil dengan nama dan brand perusahaanmu. Pelanggan tidak tahu platform yang digunakan.', tag:'Enterprise' },
              { icon:'📊', title:'Analytics & Laporan', desc:'Dashboard real-time: jumlah chat, konversi, produk terpopuler, performa per agent.', tag:'Bisnis+' },
              { icon:'🔄', title:'Human Takeover', desc:'Ambil alih percakapan dari bot kapan saja. Sistem cerdas eskalasi otomatis ke agen manusia.', tag:'Semua Paket' },
              { icon:'🛡️', title:'SLA & Uptime 99.9%', desc:'Infrastruktur enterprise-grade dengan monitoring 24 jam dan garansi uptime untuk bisnis besar.', tag:'Enterprise' },
            ].map((f,i)=>(
              <div key={i} className="card-h" style={{ background:'rgba(255,255,255,.03)', border:'1px solid rgba(255,255,255,.07)', borderRadius:'16px', padding:'24px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'14px' }}>
                  <span style={{ fontSize:'1.6rem' }}>{f.icon}</span>
                  <span style={{ fontSize:'.65rem', fontWeight:700, padding:'3px 8px', borderRadius:'100px', background: f.tag==='Enterprise'?'rgba(99,102,241,.15)':f.tag==='Semua Paket'?'rgba(37,211,102,.12)':'rgba(255,255,255,.08)', color: f.tag==='Enterprise'?'#818cf8':f.tag==='Semua Paket'?'#25d366':'rgba(255,255,255,.6)' }}>{f.tag}</span>
                </div>
                <h3 style={{ fontWeight:700, fontSize:'.95rem', marginBottom:'8px' }}>{f.title}</h3>
                <p style={{ color:'rgba(255,255,255,.45)', fontSize:'.82rem', lineHeight:1.65 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HARGA */}
      <section id="harga" style={{ padding:'80px 5%' }}>
        <div style={{ maxWidth:'1100px', margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:'50px' }}>
            <div style={{ display:'inline-block', background:'rgba(37,211,102,.1)', border:'1px solid rgba(37,211,102,.2)', borderRadius:'100px', padding:'5px 14px', marginBottom:'14px', color:'#25d366', fontSize:'.78rem', fontWeight:700 }}>HARGA TRANSPARAN</div>
            <h2 style={{ fontSize:'2.2rem', fontWeight:800, letterSpacing:'-.5px', marginBottom:'16px' }}>Pilih paket yang tepat</h2>
            {/* Toggle billing */}
            <div style={{ display:'inline-flex', background:'rgba(255,255,255,.05)', border:'1px solid rgba(255,255,255,.1)', borderRadius:'100px', padding:'4px' }}>
              {(['bulanan','tahunan'] as const).map(b=>(
                <button key={b} onClick={()=>setBilling(b)} style={{ padding:'8px 20px', borderRadius:'100px', border:'none', cursor:'pointer', fontWeight:600, fontSize:'.85rem', fontFamily:'inherit', background: billing===b?'#25d366':'transparent', color: billing===b?'#070d1a':'rgba(255,255,255,.6)', transition:'all .2s' }}>
                  {b==='bulanan'?'Bulanan':'Tahunan'}{b==='tahunan'&&<span style={{ marginLeft:'6px', fontSize:'.7rem', background:'rgba(37,211,102,.2)', color:'#25d366', padding:'2px 6px', borderRadius:'100px' }}>Hemat 20%</span>}
                </button>
              ))}
            </div>
          </div>

          <div className="price-grid" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'16px' }}>
            {[
              { kode:'starter', name:'Starter', desc:'Untuk UMKM yang baru mulai', color:'rgba(255,255,255,.04)', border:'rgba(255,255,255,.09)', popular:false,
                features:['1 Toko','1.000 pesan/bulan','AI Chatbot 24 jam','Katalog produk','Support email'] },
              { kode:'pro', name:'Pro', desc:'Untuk bisnis yang ingin tumbuh', color:'rgba(37,211,102,.07)', border:'rgba(37,211,102,.35)', popular:true,
                features:['3 Toko','5.000 pesan/bulan','Semua fitur Starter','Broadcast promo','CRM pelanggan','Laporan harian'] },
              { kode:'bisnis', name:'Bisnis', desc:'Untuk bisnis menengah', color:'rgba(255,255,255,.04)', border:'rgba(255,255,255,.09)', popular:false,
                features:['10 Toko','20.000 pesan/bulan','Semua fitur Pro','Multi-agent CS','Laporan advanced','Priority support'] },
              { kode:'enterprise', name:'Enterprise', desc:'Untuk perusahaan besar', color:'rgba(99,102,241,.07)', border:'rgba(99,102,241,.3)', popular:false,
                features:['Unlimited Toko','Unlimited pesan','White-label','API integration','SLA 99.9%','Dedicated support','Custom integration'] },
            ].map((p)=>(
              <div key={p.kode} className="card-h" style={{ background:p.color, border:`1px solid ${p.border}`, borderRadius:'20px', padding:'24px', position:'relative', display:'flex', flexDirection:'column' }}>
                {p.popular&&<div style={{ position:'absolute', top:'-12px', left:'50%', transform:'translateX(-50%)', background:'#25d366', color:'#070d1a', fontSize:'.68rem', fontWeight:800, padding:'4px 14px', borderRadius:'100px', whiteSpace:'nowrap' }}>TERPOPULER</div>}
                <div style={{ marginBottom:'16px' }}>
                  <h3 style={{ fontWeight:800, fontSize:'1rem', marginBottom:'4px' }}>{p.name}</h3>
                  <p style={{ color:'rgba(255,255,255,.45)', fontSize:'.75rem' }}>{p.desc}</p>
                </div>
                <div style={{ marginBottom:'20px' }}>
                  {p.kode==='enterprise' ? (
                    <div style={{ fontSize:'1.4rem', fontWeight:800, color:'#818cf8' }}>Custom</div>
                  ) : (
                    <div style={{ display:'flex', alignItems:'baseline', gap:'3px' }}>
                      <span style={{ fontSize:'.75rem', color:'rgba(255,255,255,.4)' }}>Rp</span>
                      <span style={{ fontSize:'1.5rem', fontWeight:800, color:p.popular?'#25d366':'#fff' }}>
                        {(prices[p.kode as keyof typeof prices][billing]/1000).toLocaleString('id-ID')}rb
                      </span>
                      <span style={{ fontSize:'.75rem', color:'rgba(255,255,255,.4)' }}>/bln</span>
                    </div>
                  )}
                </div>
                <div style={{ flex:1, marginBottom:'20px' }}>
                  {p.features.map(f=>(
                    <div key={f} style={{ display:'flex', gap:'8px', fontSize:'.78rem', color:'rgba(255,255,255,.65)', marginBottom:'8px' }}>
                      <span style={{ color: p.kode==='enterprise'?'#818cf8':'#25d366' }}>✓</span> {f}
                    </div>
                  ))}
                </div>
                <a href={p.kode==='enterprise'?'#enterprise':'/daftar'} style={{ display:'block', textAlign:'center', background: p.kode==='enterprise'?'linear-gradient(135deg,#6366f1,#4f46e5)':p.popular?'linear-gradient(135deg,#25d366,#128c7e)':'rgba(255,255,255,.07)', color:'#fff', padding:'12px', borderRadius:'10px', textDecoration:'none', fontWeight:700, fontSize:'.82rem', border: (!p.popular&&p.kode!=='enterprise')?'1px solid rgba(255,255,255,.1)':'none' }}>
                  {p.kode==='enterprise'?'Hubungi Sales':'Mulai Gratis'}
                </a>
              </div>
            ))}
          </div>
          <p style={{ textAlign:'center', marginTop:'20px', color:'rgba(255,255,255,.35)', fontSize:'.8rem' }}>Semua paket sudah termasuk gratis 100 pesan pertama · Tidak perlu kartu kredit · Cancel kapan saja</p>
        </div>
      </section>

      {/* CARA KERJA */}
      <section id="cara kerja" style={{ padding:'80px 5%', background:'rgba(255,255,255,.015)' }}>
        <div style={{ maxWidth:'1000px', margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:'50px' }}>
            <div style={{ display:'inline-block', background:'rgba(37,211,102,.1)', border:'1px solid rgba(37,211,102,.2)', borderRadius:'100px', padding:'5px 14px', marginBottom:'14px', color:'#25d366', fontSize:'.78rem', fontWeight:700 }}>CARA KERJA</div>
            <h2 style={{ fontSize:'2.2rem', fontWeight:800, letterSpacing:'-.5px' }}>Aktif dalam 15 menit</h2>
          </div>
          <div className="steps-grid" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'20px' }}>
            {[
              { step:'01', icon:'📝', title:'Daftar Akun', desc:'Buat akun gratis, tidak perlu kartu kredit.' },
              { step:'02', icon:'🏪', title:'Isi Info Bisnis', desc:'Masukkan info toko, produk, dan layanan.' },
              { step:'03', icon:'💳', title:'Pilih Paket', desc:'Mulai Rp 99rb/bln atau hubungi sales untuk Enterprise.' },
              { step:'04', icon:'🚀', title:'Bot Aktif!', desc:'WhatsApp-mu langsung balas pelanggan otomatis.' },
            ].map((s,i)=>(
              <div key={i} style={{ textAlign:'center', position:'relative' }}>
                {i<3&&<div style={{ position:'absolute', top:'25px', left:'60%', right:'-10px', height:'1px', background:'linear-gradient(90deg,rgba(37,211,102,.3),transparent)' }}/>}
                <div style={{ width:'52px', height:'52px', borderRadius:'14px', background:'rgba(37,211,102,.12)', border:'1px solid rgba(37,211,102,.25)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.4rem', margin:'0 auto 14px', position:'relative', zIndex:1 }}>{s.icon}</div>
                <div style={{ fontSize:'.65rem', color:'#25d366', fontWeight:700, letterSpacing:'.08em', marginBottom:'5px' }}>LANGKAH {s.step}</div>
                <h3 style={{ fontWeight:700, marginBottom:'6px', fontSize:'.9rem' }}>{s.title}</h3>
                <p style={{ color:'rgba(255,255,255,.45)', fontSize:'.78rem', lineHeight:1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ENTERPRISE CONTACT */}
      <section id="enterprise" style={{ padding:'80px 5%' }}>
        <div style={{ maxWidth:'900px', margin:'0 auto' }}>
          <div style={{ background:'rgba(99,102,241,.06)', border:'1px solid rgba(99,102,241,.2)', borderRadius:'28px', padding:'56px 48px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'48px', alignItems:'center' }}>
            <div>
              <div style={{ display:'inline-block', background:'rgba(99,102,241,.15)', border:'1px solid rgba(99,102,241,.3)', borderRadius:'100px', padding:'5px 14px', marginBottom:'20px', color:'#818cf8', fontSize:'.78rem', fontWeight:700 }}>ENTERPRISE</div>
              <h2 style={{ fontSize:'1.9rem', fontWeight:800, letterSpacing:'-.5px', marginBottom:'16px', lineHeight:1.25 }}>Solusi khusus untuk<br/>perusahaan besar</h2>
              <p style={{ color:'rgba(255,255,255,.5)', fontSize:'.875rem', lineHeight:1.75, marginBottom:'24px' }}>Tim kami siap membantu merancang solusi WhatsApp Business yang sesuai dengan kebutuhan spesifik perusahaanmu — mulai dari integrasi sistem, white-label, hingga SLA enterprise.</p>
              <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
                {[['🏢','Sudah dipercaya perusahaan di berbagai industri'],['⚡','Onboarding & implementasi terbimbing'],['🔒','Data aman, infrastruktur enterprise-grade'],['📞','Dedicated account manager']].map(([icon,text])=>(
                  <div key={text} style={{ display:'flex', gap:'12px', alignItems:'center', fontSize:'.82rem', color:'rgba(255,255,255,.65)' }}>
                    <span style={{ fontSize:'1rem' }}>{icon}</span> {text}
                  </div>
                ))}
              </div>
            </div>

            {/* Form */}
            <div>
              {formStatus==='success' ? (
                <div style={{ textAlign:'center', padding:'40px 20px' }}>
                  <div style={{ fontSize:'3rem', marginBottom:'16px' }}>✅</div>
                  <h3 style={{ fontWeight:700, marginBottom:'8px' }}>Terima kasih!</h3>
                  <p style={{ color:'rgba(255,255,255,.5)', fontSize:'.875rem' }}>Tim kami akan menghubungi kamu dalam 1x24 jam untuk menjadwalkan demo.</p>
                </div>
              ) : (
                <form onSubmit={handleEnterpriseSubmit} style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
                  <h3 style={{ fontWeight:700, fontSize:'1rem', marginBottom:'4px' }}>Hubungi tim Enterprise kami</h3>
                  <input required className="input-f" placeholder="Nama lengkap *" value={formEnterprise.nama} onChange={e=>setFormEnterprise(p=>({...p,nama:e.target.value}))} />
                  <input required className="input-f" placeholder="Nama perusahaan *" value={formEnterprise.perusahaan} onChange={e=>setFormEnterprise(p=>({...p,perusahaan:e.target.value}))} />
                  <input required type="email" className="input-f" placeholder="Email bisnis *" value={formEnterprise.email} onChange={e=>setFormEnterprise(p=>({...p,email:e.target.value}))} />
                  <input className="input-f" placeholder="Nomor WhatsApp" value={formEnterprise.wa} onChange={e=>setFormEnterprise(p=>({...p,wa:e.target.value}))} />
                  <textarea className="input-f" placeholder="Kebutuhan spesifik (opsional)" rows={3} value={formEnterprise.kebutuhan} onChange={e=>setFormEnterprise(p=>({...p,kebutuhan:e.target.value}))} style={{ resize:'none' }}/>
                  <button type="submit" disabled={formStatus==='loading'} style={{ background:'linear-gradient(135deg,#6366f1,#4f46e5)', color:'#fff', padding:'13px', borderRadius:'10px', border:'none', fontWeight:700, fontSize:'.875rem', cursor:'pointer', fontFamily:'inherit', opacity: formStatus==='loading'?.7:1 }}>
                    {formStatus==='loading'?'Mengirim...':'Jadwalkan Demo Gratis →'}
                  </button>
                  <p style={{ fontSize:'.72rem', color:'rgba(255,255,255,.3)', textAlign:'center' }}>Respons dalam 1x24 jam · Demo via Zoom 30 menit · Gratis</p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={{ padding:'80px 5%', textAlign:'center' }}>
        <div style={{ maxWidth:'650px', margin:'0 auto' }}>
          <div style={{ background:'linear-gradient(135deg,rgba(37,211,102,.12),rgba(18,140,126,.12))', border:'1px solid rgba(37,211,102,.2)', borderRadius:'28px', padding:'56px 40px' }}>
            <h2 style={{ fontSize:'2.2rem', fontWeight:800, letterSpacing:'-.5px', marginBottom:'14px' }}>Mulai tingkatkan bisnismu hari ini</h2>
            <p style={{ color:'rgba(255,255,255,.55)', marginBottom:'32px', fontSize:'.95rem' }}>Bergabung dengan ratusan bisnis yang sudah merasakan manfaatnya</p>
            <div style={{ display:'flex', gap:'12px', justifyContent:'center', flexWrap:'wrap' }}>
              <a href="/daftar" className="pulse-g" style={{ display:'inline-flex', alignItems:'center', gap:'8px', background:'linear-gradient(135deg,#25d366,#128c7e)', color:'#fff', padding:'15px 30px', borderRadius:'12px', textDecoration:'none', fontWeight:800, fontSize:'.95rem' }}>
                💬 Mulai Gratis — 100 Pesan
              </a>
              <a href="#enterprise" style={{ display:'inline-flex', alignItems:'center', gap:'8px', background:'linear-gradient(135deg,#6366f1,#4f46e5)', color:'#fff', padding:'15px 30px', borderRadius:'12px', textDecoration:'none', fontWeight:700, fontSize:'.95rem' }}>
                🏢 Solusi Enterprise
              </a>
            </div>
            <p style={{ marginTop:'16px', fontSize:'.75rem', color:'rgba(255,255,255,.3)' }}>Tidak perlu kartu kredit · Setup 15 menit · Cancel kapan saja</p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop:'1px solid rgba(255,255,255,.06)', padding:'36px 5%', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'16px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
          <div style={{ width:'28px', height:'28px', background:'linear-gradient(135deg,#25d366,#128c7e)', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'13px' }}>💬</div>
          <span style={{ fontWeight:800, fontSize:'.9rem' }}>Mahirusaha</span>
          <span style={{ color:'rgba(255,255,255,.2)', fontSize:'.8rem' }}>Platform WhatsApp Business untuk Semua Skala Bisnis</span>
        </div>
        <p style={{ color:'rgba(255,255,255,.25)', fontSize:'.75rem' }}>© 2026 Mahirusaha. All rights reserved.</p>
        <div style={{ display:'flex', gap:'20px' }}>
          
		  <a href="/privasi" style={{ color:'rgba(255,255,255,.35)', fontSize:'.78rem', textDecoration:'none' }}>Privasi</a>
		  <a href="/syarat" style={{ color:'rgba(255,255,255,.35)', fontSize:'.78rem', textDecoration:'none' }}>Syarat Layanan</a>
		  <a href="#enterprise" style={{ color:'rgba(255,255,255,.35)', fontSize:'.78rem', textDecoration:'none' }}>Hubungi Kami</a>
		
		</div>
      </footer>
    </main>
  )
}