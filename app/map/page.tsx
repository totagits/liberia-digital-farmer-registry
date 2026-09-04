"use client";

import dynamic from "next/dynamic";
import PublicHeader from "../public-header";
import Link from "next/link";
import { Compass, MapPin } from "lucide-react";

// Dynamic import with ssr: false prevents window/leaflet SSR issues during static export
const InteractiveMapClient = dynamic(() => import("./interactive-map-client"), {
  ssr: false,
  loading: () => (
    <div style={{ minHeight: "80vh", display: "grid", placeItems: "center", padding: "60px 20px" }}>
      <div style={{ textAlign: "center", maxWidth: "450px" }}>
        <Compass style={{ width: 42, height: 42, color: "#166534", margin: "0 auto 16px", animation: "spin 3s linear infinite" }} />
        <h2 style={{ fontFamily: "Georgia, serif", fontSize: "24px", color: "#123f2a", margin: "0 0 8px" }}>
          Initializing Liberia Spatial Cadastre...
        </h2>
        <p style={{ color: "#64748b", fontSize: "13px", lineHeight: "1.6" }}>
          Loading 15 demarcated county boundaries, WGS 84 georeferenced parcels, and high-resolution satellite imagery layers.
        </p>
      </div>
    </div>
  ),
});

export default function MapPage() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <PublicHeader />
      <div style={{ flex: 1 }}>
        <InteractiveMapClient />
      </div>
      <footer className="public-footer">
        <Link href="/">
          <img src="/assets/liberia-seal.png" alt="Republic of Liberia" />
          <strong>Digital Farmer Registry</strong>
        </Link>
        <p>Government of Liberia · Ministry of Agriculture · Technical support from FAO · Geospatial Unit</p>
      </footer>
    </div>
  );
}
