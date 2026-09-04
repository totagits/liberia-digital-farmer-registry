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
    photoUrl: "assets/cocoa-farmers.jpg",
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
    photoUrl: "assets/rice-farmers.jpg",
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
    taxId: "LRA-TIN-882194",
    establishedDate: "2018-03-15",
    metadata: { accreditation: "CDA Tier-1", certification: "Fairtrade Certified", exportLicense: "LACRA-EXP-2024" },
    relationships: [
      { id: 101, fromPartyId: "ORG-COOP-00041", toPartyId: "LBR-NI-000184", relationshipType: "Member Farmer", roleTitle: "Cocoa Outgrower", status: "Active" },
      { id: 102, fromPartyId: "ORG-COOP-00041", toPartyId: "ORG-AGR-00018", relationshipType: "Off-taker Agreement", roleTitle: "Supply Partner", status: "Active" },
    ],
    resources: [
      { id: 201, resourceType: "Facility", name: "Sanniquellie Central Solar Cocoa Dryer", category: "Processing Facility", quantity: 1, unit: "Unit", capacity: "25 MT / cycle", county: "Nimba", status: "Operational" },
      { id: 202, resourceType: "Warehouse", name: "Nimba Cocoa Aggregation Shed", category: "Storage", quantity: 1, unit: "Facility", capacity: "120 MT", county: "Nimba", status: "Operational" },
      { id: 203, resourceType: "Equipment", name: "Motorized Bean Sorting & Grading Machine", category: "Post-Harvest Equipment", quantity: 3, unit: "Sets", capacity: "1.5 MT / hr", county: "Nimba", status: "Operational" },
    ],
    activities: [
      { id: 301, activityType: "Produce Aggregation", programme: "Tree Crop Rehabilitation Facility", commodity: "Cocoa", volume: 45, unit: "Metric Tons", value: 135000, currency: "USD", counterparty: "Liberia Cocoa Outgrowers Union", activityDate: "2026-08-10", status: "Completed" },
      { id: 302, activityType: "Input Distribution", programme: "EUDR Traceability Support", commodity: "Cocoa Clonal Seedlings", volume: 12000, unit: "Seedlings", value: 18000, currency: "USD", counterparty: "Member Farmers", activityDate: "2026-08-22", status: "Completed" },
    ],
    documents: [
      { id: 401, documentType: "Cooperative Registration Certificate", documentNumber: "CDA-COOP-2018-092", issuedBy: "Cooperative Development Agency", expiryDate: "2027-12-31", verificationStatus: "Verified", fileName: "CDA_Certificate_NCS_COOP.pdf" },
      { id: 402, documentType: "Tax Clearance Certificate", documentNumber: "LRA-TCC-2026-0412", issuedBy: "Liberia Revenue Authority", expiryDate: "2026-12-31", verificationStatus: "Verified", fileName: "LRA_Tax_Clearance_2026.pdf" },
    ],
    audits: [
      { id: 501, actor: "cda.registrar@cda.gov.lr", action: "Cooperative society accredited", details: "Official verification of bylaws and member register by Cooperative Development Agency.", createdAt: "2026-07-10 10:00:00" },
    ],
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
    taxId: "LRA-TIN-771203",
    establishedDate: "2021-05-20",
    metadata: { accreditation: "MOA Registered Association", mechanizationCluster: "Suakoko Hub" },
    relationships: [
      { id: 103, fromPartyId: "ORG-GRP-00072", toPartyId: "LBR-BG-000219", relationshipType: "Member Farmer", roleTitle: "Rice Farmer", status: "Active" },
    ],
    resources: [
      { id: 204, resourceType: "Mill", name: "CARI Outgrower Paddy Thresher", category: "Processing", quantity: 2, unit: "Machines", capacity: "2 MT / hr", county: "Bong", status: "Operational" },
      { id: 205, resourceType: "Tractor", name: "Kubota Power Tiller Cluster", category: "Mechanization", quantity: 4, unit: "Tillers", capacity: "8 ha / day", county: "Bong", status: "Operational" },
    ],
    activities: [
      { id: 303, activityType: "Paddy Milling", programme: "National Rice Self-Sufficiency Subsidy", commodity: "Rice – lowland paddy", volume: 60, unit: "Metric Tons", value: 48000, currency: "USD", counterparty: "Suakoko Agro Hub", activityDate: "2026-08-15", status: "Completed" },
    ],
    documents: [
      { id: 403, documentType: "Association Registration", documentNumber: "MOA-RFA-2021-043", issuedBy: "Ministry of Agriculture", expiryDate: "2028-06-30", verificationStatus: "Verified", fileName: "MOA_RFA_Registration.pdf" },
    ],
    audits: [
      { id: 502, actor: "cao.bong@moa.gov.lr", action: "Association profile verified", details: "Field audit of member registry and mechanization assets conducted in Suakoko.", createdAt: "2026-07-18 14:30:00" },
    ],
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
    taxId: "LRA-TIN-901452",
    establishedDate: "2019-09-12",
    metadata: { companyType: "Commercial Agro-Enterprise", millType: "Medium Oil Palm Mill" },
    relationships: [
      { id: 104, fromPartyId: "ORG-AGR-00018", toPartyId: "LBR-GB-000520", relationshipType: "Outgrower Contract", roleTitle: "Smallholder Supplier", status: "Active" },
    ],
    resources: [
      { id: 206, resourceType: "Processing Plant", name: "Buchanan Fresh Fruit Bunch (FFB) Mill", category: "Processing Facility", quantity: 1, unit: "Plant", capacity: "5 MT FFB / hr", county: "Grand Bassa", status: "Operational" },
      { id: 207, resourceType: "Vehicle", name: "FFB Collection Haulage Trucks", category: "Logistics", quantity: 3, unit: "Trucks", capacity: "10 MT each", county: "Grand Bassa", status: "Operational" },
    ],
    activities: [
      { id: 304, activityType: "Crude Palm Oil (CPO) Offtake", programme: "Smallholder Palm Commercialization", commodity: "Oil palm", volume: 180, unit: "Metric Tons", value: 162000, currency: "USD", counterparty: "Monrovia Industrial Refineries", activityDate: "2026-08-28", status: "Completed" },
    ],
    documents: [
      { id: 404, documentType: "Article of Incorporation", documentNumber: "MOCI-CORP-2019-110", issuedBy: "Ministry of Commerce and Industry", expiryDate: "2029-09-12", verificationStatus: "Verified", fileName: "MOCI_Incorporation_LPOPE.pdf" },
    ],
    audits: [
      { id: 503, actor: "registrar@moci.gov.lr", action: "Enterprise compliance approved", details: "Corporate filings and environmental permit verified for Buchanan extraction facility.", createdAt: "2026-08-01 11:15:00" },
    ],
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

const INITIAL_DELIVERY_ITEMS: MockDeliveryItem[] = [
  {
    id: 1,
    reference: "FAO-C1-001",
    component: 1,
    workstream: "Inception & planning",
    title: "National Agricultural Registry Inception Report & Governance Charter",
    description: "Multi-stakeholder governance charter for MoA, LISGIS, MGCSP, and county authorities with aligned scope and roadmap.",
    owner: "Team Leader / Registry Specialist",
    county: "National",
    dueDate: "2026-09-15",
    status: "Completed",
    acceptanceStatus: "Accepted",
    metadata: {
      deliverableNumber: "D1",
      institution: "Ministry of Agriculture / FAO",
      reviewer: "FAO Quality Assurance Team",
      approver: "National Steering Committee",
      startDate: "2026-08-01",
      progress: 100,
      version: "1.0",
      dependencies: "Contract mobilization",
      risks: "None identified",
      priority: "High",
      acceptanceCriteria: "Formal sign-off by MoA and FAO confirming aligned scope and resource allocation.",
      decisionNotes: "Approved unconditionally by National Steering Committee.",
      acceptedAt: "2026-09-02",
      acceptedBy: "National Steering Committee",
      history: [
        { at: "2026-09-02T10:00:00Z", actor: "Steering Committee", role: "Approver", action: "Accepted", notes: "All baseline requirements satisfied." },
      ],
    },
    evidence: [
      { id: 1, fileName: "FAO_RFP_137641_Inception_Report_Final_v1.0.pdf", mimeType: "application/pdf", size: 4820000, uploadedBy: "Team Leader", createdAt: "2026-09-01" },
      { id: 2, fileName: "Signed_Institutional_Governance_Charter.pdf", mimeType: "application/pdf", size: 2150000, uploadedBy: "Governance Lead", createdAt: "2026-09-02" },
    ],
    audit: [
      { id: 1, actor: "fao.qa@fao.org", action: "Deliverable Accepted", details: "D1 Inception Report approved and formally accepted.", createdAt: "2026-09-02 10:00:00" },
    ],
  },
  {
    id: 2,
    reference: "FAO-C1-002",
    component: 1,
    workstream: "Assessment & gap analysis",
    title: "Institutional, Legal, Data & Technical Assessment Report",
    description: "Assessment of existing agricultural registries, MIS initiatives, data privacy regulations and interoperability readiness across 15 counties.",
    owner: "Institutional Governance Lead",
    county: "National",
    dueDate: "2026-09-30",
    status: "Completed",
    acceptanceStatus: "Accepted",
    metadata: {
      deliverableNumber: "D2",
      institution: "MoA / LISGIS / MGCSP",
      reviewer: "Legal & Regulatory Working Group",
      approver: "Lead Systems Architect",
      startDate: "2026-08-15",
      progress: 100,
      version: "1.0",
      dependencies: "D1 Inception Report",
      risks: "Inter-agency data agreement alignment",
      priority: "High",
      acceptanceCriteria: "Approved gap analysis and institutional inventory covering 15 counties.",
      decisionNotes: "Passed validation by data governance working group.",
      acceptedAt: "2026-09-03",
      acceptedBy: "Director General, LISGIS",
      history: [
        { at: "2026-09-03T11:30:00Z", actor: "LISGIS DG", role: "Reviewer", action: "Accepted", notes: "Meets national spatial and statistical standards." },
      ],
    },
    evidence: [
      { id: 3, fileName: "DFR_Institutional_Legal_Gap_Assessment_v1.0.pdf", mimeType: "application/pdf", size: 6150000, uploadedBy: "Governance Lead", createdAt: "2026-09-02" },
    ],
    audit: [
      { id: 2, actor: "lisgis.dg@lisgis.gov.lr", action: "Deliverable Accepted", details: "D2 Institutional Assessment formally signed off.", createdAt: "2026-09-03 11:30:00" },
    ],
  },
  {
    id: 3,
    reference: "FAO-C2-003",
    component: 2,
    workstream: "Solution design",
    title: "DFR System Architecture, Data Model & Security Design Document",
    description: "Production release of the DFR web and field registration software design with LADM parcel geometry and offline sync capabilities.",
    owner: "Lead Systems Architect",
    county: "National",
    dueDate: "2026-10-15",
    status: "In progress",
    acceptanceStatus: "Under review",
    metadata: {
      deliverableNumber: "D3",
      institution: "Ministry of Agriculture",
      reviewer: "LISGIS Cartography & IT Directorate",
      approver: "National Steering Committee",
      startDate: "2026-08-20",
      progress: 92,
      version: "0.9",
      dependencies: "D2 Assessment Report",
      risks: "Offline boundary encryption on field tablets",
      priority: "Critical",
      acceptanceCriteria: "Validation of data dictionary, API specifications and encryption standards.",
      decisionNotes: "Submitted for formal technical review.",
      history: [
        { at: "2026-09-03T14:00:00Z", actor: "Lead Architect", role: "Owner", action: "Submitted for review", notes: "Updated with LADM cadastre specs and SHA-256 consent signatures." },
      ],
    },
    evidence: [
      { id: 4, fileName: "DFR_System_Architecture_Security_Specification_v0.9.pdf", mimeType: "application/pdf", size: 8400000, uploadedBy: "Lead Systems Architect", createdAt: "2026-09-03" },
      { id: 5, fileName: "DFR_LADM_Data_Dictionary_Export.xlsx", mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", size: 980000, uploadedBy: "Database Engineer", createdAt: "2026-09-03" },
    ],
    audit: [
      { id: 3, actor: "architect@totaggroup.com", action: "Submitted for Review", details: "D3 architectural document submitted to technical working group.", createdAt: "2026-09-03 14:00:00" },
    ],
  },
  {
    id: 4,
    reference: "FAO-C3-004",
    component: 3,
    workstream: "SOPs & institutional operations",
    title: "Standard Operating Procedures (SOP 01 to SOP 11) Manual",
    description: "Complete operational manual for field enumeration, data quality, security, and benefits delivery validated across institutions.",
    owner: "Operations & SOP Specialist",
    county: "National",
    dueDate: "2026-10-31",
    status: "In progress",
    acceptanceStatus: "Under review",
    metadata: {
      deliverableNumber: "D4",
      institution: "MoA / CDA / Extension Directorate",
      reviewer: "County Agricultural Officers Panel",
      approver: "Minister of Agriculture",
      startDate: "2026-08-25",
      progress: 88,
      version: "0.8",
      dependencies: "D3 Architecture Document",
      risks: "Harmonization across 15 county agricultural offices",
      priority: "High",
      acceptanceCriteria: "Validation of 11 operational SOPs with field checklists.",
      decisionNotes: "Draft circulating among County Agricultural Officers.",
      history: [
        { at: "2026-09-02T16:00:00Z", actor: "Operations Specialist", role: "Owner", action: "Submitted for review", notes: "SOP 01 through SOP 11 complete." },
      ],
    },
    evidence: [
      { id: 6, fileName: "DFR_National_SOP_Manual_11_Modules_v0.8.docx", mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", size: 3200000, uploadedBy: "Operations Specialist", createdAt: "2026-09-02" },
    ],
    audit: [
      { id: 4, actor: "ops.lead@moa.gov.lr", action: "SOP Manual Submitted", details: "11 SOP modules submitted for institutional endorsement.", createdAt: "2026-09-02 16:00:00" },
    ],
  },
  {
    id: 5,
    reference: "FAO-C4-005",
    component: 4,
    workstream: "Platform implementation",
    title: "Production DFR Software Platform & Offline Mobile Sync Engine",
    description: "Functional platform, interface mappings, exchange tests and integration evidence deployed on cloud infrastructure.",
    owner: "Senior Software Engineer",
    county: "National",
    dueDate: "2026-11-15",
    status: "In progress",
    acceptanceStatus: "Under review",
    metadata: {
      deliverableNumber: "D5",
      institution: "IT Directorate / TOTAG",
      reviewer: "FAO Independent Technical Reviewer",
      approver: "National Steering Committee",
      startDate: "2026-08-10",
      progress: 82,
      version: "0.8",
      dependencies: "D3 Architecture & D4 SOPs",
      risks: "Low bandwidth connectivity in southeastern counties",
      priority: "Critical",
      acceptanceCriteria: "Passing automated tests and offline PWA field synchronization.",
      decisionNotes: "Cloud staging environment online and operational.",
      history: [
        { at: "2026-09-03T18:00:00Z", actor: "Lead Developer", role: "Owner", action: "Submitted for review", notes: "Interactive web dashboard, GIS cadastre, and offline sync live." },
      ],
    },
    evidence: [
      { id: 7, fileName: "DFR_Software_Release_Notes_v0.8_Staging.pdf", mimeType: "application/pdf", size: 1900000, uploadedBy: "Senior Software Engineer", createdAt: "2026-09-03" },
    ],
    audit: [
      { id: 5, actor: "dev.lead@totaggroup.com", action: "Software Release Staged", details: "Version 0.8 staged for review and verification testing.", createdAt: "2026-09-03 18:00:00" },
    ],
  },
];

const INITIAL_HOUSEHOLDS: MockHousehold[] = [
  {
    id: 1,
    householdId: "HH-NI-26-00104",
    representative: "Kollie Flomo",
    farmerDfrId: "LBR-NI-000184",
    county: "Nimba",
    district: "Sanniquellie-Mahn",
    community: "Gbeleyee",
    members: 6,
    femaleMembers: 3,
    youthMembers: 2,
    disabledMembers: 0,
    dependants: 4,
    status: "Active",
    createdAt: "2026-08-12",
  },
  {
    id: 2,
    householdId: "HH-BG-26-00215",
    representative: "Fatu Kamara",
    farmerDfrId: "LBR-BG-000219",
    county: "Bong",
    district: "Suakoko",
    community: "Phebe Valley",
    members: 5,
    femaleMembers: 4,
    youthMembers: 1,
    disabledMembers: 0,
    dependants: 3,
    status: "Active",
    createdAt: "2026-08-14",
  },
  {
    id: 3,
    householdId: "HH-LF-26-00301",
    representative: "Tambaa Saa",
    farmerDfrId: "LBR-LF-000305",
    county: "Lofa",
    district: "Foya",
    community: "Mendekelema",
    members: 8,
    femaleMembers: 4,
    youthMembers: 3,
    disabledMembers: 1,
    dependants: 5,
    status: "Active",
    createdAt: "2026-08-18",
  },
  {
    id: 4,
    householdId: "HH-MO-26-00408",
    representative: "Musu Sirleaf",
    farmerDfrId: "LBR-MO-000412",
    county: "Montserrado",
    district: "Careysburg",
    community: "Bensonville",
    members: 4,
    femaleMembers: 3,
    youthMembers: 2,
    disabledMembers: 0,
    dependants: 2,
    status: "Pending verification",
    createdAt: "2026-09-01",
  },
  {
    id: 5,
    householdId: "HH-GB-26-00512",
    representative: "Emmanuel Gaye",
    farmerDfrId: "LBR-GB-000520",
    county: "Grand Bassa",
    district: "District 2",
    community: "Compound Two",
    members: 7,
    femaleMembers: 3,
    youthMembers: 2,
    disabledMembers: 0,
    dependants: 4,
    status: "Active",
    createdAt: "2026-08-25",
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
  HOUSEHOLDS: "dfr_households_store_v1",
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
