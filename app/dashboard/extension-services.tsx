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
    const body: Record<string, any> = Object.fromEntries(fd.entries());

    // attach active diagnostic & soil info if available
    body.action = "record-visit";
    body.officerName = body.officerName || (role === "Extension agent" ? "Dr. John Kerkulah" : "Agricultural Officer");

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
            onClick={() => setDiagnosticModal(true)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "10px 16px",
              borderRadius: "8px",
              background: "rgba(255,255,255,0.08)",
              color: "#e2e8f0",
              border: "1px solid rgba(255,255,255,0.2)",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            🔬 CABI Plantwise Diagnoser
          </button>
          <button
            onClick={() => setClimateModal(true)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "10px 16px",
              borderRadius: "8px",
              background: "rgba(255,255,255,0.08)",
              color: "#e2e8f0",
              border: "1px solid rgba(255,255,255,0.2)",
              cursor: "pointer",
              fontWeight: 600,
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
              background: "rgba(245, 158, 11, 0.15)",
              color: "#fbbf24",
              border: "1px solid rgba(245, 158, 11, 0.35)",
              cursor: "pointer",
              fontWeight: 600,
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
              <b style={{ fontSize: "1rem", color: "#f8fafc" }}>Official Field Advisory Encounters Logbook</b>
              <span style={{ marginLeft: 12, color: "#94a3b8", fontSize: "0.85rem" }}>
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
                      <code style={{ color: "#38bdf8", fontWeight: 700 }}>{v.visitCode}</code>
                      <small style={{ display: "block", color: "#64748b" }}>{v.visitType}</small>
                    </td>
                    <td>
                      <b>{v.officerName || "Extension Agent"}</b>
                      <small style={{ display: "block", color: "#94a3b8" }}>
                        {new Date(v.scheduledAt).toLocaleDateString("en-LR", { year: "numeric", month: "short", day: "numeric" })}
                      </small>
                    </td>
                    <td>
                      <b>{v.crop || "Agricultural Holding"}</b>
                      <small style={{ display: "block", color: "#94a3b8" }}>{v.location}</small>
                    </td>
                    <td style={{ maxWidth: 220 }}>
                      <span style={{ fontSize: "0.85rem", color: "#cbd5e1" }}>{v.observations || v.purpose}</span>
                    </td>
                    <td style={{ maxWidth: 240 }}>
                      <span style={{ fontSize: "0.85rem", color: "#34d399", fontWeight: 500 }}>
                        {v.advice || "Advice recorded on field card."}
                      </span>
                      {v.diagnostic && (
                        <span style={{ display: "block", fontSize: "0.75rem", color: "#f59e0b", marginTop: 4 }}>
                          Pest: {v.diagnostic.pestOrDisease} ({v.diagnostic.severity})
                        </span>
                      )}
                    </td>
                    <td>
                      {v.referral ? (
                        <div>
                          <span style={{ fontSize: "0.8rem", color: "#e2e8f0", fontWeight: 600 }}>{v.referral}</span>
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
                          background: "rgba(56, 189, 248, 0.15)",
                          color: "#38bdf8",
                          border: "1px solid rgba(56, 189, 248, 0.35)",
                          fontSize: "0.78rem",
                          fontWeight: 600,
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
              <div style={{ textAlign: "center", padding: "48px 24px", color: "#94a3b8" }}>
                <p style={{ fontSize: "1.1rem", color: "#f8fafc", marginBottom: 8, fontWeight: 600 }}>
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
          <section className="panel" style={{ padding: "24px", gridColumn: "1 / -1" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: "1.15rem", color: "#f8fafc", margin: 0 }}>
                  CABI PlantwisePlus Agronomic Diagnostics & IPM Guidelines
                </h3>
                <p style={{ fontSize: "0.85rem", color: "#94a3b8", margin: "4px 0 0" }}>
                  Verified Integrated Pest Management (IPM) decision matrix for Liberia's primary agricultural value chains.
                </p>
              </div>
              <span style={{ fontSize: "0.8rem", padding: "4px 10px", borderRadius: "12px", background: "rgba(34, 197, 94, 0.15)", color: "#4ade80", border: "1px solid rgba(34, 197, 94, 0.3)" }}>
                FAO · CABI Standard
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px" }}>
              {CABI_PEST_DATABASE.map((item, idx) => (
                <article
                  key={idx}
                  style={{
                    background: "rgba(15, 23, 42, 0.6)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "10px",
                    padding: "18px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                    <span style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "#38bdf8", fontWeight: 700 }}>
                      {item.crop}
                    </span>
                    <span style={{ fontSize: "0.7rem", padding: "2px 8px", borderRadius: "8px", background: item.severity === "Critical" ? "rgba(239, 68, 68, 0.2)" : "rgba(245, 158, 11, 0.2)", color: item.severity === "Critical" ? "#f87171" : "#fbbf24", fontWeight: 600 }}>
                      {item.severity} Severity
                    </span>
                  </div>
                  <h4 style={{ color: "#f8fafc", margin: "0 0 8px", fontSize: "1rem" }}>{item.pest}</h4>
                  <p style={{ fontSize: "0.82rem", color: "#cbd5e1", marginBottom: 12, lineHeight: 1.4 }}>
                    <b>Symptoms:</b> {item.symptoms}
                  </p>

                  <div style={{ fontSize: "0.8rem", background: "rgba(0,0,0,0.25)", padding: "10px 12px", borderRadius: "6px", marginBottom: 12 }}>
                    <div style={{ color: "#86efac", marginBottom: 4 }}><b>Cultural:</b> {item.cultural}</div>
                    <div style={{ color: "#93c5fd", marginBottom: 4 }}><b>Biological:</b> {item.biological}</div>
                    <div style={{ color: "#fca5a5" }}><b>Chemical (Last Resort):</b> {item.chemical}</div>
                  </div>

                  <button
                    onClick={() => {
                      setVisitModal(true);
                    }}
                    style={{
                      width: "100%",
                      padding: "8px",
                      borderRadius: "6px",
                      background: "rgba(34, 197, 94, 0.15)",
                      color: "#4ade80",
                      border: "1px solid rgba(34, 197, 94, 0.3)",
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Apply IPM Protocol to Field Encounter ↗
                  </button>
                </article>
              ))}
            </div>
          </section>

          {/* Knapsack Sprayer Calibration Tool */}
          <section className="panel" style={{ padding: "24px", gridColumn: "1 / -1" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: "1.15rem", color: "#f8fafc", margin: 0 }}>
                  FAO Safe Pesticide Dilution & Knapsack Sprayer Calibrator
                </h3>
                <p style={{ fontSize: "0.85rem", color: "#94a3b8", margin: "4px 0 0" }}>
                  Calculate tank refills, active ingredient dilution rates, and safety intervals to prevent over-dosing and environmental runoff.
                </p>
              </div>
              <span style={{ fontSize: "0.8rem", padding: "4px 10px", borderRadius: "12px", background: "rgba(56, 189, 248, 0.15)", color: "#38bdf8", border: "1px solid rgba(56, 189, 248, 0.3)" }}>
                WHO Class II/III Safe Use
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: 20 }}>
              <div>
                <label style={{ display: "block", fontSize: "0.78rem", color: "#94a3b8", marginBottom: 4 }}>Field Area to Spray (Hectares)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={calcAreaHa}
                  onChange={(e) => setCalcAreaHa(Number(e.target.value) || 0.1)}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", background: "rgba(255,255,255,0.08)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.78rem", color: "#94a3b8", marginBottom: 4 }}>Knapsack Tank Capacity (Litres)</label>
                <select
                  value={calcTankLitres}
                  onChange={(e) => setCalcTankLitres(Number(e.target.value))}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", background: "rgba(255,255,255,0.08)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)" }}
                >
                  <option value={15}>15 Litres (Standard Solo/Matabi)</option>
                  <option value={16}>16 Litres (Standard Knapsack)</option>
                  <option value={20}>20 Litres (Heavy Duty)</option>
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.78rem", color: "#94a3b8", marginBottom: 4 }}>Chemical Dosage per Hectare (mL or g)</label>
                <input
                  type="number"
                  step="10"
                  value={calcDoseHa}
                  onChange={(e) => setCalcDoseHa(Number(e.target.value) || 10)}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", background: "rgba(255,255,255,0.08)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.78rem", color: "#94a3b8", marginBottom: 4 }}>Calibrated Water Volume (Litres / Ha)</label>
                <input
                  type="number"
                  step="20"
                  value={calcWaterRateHa}
                  onChange={(e) => setCalcWaterRateHa(Number(e.target.value) || 100)}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", background: "rgba(255,255,255,0.08)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)" }}
                />
              </div>
            </div>

            {/* Calculated Output Card */}
            <div style={{ background: "rgba(22, 101, 52, 0.2)", border: "1px solid rgba(34, 197, 94, 0.35)", borderRadius: "8px", padding: "18px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
              <div>
                <span style={{ fontSize: "0.75rem", color: "#86efac", textTransform: "uppercase" }}>Total Water Required</span>
                <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "#fff" }}>{sprayerResults.totalWater} Litres</div>
                <small style={{ color: "#94a3b8" }}>For {calcAreaHa} ha coverage</small>
              </div>
              <div>
                <span style={{ fontSize: "0.75rem", color: "#86efac", textTransform: "uppercase" }}>Knapsack Tank Loads</span>
                <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "#fff" }}>{sprayerResults.totalTanks} Tanks</div>
                <small style={{ color: "#94a3b8" }}>at {calcTankLitres}L per tank</small>
              </div>
              <div>
                <span style={{ fontSize: "0.75rem", color: "#86efac", textTransform: "uppercase" }}>Chemical Measure per Tank</span>
                <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "#4ade80" }}>{sprayerResults.dosePerTank} mL / g</div>
                <small style={{ color: "#94a3b8" }}>Dispense per filled tank</small>
              </div>
              <div>
                <span style={{ fontSize: "0.75rem", color: "#86efac", textTransform: "uppercase" }}>Mandatory PPE Protocol</span>
                <div style={{ fontSize: "0.85rem", color: "#fef08a", marginTop: 4 }}>
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
          <section className="panel" style={{ padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: "1.15rem", color: "#f8fafc", margin: 0 }}>
                  Liberia 7–14 Day Agro-Meteorological Forecast
                </h3>
                <p style={{ fontSize: "0.85rem", color: "#94a3b8", margin: "4px 0 0" }}>
                  Hyper-local weather telemetry for planting, weeding, and fertilizer basaling decisions.
                </p>
              </div>
              <select
                value={selectedWeatherCounty}
                onChange={(e) => setSelectedWeatherCounty(e.target.value)}
                style={{ padding: "6px 12px", borderRadius: "6px", background: "rgba(255,255,255,0.08)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)" }}
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
                  <div style={{ background: "rgba(15, 23, 42, 0.6)", borderRadius: "8px", padding: "16px", marginBottom: 16, border: "1px solid rgba(255, 255, 255, 0.1)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "1.1rem", fontWeight: 700, color: "#38bdf8" }}>{selectedWeatherCounty} Outlook</span>
                      <span style={{ fontSize: "0.8rem", padding: "3px 8px", borderRadius: "10px", background: "rgba(56, 189, 248, 0.15)", color: "#38bdf8" }}>
                        Rain Probability: {w.rainProb}%
                      </span>
                    </div>
                    <p style={{ color: "#e2e8f0", fontSize: "0.9rem", margin: "8px 0" }}>{w.forecast}</p>
                    <div style={{ display: "flex", gap: "16px", marginTop: 8, fontSize: "0.85rem", color: "#94a3b8" }}>
                      <span>🌡 Temp: <strong style={{ color: "#fff" }}>{w.temp}</strong></span>
                      <span>💧 Est. Rain: <strong style={{ color: "#fff" }}>{w.mm} mm</strong></span>
                      <span>💨 Humidity: <strong style={{ color: "#fff" }}>{w.humidity}</strong></span>
                    </div>
                  </div>

                  <div style={{ background: "rgba(59, 130, 246, 0.15)", border: "1px solid rgba(59, 130, 246, 0.3)", borderRadius: "8px", padding: "14px" }}>
                    <b style={{ color: "#93c5fd", fontSize: "0.85rem", display: "block", marginBottom: 4 }}>Agro-Meteorological Advisory to Farmer:</b>
                    <p style={{ color: "#e0f2fe", fontSize: "0.82rem", margin: 0, lineHeight: 1.4 }}>{w.advice}</p>
                  </div>
                </div>
              );
            })()}
          </section>

          {/* Digital Soil Test Probe Logger & Fertilizer Optimizer */}
          <section className="panel" style={{ padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: "1.15rem", color: "#f8fafc", margin: 0 }}>
                  Soil Health & Fertilizer Optimizer
                </h3>
                <p style={{ fontSize: "0.85rem", color: "#94a3b8", margin: "4px 0 0" }}>
                  Log field probe measurements (pH, EC, moisture) to compute lime & NPK application rates.
                </p>
              </div>
              <span style={{ fontSize: "0.8rem", padding: "4px 10px", borderRadius: "12px", background: "rgba(245, 158, 11, 0.15)", color: "#fbbf24", border: "1px solid rgba(245, 158, 11, 0.3)" }}>
                SoilGrids Compatible
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", color: "#94a3b8", marginBottom: 4 }}>Soil pH (Acidity)</label>
                <input
                  type="number"
                  step="0.1"
                  min="3.0"
                  max="9.0"
                  value={probePh}
                  onChange={(e) => setProbePh(Number(e.target.value) || 5.0)}
                  style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", background: "rgba(255,255,255,0.08)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", color: "#94a3b8", marginBottom: 4 }}>EC (Salinity mS/cm)</label>
                <input
                  type="number"
                  step="0.05"
                  value={probeEc}
                  onChange={(e) => setProbeEc(Number(e.target.value) || 0.1)}
                  style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", background: "rgba(255,255,255,0.08)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", color: "#94a3b8", marginBottom: 4 }}>Soil Moisture (%)</label>
                <input
                  type="number"
                  step="1"
                  value={probeMoisture}
                  onChange={(e) => setProbeMoisture(Number(e.target.value) || 50)}
                  style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", background: "rgba(255,255,255,0.08)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)" }}
                />
              </div>
            </div>

            <div style={{ background: "rgba(15, 23, 42, 0.6)", borderRadius: "8px", padding: "16px", border: "1px solid rgba(255, 255, 255, 0.1)" }}>
              <div style={{ marginBottom: 10 }}>
                <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Soil Acidity Classification:</span>
                <div style={{ fontSize: "0.95rem", fontWeight: 700, color: probePh < 5.0 ? "#f87171" : "#4ade80" }}>
                  {soilDiagnosis.status}
                </div>
              </div>
              <div style={{ marginBottom: 10 }}>
                <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Liming Requirement:</span>
                <div style={{ fontSize: "0.85rem", color: "#e2e8f0" }}>{soilDiagnosis.lime}</div>
              </div>
              <div>
                <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Site-Specific Nutrient Prescription:</span>
                <div style={{ fontSize: "0.85rem", color: "#86efac", fontWeight: 600 }}>{soilDiagnosis.fert}</div>
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
              <b style={{ fontSize: "1rem", color: "#f8fafc" }}>Multi-Agency Institutional Referral Pipeline</b>
              <span style={{ marginLeft: 12, color: "#94a3b8", fontSize: "0.85rem" }}>
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
                      <code>{v.visitCode}</code>
                      <small style={{ display: "block", color: "#64748b" }}>{v.officerName}</small>
                    </td>
                    <td>
                      <b>{v.crop || "Farm"}</b>
                      <small style={{ display: "block", color: "#94a3b8" }}>{v.location}</small>
                    </td>
                    <td>
                      <b style={{ color: "#38bdf8" }}>{v.referral}</b>
                    </td>
                    <td style={{ maxWidth: 260 }}>
                      <span style={{ fontSize: "0.85rem", color: "#cbd5e1" }}>{v.observations || v.purpose}</span>
                    </td>
                    <td>
                      <span className="status">{v.referralStatus || "Referred"}</span>
                    </td>
                    <td>
                      {v.nextVisitAt ? (
                        <span style={{ fontSize: "0.85rem", color: "#f59e0b" }}>{v.nextVisitAt}</span>
                      ) : (
                        <span style={{ color: "#64748b" }}>Not set</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {!referralsList.length && (
              <div style={{ textAlign: "center", padding: "48px 24px", color: "#94a3b8" }}>
                <p style={{ fontSize: "1.1rem", color: "#f8fafc", marginBottom: 8, fontWeight: 600 }}>
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
              <b style={{ fontSize: "1rem", color: "#f8fafc" }}>Farmer-Initiated Advisory Requests</b>
              <span style={{ marginLeft: 12, color: "#94a3b8", fontSize: "0.85rem" }}>
                {data.requests.length} total caseload cases
              </span>
            </div>
            <button
              onClick={() => setRequestModal(true)}
              style={{
                padding: "8px 16px",
                borderRadius: "6px",
                background: "rgba(255,255,255,0.08)",
                color: "#e2e8f0",
                fontWeight: 600,
                border: "1px solid rgba(255,255,255,0.2)",
                cursor: "pointer",
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
                      <code>{r.requestCode}</code>
                      <small style={{ display: "block", color: "#64748b" }}>{new Date(r.createdAt).toLocaleDateString()}</small>
                    </td>
                    <td>
                      <b>{r.requesterName}</b>
                      <small style={{ display: "block", color: "#94a3b8" }}>{r.farmerDfrId || "No DFR ID"}</small>
                    </td>
                    <td>
                      <b>{r.serviceType}</b>
                      <small style={{ display: "block", color: "#cbd5e1" }}>{r.problemDescription}</small>
                    </td>
                    <td>
                      {r.county}
                      <small style={{ display: "block", color: "#94a3b8" }}>{r.district}</small>
                    </td>
                    <td>
                      <span className={`hd-priority ${r.urgency.toLowerCase()}`}>{r.urgency}</span>
                    </td>
                    <td>
                      <span className="status">{r.status}</span>
                    </td>
                    <td>
                      <button
                        onClick={() => setSelected(r)}
                        style={{
                          padding: "6px 12px",
                          borderRadius: "6px",
                          background: "#166534",
                          color: "#fff",
                          fontSize: "0.78rem",
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
              <div style={{ textAlign: "center", padding: "48px 24px", color: "#94a3b8" }}>
                <p style={{ fontSize: "1.1rem", color: "#f8fafc", marginBottom: 8, fontWeight: 600 }}>
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
                    background: "rgba(255,255,255,0.08)",
                    color: "#fff",
                    border: "1px solid rgba(255,255,255,0.2)",
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

      {/* MODAL 1: RECORD FIELD VISIT & FARM ADVISORY */}
      {visitModal && (
        <div className="modal-back">
          <form className="register-modal ext-form" onSubmit={submitFieldVisit} style={{ maxWidth: 740, maxHeight: "90vh", overflowY: "auto" }}>
            <header>
              <div>
                <span style={{ color: "#4ade80", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700 }}>
                  Domain 1 & 2: ODK / CABI PlantwisePlus Integrated Encounter
                </span>
                <h2 style={{ margin: "4px 0 0", color: "#fff", fontSize: "1.25rem" }}>
                  Record Extension Field Visit & Advisory
                </h2>
              </div>
              <button type="button" onClick={() => setVisitModal(false)} style={{ background: "transparent", border: "none", color: "#94a3b8", fontSize: "1.5rem", cursor: "pointer" }}>
                ×
              </button>
            </header>

            <div className="form-grid" style={{ padding: "16px 20px" }}>
              {/* Farmer Selection with Autofill */}
              <label className="wide">
                Select Enrolled Farmer (DFR ID)
                <select
                  name="farmerSelect"
                  onChange={(e) => {
                    const sel = farmersList.find((f) => f.dfrId === e.target.value);
                    if (sel) {
                      const form = e.currentTarget.form;
                      if (form) {
                        (form.elements.namedItem("farmerDfrId") as HTMLInputElement).value = sel.dfrId;
                        (form.elements.namedItem("farmerName") as HTMLInputElement).value = `${sel.firstName} ${sel.lastName}`;
                        (form.elements.namedItem("county") as HTMLSelectElement).value = sel.county || "Bong";
                        (form.elements.namedItem("district") as HTMLInputElement).value = sel.district || "";
                        (form.elements.namedItem("crop") as HTMLInputElement).value = sel.crop || "Rice";
                        (form.elements.namedItem("location") as HTMLInputElement).value = `${sel.community || ""}, ${sel.district || ""}, ${sel.county || ""}`;
                      }
                    }
                  }}
                  style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", background: "rgba(255,255,255,0.08)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)" }}
                >
                  <option value="">-- Choose from Enrolled Farmers or Enter Manually --</option>
                  {farmersList.map((f) => (
                    <option key={f.dfrId} value={f.dfrId}>
                      {f.firstName} {f.lastName} ({f.dfrId}) — {f.county}, {f.crop}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Farmer DFR ID*
                <input name="farmerDfrId" placeholder="LBR-XX-000000" required />
              </label>
              <label>
                Farmer Full Name*
                <input name="farmerName" placeholder="Full legal name" required />
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
                District & Community
                <input name="district" placeholder="e.g. Suakoko, Phebe Valley" />
              </label>

              <label>
                Primary Crop Observed*
                <input name="crop" placeholder="e.g. Lowland Rice, Cocoa, Cassava" required />
              </label>
              <label>
                Service / Advisory Type*
                <select name="serviceType" required>
                  {SERVICES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </label>

              <label>
                Encounter Date & Time*
                <input type="datetime-local" name="scheduledAt" defaultValue={new Date().toISOString().slice(0, 16)} required />
              </label>
              <label>
                Encounter Type
                <select name="visitType">
                  <option>On-farm field inspection</option>
                  <option>CABI Plantwise plant clinic</option>
                  <option>Group demonstration session</option>
                  <option>Office advisory consultation</option>
                  <option>Phone / Remote triage</option>
                </select>
              </label>

              <label>
                Extension Officer Name*
                <input name="officerName" defaultValue={role === "Extension agent" ? "Dr. John Kerkulah" : "Agricultural Extension Officer"} required />
              </label>
              <label>
                Encounter Status
                <select name="status">
                  <option value="Completed">Completed (Advice Delivered)</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="Follow-up required">Follow-up required</option>
                </select>
              </label>

              <label className="wide">
                Specific Location & GPS Reference
                <input name="location" placeholder="e.g. Lowland Plot 2, Gbedin Swamp, Lat 7.362, Lng -8.706" />
              </label>

              <label className="wide">
                Agronomic Field Observations & Diagnosis*
                <textarea
                  name="observations"
                  placeholder="Document leaf discoloration, pest infestation severity, soil moisture conditions, weed pressure, or growth stage..."
                  rows={3}
                  required
                />
              </label>

              <label className="wide">
                Official Technical Advice Given to Farmer (IPM / Nutrients)*
                <textarea
                  name="advice"
                  placeholder="Detail cultural practices, biological controls, safe dilution rates, planting depth, or fertilizer scheduling..."
                  rows={3}
                  required
                />
              </label>

              {/* Institutional Referral Section */}
              <label>
                Institutional Referral Destination
                <select name="referral">
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
                Referral Status
                <select name="referralStatus">
                  <option value="Not required">Not required</option>
                  <option value="Referred">Referred (Official Ticket Issued)</option>
                  <option value="Accepted">Accepted by Institution</option>
                </select>
              </label>

              <label>
                Vernacular Audio Language Note
                <select name="audioLanguage">
                  <option value="English">English / Liberian English</option>
                  <option value="Kpelle">Kpelle</option>
                  <option value="Bassa">Bassa</option>
                  <option value="Mano">Mano</option>
                  <option value="Gio">Gio</option>
                  <option value="Lorma">Lorma</option>
                </select>
              </label>
              <label>
                Scheduled Follow-up Date
                <input type="date" name="nextVisitAt" />
              </label>
            </div>

            <footer style={{ display: "flex", justifyContent: "flex-end", gap: "12px", padding: "16px 20px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
              <button type="button" onClick={() => setVisitModal(false)} style={{ padding: "8px 16px", borderRadius: "6px", background: "transparent", color: "#94a3b8", border: "1px solid rgba(255,255,255,0.2)", cursor: "pointer" }}>
                Cancel
              </button>
              <button
                disabled={busy}
                style={{ padding: "8px 20px", borderRadius: "6px", background: "#166534", color: "#fff", border: "none", fontWeight: 700, cursor: "pointer" }}
              >
                {busy ? "Saving Encounter..." : "Commit Field Visit Record"}
              </button>
            </footer>
          </form>
        </div>
      )}

      {/* MODAL 2: EMERGENCY OUTBREAK ALERT BROADCAST */}
      {broadcastModal && (
        <div className="modal-back">
          <form className="register-modal ext-form" onSubmit={submitBroadcast} style={{ maxWidth: 580 }}>
            <header>
              <div>
                <span style={{ color: "#fbbf24", fontSize: "0.75rem", textTransform: "uppercase", fontWeight: 700 }}>
                  Domain 4: Emergency Alert Broadcast Engine
                </span>
                <h2 style={{ margin: "4px 0 0", color: "#fff", fontSize: "1.2rem" }}>
                  Broadcast Outbreak / Climate Shock Alert
                </h2>
              </div>
              <button type="button" onClick={() => setBroadcastModal(false)} style={{ background: "transparent", border: "none", color: "#94a3b8", fontSize: "1.4rem", cursor: "pointer" }}>
                ×
              </button>
            </header>

            <div className="form-grid" style={{ padding: "16px 20px" }}>
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
                <input name="crop" defaultValue="Rice & Cassava" required />
              </label>

              <label className="wide">
                Alert Title*
                <input name="title" defaultValue="Urgent Pest Advisory: Fall Armyworm Vector Detected" required />
              </label>

              <label className="wide">
                Vernacular SMS / IVR Broadcast Message*
                <textarea
                  name="message"
                  rows={4}
                  defaultValue="MOA / FAO URGENT ADVISORY: Fall armyworm caterpillars reported in lowland rice plots. Inspect leaf whorls immediately. Apply neem seed extract (NSKE 5%) or contact your local County Agriculture Officer. Do not spray near open water."
                  required
                />
              </label>

              <label>
                Broadcast Channel
                <select name="channel">
                  <option>SMS Broadcast + IVR Vernacular Audio</option>
                  <option>WhatsApp Business Community Channel</option>
                  <option>Community Radio Transcript</option>
                </select>
              </label>
              <label>
                Estimated Reach
                <input readOnly value="~ 142 Smallholder Producers" style={{ opacity: 0.8 }} />
              </label>
            </div>

            <footer style={{ display: "flex", justifyContent: "flex-end", gap: "12px", padding: "16px 20px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
              <button type="button" onClick={() => setBroadcastModal(false)} style={{ padding: "8px 16px", borderRadius: "6px", background: "transparent", color: "#94a3b8", border: "1px solid rgba(255,255,255,0.2)", cursor: "pointer" }}>
                Cancel
              </button>
              <button
                disabled={busy}
                style={{ padding: "8px 20px", borderRadius: "6px", background: "#b45309", color: "#fff", border: "none", fontWeight: 700, cursor: "pointer" }}
              >
                {busy ? "Broadcasting..." : "Dispatch Emergency Alert"}
              </button>
            </footer>
          </form>
        </div>
      )}

      {/* MODAL 3: LOG FARMER SERVICE REQUEST */}
      {requestModal && (
        <div className="modal-back">
          <form className="register-modal ext-form" onSubmit={submitFarmerRequest} style={{ maxWidth: 620 }}>
            <header>
              <div>
                <span style={{ color: "#38bdf8", fontSize: "0.75rem", textTransform: "uppercase", fontWeight: 700 }}>
                  Farmer Request Intake
                </span>
                <h2 style={{ margin: "4px 0 0", color: "#fff", fontSize: "1.2rem" }}>
                  Request Extension Assistance
                </h2>
              </div>
              <button type="button" onClick={() => setRequestModal(false)} style={{ background: "transparent", border: "none", color: "#94a3b8", fontSize: "1.4rem", cursor: "pointer" }}>
                ×
              </button>
            </header>

            <div className="form-grid" style={{ padding: "16px 20px" }}>
              <label>
                Farmer DFR ID
                <input name="farmerDfrId" placeholder="LBR-XX-000000" />
              </label>
              <label>
                Requester Full Name*
                <input name="requesterName" required />
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
                County*
                <select name="county" required>
                  {COUNTIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </label>
              <label>
                District / Community
                <input name="district" />
              </label>
              <label>
                Urgency
                <select name="urgency">
                  <option>Normal</option>
                  <option>High</option>
                  <option>Critical</option>
                </select>
              </label>
              <label className="wide">
                Problem Description*
                <textarea name="problemDescription" rows={3} required />
              </label>
            </div>

            <footer style={{ display: "flex", justifyContent: "flex-end", gap: "12px", padding: "16px 20px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
              <button type="button" onClick={() => setRequestModal(false)} style={{ padding: "8px 16px", borderRadius: "6px", background: "transparent", color: "#94a3b8", border: "1px solid rgba(255,255,255,0.2)", cursor: "pointer" }}>
                Cancel
              </button>
              <button disabled={busy} style={{ padding: "8px 20px", borderRadius: "6px", background: "#166534", color: "#fff", border: "none", fontWeight: 700, cursor: "pointer" }}>
                {busy ? "Submitting..." : "Submit Request"}
              </button>
            </footer>
          </form>
        </div>
      )}

      {/* MODAL 4: PRINTABLE FARMER ADVISORY CARD */}
      {cardModal && (
        <div className="modal-back">
          <div style={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "12px", maxWidth: 640, width: "100%", color: "#fff", padding: "24px", boxShadow: "0 20px 40px rgba(0,0,0,0.5)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: 16, marginBottom: 16 }}>
              <div>
                <span style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "#4ade80", letterSpacing: "0.05em", fontWeight: 700 }}>
                  Republic of Liberia · Ministry of Agriculture
                </span>
                <h3 style={{ margin: "4px 0 0", fontSize: "1.2rem", color: "#fff" }}>
                  Official Farmer Field Advisory Slip
                </h3>
              </div>
              <button onClick={() => setCardModal(null)} style={{ background: "transparent", border: "none", color: "#94a3b8", fontSize: "1.5rem", cursor: "pointer" }}>
                ×
              </button>
            </div>

            <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: "8px", padding: "16px", marginBottom: 16, border: "1px solid rgba(255,255,255,0.08)" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontSize: "0.85rem", marginBottom: 12 }}>
                <div><span style={{ color: "#94a3b8" }}>Encounter ID:</span> <code style={{ color: "#38bdf8", fontWeight: 700 }}>{cardModal.visitCode}</code></div>
                <div><span style={{ color: "#94a3b8" }}>Date:</span> <strong>{new Date(cardModal.scheduledAt).toLocaleDateString()}</strong></div>
                <div><span style={{ color: "#94a3b8" }}>Officer:</span> <strong>{cardModal.officerName}</strong></div>
                <div><span style={{ color: "#94a3b8" }}>Location:</span> <strong>{cardModal.location}</strong></div>
                <div><span style={{ color: "#94a3b8" }}>Crop:</span> <strong>{cardModal.crop || "Rice / Cassava"}</strong></div>
                <div><span style={{ color: "#94a3b8" }}>Encounter Type:</span> <strong>{cardModal.visitType}</strong></div>
              </div>

              <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 12, marginBottom: 12 }}>
                <span style={{ fontSize: "0.75rem", color: "#94a3b8", textTransform: "uppercase", display: "block", marginBottom: 4 }}>
                  Field Diagnosis & Observations:
                </span>
                <p style={{ margin: 0, fontSize: "0.88rem", color: "#e2e8f0" }}>{cardModal.observations || cardModal.purpose}</p>
              </div>

              <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 12, marginBottom: 12 }}>
                <span style={{ fontSize: "0.75rem", color: "#86efac", textTransform: "uppercase", display: "block", marginBottom: 4, fontWeight: 700 }}>
                  Recommended Action & IPM Advice:
                </span>
                <p style={{ margin: 0, fontSize: "0.9rem", color: "#4ade80", fontWeight: 500, lineHeight: 1.4 }}>
                  {cardModal.advice || "Advice recorded on field card."}
                </p>
              </div>

              {cardModal.referral && (
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 12, background: "rgba(56, 189, 248, 0.08)", padding: "10px", borderRadius: "6px" }}>
                  <span style={{ fontSize: "0.75rem", color: "#38bdf8", textTransform: "uppercase", display: "block", marginBottom: 2, fontWeight: 700 }}>
                    Official Institutional Referral:
                  </span>
                  <div style={{ fontSize: "0.88rem", color: "#fff", fontWeight: 600 }}>{cardModal.referral}</div>
                  <small style={{ color: "#94a3b8" }}>Status: {cardModal.referralStatus || "Referred"}</small>
                </div>
              )}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 16 }}>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Vernacular Audio Note:</span>
                <span style={{ fontSize: "0.75rem", padding: "2px 8px", borderRadius: "10px", background: "rgba(245, 158, 11, 0.2)", color: "#fbbf24" }}>
                  Liberian Kpelle / English
                </span>
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={() => {
                    if (typeof window !== "undefined") window.print();
                  }}
                  style={{ padding: "8px 16px", borderRadius: "6px", background: "#166534", color: "#fff", fontWeight: 600, border: "none", cursor: "pointer" }}
                >
                  🖨 Print / PDF Slip
                </button>
                <button
                  onClick={() => setCardModal(null)}
                  style={{ padding: "8px 16px", borderRadius: "6px", background: "rgba(255,255,255,0.08)", color: "#94a3b8", border: "1px solid rgba(255,255,255,0.15)", cursor: "pointer" }}
                >
                  Close
                </button>
              </div>
            </div>
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
