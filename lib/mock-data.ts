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
  latitude: number | null;
  longitude: number | null;
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
  metadata: string;
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

const INITIAL_FARMERS: MockFarmer[] = [
  {
    id: 1,
    dfrId: "LBR-NI-000184",
    provisionalId: "PROV-NI-2600184",
    approvedDfrId: "LBR-NI-000184",
    firstName: "Kollie",
    lastName: "Flomo",
    gender: "Male",
    phone: "+231 77 555 0192",
    county: "Nimba",
    district: "Sanniquellie-Mahn",
    community: "Gbeleyee",
    crop: "Cocoa",
    farmSize: 4.8,
    status: "Verified",
    vulnerability: "Standard",
    roadAccess: "Motorable dirt road",
    roadCondition: "Fair",
    roadSeasonality: "Year-round",
    roadDistanceMiles: 1.2,
    processingAccess: "Community cooperative dryer",
    processingFacilityType: "Solar dryer & fermentary",
    processingFacilityName: "Nimba Cocoa Hub",
    processingFacilityStatus: "Operational",
    processingDistanceMiles: 2.5,
    processingTravelMinutes: 20,
    processingTransportMode: "Motorbike",
    latitude: 7.3621,
    longitude: -8.7061,
    createdAt: "2026-08-12 09:30:00",
  },
  {
    id: 2,
    dfrId: "LBR-BG-000219",
    provisionalId: "PROV-BG-2600219",
    approvedDfrId: "LBR-BG-000219",
    firstName: "Fatu",
    lastName: "Kamara",
    gender: "Female",
    phone: "+231 88 641 2309",
    county: "Bong",
    district: "Suakoko",
    community: "Phebe Valley",
    crop: "Rice – lowland paddy",
    farmSize: 3.2,
    status: "Verified",
    vulnerability: "Female head of household",
    roadAccess: "Primary paved highway access",
    roadCondition: "Good",
    roadSeasonality: "Year-round",
    roadDistanceMiles: 0.5,
    processingAccess: "CARI Central Rice Mill",
    processingFacilityType: "Integrated rice processing mill",
    processingFacilityName: "Suakoko Agro Processing Mill",
    processingFacilityStatus: "Operational",
    processingDistanceMiles: 3.0,
    processingTravelMinutes: 15,
    processingTransportMode: "Tricycle / Kehkeh",
    latitude: 6.9942,
    longitude: -9.5815,
    createdAt: "2026-08-14 11:15:00",
  },
  {
    id: 3,
    dfrId: "LBR-LF-000305",
    provisionalId: "PROV-LF-2600305",
    approvedDfrId: "LBR-LF-000305",
    firstName: "Tambaa",
    lastName: "Saa",
    gender: "Male",
    phone: "+231 77 820 4411",
    county: "Lofa",
    district: "Foya",
    community: "Mendekelema",
    crop: "Rice – upland",
    farmSize: 6.5,
    status: "Verified",
    vulnerability: "Standard",
    roadAccess: "Unpaved feeder road",
    roadCondition: "Poor in rainy season",
    roadSeasonality: "Seasonal",
    roadDistanceMiles: 3.8,
    processingAccess: "Foya Seed Bank & Thresher",
    processingFacilityType: "Mechanical Thresher",
    processingFacilityName: "Foya Cooperative Center",
    processingFacilityStatus: "Operational",
    processingDistanceMiles: 4.1,
    processingTravelMinutes: 45,
    processingTransportMode: "Foot / Bicycle",
    latitude: 8.3582,
    longitude: -10.2241,
    createdAt: "2026-08-18 14:20:00",
  },
  {
    id: 4,
    dfrId: "LBR-MO-000412",
    provisionalId: "PROV-MO-2600412",
    approvedDfrId: "",
    firstName: "Musu",
    lastName: "Sirleaf",
    gender: "Female",
    phone: "+231 88 019 9238",
    county: "Montserrado",
    district: "Careysburg",
    community: "Bensonville",
    crop: "Cassava",
    farmSize: 2.1,
    status: "Pending verification",
    vulnerability: "Youth farmer (< 35)",
    roadAccess: "Secondary gravel road",
    roadCondition: "Fair",
    roadSeasonality: "Year-round",
    roadDistanceMiles: 0.8,
    processingAccess: "Local Gari Processing Plant",
    processingFacilityType: "Gari Fryer & Grater",
    processingFacilityName: "Careysburg Women Gari Cluster",
    processingFacilityStatus: "Operational",
    processingDistanceMiles: 1.5,
    processingTravelMinutes: 15,
    processingTransportMode: "Motorbike",
    latitude: 6.4521,
    longitude: -10.6012,
    createdAt: "2026-09-01 10:05:00",
  },
  {
    id: 5,
    dfrId: "LBR-GB-000520",
    provisionalId: "PROV-GB-2600520",
    approvedDfrId: "LBR-GB-000520",
    firstName: "Emmanuel",
    lastName: "Gaye",
    gender: "Male",
    phone: "+231 77 344 7789",
    county: "Grand Bassa",
    district: "District 2",
    community: "Compound Two",
    crop: "Oil palm",
    farmSize: 8.0,
    status: "Verified",
    vulnerability: "Standard",
    roadAccess: "Laterite feeder road",
    roadCondition: "Fair",
    roadSeasonality: "Year-round",
    roadDistanceMiles: 1.5,
    processingAccess: "Community Freedom Mill",
    processingFacilityType: "Smallholder Oil Palm Mill",
    processingFacilityName: "Compound 2 Palm Processors",
    processingFacilityStatus: "Operational",
    processingDistanceMiles: 2.0,
    processingTravelMinutes: 25,
    processingTransportMode: "Motorbike",
    latitude: 6.1824,
    longitude: -9.9821,
    createdAt: "2026-08-25 15:40:00",
  },
];

const INITIAL_PARTIES: MockParty[] = [
  {
    id: 1,
    partyId: "ORG-COOP-00041",
    partyType: "Cooperative",
    legalName: "Nimba Cocoa Smallholder Farmers Multipurpose Cooperative",
    acronym: "NCS-COOP",
    legalForm: "Registered Cooperative Society",
    registrationNumber: "CDA-COOP-2018-092",
    representativeName: "Kollie Flomo",
    phone: "+231 77 555 0192",
    email: "info@nimbacocoa.org.lr",
    county: "Nimba",
    district: "Sanniquellie-Mahn",
    community: "Sanniquellie",
    memberCount: 340,
    womenMembers: 145,
    youthMembers: 98,
    primaryCommodity: "Cocoa",
    verificationStatus: "Verified",
    status: "Active",
    createdAt: "2026-07-10",
  },
  {
    id: 2,
    partyId: "ORG-GRP-00072",
    partyType: "Producer organization",
    legalName: "Bong Central Rice Farmers Association",
    acronym: "BC-RICE",
    legalForm: "Registered Farmers Association",
    registrationNumber: "MOA-RFA-2021-043",
    representativeName: "Fatu Kamara",
    phone: "+231 88 641 2309",
    email: "contact@bongricefarmers.lr",
    county: "Bong",
    district: "Suakoko",
    community: "Suakoko Central",
    memberCount: 215,
    womenMembers: 130,
    youthMembers: 72,
    primaryCommodity: "Rice – lowland paddy",
    verificationStatus: "Verified",
    status: "Active",
    createdAt: "2026-07-18",
  },
  {
    id: 3,
    partyId: "ORG-AGR-00018",
    partyType: "Agribusiness",
    legalName: "Liberia Palm Outgrower & Processing Enterprise",
    acronym: "LPOPE",
    legalForm: "Corporation",
    registrationNumber: "MOCI-CORP-2019-110",
    representativeName: "Jerome Weah",
    phone: "+231 77 900 1234",
    email: "ops@liberiapalm.com.lr",
    county: "Grand Bassa",
    district: "District 2",
    community: "Buchanan",
    memberCount: 520,
    womenMembers: 200,
    youthMembers: 180,
    primaryCommodity: "Oil palm",
    verificationStatus: "Verified",
    status: "Active",
    createdAt: "2026-08-01",
  },
];

const INITIAL_PARCELS: MockParcel[] = [
  {
    id: 1,
    parcelId: "PCL-NI-00184-01",
    farmerDfrId: "LBR-NI-000184",
    farmerName: "Kollie Flomo",
    county: "Nimba",
    district: "Sanniquellie-Mahn",
    commodity: "Cocoa",
    vertices: JSON.stringify([
      [7.3621, -8.7061],
      [7.3635, -8.7048],
      [7.3618, -8.7032],
      [7.3604, -8.7050],
      [7.3621, -8.7061],
    ]),
    areaHectares: 4.8,
    areaAcres: 11.86,
    perimeterMeters: 890,
    centroidLat: 7.362,
    centroidLng: -8.7048,
    gpsAccuracy: 3.2,
    geometryStatus: "VERIFIED",
    revision: 1,
    verifiedBy: "gis.officer@moa.gov.lr",
    verifiedAt: "2026-08-15 14:00:00",
    createdAt: "2026-08-12",
  },
  {
    id: 2,
    parcelId: "PCL-BG-00219-01",
    farmerDfrId: "LBR-BG-000219",
    farmerName: "Fatu Kamara",
    county: "Bong",
    district: "Suakoko",
    commodity: "Rice – lowland paddy",
    vertices: JSON.stringify([
      [6.9942, -9.5815],
      [6.9958, -9.5802],
      [6.9949, -9.5788],
      [6.9932, -9.5801],
      [6.9942, -9.5815],
    ]),
    areaHectares: 3.2,
    areaAcres: 7.91,
    perimeterMeters: 740,
    centroidLat: 6.9945,
    centroidLng: -9.5801,
    gpsAccuracy: 2.8,
    geometryStatus: "VERIFIED",
    revision: 1,
    verifiedBy: "gis.officer@moa.gov.lr",
    verifiedAt: "2026-08-16 10:20:00",
    createdAt: "2026-08-14",
  },
  {
    id: 3,
    parcelId: "PCL-LF-00305-01",
    farmerDfrId: "LBR-LF-000305",
    farmerName: "Tambaa Saa",
    county: "Lofa",
    district: "Foya",
    commodity: "Rice – upland",
    vertices: JSON.stringify([
      [8.3582, -10.2241],
      [8.3601, -10.2223],
      [8.3589, -10.2201],
      [8.3568, -10.2219],
      [8.3582, -10.2241],
    ]),
    areaHectares: 6.5,
    areaAcres: 16.06,
    perimeterMeters: 1080,
    centroidLat: 8.3585,
    centroidLng: -10.2221,
    gpsAccuracy: 3.5,
    geometryStatus: "VERIFIED",
    revision: 1,
    verifiedBy: "gis.officer@moa.gov.lr",
    verifiedAt: "2026-08-20 16:30:00",
    createdAt: "2026-08-18",
  },
];

const INITIAL_DELIVERY_ITEMS: MockDeliveryItem[] = [
  {
    id: 1,
    reference: "FAO-C1-001",
    component: 1,
    workstream: "Institutional Assessment & Governance",
    title: "National Agricultural Registry Governance Framework & Charter",
    description: "Multi-stakeholder governance charter for MoA, LISGIS, MGCSP, and county authorities.",
    owner: "Governance Lead",
    county: "National",
    dueDate: "2026-09-30",
    status: "Completed",
    acceptanceStatus: "Accepted",
    metadata: "{}",
  },
  {
    id: 2,
    reference: "FAO-C2-003",
    component: 2,
    workstream: "System Architecture & Software",
    title: "DFR Core Application & Offline Sync Engine",
    description: "Production release of the DFR web and field registration software with GIS capabilities.",
    owner: "Lead Systems Architect",
    county: "National",
    dueDate: "2026-10-15",
    status: "In progress",
    acceptanceStatus: "Submitted for review",
    metadata: "{}",
  },
  {
    id: 3,
    reference: "FAO-C3-005",
    component: 3,
    workstream: "Geospatial & Field Mapping",
    title: "Parcel Geometry Validation & Coordinate Reference System Module",
    description: "Integration of LISGIS geospatial standards, boundary verification, and area calculation.",
    owner: "GIS Specialist",
    county: "National",
    dueDate: "2026-10-30",
    status: "Completed",
    acceptanceStatus: "Accepted",
    metadata: "{}",
  },
  {
    id: 4,
    reference: "FAO-C4-006",
    component: 4,
    workstream: "Standard Operating Procedures",
    title: "Standard Operating Procedures (SOP 01 to SOP 11) Manual",
    description: "Complete operational manual for field enumeration, data quality, security, and benefits delivery.",
    owner: "Operations & SOP Specialist",
    county: "National",
    dueDate: "2026-11-15",
    status: "In progress",
    acceptanceStatus: "Under review",
    metadata: "{}",
  },
  {
    id: 5,
    reference: "FAO-C5-007",
    component: 5,
    workstream: "Capacity Building & Training",
    title: "County Agricultural Officers & Enumerator Training Curriculum",
    description: "Training materials, field practicals, and certification protocols across 15 counties.",
    owner: "Capacity Development Lead",
    county: "National",
    dueDate: "2026-11-30",
    status: "Planned",
    acceptanceStatus: "Draft ready",
    metadata: "{}",
  },
];

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

const INITIAL_AUDITS: MockAudit[] = [
  {
    id: 1,
    actor: "system.init@moa.gov.lr",
    action: "National Registry Initialized",
    entity: "Liberia DFR Platform",
    details: "Initialized DFR platform supporting 15 counties and 24 role workspaces.",
    createdAt: "2026-08-01 08:00:00",
  },
  {
    id: 2,
    actor: "tis@totaggroup.com",
    action: "Provisional registration created",
    entity: "PROV-MO-2600412",
    details: "Ministry administrator: Musu Sirleaf, Montserrado; official DFR ID pending approval",
    createdAt: "2026-09-01 10:05:00",
  },
  {
    id: 3,
    actor: "gis.officer@moa.gov.lr",
    action: "GIS parcel geometry verified",
    entity: "PCL-NI-00184-01",
    details: "Verified polygon boundary for Kollie Flomo (4.8 ha, Nimba County).",
    createdAt: "2026-08-15 14:00:00",
  },
];

const STORAGE_KEYS = {
  FARMERS: "dfr_farmers_store_v1",
  PARTIES: "dfr_parties_store_v1",
  PARCELS: "dfr_parcels_store_v1",
  DELIVERY: "dfr_delivery_store_v1",
  SOPS: "dfr_sops_store_v1",
  AUDITS: "dfr_audits_store_v1",
  ROLE: "dfr_active_role_v1",
};

export function getStoredFarmers(): MockFarmer[] {
  if (typeof window === "undefined") return INITIAL_FARMERS;
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

export function getStoredParties(): MockParty[] {
  if (typeof window === "undefined") return INITIAL_PARTIES;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PARTIES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PARTIES, JSON.stringify(INITIAL_PARTIES));
      return INITIAL_PARTIES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_PARTIES;
  }
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
    primaryCommodity: party.primaryCommodity || "Multi-commodity",
    verificationStatus: party.verificationStatus || "Pending verification",
    status: party.status || "Active",
    taxId: party.taxId || "",
    establishedDate: party.establishedDate || "",
    metadata: party.metadata || {},
    relationships: Array.isArray(party.relationships) ? party.relationships : [],
    resources: Array.isArray(party.resources) ? party.resources : [],
    activities: Array.isArray(party.activities) ? party.activities : [],
    documents: Array.isArray(party.documents) ? party.documents : [],
    audits: [
      {
        id: 1,
        actor: "registry.officer@moa.gov.lr",
        action: "Organization registered",
        details: `Initial enrollment into National Party Registry. Classification: ${party.partyType || "Cooperative"}`,
        createdAt: new Date().toISOString().replace("T", " ").slice(0, 19),
      },
    ],
    createdAt: new Date().toISOString().slice(0, 10),
  };
  const updated = [newParty, ...existing];
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEYS.PARTIES, JSON.stringify(updated));
      addStoredAudit({
        actor: "registry.officer@moa.gov.lr",
        action: "Organization registered",
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
      updatedParty = { ...p, ...update };
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

export function getStoredDeliveryItems(): MockDeliveryItem[] {
  if (typeof window === "undefined") return INITIAL_DELIVERY_ITEMS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DELIVERY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.DELIVERY, JSON.stringify(INITIAL_DELIVERY_ITEMS));
      return INITIAL_DELIVERY_ITEMS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_DELIVERY_ITEMS;
  }
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
