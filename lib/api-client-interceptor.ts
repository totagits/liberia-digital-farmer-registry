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
          marketAccess: body.marketAccess || "Periodic rural weekly market (Luma)",
          marketDistanceKm: Number(body.marketDistanceKm || 3.5),
          marketTravelMinutes: Number(body.marketTravelMinutes || 45),
          storageAccess: body.storageAccess || "Hermetic storage (PICS bags / drums)",
          storageCapacityMt: Number(body.storageCapacityMt || 0.5),
          postHarvestLossPct: Number(body.postHarvestLossPct || 10),
          transportMode: body.transportMode || "Motorbike / Kehkeh (Tricycle)",
          transportOwnership: body.transportOwnership || "Hired commercial transporter",
          tillageMechanization: body.tillageMechanization || "Manual (hoe, cutlass)",
          irrigationAccess: body.irrigationAccess || "Rainfed only",
          smartTechReadiness: body.smartTechReadiness || "Basic feature phone (SMS/Voice)",
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
    const HD_STORAGE_KEY = "dfr_help_desk_v2";
    const defaultArticles = [
      { articleCode: "KB-001", title: "How to capture offline field coordinates & cadastral polygons", category: "Field Operations", audience: "Enumerators", summary: "Step-by-step guidance on GPS calibration and saving unverified drafts offline.", content: "1. Calibrate device GPS by stepping outside under open sky.\n2. Verify that horizontal accuracy is under 5 meters.\n3. Walk the perimeter of the holding, pausing at each vertex for 3 seconds.\n4. Save the boundary as a draft. Do not submit without farmer signature or thumbprint." },
      { articleCode: "KB-002", title: "E-Voucher Redemption Protocols & SMS Token Verification", category: "Benefits & Inputs", audience: "Input Agro-dealers", summary: "Verification of farmer DFR ID and SMS OTP before releasing seed and fertilizer inputs.", content: "1. Request the farmer's official DFR ID Card or SMS voucher code.\n2. Scan the QR code or type the 8-digit voucher code into the dealer portal.\n3. Verify the 6-digit confirmation token sent to the farmer's registered phone number.\n4. Dispense only the approved inputs (e.g. NPK 15-15-15, certified lowland rice seed).\n5. Click 'Confirm Distribution' immediately to record the immutable transaction." },
      { articleCode: "KB-003", title: "Registering a farmer or organization in the National DFR", category: "Registration & Identity", audience: "All users", summary: "Use the single Registration button to open the entity-tailored wizard for individuals or cooperatives.", content: "1. Click '＋ New Registration' in the top header or Farmer Registry.\n2. Select either 'Individual Smallholder' or 'Agricultural Organization / Cooperative'.\n3. Complete the 4-step wizard: Basic Bio, Farm Coordinates, Value Chains, and Consent.\n4. A provisional DFR ID is generated immediately for tracking." },
      { articleCode: "KB-004", title: "Recovering an offline synchronization queue on frontline tablets", category: "Offline Synchronization", audience: "Enumerators", summary: "Resolve records that remain stuck in the device synchronization queue after field missions.", content: "1. Confirm cellular or Wi-Fi data connectivity is active.\n2. Navigate to 'Offline Sync' from the left workspace menu.\n3. Inspect the pending queue for any validation errors (e.g. missing coordinates).\n4. Click 'Sync All Records Now'. If records fail, export the offline JSON payload and submit a technical Help Desk ticket." },
      { articleCode: "KB-005", title: "National Data Privacy, Farmer Consent & Biometric Safeguards", category: "Data Privacy & Safeguards", audience: "All users", summary: "Mandatory compliance with Liberia Data Protection Act 2024 and FAO Digital Agriculture Standards.", content: "1. Enumerators must read the Vernacular Consent Statement (English/Kpelle/Bassa) before taking photos or coordinates.\n2. Farmers have the statutory right to inspect, verify, and request corrections.\n3. Biometric and spatial data may never be shared with commercial advertisers or unauthorized third parties." },
    ];

    const getStoredHelpDesk = () => {
      if (typeof window === "undefined") return { tickets: [], articles: defaultArticles };
      try {
        const raw = localStorage.getItem(HD_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (!parsed.articles || !parsed.articles.length) parsed.articles = defaultArticles;
          return parsed;
        }
      } catch {}
      return { tickets: [], articles: defaultArticles };
    };

    const saveStoredHelpDesk = (data: any) => {
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(HD_STORAGE_KEY, JSON.stringify(data));
        } catch {}
      }
    };

    if (method === "GET") {
      const store = getStoredHelpDesk();
      return jsonResponse({
        tickets: store.tickets || [],
        articles: store.articles || defaultArticles,
        access: { canManage: true, role: "Ministry administrator" },
      });
    }

    if (method === "POST" && init?.body) {
      try {
        const body = typeof init.body === "string" ? JSON.parse(init.body) : init.body;
        const store = getStoredHelpDesk();
        store.tickets = store.tickets || [];
        store.articles = store.articles || defaultArticles;

        if (body.action === "create-article") {
          const code = body.articleCode || `KB-${new Date().getFullYear()}-${Date.now().toString().slice(-3)}`;
          const newArticle = {
            articleCode: code,
            title: String(body.title || "").trim(),
            category: String(body.category || "General support").trim(),
            audience: String(body.audience || "All users").trim(),
            summary: String(body.summary || "").trim(),
            content: String(body.content || "").trim(),
            status: String(body.status || "Published"),
            views: 0,
            updatedAt: new Date().toISOString(),
          };
          store.articles = [newArticle, ...store.articles.filter((a: any) => a.articleCode !== code)];
          saveStoredHelpDesk(store);
          return jsonResponse({ ok: true, articleCode: code }, { status: 201 });
        }

        if (body.action === "delete-article") {
          store.articles = store.articles.filter((a: any) => a.articleCode !== body.articleCode);
          saveStoredHelpDesk(store);
          return jsonResponse({ ok: true });
        }

        // Default: Create support ticket
        const code = `HD-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
        const newTicket = {
          ticketCode: code,
          requesterEmail: "hon.nuetah@moa.gov.lr",
          requesterName: "Hon. J. Alexander Nuetah",
          requesterRole: body.requesterRole || "Ministry administrator",
          county: body.county || "National",
          category: body.category || "General support",
          subject: body.subject || "Support Inquiry",
          description: body.description || "",
          priority: body.priority || "Normal",
          sensitivity: body.sensitivity || "Internal",
          status: "Open",
          slaHours: body.priority === "Critical" ? 4 : body.priority === "High" ? 8 : 24,
          dueAt: new Date(Date.now() + 24 * 3600000).toISOString(),
          assignedTeam: "Help Desk",
          assignedTo: "National Triage Officer",
          resolution: "",
          satisfaction: 0,
          createdAt: new Date().toISOString(),
          messages: [{
            id: Date.now(),
            authorName: "Hon. J. Alexander Nuetah",
            authorRole: "Ministry administrator",
            message: body.description || body.subject || "",
            visibility: "Requester-visible",
            createdAt: new Date().toISOString(),
          }],
        };
        store.tickets = [newTicket, ...store.tickets];
        saveStoredHelpDesk(store);
        return jsonResponse({ ok: true, ticketCode: code }, { status: 201 });
      } catch (err: any) {
        return jsonResponse({ error: err.message || "Failed to process request" }, { status: 400 });
      }
    }

    if (method === "PATCH" && init?.body) {
      try {
        const body = typeof init.body === "string" ? JSON.parse(init.body) : init.body;
        const store = getStoredHelpDesk();
        store.tickets = store.tickets || [];
        const idx = store.tickets.findIndex((t: any) => t.ticketCode === body.ticketCode);
        if (idx !== -1) {
          store.tickets[idx] = { ...store.tickets[idx], ...body, updatedAt: new Date().toISOString() };
          saveStoredHelpDesk(store);
        }
        return jsonResponse({ ok: true });
      } catch (err: any) {
        return jsonResponse({ error: err.message || "Update failed" }, { status: 400 });
      }
    }
  }

  // 9b. Institutional Governance & Platform Policies: /api/governance
  if (pathname === "/api/governance") {
    const GOV_STORAGE_KEY = "dfr_governance_v2";
    const defaultPolicies = [
      {
        policyCode: "POL-LBR-001",
        title: "National Smallholder Data Sovereignty & Farmer Privacy Regulation",
        category: "Data Protection & Privacy",
        enforcingBody: "Ministry of Agriculture (MoA) & National Data Protection Authority",
        legalBasis: "Liberia Data Protection Act 2024; Republic of Liberia Telecommunications Act; FAO Guidelines",
        effectiveDate: "2026-01-01",
        reviewCycle: "Annual",
        status: "Active / Enacted",
        summary: "Statutory framework establishing farmer data ownership, explicit consent verification, biometric encryption, and prohibition of unauthorized commercialization of smallholder registries.",
        directives: [
          "Mandatory Informed Consent: No smallholder farmer personal data, photo, or land coordinates may be collected or stored without an explicit, verifiable consent record in the farmer's preferred language (English, Kpelle, Bassa, Mano, Gio).",
          "Purpose Limitation & Non-Commercialization: DFR data is held in public trust exclusively for national food security, input subsidies, extension advisory, and social protection targeting. Resale or monetization to private marketing aggregators is strictly illegal.",
          "Biometric Encryption Standard: Facial portraits, NINs, and spatial coordinates must be encrypted at rest (AES-256) and in transit (TLS 1.3). Decryption keys are managed under multi-party custody.",
          "Right to Free Inspection & Rectification: Any registered smallholder may inspect their holding size, crop declarations, and household records at no cost, and submit controlled correction requests without administrative penalties.",
        ],
      },
      {
        policyCode: "POL-LBR-002",
        title: "Cross-Agency Interoperability & Social Protection Compact (MoA–MGCSP–LISGIS)",
        category: "Interoperability & Data Sharing",
        enforcingBody: "National DFR Inter-Ministerial Steering Committee",
        legalBasis: "Government of Liberia Inter-Agency Circular on Digital Public Infrastructure (DPI)",
        effectiveDate: "2026-03-15",
        reviewCycle: "Biannual",
        status: "Active / Enacted",
        summary: "Binding technical protocol governing secure API exchange between the National Digital Farmer Registry, the National Social Registry (NSR), and LISGIS statistical boundary services.",
        directives: [
          "Zero-Trust Machine Authentication: All inter-system API exchanges must authenticate via mutual TLS (mTLS) with scoped OAuth 2.0 bearer tokens. Unauthenticated public query endpoints are prohibited.",
          "Minimum-Data Exchange Rule: When verifying vulnerability status or disaster relief eligibility with MGCSP, only the categorical eligibility flag and confirmation UUID shall be exchanged. Raw banking or detailed personal records must not be transmitted.",
          "Authoritative Geospatial Boundary Standard: Administrative county, district, and clan boundaries must strictly reference the authoritative LISGIS 2026.1 spatial standard.",
          "Daily Transaction Reconciliation: During active planting or emergency cash distribution cycles, automated reconciliation audits must execute daily at 00:00 GMT.",
        ],
      },
      {
        policyCode: "POL-LBR-003",
        title: "Frontline Enumerator & Extension Agent Geospatial Code of Conduct",
        category: "Field Operations & Enumeration",
        enforcingBody: "Directorate of Agricultural Extension & National Quality Assurance Taskforce",
        legalBasis: "Civil Service Commission Code of Conduct & MoA Operational Regulations",
        effectiveDate: "2026-02-01",
        reviewCycle: "Annual",
        status: "Active / Enacted",
        summary: "Mandatory standards of integrity, GPS boundary mapping accuracy, cultural respect, and safeguarding during rural enumerator missions.",
        directives: [
          "Physical Perimeter Ground Truth: Enumerators must physically traverse farm boundaries with GPS active. Remote polygon digitization without physical inspection constitutes gross misconduct.",
          "Horizontal Accuracy Threshold: Boundary vertices must not be recorded unless the device GPS horizontal accuracy is ≤5 meters (HDOP ≤ 2.0).",
          "Zero Solicitation & Safeguarding: Enumerators and Extension Agents are strictly prohibited from demanding fees, transportation money, or farm produce from smallholders in exchange for registration or advisory services.",
          "48-Hour Sync Requirement: Data collected on offline mobile devices must be synchronized to the central cloud repository within 48 hours of regaining network connectivity.",
        ],
      },
      {
        policyCode: "POL-LBR-004",
        title: "Targeted Agricultural Input Subsidy & Anti-Diversion Regulations",
        category: "Subsidy Distribution & Input Entitlements",
        enforcingBody: "MoA Directorate of Inputs & Agribusiness / FAO Project Operations Office",
        legalBasis: "National Food Security & Input Subsidy Operational Manual",
        effectiveDate: "2026-04-10",
        reviewCycle: "Seasonal",
        status: "Active / Enacted",
        summary: "Operational rules regulating electronic voucher allocation, agro-dealer verification, physical inventory redemption, and anti-fraud monitoring.",
        directives: [
          "Dual-Factor Identity Verification: Input redemption requires physical presentation of the farmer DFR ID Card (QR code) and one-time verification of an SMS token sent to the farmer's verified mobile number.",
          "Certified Inputs Only: Agro-dealers are prohibited from substituting uncertified seed or unauthorized chemical formulations for approved voucher redemption.",
          "Anti-Diversion Monitoring: Selling, transferring, or re-bagging subsidized fertilizers or foundation seed outside designated farming communities triggers immediate merchant license revocation and prosecution.",
          "Mandatory Farmer Receipt Acknowledgement: Beneficiaries must acknowledge physical receipt of inputs via mobile SMS confirmation or counter-signed field voucher slip.",
        ],
      },
      {
        policyCode: "POL-LBR-005",
        title: "DFR Citizen Grievance Redress & Whistleblower Protection Charter",
        category: "Grievance Redress & Transparency",
        enforcingBody: "Independent Grievance Redress Committee & MoA Legal Counsel",
        legalBasis: "Freedom of Information Act & National Administrative Procedure Act",
        effectiveDate: "2026-05-01",
        reviewCycle: "Annual",
        status: "Active / Enacted",
        summary: "Procedures for lodging, escalating, and impartially resolving complaints regarding exclusion, disputed land boundaries, missing vouchers, and administrative malpractice.",
        directives: [
          "Universal Grievance Access: Any citizen may lodge a complaint via web Help Desk, mobile USSD, toll-free telephone hotline, or in person at County Agricultural Offices without any filing fee.",
          "Accountable Resolution Timelines: Urgent safeguarding or fraud allegations must be acknowledged within 4 hours and investigated within 48 hours; general administrative disputes must be resolved within 72 hours.",
          "Whistleblower Protection: Informants reporting corruption, illegal land appropriation, or voucher diversion are guaranteed strict anonymity and legal protection against retaliation.",
          "Independent Appellate Review: Claimants dissatisfied with frontline decisions may request review by the Independent DFR Oversight Panel within 30 days.",
        ],
      },
    ];

    const defaultDictionary = [
      { elementCode: "DFR.PERSON.SEX", name: "Sex", definition: "Sex of the registered person as reported and validated.", domain: "Demographic", dataType: "Code", allowedValues: ["Female", "Male", "Intersex", "Not stated"], standardOwner: "LISGIS", version: "1.1", status: "Standard" },
      { elementCode: "DFR.HH.VULN", name: "Vulnerability classification", definition: "Approved household vulnerability category used for targeting.", domain: "Social protection", dataType: "Multi-code", allowedValues: ["Female-headed", "Youth", "Disability", "Shock-affected", "Food insecure"], standardOwner: "MGCSP", version: "1.0", status: "Standard" },
      { elementCode: "DFR.GEO.COUNTY", name: "County code", definition: "Official county classification for Liberia.", domain: "Geospatial", dataType: "Code", allowedValues: ["Bomi", "Bong", "Gbarpolu", "Grand Bassa", "Grand Cape Mount", "Grand Gedeh", "Grand Kru", "Lofa", "Margibi", "Maryland", "Montserrado", "Nimba", "River Cess", "River Gee", "Sinoe"], standardOwner: "LISGIS", version: "2026.1", status: "Standard" },
      { elementCode: "DFR.CROP.PRIMARY", name: "Primary crop code", definition: "Primary commercial or food security crop cultivated on registered parcel.", domain: "Agronomic", dataType: "Code", allowedValues: ["Rice (Oryza sativa / glaberrima)", "Cassava (Manihot esculenta)", "Cocoa (Theobroma cacao)", "Oil Palm (Elaeis guineensis)", "Rubber (Hevea brasiliensis)", "Coffee (Coffea liberica / robusta)", "Horticultural vegetables"], standardOwner: "MoA Agribusiness", version: "1.2", status: "Standard" },
      { elementCode: "DFR.LAND.TENURE", name: "Land tenure right type", definition: "Customary, statutory, or communal land right under the Land Rights Act 2018.", domain: "Tenure & Rights", dataType: "Code", allowedValues: ["Customary Land Certificate", "Statutory Fee-Simple Deed", "Registered Leasehold", "Communal Farm Agreement", "Provisional Community Allocation"], standardOwner: "Liberia Land Authority (LLA)", version: "1.0", status: "Standard" },
      { elementCode: "DFR.FIN.MOBILE", name: "Mobile money MSISDN", definition: "Normalized E.164 mobile number registered for subsidy disbursement.", domain: "Payments & Financial", dataType: "String", allowedValues: ["Lonestar Cell MTN (+23188...)", "Orange Liberia (+23177...)"], standardOwner: "Central Bank of Liberia", version: "2.0", status: "Standard" },
      { elementCode: "DFR.INFRA.ROAD_PASSABILITY", name: "Farm-to-Market Road Passability", definition: "Physical condition and seasonal vehicular access of feeder road connecting holding to transport network.", domain: "Infrastructure & Logistics", dataType: "Code", allowedValues: ["Paved / all-weather year-round", "Laterite / gravel passable year-round", "Dry-season motorable only", "Footpath / canoe transport only", "Impassable during rainy season"], standardOwner: "Ministry of Public Works (MPW) / MoA", version: "1.0", status: "Standard" },
      { elementCode: "DFR.INFRA.MARKET_OUTLET", name: "Primary Commercial Market Channel", definition: "Principal trading channel or aggregation point where farmer sells agricultural surplus.", domain: "Trade & Market Access", dataType: "Code", allowedValues: ["Periodic rural weekly market (Luma)", "Farmgate itinerant buyer / middleman", "District / County urban market center", "Formal commercial processor / off-taker", "Institutional procurement (WFP / MoA)"], standardOwner: "Ministry of Commerce & Industry (MoCI)", version: "1.0", status: "Standard" },
      { elementCode: "DFR.INFRA.STORAGE_TYPE", name: "Post-Harvest Storage Facility Type", definition: "Primary storage structure utilized on holding or accessible within community.", domain: "Post-Harvest & Storage", dataType: "Code", allowedValues: ["None / Immediate farmgate distress sale", "Traditional crib / thatch granary", "Hermetic storage (PICS bags / sealed drums)", "Community / Cooperative aggregation warehouse", "Solar drying floor & parabolic shed", "Temperature-controlled / cold room storage"], standardOwner: "MoA Post-Harvest & Agro-Processing Unit", version: "1.0", status: "Standard" },
      { elementCode: "DFR.INFRA.TRANSPORT_MODE", name: "Produce Haulage & Transport Mode", definition: "Predominant mode of physical conveyance used to haul commodities from farmgate to market.", domain: "Infrastructure & Logistics", dataType: "Code", allowedValues: ["Head-loading / Porterage", "Bicycle / Wheelbarrow", "Motorbike / Kehkeh (Tricycle)", "Light truck / 4WD pickup", "Heavy commercial lorry (> 5 MT)", "Watercraft / Canoe / Motorized boat"], standardOwner: "Ministry of Transport / MoA Logistics", version: "1.0", status: "Standard" },
      { elementCode: "DFR.INFRA.MECHANIZATION_LEVEL", name: "Farm Mechanization & Smart Tech Level", definition: "Level of power machinery, processing equipment, and digital tools utilized on agricultural holding.", domain: "Agricultural Engineering", dataType: "Code", allowedValues: ["Manual hand-tools only", "Animal traction / draft power", "Power tiller / 2-wheel walking tractor", "4-wheel commercial tractor (owned/rented)", "Motorized processing mill (rice thresher/cassava grater)", "Solar-powered drip / sprinkler irrigation", "Digital precision / IoT soil probe & weather kit"], standardOwner: "MoA Engineering & Mechanization Directorate", version: "1.0", status: "Standard" },
    ];

    const defaultAgreements = [
      {
        agreementCode: "DSA-MOA-MGCSP-001",
        title: "Agriculture–Social Protection Minimum-Data Exchange Compact",
        providerInstitution: "Ministry of Agriculture (MoA)",
        recipientInstitution: "Ministry of Gender, Children and Social Protection (MGCSP)",
        datasets: ["DFR-FARMER", "DFR-VULN"],
        purpose: "Targeted disaster relief eligibility referral and automated beneficiary verification.",
        legalBasis: "Approved inter-ministerial data-sharing protocol & Liberia Social Protection Policy",
        sensitivity: "Highly restricted",
        accessProtocol: "OAuth 2.0 + mTLS; automated field minimization; immutable event logging",
        status: "Active",
        effectiveDate: "2026-07-01",
        expiryDate: "2027-06-30",
        reviewDate: "2026-10-01",
      },
      {
        agreementCode: "DSA-MOA-LISGIS-002",
        title: "Geospatial Standards and Boundary Quality Assurance Agreement",
        providerInstitution: "LISGIS",
        recipientInstitution: "Ministry of Agriculture (MoA)",
        datasets: ["DFR-GEO"],
        purpose: "Official administrative reference and parcel topology validation for national census.",
        legalBasis: "Government statistical and geospatial mandate Act of 2004",
        sensitivity: "Restricted",
        accessProtocol: "Signed GeoJSON packages and controlled REST query API",
        status: "Active",
        effectiveDate: "2026-06-15",
        expiryDate: "2027-06-14",
        reviewDate: "2026-09-15",
      },
      {
        agreementCode: "DSA-MOA-CBL-003",
        title: "Smallholder Rural Financial Inclusion & Mobile Money KYC Protocol",
        providerInstitution: "Ministry of Agriculture (MoA)",
        recipientInstitution: "Central Bank of Liberia (CBL)",
        datasets: ["DFR-FARMER"],
        purpose: "Automated identity verification for unbanked smallholders receiving emergency fertilizer cash transfers.",
        legalBasis: "National Financial Inclusion Strategy 2024–2029 & Central Bank Regulations",
        sensitivity: "Restricted",
        accessProtocol: "Hashed identity token match via ISO 20022 gateway; zero PII storage",
        status: "Draft for signature",
        effectiveDate: "2026-09-01",
        expiryDate: "2027-08-31",
        reviewDate: "2026-11-01",
      },
      {
        agreementCode: "DSA-MOA-LRA-004",
        title: "Agricultural Input Duty-Free Tax Exemption Data Verification Protocol",
        providerInstitution: "Ministry of Agriculture (MoA)",
        recipientInstitution: "Liberia Revenue Authority (LRA)",
        datasets: ["DFR-COOP", "DFR-FARMER"],
        purpose: "Immediate customs port clearance for certified cooperative tractors, irrigation gear, and foundation seed.",
        legalBasis: "Liberia Revenue Code (Amended) Section 1708 (Agricultural Exemptions)",
        sensitivity: "Official-use",
        accessProtocol: "Encrypted webhook validation & QR verification lookup",
        status: "Active",
        effectiveDate: "2026-05-01",
        expiryDate: "2027-04-30",
        reviewDate: "2026-12-01",
      },
    ];

    const defaultExchanges = [
      {
        connectorCode: "CONN-NIR",
        systemName: "National Identification Registry (NIR) Citizen Verification",
        ownerInstitution: "National Identification Registry (NIR)",
        direction: "Bidirectional",
        endpointAlias: "/api/v1/citizens/verify-nin",
        standard: "REST/JSON · OpenAPI 3.1",
        mappingVersion: "3.0",
        environment: "Production",
        status: "Active / Live",
        lastTestedAt: "2026-08-03 09:15",
        lastExchangeAt: "2026-08-03 10:45",
        result: "mTLS handshake verified · NIN token validation & biometric duplicate check operational",
        records: 4250,
        correlationId: "NIR-VERIFY-4250",
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
        status: "Active / Live",
        lastTestedAt: "2026-08-02 11:30",
        lastExchangeAt: "2026-08-02 14:20",
        result: "Vital status feed active · Automatic retirement of deceased beneficiary accounts",
        records: 310,
        correlationId: "CRVS-SYNC-0310",
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
        status: "Active / Live",
        lastTestedAt: "2026-08-03 08:30",
        lastExchangeAt: "2026-08-03 11:00",
        result: "MoA–MGCSP Compact active · Cross-registry poverty score & PMT triage synchronized",
        records: 1840,
        correlationId: "NSR-TRIAGE-1840",
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
        status: "Active / Live",
        lastTestedAt: "2026-08-02 16:40",
        lastExchangeAt: "2026-08-02 17:15",
        result: "SOP-04 protocol verified · Emergency cash transfer batches routed without duplication",
        records: 920,
        correlationId: "LSSNP-SCT-0920",
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
        status: "Active / Live",
        lastTestedAt: "2026-08-03 07:45",
        lastExchangeAt: "2026-08-03 12:30",
        result: "Real-time agro-dealer redemption live · Seed, fertilizer & tool quotas reconciled",
        records: 5120,
        correlationId: "SUBSIDY-RED-5120",
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
        status: "Active / Live",
        lastTestedAt: "2026-07-31 09:15",
        lastExchangeAt: "2026-07-31 16:30",
        result: "National enumeration areas (EAs) & decennial agricultural census metrics aligned",
        records: 6400,
        correlationId: "LISGIS-CENSUS-6400",
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
        status: "Active / Live",
        lastTestedAt: "2026-08-01 14:00",
        lastExchangeAt: "2026-08-01 15:30",
        result: "Customary land deeds, boundary topology, and concession overlap screening active",
        records: 890,
        correlationId: "LLA-CAD-0890",
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
        status: "Active / Live",
        lastTestedAt: "2026-08-03 06:00",
        lastExchangeAt: "2026-08-03 06:15",
        result: "Dekadal rainfall anomaly, drought alerts & seasonal planting calendars ingested",
        records: 15,
        correlationId: "MET-DEKAD-0015",
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
        status: "Active / Live",
        lastTestedAt: "2026-08-02 10:15",
        lastExchangeAt: "2026-08-02 13:45",
        result: "Consent-governed farmer KYC screening, credit evaluation & loan tracking active",
        records: 740,
        correlationId: "BANK-KYC-0740",
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
        status: "Active / Live",
        lastTestedAt: "2026-08-03 10:00",
        lastExchangeAt: "2026-08-03 11:20",
        result: "MSISDN ownership validation (+231) & 2-way agronomic USSD push gateway operational",
        records: 8650,
        correlationId: "TELCO-VAL-8650",
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
        status: "Active / Live",
        lastTestedAt: "2026-08-03 09:30",
        lastExchangeAt: "2026-08-03 12:00",
        result: "Real-time payment callback active · 1,420 subsidy tranches cleared without delay",
        records: 1420,
        correlationId: "CBL-TX-1420",
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
        status: "Active / Live",
        lastTestedAt: "2026-08-01 18:00",
        lastExchangeAt: "2026-08-01 18:30",
        result: "Anonymized SDG 2.3.1 & 2.3.2 productivity and smallholder income metrics published",
        records: 15,
        correlationId: "SDG-STAT-0015",
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
        status: "Active / Live",
        lastTestedAt: "2026-08-02 15:30",
        lastExchangeAt: "2026-08-02 16:00",
        result: "Single-window customs agricultural duty exemptions & national DPI bus connected",
        records: 185,
        correlationId: "EGOV-ASY-0185",
      },
    ];

    const defaultAudit = [
      {
        id: 1,
        createdAt: "2026-08-02 12:00",
        actor: "Central Bank Gateway (CBL)",
        action: "SUBSIDY_BATCH_RECONCILED",
        entity: "CONN-CBL-MM",
        details: "Automated ISO 20022 reconciliation completed for 1,420 mobile subsidy transfers.",
        sha256Hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      },
      {
        id: 2,
        createdAt: "2026-08-02 11:45",
        actor: "CDA Registrar",
        action: "COOPERATIVE_REGISTRY_SYNC",
        entity: "CONN-CDA",
        details: "48 verified cooperatives synchronized with central national registry.",
        sha256Hash: "8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4",
      },
      {
        id: 3,
        createdAt: "2026-08-02 09:15",
        actor: "Hon. J. Alexander Nuetah (Minister of Agriculture)",
        action: "PLATFORM_POLICY_ENACTED",
        entity: "POL-LBR-001",
        details: "Enacted National Agricultural Data Sovereignty & Protection Directive.",
        sha256Hash: "a2b9f3c7e8d1a4b6c5e2f9d8c7a1b3e5f7d9c1a3b5e7f9d1c3a5b7e9f1d3c5a7",
      },
      {
        id: 4,
        createdAt: "2026-08-01 16:30",
        actor: "LISGIS Geo-Information Directorate",
        action: "BOUNDARY_STANDARDS_UPDATE",
        entity: "DFR.GEO.COUNTY",
        details: "Published authoritative 15-county geospatial boundary release 2026.1.",
        sha256Hash: "c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5",
      },
      {
        id: 5,
        createdAt: "2026-08-01 10:30",
        actor: "National Governance Secretariat",
        action: "GOVERNANCE_CONTROL_FRAMEWORK_INIT",
        entity: "National DFR",
        details: "Institutional accounts, data stewardship RACI, validation workflows, metadata, and exchange controls established.",
        sha256Hash: "b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2",
      },
    ];

    const getStoredGovernance = () => {
      if (typeof window === "undefined") {
        return {
          policies: defaultPolicies,
          dictionary: defaultDictionary,
          agreements: defaultAgreements,
          exchanges: defaultExchanges,
          audit: defaultAudit,
        };
      }
      try {
        const raw = localStorage.getItem(GOV_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (!parsed.policies || !parsed.policies.length) parsed.policies = defaultPolicies;
          if (!parsed.dictionary || !parsed.dictionary.length) parsed.dictionary = defaultDictionary;
          if (!parsed.agreements || !parsed.agreements.length) parsed.agreements = defaultAgreements;
          if (!parsed.exchanges || !parsed.exchanges.length) parsed.exchanges = defaultExchanges;
          if (!parsed.audit || !parsed.audit.length) parsed.audit = defaultAudit;
          return parsed;
        }
      } catch {}
      return {
        policies: defaultPolicies,
        dictionary: defaultDictionary,
        agreements: defaultAgreements,
        exchanges: defaultExchanges,
        audit: defaultAudit,
      };
    };

    const saveStoredGovernance = (data: any) => {
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(GOV_STORAGE_KEY, JSON.stringify(data));
        } catch {}
      }
    };

    if (method === "GET") {
      const store = getStoredGovernance();
      return jsonResponse({
        institutions: [
          { institutionCode: "MOA", name: "Ministry of Agriculture", mandate: "Lead institution and official owner of national agricultural data and services.", accountRole: "Lead data owner", contentResponsibilities: ["Farmer and farm registry", "Production and value chains", "Agricultural programmes", "Publication approval"] },
          { institutionCode: "MGCSP", name: "Ministry of Gender, Children and Social Protection", mandate: "Social protection, gender equality, vulnerability and beneficiary validation.", accountRole: "Social protection validator", contentResponsibilities: ["Household vulnerability", "Social protection participation", "Gender and inclusion", "Beneficiary validation"] },
          { institutionCode: "CDA", name: "Cooperative Development Agency", mandate: "Certification, profiling and strengthening of cooperatives and farmer organizations.", accountRole: "Cooperative certifier", contentResponsibilities: ["Cooperative certification", "Organization governance", "Membership records", "Compliance status"] },
          { institutionCode: "LISGIS", name: "Liberia Institute of Statistics and Geo-Information Services", mandate: "Statistical standards, geospatial reference data, boundaries and national harmonization.", accountRole: "Statistical and GIS authority", contentResponsibilities: ["Data classifications", "Administrative boundaries", "Geospatial quality", "Survey harmonization"] },
          { institutionCode: "LOCAL", name: "County, District and Community Authorities", mandate: "Validated local contributions, field confirmation, endorsement and escalation.", accountRole: "Local endorsing authority", contentResponsibilities: ["Community submissions", "Farm location endorsement", "Production updates", "Local corrections"] },
        ],
        datasets: [
          { id: 1, datasetCode: "DFR-FARMER", title: "National Farmer & Farm Master Registry", domain: "Agriculture", ownerInstitution: "MOA", stewardInstitution: "MOA", custodianInstitution: "MOA ICT", approvingAuthority: "MOA Chief Data Officer", sensitivity: "Restricted", accessRule: "Purpose-bound role and geographic scope", classificationStandard: "DFR Core v1.2", lastReviewedAt: "2026-07-15", nextReviewAt: "2026-10-13", version: "1.2", status: "Active", reviewFrequencyDays: 90 },
          { id: 2, datasetCode: "DFR-VULN", title: "Household Vulnerability & Social Protection", domain: "Social protection", ownerInstitution: "MGCSP", stewardInstitution: "MGCSP", custodianInstitution: "DFR Operations", approvingAuthority: "MGCSP Director", sensitivity: "Highly restricted", accessRule: "Explicit purpose, minimum fields, logged access", classificationStandard: "National Social Registry mapping v0.9", lastReviewedAt: "2026-04-01", nextReviewAt: "2026-06-30", version: "0.9", status: "Pending Review", reviewFrequencyDays: 90 },
          { id: 3, datasetCode: "DFR-COOP", title: "Cooperatives & Producer Organizations", domain: "Organizations", ownerInstitution: "CDA", stewardInstitution: "CDA", custodianInstitution: "MOA Registry Unit", approvingAuthority: "CDA Registrar", sensitivity: "Official-use", accessRule: "Organization verification roles; public summary only", classificationStandard: "CDA Cooperative Profile v1.0", lastReviewedAt: "2026-07-12", nextReviewAt: "2026-10-10", version: "1.0", status: "Active", reviewFrequencyDays: 90 },
          { id: 4, datasetCode: "DFR-GEO", title: "Administrative Boundaries & Farm Parcels", domain: "Geospatial", ownerInstitution: "LISGIS", stewardInstitution: "LISGIS", custodianInstitution: "MOA GIS Unit", approvingAuthority: "LISGIS Geo-Information Director", sensitivity: "Restricted", accessRule: "Generalized public view; exact parcels controlled", classificationStandard: "WGS84 / EPSG:4326; GeoJSON", lastReviewedAt: "2026-06-20", nextReviewAt: "2026-09-18", version: "2026.1", status: "Active", reviewFrequencyDays: 90 },
        ],
        workflows: [
          { id: 1, caseId: "CDA-VER-00041", workflowType: "CDA cooperative certification", subjectRef: "ORG-LR-2026-0041", title: "Foya Cocoa & Rice Farmers Cooperative", submitterInstitution: "MOA", currentInstitution: "CDA", stage: "UNDER_REVIEW", dueDate: "2026-08-07", county: "Lofa", evidenceRef: "CDA certificate, bylaws, officer register" },
          { id: 2, caseId: "MGCSP-VAL-00118", workflowType: "MGCSP vulnerability validation", subjectRef: "HH-LR-00118", title: "Household vulnerability and beneficiary validation", submitterInstitution: "LOCAL", currentInstitution: "MGCSP", stage: "SUBMITTED", dueDate: "2026-08-05", county: "Bong", evidenceRef: "Consent, household roster, field assessment" },
          { id: 3, caseId: "LISGIS-QA-00027", workflowType: "LISGIS geospatial approval", subjectRef: "PARCEL-LR-00027", title: "Parcel boundary and topology quality approval", submitterInstitution: "MOA", currentInstitution: "LISGIS", stage: "CORRECTION_REQUESTED", decision: "Correction required", notes: "Resolve overlap at north-west vertex.", dueDate: "2026-08-04", county: "Nimba", evidenceRef: "GeoJSON, GPS accuracy report" },
          { id: 4, caseId: "LOCAL-END-00076", workflowType: "Community contribution endorsement", subjectRef: "DFR-LR-00076", title: "Community-submitted farmer profile endorsement", submitterInstitution: "Community focal person", currentInstitution: "LOCAL", stage: "APPROVED", decision: "Endorsed", dueDate: "2026-08-03", county: "Grand Bassa", evidenceRef: "Community attestation and field photo" },
        ],
        dictionary: store.dictionary || defaultDictionary,
        agreements: store.agreements || defaultAgreements,
        decisions: [
          { decisionCode: "DGC-RES-2026-008", meetingType: "Data Governance Committee", title: "Adopt minimum-data principle for vulnerability exchange", decisionText: "Only approved eligibility attributes may be exchanged with programme systems.", responsibleInstitution: "MOA/MGCSP", actionOwner: "Data Protection Working Group", dueDate: "2026-08-14", priority: "High", escalationLevel: "Committee", status: "In progress" },
          { decisionCode: "GIS-WG-2026-014", meetingType: "Geospatial Working Group", title: "Approve LISGIS boundary release 2026.1", decisionText: "Use release 2026.1 as authoritative administrative reference after topology validation.", responsibleInstitution: "LISGIS", actionOwner: "MOA GIS Unit", dueDate: "2026-08-07", priority: "Normal", escalationLevel: "Working group", status: "Open" },
        ],
        exchanges: store.exchanges || defaultExchanges,
        audit: store.audit || defaultAudit,
        policies: store.policies || defaultPolicies,
        today: "2026-08-02",
      });
    }

    if (method === "POST" && init?.body) {
      try {
        const body = typeof init.body === "string" ? JSON.parse(init.body) : init.body;
        const store = getStoredGovernance();
        store.policies = store.policies || defaultPolicies;
        store.dictionary = store.dictionary || defaultDictionary;
        store.agreements = store.agreements || defaultAgreements;
        store.exchanges = store.exchanges || defaultExchanges;
        store.audit = store.audit || defaultAudit;

        // 1. Policy actions
        if (body.action === "create-policy") {
          const code = body.policyCode || `POL-LBR-${Date.now().toString().slice(-4)}`;
          const newPolicy = {
            policyCode: code,
            title: String(body.title || "").trim(),
            category: String(body.category || "Data Protection & Privacy").trim(),
            enforcingBody: String(body.enforcingBody || "Ministry of Agriculture (MoA)").trim(),
            legalBasis: String(body.legalBasis || "Liberia National Agriculture Policy").trim(),
            effectiveDate: body.effectiveDate || new Date().toISOString().slice(0, 10),
            reviewCycle: body.reviewCycle || "Annual",
            status: body.status || "Active / Enacted",
            summary: String(body.summary || "").trim(),
            directives: Array.isArray(body.directives) ? body.directives : String(body.directives || "").split("\n").filter(Boolean),
          };
          store.policies = [newPolicy, ...store.policies.filter((p: any) => p.policyCode !== code)];
          store.audit = [
            {
              id: Date.now(),
              createdAt: new Date().toISOString().slice(0, 16).replace("T", " "),
              actor: body.actor || "Ministry Administrator",
              action: "PLATFORM_POLICY_ENACTED",
              entity: code,
              details: `Enacted policy: ${newPolicy.title}`,
              sha256Hash: `sha256:${Date.now().toString(16)}${Math.random().toString(16).slice(2)}`,
            },
            ...store.audit,
          ];
          saveStoredGovernance(store);
          return jsonResponse({ ok: true, policyCode: code }, { status: 201 });
        }

        if (body.action === "delete-policy") {
          store.policies = store.policies.filter((p: any) => p.policyCode !== body.policyCode);
          saveStoredGovernance(store);
          return jsonResponse({ ok: true });
        }

        // 2. Data dictionary actions
        if (body.action === "create-dictionary-item") {
          const code = body.elementCode || `DFR.${Date.now().toString().slice(-4)}`;
          const newItem = {
            elementCode: code,
            name: String(body.name || code).trim(),
            definition: String(body.definition || "").trim(),
            domain: String(body.domain || "Agronomic").trim(),
            dataType: String(body.dataType || "Code").trim(),
            allowedValues: Array.isArray(body.allowedValues)
              ? body.allowedValues
              : String(body.allowedValues || "").split(",").map((s) => s.trim()).filter(Boolean),
            standardOwner: String(body.standardOwner || "Ministry of Agriculture (MoA)").trim(),
            version: body.version || "1.0",
            status: body.status || "Standard",
          };
          store.dictionary = [newItem, ...store.dictionary.filter((d: any) => d.elementCode !== code)];
          store.audit = [
            {
              id: Date.now(),
              createdAt: new Date().toISOString().slice(0, 16).replace("T", " "),
              actor: body.actor || "Data Standards Steward",
              action: "DATA_DICTIONARY_STANDARD_REGISTERED",
              entity: code,
              details: `Registered data element standard: ${newItem.name} (${newItem.domain})`,
              sha256Hash: `sha256:${Date.now().toString(16)}${Math.random().toString(16).slice(2)}`,
            },
            ...store.audit,
          ];
          saveStoredGovernance(store);
          return jsonResponse({ ok: true, elementCode: code }, { status: 201 });
        }

        if (body.action === "delete-dictionary-item") {
          store.dictionary = store.dictionary.filter((d: any) => d.elementCode !== body.elementCode);
          saveStoredGovernance(store);
          return jsonResponse({ ok: true });
        }

        // 3. Sharing agreement actions
        if (body.action === "create-agreement") {
          const code = body.agreementCode || `DSA-MOA-${Date.now().toString().slice(-4)}`;
          const newAg = {
            agreementCode: code,
            title: String(body.title || "").trim(),
            providerInstitution: String(body.providerInstitution || "Ministry of Agriculture (MoA)").trim(),
            recipientInstitution: String(body.recipientInstitution || "Partner Agency").trim(),
            datasets: Array.isArray(body.datasets)
              ? body.datasets
              : String(body.datasets || "").split(",").map((s) => s.trim()).filter(Boolean),
            purpose: String(body.purpose || "").trim(),
            legalBasis: String(body.legalBasis || "Inter-Agency Data Sharing Protocol").trim(),
            sensitivity: String(body.sensitivity || "Restricted").trim(),
            accessProtocol: String(body.accessProtocol || "OAuth 2.0 + mTLS; audit logging").trim(),
            status: body.status || "Active",
            effectiveDate: body.effectiveDate || new Date().toISOString().slice(0, 10),
            expiryDate: body.expiryDate || "2027-12-31",
            reviewDate: body.reviewDate || "2026-12-01",
          };
          store.agreements = [newAg, ...store.agreements.filter((a: any) => a.agreementCode !== code)];
          store.audit = [
            {
              id: Date.now(),
              createdAt: new Date().toISOString().slice(0, 16).replace("T", " "),
              actor: body.actor || "Legal & Interoperability Directorate",
              action: "DATA_SHARING_AGREEMENT_EXECUTED",
              entity: code,
              details: `Executed compact between ${newAg.providerInstitution} and ${newAg.recipientInstitution}`,
              sha256Hash: `sha256:${Date.now().toString(16)}${Math.random().toString(16).slice(2)}`,
            },
            ...store.audit,
          ];
          saveStoredGovernance(store);
          return jsonResponse({ ok: true, agreementCode: code }, { status: 201 });
        }

        if (body.action === "sign-agreement") {
          store.agreements = store.agreements.map((a: any) =>
            a.agreementCode === body.agreementCode ? { ...a, status: "Active" } : a
          );
          saveStoredGovernance(store);
          return jsonResponse({ ok: true });
        }

        if (body.action === "delete-agreement") {
          store.agreements = store.agreements.filter((a: any) => a.agreementCode !== body.agreementCode);
          saveStoredGovernance(store);
          return jsonResponse({ ok: true });
        }

        // 4. Interoperability connector actions
        if (body.action === "create-connector") {
          const code = body.connectorCode || `CONN-${Date.now().toString().slice(-4)}`;
          const newConn = {
            connectorCode: code,
            systemName: String(body.systemName || "").trim(),
            ownerInstitution: String(body.ownerInstitution || "Partner Ministry").trim(),
            direction: String(body.direction || "Bidirectional").trim(),
            endpointAlias: String(body.endpointAlias || "/api/v1/exchange").trim(),
            standard: String(body.standard || "REST/JSON · OpenAPI 3.1").trim(),
            mappingVersion: String(body.mappingVersion || "1.0").trim(),
            environment: String(body.environment || "Sandbox").trim(),
            status: body.status || "Active / Live",
            lastTestedAt: new Date().toISOString().slice(0, 16).replace("T", " "),
            lastExchangeAt: "Pending first scheduled sync",
            result: "Gateway connection configured and credentials validated",
            records: 0,
            correlationId: `CFG-${Date.now().toString().slice(-4)}`,
          };
          store.exchanges = [newConn, ...store.exchanges.filter((c: any) => c.connectorCode !== code)];
          store.audit = [
            {
              id: Date.now(),
              createdAt: new Date().toISOString().slice(0, 16).replace("T", " "),
              actor: body.actor || "Interoperability Lead",
              action: "API_CONNECTOR_REGISTERED",
              entity: code,
              details: `Registered connector for ${newConn.systemName} (${newConn.standard})`,
              sha256Hash: `sha256:${Date.now().toString(16)}${Math.random().toString(16).slice(2)}`,
            },
            ...store.audit,
          ];
          saveStoredGovernance(store);
          return jsonResponse({ ok: true, connectorCode: code }, { status: 201 });
        }

        if (body.action === "test-connector") {
          const nowStr = new Date().toISOString().slice(0, 16).replace("T", " ");
          store.exchanges = store.exchanges.map((c: any) =>
            c.connectorCode === body.connectorCode
              ? {
                  ...c,
                  status: "Active / Live",
                  lastTestedAt: nowStr,
                  result: "Handshake verified · HTTP 200 OK · mTLS 1.3 latency 48ms",
                }
              : c
          );
          saveStoredGovernance(store);
          return jsonResponse({ ok: true, latencyMs: 48, status: "Handshake verified" });
        }

        if (body.action === "trigger-sync") {
          const nowStr = new Date().toISOString().slice(0, 16).replace("T", " ");
          const newRecords = Math.floor(Math.random() * 50) + 20;
          const corrId = `SYNC-${Date.now().toString().slice(-6)}`;
          store.exchanges = store.exchanges.map((c: any) =>
            c.connectorCode === body.connectorCode
              ? {
                  ...c,
                  status: "Active / Live",
                  lastExchangeAt: nowStr,
                  records: (c.records || 0) + newRecords,
                  result: `Synchronized ${newRecords} incremental records successfully`,
                  correlationId: corrId,
                }
              : c
          );
          store.audit = [
            {
              id: Date.now(),
              createdAt: nowStr,
              actor: "Automated Gateway Scheduler",
              action: "API_CONNECTOR_BATCH_SYNC",
              entity: body.connectorCode,
              details: `Batch synchronization executed for ${body.connectorCode}: ${newRecords} records transferred. Correlation: ${corrId}`,
              sha256Hash: `sha256:${Date.now().toString(16)}${Math.random().toString(16).slice(2)}`,
            },
            ...store.audit,
          ];
          saveStoredGovernance(store);
          return jsonResponse({ ok: true, recordsAdded: newRecords, correlationId: corrId });
        }

        if (body.action === "delete-connector") {
          store.exchanges = store.exchanges.filter((c: any) => c.connectorCode !== body.connectorCode);
          saveStoredGovernance(store);
          return jsonResponse({ ok: true });
        }

        // 5. Forensic audit verification
        if (body.action === "verify-audit-chain") {
          return jsonResponse({
            ok: true,
            verifiedCount: store.audit.length,
            algorithm: "SHA-256 Merkel Linked Chain",
            status: "CHAIN_INTEGRITY_VALID",
            rootHash: "sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
            verifiedAt: new Date().toISOString(),
          });
        }
      } catch (err: any) {
        return jsonResponse({ error: err.message || "Failed to process governance action" }, { status: 400 });
      }
    }

    if (method === "PATCH" && init?.body) {
      return jsonResponse({ ok: true });
    }

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
