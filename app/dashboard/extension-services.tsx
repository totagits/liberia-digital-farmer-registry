"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { getStoredFarmers, MockFarmer } from "../../lib/mock-data";

export interface ExtensionVisit {
  id?: number;
  visitCode: string;
  requestCode: string;
  scheduledAt: string;
  visitType: string;
  officerName: string;
  status: string;
  location: string;
  purpose: string;
  observations: string;
  advice: string;
  referral: string;
  referralStatus: string;
  outcome: string;
  nextVisitAt: string;
  crop?: string;
  diagnostic?: {
    pestOrDisease: string;
    severity: string;
    ipmCultural: string;
    ipmBiological: string;
    ipmChemical: string;
  } | null;
  soilTest?: {
    ph: number;
    ec: number;
    moisturePct: number;
    limeRecommendation: string;
    fertilizerDose: string;
  } | null;
  audioLanguage?: string;
}

export interface ExtensionRequest {
  requestCode: string;
  requesterName: string;
  requesterRole: string;
  farmerDfrId: string;
  county: string;
  district: string;
  serviceType: string;
  preferredDate: string;
  problemDescription: string;
  urgency: string;
  status: string;
  assignedOfficer: string;
  resolutionSummary: string;
  followUpDate: string;
  satisfaction: number;
  createdAt: string;
  visits: ExtensionVisit[];
}

const staffRoles = new Set([
  "Extension agent",
  "District agricultural officer",
  "County agricultural officer",
  "Ministry administrator",
  "Agronomist",
]);

const COUNTIES = [
  "Bomi", "Bong", "Gbarpolu", "Grand Bassa", "Grand Cape Mount",
  "Grand Gedeh", "Grand Kru", "Lofa", "Margibi", "Maryland",
  "Montserrado", "Nimba", "River Cess", "River Gee", "Sinoe"
];

const SERVICES = [
  "Crop production advice",
  "Pest or disease diagnosis",
  "Soil fertility and land management",
  "Climate and weather advisory",
  "Livestock health and husbandry",
  "Post-harvest handling and processing",
  "Input or service referral",
  "Irrigation and water management",
  "Market linkage and agribusiness",
  "Cooperative strengthening",
];

const visitStages = [
  "Farmer & Holding Profile",
  "Diagnostics & Pest Symptoms",
  "Agronomic Advisory & Media",
  "Referrals & Officer Sign-off",
];

const CABI_PEST_DATABASE = [
  {
    crop: "Rice – lowland & upland",
    pest: "Fall Armyworm (Spodoptera frugiperda)",
    category: "Insect Pest",
    symptoms: "Ragged leaf margins, whorl feeding, sawdust-like frass on stems and leaf sheaths.",
    severity: "High",
    cultural: "Early planting at onset of rains, hand-picking egg masses in small plots, intercropping with desmodium (push-pull).",
    biological: "Apply Neem seed kernel extract (NSKE 5%) or Bacillus thuringiensis (Bt) at early instar stages.",
    chemical: "Emamectin benzoate (5% SG at 10g/20L tank) or Chlorantraniliprole. Rotate active ingredients to prevent resistance.",
  },
  {
    crop: "Rice – lowland & upland",
    pest: "Rice Blast (Magnaporthe oryzae)",
    category: "Fungal Disease",
    symptoms: "Spindle-shaped elliptical lesions with gray/white centers and reddish-brown borders on leaf blades and panicle necks.",
    severity: "Critical",
    cultural: "Avoid excessive urea/nitrogen applications; space rows (20x20 cm) for air circulation; destroy infected stubble.",
    biological: "Seed priming with Trichoderma harzianum; cultivate resistant varieties (e.g. Suakoko 8, CARI-Rice).",
    chemical: "Apply Tricyclazole 75 WP (15g/20L water) or Azoxystrobin at booting stage before panicle emergence.",
  },
  {
    crop: "Cassava",
    pest: "Cassava Mosaic Disease (CMD - Begomovirus)",
    category: "Viral Disease",
    symptoms: "Severe leaf chlorosis, mosaic yellow mottling, leaf distortion, stunting, and reduced storage root formation.",
    severity: "High",
    cultural: "Use clean, certified virus-free stem cuttings from CARI. Rogue and burn symptomatic plants immediately.",
    biological: "Conserve natural predators of the whitefly vector (Bemisia tabaci) such as Encarsia parasitoids.",
    chemical: "Vector suppression with neem oil or potassium soap spray during initial seedling establishment.",
  },
  {
    crop: "Cocoa",
    pest: "Cocoa Black Pod (Phytophthora megakarya)",
    category: "Oomycete Fungus",
    symptoms: "Rapidly expanding dark brown/black lesions on pods with white fungal spores; mummified pods attached to tree.",
    severity: "Critical",
    cultural: "Prune shade trees to 40-50% canopy; frequent harvesting every 10-14 days; weed tree bases; remove infected cherelles.",
    biological: "Soil mulching and biological soil inoculants to prevent rain-splash transmission from forest floor.",
    chemical: "Preventative copper hydroxide / copper oxide sprays (50g/20L tank) applied every 3 weeks during rainy peaks.",
  },
  {
    crop: "Oil Palm",
    pest: "Rhinoceros Beetle (Oryctes monoceros)",
    category: "Insect Pest",
    symptoms: "V-shaped cuts on fronds, bore holes at the base of young frond stems, central spear rot.",
    severity: "Moderate",
    cultural: "Cover rotting logs and decomposing organic heaps with Pueraria javanica leguminous cover crops to disrupt breeding.",
    biological: "Oryctes virus (OrNV) or Metarhizium anisopliae entomopathogenic fungal spore traps.",
    chemical: "Place naphthalene mothballs (2-3 balls) in leaf axils of palms under 4 years old as a safe physical deterrent.",
  },
];

const COUNTY_WEATHER_DATA: Record<string, { forecast: string; rainProb: number; mm: number; temp: string; humidity: string; advice: string }> = {
  Bong: { forecast: "Moderate tropical rainfall with scattered afternoon thunderstorms", rainProb: 75, mm: 28, temp: "24°C – 30°C", humidity: "88%", advice: "Optimal for rice tillering and cassava weeding. Avoid foliar chemical sprays immediately before anticipated afternoon rain." },
  Nimba: { forecast: "Humid upland mist with periodic heavy convection showers", rainProb: 80, mm: 35, temp: "22°C – 28°C", humidity: "92%", advice: "High humidity risk for cocoa black pod proliferation. Ensure shade pruning and trench drainage around tree trunks." },
  Lofa: { forecast: "Sunny mornings followed by brisk late-afternoon precipitation", rainProb: 65, mm: 20, temp: "23°C – 31°C", humidity: "82%", advice: "Ideal window for land preparation, basaling fertilizer incorporation, and nursery transplanting." },
  "Grand Bassa": { forecast: "Coastal squalls with high oceanic humidity", rainProb: 70, mm: 25, temp: "25°C – 29°C", humidity: "86%", advice: "Check drainage canals in lowland palm and vegetable nurseries to prevent waterlogging." },
  Montserrado: { forecast: "Overcast with intermittent light tropical drizzles", rainProb: 60, mm: 15, temp: "26°C – 30°C", humidity: "84%", advice: "Favorable for market-gardening vegetable beds. Apply organic mulches to conserve soil nutrients." },
};

export default function ExtensionServices({
  role,
  notify,
}: {
  role: string;
  notify: (s: string) => void;
}) {
  const [data, setData] = useState<{ requests: ExtensionRequest[]; visits: ExtensionVisit[]; access: { canManage: boolean; role: string } }>({
    requests: [],
    visits: [],
    access: { canManage: false, role },
  });
  const [tab, setTab] = useState<"encounters" | "requests" | "diagnostics" | "climate" | "referrals">("encounters");
  const [visitModal, setVisitModal] = useState(false);
  const [requestModal, setRequestModal] = useState(false);
  const [diagnosticModal, setDiagnosticModal] = useState(false);
  const [climateModal, setClimateModal] = useState(false);
  const [broadcastModal, setBroadcastModal] = useState(false);
  const [cardModal, setCardModal] = useState<ExtensionVisit | null>(null);
  const [selected, setSelected] = useState<ExtensionRequest | null>(null);
  const [busy, setBusy] = useState(false);
  const [query, setQuery] = useState("");
  const [farmersList, setFarmersList] = useState<MockFarmer[]>([]);

  // 4-Stage Enterprise Wizard state for Field Encounters
  const [visitStep, setVisitStep] = useState(1);
  const [visitDraft, setVisitDraft] = useState<Record<string, string>>({
    county: "Bong",
    status: "Completed",
    visitType: "On-farm field inspection",
    cropStage: "Vegetative / Tillering",
    severity: "Moderate",
    serviceType: "Crop production advice",
    audioLanguage: "English",
    referral: "",
    referralStatus: "Not required",
    scheduledAt: new Date().toISOString().slice(0, 16),
    officerName: role === "Extension agent" ? "Dr. John Kerkulah" : "Agricultural Extension Officer",
  });
  const updateVisitDraft = (key: string, val: string) => setVisitDraft((d) => ({ ...d, [key]: val }));

  // Sprayer dilution calculator state
  const [calcAreaHa, setCalcAreaHa] = useState<number>(1.0);
  const [calcTankLitres, setCalcTankLitres] = useState<number>(16);
  const [calcDoseHa, setCalcDoseHa] = useState<number>(200);
  const [calcWaterRateHa, setCalcWaterRateHa] = useState<number>(200);

  // Climate / Soil probe state
  const [selectedWeatherCounty, setSelectedWeatherCounty] = useState<string>("Bong");
  const [probePh, setProbePh] = useState<number>(5.4);
  const [probeEc, setProbeEc] = useState<number>(0.35);
  const [probeMoisture, setProbeMoisture] = useState<number>(68);

  const staff = data.access.canManage || staffRoles.has(role);

  const load = async () => {
    try {
      const [r, f] = await Promise.all([
        fetch("/api/extension-services").then((res) => res.json()).catch(() => ({ requests: [], visits: [] })),
        fetch("/api/farmers").then((res) => res.json()).catch(() => []),
      ]);
      const storedFarmers = Array.isArray(f) && f.length > 0 ? f : getStoredFarmers();
      setFarmersList(storedFarmers);
      setData({
        requests: Array.isArray(r.requests) ? r.requests : [],
        visits: Array.isArray(r.visits) ? r.visits : [],
        access: r.access || { canManage: true, role },
      });
    } catch {
      setFarmersList(getStoredFarmers());
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Filtered lists
  const allVisits = useMemo(() => {
    const directVisits = data.visits || [];
    const requestVisits = data.requests.flatMap((r) => r.visits || []);
    const seen = new Set<string>();
    const combined: ExtensionVisit[] = [];
    for (const v of [...directVisits, ...requestVisits]) {
      if (v && v.visitCode && !seen.has(v.visitCode)) {
        seen.add(v.visitCode);
        combined.push(v);
      }
    }
    return combined.filter((v) => {
      const match = (v.visitCode + (v.officerName || "") + (v.purpose || "") + (v.advice || "") + (v.location || "") + (v.crop || "")).toLowerCase();
      return match.includes(query.toLowerCase());
    });
  }, [data.visits, data.requests, query]);

  const referralsList = useMemo(() => {
    return allVisits.filter((v) => v.referral && v.referral.trim().length > 0);
  }, [allVisits]);

  // Sprayer math
  const sprayerResults = useMemo(() => {
    const totalWater = calcAreaHa * calcWaterRateHa;
    const totalTanks = Math.ceil(totalWater / calcTankLitres);
    const dosePerTank = totalTanks > 0 ? (calcAreaHa * calcDoseHa) / totalTanks : 0;
    return {
      totalWater,
      totalTanks,
      dosePerTank: Math.round(dosePerTank * 10) / 10,
    };
  }, [calcAreaHa, calcTankLitres, calcDoseHa, calcWaterRateHa]);

  // Soil diagnosis
  const soilDiagnosis = useMemo(() => {
    let status = "Optimal (Slightly Acidic)";
    let lime = "Not required (pH suitable for tropical rice and cassava)";
    let fert = "Standard NPK 15-15-15 at 150 kg/ha + split Urea at tillering";
    if (probePh < 5.0) {
      status = "Strongly Acidic (Risk of Aluminum Toxicity & Phosphorus Lockup)";
      lime = "Apply 1.5 - 2.0 MT/ha Agricultural Dolomitic Lime 3-4 weeks prior to planting";
      fert = "Basal Rock Phosphate (RP) + NPK 15-15-15 with organic compost incorporation";
    } else if (probePh < 5.5) {
      status = "Moderately Acidic";
      lime = "Apply 0.5 - 1.0 MT/ha Lime or biochar mulch";
      fert = "NPK 15-15-15 (200 kg/ha) split with compost";
    } else if (probePh > 7.0) {
      status = "Alkaline";
      lime = "Avoid alkaline amendments; apply ammonium sulphate";
    }
    return { status, lime, fert };
  }, [probePh]);

  // Submit new visit
  async function submitFieldVisit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const fd = new FormData(e.currentTarget);
    const fromForm = Object.fromEntries(fd.entries());
    const body: Record<string, any> = { ...visitDraft, ...fromForm };

    // attach active diagnostic & soil info if available
    body.action = "record-visit";
    body.officerName = body.officerName || (role === "Extension agent" ? "Dr. John Kerkulah" : "Agricultural Extension Officer");

    try {
      const res = await fetch("/api/extension-services", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const j = await res.json();
      setBusy(false);
      if (res.ok) {
        setVisitModal(false);
        notify(`Official Field Visit ${j.visitCode || "recorded"} logged into AEAS registry.`);
        await load();
      } else {
        notify(j.error || "Failed to record visit.");
      }
    } catch {
      setBusy(false);
      notify("Network error saving visit record.");
    }
  }

  // Submit emergency broadcast alert
  async function submitBroadcast(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const fd = new FormData(e.currentTarget);
    const body: Record<string, any> = Object.fromEntries(fd.entries());
    body.action = "broadcast-alert";

    try {
      const res = await fetch("/api/extension-services", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const j = await res.json();
      setBusy(false);
      if (res.ok) {
        setBroadcastModal(false);
        notify(`Emergency Alert ${j.alertId} broadcasted to ${j.recipientsCount || 140} farming households.`);
        await load();
      } else {
        notify(j.error || "Broadcast alert failed.");
      }
    } catch {
      setBusy(false);
      notify("Error broadcasting alert.");
    }
  }

  // Submit general farmer request
  async function submitFarmerRequest(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const body = Object.fromEntries(new FormData(e.currentTarget));
    try {
      const res = await fetch("/api/extension-services", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...body, requesterRole: role }),
      });
      const j = await res.json();
      setBusy(false);
      if (res.ok) {
        setRequestModal(false);
        notify(`Extension request ${j.requestCode} submitted.`);
        await load();
      } else {
        notify(j.error || "Request failed.");
      }
    } catch {
      setBusy(false);
      notify("Error submitting request.");
    }
  }

  return (
    <div className="ext-space">
      {/* Top Hero Banner */}
      <section className="ext-hero">
        <div>
          <span>Ministry of Agriculture · AEAS Field Operations</span>
          <h2>Agricultural Extension & Advisory Services (AEAS)</h2>
          <p>
            Field data collection, agronomic diagnostics (CABI PlantwisePlus), site-specific climate-smart & soil health advisory, and verified institutional referrals.
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
          <button
            onClick={() => setVisitModal(true)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 18px",
              borderRadius: "8px",
              background: "#166534",
              color: "#f0fdf4",
              fontWeight: 700,
              border: "1px solid #22c55e",
              boxShadow: "0 2px 8px rgba(22,101,52,0.3)",
              cursor: "pointer",
            }}
          >
            ＋ Record Field Visit & Advisory
          </button>
          <button
            onClick={() => setTab("diagnostics")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "10px 16px",
              borderRadius: "8px",
              background: "#ffffff",
              color: "#166534",
              border: "1px solid #86efac",
              cursor: "pointer",
              fontWeight: 700,
              boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
            }}
          >
            🔬 CABI Plantwise Diagnoser
          </button>
          <button
            onClick={() => setTab("climate")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "10px 16px",
              borderRadius: "8px",
              background: "#ffffff",
              color: "#0369a1",
              border: "1px solid #bae6fd",
              cursor: "pointer",
              fontWeight: 700,
              boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
            }}
          >
            ⛅ Climate & Soil Advisory
          </button>
          <button
            onClick={() => setBroadcastModal(true)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "10px 16px",
              borderRadius: "8px",
              background: "#fef3c7",
              color: "#92400e",
              border: "1.5px solid #fde68a",
              cursor: "pointer",
              fontWeight: 700,
              boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
            }}
          >
            📢 Broadcast Outbreak Alert
          </button>
        </div>
      </section>

      {/* AEAS KPI Metrics */}
      <div className="ext-metrics">
        <Metric label="Field Encounters Logged" value={allVisits.length} sub="Traceable on-farm advisory sessions" />
        <Metric label="Agronomic Diagnoses" value={allVisits.filter((v) => v.crop || v.diagnostic).length} sub="CABI IPM treatment plans applied" />
        <Metric label="Institutional Referrals" value={referralsList.length} sub="Connected to CARI, MoA & Cash Transfers" />
        <Metric label="Open Service Caseload" value={data.requests.filter((r) => !["Resolved", "Closed", "Completed"].includes(r.status)).length} sub="Farmer requests awaiting field visit" />
      </div>

      {/* 5-Domain Tabs */}
      <div className="ext-tabs">
        <button className={tab === "encounters" ? "active" : ""} onClick={() => setTab("encounters")}>
          📋 Field Encounters & Visits Log ({allVisits.length})
        </button>
        <button className={tab === "diagnostics" ? "active" : ""} onClick={() => setTab("diagnostics")}>
          🔬 CABI Plantwise Diagnostics & Sprayer Tool
        </button>
        <button className={tab === "climate" ? "active" : ""} onClick={() => setTab("climate")}>
          ⛅ Climate-Smart & Soil Health Outlook
        </button>
        <button className={tab === "referrals" ? "active" : ""} onClick={() => setTab("referrals")}>
          🔗 Institutional Referrals Pipeline ({referralsList.length})
        </button>
        <button className={tab === "requests" ? "active" : ""} onClick={() => setTab("requests")}>
          📥 Service Caseload & Triage ({data.requests.length})
        </button>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search encounters, advice, pests, counties…"
          style={{ marginLeft: "auto", minWidth: 260 }}
        />
      </div>

      {/* TAB 1: Field Encounters & Visits Log */}
      {tab === "encounters" && (
        <section className="panel registry">
          <div className="table-tools" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px" }}>
            <div>
              <b style={{ fontSize: "1.05rem", color: "#0f172a", fontWeight: 800 }}>Official Field Advisory Encounters Logbook</b>
              <span style={{ marginLeft: 12, color: "#475569", fontSize: "0.85rem", fontWeight: 500 }}>
                {allVisits.length} verified encounters recorded with spatial GPS tags & advice
              </span>
            </div>
            <button
              onClick={() => setVisitModal(true)}
              style={{
                padding: "8px 16px",
                borderRadius: "6px",
                background: "#166534",
                color: "#fff",
                fontWeight: 600,
                border: "none",
                cursor: "pointer",
              }}
            >
              ＋ Log New Field Encounter
            </button>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Encounter Code</th>
                  <th>Date & Officer</th>
                  <th>Location & Crop</th>
                  <th>Field Observations</th>
                  <th>Technical Advice & IPM</th>
                  <th>Referral</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {allVisits.map((v) => (
                  <tr key={v.visitCode}>
                    <td>
                      <code style={{ color: "#0369a1", fontWeight: 700 }}>{v.visitCode}</code>
                      <small style={{ display: "block", color: "#64748b" }}>{v.visitType}</small>
                    </td>
                    <td>
                      <b>{v.officerName || "Extension Agent"}</b>
                      <small style={{ display: "block", color: "#64748b" }}>
                        {new Date(v.scheduledAt).toLocaleDateString("en-LR", { year: "numeric", month: "short", day: "numeric" })}
                      </small>
                    </td>
                    <td>
                      <b>{v.crop || "Agricultural Holding"}</b>
                      <small style={{ display: "block", color: "#64748b" }}>{v.location}</small>
                    </td>
                    <td style={{ maxWidth: 220 }}>
                      <span style={{ fontSize: "0.85rem", color: "#1e293b", lineHeight: 1.4 }}>{v.observations || v.purpose}</span>
                    </td>
                    <td style={{ maxWidth: 240 }}>
                      <span style={{ fontSize: "0.85rem", color: "#15803d", fontWeight: 600, lineHeight: 1.4 }}>
                        {v.advice || "Advice recorded on field card."}
                      </span>
                      {v.diagnostic && (
                        <span style={{ display: "block", fontSize: "0.75rem", color: "#b45309", fontWeight: 600, marginTop: 4 }}>
                          Pest: {v.diagnostic.pestOrDisease} ({v.diagnostic.severity})
                        </span>
                      )}
                    </td>
                    <td>
                      {v.referral ? (
                        <div>
                          <span style={{ fontSize: "0.82rem", color: "#0369a1", fontWeight: 700 }}>{v.referral}</span>
                          <span className="status" style={{ display: "inline-block", marginTop: 4 }}>
                            {v.referralStatus || "Referred"}
                          </span>
                        </div>
                      ) : (
                        <span style={{ color: "#64748b", fontSize: "0.8rem" }}>Direct resolution</span>
                      )}
                    </td>
                    <td>
                      <button
                        onClick={() => setCardModal(v)}
                        style={{
                          padding: "6px 12px",
                          borderRadius: "6px",
                          background: "#f0f9ff",
                          color: "#0369a1",
                          border: "1px solid #bae6fd",
                          fontSize: "0.78rem",
                          fontWeight: 700,
                          cursor: "pointer",
                          whiteSpace: "nowrap",
                        }}
                      >
                        📄 Farmer Card
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {!allVisits.length && (
              <div style={{ textAlign: "center", padding: "48px 24px", color: "#475569" }}>
                <p style={{ fontSize: "1.1rem", color: "#0f172a", marginBottom: 8, fontWeight: 700 }}>
                  No field encounters recorded yet
                </p>
                <p style={{ fontSize: "0.9rem", maxWidth: 500, margin: "0 auto 20px" }}>
                  Use the <b>“＋ Record Field Visit & Advisory”</b> button above to log your frontline farmer visits, diagnostic findings, and technical advice.
                </p>
                <button
                  onClick={() => setVisitModal(true)}
                  style={{
                    padding: "10px 20px",
                    borderRadius: "8px",
                    background: "#166534",
                    color: "#fff",
                    border: "none",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  ＋ Log First Field Visit
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* TAB 2: CABI Plantwise Agronomic Diagnostics & Sprayer Calibration */}
      {tab === "diagnostics" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "24px" }}>
          {/* Diagnostic Factsheet Catalog */}
          <section className="panel" style={{ padding: "24px", gridColumn: "1 / -1", background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: "1.15rem", color: "#0f172a", fontWeight: 800, margin: 0 }}>
                  CABI PlantwisePlus Agronomic Diagnostics & IPM Guidelines
                </h3>
                <p style={{ fontSize: "0.85rem", color: "#475569", margin: "4px 0 0" }}>
                  Verified Integrated Pest Management (IPM) decision matrix for Liberia's primary agricultural value chains.
                </p>
              </div>
              <span style={{ fontSize: "0.8rem", padding: "5px 12px", borderRadius: "12px", background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0", fontWeight: 700 }}>
                FAO · CABI Standard
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px" }}>
              {CABI_PEST_DATABASE.map((item, idx) => (
                <article
                  key={idx}
                  style={{
                    background: "#ffffff",
                    border: "1.5px solid #e2e8f0",
                    borderRadius: "10px",
                    padding: "18px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                    <span style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "#0284c7", fontWeight: 800 }}>
                      {item.crop}
                    </span>
                    <span style={{ fontSize: "0.72rem", padding: "3px 9px", borderRadius: "8px", background: item.severity === "Critical" ? "#fee2e2" : "#fef3c7", color: item.severity === "Critical" ? "#991b1b" : "#92400e", fontWeight: 700 }}>
                      {item.severity} Severity
                    </span>
                  </div>
                  <h4 style={{ color: "#0f172a", margin: "0 0 8px", fontSize: "1.05rem", fontWeight: 800 }}>{item.pest}</h4>
                  <p style={{ fontSize: "0.84rem", color: "#334155", marginBottom: 12, lineHeight: 1.5 }}>
                    <b style={{ color: "#0f172a" }}>Symptoms:</b> {item.symptoms}
                  </p>

                  <div style={{ fontSize: "0.82rem", background: "#f8fafc", border: "1px solid #e2e8f0", padding: "12px 14px", borderRadius: "8px", marginBottom: 14 }}>
                    <div style={{ color: "#15803d", marginBottom: 6, lineHeight: 1.4 }}><b style={{ color: "#166534" }}>Cultural:</b> {item.cultural}</div>
                    <div style={{ color: "#0369a1", marginBottom: 6, lineHeight: 1.4 }}><b style={{ color: "#075985" }}>Biological:</b> {item.biological}</div>
                    <div style={{ color: "#b91c1c", lineHeight: 1.4 }}><b style={{ color: "#991b1b" }}>Chemical (Last Resort):</b> {item.chemical}</div>
                  </div>

                  <button
                    onClick={() => {
                      setVisitModal(true);
                    }}
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "7px",
                      background: "#f0fdf4",
                      color: "#166534",
                      border: "1.5px solid #86efac",
                      fontSize: "0.82rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    Apply IPM Protocol to Field Encounter ↗
                  </button>
                </article>
              ))}
            </div>
          </section>

          {/* Knapsack Sprayer Calibration Tool */}
          <section className="panel" style={{ padding: "24px", gridColumn: "1 / -1", background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: "1.2rem", color: "#0f172a", fontWeight: 800, margin: 0 }}>
                  FAO Safe Pesticide Dilution & Knapsack Sprayer Calibrator
                </h3>
                <p style={{ fontSize: "0.88rem", color: "#475569", margin: "4px 0 0", fontWeight: 500 }}>
                  Calculate tank refills, active ingredient dilution rates, and safety intervals to prevent over-dosing and environmental runoff.
                </p>
              </div>
              <span style={{ fontSize: "0.8rem", padding: "5px 12px", borderRadius: "12px", background: "#e0f2fe", color: "#0369a1", border: "1px solid #bae6fd", fontWeight: 700 }}>
                WHO Class II/III Safe Use
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: 22 }}>
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", color: "#1e293b", fontWeight: 700, marginBottom: 6 }}>Field Area to Spray (Hectares)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={calcAreaHa}
                  onChange={(e) => setCalcAreaHa(Number(e.target.value) || 0.1)}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", background: "#ffffff", color: "#0f172a", border: "1.5px solid #cbd5e1", fontSize: "0.92rem", fontWeight: 600, outline: "none" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", color: "#1e293b", fontWeight: 700, marginBottom: 6 }}>Knapsack Tank Capacity (Litres)</label>
                <select
                  value={calcTankLitres}
                  onChange={(e) => setCalcTankLitres(Number(e.target.value))}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", background: "#ffffff", color: "#0f172a", border: "1.5px solid #cbd5e1", fontSize: "0.92rem", fontWeight: 600, outline: "none" }}
                >
                  <option value={15}>15 Litres (Standard Solo/Matabi)</option>
                  <option value={16}>16 Litres (Standard Knapsack)</option>
                  <option value={20}>20 Litres (Heavy Duty)</option>
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", color: "#1e293b", fontWeight: 700, marginBottom: 6 }}>Chemical Dosage per Hectare (mL or g)</label>
                <input
                  type="number"
                  step="10"
                  value={calcDoseHa}
                  onChange={(e) => setCalcDoseHa(Number(e.target.value) || 10)}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", background: "#ffffff", color: "#0f172a", border: "1.5px solid #cbd5e1", fontSize: "0.92rem", fontWeight: 600, outline: "none" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", color: "#1e293b", fontWeight: 700, marginBottom: 6 }}>Calibrated Water Volume (Litres / Ha)</label>
                <input
                  type="number"
                  step="20"
                  value={calcWaterRateHa}
                  onChange={(e) => setCalcWaterRateHa(Number(e.target.value) || 100)}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", background: "#ffffff", color: "#0f172a", border: "1.5px solid #cbd5e1", fontSize: "0.92rem", fontWeight: 600, outline: "none" }}
                />
              </div>
            </div>

            {/* Calculated Output Card */}
            <div style={{ background: "#f0fdf4", border: "1.5px solid #86efac", borderRadius: "12px", padding: "20px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "18px", boxShadow: "0 2px 10px rgba(22, 101, 52, 0.05)" }}>
              <div>
                <span style={{ fontSize: "0.75rem", color: "#166534", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Water Required</span>
                <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", marginTop: 4 }}>{sprayerResults.totalWater} Litres</div>
                <small style={{ color: "#475569", fontWeight: 500, fontSize: "0.82rem" }}>For {calcAreaHa} ha coverage</small>
              </div>
              <div>
                <span style={{ fontSize: "0.75rem", color: "#166534", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em" }}>Knapsack Tank Loads</span>
                <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", marginTop: 4 }}>{sprayerResults.totalTanks} Tanks</div>
                <small style={{ color: "#475569", fontWeight: 500, fontSize: "0.82rem" }}>at {calcTankLitres}L per tank</small>
              </div>
              <div>
                <span style={{ fontSize: "0.75rem", color: "#166534", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em" }}>Chemical Measure per Tank</span>
                <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#15803d", marginTop: 4 }}>{sprayerResults.dosePerTank} mL / g</div>
                <small style={{ color: "#475569", fontWeight: 500, fontSize: "0.82rem" }}>Dispense per filled tank</small>
              </div>
              <div>
                <span style={{ fontSize: "0.75rem", color: "#991b1b", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em" }}>⚠️ Mandatory PPE Protocol</span>
                <div style={{ fontSize: "0.85rem", color: "#78350f", fontWeight: 600, background: "#fef3c7", padding: "10px 12px", borderRadius: "8px", border: "1px solid #fde68a", marginTop: 6, lineHeight: 1.45 }}>
                  Nose mask, eye goggles, nitrile gloves, gumboots, and long sleeves. Do NOT spray against the wind.
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* TAB 3: Climate-Smart & Soil Health Outlook */}
      {tab === "climate" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "24px" }}>
          {/* 7-14 Day Agro-Meteorological Forecasting */}
          <section className="panel" style={{ padding: "24px", background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: "1.15rem", color: "#0f172a", fontWeight: 800, margin: 0 }}>
                  Liberia 7–14 Day Agro-Meteorological Forecast
                </h3>
                <p style={{ fontSize: "0.85rem", color: "#475569", margin: "4px 0 0" }}>
                  Hyper-local weather telemetry for planting, weeding, and fertilizer basaling decisions.
                </p>
              </div>
              <select
                value={selectedWeatherCounty}
                onChange={(e) => setSelectedWeatherCounty(e.target.value)}
                style={{ padding: "8px 14px", borderRadius: "8px", background: "#ffffff", color: "#0f172a", border: "1.5px solid #cbd5e1", fontWeight: 700, fontSize: "0.85rem" }}
              >
                {COUNTIES.map((c) => (
                  <option key={c} value={c}>{c} County</option>
                ))}
              </select>
            </div>

            {(() => {
              const w = COUNTY_WEATHER_DATA[selectedWeatherCounty] || COUNTY_WEATHER_DATA["Bong"];
              return (
                <div>
                  <div style={{ background: "#f8fafc", borderRadius: "10px", padding: "18px", marginBottom: 16, border: "1.5px solid #e2e8f0" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "1.1rem", fontWeight: 800, color: "#0369a1" }}>{selectedWeatherCounty} Outlook</span>
                      <span style={{ fontSize: "0.8rem", padding: "4px 10px", borderRadius: "10px", background: "#e0f2fe", color: "#0369a1", border: "1px solid #bae6fd", fontWeight: 700 }}>
                        Rain Probability: {w.rainProb}%
                      </span>
                    </div>
                    <p style={{ color: "#1e293b", fontSize: "0.95rem", margin: "10px 0", lineHeight: 1.5, fontWeight: 500 }}>{w.forecast}</p>
                    <div style={{ display: "flex", gap: "18px", marginTop: 10, fontSize: "0.88rem", color: "#475569" }}>
                      <span>🌡 Temp: <strong style={{ color: "#0f172a", fontWeight: 800 }}>{w.temp}</strong></span>
                      <span>💧 Est. Rain: <strong style={{ color: "#0f172a", fontWeight: 800 }}>{w.mm} mm</strong></span>
                      <span>💨 Humidity: <strong style={{ color: "#0f172a", fontWeight: 800 }}>{w.humidity}</strong></span>
                    </div>
                  </div>

                  <div style={{ background: "#eff6ff", border: "1.5px solid #bfdbfe", borderRadius: "10px", padding: "14px" }}>
                    <b style={{ color: "#1e40af", fontSize: "0.88rem", display: "block", marginBottom: 6, fontWeight: 800 }}>Agro-Meteorological Advisory to Farmer:</b>
                    <p style={{ color: "#1e3a8a", fontSize: "0.88rem", margin: 0, lineHeight: 1.5, fontWeight: 500 }}>{w.advice}</p>
                  </div>
                </div>
              );
            })()}
          </section>

          {/* Digital Soil Test Probe Logger & Fertilizer Optimizer */}
          <section className="panel" style={{ padding: "24px", background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: "1.15rem", color: "#0f172a", fontWeight: 800, margin: 0 }}>
                  Soil Health & Fertilizer Optimizer
                </h3>
                <p style={{ fontSize: "0.85rem", color: "#475569", margin: "4px 0 0" }}>
                  Log field probe measurements (pH, EC, moisture) to compute lime & NPK application rates.
                </p>
              </div>
              <span style={{ fontSize: "0.8rem", padding: "5px 12px", borderRadius: "12px", background: "#fef3c7", color: "#92400e", border: "1px solid #fde68a", fontWeight: 700 }}>
                SoilGrids Compatible
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: "0.78rem", color: "#1e293b", fontWeight: 700, marginBottom: 5 }}>Soil pH (Acidity)</label>
                <input
                  type="number"
                  step="0.1"
                  min="3.0"
                  max="9.0"
                  value={probePh}
                  onChange={(e) => setProbePh(Number(e.target.value) || 5.0)}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", background: "#ffffff", color: "#0f172a", border: "1.5px solid #cbd5e1", fontSize: "0.92rem", fontWeight: 600, outline: "none" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.78rem", color: "#1e293b", fontWeight: 700, marginBottom: 5 }}>EC (Salinity mS/cm)</label>
                <input
                  type="number"
                  step="0.05"
                  value={probeEc}
                  onChange={(e) => setProbeEc(Number(e.target.value) || 0.1)}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", background: "#ffffff", color: "#0f172a", border: "1.5px solid #cbd5e1", fontSize: "0.92rem", fontWeight: 600, outline: "none" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.78rem", color: "#1e293b", fontWeight: 700, marginBottom: 5 }}>Soil Moisture (%)</label>
                <input
                  type="number"
                  step="1"
                  value={probeMoisture}
                  onChange={(e) => setProbeMoisture(Number(e.target.value) || 50)}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", background: "#ffffff", color: "#0f172a", border: "1.5px solid #cbd5e1", fontSize: "0.92rem", fontWeight: 600, outline: "none" }}
                />
              </div>
            </div>

            <div style={{ background: "#f8fafc", borderRadius: "10px", padding: "18px", border: "1.5px solid #e2e8f0" }}>
              <div style={{ marginBottom: 12 }}>
                <span style={{ fontSize: "0.76rem", color: "#475569", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>Soil Acidity Classification:</span>
                <div style={{ fontSize: "1.05rem", fontWeight: 800, color: probePh < 5.0 ? "#b91c1c" : "#15803d", marginTop: 2 }}>
                  {soilDiagnosis.status}
                </div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <span style={{ fontSize: "0.76rem", color: "#475569", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>Liming Requirement:</span>
                <div style={{ fontSize: "0.9rem", color: "#1e293b", fontWeight: 600, marginTop: 2 }}>{soilDiagnosis.lime}</div>
              </div>
              <div>
                <span style={{ fontSize: "0.76rem", color: "#475569", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>Site-Specific Nutrient Prescription:</span>
                <div style={{ fontSize: "0.95rem", color: "#15803d", fontWeight: 800, marginTop: 2 }}>{soilDiagnosis.fert}</div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* TAB 4: Institutional Referrals Pipeline */}
      {tab === "referrals" && (
        <section className="panel registry">
          <div className="table-tools" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px" }}>
            <div>
              <b style={{ fontSize: "1.05rem", color: "#0f172a", fontWeight: 800 }}>Multi-Agency Institutional Referral Pipeline</b>
              <span style={{ marginLeft: 12, color: "#475569", fontSize: "0.85rem", fontWeight: 500 }}>
                Official linkages to CARI Research, MoA Plant Protection, Agro-Dealers, and MGCSP Cash Transfers
              </span>
            </div>
            <button
              onClick={() => setVisitModal(true)}
              style={{
                padding: "8px 16px",
                borderRadius: "6px",
                background: "#166534",
                color: "#fff",
                fontWeight: 600,
                border: "none",
                cursor: "pointer",
              }}
            >
              ＋ New Referral Case
            </button>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Encounter Code</th>
                  <th>Location</th>
                  <th>Referral Target & Destination</th>
                  <th>Purpose / Case Notes</th>
                  <th>Referral Status</th>
                  <th>Follow-up Date</th>
                </tr>
              </thead>
              <tbody>
                {referralsList.map((v) => (
                  <tr key={v.visitCode}>
                    <td>
                      <code style={{ color: "#0369a1", fontWeight: 700 }}>{v.visitCode}</code>
                      <small style={{ display: "block", color: "#64748b" }}>{v.officerName}</small>
                    </td>
                    <td>
                      <b>{v.crop || "Farm"}</b>
                      <small style={{ display: "block", color: "#64748b" }}>{v.location}</small>
                    </td>
                    <td>
                      <b style={{ color: "#0369a1", fontWeight: 700 }}>{v.referral}</b>
                    </td>
                    <td style={{ maxWidth: 260 }}>
                      <span style={{ fontSize: "0.85rem", color: "#1e293b", lineHeight: 1.4 }}>{v.observations || v.purpose}</span>
                    </td>
                    <td>
                      <span className="status">{v.referralStatus || "Referred"}</span>
                    </td>
                    <td>
                      {v.nextVisitAt ? (
                        <span style={{ fontSize: "0.85rem", color: "#b45309", fontWeight: 600 }}>{v.nextVisitAt}</span>
                      ) : (
                        <span style={{ color: "#64748b" }}>Not set</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {!referralsList.length && (
              <div style={{ textAlign: "center", padding: "48px 24px", color: "#475569" }}>
                <p style={{ fontSize: "1.1rem", color: "#0f172a", marginBottom: 8, fontWeight: 700 }}>
                  No active referrals in queue
                </p>
                <p style={{ fontSize: "0.9rem", maxWidth: 480, margin: "0 auto 16px" }}>
                  When visiting farms that require specialized seed testing (CARI), epidemic containment (MoA Crop Protection), input subsidies, or social cash transfers (MGCSP), document the referral in the Field Visit form.
                </p>
                <button
                  onClick={() => setVisitModal(true)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "6px",
                    background: "#166534",
                    color: "#fff",
                    fontWeight: 600,
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  ＋ Create Field Referral
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* TAB 5: Service Requests & Caseload Queue */}
      {tab === "requests" && (
        <section className="panel registry">
          <div className="table-tools" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px" }}>
            <div>
              <b style={{ fontSize: "1.05rem", color: "#0f172a", fontWeight: 800 }}>Farmer-Initiated Advisory Requests</b>
              <span style={{ marginLeft: 12, color: "#475569", fontSize: "0.85rem", fontWeight: 500 }}>
                {data.requests.length} total caseload cases
              </span>
            </div>
            <button
              onClick={() => setRequestModal(true)}
              style={{
                padding: "8px 16px",
                borderRadius: "6px",
                background: "#ffffff",
                color: "#166534",
                fontWeight: 700,
                border: "1.5px solid #166534",
                cursor: "pointer",
                boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
              }}
            >
              ＋ Log Request on Behalf of Farmer
            </button>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>Farmer / Requester</th>
                  <th>Service Needed</th>
                  <th>Location</th>
                  <th>Urgency</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {data.requests.map((r) => (
                  <tr key={r.requestCode}>
                    <td>
                      <code style={{ color: "#0369a1", fontWeight: 700 }}>{r.requestCode}</code>
                      <small style={{ display: "block", color: "#64748b" }}>{new Date(r.createdAt).toLocaleDateString()}</small>
                    </td>
                    <td>
                      <b>{r.requesterName}</b>
                      <small style={{ display: "block", color: "#64748b" }}>{r.farmerDfrId || "No DFR ID"}</small>
                    </td>
                    <td>
                      <b style={{ color: "#0f172a" }}>{r.serviceType}</b>
                      <small style={{ display: "block", color: "#475569", lineHeight: 1.3 }}>{r.problemDescription}</small>
                    </td>
                    <td>
                      <b>{r.county}</b>
                      <small style={{ display: "block", color: "#64748b" }}>{r.district}</small>
                    </td>
                    <td>
                      <span className={`hd-priority ${r.urgency.toLowerCase()}`}>{r.urgency}</span>
                    </td>
                    <td>
                      <span className="status">{r.status}</span>
                    </td>
                    <td>
                      <button
                        onClick={() => {
                          setVisitDraft((d) => ({
                            ...d,
                            farmerDfrId: r.farmerDfrId || "",
                            farmerName: r.requesterName || "",
                            county: r.county || "Bong",
                            district: r.district || "",
                            crop: "Lowland Rice",
                            observations: `Farmer Request: ${r.serviceType} — ${r.problemDescription}`,
                            serviceType: r.serviceType || "Crop production advice",
                          }));
                          setVisitStep(1);
                          setVisitModal(true);
                        }}
                        style={{
                          padding: "6px 12px",
                          borderRadius: "6px",
                          background: "#166534",
                          color: "#fff",
                          fontSize: "0.78rem",
                          fontWeight: 600,
                          border: "none",
                          cursor: "pointer",
                        }}
                      >
                        Manage Visit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {!data.requests.length && (
              <div style={{ textAlign: "center", padding: "48px 24px", color: "#475569" }}>
                <p style={{ fontSize: "1.1rem", color: "#0f172a", marginBottom: 8, fontWeight: 700 }}>
                  No pending farmer requests
                </p>
                <p style={{ fontSize: "0.9rem", maxWidth: 450, margin: "0 auto 16px" }}>
                  Frontline farmers can request advisory sessions through local agricultural centers, or extension officers can log requests directly.
                </p>
                <button
                  onClick={() => setRequestModal(true)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "6px",
                    background: "#166534",
                    color: "#fff",
                    border: "none",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  ＋ Log Farmer Request
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* MODAL 1: ENTERPRISE FIELD ENCOUNTER & ADVISORY WIZARD */}
      {visitModal && (
        <div
          className="modal-wrap enrollment-overlay"
          style={{ zIndex: 10000 }}
          onMouseDown={(e) => {
            if (e.currentTarget === e.target) setVisitModal(false);
          }}
        >
          <form
            className="enrollment-wizard ext-wizard"
            onSubmit={submitFieldVisit}
          >
            <header>
              <div>
                <span>♢ &nbsp; NATIONAL AGRICULTURAL EXTENSION &amp; ADVISORY SERVICES (AEAS)</span>
                <h2>Field Visit &amp; Agronomic Advisory Wizard</h2>
                <p>Official frontline on-farm diagnostic recording, technical advisory prescription, and multi-agency institutional referrals.</p>
              </div>
              <b>Step {visitStep} of 4</b>
              <button type="button" onClick={() => setVisitModal(false)} aria-label="Close field encounter wizard">
                ×
              </button>
              <nav>
                {visitStages.map((stage, i) => (
                  <button
                    type="button"
                    key={stage}
                    className={visitStep === i + 1 ? "active" : visitStep > i + 1 ? "done" : ""}
                    onClick={() => setVisitStep(i + 1)}
                  >
                    {i + 1}. {stage}
                  </button>
                ))}
              </nav>
            </header>

            <main>
              {/* STEP 1: Farmer & Holding Profile */}
              {visitStep === 1 && (
                <>
                  <section className="enroll-panel">
                    <h3>Select Enrolled Farmer (DFR Smallholder Registry)</h3>
                    <p style={{ fontSize: "11px", color: "#64748b", margin: "0 0 12px" }}>
                      Choose an enrolled smallholder from the registry directory to auto-populate official identifiers, GPS coordinates, and crop value chains:
                    </p>
                    <label className="full-label">
                      Farmer Directory Lookup
                      <select
                        name="farmerSelect"
                        value={visitDraft.farmerDfrId || ""}
                        onChange={(e) => {
                          const sel = farmersList.find((f) => f.dfrId === e.target.value);
                          if (sel) {
                            setVisitDraft((d) => ({
                              ...d,
                              farmerDfrId: sel.dfrId,
                              farmerName: `${sel.firstName} ${sel.lastName}`,
                              county: sel.county || "Bong",
                              district: sel.district || "",
                              crop: sel.crop || "Rice",
                              location: `${sel.community || ""}, ${sel.district || ""}, ${sel.county || ""}`,
                            }));
                          }
                        }}
                      >
                        <option value="">-- Choose from Enrolled Farmers or Enter Manually --</option>
                        {farmersList.map((f) => (
                          <option key={f.dfrId} value={f.dfrId}>
                            {f.firstName} {f.lastName} ({f.dfrId}) — {f.county}, {f.crop}
                          </option>
                        ))}
                      </select>
                    </label>
                  </section>

                  <section className="identity-panel">
                    <h3>♙ Enrolled Farmer &amp; Holding Profile</h3>
                    <div className="enroll-grid three">
                      <label>
                        Farmer DFR ID*
                        <input
                          name="farmerDfrId"
                          value={visitDraft.farmerDfrId || ""}
                          onChange={(e) => updateVisitDraft("farmerDfrId", e.target.value)}
                          placeholder="LBR-XX-000000"
                          required
                        />
                      </label>
                      <label>
                        Farmer Full Name*
                        <input
                          name="farmerName"
                          value={visitDraft.farmerName || ""}
                          onChange={(e) => updateVisitDraft("farmerName", e.target.value)}
                          placeholder="Full legal name"
                          required
                        />
                      </label>
                      <label>
                        County*
                        <select
                          name="county"
                          value={visitDraft.county || "Bong"}
                          onChange={(e) => updateVisitDraft("county", e.target.value)}
                          required
                        >
                          {COUNTIES.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </label>
                      <label>
                        District &amp; Community
                        <input
                          name="district"
                          value={visitDraft.district || ""}
                          onChange={(e) => updateVisitDraft("district", e.target.value)}
                          placeholder="e.g. Suakoko, Phebe Valley"
                        />
                      </label>
                      <label>
                        Primary Crop Observed*
                        <input
                          name="crop"
                          value={visitDraft.crop || ""}
                          onChange={(e) => updateVisitDraft("crop", e.target.value)}
                          placeholder="e.g. Lowland Rice, Cocoa, Cassava"
                          required
                        />
                      </label>
                      <label>
                        Service / Advisory Type*
                        <select
                          name="serviceType"
                          value={visitDraft.serviceType || "Crop production advice"}
                          onChange={(e) => updateVisitDraft("serviceType", e.target.value)}
                          required
                        >
                          {SERVICES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </label>
                      <label>
                        Encounter Date &amp; Time*
                        <input
                          type="datetime-local"
                          name="scheduledAt"
                          value={visitDraft.scheduledAt || new Date().toISOString().slice(0, 16)}
                          onChange={(e) => updateVisitDraft("scheduledAt", e.target.value)}
                          required
                        />
                      </label>
                      <label>
                        Encounter Type
                        <select
                          name="visitType"
                          value={visitDraft.visitType || "On-farm field inspection"}
                          onChange={(e) => updateVisitDraft("visitType", e.target.value)}
                        >
                          <option>On-farm field inspection</option>
                          <option>CABI Plantwise plant clinic</option>
                          <option>Group demonstration session</option>
                          <option>Office advisory consultation</option>
                          <option>Phone / Remote triage</option>
                        </select>
                      </label>
                      <label>
                        Specific Location &amp; GPS Reference
                        <input
                          name="location"
                          value={visitDraft.location || ""}
                          onChange={(e) => updateVisitDraft("location", e.target.value)}
                          placeholder="e.g. Lowland Plot 2, Gbedin Swamp, Lat 7.362, Lng -8.706"
                        />
                      </label>
                    </div>
                  </section>
                </>
              )}

              {/* STEP 2: Diagnostics & Pest Symptoms */}
              {visitStep === 2 && (
                <>
                  <section className="enroll-panel">
                    <h3>Crop Growth Stage &amp; Pest Infestation Severity</h3>
                    <div className="enroll-grid">
                      <label>
                        Current Crop Growth Stage
                        <select
                          name="cropStage"
                          value={visitDraft.cropStage || "Vegetative / Tillering"}
                          onChange={(e) => updateVisitDraft("cropStage", e.target.value)}
                        >
                          <option>Germination / Seedling emergence</option>
                          <option>Vegetative / Tillering</option>
                          <option>Flowering / Booting / Tasseling</option>
                          <option>Grain filling / Tuber bulking</option>
                          <option>Maturation / Pre-harvest</option>
                        </select>
                      </label>
                      <label>
                        Pest &amp; Disease Severity Classification*
                        <select
                          name="severity"
                          value={visitDraft.severity || "Moderate"}
                          onChange={(e) => updateVisitDraft("severity", e.target.value)}
                          required
                        >
                          <option value="None">None (Healthy plot, routine visit)</option>
                          <option value="Low">Low (Sporadic symptoms below economic threshold)</option>
                          <option value="Moderate">Moderate (Economic injury threshold approached)</option>
                          <option value="Severe">Severe (Critical epidemic outbreak, urgent intervention)</option>
                        </select>
                      </label>
                    </div>

                    <div style={{ marginTop: 16 }}>
                      <label className="full-label">
                        Agronomic Field Observations &amp; Diagnostic Findings*
                        <textarea
                          name="observations"
                          value={visitDraft.observations || ""}
                          onChange={(e) => updateVisitDraft("observations", e.target.value)}
                          placeholder="Document leaf discoloration, defoliation patterns, lesion margins, insect larval instars, soil waterlogging, or nutrient chlorosis..."
                          rows={4}
                          required
                        />
                      </label>
                    </div>
                  </section>

                  <section className="identity-panel">
                    <h3>🔬 CABI PlantwisePlus IPM Diagnostic Matrix</h3>
                    <p style={{ fontSize: "11px", color: "#506557", marginBottom: 14 }}>
                      Select diagnosed pest or disease to attach certified FAO / CABI Integrated Pest Management protocols:
                    </p>
                    <div className="classification-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
                      {CABI_PEST_DATABASE.map((pest, idx) => (
                        <label
                          key={idx}
                          className={visitDraft.diagnosedPest === pest.pestOrDisease ? "selected" : ""}
                          onClick={() => {
                            updateVisitDraft("diagnosedPest", pest.pestOrDisease);
                            updateVisitDraft("pestSymptoms", pest.symptoms);
                            updateVisitDraft("advice", `Cultural: ${pest.culturalControl} | Biological: ${pest.biologicalControl} | Chemical: ${pest.chemicalControl}`);
                          }}
                        >
                          <input
                            type="radio"
                            name="diagnosedPestRadio"
                            checked={visitDraft.diagnosedPest === pest.pestOrDisease}
                            readOnly
                          />
                          <i>🔬</i>
                          <b>{pest.pestOrDisease}</b>
                          <span>{pest.crop} · {pest.scientificName}</span>
                        </label>
                      ))}
                    </div>

                    {visitDraft.diagnosedPest && (
                      <div className="review-card" style={{ marginTop: 18, background: "#133827" }}>
                        <h4 style={{ color: "#bbf7d0" }}>Attached CABI IPM Protocol: {visitDraft.diagnosedPest}</h4>
                        <div style={{ gridTemplateColumns: "repeat(3, 1fr)", marginTop: 10 }}>
                          <p><span style={{ color: "#86efac" }}>Cultural Controls</span><b style={{ fontSize: "9px" }}>{CABI_PEST_DATABASE.find(p => p.pestOrDisease === visitDraft.diagnosedPest)?.culturalControl || "Field hygiene"}</b></p>
                          <p><span style={{ color: "#86efac" }}>Biological Controls</span><b style={{ fontSize: "9px" }}>{CABI_PEST_DATABASE.find(p => p.pestOrDisease === visitDraft.diagnosedPest)?.biologicalControl || "Bio-pesticides"}</b></p>
                          <p><span style={{ color: "#86efac" }}>Chemical / Regulated</span><b style={{ fontSize: "9px" }}>{CABI_PEST_DATABASE.find(p => p.pestOrDisease === visitDraft.diagnosedPest)?.chemicalControl || "Contact CAO"}</b></p>
                        </div>
                      </div>
                    )}
                  </section>
                </>
              )}

              {/* STEP 3: Agronomic Advisory & Media */}
              {visitStep === 3 && (
                <>
                  <section className="enroll-panel">
                    <h3>Official Technical Advice &amp; Agronomic Prescription*</h3>
                    <p style={{ fontSize: "11px", color: "#64748b", margin: "0 0 12px" }}>
                      Provide actionable, step-by-step guidance that the smallholder can implement immediately on their plot:
                    </p>
                    <label className="full-label">
                      Prescribed Technical Advisory (IPM / Nutrient Management)*
                      <textarea
                        name="advice"
                        value={visitDraft.advice || ""}
                        onChange={(e) => updateVisitDraft("advice", e.target.value)}
                        placeholder="Detail cultural practices, biological controls, safe dilution rates, planting depth, or fertilizer scheduling..."
                        rows={5}
                        required
                      />
                    </label>
                  </section>

                  <section className="identity-panel">
                    <h3>🚜 Knapsack Sprayer Dilution &amp; Calibration Summary</h3>
                    <p style={{ fontSize: "11px", color: "#506557", marginBottom: 14 }}>
                      Verify correct dilution and water volume to prevent over-application or environmental runoff:
                    </p>
                    <div className="enroll-grid three">
                      <label>
                        Treated Area (ha)
                        <input
                          type="number"
                          step="0.1"
                          value={calcAreaHa}
                          onChange={(e) => setCalcAreaHa(Number(e.target.value) || 0.1)}
                        />
                      </label>
                      <label>
                        Tank Capacity (L)
                        <input
                          type="number"
                          value={calcTankLitres}
                          onChange={(e) => setCalcTankLitres(Number(e.target.value) || 16)}
                        />
                      </label>
                      <label>
                        Chemical Dose (mL or g/ha)
                        <input
                          type="number"
                          value={calcDoseHa}
                          onChange={(e) => setCalcDoseHa(Number(e.target.value) || 100)}
                        />
                      </label>
                      <label>
                        Water Application Rate (L/ha)
                        <input
                          type="number"
                          value={calcWaterRateHa}
                          onChange={(e) => setCalcWaterRateHa(Number(e.target.value) || 200)}
                        />
                      </label>
                      <label>
                        Total Required Water
                        <input readOnly value={`${sprayerResults.totalWater} Litres`} />
                      </label>
                      <label>
                        Calibrated Dose / Knapsack Tank
                        <input
                          readOnly
                          style={{ fontWeight: 800, color: "#166534" }}
                          value={`${sprayerResults.dosePerTank} mL (or g) across ${sprayerResults.totalTanks} tanks`}
                        />
                      </label>
                    </div>
                  </section>

                  <section className="enroll-panel">
                    <h3>🗣 Low-Literacy Vernacular Media &amp; Audio Support</h3>
                    <div className="enroll-grid">
                      <label>
                        Vernacular Audio Language Note
                        <select
                          name="audioLanguage"
                          value={visitDraft.audioLanguage || "English"}
                          onChange={(e) => updateVisitDraft("audioLanguage", e.target.value)}
                        >
                          <option value="English">English / Liberian English</option>
                          <option value="Kpelle">Kpelle</option>
                          <option value="Bassa">Bassa</option>
                          <option value="Mano">Mano</option>
                          <option value="Gio">Gio</option>
                          <option value="Lorma">Lorma</option>
                        </select>
                      </label>
                      <label>
                        Field Audio Capture Status
                        <input readOnly value="Microphone Ready · 60s Voice Note Audio Protocol" style={{ color: "#08764e", fontWeight: 700 }} />
                      </label>
                    </div>
                  </section>
                </>
              )}

              {/* STEP 4: Referrals & Officer Sign-off */}
              {visitStep === 4 && (
                <>
                  <section className="enroll-panel">
                    <h3>🏛 Multi-Agency Institutional Referral Pipeline</h3>
                    <p style={{ fontSize: "11px", color: "#64748b", margin: "0 0 12px" }}>
                      Escalate cases that require specialized laboratory testing, quarantine containment, or statutory social transfers:
                    </p>
                    <div className="enroll-grid">
                      <label>
                        Institutional Referral Destination
                        <select
                          name="referral"
                          value={visitDraft.referral || ""}
                          onChange={(e) => updateVisitDraft("referral", e.target.value)}
                        >
                          <option value="">None (Direct Field Resolution)</option>
                          <option value="CARI Research — Seed Testing & Varietal Screening">CARI Research (Seed & Soil Lab)</option>
                          <option value="MoA Crop Protection & Quarantine Unit">MoA Crop Protection (Epidemic Unit)</option>
                          <option value="Local Agro-Dealer — Subsidized Inputs Voucher">Agro-Dealer Input Voucher Network</option>
                          <option value="MGCSP Social Cash Transfer (SCTP) Referral">MGCSP Social Cash Transfer (SCTP)</option>
                          <option value="Cooperative Outgrower Aggregation Hub">Cooperative Aggregator Hub</option>
                          <option value="Liberia Land Authority (LLA) — Boundary Mediation">Liberia Land Authority (Boundary)</option>
                        </select>
                      </label>
                      <label>
                        Referral Priority &amp; Status
                        <select
                          name="referralStatus"
                          value={visitDraft.referralStatus || "Not required"}
                          onChange={(e) => updateVisitDraft("referralStatus", e.target.value)}
                        >
                          <option value="Not required">Not required</option>
                          <option value="Referred">Referred (Official Ticket Issued)</option>
                          <option value="Accepted">Accepted by Institution</option>
                        </select>
                      </label>
                    </div>
                  </section>

                  <section className="identity-panel">
                    <h3>✍ Extension Officer Accountability &amp; Follow-up</h3>
                    <div className="enroll-grid three">
                      <label>
                        Extension Officer Name*
                        <input
                          name="officerName"
                          value={visitDraft.officerName || (role === "Extension agent" ? "Dr. John Kerkulah" : "Agricultural Extension Officer")}
                          onChange={(e) => updateVisitDraft("officerName", e.target.value)}
                          required
                        />
                      </label>
                      <label>
                        Encounter Status
                        <select
                          name="status"
                          value={visitDraft.status || "Completed"}
                          onChange={(e) => updateVisitDraft("status", e.target.value)}
                        >
                          <option value="Completed">Completed (Advice Delivered)</option>
                          <option value="Scheduled">Scheduled</option>
                          <option value="Follow-up required">Follow-up required</option>
                        </select>
                      </label>
                      <label>
                        Scheduled Follow-up Date
                        <input
                          type="date"
                          name="nextVisitAt"
                          value={visitDraft.nextVisitAt || ""}
                          onChange={(e) => updateVisitDraft("nextVisitAt", e.target.value)}
                        />
                      </label>
                    </div>

                    <div className="review-card" style={{ marginTop: 22 }}>
                      <h4>Encounter Verification Summary</h4>
                      <div>
                        <p><span>Smallholder</span><b>{visitDraft.farmerName || "—"} ({visitDraft.farmerDfrId || "No DFR ID"})</b></p>
                        <p><span>Location</span><b>{visitDraft.county || "—"} ({visitDraft.district || "—"})</b></p>
                        <p><span>Observed Crop &amp; Severity</span><b>{visitDraft.crop || "—"} · {visitDraft.severity || "None"}</b></p>
                        <p><span>Referral Route</span><b>{visitDraft.referral || "Direct resolution"}</b></p>
                      </div>
                    </div>

                    <label className="consent" style={{ marginTop: 16 }}>
                      <input type="checkbox" required />
                      I certify that this on-farm encounter was conducted in accordance with MoA/FAO standard operating procedures and logged onto the smallholder's registry record.
                    </label>
                  </section>
                </>
              )}
            </main>

            <footer>
              <button
                type="button"
                disabled={visitStep === 1}
                onClick={() => setVisitStep((s) => Math.max(1, s - 1))}
              >
                ← Previous Step
              </button>
              {visitStep < 4 ? (
                <button
                  type="button"
                  onClick={() => setVisitStep((s) => Math.min(4, s + 1))}
                >
                  Next Step →
                </button>
              ) : (
                <button
                  type="submit"
                  className="submit-registration"
                  disabled={busy}
                >
                  {busy ? "Committing Record..." : "Submit Official Field Visit Record"}
                </button>
              )}
            </footer>
          </form>
        </div>
      )}

      {/* MODAL 2: EMERGENCY OUTBREAK ALERT BROADCAST */}
      {broadcastModal && (
        <div
          className="modal-wrap enrollment-overlay"
          style={{ zIndex: 10000 }}
          onMouseDown={(e) => {
            if (e.currentTarget === e.target) setBroadcastModal(false);
          }}
        >
          <form
            className="enrollment-wizard ext-wizard"
            style={{ maxWidth: 880 }}
            onSubmit={submitBroadcast}
          >
            <header>
              <div>
                <span>♢ &nbsp; EARLY WARNING &amp; EMERGENCY OUTBREAK RESPONSE ENGINE</span>
                <h2>Pest Outbreak &amp; Climate Shock Broadcast</h2>
                <p>Dispatch verified phytosanitary alerts and emergency SMS/IVR advisories across registered farming communities.</p>
              </div>
              <b>Emergency Protocol</b>
              <button type="button" onClick={() => setBroadcastModal(false)} aria-label="Close broadcast modal">
                ×
              </button>
            </header>

            <main>
              <section className="enroll-panel">
                <h3>Geographic Scope &amp; Value Chain</h3>
                <div className="enroll-grid">
                  <label>
                    Target County*
                    <select name="county" required>
                      <option value="National">National (All 15 Counties)</option>
                      {COUNTIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Target Crop / Commodity*
                    <input name="crop" defaultValue="Rice &amp; Cassava" required />
                  </label>
                </div>
                <div style={{ marginTop: 14 }}>
                  <label className="full-label">
                    Alert Title*
                    <input name="title" defaultValue="Urgent Pest Advisory: Fall Armyworm Vector Detected" required />
                  </label>
                </div>
              </section>

              <section className="identity-panel">
                <h3>📢 Emergency Advisory Message &amp; Channels</h3>
                <label className="full-label">
                  Vernacular SMS / IVR Broadcast Message*
                  <textarea
                    name="message"
                    rows={4}
                    defaultValue="MOA / FAO URGENT ADVISORY: Fall armyworm caterpillars reported in lowland rice plots. Inspect leaf whorls immediately. Apply neem seed extract (NSKE 5%) or contact your local County Agriculture Officer. Do not spray near open water."
                    required
                  />
                </label>
                <div className="enroll-grid" style={{ marginTop: 14 }}>
                  <label>
                    Broadcast Channel
                    <select name="channel">
                      <option>SMS Broadcast + IVR Vernacular Audio</option>
                      <option>WhatsApp Business Community Channel</option>
                      <option>Community Radio Transcript</option>
                    </select>
                  </label>
                  <label>
                    Estimated Smallholder Reach
                    <input readOnly value="~ 142 Smallholder Producers" style={{ opacity: 0.85, fontWeight: 700 }} />
                  </label>
                </div>
              </section>
            </main>

            <footer>
              <button type="button" onClick={() => setBroadcastModal(false)}>
                Cancel
              </button>
              <button
                type="submit"
                className="submit-registration"
                style={{ background: "#b45309", color: "#fff" }}
                disabled={busy}
              >
                {busy ? "Broadcasting..." : "Dispatch Emergency Alert →"}
              </button>
            </footer>
          </form>
        </div>
      )}

      {/* MODAL 3: LOG FARMER SERVICE REQUEST */}
      {requestModal && (
        <div
          className="modal-wrap enrollment-overlay"
          style={{ zIndex: 10000 }}
          onMouseDown={(e) => {
            if (e.currentTarget === e.target) setRequestModal(false);
          }}
        >
          <form
            className="enrollment-wizard ext-wizard"
            style={{ maxWidth: 880 }}
            onSubmit={submitFarmerRequest}
          >
            <header>
              <div>
                <span>♢ &nbsp; FRONTLINE ADVISORY &amp; CASELOAD INTAKE</span>
                <h2>Farmer Extension Service Request Intake</h2>
                <p>Register and triage smallholder requests for pest control, soil testing, and mechanization advice.</p>
              </div>
              <b>Caseload Intake</b>
              <button type="button" onClick={() => setRequestModal(false)} aria-label="Close request modal">
                ×
              </button>
            </header>

            <main>
              <section className="enroll-panel">
                <h3>Smallholder Identification &amp; Holding Location</h3>
                <div className="enroll-grid three">
                  <label>
                    Farmer DFR ID
                    <input name="farmerDfrId" placeholder="LBR-XX-000000" />
                  </label>
                  <label>
                    Requester Full Name*
                    <input name="requesterName" required placeholder="Legal full name" />
                  </label>
                  <label>
                    County*
                    <select name="county" required>
                      {COUNTIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    District / Community
                    <input name="district" placeholder="e.g. Suakoko, Phebe Valley" />
                  </label>
                  <label>
                    Service Required*
                    <select name="serviceType" required>
                      {SERVICES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Urgency Classification
                    <select name="urgency">
                      <option>Normal</option>
                      <option>High</option>
                      <option>Critical</option>
                    </select>
                  </label>
                </div>
              </section>

              <section className="identity-panel">
                <h3>Problem Description &amp; Agronomic Context</h3>
                <label className="full-label">
                  Detailed Description of Farm Issue*
                  <textarea
                    name="problemDescription"
                    rows={4}
                    placeholder="Describe the crop problem, symptoms observed, duration of infestation, and requested assistance..."
                    required
                  />
                </label>
              </section>
            </main>

            <footer>
              <button type="button" onClick={() => setRequestModal(false)}>
                Cancel
              </button>
              <button
                type="submit"
                className="submit-registration"
                disabled={busy}
              >
                {busy ? "Submitting..." : "Submit Caseload Request →"}
              </button>
            </footer>
          </form>
        </div>
      )}

      {/* MODAL 4: PRINTABLE FARMER ADVISORY CARD */}
      {cardModal && (
        <div
          className="modal-wrap enrollment-overlay"
          style={{ zIndex: 10000 }}
          onMouseDown={(e) => {
            if (e.currentTarget === e.target) setCardModal(null);
          }}
        >
          <div
            className="enrollment-wizard ext-wizard"
            style={{ maxWidth: 760, background: "#ffffff" }}
          >
            <header>
              <div>
                <span>REPUBLIC OF LIBERIA · MINISTRY OF AGRICULTURE</span>
                <h2>Official Farmer Field Advisory Slip</h2>
                <p>Frontline Extension &amp; Advisory Services (AEAS) · Smallholder Field Record</p>
              </div>
              <b style={{ background: "#22c55e", color: "#064e3b" }}>Verified DFR Card</b>
              <button type="button" onClick={() => setCardModal(null)} aria-label="Close card modal">
                ×
              </button>
            </header>

            <main>
              <section className="identity-panel" style={{ background: "#f8fafc", borderColor: "#cbd5e1" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontSize: "11px", marginBottom: 12 }}>
                  <div><span style={{ color: "#64748b" }}>Encounter ID:</span> <code style={{ color: "#0284c7", fontWeight: 800 }}>{cardModal.visitCode}</code></div>
                  <div><span style={{ color: "#64748b" }}>Encounter Date:</span> <strong>{new Date(cardModal.scheduledAt).toLocaleDateString()}</strong></div>
                  <div><span style={{ color: "#64748b" }}>Extension Officer:</span> <strong>{cardModal.officerName}</strong></div>
                  <div><span style={{ color: "#64748b" }}>Holding Location:</span> <strong>{cardModal.location}</strong></div>
                  <div><span style={{ color: "#64748b" }}>Target Crop:</span> <strong>{cardModal.crop || "Lowland Rice / Cassava"}</strong></div>
                  <div><span style={{ color: "#64748b" }}>Encounter Type:</span> <strong>{cardModal.visitType}</strong></div>
                </div>

                <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: 14, marginBottom: 14 }}>
                  <span style={{ fontSize: "10px", color: "#475569", textTransform: "uppercase", display: "block", marginBottom: 4, fontWeight: 700 }}>
                    Field Diagnosis &amp; Observations:
                  </span>
                  <p style={{ margin: 0, fontSize: "12px", color: "#1e293b", lineHeight: 1.5 }}>
                    {cardModal.observations || cardModal.purpose}
                  </p>
                </div>

                <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: 14, marginBottom: 14 }}>
                  <span style={{ fontSize: "10px", color: "#166534", textTransform: "uppercase", display: "block", marginBottom: 4, fontWeight: 800 }}>
                    Prescribed Action &amp; IPM Technical Advice:
                  </span>
                  <p style={{ margin: 0, fontSize: "12px", color: "#15803d", fontWeight: 600, lineHeight: 1.5 }}>
                    {cardModal.advice || "Advice recorded on field card."}
                  </p>
                </div>

                {cardModal.referral && (
                  <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: 14, background: "#f0f9ff", padding: "12px", borderRadius: "8px", border: "1px solid #bae6fd" }}>
                    <span style={{ fontSize: "10px", color: "#0369a1", textTransform: "uppercase", display: "block", marginBottom: 3, fontWeight: 800 }}>
                      Official Institutional Referral:
                    </span>
                    <div style={{ fontSize: "12px", color: "#0c4a6e", fontWeight: 700 }}>{cardModal.referral}</div>
                    <small style={{ color: "#64748b" }}>Status: {cardModal.referralStatus || "Referred"}</small>
                  </div>
                )}
              </section>

              <section className="enroll-panel" style={{ marginTop: 16 }}>
                <h3>Farmer Pictographic &amp; Vernacular Instructions</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px", textAlign: "center" }}>
                  <div style={{ padding: "12px 6px", background: "#f1f5f9", borderRadius: "10px" }}>
                    <span style={{ fontSize: "22px", display: "block" }}>🌿</span>
                    <b style={{ fontSize: "10px", color: "#1e293b" }}>Weed Control</b>
                    <span style={{ fontSize: "8px", color: "#64748b", display: "block" }}>2x Manual Hoeing</span>
                  </div>
                  <div style={{ padding: "12px 6px", background: "#f1f5f9", borderRadius: "10px" }}>
                    <span style={{ fontSize: "22px", display: "block" }}>💧</span>
                    <b style={{ fontSize: "10px", color: "#1e293b" }}>Water Level</b>
                    <span style={{ fontSize: "8px", color: "#64748b", display: "block" }}>5cm Bund Retention</span>
                  </div>
                  <div style={{ padding: "12px 6px", background: "#f1f5f9", borderRadius: "10px" }}>
                    <span style={{ fontSize: "22px", display: "block" }}>🛡</span>
                    <b style={{ fontSize: "10px", color: "#1e293b" }}>Sprayer PPE</b>
                    <span style={{ fontSize: "8px", color: "#64748b", display: "block" }}>Mask + Gloves</span>
                  </div>
                  <div style={{ padding: "12px 6px", background: "#f1f5f9", borderRadius: "10px" }}>
                    <span style={{ fontSize: "22px", display: "block" }}>🎙</span>
                    <b style={{ fontSize: "10px", color: "#1e293b" }}>Vernacular Audio</b>
                    <span style={{ fontSize: "8px", color: "#b45309", display: "block" }}>Kpelle / Liberian English</span>
                  </div>
                </div>
              </section>
            </main>

            <footer>
              <button type="button" onClick={() => setCardModal(null)}>
                Close
              </button>
              <button
                type="button"
                className="submit-registration"
                style={{ background: "#166534", color: "#fff" }}
                onClick={() => {
                  if (typeof window !== "undefined") window.print();
                }}
              >
                🖨 Print / PDF Advisory Slip
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}

function Metric({ label, value, sub }: { label: string; value: number; sub: string }) {
  return (
    <article className="metric">
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{sub}</small>
      </div>
      <i>☘</i>
    </article>
  );
}
