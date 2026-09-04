"use client";
import { useEffect, useMemo, useState } from "react";

type G = Record<string, any>;

const tabs = [
  "Overview",
  "Platform policies",
  "Dataset stewardship",
  "Validation workflows",
  "Standards & metadata",
  "Sharing agreements",
  "Committee actions",
  "Interoperability",
  "Audit evidence",
];

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

  // Platform Policy Studio state
  const [policyModal, setPolicyModal] = useState(false);
  const [generatorModal, setGeneratorModal] = useState(false);
  const [policyCategoryFilter, setPolicyCategoryFilter] = useState("All");
  const [policySearch, setPolicySearch] = useState("");
  const [expandedDirectives, setExpandedDirectives] = useState<Record<string, boolean>>({});

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

  async function transition(w: G, stage: string) {
    setBusy(w.id);
    const r = await fetch("/api/governance", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ entityType: "workflow", id: w.id, stage, actor: institution }),
    });
    setBusy(0);
    if (r.ok) {
      notify(`${w.caseId} moved to ${stage.replaceAll("_", " ").toLowerCase()} with an audit entry.`);
      load();
    }
  }

  async function review(d: G) {
    setBusy(d.id);
    await fetch("/api/governance", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ entityType: "dataset", id: d.id, actor: institution }),
    });
    setBusy(0);
    notify(`${d.datasetCode} review completed and next review scheduled.`);
    load();
  }

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
    if (!confirm(`Are you sure you want to repeal or remove policy ${policyCode}?`)) return;
    setBusy(`del-${policyCode}`);
    try {
      const res = await fetch("/api/governance", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "delete-policy", policyCode }),
      });
      if (res.ok) {
        notify(`Policy ${policyCode} has been repealed from the active register.`);
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

  const categories = useMemo(() => {
    const set = new Set<string>();
    policiesList.forEach((p: G) => {
      if (p.category) set.add(p.category);
    });
    return ["All", ...Array.from(set)];
  }, [policiesList]);

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

      <nav className="gov-tabs">
        {tabs.map((t) => (
          <button className={tab === t ? "active" : ""} onClick={() => setTab(t)} key={t}>
            {t}
          </button>
        ))}
      </nav>

      {/* TAB 1: OVERVIEW */}
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

      {/* TAB 2: PLATFORM POLICIES & REGULATIONS STUDIO */}
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
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
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
                        transition: "box-shadow 0.2s ease",
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
                            title="Automatically format this policy as an operational job aid in the Help Desk Knowledge Base"
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

      {/* TAB 3: DATASET STEWARDSHIP */}
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

      {/* TAB 4: VALIDATION WORKFLOWS */}
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

      {/* TAB 5: STANDARDS & METADATA */}
      {tab === "Standards & metadata" && (
        <Table
          title="Version-controlled data dictionary"
          sub="Official definitions, classifications and allowed values"
          heads={["Element", "Definition", "Domain / type", "Allowed values", "Authority", "Version"]}
          rows={data.dictionary.map((x: G) => [
            <code key="c">{x.elementCode}</code>,
            x.definition,
            `${x.domain} · ${x.dataType}`,
            x.allowedValues.join(", "),
            x.standardOwner,
            `${x.version} · ${x.status}`,
          ])}
        />
      )}

      {/* TAB 6: SHARING AGREEMENTS */}
      {tab === "Sharing agreements" && (
        <Table
          title="Controlled data-sharing agreements"
          sub="Purpose limitation, legal basis, access protocol and expiry"
          heads={["Agreement", "Parties", "Datasets", "Purpose / legal basis", "Protection", "Status / review"]}
          rows={data.agreements.map((x: G) => [
            <span key="a">
              <b>{x.title}</b>
              <small>{x.agreementCode}</small>
            </span>,
            `${x.providerInstitution} → ${x.recipientInstitution}`,
            x.datasets.join(", "),
            <span key="p">
              {x.purpose}
              <small>{x.legalBasis}</small>
            </span>,
            <span key="pr">
              {x.sensitivity}
              <small>{x.accessProtocol}</small>
            </span>,
            <span key="s">
              {x.status}
              <small>Review {x.reviewDate}</small>
            </span>,
          ])}
        />
      )}

      {/* TAB 7: COMMITTEE ACTIONS */}
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

      {/* TAB 8: INTEROPERABILITY */}
      {tab === "Interoperability" && (
        <Table
          title="National-system connector catalogue"
          sub="Mappings and exchange evidence; status distinguishes configuration from live connections"
          heads={["Connector", "Owner / direction", "Standard", "Environment", "Last exchange", "Result"]}
          rows={data.exchanges.map((x: G) => [
            <span key="x">
              <b>{x.systemName}</b>
              <small>
                {x.connectorCode} · {x.endpointAlias}
              </small>
            </span>,
            `${x.ownerInstitution} · ${x.direction}`,
            `${x.standard} · map ${x.mappingVersion}`,
            <span className={`status ${x.status.toLowerCase().replaceAll(" ", "-")}`} key="env">
              {x.environment} · {x.status}
            </span>,
            x.lastExchangeAt || "No live exchange",
            <span key="r">
              {x.result}
              <small>
                {x.records} records · {x.correlationId}
              </small>
            </span>,
          ])}
        />
      )}

      {/* TAB 9: AUDIT EVIDENCE */}
      {tab === "Audit evidence" && (
        <Table
          title="Cross-institution decision evidence"
          sub="Attributable actions captured in the platform audit trail"
          heads={["Timestamp", "Actor / institution", "Action", "Subject", "Evidence detail"]}
          rows={data.audit.map((x: G) => [
            x.createdAt,
            x.actor,
            x.action,
            <code key="e">{x.entity}</code>,
            x.details,
          ])}
        />
      )}

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
                    placeholder="Describe the institutional purpose, scope, smallholder protections, and target beneficiaries..."
                  />
                </label>
              </section>

              <section className="enroll-panel" style={{ marginTop: "16px" }}>
                <h3>3. Binding Directives &amp; Operational Rules</h3>
                <p style={{ fontSize: "0.82rem", color: "#64748b", margin: "4px 0 10px" }}>
                  Enter one enforceable directive per line. Format as <b>Title: Description</b> for optimal formatting.
                </p>
                <label>
                  Enforceable Directives
                  <textarea
                    rows={6}
                    required
                    value={policyDraft.directives}
                    onChange={(e) => setPolicyDraft((d) => ({ ...d, directives: e.target.value }))}
                    placeholder="Mandatory Informed Consent: No smallholder farmer personal data may be collected without verifiable consent...&#10;Purpose Limitation: Data is held in public trust exclusively for food security and extension...&#10;Biometric Encryption: Facial portraits and coordinates must be encrypted at rest (AES-256)..."
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
                <p>
                  Deploy validated Liberian agricultural policies, climate standards, seed biosafety protocols, and fair pricing rules with a single click.
                </p>
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
                          <code
                            style={{
                              fontSize: "0.75rem",
                              fontWeight: 700,
                              background: "#e0f2fe",
                              color: "#0369a1",
                              padding: "2px 6px",
                              borderRadius: "4px",
                            }}
                          >
                            {t.code}
                          </code>
                          <span style={{ fontSize: "0.76rem", color: "#059669", fontWeight: 700 }}>
                            {t.category}
                          </span>
                        </div>
                        <h4 style={{ margin: "3px 0 6px", fontSize: "0.98rem", color: "#0f172a" }}>{t.title}</h4>
                        <p style={{ margin: "0 0 6px", fontSize: "0.83rem", color: "#475569", lineHeight: "1.4" }}>
                          {t.summary}
                        </p>
                        <div style={{ fontSize: "0.78rem", color: "#64748b" }}>
                          Enforcing Authority: <b style={{ color: "#334155" }}>{t.enforcingBody}</b> · Legal Basis:{" "}
                          <i>{t.legalBasis}</i>
                        </div>
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
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
