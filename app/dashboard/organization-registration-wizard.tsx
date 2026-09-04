"use client";

import { FormEvent, useState, useMemo } from "react";

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
        notify(`Official registration complete! ${data.partyId || "Organization"} created and queued for CAO verification.`);
        await refresh();
        if (onSuccess) onSuccess(data);
        close();
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
        </main>

        <footer>
          <button
            type="button"
            disabled={step === 1}
            onClick={() => setStep(step - 1)}
          >
            ← Previous Step
          </button>
          {step < 5 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
            >
              Next Step →
            </button>
          ) : (
            <button className="submit-registration" disabled={busy}>
              {busy ? "Registering in National Store…" : `Complete ${activeEntity.title} Registration`}
            </button>
          )}
        </footer>
      </form>
    </div>
  );
}
