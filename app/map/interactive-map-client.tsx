"use client";

import React, { useEffect, useMemo, useState } from "react";
import { MapContainer, Marker, Polygon, Popup, TileLayer, useMap } from "react-leaflet";
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
} from "lucide-react";
import "leaflet/dist/leaflet.css";

// WGS 84 Bounds for Liberia
const LIBERIA_BOUNDS: L.LatLngBoundsExpression = [
  [4.15, -11.65],
  [8.75, -7.25],
];

// County Information & Demarcation Metadata (All 15 Counties)
export interface CountyInfo {
  name: string;
  code: string;
  capital: string;
  center: [number, number];
  zoom: number;
  farmers: number;
  hectares: number;
  parcelsMapped: number;
  commodities: string[];
  cooperatives: number;
  roadAccessPct: number;
  avgMarketDistanceKm: number;
  avgTravelTimeMins: number;
  mechanizationPct: number;
  irrigationPct: number;
  svgPath: string;
  labelCoords: [number, number];
}

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

// 15 Demarcated Liberian Counties with SVG Paths for the Vector Choropleth Map (viewBox: 0 0 800 650)
const COUNTIES: CountyInfo[] = [
  {
    name: "Montserrado",
    code: "MO",
    capital: "Bensonville / Monrovia",
    center: [6.45, -10.65],
    zoom: 11,
    farmers: 14280,
    hectares: 18450,
    parcelsMapped: 2840,
    commodities: ["Vegetables", "Cassava", "Poultry", "Swamp Rice"],
    cooperatives: 284,
    roadAccessPct: 92,
    avgMarketDistanceKm: 4.5,
    avgTravelTimeMins: 25,
    mechanizationPct: 38,
    irrigationPct: 24,
    labelCoords: [210, 395],
    svgPath: "M 180 370 L 230 360 L 245 400 L 220 425 L 175 405 Z",
  },
  {
    name: "Nimba",
    code: "NI",
    capital: "Sanniquellie",
    center: [7.25, -8.72],
    zoom: 9,
    farmers: 24850,
    hectares: 48200,
    parcelsMapped: 4910,
    commodities: ["Cocoa", "Upland Rice", "Coffee", "Plantains"],
    cooperatives: 612,
    roadAccessPct: 74,
    avgMarketDistanceKm: 12.8,
    avgTravelTimeMins: 55,
    mechanizationPct: 42,
    irrigationPct: 31,
    labelCoords: [480, 230],
    svgPath: "M 410 160 L 510 140 L 560 210 L 530 330 L 440 310 L 400 240 Z",
  },
  {
    name: "Bong",
    code: "BG",
    capital: "Gbarnga",
    center: [7.00, -9.60],
    zoom: 9,
    farmers: 21400,
    hectares: 39500,
    parcelsMapped: 3880,
    commodities: ["Rice (Kpatawee)", "Cassava", "Vegetables", "Cocoa"],
    cooperatives: 540,
    roadAccessPct: 81,
    avgMarketDistanceKm: 8.2,
    avgTravelTimeMins: 38,
    mechanizationPct: 46,
    irrigationPct: 39,
    labelCoords: [330, 260],
    svgPath: "M 270 230 L 370 210 L 410 240 L 380 320 L 290 330 L 260 280 Z",
  },
  {
    name: "Lofa",
    code: "LF",
    capital: "Voinjama",
    center: [8.25, -9.75],
    zoom: 9,
    farmers: 22600,
    hectares: 45100,
    parcelsMapped: 4120,
    commodities: ["Lowland Rice", "Cocoa", "Coffee", "Palm Oil"],
    cooperatives: 590,
    roadAccessPct: 68,
    avgMarketDistanceKm: 14.5,
    avgTravelTimeMins: 65,
    mechanizationPct: 35,
    irrigationPct: 28,
    labelCoords: [290, 110],
    svgPath: "M 220 70 L 330 30 L 380 90 L 370 210 L 270 230 L 220 160 Z",
  },
  {
    name: "Margibi",
    code: "MG",
    capital: "Kakata",
    center: [6.52, -10.30],
    zoom: 10,
    farmers: 12150,
    hectares: 19800,
    parcelsMapped: 2180,
    commodities: ["Rubber", "Cassava", "Vegetables", "Poultry"],
    cooperatives: 310,
    roadAccessPct: 88,
    avgMarketDistanceKm: 6.2,
    avgTravelTimeMins: 30,
    mechanizationPct: 39,
    irrigationPct: 22,
    labelCoords: [265, 370],
    svgPath: "M 230 360 L 290 330 L 305 385 L 245 400 Z",
  },
  {
    name: "Grand Bassa",
    code: "GB",
    capital: "Buchanan",
    center: [5.95, -10.05],
    zoom: 9,
    farmers: 11800,
    hectares: 18700,
    parcelsMapped: 2050,
    commodities: ["Cassava", "Oil Palm", "Rice", "Fisheries"],
    cooperatives: 275,
    roadAccessPct: 76,
    avgMarketDistanceKm: 9.8,
    avgTravelTimeMins: 45,
    mechanizationPct: 29,
    irrigationPct: 18,
    labelCoords: [310, 425],
    svgPath: "M 245 400 L 305 385 L 380 410 L 340 480 L 260 450 Z",
  },
  {
    name: "Bomi",
    code: "BM",
    capital: "Tubmanburg",
    center: [6.76, -10.85],
    zoom: 10,
    farmers: 7420,
    hectares: 11200,
    parcelsMapped: 1450,
    commodities: ["Cassava", "Rubber", "Vegetables", "Plantains"],
    cooperatives: 195,
    roadAccessPct: 79,
    avgMarketDistanceKm: 7.4,
    avgTravelTimeMins: 35,
    mechanizationPct: 24,
    irrigationPct: 19,
    labelCoords: [165, 320],
    svgPath: "M 140 290 L 195 280 L 220 340 L 175 370 L 130 330 Z",
  },
  {
    name: "Grand Cape Mount",
    code: "CM",
    capital: "Robertsport",
    center: [6.95, -11.20],
    zoom: 10,
    farmers: 6850,
    hectares: 10400,
    parcelsMapped: 1290,
    commodities: ["Cassava", "Oil Palm", "Rice", "Fish Products"],
    cooperatives: 180,
    roadAccessPct: 71,
    avgMarketDistanceKm: 11.2,
    avgTravelTimeMins: 50,
    mechanizationPct: 22,
    irrigationPct: 16,
    labelCoords: [95, 275],
    svgPath: "M 60 250 L 140 220 L 140 290 L 115 340 L 50 310 Z",
  },
  {
    name: "Gbarpolu",
    code: "GP",
    capital: "Bopolu",
    center: [7.50, -10.10],
    zoom: 9,
    farmers: 5920,
    hectares: 8900,
    parcelsMapped: 1050,
    commodities: ["Cocoa", "Plantain", "Rice", "Cassava"],
    cooperatives: 145,
    roadAccessPct: 58,
    avgMarketDistanceKm: 16.5,
    avgTravelTimeMins: 75,
    mechanizationPct: 18,
    irrigationPct: 14,
    labelCoords: [195, 220],
    svgPath: "M 140 220 L 220 160 L 270 230 L 210 280 L 140 290 Z",
  },
  {
    name: "Grand Gedeh",
    code: "GG",
    capital: "Zwedru",
    center: [5.92, -8.22],
    zoom: 9,
    farmers: 7300,
    hectares: 12600,
    parcelsMapped: 1420,
    commodities: ["Cocoa", "Rice", "Plantain", "Oil Palm"],
    cooperatives: 210,
    roadAccessPct: 63,
    avgMarketDistanceKm: 15.0,
    avgTravelTimeMins: 70,
    mechanizationPct: 21,
    irrigationPct: 17,
    labelCoords: [540, 395],
    svgPath: "M 480 320 L 560 310 L 610 380 L 540 450 L 470 410 Z",
  },
  {
    name: "Sinoe",
    code: "SI",
    capital: "Greenville",
    center: [5.35, -8.85],
    zoom: 9,
    farmers: 6400,
    hectares: 11100,
    parcelsMapped: 1180,
    commodities: ["Oil Palm", "Cassava", "Rice", "Rubber"],
    cooperatives: 170,
    roadAccessPct: 59,
    avgMarketDistanceKm: 17.2,
    avgTravelTimeMins: 80,
    mechanizationPct: 26,
    irrigationPct: 15,
    labelCoords: [430, 485],
    svgPath: "M 380 410 L 470 410 L 490 510 L 410 540 L 355 490 Z",
  },
  {
    name: "River Cess",
    code: "RC",
    capital: "Cestos City",
    center: [5.75, -9.45],
    zoom: 9,
    farmers: 4750,
    hectares: 7800,
    parcelsMapped: 980,
    commodities: ["Cassava", "Rice", "Plantains", "Fish"],
    cooperatives: 125,
    roadAccessPct: 54,
    avgMarketDistanceKm: 18.0,
    avgTravelTimeMins: 85,
    mechanizationPct: 16,
    irrigationPct: 12,
    labelCoords: [350, 445],
    svgPath: "M 340 480 L 380 410 L 355 490 L 320 500 Z",
  },
  {
    name: "Maryland",
    code: "MY",
    capital: "Harper",
    center: [4.55, -7.75],
    zoom: 10,
    farmers: 7150,
    hectares: 13200,
    parcelsMapped: 1380,
    commodities: ["Oil Palm", "Rubber", "Rice", "Cassava"],
    cooperatives: 220,
    roadAccessPct: 72,
    avgMarketDistanceKm: 8.5,
    avgTravelTimeMins: 40,
    mechanizationPct: 34,
    irrigationPct: 25,
    labelCoords: [640, 560],
    svgPath: "M 580 520 L 650 510 L 680 580 L 610 610 Z",
  },
  {
    name: "Grand Kru",
    code: "GK",
    capital: "Barclayville",
    center: [4.75, -8.25],
    zoom: 10,
    farmers: 4320,
    hectares: 6950,
    parcelsMapped: 890,
    commodities: ["Cassava", "Rice", "Oil Palm", "Fish"],
    cooperatives: 115,
    roadAccessPct: 52,
    avgMarketDistanceKm: 19.5,
    avgTravelTimeMins: 90,
    mechanizationPct: 15,
    irrigationPct: 11,
    labelCoords: [525, 555],
    svgPath: "M 490 510 L 560 490 L 580 560 L 500 590 Z",
  },
  {
    name: "River Gee",
    code: "RG",
    capital: "Fish Town",
    center: [5.25, -7.70],
    zoom: 10,
    farmers: 4110,
    hectares: 6650,
    parcelsMapped: 850,
    commodities: ["Rice", "Cassava", "Cocoa", "Oil Palm"],
    cooperatives: 110,
    roadAccessPct: 56,
    avgMarketDistanceKm: 16.8,
    avgTravelTimeMins: 75,
    mechanizationPct: 17,
    irrigationPct: 13,
    labelCoords: [595, 470],
    svgPath: "M 540 450 L 630 430 L 650 510 L 560 490 Z",
  },
];

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

export default function InteractiveMapClient() {
  const [selectedCounty, setSelectedCounty] = useState<CountyInfo>(COUNTIES[0]);
  const [hoveredCounty, setHoveredCounty] = useState<CountyInfo | null>(null);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);
  const [selectedFarm, setSelectedFarm] = useState<FarmCadastre | null>(SEEDED_PARCELS[0]);
  const [baseLayer, setBaseLayer] = useState<"satellite" | "street">("satellite");
  const [selectedCommodity, setSelectedCommodity] = useState<string>("All");
  const [infrastructureFilter, setInfrastructureFilter] = useState<string>("All");
  const [isNationalView, setIsNationalView] = useState<boolean>(false);

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
              <span /> Tier 1 Public Cadastre · Open Spatial Infrastructure
            </div>
            <h1>National Agro-Geospatial Observatory & Interactive Farmer Cadastre</h1>
            <p>
              Explore Liberia's 15 demarcated counties, georeferenced farm parcel boundaries,
              agro-ecological soil regimes, infrastructure connectivity (roads, markets, storage) and
              mechanization indices in real-time.
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
            <small>100% Territorial Coverage</small>
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
          {/* SVG Vector Map with Instant Hover Statistics */}
          <div
            className="county-vector-box"
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              setHoverPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
            }}
            onMouseLeave={() => setHoveredCounty(null)}
          >
            <header>
              <h2>Liberia Demarcated County Map</h2>
              <span>Hover to inspect · Click to focus</span>
            </header>

            {/* Hover Floating Card */}
            {hoveredCounty && hoverPos && (
              <div
                className="county-hover-card"
                style={{
                  left: `${hoverPos.x}px`,
                  top: `${hoverPos.y}px`,
                }}
              >
                <h4>{hoveredCounty.name} County</h4>
                <p>Capital: {hoveredCounty.capital}</p>
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
              </div>
            )}

            {/* Interactive Vector SVG */}
            <svg
              className="liberia-vector-svg"
              viewBox="0 0 720 620"
              xmlns="http://www.w3.org/2000/svg"
            >
              {COUNTIES.map((county) => {
                const isSelected = !isNationalView && selectedCounty.code === county.code;
                return (
                  <g key={county.code}>
                    <path
                      d={county.svgPath}
                      className={`county-polygon ${isSelected ? "selected" : ""}`}
                      onMouseEnter={() => setHoveredCounty(county)}
                      onClick={() => handleSelectCounty(county)}
                    />
                    <text
                      x={county.labelCoords[0]}
                      y={county.labelCoords[1]}
                      className="county-vector-label"
                    >
                      {county.code}
                    </text>
                  </g>
                );
              })}
            </svg>
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
                {filteredParcels.length} georeferenced parcels displayed · Click any farm to inspect dossier
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
