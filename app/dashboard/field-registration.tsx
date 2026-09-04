"use client";

import { FormEvent, useMemo, useState, useEffect } from "react";

export type Farmer = {
  id: number;
  dfrId: string;
  provisionalId?: string;
  approvedDfrId?: string;
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
  latitude: number | null;
  longitude: number | null;
  photoUrl?: string;
};

const COUNTIES_LIST = [
  "All Counties",
  "Bomi",
  "Bong",
  "Gbarpolu",
  "Grand Bassa",
  "Grand Cape Mount",
  "Grand Gedeh",
  "Grand Kru",
  "Lofa",
  "Margibi",
  "Maryland",
  "Montserrado",
  "Nimba",
  "River Cess",
  "River Gee",
  "Sinoe",
];

const COUNTY_COORDINATES: Record<string, { lat: number; lng: number; district: string }> = {
  Nimba: { lat: 7.3592, lng: -8.7214, district: "Sanniquellie-Mahn" },
  Bong: { lat: 6.9942, lng: -9.5857, district: "Suakoko" },
  Lofa: { lat: 8.3512, lng: -9.7314, district: "Foya" },
  Montserrado: { lat: 6.3156, lng: -10.8074, district: "Greater Monrovia" },
  "Grand Bassa": { lat: 5.8821, lng: -10.0456, district: "District 2" },
  Margibi: { lat: 6.5123, lng: -10.3214, district: "Kakata" },
  Bomi: { lat: 6.7582, lng: -10.8456, district: "Tubmanburg" },
  Maryland: { lat: 4.4523, lng: -7.7123, district: "Harper" },
};

interface OfflineQueueItem {
  id: string;
  type: "Farmer" | "Household" | "Parcel";
  name: string;
  county: string;
  district: string;
  timestamp: string;
  payload: Record<string, any>;
  retries: number;
  status: "Pending" | "Synced" | "Failed";
}

const STORAGE_QUEUE_KEY = "dfr-offline-queue";

export default function FieldRegistrationWorkspace({
  farmers,
  role,
  notify,
  openFarmerRegistration,
  openOrgRegistration,
  openRegistrationRouter,
  openFarmerDossier,
  onVerifyFarmer,
}: {
  farmers: Farmer[];
  role: string;
  notify: (msg: string) => void;
  openFarmerRegistration: () => void;
  openOrgRegistration: () => void;
  openRegistrationRouter: () => void;
  openFarmerDossier: (f: Farmer) => void;
  onVerifyFarmer?: (id: number, status: string) => void;
}) {
  const [tab, setTab] = useState<"records" | "sync" | "gps" | "sop">("records");
  const [q, setQ] = useState("");
  const [countyFilter, setCountyFilter] = useState("All Counties");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isSimulatedOffline, setIsSimulatedOffline] = useState(false);
  const [queue, setQueue] = useState<OfflineQueueItem[]>([]);

  // GPS Tool State
  const [selectedGpsCounty, setSelectedGpsCounty] = useState("Nimba");
  const [currentGps, setCurrentGps] = useState<{ lat: number; lng: number; accuracy: number; elevation: number }>({
    lat: 7.3592,
    lng: -8.7214,
    accuracy: 1.8,
    elevation: 320,
  });
  const [parcelVertices, setParcelVertices] = useState<Array<{ name: string; lat: number; lng: number }>>([
    { name: "P1 (North-West)", lat: 7.3596, lng: -8.7218 },
    { name: "P2 (North-East)", lat: 7.3597, lng: -8.7211 },
    { name: "P3 (South-East)", lat: 7.3589, lng: -8.7210 },
    { name: "P4 (South-West)", lat: 7.3588, lng: -8.7217 },
  ]);

  // Load offline queue
  const refreshQueue = () => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(STORAGE_QUEUE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setQueue(
            parsed.map((item, idx) => ({
              id: item.id || `Q-${idx + 1}`,
              type: item.type || "Farmer",
              name: item.name || item.body?.firstName ? `${item.body?.firstName} ${item.body?.lastName}` : "Field Submission",
              county: item.county || item.body?.county || "Nimba",
              district: item.district || item.body?.district || "Sanniquellie",
              timestamp: item.timestamp || new Date().toISOString().replace("T", " ").slice(0, 16),
              payload: item.body || item,
              retries: item.retries || 0,
              status: item.status || "Pending",
            }))
          );
          return;
        }
      }
    } catch {}
    // Seed default simulated queue if empty
    const initialQueue: OfflineQueueItem[] = [
      {
        id: "Q-001",
        type: "Farmer",
        name: "Emmanuel Tokpa",
        county: "Bong",
        district: "Suakoko",
        timestamp: "2026-09-03 14:22",
        payload: { crop: "Cassava", farmSize: 2.2, phone: "0770987123" },
        retries: 0,
        status: "Pending",
      },
      {
        id: "Q-002",
        type: "Parcel",
        name: "Gbedin Swamp Rice Field #4",
        county: "Nimba",
        district: "Sanniquellie-Mahn",
        timestamp: "2026-09-03 15:40",
        payload: { areaHa: 3.5, verticesCount: 4, crop: "Lowland Rice" },
        retries: 0,
        status: "Pending",
      },
    ];
    setQueue(initialQueue);
  };

  useEffect(() => {
    refreshQueue();
  }, []);

  // Filtered farmers list
  const filteredFarmers = useMemo(() => {
    return farmers.filter((f) => {
      const matchesQ =
        !q ||
        f.firstName?.toLowerCase().includes(q.toLowerCase()) ||
        f.lastName?.toLowerCase().includes(q.toLowerCase()) ||
        f.dfrId?.toLowerCase().includes(q.toLowerCase()) ||
        f.phone?.includes(q) ||
        f.crop?.toLowerCase().includes(q.toLowerCase()) ||
        f.community?.toLowerCase().includes(q.toLowerCase());

      const matchesCounty = countyFilter === "All Counties" || f.county === countyFilter;
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "provisional" && (f.status !== "Verified" || f.dfrId?.startsWith("PROV-"))) ||
        (statusFilter === "verified" && f.status === "Verified") ||
        (statusFilter === "needs_correction" && f.status === "Needs correction");

      return matchesQ && matchesCounty && matchesStatus;
    });
  }, [farmers, q, countyFilter, statusFilter]);

  // Statistics
  const provisionalCount = farmers.filter((f) => f.status !== "Verified" || f.dfrId?.startsWith("PROV-")).length;
  const verifiedCount = farmers.filter((f) => f.status === "Verified").length;
  const gpsCount = farmers.filter((f) => f.latitude !== null && f.longitude !== null).length;
  const totalHectares = farmers.reduce((sum, f) => sum + (Number(f.farmSize) || 0), 0);

  // Sync Queue Action
  const handleSyncQueue = () => {
    if (isSimulatedOffline) {
      notify("Device is in Offline Field Mode. Reconnect or toggle online to sync.");
      return;
    }
    const pendingCount = queue.filter((i) => i.status === "Pending").length;
    if (pendingCount === 0) {
      notify("Offline queue is already synchronized with MOA central registry.");
      return;
    }
    setQueue((prev) => prev.map((item) => ({ ...item, status: "Synced" })));
    try {
      localStorage.setItem(STORAGE_QUEUE_KEY, JSON.stringify([]));
    } catch {}
    notify(`✓ Synchronized ${pendingCount} offline record(s) to national DFR registry.`);
  };

  // Add mock field record to offline queue
  const handleAddMockToQueue = () => {
    const newItem: OfflineQueueItem = {
      id: `Q-${String(queue.length + 1).padStart(3, "0")}`,
      type: "Farmer",
      name: "Bendu Johnson",
      county: "Lofa",
      district: "Foya",
      timestamp: new Date().toISOString().replace("T", " ").slice(0, 16),
      payload: { crop: "Cocoa", farmSize: 3.8, phone: "0886123456", status: "Provisional" },
      retries: 0,
      status: "Pending",
    };
    const updated = [newItem, ...queue];
    setQueue(updated);
    try {
      localStorage.setItem(STORAGE_QUEUE_KEY, JSON.stringify(updated));
    } catch {}
    notify("Captured new field record into local device offline queue.");
  };

  // Handle GPS Refresh
  const handleAcquireGps = () => {
    const base = COUNTY_COORDINATES[selectedGpsCounty] || { lat: 6.45, lng: -9.8, district: "Central" };
    const jitterLat = (Math.random() - 0.5) * 0.005;
    const jitterLng = (Math.random() - 0.5) * 0.005;
    const newLat = Number((base.lat + jitterLat).toFixed(5));
    const newLng = Number((base.lng + jitterLng).toFixed(5));
    setCurrentGps({
      lat: newLat,
      lng: newLng,
      accuracy: Number((1.2 + Math.random() * 0.8).toFixed(1)),
      elevation: Math.round(280 + Math.random() * 80),
    });
    setParcelVertices([
      { name: "P1 (North-West)", lat: Number((newLat + 0.0004).toFixed(5)), lng: Number((newLng - 0.0004).toFixed(5)) },
      { name: "P2 (North-East)", lat: Number((newLat + 0.0004).toFixed(5)), lng: Number((newLng + 0.0004).toFixed(5)) },
      { name: "P3 (South-East)", lat: Number((newLat - 0.0004).toFixed(5)), lng: Number((newLng + 0.0004).toFixed(5)) },
      { name: "P4 (South-West)", lat: Number((newLat - 0.0004).toFixed(5)), lng: Number((newLng - 0.0004).toFixed(5)) },
    ]);
    notify(`Acquired high-precision GPS fix for ${selectedGpsCounty} County (±1.5m HD-GNSS).`);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Top Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #062b18 0%, #155734 60%, #1e3a29 100%)",
          borderRadius: 14,
          padding: "24px 28px",
          color: "#fff",
          border: "1px solid rgba(255,255,255,0.12)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <span
                style={{
                  background: "rgba(212, 175, 55, 0.2)",
                  color: "#f5d77f",
                  padding: "4px 10px",
                  borderRadius: 20,
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.05em",
                  border: "1px solid rgba(212, 175, 55, 0.3)",
                }}
              >
                FIELD OPERATIONS DESK
              </span>
              <span
                style={{
                  background: isSimulatedOffline ? "rgba(239, 68, 68, 0.25)" : "rgba(34, 197, 94, 0.25)",
                  color: isSimulatedOffline ? "#fca5a5" : "#86efac",
                  padding: "4px 10px",
                  borderRadius: 20,
                  fontSize: 11,
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: isSimulatedOffline ? "#ef4444" : "#22c55e",
                  }}
                />
                {isSimulatedOffline ? "Simulated Offline Mode" : "Online · Connected to Central Registry"}
              </span>
            </div>
            <h1 style={{ margin: "4px 0 8px", fontSize: 24, fontWeight: 700, color: "#fff" }}>
              Field Registration & Offline Data Collection
            </h1>
            <p style={{ margin: 0, fontSize: 13, color: "#cbd5e1", maxWidth: 680, lineHeight: 1.5 }}>
              Capture, validate, and synchronize field survey records for smallholder farmers, households, and farm parcels across Liberia's 15 counties. Offline-first architecture guarantees field continuity even without cellular coverage.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <button
              onClick={openFarmerRegistration}
              style={{
                background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                color: "#fff",
                border: "none",
                padding: "10px 18px",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
                boxShadow: "0 2px 10px rgba(34,197,94,0.3)",
              }}
            >
              <span>＋</span> Register Farmer & Household
            </button>
            <button
              onClick={openOrgRegistration}
              style={{
                background: "rgba(255,255,255,0.15)",
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.25)",
                padding: "10px 16px",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              ▧ Register Cooperative
            </button>
            <button
              onClick={openRegistrationRouter}
              style={{
                background: "rgba(212, 175, 55, 0.2)",
                color: "#f5d77f",
                border: "1px solid rgba(212, 175, 55, 0.4)",
                padding: "10px 14px",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
              title="Open full registration hub"
            >
              🔀 Multi-Entity Hub
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 14 }}>
        <div style={{ background: "#fff", padding: "16px 20px", borderRadius: 10, border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <div style={{ fontSize: 12, color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>Provisional Queue</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "#d97706", margin: "6px 0 2px" }}>{provisionalCount}</div>
          <div style={{ fontSize: 12, color: "#64748b" }}>Awaiting CAO/verifier approval</div>
        </div>

        <div style={{ background: "#fff", padding: "16px 20px", borderRadius: 10, border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <div style={{ fontSize: 12, color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>Device Offline Cache</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: queue.filter((i) => i.status === "Pending").length > 0 ? "#2563eb" : "#16a34a", margin: "6px 0 2px" }}>
            {queue.filter((i) => i.status === "Pending").length}
          </div>
          <div style={{ fontSize: 12, color: "#64748b" }}>Records queued on this device</div>
        </div>

        <div style={{ background: "#fff", padding: "16px 20px", borderRadius: 10, border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <div style={{ fontSize: 12, color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>GPS Georeferenced</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "#059669", margin: "6px 0 2px" }}>{gpsCount}</div>
          <div style={{ fontSize: 12, color: "#64748b" }}>Parcels with boundary polygon</div>
        </div>

        <div style={{ background: "#fff", padding: "16px 20px", borderRadius: 10, border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <div style={{ fontSize: 12, color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>Total Hectares Mapped</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", margin: "6px 0 2px" }}>{totalHectares.toFixed(1)} ha</div>
          <div style={{ fontSize: 12, color: "#64748b" }}>Across 15 Liberian counties</div>
        </div>
      </div>

      {/* Workspace Tabs */}
      <div style={{ display: "flex", gap: 8, borderBottom: "2px solid #e2e8f0", paddingBottom: 2 }}>
        <button
          onClick={() => setTab("records")}
          style={{
            padding: "10px 18px",
            background: "none",
            border: "none",
            borderBottom: tab === "records" ? "3px solid #155734" : "3px solid transparent",
            color: tab === "records" ? "#155734" : "#64748b",
            fontWeight: tab === "records" ? 700 : 500,
            cursor: "pointer",
            fontSize: 14,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span>📋</span> Field Records & Submissions ({filteredFarmers.length})
        </button>

        <button
          onClick={() => setTab("sync")}
          style={{
            padding: "10px 18px",
            background: "none",
            border: "none",
            borderBottom: tab === "sync" ? "3px solid #155734" : "3px solid transparent",
            color: tab === "sync" ? "#155734" : "#64748b",
            fontWeight: tab === "sync" ? 700 : 500,
            cursor: "pointer",
            fontSize: 14,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span>📡</span> Offline Queue & Sync Engine ({queue.filter((i) => i.status === "Pending").length})
        </button>

        <button
          onClick={() => setTab("gps")}
          style={{
            padding: "10px 18px",
            background: "none",
            border: "none",
            borderBottom: tab === "gps" ? "3px solid #155734" : "3px solid transparent",
            color: tab === "gps" ? "#155734" : "#64748b",
            fontWeight: tab === "gps" ? 700 : 500,
            cursor: "pointer",
            fontSize: 14,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span>📍</span> GPS & Cadastral Parcel Capture
        </button>

        <button
          onClick={() => setTab("sop")}
          style={{
            padding: "10px 18px",
            background: "none",
            border: "none",
            borderBottom: tab === "sop" ? "3px solid #155734" : "3px solid transparent",
            color: tab === "sop" ? "#155734" : "#64748b",
            fontWeight: tab === "sop" ? 700 : 500,
            cursor: "pointer",
            fontSize: 14,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span>📜</span> Field Protocol & SOP Checklist
        </button>
      </div>

      {/* Tab 1: Field Records & Submissions */}
      {tab === "records" && (
        <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e2e8f0", padding: 20 }}>
          {/* Filters Bar */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 18, alignItems: "center" }}>
            <div style={{ flex: "1 1 240px", position: "relative" }}>
              <input
                type="text"
                placeholder="Search by farmer name, DFR ID, phone, community, crop..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                style={{
                  width: "100%",
                  padding: "9px 12px 9px 34px",
                  border: "1px solid #cbd5e1",
                  borderRadius: 8,
                  fontSize: 13,
                  outline: "none",
                }}
              />
              <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}>🔍</span>
            </div>

            <select
              value={countyFilter}
              onChange={(e) => setCountyFilter(e.target.value)}
              style={{ padding: "9px 12px", border: "1px solid #cbd5e1", borderRadius: 8, fontSize: 13, background: "#fff", color: "#334155" }}
            >
              {COUNTIES_LIST.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ padding: "9px 12px", border: "1px solid #cbd5e1", borderRadius: 8, fontSize: 13, background: "#fff", color: "#334155" }}
            >
              <option value="all">All Statuses</option>
              <option value="provisional">Provisional (Pending)</option>
              <option value="verified">Verified Official</option>
              <option value="needs_correction">Needs Correction</option>
            </select>

            <button
              onClick={openFarmerRegistration}
              style={{
                padding: "9px 16px",
                background: "#155734",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                marginLeft: "auto",
              }}
            >
              ＋ New Registration
            </button>
          </div>

          {/* Table */}
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, textAlign: "left" }}>
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0", color: "#475569" }}>
                  <th style={{ padding: "12px 14px", fontWeight: 700 }}>Identifier</th>
                  <th style={{ padding: "12px 14px", fontWeight: 700 }}>Farmer & Contact</th>
                  <th style={{ padding: "12px 14px", fontWeight: 700 }}>Jurisdiction</th>
                  <th style={{ padding: "12px 14px", fontWeight: 700 }}>Crop & Holding</th>
                  <th style={{ padding: "12px 14px", fontWeight: 700 }}>GPS Position</th>
                  <th style={{ padding: "12px 14px", fontWeight: 700 }}>Status</th>
                  <th style={{ padding: "12px 14px", fontWeight: 700, textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFarmers.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: "36px 14px", textAlign: "center", color: "#64748b" }}>
                      No field records match your search or filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredFarmers.map((f) => {
                    const isProv = f.status !== "Verified" || f.dfrId?.startsWith("PROV-");
                    return (
                      <tr key={f.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "12px 14px" }}>
                          <span
                            style={{
                              fontFamily: "monospace",
                              fontWeight: 700,
                              fontSize: 12,
                              color: isProv ? "#b45309" : "#155734",
                              background: isProv ? "#fef3c7" : "#dcfce7",
                              padding: "3px 8px",
                              borderRadius: 4,
                            }}
                          >
                            {f.dfrId}
                          </span>
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          <div style={{ fontWeight: 600, color: "#0f172a" }}>
                            {f.firstName} {f.lastName}
                          </div>
                          <div style={{ fontSize: 11, color: "#64748b" }}>
                            {f.gender} · {f.phone || "No phone"}
                          </div>
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          <div style={{ fontWeight: 500, color: "#334155" }}>{f.county} County</div>
                          <div style={{ fontSize: 11, color: "#64748b" }}>
                            {f.district} · {f.community}
                          </div>
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          <div style={{ fontWeight: 600, color: "#166534" }}>{f.crop}</div>
                          <div style={{ fontSize: 11, color: "#64748b" }}>{f.farmSize} ha holding</div>
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          {f.latitude !== null && f.longitude !== null ? (
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <span style={{ color: "#059669", fontSize: 12 }}>📍</span>
                              <span style={{ fontSize: 11, fontFamily: "monospace", color: "#475569" }}>
                                {f.latitude.toFixed(4)}, {f.longitude.toFixed(4)}
                              </span>
                            </div>
                          ) : (
                            <span style={{ fontSize: 11, color: "#94a3b8", fontStyle: "italic" }}>No GPS fix</span>
                          )}
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          <span
                            style={{
                              display: "inline-block",
                              padding: "4px 10px",
                              borderRadius: 12,
                              fontSize: 11,
                              fontWeight: 700,
                              background:
                                f.status === "Verified"
                                  ? "#dcfce7"
                                  : f.status === "Needs correction"
                                  ? "#fee2e2"
                                  : "#fef3c7",
                              color:
                                f.status === "Verified"
                                  ? "#15803d"
                                  : f.status === "Needs correction"
                                  ? "#b91c1c"
                                  : "#b45309",
                            }}
                          >
                            {f.status}
                          </span>
                        </td>
                        <td style={{ padding: "12px 14px", textAlign: "right" }}>
                          <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                            <button
                              onClick={() => openFarmerDossier(f)}
                              style={{
                                padding: "5px 10px",
                                background: "#f8fafc",
                                border: "1px solid #cbd5e1",
                                borderRadius: 6,
                                fontSize: 12,
                                fontWeight: 600,
                                color: "#0f172a",
                                cursor: "pointer",
                              }}
                            >
                              Dossier ↗
                            </button>
                            {isProv && onVerifyFarmer && (
                              <button
                                onClick={() => {
                                  onVerifyFarmer(f.id, "Verified");
                                  notify(`Approved record for ${f.firstName} ${f.lastName}.`);
                                }}
                                style={{
                                  padding: "5px 10px",
                                  background: "#dcfce7",
                                  border: "1px solid #86efac",
                                  borderRadius: 6,
                                  fontSize: 12,
                                  fontWeight: 600,
                                  color: "#166534",
                                  cursor: "pointer",
                                }}
                              >
                                Approve ✓
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Offline Queue & Sync Engine */}
      {tab === "sync" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {/* Sync Engine Status Card */}
          <div
            style={{
              background: "#fff",
              borderRadius: 10,
              border: "1px solid #e2e8f0",
              padding: 22,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 16,
            }}
          >
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                Device Connectivity & Store-and-Forward Engine
              </div>
              <h2 style={{ margin: "6px 0 4px", fontSize: 18, color: "#0f172a" }}>
                {isSimulatedOffline
                  ? "Simulated Offline: Records Encrypted on Local Device"
                  : "Online Mode: Central Registry Synced & Ready"}
              </h2>
              <p style={{ margin: 0, fontSize: 13, color: "#64748b", maxWidth: 600 }}>
                When mobile connectivity drops in rural counties (e.g. upper Lofa, River Gee, Gbarpolu), records are saved in device IndexedDB/localStorage and queued for automatic cryptographic packet synchronization.
              </p>
            </div>

            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <button
                onClick={() => {
                  setIsSimulatedOffline(!isSimulatedOffline);
                  notify(
                    !isSimulatedOffline
                      ? "Switched to Offline Field Simulation. New submissions will queue locally."
                      : "Switched back to Online Mode."
                  );
                }}
                style={{
                  padding: "9px 15px",
                  borderRadius: 8,
                  border: "1px solid #cbd5e1",
                  background: isSimulatedOffline ? "#fee2e2" : "#f1f5f9",
                  color: isSimulatedOffline ? "#b91c1c" : "#334155",
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                {isSimulatedOffline ? "● Disable Offline Mode" : "○ Simulate Offline Field Mode"}
              </button>

              <button
                onClick={handleSyncQueue}
                style={{
                  padding: "9px 18px",
                  borderRadius: 8,
                  border: "none",
                  background: "#155734",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <span>↻</span> Synchronize Queue Now ({queue.filter((i) => i.status === "Pending").length})
              </button>
            </div>
          </div>

          {/* Queue List Table */}
          <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e2e8f0", padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 16, color: "#0f172a" }}>Local Device Submission Queue</h3>
                <span style={{ fontSize: 12, color: "#64748b" }}>Packets waiting for server receipt and validation</span>
              </div>
              <button
                onClick={handleAddMockToQueue}
                style={{
                  padding: "6px 12px",
                  background: "#f8fafc",
                  border: "1px solid #cbd5e1",
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#0f172a",
                  cursor: "pointer",
                }}
              >
                ＋ Simulate Field Record
              </button>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, textAlign: "left" }}>
                <thead>
                  <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0", color: "#475569" }}>
                    <th style={{ padding: "10px 12px", fontWeight: 700 }}>Queue ID</th>
                    <th style={{ padding: "10px 12px", fontWeight: 700 }}>Type</th>
                    <th style={{ padding: "10px 12px", fontWeight: 700 }}>Subject / Entity</th>
                    <th style={{ padding: "10px 12px", fontWeight: 700 }}>Location</th>
                    <th style={{ padding: "10px 12px", fontWeight: 700 }}>Captured Time</th>
                    <th style={{ padding: "10px 12px", fontWeight: 700 }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {queue.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: "28px 12px", textAlign: "center", color: "#64748b" }}>
                        All device queue items have been synchronized to the central registry.
                      </td>
                    </tr>
                  ) : (
                    queue.map((item) => (
                      <tr key={item.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "10px 12px", fontFamily: "monospace", fontWeight: 600 }}>{item.id}</td>
                        <td style={{ padding: "10px 12px" }}>
                          <span
                            style={{
                              background: "#e0f2fe",
                              color: "#0369a1",
                              padding: "2px 8px",
                              borderRadius: 4,
                              fontSize: 11,
                              fontWeight: 600,
                            }}
                          >
                            {item.type}
                          </span>
                        </td>
                        <td style={{ padding: "10px 12px", fontWeight: 600, color: "#0f172a" }}>{item.name}</td>
                        <td style={{ padding: "10px 12px", color: "#475569" }}>
                          {item.county}, {item.district}
                        </td>
                        <td style={{ padding: "10px 12px", color: "#64748b", fontSize: 12 }}>{item.timestamp}</td>
                        <td style={{ padding: "10px 12px" }}>
                          <span
                            style={{
                              background: item.status === "Synced" ? "#dcfce7" : "#fef3c7",
                              color: item.status === "Synced" ? "#166534" : "#b45309",
                              padding: "3px 8px",
                              borderRadius: 10,
                              fontSize: 11,
                              fontWeight: 700,
                            }}
                          >
                            {item.status === "Synced" ? "✓ Synced" : "⏳ Awaiting Sync"}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: GPS & Cadastral Parcel Capture */}
      {tab === "gps" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 }}>
          {/* GPS Simulator Controls */}
          <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e2e8f0", padding: 20 }}>
            <h3 style={{ margin: "0 0 4px", fontSize: 16, color: "#0f172a" }}>Field GNSS Satellite Receiver</h3>
            <p style={{ margin: "0 0 16px", fontSize: 12, color: "#64748b" }}>
              Simulate high-accuracy mobile GPS fixes across Liberia's agro-ecological zones.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12, fontWeight: 600 }}>
                Target County Preset
                <select
                  value={selectedGpsCounty}
                  onChange={(e) => setSelectedGpsCounty(e.target.value)}
                  style={{ padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 13 }}
                >
                  {Object.keys(COUNTY_COORDINATES).map((c) => (
                    <option key={c} value={c}>{c} County ({COUNTY_COORDINATES[c].district})</option>
                  ))}
                </select>
              </label>

              <div style={{ background: "#f8fafc", padding: 14, borderRadius: 8, border: "1px solid #e2e8f0" }}>
                <div style={{ fontSize: 11, color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>Active GPS Fix</div>
                <div style={{ fontSize: 20, fontFamily: "monospace", fontWeight: 700, color: "#155734", margin: "6px 0" }}>
                  {currentGps.lat}° N, {Math.abs(currentGps.lng)}° W
                </div>
                <div style={{ display: "flex", gap: 14, fontSize: 12, color: "#64748b" }}>
                  <span>Accuracy: <b style={{ color: "#15803d" }}>±{currentGps.accuracy}m</b></span>
                  <span>Elevation: <b>{currentGps.elevation}m ASL</b></span>
                  <span>Satellites: <b>14 (GPS/GLONASS)</b></span>
                </div>
              </div>

              <button
                onClick={handleAcquireGps}
                style={{
                  padding: "10px 16px",
                  background: "#155734",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                📍 Acquire GPS Coordinate Fix
              </button>
            </div>
          </div>

          {/* Parcel Boundary Polygon Preview */}
          <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e2e8f0", padding: 20 }}>
            <h3 style={{ margin: "0 0 4px", fontSize: 16, color: "#0f172a" }}>4-Point Parcel Boundary Walk</h3>
            <p style={{ margin: "0 0 14px", fontSize: 12, color: "#64748b" }}>
              Captured boundary polygon corner vertices and computed farm holding area.
            </p>

            <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: 14, marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#334155" }}>Computed Parcel Area</span>
                <span style={{ fontSize: 15, fontWeight: 800, color: "#155734" }}>1.84 Hectares (4.55 Acres)</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 12, color: "#64748b" }}>Perimeter Length</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>542 meters</span>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {parcelVertices.map((v, i) => (
                <div
                  key={v.name}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "8px 12px",
                    background: "#fff",
                    border: "1px solid #cbd5e1",
                    borderRadius: 6,
                    fontSize: 12,
                  }}
                >
                  <span style={{ fontWeight: 600, color: "#334155" }}>{v.name}</span>
                  <span style={{ fontFamily: "monospace", color: "#64748b" }}>
                    {v.lat.toFixed(5)}, {v.lng.toFixed(5)}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={() => notify("Parcel geometry saved to GIS cadastral repository.")}
              style={{
                width: "100%",
                marginTop: 14,
                padding: "9px 16px",
                background: "#f1f5f9",
                border: "1px solid #cbd5e1",
                borderRadius: 8,
                fontWeight: 600,
                fontSize: 13,
                cursor: "pointer",
                color: "#0f172a",
              }}
            >
              ✓ Commit Boundary to Farm Cadastre
            </button>
          </div>
        </div>
      )}

      {/* Tab 4: Field Protocol & SOP Checklist */}
      {tab === "sop" && (
        <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e2e8f0", padding: 24 }}>
          <h2 style={{ margin: "0 0 6px", fontSize: 18, color: "#0f172a" }}>
            Enumerator Field Standard Operating Procedure (SOP)
          </h2>
          <p style={{ margin: "0 0 20px", fontSize: 13, color: "#64748b", maxWidth: 700 }}>
            Mandatory operational guidelines established by the Ministry of Agriculture and FAO for all field enumerators, extension agents, and county agricultural officers.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 18 }}>
            <div style={{ border: "1px solid #e2e8f0", borderRadius: 8, padding: 16, background: "#f8fafc" }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#155734", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, marginBottom: 10 }}>
                1
              </div>
              <h3 style={{ margin: "0 0 6px", fontSize: 14, color: "#0f172a" }}>Informed Consent (Multilingual)</h3>
              <p style={{ margin: 0, fontSize: 12, color: "#475569", lineHeight: 1.5 }}>
                Explain the purpose of the registry in English or local vernacular (Kpelle, Bassa, Mano, Gio). Confirm the farmer agrees to biometric enrollment and agricultural subsidy matching.
              </p>
            </div>

            <div style={{ border: "1px solid #e2e8f0", borderRadius: 8, padding: 16, background: "#f8fafc" }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#155734", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, marginBottom: 10 }}>
                2
              </div>
              <h3 style={{ margin: "0 0 6px", fontSize: 14, color: "#0f172a" }}>Photo & Biometric Standards</h3>
              <p style={{ margin: 0, fontSize: 12, color: "#475569", lineHeight: 1.5 }}>
                Capture passport-style portrait against a solid neutral backdrop. Ensure full face visibility with no sunglasses, head wraps covering the face, or harsh shadows.
              </p>
            </div>

            <div style={{ border: "1px solid #e2e8f0", borderRadius: 8, padding: 16, background: "#f8fafc" }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#155734", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, marginBottom: 10 }}>
                3
              </div>
              <h3 style={{ margin: "0 0 6px", fontSize: 14, color: "#0f172a" }}>Farm Boundary Walk</h3>
              <p style={{ margin: 0, fontSize: 12, color: "#475569", lineHeight: 1.5 }}>
                Walk the perimeter of the holding accompanied by the farmer and adjacent landholder or clan elder. Mark at least 4 GPS corner vertices to compute verifiable acreage.
              </p>
            </div>

            <div style={{ border: "1px solid #e2e8f0", borderRadius: 8, padding: 16, background: "#f8fafc" }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#155734", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, marginBottom: 10 }}>
                4
              </div>
              <h3 style={{ margin: "0 0 6px", fontSize: 14, color: "#0f172a" }}>Supervisor Review & Sign-Off</h3>
              <p style={{ margin: 0, fontSize: 12, color: "#475569", lineHeight: 1.5 }}>
                Submit provisional registration to the County Agricultural Officer (CAO) or Verification Officer. Permanent National DFR ID is generated once identity checks clear.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
