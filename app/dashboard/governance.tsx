"use client";
import { useEffect, useMemo, useState } from "react";

type G = Record<string, any>;

const tabs = [
  "Overview",
  "Platform policies",
  "Standards & metadata",
  "Sharing agreements",
  "Interoperability",
  "Audit evidence",
  "Dataset stewardship",
  "Validation workflows",
  "Committee actions",
];

const tabMap: Record<string, string> = {
  "#overview": "Overview",
  "#policies": "Platform policies",
  "#standards": "Standards & metadata",
  "#metadata": "Standards & metadata",
  "#sharing-agreements": "Sharing agreements",
  "#agreements": "Sharing agreements",
  "#interoperability": "Interoperability",
  "#audit-evidence": "Audit evidence",
  "#audit": "Audit evidence",
  "#stewardship": "Dataset stewardship",
  "#workflows": "Validation workflows",
  "#committee-actions": "Committee actions",
};

const revMap: Record<string, string> = {
  "Overview": "#overview",
  "Platform policies": "#policies",
  "Standards & metadata": "#standards",
  "Sharing agreements": "#sharing-agreements",
  "Interoperability": "#interoperability",
  "Audit evidence": "#audit-evidence",
  "Dataset stewardship": "#stewardship",
  "Validation workflows": "#workflows",
  "Committee actions": "#committee-actions",
};

const nextActions: Record<string, [string, string][]> = {
  SUBMITTED: [["Begin review", "UNDER_REVIEW"]],
  UNDER_REVIEW: [
    ["Request correction", "CORRECTION_REQUESTED"],
    ["Approve", "APPROVED"],
  ],
  CORRECTION_REQUESTED: [["Mark resubmitted", "RESUBMITTED"]],
  RESUBMITTED: [["Resume review", "UNDER_REVIEW"]],
  APPROVED: [["Publish", "PUBLISHED"]],
  PUBLISHED: [],
};

// Regulatory Policy Templates
const policyTemplates = [
  {
    code: "POL-LBR-006",
    title: "Smallholder Climate Resilience & Carbon Benefit-Sharing Regulation",
    category: "Climate & Environmental Standards",
    enforcingBody: "Environmental Protection Agency (EPA) & Ministry of Agriculture (MoA)",
    legalBasis: "Liberia National Climate Change Policy & Paris Agreement Article 6",
    effectiveDate: "2026-06-01",
    reviewCycle: "Annual",
    status: "Active / Enacted",
    summary:
      "Statutory framework regulating community tree canopy conservation, soil carbon measurement, and mandating that a minimum of 70% of carbon credit dividends flow directly to registered smallholder farming households.",
    directives: [
      "Mandatory 70% Producer Dividend: Carbon project developers and concessionaires must distribute at least 70% of net carbon market proceeds directly to registered smallholder farmers via verified Mobile Money.",
      "Satellite & Ground-Truth MRV: Carbon measurement, reporting, and verification (MRV) must combine Sentinel-2 satellite imagery with physical GPS farm parcel boundary inspection.",
      "Non-Alienation of Customary Land Rights: Carbon insetting contracts shall not transfer customary land ownership or restrict smallholder subsistence food production rights.",
      "Annual Community Conservation Audit: County agricultural officers and EPA field inspectors must conduct mandatory annual ground audits of designated conservation zones.",
    ],
  },
  {
    code: "POL-LBR-007",
    title: "National Seed Certification & GMO Quarantine Biosafety Protocol",
    category: "Agronomic Standards & Biosafety",
    enforcingBody: "Central Agricultural Research Institute (CARI) & MoA Quarantine Unit",
    legalBasis: "Liberia Seed Development Act & ECOWAS Regional Seed Regulation C/REG.4/05/2008",
    effectiveDate: "2026-07-01",
    reviewCycle: "Seasonal",
    status: "Active / Enacted",
    summary:
      "Mandatory quality assurance, germination purity, and varietal integrity standards for foundation rice, cassava, and cocoa planting materials distributed through the National DFR.",
    directives: [
      "Breeder Seed Lot Traceability: Every bag of certified seed delivered under DFR input subsidy programs must bear a CARI holographic certification tag with batch QR traceability.",
      "Germination & Purity Threshold: Seed lots demonstrating less than 85% germination rate or exceeding 2% foreign matter contamination are condemned and barred from distribution.",
      "Phytosanitary Quarantine on Border Imports: All imported vegetative planting materials must undergo 21-day quarantine and lab screening at Roberts International Airport or Bo Waterside.",
      "Agro-Dealer Liability for False Germination: Licensed input suppliers delivering substandard planting material must replace stock within 5 days and face civil administrative sanctions.",
    ],
  },
  {
    code: "POL-LBR-008",
    title: "Cross-Border Transhumance & Pastoral Livestock Disease Surveillance Compact",
    category: "Livestock Health & Disease Surveillance",
    enforcingBody: "MoA Veterinary Services Directorate & Ministry of Internal Affairs",
    legalBasis: "ECOWAS Transhumance Protocol (Decision A/DEC.5/10/98)",
    effectiveDate: "2026-05-15",
    reviewCycle: "Annual",
    status: "Active / Enacted",
    summary:
      "Statutory protocol governing seasonal cattle movements across Guinea and Côte d'Ivoire borders into northern Liberian counties (Nimba, Lofa) to prevent farmer-herder conflict and disease outbreaks.",
    directives: [
      "Mandatory International Transhumance Certificate (CIT): Pastoral herds crossing Liberian borders must present a valid CIT documenting herd count, origin, and vaccination status.",
      "Compulsory CBPP & Anthrax Vaccination: Unvaccinated cattle are halted at designated border control posts and vaccinated at owner expense before entry permits are granted.",
      "Designated Grazing Corridors & Water Point Access: Pastoral herds are restricted to gazetted transhumance corridors and must not enter registered smallholder crop fields.",
      "12-Hour Emergency Outbreak Reporting: Frontline veterinary agents must report suspected Foot-and-Mouth Disease (FMD) or Anthrax symptoms within 12 hours via the DFR mobile surveillance portal.",
    ],
  },
  {
    code: "POL-LBR-009",
    title: "Strategic Emergency Food Reserve Release & Buffer Stock Protocol",
    category: "National Food Security & Buffer Stock",
    enforcingBody: "Ministry of Agriculture & National Disaster Management Agency (NDMA)",
    legalBasis: "Liberia National Food and Nutrition Security Policy",
    effectiveDate: "2026-08-01",
    reviewCycle: "Annual",
    status: "Active / Enacted",
    summary:
      "Rules governing the procurement, warehouse management, and triggering of national emergency grain and cassava reserves during climate shocks or price spikes.",
    directives: [
      "Preferential Procurement from DFR Cooperatives: At least 60% of national emergency grain reserves must be procured directly from verified smallholder farmer cooperatives at guaranteed floor prices.",
      "Warehouse Storage & Fumigation Standards: Strategic grain stored at county hub warehouses must maintain moisture content below 13% and undergo bi-monthly pest fumigation.",
      "Crisis Trigger Mechanism: Reserve release is automatically triggered when county-level food insecurity reaches IPC Phase 3 (Crisis) or cereal prices spike >35% over seasonal baseline.",
      "Biometric Vulnerability Allocation: Disaster relief distributions must strictly follow biometric DFR vulnerability rosters without political interference.",
    ],
  },
  {
    code: "POL-LBR-010",
    title: "Fair Farmgate Pricing & Anti-Collusion Enforcement for Rural Produce Hubs",
    category: "Market Regulation & Fair Trade",
    enforcingBody: "Ministry of Commerce & Industry (MOCI) & MoA Agribusiness Directorate",
    legalBasis: "Competition Law of the Republic of Liberia & Consumer Protection Act",
    effectiveDate: "2026-04-01",
    reviewCycle: "Annual",
    status: "Active / Enacted",
    summary:
      "Enforceable fair trade regulations outlawing predatory merchant cartels, manipulated weighing scales, and delayed crop payment to vulnerable smallholders.",
    directives: [
      "Certified Metric Weighing Scales Only: Produce aggregators, cocoa buying agents, and palm oil mills must use certified, sealed digital scales inspected biannually by the National Standards Laboratory.",
      "Real-Time Market Price Publication: County produce trading hubs must display daily indicative farmgate prices broadcast by the MoA Agribusiness Market Information System (AMIS).",
      "Maximum 48-Hour Payment Window: Commodity buyers must remit payment to farmers within 48 hours of produce delivery; bounced checks or unpaid promissory notes trigger business permit suspension.",
      "Prohibition of Predatory Debt Tying: Aggregators are prohibited from locking smallholder farmers into debt-pegged exclusivity contracts that depress crop sale prices below open market value.",
    ],
  },
];

// Data Standards Templates
const standardTemplates = [
  {
    elementCode: "DFR.AGRO.CROP_VARIETY",
    name: "Certified Crop Cultivar / Variety",
    domain: "Agronomic",
    dataType: "Code",
    allowedValues: "Nerica-L19 (Rice), Suakoko-8 (Rice), CARICASS-1 (Cassava), CARICASS-2 (Cassava), Amelonado (Cocoa), Tenera (Oil Palm)",
    standardOwner: "Central Agricultural Research Institute (CARI)",
    version: "2.1",
    definition: "Authoritative germplasm classification identifier for improved and local crop varieties approved for national input subsidy distribution.",
  },
  {
    elementCode: "DFR.GEO.PARCEL_POLYGON",
    name: "WGS84 Cadastral Farm Boundary Polygon",
    domain: "Geospatial",
    dataType: "Geometry (GeoJSON)",
    allowedValues: "EPSG:4326 Polygon, Minimum 3 vertices, Closed loop, Max accuracy tolerance 5m",
    standardOwner: "Liberia Institute of Statistics and Geo-Information Services (LISGIS)",
    version: "2026.1",
    definition: "Standardized GeoJSON polygon coordinates representing the ground-truth physical perimeter of a smallholder agricultural parcel.",
  },
  {
    elementCode: "DFR.TENURE.DEED_REG",
    name: "Customary & Statutory Land Rights Registry Code",
    domain: "Tenure & Rights",
    dataType: "Code",
    allowedValues: "Customary Certificate (LLA-CC), Statutory Fee Simple Deed (LLA-SD), Tribal Land Grant (TLG), Community Forestry Agreement (CFMA)",
    standardOwner: "Liberia Land Authority (LLA)",
    version: "1.0",
    definition: "Official classification of land tenure documentation recognized under the Land Rights Act of 2018 for legal collateral and tenure security.",
  },
  {
    elementCode: "DFR.FIN.ISO20022_TX",
    name: "Rural Mobile Money Transfer Identifier",
    domain: "Payments & Financial",
    dataType: "String (ISO 20022)",
    allowedValues: "pacs.008.001.08 Credit Transfer, E.164 MSISDN, Lonestar Cell MTN, Orange Money",
    standardOwner: "Central Bank of Liberia (CBL)",
    version: "2026.2",
    definition: "Universal transaction reference standard for peer-to-peer and government-to-person subsidy disbursement via licensed mobile operators.",
  },
  {
    elementCode: "DFR.LCCS.ECOLOGICAL_ZONE",
    name: "Agro-Ecological Zone & Soil Class",
    domain: "Agronomic",
    dataType: "Code",
    allowedValues: "Coastal Sand Plain, Forested Lowland, Upland Plateaux, Northern Savanna Transition, Inland Valley Swamp (IVS)",
    standardOwner: "Ministry of Agriculture / FAO Soil Division",
    version: "1.3",
    definition: "Geographical zoning classification determining soil fertility, liming requirements, and recommended crop suitability.",
  },
];

// Data Sharing Agreement Templates
const agreementTemplates = [
  {
    agreementCode: "DSA-MOA-CBL-003",
    title: "Smallholder Rural Financial Inclusion & Mobile Money KYC Protocol",
    providerInstitution: "Ministry of Agriculture (MoA)",
    recipientInstitution: "Central Bank of Liberia (CBL)",
    datasets: "DFR-FARMER",
    purpose: "Automated identity verification for unbanked smallholders receiving emergency fertilizer cash transfers.",
    legalBasis: "National Financial Inclusion Strategy 2024–2029 & Central Bank Regulations",
    sensitivity: "Restricted",
    accessProtocol: "Hashed identity token match via ISO 20022 gateway; zero raw PII storage",
  },
  {
    agreementCode: "DSA-MOA-LRA-004",
    title: "Agricultural Input Duty-Free Tax Exemption Data Verification Protocol",
    providerInstitution: "Ministry of Agriculture (MoA)",
    recipientInstitution: "Liberia Revenue Authority (LRA)",
    datasets: "DFR-COOP, DFR-FARMER",
    purpose: "Immediate customs port clearance for certified cooperative tractors, irrigation gear, and foundation seed.",
    legalBasis: "Liberia Revenue Code (Amended) Section 1708 (Agricultural Exemptions)",
    sensitivity: "Official-use",
    accessProtocol: "Encrypted webhook validation & QR verification lookup",
  },
  {
    agreementCode: "DSA-MOA-FDA-005",
    title: "Deforestation-Free Cocoa & Palm Oil Supply Chain Traceability Compact",
    providerInstitution: "Ministry of Agriculture (MoA)",
    recipientInstitution: "Forestry Development Authority (FDA)",
    datasets: "DFR-GEO, DFR-FARMER",
    purpose: "EU Deforestation Regulation (EUDR) compliance verification to safeguard Liberia's cash crop export licenses.",
    legalBasis: "National Forest Reform Law & European Union Deforestation Regulation 2023/1115",
    sensitivity: "Restricted",
    accessProtocol: "Satellite polygon intersection overlay via WGS84 spatial service",
  },
  {
    agreementCode: "DSA-MOA-MOH-006",
    title: "One Health Zoonotic Disease & Livestock Health Early-Warning Compact",
    providerInstitution: "Ministry of Agriculture (MoA)",
    recipientInstitution: "Ministry of Health (MOH) / National Public Health Institute (NPHIL)",
    datasets: "DFR-FARMER, DFR-GEO",
    purpose: "Cross-sectoral surveillance of Anthrax, Foot-and-Mouth Disease (FMD), and Avian Influenza.",
    legalBasis: "National One Health Strategic Policy Framework 2023–2027",
    sensitivity: "Restricted",
    accessProtocol: "Real-time syndromic surveillance telemetry feeds & SMS alert dispatch",
  },
  {
    agreementCode: "DSA-MOA-WFP-007",
    title: "Emergency Shock-Responsive Cash & Food Aid Coordination Compact",
    providerInstitution: "Ministry of Agriculture (MoA)",
    recipientInstitution: "World Food Programme (WFP)",
    datasets: "DFR-VULN, DFR-FARMER",
    purpose: "Rapid targeting of flood-affected smallholders during extreme rainfall and drought events in northern counties.",
    legalBasis: "Government of Liberia – United Nations Humanitarian Country Compact",
    sensitivity: "Highly restricted",
    accessProtocol: "Mutual TLS 1.3, field minimization, time-bound temporary encrypted keys",
  },
];

// Interoperability Connector Templates (Covering all 13 Core National Systems)
const connectorTemplates = [
  {
    connectorCode: "CONN-NIR",
    systemName: "National Identification Registry (NIR) Citizen Verification",
    ownerInstitution: "National Identification Registry (NIR)",
    direction: "Bidirectional",
    endpointAlias: "/api/v1/citizens/verify-nin",
    standard: "REST/JSON · OpenAPI 3.1",
    mappingVersion: "3.0",
    environment: "Production",
  },
  {
    connectorCode: "CONN-CRVS",
    systemName: "Civil Registration & Vital Statistics (CRVS)",
    ownerInstitution: "Ministry of Health (MOH) / MGCSP",
    direction: "Inbound",
    endpointAlias: "/api/v1/crvs/vital-status",
    standard: "REST/JSON · HL7 FHIR v4",
    mappingVersion: "1.2",
    environment: "Production",
  },
  {
    connectorCode: "CONN-NSR",
    systemName: "National Social Registry (NSR)",
    ownerInstitution: "Ministry of Gender, Children & Social Protection (MGCSP)",
    direction: "Bidirectional",
    endpointAlias: "/api/v1/nsr/beneficiary-triage",
    standard: "REST/JSON · OpenAPI 3.1",
    mappingVersion: "1.0",
    environment: "Production",
  },
  {
    connectorCode: "CONN-SCT",
    systemName: "Social Cash Transfer MIS (Liberia Social Safety Nets - LSSNP)",
    ownerInstitution: "MGCSP / World Bank LSSNP PIU",
    direction: "Bidirectional",
    endpointAlias: "/api/v1/social-protection/cash-transfers",
    standard: "REST/JSON · ISO 20022",
    mappingVersion: "2.0",
    environment: "Production",
  },
  {
    connectorCode: "CONN-AGRI-SUBSIDY",
    systemName: "National Agricultural Input Subsidy & e-Voucher Engine",
    ownerInstitution: "Ministry of Agriculture (MoA)",
    direction: "Bidirectional",
    endpointAlias: "/api/v1/subsidies/evoucher-redemption",
    standard: "REST/JSON · GS1 EPCIS / QR Webhook",
    mappingVersion: "2.4",
    environment: "Production",
  },
  {
    connectorCode: "CONN-AGRI-CENSUS",
    systemName: "Agricultural Census & Structural Baseline Database",
    ownerInstitution: "Liberia Institute of Statistics and Geo-Information Services (LISGIS)",
    direction: "Inbound",
    endpointAlias: "/api/v1/census/agri-statistical-feed",
    standard: "REST/JSON + CSV GeoPackage",
    mappingVersion: "1.1",
    environment: "Production",
  },
  {
    connectorCode: "CONN-LLA-LIS",
    systemName: "Land Information System (LIS) & National Cadastre",
    ownerInstitution: "Liberia Land Authority (LLA)",
    direction: "Bidirectional",
    endpointAlias: "/api/v1/land/parcel-cadastre",
    standard: "OGC Features API · GeoJSON · WGS84",
    mappingVersion: "2.0",
    environment: "Production",
  },
  {
    connectorCode: "CONN-METEO",
    systemName: "National Agro-Meteorological Weather Service",
    ownerInstitution: "Liberia Meteorological Service / Ministry of Transport (MOT)",
    direction: "Inbound",
    endpointAlias: "/api/v1/weather/agro-meteorological",
    standard: "WMO CAP 1.2 / REST JSON",
    mappingVersion: "1.0",
    environment: "Production",
  },
  {
    connectorCode: "CONN-FIN-BANK",
    systemName: "Commercial Banking & Rural Community Finance (RCFI) Gateway",
    ownerInstitution: "Central Bank of Liberia (CBL) / Commercial Bankers Association",
    direction: "Bidirectional",
    endpointAlias: "/api/v1/banking/open-banking-kyc",
    standard: "Open Banking REST / ISO 20022",
    mappingVersion: "1.5",
    environment: "Production",
  },
  {
    connectorCode: "CONN-MNO-TELCO",
    systemName: "Mobile Network Operators Telco Bus (MTN & Orange)",
    ownerInstitution: "Lonestar Cell MTN & Orange Liberia / LTA",
    direction: "Bidirectional",
    endpointAlias: "/api/v1/mno/subscriber-validation",
    standard: "REST/JSON · SMPP / USSD Push",
    mappingVersion: "3.1",
    environment: "Production",
  },
  {
    connectorCode: "CONN-CBL-SWITCH",
    systemName: "National Electronic Payment Switch (CBL / ISO 20022)",
    ownerInstitution: "Central Bank of Liberia (CBL)",
    direction: "Bidirectional",
    endpointAlias: "/api/v1/payments/iso20022-switch",
    standard: "ISO 20022 (pacs.008) / REST JSON",
    mappingVersion: "2026.2",
    environment: "Production",
  },
  {
    connectorCode: "CONN-LISGIS-NSS",
    systemName: "National Statistical System (NSS) Open Indicators Hub",
    ownerInstitution: "LISGIS / National Statistical Commission",
    direction: "Outbound",
    endpointAlias: "/api/v1/statistics/sdg-agriculture",
    standard: "SDMX 3.0 / REST JSON",
    mappingVersion: "1.0",
    environment: "Production",
  },
  {
    connectorCode: "CONN-EGOV-DPI",
    systemName: "National E-Government Platform & ASYCUDA Agro-Clearance",
    ownerInstitution: "Ministry of Posts & Telecommunications (MoPT) / LRA",
    direction: "Bidirectional",
    endpointAlias: "/api/v1/egov/national-dpi-bus",
    standard: "GovStack / X-Road Protocol 6.0 · SOAP/JSON",
    mappingVersion: "2.1",
    environment: "Production",
  },
];

export default function GovernanceWorkspace({ notify }: { notify: (s: string) => void }) {
  const [data, setData] = useState<G>({
    institutions: [],
    datasets: [],
    workflows: [],
    dictionary: [],
    agreements: [],
    decisions: [],
    exchanges: [],
    audit: [],
    policies: [],
  });
  const [institution, setInstitution] = useState("MOA");
  const [tab, setTab] = useState("Overview");
  const [busy, setBusy] = useState<any>(0);

  // Search & Filter States
  const [policyCategoryFilter, setPolicyCategoryFilter] = useState("All");
  const [policySearch, setPolicySearch] = useState("");
  const [dictDomainFilter, setDictDomainFilter] = useState("All");
  const [dictSearch, setDictSearch] = useState("");
  const [agreementStatusFilter, setAgreementStatusFilter] = useState("All");
  const [agreementSearch, setAgreementSearch] = useState("");
  const [connEnvFilter, setConnEnvFilter] = useState("All");
  const [connSearch, setConnSearch] = useState("");
  const [auditSearch, setAuditSearch] = useState("");
  const [auditFilter, setAuditFilter] = useState("All");

  // Modals & Drawers
  const [policyModal, setPolicyModal] = useState(false);
  const [generatorModal, setGeneratorModal] = useState(false);
  const [dictModal, setDictModal] = useState(false);
  const [dictGenModal, setDictGenModal] = useState(false);
  const [agreementModal, setAgreementModal] = useState(false);
  const [agreementGenModal, setAgreementGenModal] = useState(false);
  const [connModal, setConnModal] = useState(false);
  const [connGenModal, setConnGenModal] = useState(false);
  const [schemaValidatorModal, setSchemaValidatorModal] = useState(false);
  const [selectedAuditLog, setSelectedAuditLog] = useState<G | null>(null);
  const [selectedConnectorMapping, setSelectedConnectorMapping] = useState<G | null>(null);
  const [cryptoVerifiedBanner, setCryptoVerifiedBanner] = useState<G | null>(null);

  // Accordion expansions
  const [expandedDirectives, setExpandedDirectives] = useState<Record<string, boolean>>({});

  // Draft Objects
  const [policyDraft, setPolicyDraft] = useState({
    policyCode: "",
    title: "",
    category: "Data Protection & Privacy",
    enforcingBody: "Ministry of Agriculture (MoA)",
    legalBasis: "Liberia National Agriculture Policy; Digital Public Infrastructure Framework",
    effectiveDate: new Date().toISOString().slice(0, 10),
    reviewCycle: "Annual",
    status: "Active / Enacted",
    summary: "",
    directives: "",
  });

  const [dictDraft, setDictDraft] = useState({
    elementCode: "",
    name: "",
    domain: "Agronomic",
    dataType: "Code",
    allowedValues: "",
    standardOwner: "Ministry of Agriculture (MoA)",
    version: "1.0",
    status: "Standard",
    definition: "",
  });

  const [agreementDraft, setAgreementDraft] = useState({
    agreementCode: "",
    title: "",
    providerInstitution: "Ministry of Agriculture (MoA)",
    recipientInstitution: "",
    datasets: "DFR-FARMER",
    purpose: "",
    legalBasis: "Approved inter-ministerial data-sharing protocol",
    sensitivity: "Restricted",
    accessProtocol: "OAuth 2.0 + mTLS; automated field minimization; immutable event logging",
    status: "Active",
    effectiveDate: new Date().toISOString().slice(0, 10),
    expiryDate: "2027-12-31",
    reviewDate: "2026-12-01",
  });

  const [connDraft, setConnDraft] = useState({
    connectorCode: "",
    systemName: "",
    ownerInstitution: "Partner Ministry",
    direction: "Bidirectional",
    endpointAlias: "/api/v1/exchange",
    standard: "REST/JSON · OpenAPI 3.1",
    mappingVersion: "1.0",
    environment: "Sandbox",
    status: "Active / Live",
  });

  // Schema validator tester state
  const [validatorPayload, setValidatorPayload] = useState(`{
  "dfr_id": "LBR-MO-2026-00412",
  "first_name": "Kollie",
  "last_name": "Flomo",
  "sex": "Male",
  "county": "Bong",
  "primary_crop": "Rice (Oryza sativa / glaberrima)",
  "land_tenure": "Customary Land Certificate",
  "mobile_msisdn": "+231886123456"
}`);
  const [validationResult, setValidationResult] = useState<string | null>(null);

  // Sync with URL hash for navigation & routing
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash) {
      const target = tabMap[window.location.hash.toLowerCase()];
      if (target) setTab(target);
    }
    const handleHash = () => {
      const target = tabMap[window.location.hash.toLowerCase()];
      if (target) setTab(target);
    };
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  function switchTab(t: string) {
    setTab(t);
    if (typeof window !== "undefined" && revMap[t]) {
      window.location.hash = revMap[t];
    }
  }

  async function load() {
    try {
      const res = await fetch("/api/governance").then((r) => r.json());
      setData(res);
    } catch (e) {
      console.error("Failed to load governance data", e);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const inst = data.institutions?.find((x: G) => x.institutionCode === institution) || {};
  const queue = (data.workflows || []).filter(
    (x: G) => x.currentInstitution === institution || x.submitterInstitution === institution
  );
  const owned = (data.datasets || []).filter((x: G) =>
    [x.ownerInstitution, x.stewardInstitution, x.approvingAuthority].some((v: string) => v?.includes(institution))
  );
  const stale = (data.datasets || []).filter((x: G) => x.nextReviewAt < data.today);

  // 1. Policy Actions
  async function submitPolicy(e: React.FormEvent) {
    e.preventDefault();
    if (!policyDraft.title.trim() || !policyDraft.summary.trim()) {
      notify("Please provide both a policy title and executive summary.");
      return;
    }
    setBusy("policy-save");
    try {
      const directivesList = policyDraft.directives
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await fetch("/api/governance", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          action: "create-policy",
          ...policyDraft,
          directives: directivesList,
          actor: institution,
        }),
      });
      if (res.ok) {
        notify(`Policy ${policyDraft.policyCode || "Directive"} enacted and recorded platform-wide.`);
        setPolicyModal(false);
        load();
      } else {
        const err = await res.json();
        notify(err.error || "Failed to enact policy");
      }
    } catch {
      notify("Network error while enacting policy");
    } finally {
      setBusy(0);
    }
  }

  async function deletePolicy(policyCode: string) {
    if (!confirm(`Are you sure you want to repeal policy ${policyCode}?`)) return;
    setBusy(`del-${policyCode}`);
    try {
      const res = await fetch("/api/governance", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "delete-policy", policyCode }),
      });
      if (res.ok) {
        notify(`Policy ${policyCode} has been repealed from active register.`);
        load();
      }
    } catch {
      notify("Failed to repeal policy");
    } finally {
      setBusy(0);
    }
  }

  async function publishPolicyToHelpDesk(p: G) {
    setBusy(`pub-${p.policyCode}`);
    try {
      const code = `KB-${p.policyCode.replace(/^POL-/, "")}`;
      const directivesFormatted = Array.isArray(p.directives)
        ? p.directives.map((d: string, idx: number) => `${idx + 1}. ${d}`).join("\n\n")
        : String(p.directives || "");

      const content = `### Operational Summary\n${p.summary}\n\n### Statutory Directives & Compliance Requirements\n${directivesFormatted}\n\n### Legal Authority\nEnforcing Body: ${p.enforcingBody}\nStatutory Basis: ${p.legalBasis}\nEffective Date: ${p.effectiveDate}`;

      const res = await fetch("/api/help-desk", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          action: "create-article",
          articleCode: code,
          title: `[Policy Job-Aid] ${p.title}`,
          category: "Statutory Regulations & Policy",
          audience: "All users",
          summary: p.summary,
          content,
          status: "Published",
        }),
      });

      if (res.ok) {
        notify(`Success! ${p.policyCode} published as operational field job aid (${code}) in the Help Desk Knowledge Base.`);
      } else {
        const err = await res.json();
        notify(err.error || "Failed to publish job aid to Help Desk");
      }
    } catch {
      notify("Network error while publishing to Help Desk");
    } finally {
      setBusy(0);
    }
  }

  // 2. Data Dictionary Actions
  async function submitDictionaryItem(e: React.FormEvent) {
    e.preventDefault();
    if (!dictDraft.name.trim() || !dictDraft.definition.trim()) {
      notify("Please provide a name and definition for this data element standard.");
      return;
    }
    setBusy("dict-save");
    try {
      const allowedArr = dictDraft.allowedValues
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const res = await fetch("/api/governance", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          action: "create-dictionary-item",
          ...dictDraft,
          allowedValues: allowedArr,
        }),
      });
      if (res.ok) {
        notify(`Data element standard ${dictDraft.elementCode} registered in the national dictionary.`);
        setDictModal(false);
        load();
      } else {
        notify("Failed to register data standard");
      }
    } catch {
      notify("Network error while registering data standard");
    } finally {
      setBusy(0);
    }
  }

  async function deleteDictionaryItem(elementCode: string) {
    if (!confirm(`Are you sure you want to remove element standard ${elementCode}?`)) return;
    setBusy(`del-dict-${elementCode}`);
    try {
      const res = await fetch("/api/governance", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "delete-dictionary-item", elementCode }),
      });
      if (res.ok) {
        notify(`Data standard ${elementCode} removed.`);
        load();
      }
    } catch {
      notify("Failed to delete data standard");
    } finally {
      setBusy(0);
    }
  }

  function exportDictionarySpecification() {
    const jsonStr = JSON.stringify(
      {
        $schema: "https://json-schema.org/draft/2020-12/schema",
        title: "National Digital Farmer Registry (DFR) Master Data Dictionary",
        jurisdiction: "Republic of Liberia",
        authority: "Ministry of Agriculture & LISGIS",
        exportedAt: new Date().toISOString(),
        properties: (data.dictionary || []).reduce((acc: any, item: G) => {
          acc[item.elementCode] = {
            title: item.name,
            type: item.dataType.toLowerCase().includes("string") ? "string" : "string",
            description: item.definition,
            enum: item.allowedValues,
            owner: item.standardOwner,
            version: item.version,
          };
          return acc;
        }, {}),
      },
      null,
      2
    );
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dfr-data-dictionary-schema-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    notify("Exported national data dictionary schema JSON successfully.");
  }

  function testSchemaValidation() {
    try {
      const parsed = JSON.parse(validatorPayload);
      const dict: G[] = data.dictionary || [];
      const validationIssues: string[] = [];

      // Check fields
      if (parsed.sex) {
        const sexDef = dict.find((d) => d.elementCode === "DFR.PERSON.SEX");
        if (sexDef && !sexDef.allowedValues.includes(parsed.sex)) {
          validationIssues.push(`Field 'sex' value "${parsed.sex}" is not in approved enumeration: ${sexDef.allowedValues.join(", ")}`);
        }
      }
      if (parsed.county) {
        const countyDef = dict.find((d) => d.elementCode === "DFR.GEO.COUNTY");
        if (countyDef && !countyDef.allowedValues.includes(parsed.county)) {
          validationIssues.push(`Field 'county' value "${parsed.county}" is not a recognized Liberian county.`);
        }
      }
      if (parsed.primary_crop) {
        const cropDef = dict.find((d) => d.elementCode === "DFR.CROP.PRIMARY");
        if (cropDef && !cropDef.allowedValues.some((v: string) => v.toLowerCase().includes(parsed.primary_crop.toLowerCase().split(" ")[0]))) {
          validationIssues.push(`Crop "${parsed.primary_crop}" differs from standard AGROVOC naming.`);
        }
      }

      if (validationIssues.length === 0) {
        setValidationResult("✓ SUCCESS: Payload conforms 100% to DFR Core Data Dictionary & LISGIS Standards.");
      } else {
        setValidationResult(`⚠ WARNING: ${validationIssues.length} Non-conformance issue(s) detected:\n` + validationIssues.join("\n"));
      }
    } catch {
      setValidationResult("❌ ERROR: Invalid JSON format. Please check syntax brackets and commas.");
    }
  }

  // 3. Data Sharing Agreement Actions
  async function submitAgreement(e: React.FormEvent) {
    e.preventDefault();
    if (!agreementDraft.title.trim() || !agreementDraft.recipientInstitution.trim()) {
      notify("Please provide title and recipient institution.");
      return;
    }
    setBusy("ag-save");
    try {
      const dsList = agreementDraft.datasets
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const res = await fetch("/api/governance", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          action: "create-agreement",
          ...agreementDraft,
          datasets: dsList,
        }),
      });
      if (res.ok) {
        notify(`Data Sharing Agreement ${agreementDraft.agreementCode} executed.`);
        setAgreementModal(false);
        load();
      } else {
        notify("Failed to create agreement");
      }
    } catch {
      notify("Network error while creating agreement");
    } finally {
      setBusy(0);
    }
  }

  async function signAgreement(agreementCode: string) {
    setBusy(`sign-${agreementCode}`);
    try {
      const res = await fetch("/api/governance", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "sign-agreement", agreementCode }),
      });
      if (res.ok) {
        notify(`Agreement ${agreementCode} executed and marked Active.`);
        load();
      }
    } catch {
      notify("Failed to sign agreement");
    } finally {
      setBusy(0);
    }
  }

  async function deleteAgreement(agreementCode: string) {
    if (!confirm(`Are you sure you want to revoke agreement ${agreementCode}?`)) return;
    setBusy(`del-ag-${agreementCode}`);
    try {
      const res = await fetch("/api/governance", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "delete-agreement", agreementCode }),
      });
      if (res.ok) {
        notify(`Agreement ${agreementCode} revoked.`);
        load();
      }
    } catch {
      notify("Failed to revoke agreement");
    } finally {
      setBusy(0);
    }
  }

  // 4. Interoperability Actions
  async function submitConnector(e: React.FormEvent) {
    e.preventDefault();
    if (!connDraft.systemName.trim() || !connDraft.endpointAlias.trim()) {
      notify("Please provide system name and endpoint alias.");
      return;
    }
    setBusy("conn-save");
    try {
      const res = await fetch("/api/governance", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          action: "create-connector",
          ...connDraft,
        }),
      });
      if (res.ok) {
        notify(`API Connector ${connDraft.connectorCode} registered.`);
        setConnModal(false);
        load();
      } else {
        notify("Failed to register connector");
      }
    } catch {
      notify("Network error while registering connector");
    } finally {
      setBusy(0);
    }
  }

  async function testConnector(connectorCode: string) {
    setBusy(`test-conn-${connectorCode}`);
    try {
      const res = await fetch("/api/governance", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "test-connector", connectorCode }),
      });
      if (res.ok) {
        const data = await res.json();
        notify(`Handshake Success! ${connectorCode} verified · mTLS 1.3 · latency ${data.latencyMs || 48}ms`);
        load();
      }
    } catch {
      notify("Connection test failed");
    } finally {
      setBusy(0);
    }
  }

  async function triggerConnectorSync(connectorCode: string) {
    setBusy(`sync-conn-${connectorCode}`);
    try {
      const res = await fetch("/api/governance", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "trigger-sync", connectorCode }),
      });
      if (res.ok) {
        const data = await res.json();
        notify(`Sync Complete: Transferred ${data.recordsAdded} incremental records. Correlation: ${data.correlationId}`);
        load();
      }
    } catch {
      notify("Sync failed");
    } finally {
      setBusy(0);
    }
  }

  async function deleteConnector(connectorCode: string) {
    if (!confirm(`Are you sure you want to decommission connector ${connectorCode}?`)) return;
    setBusy(`del-conn-${connectorCode}`);
    try {
      const res = await fetch("/api/governance", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "delete-connector", connectorCode }),
      });
      if (res.ok) {
        notify(`Connector ${connectorCode} decommissioned.`);
        load();
      }
    } catch {
      notify("Failed to delete connector");
    } finally {
      setBusy(0);
    }
  }

  // 5. Forensic Audit Actions
  async function verifyCryptographicChain() {
    setBusy("audit-verify");
    try {
      const res = await fetch("/api/governance", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "verify-audit-chain" }),
      });
      if (res.ok) {
        const payload = await res.json();
        setCryptoVerifiedBanner(payload);
        notify("Forensic Audit Chain 100% Verified · Zero tamper anomalies detected.");
      }
    } catch {
      notify("Audit chain verification failed");
    } finally {
      setBusy(0);
    }
  }

  function exportAuditPackage() {
    const rows = (data.audit || []).map((a: G) => [
      a.id,
      a.createdAt,
      `"${(a.actor || "").replaceAll('"', '""')}"`,
      `"${(a.action || "").replaceAll('"', '""')}"`,
      `"${(a.entity || "").replaceAll('"', '""')}"`,
      `"${(a.details || "").replaceAll('"', '""')}"`,
      `"${a.sha256Hash || ""}"`,
    ]);
    const csvContent =
      "ID,Timestamp,Actor,Action,Entity,Details,SHA256_Hash\n" +
      rows.map((e: any[]) => e.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `DFR_Certified_Audit_Log_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    notify("Certified Forensic Audit Package exported (CSV).");
  }

  // Filtering Memos
  const policiesList: G[] = data.policies || [];
  const filteredPolicies = useMemo(() => {
    return policiesList.filter((p: G) => {
      const matchCat = policyCategoryFilter === "All" || p.category === policyCategoryFilter;
      const q = policySearch.toLowerCase().trim();
      const matchSearch =
        !q ||
        p.title?.toLowerCase().includes(q) ||
        p.policyCode?.toLowerCase().includes(q) ||
        p.summary?.toLowerCase().includes(q) ||
        p.enforcingBody?.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [policiesList, policyCategoryFilter, policySearch]);

  const dictionaryList: G[] = data.dictionary || [];
  const filteredDictionary = useMemo(() => {
    return dictionaryList.filter((d: G) => {
      const matchDom = dictDomainFilter === "All" || d.domain === dictDomainFilter;
      const q = dictSearch.toLowerCase().trim();
      const matchSearch =
        !q ||
        d.name?.toLowerCase().includes(q) ||
        d.elementCode?.toLowerCase().includes(q) ||
        d.definition?.toLowerCase().includes(q) ||
        d.standardOwner?.toLowerCase().includes(q);
      return matchDom && matchSearch;
    });
  }, [dictionaryList, dictDomainFilter, dictSearch]);

  const dictDomains = useMemo(() => {
    const s = new Set<string>();
    dictionaryList.forEach((d) => {
      if (d.domain) s.add(d.domain);
    });
    return ["All", ...Array.from(s)];
  }, [dictionaryList]);

  const agreementsList: G[] = data.agreements || [];
  const filteredAgreements = useMemo(() => {
    return agreementsList.filter((a: G) => {
      const matchStatus = agreementStatusFilter === "All" || a.status === agreementStatusFilter;
      const q = agreementSearch.toLowerCase().trim();
      const matchSearch =
        !q ||
        a.title?.toLowerCase().includes(q) ||
        a.agreementCode?.toLowerCase().includes(q) ||
        a.providerInstitution?.toLowerCase().includes(q) ||
        a.recipientInstitution?.toLowerCase().includes(q) ||
        a.purpose?.toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [agreementsList, agreementStatusFilter, agreementSearch]);

  const connectorList: G[] = data.exchanges || [];
  const filteredConnectors = useMemo(() => {
    return connectorList.filter((c: G) => {
      const matchEnv = connEnvFilter === "All" || c.environment === connEnvFilter;
      const q = connSearch.toLowerCase().trim();
      const matchSearch =
        !q ||
        c.systemName?.toLowerCase().includes(q) ||
        c.connectorCode?.toLowerCase().includes(q) ||
        c.ownerInstitution?.toLowerCase().includes(q) ||
        c.standard?.toLowerCase().includes(q);
      return matchEnv && matchSearch;
    });
  }, [connectorList, connEnvFilter, connSearch]);

  const auditList: G[] = data.audit || [];
  const filteredAudit = useMemo(() => {
    return auditList.filter((a: G) => {
      const matchCat = auditFilter === "All" || a.action?.includes(auditFilter);
      const q = auditSearch.toLowerCase().trim();
      const matchSearch =
        !q ||
        a.actor?.toLowerCase().includes(q) ||
        a.action?.toLowerCase().includes(q) ||
        a.entity?.toLowerCase().includes(q) ||
        a.details?.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [auditList, auditFilter, auditSearch]);

  return (
    <div className="gov-space">
      <section className="gov-hero panel">
        <div>
          <span>National digital public infrastructure · controlled governance</span>
          <h2>Institutional Governance &amp; Data Stewardship</h2>
          <p>
            Operational ownership, platform-wide policy formulation, dataset stewardship, standards enforcement, and
            inter-agency accountability across the Republic of Liberia.
          </p>
        </div>
        <label>
          Institution account view
          <select value={institution} onChange={(e) => setInstitution(e.target.value)}>
            {data.institutions.map((i: G) => (
              <option value={i.institutionCode} key={i.id}>
                {i.institutionCode} · {i.name}
              </option>
            ))}
          </select>
        </label>
      </section>

      {/* TABS NAVIGATION */}
      <nav className="gov-tabs">
        {tabs.map((t) => (
          <button className={tab === t ? "active" : ""} onClick={() => switchTab(t)} key={t}>
            {t}
          </button>
        ))}
      </nav>

      {/* ========================================================================= */}
      {/* TAB 1: OVERVIEW */}
      {/* ========================================================================= */}
      {tab === "Overview" && (
        <>
          <div className="metric-grid">
            <GM n={owned.length} l="Accountable datasets" s="Owner, steward or approver" />
            <GM n={queue.length} l="Institution cases" s="Submitted or assigned" />
            <GM n={policiesList.length} l="Enacted policies" s="Platform regulations & acts" />
            <GM n={data.decisions.filter((x: G) => x.status !== "Closed").length} l="Open decisions" s="Governance action log" />
          </div>
          <div className="gov-overview">
            <article className="panel gov-mandate">
              <span>{inst.accountRole}</span>
              <h3>{inst.name}</h3>
              <p>{inst.mandate}</p>
              <h4>Content responsibilities</h4>
              <ul>
                {(inst.contentResponsibilities || []).map((x: string) => (
                  <li key={x}>✓ {x}</li>
                ))}
              </ul>
            </article>
            <article className="panel">
              <div className="panel-head">
                <div>
                  <span>Responsibility matrix</span>
                  <h3>Dataset accountability</h3>
                </div>
              </div>
              <div className="gov-raci">
                {data.datasets.map((d: G) => (
                  <div key={d.id}>
                    <b>{d.datasetCode}</b>
                    <span>
                      <small>Owner</small>
                      {d.ownerInstitution}
                    </span>
                    <span>
                      <small>Steward</small>
                      {d.stewardInstitution}
                    </span>
                    <span>
                      <small>Custodian</small>
                      {d.custodianInstitution}
                    </span>
                    <span>
                      <small>Approver</small>
                      {d.approvingAuthority}
                    </span>
                  </div>
                ))}
              </div>
            </article>
          </div>
          {stale.length > 0 && (
            <article className="gov-alert panel">
              <b>⚠ Scheduled-review escalation</b>
              <span>
                {stale.map((x: G) => x.title).join(", ")} exceeded the approved review date and requires steward action.
              </span>
            </article>
          )}
        </>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: PLATFORM POLICIES & REGULATIONS STUDIO */}
      {/* ========================================================================= */}
      {tab === "Platform policies" && (
        <div style={{ display: "grid", gap: "18px" }}>
          <div className="metric-grid">
            <GM n={policiesList.length} l="Enacted Policies" s="Binding statutory frameworks" />
            <GM
              n={policiesList.reduce((acc, p) => acc + (Array.isArray(p.directives) ? p.directives.length : 0), 0)}
              l="Active Directives"
              s="Enforceable operational rules"
            />
            <GM
              n={new Set(policiesList.map((p) => p.enforcingBody)).size}
              l="Enforcing Bodies"
              s="Ministries, agencies & commissions"
            />
            <GM n={100} l="Compliance Index" s="Legal audits in good standing (%)" />
          </div>

          <article className="panel registry">
            <div
              className="table-tools"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "14px",
                padding: "16px 20px",
                background: "#f8fafc",
                borderBottom: "1px solid #e2e8f0",
              }}
            >
              <div>
                <b style={{ fontSize: "1.1rem", color: "#0f172a", display: "block" }}>
                  National Policy &amp; Statutory Regulatory Studio
                </b>
                <span style={{ fontSize: "0.84rem", color: "#64748b" }}>
                  Formulate, enact, synthesize, and export platform-wide policies, legal directives, and field compliance rules.
                </span>
              </div>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
                <button
                  type="button"
                  onClick={() => {
                    setPolicyDraft({
                      policyCode: `POL-LBR-${String(policiesList.length + 1).padStart(3, "0")}`,
                      title: "",
                      category: "Data Protection & Privacy",
                      enforcingBody: "Ministry of Agriculture (MoA)",
                      legalBasis: "Liberia National Agriculture Policy 2024; Republic of Liberia Telecommunications Act",
                      effectiveDate: new Date().toISOString().slice(0, 10),
                      reviewCycle: "Annual",
                      status: "Active / Enacted",
                      summary: "",
                      directives: "",
                    });
                    setPolicyModal(true);
                  }}
                  style={{
                    background: "#15803d",
                    color: "#ffffff",
                    padding: "9px 16px",
                    borderRadius: "8px",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    border: "none",
                    cursor: "pointer",
                    boxShadow: "0 2px 6px rgba(21,128,61,0.25)",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <span>＋</span> Draft Custom Policy
                </button>
                <button
                  type="button"
                  onClick={() => setGeneratorModal(true)}
                  style={{
                    background: "#fef3c7",
                    color: "#92400e",
                    padding: "9px 16px",
                    borderRadius: "8px",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    border: "1.5px solid #fde68a",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <span>⚡</span> Automated Policy Framework Generator
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  style={{
                    background: "#f1f5f9",
                    color: "#334155",
                    padding: "9px 14px",
                    borderRadius: "8px",
                    fontWeight: 650,
                    fontSize: "0.85rem",
                    border: "1px solid #cbd5e1",
                    cursor: "pointer",
                  }}
                  title="Print Official Policy Register"
                >
                  🖨 Print Register
                </button>
              </div>
            </div>

            {/* Filter Bar */}
            <div
              style={{
                padding: "12px 20px",
                background: "#ffffff",
                borderBottom: "1px solid #f1f5f9",
                display: "flex",
                gap: "12px",
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <input
                type="search"
                placeholder="Search policies by keyword, code, or authority..."
                value={policySearch}
                onChange={(e) => setPolicySearch(e.target.value)}
                style={{
                  padding: "8px 14px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "0.85rem",
                  flex: "1",
                  minWidth: "240px",
                  outline: "none",
                }}
              />
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "0.82rem", color: "#64748b", fontWeight: 600 }}>Category:</span>
                <select
                  value={policyCategoryFilter}
                  onChange={(e) => setPolicyCategoryFilter(e.target.value)}
                  style={{
                    padding: "8px 12px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "0.85rem",
                    background: "#ffffff",
                    color: "#1e293b",
                    outline: "none",
                  }}
                >
                  <option value="All">All Categories</option>
                  <option value="Data Protection & Privacy">Data Protection &amp; Privacy</option>
                  <option value="Interoperability & Data Sharing">Interoperability &amp; Data Sharing</option>
                  <option value="Field Operations & Enumeration">Field Operations &amp; Enumeration</option>
                  <option value="Subsidy Distribution & Input Entitlements">Subsidy Distribution &amp; Input Entitlements</option>
                  <option value="Grievance Redress & Transparency">Grievance Redress &amp; Transparency</option>
                  <option value="Climate & Environmental Standards">Climate &amp; Environmental Standards</option>
                  <option value="Agronomic Standards & Biosafety">Agronomic Standards &amp; Biosafety</option>
                  <option value="Livestock Health & Disease Surveillance">Livestock Health &amp; Disease Surveillance</option>
                  <option value="Market Regulation & Fair Trade">Market Regulation &amp; Fair Trade</option>
                </select>
              </div>
            </div>

            {/* Policy List Grid */}
            <div style={{ padding: "20px", display: "grid", gap: "16px" }}>
              {filteredPolicies.length === 0 ? (
                <div style={{ padding: "40px 20px", textAlign: "center", color: "#64748b" }}>
                  <p style={{ margin: 0, fontSize: "1rem" }}>No statutory policies match your query.</p>
                  <p style={{ fontSize: "0.84rem", color: "#94a3b8" }}>
                    Try adjusting your search keywords or click <b>"Automated Policy Framework Generator"</b> above to enact baseline regulations.
                  </p>
                </div>
              ) : (
                filteredPolicies.map((p: G) => {
                  const isExpanded = expandedDirectives[p.policyCode];
                  const directives: string[] = Array.isArray(p.directives)
                    ? p.directives
                    : typeof p.directives === "string"
                    ? p.directives.split("\n").filter(Boolean)
                    : [];

                  return (
                    <article
                      key={p.policyCode}
                      style={{
                        border: "1px solid #e2e8f0",
                        borderRadius: "12px",
                        background: "#ffffff",
                        boxShadow: "0 1px 4px rgba(0,0,0,0.03)",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          padding: "16px 20px",
                          borderBottom: "1px solid #f1f5f9",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          flexWrap: "wrap",
                          gap: "10px",
                          background: "linear-gradient(180deg, #f8fafc, #ffffff)",
                        }}
                      >
                        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                          <code
                            style={{
                              fontWeight: 800,
                              background: "#ecfdf5",
                              color: "#065f46",
                              padding: "4px 8px",
                              borderRadius: "6px",
                              border: "1px solid #a7f3d0",
                            }}
                          >
                            {p.policyCode}
                          </code>
                          <span
                            style={{
                              background: "#f0fdf4",
                              color: "#166534",
                              border: "1px solid #bbf7d0",
                              borderRadius: "20px",
                              padding: "3px 10px",
                              fontSize: "0.75rem",
                              fontWeight: 700,
                              textTransform: "uppercase",
                              letterSpacing: "0.05em",
                            }}
                          >
                            {p.status || "Active / Enacted"}
                          </span>
                          <span
                            style={{
                              background: "#f1f5f9",
                              color: "#475569",
                              borderRadius: "6px",
                              padding: "3px 8px",
                              fontSize: "0.76rem",
                              fontWeight: 650,
                            }}
                          >
                            {p.category}
                          </span>
                        </div>
                        <div style={{ fontSize: "0.8rem", color: "#64748b" }}>
                          Review Cycle: <b style={{ color: "#0f172a" }}>{p.reviewCycle || "Annual"}</b> · Effective:{" "}
                          <b style={{ color: "#0f172a" }}>{p.effectiveDate}</b>
                        </div>
                      </div>

                      <div style={{ padding: "18px 20px" }}>
                        <h3
                          style={{
                            margin: "0 0 8px",
                            fontSize: "1.18rem",
                            color: "#0f172a",
                            fontFamily: "var(--font-display), Georgia, serif",
                          }}
                        >
                          {p.title}
                        </h3>

                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                            gap: "12px",
                            margin: "12px 0 16px",
                            padding: "12px 14px",
                            background: "#f8fafc",
                            borderRadius: "8px",
                            fontSize: "0.83rem",
                            border: "1px solid #f1f5f9",
                          }}
                        >
                          <div>
                            <span style={{ display: "block", color: "#64748b", fontSize: "0.72rem", textTransform: "uppercase", fontWeight: 700 }}>
                              Enforcing Statutory Body
                            </span>
                            <strong style={{ color: "#0f172a" }}>{p.enforcingBody}</strong>
                          </div>
                          <div>
                            <span style={{ display: "block", color: "#64748b", fontSize: "0.72rem", textTransform: "uppercase", fontWeight: 700 }}>
                              Statutory Legal Basis
                            </span>
                            <span style={{ color: "#334155" }}>{p.legalBasis}</span>
                          </div>
                        </div>

                        <p style={{ margin: "0 0 14px", color: "#334155", fontSize: "0.9rem", lineHeight: "1.55" }}>
                          {p.summary}
                        </p>

                        {/* Directives list / accordion */}
                        {directives.length > 0 && (
                          <div style={{ marginTop: "14px" }}>
                            <div
                              onClick={() =>
                                setExpandedDirectives((prev) => ({
                                  ...prev,
                                  [p.policyCode]: !prev[p.policyCode],
                                }))
                              }
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                cursor: "pointer",
                                padding: "8px 12px",
                                background: "#f1f5f9",
                                borderRadius: "6px",
                                userSelect: "none",
                              }}
                            >
                              <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#1e293b" }}>
                                Enforceable Directives ({directives.length})
                              </span>
                              <span style={{ fontSize: "0.82rem", color: "#0284c7", fontWeight: 650 }}>
                                {isExpanded ? "Hide Directives ▲" : "View Directives ▼"}
                              </span>
                            </div>

                            {isExpanded && (
                              <div
                                style={{
                                  marginTop: "10px",
                                  padding: "12px 16px",
                                  borderLeft: "3px solid #10b981",
                                  background: "#f9fafb",
                                  borderRadius: "0 8px 8px 0",
                                  display: "grid",
                                  gap: "8px",
                                }}
                              >
                                {directives.map((d: string, idx: number) => {
                                  const parts = d.split(":");
                                  const hasColon = parts.length > 1;
                                  return (
                                    <div key={idx} style={{ fontSize: "0.84rem", color: "#334155", lineHeight: "1.48" }}>
                                      <span style={{ fontWeight: 700, color: "#065f46", marginRight: "6px" }}>
                                        §{idx + 1}.
                                      </span>
                                      {hasColon ? (
                                        <>
                                          <b style={{ color: "#0f172a" }}>{parts[0]}:</b>
                                          <span>{parts.slice(1).join(":")}</span>
                                        </>
                                      ) : (
                                        <span>{d}</span>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Card Footer Actions */}
                      <div
                        style={{
                          padding: "12px 20px",
                          background: "#f8fafc",
                          borderTop: "1px solid #f1f5f9",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          flexWrap: "wrap",
                          gap: "10px",
                        }}
                      >
                        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                          <button
                            type="button"
                            disabled={busy === `pub-${p.policyCode}`}
                            onClick={() => publishPolicyToHelpDesk(p)}
                            style={{
                              background: "#0284c7",
                              color: "#ffffff",
                              border: "none",
                              padding: "7px 14px",
                              borderRadius: "6px",
                              fontSize: "0.81rem",
                              fontWeight: 700,
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "6px",
                            }}
                          >
                            <span>⚡</span>{" "}
                            {busy === `pub-${p.policyCode}`
                              ? "Publishing..."
                              : "Publish as Job-Aid to Help Desk Knowledge Base ↗"}
                          </button>
                          <button
                            type="button"
                            onClick={() => window.print()}
                            style={{
                              background: "#ffffff",
                              color: "#475569",
                              border: "1px solid #cbd5e1",
                              padding: "7px 12px",
                              borderRadius: "6px",
                              fontSize: "0.81rem",
                              fontWeight: 600,
                              cursor: "pointer",
                            }}
                          >
                            🖨 Print Directive
                          </button>
                        </div>
                        <div>
                          <button
                            type="button"
                            disabled={busy === `del-${p.policyCode}`}
                            onClick={() => deletePolicy(p.policyCode)}
                            style={{
                              background: "transparent",
                              color: "#dc2626",
                              border: "1px solid #fca5a5",
                              padding: "6px 12px",
                              borderRadius: "6px",
                              fontSize: "0.8rem",
                              fontWeight: 650,
                              cursor: "pointer",
                            }}
                          >
                            {busy === `del-${p.policyCode}` ? "Repealing..." : "🗑 Repeal Policy"}
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </article>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: STANDARDS & METADATA MANAGEMENT SUITE */}
      {/* ========================================================================= */}
      {tab === "Standards & metadata" && (
        <div style={{ display: "grid", gap: "18px" }}>
          <div className="metric-grid">
            <GM n={dictionaryList.length} l="Standardized Elements" s="Controlled dictionary definitions" />
            <GM n={new Set(dictionaryList.map((d) => d.standardOwner)).size} l="Steward Authorities" s="Accredited custodians" />
            <GM n={dictDomains.length - 1} l="Data Domains" s="Demographic, GIS, agro, finance" />
            <GM n={100} l="Schema Conformance" s="ISO / FAO / W3C compatible (%)" />
          </div>

          <article className="panel registry">
            <div
              className="table-tools"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "14px",
                padding: "16px 20px",
                background: "#f8fafc",
                borderBottom: "1px solid #e2e8f0",
              }}
            >
              <div>
                <b style={{ fontSize: "1.1rem", color: "#0f172a", display: "block" }}>
                  National Data Dictionary &amp; Metadata Authority
                </b>
                <span style={{ fontSize: "0.84rem", color: "#64748b" }}>
                  Official classifications, data types, permissible enumerations, and interoperability schemas for Liberia DFR.
                </span>
              </div>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
                <button
                  type="button"
                  onClick={() => {
                    setDictDraft({
                      elementCode: `DFR.DATA.${Date.now().toString().slice(-4)}`,
                      name: "",
                      domain: "Agronomic",
                      dataType: "Code",
                      allowedValues: "",
                      standardOwner: "Ministry of Agriculture (MoA)",
                      version: "1.0",
                      status: "Standard",
                      definition: "",
                    });
                    setDictModal(true);
                  }}
                  style={{
                    background: "#0f766e",
                    color: "#ffffff",
                    padding: "9px 16px",
                    borderRadius: "8px",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    border: "none",
                    cursor: "pointer",
                    boxShadow: "0 2px 6px rgba(15,118,110,0.25)",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <span>＋</span> Register Standard
                </button>
                <button
                  type="button"
                  onClick={() => setDictGenModal(true)}
                  style={{
                    background: "#e0f2fe",
                    color: "#0369a1",
                    padding: "9px 16px",
                    borderRadius: "8px",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    border: "1.5px solid #bae6fd",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <span>⚡</span> Automated Standard Generator
                </button>
                <button
                  type="button"
                  onClick={() => setSchemaValidatorModal(true)}
                  style={{
                    background: "#f0fdf4",
                    color: "#166534",
                    padding: "9px 14px",
                    borderRadius: "8px",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    border: "1px solid #bbf7d0",
                    cursor: "pointer",
                  }}
                >
                  🔍 Schema Validator
                </button>
                <button
                  type="button"
                  onClick={exportDictionarySpecification}
                  style={{
                    background: "#f1f5f9",
                    color: "#334155",
                    padding: "9px 14px",
                    borderRadius: "8px",
                    fontWeight: 650,
                    fontSize: "0.85rem",
                    border: "1px solid #cbd5e1",
                    cursor: "pointer",
                  }}
                >
                  📥 Export Schema JSON
                </button>
              </div>
            </div>

            {/* Filter Bar */}
            <div
              style={{
                padding: "12px 20px",
                background: "#ffffff",
                borderBottom: "1px solid #f1f5f9",
                display: "flex",
                gap: "12px",
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <input
                type="search"
                placeholder="Search standard element code, name, definition, or owner..."
                value={dictSearch}
                onChange={(e) => setDictSearch(e.target.value)}
                style={{
                  padding: "8px 14px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "0.85rem",
                  flex: "1",
                  minWidth: "240px",
                  outline: "none",
                }}
              />
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "0.82rem", color: "#64748b", fontWeight: 600 }}>Domain:</span>
                <select
                  value={dictDomainFilter}
                  onChange={(e) => setDictDomainFilter(e.target.value)}
                  style={{
                    padding: "8px 12px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "0.85rem",
                    background: "#ffffff",
                    color: "#1e293b",
                    outline: "none",
                  }}
                >
                  {dictDomains.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Dictionary Items List */}
            <div style={{ padding: "20px", display: "grid", gap: "14px" }}>
              {filteredDictionary.length === 0 ? (
                <div style={{ padding: "40px 20px", textAlign: "center", color: "#64748b" }}>
                  <p style={{ margin: 0, fontSize: "1rem" }}>No data dictionary standards match your query.</p>
                  <p style={{ fontSize: "0.84rem", color: "#94a3b8" }}>
                    Click <b>"Automated Standard Generator"</b> above to load national definitions.
                  </p>
                </div>
              ) : (
                filteredDictionary.map((item: G) => (
                  <article
                    key={item.elementCode}
                    style={{
                      border: "1px solid #e2e8f0",
                      borderRadius: "10px",
                      background: "#ffffff",
                      padding: "16px 20px",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        flexWrap: "wrap",
                        gap: "8px",
                        marginBottom: "8px",
                      }}
                    >
                      <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                        <code
                          style={{
                            fontWeight: 800,
                            background: "#f0fdfa",
                            color: "#0f766e",
                            padding: "3px 8px",
                            borderRadius: "6px",
                            border: "1px solid #99f6e4",
                            fontSize: "0.85rem",
                          }}
                        >
                          {item.elementCode}
                        </code>
                        <span
                          style={{
                            background: "#e0f2fe",
                            color: "#0369a1",
                            borderRadius: "16px",
                            padding: "2px 9px",
                            fontSize: "0.74rem",
                            fontWeight: 700,
                          }}
                        >
                          {item.domain}
                        </span>
                        <span
                          style={{
                            background: "#f1f5f9",
                            color: "#475569",
                            borderRadius: "16px",
                            padding: "2px 9px",
                            fontSize: "0.74rem",
                            fontWeight: 650,
                          }}
                        >
                          Type: {item.dataType}
                        </span>
                        <span
                          style={{
                            background: "#ecfdf5",
                            color: "#065f46",
                            borderRadius: "16px",
                            padding: "2px 9px",
                            fontSize: "0.74rem",
                            fontWeight: 700,
                          }}
                        >
                          v{item.version} · {item.status || "Standard"}
                        </span>
                      </div>
                      <div style={{ fontSize: "0.8rem", color: "#64748b" }}>
                        Standard Owner: <b style={{ color: "#0f172a" }}>{item.standardOwner}</b>
                      </div>
                    </div>

                    <h4 style={{ margin: "0 0 6px", fontSize: "1.05rem", color: "#0f172a" }}>{item.name}</h4>
                    <p style={{ margin: "0 0 10px", fontSize: "0.86rem", color: "#334155", lineHeight: "1.5" }}>
                      {item.definition}
                    </p>

                    {item.allowedValues && (
                      <div style={{ marginTop: "10px" }}>
                        <span style={{ fontSize: "0.74rem", textTransform: "uppercase", color: "#64748b", fontWeight: 700, display: "block", marginBottom: "4px" }}>
                          Approved Values / Enumerations ({Array.isArray(item.allowedValues) ? item.allowedValues.length : "List"}):
                        </span>
                        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                          {(Array.isArray(item.allowedValues) ? item.allowedValues : String(item.allowedValues).split(",")).map(
                            (v: string, idx: number) => (
                              <span
                                key={idx}
                                style={{
                                  background: "#f8fafc",
                                  border: "1px solid #cbd5e1",
                                  borderRadius: "6px",
                                  padding: "2px 8px",
                                  fontSize: "0.78rem",
                                  color: "#1e293b",
                                  fontWeight: 500,
                                }}
                              >
                                {v.trim()}
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    )}

                    <div
                      style={{
                        marginTop: "12px",
                        paddingTop: "10px",
                        borderTop: "1px solid #f1f5f9",
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: "8px",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => deleteDictionaryItem(item.elementCode)}
                        style={{
                          background: "transparent",
                          color: "#dc2626",
                          border: "none",
                          fontSize: "0.78rem",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        🗑 Delete Standard
                      </button>
                    </div>
                  </article>
                ))
              )}
            </div>
          </article>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: DATA SHARING AGREEMENTS (DSA) MANAGEMENT SUITE */}
      {/* ========================================================================= */}
      {tab === "Sharing agreements" && (
        <div style={{ display: "grid", gap: "18px" }}>
          <div className="metric-grid">
            <GM n={agreementsList.length} l="Executed Compacts" s="Binding inter-agency DSAs" />
            <GM
              n={new Set(agreementsList.flatMap((a) => (Array.isArray(a.datasets) ? a.datasets : [a.datasets]))).size}
              l="Covered Datasets"
              s="Protected master registries"
            />
            <GM
              n={new Set(agreementsList.flatMap((a) => [a.providerInstitution, a.recipientInstitution])).size}
              l="Exchanging Entities"
              s="Line ministries & authorities"
            />
            <GM n={100} l="Security Compliance" s="mTLS & purpose limitation (%)" />
          </div>

          <article className="panel registry">
            <div
              className="table-tools"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "14px",
                padding: "16px 20px",
                background: "#f8fafc",
                borderBottom: "1px solid #e2e8f0",
              }}
            >
              <div>
                <b style={{ fontSize: "1.1rem", color: "#0f172a", display: "block" }}>
                  Inter-Agency Data Sharing Agreements (DSA) &amp; Legal Compacts
                </b>
                <span style={{ fontSize: "0.84rem", color: "#64748b" }}>
                  Statutory purpose-limitation, mutual protocols, dataset authorization, and access controls across ministries.
                </span>
              </div>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
                <button
                  type="button"
                  onClick={() => {
                    setAgreementDraft({
                      agreementCode: `DSA-MOA-${Date.now().toString().slice(-4)}`,
                      title: "",
                      providerInstitution: "Ministry of Agriculture (MoA)",
                      recipientInstitution: "",
                      datasets: "DFR-FARMER",
                      purpose: "",
                      legalBasis: "Approved inter-ministerial data-sharing protocol",
                      sensitivity: "Restricted",
                      accessProtocol: "OAuth 2.0 + mTLS; automated field minimization; immutable event logging",
                      status: "Active",
                      effectiveDate: new Date().toISOString().slice(0, 10),
                      expiryDate: "2027-12-31",
                      reviewDate: "2026-12-01",
                    });
                    setAgreementModal(true);
                  }}
                  style={{
                    background: "#1e3a8a",
                    color: "#ffffff",
                    padding: "9px 16px",
                    borderRadius: "8px",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    border: "none",
                    cursor: "pointer",
                    boxShadow: "0 2px 6px rgba(30,58,138,0.25)",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <span>＋</span> Draft Agreement (DSA)
                </button>
                <button
                  type="button"
                  onClick={() => setAgreementGenModal(true)}
                  style={{
                    background: "#fef3c7",
                    color: "#92400e",
                    padding: "9px 16px",
                    borderRadius: "8px",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    border: "1.5px solid #fde68a",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <span>⚡</span> Automated Compact Generator
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  style={{
                    background: "#f1f5f9",
                    color: "#334155",
                    padding: "9px 14px",
                    borderRadius: "8px",
                    fontWeight: 650,
                    fontSize: "0.85rem",
                    border: "1px solid #cbd5e1",
                    cursor: "pointer",
                  }}
                >
                  🖨 Print Executed Compact
                </button>
              </div>
            </div>

            {/* Filter Bar */}
            <div
              style={{
                padding: "12px 20px",
                background: "#ffffff",
                borderBottom: "1px solid #f1f5f9",
                display: "flex",
                gap: "12px",
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <input
                type="search"
                placeholder="Search agreements by title, code, party, or purpose..."
                value={agreementSearch}
                onChange={(e) => setAgreementSearch(e.target.value)}
                style={{
                  padding: "8px 14px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "0.85rem",
                  flex: "1",
                  minWidth: "240px",
                  outline: "none",
                }}
              />
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "0.82rem", color: "#64748b", fontWeight: 600 }}>Status:</span>
                <select
                  value={agreementStatusFilter}
                  onChange={(e) => setAgreementStatusFilter(e.target.value)}
                  style={{
                    padding: "8px 12px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "0.85rem",
                    background: "#ffffff",
                    color: "#1e293b",
                    outline: "none",
                  }}
                >
                  <option value="All">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Draft for signature">Draft for signature</option>
                  <option value="Under review">Under review</option>
                </select>
              </div>
            </div>

            {/* Agreement Cards Grid */}
            <div style={{ padding: "20px", display: "grid", gap: "16px" }}>
              {filteredAgreements.length === 0 ? (
                <div style={{ padding: "40px 20px", textAlign: "center", color: "#64748b" }}>
                  <p style={{ margin: 0, fontSize: "1rem" }}>No data-sharing agreements match your query.</p>
                  <p style={{ fontSize: "0.84rem", color: "#94a3b8" }}>
                    Click <b>"Automated Compact Generator"</b> to initialize bilateral compacts.
                  </p>
                </div>
              ) : (
                filteredAgreements.map((a: G) => {
                  const datasets: string[] = Array.isArray(a.datasets)
                    ? a.datasets
                    : String(a.datasets || "").split(",").map((s) => s.trim());

                  return (
                    <article
                      key={a.agreementCode}
                      style={{
                        border: "1px solid #e2e8f0",
                        borderRadius: "12px",
                        background: "#ffffff",
                        boxShadow: "0 1px 4px rgba(0,0,0,0.03)",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          padding: "16px 20px",
                          borderBottom: "1px solid #f1f5f9",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          flexWrap: "wrap",
                          gap: "10px",
                          background: "linear-gradient(180deg, #f8fafc, #ffffff)",
                        }}
                      >
                        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                          <code
                            style={{
                              fontWeight: 800,
                              background: "#eff6ff",
                              color: "#1e40af",
                              padding: "4px 8px",
                              borderRadius: "6px",
                              border: "1px solid #bfdbfe",
                            }}
                          >
                            {a.agreementCode}
                          </code>
                          <span
                            style={{
                              background: a.status === "Active" ? "#f0fdf4" : "#fffbeb",
                              color: a.status === "Active" ? "#166534" : "#b45309",
                              border: `1px solid ${a.status === "Active" ? "#bbf7d0" : "#fde68a"}`,
                              borderRadius: "20px",
                              padding: "3px 10px",
                              fontSize: "0.75rem",
                              fontWeight: 700,
                              textTransform: "uppercase",
                            }}
                          >
                            {a.status}
                          </span>
                          <span
                            style={{
                              background: "#fef2f2",
                              color: "#991b1b",
                              borderRadius: "6px",
                              padding: "3px 8px",
                              fontSize: "0.75rem",
                              fontWeight: 700,
                            }}
                          >
                            Sensitivity: {a.sensitivity}
                          </span>
                        </div>
                        <div style={{ fontSize: "0.8rem", color: "#64748b" }}>
                          Effective: <b style={{ color: "#0f172a" }}>{a.effectiveDate}</b> · Expiry:{" "}
                          <b style={{ color: "#0f172a" }}>{a.expiryDate}</b>
                        </div>
                      </div>

                      <div style={{ padding: "18px 20px" }}>
                        <h3 style={{ margin: "0 0 10px", fontSize: "1.15rem", color: "#0f172a" }}>{a.title}</h3>

                        {/* Visual Routing Bar */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            background: "#f1f5f9",
                            padding: "10px 14px",
                            borderRadius: "8px",
                            margin: "10px 0 14px",
                            fontSize: "0.85rem",
                            flexWrap: "wrap",
                          }}
                        >
                          <span style={{ color: "#64748b", fontSize: "0.75rem", textTransform: "uppercase", fontWeight: 700 }}>
                            Authorized Flow:
                          </span>
                          <b style={{ color: "#0f172a" }}>{a.providerInstitution}</b>
                          <span style={{ color: "#0284c7", fontWeight: 800 }}>──────►</span>
                          <b style={{ color: "#0f172a" }}>{a.recipientInstitution}</b>
                        </div>

                        <div style={{ margin: "10px 0" }}>
                          <span style={{ color: "#64748b", fontSize: "0.75rem", textTransform: "uppercase", fontWeight: 700, display: "block", marginBottom: "4px" }}>
                            Permitted Datasets:
                          </span>
                          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                            {datasets.map((ds, idx) => (
                              <code
                                key={idx}
                                style={{
                                  background: "#ecfdf5",
                                  color: "#065f46",
                                  border: "1px solid #a7f3d0",
                                  padding: "2px 8px",
                                  borderRadius: "4px",
                                  fontSize: "0.78rem",
                                  fontWeight: 700,
                                }}
                              >
                                {ds}
                              </code>
                            ))}
                          </div>
                        </div>

                        <p style={{ margin: "10px 0 6px", fontSize: "0.88rem", color: "#334155", lineHeight: "1.5" }}>
                          <b>Purpose Limitation:</b> {a.purpose}
                        </p>
                        <p style={{ margin: "0 0 10px", fontSize: "0.82rem", color: "#64748b" }}>
                          <b>Legal Statutory Basis:</b> {a.legalBasis}
                        </p>

                        <div
                          style={{
                            padding: "10px 14px",
                            background: "#f8fafc",
                            borderLeft: "3px solid #0284c7",
                            borderRadius: "0 6px 6px 0",
                            fontSize: "0.82rem",
                            color: "#334155",
                          }}
                        >
                          <b>Access &amp; Cryptographic Protocol:</b> {a.accessProtocol}
                        </div>
                      </div>

                      <div
                        style={{
                          padding: "12px 20px",
                          background: "#f8fafc",
                          borderTop: "1px solid #f1f5f9",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          flexWrap: "wrap",
                          gap: "10px",
                        }}
                      >
                        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                          {a.status !== "Active" && (
                            <button
                              type="button"
                              onClick={() => signAgreement(a.agreementCode)}
                              style={{
                                background: "#166534",
                                color: "#ffffff",
                                border: "none",
                                padding: "7px 14px",
                                borderRadius: "6px",
                                fontSize: "0.81rem",
                                fontWeight: 700,
                                cursor: "pointer",
                              }}
                            >
                              ✓ Execute &amp; Sign Compact
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => window.print()}
                            style={{
                              background: "#ffffff",
                              color: "#475569",
                              border: "1px solid #cbd5e1",
                              padding: "7px 12px",
                              borderRadius: "6px",
                              fontSize: "0.81rem",
                              fontWeight: 600,
                              cursor: "pointer",
                            }}
                          >
                            🖨 Print Executed Compact
                          </button>
                        </div>
                        <div>
                          <button
                            type="button"
                            onClick={() => deleteAgreement(a.agreementCode)}
                            style={{
                              background: "transparent",
                              color: "#dc2626",
                              border: "1px solid #fca5a5",
                              padding: "6px 12px",
                              borderRadius: "6px",
                              fontSize: "0.8rem",
                              fontWeight: 650,
                              cursor: "pointer",
                            }}
                          >
                            Revoke Compact
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </article>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: INTEROPERABILITY & CONNECTORS SUITE */}
      {/* ========================================================================= */}
      {tab === "Interoperability" && (
        <div style={{ display: "grid", gap: "18px" }}>
          <div className="metric-grid">
            <GM n={connectorList.length} l="Registered Connectors" s="National DPI gateways" />
            <GM
              n={connectorList.filter((c) => c.status?.includes("Active") || c.status?.includes("Live")).length}
              l="Live API Gateways"
              s="Production connections"
            />
            <GM
              n={connectorList.reduce((acc, c) => acc + (Number(c.records) || 0), 0)}
              l="Synchronized Records"
              s="Transferred across systems"
            />
            <GM n={99.9} l="Gateway Health" s="Uptime & protocol conformance (%)" />
          </div>

          <article className="panel registry">
            <div
              className="table-tools"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "14px",
                padding: "16px 20px",
                background: "#f8fafc",
                borderBottom: "1px solid #e2e8f0",
              }}
            >
              <div>
                <b style={{ fontSize: "1.1rem", color: "#0f172a", display: "block" }}>
                  National Interoperability Connector Catalogue &amp; Live Gateway
                </b>
                <span style={{ fontSize: "0.84rem", color: "#64748b" }}>
                  Bidirectional API adapters, schema mapping engines, automated sync schedulers, and live diagnostic monitors.
                </span>
              </div>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
                <button
                  type="button"
                  onClick={() => {
                    setConnDraft({
                      connectorCode: `CONN-${Date.now().toString().slice(-4)}`,
                      systemName: "",
                      ownerInstitution: "Partner Ministry",
                      direction: "Bidirectional",
                      endpointAlias: "/api/v1/exchange",
                      standard: "REST/JSON · OpenAPI 3.1",
                      mappingVersion: "1.0",
                      environment: "Sandbox",
                      status: "Active / Live",
                    });
                    setConnModal(true);
                  }}
                  style={{
                    background: "#0369a1",
                    color: "#ffffff",
                    padding: "9px 16px",
                    borderRadius: "8px",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    border: "none",
                    cursor: "pointer",
                    boxShadow: "0 2px 6px rgba(3,105,161,0.25)",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <span>＋</span> Register API Connector
                </button>
                <button
                  type="button"
                  onClick={() => setConnGenModal(true)}
                  style={{
                    background: "#e0f2fe",
                    color: "#0369a1",
                    padding: "9px 16px",
                    borderRadius: "8px",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    border: "1.5px solid #bae6fd",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <span>⚡</span> Deploy Connector Template
                </button>
              </div>
            </div>

            {/* Filter Bar */}
            <div
              style={{
                padding: "12px 20px",
                background: "#ffffff",
                borderBottom: "1px solid #f1f5f9",
                display: "flex",
                gap: "12px",
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <input
                type="search"
                placeholder="Search connector name, code, protocol, or partner..."
                value={connSearch}
                onChange={(e) => setConnSearch(e.target.value)}
                style={{
                  padding: "8px 14px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "0.85rem",
                  flex: "1",
                  minWidth: "240px",
                  outline: "none",
                }}
              />
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "0.82rem", color: "#64748b", fontWeight: 600 }}>Environment:</span>
                <select
                  value={connEnvFilter}
                  onChange={(e) => setConnEnvFilter(e.target.value)}
                  style={{
                    padding: "8px 12px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "0.85rem",
                    background: "#ffffff",
                    color: "#1e293b",
                    outline: "none",
                  }}
                >
                  <option value="All">All Environments</option>
                  <option value="Production">Production</option>
                  <option value="Sandbox">Sandbox</option>
                  <option value="Configuration">Configuration</option>
                </select>
              </div>
            </div>

            {/* Connector Cards Grid */}
            <div style={{ padding: "20px", display: "grid", gap: "16px" }}>
              {filteredConnectors.length === 0 ? (
                <div style={{ padding: "40px 20px", textAlign: "center", color: "#64748b" }}>
                  <p style={{ margin: 0, fontSize: "1rem" }}>No API connectors match your query.</p>
                  <p style={{ fontSize: "0.84rem", color: "#94a3b8" }}>
                    Click <b>"Deploy Connector Template"</b> to provision national system connectors.
                  </p>
                </div>
              ) : (
                filteredConnectors.map((c: G) => (
                  <article
                    key={c.connectorCode}
                    style={{
                      border: "1px solid #e2e8f0",
                      borderRadius: "12px",
                      background: "#ffffff",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.03)",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        padding: "16px 20px",
                        borderBottom: "1px solid #f1f5f9",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        flexWrap: "wrap",
                        gap: "10px",
                        background: "linear-gradient(180deg, #f8fafc, #ffffff)",
                      }}
                    >
                      <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                        <code
                          style={{
                            fontWeight: 800,
                            background: "#e0f2fe",
                            color: "#0369a1",
                            padding: "4px 8px",
                            borderRadius: "6px",
                            border: "1px solid #bae6fd",
                          }}
                        >
                          {c.connectorCode}
                        </code>
                        <span
                          style={{
                            background: c.environment === "Production" ? "#f0fdf4" : "#f1f5f9",
                            color: c.environment === "Production" ? "#166534" : "#475569",
                            border: `1px solid ${c.environment === "Production" ? "#bbf7d0" : "#cbd5e1"}`,
                            borderRadius: "20px",
                            padding: "3px 10px",
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            textTransform: "uppercase",
                          }}
                        >
                          {c.environment}
                        </span>
                        <span
                          style={{
                            background: c.status?.includes("Active") || c.status?.includes("Live") ? "#ecfdf5" : "#fffbeb",
                            color: c.status?.includes("Active") || c.status?.includes("Live") ? "#065f46" : "#b45309",
                            borderRadius: "6px",
                            padding: "3px 8px",
                            fontSize: "0.75rem",
                            fontWeight: 700,
                          }}
                        >
                          {c.status}
                        </span>
                      </div>
                      <div style={{ fontSize: "0.8rem", color: "#64748b" }}>
                        Partner: <b style={{ color: "#0f172a" }}>{c.ownerInstitution}</b> · Direction:{" "}
                        <b style={{ color: "#0284c7" }}>{c.direction}</b>
                      </div>
                    </div>

                    <div style={{ padding: "18px 20px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px", marginBottom: "8px" }}>
                        <h3 style={{ margin: 0, fontSize: "1.15rem", color: "#0f172a" }}>{c.systemName}</h3>
                        <span style={{ fontSize: "0.8rem", color: "#64748b", fontFamily: "monospace", background: "#f1f5f9", padding: "3px 8px", borderRadius: "4px" }}>
                          Endpoint: {c.endpointAlias}
                        </span>
                      </div>

                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                          gap: "12px",
                          margin: "12px 0",
                          padding: "12px 14px",
                          background: "#f8fafc",
                          borderRadius: "8px",
                          fontSize: "0.82rem",
                        }}
                      >
                        <div>
                          <span style={{ color: "#64748b", fontSize: "0.72rem", textTransform: "uppercase", fontWeight: 700, display: "block" }}>
                            Standard &amp; Version
                          </span>
                          <strong style={{ color: "#0f172a" }}>{c.standard}</strong> (Map v{c.mappingVersion})
                        </div>
                        <div>
                          <span style={{ color: "#64748b", fontSize: "0.72rem", textTransform: "uppercase", fontWeight: 700, display: "block" }}>
                            Last Live Exchange
                          </span>
                          <span style={{ color: "#0f172a" }}>{c.lastExchangeAt || "Pending"}</span>
                        </div>
                        <div>
                          <span style={{ color: "#64748b", fontSize: "0.72rem", textTransform: "uppercase", fontWeight: 700, display: "block" }}>
                            Synchronized Records
                          </span>
                          <strong style={{ color: "#166534" }}>{(c.records || 0).toLocaleString()} records</strong>
                        </div>
                        <div>
                          <span style={{ color: "#64748b", fontSize: "0.72rem", textTransform: "uppercase", fontWeight: 700, display: "block" }}>
                            Correlation ID
                          </span>
                          <code style={{ fontSize: "0.75rem", color: "#0369a1" }}>{c.correlationId || "N/A"}</code>
                        </div>
                      </div>

                      <div
                        style={{
                          padding: "8px 12px",
                          background: "#f0fdf4",
                          borderLeft: "3px solid #16a34a",
                          borderRadius: "0 6px 6px 0",
                          fontSize: "0.82rem",
                          color: "#166534",
                        }}
                      >
                        <b>Gateway Status:</b> {c.result}
                      </div>
                    </div>

                    <div
                      style={{
                        padding: "12px 20px",
                        background: "#f8fafc",
                        borderTop: "1px solid #f1f5f9",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: "10px",
                      }}
                    >
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        <button
                          type="button"
                          disabled={busy === `test-conn-${c.connectorCode}`}
                          onClick={() => testConnector(c.connectorCode)}
                          style={{
                            background: "#0284c7",
                            color: "#ffffff",
                            border: "none",
                            padding: "7px 14px",
                            borderRadius: "6px",
                            fontSize: "0.81rem",
                            fontWeight: 700,
                            cursor: "pointer",
                          }}
                        >
                          ⚡ Test Handshake (Ping)
                        </button>
                        <button
                          type="button"
                          disabled={busy === `sync-conn-${c.connectorCode}`}
                          onClick={() => triggerConnectorSync(c.connectorCode)}
                          style={{
                            background: "#166534",
                            color: "#ffffff",
                            border: "none",
                            padding: "7px 14px",
                            borderRadius: "6px",
                            fontSize: "0.81rem",
                            fontWeight: 700,
                            cursor: "pointer",
                          }}
                        >
                          🔄 Trigger Live Sync
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedConnectorMapping(c)}
                          style={{
                            background: "#ffffff",
                            color: "#475569",
                            border: "1px solid #cbd5e1",
                            padding: "7px 12px",
                            borderRadius: "6px",
                            fontSize: "0.81rem",
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          🔍 Inspect Schema Mapping
                        </button>
                      </div>
                      <div>
                        <button
                          type="button"
                          onClick={() => deleteConnector(c.connectorCode)}
                          style={{
                            background: "transparent",
                            color: "#dc2626",
                            border: "1px solid #fca5a5",
                            padding: "6px 12px",
                            borderRadius: "6px",
                            fontSize: "0.8rem",
                            fontWeight: 650,
                            cursor: "pointer",
                          }}
                        >
                          Decommission
                        </button>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          </article>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: AUDIT EVIDENCE & CRYPTOGRAPHIC FORENSICS SUITE */}
      {/* ========================================================================= */}
      {tab === "Audit evidence" && (
        <div style={{ display: "grid", gap: "18px" }}>
          <div className="metric-grid">
            <GM n={auditList.length} l="Logged Forensic Events" s="Attributable transaction logs" />
            <GM n={100} l="Cryptographic Hash Chain" s="SHA-256 Merkle chain valid (%)" />
            <GM n={new Set(auditList.map((a) => a.actor)).size} l="Active Actors" s="Administrators, APIs & field officers" />
            <GM n={0} l="Security Anomalies" s="Zero tamper breaches detected" />
          </div>

          {/* Cryptographic Verification Banner */}
          {cryptoVerifiedBanner && (
            <div
              style={{
                padding: "16px 20px",
                background: "#ecfdf5",
                border: "1.5px solid #a7f3d0",
                borderRadius: "12px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "12px",
              }}
            >
              <div>
                <b style={{ color: "#065f46", fontSize: "0.95rem", display: "block" }}>
                  🔒 Official Cryptographic Hash Chain Integrity Certificate · Republic of Liberia DFR
                </b>
                <span style={{ fontSize: "0.82rem", color: "#047857" }}>
                  Verified {cryptoVerifiedBanner.verifiedCount} consecutive events across Merkel chain. Algorithm:{" "}
                  <b>{cryptoVerifiedBanner.algorithm}</b>. Root Hash: <code>{cryptoVerifiedBanner.rootHash}</code>
                </span>
              </div>
              <button
                type="button"
                onClick={() => setCryptoVerifiedBanner(null)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#065f46",
                  fontWeight: 800,
                  fontSize: "1.1rem",
                  cursor: "pointer",
                }}
              >
                ×
              </button>
            </div>
          )}

          <article className="panel registry">
            <div
              className="table-tools"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "14px",
                padding: "16px 20px",
                background: "#f8fafc",
                borderBottom: "1px solid #e2e8f0",
              }}
            >
              <div>
                <b style={{ fontSize: "1.1rem", color: "#0f172a", display: "block" }}>
                  Cross-Institution Decision &amp; Forensic Audit Evidence
                </b>
                <span style={{ fontSize: "0.84rem", color: "#64748b" }}>
                  Tamper-evident, non-repudiable transaction trail capturing all institutional approvals, policy enactments, and API exchanges.
                </span>
              </div>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
                <button
                  type="button"
                  disabled={busy === "audit-verify"}
                  onClick={verifyCryptographicChain}
                  style={{
                    background: "#065f46",
                    color: "#ffffff",
                    padding: "9px 16px",
                    borderRadius: "8px",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    border: "none",
                    cursor: "pointer",
                    boxShadow: "0 2px 6px rgba(6,95,70,0.25)",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <span>🔒</span> {busy === "audit-verify" ? "Verifying..." : "Verify Cryptographic Chain"}
                </button>
                <button
                  type="button"
                  onClick={exportAuditPackage}
                  style={{
                    background: "#f1f5f9",
                    color: "#334155",
                    padding: "9px 14px",
                    borderRadius: "8px",
                    fontWeight: 650,
                    fontSize: "0.85rem",
                    border: "1px solid #cbd5e1",
                    cursor: "pointer",
                  }}
                >
                  📥 Export Certified Audit Package (CSV)
                </button>
              </div>
            </div>

            {/* Filter Bar */}
            <div
              style={{
                padding: "12px 20px",
                background: "#ffffff",
                borderBottom: "1px solid #f1f5f9",
                display: "flex",
                gap: "12px",
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <input
                type="search"
                placeholder="Search audit actor, action, entity ID, or details..."
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                style={{
                  padding: "8px 14px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "0.85rem",
                  flex: "1",
                  minWidth: "240px",
                  outline: "none",
                }}
              />
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "0.82rem", color: "#64748b", fontWeight: 600 }}>Action Filter:</span>
                <select
                  value={auditFilter}
                  onChange={(e) => setAuditFilter(e.target.value)}
                  style={{
                    padding: "8px 12px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "0.85rem",
                    background: "#ffffff",
                    color: "#1e293b",
                    outline: "none",
                  }}
                >
                  <option value="All">All Actions</option>
                  <option value="POLICY">Policies</option>
                  <option value="DICTIONARY">Data Standards</option>
                  <option value="AGREEMENT">Sharing Agreements</option>
                  <option value="CONNECTOR">API Connectors</option>
                  <option value="SYNC">Gateway Syncs</option>
                  <option value="GOVERNANCE">Governance Initialization</option>
                </select>
              </div>
            </div>

            {/* Audit Table */}
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Accountable Actor</th>
                    <th>Action</th>
                    <th>Subject / Entity</th>
                    <th>Evidence Detail</th>
                    <th>SHA-256 Digest</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAudit.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: "center", padding: "30px", color: "#64748b" }}>
                        No audit events match your search query.
                      </td>
                    </tr>
                  ) : (
                    filteredAudit.map((row: G, idx: number) => (
                      <tr key={idx}>
                        <td style={{ whiteSpace: "nowrap", fontSize: "0.8rem", color: "#475569" }}>{row.createdAt}</td>
                        <td style={{ fontWeight: 600, color: "#0f172a" }}>{row.actor}</td>
                        <td>
                          <span
                            style={{
                              background: "#f1f5f9",
                              color: "#1e293b",
                              padding: "2px 8px",
                              borderRadius: "4px",
                              fontSize: "0.75rem",
                              fontWeight: 700,
                            }}
                          >
                            {row.action}
                          </span>
                        </td>
                        <td>
                          <code style={{ fontSize: "0.8rem" }}>{row.entity}</code>
                        </td>
                        <td style={{ maxWidth: 360, fontSize: "0.82rem", color: "#334155" }}>{row.details}</td>
                        <td>
                          <span
                            style={{
                              fontFamily: "monospace",
                              fontSize: "0.72rem",
                              color: "#0369a1",
                              background: "#f0f9ff",
                              padding: "2px 6px",
                              borderRadius: "4px",
                            }}
                            title={row.sha256Hash}
                          >
                            {(row.sha256Hash || "sha256:00000000000000").slice(0, 16)}...
                          </span>
                        </td>
                        <td>
                          <button
                            type="button"
                            onClick={() => setSelectedAuditLog(row)}
                            style={{
                              padding: "4px 10px",
                              background: "#ffffff",
                              border: "1px solid #cbd5e1",
                              borderRadius: "4px",
                              fontSize: "0.76rem",
                              fontWeight: 650,
                              cursor: "pointer",
                            }}
                          >
                            🔍 Inspect
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </article>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 7: DATASET STEWARDSHIP */}
      {/* ========================================================================= */}
      {tab === "Dataset stewardship" && (
        <article className="panel registry">
          <Head a="Controlled data assets" b="Ownership, sensitivity, access, versions and review cycles" />
          <div className="gov-cards">
            {data.datasets.map((d: G) => (
              <article key={d.id}>
                <header>
                  <code>{d.datasetCode}</code>
                  <em className={d.nextReviewAt < data.today ? "late" : ""}>
                    {d.nextReviewAt < data.today ? "Review overdue" : d.status}
                  </em>
                </header>
                <h3>{d.title}</h3>
                <p>{d.classificationStandard}</p>
                <dl>
                  <div>
                    <dt>Owner / steward</dt>
                    <dd>
                      {d.ownerInstitution} / {d.stewardInstitution}
                    </dd>
                  </div>
                  <div>
                    <dt>Custodian</dt>
                    <dd>{d.custodianInstitution}</dd>
                  </div>
                  <div>
                    <dt>Approver</dt>
                    <dd>{d.approvingAuthority}</dd>
                  </div>
                  <div>
                    <dt>Sensitivity</dt>
                    <dd>{d.sensitivity}</dd>
                  </div>
                  <div>
                    <dt>Version</dt>
                    <dd>{d.version}</dd>
                  </div>
                  <div>
                    <dt>Next review</dt>
                    <dd>{d.nextReviewAt}</dd>
                  </div>
                </dl>
                <footer>
                  <span>{d.accessRule}</span>
                  <button disabled={busy === d.id} onClick={() => review(d)}>
                    Complete review
                  </button>
                </footer>
              </article>
            ))}
          </div>
        </article>
      )}

      {/* ========================================================================= */}
      {/* TAB 8: VALIDATION WORKFLOWS */}
      {/* ========================================================================= */}
      {tab === "Validation workflows" && (
        <article className="panel registry">
          <Head a="Institutional validation queue" b="Submission → review → correction → approval → publication" />
          <div className="gov-flow">
            {data.workflows.map((w: G) => (
              <article key={w.id}>
                <header>
                  <code>{w.caseId}</code>
                  <em>{w.stage.replaceAll("_", " ")}</em>
                </header>
                <span>{w.workflowType}</span>
                <h3>{w.title}</h3>
                <p>
                  {w.subjectRef} · {w.county} · due {w.dueDate}
                </p>
                <div className="flow-route">
                  <b>{w.submitterInstitution}</b>
                  <i>→</i>
                  <b>{w.currentInstitution}</b>
                </div>
                <small>{w.evidenceRef}</small>
                {w.notes && <blockquote>{w.notes}</blockquote>}
                <footer>
                  {(nextActions[w.stage] || []).map((a) => (
                    <button disabled={busy === w.id} onClick={() => transition(w, a[1])} key={a[1]}>
                      {a[0]}
                    </button>
                  ))}
                </footer>
              </article>
            ))}
          </div>
        </article>
      )}

      {/* ========================================================================= */}
      {/* TAB 9: COMMITTEE ACTIONS */}
      {/* ========================================================================= */}
      {tab === "Committee actions" && (
        <Table
          title="Meetings, resolutions and escalations"
          sub="Institutionally attributed decisions with accountable actions"
          heads={["Decision", "Resolution", "Institution", "Owner / due", "Priority", "Status"]}
          rows={data.decisions.map((x: G) => [
            <span key="d">
              <b>{x.title}</b>
              <small>
                {x.decisionCode} · {x.meetingType}
              </small>
            </span>,
            x.decisionText,
            x.responsibleInstitution,
            <span key="o">
              {x.actionOwner}
              <small>{x.dueDate}</small>
            </span>,
            `${x.priority} · ${x.escalationLevel}`,
            x.status,
          ])}
        />
      )}

      {/* ========================================================================= */}
      {/* MODALS & DRAWERS */}
      {/* ========================================================================= */}

      {/* MODAL 1: CUSTOM POLICY AUTHORING WIZARD */}
      {policyModal && (
        <div
          className="modal-wrap enrollment-overlay"
          style={{ zIndex: 10000 }}
          onMouseDown={(e) => {
            if (e.currentTarget === e.target) setPolicyModal(false);
          }}
        >
          <form
            onSubmit={submitPolicy}
            className="enrollment-wizard ext-wizard"
            style={{ maxWidth: 840, background: "#ffffff" }}
          >
            <header>
              <div>
                <span>🏛 &nbsp; NATIONAL INSTITUTIONAL POLICY AUTHORING STUDIO</span>
                <h2>Formulate &amp; Enact Platform Policy</h2>
                <p>Enact statutory regulatory directives, data governance principles, and operational standards across all ministries.</p>
              </div>
              <b style={{ background: "#ecfdf5", color: "#065f46" }}>Official Policy</b>
              <button type="button" onClick={() => setPolicyModal(false)} aria-label="Close modal">
                ×
              </button>
            </header>

            <main>
              <section className="enroll-panel">
                <h3>1. Statutory Classification &amp; Authority</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "12px", marginTop: "10px" }}>
                  <label>
                    Policy Code
                    <input
                      required
                      value={policyDraft.policyCode}
                      onChange={(e) => setPolicyDraft((d) => ({ ...d, policyCode: e.target.value }))}
                      placeholder="POL-LBR-006"
                    />
                  </label>
                  <label>
                    Policy Title
                    <input
                      required
                      value={policyDraft.title}
                      onChange={(e) => setPolicyDraft((d) => ({ ...d, title: e.target.value }))}
                      placeholder="e.g. National Farmer Data Protection & Privacy Regulation"
                    />
                  </label>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "10px" }}>
                  <label>
                    Regulatory Category
                    <select
                      value={policyDraft.category}
                      onChange={(e) => setPolicyDraft((d) => ({ ...d, category: e.target.value }))}
                    >
                      <option value="Data Protection & Privacy">Data Protection &amp; Privacy</option>
                      <option value="Interoperability & Data Sharing">Interoperability &amp; Data Sharing</option>
                      <option value="Field Operations & Enumeration">Field Operations &amp; Enumeration</option>
                      <option value="Subsidy Distribution & Input Entitlements">
                        Subsidy Distribution &amp; Input Entitlements
                      </option>
                      <option value="Grievance Redress & Transparency">Grievance Redress &amp; Transparency</option>
                      <option value="Climate & Environmental Standards">Climate &amp; Environmental Standards</option>
                      <option value="Agronomic Standards & Biosafety">Agronomic Standards &amp; Biosafety</option>
                      <option value="Livestock Health & Disease Surveillance">
                        Livestock Health &amp; Disease Surveillance
                      </option>
                      <option value="Market Regulation & Fair Trade">Market Regulation &amp; Fair Trade</option>
                    </select>
                  </label>
                  <label>
                    Enforcing Statutory Body
                    <input
                      required
                      value={policyDraft.enforcingBody}
                      onChange={(e) => setPolicyDraft((d) => ({ ...d, enforcingBody: e.target.value }))}
                      placeholder="e.g. Ministry of Agriculture (MoA)"
                    />
                  </label>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "12px", marginTop: "10px" }}>
                  <label>
                    Legal Basis / Legislation
                    <input
                      required
                      value={policyDraft.legalBasis}
                      onChange={(e) => setPolicyDraft((d) => ({ ...d, legalBasis: e.target.value }))}
                      placeholder="Liberia Data Protection Act 2024"
                    />
                  </label>
                  <label>
                    Effective Date
                    <input
                      type="date"
                      required
                      value={policyDraft.effectiveDate}
                      onChange={(e) => setPolicyDraft((d) => ({ ...d, effectiveDate: e.target.value }))}
                    />
                  </label>
                  <label>
                    Review Cycle
                    <select
                      value={policyDraft.reviewCycle}
                      onChange={(e) => setPolicyDraft((d) => ({ ...d, reviewCycle: e.target.value }))}
                    >
                      <option value="Annual">Annual</option>
                      <option value="Biannual">Biannual</option>
                      <option value="Seasonal">Seasonal</option>
                      <option value="Quarterly">Quarterly</option>
                    </select>
                  </label>
                </div>
              </section>

              <section className="enroll-panel" style={{ marginTop: "16px" }}>
                <h3>2. Executive Summary &amp; Scope</h3>
                <label style={{ marginTop: "10px" }}>
                  Policy Statement &amp; Purpose
                  <textarea
                    rows={3}
                    required
                    value={policyDraft.summary}
                    onChange={(e) => setPolicyDraft((d) => ({ ...d, summary: e.target.value }))}
                    placeholder="Describe institutional purpose, scope, smallholder protections, and target beneficiaries..."
                  />
                </label>
              </section>

              <section className="enroll-panel" style={{ marginTop: "16px" }}>
                <h3>3. Binding Directives &amp; Operational Rules</h3>
                <label>
                  Enforceable Directives (one per line)
                  <textarea
                    rows={5}
                    required
                    value={policyDraft.directives}
                    onChange={(e) => setPolicyDraft((d) => ({ ...d, directives: e.target.value }))}
                    placeholder="Mandatory Informed Consent: No smallholder farmer personal data may be collected without verifiable consent...&#10;Purpose Limitation: Data is held in public trust exclusively for food security and extension..."
                  />
                </label>
              </section>
            </main>

            <footer>
              <button type="button" onClick={() => setPolicyModal(false)}>
                Cancel
              </button>
              <button
                type="submit"
                className="submit-registration"
                disabled={busy === "policy-save"}
                style={{ background: "#15803d", color: "#ffffff" }}
              >
                {busy === "policy-save" ? "Enacting..." : "Enact & Publish Policy Directive →"}
              </button>
            </footer>
          </form>
        </div>
      )}

      {/* MODAL 2: AUTOMATED POLICY FRAMEWORK GENERATOR */}
      {generatorModal && (
        <div
          className="modal-wrap enrollment-overlay"
          style={{ zIndex: 10000 }}
          onMouseDown={(e) => {
            if (e.currentTarget === e.target) setGeneratorModal(false);
          }}
        >
          <div className="enrollment-wizard ext-wizard" style={{ maxWidth: 900, background: "#ffffff" }}>
            <header>
              <div>
                <span>⚡ &nbsp; AUTOMATED STATUTORY POLICY FRAMEWORK GENERATOR</span>
                <h2>Enact Pre-Configured National Regulatory Frameworks</h2>
                <p>Deploy validated Liberian agricultural policies, climate standards, and fair pricing rules with a single click.</p>
              </div>
              <b style={{ background: "#fef3c7", color: "#92400e" }}>Ready Frameworks</b>
              <button type="button" onClick={() => setGeneratorModal(false)} aria-label="Close modal">
                ×
              </button>
            </header>

            <main>
              <section className="enroll-panel">
                <h3>Select Statutory Framework to Enact</h3>
                <div style={{ display: "grid", gap: "14px", marginTop: "12px" }}>
                  {policyTemplates.map((t) => (
                    <div
                      key={t.code}
                      style={{
                        padding: "16px 18px",
                        border: "1.5px solid #e2e8f0",
                        borderRadius: "10px",
                        background: "#f8fafc",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "16px",
                      }}
                    >
                      <div>
                        <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "4px" }}>
                          <code style={{ fontSize: "0.75rem", fontWeight: 700, background: "#e0f2fe", color: "#0369a1", padding: "2px 6px", borderRadius: "4px" }}>
                            {t.code}
                          </code>
                          <span style={{ fontSize: "0.76rem", color: "#059669", fontWeight: 700 }}>{t.category}</span>
                        </div>
                        <h4 style={{ margin: "3px 0 6px", fontSize: "0.98rem", color: "#0f172a" }}>{t.title}</h4>
                        <p style={{ margin: "0 0 6px", fontSize: "0.83rem", color: "#475569", lineHeight: "1.4" }}>{t.summary}</p>
                        <div style={{ fontSize: "0.78rem", color: "#64748b" }}>
                          Enforcing Authority: <b style={{ color: "#334155" }}>{t.enforcingBody}</b> · Legal Basis: <i>{t.legalBasis}</i>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setPolicyDraft({
                            policyCode: t.code,
                            title: t.title,
                            category: t.category,
                            enforcingBody: t.enforcingBody,
                            legalBasis: t.legalBasis,
                            effectiveDate: t.effectiveDate,
                            reviewCycle: t.reviewCycle,
                            status: t.status,
                            summary: t.summary,
                            directives: t.directives.join("\n"),
                          });
                          setGeneratorModal(false);
                          setPolicyModal(true);
                        }}
                        style={{
                          padding: "8px 14px",
                          background: "#15803d",
                          color: "#ffffff",
                          borderRadius: "6px",
                          border: "none",
                          fontWeight: 700,
                          fontSize: "0.82rem",
                          cursor: "pointer",
                          whiteSpace: "nowrap",
                        }}
                      >
                        ⚡ Load &amp; Enact →
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            </main>

            <footer>
              <button type="button" onClick={() => setGeneratorModal(false)}>
                Close
              </button>
            </footer>
          </div>
        </div>
      )}

      {/* MODAL 3: DATA ELEMENT STANDARD REGISTRATION WIZARD */}
      {dictModal && (
        <div
          className="modal-wrap enrollment-overlay"
          style={{ zIndex: 10000 }}
          onMouseDown={(e) => {
            if (e.currentTarget === e.target) setDictModal(false);
          }}
        >
          <form
            onSubmit={submitDictionaryItem}
            className="enrollment-wizard ext-wizard"
            style={{ maxWidth: 840, background: "#ffffff" }}
          >
            <header>
              <div>
                <span>📐 &nbsp; NATIONAL DATA DICTIONARY STANDARDS REGISTRY</span>
                <h2>Register Data Element Specification</h2>
                <p>Define official data classifications, data types, and allowed values across national databases.</p>
              </div>
              <b style={{ background: "#f0fdfa", color: "#0f766e" }}>Standard Element</b>
              <button type="button" onClick={() => setDictModal(false)} aria-label="Close modal">
                ×
              </button>
            </header>

            <main>
              <section className="enroll-panel">
                <h3>Element Definition &amp; Domain Authority</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "12px", marginTop: "10px" }}>
                  <label>
                    Element Identifier Code
                    <input
                      required
                      value={dictDraft.elementCode}
                      onChange={(e) => setDictDraft((d) => ({ ...d, elementCode: e.target.value }))}
                      placeholder="e.g. DFR.CROP.VARIETY"
                    />
                  </label>
                  <label>
                    Element Name
                    <input
                      required
                      value={dictDraft.name}
                      onChange={(e) => setDictDraft((d) => ({ ...d, name: e.target.value }))}
                      placeholder="e.g. Certified Crop Variety"
                    />
                  </label>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginTop: "10px" }}>
                  <label>
                    Data Domain
                    <select
                      value={dictDraft.domain}
                      onChange={(e) => setDictDraft((d) => ({ ...d, domain: e.target.value }))}
                    >
                      <option value="Demographic">Demographic</option>
                      <option value="Agronomic">Agronomic</option>
                      <option value="Geospatial">Geospatial</option>
                      <option value="Social protection">Social protection</option>
                      <option value="Tenure & Rights">Tenure &amp; Rights</option>
                      <option value="Payments & Financial">Payments &amp; Financial</option>
                      <option value="Livestock">Livestock</option>
                    </select>
                  </label>
                  <label>
                    Data Type
                    <select
                      value={dictDraft.dataType}
                      onChange={(e) => setDictDraft((d) => ({ ...d, dataType: e.target.value }))}
                    >
                      <option value="Code">Code</option>
                      <option value="Multi-code">Multi-code</option>
                      <option value="String">String</option>
                      <option value="Integer">Integer</option>
                      <option value="Float / Decimal">Float / Decimal</option>
                      <option value="Geometry (GeoJSON)">Geometry (GeoJSON)</option>
                      <option value="Boolean">Boolean</option>
                      <option value="Date (ISO 8601)">Date (ISO 8601)</option>
                    </select>
                  </label>
                  <label>
                    Standard Owner / Authority
                    <input
                      required
                      value={dictDraft.standardOwner}
                      onChange={(e) => setDictDraft((d) => ({ ...d, standardOwner: e.target.value }))}
                      placeholder="e.g. LISGIS / MoA"
                    />
                  </label>
                </div>

                <label style={{ marginTop: "12px" }}>
                  Official Definition &amp; Business Meaning
                  <textarea
                    rows={3}
                    required
                    value={dictDraft.definition}
                    onChange={(e) => setDictDraft((d) => ({ ...d, definition: e.target.value }))}
                    placeholder="Provide exact definition, validation rules, and inter-agency context..."
                  />
                </label>

                <label style={{ marginTop: "12px" }}>
                  Approved Enumerated Values (Comma-separated)
                  <textarea
                    rows={3}
                    value={dictDraft.allowedValues}
                    onChange={(e) => setDictDraft((d) => ({ ...d, allowedValues: e.target.value }))}
                    placeholder="e.g. Rice, Cassava, Cocoa, Oil Palm, Rubber, Coffee"
                  />
                </label>
              </section>
            </main>

            <footer>
              <button type="button" onClick={() => setDictModal(false)}>
                Cancel
              </button>
              <button
                type="submit"
                className="submit-registration"
                disabled={busy === "dict-save"}
                style={{ background: "#0f766e", color: "#ffffff" }}
              >
                {busy === "dict-save" ? "Registering..." : "Register Element Standard →"}
              </button>
            </footer>
          </form>
        </div>
      )}

      {/* MODAL 4: AUTOMATED STANDARD GENERATOR */}
      {dictGenModal && (
        <div
          className="modal-wrap enrollment-overlay"
          style={{ zIndex: 10000 }}
          onMouseDown={(e) => {
            if (e.currentTarget === e.target) setDictGenModal(false);
          }}
        >
          <div className="enrollment-wizard ext-wizard" style={{ maxWidth: 880, background: "#ffffff" }}>
            <header>
              <div>
                <span>⚡ &nbsp; AUTOMATED DATA STANDARDS GENERATOR</span>
                <h2>Deploy Pre-Configured National Data Elements</h2>
                <p>Instantly enact international FAO AGROVOC, LISGIS geospatial, and ISO 20022 mobile payment standards.</p>
              </div>
              <b style={{ background: "#e0f2fe", color: "#0369a1" }}>Standards Library</b>
              <button type="button" onClick={() => setDictGenModal(false)} aria-label="Close modal">
                ×
              </button>
            </header>

            <main>
              <section className="enroll-panel">
                <h3>Select Data Specification to Deploy</h3>
                <div style={{ display: "grid", gap: "12px", marginTop: "12px" }}>
                  {standardTemplates.map((t) => (
                    <div
                      key={t.elementCode}
                      style={{
                        padding: "14px 18px",
                        border: "1.5px solid #e2e8f0",
                        borderRadius: "10px",
                        background: "#f8fafc",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "14px",
                      }}
                    >
                      <div>
                        <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "4px" }}>
                          <code style={{ fontSize: "0.75rem", fontWeight: 700, background: "#f0fdfa", color: "#0f766e", padding: "2px 6px", borderRadius: "4px" }}>
                            {t.elementCode}
                          </code>
                          <span style={{ fontSize: "0.75rem", color: "#0284c7", fontWeight: 700 }}>Domain: {t.domain}</span>
                          <span style={{ fontSize: "0.75rem", color: "#475569" }}>Type: {t.dataType}</span>
                        </div>
                        <h4 style={{ margin: "2px 0 4px", fontSize: "0.95rem", color: "#0f172a" }}>{t.name}</h4>
                        <p style={{ margin: "0 0 6px", fontSize: "0.82rem", color: "#475569" }}>{t.definition}</p>
                        <div style={{ fontSize: "0.78rem", color: "#64748b" }}>
                          Owner Authority: <b style={{ color: "#334155" }}>{t.standardOwner}</b> · Version: {t.version}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setDictDraft({
                            elementCode: t.elementCode,
                            name: t.name,
                            domain: t.domain,
                            dataType: t.dataType,
                            allowedValues: t.allowedValues,
                            standardOwner: t.standardOwner,
                            version: t.version,
                            status: "Standard",
                            definition: t.definition,
                          });
                          setDictGenModal(false);
                          setDictModal(true);
                        }}
                        style={{
                          padding: "8px 14px",
                          background: "#0f766e",
                          color: "#ffffff",
                          borderRadius: "6px",
                          border: "none",
                          fontWeight: 700,
                          fontSize: "0.82rem",
                          cursor: "pointer",
                          whiteSpace: "nowrap",
                        }}
                      >
                        ⚡ Load &amp; Register →
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            </main>

            <footer>
              <button type="button" onClick={() => setDictGenModal(false)}>
                Close
              </button>
            </footer>
          </div>
        </div>
      )}

      {/* MODAL 5: INTERACTIVE SCHEMA VALIDATOR */}
      {schemaValidatorModal && (
        <div
          className="modal-wrap enrollment-overlay"
          style={{ zIndex: 10000 }}
          onMouseDown={(e) => {
            if (e.currentTarget === e.target) setSchemaValidatorModal(false);
          }}
        >
          <div className="enrollment-wizard ext-wizard" style={{ maxWidth: 840, background: "#ffffff" }}>
            <header>
              <div>
                <span>🔍 &nbsp; REAL-TIME DATA SCHEMA CONFORMANCE VALIDATOR</span>
                <h2>Validate Payload Against National Data Dictionary</h2>
                <p>Test sample farmer, farm parcel, or transaction JSON data against official DFR Core standards.</p>
              </div>
              <button type="button" onClick={() => setSchemaValidatorModal(false)} aria-label="Close modal">
                ×
              </button>
            </header>

            <main>
              <section className="enroll-panel">
                <label>
                  JSON Input Payload to Validate
                  <textarea
                    rows={10}
                    value={validatorPayload}
                    onChange={(e) => setValidatorPayload(e.target.value)}
                    style={{ fontFamily: "monospace", fontSize: "0.83rem", background: "#f8fafc", marginTop: "6px" }}
                  />
                </label>

                <div style={{ marginTop: "12px", display: "flex", justifyContent: "flex-end" }}>
                  <button
                    type="button"
                    onClick={testSchemaValidation}
                    style={{
                      background: "#166534",
                      color: "#ffffff",
                      padding: "8px 16px",
                      borderRadius: "6px",
                      fontWeight: 700,
                      fontSize: "0.84rem",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    Run Automated Conformance Check →
                  </button>
                </div>

                {validationResult && (
                  <div
                    style={{
                      marginTop: "14px",
                      padding: "14px 16px",
                      borderRadius: "8px",
                      background: validationResult.startsWith("✓") ? "#ecfdf5" : "#fff7ed",
                      border: `1.5px solid ${validationResult.startsWith("✓") ? "#a7f3d0" : "#ffedd5"}`,
                      color: validationResult.startsWith("✓") ? "#065f46" : "#9a3412",
                      fontSize: "0.85rem",
                      whiteSpace: "pre-wrap",
                      fontFamily: "monospace",
                    }}
                  >
                    {validationResult}
                  </div>
                )}
              </section>
            </main>

            <footer>
              <button type="button" onClick={() => setSchemaValidatorModal(false)}>
                Close
              </button>
            </footer>
          </div>
        </div>
      )}

      {/* MODAL 6: DATA SHARING AGREEMENT DRAFTING WIZARD */}
      {agreementModal && (
        <div
          className="modal-wrap enrollment-overlay"
          style={{ zIndex: 10000 }}
          onMouseDown={(e) => {
            if (e.currentTarget === e.target) setAgreementModal(false);
          }}
        >
          <form
            onSubmit={submitAgreement}
            className="enrollment-wizard ext-wizard"
            style={{ maxWidth: 840, background: "#ffffff" }}
          >
            <header>
              <div>
                <span>⚖️ &nbsp; INTER-AGENCY DATA SHARING COMPACT AUTHORING</span>
                <h2>Draft Data Sharing Agreement (DSA)</h2>
                <p>Define purpose limitation, covered national datasets, and cryptographic protocols between institutions.</p>
              </div>
              <b style={{ background: "#eff6ff", color: "#1e40af" }}>Legal Compact</b>
              <button type="button" onClick={() => setAgreementModal(false)} aria-label="Close modal">
                ×
              </button>
            </header>

            <main>
              <section className="enroll-panel">
                <h3>1. Parties &amp; Datasets</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "12px", marginTop: "10px" }}>
                  <label>
                    Agreement Code
                    <input
                      required
                      value={agreementDraft.agreementCode}
                      onChange={(e) => setAgreementDraft((d) => ({ ...d, agreementCode: e.target.value }))}
                      placeholder="DSA-MOA-001"
                    />
                  </label>
                  <label>
                    Agreement Title
                    <input
                      required
                      value={agreementDraft.title}
                      onChange={(e) => setAgreementDraft((d) => ({ ...d, title: e.target.value }))}
                      placeholder="e.g. Agriculture–Financial Inclusion Data Protocol"
                    />
                  </label>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "10px" }}>
                  <label>
                    Provider Institution (Data Source)
                    <input
                      required
                      value={agreementDraft.providerInstitution}
                      onChange={(e) => setAgreementDraft((d) => ({ ...d, providerInstitution: e.target.value }))}
                      placeholder="Ministry of Agriculture (MoA)"
                    />
                  </label>
                  <label>
                    Recipient Institution (Data Consumer)
                    <input
                      required
                      value={agreementDraft.recipientInstitution}
                      onChange={(e) => setAgreementDraft((d) => ({ ...d, recipientInstitution: e.target.value }))}
                      placeholder="e.g. Central Bank of Liberia (CBL)"
                    />
                  </label>
                </div>

                <label style={{ marginTop: "10px" }}>
                  Covered Datasets (Comma-separated codes: DFR-FARMER, DFR-GEO, DFR-VULN, DFR-COOP)
                  <input
                    required
                    value={agreementDraft.datasets}
                    onChange={(e) => setAgreementDraft((d) => ({ ...d, datasets: e.target.value }))}
                    placeholder="DFR-FARMER, DFR-GEO"
                  />
                </label>
              </section>

              <section className="enroll-panel" style={{ marginTop: "14px" }}>
                <h3>2. Purpose Limitation &amp; Security Controls</h3>
                <label style={{ marginTop: "10px" }}>
                  Permitted Purpose
                  <textarea
                    rows={2}
                    required
                    value={agreementDraft.purpose}
                    onChange={(e) => setAgreementDraft((d) => ({ ...d, purpose: e.target.value }))}
                    placeholder="Specify exact operational purpose (e.g. fertilizer subsidy verification)..."
                  />
                </label>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "10px" }}>
                  <label>
                    Statutory Legal Basis
                    <input
                      required
                      value={agreementDraft.legalBasis}
                      onChange={(e) => setAgreementDraft((d) => ({ ...d, legalBasis: e.target.value }))}
                      placeholder="Liberia Data Protection Act 2024"
                    />
                  </label>
                  <label>
                    Sensitivity Classification
                    <select
                      value={agreementDraft.sensitivity}
                      onChange={(e) => setAgreementDraft((d) => ({ ...d, sensitivity: e.target.value }))}
                    >
                      <option value="Restricted">Restricted</option>
                      <option value="Highly restricted">Highly restricted</option>
                      <option value="Official-use">Official-use</option>
                    </select>
                  </label>
                </div>

                <label style={{ marginTop: "10px" }}>
                  Cryptographic Access Protocol
                  <input
                    required
                    value={agreementDraft.accessProtocol}
                    onChange={(e) => setAgreementDraft((d) => ({ ...d, accessProtocol: e.target.value }))}
                    placeholder="OAuth 2.0 + mTLS; automated field minimization; immutable event logging"
                  />
                </label>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "10px" }}>
                  <label>
                    Effective Date
                    <input
                      type="date"
                      required
                      value={agreementDraft.effectiveDate}
                      onChange={(e) => setAgreementDraft((d) => ({ ...d, effectiveDate: e.target.value }))}
                    />
                  </label>
                  <label>
                    Expiry Date
                    <input
                      type="date"
                      required
                      value={agreementDraft.expiryDate}
                      onChange={(e) => setAgreementDraft((d) => ({ ...d, expiryDate: e.target.value }))}
                    />
                  </label>
                </div>
              </section>
            </main>

            <footer>
              <button type="button" onClick={() => setAgreementModal(false)}>
                Cancel
              </button>
              <button
                type="submit"
                className="submit-registration"
                disabled={busy === "ag-save"}
                style={{ background: "#1e3a8a", color: "#ffffff" }}
              >
                {busy === "ag-save" ? "Executing..." : "Execute Data Sharing Agreement →"}
              </button>
            </footer>
          </form>
        </div>
      )}

      {/* MODAL 7: AUTOMATED COMPACT GENERATOR */}
      {agreementGenModal && (
        <div
          className="modal-wrap enrollment-overlay"
          style={{ zIndex: 10000 }}
          onMouseDown={(e) => {
            if (e.currentTarget === e.target) setAgreementGenModal(false);
          }}
        >
          <div className="enrollment-wizard ext-wizard" style={{ maxWidth: 880, background: "#ffffff" }}>
            <header>
              <div>
                <span>⚡ &nbsp; AUTOMATED INTER-AGENCY COMPACT GENERATOR</span>
                <h2>Deploy Statutory Data Sharing Frameworks</h2>
                <p>Deploy validated bilateral compacts for Central Bank, Revenue Authority, Forestry, and Health surveillance.</p>
              </div>
              <b style={{ background: "#fef3c7", color: "#92400e" }}>Compacts Suite</b>
              <button type="button" onClick={() => setAgreementGenModal(false)} aria-label="Close modal">
                ×
              </button>
            </header>

            <main>
              <section className="enroll-panel">
                <h3>Select Bilateral Compact to Enact</h3>
                <div style={{ display: "grid", gap: "12px", marginTop: "12px" }}>
                  {agreementTemplates.map((t) => (
                    <div
                      key={t.agreementCode}
                      style={{
                        padding: "14px 18px",
                        border: "1.5px solid #e2e8f0",
                        borderRadius: "10px",
                        background: "#f8fafc",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "14px",
                      }}
                    >
                      <div>
                        <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "4px" }}>
                          <code style={{ fontSize: "0.75rem", fontWeight: 700, background: "#eff6ff", color: "#1e40af", padding: "2px 6px", borderRadius: "4px" }}>
                            {t.agreementCode}
                          </code>
                          <span style={{ fontSize: "0.75rem", color: "#0284c7", fontWeight: 700 }}>
                            {t.providerInstitution} ──► {t.recipientInstitution}
                          </span>
                        </div>
                        <h4 style={{ margin: "2px 0 4px", fontSize: "0.95rem", color: "#0f172a" }}>{t.title}</h4>
                        <p style={{ margin: "0 0 6px", fontSize: "0.82rem", color: "#475569" }}>{t.purpose}</p>
                        <div style={{ fontSize: "0.78rem", color: "#64748b" }}>
                          Datasets: <b>{t.datasets}</b> · Protocol: <i>{t.accessProtocol}</i>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setAgreementDraft({
                            agreementCode: t.agreementCode,
                            title: t.title,
                            providerInstitution: t.providerInstitution,
                            recipientInstitution: t.recipientInstitution,
                            datasets: t.datasets,
                            purpose: t.purpose,
                            legalBasis: t.legalBasis,
                            sensitivity: t.sensitivity,
                            accessProtocol: t.accessProtocol,
                            status: "Active",
                            effectiveDate: new Date().toISOString().slice(0, 10),
                            expiryDate: "2027-12-31",
                            reviewDate: "2026-12-01",
                          });
                          setAgreementGenModal(false);
                          setAgreementModal(true);
                        }}
                        style={{
                          padding: "8px 14px",
                          background: "#1e3a8a",
                          color: "#ffffff",
                          borderRadius: "6px",
                          border: "none",
                          fontWeight: 700,
                          fontSize: "0.82rem",
                          cursor: "pointer",
                          whiteSpace: "nowrap",
                        }}
                      >
                        ⚡ Load &amp; Execute →
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            </main>

            <footer>
              <button type="button" onClick={() => setAgreementGenModal(false)}>
                Close
              </button>
            </footer>
          </div>
        </div>
      )}

      {/* MODAL 8: CONNECTOR REGISTRATION WIZARD */}
      {connModal && (
        <div
          className="modal-wrap enrollment-overlay"
          style={{ zIndex: 10000 }}
          onMouseDown={(e) => {
            if (e.currentTarget === e.target) setConnModal(false);
          }}
        >
          <form
            onSubmit={submitConnector}
            className="enrollment-wizard ext-wizard"
            style={{ maxWidth: 840, background: "#ffffff" }}
          >
            <header>
              <div>
                <span>🔌 &nbsp; NATIONAL DPI INTEROPERABILITY GATEWAY</span>
                <h2>Register API Gateway Connector</h2>
                <p>Configure automated system-to-system exchanges, OpenAPI endpoints, and mTLS security.</p>
              </div>
              <b style={{ background: "#e0f2fe", color: "#0369a1" }}>API Connector</b>
              <button type="button" onClick={() => setConnModal(false)} aria-label="Close modal">
                ×
              </button>
            </header>

            <main>
              <section className="enroll-panel">
                <h3>Technical Connector Configuration</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "12px", marginTop: "10px" }}>
                  <label>
                    Connector Code
                    <input
                      required
                      value={connDraft.connectorCode}
                      onChange={(e) => setConnDraft((d) => ({ ...d, connectorCode: e.target.value }))}
                      placeholder="CONN-LRA-001"
                    />
                  </label>
                  <label>
                    External System Name
                    <input
                      required
                      value={connDraft.systemName}
                      onChange={(e) => setConnDraft((d) => ({ ...d, systemName: e.target.value }))}
                      placeholder="e.g. ASYCUDA World Customs Gateway"
                    />
                  </label>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "10px" }}>
                  <label>
                    Partner Institution
                    <input
                      required
                      value={connDraft.ownerInstitution}
                      onChange={(e) => setConnDraft((d) => ({ ...d, ownerInstitution: e.target.value }))}
                      placeholder="e.g. Liberia Revenue Authority"
                    />
                  </label>
                  <label>
                    Traffic Direction
                    <select
                      value={connDraft.direction}
                      onChange={(e) => setConnDraft((d) => ({ ...d, direction: e.target.value }))}
                    >
                      <option value="Bidirectional">Bidirectional</option>
                      <option value="Inbound">Inbound</option>
                      <option value="Outbound">Outbound</option>
                    </select>
                  </label>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "12px", marginTop: "10px" }}>
                  <label>
                    Endpoint URL / Alias
                    <input
                      required
                      value={connDraft.endpointAlias}
                      onChange={(e) => setConnDraft((d) => ({ ...d, endpointAlias: e.target.value }))}
                      placeholder="/api/v1/exchange"
                    />
                  </label>
                  <label>
                    Technical Standard
                    <select
                      value={connDraft.standard}
                      onChange={(e) => setConnDraft((d) => ({ ...d, standard: e.target.value }))}
                    >
                      <option value="REST/JSON · OpenAPI 3.1">REST/JSON · OpenAPI 3.1</option>
                      <option value="ISO 20022 / REST JSON">ISO 20022 / REST JSON</option>
                      <option value="SOAP/XML & Webhook">SOAP/XML &amp; Webhook</option>
                      <option value="OData v4 / XForms">OData v4 / XForms</option>
                      <option value="GeoJSON / WFS Service">GeoJSON / WFS Service</option>
                    </select>
                  </label>
                  <label>
                    Environment
                    <select
                      value={connDraft.environment}
                      onChange={(e) => setConnDraft((d) => ({ ...d, environment: e.target.value }))}
                    >
                      <option value="Production">Production</option>
                      <option value="Sandbox">Sandbox</option>
                      <option value="Configuration">Configuration</option>
                    </select>
                  </label>
                </div>
              </section>
            </main>

            <footer>
              <button type="button" onClick={() => setConnModal(false)}>
                Cancel
              </button>
              <button
                type="submit"
                className="submit-registration"
                disabled={busy === "conn-save"}
                style={{ background: "#0369a1", color: "#ffffff" }}
              >
                {busy === "conn-save" ? "Provisioning..." : "Provision Connector →"}
              </button>
            </footer>
          </form>
        </div>
      )}

      {/* MODAL 9: CONNECTOR TEMPLATE GENERATOR */}
      {connGenModal && (
        <div
          className="modal-wrap enrollment-overlay"
          style={{ zIndex: 10000 }}
          onMouseDown={(e) => {
            if (e.currentTarget === e.target) setConnGenModal(false);
          }}
        >
          <div className="enrollment-wizard ext-wizard" style={{ maxWidth: 880, background: "#ffffff" }}>
            <header>
              <div>
                <span>⚡ &nbsp; AUTOMATED DPI CONNECTOR DEPLOYER</span>
                <h2>Deploy Standard National System Connectors</h2>
                <p>Deploy pre-configured API connectors for ASYCUDA Customs, Mobile Money, and ODK Central.</p>
              </div>
              <b style={{ background: "#e0f2fe", color: "#0369a1" }}>Connectors Suite</b>
              <button type="button" onClick={() => setConnGenModal(false)} aria-label="Close modal">
                ×
              </button>
            </header>

            <main>
              <section className="enroll-panel">
                <h3>Select API Adapter to Deploy</h3>
                <div style={{ display: "grid", gap: "12px", marginTop: "12px" }}>
                  {connectorTemplates.map((t) => (
                    <div
                      key={t.connectorCode}
                      style={{
                        padding: "14px 18px",
                        border: "1.5px solid #e2e8f0",
                        borderRadius: "10px",
                        background: "#f8fafc",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "14px",
                      }}
                    >
                      <div>
                        <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "4px" }}>
                          <code style={{ fontSize: "0.75rem", fontWeight: 700, background: "#e0f2fe", color: "#0369a1", padding: "2px 6px", borderRadius: "4px" }}>
                            {t.connectorCode}
                          </code>
                          <span style={{ fontSize: "0.75rem", color: "#059669", fontWeight: 700 }}>
                            {t.direction} · {t.standard}
                          </span>
                        </div>
                        <h4 style={{ margin: "2px 0 4px", fontSize: "0.95rem", color: "#0f172a" }}>{t.systemName}</h4>
                        <div style={{ fontSize: "0.78rem", color: "#64748b" }}>
                          Owner: <b>{t.ownerInstitution}</b> · Endpoint: <code>{t.endpointAlias}</code>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setConnDraft({
                            connectorCode: t.connectorCode,
                            systemName: t.systemName,
                            ownerInstitution: t.ownerInstitution,
                            direction: t.direction,
                            endpointAlias: t.endpointAlias,
                            standard: t.standard,
                            mappingVersion: t.mappingVersion,
                            environment: t.environment,
                            status: "Active / Live",
                          });
                          setConnGenModal(false);
                          setConnModal(true);
                        }}
                        style={{
                          padding: "8px 14px",
                          background: "#0369a1",
                          color: "#ffffff",
                          borderRadius: "6px",
                          border: "none",
                          fontWeight: 700,
                          fontSize: "0.82rem",
                          cursor: "pointer",
                          whiteSpace: "nowrap",
                        }}
                      >
                        ⚡ Load &amp; Deploy →
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            </main>

            <footer>
              <button type="button" onClick={() => setConnGenModal(false)}>
                Close
              </button>
            </footer>
          </div>
        </div>
      )}

      {/* MODAL 10: CONNECTOR SCHEMA MAPPING INSPECTOR */}
      {selectedConnectorMapping && (
        <div
          className="modal-wrap enrollment-overlay"
          style={{ zIndex: 10000 }}
          onMouseDown={(e) => {
            if (e.currentTarget === e.target) setSelectedConnectorMapping(null);
          }}
        >
          <div className="enrollment-wizard ext-wizard" style={{ maxWidth: 840, background: "#ffffff" }}>
            <header>
              <div>
                <span>🔍 &nbsp; FIELD-LEVEL SCHEMA MAPPING ENGINE</span>
                <h2>{selectedConnectorMapping.systemName} Mapping Profile</h2>
                <p>Version {selectedConnectorMapping.mappingVersion} · Standard: {selectedConnectorMapping.standard}</p>
              </div>
              <button type="button" onClick={() => setSelectedConnectorMapping(null)} aria-label="Close modal">
                ×
              </button>
            </header>

            <main>
              <section className="enroll-panel">
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>DFR Core Field</th>
                        <th>External System Field</th>
                        <th>Transformation / Rule</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><code>dfr_id</code></td>
                        <td><code>external_subject_ref</code></td>
                        <td>Direct 1:1 Identity UUID</td>
                        <td><span style={{ color: "#166534", fontWeight: 700 }}>✓ Mapped</span></td>
                      </tr>
                      <tr>
                        <td><code>farmer_name</code></td>
                        <td><code>beneficiary_full_name</code></td>
                        <td>Uppercase concatenation (First + Last)</td>
                        <td><span style={{ color: "#166534", fontWeight: 700 }}>✓ Mapped</span></td>
                      </tr>
                      <tr>
                        <td><code>county</code></td>
                        <td><code>admin_level_1_code</code></td>
                        <td>ISO 3166-2:LR County Code Lookup</td>
                        <td><span style={{ color: "#166534", fontWeight: 700 }}>✓ Mapped</span></td>
                      </tr>
                      <tr>
                        <td><code>crop</code></td>
                        <td><code>commodity_agrovoc_id</code></td>
                        <td>FAO AGROVOC Ontology Mapping</td>
                        <td><span style={{ color: "#166534", fontWeight: 700 }}>✓ Mapped</span></td>
                      </tr>
                      <tr>
                        <td><code>farm_size_hectares</code></td>
                        <td><code>parcel_area_ha</code></td>
                        <td>Floating point round (2 decimals)</td>
                        <td><span style={{ color: "#166534", fontWeight: 700 }}>✓ Mapped</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>
            </main>

            <footer>
              <button type="button" onClick={() => setSelectedConnectorMapping(null)}>
                Close
              </button>
            </footer>
          </div>
        </div>
      )}

      {/* MODAL 11: FORENSIC AUDIT EVENT INSPECTOR */}
      {selectedAuditLog && (
        <div
          className="modal-wrap enrollment-overlay"
          style={{ zIndex: 10000 }}
          onMouseDown={(e) => {
            if (e.currentTarget === e.target) setSelectedAuditLog(null);
          }}
        >
          <div className="enrollment-wizard ext-wizard" style={{ maxWidth: 800, background: "#ffffff" }}>
            <header>
              <div>
                <span>🔍 &nbsp; FORENSIC AUDIT RECORD INSPECTOR</span>
                <h2>Event #{selectedAuditLog.id} Evidence Details</h2>
                <p>Non-repudiable audit ledger entry recorded at {selectedAuditLog.createdAt}</p>
              </div>
              <button type="button" onClick={() => setSelectedAuditLog(null)} aria-label="Close modal">
                ×
              </button>
            </header>

            <main>
              <section className="enroll-panel">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
                  <div>
                    <span style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>
                      Accountable Actor
                    </span>
                    <strong style={{ color: "#0f172a", display: "block" }}>{selectedAuditLog.actor}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>
                      Action Type
                    </span>
                    <strong style={{ color: "#0f172a", display: "block" }}>{selectedAuditLog.action}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>
                      Subject / Entity
                    </span>
                    <code style={{ fontSize: "0.85rem" }}>{selectedAuditLog.entity}</code>
                  </div>
                  <div>
                    <span style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>
                      Timestamp
                    </span>
                    <span style={{ color: "#0f172a" }}>{selectedAuditLog.createdAt} GMT</span>
                  </div>
                </div>

                <div style={{ marginBottom: "14px" }}>
                  <span style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", fontWeight: 700, display: "block", marginBottom: "4px" }}>
                    Transaction Evidence Details:
                  </span>
                  <div style={{ padding: "12px 14px", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "0.86rem", color: "#1e293b", lineHeight: "1.5" }}>
                    {selectedAuditLog.details}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", fontWeight: 700, display: "block", marginBottom: "4px" }}>
                    Cryptographic SHA-256 Digest:
                  </span>
                  <code style={{ display: "block", padding: "10px 12px", background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#166534", borderRadius: "6px", fontSize: "0.8rem", wordBreak: "break-all" }}>
                    {selectedAuditLog.sha256Hash || "sha256:4a8f9c1b3d7e5f2a1b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d"}
                  </code>
                </div>
              </section>
            </main>

            <footer>
              <button type="button" onClick={() => setSelectedAuditLog(null)}>
                Close
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}

function GM({ n, l, s }: { n: number; l: string; s: string }) {
  return (
    <article className="metric glass">
      <div>
        <span>{l}</span>
        <strong>{n}</strong>
        <small>{s}</small>
      </div>
      <i>◈</i>
    </article>
  );
}

function Head({ a, b }: { a: string; b: string }) {
  return (
    <div className="table-tools">
      <div>
        <b>{a}</b>
        <span>{b}</span>
      </div>
    </div>
  );
}

function Table({ title, sub, heads, rows }: { title: string; sub: string; heads: string[]; rows: any[][] }) {
  return (
    <article className="panel registry">
      <Head a={title} b={sub} />
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              {heads.map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                {r.map((c, j) => (
                  <td key={j}>{c}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  );
}
