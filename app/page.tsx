"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

const slides = [
  { src: "/assets/rice-farmers.jpg", title: "Women powering Liberia's rice economy", meta: "Farmer registration · Gender inclusion" },
  { src: "/assets/enumerator.jpg", title: "Field intelligence, even offline", meta: "GPS parcel mapping · Secure synchronization" },
  { src: "/assets/cocoa-farmers.jpg", title: "Traceable farms, stronger value chains", meta: "Cocoa production · Farmer services" },
  { src: "/assets/cassava-coop.jpg", title: "Youth cooperatives connected to opportunity", meta: "Processing · Cooperatives · Markets" },
];

const features = [
  {
    num: "01",
    title: "One national farmer record",
    desc: "Register farmers, households, farms, parcels, cooperatives and agribusinesses once—then serve them across authorized programmes.",
    href: "/signin?redirect=/dashboard#farmers&domain=Farmer+Registry&role=Senior+enumerator&cat=field",
    clearance: "Field Registrar Clearance",
  },
  {
    num: "02",
    title: "Field-ready GIS",
    desc: "Capture GPS points and parcel boundaries, calculate area, validate geometry and synchronize when connectivity returns.",
    href: "/signin?redirect=/dashboard#parcels&domain=Farms+%26+GIS&role=GIS+officer&cat=field",
    clearance: "Cadastral & GIS Clearance",
  },
  {
    num: "03",
    title: "Interoperable by design",
    desc: "Secure open APIs connect agriculture, social protection, identity, statistics, land, weather and payment ecosystems.",
    href: "/signin?redirect=/dashboard#interoperability&domain=Institutional+Governance&role=System+administrator&cat=admin",
    clearance: "Systems & Interop Clearance",
  },
  {
    num: "04",
    title: "Trusted decisions",
    desc: "Verification workflows, data-quality controls, audit history and gender-, youth- and geography-disaggregated analytics.",
    href: "/signin?redirect=/dashboard#audit-evidence&domain=Audit+%26+Security&role=Security+auditor&cat=oversight",
    clearance: "Auditor & Oversight Clearance",
  },
];

export default function Home() {
  const [slide, setSlide] = useState(0);
  const [query, setQuery] = useState("");
  useEffect(() => { const id = window.setInterval(() => setSlide((v) => (v + 1) % slides.length), 5200); return () => clearInterval(id); }, []);
  const results = useMemo(() => query.trim() ? ["Farmer registration", "Farm parcel mapping", "Programmes & services", "Data governance"].filter(x => x.toLowerCase().includes(query.toLowerCase())) : [], [query]);
  return (
    <main id="home">
      <header className="site-header glass">
        <div className="brand brand-fao"><img src="/assets/fao-logo.png" alt="FAO"/><div><strong>Digital Farmer Registry</strong><span>Republic of Liberia</span></div></div>
        <nav aria-label="Primary navigation"><Link href="/">Home</Link><Link href="/platform">Platform</Link><Link href="/services">Services</Link><Link href="/governance">Governance</Link><Link href="/about">About</Link></nav>
        <div className="header-actions"><div className="brand moa"><div><span>Led by</span><strong>Ministry of Agriculture</strong></div><img src="/assets/moa-logo.png" alt="Ministry of Agriculture Liberia"/></div><Link className="signin" href="/signin">Sign in <span>↗</span></Link></div>
        <div className="site-search"><span>⌕</span><input aria-label="Search the platform" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search the registry, services, reports and help…"/><kbd>⌘ K</kbd>{results.length>0&&<div className="search-results">{results.map(r=><a key={r} href="#platform">{r}<span>→</span></a>)}</div>}</div>
      </header>

      <section className="hero">
        <div className="hero-orb orb-one"/><div className="hero-orb orb-two"/>
        <div className="hero-copy">
          <div className="eyebrow"><span/> Liberia's digital public infrastructure for agriculture</div>
          <h1>Every farmer visible.<br/><em>Every farm connected.</em></h1>
          <p>A trusted national platform that turns farmer and farm data into faster services, smarter policy and resilient rural livelihoods.</p>
          <div className="hero-actions"><Link className="primary" href="/signin?redirect=/dashboard">Explore the live platform <span>→</span></Link><a className="secondary" href="#platform"><span className="play">▶</span> See how it works</a></div>
          <div className="stats"><div><strong>15</strong><span>Counties covered</span></div><div><strong>24</strong><span>Role-based workspaces</span></div><div><strong>360°</strong><span>Farmer & farm view</span></div><div><strong>Offline</strong><span>Field registration</span></div></div>
        </div>
        <div className="hero-visual glass">
          <div className="slide-stage">{slides.map((s,i)=><img key={s.src} className={i===slide?"active":""} src={s.src} alt={s.title}/>)}</div>
          <div className="image-shade"/><div className="slide-caption"><span>0{slide+1} / 0{slides.length}</span><h2>{slides[slide].title}</h2><p>{slides[slide].meta}</p></div>
          <div className="slide-controls"><button aria-label="Previous" onClick={()=>setSlide((slide-1+slides.length)%slides.length)}>←</button><div>{slides.map((_,i)=><button aria-label={`Go to slide ${i+1}`} onClick={()=>setSlide(i)} className={i===slide?"dot active":"dot"} key={i}/>)}</div><button aria-label="Next" onClick={()=>setSlide((slide+1)%slides.length)}>→</button></div>
          <div className="live-chip"><i/> Live field intelligence</div>
        </div>
      </section>

      <section id="governance" className="trust-strip"><span>Government-led</span><b>•</b><span>Secure by design</span><b>•</b><span>Register once, use many times</span><b>•</b><span>Built for low connectivity</span></section>
      <section id="platform" className="feature-section"><div className="section-heading"><div><span>National capability</span><h2>One platform. A complete view of rural livelihoods.</h2></div><p>From first registration to verified service delivery, every workflow is connected, governed and measurable.</p></div><div className="feature-grid">{features.map(f=><article className="feature-card glass" key={f.num}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}><span>{f.num}</span><span style={{ fontSize: "0.68rem", padding: "2px 7px", borderRadius: "4px", background: "rgba(34, 197, 94, 0.12)", color: "#86efac", border: "1px solid rgba(34, 197, 94, 0.25)", letterSpacing: "0.02em" }}>🔒 {f.clearance}</span></div><h3>{f.title}</h3><p>{f.desc}</p><Link href={f.href}>Authenticate & Open →</Link></article>)}</div></section>
      <section id="services" className="impact-section"><div className="impact-image"><img src="/assets/enumerator.jpg" alt="Enumerator mapping a Liberian farm"/><div className="map-badge glass"><strong>6.3182° N</strong><span>Verified farm location</span></div></div><div className="impact-copy"><span>From field to policy</span><h2>Designed around the realities of Liberian agriculture.</h2><p>The platform continues working when the network does not. Enumerators capture complete household and parcel records in the field, supervisors verify quality, and leaders see evidence they can act on.</p><ul><li><b>Offline-first registration</b><span>Encrypted device drafts and resilient synchronization.</span></li><li><b>Parcel-level traceability</b><span>GPS points, polygons, area and production history.</span></li><li><b>Transparent service delivery</b><span>Programmes, inputs, vouchers and payment reconciliation.</span></li></ul></div></section>
      <footer id="about"><div><img src="/assets/liberia-seal.png" alt="Republic of Liberia"/><strong>Digital Farmer Registry</strong></div><p>A Government of Liberia platform led by the Ministry of Agriculture with technical support from FAO.</p><Link href="/signin?redirect=/dashboard">Enter the platform →</Link></footer>
    </main>
  );
}
