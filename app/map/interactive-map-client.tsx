"use client";

import React, { useEffect, useMemo, useState } from "react";
import { MapContainer, Marker, Polygon, Popup, TileLayer, GeoJSON, useMap } from "react-leaflet";
import L from "leaflet";
import Link from "next/link";
import {
  Compass,
  Layers3,
  MapPin,
  Maximize2,
  Minimize2,
  ShieldCheck,
  TrendingUp,
  Truck,
  Warehouse,
  Wrench,
  Droplets,
  Radio,
  ExternalLink,
  ChevronRight,
  Info,
  RotateCcw,
  CheckCircle2,
  Lock,
  Eye,
  Map as MapIcon,
} from "lucide-react";
import "leaflet/dist/leaflet.css";
import { COUNTIES_GEO, CountyInfo } from "./liberia-counties-data";

// WGS 84 Bounds for Liberia
const LIBERIA_BOUNDS: L.LatLngBoundsExpression = [
  [4.15, -11.65],
  [8.75, -7.25],
];

export interface FarmCadastre {
  id: string;
  maskedHolder: string;
  county: string;
  district: string;
  community: string;
  commodity: string;
  variety: string;
  areaHa: number;
  areaAcres: number;
  perimeterM: number;
  centroid: [number, number];
  accuracyM: number;
  roadAccess: string;
  roadCondition: string;
  roadDistanceMi: number;
  nearestMarket: string;
  marketDistanceKm: number;
  marketTravelMins: number;
  storageType: string;
  storageCapacityMt: number;
  processingFacility: string;
  processingDistanceMi: number;
  mechanizationMode: string;
  irrigationStatus: string;
  smartReadiness: string;
  verificationStatus: string;
  verifiedDate: string;
  vertices: [number, number][];
}

// 15 Demarcated Liberian Counties from Official Dataset
const COUNTIES: CountyInfo[] = COUNTIES_GEO;

// Rich Georeferenced Farm Cadastral Parcels
const SEEDED_PARCELS: FarmCadastre[] = [
  // Montserrado Parcels
  {
    id: "PCL-MO-00412",
    maskedHolder: "Farmer H. K. (Smallholder)",
    county: "Montserrado",
    district: "Todee",
    community: "Nyenhn",
    commodity: "Vegetables",
    variety: "Sweet Pepper, Bitterball, Okra",
    areaHa: 2.8,
    areaAcres: 6.92,
    perimeterM: 710,
    centroid: [6.612, -10.584],
    accuracyM: 1.4,
    roadAccess: "Paved all-weather road",
    roadCondition: "Good",
    roadDistanceMi: 0.3,
    nearestMarket: "Red Light Wholesale Market, Paynesville",
    marketDistanceKm: 18.2,
    marketTravelMins: 40,
    storageType: "Community ventilated warehouse & crates",
    storageCapacityMt: 4.5,
    processingFacility: "Todee Agro Aggregation Center",
    processingDistanceMi: 0.8,
    mechanizationMode: "Semi-mechanized (Rotary power tiller)",
    irrigationStatus: "Solar drip irrigation & shallow well",
    smartReadiness: "USSD market prices & daily rainfall SMS",
    verificationStatus: "FIELD_VERIFIED",
    verifiedDate: "2026-08-14",
    vertices: [
      [6.614, -10.587],
      [6.615, -10.582],
      [6.610, -10.581],
      [6.609, -10.586],
    ],
  },
  {
    id: "PCL-MO-00489",
    maskedHolder: "Farmer D. T. (Coop Member)",
    county: "Montserrado",
    district: "Careysburg",
    community: "Bensonville Outskirts",
    commodity: "Cassava",
    variety: "TMS 96/026 (High starch)",
    areaHa: 3.5,
    areaAcres: 8.65,
    perimeterM: 840,
    centroid: [6.495, -10.612],
    accuracyM: 1.8,
    roadAccess: "Paved all-weather road",
    roadCondition: "Fair",
    roadDistanceMi: 0.5,
    nearestMarket: "Careysburg Junction Market",
    marketDistanceKm: 4.1,
    marketTravelMins: 15,
    storageType: "Hermetic bulk storage & dried chips shed",
    storageCapacityMt: 6.0,
    processingFacility: "Bensonville Mechanized Gari Mill",
    processingDistanceMi: 1.2,
    mechanizationMode: "Tractor plowing service hire",
    irrigationStatus: "Rainfed with drainage canals",
    smartReadiness: "Basic mobile feature phone (SMS alerts)",
    verificationStatus: "FIELD_VERIFIED",
    verifiedDate: "2026-07-28",
    vertices: [
      [6.498, -10.615],
      [6.499, -10.608],
      [6.492, -10.609],
      [6.491, -10.616],
    ],
  },

  // Nimba Parcels
  {
    id: "PCL-NI-00104",
    maskedHolder: "Farmer B. M. (Master Cocoa Producer)",
    county: "Nimba",
    district: "Sanniquellie-Mahn",
    community: "Lugbehyee",
    commodity: "Cocoa",
    variety: "Criollo & Forastero F1 Hybrid",
    areaHa: 5.4,
    areaAcres: 13.34,
    perimeterM: 1050,
    centroid: [7.362, -8.718],
    accuracyM: 1.2,
    roadAccess: "Graded laterite feeder road",
    roadCondition: "Passable year-round",
    roadDistanceMi: 1.1,
    nearestMarket: "Ganta International Border Market",
    marketDistanceKm: 26.5,
    marketTravelMins: 50,
    storageType: "Raised solar drying beds & jute warehouse",
    storageCapacityMt: 12.0,
    processingFacility: "Nimba Cocoa Fermentary & Quality Hub",
    processingDistanceMi: 2.4,
    mechanizationMode: "Motorized mist blower & mechanical pruners",
    irrigationStatus: "Rainfed upland canopy agroforestry",
    smartReadiness: "Traceability QR code tagged & GPS validated",
    verificationStatus: "FIELD_VERIFIED",
    verifiedDate: "2026-08-20",
    vertices: [
      [7.366, -8.722],
      [7.367, -8.714],
      [7.358, -8.713],
      [7.357, -8.723],
    ],
  },
  {
    id: "PCL-NI-00215",
    maskedHolder: "Farmer E. G. (Outgrower)",
    county: "Nimba",
    district: "Garr Bain",
    community: "Ganta Rural",
    commodity: "Rice",
    variety: "Nerica L-19 (Lowland swamp)",
    areaHa: 4.1,
    areaAcres: 10.13,
    perimeterM: 890,
    centroid: [7.288, -8.965],
    accuracyM: 1.6,
    roadAccess: "Paved Monrovia-Ganta Highway",
    roadCondition: "Excellent",
    roadDistanceMi: 0.2,
    nearestMarket: "Ganta Central Market",
    marketDistanceKm: 3.5,
    marketTravelMins: 12,
    storageType: "PICS bags & metal storage silo",
    storageCapacityMt: 8.5,
    processingFacility: "Ganta Modern Rice Dehuller & Polisher",
    processingDistanceMi: 1.8,
    mechanizationMode: "Walk-behind power tiller & drum seeder",
    irrigationStatus: "Perennial stream diversion canal",
    smartReadiness: "Smartphone DFR PWA & mobile money integration",
    verificationStatus: "FIELD_VERIFIED",
    verifiedDate: "2026-08-05",
    vertices: [
      [7.291, -8.969],
      [7.292, -8.961],
      [7.285, -8.960],
      [7.284, -8.970],
    ],
  },

  // Bong Parcels
  {
    id: "PCL-BG-00088",
    maskedHolder: "Farmer A. W. (Cooperative Lead)",
    county: "Bong",
    district: "Suakoko",
    community: "Kpatawee Rice Basin",
    commodity: "Rice",
    variety: "Suakoko 8 (Foundation seed)",
    areaHa: 6.2,
    areaAcres: 15.32,
    perimeterM: 1180,
    centroid: [7.012, -9.578],
    accuracyM: 1.1,
    roadAccess: "All-weather asphalt road",
    roadCondition: "Good",
    roadDistanceMi: 0.4,
    nearestMarket: "Gbarnga Central Market",
    marketDistanceKm: 9.8,
    marketTravelMins: 22,
    storageType: "Central cooperative grain bank (150 MT)",
    storageCapacityMt: 25.0,
    processingFacility: "Kpatawee Industrial Rice Complex",
    processingDistanceMi: 0.5,
    mechanizationMode: "4-wheel 50HP tractor + mechanical thresher",
    irrigationStatus: "Controlled gravity irrigation sluices",
    smartReadiness: "Soil sensor station & automated water gauges",
    verificationStatus: "FIELD_VERIFIED",
    verifiedDate: "2026-08-18",
    vertices: [
      [7.016, -9.583],
      [7.017, -9.573],
      [7.008, -9.572],
      [7.007, -9.584],
    ],
  },
  {
    id: "PCL-BG-00174",
    maskedHolder: "Farmer J. S. (Cassava Producer)",
    county: "Bong",
    district: "Jorquelleh",
    community: "Phebe Vicinity",
    commodity: "Cassava",
    variety: "CARICASS 2",
    areaHa: 3.2,
    areaAcres: 7.91,
    perimeterM: 760,
    centroid: [6.974, -9.612],
    accuracyM: 1.7,
    roadAccess: "Paved highway link",
    roadCondition: "Good",
    roadDistanceMi: 0.6,
    nearestMarket: "Phebe Junction Community Market",
    marketDistanceKm: 2.8,
    marketTravelMins: 10,
    storageType: "Ventilated fresh tuber storage",
    storageCapacityMt: 3.5,
    processingFacility: "CARI Agribusiness Incubation Hub",
    processingDistanceMi: 1.9,
    mechanizationMode: "Motorized cassava grater & hydraulic press",
    irrigationStatus: "Rainfed upland with contour bunds",
    smartReadiness: "SMS weather alerts & pest warning network",
    verificationStatus: "FIELD_VERIFIED",
    verifiedDate: "2026-07-19",
    vertices: [
      [6.977, -9.616],
      [6.978, -9.608],
      [6.970, -9.607],
      [6.969, -9.617],
    ],
  },

  // Lofa Parcels
  {
    id: "PCL-LF-00033",
    maskedHolder: "Farmer K. B. (Commercial Grain)",
    county: "Lofa",
    district: "Foya",
    community: "Foya City Farmlands",
    commodity: "Rice",
    variety: "Foya Special (Fragrant Jasmine)",
    areaHa: 8.5,
    areaAcres: 21.0,
    perimeterM: 1420,
    centroid: [8.358, -10.218],
    accuracyM: 1.3,
    roadAccess: "Engineered gravel highway",
    roadCondition: "Good",
    roadDistanceMi: 0.8,
    nearestMarket: "Foya Cross-Border Commercial Market",
    marketDistanceKm: 5.2,
    marketTravelMins: 18,
    storageType: "Metal grain silos & palletized warehouse",
    storageCapacityMt: 35.0,
    processingFacility: "Foya Rural Women Cooperative Mill",
    processingDistanceMi: 1.1,
    mechanizationMode: "Tractor disc plow & combine harvester hire",
    irrigationStatus: "Inland valley swamp (IVS) developed scheme",
    smartReadiness: "CBR-compliant digital farmer ID card & NFC",
    verificationStatus: "FIELD_VERIFIED",
    verifiedDate: "2026-08-25",
    vertices: [
      [8.363, -10.224],
      [8.365, -10.212],
      [8.352, -10.211],
      [8.351, -10.225],
    ],
  },
  {
    id: "PCL-LF-00129",
    maskedHolder: "Farmer M. D. (Cocoa Farmer)",
    county: "Lofa",
    district: "Voinjama",
    community: "Boluwongai",
    commodity: "Cocoa",
    variety: "Organic Fairtrade Cocoa",
    areaHa: 4.8,
    areaAcres: 11.86,
    perimeterM: 980,
    centroid: [8.412, -9.754],
    accuracyM: 1.5,
    roadAccess: "Unpaved feeder road",
    roadCondition: "Seasonal (Passable dry/light rain)",
    roadDistanceMi: 1.9,
    nearestMarket: "Voinjama Central Market",
    marketDistanceKm: 14.2,
    marketTravelMins: 45,
    storageType: "Solar dryer & moisture-proof bagging",
    storageCapacityMt: 7.5,
    processingFacility: "Voinjama Organic Cocoa Hub",
    processingDistanceMi: 2.8,
    mechanizationMode: "Manual weeding + mechanical pod breakers",
    irrigationStatus: "Rainfed canopy forest",
    smartReadiness: "Mobile money receipt for harvest sales",
    verificationStatus: "FIELD_VERIFIED",
    verifiedDate: "2026-08-11",
    vertices: [
      [8.416, -9.759],
      [8.417, -9.749],
      [8.407, -9.748],
      [8.406, -9.760],
    ],
  },

  // Margibi Parcels
  {
    id: "PCL-MG-00052",
    maskedHolder: "Farmer P. C. (Vegetable Outgrower)",
    county: "Margibi",
    district: "Kakata",
    community: "Weala Corridor",
    commodity: "Vegetables",
    variety: "Cabbage, Tomatoes, Cucumber",
    areaHa: 2.4,
    areaAcres: 5.93,
    perimeterM: 640,
    centroid: [6.538, -10.294],
    accuracyM: 1.5,
    roadAccess: "Paved Kakata highway",
    roadCondition: "Excellent",
    roadDistanceMi: 0.3,
    nearestMarket: "Kakata Central Commercial Market",
    marketDistanceKm: 4.8,
    marketTravelMins: 14,
    storageType: "Cold-pack insulated vegetable crates",
    storageCapacityMt: 3.0,
    processingFacility: "Kakata Horti-Aggregation Center",
    processingDistanceMi: 1.0,
    mechanizationMode: "Two-wheel walk-behind cultivator",
    irrigationStatus: "Borehole pump + overhead sprinklers",
    smartReadiness: "Weekly SMS commodity price dashboard",
    verificationStatus: "FIELD_VERIFIED",
    verifiedDate: "2026-08-02",
    vertices: [
      [6.541, -10.297],
      [6.542, -10.290],
      [6.534, -10.289],
      [6.533, -10.298],
    ],
  },

  // Grand Bassa Parcels
  {
    id: "PCL-GB-00076",
    maskedHolder: "Farmer T. V. (Cassava Nucleus)",
    county: "Grand Bassa",
    district: "Owensgrove",
    community: "St. John River Bank",
    commodity: "Cassava",
    variety: "TME 419 (Disease-resistant)",
    areaHa: 4.5,
    areaAcres: 11.12,
    perimeterM: 920,
    centroid: [5.924, -10.024],
    accuracyM: 1.4,
    roadAccess: "All-weather coastal highway link",
    roadCondition: "Good",
    roadDistanceMi: 0.7,
    nearestMarket: "Buchanan Port Commercial Market",
    marketDistanceKm: 16.5,
    marketTravelMins: 35,
    storageType: "Ventilated bulk holding cribs",
    storageCapacityMt: 8.0,
    processingFacility: "Grand Bassa Gari & Starch Enterprise",
    processingDistanceMi: 1.5,
    mechanizationMode: "Tractor plowing + mechanized dewatering press",
    irrigationStatus: "Rainfed with natural riverbank sub-irrigation",
    smartReadiness: "USSD registry status verification",
    verificationStatus: "FIELD_VERIFIED",
    verifiedDate: "2026-07-22",
    vertices: [
      [5.928, -10.029],
      [5.929, -10.019],
      [5.920, -10.018],
      [5.919, -10.030],
    ],
  },

  // Maryland Parcels
  {
    id: "PCL-MY-00019",
    maskedHolder: "Farmer O. L. (Oil Palm Smallholder)",
    county: "Maryland",
    district: "Pleebo-Sodoken",
    community: "Pleebo Outskirts",
    commodity: "Oil Palm",
    variety: "Tenera Hybrid Seedlings",
    areaHa: 6.8,
    areaAcres: 16.8,
    perimeterM: 1250,
    centroid: [4.584, -7.694],
    accuracyM: 1.3,
    roadAccess: "Paved Harper-Pleebo highway",
    roadCondition: "Good",
    roadDistanceMi: 0.4,
    nearestMarket: "Pleebo Commercial Market",
    marketDistanceKm: 3.2,
    marketTravelMins: 10,
    storageType: "Fresh fruit bunch (FFB) collection ramp",
    storageCapacityMt: 18.0,
    processingFacility: "Pleebo Industrial Palm Oil Mill",
    processingDistanceMi: 2.1,
    mechanizationMode: "Tractor haulage trailer + mechanized digester",
    irrigationStatus: "Rainfed high-precipitation coastal zone",
    smartReadiness: "QR-tagged traceability for RSPO certification",
    verificationStatus: "FIELD_VERIFIED",
    verifiedDate: "2026-08-16",
    vertices: [
      [4.589, -7.700],
      [4.590, -7.688],
      [4.579, -7.687],
      [4.578, -7.701],
    ],
  },
];

// Helper to center and zoom map dynamically
function MapFlyController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.4, easeLinearity: 0.25 });
  }, [center, zoom, map]);
  return null;
}

// Custom Marker Icons for Leaflet
function createCommodityIcon(commodity: string) {
  let color = "#10b981"; // Rice (Emerald)
  if (commodity.includes("Cocoa")) color = "#f59e0b"; // Cocoa (Amber)
  else if (commodity.includes("Cassava")) color = "#3b82f6"; // Cassava (Blue)
  else if (commodity.includes("Palm") || commodity.includes("Rubber")) color = "#ec4899"; // Oil Palm (Pink/Magenta)
  else if (commodity.includes("Vegetable")) color = "#8b5cf6"; // Vegetables (Purple)

  return L.divIcon({
    className: "farm-gis-marker",
    html: `<div class="pin-body" style="background: ${color};"><div class="pin-inner"></div></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -22],
  });
}

function getAssetUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  if (typeof window !== "undefined") {
    const segments = window.location.pathname.split("/").filter(Boolean);
    if (segments.length > 0 && segments[0] === "liberia-digital-farmer-registry") {
      return `/liberia-digital-farmer-registry${p}`;
    }
  }
  return p;
}

export default function InteractiveMapClient() {
  const [selectedCounty, setSelectedCounty] = useState<CountyInfo>(COUNTIES.find(c => c.name === "Montserrado") || COUNTIES[0]);
  const [hoveredCounty, setHoveredCounty] = useState<CountyInfo | null>(null);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);
  const [selectedFarm, setSelectedFarm] = useState<FarmCadastre | null>(SEEDED_PARCELS[0]);
  const [baseLayer, setBaseLayer] = useState<"satellite" | "street">("satellite");
  const [selectedCommodity, setSelectedCommodity] = useState<string>("All");
  const [infrastructureFilter, setInfrastructureFilter] = useState<string>("All");
  const [isNationalView, setIsNationalView] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<"vector" | "demarcated" | "survey">("vector");
  const [geojsonData, setGeojsonData] = useState<any>(null);

  // Dynamic Tooltip Clamping to prevent clipping off-screen
  const tooltipStyle = useMemo((): React.CSSProperties => {
    if (!hoverPos) return { display: "none" };
    // Container width is ~380px in desktop sidebar. Clamp X so 240px card stays fully visible:
    const clampedX = Math.max(124, Math.min(hoverPos.x, 256));
    
    // In our 390px tall SVG canvas:
    // If cursor Y is in the upper half (< 185px), display tooltip BELOW cursor; otherwise above.
    const isUpperHalf = hoverPos.y < 185;
    const top = isUpperHalf ? hoverPos.y + 16 : hoverPos.y - 12;
    const transform = isUpperHalf ? "translate(-50%, 0)" : "translate(-50%, -100%)";

    return {
      left: `${clampedX}px`,
      top: `${top}px`,
      transform,
    };
  }, [hoverPos]);

  // Load official GeoJSON for Leaflet boundary rendering
  useEffect(() => {
    fetch(getAssetUrl("/data/liberia-counties.geojson"))
      .then((r) => r.json())
      .then((d) => setGeojsonData(d))
      .catch(() => {});
  }, []);

  // Filtered parcels based on county and filter pills
  const filteredParcels = useMemo(() => {
    return SEEDED_PARCELS.filter((p) => {
      if (!isNationalView && p.county !== selectedCounty.name) return false;
      if (selectedCommodity !== "All" && !p.commodity.includes(selectedCommodity)) return false;
      if (infrastructureFilter === "Paved Road" && !p.roadAccess.toLowerCase().includes("paved")) return false;
      if (infrastructureFilter === "Mechanized" && p.mechanizationMode.toLowerCase().includes("manual")) return false;
      if (infrastructureFilter === "Irrigated" && p.irrigationStatus.toLowerCase().includes("rainfed only")) return false;
      return true;
    });
  }, [selectedCounty, isNationalView, selectedCommodity, infrastructureFilter]);

  // Handle county selection from SVG or quick list
  const handleSelectCounty = (county: CountyInfo) => {
    setSelectedCounty(county);
    setIsNationalView(false);
    // Select first farm in county if available
    const farmInCounty = SEEDED_PARCELS.find((p) => p.county === county.name);
    if (farmInCounty) {
      setSelectedFarm(farmInCounty);
    }
  };

  // Reset to national view
  const handleResetNational = () => {
    setIsNationalView(true);
  };

  const mapCenter: [number, number] = isNationalView ? [6.45, -9.45] : selectedCounty.center;
  const mapZoom: number = isNationalView ? 7 : selectedCounty.zoom;

  return (
    <div className="public-gis-page">
      {/* Top Hero Banner */}
      <section className="gis-hero-banner">
        <div className="gis-hero-header">
          <div className="gis-hero-title">
            <div className="gis-hero-badge">
              <span /> Tier 1 Public Cadastre · Official UNMIL/OCHA Demarcated Boundaries
            </div>
            <h1>National Agro-Geospatial Observatory & Interactive Farmer Cadastre</h1>
            <p>
              Explore Liberia's 15 demarcated counties, authentic county administrative borders,
              georeferenced farm parcel boundaries, agro-ecological regimes, and rural connectivity in real-time.
            </p>
          </div>
          <div className="gis-auth-prompt">
            <div>
              <b>Authorized GIS Officer?</b>
              <br />
              <span>Access CAD boundary editing & spatial verification queue</span>
            </div>
            <Link href="/signin?redirect=/dashboard#parcels&domain=Farms+%26+GIS&role=GIS+officer&cat=field">
              <Lock style={{ width: 13, height: 13 }} /> Officer Login <span>→</span>
            </Link>
          </div>
        </div>

        {/* KPI Scorecard Strip */}
        <div className="gis-kpi-strip">
          <div className="gis-kpi-card">
            <span>Demarcated Counties</span>
            <strong>15 of 15</strong>
            <small>Official National Cadastre</small>
          </div>
          <div className="gis-kpi-card">
            <span>Registered Farm Holdings</span>
            <strong>154,200+</strong>
            <small>Live synced across all counties</small>
          </div>
          <div className="gis-kpi-card">
            <span>Georeferenced Area</span>
            <strong>238,400 ha</strong>
            <small>589,000+ Cultivated Acres</small>
          </div>
          <div className="gis-kpi-card">
            <span>Cooperatives & Groups</span>
            <strong>4,120+</strong>
            <small>Unified Party Registry</small>
          </div>
          <div className="gis-kpi-card">
            <span>Geodetic Precision</span>
            <strong>WGS 84</strong>
            <small>±1.5m RTK-corrected GPS</small>
          </div>
        </div>
      </section>

      {/* Main Dual Workspace */}
      <main className="gis-explorer-workspace">
        {/* Left Sidebar: Demarcated Vector Map & County Analytics */}
        <aside className="county-sidebar">
          {/* Authentic Map of Liberia Box */}
          <div
            className="county-vector-box"
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              setHoverPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
            }}
            onMouseLeave={() => {
              setHoveredCounty(null);
              setHoverPos(null);
            }}
          >
            <header>
              <div>
                <h2>Republic of Liberia</h2>
                <small style={{ fontSize: "10px", color: "#64748b" }}>15 Official Demarcated Counties</small>
              </div>
              <div style={{ display: "flex", gap: "4px" }}>
                <button
                  onClick={() => setViewMode("vector")}
                  style={{
                    border: "1px solid #cbd5e1",
                    background: viewMode === "vector" ? "#166534" : "#ffffff",
                    color: viewMode === "vector" ? "#ffffff" : "#334155",
                    borderRadius: "6px",
                    padding: "4px 8px",
                    fontSize: "10px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Interactive Map
                </button>
                <button
                  onClick={() => setViewMode("demarcated")}
                  style={{
                    border: "1px solid #cbd5e1",
                    background: viewMode === "demarcated" ? "#166534" : "#ffffff",
                    color: viewMode === "demarcated" ? "#ffffff" : "#334155",
                    borderRadius: "6px",
                    padding: "4px 8px",
                    fontSize: "10px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Demarcated Print
                </button>
                <button
                  onClick={() => setViewMode("survey")}
                  style={{
                    border: "1px solid #cbd5e1",
                    background: viewMode === "survey" ? "#166534" : "#ffffff",
                    color: viewMode === "survey" ? "#ffffff" : "#334155",
                    borderRadius: "6px",
                    padding: "4px 8px",
                    fontSize: "10px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Survey
                </button>
              </div>
            </header>

            {/* Hover Floating Card */}
            {hoveredCounty && hoverPos && (
              <div
                className="county-hover-card"
                style={tooltipStyle}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                  <h4 style={{ margin: 0 }}>{hoveredCounty.name} County</h4>
                  <span style={{ fontSize: "9px", background: hoveredCounty.color, color: "#ffffff", padding: "1px 6px", borderRadius: "4px", fontWeight: 700, textShadow: "0 1px 2px rgba(0,0,0,0.5)" }}>
                    {hoveredCounty.code}
                  </span>
                </div>
                <p>Administrative Seat: {hoveredCounty.capital}</p>
                <div className="county-hover-stats">
                  <div>
                    <span>Registered Farmers</span>
                    <b>{hoveredCounty.farmers.toLocaleString()}</b>
                  </div>
                  <div>
                    <span>Cultivated Area</span>
                    <b>{hoveredCounty.hectares.toLocaleString()} ha</b>
                  </div>
                  <div>
                    <span>Road Access</span>
                    <b>{hoveredCounty.roadAccessPct}% all-weather</b>
                  </div>
                  <div>
                    <span>Mechanization</span>
                    <b>{hoveredCounty.mechanizationPct}% index</b>
                  </div>
                </div>
                <div style={{ marginTop: 6, paddingTop: 4, borderTop: "1px solid rgba(255,255,255,0.1)", fontSize: "9px", color: "#86efac", textAlign: "center" }}>
                  Click to focus & inspect cadastral parcels →
                </div>
              </div>
            )}

            {/* View Mode 1: Interactive Authentic Demarcated Vector Map */}
            {viewMode === "vector" && (
              <svg
                className="liberia-vector-svg"
                viewBox="0 0 760 720"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Background ocean/canvas hover reset */}
                <rect
                  x="0"
                  y="0"
                  width="760"
                  height="720"
                  fill="#f8fafc"
                  fillOpacity="0.4"
                  onMouseEnter={() => setHoveredCounty(null)}
                />

                {/* Neighboring Country Context Labels */}
                <text x="140" y="80" fill="#94a3b8" fontSize="13" fontWeight="800" letterSpacing="0.12em" opacity="0.65">
                  SIERRA LEONE
                </text>
                <text x="490" y="70" fill="#94a3b8" fontSize="13" fontWeight="800" letterSpacing="0.12em" opacity="0.65">
                  GUINEA
                </text>
                <text x="630" y="340" fill="#94a3b8" fontSize="13" fontWeight="800" letterSpacing="0.12em" opacity="0.65">
                  CÔTE D&apos;IVOIRE
                </text>
                <text x="130" y="560" fill="#64748b" fontSize="15" fontWeight="900" letterSpacing="0.14em" opacity="0.5" transform="rotate(-30 130 560)">
                  ATLANTIC OCEAN
                </text>

                {/* Compass Rose */}
                <g transform="translate(68, 620) scale(0.65)" opacity="0.75">
                  <circle cx="40" cy="40" r="34" fill="none" stroke="#64748b" strokeWidth="1.5" strokeDasharray="2 2" />
                  <polygon points="40,8 45,36 40,32 35,36" fill="#dc2626" />
                  <polygon points="40,72 45,44 40,48 35,44" fill="#64748b" />
                  <polygon points="8,40 36,45 32,40 36,35" fill="#64748b" />
                  <polygon points="72,40 44,45 48,40 44,35" fill="#64748b" />
                  <text x="40" y="5" textAnchor="middle" fontSize="11" fontWeight="800" fill="#dc2626">N</text>
                </g>

                {/* 15 Demarcated Counties */}
                {COUNTIES.map((county) => {
                  const isSelected = !isNationalView && selectedCounty.code === county.code;
                  const isHovered = hoveredCounty?.code === county.code;
                  return (
                    <g key={county.code}>
                      <path
                        d={county.svgPath}
                        fill={county.color}
                        fillOpacity={isSelected ? 1 : isHovered ? 1 : 0.88}
                        stroke={isSelected ? "#0f172a" : "#ffffff"}
                        strokeWidth={isSelected ? 3 : 1.8}
                        strokeLinejoin="round"
                        strokeLinecap="round"
                        className={`county-polygon ${isSelected ? "selected" : ""}`}
                        onMouseEnter={() => setHoveredCounty(county)}
                        onClick={() => handleSelectCounty(county)}
                        style={{
                          cursor: "pointer",
                          filter: isHovered ? "brightness(1.22)" : isSelected ? "drop-shadow(0 4px 10px rgba(0,0,0,0.3))" : undefined,
                        }}
                      />
                      <text
                        x={county.labelCoords[0]}
                        y={county.labelCoords[1]}
                        className="county-vector-label"
                      >
                        {county.name}
                      </text>
                    </g>
                  );
                })}
              </svg>
            )}

            {/* View Mode 2: Authentic Demarcated Map of Liberia (User Reference Image) */}
            {viewMode === "demarcated" && (
              <div className="county-carto-frame">
                <img
                  src={getAssetUrl("/assets/liberia-demarcated-counties.png")}
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (!target.dataset.tried) {
                      target.dataset.tried = "1";
                      target.src = "./assets/liberia-demarcated-counties.png";
                    }
                  }}
                  alt="Official Demarcated Counties of Liberia"
                  style={{ width: "100%", height: "390px", objectFit: "contain", background: "#ffffff", padding: "8px" }}
                />
                <div style={{ position: "absolute", bottom: "8px", left: "8px", right: "8px", background: "rgba(15, 23, 42, 0.88)", color: "white", padding: "6px 10px", borderRadius: "8px", fontSize: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>Republic of Liberia · 15 Demarcated Counties</span>
                  <button
                    onClick={() => setViewMode("vector")}
                    style={{ border: 0, background: "#16a34a", color: "white", borderRadius: "4px", padding: "2px 7px", fontSize: "9px", cursor: "pointer" }}
                  >
                    Hover Stats View →
                  </button>
                </div>
              </div>
            )}

            {/* View Mode 3: Official Cartographic Survey Map */}
            {viewMode === "survey" && (
              <div className="county-carto-frame">
                <img
                  src={getAssetUrl("/assets/liberia-counties-map.png")}
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (!target.dataset.tried) {
                      target.dataset.tried = "1";
                      target.src = "./assets/liberia-counties-map.png";
                    }
                  }}
                  alt="Official Demarcated Counties of Liberia"
                  style={{ width: "100%", height: "390px", objectFit: "contain", background: "#f8faf6" }}
                />
                <div style={{ position: "absolute", bottom: "8px", left: "8px", right: "8px", background: "rgba(15, 23, 42, 0.85)", color: "white", padding: "6px 10px", borderRadius: "6px", fontSize: "10px" }}>
                  Official Ministry of Agriculture & LISGIS 15-County Cartographic Base
                </div>
              </div>
            )}
          </div>

          {/* Active County Demarcation & Infrastructure Dossier */}
          <div className="active-county-card">
            <div className="active-county-header">
              <div>
                <h3>{isNationalView ? "Republic of Liberia (National View)" : `${selectedCounty.name} County`}</h3>
                <p>{isNationalView ? "Consolidated 15-County Agro-Ecological Cadastre" : `Administrative Seat: ${selectedCounty.capital}`}</p>
              </div>
              <button onClick={handleResetNational}>
                <RotateCcw style={{ width: 11, height: 11, display: "inline", marginRight: 4 }} />
                National View
              </button>
            </div>

            <div className="county-metrics-grid">
              <div className="county-metric-pill">
                <span>Registered Farmers</span>
                <b>{isNationalView ? "154,200" : selectedCounty.farmers.toLocaleString()}</b>
                <small>{isNationalView ? "100% 15 Counties" : "Verified smallholders & commercial"}</small>
              </div>
              <div className="county-metric-pill">
                <span>Mapped Cadastral Parcels</span>
                <b>{isNationalView ? "30,800+" : selectedCounty.parcelsMapped.toLocaleString()}</b>
                <small>GPS boundary polygons</small>
              </div>
              <div className="county-metric-pill">
                <span>All-Weather Road Access</span>
                <b>{isNationalView ? "71.4%" : `${selectedCounty.roadAccessPct}%`}</b>
                <small>Avg {selectedCounty.avgMarketDistanceKm} km to aggregation hub</small>
              </div>
              <div className="county-metric-pill">
                <span>Mechanization Index</span>
                <b>{isNationalView ? "29.8%" : `${selectedCounty.mechanizationPct}%`}</b>
                <small>Tractor / power tiller usage</small>
              </div>
            </div>

            <div style={{ marginTop: 8 }}>
              <span style={{ fontSize: "10px", textTransform: "uppercase", color: "#6a7e71", fontWeight: 700 }}>
                Dominant Commodities & Value Chains
              </span>
              <div className="commodity-chips">
                {(isNationalView
                  ? ["Rice (National Staple)", "Cassava", "Cocoa", "Oil Palm", "Rubber", "Vegetables"]
                  : selectedCounty.commodities
                ).map((c) => (
                  <span key={c} className="commodity-chip">
                    🌱 {c}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* 15 County Quick Switcher Buttons */}
          <div className="county-list-box">
            <h4>Quick Jump to County ({COUNTIES.length} Demarcations)</h4>
            <div className="county-quick-buttons">
              {COUNTIES.map((c) => (
                <button
                  key={c.code}
                  className={!isNationalView && selectedCounty.code === c.code ? "active" : ""}
                  onClick={() => handleSelectCounty(c)}
                  title={`${c.name} - ${c.farmers.toLocaleString()} farmers`}
                  style={{
                    borderLeft: `4px solid ${c.color}`,
                  }}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Right Panel: Sophisticated Satellite Map & Farm Cadastre */}
        <section className="map-stage-container">
          {/* Top Control Bar */}
          <div className="map-control-bar">
            <div className="map-control-title">
              <Compass />
              <div>
                <b>High-Resolution Spatial Cadastre Engine</b>
                <br />
                <span>
                  {isNationalView ? "National View · Showing All Georeferenced Holdings" : `Focused on ${selectedCounty.name} County · GPS Cadastre`}
                </span>
              </div>
            </div>

            {/* Layer Switcher */}
            <div className="map-layer-toggles">
              <div className="layer-btn-group">
                <button
                  className={baseLayer === "satellite" ? "active" : ""}
                  onClick={() => setBaseLayer("satellite")}
                >
                  🛰️ Satellite / Imagery
                </button>
                <button
                  className={baseLayer === "street" ? "active" : ""}
                  onClick={() => setBaseLayer("street")}
                >
                  🗺️ Topographic / Street
                </button>
              </div>

              {/* Commodity Filters */}
              <div className="filter-pills">
                {["All", "Rice", "Cocoa", "Cassava", "Vegetables"].map((crop) => (
                  <button
                    key={crop}
                    className={selectedCommodity === crop ? "active" : ""}
                    onClick={() => setSelectedCommodity(crop)}
                  >
                    {crop}
                  </button>
                ))}
              </div>

              {/* Infrastructure Filters */}
              <div className="filter-pills">
                {["All", "Paved Road", "Mechanized"].map((infra) => (
                  <button
                    key={infra}
                    className={infrastructureFilter === infra ? "active" : ""}
                    onClick={() => setInfrastructureFilter(infra)}
                  >
                    {infra}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Leaflet Map Interactive Canvas */}
          <div className="leaflet-map-wrapper">
            {/* Status Overlay */}
            <div className="map-status-overlay">
              <b>
                <ShieldCheck style={{ width: 14, height: 14 }} /> WGS 84 Cadastral Mesh
              </b>
              <span>
                {filteredParcels.length} georeferenced parcels displayed · Official boundaries active
              </span>
            </div>

            {/* Commodity Legend Overlay */}
            <div className="map-legend-overlay">
              <b>Commodity Mapping Legend</b>
              <div className="map-legend-items">
                <div className="map-legend-item">
                  <span className="legend-dot rice" /> Rice
                </div>
                <div className="map-legend-item">
                  <span className="legend-dot cocoa" /> Cocoa
                </div>
                <div className="map-legend-item">
                  <span className="legend-dot cassava" /> Cassava
                </div>
                <div className="map-legend-item">
                  <span className="legend-dot oilpalm" /> Oil Palm
                </div>
                <div className="map-legend-item">
                  <span className="legend-dot vegetables" /> Vegetables
                </div>
              </div>
            </div>

            {/* Farm Drill-Down Drawer */}
            {selectedFarm && (
              <div className="farm-dossier-drawer">
                <div className="dossier-header">
                  <div>
                    <span style={{ fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.08em", color: "#a7f3d0" }}>
                      Parcel Cadastre Record
                    </span>
                    <h3>{selectedFarm.id}</h3>
                    <p>{selectedFarm.county} County · {selectedFarm.district} District</p>
                  </div>
                  <button onClick={() => setSelectedFarm(null)} aria-label="Close dossier">
                    ✕
                  </button>
                </div>

                <div className="dossier-body">
                  {/* Privacy Badge */}
                  <div className="dossier-privacy-tag">
                    🔒 <b>Tier 1 Public View (PII Masked)</b>: In accordance with Liberia Data Privacy guidelines,
                    farmer phone numbers and full personal identities are anonymized for public browsing.
                  </div>

                  {/* Farm Identification */}
                  <div className="dossier-card">
                    <h4>
                      <MapPin style={{ width: 12, height: 12 }} /> Farm Holder & Geographic Location
                    </h4>
                    <div className="dossier-grid-2">
                      <div className="dossier-field">
                        <span>Holder</span>
                        <b>{selectedFarm.maskedHolder}</b>
                      </div>
                      <div className="dossier-field">
                        <span>Community</span>
                        <b>{selectedFarm.community}</b>
                      </div>
                      <div className="dossier-field">
                        <span>Centroid GPS</span>
                        <b>
                          {selectedFarm.centroid[0].toFixed(4)}°N, {selectedFarm.centroid[1].toFixed(4)}°W
                        </b>
                      </div>
                      <div className="dossier-field">
                        <span>GPS Precision</span>
                        <small>±{selectedFarm.accuracyM} m RTK</small>
                      </div>
                    </div>
                  </div>

                  {/* Cadastral Land & Agronomy */}
                  <div className="dossier-card">
                    <h4>
                      <TrendingUp style={{ width: 12, height: 12 }} /> Cadastral Geometry & Production
                    </h4>
                    <div className="dossier-grid-2">
                      <div className="dossier-field">
                        <span>Cultivated Land</span>
                        <b>{selectedFarm.areaHa} Hectares</b>
                        <small>{selectedFarm.areaAcres} Acres</small>
                      </div>
                      <div className="dossier-field">
                        <span>Perimeter</span>
                        <b>{selectedFarm.perimeterM} meters</b>
                      </div>
                      <div className="dossier-field">
                        <span>Primary Crop</span>
                        <b>{selectedFarm.commodity}</b>
                      </div>
                      <div className="dossier-field">
                        <span>Variety</span>
                        <b>{selectedFarm.variety}</b>
                      </div>
                    </div>
                  </div>

                  {/* Access & Connectivity Scorecard */}
                  <div className="dossier-card">
                    <h4>
                      <Truck style={{ width: 12, height: 12 }} /> Road, Market & Processing Access
                    </h4>
                    <div className="dossier-scorecard">
                      <div className="score-row">
                        <span>Road Access:</span>
                        <b>{selectedFarm.roadAccess} ({selectedFarm.roadDistanceMi} mi)</b>
                      </div>
                      <div className="score-row">
                        <span>Road Condition:</span>
                        <span className={`score-badge ${selectedFarm.roadCondition === "Good" || selectedFarm.roadCondition === "Excellent" ? "good" : "med"}`}>
                          {selectedFarm.roadCondition}
                        </span>
                      </div>
                      <div className="score-row">
                        <span>Nearest Aggregation Market:</span>
                        <b>{selectedFarm.nearestMarket}</b>
                      </div>
                      <div className="score-row">
                        <span>Market Distance & Transit:</span>
                        <b>{selectedFarm.marketDistanceKm} km ({selectedFarm.marketTravelMins} mins)</b>
                      </div>
                      <div className="score-row">
                        <span>Processing Mill:</span>
                        <b>{selectedFarm.processingFacility}</b>
                      </div>
                    </div>
                  </div>

                  {/* Storage, Mechanization & Smart Tech */}
                  <div className="dossier-card">
                    <h4>
                      <Warehouse style={{ width: 12, height: 12 }} /> Infrastructure & Modernization
                    </h4>
                    <div className="dossier-scorecard">
                      <div className="score-row">
                        <span>Post-Harvest Storage:</span>
                        <b>{selectedFarm.storageType}</b>
                      </div>
                      <div className="score-row">
                        <span>Storage Capacity:</span>
                        <b>{selectedFarm.storageCapacityMt} Metric Tons</b>
                      </div>
                      <div className="score-row">
                        <span>Tillage Mechanization:</span>
                        <b>{selectedFarm.mechanizationMode}</b>
                      </div>
                      <div className="score-row">
                        <span>Irrigation Infrastructure:</span>
                        <b>{selectedFarm.irrigationStatus}</b>
                      </div>
                      <div className="score-row">
                        <span>Smart Tech Readiness:</span>
                        <b>{selectedFarm.smartReadiness}</b>
                      </div>
                    </div>
                  </div>

                  {/* Verification Status */}
                  <div className="dossier-card" style={{ background: "#ecfdf5", borderColor: "#a7f3d0" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <CheckCircle2 style={{ color: "#059669", width: 18, height: 18 }} />
                      <div>
                        <b style={{ fontSize: "11px", color: "#065f46" }}>Official Cadastral Verification</b>
                        <p style={{ margin: 0, fontSize: "9px", color: "#047857" }}>
                          Demarcated and verified by Ministry of Agriculture GIS Unit on {selectedFarm.verifiedDate}.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="dossier-actions">
                  <Link href={`/signin?redirect=${encodeURIComponent(`/dashboard#parcels&parcel=${selectedFarm.id}`)}&domain=Farms+%26+GIS&role=GIS+officer&cat=field`}>
                    Authenticate as GIS Officer to Edit Geometry →
                  </Link>
                  <button onClick={() => setSelectedFarm(null)}>Close Farm Dossier</button>
                </div>
              </div>
            )}

            {/* React Leaflet Map Engine */}
            <MapContainer
              center={mapCenter}
              zoom={mapZoom}
              minZoom={6}
              maxZoom={19}
              maxBounds={LIBERIA_BOUNDS}
              scrollWheelZoom={true}
            >
              <MapFlyController center={mapCenter} zoom={mapZoom} />

              {/* Tile Layer */}
              <TileLayer
                attribution={
                  baseLayer === "satellite"
                    ? "Tiles © Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
                    : "© OpenStreetMap contributors"
                }
                url={
                  baseLayer === "satellite"
                    ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                    : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                }
              />

              {/* Official County Boundary Layer on Leaflet */}
              {geojsonData && (
                <GeoJSON
                  key={`geojson-${selectedCounty.code}-${hoveredCounty?.code || "none"}-${isNationalView}`}
                  data={geojsonData}
                  style={(feature) => {
                    const raw = feature?.properties?.shapeName;
                    const fName = raw === "Rivercess" ? "River Cess" : raw;
                    const isSelected = !isNationalView && fName === selectedCounty.name;
                    const isHovered = hoveredCounty && fName === hoveredCounty.name;
                    return {
                      color: isSelected ? "#ffffff" : isHovered ? "#22c55e" : "rgba(255, 255, 255, 0.45)",
                      weight: isSelected ? 3.5 : isHovered ? 3 : 1.5,
                      fillColor: isSelected ? selectedCounty.color : isHovered ? (hoveredCounty?.color || "#22c55e") : "transparent",
                      fillOpacity: isSelected ? 0.28 : isHovered ? 0.35 : 0,
                    };
                  }}
                  onEachFeature={(feature, layer) => {
                    const raw = feature?.properties?.shapeName;
                    const fName = raw === "Rivercess" ? "River Cess" : raw;
                    const countyData = COUNTIES.find((c) => c.name === fName);
                    if (countyData) {
                      layer.bindTooltip(
                        `<b>${countyData.name} County</b><br/>${countyData.farmers.toLocaleString()} Registered Farmers<br/>${countyData.hectares.toLocaleString()} ha Cultivated`,
                        { sticky: true, direction: "top" }
                      );
                      layer.on({
                        mouseover: () => setHoveredCounty(countyData),
                        mouseout: () => setHoveredCounty(null),
                        click: () => handleSelectCounty(countyData),
                      });
                    }
                  }}
                />
              )}

              {/* Farm Parcel Boundary Polygons */}
              {filteredParcels.map((farm) => {
                let strokeColor = "#10b981";
                if (farm.commodity.includes("Cocoa")) strokeColor = "#f59e0b";
                else if (farm.commodity.includes("Cassava")) strokeColor = "#3b82f6";
                else if (farm.commodity.includes("Palm")) strokeColor = "#ec4899";
                else if (farm.commodity.includes("Vegetable")) strokeColor = "#8b5cf6";

                const isSelected = selectedFarm?.id === farm.id;

                return (
                  <Polygon
                    key={farm.id}
                    positions={farm.vertices}
                    pathOptions={{
                      color: strokeColor,
                      weight: isSelected ? 3 : 2,
                      fillColor: strokeColor,
                      fillOpacity: isSelected ? 0.45 : 0.25,
                      dashArray: isSelected ? "4 4" : undefined,
                    }}
                    eventHandlers={{
                      click: () => setSelectedFarm(farm),
                    }}
                  >
                    <Popup>
                      <div style={{ padding: "4px", minWidth: "180px" }}>
                        <b style={{ color: "#123f2a", fontSize: "12px" }}>{farm.id}</b>
                        <br />
                        <span style={{ fontSize: "10px", color: "#556b5d" }}>
                          {farm.county} · {farm.district}
                        </span>
                        <hr style={{ margin: "6px 0", borderColor: "#e5ece3" }} />
                        <div style={{ fontSize: "11px" }}>
                          <strong>{farm.commodity}</strong> · {farm.areaHa} ha ({farm.areaAcres} ac)
                        </div>
                        <div style={{ fontSize: "10px", color: "#2563eb", marginTop: "4px" }}>
                          🛣️ {farm.roadAccess} ({farm.roadDistanceMi} mi)
                        </div>
                        <button
                          onClick={() => setSelectedFarm(farm)}
                          style={{
                            marginTop: "8px",
                            width: "100%",
                            background: "#17432e",
                            color: "white",
                            border: 0,
                            borderRadius: "6px",
                            padding: "5px",
                            fontSize: "10px",
                            cursor: "pointer",
                          }}
                        >
                          View Full Farm Dossier →
                        </button>
                      </div>
                    </Popup>
                  </Polygon>
                );
              })}

              {/* Farm Centroid Pins */}
              {filteredParcels.map((farm) => (
                <Marker
                  key={`marker-${farm.id}`}
                  position={farm.centroid}
                  icon={createCommodityIcon(farm.commodity)}
                  eventHandlers={{
                    click: () => setSelectedFarm(farm),
                  }}
                />
              ))}
            </MapContainer>
          </div>
        </section>
      </main>
    </div>
  );
}
