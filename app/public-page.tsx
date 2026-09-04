import Link from "next/link";
import PublicHeader from "./public-header";

type Card = { icon:string; title:string; text:string; action?:string };
export default function PublicPage({eyebrow,title,intro,cards,steps,closing}:{eyebrow:string;title:string;intro:string;cards:Card[];steps:{title:string;text:string}[];closing:string}){
 return <main className="public-page">
  <PublicHeader />
  <section className="public-page-hero"><div><span>{eyebrow}</span><h1>{title}</h1><p>{intro}</p><div><Link className="primary" href="/dashboard">Enter the live platform →</Link><a className="outline-action" href="#capabilities">Explore capabilities ↓</a></div></div><aside><b>National scope</b><strong>15 counties</strong><span>Role-governed · Offline-ready · Geospatial</span></aside></section>
  <section id="capabilities" className="public-capabilities"><header><span>Operational capabilities</span><h2>Designed for real agricultural service delivery</h2></header><div>{cards.map(c=><article key={c.title}><i>{c.icon}</i><h3>{c.title}</h3><p>{c.text}</p>{c.action&&<Link href={c.action}>Open workspace →</Link>}</article>)}</div></section>
  <section className="public-process"><header><span>How it works</span><h2>Controlled from field activity to national decision</h2></header><ol>{steps.map((s,i)=><li key={s.title}><b>{String(i+1).padStart(2,"0")}</b><div><h3>{s.title}</h3><p>{s.text}</p></div></li>)}</ol></section>
  <section className="public-cta"><div><span>Digital public infrastructure for agriculture</span><h2>{closing}</h2></div><Link href="/dashboard">Explore the platform →</Link></section>
  <footer className="public-footer"><Link href="/"><img src="/assets/liberia-seal.png" alt="Republic of Liberia"/><strong>Digital Farmer Registry</strong></Link><p>Government of Liberia · Ministry of Agriculture · Technical support from FAO</p></footer>
 </main>
}
