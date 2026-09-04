# Liberia Digital Farmer Registry (DFR) Platform

> **Register once. Serve better.**  
> Republic of Liberia · Ministry of Agriculture (MoA) with Technical Support from the Food and Agriculture Organization of the United Nations (FAO).

---

## 🌐 Live Access

- **GitHub Pages (Internet Access)**: [https://totagits.github.io/liberia-digital-farmer-registry/](https://totagits.github.io/liberia-digital-farmer-registry/)
- **Live Reference Site**: [https://liberia-digital-farmer-registry.mgwoah.chatgpt.site/](https://liberia-digital-farmer-registry.mgwoah.chatgpt.site/)
- **GitHub Repository**: [https://github.com/totagits/liberia-digital-farmer-registry](https://github.com/totagits/liberia-digital-farmer-registry)

---

## 📋 Overview

The **Liberia Digital Farmer Registry (DFR)** is Liberia's national digital public infrastructure for agriculture. It establishes an authoritative, single source of truth for farmers, households, agricultural holdings, farm parcels, cooperatives, and agribusinesses across all **15 counties of Liberia**.

Built for low-connectivity environments and field operations, the platform enables enumerators and extension officers to capture parcel boundaries and farmer profiles offline, synchronizing securely with the national register once network is restored.

---

## 🚀 Key Capabilities & Workspaces

The platform provides **24 role-governed workspaces** and comprehensive agricultural service workflows:

1. **Farmer & Household Registry**: Single national registry profiles with provisional IDs (`PROV-CC-NNNNNN`) and officially approved DFR IDs (`LBR-CC-NNNNNN`), vulnerability tracking, and full CSV export.
2. **Interactive GIS & Spatial Mapping**: Field-ready GIS workspace using Leaflet and WGS 84 (EPSG:4326), parcel boundary digitization, area/perimeter calculation, topology verification (self-intersection and overlap checks), satellite basemaps, and official Cadastral Map Certificates.
3. **Party & Organization Registry**: Unified registry for agricultural cooperatives, producer organizations, agribusinesses, and commodity aggregators.
4. **FAO Assignment Delivery (RFP 137641)**: Governance and deliverable tracking across all 7 assignment components (Inception Report, Gap Assessment, System Design, SOP Manual, Functional Platform, Training Curriculum, Pilot Implementation, Final Report).
5. **Standard Operating Procedures (SOP 01 to SOP 11)**: Complete operational procedure manual, approval workflows, and maker-checker validation gates.
6. **Institutional Governance & Data Sharing**: Multi-stakeholder governance charter linking MoA, LISGIS, MGCSP, and FAO with formal Data Sharing Agreements and a national Data Dictionary.
7. **Benefits, Subsidies & E-Vouchers**: Input subsidy tracking, distribution site management, and mobile money payment reconciliation (Lonestar MTN Mobile Money & Orange Money).
8. **Extension & Advisory Services**: Farmer extension requests, field visit scheduling, crop diagnostic logs, and agronomic advisory.
9. **Programme Applications & Enrolment**: Agricultural support applications, objective eligibility scoring, and multi-tier approval pipelines.
10. **Grievance Redress Mechanism (GRM)**: Confidential case submission, tracking, priority SLA monitoring, and formal resolution logging.
11. **Operations & Quality Assurance**: 6-dimension data quality audits (accuracy, completeness, consistency, timeliness, uniqueness, reliability), duplicate screening, and supervisory spot-checks.
12. **Help Desk & Knowledge Base**: Support ticketing and job aids for field enumerators and farmers.
13. **Offline Field Synchronization**: Encrypted on-device draft queues and resilient background sync with collision resolution.

---

## 👥 Role Switcher for Public Internet Access

When accessed on the public internet, the platform provides an interactive **Role Switcher** in the top navigation bar, allowing reviewers and stakeholders to experience the exact workspace views and capabilities for:

- **Ministry Administrator** (Full national administrative access)
- **Enumerator / Senior Enumerator** (Field registration & verification)
- **County Agricultural Officer (CAO)** (County-level oversight & extension)
- **District Agricultural Officer (DAO)** (Sub-county coordination)
- **GIS Officer** (Cadastral boundaries & spatial verification)
- **Cooperative Representative** (Aggregation, inputs & collective services)
- **Farmer / Household Representative** (Profile, programmes & vouchers)
- **Development Partner / FAO Oversight** (Deliverables & quality assurance)
- **Independent Audit & Security Officers** (Audit logs & compliance)

---

## 🛠️ Architecture & Tech Stack

- **Framework**: Next.js 16 (App Router) + Vinext (Cloudflare Workers & Vite SSR engine)
- **UI & Styling**: React 19, Tailwind CSS 4, Lucide Icons, Glassmorphism design system
- **Geospatial**: Leaflet 1.9, React-Leaflet 5, Esri World Imagery, NASA GIBS NDVI
- **Database & ORM**: SQLite / Cloudflare D1 with Drizzle ORM
- **Client Persistence**: Resilient local storage and client-side API interception for zero-latency static execution
- **CI/CD**: GitHub Actions deploying automatically to GitHub Pages (`gh-pages` branch)

---

## 💻 Local Development

### Prerequisites

- Node.js `>=22.13.0`
- npm `>=10.0.0`

### Setup

```bash
# 1. Clone repository
git clone https://github.com/totagits/liberia-digital-farmer-registry.git
cd liberia-digital-farmer-registry

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

Visit `http://localhost:5173` in your browser.

### Build & Verification

```bash
# Run production build
npm run build

# Run static export for GitHub Pages
npm run build:static

# Run verification tests
npm test
```

---

## 📦 Deployment to GitHub Pages

This repository includes an automated GitHub Actions workflow (`.github/workflows/deploy.yml`). Pushing to `main` automatically triggers:

1. Verification tests (`npm test`)
2. Full static site generation with base path `/liberia-digital-farmer-registry/`
3. Publishing to the `gh-pages` branch with `.nojekyll` and `404.html` SPA routing support.

---

## 📜 License & Acknowledgements

- **Owner**: Republic of Liberia · Ministry of Agriculture (MoA)
- **Technical Support**: Food and Agriculture Organization of the United Nations (FAO)
- **Lead Contractor / System Architecture**: TOTAG IT Services / TOTAG Group
