"use client";

import { FormEvent, useState, useMemo } from "react";
import { printElementById, provisionRegisteredUser } from "../../lib/demo-users";

export interface OrgRegistrationWizardProps {
  close: () => void;
  notify: (s: string) => void;
  refresh: () => Promise<void>;
  initialType?: string;
  onSuccess?: (party: any) => void;
}

const entityTypes = [
  { id: "Farmer group", title: "Farmer group", detail: "Informal association, membership and community endorsement", icon: "FG", badge: "Community Association" },
  { id: "Cooperative", title: "Cooperative", detail: "CDA registration, board, members and certification", icon: "CO", badge: "Governed Cooperative" },
  { id: "Producer organization", title: "Producer organization", detail: "Chapters, officers, commodities and market services", icon: "PO", badge: "Producer Union" },
  { id: "Agribusiness", title: "Agribusiness", detail: "Business identity, farms, facilities, workforce and production", icon: "AB", badge: "Commercial Enterprise" },
  { id: "Service provider", title: "Service provider", detail: "Accreditation, service coverage, equipment and contracts", icon: "SP", badge: "Technical Services" },
  { id: "Supplier", title: "Supplier", detail: "Licences, catalogues, warehouses, inputs and fulfilment", icon: "SU", badge: "Agro-Input Dealer" },
  { id: "Financial institution", title: "Financial institution", detail: "Regulatory identity, products, service points and transactions", icon: "FI", badge: "Financial Actor" },
];

const counties = [
  "Bomi", "Bong", "Gbarpolu", "Grand Bassa", "Grand Cape Mount",
  "Grand Gedeh", "Grand Kru", "Lofa", "Margibi", "Maryland",
  "Montserrado", "Nimba", "River Cess", "River Gee", "Sinoe"
];

const districts: Record<string, string[]> = {
  Bomi: ["Commonwealth", "Klay", "Mecca", "Senjeh"],
  Bong: ["Fuamah", "Jorquelleh", "Kokoyah", "Panta", "Salala", "Suakoko", "Zota"],
  Gbarpolu: ["Belleh", "Bokomu", "Bopolu", "Gbarma", "Kongba"],
  "Grand Bassa": ["District 1", "District 2", "District 3", "District 4", "Neekreen", "Owensgrove", "St. John River"],
  "Grand Cape Mount": ["Garwula", "Gola Konneh", "Porkpa", "Tewor"],
  "Grand Gedeh": ["Gbarzon", "Gbao", "Konobo", "Tchien"],
  "Grand Kru": ["Barclayville", "Buah", "Dorbor", "Garraway", "Sasstown"],
  Lofa: ["Foya", "Kolahun", "Quardu Gboni", "Salayea", "Voinjama", "Zorzor"],
  Margibi: ["Firestone", "Gibi", "Kakata", "Mambah-Kaba"],
  Maryland: ["Barrobo", "Harper", "Karlway", "Pleebo-Sodoken"],
  Montserrado: ["Careysburg", "Greater Monrovia", "St. Paul River", "Todee"],
  Nimba: ["Buu-Yao", "Doe", "Garr Bain", "Gbehlay-Geh", "Gbor", "Sanniquellie-Mahn", "Twan River", "Yarmein"],
  "River Cess": ["Central River Cess", "Doedain", "Fen River", "Jo River", "Norwein"],
  "River Gee": ["Chedepo", "Gbeapo", "Glaro", "Karforh", "Potupo", "Webbo"],
  Sinoe: ["Butaw", "Dugbe River", "Greenville", "Jaedae", "Juarzon", "Kpayan", "Sanquin 1"]
};

const commodities = [
  "Rice – Lowland Paddy",
  "Rice – Upland Seed Rice",
  "Cassava & Gari",
  "Cocoa",
  "Coffee",
  "Oil palm",
  "Rubber",
  "Maize / Corn",
  "Vegetables & Horticulture",
  "Plantain & Banana",
  "Soybeans & Legumes",
  "Poultry & Livestock",
  "Fisheries & Aquaculture",
  "Agro-Mechanization & Services",
  "Multi-commodity"
];

const serviceOptions = [
  "Produce Aggregation & Bulking",
  "Mechanized Land Preparation & Tillage",
  "Certified Seed Multiplication",
  "Fertilizer & Crop Protection Supply",
  "Post-Harvest Drying & Milling",
  "Cold Storage & Packhouse",
  "Transport & Logistics",
  "Microcredit & Input Financing",
  "Agronomic Training & Extension",
  "Offtaker & Market Contracting"
];

export default function OrganizationRegistrationWizard({
  close,
  notify,
  refresh,
  initialType = "Cooperative",
  onSuccess,
}: OrgRegistrationWizardProps) {
  const matchingType = entityTypes.find(
    (t) => t.id.toLowerCase() === initialType.toLowerCase() || t.title.toLowerCase() === initialType.toLowerCase()
  ) || entityTypes[1];

  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState(matchingType.id);
  const [county, setCounty] = useState("Nimba");
  const [district, setDistrict] = useState(districts["Nimba"][0]);
  const [draft, setDraft] = useState<Record<string, string>>({
    primaryCommodity: "Cocoa",
    legalForm: "Registered Cooperative Society",
  });
  const [busy, setBusy] = useState(false);
  const [registeredOrg, setRegisteredOrg] = useState<any | null>(null);

  const activeEntity = entityTypes.find((t) => t.id === selectedType) || entityTypes[0];

  const updateDraft = (name: string, value: string) => {
    setDraft((prev) => ({ ...prev, [name]: value }));
  };

  const handleCountyChange = (c: string) => {
    setCounty(c);
    const dList = districts[c] || [];
    setDistrict(dList[0] || "");
  };

  const captureLocation = () => {
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setDraft((prev) => ({
            ...prev,
            latitude: pos.coords.latitude.toFixed(6),
            longitude: pos.coords.longitude.toFixed(6),
          }));
          notify("GPS coordinates captured successfully.");
        },
        () => {
          notify("Location access denied or unavailable. Please enter coordinates manually.");
        }
      );
    } else {
      notify("Geolocation is not supported by your browser.");
    }
  };

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);

    const payload = {
      partyType: selectedType,
      legalName: draft.legalName || "Unnamed Organization",
      acronym: draft.acronym || "",
      legalForm: draft.legalForm || "Registered Entity",
      registrationNumber: draft.registrationNumber || draft.cdaCertificateNumber || draft.businessLicenseNumber || draft.cblLicenseNumber || "",
      taxId: draft.taxId || "",
      establishedDate: draft.establishedDate || "",
      representativeName: draft.representativeName || "Authorized Official",
      phone: draft.phone || "",
      email: draft.email || "",
      county,
      district,
      community: draft.community || "Central",
      memberCount: Number(draft.memberCount) || 0,
      womenMembers: Number(draft.womenMembers) || 0,
      youthMembers: Number(draft.youthMembers) || 0,
      primaryCommodity: draft.primaryCommodity || "Multi-commodity",
      verificationStatus: "Pending verification",
      status: "Active",
      metadata: {
        governance: draft.governanceBody || "Executive Board",
        assemblyFrequency: draft.assemblyFrequency || "Quarterly",
        services: draft.services || "",
        facilitySummary: draft.facilitySummary || "",
        warehouseCapacityMt: draft.warehouseCapacityMt || "0",
        storageType: draft.storageType || "Certified Central Warehouse",
        coldChainAccess: draft.coldChainAccess || "None",
        transportFleetType: draft.transportFleetType || "Member-provided motorbikes",
        transportVehicleCount: draft.transportVehicleCount || "0",
        roadPassability: draft.roadPassability || "Laterite / gravel year-round",
        mechanizationPool: draft.mechanizationPool || "Owns power tillers (2-wheel)",
        machineryCount: draft.machineryCount || "0",
        mechanizationService: draft.mechanizationService || "Internal cooperative use only",
        marketOutlet: draft.marketOutlet || "Formal buyer contracts",
        aggregationVolumeMt: draft.aggregationVolumeMt || "0",
        processingCapacity: draft.processingCapacity || "",
        cdaCertificate: draft.cdaCertificateNumber || "",
        businessLicense: draft.businessLicenseNumber || "",
        cblLicense: draft.cblLicenseNumber || "",
        headquartersAddress: draft.headquartersAddress || "",
        coverageScope: draft.coverageScope || "District-wide",
        mobileMoneyAccount: draft.mobileMoneyAccount || "",
        latitude: draft.latitude || "",
        longitude: draft.longitude || "",
      },
    };

    try {
      const res = await fetch("/api/parties", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      setBusy(false);

      if (res.ok) {
        const partyId = data.partyId || `ORG-${selectedType.slice(0, 4).toUpperCase()}-${Date.now().toString().slice(-5)}`;
        const role = selectedType.includes("Cooperative")
          ? "Cooperative representative"
          : selectedType.includes("Agribusiness")
          ? "Agribusiness representative"
          : "Organization administrator";
        const repName = draft.representativeName || `${draft.legalName || "Organization"} Official`;
        const provision = provisionRegisteredUser({
          name: repName,
          email: draft.email,
          phone: draft.phone,
          role,
          dfrId: partyId,
          county,
          district,
          institution: draft.legalName || "Registered Agricultural Organization",
          category: "producer",
        });

        setRegisteredOrg({
          ...data,
          partyId,
          legalName: draft.legalName || "Unnamed Organization",
          repName,
          tempPassword: provision.tempPassword,
          accountUser: provision.user,
          enrolledAt: new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
        });

        setStep(6);
        notify(`Official registration complete! ${partyId} created and queued for CAO verification.`);
        await refresh();
        if (onSuccess) onSuccess(data);
      } else {
        notify(data.error || "Organization registration could not be completed.");
      }
    } catch {
      setBusy(false);
      notify("Network error. The entity was queued into the secure offline register.");
      close();
    }
  }

  const steps = [
    "Entity & Legal Identity",
    "Location & Coverage",
    "Governance & Membership",
    "Commodities & Facilities",
    "Review & Submission",
    "Institutional Onboarding & Credentials",
  ];

  const femalePct = useMemo(() => {
    const total = Number(draft.memberCount) || 0;
    const women = Number(draft.womenMembers) || 0;
    if (total <= 0) return 0;
    return Math.min(100, Math.round((women / total) * 100));
  }, [draft.memberCount, draft.womenMembers]);

  return (
    <div
      className="modal-wrap org-wizard-overlay"
      style={{ zIndex: 10000 }}
      onMouseDown={(e) => {
        if (e.currentTarget === e.target) close();
      }}
    >
      <form
        className="enrollment-wizard org-wizard glass"
        onSubmit={handleSubmit}
        onChange={(e) => {
          const target = e.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
          if (target.name) {
            updateDraft(target.name, target.value);
          }
        }}
      >
        <header>
          <div>
            <span>🏛 &nbsp; NATIONAL PARTY &amp; ORGANIZATION REGISTRY</span>
            <h2>{activeEntity.title} Registration Wizard</h2>
            <p>Governed multi-stakeholder registration for agricultural organizations, cooperatives, and service actors.</p>
          </div>
          <b>Step {step} of 5</b>
          <button type="button" onClick={close} aria-label="Close registration wizard">
            ×
          </button>
          <nav>
            {steps.map((st, i) => (
              <button
                type="button"
                key={st}
                className={step === i + 1 ? "active" : step > i + 1 ? "done" : ""}
                onClick={() => setStep(i + 1)}
              >
                {i + 1}. {st}
              </button>
            ))}
          </nav>
        </header>

        <main>
          {/* STEP 1 */}
          {step === 1 && (
            <>
              <section className="enroll-panel">
                <h3>Select Actor Classification</h3>
                <p style={{ margin: "0 0 12px 0", fontSize: "0.85rem", color: "#94a3b8" }}>
                  Choose or verify the organizational classification. This configures statutory compliance rules and verification pathways.
                </p>
                <div className="org-type-selection-grid">
                  {entityTypes.map((t) => (
                    <button
                      type="button"
                      key={t.id}
                      className={`org-type-tile ${selectedType === t.id ? "selected" : ""}`}
                      onClick={() => {
                        setSelectedType(t.id);
                        if (t.id === "Cooperative") {
                          updateDraft("legalForm", "Registered Cooperative Society");
                        } else if (t.id === "Agribusiness") {
                          updateDraft("legalForm", "Corporation / Limited Liability Company");
                        } else if (t.id === "Farmer group") {
                          updateDraft("legalForm", "Informal Association / Community Group");
                        }
                      }}
                    >
                      <i>{t.icon}</i>
                      <div>
                        <b>{t.title}</b>
                        <small>{t.badge}</small>
                      </div>
                      {selectedType === t.id && <span className="check-badge">✓</span>}
                    </button>
                  ))}
                </div>
              </section>

              <section className="enroll-panel">
                <h3>Legal &amp; Operational Identity</h3>
                <div className="enroll-grid three">
                  <label className="wide">
                    Full Legal or Registered Name*
                    <input
                      name="legalName"
                      required
                      value={draft.legalName || ""}
                      onChange={(e) => updateDraft("legalName", e.target.value)}
                      placeholder="e.g. Nimba Cocoa Smallholder Farmers Multipurpose Cooperative"
                    />
                  </label>
                  <label>
                    Acronym / Short Name
                    <input
                      name="acronym"
                      value={draft.acronym || ""}
                      onChange={(e) => updateDraft("acronym", e.target.value)}
                      placeholder="e.g. NCS-COOP"
                    />
                  </label>
                  <label>
                    Legal Form*
                    <select
                      name="legalForm"
                      value={draft.legalForm || "Registered Cooperative Society"}
                      onChange={(e) => updateDraft("legalForm", e.target.value)}
                    >
                      <option>Registered Cooperative Society</option>
                      <option>Informal Association / Community Group</option>
                      <option>Producer Union / Federation</option>
                      <option>Corporation / Limited Liability Company</option>
                      <option>Business Name / Sole Proprietorship</option>
                      <option>Licensed Commercial Bank</option>
                      <option>Microfinance Institution / RCFI</option>
                      <option>Non-Governmental Organization / CBO</option>
                    </select>
                  </label>
                  <label>
                    Official Registration / Charter No.
                    <input
                      name="registrationNumber"
                      value={draft.registrationNumber || ""}
                      onChange={(e) => updateDraft("registrationNumber", e.target.value)}
                      placeholder="e.g. CDA-COOP-2022-045"
                    />
                  </label>
                  <label>
                    Tax Identification Number (LRA TIN)
                    <input
                      name="taxId"
                      value={draft.taxId || ""}
                      onChange={(e) => updateDraft("taxId", e.target.value)}
                      placeholder="e.g. 500293810"
                    />
                  </label>
                  <label>
                    Date Established / Incorporated
                    <input
                      name="establishedDate"
                      type="date"
                      value={draft.establishedDate || ""}
                      onChange={(e) => updateDraft("establishedDate", e.target.value)}
                    />
                  </label>
                </div>
              </section>

              <section className="enroll-panel compliance-highlight-panel">
                {selectedType === "Cooperative" && (
                  <>
                    <h3>Cooperative Development Agency (CDA) Compliance</h3>
                    <div className="enroll-grid three">
                      <label>
                        CDA Certificate Number*
                        <input
                          name="cdaCertificateNumber"
                          required
                          value={draft.cdaCertificateNumber || ""}
                          onChange={(e) => updateDraft("cdaCertificateNumber", e.target.value)}
                          placeholder="e.g. CDA-CERT-0194"
                        />
                      </label>
                      <label>
                        Certification Status
                        <select name="certificationStatus">
                          <option>Active / Valid</option>
                          <option>Provisional / Pending renewal</option>
                          <option>New application</option>
                        </select>
                      </label>
                      <label>
                        Cooperative Union Affiliation
                        <input
                          name="unionAffiliation"
                          placeholder="e.g. National Union of Farmers Cooperatives"
                        />
                      </label>
                    </div>
                  </>
                )}

                {(selectedType === "Agribusiness" || selectedType === "Supplier" || selectedType === "Service provider") && (
                  <>
                    <h3>Commerce &amp; Sector Accreditation (MoCI / MoA / LACRA)</h3>
                    <div className="enroll-grid three">
                      <label>
                        MoCI Business Registry Licence No.*
                        <input
                          name="businessLicenseNumber"
                          required
                          value={draft.businessLicenseNumber || ""}
                          onChange={(e) => updateDraft("businessLicenseNumber", e.target.value)}
                          placeholder="e.g. MOCI-ENT-2023-889"
                        />
                      </label>
                      <label>
                        Sector Accreditation / Permit
                        <select name="sectorPermit">
                          <option>MoA Agricultural Input Dealer Accreditation</option>
                          <option>LACRA Produce Buying &amp; Export Licence</option>
                          <option>FDA / EPA Environmental Permit</option>
                          <option>Mechanization &amp; Engineering Certificate</option>
                          <option>Standard Commercial Registration</option>
                        </select>
                      </label>
                      <label>
                        Licence Expiry Date
                        <input name="licenseExpiry" type="date" />
                      </label>
                    </div>
                  </>
                )}

                {selectedType === "Financial institution" && (
                  <>
                    <h3>Central Bank of Liberia (CBL) Authorization</h3>
                    <div className="enroll-grid three">
                      <label>
                        Central Bank Licence No.*
                        <input
                          name="cblLicenseNumber"
                          required
                          value={draft.cblLicenseNumber || ""}
                          onChange={(e) => updateDraft("cblLicenseNumber", e.target.value)}
                          placeholder="e.g. CBL-BFI-2021-08"
                        />
                      </label>
                      <label>
                        Financial License Category
                        <select name="financialCategory">
                          <option>Commercial Bank</option>
                          <option>Rural Community Finance Institution (RCFI)</option>
                          <option>Licensed Microfinance Institution (MFI)</option>
                          <option>Payment Service Provider / Mobile Money</option>
                          <option>Apex Credit Union</option>
                        </select>
                      </label>
                      <label>
                        Clearing / SWIFT Code
                        <input name="institutionCode" placeholder="e.g. ECBL-LR" />
                      </label>
                    </div>
                  </>
                )}

                {(selectedType === "Farmer group" || selectedType === "Producer organization") && (
                  <>
                    <h3>Community Endorsement &amp; Governance Charter</h3>
                    <div className="enroll-grid three">
                      <label>
                        Endorsing Authority
                        <input
                          name="endorsingAuthority"
                          placeholder="e.g. County Agricultural Coordinator / Clan Chief"
                        />
                      </label>
                      <label>
                        Bylaws / Constitution Reference
                        <input name="constitutionRef" placeholder="e.g. CON-2023-FGA" />
                      </label>
                      <label>
                        Savings / Credit Scheme
                        <select name="savingsScheme">
                          <option>Village Savings &amp; Loan (VSLA)</option>
                          <option>Traditional Susu Scheme</option>
                          <option>Cooperative Rotating Fund</option>
                          <option>None / Production-only</option>
                        </select>
                      </label>
                    </div>
                  </>
                )}
              </section>
            </>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <>
              <section className="enroll-panel">
                <h3>⌖ Geographic Location across 15 Liberian Counties</h3>
                <div className="enroll-grid three">
                  <label>
                    County*
                    <select value={county} onChange={(e) => handleCountyChange(e.target.value)}>
                      {counties.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    District*
                    <select
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                    >
                      {(districts[county] || []).map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Clan / Township
                    <input
                      name="township"
                      value={draft.township || ""}
                      onChange={(e) => updateDraft("township", e.target.value)}
                      placeholder="e.g. Gbehlay Clan"
                    />
                  </label>
                  <label>
                    Community / City / Town*
                    <input
                      name="community"
                      required
                      value={draft.community || ""}
                      onChange={(e) => updateDraft("community", e.target.value)}
                      placeholder="e.g. Sanniquellie Central"
                    />
                  </label>
                  <label className="wide">
                    Headquarters / Office Physical Address
                    <input
                      name="headquartersAddress"
                      value={draft.headquartersAddress || ""}
                      onChange={(e) => updateDraft("headquartersAddress", e.target.value)}
                      placeholder="e.g. Main High Street, opposite District Agriculture Office"
                    />
                  </label>
                </div>
              </section>

              <section className="enroll-panel">
                <h3>GPS Centroid Coordinates</h3>
                <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "16px", flexWrap: "wrap" }}>
                  <button type="button" className="gps-button" onClick={captureLocation}>
                    ⌖ Capture Current GPS Location
                  </button>
                  <span style={{ fontSize: "0.82rem", color: "#94a3b8" }}>
                    Captures precise centroid coordinates for map pin and spatial cadastre linkage.
                  </span>
                </div>
                <div className="enroll-grid three">
                  <label>
                    Latitude (N)
                    <input
                      name="latitude"
                      value={draft.latitude || ""}
                      onChange={(e) => updateDraft("latitude", e.target.value)}
                      placeholder="e.g. 7.3621"
                    />
                  </label>
                  <label>
                    Longitude (W)
                    <input
                      name="longitude"
                      value={draft.longitude || ""}
                      onChange={(e) => updateDraft("longitude", e.target.value)}
                      placeholder="e.g. -8.7061"
                    />
                  </label>
                  <label>
                    Operational Coverage Scope
                    <select
                      name="coverageScope"
                      value={draft.coverageScope || "District-wide"}
                      onChange={(e) => updateDraft("coverageScope", e.target.value)}
                    >
                      <option>Community / Local</option>
                      <option>District-wide</option>
                      <option>County-wide</option>
                      <option>Multi-County Regional</option>
                      <option>Nationwide / All 15 Counties</option>
                    </select>
                  </label>
                </div>
              </section>
            </>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <>
              <section className="enroll-panel">
                <h3>Authorized Leadership &amp; Executive Contact</h3>
                <div className="enroll-grid three">
                  <label>
                    Authorized Representative Name*
                    <input
                      name="representativeName"
                      required
                      value={draft.representativeName || ""}
                      onChange={(e) => updateDraft("representativeName", e.target.value)}
                      placeholder="e.g. Jerry K. Flomo"
                    />
                  </label>
                  <label>
                    Official Role / Title*
                    <input
                      name="representativeTitle"
                      value={draft.representativeTitle || "President / Chair"}
                      onChange={(e) => updateDraft("representativeTitle", e.target.value)}
                      placeholder="President, Managing Director, Chairlady…"
                    />
                  </label>
                  <label>
                    Official Contact Phone*
                    <input
                      name="phone"
                      required
                      value={draft.phone || ""}
                      onChange={(e) => updateDraft("phone", e.target.value)}
                      placeholder="e.g. +231 77 555 0192"
                    />
                  </label>
                  <label>
                    Official Email Address
                    <input
                      name="email"
                      type="email"
                      value={draft.email || ""}
                      onChange={(e) => updateDraft("email", e.target.value)}
                      placeholder="e.g. contact@nimbacocoa.org.lr"
                    />
                  </label>
                  <label>
                    Mobile Money Account for Payouts
                    <input
                      name="mobileMoneyAccount"
                      value={draft.mobileMoneyAccount || ""}
                      onChange={(e) => updateDraft("mobileMoneyAccount", e.target.value)}
                      placeholder="e.g. 0880199238 (Orange / MTN)"
                    />
                  </label>
                  <label>
                    Governing Body Structure
                    <input
                      name="governanceBody"
                      value={draft.governanceBody || "Board of Directors"}
                      onChange={(e) => updateDraft("governanceBody", e.target.value)}
                      placeholder="Board of Directors, Executive Committee…"
                    />
                  </label>
                </div>
              </section>

              <section className="enroll-panel">
                <h3>Membership Demographics &amp; Gender Inclusivity</h3>
                <div className="enroll-grid three">
                  <label>
                    Total Registered Members / Workforce*
                    <input
                      name="memberCount"
                      type="number"
                      min="1"
                      required
                      value={draft.memberCount || ""}
                      onChange={(e) => updateDraft("memberCount", e.target.value)}
                      placeholder="e.g. 240"
                    />
                  </label>
                  <label>
                    Women Members / Workforce
                    <input
                      name="womenMembers"
                      type="number"
                      min="0"
                      value={draft.womenMembers || ""}
                      onChange={(e) => updateDraft("womenMembers", e.target.value)}
                      placeholder="e.g. 115"
                    />
                  </label>
                  <label>
                    Youth Members (under 35 years)
                    <input
                      name="youthMembers"
                      type="number"
                      min="0"
                      value={draft.youthMembers || ""}
                      onChange={(e) => updateDraft("youthMembers", e.target.value)}
                      placeholder="e.g. 78"
                    />
                  </label>
                  <label>
                    General Assembly Frequency
                    <select
                      name="assemblyFrequency"
                      value={draft.assemblyFrequency || "Quarterly"}
                      onChange={(e) => updateDraft("assemblyFrequency", e.target.value)}
                    >
                      <option>Monthly</option>
                      <option>Quarterly</option>
                      <option>Biannual</option>
                      <option>Annual AGM</option>
                    </select>
                  </label>
                  <label>
                    Member Register Status
                    <select name="memberRegisterStatus">
                      <option>Yes — Verified Digital Ledger</option>
                      <option>Yes — Physical Registry Book</option>
                      <option>Under Compilation</option>
                    </select>
                  </label>
                  <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                    <small style={{ color: "#94a3b8", marginBottom: "4px" }}>Female Participation Rate:</small>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <strong style={{ fontSize: "1.1rem", color: femalePct >= 30 ? "#34d399" : "#fbbf24" }}>
                        {femalePct}%
                      </strong>
                      <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                        {femalePct >= 30 ? "✓ Meets FAO gender benchmark" : "⚠ Below target"}
                      </span>
                    </div>
                  </div>
                </div>
              </section>
            </>
          )}

          {/* STEP 4 */}
          {step === 4 && (
            <>
              <section className="enroll-panel">
                <h3>Primary Commodity &amp; Core Value Chains</h3>
                <div className="enroll-grid three">
                  <label>
                    Primary Commodity*
                    <select
                      name="primaryCommodity"
                      value={draft.primaryCommodity || "Cocoa"}
                      onChange={(e) => updateDraft("primaryCommodity", e.target.value)}
                    >
                      {commodities.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="wide">
                    Secondary Commodities / Value Chains
                    <input
                      name="secondaryCommodities"
                      value={draft.secondaryCommodities || ""}
                      onChange={(e) => updateDraft("secondaryCommodities", e.target.value)}
                      placeholder="e.g. Cassava, Plantain, Vegetables"
                    />
                  </label>
                </div>

                <h4 style={{ marginTop: "16px", marginBottom: "8px", fontSize: "0.9rem", color: "#cbd5e1" }}>
                  Core Services Offered (Select All That Apply)
                </h4>
                <div className="check-grid">
                  {serviceOptions.map((srv) => (
                    <label className="check-choice" key={srv}>
                      <input
                        type="checkbox"
                        value={srv}
                        checked={(draft.services || "").includes(srv)}
                        onChange={(e) => {
                          const current = (draft.services || "").split(", ").filter(Boolean);
                          const updated = e.target.checked
                            ? [...current, srv]
                            : current.filter((x) => x !== srv);
                          updateDraft("services", updated.join(", "));
                        }}
                      />
                      <b>{srv}</b>
                    </label>
                  ))}
                </div>
              </section>

              <section className="enroll-panel">
                <h3>1. Storage Infrastructure, Warehousing &amp; Cold Chain</h3>
                <div className="enroll-grid three">
                  <label>
                    Primary Storage / Warehouse Structure
                    <select
                      name="storageType"
                      value={draft.storageType || "Certified Central Warehouse"}
                      onChange={(e) => updateDraft("storageType", e.target.value)}
                    >
                      <option>Certified Central Warehouse</option>
                      <option>Hermetic Grain Silo / Bulk Storage</option>
                      <option>Solar Drying Floor &amp; Parabolic Shed</option>
                      <option>Temperature-Controlled Cold Room / Packhouse</option>
                      <option>Community Traditional Granary Crib</option>
                      <option>Leased Commercial Space</option>
                    </select>
                  </label>
                  <label>
                    Total Warehousing Capacity (Metric Tons)*
                    <input
                      name="warehouseCapacityMt"
                      type="number"
                      min="0"
                      value={draft.warehouseCapacityMt || ""}
                      onChange={(e) => updateDraft("warehouseCapacityMt", e.target.value)}
                      placeholder="e.g. 150"
                    />
                  </label>
                  <label>
                    Cold Chain / Temperature Control
                    <select
                      name="coldChainAccess"
                      value={draft.coldChainAccess || "None"}
                      onChange={(e) => updateDraft("coldChainAccess", e.target.value)}
                    >
                      <option>None / Ambient storage only</option>
                      <option>Yes — Solar-powered cold storage (10–50 MT)</option>
                      <option>Yes — Grid-powered walk-in cold room</option>
                      <option>Yes — Diesel generator refrigerated container</option>
                      <option>Planned / Seeking grant co-financing</option>
                    </select>
                  </label>
                </div>
              </section>

              <section className="enroll-panel">
                <h3>2. Logistics Fleet, Road Passability &amp; Haulage</h3>
                <div className="enroll-grid three">
                  <label>
                    Primary Haulage &amp; Logistics Mode
                    <select
                      name="transportFleetType"
                      value={draft.transportFleetType || "Member-provided motorbikes"}
                      onChange={(e) => updateDraft("transportFleetType", e.target.value)}
                    >
                      <option>Owns commercial transport trucks (3–10 MT)</option>
                      <option>Owns motorized tricycles / kehkehs (0.5–1 MT)</option>
                      <option>Contracted commercial freight transporters</option>
                      <option>Member-provided motorbikes &amp; head-load</option>
                      <option>Watercraft / Motorized river canoes</option>
                      <option>Buyer-provided collection at aggregation hub</option>
                    </select>
                  </label>
                  <label>
                    Vehicles Owned / Dedicated to Ag Operations
                    <input
                      name="transportVehicleCount"
                      type="number"
                      min="0"
                      value={draft.transportVehicleCount || ""}
                      onChange={(e) => updateDraft("transportVehicleCount", e.target.value)}
                      placeholder="e.g. 2 trucks, 4 tricycles"
                    />
                  </label>
                  <label>
                    Hub Feeder Road Passability
                    <select
                      name="roadPassability"
                      value={draft.roadPassability || "Laterite / gravel year-round"}
                      onChange={(e) => updateDraft("roadPassability", e.target.value)}
                    >
                      <option>Paved / all-weather year-round</option>
                      <option>Laterite / gravel year-round</option>
                      <option>Seasonal / dry season only</option>
                      <option>Frequently impassable during rainy season</option>
                    </select>
                  </label>
                </div>
              </section>

              <section className="enroll-panel">
                <h3>3. Mechanization Services, Agro-Processing &amp; Assets</h3>
                <div className="enroll-grid three">
                  <label>
                    Tractor &amp; Mechanization Equipment Pool
                    <select
                      name="mechanizationPool"
                      value={draft.mechanizationPool || "Owns power tillers (2-wheel)"}
                      onChange={(e) => updateDraft("mechanizationPool", e.target.value)}
                    >
                      <option>Tractor Hiring Center / Custom Hire Unit (4WD Tractors)</option>
                      <option>Owns power tillers (2-wheel walking tractors)</option>
                      <option>Motorized processing mills (rice, cassava, palm)</option>
                      <option>Solar-powered irrigation &amp; borehole pumps</option>
                      <option>Manual tools only (knapsacks, cutlasses, hoes)</option>
                    </select>
                  </label>
                  <label>
                    Tractors / Farm Machinery Units
                    <input
                      name="machineryCount"
                      type="number"
                      min="0"
                      value={draft.machineryCount || ""}
                      onChange={(e) => updateDraft("machineryCount", e.target.value)}
                      placeholder="e.g. 3"
                    />
                  </label>
                  <label>
                    Mechanization Service Availability
                    <select
                      name="mechanizationService"
                      value={draft.mechanizationService || "Internal cooperative use only"}
                      onChange={(e) => updateDraft("mechanizationService", e.target.value)}
                    >
                      <option>Subsidized hire services to enrolled members</option>
                      <option>Commercial hiring center open to all farmers</option>
                      <option>Internal cooperative farm operations only</option>
                      <option>No machinery hire services offered</option>
                    </select>
                  </label>
                  <label>
                    Processing Units (Tons/Day Capacity)
                    <input
                      name="processingCapacity"
                      value={draft.processingCapacity || ""}
                      onChange={(e) => updateDraft("processingCapacity", e.target.value)}
                      placeholder="e.g. 5 MT/day rice mill, cassava gari press"
                    />
                  </label>
                  <label className="wide">
                    Facilities Summary &amp; Fixed Assets Description
                    <textarea
                      name="facilitySummary"
                      rows={2}
                      value={draft.facilitySummary || ""}
                      onChange={(e) => updateDraft("facilitySummary", e.target.value)}
                      placeholder="e.g. Central drying floor, solar-powered packhouse, seed storage shed, mechanical huller…"
                    />
                  </label>
                </div>
              </section>

              <section className="enroll-panel">
                <h3>4. Commercial Off-Take Contracts &amp; Market Linkages</h3>
                <div className="enroll-grid three">
                  <label>
                    Primary Off-Take / Commercial Market Channel
                    <select
                      name="marketOutlet"
                      value={draft.marketOutlet || "Formal buyer contracts"}
                      onChange={(e) => updateDraft("marketOutlet", e.target.value)}
                    >
                      <option>Formal buyer contracts (LACRA, Agro-processors, Exporters)</option>
                      <option>Institutional buyer (WFP School Feeding, MoA)</option>
                      <option>District &amp; county weekly wholesale markets</option>
                      <option>Direct retail stalls &amp; urban supply</option>
                      <option>Cross-border regional trade (Guinea, Sierra Leone, Ivory Coast)</option>
                    </select>
                  </label>
                  <label>
                    Annual Aggregation Volume (Metric Tons)
                    <input
                      name="aggregationVolumeMt"
                      type="number"
                      min="0"
                      value={draft.aggregationVolumeMt || ""}
                      onChange={(e) => updateDraft("aggregationVolumeMt", e.target.value)}
                      placeholder="e.g. 250 MT/year"
                    />
                  </label>
                </div>
              </section>
            </>
          )}

          {/* STEP 5 */}
          {step === 5 && (
            <>
              <h3>Review Organization Dossier</h3>
              <div className="review-card">
                <h4>{activeEntity.badge} · Summary &amp; Verification Preview</h4>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px", margin: "14px 0" }}>
                  <div>
                    <span style={{ fontSize: "0.75rem", color: "#94a3b8", display: "block" }}>Classification</span>
                    <strong style={{ fontSize: "0.95rem", color: "#f8fafc" }}>{activeEntity.title}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: "0.75rem", color: "#94a3b8", display: "block" }}>Legal Name</span>
                    <strong style={{ fontSize: "0.95rem", color: "#f8fafc" }}>{draft.legalName || "Not specified"}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: "0.75rem", color: "#94a3b8", display: "block" }}>Acronym / Code</span>
                    <strong style={{ fontSize: "0.95rem", color: "#f8fafc" }}>{draft.acronym || "—"}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: "0.75rem", color: "#94a3b8", display: "block" }}>Location</span>
                    <strong style={{ fontSize: "0.95rem", color: "#f8fafc" }}>
                      {draft.community || "Central"}, {district}, {county}
                    </strong>
                  </div>
                  <div>
                    <span style={{ fontSize: "0.75rem", color: "#94a3b8", display: "block" }}>Authorized Contact</span>
                    <strong style={{ fontSize: "0.95rem", color: "#f8fafc" }}>
                      {draft.representativeName || "Official"} ({draft.phone || "—"})
                    </strong>
                  </div>
                  <div>
                    <span style={{ fontSize: "0.75rem", color: "#94a3b8", display: "block" }}>Membership &amp; Gender</span>
                    <strong style={{ fontSize: "0.95rem", color: "#f8fafc" }}>
                      {draft.memberCount || 0} members · {femalePct}% women
                    </strong>
                  </div>
                  <div>
                    <span style={{ fontSize: "0.75rem", color: "#94a3b8", display: "block" }}>Primary Value Chain</span>
                    <strong style={{ fontSize: "0.95rem", color: "#f8fafc" }}>{draft.primaryCommodity || "Multi-commodity"}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: "0.75rem", color: "#94a3b8", display: "block" }}>Statutory Number</span>
                    <strong style={{ fontSize: "0.95rem", color: "#f8fafc" }}>
                      {draft.registrationNumber || draft.cdaCertificateNumber || draft.businessLicenseNumber || draft.cblLicenseNumber || "Pending"}
                    </strong>
                  </div>
                </div>

                <div style={{ background: "rgba(56, 189, 248, 0.08)", border: "1px solid rgba(56, 189, 248, 0.2)", borderRadius: "8px", padding: "12px", marginTop: "12px" }}>
                  <b style={{ color: "#38bdf8", fontSize: "0.85rem", display: "block", marginBottom: "4px" }}>
                    Verification &amp; Governance Pipeline
                  </b>
                  <p style={{ margin: 0, fontSize: "0.8rem", color: "#cbd5e1" }}>
                    This profile will be queued for County Agricultural Office (CAO) field audit, CDA/MoCI document validation, and institutional duplicate screening before full national certification.
                  </p>
                </div>
              </div>

              <label className="consent" style={{ marginTop: "16px" }}>
                <input type="checkbox" required />
                <span>
                  I confirm authority to register this entity in the Liberia Digital Farmer Registry and declare that all particulars are true, accurate, and comply with Ministry of Agriculture regulations.
                </span>
              </label>
            </>
          )}

          {step === 6 && registeredOrg && (
            <div className="onboarding-dossier" style={{ padding: "4px 0" }}>
              <div style={{ background: "linear-gradient(135deg, #0c2340, #1e3a8a)", color: "#fff", padding: "18px 22px", borderRadius: "14px", border: "1.5px solid #38bdf8", marginBottom: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px" }}>
                  <div>
                    <span style={{ color: "#7dd3fc", fontSize: "11px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      ✓ Institutional Enrollment Confirmed · Multi-Channel Onboarding Active
                    </span>
                    <h2 style={{ margin: "4px 0", fontSize: "22px", color: "#ffffff", fontFamily: "Georgia, serif" }}>
                      {registeredOrg.legalName}
                    </h2>
                    <p style={{ margin: 0, fontSize: "12px", color: "#e0f2fe" }}>
                      National Registry Party Identifier: <strong style={{ color: "#fef08a", fontFamily: "monospace", fontSize: "15px" }}>{registeredOrg.partyId}</strong>
                    </p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span style={{ display: "inline-block", background: "#fef08a", color: "#854d0e", fontWeight: 800, fontSize: "11px", padding: "4px 12px", borderRadius: "20px" }}>
                      ● Provisional · Queued for CAO Audit
                    </span>
                    <div style={{ fontSize: "11px", color: "#bae6fd", marginTop: "4px" }}>
                      Enrolled: {registeredOrg.enrolledAt}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "14px", marginBottom: "18px" }}>
                {/* SMS Dispatch */}
                <div style={{ background: "#ffffff", border: "1.5px solid #dcfce7", borderRadius: "14px", padding: "16px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e2e8f0", paddingBottom: "8px", marginBottom: "10px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "18px" }}>📱</span>
                      <div>
                        <b style={{ fontSize: "12px", color: "#0f172a" }}>Liberia Telco SMS Gateway</b>
                        <div style={{ fontSize: "10px", color: "#64748b" }}>Lonestar MTN / Orange SMPP Port 2775</div>
                      </div>
                    </div>
                    <span style={{ fontSize: "10px", background: "#ecfdf5", color: "#059669", fontWeight: 800, padding: "2px 8px", borderRadius: "10px", border: "1px solid #a7f3d0" }}>
                      ✓ DELIVRD (120ms)
                    </span>
                  </div>
                  <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "10px", fontSize: "11px", lineHeight: "1.6", color: "#1e293b" }}>
                    <div style={{ fontSize: "10px", color: "#64748b", marginBottom: "4px", fontWeight: 700 }}>
                      To: <span style={{ color: "#0284c7" }}>{draft.phone || "+231 886 500 123"}</span> ({registeredOrg.repName})
                    </div>
                    <p style={{ margin: 0, fontStyle: "italic", background: "#ffffff", padding: "8px 10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}>
                      &ldquo;Republic of Liberia MoA DFR: Registration confirmed for <b>{registeredOrg.legalName}</b> (ID: <b>{registeredOrg.partyId}</b>). Representative portal access provisioned for <b>{registeredOrg.repName}</b>. Temp PIN/Password: <b style={{ color: "#b91c1c", background: "#fee2e2", padding: "1px 4px", borderRadius: "4px" }}>{registeredOrg.tempPassword}</b>. Mandatory password change required upon first login at dfr.moa.gov.lr/signin.&rdquo;
                    </p>
                  </div>
                </div>

                {/* Email Dispatch */}
                <div style={{ background: "#ffffff", border: "1.5px solid #e0e7ff", borderRadius: "14px", padding: "16px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e2e8f0", paddingBottom: "8px", marginBottom: "10px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "18px" }}>✉️</span>
                      <div>
                        <b style={{ fontSize: "12px", color: "#0f172a" }}>MoA Official e-Gov Mailer</b>
                        <div style={{ fontSize: "10px", color: "#64748b" }}>SMTP Relay: registry@moa.gov.lr</div>
                      </div>
                    </div>
                    <span style={{ fontSize: "10px", background: "#eff6ff", color: "#1d4ed8", fontWeight: 800, padding: "2px 8px", borderRadius: "10px", border: "1px solid #bfdbfe" }}>
                      ✓ SENT (250 OK)
                    </span>
                  </div>
                  <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "10px", fontSize: "11px", lineHeight: "1.6", color: "#1e293b" }}>
                    <div style={{ fontSize: "10px", color: "#64748b", marginBottom: "4px", fontWeight: 700 }}>
                      To: <span style={{ color: "#0284c7" }}>{draft.email || registeredOrg.accountUser.email}</span>
                    </div>
                    <div style={{ background: "#ffffff", padding: "8px 10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}>
                      <div style={{ fontWeight: 700, color: "#0f172a", marginBottom: "2px" }}>
                        Subject: Liberia DFR — Corporate Registration &amp; Representative Credential
                      </div>
                      <p style={{ margin: 0, fontSize: "11px", color: "#475569" }}>
                        Representative account issued with Temporary Password: <code style={{ color: "#b91c1c", fontWeight: 800 }}>{registeredOrg.tempPassword}</code>. Policy requires setting a confidential permanent password on initial login.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Printable Organization Certificate */}
              <div id="printable-org-certificate" className="official-registration-slip" style={{ background: "#ffffff", border: "2px solid #0369a1", borderRadius: "12px", padding: "18px 22px", marginBottom: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid #0369a1", paddingBottom: "10px", marginBottom: "14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <img src="/assets/moa-logo.png" alt="MoA" style={{ width: "42px", height: "42px", objectFit: "contain" }} />
                    <div>
                      <span style={{ fontSize: "10px", color: "#0369a1", fontWeight: 800, letterSpacing: "0.08em" }}>REPUBLIC OF LIBERIA · MINISTRY OF AGRICULTURE</span>
                      <h3 style={{ margin: "2px 0 0", fontSize: "17px", color: "#0c4a6e" }}>Certificate of Provisional Entity Registration</h3>
                    </div>
                  </div>
                  <div style={{ textAlign: "right", fontFamily: "monospace", fontSize: "11px", fontWeight: 700, color: "#0369a1" }}>
                    REGISTRY IDENTIFIER<br />{registeredOrg.partyId}
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", fontSize: "11px", marginBottom: "12px" }}>
                  <div style={{ background: "#f8fafc", padding: "8px 12px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                    <span style={{ color: "#64748b", fontSize: "10px", textTransform: "uppercase", fontWeight: 700 }}>Legal Organization</span>
                    <b style={{ display: "block", fontSize: "13px", color: "#0f172a", marginTop: "2px" }}>{registeredOrg.legalName}</b>
                  </div>
                  <div style={{ background: "#f0f9ff", padding: "8px 12px", borderRadius: "8px", border: "1px solid #bae6fd" }}>
                    <span style={{ color: "#0369a1", fontSize: "10px", textTransform: "uppercase", fontWeight: 700 }}>Entity Classification</span>
                    <b style={{ display: "block", fontSize: "13px", color: "#0369a1", marginTop: "2px" }}>{selectedType}</b>
                  </div>
                  <div style={{ background: "#f8fafc", padding: "8px 12px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                    <span style={{ color: "#64748b", fontSize: "10px", textTransform: "uppercase", fontWeight: 700 }}>Authorized Representative</span>
                    <b style={{ display: "block", fontSize: "12px", color: "#0f172a", marginTop: "2px" }}>{registeredOrg.repName}</b>
                  </div>
                  <div style={{ background: "#f8fafc", padding: "8px 12px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                    <span style={{ color: "#64748b", fontSize: "10px", textTransform: "uppercase", fontWeight: 700 }}>County &amp; District</span>
                    <b style={{ display: "block", fontSize: "12px", color: "#0f172a", marginTop: "2px" }}>{county} / {district}</b>
                  </div>
                  <div style={{ background: "#f8fafc", padding: "8px 12px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                    <span style={{ color: "#64748b", fontSize: "10px", textTransform: "uppercase", fontWeight: 700 }}>Members / Size</span>
                    <b style={{ display: "block", fontSize: "12px", color: "#0f172a", marginTop: "2px" }}>{draft.memberCount || "0"} Members ({draft.womenMembers || "0"} Women)</b>
                  </div>
                  <div style={{ background: "#f8fafc", padding: "8px 12px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                    <span style={{ color: "#64748b", fontSize: "10px", textTransform: "uppercase", fontWeight: 700 }}>Primary Value Chain</span>
                    <b style={{ display: "block", fontSize: "12px", color: "#0f172a", marginTop: "2px" }}>{draft.primaryCommodity || "Multi-commodity"}</b>
                  </div>
                </div>

                <div style={{ background: "#f0fdf4", border: "1px dashed #166534", borderRadius: "8px", padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "11px" }}>
                  <div>
                    <span style={{ color: "#166534", fontWeight: 800, textTransform: "uppercase", display: "block", fontSize: "10px" }}>Verification Status:</span>
                    Provisional registration active. Official certificate valid for commercial aggregation, input distribution, and government procurement.
                  </div>
                  <div style={{ fontFamily: "monospace", fontWeight: 800, color: "#0369a1", fontSize: "12px", background: "#ffffff", padding: "4px 8px", borderRadius: "4px", border: "1px solid #cbd5e1" }}>
                    [QR-VERIFY: {registeredOrg.partyId}]
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        <footer>
          {step < 5 ? (
            <>
              <button
                type="button"
                disabled={step === 1}
                onClick={() => setStep(step - 1)}
              >
                ← Previous Step
              </button>
              <button
                type="button"
                onClick={() => setStep(step + 1)}
              >
                Next Step →
              </button>
            </>
          ) : step === 5 ? (
            <>
              <button
                type="button"
                onClick={() => setStep(4)}
              >
                ← Previous Step
              </button>
              <button className="submit-registration" disabled={busy}>
                {busy ? "Registering in National Store…" : `Complete ${activeEntity.title} Registration`}
              </button>
            </>
          ) : (
            <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
              <button
                type="button"
                onClick={() => printElementById("printable-org-certificate", `Organization-Registration-${registeredOrg?.partyId}`)}
                style={{ background: "#0284c7", color: "#ffffff", border: 0, padding: "10px 18px", borderRadius: "8px", fontWeight: 700, cursor: "pointer" }}
              >
                🖨 Print / PDF Certificate
              </button>
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => {
                    const isGh = typeof window !== "undefined" && window.location.pathname.startsWith("/liberia-digital-farmer-registry");
                    const prefix = isGh ? "/liberia-digital-farmer-registry" : "";
                    window.location.href = `${prefix}/signin?email=${encodeURIComponent(registeredOrg.accountUser.email)}&temp=${encodeURIComponent(registeredOrg.tempPassword)}`;
                  }}
                  style={{ background: "#16a34a", color: "#ffffff", border: 0, padding: "10px 18px", borderRadius: "8px", fontWeight: 800, cursor: "pointer" }}
                >
                  🔑 Activate Representative Account →
                </button>
                <button
                  type="button"
                  onClick={close}
                  style={{ background: "#1e293b", color: "#ffffff", border: 0, padding: "10px 18px", borderRadius: "8px", fontWeight: 700, cursor: "pointer" }}
                >
                  ✓ Done / Return to Registry
                </button>
              </div>
            </div>
          )}
        </footer>
      </form>
    </div>
  );
}
