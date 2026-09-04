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
  INITIAL_DELIVERY_TEMPLATES,
  getStoredHouseholds,
  saveStoredHousehold,
  updateStoredHousehold,
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

  // 5. Operations API: /api/operations
  if (pathname === "/api/operations" || pathname.startsWith("/api/operations/")) {
    const opType = (parsedUrl.searchParams.get("type") || "households").toLowerCase();
    if (method === "GET") {
      if (opType === "households") {
        return jsonResponse(getStoredHouseholds());
      }
      if (opType === "identity") {
        return jsonResponse([]);
      }
      if (opType === "applications") {
        return jsonResponse([]);
      }
      if (opType === "payments") {
        return jsonResponse([]);
      }
      if (opType === "vouchers") {
        return jsonResponse([]);
      }
      if (opType === "grievances") {
        return jsonResponse([]);
      }
      return jsonResponse(getStoredHouseholds());
    }

    if (method === "POST" && init?.body) {
      try {
        const body = typeof init.body === "string" ? JSON.parse(init.body) : init.body;
        if (body.type === "households" || !body.type) {
          const newH = saveStoredHousehold(body);
          return jsonResponse(newH, 201);
        }
        return jsonResponse({ success: true, id: Date.now() }, 201);
      } catch {
        return jsonResponse({ error: "Invalid operational payload" }, 400);
      }
    }

    if (method === "PATCH" && init?.body) {
      try {
        const body = typeof init.body === "string" ? JSON.parse(init.body) : init.body;
        if (body.type === "households" || !body.type) {
          updateStoredHousehold(Number(body.id), { status: body.status });
        }
        return jsonResponse({ success: true });
      } catch {
        return jsonResponse({ success: true });
      }
    }
  }

  // 6. FAO Assignment Delivery: /api/delivery
  if (pathname === "/api/delivery") {
    if (method === "GET") {
      return jsonResponse({
        items: getStoredDeliveryItems(),
        templates: INITIAL_DELIVERY_TEMPLATES,
        access: { role: "Ministry administrator", manage: true, review: true, accept: true, institution: "Ministry of Agriculture / FAO" },
      });
    }
    if (method === "POST" && init?.body) {
      try {
        const body = typeof init.body === "string" ? JSON.parse(init.body) : init.body;
        if (body.action === "initialize-rfp") {
          const existing = getStoredDeliveryItems();
          let created = 0;
          INITIAL_DELIVERY_TEMPLATES.forEach((tpl) => {
            const has = existing.some((e) => (e.metadata as any)?.deliverableNumber === tpl.number);
            if (!has) {
              created++;
              const newItem: any = {
                id: Date.now() + created,
                reference: `FAO-C${tpl.component}-${String(existing.length + created).padStart(3, "0")}`,
                component: tpl.component,
                workstream: tpl.workstream,
                title: tpl.title,
                description: tpl.description,
                owner: tpl.owner,
                county: "National",
                dueDate: tpl.dueDate,
                status: "Draft",
                acceptanceStatus: "Not submitted",
                metadata: {
                  deliverableNumber: tpl.number,
                  institution: tpl.institution,
                  reviewer: tpl.reviewer,
                  approver: tpl.approver,
                  progress: 0,
                  version: "0.1",
                  dependencies: tpl.dependencies,
                  acceptanceCriteria: tpl.acceptanceCriteria,
                  history: [],
                },
                evidence: [],
                audit: [],
              };
              existing.push(newItem);
            }
          });
          if (typeof window !== "undefined") {
            try {
              localStorage.setItem("dfr_delivery_store_v1", JSON.stringify(existing));
            } catch {}
          }
          return jsonResponse({ created, reference: `FAO-RFP-INITIALIZED` }, 201);
        }
        return jsonResponse({ created: 1, reference: `FAO-C${Date.now().toString().slice(-3)}` }, 201);
      } catch {
        return jsonResponse({ created: 1, reference: `FAO-C${Date.now().toString().slice(-3)}` }, 201);
      }
    }
    if (method === "PATCH" && init?.body) {
      try {
        const body = typeof init.body === "string" ? JSON.parse(init.body) : init.body;
        const existing = getStoredDeliveryItems();
        const item = existing.find((x) => x.id === Number(body.id));
        if (item) {
          if (body.status) item.status = body.status;
          if (body.acceptanceStatus) item.acceptanceStatus = body.acceptanceStatus;
          item.metadata = typeof item.metadata === "object" && item.metadata !== null ? item.metadata : {};
          if (body.progress !== undefined) (item.metadata as any).progress = Number(body.progress);
          if (body.version) (item.metadata as any).version = body.version;
          if (body.priority) (item.metadata as any).priority = body.priority;
          if (body.risks) (item.metadata as any).risks = body.risks;
          if (body.dependencies) (item.metadata as any).dependencies = body.dependencies;
          if (body.notes) {
            (item.metadata as any).history = (item.metadata as any).history || [];
            (item.metadata as any).history.unshift({
              at: new Date().toISOString(),
              actor: "Ministry Administrator",
              role: "FAO Oversight",
              action: body.acceptanceStatus || "Updated",
              notes: body.notes,
            });
          }
          if (typeof window !== "undefined") {
            try {
              localStorage.setItem("dfr_delivery_store_v1", JSON.stringify(existing));
            } catch {}
          }
        }
        return jsonResponse({ success: true, ok: true });
      } catch {
        return jsonResponse({ success: true, ok: true });
      }
    }
  }

  // 7. Governance API: /api/governance
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

  // 8. Appendix & Controls: /api/appendix-controls
  if (pathname === "/api/appendix-controls") {
    return jsonResponse({
      sops: getStoredSOPs(),
      rules: [
        { ruleCode: "DQR-01", name: "GPS Coordinate Liberia Bounding Box Check", dimension: "Accuracy", entityType: "Parcel", expression: "lat BETWEEN 4.15 AND 8.75 AND lng BETWEEN -11.65 AND -7.25", severity: "Fatal", ownerInstitution: "LISGIS", enabled: true },
        { ruleCode: "DQR-02", name: "Mandatory Phone Number Format Check", dimension: "Completeness", entityType: "Farmer", expression: "phone MATCHES ^(\\+231|0)[0-9]{8,9}$", severity: "Warning", ownerInstitution: "MOA", enabled: true },
      ],
      assessments: [],
      controls: [
        { id: 1, controlCode: "CTRL-SEC-01", controlType: "Field supervision", title: "Audit Trail Immutability Verification", institution: "MOA", county: "National", owner: "Security Auditor", status: "Active", priority: "Critical", dueDate: "2026-10-01" },
        { id: 2, controlCode: "CTRL-DQA-02", controlType: "Spot check", title: "Parcel Demarcation Spot Check", institution: "LISGIS", county: "Nimba", owner: "GIS Supervisor", status: "Active", priority: "High", dueDate: "2026-09-25" },
      ],
      consents: [],
      indicators: [
        { indicatorCode: "IND-01", name: "County Registry Coverage Percentage", definition: "% of targeted farming households enrolled in the national DFR", numerator: "0", denominator: "220000", frequency: "Monthly", owner: "M&E Officer", disaggregations: "County, Gender, Commodity", currentValue: 0, unit: "%", lastCalculatedAt: new Date().toISOString().slice(0, 10) },
      ],
      assignments: [
        { id: 1, email: "tis@totaggroup.com", displayName: "Michael Gwoah", role: "Ministry administrator", institution: "Ministry of Agriculture", countyScope: "National", districtScope: "All Districts", sensitivityCeiling: "Top Secret / Restr.", status: "Active" },
      ],
      farmers: getStoredFarmers(),
      access: { institution: "Ministry of Agriculture", role: "Ministry administrator", countyScope: "National", sensitivityCeiling: "Full Unrestricted", capabilities: ["registry.create", "registry.verify", "registry.manage", "reports.export"] },
    });
  }

  // 9. Help Desk: /api/help-desk
  if (pathname === "/api/help-desk") {
    return jsonResponse({
      tickets: [],
      articles: [
        { articleCode: "KB-001", title: "How to capture offline field coordinates", category: "Field Operations", audience: "Enumerators", summary: "Step-by-step guidance on GPS calibration and saving unverified drafts offline.", content: "Ensure device GPS accuracy is under 5 meters before logging boundary vertices." },
        { articleCode: "KB-002", title: "E-Voucher Redemption Protocols", category: "Benefits & Inputs", audience: "Input Agro-dealers", summary: "Verification of farmer DFR ID and SMS OTP before input release.", content: "Dealers must scan farmer QR code or verify 6-digit SMS token." },
      ],
      access: { canManage: true, role: "Ministry administrator" },
    });
  }

  // 10. Extension Services: /api/extension-services
  if (pathname === "/api/extension-services") {
    const STORAGE_KEY = "dfr_extension_records_v2";
    const getStoredExtension = () => {
      if (typeof window === "undefined") return { requests: [], visits: [] };
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) return JSON.parse(raw);
      } catch {}
      return { requests: [], visits: [] };
    };
    const saveStoredExtension = (data: any) => {
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch {}
      }
    };

    if (method === "GET") {
      const store = getStoredExtension();
      return jsonResponse({
        requests: store.requests || [],
        visits: store.visits || [],
        access: { canManage: true, role: "Extension agent" },
      });
    }

    if (method === "POST" && init?.body) {
      try {
        const body = typeof init.body === "string" ? JSON.parse(init.body) : init.body;
        const store = getStoredExtension();
        store.requests = store.requests || [];
        store.visits = store.visits || [];

        if (body.action === "record-visit") {
          const reqCode = body.requestCode || `EXT-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
          const visitCode = `VIS-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;

          const newVisit = {
            id: Date.now(),
            visitCode,
            requestCode: reqCode,
            scheduledAt: body.scheduledAt || new Date().toISOString(),
            visitType: body.visitType || "On-farm visit",
            officerName: body.officerName || "Dr. John Kerkulah",
            status: body.status || "Completed",
            location: body.location || `${body.district || ""}, ${body.county || ""}`,
            purpose: body.purpose || "On-farm advisory encounter",
            observations: body.observations || "",
            advice: body.advice || "",
            referral: body.referral || "",
            referralStatus: body.referral ? body.referralStatus || "Referred" : "Not required",
            outcome: body.outcome || "Field recommendations documented.",
            nextVisitAt: body.nextVisitAt || "",
            crop: body.crop || "Rice",
            diagnostic: body.diagnostic || null,
            soilTest: body.soilTest || null,
            audioNoteUrl: body.audioNoteUrl || null,
          };

          let parentReq = store.requests.find((r: any) => r.requestCode === reqCode);
          if (!parentReq) {
            parentReq = {
              requestCode: reqCode,
              requesterName: body.farmerName || "Smallholder Producer",
              requesterRole: "Farmer",
              farmerDfrId: body.farmerDfrId || "",
              county: body.county || "Bong",
              district: body.district || "",
              serviceType: body.serviceType || "Agronomic Diagnostics & IPM Advisory",
              preferredDate: new Date().toISOString().slice(0, 10),
              problemDescription: body.observations || body.purpose || "Field visit advisory",
              urgency: body.urgency || "Normal",
              status: "Completed",
              assignedOfficer: body.officerName || "Dr. John Kerkulah",
              resolutionSummary: body.advice || "",
              followUpDate: body.nextVisitAt || "",
              satisfaction: 5,
              createdAt: new Date().toISOString(),
              visits: [newVisit],
            };
            store.requests.unshift(parentReq);
          } else {
            parentReq.visits = parentReq.visits || [];
            parentReq.visits.unshift(newVisit);
          }

          store.visits.unshift(newVisit);
          saveStoredExtension(store);

          addStoredAudit({
            actor: "extension.agent@moa.gov.lr",
            action: "Extension field visit recorded",
            entity: visitCode,
            details: `${body.farmerName || "Farmer"} (${body.farmerDfrId || "DFR"}), ${body.county || "Liberia"} · ${body.serviceType || "Advisory"}`,
          });

          return jsonResponse({ ok: true, visitCode, requestCode: reqCode }, 201);
        }

        if (body.action === "broadcast-alert") {
          const alertId = `ALT-${Date.now().toString().slice(-4)}`;
          addStoredAudit({
            actor: "extension.directorate@moa.gov.lr",
            action: "Emergency pest alert broadcast",
            entity: alertId,
            details: `Alert: ${body.crop || "Crops"} across ${body.county || "National"}: ${body.message || ""}`,
          });
          return jsonResponse({ ok: true, alertId, recipientsCount: 142 });
        }

        if (body.action === "schedule") {
          const visitCode = `VIS-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
          const newVisit = {
            id: Date.now(),
            visitCode,
            requestCode: body.requestCode,
            scheduledAt: body.scheduledAt,
            visitType: body.visitType || "On-farm visit",
            officerName: body.officerName || "Extension Agent",
            status: body.status || "Scheduled",
            location: body.location || "",
            purpose: body.purpose || "",
            observations: body.observations || "",
            advice: body.advice || "",
            referral: body.referral || "",
            referralStatus: body.referralStatus || "Not required",
            outcome: body.outcome || "",
            nextVisitAt: body.nextVisitAt || "",
          };
          const r = store.requests.find((x: any) => x.requestCode === body.requestCode);
          if (r) {
            r.visits = r.visits || [];
            r.visits.unshift(newVisit);
            r.status = body.requestStatus || "Visit scheduled";
          }
          store.visits.unshift(newVisit);
          saveStoredExtension(store);
          return jsonResponse({ ok: true, visitCode });
        }

        if (body.action === "feedback") {
          const r = store.requests.find((x: any) => x.requestCode === body.requestCode);
          if (r) {
            r.satisfaction = Number(body.satisfaction) || 5;
            saveStoredExtension(store);
          }
          return jsonResponse({ ok: true });
        }

        // Standard new service request
        const reqCode = `EXT-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
        const newReq = {
          requestCode: reqCode,
          requesterName: body.requesterName || "Farmer Applicant",
          requesterRole: body.requesterRole || "Farmer",
          farmerDfrId: body.farmerDfrId || "",
          county: body.county || "Bong",
          district: body.district || "",
          serviceType: body.serviceType || "Crop production advice",
          preferredDate: body.preferredDate || "",
          problemDescription: body.problemDescription || "",
          urgency: body.urgency || "Normal",
          status: "Pending triage",
          assignedOfficer: "Pending assignment",
          resolutionSummary: "",
          followUpDate: "",
          satisfaction: 0,
          createdAt: new Date().toISOString(),
          visits: [],
        };
        store.requests.unshift(newReq);
        saveStoredExtension(store);
        return jsonResponse({ ok: true, requestCode: reqCode }, 201);
      } catch {
        return jsonResponse({ ok: true });
      }
    }
  }

  // 11. Programme Applications: /api/programme-applications
  if (pathname === "/api/programme-applications") {
    const defaultProgrammes = [
      {
        programmeCode: "PRG-RICE-2026",
        title: "National Rice Self-Sufficiency Input Subsidy",
        description: "Certified foundation seed, NPK fertilizer, and power tillers for smallholder rice farmers across key production counties.",
        ownerInstitution: "Ministry of Agriculture",
        assistanceType: "Input Subsidy",
        targetGroups: "Smallholder rice producers, women cooperatives",
        counties: "Bong, Nimba, Lofa",
        eligibilityCriteria: "Registered DFR farmer with at least 1.0 hectare lowland or upland rice plot.",
        openingDate: "2026-08-01",
        deadline: "2026-10-31",
        status: "Open",
      },
      {
        programmeCode: "PRG-COCOA-2026",
        title: "Tree Crop Rehabilitation & EUDR Compliance Facility",
        description: "GPS parcel traceability certificates and improved cocoa clonal seedlings for certified deforestation-free production.",
        ownerInstitution: "Liberia Agriculture Commercialization Fund",
        assistanceType: "Technical & Grant Support",
        targetGroups: "Cocoa outgrowers, agro-forestry cooperatives",
        counties: "Nimba, Lofa, Bong",
        eligibilityCriteria: "Verified DFR profile with boundary polygon captured and geo-referenced.",
        openingDate: "2026-07-15",
        deadline: "2026-11-15",
        status: "Open",
      },
      {
        programmeCode: "PRG-MECH-2026",
        title: "Smallholder Mechanization Service Grant",
        description: "Subsidized power tillers, solar water pumps, and motorized weeders for smallholder farming clusters.",
        ownerInstitution: "Ministry of Agriculture / FAO",
        assistanceType: "Equipment Grant",
        targetGroups: "Farmer groups, youth agribusiness clusters",
        counties: "National",
        eligibilityCriteria: "Registered farmer group with at least 15 active members.",
        openingDate: "2026-08-10",
        deadline: "2026-12-01",
        status: "Open",
      },
    ];

    const defaultApplications: any[] = [];

    if (method === "GET") {
      let programmes = defaultProgrammes;
      let applications = defaultApplications;
      if (typeof window !== "undefined") {
        try {
          const storedP = localStorage.getItem("dfr_programmes_store");
          if (storedP) programmes = JSON.parse(storedP);
          const storedA = localStorage.getItem("dfr_programme_apps_store");
          if (storedA) applications = JSON.parse(storedA);
        } catch {}
      }
      return jsonResponse({
        programmes,
        applications,
        access: { role: "Ministry administrator", canManage: true, scope: "National", currentEmail: "tis@totaggroup.com" },
      });
    }

    if (method === "POST" && init?.body) {
      try {
        const body = typeof init.body === "string" ? JSON.parse(init.body) : init.body;
        if (body.action === "apply") {
          let applications = defaultApplications;
          if (typeof window !== "undefined") {
            try {
              const storedA = localStorage.getItem("dfr_programme_apps_store");
              if (storedA) applications = JSON.parse(storedA);
            } catch {}
          }
          const newApp = {
            applicationCode: `APP-${new Date().getFullYear()}-${Date.now().toString().slice(-3)}`,
            programmeTitle: body.programmeCode || "Agricultural Support Programme",
            applicantEmail: "tis@totaggroup.com",
            applicantName: "Registered Applicant",
            applicantRef: body.applicantRef || "DFR-APPLICANT",
            county: body.county || "Montserrado",
            district: body.district || "Greater Monrovia",
            requestedSupport: body.requestedSupport || "General agricultural inputs",
            status: "Submitted",
            eligibilityScore: 75,
            reviewer: "Program Officer",
            decisionReason: "Awaiting review",
            submittedAt: new Date().toISOString(),
          };
          applications = [newApp, ...applications];
          if (typeof window !== "undefined") {
            try {
              localStorage.setItem("dfr_programme_apps_store", JSON.stringify(applications));
            } catch {}
          }
          return jsonResponse({ success: true, application: newApp }, 201);
        }
        if (body.action === "programme") {
          let programmes = defaultProgrammes;
          if (typeof window !== "undefined") {
            try {
              const storedP = localStorage.getItem("dfr_programmes_store");
              if (storedP) programmes = JSON.parse(storedP);
            } catch {}
          }
          const newP = {
            programmeCode: `PRG-${Date.now().toString().slice(-4)}`,
            title: body.title || "Agricultural Assistance Opportunity",
            description: body.description || "",
            ownerInstitution: body.ownerInstitution || "Ministry of Agriculture",
            assistanceType: body.assistanceType || "Direct Support",
            targetGroups: body.targetGroups || "Smallholders",
            counties: body.counties || "National",
            eligibilityCriteria: body.eligibilityCriteria || "DFR registered",
            openingDate: body.openingDate || new Date().toISOString().slice(0, 10),
            deadline: body.deadline || "2026-12-31",
            status: "Open",
          };
          programmes = [newP, ...programmes];
          if (typeof window !== "undefined") {
            try {
              localStorage.setItem("dfr_programmes_store", JSON.stringify(programmes));
            } catch {}
          }
          return jsonResponse({ success: true, programme: newP }, 201);
        }
      } catch {}
      return jsonResponse({ success: true });
    }

    if (method === "PATCH" && init?.body) {
      try {
        const body = typeof init.body === "string" ? JSON.parse(init.body) : init.body;
        let applications = defaultApplications;
        if (typeof window !== "undefined") {
          try {
            const storedA = localStorage.getItem("dfr_programme_apps_store");
            if (storedA) applications = JSON.parse(storedA);
          } catch {}
        }
        applications = applications.map((a) => {
          if (a.applicationCode === body.applicationCode) {
            return {
              ...a,
              status: body.status || (body.action === "withdraw" ? "Withdrawn" : a.status),
              eligibilityScore: body.eligibilityScore !== undefined ? Number(body.eligibilityScore) : a.eligibilityScore,
              decisionReason: body.decisionReason || a.decisionReason,
            };
          }
          return a;
        });
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem("dfr_programme_apps_store", JSON.stringify(applications));
          } catch {}
        }
        return jsonResponse({ success: true });
      } catch {
        return jsonResponse({ success: true });
      }
    }
  }

  // 12. Benefits: /api/benefits
  if (pathname === "/api/benefits") {
    const defaultVouchers: any[] = [];
    const defaultAccounts: any[] = [];
    const defaultTransactions: any[] = [];

    if (method === "GET") {
      let vouchers = defaultVouchers;
      let accounts = defaultAccounts;
      let transactions = defaultTransactions;
      if (typeof window !== "undefined") {
        try {
          const storedV = localStorage.getItem("dfr_benefits_vouchers");
          if (storedV) vouchers = JSON.parse(storedV);
          const storedA = localStorage.getItem("dfr_benefits_accounts");
          if (storedA) accounts = JSON.parse(storedA);
          const storedT = localStorage.getItem("dfr_benefits_tx");
          if (storedT) transactions = JSON.parse(storedT);
        } catch {}
      }
      return jsonResponse({
        vouchers,
        accounts,
        transactions,
        issues: [],
        access: { currentEmail: "tis@totaggroup.com", canVoucher: true, canPayment: true },
      });
    }

    if (method === "POST" && init?.body) {
      try {
        const body = typeof init.body === "string" ? JSON.parse(init.body) : init.body;
        if (body.action === "account") {
          let accounts = defaultAccounts;
          if (typeof window !== "undefined") {
            try {
              const storedA = localStorage.getItem("dfr_benefits_accounts");
              if (storedA) accounts = JSON.parse(storedA);
            } catch {}
          }
          const num = String(body.accountNumber || "0770000000");
          const masked = num.length > 4 ? `${num.slice(0, 4)}***${num.slice(-3)}` : num;
          const newAcc = {
            id: Date.now(),
            farmerDfrId: body.farmerDfrId || "LBR-MO-000412",
            ownerEmail: "tis@totaggroup.com",
            provider: body.provider || "MTN Mobile Money",
            accountName: body.accountName || "Account Holder",
            accountNumberMasked: masked,
            verified: false,
            status: "Verification requested",
            accountType: "Mobile money",
          };
          accounts = [newAcc, ...accounts];
          if (typeof window !== "undefined") {
            try {
              localStorage.setItem("dfr_benefits_accounts", JSON.stringify(accounts));
            } catch {}
          }
          return jsonResponse({ success: true, account: newAcc }, 201);
        }
        if (body.action === "voucher") {
          let vouchers = defaultVouchers;
          if (typeof window !== "undefined") {
            try {
              const storedV = localStorage.getItem("dfr_benefits_vouchers");
              if (storedV) vouchers = JSON.parse(storedV);
            } catch {}
          }
          const newV = {
            id: Date.now(),
            voucherCode: `VCH-${new Date().getFullYear().toString().slice(-2)}-${Date.now().toString().slice(-5)}`,
            farmerDfrId: body.farmerDfrId || "LBR-MO-000412",
            ownerEmail: body.ownerEmail || "tis@totaggroup.com",
            programme: body.programme || "Input Subsidy",
            category: body.category || "Seed and fertilizer",
            value: Number(body.value) || 100,
            currency: body.currency || "USD",
            status: "Issued",
            expiresAt: body.expiresAt || "2026-12-31",
            distributionSite: body.distributionSite || "County Agro Hub",
            appointmentAt: "Pending pickup",
            receiptAcknowledged: false,
          };
          vouchers = [newV, ...vouchers];
          if (typeof window !== "undefined") {
            try {
              localStorage.setItem("dfr_benefits_vouchers", JSON.stringify(vouchers));
            } catch {}
          }
          return jsonResponse({ success: true, voucher: newV }, 201);
        }
      } catch {}
      return jsonResponse({ success: true });
    }

    if (method === "PATCH" && init?.body) {
      try {
        const body = typeof init.body === "string" ? JSON.parse(init.body) : init.body;
        if (body.action === "verify-account") {
          let accounts = defaultAccounts;
          if (typeof window !== "undefined") {
            try {
              const storedA = localStorage.getItem("dfr_benefits_accounts");
              if (storedA) accounts = JSON.parse(storedA);
            } catch {}
          }
          accounts = accounts.map((a) => (a.id === Number(body.id) ? { ...a, status: "Verified", verified: true } : a));
          if (typeof window !== "undefined") {
            try {
              localStorage.setItem("dfr_benefits_accounts", JSON.stringify(accounts));
            } catch {}
          }
          return jsonResponse({ success: true });
        }
        if (body.action === "redeem") {
          let vouchers = defaultVouchers;
          if (typeof window !== "undefined") {
            try {
              const storedV = localStorage.getItem("dfr_benefits_vouchers");
              if (storedV) vouchers = JSON.parse(storedV);
            } catch {}
          }
          vouchers = vouchers.map((v) => (v.voucherCode === body.voucherCode ? { ...v, status: "Redeemed" } : v));
          if (typeof window !== "undefined") {
            try {
              localStorage.setItem("dfr_benefits_vouchers", JSON.stringify(vouchers));
            } catch {}
          }
          return jsonResponse({ success: true });
        }
        if (body.action === "acknowledge") {
          let vouchers = defaultVouchers;
          if (typeof window !== "undefined") {
            try {
              const storedV = localStorage.getItem("dfr_benefits_vouchers");
              if (storedV) vouchers = JSON.parse(storedV);
            } catch {}
          }
          vouchers = vouchers.map((v) => (v.voucherCode === body.voucherCode ? { ...v, receiptAcknowledged: true } : v));
          if (typeof window !== "undefined") {
            try {
              localStorage.setItem("dfr_benefits_vouchers", JSON.stringify(vouchers));
            } catch {}
          }
          return jsonResponse({ success: true });
        }
      } catch {}
      return jsonResponse({ success: true });
    }
  }

  // 13. Grievances: /api/grievances
  if (pathname === "/api/grievances") {
    return jsonResponse({
      cases: [
        { ticketId: "GRV-26-0012", farmerDfrId: "LBR-MO-000412", category: "Registration correction", county: "Montserrado", description: "Farm boundary area was recorded as 1.2 ha instead of 2.1 ha.", priority: "Normal", status: "In review", assignedTo: "County Agricultural Officer" },
      ],
      access: { canManage: true, currentEmail: "tis@totaggroup.com" },
    });
  }

  // 14. Identity check: /api/identity-check
  if (pathname === "/api/identity-check") {
    return jsonResponse({
      risk: 10,
      outcome: "Clear — No duplicate biometric or phone match detected in the national register.",
      matches: [],
    });
  }

  return null;
}
