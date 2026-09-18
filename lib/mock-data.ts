// Client-side persistent data store for Liberia Digital Farmer Registry
// Provides realistic pre-seeded data for all 15 counties and offline/static GitHub Pages execution.

export interface MockFarmer {
  id: number;
  dfrId: string;
  provisionalId: string;
  approvedDfrId: string;
  firstName: string;
  lastName: string;
  gender: string;
  phone: string;
  county: string;
  district: string;
  community: string;
  crop: string;
  farmSize: number;
  status: string;
  vulnerability: string;
  roadAccess?: string;
  roadCondition?: string;
  roadSeasonality?: string;
  roadDistanceMiles?: number;
  processingAccess?: string;
  processingFacilityType?: string;
  processingFacilityName?: string;
  processingFacilityStatus?: string;
  processingDistanceMiles?: number;
  processingTravelMinutes?: number;
  processingTransportMode?: string;
  marketAccess?: string;
  marketDistanceKm?: number;
  marketTravelMinutes?: number;
  storageAccess?: string;
  storageCapacityMt?: number;
  postHarvestLossPct?: number;
  transportMode?: string;
  transportOwnership?: string;
  tillageMechanization?: string;
  irrigationAccess?: string;
  smartTechReadiness?: string;
  latitude: number | null;
  longitude: number | null;
  photoUrl?: string;
  createdAt: string;
}

export interface MockParty {
  id: number;
  partyId: string;
  partyType: string;
  legalName: string;
  acronym: string;
  legalForm: string;
  registrationNumber: string;
  representativeName: string;
  phone: string;
  email: string;
  county: string;
  district: string;
  community: string;
  memberCount: number;
  womenMembers: number;
  youthMembers: number;
  primaryCommodity: string;
  verificationStatus: string;
  status: string;
  taxId?: string;
  establishedDate?: string;
  metadata?: Record<string, any>;
  relationships?: any[];
  resources?: any[];
  activities?: any[];
  documents?: any[];
  audits?: any[];
  createdAt: string;
}

export interface MockParcel {
  id: number;
  parcelId: string;
  farmerDfrId: string;
  farmerName: string;
  county: string;
  district: string;
  commodity: string;
  vertices: string;
  areaHectares: number;
  areaAcres: number;
  perimeterMeters: number;
  centroidLat: number;
  centroidLng: number;
  gpsAccuracy: number;
  geometryStatus: string;
  revision: number;
  verifiedBy: string;
  verifiedAt: string;
  createdAt: string;
}

export interface MockDeliveryItem {
  id: number;
  reference: string;
  component: number;
  workstream: string;
  title: string;
  description: string;
  owner: string;
  county: string;
  dueDate: string;
  status: string;
  acceptanceStatus: string;
  metadata: Record<string, any> | string;
  evidence: any[];
  audit: any[];
}

export interface MockHousehold {
  id: number;
  householdId: string;
  representative: string;
  farmerDfrId: string;
  county: string;
  district: string;
  community: string;
  members: number;
  femaleMembers: number;
  youthMembers: number;
  disabledMembers: number;
  dependants: number;
  status: string;
  createdAt: string;
}

export interface MockSOP {
  id: number;
  sopCode: string;
  title: string;
  version: string;
  ownerInstitution: string;
  stage: string;
  effectiveDate: string;
  nextReviewDate: string;
  requiredApprovals: string;
  approvals: string;
  consultationStatus: string;
  changeClass: string;
}

export interface MockAudit {
  id: number;
  actor: string;
  action: string;
  entity: string;
  details: string;
  createdAt: string;
}

export interface MockVoucher {
  id: number;
  voucherCode: string;
  farmerDfrId: string;
  ownerEmail: string;
  programme: string;
  category: string;
  value: number;
  currency: string;
  status: string;
  expiresAt: string;
  distributionSite: string;
  appointmentAt?: string;
  receiptAcknowledged?: boolean;
  redeemedAt?: string;
  createdAt: string;
}

export interface MockPaymentAccount {
  id: number;
  farmerDfrId: string;
  ownerEmail: string;
  provider: string;
  accountName: string;
  accountNumberMasked: string;
  verified: boolean;
  status: string;
  accountType: string;
  createdAt?: string;
}

export interface MockPaymentTransaction {
  id: number;
  transactionCode: string;
  farmerDfrId: string;
  ownerEmail: string;
  programme: string;
  amount: number;
  currency: string;
  status: string;
  receiptRef?: string;
  processedAt?: string;
  createdAt: string;
  failureReason?: string;
}

const INITIAL_FARMERS: MockFarmer[] = [];

const INITIAL_PARTIES: MockParty[] = [];

const INITIAL_PARCELS: MockParcel[] = [];


export interface MockDeliveryTemplate {
  number: string;
  component: number;
  workstream: string;
  title: string;
  description: string;
  owner: string;
  institution: string;
  reviewer: string;
  approver: string;
  dueDate: string;
  dependencies: string;
  acceptanceCriteria: string;
}

export const INITIAL_DELIVERY_TEMPLATES: MockDeliveryTemplate[] = [
  {
    number: "D1",
    component: 1,
    workstream: "Inception & planning",
    title: "Inception Report & Comprehensive Work Plan",
    description: "Multi-stakeholder baseline, methodological roadmap, governance arrangements and seven-month delivery schedule.",
    owner: "Team Leader / Registry Specialist",
    institution: "Ministry of Agriculture / FAO",
    reviewer: "FAO Quality Assurance Team",
    approver: "National Steering Committee",
    dueDate: "2026-09-15",
    dependencies: "Contract signature and institutional mobilization",
    acceptanceCriteria: "Formal sign-off by MoA and FAO confirming aligned scope, resource allocation and execution milestones.",
  },
  {
    number: "D2",
    component: 1,
    workstream: "Assessment & gap analysis",
    title: "Institutional, Legal, Data & Technical Assessment Report",
    description: "Assessment of existing agricultural registries, MIS initiatives, data privacy regulations and interoperability readiness.",
    owner: "Institutional Governance Lead",
    institution: "MoA / LISGIS / MGCSP",
    reviewer: "Legal & Regulatory Working Group",
    approver: "Lead Systems Architect",
    dueDate: "2026-09-30",
    dependencies: "D1 Inception Report",
    acceptanceCriteria: "Approved gap analysis and institutional inventory covering all 15 counties.",
  },
  {
    number: "D3",
    component: 2,
    workstream: "Solution design",
    title: "DFR System Architecture, Data Model & Security Design Document",
    description: "Architectural blueprint including LADM-compliant data schemas, GIS integration, RBAC, offline sync and API specifications.",
    owner: "Lead Systems Architect",
    institution: "Ministry of Agriculture",
    reviewer: "LISGIS Cartography & IT Directorate",
    approver: "National Steering Committee",
    dueDate: "2026-10-15",
    dependencies: "D2 Assessment Report",
    acceptanceCriteria: "Full validation of data dictionary, API exchange protocols and cryptographic data protection standards.",
  },
  {
    number: "D4",
    component: 3,
    workstream: "SOPs & institutional operations",
    title: "Standard Operating Procedures (SOP 01 to SOP 11) Manual",
    description: "Complete operational manual covering farmer registration, GIS mapping, verification, grievance redress and social registry referrals.",
    owner: "Operations & SOP Specialist",
    institution: "MoA / CDA / Extension Directorate",
    reviewer: "County Agricultural Officers Panel",
    approver: "Minister of Agriculture",
    dueDate: "2026-10-31",
    dependencies: "D3 Architecture Document",
    acceptanceCriteria: "Formal adoption of 11 SOPs with maker-checker controls and signed governance charters.",
  },
  {
    number: "D5",
    component: 4,
    workstream: "Platform implementation",
    title: "Production DFR Software Platform & Offline Mobile Sync Engine",
    description: "Fully configured web registry, offline PWA field application, GIS cadastre engine and REST APIs deployed to cloud infrastructure.",
    owner: "Senior Software Engineer",
    institution: "IT Directorate / TOTAG",
    reviewer: "FAO Independent Technical Reviewer",
    approver: "National Steering Committee",
    dueDate: "2026-11-15",
    dependencies: "D3 Architecture & D4 SOPs",
    acceptanceCriteria: "Passing 100% automated integration test suites and verifiable offline synchronization under field test conditions.",
  },
  {
    number: "D6",
    component: 5,
    workstream: "Capacity development",
    title: "National Training Curriculum, Operational Guides & Knowledge Transfer",
    description: "Training of trainers (ToT) delivery, user manuals, video tutorials and hands-on certification for 15 county teams and enumerators.",
    owner: "Capacity Development Lead",
    institution: "MoA / Central Agricultural Research Institute",
    reviewer: "Director of Extension Services",
    approver: "FAO Programme Officer",
    dueDate: "2026-11-30",
    dependencies: "D5 Software Platform",
    acceptanceCriteria: "Certification of at least 60 core trainers and verified field readiness across target counties.",
  },
  {
    number: "D7",
    component: 6,
    workstream: "Pilot, UAT & rollout",
    title: "Field Pilot Execution, User Acceptance Testing (UAT) & Rollout Report",
    description: "Execution of pilot registration in Bong, Nimba and Lofa, verification of 1,000+ farmer records and signed UAT acceptance certificate.",
    owner: "QA & Field Operations Lead",
    institution: "MoA / LISGIS",
    reviewer: "County Verification Committee",
    approver: "National Steering Committee",
    dueDate: "2026-12-15",
    dependencies: "D5 Software Platform & D6 Training",
    acceptanceCriteria: "Signed UAT certificate without any critical or high-severity blocking defects.",
  },
  {
    number: "D8",
    component: 7,
    workstream: "Learning & closure",
    title: "Final Assignment Report, Policy Recommendations & Handover Plan",
    description: "Comprehensive closeout report, sustainability roadmap, data governance charter and complete institutional handover documentation.",
    owner: "Team Leader",
    institution: "Ministry of Agriculture / FAO",
    reviewer: "FAO Representation in Liberia",
    approver: "Minister of Agriculture & FAO Representative",
    dueDate: "2026-12-31",
    dependencies: "D7 Rollout Report",
    acceptanceCriteria: "Formal contract acceptance and delivery of all source code, cryptographic keys, databases and handover documentation.",
  },
];

const INITIAL_DELIVERY_ITEMS: MockDeliveryItem[] = [];

const INITIAL_HOUSEHOLDS: MockHousehold[] = [];

const INITIAL_SOPS: MockSOP[] = [
  {
    id: 1,
    sopCode: "SOP-01",
    title: "Farmer & Household Identification and Onboarding",
    version: "2.1",
    ownerInstitution: "Ministry of Agriculture",
    stage: "Active",
    effectiveDate: "2026-06-01",
    nextReviewDate: "2027-06-01",
    requiredApprovals: JSON.stringify(["MoA Policy Lead", "FAO Lead Technical Advisor"]),
    approvals: JSON.stringify(["Approved"]),
    consultationStatus: "Completed",
    changeClass: "Major",
  },
  {
    id: 2,
    sopCode: "SOP-02",
    title: "Farm Parcel Boundary Demarcation & GPS Area Measurement",
    version: "1.4",
    ownerInstitution: "MoA / LISGIS",
    stage: "Active",
    effectiveDate: "2026-06-15",
    nextReviewDate: "2027-06-15",
    requiredApprovals: JSON.stringify(["LISGIS Cartographer", "MoA GIS Lead"]),
    approvals: JSON.stringify(["Approved"]),
    consultationStatus: "Completed",
    changeClass: "Minor",
  },
  {
    id: 3,
    sopCode: "SOP-03",
    title: "Offline Field Data Synchronization & Conflict Resolution",
    version: "2.0",
    ownerInstitution: "Ministry of Agriculture",
    stage: "Active",
    effectiveDate: "2026-07-01",
    nextReviewDate: "2027-07-01",
    requiredApprovals: JSON.stringify(["IT Director", "Operations Lead"]),
    approvals: JSON.stringify(["Approved"]),
    consultationStatus: "Completed",
    changeClass: "Major",
  },
  {
    id: 4,
    sopCode: "SOP-04",
    title: "Subsidies, E-Voucher Issuance & Distribution Verification",
    version: "1.2",
    ownerInstitution: "Ministry of Agriculture",
    stage: "Active",
    effectiveDate: "2026-07-15",
    nextReviewDate: "2027-07-15",
    requiredApprovals: JSON.stringify(["Programme Manager", "MoA Finance"]),
    approvals: JSON.stringify(["Approved"]),
    consultationStatus: "Completed",
    changeClass: "Standard",
  },
  {
    id: 5,
    sopCode: "SOP-05",
    title: "Grievance Redress Mechanism & Appeal Workflows",
    version: "1.0",
    ownerInstitution: "Ministry of Agriculture / MGCSP",
    stage: "Active",
    effectiveDate: "2026-08-01",
    nextReviewDate: "2027-08-01",
    requiredApprovals: JSON.stringify(["Grievance Officer", "Legal Counsel"]),
    approvals: JSON.stringify(["Approved"]),
    consultationStatus: "Completed",
    changeClass: "Standard",
  },
];
export const INITIAL_VOUCHERS: MockVoucher[] = [
  {
    id: 1,
    voucherCode: "VCH-26-44019",
    farmerDfrId: "LBR-BG-000104",
    ownerEmail: "tis@totaggroup.com",
    programme: "National Rice Development Support Programme (NRDSP)",
    category: "Certified Rice Seed (Nerica L-19) & NPK 15-15-15",
    value: 185,
    currency: "USD",
    status: "Issued",
    expiresAt: "2026-11-30",
    distributionSite: "CARI Suakoko Agro Hub, Bong County",
    appointmentAt: "Pickup Window: 09:00 - 15:00 GMT",
    receiptAcknowledged: false,
    createdAt: "2026-09-02 10:30:00",
  },
  {
    id: 2,
    voucherCode: "VCH-26-88123",
    farmerDfrId: "LBR-LF-000301",
    ownerEmail: "tis@totaggroup.com",
    programme: "FAO Smallholder Post-Harvest Loss Mitigation",
    category: "Hermetic Storage Bags (5x 50kg) & Moisture Meter",
    value: 95,
    currency: "USD",
    status: "Issued",
    expiresAt: "2026-12-15",
    distributionSite: "Voinjama Central Agro-Dealer Depot, Lofa County",
    appointmentAt: "Open for Collection",
    receiptAcknowledged: false,
    createdAt: "2026-09-05 14:15:00",
  },
  {
    id: 3,
    voucherCode: "VCH-26-12904",
    farmerDfrId: "LBR-NM-000215",
    ownerEmail: "tis@totaggroup.com",
    programme: "MoA Tree Crop Rehabilitation Initiative",
    category: "Cocoa Clonal Seedlings (150 units) & Pruning Kit",
    value: 240,
    currency: "USD",
    status: "Redeemed",
    expiresAt: "2026-10-31",
    distributionSite: "Ganta Agro-Center, Nimba County",
    appointmentAt: "Distributed on 14-Sep-2026",
    receiptAcknowledged: false,
    redeemedAt: "2026-09-14 11:00:00",
    createdAt: "2026-08-20 08:00:00",
  },
  {
    id: 4,
    voucherCode: "VCH-26-90512",
    farmerDfrId: "LBR-MO-000412",
    ownerEmail: "tis@totaggroup.com",
    programme: "Urban Peri-Horticulture & Solar Irrigation Pilot",
    category: "Drip Irrigation Kit & Vegetable Hybrid Pack",
    value: 310,
    currency: "USD",
    status: "Redeemed",
    expiresAt: "2026-12-31",
    distributionSite: "Fendell MoA Logistics Center, Montserrado County",
    appointmentAt: "Delivered & Confirmed",
    receiptAcknowledged: true,
    redeemedAt: "2026-08-28 16:30:00",
    createdAt: "2026-08-10 11:45:00",
  },
];

export const INITIAL_BENEFIT_ACCOUNTS: MockPaymentAccount[] = [
  {
    id: 1,
    farmerDfrId: "LBR-BG-000104",
    ownerEmail: "tis@totaggroup.com",
    provider: "MTN Mobile Money",
    accountName: "Josephine Flomo",
    accountNumberMasked: "0886***214",
    verified: true,
    status: "Verified",
    accountType: "Mobile money",
    createdAt: "2026-08-15 09:00:00",
  },
  {
    id: 2,
    farmerDfrId: "LBR-LF-000301",
    ownerEmail: "tis@totaggroup.com",
    provider: "Orange Money",
    accountName: "Korto Kollie",
    accountNumberMasked: "0777***890",
    verified: true,
    status: "Verified",
    accountType: "Mobile money",
    createdAt: "2026-08-18 10:15:00",
  },
  {
    id: 3,
    farmerDfrId: "LBR-MO-000412",
    ownerEmail: "tis@totaggroup.com",
    provider: "MTN Mobile Money",
    accountName: "Fatu Kamara",
    accountNumberMasked: "0880***553",
    verified: false,
    status: "Verification requested",
    accountType: "Mobile money",
    createdAt: "2026-09-01 14:20:00",
  },
];

export const INITIAL_BENEFIT_TRANSACTIONS: MockPaymentTransaction[] = [
  {
    id: 1,
    transactionCode: "TX-26-00812",
    farmerDfrId: "LBR-BG-000104",
    ownerEmail: "tis@totaggroup.com",
    programme: "NRDSP Rice Producer Cash Support",
    amount: 150,
    currency: "USD",
    status: "Disbursed",
    receiptRef: "REC-MOA-2026-0981",
    processedAt: "2026-09-08 11:20:00",
    createdAt: "2026-09-08 11:20:00",
  },
  {
    id: 2,
    transactionCode: "TX-26-00755",
    farmerDfrId: "LBR-LF-000301",
    ownerEmail: "tis@totaggroup.com",
    programme: "FAO Climate Resilience Emergency Aid",
    amount: 80,
    currency: "USD",
    status: "Disbursed",
    receiptRef: "REC-FAO-2026-0755",
    processedAt: "2026-09-12 14:05:00",
    createdAt: "2026-09-12 14:05:00",
  },
];

const INITIAL_AUDITS: MockAudit[] = [];

const LEGACY_STORAGE_KEYS = [
  "dfr_farmers_store_v1",
  "dfr_parties_store_v1",
  "dfr_parcels_store_v1",
  "dfr_delivery_store_v1",
  "dfr_audits_store_v1",
  "dfr_households_store_v1",
];

let purgedLegacy = false;
export function purgeLegacyMockStorage() {
  if (typeof window === "undefined" || purgedLegacy) return;
  try {
    for (const key of LEGACY_STORAGE_KEYS) {
      localStorage.removeItem(key);
    }
    purgedLegacy = true;
  } catch {
    // Ignore storage exceptions
  }
}

const STORAGE_KEYS = {
  FARMERS: "dfr_farmers_store_v2_live",
  PARTIES: "dfr_parties_store_v2_live",
  PARCELS: "dfr_parcels_store_v2_live",
  DELIVERY: "dfr_delivery_store_v2_live",
  SOPS: "dfr_sops_store_v2_live",
  AUDITS: "dfr_audits_store_v2_live",
  HOUSEHOLDS: "dfr_households_store_v2_live",
  ROLE: "dfr_active_role_v2_live",
  VOUCHERS: "dfr_benefits_vouchers",
  ACCOUNTS: "dfr_benefits_accounts",
  TRANSACTIONS: "dfr_benefits_tx",
};

export function getStoredFarmers(): MockFarmer[] {
  if (typeof window === "undefined") return INITIAL_FARMERS;
  purgeLegacyMockStorage();
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FARMERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.FARMERS, JSON.stringify(INITIAL_FARMERS));
      return INITIAL_FARMERS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_FARMERS;
  }
}

export function saveStoredFarmer(farmer: Omit<MockFarmer, "id" | "createdAt">): MockFarmer {
  const existing = getStoredFarmers();
  const id = existing.length > 0 ? Math.max(...existing.map((f) => f.id)) + 1 : 1;
  const newRecord: MockFarmer = {
    ...farmer,
    id,
    createdAt: new Date().toISOString().replace("T", " ").slice(0, 19),
  };
  const updated = [newRecord, ...existing];
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEYS.FARMERS, JSON.stringify(updated));
      addStoredAudit({
        actor: "public-session@dfr.gov.lr",
        action: "Farmer registered",
        entity: newRecord.dfrId,
        details: `${newRecord.firstName} ${newRecord.lastName}, ${newRecord.county}; Farm Size: ${newRecord.farmSize} ha`,
      });
    } catch {}
  }
  return newRecord;
}

export function updateStoredFarmer(id: number, update: Partial<MockFarmer>): MockFarmer | null {
  const existing = getStoredFarmers();
  let updatedFarmer: MockFarmer | null = null;
  const updated = existing.map((f) => {
    if (f.id === id) {
      const countyPrefix = (update.county || f.county || "MO").slice(0, 2).toUpperCase();
      const approvedDfrId =
        update.status === "Verified" && !f.approvedDfrId
          ? `LBR-${countyPrefix}-${String(f.id).padStart(6, "0")}`
          : (update.approvedDfrId ?? f.approvedDfrId);
      
      updatedFarmer = {
        ...f,
        ...update,
        approvedDfrId: approvedDfrId || f.approvedDfrId,
        dfrId: approvedDfrId || f.dfrId,
      };
      return updatedFarmer;
    }
    return f;
  });

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEYS.FARMERS, JSON.stringify(updated));
      if (updatedFarmer) {
        addStoredAudit({
          actor: "verification.officer@moa.gov.lr",
          action: update.status === "Verified" ? "Official DFR ID approved" : "Farmer record updated",
          entity: (updatedFarmer as MockFarmer).approvedDfrId || (updatedFarmer as MockFarmer).dfrId,
          details: `Status: ${(updatedFarmer as MockFarmer).status}. Approved DFR ID: ${(updatedFarmer as MockFarmer).approvedDfrId || "Pending"}. Updated through official verification workflow.`,
        });
      }
    } catch {}
  }
  return updatedFarmer;
}

export function deleteStoredFarmer(id: number): boolean {
  if (typeof window === "undefined") return false;
  try {
    const existing = getStoredFarmers();
    const target = existing.find((f) => f.id === id);
    const updated = existing.filter((f) => f.id !== id);
    localStorage.setItem(STORAGE_KEYS.FARMERS, JSON.stringify(updated));
    if (target) {
      addStoredAudit({
        actor: "officer@dfr.moa.gov.lr",
        action: "Farmer registration deleted",
        entity: target.dfrId,
        details: `Deleted record for ${target.firstName} ${target.lastName} (${target.dfrId})`,
      });
    }
    return true;
  } catch {
    return false;
  }
}


export function getStoredParties(): MockParty[] {
  purgeLegacyMockStorage();
  let list: MockParty[] = INITIAL_PARTIES;
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.PARTIES);
      if (!raw) {
        localStorage.setItem(STORAGE_KEYS.PARTIES, JSON.stringify(INITIAL_PARTIES));
      } else {
        list = JSON.parse(raw);
      }
    } catch {
      list = INITIAL_PARTIES;
    }
  }
  return list.map((p) => ({
    ...p,
    relationships: Array.isArray(p.relationships) ? p.relationships : [],
    resources: Array.isArray(p.resources) ? p.resources : [],
    activities: Array.isArray(p.activities) ? p.activities : [],
    documents: Array.isArray(p.documents) ? p.documents : [],
    audits: Array.isArray(p.audits) ? p.audits : [],
    metadata: typeof p.metadata === "object" && p.metadata !== null ? p.metadata : {},
  }));
}

export function saveStoredParty(party: Partial<MockParty>): MockParty {
  const existing = getStoredParties();
  const id = existing.length > 0 ? Math.max(...existing.map((p) => p.id || 0)) + 1 : 1;
  const rawType = (party.partyType || "").toLowerCase();
  const typePrefix = rawType.includes("coop")
    ? "COOP"
    : rawType.includes("agri")
    ? "AGR"
    : rawType.includes("producer")
    ? "PROD"
    : rawType.includes("group")
    ? "GRP"
    : rawType.includes("service")
    ? "SRV"
    : rawType.includes("suppl")
    ? "SUP"
    : rawType.includes("finan")
    ? "FIN"
    : "ORG";
  const numStr = String(id).padStart(5, "0");
  const partyId = party.partyId || `ORG-${typePrefix}-${numStr}`;
  const newParty: MockParty = {
    id,
    partyId,
    partyType: party.partyType || "Cooperative",
    legalName: party.legalName || "Registered Organization",
    acronym: party.acronym || "",
    legalForm: party.legalForm || "Registered Cooperative Society",
    registrationNumber: party.registrationNumber || "",
    representativeName: party.representativeName || "Authorized Representative",
    phone: party.phone || "",
    email: party.email || "",
    county: party.county || "Montserrado",
    district: party.district || "",
    community: party.community || "",
    memberCount: Number(party.memberCount) || 0,
    womenMembers: Number(party.womenMembers) || 0,
    youthMembers: Number(party.youthMembers) || 0,
    primaryCommodity: party.primaryCommodity || "Rice",
    verificationStatus: party.verificationStatus || "Pending verification",
    status: party.status || "Active",
    taxId: party.taxId || "",
    establishedDate: party.establishedDate || new Date().toISOString().slice(0, 10),
    metadata: party.metadata || {},
    relationships: party.relationships || [],
    resources: party.resources || [],
    activities: party.activities || [],
    documents: party.documents || [],
    audits: party.audits || [],
    createdAt: new Date().toISOString().slice(0, 10),
  };
  const updated = [newParty, ...existing];
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEYS.PARTIES, JSON.stringify(updated));
      addStoredAudit({
        actor: "registry.clerk@moa.gov.lr",
        action: "Legal entity registered",
        entity: newParty.partyId,
        details: `${newParty.legalName} (${newParty.partyType}), ${newParty.county}; Members: ${newParty.memberCount}`,
      });
    } catch {}
  }
  return newParty;
}

export function updateStoredParty(update: Partial<MockParty> & { partyId: string }): MockParty | null {
  const existing = getStoredParties();
  let updatedParty: MockParty | null = null;
  const updated = existing.map((p) => {
    if (p.partyId === update.partyId) {
      updatedParty = {
        ...p,
        ...update,
        metadata: update.metadata !== undefined ? update.metadata : p.metadata,
        relationships: update.relationships !== undefined ? update.relationships : p.relationships,
        resources: update.resources !== undefined ? update.resources : p.resources,
        activities: update.activities !== undefined ? update.activities : p.activities,
        documents: update.documents !== undefined ? update.documents : p.documents,
        audits: update.audits !== undefined ? update.audits : p.audits,
      };
      return updatedParty;
    }
    return p;
  });
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEYS.PARTIES, JSON.stringify(updated));
    } catch {}
  }
  return updatedParty;
}

export function getStoredParcels(): MockParcel[] {
  if (typeof window === "undefined") return INITIAL_PARCELS;
  purgeLegacyMockStorage();
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PARCELS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PARCELS, JSON.stringify(INITIAL_PARCELS));
      return INITIAL_PARCELS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_PARCELS;
  }
}

export function saveStoredParcel(parcel: MockParcel): MockParcel {
  const existing = getStoredParcels();
  const updated = [parcel, ...existing];
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEYS.PARCELS, JSON.stringify(updated));
      addStoredAudit({
        actor: "gis.officer@moa.gov.lr",
        action: "Parcel boundary digitized",
        entity: parcel.parcelId,
        details: `${parcel.farmerName}, ${parcel.county}; Area: ${parcel.areaHectares} ha`,
      });
    } catch {}
  }
  return parcel;
}

export function updateStoredParcel(update: Partial<MockParcel> & { parcelId: string }): void {
  const existing = getStoredParcels();
  const updated = existing.map((p) => {
    if (p.parcelId === update.parcelId) {
      return {
        ...p,
        ...update,
        vertices: update.vertices
          ? typeof update.vertices === "string"
            ? update.vertices
            : JSON.stringify(update.vertices)
          : p.vertices,
        revision: (p.revision || 1) + 1,
      };
    }
    return p;
  });
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEYS.PARCELS, JSON.stringify(updated));
    } catch {}
  }
}

export function deleteStoredParcel(parcelId: string): void {
  const existing = getStoredParcels();
  const updated = existing.filter((p) => p.parcelId !== parcelId);
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEYS.PARCELS, JSON.stringify(updated));
      addStoredAudit({
        actor: "gis.officer@moa.gov.lr",
        action: "Parcel boundary deleted",
        entity: parcelId,
        details: `Deleted parcel ${parcelId} from spatial cadastre`,
      });
    } catch {}
  }
}

export function getStoredDeliveryItems(): MockDeliveryItem[] {
  purgeLegacyMockStorage();
  let list: MockDeliveryItem[] = INITIAL_DELIVERY_ITEMS;
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.DELIVERY);
      if (!raw) {
        localStorage.setItem(STORAGE_KEYS.DELIVERY, JSON.stringify(INITIAL_DELIVERY_ITEMS));
      } else {
        list = JSON.parse(raw);
      }
    } catch {
      list = INITIAL_DELIVERY_ITEMS;
    }
  }
  return list.map((i) => {
    let meta = i.metadata;
    if (typeof meta === "string") {
      try {
        meta = JSON.parse(meta);
      } catch {
        meta = {};
      }
    }
    return {
      ...i,
      metadata: typeof meta === "object" && meta !== null ? meta : {},
      evidence: Array.isArray(i.evidence) ? i.evidence : [],
      audit: Array.isArray(i.audit) ? i.audit : [],
    };
  });
}

export function getStoredHouseholds(): MockHousehold[] {
  if (typeof window === "undefined") return INITIAL_HOUSEHOLDS;
  purgeLegacyMockStorage();
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HOUSEHOLDS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.HOUSEHOLDS, JSON.stringify(INITIAL_HOUSEHOLDS));
      return INITIAL_HOUSEHOLDS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_HOUSEHOLDS;
  }
}

export function saveStoredHousehold(household: Partial<MockHousehold>): MockHousehold {
  const existing = getStoredHouseholds();
  const id = existing.length > 0 ? Math.max(...existing.map((h) => h.id || 0)) + 1 : 1;
  const prefix = String(household.county || "MO").slice(0, 2).toUpperCase();
  const householdId =
    household.householdId ||
    `HH-${prefix}-${new Date().getFullYear().toString().slice(-2)}-${String(id).padStart(5, "0")}`;
  const newH: MockHousehold = {
    id,
    householdId,
    representative: household.representative || "Household Representative",
    farmerDfrId: household.farmerDfrId || "",
    county: household.county || "Montserrado",
    district: household.district || "Greater Monrovia",
    community: household.community || "Central",
    members: Number(household.members) || 1,
    femaleMembers: Number(household.femaleMembers) || 0,
    youthMembers: Number(household.youthMembers) || 0,
    disabledMembers: Number(household.disabledMembers) || 0,
    dependants: Number(household.dependants) || 0,
    status: household.status || "Active",
    createdAt: new Date().toISOString().slice(0, 10),
  };
  const updated = [newH, ...existing];
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEYS.HOUSEHOLDS, JSON.stringify(updated));
      addStoredAudit({
        actor: "enumerator@moa.gov.lr",
        action: "Household registered",
        entity: newH.householdId,
        details: `${newH.representative}, ${newH.county}; Members: ${newH.members}`,
      });
    } catch {}
  }
  return newH;
}

export function updateStoredHousehold(id: number, patch: Partial<MockHousehold>): MockHousehold | null {
  const existing = getStoredHouseholds();
  let updatedH: MockHousehold | null = null;
  const updated = existing.map((h) => {
    if (h.id === id) {
      updatedH = { ...h, ...patch };
      return updatedH;
    }
    return h;
  });
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEYS.HOUSEHOLDS, JSON.stringify(updated));
    } catch {}
  }
  return updatedH;
}

export function getStoredSOPs(): MockSOP[] {
  if (typeof window === "undefined") return INITIAL_SOPS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SOPS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SOPS, JSON.stringify(INITIAL_SOPS));
      return INITIAL_SOPS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_SOPS;
  }
}

export function getStoredAudits(): MockAudit[] {
  if (typeof window === "undefined") return INITIAL_AUDITS;
  purgeLegacyMockStorage();
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AUDITS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.AUDITS, JSON.stringify(INITIAL_AUDITS));
      return INITIAL_AUDITS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_AUDITS;
  }
}

export function addStoredAudit(audit: Omit<MockAudit, "id" | "createdAt">): void {
  const existing = getStoredAudits();
  const id = existing.length > 0 ? Math.max(...existing.map((a) => a.id)) + 1 : 1;
  const newAudit: MockAudit = {
    ...audit,
    id,
    createdAt: new Date().toISOString().replace("T", " ").slice(0, 19),
  };
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEYS.AUDITS, JSON.stringify([newAudit, ...existing]));
    } catch {}
  }
}

export function getActiveRole(defaultRole = "Ministry administrator"): string {
  if (typeof window === "undefined") return defaultRole;
  try {
    return localStorage.getItem(STORAGE_KEYS.ROLE) || defaultRole;
  } catch {
    return defaultRole;
  }
}

export function setActiveRole(role: string): void {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEYS.ROLE, role);
    } catch {}
  }
}

export function getStoredVouchers(): MockVoucher[] {
  if (typeof window === "undefined") return INITIAL_VOUCHERS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.VOUCHERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.VOUCHERS, JSON.stringify(INITIAL_VOUCHERS));
      return INITIAL_VOUCHERS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(STORAGE_KEYS.VOUCHERS, JSON.stringify(INITIAL_VOUCHERS));
      return INITIAL_VOUCHERS;
    }
    return parsed;
  } catch {
    return INITIAL_VOUCHERS;
  }
}

export function saveStoredVoucher(voucher: Partial<MockVoucher>): MockVoucher {
  const existing = getStoredVouchers();
  const id = existing.length > 0 ? Math.max(...existing.map((v) => v.id)) + 1 : 1;
  const newVoucher: MockVoucher = {
    id,
    voucherCode: voucher.voucherCode || `VCH-26-${Date.now().toString().slice(-5)}`,
    farmerDfrId: voucher.farmerDfrId || "LBR-MO-000412",
    ownerEmail: voucher.ownerEmail || "tis@totaggroup.com",
    programme: voucher.programme || "Input Subsidy",
    category: voucher.category || "Certified seed & fertilizer",
    value: Number(voucher.value) || 100,
    currency: voucher.currency || "USD",
    status: "Issued",
    expiresAt: voucher.expiresAt || "2026-12-31",
    distributionSite: voucher.distributionSite || "County Agro Hub",
    appointmentAt: voucher.appointmentAt || "Pending pickup",
    receiptAcknowledged: false,
    createdAt: new Date().toISOString().replace("T", " ").slice(0, 19),
  };
  const updated = [newVoucher, ...existing];
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEYS.VOUCHERS, JSON.stringify(updated));
      addStoredAudit({
        actor: "voucher.admin@moa.gov.lr",
        action: "Voucher issued",
        entity: newVoucher.voucherCode,
        details: `Beneficiary: ${newVoucher.farmerDfrId}, Entitlement: ${newVoucher.category}, Value: ${newVoucher.currency} ${newVoucher.value}`,
      });
    } catch {}
  }
  return newVoucher;
}

export function redeemStoredVoucher(voucherCode: string): boolean {
  const existing = getStoredVouchers();
  let found = false;
  const updated = existing.map((v) => {
    if (v.voucherCode === voucherCode) {
      found = true;
      return { ...v, status: "Redeemed", redeemedAt: new Date().toISOString().replace("T", " ").slice(0, 19) };
    }
    return v;
  });
  if (typeof window !== "undefined" && found) {
    try {
      localStorage.setItem(STORAGE_KEYS.VOUCHERS, JSON.stringify(updated));
      addStoredAudit({
        actor: "distribution.officer@moa.gov.lr",
        action: "Voucher distribution confirmed",
        entity: voucherCode,
        details: "Maker-checker distribution confirmed at county depot",
      });
    } catch {}
  }
  return found;
}

export function acknowledgeStoredVoucher(voucherCode: string): boolean {
  const existing = getStoredVouchers();
  let found = false;
  const updated = existing.map((v) => {
    if (v.voucherCode === voucherCode) {
      found = true;
      return { ...v, receiptAcknowledged: true };
    }
    return v;
  });
  if (typeof window !== "undefined" && found) {
    try {
      localStorage.setItem(STORAGE_KEYS.VOUCHERS, JSON.stringify(updated));
      addStoredAudit({
        actor: "farmer@dfr.gov.lr",
        action: "Voucher receipt acknowledged",
        entity: voucherCode,
        details: "Beneficiary confirmed receipt of physical agricultural inputs",
      });
    } catch {}
  }
  return found;
}

export function getStoredBenefitAccounts(): MockPaymentAccount[] {
  if (typeof window === "undefined") return INITIAL_BENEFIT_ACCOUNTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(INITIAL_BENEFIT_ACCOUNTS));
      return INITIAL_BENEFIT_ACCOUNTS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(INITIAL_BENEFIT_ACCOUNTS));
      return INITIAL_BENEFIT_ACCOUNTS;
    }
    return parsed;
  } catch {
    return INITIAL_BENEFIT_ACCOUNTS;
  }
}

export function saveStoredBenefitAccount(acc: Partial<MockPaymentAccount>): MockPaymentAccount {
  const existing = getStoredBenefitAccounts();
  const id = existing.length > 0 ? Math.max(...existing.map((a) => a.id)) + 1 : 1;
  const raw = String(acc.accountNumberMasked || "0770000000");
  const masked = raw.length > 4 ? `${raw.slice(0, 4)}***${raw.slice(-3)}` : raw;
  const newAcc: MockPaymentAccount = {
    id,
    farmerDfrId: acc.farmerDfrId || "LBR-MO-000412",
    ownerEmail: acc.ownerEmail || "tis@totaggroup.com",
    provider: acc.provider || "MTN Mobile Money",
    accountName: acc.accountName || "Account Holder",
    accountNumberMasked: masked,
    verified: false,
    status: "Verification requested",
    accountType: acc.accountType || "Mobile money",
    createdAt: new Date().toISOString().replace("T", " ").slice(0, 19),
  };
  const updated = [newAcc, ...existing];
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(updated));
    } catch {}
  }
  return newAcc;
}

export function verifyStoredBenefitAccount(id: number, status = "Verified"): boolean {
  const existing = getStoredBenefitAccounts();
  let found = false;
  const updated = existing.map((a) => {
    if (a.id === id) {
      found = true;
      return { ...a, status, verified: status === "Verified" };
    }
    return a;
  });
  if (typeof window !== "undefined" && found) {
    try {
      localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(updated));
    } catch {}
  }
  return found;
}

export function getStoredBenefitTransactions(): MockPaymentTransaction[] {
  if (typeof window === "undefined") return INITIAL_BENEFIT_TRANSACTIONS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(INITIAL_BENEFIT_TRANSACTIONS));
      return INITIAL_BENEFIT_TRANSACTIONS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(INITIAL_BENEFIT_TRANSACTIONS));
      return INITIAL_BENEFIT_TRANSACTIONS;
    }
    return parsed;
  } catch {
    return INITIAL_BENEFIT_TRANSACTIONS;
  }
}

