"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  ["Home", "/"],
  ["Platform", "/platform"],
  ["Services", "/services"],
  ["Governance", "/governance"],
  ["About", "/about"],
] as const;

export default function PublicHeader() {
  const pathname = usePathname();
  return (
    <header className="site-header public-subheader glass">
      <Link href="/" className="brand brand-fao">
        <img src="/assets/fao-logo.png" alt="FAO" />
        <div><strong>Digital Farmer Registry</strong><span>Republic of Liberia</span></div>
      </Link>
      <nav aria-label="Primary navigation">
        {links.map(([label, href]) => <Link className={pathname === href ? "active" : ""} href={href} key={href}>{label}</Link>)}
      </nav>
      <div className="header-actions">
        <div className="brand moa"><div><span>Led by</span><strong>Ministry of Agriculture</strong></div><img src="/assets/moa-logo.png" alt="Ministry of Agriculture Liberia" /></div>
        <Link className="signin" href="/dashboard">Sign in <span>↗</span></Link>
      </div>
    </header>
  );
}
