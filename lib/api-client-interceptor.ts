// Client-side API interceptor for GitHub Pages and offline execution.
// Intercepts /api/* fetch requests when backend server is absent or returns 404,
// routing them transparently to the client-side persistent mock store.

import {
  getStoredFarmers,
  saveStoredFarmer,
  updateStoredFarmer,
  getStoredParties,
  saveStoredParty,
  updateStoredParty,
  getStoredParcels,
  saveStoredParcel,
  updateStoredParcel,
  getStoredDeliveryItems,
  getStoredSOPs,
  getStoredAudits,
  addStoredAudit,
  MockFarmer,
  MockParcel,
} from "./mock-data";

let isInstalled = false;

export function installClientApiInterceptor(): void {
  if (typeof window === "undefined" || isInstalled) return;
  isInstalled = true;

  const originalFetch = window.fetch;

  window.fetch = async function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const urlString = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;

    // Only intercept /api/ calls
    if (urlString.includes("/api/")) {
      try {
        const response = await originalFetch(input, init);
        // If server returned ok, use real response
        if (response.ok) return response;
        // If 404/500 or error on static host, fall through to client mock
      } catch (err) {
        // Network unavailable or static host without backend
      }

      // Handle client-side mock routing
      const mockResponse = handleMockApi(urlString, init);
      if (mockResponse) return mockResponse;
    }

    return originalFetch(input, init);
  };
}

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function handleMockApi(url: string, init?: RequestInit): Response | null {
  const method = (init?.method || "GET").toUpperCase();
  const parsedUrl = new URL(url, "http://localhost");
  let pathname = parsedUrl.pathname;
  if (pathname.startsWith("/liberia-digital-farmer-registry")) {
    pathname = pathname.replace("/liberia-digital-farmer-registry", "");
  }

  // 1. Farmers API: /api/farmers
  if (pathname === "/api/farmers" || pathname.startsWith("/api/farmers/")) {
    const parts = pathname.split("/").filter(Boolean);
    const lastPart = parts[parts.length - 1];
    const maybeId = Number(lastPart);

    if (method === "GET") {
      if (!isNaN(maybeId) && maybeId > 0 && lastPart !== "farmers") {
        const farmer = getStoredFarmers().find((f) => f.id === maybeId);
        if (farmer) return jsonResponse(farmer);
        return jsonResponse({ error: "Farmer not found" }, 404);
      }
      const q = (parsedUrl.searchParams.get("q") || "").toLowerCase().trim();
      const all = getStoredFarmers();
      const filtered = q
        ? all.filter(
            (f) =>
              f.firstName.toLowerCase().includes(q) ||
              f.lastName.toLowerCase().includes(q) ||
              f.county.toLowerCase().includes(q) ||
              f.dfrId.toLowerCase().includes(q) ||
              f.crop.toLowerCase().includes(q)
          )
        : all;
      return jsonResponse(filtered);
    }

    if (method === "POST" && init?.body) {
      try {
        const body = JSON.parse(init.body as string);
        const prefix = String(body.county || "MO").slice(0, 2).toUpperCase();
        const randId = Date.now().toString().slice(-6);
        const provisionalId = `PROV-${prefix}-${randId}`;
        const newRecord = saveStoredFarmer({
          dfrId: provisionalId,
          provisionalId,
          approvedDfrId: "",
          firstName: body.firstName || "Farmer",
          lastName: body.lastName || "Record",
          gender: body.gender || "Female",
          phone: body.phone || "+231 77 000 0000",
          county: body.county || "Montserrado",
          district: body.district || "Greater Monrovia",
          community: body.community || "Central",
          crop: body.crop || "Cassava",
          farmSize: Number(body.farmSize || 1.5),
          status: "Pending verification",
          vulnerability: body.vulnerability || "Standard",
          roadAccess: body.roadAccess || "Paved road",
          roadCondition: body.roadCondition || "Good",
          roadSeasonality: body.roadSeasonality || "Year-round",
          roadDistanceMiles: Number(body.roadDistanceMiles || 0.5),
          processingAccess: body.processingAccess || "Local cooperative mill",
          processingFacilityType: body.processingFacilityType || "Small mill",
          processingFacilityName: body.processingFacilityName || "Community Agro Hub",
          processingFacilityStatus: "Operational",
          processingDistanceMiles: Number(body.processingDistanceMiles || 1.0),
          processingTravelMinutes: Number(body.processingTravelMinutes || 15),
          processingTransportMode: body.processingTransportMode || "Motorbike",
          latitude: body.latitude ? Number(body.latitude) : 6.42,
          longitude: body.longitude ? Number(body.longitude) : -9.43,
        });
        return jsonResponse(newRecord, 201);
      } catch {
        return jsonResponse({ error: "Invalid farmer registration payload." }, 400);
      }
    }

    if (method === "PATCH") {
      let body: any = {};
      try {
        body = typeof init?.body === "string" ? JSON.parse(init.body) : init?.body || {};
      } catch {}
      if (!isNaN(maybeId) && maybeId > 0) {
        const updated = updateStoredFarmer(maybeId, body);
        return jsonResponse({ ok: true, success: true, farmer: updated });
      }
      return jsonResponse({ ok: true, success: true, status: body.status || "Verified" });
    }
  }

  // 2. Audit API: /api/audit
  if (pathname === "/api/audit") {
    return jsonResponse(getStoredAudits());
  }

  // 3. Parties API: /api/parties
  if (pathname === "/api/parties/records" && method === "POST" && init?.body) {
    try {
      const body = typeof init.body === "string" ? JSON.parse(init.body) : init.body;
      const parties = getStoredParties();
      const p = parties.find((x) => x.partyId === body.partyId);
      if (p) {
        if (body.recordType === "relationship") {
          p.relationships = p.relationships || [];
          p.relationships.push({ id: Date.now(), ...body, status: "Active" });
        } else if (body.recordType === "resource") {
          p.resources = p.resources || [];
          p.resources.push({ id: Date.now(), ...body, status: "Active" });
        } else if (body.recordType === "activity") {
          p.activities = p.activities || [];
          p.activities.push({ id: Date.now(), ...body, status: "Recorded" });
        } else if (body.recordType === "document") {
          p.documents = p.documents || [];
          p.documents.push({ id: Date.now(), ...body, verificationStatus: "Pending" });
        }
        updateStoredParty(p);
      }
      return jsonResponse({ success: true }, 201);
    } catch {
      return jsonResponse({ success: true }, 201);
    }
  }

  if (pathname === "/api/parties" || pathname.startsWith("/api/parties/")) {
    if (method === "GET") {
      return jsonResponse(getStoredParties());
    }
    if (method === "POST" && init?.body) {
      try {
        const body = typeof init.body === "string" ? JSON.parse(init.body) : init.body;
        const newParty = saveStoredParty(body);
        return jsonResponse(newParty, 201);
      } catch (err) {
        return jsonResponse({ error: "Invalid party registration data" }, 400);
      }
    }
    if (method === "PATCH" && init?.body) {
      try {
        const body = typeof init.body === "string" ? JSON.parse(init.body) : init.body;
        if (body.partyId) {
          updateStoredParty(body);
        }
        return jsonResponse({ success: true });
      } catch {
        return jsonResponse({ success: true });
      }
    }
  }

  // 4. GIS Parcels API: /api/parcels
  if (pathname === "/api/parcels") {
    if (method === "GET") {
      const parcels = getStoredParcels().map((p) => {
        let v = p.vertices;
        if (typeof v === "string") {
          try {
            v = JSON.parse(v);
          } catch {
            v = [];
          }
        }
        let q = (p as any).qualityFlags;
        if (typeof q === "string") {
          try {
            q = JSON.parse(q);
          } catch {
            q = [];
          }
        }
        return {
          ...p,
          vertices: Array.isArray(v) ? v : [],
          qualityFlags: Array.isArray(q) ? q : [],
        };
      });
      return jsonResponse(parcels);
    }
    if (method === "POST" && init?.body) {
      const body = JSON.parse(init.body as string);
      const newPcl: MockParcel = {
        id: Date.now(),
        parcelId: body.parcelId || `PCL-${String(body.county || "MO").slice(0, 2).toUpperCase()}-${Date.now().toString().slice(-6)}`,
        farmerDfrId: body.farmerDfrId || "",
        farmerName: body.farmerName || "Registered Farmer",
        county: body.county || "Montserrado",
        district: body.district || "District 1",
        commodity: body.commodity || "Cassava",
        vertices: typeof body.vertices === "string" ? body.vertices : JSON.stringify(body.vertices || []),
        areaHectares: Number(body.areaHectares) || 2.5,
        areaAcres: Number(body.areaAcres) || 6.18,
        perimeterMeters: Number(body.perimeterMeters) || 600,
        centroidLat: Number(body.centroidLat) || 6.42,
        centroidLng: Number(body.centroidLng) || -9.43,
        gpsAccuracy: Number(body.gpsAccuracy) || 4.5,
        geometryStatus: body.geometryStatus || "FIELD_VERIFIED",
        revision: 1,
        verifiedBy: "gis.officer@moa.gov.lr",
        verifiedAt: new Date().toISOString(),
        createdAt: new Date().toISOString().slice(0, 10),
      };
      saveStoredParcel(newPcl);
      return jsonResponse(
        {
          ok: true,
          parcelId: newPcl.parcelId,
          ...newPcl,
          vertices: typeof newPcl.vertices === "string" ? JSON.parse(newPcl.vertices) : newPcl.vertices,
          qualityFlags: body.qualityFlags || [],
        },
        201
      );
    }
    if (method === "PATCH" && init?.body) {
      const body = JSON.parse(init.body as string);
      if (body.parcelId) {
        updateStoredParcel(body);
      }
      return jsonResponse({ success: true, ok: true, geometryStatus: body.geometryStatus || "FIELD_VERIFIED" });
    }
  }

  // 5. FAO Assignment Delivery: /api/delivery
  if (pathname === "/api/delivery") {
    if (method === "GET") {
      return jsonResponse({
        items: getStoredDeliveryItems(),
        access: { manage: true, review: true, accept: true },
      });
    }
    if (method === "POST") {
      return jsonResponse({ created: 8, reference: `FAO-C${Date.now().toString().slice(-3)}` }, 201);
    }
    if (method === "PATCH") {
      return jsonResponse({ success: true });
    }
  }

  // 6. Governance API: /api/governance
  if (pathname === "/api/governance") {
    return jsonResponse({
      institutions: [
        { institutionCode: "MOA", name: "Ministry of Agriculture", mandate: "National agricultural policy & registry ownership", accountRole: "Owner", scope: "National" },
        { institutionCode: "LISGIS", name: "Liberia Institute of Statistics and Geo-Information Services", mandate: "Geospatial, statistical and boundary standards", accountRole: "Steward", scope: "National" },
        { institutionCode: "MGCSP", name: "Ministry of Gender, Children and Social Protection", mandate: "National social protection & social registry integration", accountRole: "Partner", scope: "National" },
        { institutionCode: "FAO", name: "Food and Agriculture Organization of the United Nations", mandate: "Technical oversight, delivery quality assurance and capacity transfer", accountRole: "Oversight", scope: "International" },
      ],
      datasets: [
        { datasetCode: "DFR-PRODUCERS", title: "National Farmer & Household Master Register", domain: "Farmer Profiles", ownerInstitution: "MOA", stewardInstitution: "MOA Registry Unit", custodianInstitution: "IT Directorate", approvingAuthority: "Minister of Agriculture", sensitivity: "Restricted", accessRule: "RBAC governed", classificationStandard: "LBR-ISO-19115", version: "2.1", lastReviewedAt: "2026-08-01", nextReviewAt: "2026-11-01", status: "Active" },
        { datasetCode: "DFR-CADASTRE", title: "Agricultural Land Cadastre & Farm Parcel Boundaries", domain: "Geospatial", ownerInstitution: "MOA / LISGIS", stewardInstitution: "GIS Unit", custodianInstitution: "National Cartographic Center", approvingAuthority: "Director General LISGIS", sensitivity: "Internal", accessRule: "Open geospatial layer", classificationStandard: "EPSG:4326 / WGS 84", version: "1.4", lastReviewedAt: "2026-08-15", nextReviewAt: "2026-11-15", status: "Active" },
      ],
      workflows: [
        { id: 1, caseId: "GWF-2026-001", workflowType: "DATA_SHARING_REQUEST", title: "MGCSP Social Registry Bi-directional Interoperability Protocol", submitterInstitution: "MGCSP", currentInstitution: "MOA", stage: "IN_REVIEW", decision: "Pending", dueDate: "2026-10-15", county: "National" },
        { id: 2, caseId: "GWF-2026-002", workflowType: "DATASET_RECLASSIFICATION", title: "Open Access Release for Agro-climatic Vulnerability Maps", submitterInstitution: "LISGIS", currentInstitution: "Data Governance Council", stage: "APPROVED", decision: "Approved", dueDate: "2026-09-20", county: "National" },
      ],
      decisions: [
        { decisionCode: "NSC-DEC-2026-03", meetingType: "National Steering Committee", title: "Adoption of LADM Agricultural Land Cadastre Model", responsibleInstitution: "MOA & LISGIS", actionOwner: "Lead Systems Architect", meetingDate: "2026-08-10", dueDate: "2026-10-01", priority: "High", status: "Approved" },
      ],
      dataDictionary: [
        { elementCode: "DFR-ELEM-001", name: "Approved DFR Identifier", domain: "Identity", dataType: "String(14)", allowedValues: '["LBR-CC-NNNNNN"]', standardOwner: "MOA", version: "2.0", status: "Approved" },
        { elementCode: "DFR-ELEM-002", name: "Parcel Polygon Geometry", domain: "Geospatial", dataType: "GeoJSON Polygon", allowedValues: '["WGS 84 EPSG:4326"]', standardOwner: "LISGIS", version: "1.2", status: "Approved" },
      ],
      access: { canManage: true, role: "Ministry administrator" },
    });
  }

  // 7. Appendix & Controls: /api/appendix-controls
  if (pathname === "/api/appendix-controls") {
    return jsonResponse({
      sops: getStoredSOPs(),
      rules: [
        { ruleCode: "DQR-01", name: "GPS Coordinate Liberia Bounding Box Check", dimension: "Accuracy", entityType: "Parcel", expression: "lat BETWEEN 4.15 AND 8.75 AND lng BETWEEN -11.65 AND -7.25", severity: "Fatal", ownerInstitution: "LISGIS" },
        { ruleCode: "DQR-02", name: "Mandatory Phone Number Format Check", dimension: "Completeness", entityType: "Farmer", expression: "phone MATCHES ^(\\+231|0)[0-9]{8,9}$", severity: "Warning", ownerInstitution: "MOA" },
      ],
      assessments: [
        { assessmentCode: "DQA-2026-Q3", subjectRef: "National Registry Batch Q3", assessmentType: "Full Audit", accuracy: 96, completeness: 94, consistency: 98, timeliness: 91, uniqueness: 99, reliability: 97, overallScore: 96, outcome: "Passed quality threshold", assessedBy: "FAO Quality Specialist", assessedAt: "2026-08-28" },
      ],
      controls: [
        { controlCode: "CTRL-SEC-01", controlType: "Security", title: "Audit Trail Immutability Verification", institution: "MOA", county: "National", owner: "Security Auditor", status: "Verified", priority: "Critical", dueDate: "2026-10-01" },
      ],
      consents: [
        { consentCode: "CONS-001", subjectRef: "LBR-NI-000184", version: "v2", language: "English / Kpelle", purposes: "Agricultural Subsidies & Extension", channel: "Field Paper + Digital Sign", grantedBy: "Kollie Flomo", status: "Active", grantedAt: "2026-08-12" },
      ],
      indicators: [
        { indicatorCode: "IND-01", name: "County Registry Coverage Percentage", definition: "% of targeted farming households enrolled in the national DFR", numerator: "184200", denominator: "220000", frequency: "Monthly", owner: "M&E Officer", disaggregations: "County, Gender, Commodity", currentValue: 83.7, unit: "%", lastCalculatedAt: "2026-09-01" },
      ],
      assignments: [
        { id: 1, email: "tis@totaggroup.com", displayName: "Michael Gwoah", role: "Ministry administrator", institution: "Ministry of Agriculture", status: "Active" },
      ],
      farmers: getStoredFarmers(),
      access: { capabilities: ["registry.create", "registry.verify", "registry.manage", "reports.export"] },
    });
  }

  // 8. Help Desk: /api/help-desk
  if (pathname === "/api/help-desk") {
    return jsonResponse({
      tickets: [
        { ticketCode: "HD-2026-018", requesterName: "Kollie Flomo", requesterEmail: "tis@totaggroup.com", requesterRole: "Farmer", subject: "Parcel boundary adjustment request", category: "GIS & Parcels", priority: "Normal", status: "Open", assignedTeam: "GIS Unit", slaHours: 48, createdAt: "2026-08-29", dueAt: "2026-09-05", description: "Requesting re-demarcation of eastern cocoa parcel boundary.", messages: [] },
      ],
      articles: [
        { articleCode: "KB-001", title: "How to capture offline field coordinates", category: "Field Operations", audience: "Enumerators", summary: "Step-by-step guidance on GPS calibration and saving unverified drafts offline.", content: "Ensure device GPS accuracy is under 5 meters before logging boundary vertices." },
        { articleCode: "KB-002", title: "E-Voucher Redemption Protocols", category: "Benefits & Inputs", audience: "Input Agro-dealers", summary: "Verification of farmer DFR ID and SMS OTP before input release.", content: "Dealers must scan farmer QR code or verify 6-digit SMS token." },
      ],
      access: { canManage: true, role: "Ministry administrator" },
    });
  }

  // 9. Extension Services: /api/extension-services
  if (pathname === "/api/extension-services") {
    return jsonResponse({
      requests: [
        { requestCode: "EXT-2026-041", requesterName: "Fatu Kamara", requesterEmail: "tis@totaggroup.com", requesterRole: "Farmer", county: "Bong", district: "Suakoko", serviceType: "Pest & Disease Advisory", problemDescription: "Brown spot detected on lowland rice paddies.", urgency: "High", status: "Assigned", assignedOfficer: "Dr. John Kerkulah (Extension Agent)", visits: [{ visitCode: "VIS-2026-092", scheduledAt: "2026-09-10", officerName: "Dr. John Kerkulah", status: "Scheduled", purpose: "Field inspection of rice paddy infestation", location: "Phebe Valley" }] },
      ],
      access: { canManage: true, role: "Ministry administrator" },
    });
  }

  // 10. Programme Applications: /api/programme-applications
  if (pathname === "/api/programme-applications") {
    return jsonResponse({
      programmes: [
        { programmeCode: "PRG-RICE-2026", title: "National Rice Self-Sufficiency Input Subsidy", description: "Certified foundation seed, NPK fertilizer, and power tillers for smallholder rice farmers.", ownerInstitution: "Ministry of Agriculture", assistanceType: "Input Subsidy", openingDate: "2026-08-01", deadline: "2026-10-31", status: "Active" },
        { programmeCode: "PRG-COCOA-2026", title: "Tree Crop Rehabilitation & EUDR Compliance Facility", description: "GPS parcel traceability certificates and improved cocoa clonal seedlings.", ownerInstitution: "Liberia Agriculture Commercialization Fund", assistanceType: "Technical & Grant Support", openingDate: "2026-07-15", deadline: "2026-11-15", status: "Active" },
      ],
      cases: [
        { applicationCode: "APP-2026-084", programmeCode: "PRG-RICE-2026", programmeTitle: "National Rice Self-Sufficiency Input Subsidy", applicantName: "Fatu Kamara", applicantEmail: "tis@totaggroup.com", county: "Bong", district: "Suakoko", requestedSupport: "NPK 15-15-15 (4 bags) & Suakoko 8 Seed Rice (50 kg)", eligibilityScore: 94, status: "Approved" },
      ],
      access: { canManage: true, role: "Ministry administrator" },
    });
  }

  // 11. Benefits: /api/benefits
  if (pathname === "/api/benefits") {
    return jsonResponse({
      vouchers: [
        { voucherCode: "VCH-26-RICE-019", farmerDfrId: "LBR-BG-000219", programme: "National Rice Subsidy", category: "Seed & Fertilizer", value: 185, currency: "USD", status: "Issued", expiresAt: "2026-11-30", distributionSite: "Suakoko Agro Hub" },
      ],
      paymentAccounts: [
        { id: 1, farmerDfrId: "LBR-NI-000184", provider: "Lonestar MTN Mobile Money", accountName: "Kollie Flomo", accountNumberMasked: "0770***192", verified: true, status: "Active", accountType: "Mobile money" },
      ],
      transactions: [
        { transactionCode: "TX-2026-8812", farmerDfrId: "LBR-NI-000184", programme: "Cocoa Outgrower Cash Incentive", amount: 120, currency: "USD", provider: "MTN Mobile Money", status: "Completed", receiptRef: "MM-993214" },
      ],
      issues: [],
      access: { canManage: true, role: "Ministry administrator" },
    });
  }

  // 12. Grievances: /api/grievances
  if (pathname === "/api/grievances") {
    return jsonResponse({
      cases: [
        { ticketId: "GRV-26-0012", farmerDfrId: "LBR-MO-000412", category: "Registration correction", county: "Montserrado", description: "Farm boundary area was recorded as 1.2 ha instead of 2.1 ha.", priority: "Normal", status: "In review", assignedTo: "County Agricultural Officer" },
      ],
      access: { canManage: true, currentEmail: "tis@totaggroup.com" },
    });
  }

  // 13. Identity check: /api/identity-check
  if (pathname === "/api/identity-check") {
    return jsonResponse({
      risk: 10,
      outcome: "Clear — No duplicate biometric or phone match detected in the national register.",
      matches: [],
    });
  }

  return null;
}
